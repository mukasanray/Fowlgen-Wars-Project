using System;
using UnityEngine;
using FowlgenWars.Gameplay.Audio;
using FowlgenWars.Gameplay.Feedback;

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
                healthBar.SetTeamColor(team);
                healthBar.UpdateHealth(currentHealth, maxHealth);
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
                healthBar.SetTeamColor(team);
                healthBar.UpdateHealth(currentHealth, maxHealth);
            }
        }

        public void TakeDamage(int damage)
        {
            if (!IsAlive) return;

            currentHealth = Mathf.Clamp(currentHealth - Mathf.Max(0, damage), 0, maxHealth);
            if (healthBar != null)
            {
                healthBar.UpdateHealth(currentHealth, maxHealth);
            }

            FloatingCombatTextManager.SpawnDamage(transform.position + Vector3.up * 2.5f, damage, isCritical: true);
            CombatVFXManager.Instance?.SpawnHitImpact(transform.position + Vector3.up * 2f);
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.Hit);

            SyncWithRuntimeState();

            if (currentHealth <= 0)
            {
                currentHealth = 0;
                if (healthBar != null) healthBar.UpdateHealth(0, maxHealth);
                MobaCameraController.Instance?.Shake(0.5f, 0.6f);
                CombatVFXManager.Instance?.SpawnExplosion(transform.position);
                AudioManager.Instance?.PlayCombatSound(CombatSoundType.Explosion);
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
