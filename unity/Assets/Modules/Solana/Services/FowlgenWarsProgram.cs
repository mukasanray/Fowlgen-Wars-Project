using UnityEngine;

namespace FowlgenWars.Solana
{
    /// <summary>
    /// Abstração para chamar as instruções do programa Fowlgen Wars (fowlgen_wars_contract) no-chain.
    /// </summary>
    public class FowlgenWarsProgram : MonoBehaviour
    {
        [Header("IDL")]
        [SerializeField]
        [Tooltip("Referência ao IDL JSON do programa (Assets/Resources/fowlgen_wars_contract.json)")]
        private TextAsset idlJson;

        public TextAsset IdlJson => idlJson;

        public void BindIdl(TextAsset asset)
        {
            if (asset != null)
                idlJson = asset;
            else if (idlJson == null)
                idlJson = IdlInspector.LoadIdlAsset();
        }

        public string DescribeReadiness()
        {
            if (SolanaManager.Instance == null)
                return "Gerenciador Solana ausente";
            if (!SolanaManager.Instance.IsInitialized)
                return "Gerenciador Solana não inicializado";
            if (SolanaManager.Instance.Config == null || !SolanaManager.Instance.Config.IsProgramConfigured())
                return "Program ID ausente no SolanaConfig";
            if (IdlInspector.IsPlaceholderProgramId(SolanaManager.Instance.Config.programId))
                return "Program ID é o placeholder do Anchor";
            if (idlJson == null)
                return "Arquivo IDL JSON não atribuído";
            return "PRONTO";
        }

        public string ProgramId
        {
            get
            {
                if (SolanaManager.Instance != null && SolanaManager.Instance.Config != null && !string.IsNullOrWhiteSpace(SolanaManager.Instance.Config.programId))
                {
                    return SolanaManager.Instance.Config.programId;
                }
                if (idlJson != null)
                {
                    return IdlInspector.ReadAddress(idlJson.text);
                }
                return string.Empty;
            }
        }

        public bool IsReady
        {
            get
            {
                return SolanaManager.Instance != null
                    && SolanaManager.Instance.IsInitialized
                    && !string.IsNullOrWhiteSpace(ProgramId)
                    && !IdlInspector.IsPlaceholderProgramId(ProgramId)
                    && idlJson != null;
            }
        }

        /// <summary>
        /// Chama a instrução `initialize` no contrato inteligente.
        /// </summary>
        public void CallInitialize()
        {
            if (idlJson == null)
                BindIdl(null);

            if (!IsReady)
            {
                Debug.LogError("[FowlgenWarsProgram] Programa não está pronto. " + DescribeReadiness());
                return;
            }

            Debug.Log($"[FowlgenWarsProgram] Chamando instrução 'initialize' no programa {ProgramId}...");

            if (TransactionManager.Instance != null)
            {
                TransactionManager.Instance.SendTransaction("initialize");
            }
            else
            {
                Debug.LogError("[FowlgenWarsProgram] TransactionManager não encontrado.");
            }
        }

        /// <summary>
        /// Chama a instrução `increment` no contrato inteligente.
        /// </summary>
        public void CallIncrement()
        {
            if (idlJson == null)
                BindIdl(null);

            if (!IsReady)
            {
                Debug.LogError("[FowlgenWarsProgram] Programa não está pronto. " + DescribeReadiness());
                return;
            }

            Debug.Log($"[FowlgenWarsProgram] Chamando instrução 'increment' no programa {ProgramId}...");

            if (TransactionManager.Instance != null)
            {
                TransactionManager.Instance.SendTransaction("increment");
            }
            else
            {
                Debug.LogError("[FowlgenWarsProgram] TransactionManager não encontrado.");
            }
        }
    }
}

