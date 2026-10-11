using UnityEngine;
using FowlgenWars.Architecture.Presenters;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.UI
{
    public sealed class PlayController : MonoBehaviour
    {
        private void Awake()
        {
            ConfigureLandscape();
            if (GetComponent<PlayView>() == null)
                gameObject.AddComponent<PlayView>();
            if (GetComponent<PlayPresenter>() == null)
                gameObject.AddComponent<PlayPresenter>();
        }

        private static void ConfigureLandscape()
        {
            Screen.orientation = ScreenOrientation.LandscapeRight;
            Screen.autorotateToPortrait = false;
            Screen.autorotateToPortraitUpsideDown = false;
            Screen.autorotateToLandscapeLeft = true;
            Screen.autorotateToLandscapeRight = true;
        }
    }
}
