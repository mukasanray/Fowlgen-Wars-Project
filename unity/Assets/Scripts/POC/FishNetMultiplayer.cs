using FishNet.Object;
using FishNet.Object.Synchronizing;
using UnityEngine;

public class FishNetMultiplayer : NetworkBehaviour
{
    [SyncVar] public int HostCoreHealth = 100;
    [SyncVar] public int ClientCoreHealth = 100;

    [ServerRpc(RequireOwnership = false)]
    public void CmdTakeDamage(bool isHostTarget, int damage)
    {
        if (isHostTarget) HostCoreHealth -= damage;
        else ClientCoreHealth -= damage;
        CheckWin();
    }

    private void CheckWin()
    {
        if (HostCoreHealth <= 0) RpcGameOver(false);
        else if (ClientCoreHealth <= 0) RpcGameOver(true);
    }

    [ObserversRpc]
    private void RpcGameOver(bool hostWon)
    {
        bool isWinner = (IsServer && hostWon) || (!IsServer && !hostWon);
        if (isWinner)
        {
            FindObjectOfType<SolanaReward>()?.ClaimVictory();
        }
    }
}
