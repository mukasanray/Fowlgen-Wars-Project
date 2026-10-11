using UnityEngine;
using FowlgenWars.Architecture.Models;
using FowlgenWars.Architecture.Views;
using FowlgenWars.Gameplay;

namespace FowlgenWars.Architecture.Presenters
{
    /// <summary>
    /// Presenter do MVP: Interliga a GameplayHUDView com o MatchRuntimeStateSO e GameMatchManager.
    /// Desacopla regras matemáticas e de estado da camada visual.
    /// </summary>
    public class MatchPresenter : MonoBehaviour
    {
        [Header("Model (ScriptableObject)")]
        [SerializeField] private MatchRuntimeStateSO runtimeState;

        [Header("View (HUD Mobile)")]
        [SerializeField] private GameplayHUDView hudView;

        [Header("Manager da Partida")]
        [SerializeField] private GameMatchManager matchManager;

        [Header("Herói do Jogador")]
        [SerializeField] private HeroAgent playerHero;

        private void Awake()
        {
            if (hudView == null) hudView = GetComponent<GameplayHUDView>();
            if (matchManager == null) matchManager = FindAnyObjectByType<GameMatchManager>();
            if (playerHero == null)
            {
                var heroGo = GameObject.Find("Player_Hero");
                if (heroGo != null) playerHero = heroGo.GetComponent<HeroAgent>();
            }
        }

        private void OnEnable()
        {
            if (hudView != null)
            {
                hudView.OnSpawnRequested += HandleSpawnRequested;
                hudView.OnAttackRequested += HandleAttackRequested;
            }

            if (runtimeState != null)
            {
                runtimeState.OnTimerUpdated += HandleTimerUpdated;
                runtimeState.OnPlayerHpUpdated += HandlePlayerHpUpdated;
                runtimeState.OnEnemyHpUpdated += HandleEnemyHpUpdated;
            }
        }

        private void OnDisable()
        {
            if (hudView != null)
            {
                hudView.OnSpawnRequested -= HandleSpawnRequested;
                hudView.OnAttackRequested -= HandleAttackRequested;
            }

            if (runtimeState != null)
            {
                runtimeState.OnTimerUpdated -= HandleTimerUpdated;
                runtimeState.OnPlayerHpUpdated -= HandlePlayerHpUpdated;
                runtimeState.OnEnemyHpUpdated -= HandleEnemyHpUpdated;
            }
        }

        private void HandleAttackRequested()
        {
            if (playerHero != null)
            {
                playerHero.ExecuteBasicAttack();
            }
        }

        private void Update()
        {
            if (hudView == null || matchManager == null) return;

            // Atualização contínua de feedback visual de cooldown para as 3 rotas
            UpdateCooldownVisual(LaneType.Top);
            UpdateCooldownVisual(LaneType.Mid);
            UpdateCooldownVisual(LaneType.Bot);
        }

        private void UpdateCooldownVisual(LaneType lane)
        {
            float progress = matchManager.GetSpawnCooldownProgress(lane);
            bool canSpawn = matchManager.CanSpawnMinion(lane);
            hudView.SetCooldownVisual(lane, progress, canSpawn);
        }

        private void HandleSpawnRequested(LaneType lane)
        {
            if (matchManager != null)
            {
                matchManager.RequestPlayerSpawn(lane);
            }
        }

        private void HandleTimerUpdated(float remainingSeconds)
        {
            hudView?.UpdateTimer(remainingSeconds);
        }

        private void HandlePlayerHpUpdated(int current, int max)
        {
            hudView?.UpdatePlayerHp(current, max);
        }

        private void HandleEnemyHpUpdated(int current, int max)
        {
            hudView?.UpdateEnemyHp(current, max);
        }
    }
}
