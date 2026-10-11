using UnityEngine;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.Architecture.Presenters
{
    [RequireComponent(typeof(VitoriaView))]
    public sealed class VitoriaPresenter : MonoBehaviour
    {
        private void OnEnable()
        {
            VitoriaView view = GetComponent<VitoriaView>();
            if (view != null)
                view.ContinueClicked += ReturnToPlay;
        }

        private void OnDisable()
        {
            VitoriaView view = GetComponent<VitoriaView>();
            if (view != null)
                view.ContinueClicked -= ReturnToPlay;
        }

        private void ReturnToPlay()
        {
            UnityEngine.SceneManagement.SceneManager.LoadScene("Play");
        }
    }
}
