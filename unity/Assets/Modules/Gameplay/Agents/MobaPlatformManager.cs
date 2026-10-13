using UnityEngine;
using UnityEngine.UI;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Gerenciador de Plataforma (Mobile vs Desktop).
    /// Se buildar/executar no Android/iOS: ativa o Joystick e botões de toque mobile.
    /// Se buildar/executar no Desktop (Windows/Mac/Linux): ativa a barra de ações estilo LoL PC e controles de mouse/teclado.
    /// No Unity Editor, permite alternar facilmente entre ambos para testes.
    /// </summary>
    public class MobaPlatformManager : MonoBehaviour
    {
        public enum PlatformMode
        {
            Auto,           // Detecta automaticamente com base na plataforma de build
            ForceMobile,    // Força layout de toque do Android/iOS
            ForceDesktop    // Força layout de Teclado/Mouse do Desktop PC
        }

        [Header("Modo de Operação")]
        [SerializeField] private PlatformMode platformMode = PlatformMode.Auto;

        [Header("Containers de Interface")]
        [SerializeField] private GameObject mobileHudContainer;
        [SerializeField] private GameObject desktopHudContainer;

        [Header("UI Feedback")]
        [SerializeField] private Text hintText;
        [SerializeField] private Text platformToggleText;

        public PlatformMode CurrentPlatformMode => platformMode;
        public bool IsMobileActive { get; private set; }

        private void Awake()
        {
            ApplyPlatform();
        }

        private void Start()
        {
            ApplyPlatform();
        }

        public void SetPlatformMode(PlatformMode mode)
        {
            platformMode = mode;
            ApplyPlatform();
        }

        /// <summary>
        /// Alterna entre Mobile e Desktop para teste imediato.
        /// </summary>
        public void TogglePlatform()
        {
            if (IsMobileActive)
            {
                SetPlatformMode(PlatformMode.ForceDesktop);
            }
            else
            {
                SetPlatformMode(PlatformMode.ForceMobile);
            }
        }

        public void ApplyPlatform()
        {
            switch (platformMode)
            {
                case PlatformMode.ForceMobile:
                    IsMobileActive = true;
                    break;
                case PlatformMode.ForceDesktop:
                    IsMobileActive = false;
                    break;
                case PlatformMode.Auto:
                default:
#if UNITY_ANDROID || UNITY_IOS
                    IsMobileActive = true;
#elif UNITY_STANDALONE
                    IsMobileActive = false;
#else
                    // No Unity Editor: verifica se a emulação ou touch nativo está ativo
                    IsMobileActive = Application.isMobilePlatform;
#endif
                    break;
            }

            if (mobileHudContainer != null)
            {
                mobileHudContainer.SetActive(IsMobileActive);
            }

            if (desktopHudContainer != null)
            {
                desktopHudContainer.SetActive(!IsMobileActive);
            }

            if (hintText != null)
            {
                hintText.text = IsMobileActive
                    ? "Mover: Joystick  |  Atacar: Botão / Espaço  |  Poderes: Q, W, E, R"
                    : "🖱️ Botão Direito: Mover  |  🖱️ Esquerdo / [Espaço]: Atacar  |  [Q, W, E, R]: Habilidades";
            }

            if (platformToggleText != null)
            {
                platformToggleText.text = IsMobileActive ? "PLATAFORMA: MOBILE" : "PLATAFORMA: DESKTOP";
            }

            Debug.Log($"[MobaPlatformManager] Modo ativo: {(IsMobileActive ? "MOBILE (Android)" : "DESKTOP (PC)")}");
        }

        public void Initialize(GameObject mobileContainer, GameObject desktopContainer, Text hint, Text toggleTxt, PlatformMode initialMode = PlatformMode.Auto)
        {
            mobileHudContainer = mobileContainer;
            desktopHudContainer = desktopContainer;
            hintText = hint;
            platformToggleText = toggleTxt;
            platformMode = initialMode;
            ApplyPlatform();
        }
    }
}
