using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using FowlgenWars.Architecture.Models;
using FowlgenWars.Architecture.Presenters;
using FowlgenWars.Architecture.Views;
using FowlgenWars.Gameplay;

namespace FowlgenWars.Editor
{
    public static class FowlgenPlaySceneSetup
    {
        private const string ArenaScenePath = "Assets/Scenes/Game/Arena.unity";
        private const string MinionPrefabPath = "Assets/Prefabs/Minion_Caipira_Player.prefab";
        private const string ResourcesArchPath = "Assets/Resources/Architecture";

        [MenuItem("Fowlgen Wars/Setup Arena Scene + Prefabs (MVP)")]
        public static void BuildPlaySceneAndAssets()
        {
            EnsureFolders();
            var minionData = CreateScriptableObjects();
            var minionPrefab = CreateMinionPrefab(minionData);
            minionData.GetType().GetField("prefab", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(minionData, minionPrefab);
            EditorUtility.SetDirty(minionData);

            SetupArenaScene(minionData);
            UpdateBuildSettings();

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log("[FowlgenWars] Cena Arena, Prefabs e ScriptableObjects configurados com sucesso!");
        }

        private static void EnsureFolders()
        {
            if (!AssetDatabase.IsValidFolder("Assets/Resources"))
                AssetDatabase.CreateFolder("Assets", "Resources");
            if (!AssetDatabase.IsValidFolder(ResourcesArchPath))
                AssetDatabase.CreateFolder("Assets/Resources", "Architecture");
            if (!AssetDatabase.IsValidFolder("Assets/Prefabs"))
                AssetDatabase.CreateFolder("Assets", "Prefabs");
            if (!AssetDatabase.IsValidFolder("Assets/Scenes/Game"))
                AssetDatabase.CreateFolder("Assets/Scenes", "Game");
        }

        private static MinionDataSO CreateScriptableObjects()
        {
            // 1. NavigationConfig
            var nav = AssetDatabase.LoadAssetAtPath<NavigationConfig>($"{ResourcesArchPath}/NavigationConfig.asset");
            if (nav == null)
            {
                nav = ScriptableObject.CreateInstance<NavigationConfig>();
                AssetDatabase.CreateAsset(nav, $"{ResourcesArchPath}/NavigationConfig.asset");
            }

            // 2. SessionState
            var session = AssetDatabase.LoadAssetAtPath<FowlgenWars.Architecture.Models.SessionState>($"{ResourcesArchPath}/SessionState.asset");
            if (session == null)
            {
                session = ScriptableObject.CreateInstance<FowlgenWars.Architecture.Models.SessionState>();
                AssetDatabase.CreateAsset(session, $"{ResourcesArchPath}/SessionState.asset");
            }

            // 3. MinionDataSO
            var minionData = AssetDatabase.LoadAssetAtPath<MinionDataSO>($"{ResourcesArchPath}/MinionData_Default.asset");
            if (minionData == null)
            {
                minionData = ScriptableObject.CreateInstance<MinionDataSO>();
                AssetDatabase.CreateAsset(minionData, $"{ResourcesArchPath}/MinionData_Default.asset");
            }

            // 4. MatchRuntimeStateSO
            var runtimeState = AssetDatabase.LoadAssetAtPath<MatchRuntimeStateSO>($"{ResourcesArchPath}/MatchRuntimeState.asset");
            if (runtimeState == null)
            {
                runtimeState = ScriptableObject.CreateInstance<MatchRuntimeStateSO>();
                AssetDatabase.CreateAsset(runtimeState, $"{ResourcesArchPath}/MatchRuntimeState.asset");
            }

            // 5. MatchConfigSO
            var matchConfig = AssetDatabase.LoadAssetAtPath<MatchConfigSO>($"{ResourcesArchPath}/MatchConfig.asset");
            if (matchConfig == null)
            {
                matchConfig = ScriptableObject.CreateInstance<MatchConfigSO>();
                matchConfig.GetType().GetField("defaultMinionData", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                    ?.SetValue(matchConfig, minionData);
                AssetDatabase.CreateAsset(matchConfig, $"{ResourcesArchPath}/MatchConfig.asset");
            }

            return minionData;
        }

        private static GameObject CreateMinionPrefab(MinionDataSO minionData)
        {
            var existingPrefab = AssetDatabase.LoadAssetAtPath<GameObject>(MinionPrefabPath);
            if (existingPrefab != null) return existingPrefab;

            // Criar minion geométrico otimizado
            var root = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            root.name = "Minion_Caipira_Player";
            root.transform.localScale = new Vector3(0.8f, 0.8f, 0.8f);

            var rb = root.AddComponent<Rigidbody>();
            rb.isKinematic = true;

            var agent = root.AddComponent<MinionAgent>();

            // Adicionar HealthBar em World Space
            var canvasGo = new GameObject("HealthBar_Canvas");
            canvasGo.transform.SetParent(root.transform);
            canvasGo.transform.localPosition = new Vector3(0, 1.4f, 0);

            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.WorldSpace;
            var rect = canvasGo.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(1.5f, 0.25f);

            var bgGo = new GameObject("BG");
            bgGo.transform.SetParent(canvasGo.transform);
            var bgImg = bgGo.AddComponent<Image>();
            bgImg.color = new Color(0.1f, 0.1f, 0.1f, 0.8f);
            var bgRect = bgGo.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.sizeDelta = Vector2.zero;

            var fillGo = new GameObject("Fill");
            fillGo.transform.SetParent(canvasGo.transform);
            var fillImg = fillGo.AddComponent<Image>();
            fillImg.color = Color.green;
            fillImg.type = Image.Type.Filled;
            fillImg.fillMethod = Image.FillMethod.Horizontal;
            var fillRect = fillGo.GetComponent<RectTransform>();
            fillRect.anchorMin = Vector2.zero;
            fillRect.anchorMax = Vector2.one;
            fillRect.sizeDelta = Vector2.zero;

            var healthBar = canvasGo.AddComponent<WorldHealthBarView>();
            healthBar.GetType().GetField("fillImage", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(healthBar, fillImg);

            agent.GetType().GetField("healthBar", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(agent, healthBar);
            agent.GetType().GetField("data", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(agent, minionData);

            GameObject prefab = PrefabUtility.SaveAsPrefabAsset(root, MinionPrefabPath);
            Object.DestroyImmediate(root);
            return prefab;
        }

        private static void SetupArenaScene(MinionDataSO minionData)
        {
            UnityEngine.SceneManagement.Scene scene;
            string battleArenaPath = "Assets/Scenes/Game/BattleArena.unity";
            if (System.IO.File.Exists(battleArenaPath))
            {
                scene = EditorSceneManager.OpenScene(battleArenaPath, OpenSceneMode.Single);
            }
            else
            {
                scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                var lightGo = new GameObject("Directional Light");
                var light = lightGo.AddComponent<Light>();
                light.type = LightType.Directional;
                light.intensity = 1.2f;
                lightGo.transform.rotation = Quaternion.Euler(50, -30, 0);

                var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
                ground.name = "Arena_Ground";
                ground.transform.localScale = new Vector3(4f, 1f, 6f);
            }

            // 1. Câmera
            var camGo = Camera.main != null ? Camera.main.gameObject : null;
            if (camGo == null)
            {
                camGo = new GameObject("Main Camera");
                camGo.tag = "MainCamera";
                var cam = camGo.AddComponent<Camera>();
                cam.clearFlags = CameraClearFlags.SolidColor;
                cam.backgroundColor = new Color(0.12f, 0.15f, 0.18f);
                camGo.AddComponent<AudioListener>();
            }
            camGo.transform.position = new Vector3(0, 18, -28);
            camGo.transform.rotation = Quaternion.Euler(45, 0, 0);

            // Remover instâncias anteriores de setup caso a cena já tenha sido processada
            var oldGm = Object.FindAnyObjectByType<GameMatchManager>();
            if (oldGm != null) Object.DestroyImmediate(oldGm.gameObject);
            var oldHud = GameObject.Find("Canvas_HUD");
            if (oldHud != null) Object.DestroyImmediate(oldHud);
            var oldHero = GameObject.Find("Player_Hero");
            if (oldHero != null) Object.DestroyImmediate(oldHero);
            var oldPBase = GameObject.Find("Galinheiro_Player");
            if (oldPBase != null) Object.DestroyImmediate(oldPBase);
            var oldEBase = GameObject.Find("Galinheiro_Enemy");
            if (oldEBase != null) Object.DestroyImmediate(oldEBase);
            var oldWpTop = GameObject.Find("Path_Top");
            if (oldWpTop != null) Object.DestroyImmediate(oldWpTop);
            var oldWpMid = GameObject.Find("Path_Mid");
            if (oldWpMid != null) Object.DestroyImmediate(oldWpMid);
            var oldWpBot = GameObject.Find("Path_Bot");
            if (oldWpBot != null) Object.DestroyImmediate(oldWpBot);

            // 3. Galinheiros (Bases)
            var playerBaseGo = CreateGalinheiro("Galinheiro_Player", Team.Player, new Vector3(0, 1.5f, -22), Color.blue);
            var enemyBaseGo = CreateGalinheiro("Galinheiro_Enemy", Team.Enemy, new Vector3(0, 1.5f, 22), Color.red);

            // 4. Waypoints (Top, Mid, Bot)
            var pathTop = CreateWaypointPath("Path_Top", LaneType.Top, -14f, Color.cyan);
            var pathMid = CreateWaypointPath("Path_Mid", LaneType.Mid, 0f, Color.yellow);
            var pathBot = CreateWaypointPath("Path_Bot", LaneType.Bot, 14f, Color.magenta);

            // 5. Spawn Points
            var playerSpawn = new GameObject("SpawnPoint_Player");
            playerSpawn.transform.position = new Vector3(0, 0, -18);

            var enemySpawn = new GameObject("SpawnPoint_Enemy");
            enemySpawn.transform.position = new Vector3(0, 0, 18);

            // 6. Canvas HUD Mobile + Virtual Joystick
            var hudElements = CreateHUD();

            // 7. GameManager
            var gmGo = new GameObject("GameMatchManager");
            var matchManager = gmGo.AddComponent<GameMatchManager>();
            var matchConfig = AssetDatabase.LoadAssetAtPath<MatchConfigSO>($"{ResourcesArchPath}/MatchConfig.asset");
            var runtimeState = AssetDatabase.LoadAssetAtPath<MatchRuntimeStateSO>($"{ResourcesArchPath}/MatchRuntimeState.asset");

            SetField(matchManager, "matchConfig", matchConfig);
            SetField(matchManager, "runtimeState", runtimeState);
            SetField(matchManager, "playerGalinheiro", playerBaseGo.GetComponent<StructureGalinheiro>());
            SetField(matchManager, "enemyGalinheiro", enemyBaseGo.GetComponent<StructureGalinheiro>());
            SetField(matchManager, "topPath", pathTop);
            SetField(matchManager, "midPath", pathMid);
            SetField(matchManager, "botPath", pathBot);
            SetField(matchManager, "playerSpawnPoint", playerSpawn.transform);
            SetField(matchManager, "enemySpawnPoint", enemySpawn.transform);

            // Conectar MatchPresenter
            var presenter = hudElements.CanvasGo.AddComponent<MatchPresenter>();
            SetField(presenter, "runtimeState", runtimeState);
            SetField(presenter, "hudView", hudElements.HudView);
            SetField(presenter, "matchManager", matchManager);

            // 8. Herói do Jogador (MobilePlayerController + HeroAgent)
            var heroGo = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            heroGo.name = "Player_Hero";
            heroGo.transform.position = playerSpawn.transform.position;
            heroGo.transform.localScale = new Vector3(1f, 1f, 1f);
            var heroRenderer = heroGo.GetComponent<Renderer>();
            var heroMat = new Material(Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard"));
            heroMat.color = new Color(0.1f, 0.6f, 1.0f); // Azul Herói Aliado
            heroRenderer.material = heroMat;

            Object.DestroyImmediate(heroGo.GetComponent<Collider>());
            var charController = heroGo.AddComponent<CharacterController>();
            charController.center = new Vector3(0, 0, 0);
            charController.height = 2f;
            charController.radius = 0.5f;

            var mobileController = heroGo.AddComponent<MobilePlayerController>();
            mobileController.BindJoystick(hudElements.JoystickView);

            var playerHeroAgent = heroGo.AddComponent<HeroAgent>();
            var pHeroHealthBar = CreateWorldHealthBar(heroGo, 1.5f, new Color(0.2f, 0.8f, 1f));
            SetField(playerHeroAgent, "healthBar", pHeroHealthBar);
            playerHeroAgent.Initialize(Team.Player, playerSpawn.transform.position, false);

            // 9. Herói Inimigo (IA MOBA)
            var enemyHeroGo = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            enemyHeroGo.name = "Enemy_Hero";
            enemyHeroGo.transform.position = enemySpawn.transform.position;
            enemyHeroGo.transform.localScale = new Vector3(1f, 1f, 1f);
            var enemyHeroRenderer = enemyHeroGo.GetComponent<Renderer>();
            var enemyHeroMat = new Material(Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard"));
            enemyHeroMat.color = new Color(1.0f, 0.2f, 0.2f); // Vermelho Herói Inimigo
            enemyHeroRenderer.material = enemyHeroMat;

            Object.DestroyImmediate(enemyHeroGo.GetComponent<Collider>());
            var enemyCharController = enemyHeroGo.AddComponent<CharacterController>();
            enemyCharController.center = new Vector3(0, 0, 0);
            enemyCharController.height = 2f;
            enemyCharController.radius = 0.5f;

            var enemyHeroAgent = enemyHeroGo.AddComponent<HeroAgent>();
            var eHeroHealthBar = CreateWorldHealthBar(enemyHeroGo, 1.5f, new Color(1f, 0.2f, 0.2f));
            SetField(enemyHeroAgent, "healthBar", eHeroHealthBar);
            enemyHeroAgent.Initialize(Team.Enemy, enemySpawn.transform.position, true);

            // 10. Câmera MOBA seguindo o herói
            var mobaCam = camGo.GetComponent<MobaCameraController>();
            if (mobaCam == null) mobaCam = camGo.AddComponent<MobaCameraController>();
            mobaCam.SetTarget(heroGo.transform);

            // 11. EventSystem
            var eventGo = new GameObject("EventSystem");
            eventGo.AddComponent<EventSystem>();
            System.Type inputModule = System.Type.GetType("UnityEngine.InputSystem.UI.InputSystemUIInputModule, Unity.InputSystem");
            if (inputModule != null)
                eventGo.AddComponent(inputModule);
            else
                eventGo.AddComponent<StandaloneInputModule>();

            EditorSceneManager.SaveScene(scene, ArenaScenePath);
        }

        private static GameObject CreateGalinheiro(string name, Team team, Vector3 position, Color color)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.position = position;
            go.transform.localScale = new Vector3(4f, 3f, 3f);

            var mat = new Material(Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard"));
            mat.color = color;
            go.GetComponent<Renderer>().material = mat;

            var galinheiro = go.AddComponent<StructureGalinheiro>();
            SetField(galinheiro, "team", team);
            SetField(galinheiro, "maxHealth", 1000);

            // Adicionar HealthBar em World Space
            var canvasGo = new GameObject("Base_HealthBar");
            canvasGo.transform.SetParent(go.transform);
            canvasGo.transform.localPosition = new Vector3(0, 1.8f, 0);

            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.WorldSpace;
            var rect = canvasGo.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(3f, 0.4f);

            var fillGo = new GameObject("Fill");
            fillGo.transform.SetParent(canvasGo.transform);
            var fillImg = fillGo.AddComponent<Image>();
            fillImg.color = color;
            fillImg.type = Image.Type.Filled;
            fillImg.fillMethod = Image.FillMethod.Horizontal;
            var fillRect = fillGo.GetComponent<RectTransform>();
            fillRect.anchorMin = Vector2.zero;
            fillRect.anchorMax = Vector2.one;
            fillRect.sizeDelta = Vector2.zero;

            var healthBar = canvasGo.AddComponent<WorldHealthBarView>();
            SetField(healthBar, "fillImage", fillImg);
            SetField(galinheiro, "healthBar", healthBar);

            return go;
        }

        private static WorldHealthBarView CreateWorldHealthBar(GameObject parent, float yOffset, Color color)
        {
            var canvasGo = new GameObject("HealthBar_Canvas");
            canvasGo.transform.SetParent(parent.transform);
            canvasGo.transform.localPosition = new Vector3(0, yOffset, 0);

            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.WorldSpace;
            var rect = canvasGo.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(1.8f, 0.3f);

            var bgGo = new GameObject("BG");
            bgGo.transform.SetParent(canvasGo.transform);
            var bgImg = bgGo.AddComponent<Image>();
            bgImg.color = new Color(0.1f, 0.1f, 0.1f, 0.8f);
            var bgRect = bgGo.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.sizeDelta = Vector2.zero;

            var fillGo = new GameObject("Fill");
            fillGo.transform.SetParent(canvasGo.transform);
            var fillImg = fillGo.AddComponent<Image>();
            fillImg.color = color;
            fillImg.type = Image.Type.Filled;
            fillImg.fillMethod = Image.FillMethod.Horizontal;
            var fillRect = fillGo.GetComponent<RectTransform>();
            fillRect.anchorMin = Vector2.zero;
            fillRect.anchorMax = Vector2.one;
            fillRect.sizeDelta = Vector2.zero;

            var healthBar = canvasGo.AddComponent<WorldHealthBarView>();
            SetField(healthBar, "fillImage", fillImg);
            return healthBar;
        }

        private static WaypointPath CreateWaypointPath(string name, LaneType lane, float xOffset, Color gizmoColor)
        {
            var pathGo = new GameObject(name);
            var wp = pathGo.AddComponent<WaypointPath>();
            SetField(wp, "lane", lane);
            SetField(wp, "gizmoColor", gizmoColor);

            var list = new List<Transform>();
            float[] zPoints = { -18f, -10f, 0f, 10f, 18f };
            for (int i = 0; i < zPoints.Length; i++)
            {
                var p = new GameObject($"WP_{i}");
                p.transform.SetParent(pathGo.transform);
                p.transform.position = new Vector3(xOffset, 0.3f, zPoints[i]);
                list.Add(p.transform);
            }

            SetField(wp, "waypoints", list);
            return wp;
        }

        private struct HUDResult
        {
            public GameObject CanvasGo;
            public GameplayHUDView HudView;
            public VirtualJoystickView JoystickView;
        }

        private static HUDResult CreateHUD()
        {
            var canvasGo = new GameObject("Canvas_HUD");
            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = canvasGo.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            canvasGo.AddComponent<GraphicRaycaster>();

            var hudView = canvasGo.AddComponent<GameplayHUDView>();

            // 1. Top Panel (Timer & Base HP)
            var topPanel = new GameObject("TopPanel");
            topPanel.transform.SetParent(canvasGo.transform, false);
            var topRect = topPanel.AddComponent<RectTransform>();
            topRect.anchorMin = new Vector2(0.5f, 1f);
            topRect.anchorMax = new Vector2(0.5f, 1f);
            topRect.pivot = new Vector2(0.5f, 1f);
            topRect.sizeDelta = new Vector2(800, 100);
            topRect.anchoredPosition = new Vector2(0, -20);

            // Timer Text
            var timerGo = new GameObject("TimerText");
            timerGo.transform.SetParent(topPanel.transform, false);
            var timerTxt = timerGo.AddComponent<Text>();
            timerTxt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            timerTxt.fontSize = 42;
            timerTxt.alignment = TextAnchor.MiddleCenter;
            timerTxt.text = "03:00";
            timerTxt.color = Color.white;
            var timerRect = timerGo.GetComponent<RectTransform>();
            timerRect.sizeDelta = new Vector2(200, 60);
            timerRect.anchoredPosition = new Vector2(0, 0);
            SetField(hudView, "timerText", timerTxt);

            // Slider Player HP
            var playerSlider = CreateSlider(topPanel.transform, "PlayerHpSlider", new Vector2(-250, 0), Color.blue);
            var enemySlider = CreateSlider(topPanel.transform, "EnemyHpSlider", new Vector2(250, 0), Color.red);
            SetField(hudView, "playerHpSlider", playerSlider);
            SetField(hudView, "enemyHpSlider", enemySlider);

            // 2. Bottom Right Panel (Botões de Spawn Top, Mid, Bot)
            var spawnPanel = new GameObject("SpawnPanel");
            spawnPanel.transform.SetParent(canvasGo.transform, false);
            var spawnRect = spawnPanel.AddComponent<RectTransform>();
            spawnRect.anchorMin = new Vector2(1f, 0f);
            spawnRect.anchorMax = new Vector2(1f, 0f);
            spawnRect.pivot = new Vector2(1f, 0f);
            spawnRect.sizeDelta = new Vector2(500, 200);
            spawnRect.anchoredPosition = new Vector2(-40, 40);

            var (topBtn, topFill) = CreateSpawnButton(spawnPanel.transform, "Btn_Top", "TOP", new Vector2(-340, 50));
            var (midBtn, midFill) = CreateSpawnButton(spawnPanel.transform, "Btn_Mid", "MID", new Vector2(-230, 50));
            var (botBtn, botFill) = CreateSpawnButton(spawnPanel.transform, "Btn_Bot", "BOT", new Vector2(-120, 50));

            // Botão de Ataque do Herói (Grande botão estilo Mobile Legends)
            var attackBtnGo = new GameObject("Btn_Attack");
            attackBtnGo.transform.SetParent(spawnPanel.transform, false);
            var attackRect = attackBtnGo.AddComponent<RectTransform>();
            attackRect.sizeDelta = new Vector2(110, 110);
            attackRect.anchoredPosition = new Vector2(10, 60);

            var attackImg = attackBtnGo.AddComponent<Image>();
            attackImg.color = new Color(0.9f, 0.25f, 0.15f, 0.95f); // Vermelho fogo de combate
            var attackBtn = attackBtnGo.AddComponent<Button>();

            var attackTxtGo = new GameObject("Text");
            attackTxtGo.transform.SetParent(attackBtnGo.transform, false);
            var attackTxt = attackTxtGo.AddComponent<Text>();
            attackTxt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            attackTxt.fontSize = 26;
            attackTxt.fontStyle = FontStyle.Bold;
            attackTxt.alignment = TextAnchor.MiddleCenter;
            attackTxt.text = "ATACAR";
            attackTxt.color = Color.white;
            var aTxtRect = attackTxtGo.GetComponent<RectTransform>();
            aTxtRect.anchorMin = Vector2.zero;
            aTxtRect.anchorMax = Vector2.one;
            aTxtRect.sizeDelta = Vector2.zero;

            SetField(hudView, "spawnTopButton", topBtn);
            SetField(hudView, "spawnTopCooldownFill", topFill);
            SetField(hudView, "spawnMidButton", midBtn);
            SetField(hudView, "spawnMidCooldownFill", midFill);
            SetField(hudView, "spawnBotButton", botBtn);
            SetField(hudView, "spawnBotCooldownFill", botFill);
            SetField(hudView, "attackButton", attackBtn);

            // 3. Bottom Left Panel (Virtual Joystick)
            var joyGo = new GameObject("VirtualJoystick");
            joyGo.transform.SetParent(canvasGo.transform, false);
            var joyRect = joyGo.AddComponent<RectTransform>();
            joyRect.anchorMin = new Vector2(0f, 0f);
            joyRect.anchorMax = new Vector2(0f, 0f);
            joyRect.pivot = new Vector2(0f, 0f);
            joyRect.sizeDelta = new Vector2(200, 200);
            joyRect.anchoredPosition = new Vector2(60, 60);

            var joyBgImg = joyGo.AddComponent<Image>();
            joyBgImg.color = new Color(0.2f, 0.2f, 0.2f, 0.5f);

            var handleGo = new GameObject("Handle");
            handleGo.transform.SetParent(joyGo.transform, false);
            var handleRect = handleGo.AddComponent<RectTransform>();
            handleRect.sizeDelta = new Vector2(80, 80);
            var handleImg = handleGo.AddComponent<Image>();
            handleImg.color = new Color(0.8f, 0.8f, 0.8f, 0.8f);

            var joystick = joyGo.AddComponent<VirtualJoystickView>();
            SetField(joystick, "background", joyRect);
            SetField(joystick, "handle", handleRect);
            SetField(joystick, "handleRange", 70f);

            return new HUDResult
            {
                CanvasGo = canvasGo,
                HudView = hudView,
                JoystickView = joystick
            };
        }

        private static Slider CreateSlider(Transform parent, string name, Vector2 pos, Color color)
        {
            var sliderGo = new GameObject(name);
            sliderGo.transform.SetParent(parent, false);
            var rect = sliderGo.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(220, 24);
            rect.anchoredPosition = pos;

            var bgGo = new GameObject("Background");
            bgGo.transform.SetParent(sliderGo.transform, false);
            var bgImg = bgGo.AddComponent<Image>();
            bgImg.color = new Color(0.1f, 0.1f, 0.1f, 0.7f);
            var bgRect = bgGo.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.sizeDelta = Vector2.zero;

            var fillGo = new GameObject("Fill");
            fillGo.transform.SetParent(sliderGo.transform, false);
            var fillImg = fillGo.AddComponent<Image>();
            fillImg.color = color;
            var fillRect = fillGo.GetComponent<RectTransform>();
            fillRect.anchorMin = Vector2.zero;
            fillRect.anchorMax = Vector2.one;
            fillRect.sizeDelta = Vector2.zero;

            var slider = sliderGo.AddComponent<Slider>();
            slider.fillRect = fillRect;
            slider.value = 1f;
            return slider;
        }

        private static (Button, Image) CreateSpawnButton(Transform parent, string name, string label, Vector2 pos)
        {
            var btnGo = new GameObject(name);
            btnGo.transform.SetParent(parent, false);
            var rect = btnGo.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(90, 90);
            rect.anchoredPosition = pos;

            var bgImg = btnGo.AddComponent<Image>();
            bgImg.color = new Color(0.2f, 0.4f, 0.6f, 0.9f);
            var btn = btnGo.AddComponent<Button>();

            // Texto
            var txtGo = new GameObject("Text");
            txtGo.transform.SetParent(btnGo.transform, false);
            var txt = txtGo.AddComponent<Text>();
            txt.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            txt.fontSize = 24;
            txt.alignment = TextAnchor.MiddleCenter;
            txt.text = label;
            txt.color = Color.white;
            var txtRect = txtGo.GetComponent<RectTransform>();
            txtRect.anchorMin = Vector2.zero;
            txtRect.anchorMax = Vector2.one;
            txtRect.sizeDelta = Vector2.zero;

            // Overlay de Cooldown
            var cdGo = new GameObject("CooldownOverlay");
            cdGo.transform.SetParent(btnGo.transform, false);
            var cdImg = cdGo.AddComponent<Image>();
            cdImg.color = new Color(0f, 0f, 0f, 0.65f);
            cdImg.type = Image.Type.Filled;
            cdImg.fillMethod = Image.FillMethod.Radial360;
            cdImg.fillAmount = 0f;
            var cdRect = cdGo.GetComponent<RectTransform>();
            cdRect.anchorMin = Vector2.zero;
            cdRect.anchorMax = Vector2.one;
            cdRect.sizeDelta = Vector2.zero;

            return (btn, cdImg);
        }

        private static void UpdateBuildSettings()
        {
            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene("Assets/Scenes/Game/Auth.unity", true),
                new EditorBuildSettingsScene("Assets/Scenes/Game/Play.unity", true),
                new EditorBuildSettingsScene(ArenaScenePath, true),
                new EditorBuildSettingsScene("Assets/Scenes/Game/Vitoria.unity", true),
                new EditorBuildSettingsScene("Assets/Scenes/Game/Derrota.unity", true)
            };
        }

        private static void SetField(object target, string fieldName, object value)
        {
            if (target == null) return;
            var field = target.GetType().GetField(fieldName, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            if (field != null)
            {
                field.SetValue(target, value);
            }
        }
    }
}
