using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

namespace FowlgenWars.Gameplay.UI
{
    /// <summary>
    /// EAP Item 37: Menu de Pausa com Reinício e Saída.
    /// Modal pausando Time.timeScale com opções: Continuar, Reiniciar e Sair para a tela Play.
    /// </summary>
    public class MatchPauseMenuController : MonoBehaviour
    {
        [Header("Painel Modal")]
        [SerializeField] private GameObject pausePanel;
        [SerializeField] private Button btnPauseToggle;
        [SerializeField] private Button btnResume;
        [SerializeField] private Button btnRestart;
        [SerializeField] private Button btnQuit;

        private bool isPaused = false;

        public bool IsPaused => isPaused;

        private void Start()
        {
            if (btnPauseToggle != null) btnPauseToggle.onClick.AddListener(TogglePause);
            if (btnResume != null) btnResume.onClick.AddListener(Resume);
            if (btnRestart != null) btnRestart.onClick.AddListener(RestartMatch);
            if (btnQuit != null) btnQuit.onClick.AddListener(QuitToPlay);

            if (pausePanel != null) pausePanel.SetActive(false);
        }

        public void TogglePause()
        {
            if (isPaused) Resume();
            else Pause();
        }

        public void Pause()
        {
            isPaused = true;
            Time.timeScale = 0f;
            if (pausePanel != null) pausePanel.SetActive(true);
        }

        public void Resume()
        {
            isPaused = false;
            Time.timeScale = 1f;
            if (pausePanel != null) pausePanel.SetActive(false);
        }

        public void RestartMatch()
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene("Arena_Clean");
        }

        public void QuitToPlay()
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene("Play");
        }

        private void OnDestroy()
        {
            // Garantir restauração de timescale caso o objeto seja destruído
            Time.timeScale = 1f;
        }
    }
}
