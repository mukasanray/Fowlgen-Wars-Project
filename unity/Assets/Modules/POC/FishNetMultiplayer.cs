// POC / Backlog - FishNet demo alinhado a Arena_Clean (nao ativo em cena)
// Requer NetworkObject + este NetworkBehaviour em Arena_Clean para testar; fora do MVP.
// Arena_Clean refs: Base-Amarela (Player) (0.32,10.5,20.65) | Base-Roxa-Inimiga (Enemy) (-0.10,10.5,-20.23)
// SpawnPlayer (0.32,10.5,17.5) | SpawnEnemy (-0.10,10.5,-17.5) | Paths Top/Mid/Bot em SetupMobaArenaComplete.cs
using FishNet.Object;
using FishNet.Object.Synchronizing;
using UnityEngine;
using FowlgenWars.Gameplay;

public class FishNetMultiplayer : NetworkBehaviour
{
    [Header("Arena_Clean - vincule as bases da cena (ou auto-find no Server)")]
    [SerializeField] private StructureGalinheiro playerGalinheiro;
    [SerializeField] private StructureGalinheiro enemyGalinheiro;

    // SyncVars espelham HP das bases da Arena_Clean (maxHealth 1000 em StructureGalinheiro)
    public readonly SyncVar<int> HostCoreHealth = new SyncVar<int>();   // Player base
    public readonly SyncVar<int> ClientCoreHealth = new SyncVar<int>(); // Enemy base

    // ponytail: 1000 hardcoded espelha StructureGalinheiro.maxHealth da Arena_Clean; parametrizar via SO se maxHealth mudar.
    public override void OnStartServer()
    {
        base.OnStartServer();
        if (playerGalinheiro == null || enemyGalinheiro == null)
        {
            var all = FindObjectsByType<StructureGalinheiro>(FindObjectsSortMode.None);
            foreach (var g in all)
            {
                if (g.UnitTeam == Team.Player && playerGalinheiro == null) playerGalinheiro = g;
                if (g.UnitTeam == Team.Enemy && enemyGalinheiro == null) enemyGalinheiro = g;
            }
        }
        int pHp = playerGalinheiro != null && playerGalinheiro.CurrentHealth > 0 ? playerGalinheiro.CurrentHealth : 1000;
        int eHp = enemyGalinheiro != null && enemyGalinheiro.CurrentHealth > 0 ? enemyGalinheiro.CurrentHealth : 1000;
        HostCoreHealth.Value = pHp;
        ClientCoreHealth.Value = eHp;
    }

    [ServerRpc(RequireOwnership = false)]
    public void CmdTakeDamage(bool isHostTarget, int damage)
    {
        if (damage <= 0) return;
        if (isHostTarget)
        {
            HostCoreHealth.Value = Mathf.Max(0, HostCoreHealth.Value - damage);
            if (playerGalinheiro != null) playerGalinheiro.TakeDamage(damage);
        }
        else
        {
            ClientCoreHealth.Value = Mathf.Max(0, ClientCoreHealth.Value - damage);
            if (enemyGalinheiro != null) enemyGalinheiro.TakeDamage(damage);
        }
        CheckWin();
    }

    // overload por Team para uso direto com Lane/StructureGalinheiro da Arena_Clean
    // ponytail: 2 ServerRpc com RequireOwnership=false; consolidar em 1 quando regra de autor for definida (POC 95+).
    [ServerRpc(RequireOwnership = false)]
    public void CmdTakeDamageTeam(int teamInt, int damage)
    {
        CmdTakeDamage((Team)teamInt == Team.Player, damage);
    }

    private void CheckWin()
    {
        if (HostCoreHealth.Value <= 0) RpcGameOver(false);
        else if (ClientCoreHealth.Value <= 0) RpcGameOver(true);
    }

    [ObserversRpc]
    private void RpcGameOver(bool hostWon)
    {
        bool isWinner = (IsServerInitialized && hostWon) || (!IsServerInitialized && !hostWon);
        if (isWinner)
        {
            FindAnyObjectByType<SolanaReward>()?.ClaimVictory();
        }
    }
}
