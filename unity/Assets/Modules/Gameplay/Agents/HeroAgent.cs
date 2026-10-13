using System;
using UnityEngine;
using FowlgenWars.Gameplay.Audio;
using FowlgenWars.Gameplay.Feedback;

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

        [Header("Feedback Visual & Animação")]
        [SerializeField] private WorldHealthBarView healthBar;
        [SerializeField] private Animator animator;

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
            if (animator == null) animator = GetComponentInChildren<Animator>();
            spawnPosition = transform.position;
            currentHealth = maxHealth;
        }

        private void Start()
        {
            if (healthBar != null)
            {
                healthBar.SetTeamColor(team);
                healthBar.UpdateHealth(currentHealth, maxHealth);
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

            if (animator != null)
            {
                animator.SetBool("IsDead", false);
            }

            if (healthBar != null)
            {
                healthBar.SetTeamColor(team);
                healthBar.UpdateHealth(currentHealth, maxHealth);
            }
        }

        private void Update()
        {
            if (isDead) return;

            // Atualizar parâmetro de locomoção no Animator
            if (animator != null && characterController != null)
            {
                float spd = characterController.velocity.magnitude;
                animator.SetFloat("Speed", spd);
            }

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

            IDamageable target = FindNearestEnemy(attackRange);
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
                AudioManager.Instance?.PlayCombatSound(CombatSoundType.Punch);

                if (animator != null)
                {
                    animator.SetTrigger("Attack");
                }

                if (isAI)
                {
                    Debug.Log($"[Combate IA] {gameObject.name} atacou {target.TargetTransform.name} causando {attackDamage} de dano!");
                }
                return true;
            }

            return false;
        }

        private IDamageable FindNearestEnemy(float searchRadius = 18.0f)
        {
            int hits = Physics.OverlapSphereNonAlloc(transform.position, searchRadius, TargetBuffer);
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
            // 1. Gravidade básica para manter no chão
            if (characterController != null && !characterController.isGrounded)
            {
                characterController.Move(Vector3.down * 9.8f * Time.deltaTime);
            }

            // 2. Busca alvos prioritários no raio de visão e combate agressivo (18 metros)
            IDamageable target = FindNearestEnemy(18.0f);
            if (target != null && target.TargetTransform != null)
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
                    if (moveDir.sqrMagnitude > 0.001f)
                    {
                        transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(moveDir), 8f * Time.deltaTime);
                        characterController.Move(moveDir * (4.5f * Time.deltaTime));
                    }
                }
            }
            else if (characterController != null)
            {
                // 3. Sem inimigos no alcance imediato: avançar ofensivamente em direção à base/linha do jogador
                Vector3 objectiveTarget = new Vector3(0f, transform.position.y, 8.0f);
                Vector3 moveDir = (objectiveTarget - transform.position).normalized;
                moveDir.y = 0;
                if (moveDir.sqrMagnitude > 0.001f)
                {
                    transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(moveDir), 4f * Time.deltaTime);
                    characterController.Move(moveDir * (3.0f * Time.deltaTime));
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
            FloatingCombatTextManager.SpawnHeal(transform.position, amount);
            CombatVFXManager.Instance?.SpawnHealAura(transform.position);
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.Heal);
        }

        public void TakeDamage(int damage)
        {
            if (isDead) return;
            damage = Mathf.Max(0, damage);
            if (damage == 0) return;
            currentHealth = Mathf.Clamp(currentHealth - damage, 0, maxHealth);
            if (healthBar != null) healthBar.UpdateHealth(currentHealth, maxHealth);
            Feedback.FloatingCombatTextManager.SpawnDamage(transform.position, damage);
            if (animator != null && currentHealth > 0) animator.SetTrigger("Hit");

            // Feedback visual de impacto de penas e som
            Color featherCol = team == Team.Player ? new Color(1f, 0.95f, 0.8f) : new Color(0.45f, 0.25f, 0.6f);
            CombatVFXManager.Instance?.SpawnHitImpact(transform.position);
            CombatVFXManager.Instance?.SpawnFeatherBurst(transform.position, 12, featherCol);
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.Hit);

            if (currentHealth <= 0)
            {
                currentHealth = 0;
                if (healthBar != null) healthBar.UpdateHealth(0, maxHealth);
                Die();
            }
        }

        private void Die()
        {
            isDead = true;
            OnHeroDied?.Invoke(this);

            CombatVFXManager.Instance?.SpawnFeatherBurst(transform.position, 30, Color.red);
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.RoosterCrow);

            if (animator != null)
            {
                animator.SetBool("IsDead", true);
            }

            if (characterController != null) characterController.enabled = false;
            if (healthBar != null) healthBar.UpdateHealth(0, maxHealth);

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

            if (animator != null)
            {
                animator.SetBool("IsDead", false);
            }

            var renderers = GetComponentsInChildren<Renderer>();
            foreach (var r in renderers) r.enabled = true;

            if (characterController != null) characterController.enabled = true;
            if (healthBar != null)
            {
                healthBar.gameObject.SetActive(true);
                healthBar.SetTeamColor(team);
                healthBar.UpdateHealth(currentHealth, maxHealth);
            }

            OnHeroRespawned?.Invoke(this);
        }
    }
}
