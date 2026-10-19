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
            BindRuntimeState();
            RefreshFromState();
        }

        private void OnEnable()
        {
            BindRuntimeState();
            // Caso GameMatchManager já tenha inicializado antes deste OnEnable (ordem de Start indefinida),
            // garante que o HUD reflita o valor atual sem esperar o próximo Update.
            if (runtimeState != null && runtimeState.RemainingSeconds > 0f)
            {
                HandleTimerUpdated(runtimeState.RemainingSeconds);
                UpdateBaseStatus();
            }
        }
        private void OnDisable() => UnbindRuntimeState();
        private void OnDestroy() => UnbindRuntimeState();

        private void BindRuntimeState()
        {
            if (runtimeState == null) return;
            runtimeState.OnTimerUpdated -= HandleTimerUpdated;
            runtimeState.OnPlayerHpUpdated -= HandlePlayerHpUpdated;
            runtimeState.OnEnemyHpUpdated -= HandleEnemyHpUpdated;
            runtimeState.OnStateChanged -= HandleStateChanged;
            runtimeState.OnTimerUpdated += HandleTimerUpdated;
            runtimeState.OnPlayerHpUpdated += HandlePlayerHpUpdated;
            runtimeState.OnEnemyHpUpdated += HandleEnemyHpUpdated;
            runtimeState.OnStateChanged += HandleStateChanged;
        }

        private void UnbindRuntimeState()
        {
            if (runtimeState == null) return;
            runtimeState.OnTimerUpdated -= HandleTimerUpdated;
            runtimeState.OnPlayerHpUpdated -= HandlePlayerHpUpdated;
            runtimeState.OnEnemyHpUpdated -= HandleEnemyHpUpdated;
            runtimeState.OnStateChanged -= HandleStateChanged;
        }

        private void RefreshFromState()
        {
            if (runtimeState == null) return;
            HandleTimerUpdated(runtimeState.RemainingSeconds);
            UpdateBaseStatus();
        }

        private void HandleTimerUpdated(float remainingSeconds)
        {
            if (timerText == null) return;
            if (remainingSeconds <= 0f)
            {
                timerText.text = "<color=#FF4444>00:00</color>";
                return;
            }
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

        private void HandleStateChanged(MatchState state)
        {
            if (baseStatusText == null) return;
            if (state == MatchState.Victory)
            {
                baseStatusText.text = "<color=#4CD3A8><b>★ FIM DE TEMPO: VITÓRIA! ★</b></color>";
            }
            else if (state == MatchState.Defeat)
            {
                baseStatusText.text = "<color=#FF5555><b>✖ FIM DE TEMPO: DERROTA! ✖</b></color>";
            }
        }

        private void UpdateBaseStatus()
        {
            if (baseStatusText == null || runtimeState == null) return;
            if (runtimeState.CurrentState != MatchState.Playing) return;
            baseStatusText.text = $"<color=#4CD3A8>Base: {runtimeState.PlayerGalinheiroHp}</color>  |  <color=#FF5555>Inimiga: {runtimeState.EnemyGalinheiroHp}</color>";
        }
    }
}
