using UnityEngine.SceneManagement;
using FowlgenWars.Architecture.Contracts;

namespace FowlgenWars.Architecture.Services
{
    public sealed class SceneNavigationService : INavigationService
    {
        public void Load(string sceneName)
        {
            if (string.IsNullOrWhiteSpace(sceneName))
                return;

            SceneManager.LoadScene(sceneName);
        }
    }
}
