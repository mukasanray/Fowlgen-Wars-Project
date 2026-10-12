using UnityEngine;
using UnityEngine.Networking;
using System;
using System.Collections;
using System.Text;
using Chaos.NaCl;
using Solana.Unity.Wallet.Utilities;
using FishNet;
using FishNet.Connection;
using FishNet.Transporting;

namespace FowlgenWars.Auth
{
    public class ServerAuthManager : MonoBehaviour
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
                Destroy(this);
                return;
            }
            Instance = this;
        }

        private void OnEnable()
        {
            if (InstanceFinder.ServerManager != null)
                InstanceFinder.ServerManager.RegisterBroadcast<AuthRequestBroadcast>(OnAuthRequestReceived, requireAuthentication: false);
        }

        private void OnDisable()
        {
            if (InstanceFinder.ServerManager != null)
                InstanceFinder.ServerManager.UnregisterBroadcast<AuthRequestBroadcast>(OnAuthRequestReceived);
        }

        private void OnAuthRequestReceived(NetworkConnection conn, AuthRequestBroadcast req, Channel channel)
        {
            bool authenticated = VerifySignature(req.WalletAddress, req.Nonce, req.Signature, req.PublicKey);
            if (InstanceFinder.ServerManager != null && conn != null)
            {
                InstanceFinder.ServerManager.Broadcast(conn, new AuthResponseBroadcast
                {
                    Authenticated = authenticated,
                    Message = authenticated ? "Sucesso" : "Assinatura inválida"
                }, requireAuthenticated: false);
            }
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

                    // Notifica a API Web3 (.NET 9 Onix) em background (apenas se URL configurada e segura)
                    if (!string.IsNullOrEmpty(apiBaseUrl) && (apiBaseUrl.StartsWith("https://") || Application.isBatchMode))
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
            UnityWebRequest request = null;
            try
            {
                request = new UnityWebRequest(url, "POST");
                byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[ServerAuth] WebApi ignorada em ambiente local: {ex.Message}");
                yield break;
            }

            using (request)
            {
                UnityWebRequestAsyncOperation op = null;
                try
                {
                    op = request.SendWebRequest();
                }
                catch (Exception ex)
                {
                    Debug.LogWarning($"[ServerAuth] WebApi SendWebRequest ignorado: {ex.Message}");
                    yield break;
                }

                yield return op;

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

