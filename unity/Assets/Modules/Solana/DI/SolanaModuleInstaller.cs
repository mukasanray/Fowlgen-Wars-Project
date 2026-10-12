using UnityEngine;
using FowlgenWars.Modules.Solana.Domain.Contracts;
using FowlgenWars.Solana;

namespace FowlgenWars.Modules.Solana.DI
{
    /// <summary>
    /// Composition Root / Installer do módulo Solana.
    /// Registra os serviços de carteira, conexão RPC e transações para injeção limpa.
    /// </summary>
    public class SolanaModuleInstaller : MonoBehaviour
    {
        [Header("Configuração")]
        [SerializeField] private SolanaConfig solanaConfig;

        [Header("Instâncias Locais")]
        [SerializeField] private WalletManager walletManager;
        [SerializeField] private TransactionManager transactionManager;

        public WalletManager WalletManager => walletManager;
        public TransactionManager TransactionManager => transactionManager;
        public SolanaConfig Config => solanaConfig;

        private void Awake()
        {
            if (walletManager == null)
                walletManager = GetComponentInChildren<WalletManager>() ?? FindAnyObjectByType<WalletManager>();

            if (transactionManager == null)
                transactionManager = GetComponentInChildren<TransactionManager>() ?? FindAnyObjectByType<TransactionManager>();

            if (solanaConfig == null)
                solanaConfig = Resources.Load<SolanaConfig>("Solana/SolanaConfig");
        }
    }
}
