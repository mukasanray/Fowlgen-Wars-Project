using UnityEngine;
using UnityEngine.UI;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Alterna entre os modos do Joystick Pack (Fixed, Floating, Dynamic)
    /// e atualiza o texto de feedback no HUD em tempo real.
    /// </summary>
    public class JoystickModeSwitcher : MonoBehaviour
    {
        [SerializeField] private MobilePlayerController playerController;
        [SerializeField] private Button modeButton;
        [SerializeField] private Text modeText;

        public void Initialize(MobilePlayerController controller, Button button, Text text)
        {
            playerController = controller;
            modeButton = button;
            modeText = text;
            HookEvents();
            UpdateLabel();
        }

        private void Start()
        {
            HookEvents();
            UpdateLabel();
        }

        private void HookEvents()
        {
            if (modeButton != null)
            {
                modeButton.onClick.RemoveListener(OnButtonClicked);
                modeButton.onClick.AddListener(OnButtonClicked);
            }
        }

        private void OnButtonClicked()
        {
            if (playerController == null)
            {
                playerController = FindObjectOfType<MobilePlayerController>();
            }

            if (playerController != null)
            {
                playerController.CycleJoystickMode();
                UpdateLabel();
            }
        }

        public void UpdateLabel()
        {
            if (modeText != null && playerController != null)
            {
                modeText.text = $"MODO: {playerController.CurrentJoystickMode}".ToUpper();
            }
            else if (modeText != null)
            {
                modeText.text = "MODO: FLOATING";
            }
        }
    }
}
