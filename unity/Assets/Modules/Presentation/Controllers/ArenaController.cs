using UnityEngine;
using FowlgenWars.Architecture.Presenters;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.UI
{
    public sealed class ArenaController : MonoBehaviour
    {
        private void Awake()
        {
            ConfigureLandscape();
            if (GetComponent<ArenaView>() == null)
                gameObject.AddComponent<ArenaView>();
            if (GetComponent<ArenaPresenter>() == null)
                gameObject.AddComponent<ArenaPresenter>();
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
