using UnityEngine;
using FishNet.Object;
using System.Text;
using System.Threading.Tasks;
// Namespaces típicos do Solana Unity SDK
// using Solana.Unity.Wallet; 
// using Solana.Unity.SDK;

namespace FowlgenWars.Auth
{
    public class ClientAuthManager : NetworkBehaviour
    {
        /// <summary>
        /// Pede assinatura da carteira via Solana Unity SDK e envia ao server via RPC.
        /// Transformado em async void para suportar o popup da carteira.
        /// </summary>
        public async void RequestWalletSignature(string nonce)
        {
            try 
            {
                // A validação real usaria o singleton do Web3 da biblioteca (ex: Web3.Instance)
                // if (Web3.Instance == null || Web3.Wallet == null) { return; }

                byte[] messageBytes = Encoding.UTF8.GetBytes(nonce);
                Debug.Log("[ClientAuth] Abrindo carteira para solicitar assinatura do nonce...");
                
                // TODO: Descomentar integração quando os namespaces do Web3.Wallet estiverem linkados
                // byte[] signature = await Web3.Wallet.SignMessage(messageBytes);
                byte[] signature = new byte[64]; // Mock
                
                if (signature != null && signature.Length > 0)
                {
                    Debug.Log("[ClientAuth] Assinatura realizada! Solicitando validação do servidor (ServerRpc)...");
                    
                    // Extrairia PublicKey local
                    // string walletAddress = Web3.Account.PublicKey.Key;
                    // byte[] publicKeyBytes = Web3.Account.PublicKey.KeyBytes;

                    // TODO: Chamar CmdVerifySignature(walletAddress, nonce, signature, publicKeyBytes);
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

        /*
        // O FishNet requer a tag [ServerRpc] para enviar do Client para o Server.
        [ServerRpc]
        private void CmdVerifySignature(string walletAddress, string nonce, byte[] signature, byte[] pubKey)
        {
            // Instanciar / buscar o ServerAuthManager no ambiente do server e rodar:
            // serverAuthManager.VerifySignature(walletAddress, nonce, signature, pubKey);
        }
        */
    }
}
