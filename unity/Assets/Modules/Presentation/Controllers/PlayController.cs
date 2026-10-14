using UnityEngine;
using FowlgenWars.Architecture.Presenters;
using FowlgenWars.Architecture.Views;
using FowlgenWars.Gameplay.Audio;

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
            EnsureFowlgenBgm();
        }

        private void Start() => AudioManager.Instance?.EnsureBgmPlaying();

        private static void EnsureFowlgenBgm()
        {
            var am = AudioManager.Instance ?? FindAnyObjectByType<AudioManager>();
            if (am == null)
            {
                var go = new GameObject("AudioManager");
                am = go.AddComponent<AudioManager>();
            }
            am.EnsureBgmPlaying();
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
