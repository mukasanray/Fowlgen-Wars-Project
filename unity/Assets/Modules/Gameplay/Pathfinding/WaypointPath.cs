using System.Collections.Generic;
using UnityEngine;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// POC-UNI-01: Caminho 3D por Waypoints para locomoção autônoma dos minions nas rotas (Top, Mid, Bot).
    /// </summary>
    public class WaypointPath : MonoBehaviour
    {
        [SerializeField] private LaneType lane;
        [SerializeField] private List<Transform> waypoints = new List<Transform>();
        [SerializeField] private Color gizmoColor = Color.cyan;

        public LaneType Lane => lane;
        public int Count => waypoints.Count;

        public Vector3 GetPoint(int index, Team team)
        {
            if (waypoints.Count == 0) return transform.position;

            // Jogador segue 0 -> N; Inimigo segue N -> 0 (direção oposta)
            int targetIdx = team == Team.Player ? index : (waypoints.Count - 1 - index);
            targetIdx = Mathf.Clamp(targetIdx, 0, waypoints.Count - 1);
            return waypoints[targetIdx].position;
        }

        private void OnDrawGizmos()
        {
            if (waypoints == null || waypoints.Count < 2) return;

            Gizmos.color = gizmoColor;
            for (int i = 0; i < waypoints.Count - 1; i++)
            {
                if (waypoints[i] != null && waypoints[i + 1] != null)
                {
                    Gizmos.DrawLine(waypoints[i].position, waypoints[i + 1].position);
                    Gizmos.DrawWireSphere(waypoints[i].position, 0.4f);
                }
            }
            if (waypoints[waypoints.Count - 1] != null)
            {
                Gizmos.DrawWireSphere(waypoints[waypoints.Count - 1].position, 0.4f);
            }
        }
    }
}
