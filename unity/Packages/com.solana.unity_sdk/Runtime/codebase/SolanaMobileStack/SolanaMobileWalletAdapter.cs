using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Solana.Unity.Rpc.Models;
using Solana.Unity.SDK;
using Solana.Unity.Wallet;
using UnityEngine;
using WebSocketSharp;

// ReSharper disable once CheckNamespace

namespace Solana.Unity.SDK
{
    
    [Serializable]
    public class SolanaMobileWalletAdapterOptions
    {
        public string identityUri = "https://solana.unity-sdk.gg/";
        public string iconUri = "/favicon.ico";
        public string name = "Solana.Unity-SDK";
        public bool keepConnectionAlive = true;
    }
    
    
    [Obsolete("Use SolanaWalletAdapter class instead, which is the cross platform wrapper.")]
    public class SolanaMobileWalletAdapter : WalletBase
    {
        private sealed class MobileWalletAdapterLifecycleHook : MonoBehaviour
        {
            public event Action<bool> ApplicationFocusChanged;

            private void OnApplicationFocus(bool hasFocus)
            {
                ApplicationFocusChanged?.Invoke(hasFocus);
            }
        }

        private const string PrefKeyPublicKey = "solana_sdk.mwa.public_key";
        // Single source of truth lives in PlayerPrefsAuthCache.DefaultKey.
        // Kept here as a private alias because the legacy key migration
        // below still touches PlayerPrefs directly. Live reads and writes
        // for the auth token go through _authCache (see IMwaAuthCache).
        private const string PrefKeyAuthToken = PlayerPrefsAuthCache.DefaultKey;

        private readonly SolanaMobileWalletAdapterOptions _walletOptions;

        private Transaction _currentTransaction;

        private TaskCompletionSource<Account> _loginTaskCompletionSource;
        private TaskCompletionSource<Transaction> _signedTransactionTaskCompletionSource;
        private readonly WalletBase _internalWallet;
        private readonly IMwaAuthCache _authCache;
        private readonly IMwaWalletSelectionCache _walletSelectionCache;
        private string _authToken;
        private bool _loginInProgress;
        private static MobileWalletAdapterLifecycleHook _lifecycleHook;

        public event Action OnWalletDisconnected;
        public event Action OnWalletReconnected;

        // CAIP-2 chain identifiers for MWA 2.0 wallets (e.g. Seeker Seed Vault).
        // Keyed to match RpcCluster / RPCNameMap. LocalNet has no standard CAIP-2
        // value, so it maps to null and only the legacy "cluster" field is sent.
        private static readonly Dictionary<int, string> ChainNameMap = new ()
        {
            { 0, "solana:mainnet" },
            { 1, "solana:devnet" },
            { 2, "solana:testnet" },
            { 3, null },
        };

        public SolanaMobileWalletAdapter(
            SolanaMobileWalletAdapterOptions solanaWalletOptions,
            RpcCluster rpcCluster = RpcCluster.DevNet,
            string customRpcUri = null,
            string customStreamingRpcUri = null,
            bool autoConnectOnStartup = false,
            IMwaAuthCache authCache = null,
            IMwaWalletSelectionCache walletSelectionCache = null) : base(rpcCluster, customRpcUri, customStreamingRpcUri, autoConnectOnStartup
        )
        {
            _walletOptions = solanaWalletOptions;
            if (Application.platform != RuntimePlatform.Android)
            {
                throw new Exception("SolanaMobileWalletAdapter can only be used on Android");
            }
            _authCache = authCache ?? new PlayerPrefsAuthCache();
            _walletSelectionCache = walletSelectionCache ?? new PlayerPrefsMwaWalletSelectionCache();
            MigrateLegacyPrefKeys();
            EnsureLifecycleHook();
            _lifecycleHook.ApplicationFocusChanged -= OnApplicationFocusChanged;
            _lifecycleHook.ApplicationFocusChanged += OnApplicationFocusChanged;
        }

        private static void EnsureLifecycleHook()
        {
            if (_lifecycleHook != null)
            {
                return;
            }

            var hookObject = new GameObject("[SolanaMobileWalletAdapterLifecycle]");
            hookObject.hideFlags = HideFlags.HideAndDontSave;
            UnityEngine.Object.DontDestroyOnLoad(hookObject);
            _lifecycleHook = hookObject.AddComponent<MobileWalletAdapterLifecycleHook>();
        }

        private async void OnApplicationFocusChanged(bool hasFocus)
        {
            try
            {
                await HandleApplicationFocus(hasFocus);
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[MWA] OnApplicationFocus handler failed: {e.Message}");
            }
        }

        /// <summary>
        /// Resolves the target wallet package via cache → discovery → native picker.
        /// Returns the package name to target, or null if no wallet was found/selected.
        /// </summary>
        private async Task<string> ResolveWalletPackage()
        {
            return await MwaWalletDiscovery.ResolveWalletPackage(_walletSelectionCache);
        }

        /// <summary>
        /// Creates a <see cref="LocalAssociationScenario"/> targeting the resolved
        /// wallet package. On first use this may show a native picker if multiple
        /// wallets are installed; subsequent calls use the cached selection.
        /// </summary>
        private async Task<LocalAssociationScenario> CreateTargetedScenario()
        {
            var package = await ResolveWalletPackage();
            Debug.Log($"[MWA] Resolved target wallet package: " +
                      (string.IsNullOrEmpty(package) ? "<none>" : package));
            return new LocalAssociationScenario(package);
        }

        /// <summary>
        /// Caches the wallet package name identified during the WebSocket
        /// session so subsequent connections can target it directly.
        /// </summary>
        private async Task TryCacheWalletPackage(string walletPackage)
        {
            if (string.IsNullOrEmpty(walletPackage))
                return;

            var existing = await _walletSelectionCache.GetSelectedWalletPackage();
            if (!string.IsNullOrEmpty(existing))
            {
                Debug.Log($"[MWA] TryCacheWalletPackage: keeping existing cached package '{existing}', skipping store of '{walletPackage}'");
                return;
            }

            await _walletSelectionCache.SetSelectedWalletPackage(walletPackage);
        }

        /// <summary>
        /// Runs a privileged operation (sign transactions / sign messages) against
        /// the targeted wallet, re-using the cached auth token when possible so the
        /// wallet only ever surfaces for the operation itself — never for a
        /// standalone (re)authorization.
        /// </summary>
        /// <remarks>
        /// Honors the "no wallet popups unless necessary" rule. Phantom rejects a
        /// bare <c>sign_transactions</c> ("auth_token not valid for signing"), so a
        /// session must be (re)authorized before the operation. We do that in the
        /// SAME session as the operation, so the wallet surfaces once:
        /// <list type="bullet">
        /// <item>Token present → [reauthorize, op]. With a valid token reauthorize
        /// is silent (≈250 ms, no prompt); only the operation's own prompt shows.</item>
        /// <item>Reauthorize rejected (token expired/revoked) → [authorize, op].</item>
        /// <item>No token → [authorize, op].</item>
        /// </list>
        /// Do NOT precede this with an un-authorized "direct" attempt: a rejected
        /// bare sign knocks Phantom out of its authorized state and forces the
        /// following reauthorize to prompt.
        /// </remarks>
        // Process-wide single-flight gate: only one MWA operation may run at a time, since
        // each launches the wallet UI. Concurrent calls fail fast with
        // OperationInFlightException rather than racing two associations.
        private static readonly SemaphoreSlim OpGate = new SemaphoreSlim(1, 1);

        private static async Task<T> RunExclusive<T>(string op, Func<Task<T>> body)
        {
            if (!await OpGate.WaitAsync(0))
                throw new OperationInFlightException(op);
            try { return await body(); }
            finally { OpGate.Release(); }
        }

        private static async Task RunExclusive(string op, Func<Task> body)
        {
            if (!await OpGate.WaitAsync(0))
                throw new OperationInFlightException(op);
            try { await body(); }
            finally { OpGate.Release(); }
        }

        private async Task RunPrivileged(Action<IAdapterOperations> privilegedAction, string label)
        {
            if (_authToken.IsNullOrEmpty() && _walletOptions.keepConnectionAlive)
                _authToken = await _authCache.Get();

            // Token present: reauthorize (silent when the token is valid) and run the
            // operation in one session, so only the operation itself prompts.
            if (!_authToken.IsNullOrEmpty())
            {
                var reauthorize = new ReauthorizeOperation(
                    _walletOptions, _authToken, RPCNameMap[(int)RpcCluster], ChainNameMap[(int)RpcCluster]);
                using (var scenario = await CreateTargetedScenario())
                {
                    var actions = reauthorize.BuildActions();
                    actions.Add(privilegedAction);
                    var result = await scenario.StartAndExecute(actions);
                    if (result.WasSuccessful)
                    {
                        await PersistRefreshedToken(reauthorize.Authorization);
                        return;
                    }

                    // Reauthorize succeeded but the operation failed (e.g. the user
                    // declined): surface as-is rather than re-prompting with authorize.
                    if (reauthorize.Authorization != null)
                    {
                        Debug.LogError($"[MWA] {label} failed ({result.Error?.Code}): {result.Error?.Message}");
                        throw new MwaRpcException(result.Error?.Code ?? 0,
                            result.Error?.Message ?? $"[MWA] {label} failed", result.Error?.Data);
                    }

                    // Token expired/revoked — a fresh authorization is now necessary.
                    Debug.LogWarning($"[MWA] {label}: cached token rejected, re-authorizing");
                    _authToken = null;
                }
            }

            // No usable token: authorize (prompts) and run the operation in one session.
            var authorize = new AuthorizeOperation(
                _walletOptions, RPCNameMap[(int)RpcCluster], ChainNameMap[(int)RpcCluster]);
            using (var scenario = await CreateTargetedScenario())
            {
                var actions = authorize.BuildActions();
                actions.Add(privilegedAction);
                var authResult = await scenario.StartAndExecute(actions);
                if (!authResult.WasSuccessful)
                {
                    Debug.LogError($"[MWA] {label} failed ({authResult.Error?.Code}): {authResult.Error?.Message}");
                    throw new MwaRpcException(authResult.Error?.Code ?? 0,
                        authResult.Error?.Message ?? $"[MWA] {label} failed", authResult.Error?.Data);
                }
                if (authorize.Authorization == null)
                    throw new Exception($"[MWA] {label}: authorization was not populated");

                await PersistRefreshedToken(authorize.Authorization);
            }
        }

        /// <summary>
        /// Persists a refreshed auth token returned by authorize/reauthorize.
        /// No-op when the wallet returned no token or connection caching is off.
        /// </summary>
        private async Task PersistRefreshedToken(AuthorizationResult authorization)
        {
            if (authorization == null || string.IsNullOrEmpty(authorization.AuthToken))
                return;

            _authToken = authorization.AuthToken;
            if (_walletOptions.keepConnectionAlive)
                await _authCache.Set(_authToken);
        }

        private static void MigrateLegacyPrefKeys()
        {
            const string legacyPk = "pk";
            const string legacyAuthToken = "authToken";

            if (!PlayerPrefs.HasKey(legacyPk) && !PlayerPrefs.HasKey(legacyAuthToken))
                return;

            if (PlayerPrefs.HasKey(legacyPk) && !PlayerPrefs.HasKey(PrefKeyPublicKey))
                PlayerPrefs.SetString(PrefKeyPublicKey, PlayerPrefs.GetString(legacyPk));

            if (PlayerPrefs.HasKey(legacyAuthToken) && !PlayerPrefs.HasKey(PrefKeyAuthToken))
                PlayerPrefs.SetString(PrefKeyAuthToken, PlayerPrefs.GetString(legacyAuthToken));

            PlayerPrefs.DeleteKey(legacyPk);
            PlayerPrefs.DeleteKey(legacyAuthToken);
            PlayerPrefs.Save();
        }

        protected override async Task<Account> _Login(string password = null)
        {
            if (!await OpGate.WaitAsync(0))
                throw new OperationInFlightException("Login");
            _loginInProgress = true;
            try
            {
                return await _LoginInternal(password);
            }
            finally
            {
                _loginInProgress = false;
                OpGate.Release();
            }
        }

        private async Task<Account> _LoginInternal(string password = null)
        {
            // Fast path: if we have cached credentials, return immediately without
            // opening the wallet. We deliberately do NOT reauthorize here — a
            // standalone reauthorize would briefly surface the wallet for no
            // user-visible reason. Token validity is re-checked lazily on the next
            // operation that actually needs the wallet (see RunPrivileged).
            if (_walletOptions.keepConnectionAlive)
            {
                var pk = PlayerPrefs.GetString(PrefKeyPublicKey, null);
                var authToken = await _authCache.Get();

                if (!pk.IsNullOrEmpty() && !authToken.IsNullOrEmpty())
                {
                    _authToken = authToken;
                    return new Account(string.Empty, new PublicKey(pk));
                }

                if (!pk.IsNullOrEmpty())
                {
                    // Inconsistent state: pk persisted but no auth token. Wipe
                    // so a re-entrant Login on the same instance cannot reuse stale data.
                    _authToken = null;
                    PlayerPrefs.DeleteKey(PrefKeyPublicKey);
                    PlayerPrefs.Save();
                }
            }

            using var localAssociationScenario = await CreateTargetedScenario();

            var cluster = RPCNameMap[(int)RpcCluster];
            var chain = ChainNameMap[(int)RpcCluster];
            var authorizationOperation = new AuthorizeOperation(_walletOptions, cluster, chain);

            var result = await localAssociationScenario.StartAndExecute(authorizationOperation.BuildActions());
            if (!result.WasSuccessful)
            {
                Debug.LogError(result.Error.Message);
                throw new Exception(result.Error.Message);
            }
            
            if (authorizationOperation.Authorization == null)
            {
                throw new Exception("[MWA] Login: authorization was not populated");
            }

            var publicKey = new PublicKey(authorizationOperation.Authorization.PublicKey);
            if (string.IsNullOrEmpty(authorizationOperation.Authorization.AuthToken))
                return new Account(string.Empty, publicKey);

            _authToken = authorizationOperation.Authorization.AuthToken;
            if (!_walletOptions.keepConnectionAlive)
                return new Account(string.Empty, publicKey);

            PlayerPrefs.SetString(PrefKeyPublicKey, publicKey.ToString());
            PlayerPrefs.Save();
            await _authCache.Set(_authToken);

            var chosenPackage = MwaNativeChooser.ConsumeChosenPackage();
            if (!string.IsNullOrEmpty(chosenPackage))
            {
                var rawLabel = authorizationOperation.Authorization.AccountLabel;
                Debug.Log($"[MWA] Login store path: chooser-selected package={chosenPackage}" +
                          (string.IsNullOrEmpty(rawLabel) ? "" : $" (label=\"{rawLabel}\")"));
                await TryCacheWalletPackage(chosenPackage);
            }
            else
            {
                Debug.Log("[MWA] Login store path: no chooser package captured; wallet not cached.");
            }

            return new Account(string.Empty, publicKey);
        }

        protected override async Task<Transaction> _SignTransaction(Transaction transaction)
        {
            var result = await _SignAllTransactions(new Transaction[] { transaction });
            return result[0];
        }

        protected override Task<Transaction[]> _SignAllTransactions(Transaction[] transactions)
            => RunExclusive("SignAllTransactions", () => _SignAllTransactionsImpl(transactions));

        private async Task<Transaction[]> _SignAllTransactionsImpl(Transaction[] transactions)
        {
            SignedResult res = null;
            await RunPrivileged(async client =>
            {
                res = await client.SignTransactions(
                    transactions.Select(t => t.Serialize()).ToList());
            }, "SignAllTransactions");

            if (res == null)
                throw new Exception("[MWA] SignAllTransactions: signed payloads were not populated");

            return res.SignedPayloads
                .Select(transaction => Transaction.Deserialize(transaction)).ToArray();
        }

        /// <summary>
        /// Signs AND submits <paramref name="transactions"/> to the network via the wallet
        /// (<c>sign_and_send_transactions</c>). Distinct from <see cref="_SignTransaction"/> /
        /// <see cref="_SignAllTransactions"/>, which sign locally and leave submission to the
        /// SDK. There is intentionally NO fallback to <c>sign_transactions</c>.
        ///
        /// Returns a typed <see cref="SignAndSendTxResult"/> rather than throwing, because the
        /// outcomes here (user declined, partial submit, invalid payloads, not supported) are
        /// expected and carry data — pattern-match on the result case.
        /// </summary>
        public Task<SignAndSendTxResult> SignAndSendTransactions(
            Transaction[] transactions, SignAndSendTransactionsOptions options = null)
            => RunExclusive("SignAndSendTransactions", () => SignAndSendTransactionsImpl(transactions, options));

        private async Task<SignAndSendTxResult> SignAndSendTransactionsImpl(
            Transaction[] transactions, SignAndSendTransactionsOptions options)
        {
            SignAndSendResult res = null;
            try
            {
                await RunPrivileged(async client =>
                {
                    res = await client.SignAndSendTransactions(
                        transactions.Select(t => t.Serialize()).ToList(), options);
                }, "SignAndSendTransactions");
            }
            catch (MwaRpcException e)
            {
                return MapSignAndSendError(e);
            }

            if (res?.SignatureBytes == null)
                return new SignAndSendTxResult.Failed
                {
                    Code = 0,
                    Message = "[MWA] SignAndSendTransactions: signatures were not populated"
                };

            return new SignAndSendTxResult.Success { Signatures = res.SignatureBytes.ToArray() };
        }

        // Maps a sign_and_send RPC error to its typed result case (verified spec codes).
        private static SignAndSendTxResult MapSignAndSendError(MwaRpcException e)
        {
            switch (e.Code)
            {
                case MwaErrorCodes.NotSigned:
                    return new SignAndSendTxResult.UserDeclined();
                case MwaErrorCodes.MethodNotFound:
                    return new SignAndSendTxResult.NotSupported();
                case MwaErrorCodes.AuthorizationFailed:
                    return new SignAndSendTxResult.Unauthorized();
                case MwaErrorCodes.TooManyPayloads:
                    return new SignAndSendTxResult.TooManyPayloads();
                case MwaErrorCodes.NotSubmitted:
                    return new SignAndSendTxResult.NotSubmitted { PartialSignatures = ParseDataSignatures(e.Data) };
                case MwaErrorCodes.InvalidPayloads:
                    return new SignAndSendTxResult.InvalidPayloads { Valid = ParseDataValid(e.Data) };
                default:
                    return new SignAndSendTxResult.Failed { Code = e.Code, Message = e.Message };
            }
        }

        // -4 NOT_SUBMITTED: data.signatures[] — base64 string if submitted, null if not.
        private static byte[][] ParseDataSignatures(JToken data)
        {
            if (data?["signatures"] is not JArray arr) return null;
            var result = new byte[arr.Count][];
            for (var i = 0; i < arr.Count; i++)
            {
                var s = arr[i]?.Type == JTokenType.String ? arr[i].Value<string>() : null;
                if (string.IsNullOrEmpty(s))
                {
                    result[i] = null;
                    continue;
                }
                try
                {
                    result[i] = Convert.FromBase64String(s);
                }
                catch (FormatException)
                {
                    // Malformed signature from the wallet — treat as not-submitted (null) rather
                    // than throwing out of the typed-result mapping.
                    result[i] = null;
                }
            }
            return result;
        }

        // -2 INVALID_PAYLOADS: data.valid[] — per-payload boolean.
        private static bool[] ParseDataValid(JToken data)
        {
            if (data?["valid"] is not JArray arr) return null;
            return arr.Select(t => t.Type == JTokenType.Boolean && t.Value<bool>()).ToArray();
        }

        /// <summary>
        /// Clones the current authorization into a new <c>auth_token</c> that can be
        /// transferred to another instance of the dapp (<c>clone_authorization</c>).
        /// Optional in MWA 2.0 (gated on <c>solana:cloneAuthorization</c>); requires an
        /// authorized session, which <see cref="RunPrivileged"/> establishes first.
        /// </summary>
        /// <exception cref="NotSupportedException">The wallet does not implement clone_authorization (-32601).</exception>
        public Task<string> CloneAuthorization()
            => RunExclusive("CloneAuthorization", CloneAuthorizationImpl);

        private async Task<string> CloneAuthorizationImpl()
        {
            CloneAuthorizationResult res = null;
            try
            {
                await RunPrivileged(async client =>
                {
                    res = await client.CloneAuthorization();
                }, "CloneAuthorization");
            }
            catch (MwaRpcException e) when (e.Code == MwaErrorCodes.MethodNotFound)
            {
                throw new NotSupportedException(
                    "[MWA] This wallet does not support clone_authorization (-32601).", e);
            }

            if (string.IsNullOrEmpty(res?.AuthToken))
                throw new Exception("[MWA] CloneAuthorization: no token returned");
            return res.AuthToken;
        }

        /// <summary>
        /// Logs in with Sign-In-With-Solana: authorizes carrying a <c>sign_in_payload</c>
        /// and returns the account plus the SIWS result. If the wallet returns a native
        /// <c>sign_in_result</c> it is used directly; otherwise the SIWS message is built
        /// and signed via <c>sign_messages</c> as a fallback. The result address is
        /// normalized to base58 in both paths.
        /// </summary>
        public Task<(Account account, SignInResult signInResult)> LoginWithSignIn(SignInPayload payload)
        {
            if (payload == null) throw new ArgumentNullException(nameof(payload));
            return RunExclusive("LoginWithSignIn", () => LoginWithSignInImpl(payload));
        }

        private async Task<(Account account, SignInResult signInResult)> LoginWithSignInImpl(SignInPayload payload)
        {
            var cluster = RPCNameMap[(int)RpcCluster];
            var chain = ChainNameMap[(int)RpcCluster];

            AuthorizationResult authorization = null;
            using (var scenario = await CreateTargetedScenario())
            {
                var result = await scenario.StartAndExecute(new List<Action<IAdapterOperations>>
                {
                    async client =>
                    {
                        authorization = await client.Authorize(
                            new Uri(_walletOptions.identityUri),
                            new Uri(_walletOptions.iconUri, UriKind.Relative),
                            _walletOptions.name, cluster, chain, payload);
                    }
                });
                if (!result.WasSuccessful)
                    throw new Exception(result.Error?.Message ?? "[MWA] LoginWithSignIn: authorize failed");
            }
            if (authorization == null)
                throw new Exception("[MWA] LoginWithSignIn: authorization was not populated");

            var publicKey = new PublicKey(authorization.PublicKey);
            var account = new Account(string.Empty, publicKey);
            Account = account;

            _authToken = authorization.AuthToken;
            if (_walletOptions.keepConnectionAlive && !string.IsNullOrEmpty(_authToken))
            {
                PlayerPrefs.SetString(PrefKeyPublicKey, publicKey.ToString());
                PlayerPrefs.Save();
                await _authCache.Set(_authToken);
                var chosen = MwaNativeChooser.ConsumeChosenPackage();
                if (!string.IsNullOrEmpty(chosen))
                    await TryCacheWalletPackage(chosen);
            }

            // Native SIWS: the wallet already returned a sign_in_result. Normalize the
            // address to base58 (some wallets, e.g. Seed Vault, return it base64-encoded)
            // so the native and fallback paths report a consistent representation.
            if (authorization.SignInResult != null)
            {
                authorization.SignInResult.Address = publicKey.Key;
                return (account, authorization.SignInResult);
            }

            // Fallback: construct the SIWS message and sign it via sign_messages.
            var siwsMessage = BuildSiwsMessage(payload, publicKey.Key);
            var siwsBytes = System.Text.Encoding.UTF8.GetBytes(siwsMessage);
            SignedResult signed = null;
            await RunPrivileged(async client =>
            {
                signed = await client.SignMessages(
                    messages: new List<byte[]> { siwsBytes },
                    addresses: new List<byte[]> { publicKey.KeyBytes });
            }, "LoginWithSignIn-fallback");

            var signedBytes = signed?.SignedPayloadsBytes is { Count: > 0 } ? signed.SignedPayloadsBytes[0] : null;
            if (signedBytes == null || signedBytes.Length < 64)
                throw new Exception("[MWA] LoginWithSignIn: SIWS fallback signing failed");

            // The ed25519 signature is the trailing 64 bytes — robust whether the wallet
            // returns the bare signature or a `message || signature` envelope.
            var sig = new byte[64];
            Array.Copy(signedBytes, signedBytes.Length - 64, sig, 0, 64);

            return (account, new SignInResult
            {
                Address = publicKey.Key, // base58, matching the native sign_in_result path
                SignedMessage = Convert.ToBase64String(siwsBytes),
                Signature = Convert.ToBase64String(sig),
                SignatureType = "ed25519"
            });
        }

        // Builds a Sign-In-With-Solana message from the payload for the fallback path
        // (wallets without native SIWS). Format follows the SIWS / EIP-4361 layout.
        private static string BuildSiwsMessage(SignInPayload p, string addressBase58)
        {
            var address = !string.IsNullOrEmpty(p.Address) ? p.Address : addressBase58;
            var sb = new System.Text.StringBuilder();
            sb.Append($"{p.Domain} wants you to sign in with your Solana account:\n");
            sb.Append(address);
            if (!string.IsNullOrEmpty(p.Statement))
                sb.Append($"\n\n{p.Statement}");

            var fields = new List<string>();
            if (!string.IsNullOrEmpty(p.Uri)) fields.Add($"URI: {p.Uri}");
            if (!string.IsNullOrEmpty(p.Version)) fields.Add($"Version: {p.Version}");
            if (!string.IsNullOrEmpty(p.ChainId)) fields.Add($"Chain ID: {p.ChainId}");
            if (!string.IsNullOrEmpty(p.Nonce)) fields.Add($"Nonce: {p.Nonce}");
            if (!string.IsNullOrEmpty(p.IssuedAt)) fields.Add($"Issued At: {p.IssuedAt}");
            if (!string.IsNullOrEmpty(p.ExpirationTime)) fields.Add($"Expiration Time: {p.ExpirationTime}");
            if (!string.IsNullOrEmpty(p.NotBefore)) fields.Add($"Not Before: {p.NotBefore}");
            if (!string.IsNullOrEmpty(p.RequestId)) fields.Add($"Request ID: {p.RequestId}");
            if (fields.Count > 0)
                sb.Append("\n\n").Append(string.Join("\n", fields));

            if (p.Resources != null && p.Resources.Length > 0)
            {
                sb.Append("\nResources:");
                foreach (var r in p.Resources)
                    sb.Append($"\n- {r}");
            }

            return sb.ToString();
        }


        /// <summary>
        /// Disconnects locally: clears the in-memory token, the cached public key in
        /// PlayerPrefs, and the auth token stored in <see cref="IMwaAuthCache"/>. Does
        /// NOT call <c>deauthorize</c> on the wallet side — use
        /// <see cref="DeauthorizeWallet"/> when the wallet-side session also needs to be
        /// revoked. The next <c>Login()</c> re-prompts.
        ///
        /// Awaitable, but the local clear itself runs synchronously (the cache
        /// <see cref="IMwaAuthCache.Clear"/> call is awaited synchronously), so custom cache
        /// impls must not block on UI or network here.
        /// </summary>
        public Task DisconnectWallet()
        {
            ClearLocalSession();
            return Task.CompletedTask;
        }

        /// <summary>
        /// <see cref="WalletBase"/> override; performs the same local clear as
        /// <see cref="DisconnectWallet"/>.
        /// </summary>
        public override void Logout() => ClearLocalSession();

        private void ClearLocalSession()
        {
            base.Logout();
            PlayerPrefs.DeleteKey(PrefKeyPublicKey);
            PlayerPrefs.Save();
            _authToken = null;
            try
            {
                // Custom IMwaAuthCache impls (Keystore, EncryptedSharedPreferences, etc.) can
                // throw on backend errors. Swallow here so DeauthorizeWallet still fires
                // OnWalletDisconnected and the rest of the disconnect sequence completes.
                _authCache.Clear().GetAwaiter().GetResult();
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[MWA] Auth cache clear failed during DisconnectWallet: {e}");
            }

            try
            {
                _walletSelectionCache.ClearSelectedWalletPackage().GetAwaiter().GetResult();
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[MWA] Wallet selection cache clear failed during DisconnectWallet: {e}");
            }
        }

        /// <summary>
        /// Revokes the authorization wallet-side (the <c>deauthorize</c> RPC, sent to the
        /// issuing wallet) and then clears local state, firing <see cref="OnWalletDisconnected"/>.
        /// Best-effort remote revoke: if the issuing wallet can't be targeted (none cached /
        /// uninstalled) it skips the remote call and clears local only.
        /// </summary>
        public Task DeauthorizeWallet() => RunExclusive("DeauthorizeWallet", DeauthorizeImpl);

        private async Task DeauthorizeImpl()
        {
            string authToken = _authToken;
            if (authToken.IsNullOrEmpty())
                authToken = await _authCache.Get();

            // Deauthorize must go straight to the wallet that issued the token.
            // If we can't resolve that exact package (none cached, or the wallet
            // was uninstalled), do NOT fall back to an untargeted intent — that
            // would pop the OS wallet chooser, which makes no sense for a
            // disconnect. Skip the remote revoke and just clear local state.
            string targetPackage = await ResolveWalletPackage();

            if (!authToken.IsNullOrEmpty() && !string.IsNullOrEmpty(targetPackage))
            {
                try
                {
                    using var localAssociationScenario = new LocalAssociationScenario(targetPackage);
                    var result = await localAssociationScenario.StartAndExecute(
                        new List<Action<IAdapterOperations>>
                        {
                            async client =>
                            {
                                await client.Deauthorize(authToken);
                            }
                        }
                    );
                    if (!result.WasSuccessful)
                    {
                        Debug.LogWarning($"[MWA] Deauthorize returned error: {result.Error.Message}");
                    }
                }
                catch (Exception e)
                {
                    Debug.LogWarning($"[MWA] Deauthorize transport failed (best-effort): {e}");
                }
            }
            else
            {
                Debug.Log("[MWA] Deauthorize: no targetable wallet package " +
                          "(none cached or token already gone); skipping remote deauthorize, " +
                          "clearing local session only.");
            }

            ClearLocalSession();
            OnWalletDisconnected?.Invoke();
        }

        public async Task ReconnectWallet()
        {
            try
            {
                var account = await Login();
                if (account != null)
                {
                    OnWalletReconnected?.Invoke();
                }
                else
                {
                    Debug.LogWarning("[MWA] ReconnectWallet: Login returned null, not firing OnWalletReconnected");
                    throw new Exception("ReconnectWallet failed: Login returned null");
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"[MWA] ReconnectWallet failed: {e}");
                throw;
            }
        }

        /// <summary>
        /// Handles app focus resume for Android MWA flows.
        /// Call this from a MonoBehaviour's OnApplicationFocus callback.
        /// When focus returns and cached credentials exist, attempts a silent
        /// reconnect only if no account is currently set.
        /// </summary>
        public async Task HandleApplicationFocus(bool hasFocus)
        {
            if (!hasFocus || !_walletOptions.keepConnectionAlive || Account != null || _loginInProgress)
            {
                return;
            }

            var cachedPublicKey = PlayerPrefs.GetString(PrefKeyPublicKey, null);
            var cachedAuthToken = await _authCache.Get();
            if (cachedPublicKey.IsNullOrEmpty() || cachedAuthToken.IsNullOrEmpty())
            {
                return;
            }

            try
            {
                await ReconnectWallet();
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[MWA] HandleApplicationFocus reconnect failed: {e.Message}");
            }
        }

        public Task<CapabilitiesResult> GetCapabilities()
            => RunExclusive("GetCapabilities", GetCapabilitiesImpl);

        private async Task<CapabilitiesResult> GetCapabilitiesImpl()
        {
            CapabilitiesResult capabilities = null;
            using var localAssociationScenario = await CreateTargetedScenario();
            var result = await localAssociationScenario.StartAndExecute(
                new List<Action<IAdapterOperations>>
                {
                    async client =>
                    {
                        capabilities = await client.GetCapabilities();
                    }
                }
            );
            if (!result.WasSuccessful)
            {
                Debug.LogError(result.Error.Message);
                throw new Exception(result.Error.Message);
            }
            if (capabilities == null)
            {
                throw new Exception("[MWA] GetCapabilities RPC succeeded but returned no data");
            }
            return capabilities;
        }

        public override Task<byte[]> SignMessage(byte[] message)
            => RunExclusive("SignMessage", () => SignMessageImpl(message));

        private async Task<byte[]> SignMessageImpl(byte[] message)
        {
            var signed = await SignMessagesImpl(new[] { message });
            return signed[0];
        }

        /// <summary>
        /// Signs multiple arbitrary messages in a single wallet round-trip
        /// (<c>sign_messages</c>) — the batch counterpart to <see cref="SignMessage"/>,
        /// mirroring the React Native SDK's <c>signMessages</c>. All messages are signed
        /// with the connected account; returns one signed payload per input message, in
        /// order (each payload carries the wallet's signature, matching <see cref="SignMessage"/>).
        /// </summary>
        public Task<byte[][]> SignMessages(byte[][] messages)
            => RunExclusive("SignMessages", () => SignMessagesImpl(messages));

        private async Task<byte[][]> SignMessagesImpl(byte[][] messages)
        {
            if (messages == null || messages.Length == 0)
                throw new ArgumentException(
                    "[MWA] SignMessages: at least one message is required", nameof(messages));

            string cachedPk = Account?.PublicKey?.ToString()
                ?? PlayerPrefs.GetString(PrefKeyPublicKey, null);
            if (string.IsNullOrEmpty(cachedPk))
                throw new Exception("[MWA] Cannot sign messages: no account available");

            var address = new PublicKey(cachedPk).KeyBytes;
            SignedResult signedMessages = null;
            await RunPrivileged(async client =>
            {
                signedMessages = await client.SignMessages(
                    messages: messages.ToList(),
                    addresses: new List<byte[]> { address }
                );
            }, "SignMessages");

            if (signedMessages?.SignedPayloadsBytes == null)
                throw new Exception("[MWA] SignMessages: signed payloads were not populated");

            return signedMessages.SignedPayloadsBytes.ToArray();
        }

        protected override Task<Account> _CreateAccount(string mnemonic = null, string password = null)
        {
            throw new NotImplementedException("Can't create a new account in phantom wallet");
        }

    }
}

internal sealed class AuthorizeOperation
{
    private readonly SolanaMobileWalletAdapterOptions _opts;
    private readonly string _cluster;
    private readonly string _chain;

    public AuthorizationResult Authorization { get; private set; }

    public AuthorizeOperation(SolanaMobileWalletAdapterOptions opts, string cluster, string chain = null)
    {
        _opts = opts;
        _cluster = cluster;
        _chain = chain;
    }

    public List<Action<IAdapterOperations>> BuildActions()
    {
        return new List<Action<IAdapterOperations>>
        {
            async client =>
            {
                Authorization = await client.Authorize(
                    new Uri(_opts.identityUri),
                    new Uri(_opts.iconUri, UriKind.Relative),
                    _opts.name,
                    _cluster,
                    _chain);
            }
        };
    }
}

internal sealed class ReauthorizeOperation
{
    private readonly SolanaMobileWalletAdapterOptions _opts;
    private readonly string _authToken;
    private readonly string _cluster;
    private readonly string _chain;

    public AuthorizationResult Authorization { get; private set; }

    public ReauthorizeOperation(SolanaMobileWalletAdapterOptions opts, string authToken, string cluster = null, string chain = null)
    {
        _opts = opts;
        _authToken = authToken;
        _cluster = cluster;
        _chain = chain;
    }

    public List<Action<IAdapterOperations>> BuildActions()
    {
        return new List<Action<IAdapterOperations>>
        {
            async client =>
            {
                Authorization = await client.Reauthorize(
                    new Uri(_opts.identityUri),
                    new Uri(_opts.iconUri, UriKind.Relative),
                    _opts.name, _authToken, _cluster, _chain);
            }
        };
    }
}
