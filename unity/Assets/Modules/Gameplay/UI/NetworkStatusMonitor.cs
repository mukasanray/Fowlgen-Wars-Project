using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace FowlgenWars.Gameplay.UI
{
    /// <summary>
    /// EAP Item 38: Monitoramento e aviso de perda de conexão de internet durante a partida.
    /// Exibe toast flutuante no topo da tela caso a conectividade com RPC / FishNet caia.
    /// </summary>
    public class NetworkStatusMonitor : MonoBehaviour
    {
        public static NetworkStatusMonitor Instance { get; private set; }

        [Header("Configurações")]
        [SerializeField] private float checkInterval = 2.5f;

        private GameObject toastBanner;
        private Text toastText;
        private Image bannerBg;
        private Coroutine monitorRoutine;
        private Coroutine hideToastRoutine;

        private NetworkReachability lastReachability = NetworkReachability.ReachableViaLocalAreaNetwork;
        private bool isFirstCheck = true;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            BuildToastUI();
        }

        private void Start()
        {
            lastReachability = Application.internetReachability;
            monitorRoutine = StartCoroutine(ConnectivityCheckRoutine());
        }

        private void OnDestroy()
        {
            if (monitorRoutine != null) StopCoroutine(monitorRoutine);
        }

        private void BuildToastUI()
        {
            Canvas canvas = GetComponentInParent<Canvas>();
            if (canvas == null)
            {
                canvas = FindFirstObjectByType<Canvas>();
            }

            toastBanner = new GameObject("NetworkConnectivityBanner");
            if (canvas != null)
            {
                toastBanner.transform.SetParent(canvas.transform, false);
            }
            else
            {
                toastBanner.transform.SetParent(transform, false);
            }

            RectTransform rect = toastBanner.AddComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.5f, 1f);
            rect.anchorMax = new Vector2(0.5f, 1f);
            rect.pivot = new Vector2(0.5f, 1f);
            rect.anchoredPosition = new Vector2(0, -55);
            rect.sizeDelta = new Vector2(480, 42);

            bannerBg = toastBanner.AddComponent<Image>();
            bannerBg.color = new Color(0.12f, 0.08f, 0.08f, 0.92f);

            GameObject textGo = new GameObject("Text");
            textGo.transform.SetParent(toastBanner.transform, false);
            RectTransform tr = textGo.AddComponent<RectTransform>();
            tr.anchorMin = Vector2.zero;
            tr.anchorMax = Vector2.one;
            tr.offsetMin = Vector2.zero;
            tr.offsetMax = Vector2.zero;

            toastText = textGo.AddComponent<Text>();
            toastText.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf") ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
            toastText.fontSize = 16;
            toastText.fontStyle = FontStyle.Bold;
            toastText.alignment = TextAnchor.MiddleCenter;
            toastText.color = Color.yellow;
            toastText.text = "";

            toastBanner.SetActive(false);
        }

        private IEnumerator ConnectivityCheckRoutine()
        {
            var wait = new WaitForSecondsRealtime(checkInterval);

            while (true)
            {
                yield return wait;
                NetworkReachability current = Application.internetReachability;

                if (!isFirstCheck && current != lastReachability)
                {
                    if (current == NetworkReachability.NotReachable)
                    {
                        ShowBanner("⚠️ Conexão de Internet Perdida. Modo de Combate Local Ativo.", new Color(0.85f, 0.25f, 0.25f, 0.95f), Color.white, 5f);
                    }
                    else if (lastReachability == NetworkReachability.NotReachable)
                    {
                        ShowBanner("✅ Conexão com a Internet Restaurada!", new Color(0.15f, 0.65f, 0.35f, 0.95f), Color.white, 3f);
                    }
                }

                lastReachability = current;
                isFirstCheck = false;
            }
        }

        public void ShowBanner(string message, Color bgColor, Color textColor, float duration = 3.5f)
        {
            if (toastBanner == null || toastText == null) return;

            toastText.text = message;
            toastText.color = textColor;
            if (bannerBg != null) bannerBg.color = bgColor;

            toastBanner.SetActive(true);

            if (hideToastRoutine != null) StopCoroutine(hideToastRoutine);
            hideToastRoutine = StartCoroutine(HideBannerAfterDelay(duration));
        }

        private IEnumerator HideBannerAfterDelay(float delay)
        {
            yield return new WaitForSecondsRealtime(delay);
            if (toastBanner != null) toastBanner.SetActive(false);
        }
    }
}
