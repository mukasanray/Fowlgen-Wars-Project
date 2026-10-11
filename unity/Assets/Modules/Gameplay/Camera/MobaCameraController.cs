using UnityEngine;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Câmera Isométrica estilo MOBA (Mobile Legends / League of Legends / Wild Rift).
    /// Segue o herói suavemente pelo mapa com perspectiva inclinada ampla.
    /// </summary>
    public class MobaCameraController : MonoBehaviour
    {
        [Header("Alvo")]
        [SerializeField] private Transform target;

        [Header("Configuração de Enquadramento MOBA")]
        [SerializeField] private Vector3 offset = new Vector3(0, 16f, -14f);
        [SerializeField] private float smoothSpeed = 6f;
        [SerializeField] private float cameraAngle = 50f;

        private void Start()
        {
            transform.rotation = Quaternion.Euler(cameraAngle, 0, 0);
        }

        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
        }

        private void LateUpdate()
        {
            if (target == null) return;

            Vector3 desiredPosition = target.position + offset;
            transform.position = Vector3.Lerp(transform.position, desiredPosition, smoothSpeed * Time.deltaTime);
        }
    }
}
