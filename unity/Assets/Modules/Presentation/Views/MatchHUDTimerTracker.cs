using UnityEngine;
using UnityEngine.UI;
using FowlgenWars.Gameplay;

namespace FowlgenWars.Architecture.Views
{
    /// <summary>
    /// Exibe o tempo restante da partida (3 minutos) e o status das bases aliada e inimiga no Top HUD.
    /// </summary>
    public class MatchHUDTimerTracker : MonoBehaviour
    {
        [Header("Model de Estado")]
        [SerializeField] private MatchRuntimeStateSO runtimeState;

        [Header("Componentes de UI")]
        [SerializeField] private Text timerText;
        [SerializeField] private Text baseStatusText;

        public void Initialize(MatchRuntimeStateSO state, Text timer, Text baseStatus)
        {
            runtimeState = state;
            timerText = timer;
            baseStatusText = baseStatus;

            if (runtimeState != null)
            {
                runtimeState.OnTimerUpdated += HandleTimerUpdated;
                runtimeState.OnPlayerHpUpdated += HandlePlayerHpUpdated;
                runtimeState.OnEnemyHpUpdated += HandleEnemyHpUpdated;
            }
        }

        private void OnDestroy()
        {
            if (runtimeState != null)
            {
                runtimeState.OnTimerUpdated -= HandleTimerUpdated;
                runtimeState.OnPlayerHpUpdated -= HandlePlayerHpUpdated;
                runtimeState.OnEnemyHpUpdated -= HandleEnemyHpUpdated;
            }
        }

        private void HandleTimerUpdated(float remainingSeconds)
        {
            if (timerText == null) return;
            int minutes = Mathf.FloorToInt(remainingSeconds / 60f);
            int seconds = Mathf.FloorToInt(remainingSeconds % 60f);
            timerText.text = $"{minutes:00}:{seconds:00}";
        }

        private void HandlePlayerHpUpdated(int current, int max)
        {
            UpdateBaseStatus();
        }

        private void HandleEnemyHpUpdated(int current, int max)
        {
            UpdateBaseStatus();
        }

        private void UpdateBaseStatus()
        {
            if (baseStatusText == null || runtimeState == null) return;
            baseStatusText.text = $"<color=#4CD3A8>Base: {runtimeState.PlayerGalinheiroHp}</color>  |  <color=#FF5555>Inimiga: {runtimeState.EnemyGalinheiroHp}</color>";
        }
    }
}
