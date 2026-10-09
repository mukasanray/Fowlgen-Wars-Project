using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using UnityEngine;

namespace FowlgenWars.Solana
{
    /// <summary>
    /// Reads fields from the Anchor IDL JSON without a third-party JSON package.
    /// Source of truth: Assets/Solana/IDL/fowlgen_wars.json (generated from the program).
    /// </summary>
    public static class IdlInspector
    {
        const string ContractResourcesPath = "fowlgen_wars_contract";
        const string LegacyResourcesPath = "fowlgen_wars";
        const string EditorContractIdlPath = "Assets/Resources/fowlgen_wars_contract.json";
        const string EditorIdlPath = "Assets/Solana/IDL/fowlgen_wars.json";

        public static TextAsset LoadIdlAsset()
        {
            TextAsset fromResources = Resources.Load<TextAsset>(ContractResourcesPath);
            if (fromResources != null)
                return fromResources;

            fromResources = Resources.Load<TextAsset>(LegacyResourcesPath);
            if (fromResources != null)
                return fromResources;

#if UNITY_EDITOR
            TextAsset fromEditor = UnityEditor.AssetDatabase.LoadAssetAtPath<TextAsset>(EditorContractIdlPath);
            if (fromEditor != null)
                return fromEditor;

            return UnityEditor.AssetDatabase.LoadAssetAtPath<TextAsset>(EditorIdlPath);
#else
            return null;
#endif
        }

        public static string ReadAddress(string json)
        {
            return ReadStringField(json, "address");
        }

        public static string ReadProgramName(string json)
        {
            Match metadata = Regex.Match(json, "\"metadata\"\\s*:\\s*\\{([^}]*)\\}", RegexOptions.Singleline);
            if (metadata.Success)
            {
                string name = ReadStringField(metadata.Groups[1].Value, "name");
                if (!string.IsNullOrEmpty(name))
                    return name;
            }

            return ReadStringField(json, "name");
        }

        public static string[] ReadInstructionNames(string json)
        {
            var names = new List<string>();
            Match block = Regex.Match(json, "\"instructions\"\\s*:\\s*\\[(.*?)\\]", RegexOptions.Singleline);
            if (!block.Success)
                return names.ToArray();

            foreach (Match match in Regex.Matches(block.Groups[1].Value, "\"name\"\\s*:\\s*\"([^\"]+)\""))
                names.Add(match.Groups[1].Value);

            return names.ToArray();
        }

        public static bool IsPlaceholderProgramId(string programId)
        {
            if (string.IsNullOrWhiteSpace(programId))
                return true;

            return programId.Trim() == "11111111111111111111111111111111";
        }

        static string ReadStringField(string json, string field)
        {
            Match match = Regex.Match(json, "\"" + field + "\"\\s*:\\s*\"([^\"]*)\"");
            return match.Success ? match.Groups[1].Value : string.Empty;
        }
    }
}
