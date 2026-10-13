using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace FowlgenWars.Gameplay.Feedback
{
    /// <summary>
    /// EAP Item 28: Floating Combat Text com dano animado e zero GC Alloc.
    /// Exibe números flutuantes de dano (laranja/amarelo) e cura (verde) no espaço 3D.
    /// </summary>
    public class FloatingCombatTextManager : MonoBehaviour
    {
        public static FloatingCombatTextManager Instance { get; private set; }

        private static readonly Queue<FloatingTextItem> Pool = new Queue<FloatingTextItem>();
        private static Font defaultFont;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            if (defaultFont == null)
            {
                defaultFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
                if (defaultFont == null) defaultFont = Resources.GetBuiltinResource<Font>("Arial.ttf");
            }
        }

        public static void SpawnDamage(Vector3 worldPos, int damage, bool isCritical = false)
        {
            EnsureInstance();
            if (Instance == null) return;

            var item = GetOrCreateItem();
            string text = isCritical ? $"-{damage}!" : $"-{damage}";
            Color color = isCritical ? new Color(1f, 0.85f, 0.2f, 1f) : new Color(1f, 0.45f, 0.2f, 1f);
            float scale = isCritical ? 1.35f : 1.0f;

            item.Launch(worldPos + Vector3.up * 1.5f, text, color, scale);
        }

        public static void SpawnHeal(Vector3 worldPos, int amount)
        {
            EnsureInstance();
            if (Instance == null) return;

            var item = GetOrCreateItem();
            item.Launch(worldPos + Vector3.up * 1.5f, $"+{amount}", new Color(0.3f, 0.95f, 0.45f, 1f), 1.1f);
        }

        private static void EnsureInstance()
        {
            if (Instance != null) return;
            var go = new GameObject("FloatingCombatTextManager");
            Instance = go.AddComponent<FloatingCombatTextManager>();
        }

        private static FloatingTextItem GetOrCreateItem()
        {
            while (Pool.Count > 0)
            {
                var pooled = Pool.Dequeue();
                if (pooled != null)
                {
                    pooled.gameObject.SetActive(true);
                    return pooled;
                }
            }

            // Criar novo item no WorldSpace
            var itemGo = new GameObject("FloatingDamageText");
            if (Instance != null) itemGo.transform.SetParent(Instance.transform, false);

            var canvas = itemGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.WorldSpace;
            var rect = itemGo.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(200, 60);

            var txtGo = new GameObject("Text");
            txtGo.transform.SetParent(itemGo.transform, false);
            var txtRect = txtGo.AddComponent<RectTransform>();
            txtRect.anchorMin = Vector2.zero;
            txtRect.anchorMax = Vector2.one;
            txtRect.sizeDelta = Vector2.zero;

            var text = txtGo.AddComponent<Text>();
            text.font = defaultFont;
            text.fontSize = 32;
            text.fontStyle = FontStyle.Bold;
            text.alignment = TextAnchor.MiddleCenter;

            // Contorno suave para legibilidade contra o mapa
            var outline = txtGo.AddComponent<Outline>();
            outline.effectColor = new Color(0f, 0f, 0f, 0.9f);
            outline.effectDistance = new Vector2(2, -2);

            var item = itemGo.AddComponent<FloatingTextItem>();
            item.Initialize(text, canvas);
            return item;
        }

        public static void Recycle(FloatingTextItem item)
        {
            if (item == null) return;
            item.gameObject.SetActive(false);
            Pool.Enqueue(item);
        }
    }

    public class FloatingTextItem : MonoBehaviour
    {
        private Text textComponent;
        private Canvas canvas;
        private Vector3 startPos;
        private Color baseColor;
        private float timer;
        private const float Duration = 0.85f;
        private Camera mainCamera;

        public void Initialize(Text txt, Canvas c)
        {
            textComponent = txt;
            canvas = c;
            mainCamera = Camera.main;
        }

        public void Launch(Vector3 pos, string content, Color color, float scaleMultiplier = 1.0f)
        {
            startPos = pos + new Vector3(Random.Range(-0.3f, 0.3f), 0, Random.Range(-0.3f, 0.3f));
            transform.position = startPos;
            transform.localScale = Vector3.one * (0.015f * scaleMultiplier);

            baseColor = color;
            if (textComponent != null)
            {
                textComponent.text = content;
                textComponent.color = baseColor;
            }

            timer = 0f;
            if (mainCamera == null) mainCamera = Camera.main;
            OrientToCamera();
        }

        private void Update()
        {
            timer += Time.deltaTime;
            float progress = Mathf.Clamp01(timer / Duration);

            // Subir suavemente no ar
            transform.position = startPos + Vector3.up * (progress * 1.4f);

            // Fade out de transparência
            if (textComponent != null)
            {
                Color c = baseColor;
                c.a = 1f - Mathf.Pow(progress, 1.5f);
                textComponent.color = c;
            }

            OrientToCamera();

            if (timer >= Duration)
            {
                FloatingCombatTextManager.Recycle(this);
            }
        }

        private void OrientToCamera()
        {
            if (mainCamera != null)
            {
                transform.rotation = mainCamera.transform.rotation;
            }
        }
    }
}
