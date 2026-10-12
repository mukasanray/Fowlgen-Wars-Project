using UnityEngine;

namespace FowlgenWars.Gameplay
{
    [CreateAssetMenu(fileName = "MatchConfig", menuName = "Fowlgen Wars/Config/Match Config")]
    public class MatchConfigSO : ScriptableObject
    {
        [Header("Tempo de Jogo (3 Minutos Mobile)")]
        [SerializeField] private float matchDurationSeconds = 180f;

        [Header("Galinheiros / Estruturas Principais")]
        [SerializeField] private int baseGalinheiroHealth = 1000;

        [Header("IA Inimiga (Geração de Ondas Automáticas)")]
        [SerializeField] private float enemyWaveInterval = 8.0f;
        [SerializeField] private MinionDataSO defaultMinionData;

        public float MatchDurationSeconds => matchDurationSeconds;
        public int BaseGalinheiroHealth => baseGalinheiroHealth;
        public float EnemyWaveInterval => enemyWaveInterval;
        public MinionDataSO DefaultMinionData => defaultMinionData;
    }
}
