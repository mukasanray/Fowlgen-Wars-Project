using UnityEngine;

namespace FowlgenWars.Architecture.Models
{
    [CreateAssetMenu(menuName = "Fowlgen Wars/Architecture/Session State")]
    public sealed class SessionState : ScriptableObject
    {
        [SerializeField] private bool authenticated;
        [SerializeField] private string walletAddress;

        public bool Authenticated => authenticated;
        public string WalletAddress => walletAddress;

        public void SetAuthenticated(string address)
        {
            authenticated = true;
            walletAddress = address;
        }

        public void Clear()
        {
            authenticated = false;
            walletAddress = string.Empty;
        }
    }
}
