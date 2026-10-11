using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace FowlgenWars.Solana
{
    /// <summary>
    /// Gerencia a conexão com o cluster Solana.
    /// </summary>
    public class SolanaConnection : MonoBehaviour
    {
        public enum ConnectionStatus
        {
            Disconnected,
            Connecting,
            Connected,
            Error
        }

        [Header("Settings")]
        [SerializeField]
        private float healthCheckInterval = 30f;

        private ConnectionStatus status = ConnectionStatus.Disconnected;
        private float lastHealthCheck;

        public ConnectionStatus Status => status;
        public bool IsConnected => status == ConnectionStatus.Connected;
        public string LastBlockhash { get; private set; } = string.Empty;

        public void Connect()
        {
            if (SolanaManager.Instance == null || !SolanaManager.Instance.IsInitialized)
            {
                Debug.LogError("[SolanaConnection] SolanaManager não inicializado.");
                status = ConnectionStatus.Error;
                return;
            }

            var config = SolanaManager.Instance.Config;
            Debug.Log($"[SolanaConnection] Conectando ao cluster: {config.rpcUrl}");
            status = ConnectionStatus.Connecting;

            StartCoroutine(CheckConnectionRoutine(config.rpcUrl));
        }

        private IEnumerator CheckConnectionRoutine(string rpcUrl)
        {
            string jsonBody = "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getLatestBlockhash\",\"params\":[{\"commitment\":\"confirmed\"}]}";
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);

            using (UnityWebRequest request = new UnityWebRequest(rpcUrl, "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    status = ConnectionStatus.Connected;
                    lastHealthCheck = Time.time;
                    string response = request.downloadHandler.text;
                    Debug.Log($"[SolanaConnection] Connected to Solana Devnet! Response: {response}");

                    int blockhashIdx = response.IndexOf("\"blockhash\":\"");
                    if (blockhashIdx >= 0)
                    {
                        int start = blockhashIdx + 13;
                        int end = response.IndexOf("\"", start);
                        if (end > start)
                            LastBlockhash = response.Substring(start, end - start);
                    }
                }
                else
                {
                    status = ConnectionStatus.Error;
                    Debug.LogError($"[SolanaConnection] RPC Connection failed: {request.error}");
                }
            }
        }

        public void Disconnect()
        {
            status = ConnectionStatus.Disconnected;
            Debug.Log("[SolanaConnection] Desconectado do cluster.");
        }

        private void Update()
        {
            if (IsConnected && Time.time - lastHealthCheck > healthCheckInterval)
            {
                lastHealthCheck = Time.time;
                if (SolanaManager.Instance != null && SolanaManager.Instance.Config != null)
                    StartCoroutine(CheckConnectionRoutine(SolanaManager.Instance.Config.rpcUrl));
            }
        }
    }
}

