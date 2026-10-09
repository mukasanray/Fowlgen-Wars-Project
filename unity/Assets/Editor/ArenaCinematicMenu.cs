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

        // Tenta atribuir Camera.main
        Camera mainCam = Camera.main;
        if (mainCam != null)
        {
            // Usa SerializedObject para setar o campo privado serializado via Reflection
            var so = new SerializedObject(director);
            var camProp = so.FindProperty("_targetCamera");
            if (camProp != null)
            {
                camProp.objectReferenceValue = mainCam;
                so.ApplyModifiedPropertiesWithoutUndo();
            }
            Debug.Log($"[ArenaCinematicMenu] Camera atribuída: {mainCam.name}");
        }
        else
        {
            Debug.LogWarning("[ArenaCinematicMenu] Camera.main não encontrada. " +
                             "Atribua a câmera manualmente no Inspector.");
        }

        // Preenche os shots padrão
        director.BuildDefaultArenaShots();

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
        // O item fica habilitado apenas se houver uma cena válida aberta
        return EditorSceneManager.GetActiveScene().IsValid();
    }
}
