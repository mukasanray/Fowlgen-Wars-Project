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

        [Header("Feedback Visual da Rota (EAP Item 25)")]
        [SerializeField] private LineRenderer lineRenderer;
        [Tooltip("DEBUG apenas. Em jogo fica invisível; use HighlightTemporarily para pulsar temporariamente.")]
        [SerializeField] private bool debugLineVisibleInGame = false;
        private Coroutine highlightRoutine;

        private void Start()
        {
            SetupVisualLine();
        }

        private void SetupVisualLine()
        {
            if (waypoints == null || waypoints.Count == 0) return;

            if (lineRenderer == null)
            {
                lineRenderer = GetComponent<LineRenderer>();
                if (lineRenderer == null)
                {
                    lineRenderer = gameObject.AddComponent<LineRenderer>();
                }
            }

            lineRenderer.useWorldSpace = true;
            lineRenderer.startWidth = 0.20f;
            lineRenderer.endWidth = 0.20f;
            lineRenderer.positionCount = waypoints.Count;

            for (int i = 0; i < waypoints.Count; i++)
            {
                if (waypoints[i] != null)
                {
                    lineRenderer.SetPosition(i, waypoints[i].position + Vector3.up * 0.12f);
                }
            }

            Shader shader = Shader.Find("Universal Render Pipeline/Unlit");
            if (shader == null) shader = Shader.Find("Sprites/Default");
            if (shader != null)
            {
                Material mat = new Material(shader);
                Color baseCol = gizmoColor;
                baseCol.a = 0.30f;
                mat.color = baseCol;
                lineRenderer.material = mat;
            }
            // ponytail: invisível em gameplay; ligue debugLineVisibleInGame para debug
            lineRenderer.enabled = debugLineVisibleInGame;
        }

        public void HighlightTemporarily(float duration = 2.5f)
        {
            if (!gameObject.activeInHierarchy) return;
            if (highlightRoutine != null) StopCoroutine(highlightRoutine);
            highlightRoutine = StartCoroutine(HighlightPulseRoutine(duration));
        }

        private System.Collections.IEnumerator HighlightPulseRoutine(float duration)
        {
            if (lineRenderer == null) yield break;
            lineRenderer.enabled = true;
            float elapsed = 0f;
            Color pulseCol = gizmoColor;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float alpha = Mathf.PingPong(elapsed * 3f, 0.65f) + 0.35f;
                pulseCol.a = alpha;
                if (lineRenderer.material != null) lineRenderer.material.color = pulseCol;
                lineRenderer.startWidth = 0.38f;
                lineRenderer.endWidth = 0.38f;
                yield return null;
            }

            if (!debugLineVisibleInGame) lineRenderer.enabled = false;
            else
            {
                pulseCol.a = 0.25f;
                if (lineRenderer.material != null) lineRenderer.material.color = pulseCol;
                lineRenderer.startWidth = 0.20f;
                lineRenderer.endWidth = 0.20f;
            }
        }

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
