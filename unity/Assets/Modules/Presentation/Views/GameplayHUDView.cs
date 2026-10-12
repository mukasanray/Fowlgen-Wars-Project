using System;
using UnityEngine;
using UnityEngine.UI;
using FowlgenWars.Gameplay;

namespace FowlgenWars.Architecture.Views
{
    /// <summary>
    /// POC-UNI-03: View passiva do HUD Mobile contendo cronômetro regressivo (3 minutos),
    /// barras de HP das bases e botões de spawn para as 3 rotas (Top, Mid, Bot) com visual de cooldown.
    /// </summary>
    public class GameplayHUDView : MonoBehaviour
    {
        [Header("Cronômetro da Partida")]
        [SerializeField] private Text timerText;

        [Header("Barras de HP dos Galinheiros")]
        [SerializeField] private Slider playerHpSlider;
        [SerializeField] private Slider enemyHpSlider;

        [Header("Botões de Spawn de Minions")]
        [SerializeField] private Button spawnTopButton;
        [SerializeField] private Image spawnTopCooldownFill;

        [SerializeField] private Button spawnMidButton;
        [SerializeField] private Image spawnMidCooldownFill;

        [SerializeField] private Button spawnBotButton;
        [SerializeField] private Image spawnBotCooldownFill;

        [Header("Ataque do Herói (Estilo Mobile Legends / LoL)")]
        [SerializeField] private Button attackButton;

        public event Action<LaneType> OnSpawnRequested;
        public event Action OnAttackRequested;

        private void Awake()
        {
            if (spawnTopButton != null)
                spawnTopButton.onClick.AddListener(() => OnSpawnRequested?.Invoke(LaneType.Top));

            if (spawnMidButton != null)
                spawnMidButton.onClick.AddListener(() => OnSpawnRequested?.Invoke(LaneType.Mid));

            if (spawnBotButton != null)
                spawnBotButton.onClick.AddListener(() => OnSpawnRequested?.Invoke(LaneType.Bot));

            if (attackButton != null)
                attackButton.onClick.AddListener(() => OnAttackRequested?.Invoke());
        }

        public void UpdateTimer(float remainingSeconds)
        {
            if (timerText == null) return;

            int minutes = Mathf.FloorToInt(remainingSeconds / 60F);
            int seconds = Mathf.FloorToInt(remainingSeconds - minutes * 60);
            timerText.text = string.Format("{0:00}:{1:00}", minutes, seconds);
        }

        public void UpdatePlayerHp(int current, int max)
        {
            if (playerHpSlider != null && max > 0)
            {
                playerHpSlider.value = Mathf.Clamp01((float)current / max);
            }
        }

        public void UpdateEnemyHp(int current, int max)
        {
            if (enemyHpSlider != null && max > 0)
            {
                enemyHpSlider.value = Mathf.Clamp01((float)current / max);
            }
        }

        public void SetCooldownVisual(LaneType lane, float progressNormalized, bool canSpawn)
        {
            Image targetFill = null;
            Button targetBtn = null;

            switch (lane)
            {
                case LaneType.Top:
                    targetFill = spawnTopCooldownFill;
                    targetBtn = spawnTopButton;
                    break;
                case LaneType.Mid:
                    targetFill = spawnMidCooldownFill;
                    targetBtn = spawnMidButton;
                    break;
                case LaneType.Bot:
                    targetFill = spawnBotCooldownFill;
                    targetBtn = spawnBotButton;
                    break;
            }

            if (targetFill != null)
            {
                targetFill.fillAmount = Mathf.Clamp01(progressNormalized);
            }
            if (targetBtn != null)
            {
                targetBtn.interactable = canSpawn;
            }
        }
    }
}
