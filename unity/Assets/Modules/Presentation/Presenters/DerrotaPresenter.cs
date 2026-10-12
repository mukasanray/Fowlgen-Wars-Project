using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using FowlgenWars.Architecture.Views;
using FowlgenWars.Solana;

namespace FowlgenWars.Architecture.Presenters
{
    [RequireComponent(typeof(DerrotaView))]
    public sealed class DerrotaPresenter : MonoBehaviour
    {
        private DerrotaView view;
        private bool isProcessingReward;
        private string lastTxSignature = string.Empty;

        private void Awake()
        {
            view = GetComponent<DerrotaView>();
        }

        private void OnEnable()
        {
            if (view != null)
            {
                view.RewardClicked += HandleRewardClicked;
                view.ExplorerClicked += HandleExplorerClicked;
                view.MenuClicked += HandleMenuClicked;
            }
        }

        private void OnDisable()
        {
            if (view != null)
            {
                view.RewardClicked -= HandleRewardClicked;
                view.ExplorerClicked -= HandleExplorerClicked;
                view.MenuClicked -= HandleMenuClicked;
            }
        }

        private void HandleRewardClicked()
        {
            if (isProcessingReward) return;
            isProcessingReward = true;

            view?.SetRewardButtonEnabled(false);
            view?.SetStatus("Processando registro de consolação na Solana Devnet...");

            if (TransactionManager.Instance != null && WalletManager.Instance != null && WalletManager.Instance.IsConnected)
            {
                TransactionManager.Instance.SendTransaction("increment", (success, txOrError) =>
                {
                    if (success)
                    {
                        lastTxSignature = txOrError;
                        string shortTx = FormatSignature(lastTxSignature);
                        view?.SetStatus($"Batalha registrada on-chain! Tx: {shortTx} - Retornando ao Play...");
                    }
                    else
                    {
                        lastTxSignature = "simulated_" + System.Guid.NewGuid().ToString("N").Substring(0, 16);
                        view?.SetStatus($"Recompensa creditada: +25 XP, +10 FOWL - Retornando ao Play...");
                    }
                    isProcessingReward = false;
                    StartCoroutine(ReturnToPlayDelayedRoutine(1.8f));
                });
            }
            else
            {
                StartCoroutine(SimulateOfflineRewardRoutine());
            }
        }

        private IEnumerator SimulateOfflineRewardRoutine()
        {
            yield return new WaitForSeconds(0.8f);
            lastTxSignature = "simulated_devnet_" + System.Guid.NewGuid().ToString("N").Substring(0, 16);
            view?.SetStatus("Recompensa resgatada: +25 XP e +10 FOWL! Retornando ao Play...");
            isProcessingReward = false;
            StartCoroutine(ReturnToPlayDelayedRoutine(1.8f));
        }

        private IEnumerator ReturnToPlayDelayedRoutine(float delaySeconds)
        {
            yield return new WaitForSeconds(delaySeconds);
            SceneManager.LoadScene("Play");
        }

        private void HandleExplorerClicked()
        {
            if (string.IsNullOrEmpty(lastTxSignature)) return;

            string url = lastTxSignature.StartsWith("simulated")
                ? "https://explorer.solana.com/?cluster=devnet"
                : $"https://explorer.solana.com/tx/{lastTxSignature}?cluster=devnet";

            Application.OpenURL(url);
        }

        private void HandleMenuClicked()
        {
            SceneManager.LoadScene("Play");
        }

        private static string FormatSignature(string sig)
        {
            if (string.IsNullOrEmpty(sig)) return "N/A";
            if (sig.Length <= 12) return sig;
            return $"{sig.Substring(0, 6)}...{sig.Substring(sig.Length - 6)}";
        }
    }
}
