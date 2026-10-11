using UnityEditor;
using UnityEngine;

namespace FowlgenWars.Editor
{
    public static class SolutionProjectSynchronizer
    {
        [MenuItem("Fowlgen Wars/Regenerar Solucao e Projetos (.csproj)")]
        public static void SyncSolution()
        {
            AssetDatabase.Refresh(ImportAssetOptions.ForceSynchronousImport);
            UnityEditor.Compilation.CompilationPipeline.RequestScriptCompilation();
            Debug.Log("[FowlgenWars] Sincronização de scripts e regeração de solução solicitadas com sucesso!");
        }

        [MenuItem("Fowlgen Wars/Configurar FishNet NetworkManager Prefab")]
        public static void SetupNetworkManagerPrefab()
        {
            var prefabPath = "Assets/Resources/FishNet_NetworkManager.prefab";
            var dpo = AssetDatabase.LoadAssetAtPath<FishNet.Managing.Object.PrefabObjects>("Assets/DefaultPrefabObjects.asset");

            if (dpo == null)
            {
                Debug.LogError("[FowlgenWars] Assets/DefaultPrefabObjects.asset não foi encontrado.");
                return;
            }

            var go = new GameObject("FishNet_NetworkManager");
            go.SetActive(false);
            go.AddComponent<FishNet.Transporting.Tugboat.Tugboat>();
            var nm = go.AddComponent<FishNet.Managing.NetworkManager>();
            nm.SpawnablePrefabs = dpo;

            if (!AssetDatabase.IsValidFolder("Assets/Resources"))
                AssetDatabase.CreateFolder("Assets", "Resources");

            PrefabUtility.SaveAsPrefabAsset(go, prefabPath);
            Object.DestroyImmediate(go);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log("[FowlgenWars] Prefab 'FishNet_NetworkManager' criado em Assets/Resources com SpawnablePrefabs configurado!");
        }
    }
}
