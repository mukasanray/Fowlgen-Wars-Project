# Solana.Unity SDK — Installation & Usage

A zero-to-running guide: install the SDK, configure an Android build, connect a wallet, and
sign your first transaction. This is the canonical entry point — the topic guides
([Quick Start](mwa-quick-start.md), [Method Reference](mwa-method-reference.md),
[Cache Guide](mwa-cache-guide.md), [Best Practices](mwa-best-practices.md)) go deeper on
Mobile Wallet Adapter (MWA).

## Prerequisites

- Unity 2021.3 LTS or later
- Android Build Support (installed via Unity Hub) for on-device wallet flows
- For MWA: an MWA-compatible wallet (Phantom, Solflare, or the Seeker's Seed Vault) on an
  Android phone or a Solana Seeker

## Install

Add the SDK through the Unity Package Manager (**Window > Package Manager > + > Add package
from git URL**):

```
https://github.com/magicblock-labs/Solana.Unity-SDK.git
```

Pin a specific release by appending a version tag (recommended for production):

```
https://github.com/magicblock-labs/Solana.Unity-SDK.git#vX.Y.Z
```

Available releases are listed on the
[releases page](https://github.com/magicblock-labs/Solana.Unity-SDK/releases). After install,
open the package's **Samples** in the Package Manager inspector and **Import** the sample
wallet scene to get a working reference setup.

For local development, reference a clone in `Packages/manifest.json`:

```json
"com.solana.unity_sdk": "file:/path/to/your/Solana.Unity-SDK"
```

## Project setup

The fastest start is the sample scene (imported above) or the `WalletController` /
`WalletHolder` prefabs — see the [README step-by-step](../README.md#-step-by-step-instructions).
Set the RPC cluster (Mainnet / Testnet / Devnet / Custom) on the wallet component. If you use
a custom URI, use a `ws`/`wss` streaming URL (WebSockets do not work over `http`/`https`).

## Android build setup

In **Player Settings > Other Settings**:

- Scripting Backend: **IL2CPP**
- Target Architectures: **ARM64**

To avoid "Duplicate Class" / "Dependency Conflict" errors when building for Android, enable
the custom Gradle template:

1. **Edit > Project Settings > Player > Android tab > Publishing Settings**
2. Check **Custom Main Gradle Template**

The SDK then detects the generated `Assets/Plugins/Android/mainTemplate.gradle` and injects
the dependency fixes (AndroidX + Guava conflict handling) on the next build or editor reload.

## Your first connection

MWA is reached through the cross-platform `SolanaWalletAdapter`. The simplest path is the
`Web3` component, which wires it up for you:

```csharp
using Solana.Unity.SDK;
using UnityEngine;

public class Connect : MonoBehaviour
{
    public async void OnConnectPressed()
    {
        // First connect opens the OS wallet chooser; afterwards it reconnects silently.
        var account = await Web3.Instance.LoginWalletAdapter();
        Debug.Log($"Connected: {account.PublicKey}");
    }
}
```

After the first approval the SDK caches the wallet's `auth_token`, so subsequent logins
restore the session with no wallet prompt (as long as `keepConnectionAlive` is on — the
default). Because returning users reconnect silently, show **Continue + Logout** rather than a
bare **Connect** — see [Best Practices](mwa-best-practices.md).

## End-to-end: connect → sign message → sign and send

```csharp
using System.Text;
using Solana.Unity.SDK;
using Solana.Unity.Rpc.Models;
using UnityEngine;

public class WalletFlow : MonoBehaviour
{
    public async void Run(Transaction tx)
    {
        // 1. Connect (prompts on first run, silent afterwards).
        var account = await Web3.Instance.LoginWalletAdapter();
        var adapter = Web3.Wallet as SolanaWalletAdapter;   // MWA-only methods live here

        // 2. Sign an off-chain message (e.g. a login challenge).
        byte[] sig = await Web3.Wallet.SignMessage(Encoding.UTF8.GetBytes("hello"));

        // 2b. Sign several messages in one wallet round-trip (RN signMessages parity).
        byte[][] sigs = await adapter.SignMessages(new[]
        {
            Encoding.UTF8.GetBytes("first"),
            Encoding.UTF8.GetBytes("second"),
        });

        // 3. Sign AND submit a transaction via the wallet. Returns a typed result —
        //    its outcomes carry data, so pattern-match rather than catch.
        switch (await adapter.SignAndSendTransactions(new[] { tx }))
        {
            case SignAndSendTxResult.Success s:    Debug.Log($"Landed: {s.Signatures.Length} sig(s)"); break;
            case SignAndSendTxResult.UserDeclined: Debug.Log("User declined"); break;
            default:                               Debug.Log("Not submitted"); break;
        }
    }
}
```

To sign locally and submit yourself instead, use `Web3.Wallet.SignTransaction(tx)` /
`SignAllTransactions(txs)`. The full surface is in the
[Method Reference](mwa-method-reference.md).

## Troubleshooting / FAQ

| Symptom | Cause & fix |
|---|---|
| **"Duplicate Class" / "Dependency Conflict" on Android build** | Enable **Custom Main Gradle Template** (see above); the SDK injects the AndroidX/Guava fixes. |
| **App crashes or methods missing at runtime on device** | Scripting Backend must be **IL2CPP** and Target Architectures **ARM64**. |
| **First sign after connecting double-prompts** | Expected once if the wallet was launched via the OS chooser without preserving caller identity. The SDK launches the chooser with `startActivityForResult` to avoid this — if it regresses, see [Best Practices](mwa-best-practices.md). |
| **`OperationInFlightException`** | Each MWA call launches the wallet, so only one runs at a time. Debounce buttons (disable while an op is in flight). |
| **`NotSupportedException` from `CloneAuthorization()`** | `clone_authorization` is optional in MWA 2.0; many wallets (Phantom, Seed Vault) don't implement it. Gate on `GetCapabilities().SupportsCloneAuthorization`. |
| **Signing happens on the wrong network** | The CAIP-2 `chain` is re-sent on reauthorize; if you constructed the adapter with the wrong `RpcCluster`, the cached session is bound to that network. Clear it (`DisconnectWallet()` / `MwaSession.ClearCachedSession()`) and reconnect. |
| **MWA methods throw `NotImplementedException`** | The MWA-specific methods only work on Android. On WebGL/iOS they throw by design. |
| **Custom auth-token storage not being used** | `Web3.LoginWalletAdapter()` always uses the default `PlayerPrefsAuthCache`. To inject a custom `IMwaAuthCache`, construct `SolanaWalletAdapter` directly — see the [Cache Guide](mwa-cache-guide.md). |

## Where to go next

- [Quick Start](mwa-quick-start.md) — the shortest MWA connect walkthrough
- [Method Reference](mwa-method-reference.md) — the full MWA API + React Native → Unity mapping
- [Cache Guide](mwa-cache-guide.md) — customize auth-token storage
- [Best Practices](mwa-best-practices.md) — landing-screen flow & gotchas
