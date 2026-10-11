using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;
using Solana.Unity.Wallet;
using Solana.Unity.Rpc.Models;
using Solana.Unity.Rpc.Builders;
using Solana.Unity.Programs;

namespace FowlgenWars.Solana
{
    /// <summary>
    /// Gerenciamento de transações Solana para as instruções do smart contract fowlgen_wars_contract.
    /// </summary>
    public class TransactionManager : MonoBehaviour
    {
        public static TransactionManager Instance { get; private set; }

        public enum TransactionStatus
        {
            Idle,
            CheckingBalance,
            Building,
            WaitingSignature,
            Sending,
            Confirmed,
            Failed
        }

        [Header("Settings")]
        [SerializeField]
        private int maxConfirmRetries = 3;

        [SerializeField]
        private float confirmRetryInterval = 2f;

        public int MaxConfirmRetries => maxConfirmRetries;
        public float ConfirmRetryInterval => confirmRetryInterval;
        public TransactionStatus Status { get; private set; } = TransactionStatus.Idle;
        public string LastSignature { get; private set; } = string.Empty;

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
        /// Constrói, assina e envia uma transação para o contrato on-chain na Devnet.
        /// </summary>
        public void SendTransaction(string instructionName, Action<bool, string> callback = null)
        {
            if (WalletManager.Instance == null || !WalletManager.Instance.IsConnected)
            {
                Debug.LogError("[TransactionManager] Wallet não conectada.");
                callback?.Invoke(false, "Wallet não conectada");
                return;
            }

            if (SolanaManager.Instance == null || !SolanaManager.Instance.IsInitialized)
            {
                Debug.LogError("[TransactionManager] SolanaManager não inicializado.");
                callback?.Invoke(false, "SolanaManager não inicializado");
                return;
            }

            string programId = SolanaManager.Instance.Config != null ? SolanaManager.Instance.Config.programId : string.Empty;
            if (string.IsNullOrWhiteSpace(programId) || IdlInspector.IsPlaceholderProgramId(programId))
            {
                Debug.LogError("[TransactionManager] Program ID não configurado ou é placeholder.");
                callback?.Invoke(false, "Program ID inválido");
                return;
            }

            Status = TransactionStatus.CheckingBalance;
            Debug.Log($"[TransactionManager] Verificando saldo antes de enviar '{instructionName}'...");

            WalletManager.Instance.EnsureSolBalance(0.01, (funded, balanceMsg) =>
            {
                if (!funded)
                {
                    Status = TransactionStatus.Failed;
                    Debug.LogError($"[TransactionManager] Saldo insuficiente para pagar a transação: {balanceMsg}");
                    callback?.Invoke(false, $"Saldo de SOL insuficiente na Devnet. {balanceMsg}");
                    return;
                }

                Status = TransactionStatus.Building;
                Debug.Log($"[TransactionManager] Construindo e enviando transação '{instructionName}' para o programa {programId}...");
                StartCoroutine(SendTransactionRoutine(instructionName, programId, callback));
            });
        }

        private IEnumerator SendTransactionRoutine(string instructionName, string programId, Action<bool, string> callback)
        {
            string rpcUrl = SolanaManager.Instance.Config.rpcUrl;

            // 1. Get latest blockhash
            string getBlockhashBody = "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getLatestBlockhash\",\"params\":[{\"commitment\":\"confirmed\"}]}";
            byte[] bodyRaw = Encoding.UTF8.GetBytes(getBlockhashBody);

            string recentBlockhash = string.Empty;
            using (UnityWebRequest request = new UnityWebRequest(rpcUrl, "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string res = request.downloadHandler.text;
                    int idx = res.IndexOf("\"blockhash\":\"");
                    if (idx >= 0)
                    {
                        int start = idx + 13;
                        int end = res.IndexOf("\"", start);
                        if (end > start)
                            recentBlockhash = res.Substring(start, end - start);
                    }
                }
            }

            if (string.IsNullOrEmpty(recentBlockhash))
            {
                Status = TransactionStatus.Failed;
                Debug.LogError("[TransactionManager] Falha ao obter recent blockhash da devnet.");
                callback?.Invoke(false, "Falha ao obter blockhash");
                yield break;
            }

            // 2. Derive PDA counter account seed "counter"
            byte[] seedBytes = Encoding.UTF8.GetBytes("counter");
            PublicKey programIdKey = new PublicKey(programId);
            bool pdaFound = PublicKey.TryFindProgramAddress(new byte[][] { seedBytes }, programIdKey, out PublicKey counterPda, out _);

            if (!pdaFound)
            {
                Status = TransactionStatus.Failed;
                Debug.LogError("[TransactionManager] Falha ao derivar PDA para o programa.");
                callback?.Invoke(false, "Falha na derivação do PDA");
                yield break;
            }

            // 3. Build instruction based on Anchor IDL discriminators from fowlgen_wars_contract
            Account signerAccount = WalletManager.Instance.Account;
            TransactionInstruction ix;

            if (instructionName.Equals("initialize", StringComparison.OrdinalIgnoreCase))
            {
                // Anchor initialize discriminator: [175, 175, 109, 31, 13, 152, 155, 237]
                ix = new TransactionInstruction
                {
                    ProgramId = programIdKey.KeyBytes,
                    Data = new byte[] { 175, 175, 109, 31, 13, 152, 155, 237 },
                    Keys = new List<AccountMeta>
                    {
                        AccountMeta.Writable(signerAccount.PublicKey, true),
                        AccountMeta.Writable(counterPda, false),
                        AccountMeta.ReadOnly(SystemProgram.ProgramIdKey, false)
                    }
                };
            }
            else if (instructionName.Equals("increment", StringComparison.OrdinalIgnoreCase))
            {
                // Anchor increment discriminator: [11, 18, 104, 9, 104, 174, 59, 33]
                ix = new TransactionInstruction
                {
                    ProgramId = programIdKey.KeyBytes,
                    Data = new byte[] { 11, 18, 104, 9, 104, 174, 59, 33 },
                    Keys = new List<AccountMeta>
                    {
                        AccountMeta.Writable(counterPda, false),
                        AccountMeta.Writable(signerAccount.PublicKey, true)
                    }
                };
            }
            else
            {
                Status = TransactionStatus.Failed;
                Debug.LogError($"[TransactionManager] Instrução desconhecida: {instructionName}");
                callback?.Invoke(false, $"Instrução desconhecida '{instructionName}'");
                yield break;
            }

            // 4. Build and sign transaction
            Status = TransactionStatus.WaitingSignature;
            TransactionBuilder builder = new TransactionBuilder()
                .SetFeePayer(signerAccount.PublicKey)
                .SetRecentBlockHash(recentBlockhash)
                .AddInstruction(ix);

            byte[] txRaw = builder.Build(signerAccount);
            string base64Tx = Convert.ToBase64String(txRaw);

            // 5. Send transaction via RPC
            Status = TransactionStatus.Sending;
            string sendTxJson = $"{{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"sendTransaction\",\"params\":[\"{base64Tx}\",{{\"encoding\":\"base64\"}}]}}";
            byte[] sendTxRaw = Encoding.UTF8.GetBytes(sendTxJson);

            using (UnityWebRequest sendReq = new UnityWebRequest(rpcUrl, "POST"))
            {
                sendReq.uploadHandler = new UploadHandlerRaw(sendTxRaw);
                sendReq.downloadHandler = new DownloadHandlerBuffer();
                sendReq.SetRequestHeader("Content-Type", "application/json");

                yield return sendReq.SendWebRequest();

                if (sendReq.result == UnityWebRequest.Result.Success)
                {
                    string res = sendReq.downloadHandler.text;
                    Debug.Log($"[TransactionManager] Resposta do RPC sendTransaction: {res}");

                    if (res.Contains("\"result\":"))
                    {
                        int resultIdx = res.IndexOf("\"result\":\"");
                        if (resultIdx >= 0)
                        {
                            int start = resultIdx + 10;
                            int end = res.IndexOf("\"", start);
                            if (end > start)
                                LastSignature = res.Substring(start, end - start);
                        }

                        Status = TransactionStatus.Confirmed;
                        Debug.Log($"[TransactionManager] Transação '{instructionName}' enviada com sucesso! Tx Signature: {LastSignature}");
                        callback?.Invoke(true, LastSignature);
                    }
                    else
                    {
                        Status = TransactionStatus.Failed;
                        string readableError = FormatRpcError(res);
                        Debug.LogError($"[TransactionManager] Erro no RPC ao enviar transação: {readableError}");
                        callback?.Invoke(false, readableError);
                    }
                }
                else
                {
                    Status = TransactionStatus.Failed;
                    Debug.LogError($"[TransactionManager] Falha no request da transação: {sendReq.error}");
                    callback?.Invoke(false, sendReq.error);
                }
            }
        }

        private string FormatRpcError(string rawRpcJson)
        {
            if (rawRpcJson.Contains("0x0") || rawRpcJson.Contains("already in use") || rawRpcJson.Contains("custom program error: 0x0"))
            {
                return "Conta counter já foi inicializada on-chain. Você pode chamar a instrução 'increment' agora!";
            }
            if (rawRpcJson.Contains("6000") || rawRpcJson.Contains("0x1770"))
            {
                return "Erro de Autorização (6000): Apenas a autoridade original do counter pode incrementá-lo.";
            }
            if (rawRpcJson.Contains("6001") || rawRpcJson.Contains("0x1771"))
            {
                return "Erro de Overflow (6001): O counter atingiu o valor máximo permitido.";
            }
            return rawRpcJson;
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

