using UnityEngine;
using FowlgenWars.Solana;

namespace FowlgenWars.POC
{
    public class POC04Controller : POCBaseController
    {
        protected override void InitializeScreen()
        {
            SolanaRuntime.EnsureExists();

            FowlgenWarsProgram program = Object.FindAnyObjectByType<FowlgenWarsProgram>();
            string programId = program != null ? program.ProgramId : string.Empty;

            screenUI.Configure(
                "POC 04 / LEITURA DO IDL DO CONTRATO",
                new[] { "Rede", "Contrato", "Program ID", "Status" },
                new[]
                {
                    "Devnet",
                    "fowlgen_wars_contract",
                    string.IsNullOrWhiteSpace(programId) ? "NÃO DEFINIDO" : programId,
                    program != null ? program.DescribeReadiness() : "FowlgenWarsProgram ausente"
                });

            screenUI.AddButton("CONECTAR PHANTOM", ConnectPhantomWallet);
            screenUI.AddButton("COPIAR ENDEREÇO", CopyWalletAddress);
            screenUI.AddButton("ENVIAR TRANSAÇÃO INICIAL", CallInitialize);
            screenUI.AddButton("ENVIAR TRANSAÇÃO", CallIncrement);

            if (WalletManager.Instance != null && !WalletManager.Instance.IsConnected)
            {
                WalletManager.Instance.ConnectWallet();
            }

            Log($"POC 04: Unity ↔ Anchor integration for {programId}. Click buttons to execute contract calls.");
        }

        void ConnectPhantomWallet()
        {
            SolanaRuntime.EnsureExists();
            if (WalletManager.Instance == null)
            {
                Log("WalletManager não encontrado.");
                return;
            }

            screenUI.ShowToast("⏳ Conectando Solana Wallet Adapter...", Color.yellow);
            Log("Abrindo o seletor de carteiras (Phantom, Solflare)...");
            WalletManager.Instance.ConnectWalletAdapter((success, res) =>
            {
                if (success)
                {
                    screenUI.ShowToast("✅ Carteira Phantom Conectada!", Color.green);
                    Log($"✅ CARTEIRA PHANTOM CONECTADA! Address: {res}");
                }
                else
                {
                    screenUI.ShowToast($"⚠️ {res}", Color.cyan);
                    Log($"⚠️ {res}");
                }
            });
        }

        void CopyWalletAddress()
        {
            if (WalletManager.Instance == null || !WalletManager.Instance.IsConnected || string.IsNullOrEmpty(WalletManager.Instance.PublicKey))
            {
                screenUI.ShowToast("❌ Conecte a carteira primeiro!", Color.red);
                Log("Conecte a carteira primeiro para copiar o endereço.");
                return;
            }

            string address = WalletManager.Instance.PublicKey;
            GUIUtility.systemCopyBuffer = address;
            screenUI.ShowToast("📋 Endereço Copiado!", Color.cyan);
            Log($"📋 ENDEREÇO COPIADO COM SUCESSO! -> {address}");
        }

        void CallInitialize()
        {
            SolanaRuntime.EnsureExists();
            FowlgenWarsProgram program = Object.FindAnyObjectByType<FowlgenWarsProgram>();
            if (program == null)
            {
                Log("FowlgenWarsProgram not found.");
                return;
            }

            if (WalletManager.Instance != null && !WalletManager.Instance.IsConnected)
            {
                WalletManager.Instance.ConnectWallet();
            }

            screenUI.ShowToast("⏳ Enviando Transação Inicial...", Color.yellow);
            screenUI.SetRow(3, program.DescribeReadiness());
            program.CallInitialize();
            Log($"Enviando transação inicial no programa {program.ProgramId}...");
        }

        void CallIncrement()
        {
            SolanaRuntime.EnsureExists();
            FowlgenWarsProgram program = Object.FindAnyObjectByType<FowlgenWarsProgram>();
            if (program == null)
            {
                Log("FowlgenWarsProgram não encontrado.");
                return;
            }

            if (WalletManager.Instance != null && !WalletManager.Instance.IsConnected)
            {
                WalletManager.Instance.ConnectWallet();
            }

            screenUI.ShowToast("⏳ Enviando Transação...", Color.yellow);
            screenUI.SetRow(3, program.DescribeReadiness());
            program.CallIncrement();
            Log($"Enviando transação no programa {program.ProgramId}...");
        }
    }
}

