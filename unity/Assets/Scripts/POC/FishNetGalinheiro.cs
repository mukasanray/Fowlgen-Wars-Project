using FishNet.Object;
using FishNet.Object.Synchronizing;
using UnityEngine;

/// <summary>
/// Componente de Galinheiro (Base Principal / Nexus) para FishNet (POC-NET-01).
/// Controla o HP da base sincronizado pelo Servidor e recebe dano das tropas.
/// </summary>
public class FishNetGalinheiro : NetworkBehaviour
{
    [Header("Configuração de Equipe")]
    public bool isHostBase = true; // true = Red Team (Host), false = Blue Team (Client)

    [Header("Status Sincronizado")]
    public readonly SyncVar<int> Health = new SyncVar<int>(100);

    [Header("Feedback Visual")]
    [SerializeField] private GameObject destructionVfx;

    public override void OnStartServer()
    {
        base.OnStartServer();
        Health.Value = 100;
    }

    /// <summary>
    /// Chamado por minions ou projéteis no servidor para aplicar dano à base.
    /// </summary>
    [ServerRpc(RequireOwnership = false)]
    public void CmdTakeDamage(int damage)
    {
        if (Health.Value <= 0) return;

        Health.Value = Mathf.Max(0, Health.Value - damage);
        Debug.Log($"[FishNetGalinheiro] {(isHostBase ? "Red (Host)" : "Blue (Client)")} recebeu {damage} de dano! HP restante: {Health.Value}");

        // Sincroniza com o FishNetMultiplayer caso esteja presente na cena
        var netMultiplayer = FindAnyObjectByType<FishNetMultiplayer>();
        if (netMultiplayer != null)
        {
            netMultiplayer.CmdTakeDamage(isHostBase, damage);
        }

        if (Health.Value <= 0)
        {
            RpcOnDestroyed();
        }
    }

    [ObserversRpc]
    private void RpcOnDestroyed()
    {
        Debug.Log($"[FishNetGalinheiro] Galinheiro {(isHostBase ? "Vermelho (Host)" : "Azul (Client)")} foi DESTRUÍDO!");
        if (destructionVfx != null)
        {
            Instantiate(destructionVfx, transform.position, Quaternion.identity);
        }
    }
}
