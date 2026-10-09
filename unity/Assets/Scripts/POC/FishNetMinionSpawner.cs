using FishNet.Object;
using UnityEngine;

public class FishNetMinionSpawner : NetworkBehaviour
{
    public GameObject minionPrefab;
    public Transform spawnPoint;

    [ServerRpc(RequireOwnership = false)]
    public void CmdSpawnMinion()
    {
        GameObject minion = Instantiate(minionPrefab, spawnPoint.position, spawnPoint.rotation);
        ServerManager.Spawn(minion);
    }
}
