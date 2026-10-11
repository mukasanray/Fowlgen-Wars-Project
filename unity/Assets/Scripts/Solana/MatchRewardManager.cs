using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;
// using FishNet.Object; // Comentado para evitar erros de compilação caso FishNet não esteja configurado localmente

namespace FowlgenWars.Solana
{
    [Serializable]
    public class UserWalletResponse
    {
        public string walletAddress;
    }

    /// <summary>
    /// Fase 6: Lógica Server-Authoritative (Híbrida)
    /// Este script demonstra como o servidor FishNet possui autoridade para:
    /// 1. Consultar a WebApi .NET de forma segura para obter a carteira do usuário
    /// 2. Assinar transações On-Chain (Anchor) sem expor chaves ao client.
    /// </summary>
    public class MatchRewardManager : MonoBehaviour // Substituir por NetworkBehaviour no ambiente com FishNet
    {
        [Header("API Settings")]
        [Tooltip("URL base da WebApi .NET hospedada no K8s")]
        public string apiBaseUrl = "http://fowlgenwars-api-service.default.svc.cluster.local/api"; // URL interna no K8s ou domínio público

        [Header("Solana Authority")]
        public string serverPrivateKeyPath = "/secrets/id.json"; // Injetado via Kubernetes Secrets

        // Método chamado exclusivamente pelo servidor no fim da partida
        // [Server] 
        public void ProcessEndMatchReward(Guid userId, int xpAmount)
        {
            Debug.Log($"[Server] Partida encerrada. Processando recompensas para {userId}...");
            StartCoroutine(FetchUserWalletAndSignReward(userId, xpAmount));
        }

        private IEnumerator FetchUserWalletAndSignReward(Guid userId, int xpAmount)
        {
            string url = $"{apiBaseUrl}/users/{userId}/wallet";
            using (UnityWebRequest request = UnityWebRequest.Get(url))
            {
                // Requisita a carteira do usuário da API .NET (Fase 1 / Fase 6)
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    string json = request.downloadHandler.text;
                    UserWalletResponse response = JsonUtility.FromJson<UserWalletResponse>(json);

                    if (!string.IsNullOrEmpty(response.walletAddress))
                    {
                        Debug.Log($"[Server] Carteira do jogador localizada: {response.walletAddress}");
                        SubmitRewardToSolana(response.walletAddress, xpAmount);
                    }
                    else
                    {
                        Debug.LogError($"[Server] Usuário {userId} não possui carteira vinculada.");
                    }
                }
                else
                {
                    Debug.LogError($"[Server] Falha ao consultar WebApi: {request.error}");
                }
            }
        }

        private void SubmitRewardToSolana(string playerWallet, int xpAmount)
        {
            Debug.Log($"[Server-Authoritative] Assinando transação Anchor para creditar {xpAmount} XP na carteira {playerWallet}");
            StartCoroutine(SendClaimRewardRoutine(playerWallet, (ulong)xpAmount, true));
        }

        private IEnumerator SendClaimRewardRoutine(string playerWallet, ulong xpAmount, bool isWin)
        {
            if (SolanaManager.Instance == null || SolanaManager.Instance.Config == null)
            {
                Debug.LogError("[Server] SolanaManager ou Config não encontrados.");
                yield break;
            }

            string rpcUrl = SolanaManager.Instance.Config.rpcUrl;
            string programId = SolanaManager.Instance.Config.programId;

            // 1. Carregar Keypair de Autoridade do Servidor
            global::Solana.Unity.Wallet.Account serverAccount = null;
            try
            {
                // Em produção, lê o id.json gerado pela Solana CLI
                if (System.IO.File.Exists(serverPrivateKeyPath))
                {
                    string json = System.IO.File.ReadAllText(serverPrivateKeyPath);
                    serverAccount = global::Solana.Unity.SDK.InGameWallet.FromSecret(json.Trim());
                    if (serverAccount == null)
                    {
                        throw new InvalidOperationException("A chave privada do servidor não pôde ser carregada.");
                    }
                }
                else
                {
                    Debug.LogWarning($"[Server] {serverPrivateKeyPath} não encontrado. Usando chave temporária para testes DEV.");
                    serverAccount = new global::Solana.Unity.Wallet.Account(); // Apenas testes locais
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"[Server] Erro ao decodificar serverPrivateKey: {ex.Message}");
                yield break;
            }

            // 2. Fetch Latest Blockhash
            string recentBlockhash = string.Empty;
            string getBlockhashBody = "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getLatestBlockhash\",\"params\":[{\"commitment\":\"confirmed\"}]}";
            using (UnityWebRequest req = new UnityWebRequest(rpcUrl, "POST"))
            {
                req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(getBlockhashBody));
                req.downloadHandler = new DownloadHandlerBuffer();
                req.SetRequestHeader("Content-Type", "application/json");
                yield return req.SendWebRequest();
                if (req.result == UnityWebRequest.Result.Success)
                {
                    string res = req.downloadHandler.text;
                    int idx = res.IndexOf("\"blockhash\":\"");
                    if (idx >= 0)
                    {
                        int start = idx + 13;
                        int end = res.IndexOf("\"", start);
                        recentBlockhash = res.Substring(start, end - start);
                    }
                }
            }

            if (string.IsNullOrEmpty(recentBlockhash))
            {
                Debug.LogError("[Server] Falha ao obter blockhash.");
                yield break;
            }

            // 3. Montar Instrução Anchor (claim_reward)
            global::Solana.Unity.Wallet.PublicKey programIdKey = new global::Solana.Unity.Wallet.PublicKey(programId);
            global::Solana.Unity.Wallet.PublicKey playerAuthKey = new global::Solana.Unity.Wallet.PublicKey(playerWallet);

            // PDAs
            global::Solana.Unity.Wallet.PublicKey.TryFindProgramAddress(
                new byte[][] { Encoding.UTF8.GetBytes("player"), playerAuthKey.KeyBytes }, 
                programIdKey, out global::Solana.Unity.Wallet.PublicKey playerPda, out _);
            
            global::Solana.Unity.Wallet.PublicKey.TryFindProgramAddress(
                new byte[][] { Encoding.UTF8.GetBytes("game_config") }, 
                programIdKey, out global::Solana.Unity.Wallet.PublicKey gameConfigPda, out _);

            // Discriminator para claim_reward: Sha256("global:claim_reward")[..8]
            byte[] data = new byte[17];
            byte[] disc = new byte[] { 149, 95, 181, 242, 94, 90, 158, 162 };
            Array.Copy(disc, 0, data, 0, 8);
            byte[] xpBytes = BitConverter.GetBytes(xpAmount);
            Array.Copy(xpBytes, 0, data, 8, 8);
            data[16] = isWin ? (byte)1 : (byte)0;

            var instruction = new global::Solana.Unity.Rpc.Models.TransactionInstruction
            {
                ProgramId = programIdKey.KeyBytes,
                Data = data,
                Keys = new List<global::Solana.Unity.Rpc.Models.AccountMeta>
                {
                    global::Solana.Unity.Rpc.Models.AccountMeta.Writable(playerPda, false),
                    global::Solana.Unity.Rpc.Models.AccountMeta.ReadOnly(playerAuthKey, false),
                    global::Solana.Unity.Rpc.Models.AccountMeta.ReadOnly(gameConfigPda, false),
                    global::Solana.Unity.Rpc.Models.AccountMeta.Writable(serverAccount.PublicKey, true) // Fee Payer & Signer
                }
            };

            // 4. Enviar Transação
            var builder = new global::Solana.Unity.Rpc.Builders.TransactionBuilder()
                .SetFeePayer(serverAccount.PublicKey)
                .SetRecentBlockHash(recentBlockhash)
                .AddInstruction(instruction);

            byte[] txRaw = builder.Build(serverAccount);
            string base64Tx = Convert.ToBase64String(txRaw);
            string sendTxJson = $"{{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"sendTransaction\",\"params\":[\"{base64Tx}\",{{\"encoding\":\"base64\"}}]}}";

            using (UnityWebRequest sendReq = new UnityWebRequest(rpcUrl, "POST"))
            {
                sendReq.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(sendTxJson));
                sendReq.downloadHandler = new DownloadHandlerBuffer();
                sendReq.SetRequestHeader("Content-Type", "application/json");
                yield return sendReq.SendWebRequest();

                if (sendReq.result == UnityWebRequest.Result.Success)
                    Debug.Log($"[Server] Resultado ClaimReward On-Chain: {sendReq.downloadHandler.text}");
                else
                    Debug.LogError($"[Server] Erro ClaimReward On-Chain: {sendReq.error}");
            }
        }
    }
}
