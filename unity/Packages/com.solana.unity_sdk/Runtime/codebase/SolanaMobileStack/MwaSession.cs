using System.Threading.Tasks;
using UnityEngine;

// ReSharper disable once CheckNamespace
namespace Solana.Unity.SDK
{
    /// <summary>
    /// Read-only (and clear) helpers for the cached MWA session, callable at app start
    /// before any wallet/adapter instance exists. Use them on a landing screen to show
    /// "Continue" + "Logout" for a returning user instead of just "Connect".
    ///
    /// These reflect the default <see cref="PlayerPrefsAuthCache"/> /
    /// <see cref="PlayerPrefsMwaWalletSelectionCache"/> storage. If you injected a custom
    /// <see cref="IMwaAuthCache"/>, pass it so the lookup matches your storage.
    /// </summary>
    public static class MwaSession
    {
        // Mirrors SolanaMobileWalletAdapter's internal cached-pubkey key. Stable (changing it
        // would invalidate every cached session), so duplicating it here is safe.
        private const string PublicKeyPrefKey = "solana_sdk.mwa.public_key";

        /// <summary>
        /// True when a cached session exists that the next <c>Login()</c> will restore
        /// silently (no wallet prompt) — i.e. both a cached account and auth token are present.
        /// Pass the same <see cref="IMwaAuthCache"/> you configured; defaults to
        /// <see cref="PlayerPrefsAuthCache"/>.
        /// </summary>
        public static async Task<bool> HasCachedSession(IMwaAuthCache authCache = null)
        {
            if (string.IsNullOrEmpty(CachedAccountAddress()))
                return false;
            var token = await (authCache ?? new PlayerPrefsAuthCache()).Get();
            return !string.IsNullOrEmpty(token);
        }

        /// <summary>
        /// The cached account address (base58), or <c>null</c> if none — for a
        /// "Continue as …" label. Reads only PlayerPrefs (synchronous).
        /// </summary>
        public static string CachedAccountAddress()
        {
            var pk = PlayerPrefs.GetString(PublicKeyPrefKey, null);
            return string.IsNullOrEmpty(pk) ? null : pk;
        }

        /// <summary>
        /// Clears the cached session locally (account + auth token + remembered wallet),
        /// so the next launch shows "Connect". Does NOT revoke wallet-side — same semantics
        /// as the adapter's <c>DisconnectWallet()</c>; use <c>DeauthorizeWallet()</c> for a
        /// wallet-side revoke.
        /// </summary>
        public static async Task ClearCachedSession(
            IMwaAuthCache authCache = null, IMwaWalletSelectionCache walletSelectionCache = null)
        {
            PlayerPrefs.DeleteKey(PublicKeyPrefKey);
            PlayerPrefs.Save();
            await (authCache ?? new PlayerPrefsAuthCache()).Clear();
            await (walletSelectionCache ?? new PlayerPrefsMwaWalletSelectionCache()).ClearSelectedWalletPackage();
        }
    }
}
