using UnityEngine;

namespace FowlgenWars.Core
{
    /// <summary>
    /// Entry point do Fowlgen Wars.
    /// Responsável por inicializar os sistemas core do jogo.
    /// Deve ser adicionado a um GameObject na primeira cena carregada.
    /// </summary>
    public class GameBootstrap : MonoBehaviour
    {
        [SerializeField]
        private string gameVersion = "0.1.0";

        private void Awake()
        {
            Debug.Log($"[FowlgenWars] Fowlgen Wars iniciado. Version: {gameVersion}");
            Debug.Log($"[FowlgenWars] Platform: {Application.platform}");
            Debug.Log($"[FowlgenWars] Unity: {Application.unityVersion}");
        }
    }
}
