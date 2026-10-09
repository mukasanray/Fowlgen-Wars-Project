using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using FowlgenWars.POC;
using FowlgenWars.Solana;
using FowlgenWars.Core;

public static class FowlgenWarsPOCInstaller
{
    const string MenuScene = "Assets/Scenes/Game/MainMenu.unity";
    const string Poc01 = "Assets/Scenes/POC/POC_01_ProjectFoundation.unity";
    const string Poc02 = "Assets/Scenes/POC/POC_02_SolanaDevnet.unity";
    const string Poc03 = "Assets/Scenes/POC/POC_03_AnchorWorkspace.unity";
    const string Poc04 = "Assets/Scenes/POC/POC_04_UnityAnchor.unity";
    const string Poc05 = "Assets/Scenes/POC/POC_05_WalletTransaction.unity";

    [MenuItem("Fowlgen Wars/Rebuild POC Scenes + UI")]
    public static void Install()
    {
        EnsureFolders();
        CreateConfigAsset();
        CreateUiPrefabs();
        CreateScene(MenuScene, POCSceneRoot.Kind.MainMenu);
        CreateScene(Poc01, POCSceneRoot.Kind.ProjectFoundation);
        CreateScene(Poc02, POCSceneRoot.Kind.SolanaDevnet);
        CreateScene(Poc03, POCSceneRoot.Kind.AnchorWorkspace);
        CreateScene(Poc04, POCSceneRoot.Kind.UnityAnchor);
        CreateScene(Poc05, POCSceneRoot.Kind.WalletTransaction);
        UpdateBuildSettings();
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        EditorUtility.DisplayDialog(
            "Fowlgen Wars",
            "POC scenes rebuilt.\nPlay MainMenu, then open each POC.\nSolana Unity SDK is still not in Packages — RPC/wallet/tx stay placeholders until you add it.",
            "OK");
    }

    static void EnsureFolders()
    {
        if (!AssetDatabase.IsValidFolder("Assets/Scenes/POC"))
            AssetDatabase.CreateFolder("Assets/Scenes", "POC");
        if (!AssetDatabase.IsValidFolder("Assets/Scenes/Game"))
            AssetDatabase.CreateFolder("Assets/Scenes", "Game");
        if (!AssetDatabase.IsValidFolder("Assets/UI"))
            AssetDatabase.CreateFolder("Assets", "UI");
        if (!AssetDatabase.IsValidFolder("Assets/Solana"))
            AssetDatabase.CreateFolder("Assets", "Solana");
        if (!AssetDatabase.IsValidFolder("Assets/Resources"))
            AssetDatabase.CreateFolder("Assets", "Resources");
    }

    static void CreateConfigAsset()
    {
        const string path = "Assets/Solana/SolanaConfig.asset";
        if (AssetDatabase.LoadAssetAtPath<SolanaConfig>(path) != null)
            return;

        SolanaConfig config = ScriptableObject.CreateInstance<SolanaConfig>();
        AssetDatabase.CreateAsset(config, path);
    }

    static void CreateUiPrefabs()
    {
        SavePrefab("Assets/UI/POCButton.prefab", BuildButton);
        SavePrefab("Assets/UI/POCStatusPanel.prefab", BuildStatusPanel);
        SavePrefab("Assets/UI/POCLogPanel.prefab", BuildLogPanel);
    }

    static void SavePrefab(string path, System.Func<GameObject> build)
    {
        GameObject instance = build();
        PrefabUtility.SaveAsPrefabAsset(instance, path);
        Object.DestroyImmediate(instance);
    }

    static GameObject BuildButton()
    {
        var go = new GameObject("POCButton", typeof(RectTransform), typeof(Image), typeof(Button));
        go.GetComponent<Image>().color = new Color(0.12f, 0.55f, 0.28f, 1f);
        var rect = go.GetComponent<RectTransform>();
        rect.sizeDelta = new Vector2(620, 88);

        var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
        labelGo.transform.SetParent(go.transform, false);
        var text = labelGo.GetComponent<Text>();
        text.text = "ACTION";
        text.alignment = TextAnchor.MiddleCenter;
        text.color = Color.white;
        text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        if (text.font == null)
            text.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        text.fontSize = 26;
        labelGo.GetComponent<RectTransform>().sizeDelta = new Vector2(620, 88);
        return go;
    }

    static GameObject BuildStatusPanel()
    {
        var go = new GameObject("POCStatusPanel", typeof(RectTransform), typeof(Image));
        go.GetComponent<Image>().color = new Color(0.08f, 0.12f, 0.10f, 0.92f);
        go.GetComponent<RectTransform>().sizeDelta = new Vector2(960, 360);
        return go;
    }

    static GameObject BuildLogPanel()
    {
        var go = new GameObject("POCLogPanel", typeof(RectTransform), typeof(Image), typeof(Text));
        go.GetComponent<Image>().color = new Color(0.06f, 0.06f, 0.08f, 0.95f);
        var text = go.GetComponent<Text>();
        text.text = "LOG";
        text.color = Color.white;
        text.alignment = TextAnchor.UpperLeft;
        text.fontSize = 20;
        text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        if (text.font == null)
            text.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        go.GetComponent<RectTransform>().sizeDelta = new Vector2(960, 220);
        return go;
    }

    static void CreateScene(string path, POCSceneRoot.Kind kind)
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        var cameraGo = new GameObject("Main Camera", typeof(Camera), typeof(AudioListener));
        cameraGo.tag = "MainCamera";
        Camera camera = cameraGo.GetComponent<Camera>();
        camera.clearFlags = CameraClearFlags.SolidColor;
        camera.backgroundColor = new Color(0.05f, 0.09f, 0.07f, 1f);

        var root = new GameObject("POCRoot");
        POCSceneRoot pocRoot = root.AddComponent<POCSceneRoot>();
        pocRoot.SceneKind = kind;
        root.AddComponent<POCScreenUI>();
        root.AddComponent<GameBootstrap>();

        var eventGo = new GameObject("EventSystem", typeof(EventSystem));
        System.Type inputModule = System.Type.GetType("UnityEngine.InputSystem.UI.InputSystemUIInputModule, Unity.InputSystem");
        if (inputModule != null)
            eventGo.AddComponent(inputModule);
        else
            eventGo.AddComponent<StandaloneInputModule>();

        EditorSceneManager.SaveScene(scene, path);
    }

    static void UpdateBuildSettings()
    {
        EditorBuildSettings.scenes = new[]
        {
            new EditorBuildSettingsScene(MenuScene, true),
            new EditorBuildSettingsScene(Poc01, true),
            new EditorBuildSettingsScene(Poc02, true),
            new EditorBuildSettingsScene(Poc03, true),
            new EditorBuildSettingsScene(Poc04, true),
            new EditorBuildSettingsScene(Poc05, true)
        };
    }
}
