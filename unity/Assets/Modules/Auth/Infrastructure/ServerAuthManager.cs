using UnityEngine;
using UnityEngine.Networking;
using FishNet.Object;
using System;
using System.Collections;
using System.Text;
using Chaos.NaCl;
using Solana.Unity.Wallet.Utilities;

namespace FowlgenWars.Auth
{
    public class ServerAuthManager : NetworkBehaviour
    {
        public static ServerAuthManager Instance { get; private set; }

        public event Action<string> OnPlayerAuthenticated;

        [Header("API Config")]
        [Tooltip("URL base da WebApi .NET hospedada no K8s/Docker ou local")]
        [SerializeField] private string apiBaseUrl = "http://fowlgenwars-api-service.default.svc.cluster.local/api";

        [Serializable]
        private class LoginApiPayload
        {
            public string WalletAddress;
            public string Signature;
            public string Message;
        }

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
        /// Gera um texto aleatório (Nonce) para ser assinado pelo cliente.
        /// </summary>
        public string GenerateNonce()
        {
            return Guid.NewGuid().ToString("N");
        }

        /// <summary>
        /// Valida matematicamente a assinatura Ed25519 enviada pelo cliente.
        /// Sendo válida, autoriza o jogador e notifica a WebApi / Banco.
        /// </summary>
        public bool VerifySignature(string walletAddress, string nonce, byte[] signature, byte[] publicKey)
        {
            try 
            {
                if (string.IsNullOrEmpty(walletAddress) || signature == null || publicKey == null)
                {
                    Debug.LogWarning("[ServerAuth] Dados incompletos fornecidos para autenticação.");
                    return false;
                }

                // Converte a string nonce gerada de volta em array de bytes (mensagem original)
                byte[] messageBytes = Encoding.UTF8.GetBytes(nonce);

                // Utiliza a biblioteca Chaos.NaCl (presente no Solana Unity SDK) para verificar a assinatura
                bool isValid = Ed25519.Verify(signature, messageBytes, publicKey);

                if (isValid) 
                {
                    Debug.Log($"[ServerAuth] ✅ Assinatura validada com sucesso para a wallet {walletAddress}");
                    OnPlayerAuthenticated?.Invoke(walletAddress);

                    // Notifica a API Web3 (.NET 9 Onix) em background
                    if (!string.IsNullOrEmpty(apiBaseUrl))
                    {
                        StartCoroutine(NotifyWebApiLoginRoutine(walletAddress, signature, nonce));
                    }

                    return true;
                }
                else 
                {
                    Debug.LogWarning($"[ServerAuth] ❌ Assinatura INVÁLIDA para a wallet {walletAddress}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"[ServerAuth] Erro ao validar assinatura: {ex.Message}");
                return false;
            }
        }

        private IEnumerator NotifyWebApiLoginRoutine(string walletAddress, byte[] signature, string nonce)
        {
            string url = $"{apiBaseUrl.TrimEnd('/')}/users/login";

            string sigBase58;
            try
            {
                sigBase58 = Encoders.Base58.EncodeData(signature);
            }
            catch
            {
                sigBase58 = Convert.ToBase64String(signature);
            }

            var payload = new LoginApiPayload
            {
                WalletAddress = walletAddress,
                Signature = sigBase58,
                Message = nonce
            };

            string json = JsonUtility.ToJson(payload);
            using (var request = new UnityWebRequest(url, "POST"))
            {
                byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    Debug.Log($"[ServerAuth] WebApi login confirmado para {walletAddress}: {request.downloadHandler.text}");
                }
                else
                {
                    Debug.LogWarning($"[ServerAuth] WebApi indisponível ou erro HTTP ({request.error}). Validação Ed25519 interna mantida.");
                }
            }
        }
    }
}

