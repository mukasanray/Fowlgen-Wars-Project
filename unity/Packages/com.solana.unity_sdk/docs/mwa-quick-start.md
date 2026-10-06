# Mobile Wallet Adapter — Quick Start

Connect a Unity Android app to an on-device Solana wallet (Phantom, Solflare, or the
Seeker's Seed Vault) using Mobile Wallet Adapter (MWA) 2.0.

> For full install steps, Android build setup, an end-to-end example, and troubleshooting, see
> the [Installation & Usage guide](installation.md). This page is the condensed MWA connect
> walkthrough.

## Prerequisites

- Unity 2021.3 LTS or later
- Android Build Support installed via Unity Hub
- An MWA-compatible wallet on the target device
- An Android phone or a Solana Seeker

## Install the SDK

Add the SDK via Unity Package Manager (**Window > Package Manager > + > Add package from
git URL**):

```
https://github.com/magicblock-labs/Solana.Unity-SDK.git
```

For local development, reference a clone in `Packages/manifest.json`:

```json
"com.solana.unity_sdk": "file:/path/to/your/Solana.Unity-SDK"
```

## Configure the Android build

**Player Settings > Other Settings**:
- Scripting Backend: **IL2CPP**
- Target Architectures: **ARM64**

## Connect

MWA is reached through the cross-platform `SolanaWalletAdapter`. The simplest path is the
`Web3` component, which wires it up for you:

```csharp
using Solana.Unity.SDK;
using UnityEngine;

public class Connect : MonoBehaviour
{
    public async void OnConnectPressed()
    {
        // Opens the OS wallet chooser on first connect; silently reconnects afterwards.
        var account = await Web3.Instance.LoginWalletAdapter();
        Debug.Log($"Connected: {account.PublicKey}");
    }
}
```

On first connect the OS shows its wallet chooser and the wallet asks the user to approve.
After that, `Login` silently reconnects from the cached auth token — no wallet prompt — as
long as `keepConnectionAlive` is enabled (the default).

Because returning users reconnect silently, a landing screen should show **Continue** +
**Logout** for them instead of a bare **Connect**. Check before any adapter exists with
`MwaSession.HasCachedSession()` — see [Best Practices](mwa-best-practices.md).

## Use MWA-specific methods

The MWA-only methods (`DisconnectWallet`, `DeauthorizeWallet`, `ReconnectWallet`,
`SignAndSendTransactions`, `SignMessages`, `GetCapabilities`, `CloneAuthorization`,
`LoginWithSignIn`) live on `SolanaWalletAdapter`. After logging in, cast `Web3.Wallet`:

```csharp
var adapter = Web3.Wallet as SolanaWalletAdapter;

var caps  = await adapter.GetCapabilities();
var sig   = await Web3.Wallet.SignMessage(System.Text.Encoding.UTF8.GetBytes("hello"));

await adapter.DisconnectWallet();  // local clear (next Login re-prompts)
await adapter.DeauthorizeWallet(); // revoke wallet-side + clear local state
```

## Next steps

- [Installation & Usage](installation.md) — full setup, end-to-end example & troubleshooting
- [Method Reference](mwa-method-reference.md) — the full MWA API + React Native → Unity mapping
- [Best Practices](mwa-best-practices.md) — landing-screen flow & gotchas
- [Cache Guide](mwa-cache-guide.md) — customize auth-token storage
