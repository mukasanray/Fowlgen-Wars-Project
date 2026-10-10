using System;
using System.Collections;
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
            // TODO: Integrar com TransactionManager.cs e SolanaConnection.cs
            // 1. Carregar Keypair de Autoridade do Servidor
            // 2. Montar Instrução Anchor (claim_reward)
            // 3. Enviar e confirmar transação na Devnet/Mainnet
        }
    }
}
