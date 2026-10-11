using UnityEngine;
using FowlgenWars.Solana;

namespace FowlgenWars.POC
{
    public class POC05Controller : POCBaseController
    {
        protected override void InitializeScreen()
        {
            SolanaRuntime.EnsureExists();

            screenUI.Configure(
                "POC 05 / ENVIAR TRANSAÇÃO DA CARTEIRA",
                new[] { "Rede", "Saldo em SOL", "Endereço da Carteira", "Status da Transação" },
                new[] { "Devnet", BalanceLabel(), AddressLabel(), "PRONTO" });

            screenUI.AddButton("IMPORTAR CHAVE DA PHANTOM", ImportPhantomFromClipboard);
            screenUI.AddButton("CONECTAR PHANTOM", ConnectPhantomWallet);
            screenUI.AddButton("COPIAR ENDEREÇO", CopyWalletAddress);
            screenUI.AddButton("VERIFICAR SALDO DA CARTEIRA", RefreshUI);
            screenUI.AddButton("ENVIAR TRANSAÇÃO INICIAL", SendInitializeTransaction);
            screenUI.AddButton("ENVIAR TRANSAÇÃO", SendIncrementTransaction);

            if (WalletManager.Instance != null && !WalletManager.Instance.IsConnected)
            {
                ConnectDevnetKeypair();
            }

            Log("POC 05: Para testar no Unity Editor, copie sua Private Key da Phantom e clique em 'IMPORTAR CHAVE DA PHANTOM'.");
        }

        void ImportPhantomFromClipboard()
        {
            SolanaRuntime.EnsureExists();
            if (WalletManager.Instance == null)
            {
                Log("WalletManager não encontrado.");
                return;
            }

            screenUI.ShowToast("⏳ Importando chave da área de transferência...", Color.yellow);
            Log("Importando chave copiada da área de transferência...");
            WalletManager.Instance.ImportWalletFromClipboard((success, msg) =>
            {
                RefreshUI();
                if (success)
                {
                    screenUI.ShowToast("✅ Carteira Phantom Importada!", Color.green);
                    Log($"✅ CARTEIRA IMPORTADA COM SUCESSO! Address: {msg}");
                }
                else
                {
                    screenUI.ShowToast($"❌ Falha ao Importar: {msg}", Color.red);
                    Log($"❌ FALHOU AO IMPORTAR: {msg}");
                }
            });
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
            Log("Abrindo seletor de carteiras (Mobile Wallet Adapter)...");
            WalletManager.Instance.ConnectWalletAdapter((success, res) =>
            {
                RefreshUI();
                if (success)
                {
                    screenUI.ShowToast("✅ Carteira Externa Conectada!", Color.green);
                    Log($"✅ CARTEIRA CONECTADA! Address: {res}");
                }
                else
                {
                    screenUI.ShowToast($"⚠️ {res}", Color.cyan);
                    Log($"⚠️ Status Wallet Adapter: {res}");
                }
            });
        }

        void ConnectDevnetKeypair()
        {
            SolanaRuntime.EnsureExists();
            if (WalletManager.Instance == null)
            {
                Log("WalletManager não encontrado.");
                return;
            }

            WalletManager.Instance.ConnectWallet();
            RefreshUI();
            Log($"Carteira Devnet local pronta: {WalletManager.Instance.PublicKey}");
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
            screenUI.ShowToast("📋 Endereço Copiado para a Área de Transferência!", Color.cyan);
            Log($"📋 ENDEREÇO COPIADO: {address}");
        }

        void SendInitializeTransaction()
        {
            SendTransaction("initialize");
        }

        void SendIncrementTransaction()
        {
            SendTransaction("increment");
        }

        void SendTransaction(string instructionName)
        {
            SolanaRuntime.EnsureExists();
            if (TransactionManager.Instance == null)
            {
                Log("TransactionManager não encontrado.");
                screenUI.SetRow(3, "GERENCIADOR AUSENTE");
                return;
            }

            if (WalletManager.Instance == null || !WalletManager.Instance.IsConnected)
            {
                screenUI.ShowToast("❌ Conecte a carteira primeiro!", Color.red);
                Log("Conecte a carteira primeiro.");
                screenUI.SetRow(3, "CARTEIRA AUSENTE");
                return;
            }

            string readableIx = instructionName.Equals("initialize", System.StringComparison.OrdinalIgnoreCase)
                ? "ENVIAR TRANSAÇÃO INICIAL"
                : "ENVIAR TRANSAÇÃO";

            screenUI.SetRow(3, "⏳ ENVIANDO...");
            screenUI.ShowToast($"⏳ Enviando '{readableIx}' para a blockchain...", Color.yellow);
            Log($"⏳ Enviando '{instructionName}' para o contrato 81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE...");

            TransactionManager.Instance.SendTransaction(instructionName, (success, result) =>
            {
                RefreshUI();
                if (success)
                {
                    screenUI.SetRow(3, "✅ CONFIRMADA");
                    screenUI.ShowToast($"✅ Transação '{readableIx}' Confirmada na Devnet!", Color.green);
                    Log($"✅ TRANSAÇÃO CONFIRMADA! Signature: {result}");
                    Log($"Solana Explorer: https://explorer.solana.com/tx/{result}?cluster=devnet");
                }
                else
                {
                    if (result.Contains("já foi inicializada") || result.Contains("already in use") || result.Contains("Contador já foi inicializado"))
                    {
                        screenUI.SetRow(3, "ℹ️ JÁ INICIALIZADA");
                        screenUI.ShowToast("ℹ️ Transação inicial já realizada! Clique em 'ENVIAR TRANSAÇÃO'", Color.cyan);
                        Log($"ℹ️ {result}");
                    }
                    else
                    {
                        screenUI.SetRow(3, "❌ FALHOU");
                        screenUI.ShowToast($"❌ Falha na Transação: {result}", Color.red);
                        Log($"❌ TRANSAÇÃO FALHOU: {result}");
                    }
                }
            });
        }

        void RefreshUI()
        {
            if (WalletManager.Instance != null && WalletManager.Instance.IsConnected)
            {
                WalletManager.Instance.UpdateBalance((sol) =>
                {
                    screenUI.SetRow(1, $"{sol:F4} SOL");
                    Log($"Saldo atualizado: {sol:F4} SOL");
                });
                screenUI.SetRow(2, AddressLabel());
            }
        }

        static string BalanceLabel()
        {
            if (WalletManager.Instance == null || !WalletManager.Instance.IsConnected)
                return "0.0000 SOL";
            return $"{WalletManager.Instance.BalanceSol:F4} SOL";
        }

        static string AddressLabel()
        {
            if (WalletManager.Instance == null || string.IsNullOrEmpty(WalletManager.Instance.PublicKey))
                return "--";
            return WalletManager.Instance.PublicKey;
        }
    }
}

