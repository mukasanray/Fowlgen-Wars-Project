using UnityEngine;
using FowlgenWars.Modules.MobileControls.Domain.Contracts;
using FowlgenWars.Modules.MobileControls.Presentation.Views;
using FowlgenWars.Modules.MobileControls.Runtime;

namespace FowlgenWars.Modules.MobileControls.DI
{
    /// <summary>
    /// Composition Root / Installer do módulo MobileControls.
    /// Resolve e conecta as dependências internas do módulo sem acoplamento externo.
    /// </summary>
    public class MobileControlsInstaller : MonoBehaviour
    {
        [SerializeField] private VirtualJoystickView joystickView;
        [SerializeField] private MobileInputReader inputReader;

        public IJoystickInput Joystick => joystickView;
        public MobileInputReader InputReader => inputReader;

        private void Awake()
        {
            if (joystickView == null)
                joystickView = GetComponentInChildren<VirtualJoystickView>();

            if (inputReader == null)
                inputReader = GetComponentInChildren<MobileInputReader>();

            if (inputReader != null && joystickView != null)
            {
                inputReader.BindJoystick(joystickView);
            }
        }
    }
}
