using UnityEngine;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Unidade base do Fowlgen Wars.
    /// Representa um personagem/tropa individual no campo de batalha.
    /// 
    /// IMPORTANTE: Esta classe NÃO deve conhecer Solana/blockchain.
    /// O gameplay funciona independentemente da blockchain.
    /// 
    /// Futuramente será expandida com:
    /// - Stats (ataque, defesa, velocidade)
    /// - Movement (pathfinding por rota)
    /// - Combat (sistema de dano, alcance, cooldown)
    /// - Animation (states, transitions)
    /// - Identity (link com NFT/PDA — camada separada)
    /// </summary>
    public class FowlgenUnit : MonoBehaviour
    {
        [Header("Stats")]
        [SerializeField] private float moveSpeed = 2f;
        [SerializeField] private int maxHealth = 100;

        private int currentHealth;

        /// <summary>
        /// Health atual da unidade (read-only para sistemas externos).
        /// </summary>
        public int CurrentHealth => currentHealth;

        /// <summary>
        /// Health máximo da unidade.
        /// </summary>
        public int MaxHealth => maxHealth;

        /// <summary>
        /// Indica se a unidade ainda está viva.
        /// </summary>
        public bool IsAlive => currentHealth > 0;

        private void Awake()
        {
            currentHealth = maxHealth;
        }

        private void Update()
        {
            if (!IsAlive) return;

            MoveForward();
        }

        /// <summary>
        /// Move a unidade para frente na direção que está olhando.
        /// Futuramente será substituído por pathfinding ao longo das rotas.
        /// </summary>
        private void MoveForward()
        {
            transform.position +=
                transform.forward *
                (moveSpeed * Time.deltaTime);
        }

        /// <summary>
        /// Aplica dano à unidade.
        /// </summary>
        /// <param name="damage">Quantidade de dano (valores negativos são ignorados).</param>
        public void TakeDamage(int damage)
        {
            if (!IsAlive) return;

            damage = Mathf.Max(0, damage);

            currentHealth -= damage;

            Debug.Log($"[FowlgenWars] {name} recebeu {damage} de dano. HP: {currentHealth}/{maxHealth}");

            if (currentHealth <= 0)
            {
                currentHealth = 0;
                Die();
            }
        }

        /// <summary>
        /// Chamada quando a unidade morre.
        /// Futuramente:
        /// - Animator → Death animation
        /// - Gameplay → remover unidade do sistema
        /// - Event → registrar resultado para progressão
        /// - Pool → retornar ao object pool
        /// </summary>
        private void Die()
        {
            Debug.Log($"[FowlgenWars] {name} morreu.");

            // Futuramente: evento de morte para o sistema de batalha
            // OnUnitDied?.Invoke(this);

            // Temporário: desativar o GameObject
            gameObject.SetActive(false);
        }
    }
}
