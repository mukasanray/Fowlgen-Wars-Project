using UnityEngine;
using FowlgenWars.Architecture.Presenters;
using FowlgenWars.Architecture.Views;
using FowlgenWars.Auth;
using FowlgenWars.Gameplay.Audio;
using FishNet.Object;
using FishNet.Managing;
using FishNet.Transporting.Tugboat;

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


            // 2. Garante os managers de autenticação Web3 da Fase 1
            if (GetComponent<ServerAuthManager>() == null)
                gameObject.AddComponent<ServerAuthManager>();
            if (GetComponent<ClientAuthManager>() == null)
                gameObject.AddComponent<ClientAuthManager>();

            // 3. Garante que o NetworkManager do FishNet e o Transport (Tugboat) existam
            EnsureFishNetNetworkManager();

            // 4. Garante a camada de interface (UI Toolkit)
            if (GetComponent<AuthView>() == null)
                gameObject.AddComponent<AuthView>();
            if (GetComponent<AuthPresenter>() == null)
                gameObject.AddComponent<AuthPresenter>();

            // 5. BGM persistente (Login/Play/Arena_Clean = mesma musica sem restart)
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

        private void EnsureFishNetNetworkManager()
        {
            var nm = FindAnyObjectByType<NetworkManager>();
            if (nm == null)
            {
                // Tenta carregar prefab previamente configurado
                var prefab = Resources.Load<GameObject>("FishNet_NetworkManager");
                GameObject netGo;
                if (prefab != null)
                {
                    netGo = Instantiate(prefab);
                    netGo.name = "FishNet_NetworkManager";
                }
                else
                {
                    netGo = new GameObject("FishNet_NetworkManager");
                    netGo.SetActive(false); // Mantem inativo para configurar SpawnablePrefabs antes do Awake do NetworkManager
                    netGo.AddComponent<Tugboat>();
                    nm = netGo.AddComponent<NetworkManager>();

                    var dpo = Resources.Load<FishNet.Managing.Object.PrefabObjects>("DefaultPrefabObjects");
#if UNITY_EDITOR
                    if (dpo == null)
                    {
                        dpo = UnityEditor.AssetDatabase.LoadAssetAtPath<FishNet.Managing.Object.PrefabObjects>("Assets/Resources/DefaultPrefabObjects.asset");
                    }
#endif
                    if (dpo != null)
                    {
                        nm.SpawnablePrefabs = dpo;
                    }

                    netGo.SetActive(true); // Dispara Awake com SpawnablePrefabs já atribuído!
                }

                DontDestroyOnLoad(netGo);
            }
        }
    }
}

