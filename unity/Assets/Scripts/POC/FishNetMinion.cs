using FishNet.Object;
using UnityEngine;

public class FishNetMinion : NetworkBehaviour
{
    public float speed = 5f;
    private Vector3 targetPosition;

    public override void OnStartServer()
    {
        base.OnStartServer();
        // Server dictates movement
        targetPosition = transform.position + transform.forward * 100f; // Example: move forward
    }

    private void Update()
    {
        if (IsServerInitialized)
        {
            // Server moves the minion; NetworkTransform syncs it to clients
            transform.position = Vector3.MoveTowards(transform.position, targetPosition, speed * Time.deltaTime);
        }
    }
}
