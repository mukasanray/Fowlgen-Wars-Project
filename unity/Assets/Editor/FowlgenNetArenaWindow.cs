using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using FishNet.Object;

namespace FowlgenWars.EditorTools
{
    public class FowlgenNetArenaWindow : EditorWindow
    {
        [Header("Dimensões Mobile (Simples e Compacto)")]
        public float islandRadiusX = 22f;
        public float islandRadiusZ = 16f;
        public float baseDistanceX = 15f;
        public float laneZOffset = 8f;

        private const string RootName = "Fowlgen_NetArena_1v1";

        [MenuItem("Fowlgen/Multiplayer/1v1 Net Arena Generator (POC-NET-01)")]
        public static void ShowWindow()
        {
            var win = GetWindow<FowlgenNetArenaWindow>("Net Arena (Mobile 1v1)");
            win.minSize = new Vector2(340, 360);
            win.Show();
        }

        private void OnGUI()
        {
            EditorGUILayout.LabelField("Gerador de Arena 1v1 Mobile (FishNet)", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox("Gera o blockout minimalista otimizado para Android 60 FPS com os Galinheiros (NetworkObject + FishNetGalinheiro) e Waypoints das 2 rotas.", MessageType.Info);

            EditorGUILayout.Space(6);
            islandRadiusX = EditorGUILayout.FloatField("Raio X da Ilha", islandRadiusX);
            islandRadiusZ = EditorGUILayout.FloatField("Raio Z da Ilha", islandRadiusZ);
            baseDistanceX = EditorGUILayout.FloatField("Posição Bases (X)", baseDistanceX);
            laneZOffset = EditorGUILayout.FloatField("Deslocamento Rotas (Z)", laneZOffset);

            EditorGUILayout.Space(12);
            GUI.backgroundColor = new Color(0.2f, 0.75f, 0.9f);
            if (GUILayout.Button("Gerar Arena 1v1 FishNet", GUILayout.Height(36)))
            {
                GenerateNetArena();
            }
            GUI.backgroundColor = Color.white;

            EditorGUILayout.Space(6);
            if (GUILayout.Button("Limpar Arena 1v1"))
            {
                ClearArena();
            }
        }

        private void ClearArena()
        {
            var root = GameObject.Find(RootName);
            if (root != null)
            {
                Undo.DestroyObjectImmediate(root);
                Debug.Log("[FowlgenNetArena] Arena anterior removida.");
            }
        }

        private void GenerateNetArena()
        {
            ClearArena();

            var root = new GameObject(RootName);
            Undo.RegisterCreatedObjectUndo(root, "Generate Net Arena");

            Shader urpShader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");

            // Materiais minimalistas para batching estático eficiente
            Material matGrass = CreateMaterial(urpShader, new Color(0.28f, 0.55f, 0.22f));
            Material matRiver = CreateMaterial(urpShader, new Color(0.15f, 0.65f, 0.75f));
            Material matBridge = CreateMaterial(urpShader, new Color(0.55f, 0.38f, 0.20f));
            Material matPath = CreateMaterial(urpShader, new Color(0.50f, 0.52f, 0.54f));
            Material matRedBase = CreateMaterial(urpShader, new Color(0.85f, 0.20f, 0.20f));
            Material matBlueBase = CreateMaterial(urpShader, new Color(0.20f, 0.45f, 0.85f));

            // 1. Chão da Ilha (Marcado como Static para Static Batching no Mobile)
            var ground = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            ground.name = "Island_Ground_Static";
            ground.transform.SetParent(root.transform, false);
            ground.transform.localPosition = new Vector3(0, -0.4f, 0);
            ground.transform.localScale = new Vector3(islandRadiusX * 2f, 0.4f, islandRadiusZ * 2f);
            ground.GetComponent<MeshRenderer>().sharedMaterial = matGrass;
            GameObjectUtility.SetStaticEditorFlags(ground, StaticEditorFlags.BatchingStatic);

            // 2. Rio Central (Opaque / Simple para evitar overdraw mobile)
            var river = GameObject.CreatePrimitive(PrimitiveType.Cube);
            river.name = "River_Center";
            river.transform.SetParent(root.transform, false);
            river.transform.localPosition = new Vector3(0, 0.02f, 0);
            river.transform.localScale = new Vector3(3.2f, 0.1f, islandRadiusZ * 2f);
            river.GetComponent<MeshRenderer>().sharedMaterial = matRiver;
            var riverCol = river.GetComponent<Collider>();
            if (riverCol != null) riverCol.isTrigger = true;

            // 3. Pontes (Top e Bot)
            BuildBridge(root.transform, "Bridge_Top", new Vector3(0, 0.15f, laneZOffset), matBridge);
            BuildBridge(root.transform, "Bridge_Bot", new Vector3(0, 0.15f, -laneZOffset), matBridge);

            // 4. Rotas de Pedra (Top e Bot)
            BuildLane(root.transform, "Lane_Top_Slab", new Vector3(0, 0.03f, laneZOffset), baseDistanceX * 2f, matPath);
            BuildLane(root.transform, "Lane_Bot_Slab", new Vector3(0, 0.03f, -laneZOffset), baseDistanceX * 2f, matPath);

            // 5. Galinheiros (Main Bases) com FishNet NetworkObject e FishNetGalinheiro
            BuildGalinheiro(root.transform, "Galinheiro_Red_Host", new Vector3(-baseDistanceX, 0, 0), true, matRedBase);
            BuildGalinheiro(root.transform, "Galinheiro_Blue_Client", new Vector3(baseDistanceX, 0, 0), false, matBlueBase);

            // 6. Waypoints para Navegação/Sincronização dos Minions
            BuildWaypoints(root.transform);

            EditorSceneManager.MarkSceneDirty(EditorSceneManager.GetActiveScene());
            Selection.activeGameObject = root;
            Debug.Log("[FowlgenNetArena] Blockout 1v1 FishNet gerado com sucesso! Pronto para POC-NET-01.");
        }

        private static Material CreateMaterial(Shader shader, Color color)
        {
            var mat = new Material(shader);
            mat.SetColor("_BaseColor", color);
            mat.SetFloat("_Smoothness", 0.15f);
            return mat;
        }

        private static void BuildBridge(Transform parent, string name, Vector3 pos, Material mat)
        {
            var bridge = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bridge.name = name;
            bridge.transform.SetParent(parent, false);
            bridge.transform.localPosition = pos;
            bridge.transform.localScale = new Vector3(4.5f, 0.25f, 3.2f);
            bridge.GetComponent<MeshRenderer>().sharedMaterial = mat;
            GameObjectUtility.SetStaticEditorFlags(bridge, StaticEditorFlags.BatchingStatic);
        }

        private static void BuildLane(Transform parent, string name, Vector3 pos, float length, Material mat)
        {
            var lane = GameObject.CreatePrimitive(PrimitiveType.Cube);
            lane.name = name;
            lane.transform.SetParent(parent, false);
            lane.transform.localPosition = pos;
            lane.transform.localScale = new Vector3(length, 0.05f, 2.5f);
            lane.GetComponent<MeshRenderer>().sharedMaterial = mat;
            GameObjectUtility.SetStaticEditorFlags(lane, StaticEditorFlags.BatchingStatic);
        }

        private static void BuildGalinheiro(Transform parent, string name, Vector3 pos, bool isHost, Material teamMat)
        {
            var baseGo = new GameObject(name);
            baseGo.transform.SetParent(parent, false);
            baseGo.transform.localPosition = pos;

            // Visual: Cilindro base + Cubo torre
            var meshPillar = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            meshPillar.name = "Model_Base";
            meshPillar.transform.SetParent(baseGo.transform, false);
            meshPillar.transform.localPosition = new Vector3(0, 1.2f, 0);
            meshPillar.transform.localScale = new Vector3(3.5f, 1.2f, 3.5f);
            meshPillar.GetComponent<MeshRenderer>().sharedMaterial = teamMat;

            // BoxCollider na raiz para detecção de ataque dos minions
            var col = baseGo.AddComponent<BoxCollider>();
            col.center = new Vector3(0, 1.2f, 0);
            col.size = new Vector3(4f, 2.5f, 4f);

            // Componentes FishNet
            baseGo.AddComponent<NetworkObject>();
            var core = baseGo.AddComponent<FishNetGalinheiro>();
            core.isHostBase = isHost;

            baseGo.tag = "Respawn"; // Tag de referência simples
        }

        private static void BuildWaypoints(Transform parent)
        {
            var wpRoot = new GameObject("Waypoints_Minions");
            wpRoot.transform.SetParent(parent, false);

            // Rota Superior (Top Lane)
            var topGroup = new GameObject("Lane_Top_Waypoints");
            topGroup.transform.SetParent(wpRoot.transform, false);
            CreatePoint(topGroup.transform, "WP_0_RedSpawn", new Vector3(-13f, 0.2f, 8f));
            CreatePoint(topGroup.transform, "WP_1_Bridge", new Vector3(0f, 0.3f, 8f));
            CreatePoint(topGroup.transform, "WP_2_BlueTarget", new Vector3(13f, 0.2f, 8f));

            // Rota Inferior (Bot Lane)
            var botGroup = new GameObject("Lane_Bot_Waypoints");
            botGroup.transform.SetParent(wpRoot.transform, false);
            CreatePoint(botGroup.transform, "WP_0_RedSpawn", new Vector3(-13f, 0.2f, -8f));
            CreatePoint(botGroup.transform, "WP_1_Bridge", new Vector3(0f, 0.3f, -8f));
            CreatePoint(botGroup.transform, "WP_2_BlueTarget", new Vector3(13f, 0.2f, -8f));
        }

        private static void CreatePoint(Transform parent, string name, Vector3 pos)
        {
            var p = new GameObject(name);
            p.transform.SetParent(parent, false);
            p.transform.localPosition = pos;
        }
    }
}
