using UnityEngine;
using UnityEngine.SceneManagement;
using FowlgenWars.Solana;
using FowlgenWars.Architecture.Models;
using FowlgenWars.Architecture.Services;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.Architecture.Presenters
{
    [RequireComponent(typeof(PlayView))]
    public sealed class PlayPresenter : MonoBehaviour
    {
        [SerializeField] private NavigationConfig navigation;
        [SerializeField] private SessionState session;

        private PlayView view;
        private SceneNavigationService navigationService;

        private void Awake()
        {
            view = GetComponent<PlayView>();
            navigationService = new SceneNavigationService();
            navigation = navigation != null
                ? navigation
                : Resources.Load<NavigationConfig>("Architecture/NavigationConfig");
            session = session != null
                ? session
                : Resources.Load<SessionState>("Architecture/SessionState");
        }

        private void Start()
        {
            StartCoroutine(InitDisplayRoutine());
        }

        private System.Collections.IEnumerator InitDisplayRoutine()
        {
            RefreshWalletDisplay();
            yield return null;
            RefreshWalletDisplay();
        }

        private void OnEnable()
        {
            if (view != null)
            {
                view.PlayClicked += OnPlayClicked;
                view.AirdropClicked += OnAirdropClicked;
                view.DisconnectClicked += OnDisconnectClicked;
            }
        }

        private void OnDisable()
        {
            if (view != null)
            {
                view.PlayClicked -= OnPlayClicked;
                view.AirdropClicked -= OnAirdropClicked;
                view.DisconnectClicked -= OnDisconnectClicked;
            }
        }

        private void OnAirdropClicked()
        {
            if (WalletManager.Instance == null || !WalletManager.Instance.IsConnected)
            {
                view?.SetStatus("Conecte uma carteira antes de solicitar airdrop.");
                return;
            }

            view?.SetStatus("Solicitando +1 SOL Devnet via RPC...");
            view?.SetAirdropEnabled(false);

            WalletManager.Instance.RequestAirdrop((success, message) =>
            {
                view?.SetAirdropEnabled(true);
                if (success)
                {
                    view?.SetStatus("Airdrop enviado com sucesso! Atualizando saldo...");
                    RefreshWalletDisplay();
                }
                else
                {
                    view?.SetStatus(message ?? "Falha ao solicitar airdrop.");
                }
            });
        }

        private void OnDisconnectClicked()
        {
            if (WalletManager.Instance != null)
            {
                WalletManager.Instance.DisconnectWallet();
            }

            if (session != null)
            {
                session.Clear();
            }

            view?.SetStatus("Carteira desconectada. Retornando...");
            string authScene = navigation != null && !string.IsNullOrEmpty(navigation.AuthScene)
                ? navigation.AuthScene
                : "Auth";
            navigationService.Load(authScene);
        }

        public void RefreshWalletDisplay()
        {
            if (WalletManager.Instance == null)
            {
                var wmGo = new GameObject("WalletManager");
                wmGo.AddComponent<WalletManager>();
            }

            string fullKey = WalletManager.Instance.PublicKey;
            if (string.IsNullOrEmpty(fullKey) && session != null && session.Authenticated)
            {
                fullKey = session.WalletAddress;
            }

            string displayKey = FormatAddress(fullKey);
            double currentSol = WalletManager.Instance.BalanceSol;

            view?.UpdateWalletInfo(displayKey, currentSol);

            // Consulta saldo atualizado via RPC
            if (WalletManager.Instance.IsConnected)
            {
                WalletManager.Instance.UpdateBalance((sol) =>
                {
                    if (view != null)
                    {
                        view.UpdateWalletInfo(displayKey, sol);
                    }
                });
            }
        }

        private static string FormatAddress(string key)
        {
            if (string.IsNullOrEmpty(key)) return "Devnet Wallet";
            if (key.Length <= 10) return key;
            return $"{key.Substring(0, 4)}...{key.Substring(key.Length - 4)}";
        }

        private void OnPlayClicked()
        {
            view?.SetStatus("Carregando Arena de Combate...");
            string sceneName = navigation != null && !string.IsNullOrEmpty(navigation.ArenaScene)
                ? navigation.ArenaScene
                : "Arena";

            navigationService.Load(sceneName);
        }
    }
}
