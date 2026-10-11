using UnityEngine;
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
        private ClientAuthManager authService;
        private SceneNavigationService navigationService;

        private void Awake()
        {
            view = GetComponent<AuthView>();
            authService = GetComponent<ClientAuthManager>();
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
                view.ConnectClicked += Connect;
            if (authService != null)
                authService.AuthenticationCompleted += OnAuthenticationCompleted;
        }

        private void OnDisable()
        {
            if (view != null)
                view.ConnectClicked -= Connect;
            if (authService != null)
                authService.AuthenticationCompleted -= OnAuthenticationCompleted;
        }

        private void Connect()
        {
            if (authService == null)
            {
                view.SetStatus("Authentication service unavailable.");
                return;
            }

            view.SetStatus("Waiting for wallet signature...");
            authService.Login();
        }

        private void OnAuthenticationCompleted(bool authenticated)
        {
            if (!authenticated)
            {
                view.SetStatus("Connection rejected.");
                return;
            }

            if (session != null)
                session.SetAuthenticated(authService.WalletAddress);

            view.SetStatus("Connected. Loading Play...");
            navigationService.Load(navigation != null ? navigation.PlayScene : "Play");
        }
    }
}
