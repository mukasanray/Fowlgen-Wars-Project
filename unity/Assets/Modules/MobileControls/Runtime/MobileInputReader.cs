using UnityEngine;
using FowlgenWars.Modules.MobileControls.Domain.Contracts;

namespace FowlgenWars.Modules.MobileControls.Runtime
{
    /// <summary>
    /// Leitor universal de input para mobile e editor.
    /// Combina IJoystickInput (Touch) com Teclado/Gamepad de forma transparente.
    /// </summary>
    public class MobileInputReader : MonoBehaviour
    {
        [SerializeField] private MonoBehaviour joystickSource;

        private IJoystickInput joystick;

        public Vector2 MoveVector { get; private set; }

        private void Awake()
        {
            if (joystickSource is IJoystickInput input)
            {
                joystick = input;
            }
        }

        public void BindJoystick(IJoystickInput input)
        {
            joystick = input;
        }

        private void Update()
        {
            Vector2 input = Vector2.zero;

            // 1. Prioridade para joystick touch mobile
            if (joystick != null && joystick.InputDirection.sqrMagnitude > 0.01f)
            {
                input = joystick.InputDirection;
            }

            // 2. Fallback para Teclado (Editor / Testes)
#if ENABLE_INPUT_SYSTEM
            var kb = UnityEngine.InputSystem.Keyboard.current;
            if (kb != null)
            {
                if (kb.wKey.isPressed || kb.upArrowKey.isPressed) input.y += 1f;
                if (kb.sKey.isPressed || kb.downArrowKey.isPressed) input.y -= 1f;
                if (kb.aKey.isPressed || kb.leftArrowKey.isPressed) input.x -= 1f;
                if (kb.dKey.isPressed || kb.rightArrowKey.isPressed) input.x += 1f;
                if (input.sqrMagnitude > 1.0f) input.Normalize();
            }
#else
            float h = Input.GetAxisRaw("Horizontal");
            float v = Input.GetAxisRaw("Vertical");
            if (Mathf.Abs(h) > 0.1f || Mathf.Abs(v) > 0.1f)
            {
                input = new Vector2(h, v).normalized;
            }
#endif

            MoveVector = input;
        }
    }
}
