using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using UnityEngine.EventSystems;
using FowlgenWars.Gameplay;

namespace FowlgenWars.EditorScripts
{
    public static class SetupMobaArenaComplete
    {
        [MenuItem("Fowlgen Wars/Configurar MOBA Arena (Milo, Axel, Joystick e Poderes)")]
        public static void Run()
        {
            Scene scene = SceneManager.GetActiveScene();
            if (scene.name != "Arena_Clean")
            {
                scene = EditorSceneManager.OpenScene("Assets/Scenes/Game/Arena_Clean.unity", OpenSceneMode.Single);
            }

            Debug.Log("[Setup MOBA] Iniciando configuração completa da Arena...");

            // 1. Configurar Milo (Herói Jogável)
            GameObject miloObj = GameObject.Find("Milo");
            if (miloObj == null)
            {
                Debug.LogError("[Setup MOBA] GameObject Milo não encontrado na cena!");
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
            soMiloHero.ApplyModifiedProperties();

            MobilePlayerController miloMove = miloObj.GetComponent<MobilePlayerController>();
            if (miloMove == null) miloMove = miloObj.AddComponent<MobilePlayerController>();
            miloMove.MoveSpeed = 6.0f;

            MobaSkillsController miloSkills = miloObj.GetComponent<MobaSkillsController>();
            if (miloSkills == null) miloSkills = miloObj.AddComponent<MobaSkillsController>();

            // 2. Configurar Axel (Bot Inimigo)
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
                soAxelHero.ApplyModifiedProperties();
            }

            // 3. Configurar Câmera MOBA
            Camera mainCam = Camera.main;
            if (mainCam != null)
            {
                MobaCameraController camCtrl = mainCam.GetComponent<MobaCameraController>();
                if (camCtrl == null) camCtrl = mainCam.gameObject.AddComponent<MobaCameraController>();
                camCtrl.SetTarget(miloObj.transform);
                SerializedObject soCam = new SerializedObject(camCtrl);
                soCam.FindProperty("target").objectReferenceValue = miloObj.transform;
                soCam.FindProperty("offset").vector3Value = new Vector3(0, 16f, -14f);
                soCam.FindProperty("cameraAngle").floatValue = 50f;
                soCam.FindProperty("smoothSpeed").floatValue = 8f;
                soCam.ApplyModifiedProperties();
            }

            // 4. Garantir EventSystem
            if (UnityEngine.Object.FindObjectOfType<EventSystem>() == null)
            {
                GameObject esObj = new GameObject("EventSystem");
                esObj.AddComponent<EventSystem>();
                esObj.AddComponent<StandaloneInputModule>();
            }

            // 5. Configurar Canvas do HUD
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

            // Carregar Sprites
            Sprite circleSprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Joystick Pack/Sprites/Handles/Handle_Plain.png");
            Sprite outlineSprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Joystick Pack/Sprites/Handles/Handle_Outline.png");
            Sprite ringSprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Joystick Pack/Sprites/All Axis Backgrounds/AllAxis_Outline.png");
            Font defaultFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            if (defaultFont == null) defaultFont = Resources.GetBuiltinResource<Font>("Arial.ttf");

            // 6. Lado Esquerdo: Instanciar Joystick Pack (Variable Joystick)
            GameObject joystickPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Joystick Pack/Prefabs/Variable Joystick.prefab");
            VariableJoystick variableJoystick = null;
            if (joystickPrefab != null)
            {
                GameObject vjObj = (GameObject)PrefabUtility.InstantiatePrefab(joystickPrefab, canvasObj.transform);
                vjObj.name = "Variable Joystick";
                RectTransform vjRect = vjObj.GetComponent<RectTransform>();
                // Área de toque cobre todo o quadrante inferior-esquerdo (0 a 50% de largura, 0 a 85% de altura)
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

            // Botão de Alternar Modo do Joystick (Fixed / Floating / Dynamic)
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

            // 7. Lado Direito: Cluster de Poderes estilo LoL / Wild Rift
            GameObject skillsCluster = new GameObject("SkillsCluster");
            skillsCluster.transform.SetParent(canvasObj.transform, false);
            RectTransform clusterRect = skillsCluster.AddComponent<RectTransform>();
            clusterRect.anchorMin = new Vector2(1, 0);
            clusterRect.anchorMax = new Vector2(1, 0);
            clusterRect.pivot = new Vector2(1, 0);
            clusterRect.anchoredPosition = Vector2.zero;
            clusterRect.sizeDelta = new Vector2(500, 450);

            // 7.1 Botão de Ataque Básico (Grande no centro-baixo: LoL Attack)
            Button btnAttack = CreateMobaSkillButton(skillsCluster.transform, "Btn_Attack",
                new Vector2(-135, 135), 136,
                new Color(0.18f, 0.12f, 0.12f, 0.95f),
                new Color(0.95f, 0.65f, 0.15f, 1f),
                circleSprite, ringSprite, defaultFont,
                "ATAQUE", "ESPAÇO", 18,
                out Image fillAtk, out Text txtAtk);

            // 7.2 Habilidade Q (Dash / Investida - Baixo à esquerda)
            Button btnQ = CreateMobaSkillButton(skillsCluster.transform, "Btn_SkillQ",
                new Vector2(-305, 80), 92,
                new Color(0.08f, 0.16f, 0.28f, 0.95f),
                new Color(0.15f, 0.70f, 0.95f, 1f),
                circleSprite, ringSprite, defaultFont,
                "DASH", "Q", 15,
                out Image fillQ, out Text txtQ);

            // 7.3 Habilidade W (Escudo / Baluarte - Arco médio-esquerdo)
            Button btnW = CreateMobaSkillButton(skillsCluster.transform, "Btn_SkillW",
                new Vector2(-295, 195), 92,
                new Color(0.08f, 0.24f, 0.18f, 0.95f),
                new Color(0.20f, 0.85f, 0.55f, 1f),
                circleSprite, ringSprite, defaultFont,
                "ESCUDO", "W", 15,
                out Image fillW, out Text txtW);

            // 7.4 Habilidade E (Skillshot / Disparo - Arco superior-meio)
            Button btnE = CreateMobaSkillButton(skillsCluster.transform, "Btn_SkillE",
                new Vector2(-210, 285), 92,
                new Color(0.28f, 0.16f, 0.08f, 0.95f),
                new Color(0.95f, 0.55f, 0.15f, 1f),
                circleSprite, ringSprite, defaultFont,
                "TIRO", "E", 15,
                out Image fillE, out Text txtE);

            // 7.5 Habilidade R (Ultimate - Topo do cluster: Maior e Dourado)
            Button btnR = CreateMobaSkillButton(skillsCluster.transform, "Btn_SkillR",
                new Vector2(-95, 320), 106,
                new Color(0.25f, 0.10f, 0.30f, 0.95f),
                new Color(0.98f, 0.85f, 0.25f, 1f),
                circleSprite, ringSprite, defaultFont,
                "ULTIMATE", "R", 16,
                out Image fillR, out Text txtR);

            // Conectar UI ao MobaSkillsController
            miloSkills.BindUI(btnAttack, btnQ, fillQ, txtQ, btnW, fillW, txtW, btnE, fillE, txtE, btnR, fillR, txtR);

            // Salvar serialized fields de UI no miloSkills
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
            soSkills.ApplyModifiedProperties();

            // 8. Barras de Vida no Topo (HUD de Duelo)
            CreateTopHealthHUD(canvasObj.transform, defaultFont, miloHero, axelObj != null ? axelObj.GetComponent<HeroAgent>() : null);

            // 9. Marcar cena como dirty e salvar
            EditorUtility.SetDirty(miloObj);
            if (axelObj != null) EditorUtility.SetDirty(axelObj);
            EditorUtility.SetDirty(canvasObj);
            EditorSceneManager.MarkSceneDirty(scene);
            EditorSceneManager.SaveScene(scene);

            Debug.Log("[Setup MOBA] Sucesso! Milo, Axel, Joystick Pack com modos e Botões de Habilidades LoL configurados com sucesso!");
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

            // Imagem de Fundo Circular
            Image bg = btnObj.AddComponent<Image>();
            bg.sprite = circleSprite;
            bg.color = baseColor;

            // Borda Anelar Estilizada
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

            // Texto de Identificação / Atalho
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

            // Overlay de Cooldown (Radial 360)
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

            // Texto do Contador de Cooldown
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

        private static void CreateTopHealthHUD(Transform parent, Font font, HeroAgent playerHero, HeroAgent enemyHero)
        {
            GameObject hudPanel = new GameObject("TopHealthHUD");
            hudPanel.transform.SetParent(parent, false);
            RectTransform pRect = hudPanel.AddComponent<RectTransform>();
            pRect.anchorMin = new Vector2(0, 1);
            pRect.anchorMax = new Vector2(1, 1);
            pRect.pivot = new Vector2(0.5f, 1);
            pRect.anchoredPosition = new Vector2(0, -15);
            pRect.sizeDelta = new Vector2(-60, 60);

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

            // Banner Central de Instruções
            GameObject hintObj = new GameObject("HintBanner");
            hintObj.transform.SetParent(hudPanel.transform, false);
            RectTransform hRect = hintObj.AddComponent<RectTransform>();
            hRect.anchorMin = new Vector2(0.5f, 0.5f);
            hRect.anchorMax = new Vector2(0.5f, 0.5f);
            hRect.pivot = new Vector2(0.5f, 0.5f);
            hRect.anchoredPosition = Vector2.zero;
            hRect.sizeDelta = new Vector2(500, 36);

            Image hBg = hintObj.AddComponent<Image>();
            hBg.color = new Color(0.06f, 0.08f, 0.12f, 0.85f);

            Text hTxt = CreateText(hintObj.transform, "Text", "Mover: Joystick / WASD  |  Atacar: Botão / Espaço  |  Poderes: Q, W, E, R", 14, FontStyle.Bold, new Color(0.85f, 0.9f, 1f, 1f), font);
            hTxt.alignment = TextAnchor.MiddleCenter;
            StretchFull(hTxt.rectTransform);

            MobaHUDHealthView healthView = hudPanel.AddComponent<MobaHUDHealthView>();
            healthView.Initialize(playerHero, enemyHero, pFill, pText, eFill, eText);
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

        private static void StretchFull(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.sizeDelta = Vector2.zero;
            rect.anchoredPosition = Vector2.zero;
        }
    }
}
