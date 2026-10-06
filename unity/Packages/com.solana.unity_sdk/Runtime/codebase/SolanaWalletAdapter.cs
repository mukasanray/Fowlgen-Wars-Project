using System;
using System.Threading.Tasks;
using Solana.Unity.Rpc.Models;
using Solana.Unity.Wallet;

// ReSharper disable once CheckNamespace

namespace Solana.Unity.SDK
{
    
    [Serializable]
    public class SolanaWalletAdapterOptions
    {
        public SolanaMobileWalletAdapterOptions solanaMobileWalletAdapterOptions;
        public SolanaWalletAdapterWebGLOptions solanaWalletAdapterWebGLOptions;
        public PhantomWalletOptions phantomWalletOptions;
    }
    
    public class SolanaWalletAdapter: WalletBase
    {
        private readonly WalletBase _internalWallet;

        public event Action OnWalletDisconnected;
        public event Action OnWalletReconnected;

        /// <summary>
        /// Creates a cross-platform wallet adapter.
        /// </summary>
        /// <param name="authCache">
        /// Optional Mobile Wallet Adapter auth-token cache. Forwarded to the
        /// Android <see cref="SolanaMobileWalletAdapter"/>. Ignored on WebGL
        /// and iOS since those platforms do not use MWA bearer tokens. When
        /// left <c>null</c> the SDK falls back to
        /// <see cref="PlayerPrefsAuthCache"/>. Pass a custom
        /// <see cref="IMwaAuthCache"/> (e.g. Android Keystore /
        /// EncryptedSharedPreferences) for production builds that need
        /// encryption at rest.
        /// </param>
        /// <param name="walletSelectionCache">
        /// Optional cache for the user's wallet package selection. Forwarded to
        /// the Android <see cref="SolanaMobileWalletAdapter"/>. Ignored on
        /// other platforms. When left <c>null</c> the SDK falls back to
        /// <see cref="PlayerPrefsMwaWalletSelectionCache"/>.
        /// </param>
        public SolanaWalletAdapter(SolanaWalletAdapterOptions options, RpcCluster rpcCluster = RpcCluster.DevNet, string customRpcUri = null, string customStreamingRpcUri = null, bool autoConnectOnStartup = false, IMwaAuthCache authCache = null, IMwaWalletSelectionCache walletSelectionCache = null) : base(rpcCluster, customRpcUri, customStreamingRpcUri, autoConnectOnStartup)
        {
            #if UNITY_ANDROID
            #pragma warning disable CS0618
            _internalWallet = new SolanaMobileWalletAdapter(options.solanaMobileWalletAdapterOptions, rpcCluster, customRpcUri, customStreamingRpcUri, autoConnectOnStartup, authCache, walletSelectionCache);
            #elif UNITY_WEBGL
            #pragma warning disable CS0618
            _internalWallet = new SolanaWalletAdapterWebGL(options.solanaWalletAdapterWebGLOptions, rpcCluster, customRpcUri, customStreamingRpcUri, autoConnectOnStartup);
            #elif UNITY_IOS
            #pragma warning disable CS0618
            _internalWallet = new PhantomDeepLink(options.phantomWalletOptions, rpcCluster, customRpcUri, customStreamingRpcUri, autoConnectOnStartup);
            #else
            #endif

            #if UNITY_ANDROID
            if (_internalWallet is SolanaMobileWalletAdapter mobileAdapter)
            {
                mobileAdapter.OnWalletDisconnected += () => OnWalletDisconnected?.Invoke();
                mobileAdapter.OnWalletReconnected += () => OnWalletReconnected?.Invoke();
            }
            #endif
        }

        protected override Task<Account> _Login(string password = null)
        {
            if (_internalWallet != null)
                return _internalWallet.Login(password);
            throw new NotImplementedException();
        }

        protected override Task<Transaction> _SignTransaction(Transaction transaction)
        {
            if (_internalWallet != null)
                return _internalWallet.SignTransaction(transaction);
            throw new NotImplementedException();
        }

        protected override Task<Transaction[]> _SignAllTransactions(Transaction[] transactions)
        {
            if (_internalWallet != null)
                return _internalWallet.SignAllTransactions(transactions);
            throw new NotImplementedException();
        }

        public override Task<byte[]> SignMessage(byte[] message)
        {
            if (_internalWallet != null)
                return _internalWallet.SignMessage(message);
            throw new NotImplementedException();
        }

        /// <summary>
        /// Signs multiple arbitrary messages in a single wallet round-trip (Android MWA only),
        /// the batch counterpart to <see cref="SignMessage"/> and the equivalent of the React
        /// Native SDK's <c>signMessages</c>. Returns one signed payload per input message.
        /// </summary>
        public async Task<byte[][]> SignMessages(byte[][] messages)
        {
            var mobileAdapter = _internalWallet as SolanaMobileWalletAdapter;
            if (mobileAdapter != null)
                return await mobileAdapter.SignMessages(messages);
            if (_internalWallet != null)
                throw new NotImplementedException();
            return null;
        }

        protected override Task<Account> _CreateAccount(string mnemonic = null, string password = null)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Disconnects locally: clears the cached session (in-memory token, cached public key,
        /// auth-token cache, remembered wallet). Does NOT revoke wallet-side — use
        /// <see cref="DeauthorizeWallet"/> for that. The next <c>Login()</c> re-prompts.
        /// When active, also nulls <c>Web3.Wallet</c> (fires <c>Web3.OnLogout</c> / <c>OnWalletChangeState</c>).
        /// </summary>
        public async Task DisconnectWallet()
        {
            base.Logout();
            if (_internalWallet is SolanaMobileWalletAdapter mobileAdapter)
                await mobileAdapter.DisconnectWallet();
            else
                _internalWallet?.Logout();
            DetachFromWeb3IfActive();
        }

        /// <summary>
        /// <see cref="WalletBase"/> override; performs the same local clear as
        /// <see cref="DisconnectWallet"/>.
        /// </summary>
        public override void Logout() => DisconnectWallet().GetAwaiter().GetResult();

        /// <summary>
        /// Revokes the authorization wallet-side and clears local state (Android MWA only),
        /// firing <c>OnWalletDisconnected</c>. For a local-only disconnect use
        /// <see cref="DisconnectWallet"/>. When active, also nulls <c>Web3.Wallet</c>.
        /// </summary>
        public async Task DeauthorizeWallet()
        {
            var mobileAdapter = _internalWallet as SolanaMobileWalletAdapter;
            if (mobileAdapter != null)
            {
                await mobileAdapter.DeauthorizeWallet();
                DetachFromWeb3IfActive();
                return;
            }
            if (_internalWallet != null)
                throw new NotImplementedException();
            // No internal wallet configured - nothing to deauthorize
        }

        // Null Web3.Wallet when this adapter is the active one. No-op when standalone
        // or when a different wallet is active.
        private void DetachFromWeb3IfActive()
        {
            if (Web3.Instance != null && ReferenceEquals(Web3.Instance.WalletBase, this))
                Web3.Instance.WalletBase = null;
        }

        /// <summary>
        /// Clears the cached wallet-adapter session without an instance (e.g. a cached account
        /// shown before login). Local only; does not revoke wallet-side.
        /// </summary>
        public static Task ClearCachedSession() => MwaSession.ClearCachedSession();

        /// <summary>
        /// Signs AND submits transactions via the wallet (Android MWA only), returning a
        /// typed <see cref="SignAndSendTxResult"/> (Success / UserDeclined / NotSubmitted /
        /// NotSupported / …). No fallback to local signing.
        /// </summary>
        public async Task<SignAndSendTxResult> SignAndSendTransactions(
            Transaction[] transactions, SignAndSendTransactionsOptions options = null)
        {
            var mobileAdapter = _internalWallet as SolanaMobileWalletAdapter;
            if (mobileAdapter != null)
                return await mobileAdapter.SignAndSendTransactions(transactions, options);
            if (_internalWallet != null)
                throw new NotImplementedException();
            return null;
        }

        /// <summary>
        /// Clones the current authorization into a new auth_token (Android MWA only).
        /// Throws <see cref="NotSupportedException"/> if the wallet does not implement it.
        /// </summary>
        public async Task<string> CloneAuthorization()
        {
            var mobileAdapter = _internalWallet as SolanaMobileWalletAdapter;
            if (mobileAdapter != null)
                return await mobileAdapter.CloneAuthorization();
            if (_internalWallet != null)
                throw new NotImplementedException();
            return null;
        }

        /// <summary>
        /// Logs in with Sign-In-With-Solana (Android MWA only), returning the account and
        /// the SIWS result (native sign_in_result or a sign_messages fallback).
        /// </summary>
        public async Task<(Account account, SignInResult signInResult)> LoginWithSignIn(SignInPayload payload)
        {
            var mobileAdapter = _internalWallet as SolanaMobileWalletAdapter;
            if (mobileAdapter != null)
            {
                var result = await mobileAdapter.LoginWithSignIn(payload);
                // SIWS bypasses Login(), so set Account here.
                Account = result.account;
                return result;
            }
            if (_internalWallet != null)
                throw new NotImplementedException();
            return default;
        }

        public async Task ReconnectWallet()
        {
            var mobileAdapter = _internalWallet as SolanaMobileWalletAdapter;
            if (mobileAdapter != null)
            {
                await mobileAdapter.ReconnectWallet();
                return;
            }
            if (_internalWallet != null)
                throw new NotImplementedException();
            // No internal wallet configured - nothing to reconnect
        }

        /// <summary>
        /// Forwards app-focus lifecycle to platform adapters that need it.
        /// Currently used by Android MWA for silent resume checks.
        /// </summary>
        public async Task HandleApplicationFocus(bool hasFocus)
        {
            var mobileAdapter = _internalWallet as SolanaMobileWalletAdapter;
            if (mobileAdapter != null)
            {
                await mobileAdapter.HandleApplicationFocus(hasFocus);
            }
        }

        /// <summary>
        /// Queries the connected wallet's supported features and limits.
        /// </summary>
        /// <returns>
        /// A <see cref="CapabilitiesResult"/> containing wallet feature limits
        /// (MaxTransactionsPerRequest, MaxMessagesPerRequest,
        /// SupportedTransactionVersions, SupportsCloneAuthorization)
        /// when running on Android with a connected SolanaMobileWalletAdapter.
        /// Returns null when _internalWallet is null or not configured.
        /// Throws <see cref="NotImplementedException"/> when _internalWallet
        /// is non-null but is not a SolanaMobileWalletAdapter (e.g. WebGL,
        /// iOS). Callers must handle the null return case.
        /// </returns>
        public async Task<CapabilitiesResult> GetCapabilities()
        {
            var mobileAdapter = _internalWallet as SolanaMobileWalletAdapter;
            if (mobileAdapter != null)
                return await mobileAdapter.GetCapabilities();
            if (_internalWallet != null)
                throw new NotImplementedException();
            return null;
        }
    }
}
