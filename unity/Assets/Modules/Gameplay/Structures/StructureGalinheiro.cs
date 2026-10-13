using System;
using UnityEngine;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// POC-UNI-02: Galinheiro / Base Principal com colisão, HP e disparo de condição de vitória/derrota.
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public class StructureGalinheiro : MonoBehaviour, IDamageable
    {
        [Header("Equipe e Estado")]
        [SerializeField] private Team team;
        [SerializeField] private int maxHealth = 1000;
        [SerializeField] private MatchRuntimeStateSO runtimeState;

        [Header("Feedback Visual")]
        [SerializeField] private WorldHealthBarView healthBar;

        private int currentHealth;

        public event Action<Team> OnStructureDestroyed;

        public Team UnitTeam => team;
        public Transform TargetTransform => transform;
        public bool IsAlive => currentHealth > 0;
        public int CurrentHealth => currentHealth;
        public int MaxHealth => maxHealth;

        private void Awake()
        {
            currentHealth = maxHealth;
            if (healthBar != null)
            {
                healthBar.UpdateHealth(currentHealth, maxHealth);
                healthBar.SetColor(team == Team.Player ? Color.green : Color.red);
            }
        }

        public void Initialize(int startingMaxHp, MatchRuntimeStateSO stateSO)
        {
            maxHealth = startingMaxHp;
            currentHealth = maxHealth;
            runtimeState = stateSO;

            SyncWithRuntimeState();
            if (healthBar != null)
            {
                healthBar.UpdateHealth(currentHealth, maxHealth);
                healthBar.SetColor(team == Team.Player ? Color.green : Color.red);
            }
        }

        public void TakeDamage(int damage)
        {
            if (!IsAlive) return;

            currentHealth -= Mathf.Max(0, damage);
            if (healthBar != null)
            {
                healthBar.UpdateHealth(currentHealth, maxHealth);
            }

            Feedback.FloatingCombatTextManager.SpawnDamage(transform.position + Vector3.up * 2.5f, damage, isCritical: true);

            SyncWithRuntimeState();

            if (currentHealth <= 0)
            {
                currentHealth = 0;
                MobaCameraController.Instance?.Shake(0.5f, 0.6f);
                OnStructureDestroyed?.Invoke(team);
            }
        }

        private void SyncWithRuntimeState()
        {
            if (runtimeState == null) return;

            if (team == Team.Player)
                runtimeState.UpdatePlayerHp(currentHealth, maxHealth);
            else
                runtimeState.UpdateEnemyHp(currentHealth, maxHealth);
        }
    }
}
