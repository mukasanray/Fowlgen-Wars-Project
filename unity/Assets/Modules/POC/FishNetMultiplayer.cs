using FishNet.Object;
using FishNet.Object.Synchronizing;
using UnityEngine;

public class FishNetMultiplayer : NetworkBehaviour
{
    public readonly SyncVar<int> HostCoreHealth = new SyncVar<int>();
    public readonly SyncVar<int> ClientCoreHealth = new SyncVar<int>();

    public override void OnStartServer()
    {
        base.OnStartServer();
        HostCoreHealth.Value = 100;
        ClientCoreHealth.Value = 100;
    }

    [ServerRpc(RequireOwnership = false)]
    public void CmdTakeDamage(bool isHostTarget, int damage)
    {
        if (isHostTarget) HostCoreHealth.Value -= damage;
        else ClientCoreHealth.Value -= damage;
        CheckWin();
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
