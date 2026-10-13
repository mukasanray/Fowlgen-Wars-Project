using UnityEditor;
using UnityEngine;
using UnityEngine.UIElements;

public class PT_PackageWelcomeWindow : EditorWindow
{
    private const string PrefKey      = "PT_WelcomeScreen";            // EditorPrefs  – permanent dismiss
    private const string ShouldShowKey = "PT_WelcomeScreen_ShouldShow"; // SessionState – survives domain reload, cleared after use

    private static Texture2D banner;
    private static Texture2D iconTwitter;
    private static Texture2D iconYouTube;
    private static Texture2D iconFacebook;
    private static Texture2D iconInstagram;
    private static Texture2D iconTikTok;
    private static Texture2D iconArtStation;

    private static Texture2D demoIcon1;
    private static Texture2D demoIcon2;

    private static Texture2D gameIcon1;
    private static Texture2D gameIcon2;
    private static Texture2D gameIcon3;
    private static Texture2D gameIcon4;
    private static Texture2D gameIcon5;
    private static Texture2D gameIcon6;

    private bool dontShowAgain = true;
    private bool demosExpanded;
    private bool gamesExpanded;

    private const float WindowWidth = 500f;
    private const float BannerHeight = 125f;
    private const float SocialIconSize = 24f;
    private const float SocialIconSpacing = 6f;
    private const float CardSpacing = 8f * 1.21f;
    private const float CardScale = 0.7f;
    private const float CaptionHeight = 65f;
    private const float LinkButtonWidth = (WindowWidth - 56f) / 4f * 1.05f;

    // --- Post-domain-reload opener -------------------------------------------
    // Runs after EVERY domain reload (startup, script compile, entering Play Mode).
    // Checks ShouldShowKey, which is set by PT_ImportDetector on fresh import and
    // survives domain reloads via SessionState. Cleared immediately after use so
    // it fires exactly once — it cannot cause the window to reopen on later reloads.
    [InitializeOnLoad]
    private class PT_StartupChecker
    {
        static PT_StartupChecker()
        {
            if (Application.isBatchMode) return;

            if (SessionState.GetBool(ShouldShowKey, false))
            {
                SessionState.SetBool(ShouldShowKey, false); // consume immediately
                EditorApplication.update += ShowOnLoad;
            }
        }
    }
    // -------------------------------------------------------------------------

    // --- Detect package import -----------------------------------------------
    // AssetPostprocessor fires when any asset is imported (including on platform
    // switches and Reimport All). We use SessionState to suppress reruns within
    // the same session, and we only set ShouldShowKey when the user hasn't
    // permanently dismissed the window.
    private class PT_ImportDetector : AssetPostprocessor
    {
        private const string MarkerAsset =
            "Assets/Polytope Studio/Welcome_Screen/Editor/Textures/banner_dark.png";

        private const string ShownThisSessionKey = "PT_WelcomeScreen_ShownThisSession";

        static void OnPostprocessAllAssets(
            string[] importedAssets,
            string[] deletedAssets,
            string[] movedAssets,
            string[] movedFromAssetPaths)
        {
            if (Application.isBatchMode) return;

            // One trigger per session — guards platform switches and Reimport All.
            if (SessionState.GetBool(ShownThisSessionKey, false)) return;

            foreach (string path in importedAssets)
            {
                if (path == MarkerAsset)
                {
                    SessionState.SetBool(ShownThisSessionKey, true);

                    // Only queue a show if the user hasn't permanently dismissed it.
                    // Store the intent in SessionState so it survives the domain
                    // reload that typically follows a package import (script compile).
                    // PT_StartupChecker will pick it up after the reload.
                    if (!EditorPrefs.GetBool(PrefKey, false))
                        SessionState.SetBool(ShouldShowKey, true);

                    break;
                }
            }
        }
    }
    // -------------------------------------------------------------------------

    [MenuItem("Tools/Polytope/Welcome Screen")]
    public static void OpenWindow()
    {
        LoadAssets();
        var window = GetWindow<PT_PackageWelcomeWindow>(true, "Welcome");
        window.minSize = new Vector2(WindowWidth, 500);
        window.maxSize = new Vector2(WindowWidth, 900);
        window.Show();
    }

    private static void ShowOnLoad()
    {
        EditorApplication.update -= ShowOnLoad;
        LoadAssets();
        OpenWindow();
    }

    private void OnDestroy()
    {
        // Save the user's choice even if they close via the ✕ button.
        EditorPrefs.SetBool(PrefKey, dontShowAgain);
    }

    private void OnEnable()
    {
        // Initialise the toggle to whatever the user last saved.
        // GetBool returns false when the pref is absent (first ever run),
        // so dontShowAgain will be false until the user checks the box and closes.
        dontShowAgain = EditorPrefs.GetBool(PrefKey, false);
        minSize = new Vector2(WindowWidth, 500);
        maxSize = new Vector2(WindowWidth, 900);
    }

    private static void LoadAssets()
    {
        string bannerPath = EditorGUIUtility.isProSkin
            ? "Assets/Polytope Studio/Welcome_Screen/Editor/Textures/banner_dark.png"
            : "Assets/Polytope Studio/Welcome_Screen/Editor/Textures/banner_light.png";

        banner = AssetDatabase.LoadAssetAtPath<Texture2D>(bannerPath);
        iconTwitter = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/icon_twitter.png");
        iconYouTube = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/icon_youtube.png");
        iconFacebook = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/icon_facebook.png");
        iconInstagram = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/icon_instagram.png");
        iconTikTok = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/icon_tiktok.png");
        iconArtStation = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/icon_artstation.png");

        demoIcon1 = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/demo1.png");
        demoIcon2 = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/demo2.png");

        gameIcon1 = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/game1.png");
        gameIcon2 = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/game2.png");
        gameIcon3 = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/game3.png");
        gameIcon4 = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/game4.png");
        gameIcon5 = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/game5.png");
        gameIcon6 = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Polytope Studio/Welcome_Screen/Editor/Textures/game6.png");
    }

    // --- UI Toolkit entry point ----------------------------------------------
    private void CreateGUI()
    {
        var scroll = new ScrollView(ScrollViewMode.Vertical);
        scroll.style.flexGrow = 1;
        rootVisualElement.Add(scroll);

        var content = new VisualElement();
        content.style.paddingLeft = 4;
        content.style.paddingRight = 4;
        scroll.Add(content);

        // Banner
        if (banner != null)
            content.Add(BuildBanner());

        content.Add(Spacer(8));

        // Welcome text pills
        var pillsRow = new VisualElement();
        pillsRow.style.alignItems = Align.Center;

        var titleLabel = new Label("Thank you for trusting our assets!");
        titleLabel.style.backgroundColor = new Color(0f, 0f, 0f, 0.25f);
        titleLabel.style.fontSize = 14;
        titleLabel.style.unityFontStyleAndWeight = FontStyle.Bold;
        titleLabel.style.unityTextAlign = TextAnchor.MiddleCenter;
        titleLabel.style.paddingTop = 4;
        titleLabel.style.paddingBottom = 4;
        titleLabel.style.paddingLeft = 12;
        titleLabel.style.paddingRight = 12;
        titleLabel.style.marginBottom = 4;
        RoundCorners(titleLabel, 6);
        pillsRow.Add(titleLabel);

        var descLabel = new Label("Below are some useful resources to help you get started.");
        descLabel.style.backgroundColor = new Color(0f, 0f, 0f, 0.25f);
        descLabel.style.unityTextAlign = TextAnchor.MiddleCenter;
        descLabel.style.paddingTop = 3;
        descLabel.style.paddingBottom = 3;
        descLabel.style.paddingLeft = 12;
        descLabel.style.paddingRight = 12;
        RoundCorners(descLabel, 6);
        pillsRow.Add(descLabel);

        content.Add(pillsRow);

        content.Add(Spacer(10));

        // Discord
        content.Add(BuildPanel(p =>
        {
            p.Add(SectionTitle("💬  Discord Community"));
            p.Add(SectionDesc("Join our community, share your project, ask for support, and win free vouchers every month."));
            p.Add(Spacer(6));
            p.Add(BuildDiscordGallery());
        }));

        content.Add(Spacer(8));

        // Games / Demos
        content.Add(BuildPanel(p =>
        {
            p.Add(Spacer(4));
            BuildGamesGallery(p);
        }));

        content.Add(Spacer(8));

        // Docs / Support
        content.Add(BuildPanel(p =>
        {
            p.Add(SectionTitle("📋  Docs, Support, Reviews & Roadmap"));
            p.Add(Spacer(4));
            var row = new VisualElement();
            row.style.flexDirection = FlexDirection.Row;
            row.style.justifyContent = Justify.Center;
            row.Add(BuildLinkCard("Documentation", "Documentations for every pack.",
                "https://drive.google.com/drive/folders/1mcjjdqr91Qt38Jhko_64K0E1Kx-Efh31?usp=drive_link"));
            row.Add(BuildLinkCard("Support Email", "Send us a question or report an issue.",
                "mailto:contact@polytope.studio"));
            row.Add(BuildLinkCard("⭐ Rate & Review", "Enjoyed our assets? Leave us a review!",
                "https://assetstore.unity.com/publishers/35251"));
            row.Add(BuildLinkCard("🗺 Roadmap", "See what we're building next.",
                "https://trello.com/b/HTwC0zvm/polytope-studio-lowpoly-assets"));
            p.Add(row);
        }));

        content.Add(Spacer(8));

        // Social
        content.Add(BuildPanel(p =>
        {
            p.Add(SectionTitle("🌐  Follow Us"));
            p.Add(Spacer(8));
            var row = new VisualElement();
            row.style.flexDirection = FlexDirection.Row;
            row.style.justifyContent = Justify.Center;
            row.style.alignItems = Align.Center;
            row.Add(BuildSocialIcon(iconTwitter, "https://x.com/PolytopeStudio"));
            row.Add(BuildSocialIcon(iconYouTube, "https://www.youtube.com/@polytopestudio"));
            row.Add(BuildSocialIcon(iconFacebook, "https://www.facebook.com/PolytopeStudio"));
            row.Add(BuildSocialIcon(iconInstagram, "https://www.instagram.com/polytopestudio/"));
            row.Add(BuildSocialIcon(iconTikTok, "https://www.tiktok.com/@polytopestudio"));
            row.Add(BuildSocialIcon(iconArtStation, "https://www.artstation.com/polytope/store"));
            p.Add(row);
        }));

        content.Add(Spacer(8));

        // Don't show again toggle
        var toggle = new Toggle("Don't show this again") { value = dontShowAgain };
        toggle.RegisterValueChangedCallback(evt => dontShowAgain = evt.newValue);
        toggle.style.marginLeft = 2;
        content.Add(toggle);

        content.Add(Spacer(8));

        // Close button
        var closeBtn = new Button(() =>
        {
            // Always persist the user's choice explicitly in both directions.
            EditorPrefs.SetBool(PrefKey, dontShowAgain);
            Close();
        });
        closeBtn.text = "Close";
        closeBtn.style.height = 30;
        RoundCorners(closeBtn, 8);
        content.Add(closeBtn);

        content.Add(Spacer(12));
    }
    // -------------------------------------------------------------------------

    // --- Section builders ----------------------------------------------------

    private VisualElement BuildBanner()
    {
        var container = new VisualElement();
        container.style.height = BannerHeight;
        container.style.overflow = Overflow.Hidden;
        container.style.marginTop = 4;
        RoundCorners(container, 10);

        if (banner != null)
        {
            container.style.backgroundImage = new StyleBackground(banner);
#if UNITY_2022_2_OR_NEWER
            container.style.backgroundSize = new BackgroundSize(BackgroundSizeType.Cover);
#else
#pragma warning disable CS0618
            container.style.unityBackgroundScaleMode = ScaleMode.ScaleAndCrop;
#pragma warning restore CS0618
#endif
        }

        return container;
    }

    private VisualElement BuildDiscordGallery()
    {
        var row = new VisualElement();
        row.style.flexDirection = FlexDirection.Row;
        row.style.justifyContent = Justify.Center;
        row.Add(BuildLinkCard("Join Server", "Meet the community.", "https://discord.com/invite/SZ6whXU"));
        row.Add(BuildLinkCard("#giveaway", "Free vouchers monthly.", "https://discord.gg/DAKGgUu2yE"));
        row.Add(BuildLinkCard("#unity-support", "Get help with our assets.", "https://discord.gg/YAKSckftfn"));
        row.Add(BuildLinkCard("#FAQ", "Frequently asked questions.", "https://discord.gg/PPbYzb5tRT"));
        return row;
    }

    private void BuildGamesGallery(VisualElement parent)
    {
        float available = WindowWidth - 12f;
        float cardWidth = (available - CardSpacing * 2f) / 3f * CardScale * 1.2f;
        float cardHeight = cardWidth * (9f / 16f);
        float demoCardWidth = available * 0.4f * CardScale;
        float demoCardHeight = demoCardWidth * (9f / 16f);

        // -- Demos --
        var demosContent = new VisualElement();
        demosContent.style.display = demosExpanded ? DisplayStyle.Flex : DisplayStyle.None;

        parent.Add(BuildCollapsibleSeparator("Polytope Demos", demosContent, () => demosExpanded, v => demosExpanded = v));

        demosContent.Add(SectionDesc("Try our interactive demos and see our assets in action."));
        demosContent.Add(Spacer(6));
        var demoRow = new VisualElement();
        demoRow.style.flexDirection = FlexDirection.Row;
        demoRow.style.justifyContent = Justify.Center;
        demoRow.Add(BuildCard(demoIcon1, "https://apps.microsoft.com/detail/9n4hbjpcznqn?hl=es-ES&gl=ES", demoCardWidth, demoCardHeight, "Mix and preview modular armor sets with real-time character customization"));
        demoRow.Add(Spacer(CardSpacing, horizontal: true));
        demoRow.Add(BuildCard(demoIcon2, "https://apps.microsoft.com/detail/9pl3wkh940q7?hl=es-ES&gl=ES", demoCardWidth, demoCardHeight, "Explore a stylized village built entirely with the our modular assets."));
        demosContent.Add(demoRow);
        demosContent.Add(Spacer(4));
        parent.Add(demosContent);

        parent.Add(Spacer(6));

        // -- Made with our Assets --
        var gamesContent = new VisualElement();
        gamesContent.style.display = gamesExpanded ? DisplayStyle.Flex : DisplayStyle.None;

        parent.Add(BuildCollapsibleSeparator("Made with our Assets", gamesContent, () => gamesExpanded, v => gamesExpanded = v));

        gamesContent.Add(SectionDesc("Games built by the community using our asset packs."));
        gamesContent.Add(Spacer(6));

        var gameRow1 = new VisualElement();
        gameRow1.style.flexDirection = FlexDirection.Row;
        gameRow1.style.justifyContent = Justify.Center;
        gameRow1.Add(BuildCard(gameIcon1, "https://store.steampowered.com/app/3722910/Legends_of_Azamar_Demo/", cardWidth, cardHeight, "Step into the world of Avendor and brave the ruins of Bar-Ulduun, the fabled lost city of the dwarves", CaptionHeight * 1.1f));
        gameRow1.Add(Spacer(CardSpacing, horizontal: true));
        gameRow1.Add(BuildCard(gameIcon2, "https://store.steampowered.com/app/2932960/A_Merchants_Promise/", cardWidth, cardHeight, "Medieval Trading & Transport with Physics-Based Items", CaptionHeight * 1.1f));
        gameRow1.Add(Spacer(CardSpacing, horizontal: true));
        gameRow1.Add(BuildCard(gameIcon3, "https://store.steampowered.com/app/1434840/Dungeons__Kingdoms_Prologue/", cardWidth, cardHeight, "A medieval fantasy kingdom builder, management sim and dungeon delver RPG hybrid", CaptionHeight * 1.1f));
        gamesContent.Add(gameRow1);
        gamesContent.Add(Spacer(5));

        var gameRow2 = new VisualElement();
        gameRow2.style.flexDirection = FlexDirection.Row;
        gameRow2.style.justifyContent = Justify.Center;
        gameRow2.Add(BuildCard(gameIcon4, "https://store.steampowered.com/app/2369850/Dolven/", cardWidth, cardHeight, "A narrative-driven tactical RPG where combat blends party-based skills with poker-style card combos", CaptionHeight * 1.1f));
        gameRow2.Add(Spacer(CardSpacing, horizontal: true));
        gameRow2.Add(BuildCard(gameIcon5, "https://store.steampowered.com/app/1228500/1428_Shadows_over_Silesia/", cardWidth, cardHeight, "Immerse yourself in a dark fantasy story with true historical events", CaptionHeight * 1.1f));
        gameRow2.Add(Spacer(CardSpacing, horizontal: true));
        gameRow2.Add(BuildCard(gameIcon6, "https://store.steampowered.com/app/3516100/Tenebyss/", cardWidth, cardHeight, "A brutal souls-like extraction adventure game set in massive dystopian worlds", CaptionHeight * 1.1f));
        gamesContent.Add(gameRow2);
        gamesContent.Add(Spacer(4));
        parent.Add(gamesContent);
    }

    private VisualElement BuildCollapsibleSeparator(string label, VisualElement contentTarget,
        System.Func<bool> getExpanded, System.Action<bool> setExpanded)
    {
        var row = new VisualElement();
        row.style.flexDirection = FlexDirection.Row;
        row.style.alignItems = Align.Center;
        row.style.height = 20;

        var leftLine = new VisualElement();
        leftLine.style.flexGrow = 1;
        leftLine.style.height = 1;
        leftLine.style.backgroundColor = new Color(1f, 1f, 1f, 0.15f);
        leftLine.style.marginRight = 4;

        var labelEl = new Label(label);
        labelEl.style.unityFontStyleAndWeight = FontStyle.Bold;
        labelEl.style.unityTextAlign = TextAnchor.MiddleCenter;

        var rightLine = new VisualElement();
        rightLine.style.flexGrow = 1;
        rightLine.style.height = 1;
        rightLine.style.backgroundColor = new Color(1f, 1f, 1f, 0.15f);
        rightLine.style.marginLeft = 4;
        rightLine.style.marginRight = 4;

        var arrowLabel = new Label(getExpanded() ? "▼" : "▶");
        arrowLabel.style.color = new Color(0.6f, 0.6f, 0.6f, 1f);
        arrowLabel.style.fontSize = 10;
        arrowLabel.style.unityTextAlign = TextAnchor.MiddleRight;
        arrowLabel.style.width = 16;

        row.Add(leftLine);
        row.Add(labelEl);
        row.Add(rightLine);
        row.Add(arrowLabel);

        row.RegisterCallback<MouseEnterEvent>(evt => row.style.backgroundColor = new Color(1f, 1f, 1f, 0.04f));
        row.RegisterCallback<MouseLeaveEvent>(evt => row.style.backgroundColor = Color.clear);
        row.RegisterCallback<ClickEvent>(evt =>
        {
            bool newVal = !getExpanded();
            setExpanded(newVal);
            contentTarget.style.display = newVal ? DisplayStyle.Flex : DisplayStyle.None;
            arrowLabel.text = newVal ? "▼" : "▶";
        });

        return row;
    }

    // --- Widget builders -----------------------------------------------------

    private VisualElement BuildPanel(System.Action<VisualElement> content)
    {
        Color bg = EditorGUIUtility.isProSkin
            ? new Color(0.22f, 0.22f, 0.22f, 1f)
            : new Color(0.82f, 0.82f, 0.82f, 1f);
        Color border = EditorGUIUtility.isProSkin
            ? new Color(0.13f, 0.13f, 0.13f, 1f)
            : new Color(0.58f, 0.58f, 0.58f, 1f);

        var panel = new VisualElement();
        panel.style.backgroundColor = bg;
        panel.style.paddingTop = 8;
        panel.style.paddingBottom = 8;
        panel.style.paddingLeft = 6;
        panel.style.paddingRight = 6;
        panel.style.borderTopWidth = 1;
        panel.style.borderBottomWidth = 1;
        panel.style.borderLeftWidth = 1;
        panel.style.borderRightWidth = 1;
        panel.style.borderTopColor = border;
        panel.style.borderBottomColor = border;
        panel.style.borderLeftColor = border;
        panel.style.borderRightColor = border;
        RoundCorners(panel, 8);
        content(panel);
        return panel;
    }

    private VisualElement BuildLinkCard(string title, string description, string url)
    {
        var container = new VisualElement();
        container.style.width = LinkButtonWidth;
        container.style.paddingRight = 4;

        var btn = new Button(() => Application.OpenURL(url));
        btn.text = title;
        btn.style.height = 26;
        RoundCorners(btn, 6);
        container.Add(btn);

        var desc = new Label(description);
        desc.style.whiteSpace = WhiteSpace.Normal;
        desc.style.fontSize = 9;
        container.Add(desc);

        container.Add(Spacer(6));
        return container;
    }

    private VisualElement BuildCard(Texture2D icon, string url, float cardWidth, float cardHeight,
        string caption = null, float captionHeight = CaptionHeight)
    {
        var container = new VisualElement();
        container.style.width = cardWidth;
        container.style.flexDirection = FlexDirection.Column;
        container.style.alignItems = Align.Center;

        var imgWrap = new VisualElement();
        imgWrap.style.width = cardWidth;
        imgWrap.style.height = cardHeight;
        imgWrap.style.overflow = Overflow.Hidden;
        imgWrap.style.borderTopWidth = 2;
        imgWrap.style.borderBottomWidth = 2;
        imgWrap.style.borderLeftWidth = 2;
        imgWrap.style.borderRightWidth = 2;
        imgWrap.style.borderTopColor = new Color(0.1f, 0.1f, 0.1f, 1f);
        imgWrap.style.borderBottomColor = new Color(0.1f, 0.1f, 0.1f, 1f);
        imgWrap.style.borderLeftColor = new Color(0.1f, 0.1f, 0.1f, 1f);
        imgWrap.style.borderRightColor = new Color(0.1f, 0.1f, 0.1f, 1f);
        RoundCorners(imgWrap, 6);

        if (icon != null)
        {
            var img = new Image();
            img.image = icon;
            img.scaleMode = ScaleMode.ScaleToFit;
            img.style.width = cardWidth;
            img.style.height = cardHeight;
            imgWrap.Add(img);
        }

        imgWrap.RegisterCallback<MouseEnterEvent>(evt => imgWrap.style.backgroundColor = new Color(1f, 1f, 1f, 0.08f));
        imgWrap.RegisterCallback<MouseLeaveEvent>(evt => imgWrap.style.backgroundColor = Color.clear);
        imgWrap.RegisterCallback<ClickEvent>(evt => Application.OpenURL(url));

        container.Add(imgWrap);

        if (caption != null)
        {
            container.Add(Spacer(3));
            var captionLabel = new Label(caption);
            captionLabel.style.width = cardWidth;
            captionLabel.style.height = captionHeight;
            captionLabel.style.whiteSpace = WhiteSpace.Normal;
            captionLabel.style.unityTextAlign = TextAnchor.UpperCenter;
            captionLabel.style.fontSize = 11;
            container.Add(captionLabel);
        }

        return container;
    }

    private static VisualElement BuildSocialIcon(Texture2D icon, string url)
    {
        if (icon == null) return new VisualElement();

        var img = new Image();
        img.image = icon;
        img.scaleMode = ScaleMode.ScaleToFit;
        img.style.width = SocialIconSize;
        img.style.height = SocialIconSize;
        img.style.marginRight = SocialIconSpacing;
        img.RegisterCallback<MouseEnterEvent>(evt => img.style.opacity = 0.75f);
        img.RegisterCallback<MouseLeaveEvent>(evt => img.style.opacity = 1f);
        img.RegisterCallback<ClickEvent>(evt => Application.OpenURL(url));
        return img;
    }

    // --- Style helpers -------------------------------------------------------

    private static Label SectionTitle(string text)
    {
        var label = new Label(text);
        label.style.unityFontStyleAndWeight = FontStyle.Bold;
        label.style.unityTextAlign = TextAnchor.MiddleCenter;
        label.style.fontSize = 12;
        return label;
    }

    private static Label SectionDesc(string text)
    {
        var label = new Label(text);
        label.style.whiteSpace = WhiteSpace.Normal;
        label.style.fontSize = 11;
        return label;
    }

    private static VisualElement Spacer(float size, bool horizontal = false)
    {
        var s = new VisualElement();
        if (horizontal) s.style.width = size;
        else s.style.height = size;
        return s;
    }

    private static void RoundCorners(VisualElement el, int radius)
    {
        el.style.borderTopLeftRadius = radius;
        el.style.borderTopRightRadius = radius;
        el.style.borderBottomLeftRadius = radius;
        el.style.borderBottomRightRadius = radius;
    }
}