using System.Threading.Tasks;
using UnityEngine;

// ReSharper disable once CheckNamespace

namespace Solana.Unity.SDK
{
    public class PlayerPrefsMwaWalletSelectionCache : IMwaWalletSelectionCache
    {
        public const string DefaultKey = "solana_sdk.mwa.wallet_package";
        private readonly string _key;

        public PlayerPrefsMwaWalletSelectionCache(string key = DefaultKey)
        {
            _key = string.IsNullOrEmpty(key) ? DefaultKey : key;
        }

        public Task<string> GetSelectedWalletPackage()
        {
            var value = PlayerPrefs.GetString(_key, null);
            Debug.Log($"[MWA][WalletCache] Read selected wallet: " +
                      (string.IsNullOrEmpty(value) ? "<empty>" : value));
            return Task.FromResult(value);
        }

        public Task SetSelectedWalletPackage(string packageName)
        {
            if (string.IsNullOrEmpty(packageName))
                return Task.CompletedTask;

            PlayerPrefs.SetString(_key, packageName);
            PlayerPrefs.Save();
            Debug.Log($"[MWA][WalletCache] Stored selected wallet: {packageName}");
            return Task.CompletedTask;
        }

        public Task ClearSelectedWalletPackage()
        {
            PlayerPrefs.DeleteKey(_key);
            PlayerPrefs.Save();
            Debug.Log("[MWA][WalletCache] Cleared selected wallet");
            return Task.CompletedTask;
        }
    }
}
