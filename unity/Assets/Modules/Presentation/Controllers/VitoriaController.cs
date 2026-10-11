using UnityEngine;
using FowlgenWars.Architecture.Presenters;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.UI
{
    public sealed class VitoriaController : MonoBehaviour
    {
        private void Awake()
        {
            ConfigureLandscape();
            if (GetComponent<VitoriaView>() == null)
                gameObject.AddComponent<VitoriaView>();
            if (GetComponent<VitoriaPresenter>() == null)
                gameObject.AddComponent<VitoriaPresenter>();
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
