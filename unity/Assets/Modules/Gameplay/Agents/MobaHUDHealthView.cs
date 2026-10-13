using UnityEngine;
using UnityEngine.UI;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Exibe e atualiza as barras de vida dos campeões (Milo e Axel) no topo da tela.
    /// </summary>
    public class MobaHUDHealthView : MonoBehaviour
    {
        [SerializeField] private HeroAgent playerHero;
        [SerializeField] private HeroAgent enemyHero;

        [SerializeField] private Image playerHealthFill;
        [SerializeField] private Text playerHealthText;

        [SerializeField] private Image enemyHealthFill;
        [SerializeField] private Text enemyHealthText;

        public void Initialize(HeroAgent player, HeroAgent enemy, Image pFill, Text pText, Image eFill, Text eText)
        {
            playerHero = player;
            enemyHero = enemy;
            playerHealthFill = pFill;
            playerHealthText = pText;
            enemyHealthFill = eFill;
            enemyHealthText = eText;
        }

        private void Update()
        {
            if (playerHero != null && playerHealthFill != null)
            {
                float pct = Mathf.Clamp01((float)playerHero.CurrentHealth / Mathf.Max(1, playerHero.MaxHealth));
                playerHealthFill.fillAmount = pct;
                if (playerHealthText != null)
                {
                    playerHealthText.text = $"{playerHero.HeroName}: {playerHero.CurrentHealth}/{playerHero.MaxHealth}";
                }
            }

            if (enemyHero != null && enemyHealthFill != null)
            {
                float pct = Mathf.Clamp01((float)enemyHero.CurrentHealth / Mathf.Max(1, enemyHero.MaxHealth));
                enemyHealthFill.fillAmount = pct;
                if (enemyHealthText != null)
                {
                    enemyHealthText.text = $"{enemyHero.HeroName}: {enemyHero.CurrentHealth}/{enemyHero.MaxHealth}";
                }
            }
        }
    }
}
