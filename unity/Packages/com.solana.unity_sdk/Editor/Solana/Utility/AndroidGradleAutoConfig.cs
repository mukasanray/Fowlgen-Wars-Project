using System.IO;
using System.Text.RegularExpressions;
using System.Linq;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace Solana.Unity.SDK.Editor
{
    public class AndroidGradleAutoConfig : IPreprocessBuildWithReport
    {
        public int callbackOrder => 0;
        
        //Using absolute paths to ensure CI/CD compatibility
        private const string GradleTemplateRelativePath = "Assets/Plugins/Android/mainTemplate.gradle";
        private static string _projectRoot;
        private static string ProjectRoot 
        {
            get
            {
                if (string.IsNullOrEmpty(_projectRoot))
                {
                    // Fallback to dataPath if parent is null, then normalize
                    var parent = Directory.GetParent(Application.dataPath);
                    string rawPath = parent != null ? parent.FullName : Application.dataPath;
                    _projectRoot = Path.GetFullPath(rawPath);
                }
                return _projectRoot;
            }
        }
        private static string GradleTemplatePath => Path.Combine(ProjectRoot, GradleTemplateRelativePath);
        
        //Markers to identify our injections
        private const string DependencyMarker = "// [Solana.Unity-SDK] Dependencies";
        private const string DependencyEndMarker = "// [Solana.Unity-SDK] End Dependencies";
        private const string ResolutionMarker = "// [Solana.Unity-SDK] Conflict Resolution";
        private const string ResolutionEndMarker = "// [Solana.Unity-SDK] End Conflict Resolution";
        
        private const string SessionKey = "SolanaGradleChecked";

        //Run on Editor Load to warn the user immediately if setup is missing
        [InitializeOnLoadMethod]
        private static void OnEditorLoad()
        {
            //Unity clears static events on domain reload, re-subscribe every time
            //InitializeOnLoadMethod runs, ignoring the SessionKey check.
            EditorUserBuildSettings.activeBuildTargetChanged -= OnBuildTargetChanged;
            EditorUserBuildSettings.activeBuildTargetChanged += OnBuildTargetChanged;

            //Only run this check once per Editor Session to avoid overhead on every reload.
            if (SessionState.GetBool(SessionKey, false)) return;
            SessionState.SetBool(SessionKey, true);

            EditorApplication.delayCall += () => 
            {
                //schedule check for next frame to avoid blocking editor initialization
                CheckConfiguration(true);
            };
        }

        private static void OnBuildTargetChanged()
        {
            if (EditorUserBuildSettings.activeBuildTarget == BuildTarget.Android)
                CheckConfiguration(true);
        }

        //Menu Item for manual execution
        [MenuItem("Solana/Fix Android Dependencies")]
        public static void RunManualCheck()
        {
            CheckConfiguration(false);
        }

        //Run right before the build starts to ensure we don't fail midway
        public void OnPreprocessBuild(BuildReport report)
        {
            if (report.summary.platform != BuildTarget.Android) return;
            if (!CheckConfiguration(false))
            {
                throw new BuildFailedException("[Solana SDK] Android Gradle configuration failed. See console for details.");
            }
        }

        private static bool CheckConfiguration(bool checkActiveTarget)
        {
            if (checkActiveTarget && EditorUserBuildSettings.activeBuildTarget != BuildTarget.Android) return true;

            //Check if Custom Gradle Template is actually enabled in Project Settings
            if (!File.Exists(GradleTemplatePath))
            {
                Debug.LogError($"[Solana SDK] 'mainTemplate.gradle' not found at {GradleTemplatePath}.\n" +
                               "1. Go to: Edit -> Project Settings -> Player -> Android -> Publishing Settings\n" +
                               "2. Check the box: 'Custom Main Gradle Template'\n" +
                               "3. Then try Building again or click 'Solana/Fix Android Dependencies'.");
                return false;
            }

            //If the file exists, ensure dependencies are correct
            return PatchGradleFile();
        }

        private static bool PatchGradleFile()
        {
            try
            {
                string content = File.ReadAllText(GradleTemplatePath);
                
                //--- ADAPTIVE VERSIONING ---
#if UNITY_6000_0_OR_NEWER
                //Unity 6+ (Modern Stable)
                string browserVersion = "1.8.0";
                string parcelableVersion = "1.2.1";
                string guavaVersion = "33.5.0-android";
                string coreVersion = "1.13.1";
                string kotlinExcludeBlock = @"
    exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk7'
    exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'";
#else
                //Unity 2022/2021 (Legacy Stable)
                string browserVersion = "1.5.0";
                string parcelableVersion = "1.1.1";
                string guavaVersion = "31.1-android";
                string coreVersion = "1.8.0";
                string kotlinExcludeBlock = ""; //Empty on legacy versions
#endif

                //Explicit androidx.core dependency
                string newDepsBlock = $@"
    {DependencyMarker}
    implementation 'androidx.browser:browser:{browserVersion}'
    implementation 'androidx.core:core:{coreVersion}'
    implementation 'androidx.versionedparcelable:versionedparcelable:{parcelableVersion}'
    implementation 'com.google.guava:guava:{guavaVersion}'
    implementation 'com.google.guava:listenablefuture:9999.0-empty-to-avoid-conflict-with-guava'
    {DependencyEndMarker}
";

                string newResolutionBlock = $@"

{ResolutionMarker}
configurations.all {{
    exclude group: 'com.google.guava', module: 'listenablefuture'{kotlinExcludeBlock}
    resolutionStrategy {{
        force 'androidx.core:core:{coreVersion}'
    }}
}}
{ResolutionEndMarker}
";

                bool modified = false;

                //Sanitize and Validate
                if (content.Contains(DependencyMarker) || content.Contains(ResolutionMarker))
                {
                    bool hasCorrectDeps = Regex.IsMatch(content, $@"implementation\s+['""]androidx\.core:core:{Regex.Escape(coreVersion)}['""]") &&
                                          Regex.IsMatch(content, $@"implementation\s+['""]androidx\.browser:browser:{Regex.Escape(browserVersion)}['""]") &&
                                          Regex.IsMatch(content, $@"implementation\s+['""]com\.google\.guava:guava:{Regex.Escape(guavaVersion)}['""]");

                    bool hasCorrectResolution = content.Contains(ResolutionMarker) && 
                                                Regex.IsMatch(content, $@"force\s+['""]androidx\.core:core:{Regex.Escape(coreVersion)}['""]");
                                        
                    //If either is wrong, we must regenerate
                    if (!hasCorrectDeps || !hasCorrectResolution)
                    {
                        if (!CreateBackup()) return false;
                        
                        //Remove Old Dependencies
                        string cleanDepsPattern = content.Contains(DependencyEndMarker) 
                            ? $@"(?s)\s*{Regex.Escape(DependencyMarker)}.*?{Regex.Escape(DependencyEndMarker)}\s*" 
                            : $@"(?s)\s*{Regex.Escape(DependencyMarker)}.*?(?=\n\s*//|$)"; // Fallback: Read until next comment or EOF

                        var depsRegex = new Regex(cleanDepsPattern);
                        content = depsRegex.Replace(content, "");
                        
                        //Remove Old Resolution Block
                        content = RemoveResolutionBlock(content);
                        
                        modified = true;
                    }
                }
                
                //Inject Dependencies
                if (!content.Contains(DependencyMarker) || !content.Contains(DependencyEndMarker)) 
                {
                    if (!modified) { if(!CreateBackup()) return false; } 
                    
                    //Prioritize Unity's DEPS placeholder
                    //This prevents injecting into the wrong block
                    var depsPlaceholder = new Regex(@"(?m)^(?<indent>\s*)\*\*DEPS\*\*\s*$");
                    if (depsPlaceholder.IsMatch(content))
                    {
                        content = depsPlaceholder.Replace(
                            content,
                            m => $"{newDepsBlock}{m.Groups["indent"].Value}**DEPS**",
                            1
                        );
                        modified = true;
                    }
                    else
                    {
                        //Fallback: insert into the first non-buildscript dependencies block
                        var regex = new Regex(@"(?m)^(?<indent>\s*)dependencies\s*\{");
                        if (regex.IsMatch(content))
                        {
                            content = regex.Replace(content, m => $"{m.Groups["indent"].Value}dependencies {{\n{newDepsBlock}", 1);
                            modified = true;
                        }
                        else
                        {
                            Debug.LogWarning("[Solana SDK] Could not find '**DEPS**' placeholder or 'dependencies' block in mainTemplate.gradle.");
                            return false; 
                        }
                    }
                }

                //Inject Resolution Strategy
                if (!content.Contains(ResolutionMarker) || !content.Contains(ResolutionEndMarker))
                {
                    if (!modified)
                    {
                        if(!CreateBackup()) return false;
                    } 
                    
                    content = RemoveResolutionBlock(content);
                    
                    content = content.TrimEnd() + newResolutionBlock;
                    modified = true;
                }

                if (modified)
                {
                    //Validate syntax before writing
                    if (!ValidateBraces(content))
                    {
                        Debug.LogError("[Solana SDK] Configuration aborted: Generated gradle content has unbalanced braces. Check the template.");
                        return false;
                    }

                    //Atomic Write
                    string tempPath = GradleTemplatePath + ".tmp";
                    try 
                    {
                        File.WriteAllText(tempPath, content);
                        
                        if (File.Exists(GradleTemplatePath))
                        {
                            File.Replace(tempPath, GradleTemplatePath, null);
                        }
                        else
                        {
                            File.Move(tempPath, GradleTemplatePath);
                        }
                    }
                    finally
                    {
                        //Ensure temp file is cleaned up even if Replace/Move fails
                        if (File.Exists(tempPath)) 
                        {
                            try { File.Delete(tempPath); } catch (System.Exception ex) { Debug.LogWarning($"[Solana SDK] Failed to cleanup temp file: {ex.Message}"); } 
                        }
                    }
                    
                    //Only refresh if we are NOT building the player to avoid build pipeline stalls
                    if (!BuildPipeline.isBuildingPlayer)
                    {
                        AssetDatabase.Refresh();
                    }
                    Debug.Log($"[Solana SDK] Updated 'mainTemplate.gradle' dependencies (Target: Core v{coreVersion}).");
                }
                return true;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[Solana SDK] Failed to patch mainTemplate.gradle: {e.Message}\n{e.StackTrace}");
                return false;
            }
        }

        //Removes the resolution block using End Markers (Preferred) or Fallback Parsing
        private static string RemoveResolutionBlock(string content)
        {
            int markerIndex = content.IndexOf(ResolutionMarker);
            if (markerIndex < 0) return content;

            //Try clean removal using End Marker (Preferred)
            if (content.Contains(ResolutionEndMarker))
            {
                var regex = new Regex(
                    $@"(?s)\s*{Regex.Escape(ResolutionMarker)}.*?{Regex.Escape(ResolutionEndMarker)}\s*"
                );
                return regex.Replace(content, "");
            }

            //Fallback: Brace Counting (For legacy/corrupt blocks missing end marker)
            //Restored robust brace counting to prevent stale blocks
            var configMatch = Regex.Match(content.Substring(markerIndex), @"configurations\.all\s*\{");
            if (!configMatch.Success)
            {
                // If only the marker line exists but the block is gone, remove the marker
                return Regex.Replace(content, $@"(?m)^[ \t]*{Regex.Escape(ResolutionMarker)}[ \t]*\r?\n?", "");
            }

            int openBraceIndex = markerIndex + configMatch.Index + configMatch.Length - 1;
            int depth = 0;
            int closeBraceIndex = -1;
            bool inLineComment = false;
            bool inBlockComment = false;
            bool inString = false;
            char stringChar = ' ';

            for (int i = openBraceIndex; i < content.Length; i++)
            {
                if (ShouldSkipForCommentOrString(content, ref i, ref inLineComment, ref inBlockComment, ref inString, ref stringChar)) continue;

                char c = content[i];
                if (c == '{') depth++;
                else if (c == '}') depth--;

                if (depth == 0)
                {
                    closeBraceIndex = i;
                    break;
                }
            }

            if (closeBraceIndex != -1)
            {
                return content.Remove(markerIndex, (closeBraceIndex - markerIndex) + 1);
            }

            return content;
        }

        //Supporting full Groovy DSL (triple quotes, slashy strings) is out of scope. 
        //the standard quotes and comments covers >99% of Unity templates.
        private static bool ShouldSkipForCommentOrString(string content, ref int i, ref bool inLineComment, ref bool inBlockComment, ref bool inString, ref char stringChar)
        {
            char c = content[i];

            //Handle String Literals (Ignoring braces inside quotes)
            if (!inLineComment && !inBlockComment)
            {
                if (inString)
                {
                    if (c == stringChar)
                    {
                        //Count consecutive backslashes to handle cases like "\\" correctly.
                        int backslashCount = 0;
                        int j = i - 1;
                        while (j >= 0 && content[j] == '\\')
                        {
                            backslashCount++;
                            j--;
                        }
                        bool isEscaped = (backslashCount % 2) == 1;
                        
                        if (!isEscaped) inString = false;
                    }
                    return true; 
                }
                else if (c == '"' || c == '\'')
                {
                    inString = true;
                    stringChar = c;
                    return true;
                }
            }

            //Handle Comments
            //Note: We increment 'i' here to consume the second character of the token (e.g. '/' or '*').
            //The caller's loop will then increment 'i' again, effectively skipping the whole token.
            if (!inString && !inLineComment && !inBlockComment && c == '/' && i + 1 < content.Length && content[i+1] == '/')
            {
                inLineComment = true; i++; return true;
            }
            if (inLineComment && (c == '\n' || c == '\r'))
            {
                inLineComment = false; return true;
            }
            if (!inString && !inBlockComment && !inLineComment && c == '/' && i + 1 < content.Length && content[i+1] == '*')
            {
                inBlockComment = true; i++; return true;
            }
            if (inBlockComment && c == '*' && i + 1 < content.Length && content[i+1] == '/')
            {
                inBlockComment = false; i++; return true;
            }

            return inLineComment || inBlockComment || inString;
        }

        //Simple check to ensure the file isn't broken
        private static bool ValidateBraces(string content)
        {
            int depth = 0;
            bool inLineComment = false;
            bool inBlockComment = false;
            bool inString = false;
            char stringChar = ' ';

            for (int i = 0; i < content.Length; i++)
            {
                if (ShouldSkipForCommentOrString(content, ref i, ref inLineComment, ref inBlockComment, ref inString, ref stringChar)) 
                    continue;

                char c = content[i];
                if (c == '{') depth++;
                else if (c == '}') depth--;
                
                if (depth < 0) return false;
            }
            return depth == 0;
        }

        private static bool CreateBackup()
        {
            try
            {
                if (File.Exists(GradleTemplatePath))
                {
                    //Creating backups in Library/ to avoid polluting Assets/
                    string backupDir = Path.Combine(ProjectRoot, "Library", "SolanaSdk", "GradleBackups");
                    Directory.CreateDirectory(backupDir);

                    //using timestamped backups to prevent overwriting previous states
                    string timestamp = System.DateTime.UtcNow.ToString("yyyyMMdd_HHmmss_fff");
                    string backupPath = Path.Combine(backupDir, $"mainTemplate.gradle.{timestamp}.bak");
                    
                    File.Copy(GradleTemplatePath, backupPath, true);
                    
                    //Keep only last 10 backups
                    var oldBackups = Directory.GetFiles(backupDir, "mainTemplate.gradle.*.bak")
                                              .OrderByDescending(f => f)
                                              .Skip(10);
                    foreach (var old in oldBackups)
                    {
                        try { File.Delete(old); } catch (System.Exception ex) { Debug.LogWarning($"[Solana SDK] Failed to delete old backup {old}: {ex.Message}"); }
                    }
                    Debug.Log($"[Solana SDK] Created backup: {backupPath}");
                }
                return true;
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[Solana SDK] Backup failed: {e.Message}, Aborting");
                return false;
            }
        }
    }
}