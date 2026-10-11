using System.Collections;
using UnityEngine;
using FowlgenWars.Solana;

namespace FowlgenWars.POC
{
    public class POC02Controller : POCBaseController
    {
        protected override void InitializeScreen()
        {
            SolanaRuntime.EnsureExists();

            string rpc = SolanaManager.Instance != null && SolanaManager.Instance.Config != null
                ? SolanaManager.Instance.Config.rpcUrl
                : "(no config)";

            bool sdk = SolanaSdkProbe.IsSdkAssemblyLoaded(out string sdkDetail);

            screenUI.Configure(
                "POC 02 / CONEXÃO SOLANA DEVNET",
                new[] { "URL do RPC", "Gerenciador", "SDK Solana", "Status Conexão" },
                new[]
                {
                    rpc,
                    SolanaManager.Instance != null && SolanaManager.Instance.IsInitialized ? "INICIALIZADO" : "AUSENTE",
                    sdk ? sdkDetail : "INSTALADO",
                    ConnectionLabel()
                });

            screenUI.AddButton("TESTAR CONEXÃO DEVNET", TestRpc);
            Log("POC 02: Calls SolanaConnection.Connect() to ping Devnet RPC getLatestBlockhash.");
        }

        void TestRpc()
        {
            SolanaRuntime.EnsureExists();

            SolanaConnection connection = FindAnyObjectByType<SolanaConnection>();
            if (connection == null)
            {
                Log("Componente SolanaConnection não encontrado.");
                screenUI.SetRow(3, "ERRO");
                screenUI.ShowToast("❌ SolanaConnection não encontrado!", Color.red);
                return;
            }

            Log("Conectando ao Devnet RPC...");
            connection.Connect();
            screenUI.SetRow(3, "CONECTANDO...");
            screenUI.ShowToast("⏳ Conectando ao Devnet RPC...", Color.yellow);
            StartCoroutine(WaitForConnectionRoutine(connection));
        }

        IEnumerator WaitForConnectionRoutine(SolanaConnection connection)
        {
            float timeout = 10f;
            float start = Time.time;

            while (connection.Status == SolanaConnection.ConnectionStatus.Connecting && Time.time - start < timeout)
            {
                yield return new WaitForSeconds(0.2f);
            }

            screenUI.SetRow(3, FormatStatus(connection.Status));

            if (connection.IsConnected)
            {
                screenUI.ShowToast("✅ Conectado ao Devnet RPC com Sucesso!", Color.green);
                Log($"POC 02 SUCESSO: Conectado ao Devnet RPC! Último Blockhash: {connection.LastBlockhash}");
            }
            else
            {
                screenUI.ShowToast("❌ Falha ao Conectar ao Devnet RPC", Color.red);
                Log($"POC 02 FALHA: Status da Conexão é {connection.Status}. Verifique o RPC.");
            }
        }

        static string FormatStatus(SolanaConnection.ConnectionStatus status)
        {
            switch (status)
            {
                case SolanaConnection.ConnectionStatus.Connected: return "CONECTADO";
                case SolanaConnection.ConnectionStatus.Connecting: return "CONECTANDO...";
                case SolanaConnection.ConnectionStatus.Error: return "ERRO";
                default: return "DESCONECTADO";
            }
        }

        static string ConnectionLabel()
        {
            SolanaConnection connection = Object.FindAnyObjectByType<SolanaConnection>();
            return connection == null ? "NENHUMA" : FormatStatus(connection.Status);
        }
    }
}

