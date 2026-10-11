using UnityEngine;
using System;
using System.Text;
using System.Threading.Tasks;
using Solana.Unity.SDK;
using FowlgenWars.Solana;
using FishNet;
using FishNet.Broadcast;
using FishNet.Transporting;

namespace FowlgenWars.Auth
{
    public struct AuthRequestBroadcast : IBroadcast
    {
        public string WalletAddress;
        public string Nonce;
        public byte[] Signature;
        public byte[] PublicKey;
    }

    public struct AuthResponseBroadcast : IBroadcast
    {
        public bool Authenticated;
        public string Message;
    }

    public class ClientAuthManager : MonoBehaviour
    {
        public static ClientAuthManager Instance { get; private set; }

        public event Action<bool, string> AuthenticationCompleted;
        public string WalletAddress { get; private set; }

        private Action<bool, string> pendingCallback;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        private void OnEnable()
        {
            if (InstanceFinder.ClientManager != null)
                InstanceFinder.ClientManager.RegisterBroadcast<AuthResponseBroadcast>(OnAuthResponseReceived);
        }

        private void OnDisable()
        {
            if (InstanceFinder.ClientManager != null)
                InstanceFinder.ClientManager.UnregisterBroadcast<AuthResponseBroadcast>(OnAuthResponseReceived);
        }

        private void OnAuthResponseReceived(AuthResponseBroadcast response, Channel channel)
        {
            NotifyResult(response.Authenticated, response.Message);
        }

        public void Login(Action<bool, string> callback = null)
        {
            pendingCallback = callback;

            // Busca nonce do servidor local se disponível ou gera nonce de sessão
            string nonce = ServerAuthManager.Instance != null 
                ? ServerAuthManager.Instance.GenerateNonce() 
                : Guid.NewGuid().ToString("N");

            RequestWalletSignature(nonce);
        }

        /// <summary>
        /// Pede assinatura da carteira via Solana Unity SDK / WalletManager e valida via FishNet Broadcast.
        /// </summary>
        public async void RequestWalletSignature(string nonce)
        {
            try 
            {
                byte[] messageBytes = Encoding.UTF8.GetBytes(nonce);
                byte[] signature = null;
                byte[] pubKeyBytes = null;
                string address = null;

                // 1. Tenta via Solana Unity SDK Web3 (Phantom MWA / WebGL)
                if (Web3.Wallet?.Account != null)
                {
                    Debug.Log("[ClientAuth] Solicitando assinatura de Nonce via Web3.Wallet (Phantom)...");
                    address = Web3.Wallet.Account.PublicKey.Key;
                    pubKeyBytes = Web3.Wallet.Account.PublicKey.KeyBytes;
                    signature = await Web3.Wallet.SignMessage(messageBytes);
                }
                // 2. Tenta via WalletManager (Devnet local / importada / fallback)
                else if (WalletManager.Instance != null && WalletManager.Instance.Account != null)
                {
                    Debug.Log("[ClientAuth] Solicitando assinatura de Nonce via WalletManager local...");
                    address = WalletManager.Instance.PublicKey;
                    pubKeyBytes = WalletManager.Instance.Account.PublicKey.KeyBytes;
                    signature = WalletManager.Instance.Account.Sign(messageBytes);
                }
                else
                {
                    Debug.LogWarning("[ClientAuth] Nenhuma carteira Solana conectada.");
                    NotifyResult(false, "Nenhuma carteira conectada para assinar.");
                    return;
                }

                if (signature != null && signature.Length > 0)
                {
                    WalletAddress = address;
                    Debug.Log($"[ClientAuth] Assinatura obtida para {address}! Validando com Servidor Dedicado...");

                    // Se FishNet estiver com cliente ativo na rede, usa Broadcast oficial do FishNet
                    if (InstanceFinder.ClientManager != null && InstanceFinder.ClientManager.Started)
                    {
                        InstanceFinder.ClientManager.Broadcast(new AuthRequestBroadcast
                        {
                            WalletAddress = address,
                            Nonce = nonce,
                            Signature = signature,
                            PublicKey = pubKeyBytes
                        });
                    }
                    else
                    {
                        // Fallback quando executando em modo local / editor sem servidor dedicado conectado
                        Debug.Log("[ClientAuth] Rede FishNet não conectada no momento. Validando via ServerAuthManager local...");
                        bool localAuth = ServerAuthManager.Instance != null 
                            && ServerAuthManager.Instance.VerifySignature(address, nonce, signature, pubKeyBytes);

                        NotifyResult(localAuth, localAuth ? "Autenticação aprovada (Local/Direct)." : "Assinatura rejeitada pelo servidor.");
                    }
                }
                else
                {
                    Debug.LogWarning("[ClientAuth] Usuário rejeitou a assinatura ou erro na carteira.");
                    NotifyResult(false, "Assinatura rejeitada na carteira.");
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"[ClientAuth] Exceção ao assinar: {ex.Message}");
                NotifyResult(false, ex.Message);
            }
        }

        private void NotifyResult(bool authenticated, string message)
        {
            if (authenticated)
                Debug.Log($"[ClientAuth] ✅ Autenticação concluída: {message}");
            else
                Debug.LogWarning($"[ClientAuth] ❌ A autenticação foi rejeitada: {message}");

            var cb = pendingCallback;
            pendingCallback = null;
            cb?.Invoke(authenticated, message);

            AuthenticationCompleted?.Invoke(authenticated, message);
        }
    }
}

