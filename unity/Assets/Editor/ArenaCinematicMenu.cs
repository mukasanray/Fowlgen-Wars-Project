using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using FowlgenWars.Cinematic;

/// <summary>
/// Menu de editor para adicionar o ArenaCinematicDirector à cena aberta.
/// Acesse via: Fowlgen/Cinematic/Add Director To Open Scene
/// </summary>
public static class ArenaCinematicMenu
{
    private const string MenuPath = "Fowlgen/Cinematic/Add Director To Open Scene";

    [MenuItem(MenuPath)]
    public static void AddDirectorToOpenScene()
    {
        // Verifica se há uma cena aberta
        var scene = EditorSceneManager.GetActiveScene();
        if (!scene.IsValid())
        {
            EditorUtility.DisplayDialog(
                "Fowlgen Cinematic",
                "Nenhuma cena aberta. Abra uma cena primeiro.",
                "OK");
            return;
        }

        // Evita duplicatas
        var existing = Object.FindAnyObjectByType<ArenaCinematicDirector>();
        if (existing != null)
        {
            EditorUtility.DisplayDialog(
                "Fowlgen Cinematic",
                $"A cena já contém um ArenaCinematicDirector em '{existing.gameObject.name}'.\n" +
                "Remova-o antes de adicionar outro.",
                "OK");
            Selection.activeGameObject = existing.gameObject;
            return;
        }

        // Cria o GameObject com o componente
        var go = new GameObject("ArenaCinematicDirector");
        Undo.RegisterCreatedObjectUndo(go, "Add ArenaCinematicDirector");

        var director = go.AddComponent<ArenaCinematicDirector>();

        // Configura os rigs nativos do Cinemachine 3
        director.BuildDefaultCinemachineRigs();

        // Marca a cena como modificada
        EditorSceneManager.MarkSceneDirty(scene);

        // Seleciona o novo objeto no editor
        Selection.activeGameObject = go;

        Debug.Log($"[ArenaCinematicMenu] ArenaCinematicDirector adicionado à cena '{scene.name}'.\n" +
                  "Pressione C em Play Mode para iniciar a sequência cinemática.\n" +
                  "Esc = parar | Space = pausar | H = esconder overlay");
    }

    [MenuItem(MenuPath, true)]
    public static bool ValidateAddDirectorToOpenScene()
    {
        return EditorSceneManager.GetActiveScene().IsValid();
    }

    [MenuItem("Fowlgen/Cinematic/Recalibrar Rigs Cinemachine da BattleArena", false, 20)]
    public static void RecalibrateBattleArenaShots()
    {
        var director = Object.FindAnyObjectByType<ArenaCinematicDirector>();
        if (director == null)
        {
            EditorUtility.DisplayDialog("Fowlgen Cinematic", "ArenaCinematicDirector não encontrado na cena atual.", "OK");
            return;
        }

        director.BuildDefaultCinemachineRigs();
        EditorUtility.SetDirty(director);
        EditorSceneManager.MarkSceneDirty(director.gameObject.scene);
        EditorSceneManager.SaveScene(director.gameObject.scene);
        AssetDatabase.SaveAssets();

        Debug.Log("[ArenaCinematicMenu] Rigs Cinemachine recalibrados com sucesso para BattleArena!");
        EditorUtility.DisplayDialog("Fowlgen Cinematic", "Rigs Cinemachine recalibrados com sucesso para BattleArena!", "OK");
    }
}
