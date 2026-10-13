using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace FowlgenWars.Gameplay.UI
{
    /// <summary>
    /// EAP Item 32: Contagem regressiva de início de partida (3, 2, 1, LUTA!).
    /// Overlay animado antes de liberar o combate.
    /// </summary>
    public class MatchCountdownIntro : MonoBehaviour
    {
        [Header("Elementos de UI")]
        [SerializeField] private GameObject overlayPanel;
        [SerializeField] private Text countdownText;

        public event Action OnCountdownFinished;

        private void Start()
        {
            StartCoroutine(CountdownRoutine());
        }

        private IEnumerator CountdownRoutine()
        {
            if (overlayPanel != null) overlayPanel.SetActive(true);

            string[] steps = { "3", "2", "1", "LUTA!" };
            Color[] colors = {
                new Color(1f, 0.4f, 0.2f, 1f),
                new Color(1f, 0.7f, 0.2f, 1f),
                new Color(1f, 0.95f, 0.3f, 1f),
                new Color(0.2f, 1f, 0.4f, 1f)
            };

            for (int i = 0; i < steps.Length; i++)
            {
                if (countdownText != null)
                {
                    countdownText.text = steps[i];
                    countdownText.color = colors[i];
                }

                // Efeito punch de escala (1.4 -> 1.0)
                float elapsed = 0f;
                float duration = (i == steps.Length - 1) ? 0.7f : 0.85f;
                while (elapsed < duration)
                {
                    elapsed += Time.unscaledDeltaTime;
                    float t = elapsed / duration;
                    if (countdownText != null)
                    {
                        float scale = Mathf.Lerp(1.5f, 1.0f, t);
                        countdownText.transform.localScale = Vector3.one * scale;
                    }
                    yield return null;
                }
            }

            if (overlayPanel != null) overlayPanel.SetActive(false);
            OnCountdownFinished?.Invoke();
        }
    }
}
