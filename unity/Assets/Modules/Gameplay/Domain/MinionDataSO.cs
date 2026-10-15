using UnityEngine;

namespace FowlgenWars.Gameplay
{
    [CreateAssetMenu(fileName = "MinionData", menuName = "Fowlgen Wars/Config/Minion Data")]
    public class MinionDataSO : ScriptableObject
    {
        [Header("Identificação")]
        [SerializeField] private string unitName = "Minion Frango";
        [SerializeField] private GameObject prefab;

        [Header("Atributos de Combate")]
        [SerializeField] private int maxHealth = 120;
        [SerializeField] private int attackDamage = 15;
        [SerializeField] private float attackRange = 1.8f;
        [SerializeField] private float attackInterval = 1.2f;

        [Header("Locomoção")]
        [SerializeField] private float moveSpeed = 3.5f;
        [SerializeField] private float rotationSpeed = 10f;

        [Header("Custos e Cooldown")]
        [SerializeField] private float spawnCooldown = 3.0f;

        [Header("Balance Fase 1 — ficha §8.1 (se ConfigResolver retornar, sobrepõe)")]
        [SerializeField] private FowlgenBalanceConfigSO balanceOverride;

        public string UnitName => unitName;
        public GameObject Prefab => prefab;
        public int MaxHealth => balanceOverride != null ? balanceOverride.Minion.maxHealth : maxHealth;
        public int AttackDamage => balanceOverride != null ? balanceOverride.Minion.attackDamage : attackDamage;
        public float AttackRange => balanceOverride != null ? balanceOverride.Minion.attackRange : attackRange;
        public float AttackInterval => balanceOverride != null ? balanceOverride.Minion.attackInterval : attackInterval;
        public float MoveSpeed => balanceOverride != null ? balanceOverride.Minion.moveSpeed : moveSpeed;
        public float RotationSpeed => balanceOverride != null ? balanceOverride.Minion.rotationSpeed : rotationSpeed;
        public float SpawnCooldown => balanceOverride != null ? balanceOverride.Minion.spawnCooldown : spawnCooldown;
    }
}
