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
        [SerializeField] private Joystick joystickPack;
        [SerializeField] private MonoBehaviour joystickSource;

        [Header("Modo do Joystick")]
        [SerializeField] private JoystickMode joystickMode = JoystickMode.Floating;

        [Header("Animação")]
        [SerializeField] private Animator animator;

        public enum JoystickMode
        {
            Fixed,
            Floating,
            Dynamic
        }

        private IJoystickInput joystick;
        private CharacterController characterController;
        private Camera mainCamera;
        private Vector3 verticalVelocity;

        public Joystick JoystickPack => joystickPack;
        public JoystickMode CurrentJoystickMode => joystickMode;
        public float MoveSpeed { get => moveSpeed; set => moveSpeed = value; }

        private void Awake()
        {
            characterController = GetComponent<CharacterController>();
            if (animator == null) animator = GetComponentInChildren<Animator>();
            mainCamera = Camera.main;

            if (joystickSource is IJoystickInput input)
            {
                joystick = input;
            }

            ApplyJoystickMode();
        }

        public void BindJoystick(IJoystickInput joystickInput)
        {
            joystick = joystickInput;
        }

        public void BindJoystickPack(Joystick js)
        {
            joystickPack = js;
            ApplyJoystickMode();
        }

        public void SetJoystickMode(JoystickMode mode)
        {
            joystickMode = mode;
            ApplyJoystickMode();
        }

        public void CycleJoystickMode()
        {
            joystickMode = (JoystickMode)(((int)joystickMode + 1) % 3);
            ApplyJoystickMode();
        }

        private void ApplyJoystickMode()
        {
            if (joystickPack is VariableJoystick vj)
            {
                switch (joystickMode)
                {
                    case JoystickMode.Fixed:
                        vj.SetMode(JoystickType.Fixed);
                        break;
                    case JoystickMode.Floating:
                        vj.SetMode(JoystickType.Floating);
                        break;
                    case JoystickMode.Dynamic:
                        vj.SetMode(JoystickType.Dynamic);
                        break;
                }
            }
        }

        private void Update()
        {
            if (characterController == null) return;

            // 1. Obter entrada (Joystick Pack, IJoystickInput ou Teclado no Editor)
            Vector2 input = Vector2.zero;
            if (joystickPack != null && joystickPack.Direction.sqrMagnitude > 0.01f)
            {
                input = joystickPack.Direction;
            }
            else if (joystick != null && joystick.InputDirection.sqrMagnitude > 0.01f)
            {
                input = joystick.InputDirection;
            }
            // 2. Fallback de teclado para teste no Editor
            if (input.sqrMagnitude < 0.01f)
            {
#if ENABLE_INPUT_SYSTEM
                var kb = UnityEngine.InputSystem.Keyboard.current;
                if (kb != null)
                {
                    float h = 0f;
                    float v = 0f;
                    if (kb.dKey.isPressed || kb.rightArrowKey.isPressed) h += 1f;
                    if (kb.aKey.isPressed || kb.leftArrowKey.isPressed) h -= 1f;
                    if (kb.wKey.isPressed || kb.upArrowKey.isPressed) v += 1f;
                    if (kb.sKey.isPressed || kb.downArrowKey.isPressed) v -= 1f;
                    if (Mathf.Abs(h) > 0.01f || Mathf.Abs(v) > 0.01f)
                    {
                        input = new Vector2(h, v).normalized;
                    }
                }
#elif ENABLE_LEGACY_INPUT_MANAGER
                float h = Input.GetAxisRaw("Horizontal");
                float v = Input.GetAxisRaw("Vertical");
                if (Mathf.Abs(h) > 0.01f || Mathf.Abs(v) > 0.01f)
                {
                    input = new Vector2(h, v).normalized;
                }
#endif
            }

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

            // 6. Atualizar parâmetro de locomoção no Animator
            if (animator != null)
            {
                float currentSpeed = moveDirection.sqrMagnitude > 0.001f ? (input.magnitude * moveSpeed) : 0f;
                animator.SetFloat("Speed", currentSpeed);
            }
        }
    }
}
