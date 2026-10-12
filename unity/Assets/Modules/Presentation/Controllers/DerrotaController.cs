using UnityEngine;
using FowlgenWars.Architecture.Presenters;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.UI
{
    public sealed class DerrotaController : MonoBehaviour
    {
        private void Awake()
        {
            ConfigureLandscape();
            if (GetComponent<DerrotaView>() == null)
                gameObject.AddComponent<DerrotaView>();
            if (GetComponent<DerrotaPresenter>() == null)
                gameObject.AddComponent<DerrotaPresenter>();
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
