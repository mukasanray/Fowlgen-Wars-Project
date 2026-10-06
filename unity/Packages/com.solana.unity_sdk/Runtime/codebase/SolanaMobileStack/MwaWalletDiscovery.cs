using System.Threading.Tasks;
using UnityEngine;

// ReSharper disable once CheckNamespace

namespace Solana.Unity.SDK
{
    /// <summary>
    /// Reads the cached wallet package for targeted MWA associations.
    /// </summary>
    /// <remarks>
    /// On first connect the OS wallet chooser captures the package via
    /// <see cref="MwaNativeChooser"/>; subsequent calls read it from
    /// <see cref="IMwaWalletSelectionCache"/>.
    /// </remarks>
    public static class MwaWalletDiscovery
    {
        /// <summary>
        /// Returns the cached wallet package to target, or <c>null</c> when none
        /// is cached — in which case the caller should fire an untargeted intent
        /// so the OS shows its wallet chooser.
        /// </summary>
        public static async Task<string> ResolveWalletPackage(IMwaWalletSelectionCache cache)
        {
            if (cache == null)
                return null;

            string cached;
            try
            {
                cached = await cache.GetSelectedWalletPackage();
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"[MWA][Discovery] Failed to read cached wallet package: {e.Message}. Falling back to chooser.");
                return null;
            }
            if (!string.IsNullOrEmpty(cached))
            {
                Debug.Log($"[MWA][Discovery] Using cached wallet: {cached}");
                return cached;
            }

            Debug.Log("[MWA][Discovery] No cached wallet package; intent will be untargeted (OS chooser).");
            return null;
        }
    }
}
