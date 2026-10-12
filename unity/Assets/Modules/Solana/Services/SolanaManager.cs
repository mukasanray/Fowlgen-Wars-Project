using UnityEngine;

namespace FowlgenWars.Solana
{
    /// <summary>
    /// Singleton central para gerenciamento da integração Solana.
    /// 
    /// Responsabilidades:
    /// - Manter a referência ao SolanaConfig
    /// - Inicializar a conexão com o RPC
    /// - Servir como ponto de acesso para outros sistemas (Wallet, Transaction)
    /// 
    /// IMPORTANTE: Esta é uma camada de abstração.
    /// A integração concreta com o Solana Unity SDK será feita quando
    /// o pacote for instalado. O SolanaManager abstrai essa dependência
    /// para que o resto do código não precise mudar.
    /// 
    /// Arquitetura:
    /// SolanaManager (singleton)
    ///   ├── SolanaConfig (ScriptableObject)
    ///   ├── SolanaConnection (conexão RPC)
    ///   ├── WalletManager (wallet do jogador)
    ///   └── TransactionManager (build/sign/send)
    /// </summary>
    public class SolanaManager : MonoBehaviour
    {
        public static SolanaManager Instance { get; private set; }

        [Header("Configuration")]
        [SerializeField]
        private SolanaConfig config;

        [Header("Debug")]
        [SerializeField]
        private bool logVerbose = true;

        /// <summary>
        /// Acesso público ao config (read-only).
        /// </summary>
        public SolanaConfig Config => config;

        /// <summary>
        /// Indica se o manager foi inicializado com sucesso.
        /// </summary>
        public bool IsInitialized { get; private set; }

        private void Awake()
        {
            // Singleton pattern com DontDestroyOnLoad
            if (Instance != null && Instance != this)
            {
                Debug.LogWarning("[SolanaManager] Instância duplicada detectada. Destruindo.");
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            if (config != null)
                Initialize();
        }

        /// <summary>
        /// Inicializa a conexão Solana.
        /// Chamado automaticamente no Awake, mas pode ser chamado
        /// manualmente para reinicializar.
        /// </summary>
        public void BindConfig(SolanaConfig newConfig)
        {
            config = newConfig;
            Initialize();
        }

        public void Initialize()
        {
            if (config == null)
            {
                Debug.LogError("[SolanaManager] SolanaConfig não configurado! " +
                    "Atribua um SolanaConfig asset no Inspector.");
                IsInitialized = false;
                return;
            }

            if (!config.IsValid())
            {
                Debug.LogError("[SolanaManager] SolanaConfig inválido. Verifique o RPC URL.");
                IsInitialized = false;
                return;
            }

            if (logVerbose)
            {
                Debug.Log($"[SolanaManager] Inicializando...");
                Debug.Log($"[SolanaManager] RPC: {config.rpcUrl}");
                Debug.Log($"[SolanaManager] Program ID: {(config.IsProgramConfigured() ? config.programId : "NÃO CONFIGURADO")}");
            }

            // TODO: Quando o Solana Unity SDK for instalado:
            // 1. Criar instância do client RPC
            // 2. Verificar conexão com o cluster
            // 3. Inicializar WalletManager
            // 4. Logar "Connected to Solana Devnet"

            IsInitialized = true;
            Debug.Log("[SolanaManager] Solana Manager inicializado com sucesso.");
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }
    }
}
