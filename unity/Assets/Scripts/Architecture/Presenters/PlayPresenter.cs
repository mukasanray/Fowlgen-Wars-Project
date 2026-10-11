using UnityEngine;
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
        private SceneNavigationService navigationService;

        private void Awake()
        {
            navigationService = new SceneNavigationService();
            navigation = navigation != null
                ? navigation
                : Resources.Load<NavigationConfig>("Architecture/NavigationConfig");
            session = session != null
                ? session
                : Resources.Load<SessionState>("Architecture/SessionState");
        }

        private void OnEnable()
        {
            PlayView view = GetComponent<PlayView>();
            if (view != null)
                view.PlayClicked += StartGame;
        }

        private void OnDisable()
        {
            PlayView view = GetComponent<PlayView>();
            if (view != null)
                view.PlayClicked -= StartGame;
        }

        private void StartGame()
        {
            if (session != null && !session.Authenticated)
            {
                GetComponent<PlayView>()?.SetStatus("Connect your wallet first.");
                return;
            }

            navigationService.Load(navigation != null ? navigation.ArenaScene : "Arena");
        }
    }
}
