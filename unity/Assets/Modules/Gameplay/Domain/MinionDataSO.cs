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

        public string UnitName => unitName;
        public GameObject Prefab => prefab;
        public int MaxHealth => maxHealth;
        public int AttackDamage => attackDamage;
        public float AttackRange => attackRange;
        public float AttackInterval => attackInterval;
        public float MoveSpeed => moveSpeed;
        public float RotationSpeed => rotationSpeed;
        public float SpawnCooldown => spawnCooldown;
    }
}
