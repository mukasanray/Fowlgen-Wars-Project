using UnityEngine;
using FowlgenWars.Solana;
using FowlgenWars.Auth;
using FowlgenWars.Architecture.Models;
using FowlgenWars.Architecture.Services;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.Architecture.Presenters
{
    [RequireComponent(typeof(AuthView))]
    public sealed class AuthPresenter : MonoBehaviour
    {
        [SerializeField] private NavigationConfig navigation;
        [SerializeField] private SessionState session;

        private AuthView view;
        private SceneNavigationService navigationService;

        private void Awake()
        {
            view = GetComponent<AuthView>();
            navigationService = new SceneNavigationService();
            navigation = navigation != null
                ? navigation
                : Resources.Load<NavigationConfig>("Architecture/NavigationConfig");
            session = session != null
                ? session
                : Resources.Load<SessionState>("Architecture/SessionState");

            session?.Clear();
        }

        private void OnEnable()
        {
            if (view != null)
            {
                view.ConnectClicked += Connect;
                view.QuickPlayClicked += ConnectQuickPlay;
            }
        }

        private void OnDisable()
        {
            if (view != null)
            {
                view.ConnectClicked -= Connect;
                view.QuickPlayClicked -= ConnectQuickPlay;
            }
        }

        private void ConnectQuickPlay()
        {
            view?.SetStatus("Inicializando carteira Devnet local...");

            if (WalletManager.Instance == null)
            {
                var wmGo = new GameObject("WalletManager");
                wmGo.AddComponent<WalletManager>();
            }

            WalletManager.Instance.ConnectWallet();
            if (WalletManager.Instance.IsConnected)
            {
                AuthenticateWithFishNet(WalletManager.Instance.PublicKey);
            }
            else
            {
                view?.SetStatus("Falha ao inicializar carteira local. Tente novamente.");
            }
        }

        private void Connect()
        {
            view?.SetStatus("Conectando carteira Phantom...");

            if (WalletManager.Instance == null)
            {
                var wmGo = new GameObject("WalletManager");
                wmGo.AddComponent<WalletManager>();
            }

            // Conexão via Solana Wallet Adapter (Phantom)
            WalletManager.Instance.ConnectWalletAdapter((success, pubKey) =>
            {
                if (success)
                {
                    AuthenticateWithFishNet(pubKey);
                }
                else
                {
                    // Fallback para carteira Devnet local para testes fluidos no Editor/Desktop
                    Debug.LogWarning("[AuthPresenter] Phantom Adapter retornou aviso. Acionando carteira Devnet local...");
                    WalletManager.Instance.ConnectWallet();
                    if (WalletManager.Instance.IsConnected)
                    {
                        AuthenticateWithFishNet(WalletManager.Instance.PublicKey);
                    }
                    else
                    {
                        view?.SetStatus("Conexão de carteira cancelada ou falhou. Tente novamente.");
                    }
                }
            });
        }

        private void AuthenticateWithFishNet(string pubKey)
        {
            view?.SetStatus("Carteira conectada! Autenticando com Servidor Dedicado...");

            var clientAuth = ClientAuthManager.Instance ?? FindAnyObjectByType<ClientAuthManager>();
            if (clientAuth == null)
            {
                clientAuth = gameObject.AddComponent<ClientAuthManager>();
            }

            clientAuth.Login((authenticated, message) =>
            {
                if (authenticated)
                {
                    if (session != null)
                        session.SetAuthenticated(pubKey);

                    view?.SetStatus("Autenticado pelo Servidor Dedicado! Carregando...");
                    StartCoroutine(TransitionToPlayRoutine());
                }
                else
                {
                    view?.SetStatus($"Falha na autenticação: {message}");
                }
            });
        }

        private System.Collections.IEnumerator TransitionToPlayRoutine()
        {
            yield return new WaitForSeconds(0.4f);
            navigationService.Load(navigation != null ? navigation.PlayScene : "Play");
        }
    }
}

