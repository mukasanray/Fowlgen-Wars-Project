using UnityEngine;
using FowlgenWars.Modules.MobileControls.Domain.Contracts;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// POC-UNI-01: Controle do personagem via Joystick Virtual Touch (MobileControls) ou Teclado (Editor).
    /// Compatível com CharacterController.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class MobilePlayerController : MonoBehaviour
    {
        [Header("Configuração de Movimentação")]
        [SerializeField] private float moveSpeed = 5.0f;
        [SerializeField] private float rotationSpeed = 12.0f;
        [SerializeField] private float gravity = 9.81f;

        [Header("Referência da View (Joystick)")]
        [SerializeField] private MonoBehaviour joystickSource;

        private IJoystickInput joystick;
        private CharacterController characterController;
        private Camera mainCamera;
        private Vector3 verticalVelocity;

        private void Awake()
        {
            characterController = GetComponent<CharacterController>();
            mainCamera = Camera.main;

            if (joystickSource is IJoystickInput input)
            {
                joystick = input;
            }
        }

        public void BindJoystick(IJoystickInput joystickInput)
        {
            joystick = joystickInput;
        }

        private void Update()
        {
            if (characterController == null) return;

            // 1. Obter entrada (Joystick mobile ou Teclado no Editor)
            Vector2 input = Vector2.zero;
            if (joystick != null && joystick.InputDirection.sqrMagnitude > 0.01f)
            {
                input = joystick.InputDirection;
            }
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
            input.x = Input.GetAxisRaw("Horizontal");
            input.y = Input.GetAxisRaw("Vertical");
            if (input.sqrMagnitude > 1.0f) input.Normalize();
#endif

            // 2. Converter direção relativa à câmera isométrica / terceira pessoa
            Vector3 moveDirection = Vector3.zero;
            if (mainCamera != null)
            {
                Vector3 forward = mainCamera.transform.forward;
                Vector3 right = mainCamera.transform.right;
                forward.y = 0;
                right.y = 0;
                forward.Normalize();
                right.Normalize();

                moveDirection = (forward * input.y + right * input.x);
            }
            else
            {
                moveDirection = new Vector3(input.x, 0, input.y);
            }

            // 3. Rotação suave do personagem
            if (moveDirection.sqrMagnitude > 0.001f)
            {
                Quaternion targetRotation = Quaternion.LookRotation(moveDirection);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);
            }

            // 4. Aplicação de gravidade simples para manter colisão no chão
            if (characterController.isGrounded)
            {
                verticalVelocity.y = -0.5f;
            }
            else
            {
                verticalVelocity.y -= gravity * Time.deltaTime;
            }

            // 5. Mover CharacterController
            Vector3 finalMotion = (moveDirection * moveSpeed + verticalVelocity) * Time.deltaTime;
            characterController.Move(finalMotion);
        }
    }
}
