# Mobile Wallet Adapter — Best Practices

## Returning users: "Continue" + "Logout", not just "Connect"

When a user connects with `keepConnectionAlive` (the default), the SDK caches their auth
token and account, and the next `Login()` restores the session **silently** — no wallet
prompt. So on a landing screen, a returning user shouldn't be shown a bare "Connect" button
as if they'd never signed in. Instead:

- **No cached session** → show **Connect** (first run / after logout).
- **Cached session** → show **Continue** (silent reconnect) and **Logout**, ideally labelled
  with the remembered address.

Use `MwaSession` (static, works before any adapter exists) to decide:

```csharp
using System;
using Solana.Unity.SDK;
using UnityEngine;
using UnityEngine.UI;

public class LandingScreen : MonoBehaviour
{
    [SerializeField] private Button connectButton;   // shown when no cached session
    [SerializeField] private Button continueButton;   // shown when a session is cached
    [SerializeField] private Button logoutButton;
    [SerializeField] private TMPro.TMP_Text continueLabel;

    // async void can't propagate exceptions to a caller — always wrap the body in try/catch
    // so a failed await can't crash the app with an unobserved exception.
    private async void Start()
    {
        try
        {
            bool hasSession = await MwaSession.HasCachedSession();

            connectButton.gameObject.SetActive(!hasSession);
            continueButton.gameObject.SetActive(hasSession);
            logoutButton.gameObject.SetActive(hasSession);

            if (hasSession)
            {
                var addr = MwaSession.CachedAccountAddress();
                continueLabel.text = $"Continue as {addr[..4]}…{addr[^4..]}";
            }
        }
        catch (Exception e)
        {
            Debug.LogException(e);
        }
    }

    // Connect / Continue are the SAME call — LoginWalletAdapter() prompts on first connect
    // and is silent when a session is cached.
    public async void OnConnectOrContinue()
    {
        try { await Web3.Instance.LoginWalletAdapter(); }
        catch (Exception e) { Debug.LogException(e); }
    }

    // Landing logout: clear locally so next launch shows Connect. (For a wallet-side revoke,
    // use the adapter's DeauthorizeWallet() once connected.)
    public async void OnLogout()
    {
        try { await MwaSession.ClearCachedSession(); }
        catch (Exception e) { Debug.LogException(e); }
    }
}
```

> If you injected a custom `IMwaAuthCache`, pass it to `HasCachedSession(...)` /
> `ClearCachedSession(...)` so the lookup matches your storage.

## Don't poll or pre-warm by calling `Login()` to "check"

`Login()` is not a probe — with no cache it opens the OS wallet chooser. Use
`MwaSession.HasCachedSession()` to check, and only call `Login()` when the user actually
taps Connect/Continue.

## One operation at a time

Each MWA call launches the wallet, so only one can run at a time — a second concurrent call
throws `OperationInFlightException`. Debounce buttons (disable while an operation is in
flight) rather than relying on catching it.
