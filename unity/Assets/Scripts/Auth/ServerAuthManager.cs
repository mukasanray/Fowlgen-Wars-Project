using UnityEngine;
using FishNet.Object;
using System;
using System.Text;

// Assumindo a existência do Chaos.NaCl através do pacote Solana.Unity.SDK
using Chaos.NaCl; 

namespace FowlgenWars.Auth
{
    public class ServerAuthManager : NetworkBehaviour
    {
        /// <summary>
        /// Gera um texto aleatório (Nonce) para ser assinado pelo cliente.
        /// </summary>
        public string GenerateNonce()
        {
            return Guid.NewGuid().ToString();
        }

        /// <summary>
        /// Valida matematicamente a assinatura Ed25519 enviada pelo cliente.
        /// Sendo válida, verifica/cria a conta no banco e libera a rede.
        /// </summary>
        public bool VerifySignature(string walletAddress, string nonce, byte[] signature, byte[] publicKey)
        {
            try 
            {
                // Converte a string nonce gerada de volta em array de bytes (mensagem original)
                byte[] messageBytes = Encoding.UTF8.GetBytes(nonce);

                // Utiliza a biblioteca Chaos.NaCl (presente no Solana Unity SDK) para verificar a assinatura
                bool isValid = Ed25519.Verify(signature, messageBytes, publicKey);

                if (isValid) 
                {
                    Debug.Log($"[ServerAuth] Assinatura validada para a wallet {walletAddress}");
                    // TODO: Integração Npgsql para consultar/gravar no PostgreSQL 
                    // Exemplo: "INSERT INTO players (wallet_address) VALUES (@wallet) ON CONFLICT DO NOTHING"
                    return true;
                }
                else 
                {
                    Debug.LogWarning($"[ServerAuth] Assinatura INVÁLIDA para a wallet {walletAddress}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"[ServerAuth] Erro ao validar assinatura: {ex.Message}");
                return false;
            }
        }
    }
}
