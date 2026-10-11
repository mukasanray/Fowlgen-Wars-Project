using UnityEngine;
using FowlgenWars.Architecture.Models;
using FowlgenWars.Architecture.Services;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.Architecture.Presenters
{
    [RequireComponent(typeof(ArenaView))]
    public sealed class ArenaPresenter : MonoBehaviour
    {
        [SerializeField] private NavigationConfig navigation;
        private SceneNavigationService navigationService;

        private void Awake()
        {
            navigationService = new SceneNavigationService();
            navigation = navigation != null
                ? navigation
                : Resources.Load<NavigationConfig>("Architecture/NavigationConfig");
        }

        private void OnEnable()
        {
            ArenaView view = GetComponent<ArenaView>();
            if (view != null)
                view.BackClicked += ReturnToPlay;
        }

        private void OnDisable()
        {
            ArenaView view = GetComponent<ArenaView>();
            if (view != null)
                view.BackClicked -= ReturnToPlay;
        }

        private void ReturnToPlay()
        {
            navigationService.Load(navigation != null ? navigation.PlayScene : "Play");
        }
    }
}
