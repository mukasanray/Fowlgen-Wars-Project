using System;
using System.IO;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace FowlgenWars.Editor
{
    /// <summary>
    /// EAP Itens 73 e 74: Pipeline automatizado de Build APK Android Release do Fowlgen Wars.
    /// Configura IL2CPP, arquitetura ARM64, compressão ASTC, stripping de código e gera o APK final para submissão.
    /// </summary>
    public static class AndroidReleaseBuildPipeline
    {
        private static readonly string[] CanonicalScenes = new string[]
        {
            "Assets/Scenes/Game/Auth.unity",
            "Assets/Scenes/Game/Play.unity",
            "Assets/Scenes/Game/BattleArena.unity",
            "Assets/Scenes/Game/Vitoria.unity",
            "Assets/Scenes/Game/Derrota.unity"
        };

        [MenuItem("Fowlgen Wars/Build/1. Configurar PlayerSettings Android (IL2CPP + ARM64)", false, 100)]
        public static void ConfigureAndroidSettings()
        {
            Debug.Log("[AndroidReleaseBuild] Configurando PlayerSettings para Android Release...");

            // 1. Orientação horizontal estrita (Landscape)
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.AutoRotation;
            PlayerSettings.allowedAutorotateToPortrait = false;
            PlayerSettings.allowedAutorotateToPortraitUpsideDown = false;
            PlayerSettings.allowedAutorotateToLandscapeLeft = true;
            PlayerSettings.allowedAutorotateToLandscapeRight = true;

            // 2. Pacote e Identificação
            PlayerSettings.companyName = "G5B Studios";
            PlayerSettings.productName = "Fowlgen Wars";
            PlayerSettings.SetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Android, "com.g5bstudios.fowlgenwars");
            PlayerSettings.bundleVersion = "1.0.0";
            PlayerSettings.Android.bundleVersionCode = 1;

            // 3. Scripting Backend IL2CPP e Arquitetura ARM64
            PlayerSettings.SetScriptingBackend(UnityEditor.Build.NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;

            // 4. Stripping e Compressão
            PlayerSettings.stripEngineCode = true;
            EditorUserBuildSettings.androidBuildSubtarget = MobileTextureSubtarget.ASTC;
            EditorUserBuildSettings.buildAppBundle = false; // Gera arquivo .apk diretamente

            // 5. Configurar cenas no EditorBuildSettings
            List<EditorBuildSettingsScene> scenesList = new List<EditorBuildSettingsScene>();
            foreach (var scenePath in CanonicalScenes)
            {
                if (File.Exists(scenePath))
                {
                    scenesList.Add(new EditorBuildSettingsScene(scenePath, true));
                }
                else
                {
                    Debug.LogWarning($"[AndroidReleaseBuild] Cena não encontrada no caminho: {scenePath}");
                }
            }
            EditorBuildSettings.scenes = scenesList.ToArray();

            AssetDatabase.SaveAssets();
            Debug.Log($"[AndroidReleaseBuild] Configurações de Android Release aplicadas com sucesso! Cenas configuradas: {scenesList.Count}");
        }

        [MenuItem("Fowlgen Wars/Build/2. Compilar APK Android Release (EAP Item 77)", false, 101)]
        public static void BuildAndroidRelease()
        {
            ConfigureAndroidSettings();

            string outputDir = Path.Combine(Directory.GetCurrentDirectory(), "Builds", "Android");
            if (!Directory.Exists(outputDir))
            {
                Directory.CreateDirectory(outputDir);
            }

            string apkPath = Path.Combine(outputDir, "FowlgenWars_MVP_Colosseum2026.apk");
            Debug.Log($"[AndroidReleaseBuild] Iniciando compilação do APK em: {apkPath} ...");

            BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions
            {
                scenes = CanonicalScenes,
                locationPathName = apkPath,
                target = BuildTarget.Android,
                options = BuildOptions.None
            };

            BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);
            BuildSummary summary = report.summary;

            if (summary.result == BuildResult.Succeeded)
            {
                Debug.Log($"[AndroidReleaseBuild] ✅ Build APK concluído com sucesso! Tamanho: {summary.totalSize / (1024 * 1024):F2} MB em {apkPath}");
            }
            else if (summary.result == BuildResult.Failed)
            {
                Debug.LogError($"[AndroidReleaseBuild] ❌ Falha na compilação do APK Android Release ({summary.totalErrors} erros).");
            }
        }
    }
}
