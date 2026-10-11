using UnityEngine;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.Architecture.Presenters
{
    [RequireComponent(typeof(DerrotaView))]
    public sealed class DerrotaPresenter : MonoBehaviour
    {
        private void OnEnable()
        {
            DerrotaView view = GetComponent<DerrotaView>();
            if (view != null)
                view.RetryClicked += ReturnToPlay;
        }

        private void OnDisable()
        {
            DerrotaView view = GetComponent<DerrotaView>();
            if (view != null)
                view.RetryClicked -= ReturnToPlay;
        }

        private void ReturnToPlay()
        {
            UnityEngine.SceneManagement.SceneManager.LoadScene("Play");
        }
    }
}
