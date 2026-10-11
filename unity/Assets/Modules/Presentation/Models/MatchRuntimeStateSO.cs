using System;
using UnityEngine;
using FowlgenWars.Gameplay;

namespace FowlgenWars.Architecture.Models
{
    /// <summary>
    /// Model desacoplado mantido via ScriptableObject para compartilhamento de estado em tempo real.
    /// Presenters e Views observam seus eventos sem dependência direta de managers centralizados.
    /// </summary>
    [CreateAssetMenu(fileName = "MatchRuntimeState", menuName = "Fowlgen Wars/Config/Match Runtime State")]
    public class MatchRuntimeStateSO : ScriptableObject
    {
        [SerializeField] private float remainingSeconds;
        [SerializeField] private int playerGalinheiroHp;
        [SerializeField] private int enemyGalinheiroHp;
        [SerializeField] private MatchState currentState;

        public event Action<float> OnTimerUpdated;
        public event Action<int, int> OnPlayerHpUpdated; // current, max
        public event Action<int, int> OnEnemyHpUpdated;  // current, max
        public event Action<MatchState> OnStateChanged;

        public float RemainingSeconds => remainingSeconds;
        public int PlayerGalinheiroHp => playerGalinheiroHp;
        public int EnemyGalinheiroHp => enemyGalinheiroHp;
        public MatchState CurrentState => currentState;

        public void Initialize(float initialDuration, int maxHp)
        {
            remainingSeconds = initialDuration;
            playerGalinheiroHp = maxHp;
            enemyGalinheiroHp = maxHp;
            currentState = MatchState.Playing;
            OnStateChanged?.Invoke(currentState);
        }

        public void UpdateTimer(float timeRemaining)
        {
            remainingSeconds = Mathf.Max(0f, timeRemaining);
            OnTimerUpdated?.Invoke(remainingSeconds);
        }

        public void UpdatePlayerHp(int current, int max)
        {
            playerGalinheiroHp = Mathf.Max(0, current);
            OnPlayerHpUpdated?.Invoke(playerGalinheiroHp, max);
        }

        public void UpdateEnemyHp(int current, int max)
        {
            enemyGalinheiroHp = Mathf.Max(0, current);
            OnEnemyHpUpdated?.Invoke(enemyGalinheiroHp, max);
        }

        public void SetState(MatchState state)
        {
            currentState = state;
            OnStateChanged?.Invoke(currentState);
        }
    }
}
