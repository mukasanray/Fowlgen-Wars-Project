using UnityEngine;

namespace FowlgenWars.Architecture.Models
{
    [CreateAssetMenu(menuName = "Fowlgen Wars/Architecture/Navigation Config")]
    public sealed class NavigationConfig : ScriptableObject
    {
        [SerializeField] private string authScene = "Auth";
        [SerializeField] private string playScene = "Play";
        [SerializeField] private string vitoriaScene = "Vitoria";
        [SerializeField] private string derrotaScene = "Derrota";

        public string AuthScene => authScene;
        public string PlayScene => playScene;
        public string VitoriaScene => vitoriaScene;
        public string DerrotaScene => derrotaScene;

        public string ArenaScene => playScene;
    }
}
