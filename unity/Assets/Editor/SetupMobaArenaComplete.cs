using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using UnityEngine.EventSystems;
using FowlgenWars.Gameplay;
using FowlgenWars.Architecture.Views;
using FowlgenWars.Cinematic;

namespace FowlgenWars.EditorScripts
{
    public static class SetupMobaArenaComplete
    {
        private const string ScenePath = "Assets/Scenes/Game/BattleArena.unity";
        private const string MinionPlayerPrefabPath = "Assets/Prefabs/Minion_Caipira_Player.prefab";
        private const string MinionEnemyPrefabPath = "Assets/Prefabs/Minion_Rodilan_Enemy.prefab";
        private const string ResourcesArchPath = "Assets/Resources/Architecture";

        [InitializeOnLoadMethod]
        public static void AutoRunOnEditorLoad()
        {
            if (Application.isBatchMode) return;
            EditorApplication.delayCall += () =>
            {
                if (Application.isBatchMode) return;
                if (EditorApplication.isPlaying)
                {
                    Debug.Log("[Setup MOBA] Saindo do Play Mode para consolidar configuração da Arena...");
                    EditorApplication.isPlaying = false;
                    return;
                }
                Run();
            };
        }

        [MenuItem("Fowlgen Wars/Configurar MOBA Arena Completa (Todas Etapas)")]
        public static void Run()
        {
            if (Application.isBatchMode) return;
            Debug.Log("[Setup MOBA] 1. Abrindo cena BattleArena...");
            Scene scene = SceneManager.GetActiveScene();
            if (scene.name != "BattleArena")
            {
                scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            }
            SceneManager.SetActiveScene(scene);

            Debug.Log("[Setup MOBA] 2. Carregando ScriptableObjects do MVP...");
            MatchConfigSO matchConfig = AssetDatabase.LoadAssetAtPath<MatchConfigSO>($"{ResourcesArchPath}/MatchConfig.asset");
            MatchRuntimeStateSO runtimeState = AssetDatabase.LoadAssetAtPath<MatchRuntimeStateSO>($"{ResourcesArchPath}/MatchRuntimeState.asset");
            MinionDataSO minionData = AssetDatabase.LoadAssetAtPath<MinionDataSO>($"{ResourcesArchPath}/MinionData_Default.asset");
            FowlgenBalanceConfigSO balanceConfig = AssetDatabase.LoadAssetAtPath<FowlgenBalanceConfigSO>($"{ResourcesArchPath}/FowlgenBalanceConfig.asset");
            if (balanceConfig == null)
            {
                balanceConfig = ScriptableObject.CreateInstance<FowlgenBalanceConfigSO>();
                AssetDatabase.CreateAsset(balanceConfig, $"{ResourcesArchPath}/FowlgenBalanceConfig.asset");
                AssetDatabase.SaveAssets();
                Debug.Log("[Setup MOBA] Criado FowlgenBalanceConfig.asset (Fase1 ficha §8.1) — tuning 5-10% exposto no Inspector.");
            }

            Debug.Log("[Setup MOBA] 3. Configurando Prefabs dos 2 Minions (Caipira para Jogador e Rodilan para Inimigo)...");
            GameObject caipiraPrefab = CreateOrUpdateSpecificMinionPrefab(
                MinionPlayerPrefabPath,
                "Minion_Caipira_Player",
                "Assets/TripoModels/Minion-Calinha-Caipira-Atirador/Minion-Calinha-Caipira-Atirador.fbx",
                "Assets/TripoModels/Minion-Calinha-Caipira-Atirador/Materials/Minion-Calinha-Caipira-Atirador.mat",
                Team.Player,
                new Color(0.2f, 0.85f, 0.4f),
                minionData
            );

            GameObject rodilanPrefab = CreateOrUpdateSpecificMinionPrefab(
                MinionEnemyPrefabPath,
                "Minion_Rodilan_Enemy",
                "Assets/TripoModels/Minion-Galinha-Rodilan-Atirador/Minion-Galinha-Rodilan-Atirador.fbx",
                "Assets/TripoModels/Minion-Galinha-Rodilan-Atirador/Materials/Minion-Galinha-Rodilan-Atirador.mat",
                Team.Enemy,
                new Color(0.95f, 0.25f, 0.35f),
                minionData
            );

            if (minionData != null)
            {
                SerializedObject soData = new SerializedObject(minionData);
                soData.FindProperty("prefab").objectReferenceValue = caipiraPrefab;
                soData.ApplyModifiedProperties();
                EditorUtility.SetDirty(minionData);
            }

            Debug.Log("[Setup MOBA] 4. Localizando Milo na cena...");
            GameObject miloObj = null;
            foreach (var root in scene.GetRootGameObjects())
            {
                if (root.name == "Milo") { miloObj = root; break; }
            }
            if (miloObj == null) miloObj = GameObject.Find("Milo");

            if (miloObj == null)
            {
                Debug.LogError("[Setup MOBA] ERRO: GameObject Milo não encontrado na cena!");
                return;
            }

            try { miloObj.tag = "Player"; } catch { }

            CharacterController miloCC = miloObj.GetComponent<CharacterController>();
            if (miloCC == null) miloCC = miloObj.AddComponent<CharacterController>();
            miloCC.center = new Vector3(0, 1.0f, 0);
            miloCC.radius = 0.5f;
            miloCC.height = 2.0f;
            miloCC.minMoveDistance = 0f;

            HeroAgent miloHero = miloObj.GetComponent<HeroAgent>();
            if (miloHero == null) miloHero = miloObj.AddComponent<HeroAgent>();
            SerializedObject soMiloHero = new SerializedObject(miloHero);
            soMiloHero.FindProperty("heroName").stringValue = "Milo";
            soMiloHero.FindProperty("team").enumValueIndex = 0; // Team.Player
            soMiloHero.FindProperty("isAI").boolValue = false;
            soMiloHero.FindProperty("maxHealth").intValue = 1000;
            soMiloHero.FindProperty("attackDamage").intValue = 55;
            soMiloHero.FindProperty("attackRange").floatValue = 4.0f;
            if (soMiloHero.FindProperty("balanceConfig") != null)
                soMiloHero.FindProperty("balanceConfig").objectReferenceValue = balanceConfig;
            soMiloHero.ApplyModifiedProperties();

            MobilePlayerController miloMove = miloObj.GetComponent<MobilePlayerController>();
            if (miloMove == null) miloMove = miloObj.AddComponent<MobilePlayerController>();
            miloMove.MoveSpeed = 6.0f;

            MobaSkillsController miloSkills = miloObj.GetComponent<MobaSkillsController>();
            if (miloSkills == null) miloSkills = miloObj.AddComponent<MobaSkillsController>();

            // 3. Configurar Axel (Bot Inimigo - Preservado)
            GameObject axelObj = GameObject.Find("Axel");
            if (axelObj != null)
            {
                CharacterController axelCC = axelObj.GetComponent<CharacterController>();
                if (axelCC == null) axelCC = axelObj.AddComponent<CharacterController>();
                axelCC.center = new Vector3(0, 1.0f, 0);
                axelCC.radius = 0.5f;
                axelCC.height = 2.0f;
                axelCC.minMoveDistance = 0f;

                HeroAgent axelHero = axelObj.GetComponent<HeroAgent>();
                if (axelHero == null) axelHero = axelObj.AddComponent<HeroAgent>();
                SerializedObject soAxelHero = new SerializedObject(axelHero);
                soAxelHero.FindProperty("heroName").stringValue = "Axel (Bot)";
                soAxelHero.FindProperty("team").enumValueIndex = 1; // Team.Enemy
                soAxelHero.FindProperty("isAI").boolValue = true;
                soAxelHero.FindProperty("maxHealth").intValue = 1200;
                soAxelHero.FindProperty("attackDamage").intValue = 40;
                soAxelHero.FindProperty("attackRange").floatValue = 3.5f;
                if (soAxelHero.FindProperty("balanceConfig") != null)
                    soAxelHero.FindProperty("balanceConfig").objectReferenceValue = balanceConfig;
                soAxelHero.ApplyModifiedProperties();
            }

            // 4. Configurar Câmera MOBA Horizontal (Left-to-Right - Preservado)
            Camera mainCam = Camera.main;
            if (mainCam != null)
            {
                mainCam.transform.position = new Vector3(-22f, 28.5f, -1.5f);
                mainCam.transform.rotation = Quaternion.Euler(40.8f, 88.2f, 0f);

                MobaCameraController camCtrl = mainCam.GetComponent<MobaCameraController>();
                if (camCtrl == null) camCtrl = mainCam.gameObject.AddComponent<MobaCameraController>();
                camCtrl.SetTarget(miloObj.transform);
                SerializedObject soCam = new SerializedObject(camCtrl);
                soCam.FindProperty("target").objectReferenceValue = miloObj.transform;
                soCam.FindProperty("horizontalOffset").vector3Value = new Vector3(-22f, 26f, 0f);
                soCam.FindProperty("cameraPitch").floatValue = 40.8f;
                soCam.FindProperty("cameraYaw").floatValue = 88.2f;
                soCam.FindProperty("smoothSpeed").floatValue = 6f;
                soCam.FindProperty("followTarget").boolValue = true;
                soCam.ApplyModifiedProperties();
                camCtrl.ApplyRotation();
            }

            // 5. Garantir EventSystem compatível com Input System (Both: 2)
            var existingES = UnityEngine.Object.FindAnyObjectByType<EventSystem>();
            if (existingES == null)
            {
                GameObject esObj = new GameObject("EventSystem");
                esObj.AddComponent<EventSystem>();
#if ENABLE_INPUT_SYSTEM
                var psb = esObj.GetComponent<StandaloneInputModule>();
                if (psb != null) UnityEngine.Object.DestroyImmediate(psb);
                var uiModuleType = System.Type.GetType("UnityEngine.InputSystem.UI.InputSystemUIInputModule, Unity.InputSystem");
                if (uiModuleType != null) esObj.AddComponent(uiModuleType);
                else esObj.AddComponent<StandaloneInputModule>();
#else
                esObj.AddComponent<StandaloneInputModule>();
#endif
            }
            else
            {
#if ENABLE_INPUT_SYSTEM
                if (existingES.GetComponent<StandaloneInputModule>() != null && existingES.GetComponent(System.Type.GetType("UnityEngine.InputSystem.UI.InputSystemUIInputModule, Unity.InputSystem")) == null)
                {
                    UnityEngine.Object.DestroyImmediate(existingES.GetComponent<StandaloneInputModule>());
                    var uiModuleType2 = System.Type.GetType("UnityEngine.InputSystem.UI.InputSystemUIInputModule, Unity.InputSystem");
                    if (uiModuleType2 != null) existingES.gameObject.AddComponent(uiModuleType2);
                }
#endif
            }

            // 6. Configurar Canvas do HUD (Controles Mobile + Duelo + Timer)
            GameObject oldCanvas = GameObject.Find("Canvas_MOBA_HUD");
            if (oldCanvas != null) UnityEngine.Object.DestroyImmediate(oldCanvas);

            GameObject canvasObj = new GameObject("Canvas_MOBA_HUD");
            Canvas canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 100;

            CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);
            scaler.matchWidthOrHeight = 0.5f;

            canvasObj.AddComponent<GraphicRaycaster>();

            Sprite circleSprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Joystick Pack/Sprites/Handles/Handle_Plain.png");
            Sprite outlineSprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Joystick Pack/Sprites/Handles/Handle_Outline.png");
            Sprite ringSprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Joystick Pack/Sprites/All Axis Backgrounds/AllAxis_Outline.png");
            Font defaultFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            if (defaultFont == null) defaultFont = Resources.GetBuiltinResource<Font>("Arial.ttf");

            // 6.1 Lado Esquerdo: Joystick Pack (Variable Joystick)
            GameObject joystickPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Joystick Pack/Prefabs/Variable Joystick.prefab");
            VariableJoystick variableJoystick = null;
            if (joystickPrefab != null)
            {
                GameObject vjObj = (GameObject)PrefabUtility.InstantiatePrefab(joystickPrefab, canvasObj.transform);
                vjObj.name = "Variable Joystick";
                RectTransform vjRect = vjObj.GetComponent<RectTransform>();
                vjRect.anchorMin = new Vector2(0, 0);
                vjRect.anchorMax = new Vector2(0.5f, 0.85f);
                vjRect.pivot = new Vector2(0, 0);
                vjRect.anchoredPosition = Vector2.zero;
                vjRect.sizeDelta = Vector2.zero;

                RectTransform bgRect = vjObj.transform.Find("Background")?.GetComponent<RectTransform>();
                if (bgRect != null)
                {
                    bgRect.anchorMin = new Vector2(0, 0);
                    bgRect.anchorMax = new Vector2(0, 0);
                    bgRect.pivot = new Vector2(0.5f, 0.5f);
                    bgRect.anchoredPosition = new Vector2(220, 220);
                    bgRect.sizeDelta = new Vector2(240, 240);
                }

                variableJoystick = vjObj.GetComponent<VariableJoystick>();
                if (variableJoystick != null)
                {
                    variableJoystick.SetMode(JoystickType.Floating);
                }

                miloMove.BindJoystickPack(variableJoystick);
                miloMove.SetJoystickMode(MobilePlayerController.JoystickMode.Floating);
            }

            // 6.2 Botão Alternador de Modo do Joystick
            GameObject modeBtnObj = CreateButton(canvasObj.transform, "Btn_JoystickMode",
                new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0),
                new Vector2(105, 380), new Vector2(230, 48),
                new Color(0.08f, 0.12f, 0.20f, 0.90f), outlineSprite, new Color(0.22f, 0.55f, 0.95f, 1f));

            Text modeText = CreateText(modeBtnObj.transform, "Txt_Mode", "MODO: FLOATING", 16, FontStyle.Bold, Color.white, defaultFont);
            modeText.alignment = TextAnchor.MiddleCenter;
            StretchFull(modeText.rectTransform);

            Button modeBtn = modeBtnObj.GetComponent<Button>();
            JoystickModeSwitcher modeSwitcher = modeBtnObj.AddComponent<JoystickModeSwitcher>();
            modeSwitcher.Initialize(miloMove, modeBtn, modeText);

            // 6.3 Lado Direito: Cluster de Poderes LoL / Wild Rift
            GameObject skillsCluster = new GameObject("SkillsCluster");
            skillsCluster.transform.SetParent(canvasObj.transform, false);
            RectTransform clusterRect = skillsCluster.AddComponent<RectTransform>();
            clusterRect.anchorMin = new Vector2(1, 0);
            clusterRect.anchorMax = new Vector2(1, 0);
            clusterRect.pivot = new Vector2(1, 0);
            clusterRect.anchoredPosition = Vector2.zero;
            clusterRect.sizeDelta = new Vector2(500, 450);

            Button btnAttack = CreateMobaSkillButton(skillsCluster.transform, "Btn_Attack",
                new Vector2(-135, 135), 136,
                new Color(0.18f, 0.12f, 0.12f, 0.95f),
                new Color(0.95f, 0.65f, 0.15f, 1f),
                circleSprite, ringSprite, defaultFont,
                "ATAQUE", "ESPAÇO", 18,
                out Image fillAtk, out Text txtAtk);

            Button btnQ = CreateMobaSkillButton(skillsCluster.transform, "Btn_SkillT",
                new Vector2(-305, 80), 92,
                new Color(0.08f, 0.16f, 0.28f, 0.95f),
                new Color(0.15f, 0.70f, 0.95f, 1f),
                circleSprite, ringSprite, defaultFont,
                "DASH", "T", 15,
                out Image fillQ, out Text txtQ);

            Button btnW = CreateMobaSkillButton(skillsCluster.transform, "Btn_SkillG",
                new Vector2(-295, 195), 92,
                new Color(0.08f, 0.24f, 0.18f, 0.95f),
                new Color(0.20f, 0.85f, 0.55f, 1f),
                circleSprite, ringSprite, defaultFont,
                "ESCUDO", "G", 15,
                out Image fillW, out Text txtW);

            Button btnE = CreateMobaSkillButton(skillsCluster.transform, "Btn_SkillY",
                new Vector2(-210, 285), 92,
                new Color(0.28f, 0.16f, 0.08f, 0.95f),
                new Color(0.95f, 0.55f, 0.15f, 1f),
                circleSprite, ringSprite, defaultFont,
                "TIRO", "Y", 15,
                out Image fillE, out Text txtE);

            Button btnR = CreateMobaSkillButton(skillsCluster.transform, "Btn_SkillH",
                new Vector2(-95, 320), 106,
                new Color(0.25f, 0.10f, 0.30f, 0.95f),
                new Color(0.98f, 0.85f, 0.25f, 1f),
                circleSprite, ringSprite, defaultFont,
                "ULTIMATE", "H", 16,
                out Image fillR, out Text txtR);

            // Toggle AUTO vertical ao lado direito do ATAQUE (Toggle nativo, não Button)
            var autoToggle = CreateAutoAttackToggleVertical(skillsCluster.transform, defaultFont, outlineSprite, circleSprite,
                anchorForAttack: new Vector2(-135, 135), toggleSize: new Vector2(56, 92));
            miloSkills.BindUI(btnAttack, btnQ, fillQ, txtQ, btnW, fillW, txtW, btnE, fillE, txtE, btnR, fillR, txtR);
            miloSkills.BindAutoToggle(autoToggle.toggle, autoToggle.bg, autoToggle.lbl, autoToggle.handleRect);
            // Fix raycast do botão ATAQUE (label/ring não devem bloquear clique)
            foreach (var img in btnAttack.GetComponentsInChildren<Image>(true))
                if (img.gameObject != btnAttack.gameObject) img.raycastTarget = false;
            foreach (var t in btnAttack.GetComponentsInChildren<Text>(true)) t.raycastTarget = false;
            var baseAtkImg = btnAttack.GetComponent<Image>();
            if (baseAtkImg != null) baseAtkImg.raycastTarget = true;

            SerializedObject soSkills = new SerializedObject(miloSkills);
            soSkills.FindProperty("attackButton").objectReferenceValue = btnAttack;
            soSkills.FindProperty("skillQButton").objectReferenceValue = btnQ;
            soSkills.FindProperty("qCooldownFill").objectReferenceValue = fillQ;
            soSkills.FindProperty("qCooldownText").objectReferenceValue = txtQ;
            soSkills.FindProperty("skillWButton").objectReferenceValue = btnW;
            soSkills.FindProperty("wCooldownFill").objectReferenceValue = fillW;
            soSkills.FindProperty("wCooldownText").objectReferenceValue = txtW;
            soSkills.FindProperty("skillEButton").objectReferenceValue = btnE;
            soSkills.FindProperty("eCooldownFill").objectReferenceValue = fillE;
            soSkills.FindProperty("eCooldownText").objectReferenceValue = txtE;
            soSkills.FindProperty("skillRButton").objectReferenceValue = btnR;
            soSkills.FindProperty("rCooldownFill").objectReferenceValue = fillR;
            soSkills.FindProperty("rCooldownText").objectReferenceValue = txtR;
            soSkills.FindProperty("autoAttackToggle").objectReferenceValue = autoToggle.toggle;
            soSkills.FindProperty("autoAttackToggleBg").objectReferenceValue = autoToggle.bg;
            soSkills.FindProperty("autoAttackToggleLabel").objectReferenceValue = autoToggle.lbl;
            soSkills.FindProperty("autoAttackHandleRect").objectReferenceValue = autoToggle.handleRect;
            soSkills.ApplyModifiedProperties();

            // 6.4 Painel Superior: Barras de Vida dos Campeões + Cronômetro de 3 Minutos + Status das Bases
            CreateTopHUDComplete(canvasObj.transform, defaultFont, miloHero, axelObj != null ? axelObj.GetComponent<HeroAgent>() : null, runtimeState);

            // 6.5 Feedback de Combate, Menu de Pausa e Contagem de Início (EAP 28, 32, 37)
            SetupHUDFeedbackAndControls(canvasObj.transform, defaultFont, outlineSprite);

            // 7. Configurar Estruturas de Base (Galinheiro Aliado e Inimigo)
            GameObject baseAmarelaObj = GameObject.Find("Base-Amarela");
            GameObject baseRoxaObj = GameObject.Find("Base-Roxa-Inimiga");

            SetupBaseGalinheiro(baseAmarelaObj, Team.Player, runtimeState);
            SetupBaseGalinheiro(baseRoxaObj, Team.Enemy, runtimeState);

            // 8. Configurar Rotas (Waypoints das 3 Pontes: Top, Mid, Bot)
            // Bridge_Right (X = 9.39) -> Top Lane
            Vector3[] topPoints = new Vector3[]
            {
                new Vector3(4.0f, 10.5f, 17.5f),
                new Vector3(9.39f, 10.5f, 9.5f),
                new Vector3(9.39f, 9.68f, 0.0f),
                new Vector3(9.39f, 10.5f, -9.5f),
                new Vector3(4.0f, 10.5f, -17.5f)
            };
            WaypointPath pathTop = SetupPath("Path_Top", LaneType.Top, Color.cyan, topPoints);

            // Bridge_Center (X = -0.15) -> Mid Lane
            Vector3[] midPoints = new Vector3[]
            {
                new Vector3(0.15f, 10.5f, 17.5f),
                new Vector3(-0.15f, 10.5f, 8.0f),
                new Vector3(-0.15f, 9.68f, 0.0f),
                new Vector3(-0.15f, 10.5f, -8.0f),
                new Vector3(-0.15f, 10.5f, -17.5f)
            };
            WaypointPath pathMid = SetupPath("Path_Mid", LaneType.Mid, Color.yellow, midPoints);

            // Bridge_Left (X = -9.45) -> Bot Lane
            Vector3[] botPoints = new Vector3[]
            {
                new Vector3(-4.0f, 10.5f, 17.5f),
                new Vector3(-9.45f, 10.5f, 9.5f),
                new Vector3(-9.45f, 9.68f, 0.0f),
                new Vector3(-9.45f, 10.5f, -9.5f),
                new Vector3(-4.0f, 10.5f, -17.5f)
            };
            WaypointPath pathBot = SetupPath("Path_Bot", LaneType.Bot, Color.magenta, botPoints);

            // 9. Configurar Pontos de Spawn
            GameObject playerSpawn = GameObject.Find("SpawnPoint_Player");
            if (playerSpawn == null) playerSpawn = new GameObject("SpawnPoint_Player");
            playerSpawn.transform.position = new Vector3(0.32f, 10.5f, 17.5f);

            GameObject enemySpawn = GameObject.Find("SpawnPoint_Enemy");
            if (enemySpawn == null) enemySpawn = new GameObject("SpawnPoint_Enemy");
            enemySpawn.transform.position = new Vector3(-0.10f, 10.5f, -17.5f);

            // 10. Configurar GameMatchManager (Loop de 3 Minutos e Ondas nas 3 Rotas)
            GameObject gmObj = GameObject.Find("GameMatchManager");
            if (gmObj == null) gmObj = new GameObject("GameMatchManager");

            GameMatchManager gmm = gmObj.GetComponent<GameMatchManager>();
            if (gmm == null) gmm = gmObj.AddComponent<GameMatchManager>();

            // MinionData lê BalanceConfig via override (ficha §8.1)
            if (minionData != null)
            {
                var soData = new SerializedObject(minionData);
                if (soData.FindProperty("balanceOverride") != null)
                {
                    soData.FindProperty("balanceOverride").objectReferenceValue = balanceConfig;
                    soData.ApplyModifiedProperties();
                }
            }
            SerializedObject soGmm = new SerializedObject(gmm);
            soGmm.FindProperty("matchConfig").objectReferenceValue = matchConfig;
            if (soGmm.FindProperty("balanceConfig") != null)
                soGmm.FindProperty("balanceConfig").objectReferenceValue = balanceConfig;
            soGmm.FindProperty("runtimeState").objectReferenceValue = runtimeState;
            soGmm.FindProperty("playerMinionPrefab").objectReferenceValue = caipiraPrefab;
            soGmm.FindProperty("enemyMinionPrefab").objectReferenceValue = rodilanPrefab;
            if (baseAmarelaObj != null)
                soGmm.FindProperty("playerGalinheiro").objectReferenceValue = baseAmarelaObj.GetComponent<StructureGalinheiro>();
            if (baseRoxaObj != null)
                soGmm.FindProperty("enemyGalinheiro").objectReferenceValue = baseRoxaObj.GetComponent<StructureGalinheiro>();
            soGmm.FindProperty("topPath").objectReferenceValue = pathTop;
            soGmm.FindProperty("midPath").objectReferenceValue = pathMid;
            soGmm.FindProperty("botPath").objectReferenceValue = pathBot;
            soGmm.FindProperty("playerSpawnPoint").objectReferenceValue = playerSpawn.transform;
            soGmm.FindProperty("enemySpawnPoint").objectReferenceValue = enemySpawn.transform;
            // Wiring da contagem 3,2,1,LUTA! — GameMatchManager espera OnCountdownFinished antes de contar tempo/spawnar
            var pendingIntro = canvasObj.transform.Find("CountdownIntroOverlay")?.GetComponent<FowlgenWars.Gameplay.UI.MatchCountdownIntro>();
            if (pendingIntro == null) pendingIntro = UnityEngine.Object.FindAnyObjectByType<FowlgenWars.Gameplay.UI.MatchCountdownIntro>();
            soGmm.FindProperty("countdownIntro").objectReferenceValue = pendingIntro != null ? pendingIntro : null;
            soGmm.ApplyModifiedProperties();

            // 10b. Balance Fase1: garantir collector em cena (§8.2 métricas)
            EnsureBalanceMetrics(runtimeState, balanceConfig);

            // 10c. Física anti-queda: paredes invisíveis ao redor do cenário
            EnsureArenaBoundary();

            // 11. Configurar ArenaCinematicDirector (Para Pitch Video / Trailer)
            GameObject directorObj = GameObject.Find("ArenaCinematicDirector");
            if (directorObj == null)
            {
                directorObj = new GameObject("ArenaCinematicDirector");
                ArenaCinematicDirector director = directorObj.AddComponent<ArenaCinematicDirector>();
                if (mainCam != null)
                {
                    SerializedObject soDir = new SerializedObject(director);
                    soDir.FindProperty("_targetCamera").objectReferenceValue = mainCam;
                    soDir.ApplyModifiedProperties();
                }
                director.BuildDefaultArenaShots();
            }

            // 12. Fase 8: Gerar e Vincular Animator Controllers para Milo, Axel e Minions
            CreateMobaAnimatorControllers.GenerateAllControllers();

            // 13. Garantir BuildSettings com Arena_Clean
            EnsureSceneInBuildSettings(ScenePath);

            // 14. Fase 9: Travar PlayerSettings em Landscape (AutoRotation apenas horizontal)
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.AutoRotation;
            PlayerSettings.allowedAutorotateToPortrait = false;
            PlayerSettings.allowedAutorotateToPortraitUpsideDown = false;
            PlayerSettings.allowedAutorotateToLandscapeLeft = true;
            PlayerSettings.allowedAutorotateToLandscapeRight = true;

            // 13. Marcar Cena e Salvar
            EditorUtility.SetDirty(miloObj);
            if (axelObj != null) EditorUtility.SetDirty(axelObj);
            if (baseAmarelaObj != null) EditorUtility.SetDirty(baseAmarelaObj);
            if (baseRoxaObj != null) EditorUtility.SetDirty(baseRoxaObj);
            EditorUtility.SetDirty(canvasObj);
            EditorUtility.SetDirty(gmObj);

            if (!EditorApplication.isPlaying)
            {
                EditorSceneManager.MarkSceneDirty(scene);
                bool saved = EditorSceneManager.SaveScene(scene, ScenePath);
                AssetDatabase.SaveAssets();
                Debug.Log($"[Setup MOBA] 14. Cena salva com sucesso no disco ({ScenePath}): {saved}!");
            }
            else
            {
                Debug.LogWarning("[Setup MOBA] AVISO: Não salvou porque está em Play Mode!");
            }

            Debug.Log("[Setup MOBA Completo] Sucesso absoluto! Milo, Axel, Joystick Pack, Poderes LoL, Minions 3D, Bases, 3 Rotas, GameMatchManager e Cinemática perfeitamente integrados em BattleArena!");
        }

        private static GameObject CreateOrUpdateSpecificMinionPrefab(
            string prefabPath,
            string prefabName,
            string fbxPath,
            string matPath,
            Team team,
            Color healthColor,
            MinionDataSO defaultData)
        {
            Material minionMat = AssetDatabase.LoadAssetAtPath<Material>(matPath);
            GameObject existing = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            if (existing != null)
            {
                if (minionMat != null)
                {
                    GameObject prefabContents = PrefabUtility.LoadPrefabContents(prefabPath);
                    foreach (var rend in prefabContents.GetComponentsInChildren<Renderer>(true))
                    {
                        rend.sharedMaterial = minionMat;
                    }
                    PrefabUtility.SaveAsPrefabAsset(prefabContents, prefabPath);
                    PrefabUtility.UnloadPrefabContents(prefabContents);
                }
                return existing;
            }

            GameObject root = new GameObject(prefabName);
            CapsuleCollider col = root.AddComponent<CapsuleCollider>();
            col.center = new Vector3(0, 0.6f, 0);
            col.radius = 0.45f;
            col.height = 1.2f;

            Rigidbody rb = root.AddComponent<Rigidbody>();
            rb.isKinematic = true;

            MinionAgent agent = root.AddComponent<MinionAgent>();

            // Instanciar Modelo 3D FBX
            GameObject fbx = AssetDatabase.LoadAssetAtPath<GameObject>(fbxPath);
            GameObject modelObj = null;
            if (fbx != null)
            {
                modelObj = (GameObject)PrefabUtility.InstantiatePrefab(fbx, root.transform);
                modelObj.name = team == Team.Player ? "Model_Caipira" : "Model_Rodilan";
                modelObj.transform.localPosition = Vector3.zero;
                modelObj.transform.localRotation = Quaternion.Euler(0, 180, 0);
                modelObj.transform.localScale = new Vector3(0.7f, 0.7f, 0.7f);

                if (minionMat != null)
                {
                    foreach (var rend in modelObj.GetComponentsInChildren<Renderer>(true))
                    {
                        rend.sharedMaterial = minionMat;
                    }
                }
            }

            // HealthBar World Space
            GameObject canvasGo = new GameObject("HealthBar_Canvas");
            canvasGo.transform.SetParent(root.transform, false);
            canvasGo.transform.localPosition = new Vector3(0, 1.4f, 0);
            Canvas canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.WorldSpace;
            RectTransform rect = canvasGo.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(1.2f, 0.2f);

            GameObject bgGo = new GameObject("BG");
            bgGo.transform.SetParent(canvasGo.transform, false);
            Image bgImg = bgGo.AddComponent<Image>();
            bgImg.color = new Color(0.1f, 0.1f, 0.1f, 0.85f);
            RectTransform bgRect = bgGo.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.sizeDelta = Vector2.zero;

            GameObject fillGo = new GameObject("Fill");
            fillGo.transform.SetParent(canvasGo.transform, false);
            Image fillImg = fillGo.AddComponent<Image>();
            fillImg.color = healthColor;
            fillImg.type = Image.Type.Filled;
            fillImg.fillMethod = Image.FillMethod.Horizontal;
            RectTransform fillRect = fillGo.GetComponent<RectTransform>();
            fillRect.anchorMin = Vector2.zero;
            fillRect.anchorMax = Vector2.one;
            fillRect.sizeDelta = Vector2.zero;

            WorldHealthBarView healthBarView = canvasGo.AddComponent<WorldHealthBarView>();
            SerializedObject soBar = new SerializedObject(healthBarView);
            soBar.FindProperty("fillImage").objectReferenceValue = fillImg;
            soBar.FindProperty("canvas").objectReferenceValue = canvas;
            soBar.ApplyModifiedProperties();

            SerializedObject soAgent = new SerializedObject(agent);
            soAgent.FindProperty("data").objectReferenceValue = defaultData;
            soAgent.FindProperty("team").enumValueIndex = (int)team;
            soAgent.FindProperty("healthBar").objectReferenceValue = healthBarView;
            if (team == Team.Player)
                soAgent.FindProperty("playerModel").objectReferenceValue = modelObj;
            else
                soAgent.FindProperty("enemyModel").objectReferenceValue = modelObj;
            soAgent.ApplyModifiedProperties();

            GameObject savedPrefab = PrefabUtility.SaveAsPrefabAsset(root, prefabPath);
            UnityEngine.Object.DestroyImmediate(root);

            return savedPrefab;
        }


        private static void SetupBaseGalinheiro(GameObject baseObj, Team team, MatchRuntimeStateSO runtimeState)
        {
            if (baseObj == null) return;

            BoxCollider col = baseObj.GetComponent<BoxCollider>();
            if (col == null) col = baseObj.AddComponent<BoxCollider>();
            col.center = new Vector3(0, 2.5f, 0);
            col.size = new Vector3(7.5f, 5.0f, 7.5f);

            StructureGalinheiro galinheiro = baseObj.GetComponent<StructureGalinheiro>();
            if (galinheiro == null) galinheiro = baseObj.AddComponent<StructureGalinheiro>();

            Transform existingBar = baseObj.transform.Find("Base_HealthBar");
            GameObject barGo;
            if (existingBar != null)
            {
                barGo = existingBar.gameObject;
            }
            else
            {
                barGo = new GameObject("Base_HealthBar");
                barGo.transform.SetParent(baseObj.transform, false);
                barGo.transform.localPosition = new Vector3(0, 6.0f, 0);

                Canvas c = barGo.AddComponent<Canvas>();
                c.renderMode = RenderMode.WorldSpace;
                RectTransform rt = barGo.GetComponent<RectTransform>();
                rt.sizeDelta = new Vector2(4.0f, 0.5f);

                GameObject bg = new GameObject("BG");
                bg.transform.SetParent(barGo.transform, false);
                Image bgImg = bg.AddComponent<Image>();
                bgImg.color = new Color(0.1f, 0.1f, 0.1f, 0.85f);
                RectTransform bgRt = bg.GetComponent<RectTransform>();
                bgRt.anchorMin = Vector2.zero;
                bgRt.anchorMax = Vector2.one;
                bgRt.sizeDelta = Vector2.zero;

                GameObject fill = new GameObject("Fill");
                fill.transform.SetParent(barGo.transform, false);
                Image fillImg = fill.AddComponent<Image>();
                fillImg.color = team == Team.Player ? new Color(0.2f, 0.8f, 0.4f) : new Color(0.9f, 0.2f, 0.3f);
                fillImg.type = Image.Type.Filled;
                fillImg.fillMethod = Image.FillMethod.Horizontal;
                RectTransform fillRt = fill.GetComponent<RectTransform>();
                fillRt.anchorMin = Vector2.zero;
                fillRt.anchorMax = Vector2.one;
                fillRt.sizeDelta = Vector2.zero;

                WorldHealthBarView barView = barGo.AddComponent<WorldHealthBarView>();
                SerializedObject soBar = new SerializedObject(barView);
                soBar.FindProperty("fillImage").objectReferenceValue = fillImg;
                soBar.FindProperty("canvas").objectReferenceValue = c;
                soBar.ApplyModifiedProperties();
            }

            WorldHealthBarView healthBar = barGo.GetComponent<WorldHealthBarView>();

            SerializedObject soGal = new SerializedObject(galinheiro);
            soGal.FindProperty("team").enumValueIndex = (int)team;
            soGal.FindProperty("maxHealth").intValue = 1000;
            soGal.FindProperty("runtimeState").objectReferenceValue = runtimeState;
            soGal.FindProperty("healthBar").objectReferenceValue = healthBar;
            soGal.ApplyModifiedProperties();

            EditorUtility.SetDirty(baseObj);
        }

        private static WaypointPath SetupPath(string name, LaneType lane, Color color, Vector3[] points)
        {
            GameObject pathObj = GameObject.Find(name);
            if (pathObj == null) pathObj = new GameObject(name);

            WaypointPath wpPath = pathObj.GetComponent<WaypointPath>();
            if (wpPath == null) wpPath = pathObj.AddComponent<WaypointPath>();

            List<Transform> list = new List<Transform>();
            for (int i = 0; i < points.Length; i++)
            {
                string wpName = $"WP_{i}";
                Transform t = pathObj.transform.Find(wpName);
                if (t == null)
                {
                    GameObject wpGo = new GameObject(wpName);
                    wpGo.transform.SetParent(pathObj.transform, false);
                    t = wpGo.transform;
                }
                t.position = points[i];
                list.Add(t);
            }

            SerializedObject so = new SerializedObject(wpPath);
            so.FindProperty("lane").enumValueIndex = (int)lane;
            so.FindProperty("gizmoColor").colorValue = color;

            SerializedProperty waypointsProp = so.FindProperty("waypoints");
            waypointsProp.ClearArray();
            for (int i = 0; i < list.Count; i++)
            {
                waypointsProp.InsertArrayElementAtIndex(i);
                waypointsProp.GetArrayElementAtIndex(i).objectReferenceValue = list[i];
            }
            so.ApplyModifiedProperties();

            EditorUtility.SetDirty(pathObj);
            return wpPath;
        }

        private static void CreateTopHUDComplete(Transform parent, Font font, HeroAgent playerHero, HeroAgent enemyHero, MatchRuntimeStateSO runtimeState)
        {
            GameObject hudPanel = new GameObject("TopHealthHUD");
            hudPanel.transform.SetParent(parent, false);
            RectTransform pRect = hudPanel.AddComponent<RectTransform>();
            pRect.anchorMin = new Vector2(0, 1);
            pRect.anchorMax = new Vector2(1, 1);
            pRect.pivot = new Vector2(0.5f, 1);
            pRect.anchoredPosition = new Vector2(0, -15);
            pRect.sizeDelta = new Vector2(-60, 64);

            // Barra Milo (Player - Esquerda)
            GameObject playerBar = CreateBar(hudPanel.transform, "PlayerHealthBar",
                new Vector2(0, 0.5f), new Vector2(0, 0.5f), new Vector2(0, 0.5f),
                new Vector2(20, 0), new Vector2(360, 28),
                new Color(0.12f, 0.15f, 0.20f, 0.9f),
                new Color(0.15f, 0.75f, 0.40f, 1f),
                out Image pFill, out Text pText, font, "MILO (VOCÊ)");

            // Barra Axel (Enemy - Direita)
            GameObject enemyBar = CreateBar(hudPanel.transform, "EnemyHealthBar",
                new Vector2(1, 0.5f), new Vector2(1, 0.5f), new Vector2(1, 0.5f),
                new Vector2(-20, 0), new Vector2(360, 28),
                new Color(0.12f, 0.15f, 0.20f, 0.9f),
                new Color(0.90f, 0.25f, 0.25f, 1f),
                out Image eFill, out Text eText, font, "AXEL (BOT INIMIGO)");

            // Banner Central: Cronômetro de 3 Minutos + Status das Bases
            GameObject centerBanner = new GameObject("CenterMatchBanner");
            centerBanner.transform.SetParent(hudPanel.transform, false);
            RectTransform cbRect = centerBanner.AddComponent<RectTransform>();
            cbRect.anchorMin = new Vector2(0.5f, 0.5f);
            cbRect.anchorMax = new Vector2(0.5f, 0.5f);
            cbRect.pivot = new Vector2(0.5f, 0.5f);
            cbRect.anchoredPosition = Vector2.zero;
            cbRect.sizeDelta = new Vector2(520, 56);

            Image cbBg = centerBanner.AddComponent<Image>();
            cbBg.color = new Color(0.06f, 0.08f, 0.12f, 0.92f);

            // Texto do Timer (Grande no centro)
            GameObject timerTxtObj = new GameObject("Txt_Timer");
            timerTxtObj.transform.SetParent(centerBanner.transform, false);
            RectTransform tRect = timerTxtObj.AddComponent<RectTransform>();
            tRect.anchorMin = new Vector2(0.5f, 0.5f);
            tRect.anchorMax = new Vector2(0.5f, 0.5f);
            tRect.pivot = new Vector2(0.5f, 0.5f);
            tRect.anchoredPosition = new Vector2(0, 10);
            tRect.sizeDelta = new Vector2(200, 28);
            Text timerTxt = timerTxtObj.AddComponent<Text>();
            timerTxt.font = font;
            timerTxt.fontSize = 24;
            timerTxt.fontStyle = FontStyle.Bold;
            timerTxt.color = new Color(1.0f, 0.85f, 0.25f, 1.0f); // Dourado
            timerTxt.alignment = TextAnchor.MiddleCenter;
            timerTxt.text = "03:00";

            // Texto do Status das Bases
            GameObject baseTxtObj = new GameObject("Txt_BaseStatus");
            baseTxtObj.transform.SetParent(centerBanner.transform, false);
            RectTransform bRect = baseTxtObj.AddComponent<RectTransform>();
            bRect.anchorMin = new Vector2(0.5f, 0.5f);
            bRect.anchorMax = new Vector2(0.5f, 0.5f);
            bRect.pivot = new Vector2(0.5f, 0.5f);
            bRect.anchoredPosition = new Vector2(0, -12);
            bRect.sizeDelta = new Vector2(480, 20);
            Text baseTxt = baseTxtObj.AddComponent<Text>();
            baseTxt.font = font;
            baseTxt.fontSize = 12;
            baseTxt.fontStyle = FontStyle.Bold;
            baseTxt.color = new Color(0.85f, 0.90f, 1.0f, 1.0f);
            baseTxt.alignment = TextAnchor.MiddleCenter;
            baseTxt.text = "<color=#4CD3A8>Base Aliada: 1000</color>  |  <color=#FF5555>Base Inimiga: 1000</color>";

            // Conectar controladores
            MobaHUDHealthView healthView = hudPanel.AddComponent<MobaHUDHealthView>();
            healthView.Initialize(playerHero, enemyHero, pFill, pText, eFill, eText);

            MatchHUDTimerTracker timerTracker = centerBanner.AddComponent<MatchHUDTimerTracker>();
            timerTracker.Initialize(runtimeState, timerTxt, baseTxt);
        }

        private static void SetupHUDFeedbackAndControls(Transform canvas, Font font, Sprite outlineSprite)
        {
            // 1. Botão de Pausa (Superior Esquerdo)
            GameObject pauseBtnObj = CreateButton(canvas, "Btn_Pause",
                new Vector2(0, 1), new Vector2(0, 1), new Vector2(0, 1),
                new Vector2(40, -40), new Vector2(56, 56),
                new Color(0.10f, 0.14f, 0.22f, 0.90f), outlineSprite, new Color(0.3f, 0.6f, 1f, 1f));
            Text pauseBtnTxt = CreateText(pauseBtnObj.transform, "Txt_Icon", "⏸", 24, FontStyle.Bold, Color.white, font);
            pauseBtnTxt.alignment = TextAnchor.MiddleCenter;
            StretchFull(pauseBtnTxt.rectTransform);

            // 2. Painel Modal de Pausa
            GameObject pauseModal = new GameObject("PauseModalPanel");
            pauseModal.transform.SetParent(canvas, false);
            RectTransform pmRect = pauseModal.AddComponent<RectTransform>();
            StretchFull(pmRect);
            Image pmBg = pauseModal.AddComponent<Image>();
            pmBg.color = new Color(0.04f, 0.06f, 0.10f, 0.88f);

            GameObject box = new GameObject("DialogBox");
            box.transform.SetParent(pauseModal.transform, false);
            RectTransform bRect = box.AddComponent<RectTransform>();
            bRect.anchorMin = new Vector2(0.5f, 0.5f);
            bRect.anchorMax = new Vector2(0.5f, 0.5f);
            bRect.pivot = new Vector2(0.5f, 0.5f);
            bRect.sizeDelta = new Vector2(420, 320);
            Image bImg = box.AddComponent<Image>();
            bImg.color = new Color(0.08f, 0.12f, 0.18f, 0.98f);

            Text title = CreateText(box.transform, "Title", "JOGO PAUSADO", 26, FontStyle.Bold, new Color(1f, 0.85f, 0.3f, 1f), font);
            title.alignment = TextAnchor.MiddleCenter;
            RectTransform tRect = title.rectTransform;
            tRect.anchorMin = new Vector2(0, 1);
            tRect.anchorMax = new Vector2(1, 1);
            tRect.pivot = new Vector2(0.5f, 1);
            tRect.anchoredPosition = new Vector2(0, -25);
            tRect.sizeDelta = new Vector2(0, 40);

            // Botão Continuar
            GameObject btnResumeObj = CreateButton(box.transform, "Btn_Resume",
                new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                new Vector2(0, 35), new Vector2(300, 48),
                new Color(0.12f, 0.45f, 0.28f, 1f), outlineSprite, Color.green);
            Text resTxt = CreateText(btnResumeObj.transform, "Text", "CONTINUAR", 18, FontStyle.Bold, Color.white, font);
            resTxt.alignment = TextAnchor.MiddleCenter;
            StretchFull(resTxt.rectTransform);

            // Botão Reiniciar
            GameObject btnRestartObj = CreateButton(box.transform, "Btn_Restart",
                new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                new Vector2(0, -25), new Vector2(300, 48),
                new Color(0.20f, 0.30f, 0.55f, 1f), outlineSprite, Color.cyan);
            Text restTxt = CreateText(btnRestartObj.transform, "Text", "REINICIAR", 18, FontStyle.Bold, Color.white, font);
            restTxt.alignment = TextAnchor.MiddleCenter;
            StretchFull(restTxt.rectTransform);

            // Botão Sair
            GameObject btnQuitObj = CreateButton(box.transform, "Btn_Quit",
                new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                new Vector2(0, -85), new Vector2(300, 48),
                new Color(0.55f, 0.18f, 0.18f, 1f), outlineSprite, Color.red);
            Text qTxt = CreateText(btnQuitObj.transform, "Text", "SAIR DA PARTIDA", 18, FontStyle.Bold, Color.white, font);
            qTxt.alignment = TextAnchor.MiddleCenter;
            StretchFull(qTxt.rectTransform);

            var pauseCtrl = pauseModal.AddComponent<Gameplay.UI.MatchPauseMenuController>();
            var soPause = new SerializedObject(pauseCtrl);
            soPause.FindProperty("pausePanel").objectReferenceValue = pauseModal;
            soPause.FindProperty("btnPauseToggle").objectReferenceValue = pauseBtnObj.GetComponent<Button>();
            soPause.FindProperty("btnResume").objectReferenceValue = btnResumeObj.GetComponent<Button>();
            soPause.FindProperty("btnRestart").objectReferenceValue = btnRestartObj.GetComponent<Button>();
            soPause.FindProperty("btnQuit").objectReferenceValue = btnQuitObj.GetComponent<Button>();
            soPause.ApplyModifiedProperties();
            pauseModal.SetActive(false);

            // 3. Overlay de Contagem Regressiva (Intro 3, 2, 1, LUTA!)
            GameObject introOverlay = new GameObject("CountdownIntroOverlay");
            introOverlay.transform.SetParent(canvas, false);
            RectTransform ioRect = introOverlay.AddComponent<RectTransform>();
            StretchFull(ioRect);
            Image ioBg = introOverlay.AddComponent<Image>();
            ioBg.color = new Color(0f, 0f, 0f, 0.40f);

            GameObject countTxtObj = new GameObject("Txt_Countdown");
            countTxtObj.transform.SetParent(introOverlay.transform, false);
            RectTransform ctRect = countTxtObj.AddComponent<RectTransform>();
            ctRect.anchorMin = new Vector2(0.5f, 0.5f);
            ctRect.anchorMax = new Vector2(0.5f, 0.5f);
            ctRect.pivot = new Vector2(0.5f, 0.5f);
            ctRect.sizeDelta = new Vector2(600, 150);
            Text countTxt = countTxtObj.AddComponent<Text>();
            countTxt.font = font;
            countTxt.fontSize = 90;
            countTxt.fontStyle = FontStyle.Bold;
            countTxt.alignment = TextAnchor.MiddleCenter;
            countTxt.color = new Color(1f, 0.85f, 0.2f, 1f);
            countTxt.text = "3";

            var outline = countTxtObj.AddComponent<Outline>();
            outline.effectColor = Color.black;
            outline.effectDistance = new Vector2(3, -3);

            var introCtrl = introOverlay.AddComponent<Gameplay.UI.MatchCountdownIntro>();
            var soIntro = new SerializedObject(introCtrl);
            soIntro.FindProperty("overlayPanel").objectReferenceValue = introOverlay;
            soIntro.FindProperty("countdownText").objectReferenceValue = countTxt;
            soIntro.ApplyModifiedProperties();

            // 4. FloatingCombatTextManager
            if (GameObject.Find("FloatingCombatTextManager") == null)
            {
                var fctGo = new GameObject("FloatingCombatTextManager");
                fctGo.AddComponent<Gameplay.Feedback.FloatingCombatTextManager>();
            }

            // 5. AudioManager (SFX, BGM, UI)
            if (GameObject.Find("AudioManager") == null)
            {
                var audioGo = new GameObject("AudioManager");
                audioGo.AddComponent<Gameplay.Audio.AudioManager>();
            }

            // 6. CombatVFXManager (Penas, Impactos, Cura, Explosões)
            if (GameObject.Find("CombatVFXManager") == null)
            {
                var vfxGo = new GameObject("CombatVFXManager");
                vfxGo.AddComponent<Gameplay.Feedback.CombatVFXManager>();
            }

            // 7. NetworkStatusMonitor (EAP Item 38: Alerta de perda de conexão)
            if (GameObject.Find("NetworkStatusMonitor") == null)
            {
                var netGo = new GameObject("NetworkStatusMonitor");
                netGo.transform.SetParent(canvas, false);
                netGo.AddComponent<Gameplay.UI.NetworkStatusMonitor>();
            }
        }

        private static void EnsureSceneInBuildSettings(string scenePath)
        {
            List<EditorBuildSettingsScene> list = new List<EditorBuildSettingsScene>(EditorBuildSettings.scenes);
            foreach (var s in list)
            {
                if (s.path == scenePath) return;
            }
            list.Add(new EditorBuildSettingsScene(scenePath, true));
            EditorBuildSettings.scenes = list.ToArray();
        }

        private static GameObject CreateButton(Transform parent, string name,
            Vector2 anchorMin, Vector2 anchorMax, Vector2 pivot,
            Vector2 anchoredPos, Vector2 size,
            Color bgColor, Sprite borderSprite, Color borderColor)
        {
            GameObject btnObj = new GameObject(name);
            btnObj.transform.SetParent(parent, false);
            RectTransform rect = btnObj.AddComponent<RectTransform>();
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.pivot = pivot;
            rect.anchoredPosition = anchoredPos;
            rect.sizeDelta = size;

            Image bg = btnObj.AddComponent<Image>();
            bg.color = bgColor;

            if (borderSprite != null)
            {
                GameObject borderObj = new GameObject("Border");
                borderObj.transform.SetParent(btnObj.transform, false);
                RectTransform bRect = borderObj.AddComponent<RectTransform>();
                StretchFull(bRect);
                Image bImg = borderObj.AddComponent<Image>();
                bImg.sprite = borderSprite;
                bImg.color = borderColor;
                bImg.raycastTarget = false;
            }

            Button btn = btnObj.AddComponent<Button>();
            ColorBlock cb = btn.colors;
            cb.highlightedColor = bgColor * 1.25f;
            cb.pressedColor = bgColor * 0.75f;
            btn.colors = cb;

            return btnObj;
        }

        private static Button CreateMobaSkillButton(Transform parent, string name,
            Vector2 pos, float diameter,
            Color baseColor, Color accentColor,
            Sprite circleSprite, Sprite ringSprite, Font font,
            string labelName, string hotkey, int fontSize,
            out Image cooldownFill, out Text cooldownText)
        {
            GameObject btnObj = new GameObject(name);
            btnObj.transform.SetParent(parent, false);
            RectTransform rect = btnObj.AddComponent<RectTransform>();
            rect.anchorMin = new Vector2(1, 0);
            rect.anchorMax = new Vector2(1, 0);
            rect.pivot = new Vector2(0.5f, 0.5f);
            rect.anchoredPosition = pos;
            rect.sizeDelta = new Vector2(diameter, diameter);

            Image bg = btnObj.AddComponent<Image>();
            bg.sprite = circleSprite;
            bg.color = baseColor;

            if (ringSprite != null)
            {
                GameObject ringObj = new GameObject("Ring");
                ringObj.transform.SetParent(btnObj.transform, false);
                RectTransform rRect = ringObj.AddComponent<RectTransform>();
                StretchFull(rRect);
                rRect.sizeDelta = new Vector2(6, 6);
                Image rImg = ringObj.AddComponent<Image>();
                rImg.sprite = ringSprite;
                rImg.color = accentColor;
                rImg.raycastTarget = false;
            }

            GameObject labelObj = new GameObject("Label");
            labelObj.transform.SetParent(btnObj.transform, false);
            RectTransform lRect = labelObj.AddComponent<RectTransform>();
            StretchFull(lRect);
            Text label = labelObj.AddComponent<Text>();
            label.font = font;
            label.fontSize = fontSize;
            label.fontStyle = FontStyle.Bold;
            label.alignment = TextAnchor.MiddleCenter;
            label.color = Color.white;
            label.text = $"<b>{hotkey}</b>\n<size={fontSize - 3}>{labelName}</size>";
            label.raycastTarget = false;

            GameObject cdObj = new GameObject("CooldownOverlay");
            cdObj.transform.SetParent(btnObj.transform, false);
            RectTransform cdRect = cdObj.AddComponent<RectTransform>();
            StretchFull(cdRect);
            cooldownFill = cdObj.AddComponent<Image>();
            cooldownFill.sprite = circleSprite;
            cooldownFill.color = new Color(0.04f, 0.04f, 0.04f, 0.75f);
            cooldownFill.type = Image.Type.Filled;
            cooldownFill.fillMethod = Image.FillMethod.Radial360;
            cooldownFill.fillOrigin = (int)Image.Origin360.Top;
            cooldownFill.fillClockwise = false;
            cooldownFill.fillAmount = 0f;
            cooldownFill.raycastTarget = false;
            cdObj.SetActive(false);

            GameObject cdTxtObj = new GameObject("CooldownText");
            cdTxtObj.transform.SetParent(btnObj.transform, false);
            RectTransform cdTxtRect = cdTxtObj.AddComponent<RectTransform>();
            StretchFull(cdTxtRect);
            cooldownText = cdTxtObj.AddComponent<Text>();
            cooldownText.font = font;
            cooldownText.fontSize = fontSize + 8;
            cooldownText.fontStyle = FontStyle.Bold;
            cooldownText.alignment = TextAnchor.MiddleCenter;
            cooldownText.color = new Color(1f, 0.95f, 0.4f, 1f);
            cooldownText.text = "";
            cooldownText.raycastTarget = false;
            cdTxtObj.SetActive(false);

            Button btn = btnObj.AddComponent<Button>();
            return btn;
        }

        private static GameObject CreateBar(Transform parent, string name,
            Vector2 aMin, Vector2 aMax, Vector2 pivot,
            Vector2 pos, Vector2 size,
            Color bgColor, Color fillColor,
            out Image fillImage, out Text infoText, Font font, string title)
        {
            GameObject barObj = new GameObject(name);
            barObj.transform.SetParent(parent, false);
            RectTransform rect = barObj.AddComponent<RectTransform>();
            rect.anchorMin = aMin;
            rect.anchorMax = aMax;
            rect.pivot = pivot;
            rect.anchoredPosition = pos;
            rect.sizeDelta = size;

            Image bg = barObj.AddComponent<Image>();
            bg.color = bgColor;

            GameObject fillObj = new GameObject("Fill");
            fillObj.transform.SetParent(barObj.transform, false);
            RectTransform fRect = fillObj.AddComponent<RectTransform>();
            StretchFull(fRect);
            fRect.offsetMin = new Vector2(3, 3);
            fRect.offsetMax = new Vector2(-3, -3);
            fillImage = fillObj.AddComponent<Image>();
            fillImage.color = fillColor;
            fillImage.type = Image.Type.Filled;
            fillImage.fillMethod = Image.FillMethod.Horizontal;
            fillImage.fillOrigin = (int)Image.OriginHorizontal.Left;
            fillImage.fillAmount = 1.0f;

            infoText = CreateText(barObj.transform, "Text", title, 14, FontStyle.Bold, Color.white, font);
            infoText.alignment = TextAnchor.MiddleCenter;
            StretchFull(infoText.rectTransform);

            return barObj;
        }

        private static (Toggle toggle, Image bg, Text lbl, RectTransform handleRect) CreateAutoAttackToggleVertical(Transform parent, Font font, Sprite borderSprite, Sprite circleSprite, Vector2 anchorForAttack, Vector2 toggleSize)
        {
            // Toggle vertical ao lado direito do botão ATAQUE (136 diametro, gap 10)
            // ATAQUE pos -135,135 -> borda direita ~ -67. Coloca toggle em -38 (gap ~29)
            Vector2 togglePos = new Vector2(anchorForAttack.x + 136 * 0.5f + toggleSize.x * 0.5f + 10f, anchorForAttack.y);
            GameObject go = new GameObject("Toggle_AutoAttack");
            go.transform.SetParent(parent, false);
            RectTransform rt = go.AddComponent<RectTransform>();
            rt.anchorMin = new Vector2(1, 0);
            rt.anchorMax = new Vector2(1, 0);
            rt.pivot = new Vector2(0.5f, 0.5f);
            rt.anchoredPosition = togglePos;
            rt.sizeDelta = toggleSize;

            // Background vertical (trilho)
            GameObject bgGo = new GameObject("Background");
            bgGo.transform.SetParent(go.transform, false);
            RectTransform bgRt = bgGo.AddComponent<RectTransform>();
            StretchFull(bgRt);
            Image bg = bgGo.AddComponent<Image>();
            bg.color = new Color(0.26f, 0.26f, 0.30f, 0.95f);
            if (circleSprite != null)
            {
                bg.sprite = circleSprite;
                bg.type = Image.Type.Sliced;
            }

            // Borda sutil
            if (borderSprite != null)
            {
                var border = new GameObject("Border");
                border.transform.SetParent(bgGo.transform, false);
                var brt = border.AddComponent<RectTransform>();
                StretchFull(brt);
                brt.sizeDelta = new Vector2(4, 4);
                var bimg = border.AddComponent<Image>();
                bimg.sprite = borderSprite;
                bimg.color = new Color(0.95f, 0.65f, 0.15f, 0.55f);
                bimg.raycastTarget = false;
            }

            // Checkmark/Handle que desliza vertical
            GameObject handleGo = new GameObject("Handle");
            handleGo.transform.SetParent(bgGo.transform, false);
            RectTransform handleRt = handleGo.AddComponent<RectTransform>();
            handleRt.anchorMin = new Vector2(0.5f, 0.5f);
            handleRt.anchorMax = new Vector2(0.5f, 0.5f);
            handleRt.pivot = new Vector2(0.5f, 0.5f);
            handleRt.sizeDelta = new Vector2(toggleSize.x - 10f, toggleSize.x - 10f);
            handleRt.anchoredPosition = new Vector2(0f, -14f);
            Image handleImg = handleGo.AddComponent<Image>();
            if (circleSprite != null) { handleImg.sprite = circleSprite; handleImg.type = Image.Type.Sliced; }
            handleImg.color = Color.white;
            handleImg.raycastTarget = false;

            // Label AUTO acima do toggle
            GameObject labelGo = new GameObject("Label");
            labelGo.transform.SetParent(go.transform, false);
            RectTransform lrt = labelGo.AddComponent<RectTransform>();
            lrt.anchorMin = new Vector2(0.5f, 1f);
            lrt.anchorMax = new Vector2(0.5f, 1f);
            lrt.pivot = new Vector2(0.5f, 0f);
            lrt.anchoredPosition = new Vector2(0f, 6f);
            lrt.sizeDelta = new Vector2(64, 18);
            Text lbl = labelGo.AddComponent<Text>();
            lbl.font = font;
            lbl.fontSize = 10;
            lbl.fontStyle = FontStyle.Bold;
            lbl.alignment = TextAnchor.MiddleCenter;
            lbl.color = new Color(0.75f, 0.78f, 0.82f, 1f);
            lbl.text = "AUTO";
            lbl.raycastTarget = false;

            // Toggle nativo
            Toggle toggle = go.AddComponent<Toggle>();
            toggle.targetGraphic = bg;
            toggle.graphic = handleImg;
            toggle.isOn = false;
            // Transição de cor no bg
            var cb = toggle.colors;
            cb.normalColor = Color.white;
            cb.highlightedColor = Color.white;
            cb.pressedColor = new Color(0.9f, 0.9f, 0.9f, 1f);
            cb.selectedColor = Color.white;
            toggle.colors = cb;

            return (toggle, bg, lbl, handleRt);
        }

        private static Text CreateText(Transform parent, string name, string content, int size, FontStyle style, Color color, Font font)
        {
            GameObject txtObj = new GameObject(name);
            txtObj.transform.SetParent(parent, false);
            Text txt = txtObj.AddComponent<Text>();
            txt.text = content;
            txt.fontSize = size;
            txt.fontStyle = style;
            txt.color = color;
            txt.font = font;
            return txt;
        }

        private static void EnsureBalanceMetrics(MatchRuntimeStateSO runtime, FowlgenBalanceConfigSO balance)
        {
            string rootName = "BalanceMetricsCollector";
            var existing = GameObject.Find(rootName);
            var t = System.Type.GetType("FowlgenWars.Gameplay.BalanceMetricsCollector, FowlgenWars.Modules.Gameplay");
            if (t == null) t = System.Type.GetType("FowlgenWars.Gameplay.BalanceMetricsCollector, Assembly-CSharp");
            if (t == null) { Debug.LogWarning("[Setup MOBA] BalanceMetricsCollector type não encontrado."); return; }
            var go = existing != null ? existing : new GameObject(rootName);
            var comp = go.GetComponent(t);
            if (comp == null) comp = go.AddComponent(t);
            var so = new SerializedObject(comp);
            if (so.FindProperty("runtimeState") != null) so.FindProperty("runtimeState").objectReferenceValue = runtime;
            if (so.FindProperty("balanceConfig") != null) so.FindProperty("balanceConfig").objectReferenceValue = balance;
            so.ApplyModifiedProperties();
            EditorUtility.SetDirty(go);
        }

        private static void EnsureArenaBoundary()
        {
            var existing = GameObject.Find("ArenaBoundary");
            var t = System.Type.GetType("FowlgenWars.Gameplay.ArenaBoundaryEnforcer, FowlgenWars.Modules.Gameplay");
            if (t == null) t = System.Type.GetType("FowlgenWars.Gameplay.ArenaBoundaryEnforcer, Assembly-CSharp");
            if (t == null) return;
            if (existing != null && existing.GetComponent(t) != null) return;
            var root = existing != null ? existing : new GameObject("ArenaBoundary");
            if (root.GetComponent(t) == null)
                root.AddComponent(t);
        }

        private static void StretchFull(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.sizeDelta = Vector2.zero;
            rect.anchoredPosition = Vector2.zero;
        }
    }
}
