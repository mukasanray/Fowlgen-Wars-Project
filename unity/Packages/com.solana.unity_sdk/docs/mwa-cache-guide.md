# Mobile Wallet Adapter — Auth Cache Guide

The SDK caches the wallet's `auth_token` so users don't re-approve on every launch. This
covers the default cache, replacing it, and how cached sessions are invalidated.

## Default: PlayerPrefsAuthCache

Out of the box the SDK uses `PlayerPrefsAuthCache`, which stores the token string in Unity's
`PlayerPrefs`. No setup needed when `keepConnectionAlive = true` (the default).

```csharp
var options = new SolanaMobileWalletAdapterOptions
{
    keepConnectionAlive = true, // default — enables caching
};
```

Default key: `solana_sdk.mwa.auth_token`. The public key is stored separately under
`solana_sdk.mwa.public_key`, and the remembered wallet package under
`solana_sdk.mwa.wallet_package`.

> **PlayerPrefs is plaintext on Android.** Fine for hobby games and demos; for apps holding
> real assets, plug in a custom cache backed by Android Keystore / EncryptedSharedPreferences
> (see below).

### Scoped keys

`PlayerPrefsAuthCache` accepts an optional scope suffix:

```csharp
var phantom = new PlayerPrefsAuthCache("phantom");
// writes to solana_sdk.mwa.auth_token.phantom
```

## Custom cache

Implement `IMwaAuthCache` to store the token wherever you want — the interface is just three
methods over the token string:

```csharp
public interface IMwaAuthCache
{
    Task<string> Get();        // return null (not "") on a fresh install
    Task Set(string authToken); // treat null/empty as a no-op
    Task Clear();               // must be idempotent
}
```

Inject it via the adapter constructor (the `Web3.LoginWalletAdapter()` path uses the default
`PlayerPrefsAuthCache`, so a custom cache means constructing `SolanaWalletAdapter` directly):

```csharp
var adapter = new SolanaWalletAdapter(
    new SolanaWalletAdapterOptions { solanaMobileWalletAdapterOptions = options },
    RpcCluster.DevNet,
    authCache: new MySecureCache());
```

### Example: encrypted custom cache

```csharp
public class MySecureCache : IMwaAuthCache
{
    public Task<string> Get()
    {
        var token = SecureStore.Read("mwa_auth_token"); // your Keystore-backed store
        return Task.FromResult(string.IsNullOrEmpty(token) ? null : token);
    }

    public Task Set(string authToken)
    {
        if (!string.IsNullOrEmpty(authToken))
            SecureStore.Write("mwa_auth_token", authToken);
        return Task.CompletedTask;
    }

    public Task Clear()
    {
        SecureStore.Delete("mwa_auth_token");
        return Task.CompletedTask;
    }
}
```

> `Clear()` is awaited synchronously from `DisconnectWallet()` — keep it non-blocking (no UI/network
> waits).

## The wallet-selection cache

Which wallet package to target is remembered separately via `IMwaWalletSelectionCache`
(default `PlayerPrefsMwaWalletSelectionCache`, key `solana_sdk.mwa.wallet_package`). On first
connect the OS chooser captures the chosen wallet; later connections target it directly. You
can inject a custom one via the same constructor (`walletSelectionCache:`).

## Cache invalidation

A one-time migration runs on construction: an `auth_cache_version` key
(`solana_sdk.mwa.auth_cache_version`) gates the cache. When the stored version doesn't match
the current one, the cached public key and auth token are cleared so the next login performs
a fresh `authorize` on the correct network. This self-heals tokens issued before the CAIP-2
chain fix (which were bound to the wrong network).

Beyond that, a stale token is handled lazily: if a cached token fails to re-authorize, the
session falls through to a fresh `authorize` — a stale token never gets stuck in a retry
loop, and no error is surfaced to the user.
