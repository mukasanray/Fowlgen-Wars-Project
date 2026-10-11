using UnityEngine;
using UnityEngine.UI;

namespace FowlgenWars.Architecture.Views
{
    /// <summary>
    /// Barra de vida visual no espaço de mundo (sobre tropas e estruturas) com efeito Billboard.
    /// </summary>
    public class WorldHealthBarView : MonoBehaviour
    {
        [SerializeField] private Image fillImage;
        [SerializeField] private Canvas canvas;
        private Camera mainCamera;

        private void Awake()
        {
            mainCamera = Camera.main;
            if (canvas == null) canvas = GetComponent<Canvas>();
        }

        private void LateUpdate()
        {
            if (mainCamera == null)
            {
                mainCamera = Camera.main;
                if (mainCamera == null) return;
            }

            // Billboard suave voltado para a câmera
            transform.rotation = mainCamera.transform.rotation;
        }

        public void UpdateHealth(int currentHp, int maxHp)
        {
            if (fillImage != null && maxHp > 0)
            {
                fillImage.fillAmount = Mathf.Clamp01((float)currentHp / maxHp);
            }
        }

        public void SetColor(Color color)
        {
            if (fillImage != null)
                fillImage.color = color;
        }
    }
}
