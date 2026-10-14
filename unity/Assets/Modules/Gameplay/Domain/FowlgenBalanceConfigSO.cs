using UnityEngine;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Fase 1 — Ficha única por unidade (§8.1 doc balanceamento).
    /// Centraliza HP/dano/alcance/vel/recarga para tuning 5–10% no Inspector.
    /// Nenhum % aplicado até métricas de 10 partidas espelhadas.
    /// Fallback: se não atribuído, código usa valores atuais serializados.
    /// ponytail: sem CSV/export; upgrade path: métricas → BalanceMetricsCollector.
    /// </summary>
    [CreateAssetMenu(fileName = "FowlgenBalanceConfig", menuName = "Fowlgen Wars/Config/Balance Config (Fase1)")]
    public class FowlgenBalanceConfigSO : ScriptableObject
    {
        [Header("Partida — ≤180s (§1)")]
        [Tooltip("Duração alvo 180s. Alterar só após métrica fechar partida.")]
        [SerializeField] private float matchDurationSeconds = 180f;
        [SerializeField] private int baseGalinheiroHealth = 1000;
        [SerializeField] private float enemyWaveInterval = 8f;

        [Header("Minion — Ficha §8.1 (todas as rotas)")]
        [SerializeField] private MinionBalance minion = new MinionBalance
        {
            maxHealth = 120,
            attackDamage = 15,
            attackRange = 1.8f,
            attackInterval = 1.2f,
            moveSpeed = 3.5f,
            rotationSpeed = 10f,
            spawnCooldown = 3f
        };

        [Header("Herói Milo (Player) — ficha")]
        [SerializeField] private HeroBalance milo = new HeroBalance
        {
            maxHealth = 1000,
            attackDamage = 55,
            attackRange = 4f,
            attackInterval = 0.9f,
            moveSpeed = 6f,
            respawnTime = 6f
        };

        [Header("Herói Axel Bot (Enemy) — ficha")]
        [SerializeField] private HeroBalance axel = new HeroBalance
        {
            maxHealth = 1200,
            attackDamage = 40,
            attackRange = 3.5f,
            attackInterval = 0.9f,
            moveSpeed = 4.5f,
            respawnTime = 6f
        };

        public float MatchDurationSeconds => matchDurationSeconds;
        public int BaseGalinheiroHealth => baseGalinheiroHealth;
        public float EnemyWaveInterval => enemyWaveInterval;
        public MinionBalance Minion => minion;
        public HeroBalance Milo => milo;
        public HeroBalance Axel => axel;

        [System.Serializable]
        public struct MinionBalance
        {
            [Header("Vida / Dano / Defesa")]
            public int maxHealth;
            public int attackDamage;
            [Header("Alcance / Recarga")]
            public float attackRange;
            public float attackInterval;
            [Header("Velocidade / Custo")]
            public float moveSpeed;
            public float rotationSpeed;
            public float spawnCooldown;
        }

        [System.Serializable]
        public struct HeroBalance
        {
            public int maxHealth;
            public int attackDamage;
            public float attackRange;
            public float attackInterval;
            public float moveSpeed;
            public float respawnTime;
        }
    }
}
