using UnityEngine;
using FowlgenWars.Architecture.Presenters;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.UI
{
    public sealed class AuthController : MonoBehaviour
    {
        private void Awake()
        {
            Screen.orientation = ScreenOrientation.LandscapeRight;
            Screen.autorotateToPortrait = false;
            Screen.autorotateToPortraitUpsideDown = false;
            Screen.autorotateToLandscapeLeft = true;
            Screen.autorotateToLandscapeRight = true;

            if (GetComponent<AuthView>() == null)
                gameObject.AddComponent<AuthView>();
            if (GetComponent<AuthPresenter>() == null)
                gameObject.AddComponent<AuthPresenter>();
        }
    }
}
