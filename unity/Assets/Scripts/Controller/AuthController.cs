using UnityEngine;
using FowlgenWars.Architecture.Presenters;
using FowlgenWars.Architecture.Views;
using FowlgenWars.Auth;
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

            // 1. Garante NetworkObject para suportar NetworkBehaviour do FishNet
            if (GetComponent<NetworkObject>() == null)
                gameObject.AddComponent<NetworkObject>();

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
        }

        private void EnsureFishNetNetworkManager()
        {
            var nm = FindAnyObjectByType<NetworkManager>();
            if (nm == null)
            {
                var netGo = new GameObject("FishNet_NetworkManager");
                netGo.AddComponent<Tugboat>();
                nm = netGo.AddComponent<NetworkManager>();

                // Atribui a coleção DefaultPrefabObjects do FishNet para evitar SpawnablePrefabs is null
                var dpo = Resources.Load<FishNet.Managing.Object.PrefabObjects>("DefaultPrefabObjects");
#if UNITY_EDITOR
                if (dpo == null)
                {
                    dpo = UnityEditor.AssetDatabase.LoadAssetAtPath<FishNet.Managing.Object.PrefabObjects>("Assets/DefaultPrefabObjects.asset");
                }
#endif
                if (dpo != null)
                {
                    nm.SpawnablePrefabs = dpo;
                }

                DontDestroyOnLoad(netGo);
            }
        }
    }
}

