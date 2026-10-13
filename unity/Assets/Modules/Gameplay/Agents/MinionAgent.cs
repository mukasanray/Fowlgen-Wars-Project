using UnityEngine;
using FowlgenWars.Gameplay.Audio;
using FowlgenWars.Gameplay.Feedback;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// POC-UNI-01 & POC-UNI-02: IA autônoma para minions seguirem rotas (Top, Mid, Bot)
    /// e sistema de detecção e combate corpo a corpo com zero alocação de GC (60 FPS mobile).
    /// </summary>
    public class MinionAgent : MonoBehaviour, IDamageable
    {
        [Header("Configuração de Dados (Model)")]
        [SerializeField] private MinionDataSO data;
        [SerializeField] private Team team;
        [SerializeField] private LaneType lane;

        [Header("Componentes Visuais")]
        [SerializeField] private WorldHealthBarView healthBar;
        [SerializeField] private Animator animator;

        [Header("Modelos por Equipe")]
        [SerializeField] private GameObject playerModel;
        [SerializeField] private GameObject enemyModel;

        private int currentHealth;
        private int currentWaypointIndex;
        private WaypointPath path;
        private float nextAttackTime;
        private IDamageable currentTarget;

        // Buffer fixo para evitar alocação de lixo de memória na detecção de colisão (GC Alloc = 0)
        private static readonly Collider[] HitBuffer = new Collider[16];

        public Team UnitTeam => team;
        public Transform TargetTransform => transform;
        public bool IsAlive => currentHealth > 0;
        public LaneType Lane => lane;

        public void Initialize(MinionDataSO minionData, Team minionTeam, LaneType minionLane, WaypointPath waypointPath)
        {
            data = minionData;
            team = minionTeam;
            lane = minionLane;
            path = waypointPath;
            currentWaypointIndex = 0;

            if (playerModel != null) playerModel.SetActive(team == Team.Player);
            if (enemyModel != null) enemyModel.SetActive(team == Team.Enemy);

            currentHealth = data != null ? data.MaxHealth : 100;
            if (animator == null) animator = GetComponentInChildren<Animator>();
            if (animator != null) animator.SetBool("IsDead", false);

            if (healthBar != null)
            {
                healthBar.SetTeamColor(team);
                healthBar.UpdateHealth(currentHealth, data != null ? data.MaxHealth : 100);
            }
        }

        private void Update()
        {
            if (!IsAlive) return;

            // 1. Verificar se o alvo atual ainda é válido
            if (currentTarget != null && (!currentTarget.IsAlive || currentTarget.TargetTransform == null))
            {
                currentTarget = null;
            }

            // 2. Se não tem alvo, procurar inimigos próximos no raio de ataque
            if (currentTarget == null)
            {
                SearchNearestEnemy();
            }

            // 3. Se encontrou alvo no alcance, atacar
            if (currentTarget != null)
            {
                float distance = Vector3.Distance(transform.position, currentTarget.TargetTransform.position);
                float attackRange = data != null ? data.AttackRange : 1.8f;

                if (distance <= attackRange)
                {
                    if (animator != null) animator.SetFloat("Speed", 0f);
                    RotateTowards(currentTarget.TargetTransform.position);
                    ExecuteAttack();
                    return;
                }
                else
                {
                    // Anda em direção ao alvo se estiver fora do alcance
                    MoveTowards(currentTarget.TargetTransform.position);
                    return;
                }
            }

            // 4. Sem alvo no combate: avançar pela rota de waypoints
            AdvanceOnWaypoints();
        }

        private void SearchNearestEnemy()
        {
            float searchRadius = data != null ? (data.AttackRange * 2.5f) : 4.5f;
            int hits = Physics.OverlapSphereNonAlloc(transform.position, searchRadius, HitBuffer);

            float closestDistance = float.MaxValue;
            IDamageable bestTarget = null;

            for (int i = 0; i < hits; i++)
            {
                Collider col = HitBuffer[i];
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

            currentTarget = bestTarget;
        }

        private void ExecuteAttack()
        {
            if (Time.time < nextAttackTime) return;

            float interval = data != null ? data.AttackInterval : 1.2f;
            int damage = data != null ? data.AttackDamage : 15;

            nextAttackTime = Time.time + interval;
            if (animator != null) animator.SetTrigger("Attack");
            currentTarget?.TakeDamage(damage);
        }

        private void AdvanceOnWaypoints()
        {
            if (path == null || path.Count == 0) return;

            Vector3 targetPoint = path.GetPoint(currentWaypointIndex, team);
            targetPoint.y = transform.position.y; // Manter no mesmo plano de chão

            float distance = Vector3.Distance(transform.position, targetPoint);
            if (distance < 0.6f)
            {
                if (currentWaypointIndex < path.Count - 1)
                {
                    currentWaypointIndex++;
                }
            }

            MoveTowards(targetPoint);
        }

        private void MoveTowards(Vector3 targetPosition)
        {
            float speed = data != null ? data.MoveSpeed : 3.5f;
            if (animator != null) animator.SetFloat("Speed", speed);
            RotateTowards(targetPosition);

            Vector3 dir = (targetPosition - transform.position).normalized;
            transform.position += dir * (speed * Time.deltaTime);
        }

        private void RotateTowards(Vector3 targetPosition)
        {
            Vector3 dir = (targetPosition - transform.position).normalized;
            dir.y = 0;
            if (dir.sqrMagnitude > 0.001f)
            {
                float rotSpeed = data != null ? data.RotationSpeed : 10f;
                Quaternion lookRot = Quaternion.LookRotation(dir);
                transform.rotation = Quaternion.Slerp(transform.rotation, lookRot, rotSpeed * Time.deltaTime);
            }
        }

        public void TakeDamage(int damage)
        {
            if (!IsAlive) return;
            damage = Mathf.Max(0, damage);
            if (damage == 0) return;
            int maxHp = data != null ? data.MaxHealth : 100;
            currentHealth = Mathf.Clamp(currentHealth - damage, 0, maxHp);
            if (healthBar != null) healthBar.UpdateHealth(currentHealth, maxHp);
            Feedback.FloatingCombatTextManager.SpawnDamage(transform.position, damage);

            // Penas de acordo com a facção do minion
            Color minionFeathers = team == Team.Player ? new Color(0.95f, 0.85f, 0.6f) : new Color(0.85f, 0.35f, 0.45f);
            CombatVFXManager.Instance?.SpawnFeatherBurst(transform.position, 6, minionFeathers);
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.Hit, transform.position, 0.5f);

            if (currentHealth <= 0)
            {
                currentHealth = 0;
                Die();
            }
        }

        private void Die()
        {
            if (animator != null) animator.SetBool("IsDead", true);

            Color minionFeathers = team == Team.Player ? new Color(0.95f, 0.85f, 0.6f) : new Color(0.85f, 0.35f, 0.45f);
            CombatVFXManager.Instance?.SpawnFeatherBurst(transform.position, 15, minionFeathers);
            AudioManager.Instance?.PlayCombatSound(CombatSoundType.FeatherFlutter, transform.position, 0.5f);

            // Desativação limpa para reaproveitamento em pooling futuro
            gameObject.SetActive(false);
            Destroy(gameObject, 0.1f);
        }
    }
}
