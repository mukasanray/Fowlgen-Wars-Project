using UnityEngine;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Câmera Isométrica MOBA Horizontal (Left-to-Right).
    /// Mantém o enquadramento horizontal canônico de Fowlgen Wars:
    /// - Base Amarela (Jogador / Milo) na ESQUERDA da tela.
    /// - Base Roxa (Inimigo / Axel) na DIREITA da tela.
    /// - Rotas, pontes e tropas avançam e combatem horizontalmente.
    /// </summary>
    public class MobaCameraController : MonoBehaviour
    {
        [Header("Alvo")]
        [SerializeField] private Transform target;

        [Header("Modo de Acompanhamento")]
        [Tooltip("Se true, a câmera acompanha o herói suavemente na horizontal (ao longo do eixo Z).")]
        [SerializeField] private bool followTarget = true;

        [Header("Configuração de Enquadramento MOBA Horizontal")]
        [SerializeField] private Vector3 horizontalOffset = new Vector3(-22f, 26f, 0f);
        [SerializeField] private float smoothSpeed = 6f;
        [SerializeField] private float cameraPitch = 40.8f;
        [SerializeField] private float cameraYaw = 88.2f;

        [Header("Limites do Mapa (Eixo Z horizontal)")]
        [SerializeField] private float minZ = -16f;
        [SerializeField] private float maxZ = 16f;

        public float CameraPitch { get => cameraPitch; set { cameraPitch = value; ApplyRotation(); } }
        public float CameraYaw { get => cameraYaw; set { cameraYaw = value; ApplyRotation(); } }

        private void Awake()
        {
            ApplyRotation();
        }

        private void Start()
        {
            ApplyRotation();
        }

        private void OnValidate()
        {
            ApplyRotation();
        }

        public void ApplyRotation()
        {
            transform.rotation = Quaternion.Euler(cameraPitch, cameraYaw, 0f);
        }

        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
        }

        public void SetFollowTarget(bool follow)
        {
            followTarget = follow;
        }

        private void LateUpdate()
        {
            ApplyRotation();

            if (followTarget && target != null)
            {
                // Acompanha o jogador horizontalmente (eixo Z da cena = horizontal na tela com yaw ~88.2°)
                float clampedZ = Mathf.Clamp(target.position.z, minZ, maxZ);
                Vector3 desiredPosition = new Vector3(
                    horizontalOffset.x,
                    horizontalOffset.y,
                    clampedZ + horizontalOffset.z
                );

                transform.position = Vector3.Lerp(transform.position, desiredPosition, smoothSpeed * Time.deltaTime);
            }
        }
    }
}
