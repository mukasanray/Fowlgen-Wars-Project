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
    private string _serverIp = "127.0.0.1";
    private string _localIp = "127.0.0.1";

    private void Awake()
    {
        _netManager = FindAnyObjectByType<NetworkManager>();
        _poc = FindAnyObjectByType<FishNetMultiplayer>();
        if (_poc == null) _poc = GetComponent<FishNetMultiplayer>();
        _localIp = GetLocalIPAddress();
    }

    private string GetLocalIPAddress()
    {
        try
        {
            var host = System.Net.Dns.GetHostEntry(System.Net.Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork && !ip.ToString().StartsWith("127."))
                {
                    return ip.ToString();
                }
            }
        }
        catch { }
        return "127.0.0.1";
    }

    private void OnGUI()
    {
        if (_netManager == null) _netManager = FindAnyObjectByType<NetworkManager>();
        if (_netManager == null) return;

        bool isServer = _netManager.ServerManager.Started;
        bool isClient = _netManager.ClientManager.Started;

        GUILayout.BeginArea(new Rect(10, 10, 280, 320));
        GUILayout.Label($"FishNet POC - {(isServer ? "Server " : "")}{(isClient ? "Client" : isServer ? "" : "Offline")}", GUI.skin.box);

        if (!isServer && !isClient)
        {
            GUILayout.Label($"Seu IP LAN: {_localIp}");
            GUILayout.BeginHorizontal();
            GUILayout.Label("IP Host:", GUILayout.Width(55));
            _serverIp = GUILayout.TextField(_serverIp);
            GUILayout.EndHorizontal();

            if (GUILayout.Button("Host (Server + Client)", GUILayout.Height(36)))
            {
                _netManager.ServerManager.StartConnection();
                _netManager.ClientManager.StartConnection("127.0.0.1", 7770);
            }
            if (GUILayout.Button($"Conectar em {_serverIp}", GUILayout.Height(36)))
            {
                _netManager.ClientManager.StartConnection(_serverIp.Trim(), 7770);
            }
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
