using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using Solana.Unity.Wallet;
using Solana.Unity.Wallet.Bip39;
using Solana.Unity.SDK;

namespace FowlgenWars.Solana
{
    /// <summary>
    /// Gerenciamento de wallet do jogador para Devnet (suporta Phantom MWA no Android, importação no Editor e carteira local).
    /// </summary>
    public class WalletManager : MonoBehaviour
    {
        private const string PrefsSecretKey = "FOWLGEN_DEVNET_SECRET_KEY";

        public static WalletManager Instance { get; private set; }

        public enum WalletStatus
        {
            Disconnected,
            Connecting,
            Connected,
            Error
        }

        private WalletStatus status = WalletStatus.Disconnected;
        private string publicKey = string.Empty;

        public Account Account { get; private set; }
        public WalletStatus Status => status;
        public bool IsConnected => status == WalletStatus.Connected && Account != null;
        public string PublicKey => Account != null ? Account.PublicKey.Key : publicKey;
        public double BalanceSol { get; private set; } = 0.0;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
        }

        /// <summary>
        /// Conecta uma wallet devnet local (carrega chave/mnemonic armazenado se existir).
        /// </summary>
        public void ConnectWallet(string customSecret = null)
        {
            Debug.Log("[WalletManager] Conectando devnet wallet...");
            status = WalletStatus.Connecting;

            try
            {
                if (!string.IsNullOrWhiteSpace(customSecret))
                {
                    Account = InGameWallet.FromSecret(customSecret);
                    if (Account != null)
                    {
                        PlayerPrefs.SetString(PrefsSecretKey, customSecret);
                        PlayerPrefs.Save();
                    }
                }
                else if (Account == null)
                {
                    string savedSecret = PlayerPrefs.GetString(PrefsSecretKey, string.Empty);
                    if (!string.IsNullOrWhiteSpace(savedSecret))
                    {
                        try
                        {
                            Account = InGameWallet.FromSecret(savedSecret);
                            if (Account != null)
                                Debug.Log("[WalletManager] Carteira devnet recuperada do armazenamento local.");
                        }
                        catch
                        {
                            Account = null;
                        }
                    }

                    if (Account == null)
                    {
                        var mnem = new Mnemonic(WordList.English, WordCount.Twelve);
                        var wallet = new Wallet(mnem);
                        Account = wallet.Account;
                        PlayerPrefs.SetString(PrefsSecretKey, mnem.ToString());
                        PlayerPrefs.Save();
                    }
                }

                publicKey = Account.PublicKey.Key;
                status = WalletStatus.Connected;
                
                Debug.Log("==================================================");
                Debug.Log($"CARTEIRA DEVNET (PUBLIC KEY): {publicKey}");
                Debug.Log($"Faça o faucet em https://faucet.solana.com/ para esta carteira.");
                Debug.Log("==================================================");

                UpdateBalance();
            }
            catch (System.Exception ex)
            {
                status = WalletStatus.Error;
                Debug.LogError($"[WalletManager] Erro ao conectar carteira: {ex.Message}");
            }
        }

        /// <summary>
        /// Importa uma carteira a partir da área de transferência (Ctrl+C no Phantom -> Ctrl+V no Unity).
        /// Suporta Private Key Base58 ou Mnemonic (12/24 palavras).
        /// </summary>
        public void ImportWalletFromClipboard(System.Action<bool, string> callback = null)
        {
            string text = GUIUtility.systemCopyBuffer;
            if (string.IsNullOrWhiteSpace(text))
            {
                callback?.Invoke(false, "Área de transferência está vazia. Copie sua chave/seed da Phantom primeiro.");
                return;
            }

            try
            {
                string secret = text.Trim();
                Account acc = InGameWallet.FromSecret(secret);
                if (acc != null)
                {
                    Account = acc;
                    publicKey = acc.PublicKey.Key;
                    status = WalletStatus.Connected;
                    PlayerPrefs.SetString(PrefsSecretKey, secret);
                    PlayerPrefs.Save();

                    Debug.Log("==========================================");
                    Debug.Log($"CARTEIRA IMPORTADA DA PHANTOM: {publicKey}");
                    Debug.Log("==========================================");

                    UpdateBalance();
                    callback?.Invoke(true, publicKey);
                }
                else
                {
                    callback?.Invoke(false, "Formato de chave privada ou frase seed inválido.");
                }
            }
            catch (System.Exception ex)
            {
                callback?.Invoke(false, $"Erro ao importar carteira: {ex.Message}");
            }
        }

        /// <summary>
        /// Abre o modal do Solana Wallet Adapter (MWA no Android / WebGL).
        /// </summary>
        public async void ConnectWalletAdapter(System.Action<bool, string> callback = null)
        {
            Debug.Log("[WalletManager] Abrindo Solana Wallet Adapter...");
            status = WalletStatus.Connecting;

            if (Web3.Instance == null)
            {
                var go = new GameObject("Web3");
                go.AddComponent<Web3>();
            }

            try
            {
                Account acc = await Web3.Instance.LoginWalletAdapter();
                if (acc != null)
                {
                    Account = acc;
                    publicKey = acc.PublicKey.Key;
                    status = WalletStatus.Connected;
                    Debug.Log($"==========================================");
                    Debug.Log($"CARTEIRA EXTERNA CONECTADA (PHANTOM): {publicKey}");
                    Debug.Log($"==========================================");
                    UpdateBalance();
                    callback?.Invoke(true, publicKey);
                }
                else
                {
                    status = WalletStatus.Error;
                    callback?.Invoke(false, "Conexão cancelada pelo usuário ou falhou.");
                }
            }
            catch (System.Exception ex)
            {
                status = WalletStatus.Error;
                Debug.LogError($"[WalletManager] Erro no Wallet Adapter: {ex.Message}");
                callback?.Invoke(false, ex.Message);
            }
        }

        public void DisconnectWallet()
        {
            Account = null;
            publicKey = string.Empty;
            BalanceSol = 0.0;
            status = WalletStatus.Disconnected;
            Debug.Log("[WalletManager] Wallet desconectada.");
        }

        public byte[] SignTransaction(byte[] messageData)
        {
            if (!IsConnected)
            {
                Debug.LogError("[WalletManager] Wallet não conectada.");
                return null;
            }

            return Account.Sign(messageData);
        }

        /// <summary>
        /// Atualiza o saldo em SOL da carteira via RPC.
        /// </summary>
        public void UpdateBalance(System.Action<double> callback = null)
        {
            if (!IsConnected)
            {
                callback?.Invoke(0);
                return;
            }

            string rpcUrl = SolanaManager.Instance != null && SolanaManager.Instance.Config != null
                ? SolanaManager.Instance.Config.rpcUrl
                : "https://api.devnet.solana.com";

            StartCoroutine(GetBalanceRoutine(rpcUrl, (sol) =>
            {
                BalanceSol = sol;
                callback?.Invoke(sol);
            }));
        }

        private IEnumerator GetBalanceRoutine(string rpcUrl, System.Action<double> callback)
        {
            string jsonBody = $"{{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getBalance\",\"params\":[\"{PublicKey}\"]}}";
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);

            using (UnityWebRequest request = new UnityWebRequest(rpcUrl, "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string res = request.downloadHandler.text;
                    int idx = res.IndexOf("\"value\":");
                    if (idx >= 0)
                    {
                        int start = idx + 8;
                        int end = res.IndexOf("}", start);
                        if (end < 0) end = res.IndexOf(",", start);
                        if (end > start && ulong.TryParse(res.Substring(start, end - start).Trim(), out ulong lamports))
                        {
                            double sol = lamports / 1000000000.0;
                            callback?.Invoke(sol);
                            yield break;
                        }
                    }
                }

                callback?.Invoke(0);
            }
        }

        /// <summary>
        /// Garante que a carteira possui saldo suficiente de SOL.
        /// </summary>
        public void EnsureSolBalance(double minimumSol, System.Action<bool, string> callback)
        {
            if (!IsConnected)
            {
                callback?.Invoke(false, "Wallet não conectada.");
                return;
            }

            UpdateBalance((sol) =>
            {
                if (sol >= minimumSol)
                {
                    Debug.Log($"[WalletManager] Saldo suficiente: {sol:F4} SOL.");
                    callback?.Invoke(true, $"Saldo suficiente ({sol:F4} SOL)");
                }
                else
                {
                    string msg = $"Saldo insuficiente ({sol:F4} SOL). Por favor faça o faucet de SOL em https://faucet.solana.com/ para a carteira: {PublicKey}";
                    Debug.LogWarning($"[WalletManager] {msg}");
                    callback?.Invoke(false, msg);
                }
            });
        }

        /// <summary>
        /// Solicita airdrop via RPC (opcional, pode sofrer rate limit HTTP 429).
        /// </summary>
        public void RequestAirdrop(System.Action<bool, string> callback = null)
        {
            if (!IsConnected)
            {
                callback?.Invoke(false, "Wallet não conectada.");
                return;
            }

            string rpcUrl = SolanaManager.Instance != null && SolanaManager.Instance.Config != null
                ? SolanaManager.Instance.Config.rpcUrl
                : "https://api.devnet.solana.com";

            StartCoroutine(AirdropRoutine(rpcUrl, callback));
        }

        private IEnumerator AirdropRoutine(string rpcUrl, System.Action<bool, string> callback)
        {
            string jsonBody = $"{{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"requestAirdrop\",\"params\":[\"{PublicKey}\",1000000000]}}";
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);

            using (UnityWebRequest request = new UnityWebRequest(rpcUrl, "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string response = request.downloadHandler.text;
                    Debug.Log($"[WalletManager] Resposta Airdrop RPC: {response}");

                    if (response.Contains("error"))
                    {
                        callback?.Invoke(false, $"Devnet RPC rate-limited (HTTP 429). Use o web faucet: https://faucet.solana.com/ para a carteira {PublicKey}");
                        yield break;
                    }

                    callback?.Invoke(true, "Solicitação de Airdrop enviada!");
                }
                else
                {
                    callback?.Invoke(false, $"RPC Airdrop indisponível ({request.error}). Use https://faucet.solana.com/ para a carteira {PublicKey}");
                }
            }
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }
    }
}

