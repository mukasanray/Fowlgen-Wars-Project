using UnityEngine;
using FishNet.Object;
using System.Text;
using System.Threading.Tasks;
using Solana.Unity.SDK;

namespace FowlgenWars.Auth
{
    public class ClientAuthManager : NetworkBehaviour
    {
        public event System.Action<bool> AuthenticationCompleted;
        public string WalletAddress { get; private set; }

        public void Login()
        {
            ServerAuthManager serverAuthManager = FindAnyObjectByType<ServerAuthManager>();
            if (serverAuthManager == null)
            {
                Debug.LogError("[ClientAuth] ServerAuthManager não encontrado na cena/rede.");
                return;
            }

            RequestWalletSignature(serverAuthManager.GenerateNonce());
        }

        /// <summary>
        /// Pede assinatura da carteira via Solana Unity SDK e envia ao server via RPC.
        /// Transformado em async void para suportar o popup da carteira.
        /// </summary>
        public async void RequestWalletSignature(string nonce)
        {
            try 
            {
                if (Web3.Wallet?.Account == null)
                {
                    Debug.LogWarning("[ClientAuth] Nenhuma carteira Solana conectada.");
                    return;
                }

                byte[] messageBytes = Encoding.UTF8.GetBytes(nonce);
                Debug.Log("[ClientAuth] Abrindo carteira para solicitar assinatura do nonce...");

                byte[] signature = await Web3.Wallet.SignMessage(messageBytes);
                if (signature != null && signature.Length > 0)
                {
                    WalletAddress = Web3.Wallet.Account.PublicKey.Key;
                    Debug.Log("[ClientAuth] Assinatura realizada! Solicitando validação do servidor (ServerRpc)...");

                    CmdVerifySignature(
                        Web3.Wallet.Account.PublicKey.Key,
                        nonce,
                        signature,
                        Web3.Wallet.Account.PublicKey.KeyBytes);
                }
                else
                {
                    Debug.LogWarning("[ClientAuth] Usuário rejeitou a assinatura ou erro na carteira.");
                }
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"[ClientAuth] Exceção ao assinar: {ex.Message}");
            }
        }

        [ServerRpc(RequireOwnership = false)]
        private void CmdVerifySignature(string walletAddress, string nonce, byte[] signature, byte[] pubKey)
        {
            ServerAuthManager serverAuthManager = FindAnyObjectByType<ServerAuthManager>();
            if (serverAuthManager == null)
            {
                Debug.LogError("[ServerAuth] ServerAuthManager não encontrado no servidor.");
                return;
            }

            bool authenticated = serverAuthManager.VerifySignature(walletAddress, nonce, signature, pubKey);
            TargetAuthenticationResult(Owner, authenticated);
        }

        [TargetRpc]
        private void TargetAuthenticationResult(FishNet.Connection.NetworkConnection connection, bool authenticated)
        {
            AuthenticationCompleted?.Invoke(authenticated);
            if (authenticated)
                Debug.Log("[ClientAuth] Autenticação concluída.");
            else
                Debug.LogWarning("[ClientAuth] A autenticação foi rejeitada pelo servidor.");
        }
    }
}
