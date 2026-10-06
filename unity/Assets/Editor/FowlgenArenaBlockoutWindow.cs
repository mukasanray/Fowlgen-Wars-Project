using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using System.Collections.Generic;

namespace FowlgenWars.EditorTools
{
    public class FowlgenArenaBlockoutWindow : EditorWindow
    {
        [Header("Arena Dimensions")]
        public float arenaRadiusX = 24f;
        public float arenaRadiusZ = 22f;
        public float baseOffsetX = 16f;
        public float riverWidth = 3.6f;
        public float laneWidth = 3.0f;
        public float laneZOffset = 9.5f;

        [Header("Visual Toggles")]
        public bool createJungleCover = true;
        public bool createTurrets = true;
        public bool createWaypoints = true;
        public bool createNavMeshSurface = true;

        private Vector2 _scrollPos;

        [MenuItem("Fowlgen/Level Design/Arena Blockout Generator")]
        public static void ShowWindow()
        {
            var win = GetWindow<FowlgenArenaBlockoutWindow>("Fowlgen Arena Generator");
            win.minSize = new Vector2(360, 480);
            win.Show();
        }

        private void OnGUI()
        {
            _scrollPos = EditorGUILayout.BeginScrollView(_scrollPos);

            EditorGUILayout.LabelField("Fowlgen-Wars Arena Blockout", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox("Gera a estrutura base e blockout 3D simétrico da arena estilo MOBA (Ilha Flutuante, Bases Vermelha/Azul, Rio, 2 Pontes, 4 Torres e Rotas).", MessageType.Info);

            EditorGUILayout.Space(8);
            EditorGUILayout.LabelField("Dimensões do Cenário", EditorStyles.boldLabel);
            arenaRadiusX = EditorGUILayout.FloatField("Raio X da Ilha", arenaRadiusX);
            arenaRadiusZ = EditorGUILayout.FloatField("Raio Z da Ilha", arenaRadiusZ);
            baseOffsetX = EditorGUILayout.FloatField("Distância das Bases (X)", baseOffsetX);
            riverWidth = EditorGUILayout.FloatField("Largura do Rio", riverWidth);
            laneWidth = EditorGUILayout.FloatField("Largura das Rotas", laneWidth);
            laneZOffset = EditorGUILayout.FloatField("Distância das Rotas (Z)", laneZOffset);

            EditorGUILayout.Space(8);
            EditorGUILayout.LabelField("Componentes a Gerar", EditorStyles.boldLabel);
            createJungleCover = EditorGUILayout.Toggle("Zonas de Jungle / Rochas", createJungleCover);
            createTurrets = EditorGUILayout.Toggle("Torres Defensivas (4)", createTurrets);
            createWaypoints = EditorGUILayout.Toggle("Rotas e Waypoints", createWaypoints);
            createNavMeshSurface = EditorGUILayout.Toggle("Configurar NavMeshSurface", createNavMeshSurface);

            EditorGUILayout.Space(16);
            GUI.backgroundColor = new Color(0.2f, 0.8f, 0.3f);
            if (GUILayout.Button("Gerar Blockout da Arena", GUILayout.Height(38)))
            {
                GenerateArena();
            }
            GUI.backgroundColor = Color.white;

            EditorGUILayout.Space(8);
            if (GUILayout.Button("Limpar Blockout Existente"))
            {
                ClearExisting();
            }

            EditorGUILayout.EndScrollView();
        }

        private void ClearExisting()
        {
            var existing = GameObject.Find("Fowlgen_Arena_Blockout");
            if (existing != null)
            {
                Undo.DestroyObjectImmediate(existing);
                Debug.Log("[FowlgenArena] Blockout anterior removido.");
            }
        }

        private void GenerateArena()
        {
            ClearExisting();

            var root = new GameObject("Fowlgen_Arena_Blockout");
            Undo.RegisterCreatedObjectUndo(root, "Generate Arena Blockout");

            Shader urpShader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");

            // Materiais estilizados básicos
            Material matGrass = CreateTempMat(urpShader, new Color(0.24f, 0.52f, 0.18f), 0.15f);
            Material matEarth = CreateTempMat(urpShader, new Color(0.22f, 0.16f, 0.12f), 0.1f);
            Material matStone = CreateTempMat(urpShader, new Color(0.44f, 0.48f, 0.52f), 0.25f);
            Material matWood = CreateTempMat(urpShader, new Color(0.48f, 0.32f, 0.18f), 0.2f);
            Material matWater = CreateTempMat(urpShader, new Color(0.12f, 0.65f, 0.72f, 0.85f), 0.9f, true);
            Material matRedTeam = CreateTempMat(urpShader, new Color(0.78f, 0.18f, 0.18f), 0.3f);
            Material matBlueTeam = CreateTempMat(urpShader, new Color(0.18f, 0.42f, 0.78f), 0.3f);
            Material matFoliage = CreateTempMat(urpShader, new Color(0.14f, 0.35f, 0.18f), 0.15f);

            // 1. Ilha Flutuante
            var islandGroup = new GameObject("01_FloatingIsland");
            islandGroup.transform.SetParent(root.transform, false);

            var topDisk = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            topDisk.name = "Arena_TopGround";
            topDisk.transform.SetParent(islandGroup.transform, false);
            topDisk.transform.localPosition = new Vector3(0, -0.5f, 0);
            topDisk.transform.localScale = new Vector3(arenaRadiusX * 2f, 0.5f, arenaRadiusZ * 2f);
            topDisk.GetComponent<MeshRenderer>().sharedMaterial = matGrass;

            // Cone inferior da ilha (Underbelly)
            var underbelly = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            underbelly.name = "Island_Underbelly";
            underbelly.transform.SetParent(islandGroup.transform, false);
            underbelly.transform.localPosition = new Vector3(0, -5.5f, 0);
            underbelly.transform.localScale = new Vector3(arenaRadiusX * 1.6f, 5.0f, arenaRadiusZ * 1.6f);
            underbelly.GetComponent<MeshRenderer>().sharedMaterial = matEarth;

            // 2. Rio Central e Pontes
            var riverGroup = new GameObject("02_RiverAndBridges");
            riverGroup.transform.SetParent(root.transform, false);

            var riverObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            riverObj.name = "River_Water";
            riverObj.transform.SetParent(riverGroup.transform, false);
            riverObj.transform.localPosition = new Vector3(0, 0.02f, 0);
            riverObj.transform.localScale = new Vector3(riverWidth, 0.15f, arenaRadiusZ * 2f);
            riverObj.GetComponent<MeshRenderer>().sharedMaterial = matWater;
            var riverCol = riverObj.GetComponent<Collider>();
            if (riverCol != null) riverCol.isTrigger = true;

            // Pontes de Madeira (Superior e Inferior)
            BuildBridge(riverGroup.transform, "Bridge_Top", new Vector3(0, 0.25f, laneZOffset), laneWidth + 1.2f, riverWidth + 1.6f, matWood, matStone);
            BuildBridge(riverGroup.transform, "Bridge_Bottom", new Vector3(0, 0.25f, -laneZOffset), laneWidth + 1.2f, riverWidth + 1.6f, matWood, matStone);

            // 3. Rotas de Pedra (Lanes: Top & Bottom)
            var lanesGroup = new GameObject("03_StoneLanes");
            lanesGroup.transform.SetParent(root.transform, false);

            // Rota de Cima: ligando Red Base -> Top Bridge -> Blue Base
            BuildLaneSegment(lanesGroup.transform, "Lane_Top_RedSide", new Vector3(-baseOffsetX * 0.5f, 0.04f, laneZOffset), baseOffsetX, laneWidth, matStone);
            BuildLaneSegment(lanesGroup.transform, "Lane_Top_BlueSide", new Vector3(baseOffsetX * 0.5f, 0.04f, laneZOffset), baseOffsetX, laneWidth, matStone);

            // Rota de Baixo: ligando Red Base -> Bottom Bridge -> Blue Base
            BuildLaneSegment(lanesGroup.transform, "Lane_Bot_RedSide", new Vector3(-baseOffsetX * 0.5f, 0.04f, -laneZOffset), baseOffsetX, laneWidth, matStone);
            BuildLaneSegment(lanesGroup.transform, "Lane_Bot_BlueSide", new Vector3(baseOffsetX * 0.5f, 0.04f, -laneZOffset), baseOffsetX, laneWidth, matStone);

            // 4. Bases (Red Team na Esquerda -X, Blue Team na Direita +X)
            var basesGroup = new GameObject("04_Bases");
            basesGroup.transform.SetParent(root.transform, false);

            BuildTeamBase(basesGroup.transform, "Base_Red_Nexus", new Vector3(-baseOffsetX, 0, 0), true, matStone, matRedTeam);
            BuildTeamBase(basesGroup.transform, "Base_Blue_Nexus", new Vector3(baseOffsetX, 0, 0), false, matStone, matBlueTeam);

            // 5. Torres Sentinelas (Estátuas de Galos nas Rotas)
            if (createTurrets)
            {
                var turretsGroup = new GameObject("05_Turrets");
                turretsGroup.transform.SetParent(root.transform, false);

                float turretX = baseOffsetX * 0.45f;
                BuildTower(turretsGroup.transform, "Tower_Red_Top", new Vector3(-turretX, 0, laneZOffset + 1.8f), true, matStone, matRedTeam);
                BuildTower(turretsGroup.transform, "Tower_Red_Bot", new Vector3(-turretX, 0, -laneZOffset - 1.8f), true, matStone, matRedTeam);
                BuildTower(turretsGroup.transform, "Tower_Blue_Top", new Vector3(turretX, 0, laneZOffset + 1.8f), false, matStone, matBlueTeam);
                BuildTower(turretsGroup.transform, "Tower_Blue_Bot", new Vector3(turretX, 0, -laneZOffset - 1.8f), false, matStone, matBlueTeam);
            }

            // 6. Elementos de Jungle / Floresta
            if (createJungleCover)
            {
                var jungleGroup = new GameObject("06_JungleAreas");
                jungleGroup.transform.SetParent(root.transform, false);

                // Centro-Norte (acima da ponte superior)
                BuildPineCluster(jungleGroup.transform, "PineCluster_TopNorth", new Vector3(0, 0, arenaRadiusZ * 0.75f), 4, matWood, matFoliage);
                // Centro-Sul (abaixo da ponte inferior)
                BuildPineCluster(jungleGroup.transform, "PineCluster_BottomSouth", new Vector3(0, 0, -arenaRadiusZ * 0.75f), 4, matWood, matFoliage);
                // Ilhas de mata central (entre as duas rotas)
                BuildPineCluster(jungleGroup.transform, "PineCluster_CenterWest", new Vector3(-5f, 0, 0), 3, matWood, matFoliage);
                BuildPineCluster(jungleGroup.transform, "PineCluster_CenterEast", new Vector3(5f, 0, 0), 3, matWood, matFoliage);
            }

            // 7. Waypoints e Spawns para Gameplay / Testes
            if (createWaypoints)
            {
                var wpRoot = new GameObject("07_NavigationWaypoints");
                wpRoot.transform.SetParent(root.transform, false);

                // Waypoints Rota de Cima
                var topLaneWPs = new GameObject("Waypoints_Lane_Top");
                topLaneWPs.transform.SetParent(wpRoot.transform, false);
                CreateWP(topLaneWPs.transform, "WP_Red_Spawn", new Vector3(-baseOffsetX + 2f, 0.2f, 0));
                CreateWP(topLaneWPs.transform, "WP_Top_RedOuter", new Vector3(-baseOffsetX * 0.6f, 0.2f, laneZOffset));
                CreateWP(topLaneWPs.transform, "WP_Top_BridgeMid", new Vector3(0, 0.35f, laneZOffset));
                CreateWP(topLaneWPs.transform, "WP_Top_BlueOuter", new Vector3(baseOffsetX * 0.6f, 0.2f, laneZOffset));
                CreateWP(topLaneWPs.transform, "WP_Blue_Goal", new Vector3(baseOffsetX - 2f, 0.2f, 0));

                // Waypoints Rota de Baixo
                var botLaneWPs = new GameObject("Waypoints_Lane_Bottom");
                botLaneWPs.transform.SetParent(wpRoot.transform, false);
                CreateWP(botLaneWPs.transform, "WP_Red_Spawn", new Vector3(-baseOffsetX + 2f, 0.2f, 0));
                CreateWP(botLaneWPs.transform, "WP_Bot_RedOuter", new Vector3(-baseOffsetX * 0.6f, 0.2f, -laneZOffset));
                CreateWP(botLaneWPs.transform, "WP_Bot_BridgeMid", new Vector3(0, 0.35f, -laneZOffset));
                CreateWP(botLaneWPs.transform, "WP_Bot_BlueOuter", new Vector3(baseOffsetX * 0.6f, 0.2f, -laneZOffset));
                CreateWP(botLaneWPs.transform, "WP_Blue_Goal", new Vector3(baseOffsetX - 2f, 0.2f, 0));
            }

            // 8. NavMeshSurface
            if (createNavMeshSurface)
            {
                var navObj = new GameObject("NavMesh_Surface");
                navObj.transform.SetParent(root.transform, false);
                var surfaceType = System.Type.GetType("Unity.AI.Navigation.NavMeshSurface, Unity.AI.Navigation");
                if (surfaceType != null)
                {
                    navObj.AddComponent(surfaceType);
                }
            }

            EditorSceneManager.MarkSceneDirty(EditorSceneManager.GetActiveScene());
            Selection.activeGameObject = root;
            Debug.Log("[FowlgenArena] Blockout completo gerado com sucesso sob 'Fowlgen_Arena_Blockout'!");
        }

        private static Material CreateTempMat(Shader shader, Color color, float smoothness, bool transparent = false)
        {
            Material mat = new Material(shader);
            mat.SetColor("_BaseColor", color);
            mat.SetFloat("_Smoothness", smoothness);
            if (transparent)
            {
                mat.SetFloat("_Surface", 1);
                mat.SetFloat("_Blend", 0);
                mat.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
                mat.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                mat.SetInt("_ZWrite", 0);
                mat.renderQueue = 3000;
            }
            return mat;
        }

        private static void BuildBridge(Transform parent, string name, Vector3 pos, float width, float length, Material woodMat, Material stoneMat)
        {
            var bridge = new GameObject(name);
            bridge.transform.SetParent(parent, false);
            bridge.transform.localPosition = pos;

            var deck = GameObject.CreatePrimitive(PrimitiveType.Cube);
            deck.name = "Deck";
            deck.transform.SetParent(bridge.transform, false);
            deck.transform.localPosition = Vector3.zero;
            deck.transform.localScale = new Vector3(length, 0.3f, width);
            deck.GetComponent<MeshRenderer>().sharedMaterial = woodMat;

            // Pilares de pedra de suporte
            float[] pX = new float[] { -length * 0.45f, length * 0.45f };
            foreach (var px in pX)
            {
                var pillar = GameObject.CreatePrimitive(PrimitiveType.Cube);
                pillar.name = "SupportPillar";
                pillar.transform.SetParent(bridge.transform, false);
                pillar.transform.localPosition = new Vector3(px, -0.4f, 0);
                pillar.transform.localScale = new Vector3(0.8f, 1.2f, width * 1.1f);
                pillar.GetComponent<MeshRenderer>().sharedMaterial = stoneMat;
            }
        }

        private static void BuildLaneSegment(Transform parent, string name, Vector3 pos, float length, float width, Material mat)
        {
            var slab = GameObject.CreatePrimitive(PrimitiveType.Cube);
            slab.name = name;
            slab.transform.SetParent(parent, false);
            slab.transform.localPosition = pos;
            slab.transform.localScale = new Vector3(length, 0.08f, width);
            slab.GetComponent<MeshRenderer>().sharedMaterial = mat;
        }

        private static void BuildTeamBase(Transform parent, string name, Vector3 pos, bool isRed, Material stoneMat, Material teamMat)
        {
            var baseGo = new GameObject(name);
            baseGo.transform.SetParent(parent, false);
            baseGo.transform.localPosition = pos;

            // Pátio circular
            var platform = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            platform.name = "Dais_Platform";
            platform.transform.SetParent(baseGo.transform, false);
            platform.transform.localPosition = new Vector3(0, 0.15f, 0);
            platform.transform.localScale = new Vector3(10f, 0.3f, 10f);
            platform.GetComponent<MeshRenderer>().sharedMaterial = stoneMat;

            // Poço central / Altar
            var altar = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            altar.name = "Central_Altar";
            altar.transform.SetParent(baseGo.transform, false);
            altar.transform.localPosition = new Vector3(0, 0.4f, 0);
            altar.transform.localScale = new Vector3(3.2f, 0.5f, 3.2f);
            altar.GetComponent<MeshRenderer>().sharedMaterial = stoneMat;

            // Trono / Torre do Galo Mascote
            float throneX = isRed ? -3.5f : 3.5f;
            var throneTower = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            throneTower.name = "Rooster_Throne_Tower";
            throneTower.transform.SetParent(baseGo.transform, false);
            throneTower.transform.localPosition = new Vector3(throneX, 1.8f, 0);
            throneTower.transform.localScale = new Vector3(4.5f, 3.5f, 4.5f);
            throneTower.GetComponent<MeshRenderer>().sharedMaterial = stoneMat;

            // Estátua Mascote do Galo (Placeholder geométrico)
            var roosterMascot = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            roosterMascot.name = isRed ? "Giant_Red_Rooster_Mascot" : "Giant_Blue_Rooster_Mascot";
            roosterMascot.transform.SetParent(baseGo.transform, false);
            roosterMascot.transform.localPosition = new Vector3(throneX, 4.5f, 0);
            roosterMascot.transform.localScale = new Vector3(3.5f, 3.8f, 3.5f);
            roosterMascot.GetComponent<MeshRenderer>().sharedMaterial = teamMat;
        }

        private static void BuildTower(Transform parent, string name, Vector3 pos, bool isRed, Material stoneMat, Material teamMat)
        {
            var tower = new GameObject(name);
            tower.transform.SetParent(parent, false);
            tower.transform.localPosition = pos;

            var pillar = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            pillar.name = "Tower_Pillar";
            pillar.transform.SetParent(tower.transform, false);
            pillar.transform.localPosition = new Vector3(0, 1.4f, 0);
            pillar.transform.localScale = new Vector3(2.0f, 2.8f, 2.0f);
            pillar.GetComponent<MeshRenderer>().sharedMaterial = stoneMat;

            var statue = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            statue.name = "Rooster_Statue_Head";
            statue.transform.SetParent(tower.transform, false);
            statue.transform.localPosition = new Vector3(0, 3.3f, 0);
            statue.transform.localScale = new Vector3(1.5f, 1.7f, 1.5f);
            statue.GetComponent<MeshRenderer>().sharedMaterial = teamMat;
        }

        private static void BuildPineCluster(Transform parent, string name, Vector3 pos, int count, Material woodMat, Material foliageMat)
        {
            var cluster = new GameObject(name);
            cluster.transform.SetParent(parent, false);
            cluster.transform.localPosition = pos;

            for (int i = 0; i < count; i++)
            {
                float ang = (i / (float)count) * Mathf.PI * 2f;
                float r = 1.8f;
                var tree = new GameObject($"Tree_{i}");
                tree.transform.SetParent(cluster.transform, false);
                tree.transform.localPosition = new Vector3(Mathf.Cos(ang) * r, 0, Mathf.Sin(ang) * r);

                var trunk = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                trunk.name = "Trunk";
                trunk.transform.SetParent(tree.transform, false);
                trunk.transform.localPosition = new Vector3(0, 0.8f, 0);
                trunk.transform.localScale = new Vector3(0.5f, 1.6f, 0.5f);
                trunk.GetComponent<MeshRenderer>().sharedMaterial = woodMat;

                var foliage = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                foliage.name = "Foliage";
                foliage.transform.SetParent(tree.transform, false);
                foliage.transform.localPosition = new Vector3(0, 2.4f, 0);
                foliage.transform.localScale = new Vector3(2.2f, 2.0f, 2.2f);
                foliage.GetComponent<MeshRenderer>().sharedMaterial = foliageMat;
            }
        }

        private static void CreateWP(Transform parent, string name, Vector3 pos)
        {
            var wp = new GameObject(name);
            wp.transform.SetParent(parent, false);
            wp.transform.localPosition = pos;
        }
    }
}
