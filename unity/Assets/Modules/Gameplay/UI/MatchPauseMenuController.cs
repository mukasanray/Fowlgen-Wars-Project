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

        [Header("Controles de Volume (Opcionais - EAP Item 70)")]
        [SerializeField] private Slider masterVolumeSlider;
        [SerializeField] private Slider sfxVolumeSlider;
        [SerializeField] private Slider bgmVolumeSlider;

        private bool isPaused = false;

        public bool IsPaused => isPaused;

        private void Start()
        {
            if (btnPauseToggle != null) btnPauseToggle.onClick.AddListener(TogglePause);
            if (btnResume != null) btnResume.onClick.AddListener(Resume);
            if (btnRestart != null) btnRestart.onClick.AddListener(RestartMatch);
            if (btnQuit != null) btnQuit.onClick.AddListener(QuitToPlay);

            InitVolumeSliders();

            if (pausePanel != null) pausePanel.SetActive(false);
        }

        private void InitVolumeSliders()
        {
            var audioMgr = Audio.AudioManager.Instance;
            if (audioMgr == null) return;

            if (masterVolumeSlider != null)
            {
                masterVolumeSlider.value = audioMgr.MasterVolume;
                masterVolumeSlider.onValueChanged.AddListener(v => audioMgr.SetMasterVolume(v));
            }
            if (sfxVolumeSlider != null)
            {
                sfxVolumeSlider.value = audioMgr.SfxVolume;
                sfxVolumeSlider.onValueChanged.AddListener(v => audioMgr.SetSfxVolume(v));
            }
            if (bgmVolumeSlider != null)
            {
                bgmVolumeSlider.value = audioMgr.BgmVolume;
                bgmVolumeSlider.onValueChanged.AddListener(v => audioMgr.SetBgmVolume(v));
            }
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
