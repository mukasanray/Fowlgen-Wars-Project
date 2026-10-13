using System;
using UnityEngine;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Herói do Mini-MOBA (inspirado em Mobile Legends / LoL).
    /// Nasce na base, combate tropas e estruturas, e tem respawn automático.
    /// </summary>
    public class HeroAgent : MonoBehaviour, IDamageable
    {
        [Header("Identificação e Equipe")]
        [SerializeField] private string heroName = "Galo Guerreiro";
        [SerializeField] private Team team = Team.Player;
        [SerializeField] private bool isAI = false;

        [Header("Atributos de Combate")]
        [SerializeField] private int maxHealth = 600;
        [SerializeField] private int attackDamage = 45;
        [SerializeField] private float attackRange = 3.5f;
        [SerializeField] private float attackInterval = 0.9f;
        [SerializeField] private float respawnTime = 6.0f;

        [Header("Feedback Visual")]
        [SerializeField] private WorldHealthBarView healthBar;

        private int currentHealth;
        private float nextAttackTime;
        private Vector3 spawnPosition;
        private bool isDead;
        private CharacterController characterController;

        // Buffer fixo para zero GC no combate (60 FPS mobile)
        private static readonly Collider[] TargetBuffer = new Collider[16];

        public Team UnitTeam => team;
        public Transform TargetTransform => transform;
        public bool IsAlive => !isDead && currentHealth > 0;
        public int CurrentHealth => currentHealth;
        public int MaxHealth => maxHealth;
        public string HeroName => heroName;

        public event Action<HeroAgent> OnHeroDied;
        public event Action<HeroAgent> OnHeroRespawned;

        private void Awake()
        {
            characterController = GetComponent<CharacterController>();
            spawnPosition = transform.position;
            currentHealth = maxHealth;
        }

        private void Start()
        {
            if (healthBar != null)
            {
                healthBar.UpdateHealth(currentHealth, maxHealth);
                healthBar.SetColor(team == Team.Player ? new Color(0.2f, 0.8f, 1f) : new Color(1f, 0.2f, 0.2f));
            }
        }

        public void Initialize(Team heroTeam, Vector3 baseSpawnPoint, bool controlledByAI = false)
        {
            team = heroTeam;
            spawnPosition = baseSpawnPoint;
            isAI = controlledByAI;
            transform.position = spawnPosition;
            currentHealth = maxHealth;
            isDead = false;

            if (healthBar != null)
            {
                healthBar.UpdateHealth(currentHealth, maxHealth);
                healthBar.SetColor(team == Team.Player ? new Color(0.2f, 0.8f, 1f) : new Color(1f, 0.2f, 0.2f));
            }
        }

        private void Update()
        {
            if (isDead) return;

            // Se for controlado por IA adversária, buscar alvos e combater automaticamente
            if (isAI)
            {
                UpdateAIBehavior();
            }
        }

        /// <summary>
        /// Acionado pelo botão de Ataque do HUD (estilo Mobile Legends / LoL) ou tecla de atalho.
        /// </summary>
        public bool ExecuteBasicAttack()
        {
            if (isDead || Time.time < nextAttackTime) return false;

            IDamageable target = FindNearestEnemy();
            if (target != null)
            {
                // Rotacionar em direção ao alvo
                Vector3 dir = (target.TargetTransform.position - transform.position).normalized;
                dir.y = 0;
                if (dir.sqrMagnitude > 0.001f)
                {
                    transform.rotation = Quaternion.LookRotation(dir);
                }

                nextAttackTime = Time.time + attackInterval;
                target.TakeDamage(attackDamage);

                // Feedback sonoro/visual futuro (VFX de corte)
                return true;
            }

            return false;
        }

        private IDamageable FindNearestEnemy()
        {
            int hits = Physics.OverlapSphereNonAlloc(transform.position, attackRange, TargetBuffer);
            float closestDistance = float.MaxValue;
            IDamageable bestTarget = null;

            for (int i = 0; i < hits; i++)
            {
                Collider col = TargetBuffer[i];
                if (col.gameObject == gameObject) continue;

                IDamageable damageable = col.GetComponentInParent<IDamageable>();
                if (damageable != null && damageable.IsAlive && damageable.UnitTeam != team)
                {
                    float dist = Vector3.Distance(transform.position, damageable.TargetTransform.position);
                    if (dist < closestDistance)
                    {
                        closestDistance = dist;
                        bestTarget = damageable;
                    }
                }
            }

            return bestTarget;
        }

        private void UpdateAIBehavior()
        {
            // Busca alvos no raio de visão (6 metros)
            IDamageable target = FindNearestEnemy();
            if (target != null)
            {
                float dist = Vector3.Distance(transform.position, target.TargetTransform.position);
                if (dist <= attackRange)
                {
                    ExecuteBasicAttack();
                }
                else if (characterController != null)
                {
                    Vector3 moveDir = (target.TargetTransform.position - transform.position).normalized;
                    moveDir.y = 0;
                    transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(moveDir), 8f * Time.deltaTime);
                    characterController.Move(moveDir * (3.5f * Time.deltaTime));
                }
            }
        }

        public void Heal(int amount)
        {
            if (isDead) return;
            currentHealth = Mathf.Min(maxHealth, currentHealth + Mathf.Max(0, amount));
            if (healthBar != null)
            {
                healthBar.UpdateHealth(currentHealth, maxHealth);
            }
        }

        public void TakeDamage(int damage)
        {
            if (isDead) return;

            currentHealth -= Mathf.Max(0, damage);
            if (healthBar != null)
            {
                healthBar.UpdateHealth(currentHealth, maxHealth);
            }

            if (currentHealth <= 0)
            {
                currentHealth = 0;
                Die();
            }
        }

        private void Die()
        {
            isDead = true;
            OnHeroDied?.Invoke(this);

            if (characterController != null) characterController.enabled = false;
            if (healthBar != null) healthBar.gameObject.SetActive(false);

            // Desativar renderers temporariamente
            var renderers = GetComponentsInChildren<Renderer>();
            foreach (var r in renderers) r.enabled = false;

            // Iniciar contagem regressiva de Respawn na base
            Invoke(nameof(RespawnAtBase), respawnTime);
        }

        private void RespawnAtBase()
        {
            isDead = false;
            currentHealth = maxHealth;
            transform.position = spawnPosition;

            var renderers = GetComponentsInChildren<Renderer>();
            foreach (var r in renderers) r.enabled = true;

            if (characterController != null) characterController.enabled = true;
            if (healthBar != null)
            {
                healthBar.gameObject.SetActive(true);
                healthBar.UpdateHealth(currentHealth, maxHealth);
            }

            OnHeroRespawned?.Invoke(this);
        }
    }
}
