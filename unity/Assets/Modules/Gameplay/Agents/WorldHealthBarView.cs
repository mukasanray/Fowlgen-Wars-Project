using UnityEngine;
using UnityEngine.UI;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Barra MOBA: BG preto fixo + Fill colorido que encolhe por vidaAtual/vidaMaxima.
    /// Lado A verde #22C55E, Lado B vermelho #EF4444, fundo preto #000000.
    /// Reutiliza sistema de vida/dano/morte/respawn existente — sem duplicar scripts.
    /// </summary>
    public class WorldHealthBarView : MonoBehaviour
    {
        [SerializeField] private Image fillImage;
        [SerializeField] private Image bgImage;
        [SerializeField] private Canvas canvas;
        private Camera mainCamera;

        // spec: cores exatas
        public static readonly Color GreenA = new Color(0x22 / 255f, 0xC5 / 255f, 0x5E / 255f, 1f); // #22C55E
        public static readonly Color RedB   = new Color(0xEF / 255f, 0x44 / 255f, 0x44 / 255f, 1f); // #EF4444
        public static readonly Color BgBlack = Color.black;

        private void Awake()
        {
            mainCamera = Camera.main;
            if (canvas == null) canvas = GetComponent<Canvas>();
            EnsureVisuals();
        }

        private void OnEnable()
        {
            if (mainCamera == null) mainCamera = Camera.main;
            EnsureVisuals();
        }

        private void EnsureVisuals()
        {
            if (canvas == null) canvas = GetComponent<Canvas>();
            var rtCanvas = GetComponent<RectTransform>();
            // corrige barras legadas minúsculas (print: quase invisível)
            if (rtCanvas != null && rtCanvas.sizeDelta.x < 1.9f)
            {
                rtCanvas.sizeDelta = new Vector2(2.4f, 0.36f);
                transform.localPosition = new Vector3(transform.localPosition.x, Mathf.Max(transform.localPosition.y, 1.6f), transform.localPosition.z);
            }
            // BG preto fixo — elemento separado, largura constante, sempre fill 1
            if (bgImage == null)
            {
                var bgTr = transform.Find("BG");
                if (bgTr != null) bgImage = bgTr.GetComponent<Image>();
            }
            if (bgImage == null && fillImage != null)
            {
                // cria BG atrás do fill se não existir
                var bgGo = new GameObject("BG", typeof(RectTransform), typeof(Image));
                bgGo.transform.SetParent(fillImage.transform.parent, false);
                bgGo.transform.SetSiblingIndex(0);
                var rt = bgGo.GetComponent<RectTransform>();
                rt.anchorMin = Vector2.zero; rt.anchorMax = Vector2.one;
                rt.offsetMin = Vector2.zero; rt.offsetMax = Vector2.zero;
                bgImage = bgGo.GetComponent<Image>();
            }
            if (bgImage != null)
            {
                bgImage.color = BgBlack;
                bgImage.raycastTarget = false;
                if (bgImage.type != Image.Type.Simple) bgImage.type = Image.Type.Simple;
            }
            // Fill colorido
            if (fillImage == null)
            {
                var t = transform.Find("Fill");
                if (t != null) fillImage = t.GetComponent<Image>();
                if (fillImage == null) fillImage = GetComponentInChildren<Image>();
            }
            if (fillImage != null)
            {
                fillImage.raycastTarget = false;
                fillImage.type = Image.Type.Filled;
                fillImage.fillMethod = Image.FillMethod.Horizontal;
                fillImage.fillOrigin = 0; // left
                fillImage.fillAmount = Mathf.Clamp01(fillImage.fillAmount);
            }
            // remove rastro legado Fill_Trail (spec: só BG preto + fill)
            var trail = transform.Find("Fill_Trail");
            if (trail != null) DestroyImmediate(trail.gameObject);

            // ordenar: BG atrás, Fill na frente
            if (bgImage != null && fillImage != null)
                fillImage.transform.SetAsLastSibling();
        }

        private void LateUpdate()
        {
            if (mainCamera == null) { mainCamera = Camera.main; if (mainCamera == null) return; }
            transform.rotation = mainCamera.transform.rotation; // billboard MOBA
        }

        /// <summary> pct = vidaAtual/vidaMaxima, clamp 0..1. BG permanece 1, só fill encolhe. </summary>
        public void UpdateHealth(int currentHp, int maxHp)
        {
            if (maxHp <= 0) return;
            EnsureVisuals();
            currentHp = Mathf.Clamp(currentHp, 0, maxHp);
            float pct = (float)currentHp / maxHp;
            pct = Mathf.Clamp01(pct);
            if (fillImage != null) fillImage.fillAmount = pct;
            if (bgImage != null) bgImage.fillAmount = 1f; // garante, se bg for Filled
            // mantém canvas visível mesmo em 0 (fundo preto visível)
            if (!gameObject.activeSelf) gameObject.SetActive(true);
            if (canvas != null && !canvas.gameObject.activeSelf) canvas.gameObject.SetActive(true);
        }

        /// <summary> Define cor do fill por equipe: Lado A #22C55E, Lado B #EF4444. </summary>
        public void SetColor(Color color)
        {
            EnsureVisuals();
            if (fillImage != null) fillImage.color = color;
        }

        public void SetTeamColor(Team team)
        {
            SetColor(team == Team.Player ? GreenA : RedB);
        }
    }
}
