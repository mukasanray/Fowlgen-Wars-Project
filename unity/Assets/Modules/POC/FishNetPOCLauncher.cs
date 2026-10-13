using UnityEngine;
using FishNet.Managing;

/// <summary>
/// HUD simples para testar FishNet POC na Arena_Clean (Host/Client).
/// Requer NetworkManager na cena. Mostra SyncVars do FishNetMultiplayer.
/// Fora do MVP - apenas para validacao local com 2 instancias.
/// </summary>
public class FishNetPOCLauncher : MonoBehaviour
{
    private NetworkManager _netManager;
    private FishNetMultiplayer _poc;

    private void Awake()
    {
        _netManager = FindAnyObjectByType<NetworkManager>();
        _poc = FindAnyObjectByType<FishNetMultiplayer>();
        if (_poc == null) _poc = GetComponent<FishNetMultiplayer>();
    }

    private void OnGUI()
    {
        if (_netManager == null) _netManager = FindAnyObjectByType<NetworkManager>();
        if (_netManager == null) return;

        bool isServer = _netManager.ServerManager.Started;
        bool isClient = _netManager.ClientManager.Started;

        GUILayout.BeginArea(new Rect(10, 10, 260, 260));
        GUILayout.Label($"FishNet POC - {(isServer ? "Server " : "")}{(isClient ? "Client" : isServer ? "" : "Offline")}", GUI.skin.box);

        if (!isServer && !isClient)
        {
            if (GUILayout.Button("Host (Server + Client)", GUILayout.Height(36)))
            {
                _netManager.ServerManager.StartConnection();
                _netManager.ClientManager.StartConnection("127.0.0.1", 7770);
            }
            if (GUILayout.Button("Client", GUILayout.Height(36)))
                _netManager.ClientManager.StartConnection("127.0.0.1", 7770);
        }
        else
        {
            if (GUILayout.Button("Stop", GUILayout.Height(30)))
            {
                if (isServer) _netManager.ServerManager.StopConnection(true);
                if (isClient) _netManager.ClientManager.StopConnection();
            }
            if (_poc != null)
            {
                GUILayout.Space(6);
                GUILayout.Label($"HostCore (Player base): {_poc.HostCoreHealth.Value}");
                GUILayout.Label($"ClientCore (Enemy base): {_poc.ClientCoreHealth.Value}");
                GUILayout.Space(4);
                if (isServer && GUILayout.Button("Damage Enemy 100 (ServerRpc)"))
                    _poc.CmdTakeDamage(false, 100);
                if (isServer && GUILayout.Button("Damage Player 100 (ServerRpc)"))
                    _poc.CmdTakeDamage(true, 100);
            }
        }
        GUILayout.EndArea();
    }
}
