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
    }
}
