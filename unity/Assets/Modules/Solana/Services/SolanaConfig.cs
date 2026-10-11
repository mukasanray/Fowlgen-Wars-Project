using UnityEngine;

namespace FowlgenWars.Solana
{
    /// <summary>
    /// ScriptableObject para configuração da conexão Solana.
    /// 
    /// Criado via: Assets > Create > Fowlgen Wars > Solana Config
    /// 
    /// IMPORTANTE: Nunca coloque chaves privadas, seed phrases ou secrets aqui.
    /// Este arquivo é versionado no Git.
    /// 
    /// Para uso:
    /// 1. Crie um asset SolanaConfig via menu
    /// 2. Configure o rpcUrl (default: Devnet)
    /// 3. Após anchor deploy, preencha o programId
    /// 4. Atribua ao SolanaManager no Inspector
    /// </summary>
    [CreateAssetMenu(
        fileName = "SolanaConfig",
        menuName = "Fowlgen Wars/Solana Config"
    )]
    public class SolanaConfig : ScriptableObject
    {
        [Header("Network")]
        [Tooltip("URL do RPC Solana. Use Devnet para desenvolvimento.")]
        public string rpcUrl = "https://api.devnet.solana.com";

        [Header("Program")]
        [Tooltip("Program ID do contrato Fowlgen Wars.")]
        public string programId = "81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE";

        [Header("Settings")]
        [Tooltip("Timeout em segundos para chamadas RPC.")]
        public float rpcTimeout = 30f;

        /// <summary>
        /// Verifica se o Program ID foi configurado.
        /// </summary>
        public bool IsProgramConfigured()
        {
            return !string.IsNullOrWhiteSpace(programId);
        }

        /// <summary>
        /// Verifica se a configuração é válida para conexão.
        /// </summary>
        public bool IsValid()
        {
            return !string.IsNullOrWhiteSpace(rpcUrl);
        }
    }
}
