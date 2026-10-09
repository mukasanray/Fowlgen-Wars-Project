using System;
using UnityEngine;

namespace FowlgenWars.Cinematic
{
    /// <summary>
    /// Tipo de movimento da câmera em um shot cinemático.
    /// </summary>
    public enum ShotMoveType
    {
        /// <summary>Câmera estática na startPosition.</summary>
        Static,
        /// <summary>Câmera se move em linha reta de startPosition até endPosition.</summary>
        Dolly,
        /// <summary>Câmera orbita em volta de orbitCenter no raio/ângulo definidos.</summary>
        Orbit
    }

    /// <summary>
    /// Dados de um único shot na sequência cinemática do Fowlgen Wars.
    /// Cada shot define posição, movimento, look-at, FOV, título e transição.
    /// </summary>
    [Serializable]
    public class CinematicShot
    {
        // ──────────────────────────────────────────────────────────────────────
        // Identity
        // ──────────────────────────────────────────────────────────────────────
        [Header("Identity")]
        [Tooltip("Nome descritivo do shot (exibido nos Gizmos).")]
        public string shotName = "Shot";

        // ──────────────────────────────────────────────────────────────────────
        // Timing
        // ──────────────────────────────────────────────────────────────────────
        [Header("Timing")]
        [Tooltip("Duração do shot em segundos (excluindo fades).")]
        public float duration = 5f;

        [Tooltip("Curva de easing aplicada ao progresso do shot (0→1).")]
        public AnimationCurve easing = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

        // ──────────────────────────────────────────────────────────────────────
        // Move Type
        // ──────────────────────────────────────────────────────────────────────
        [Header("Move Type")]
        [Tooltip("Static = parado; Dolly = linear A→B; Orbit = orbital ao redor de um ponto.")]
        public ShotMoveType moveType = ShotMoveType.Dolly;

        // ── Dolly ─────────────────────────────────────────────────────────────
        [Header("Dolly (use se moveType = Dolly ou Static)")]
        [Tooltip("Posição inicial da câmera (também usada em Static).")]
        public Vector3 startPosition;

        [Tooltip("Posição final da câmera (apenas Dolly).")]
        public Vector3 endPosition;

        // ── Orbit ─────────────────────────────────────────────────────────────
        [Header("Orbit (use se moveType = Orbit)")]
        [Tooltip("Centro da órbita no espaço do mundo.")]
        public Vector3 orbitCenter;

        [Tooltip("Ângulo inicial da órbita em graus (0° = +Z).")]
        public float orbitStartAngleDeg;

        [Tooltip("Ângulo final da órbita em graus.")]
        public float orbitEndAngleDeg = 90f;

        [Tooltip("Raio da órbita em unidades de mundo.")]
        public float orbitRadius = 10f;

        [Tooltip("Altura da câmera no início da órbita.")]
        public float orbitHeight = 5f;

        [Tooltip("Altura da câmera no fim da órbita (permite subida/descida durante a órbita).")]
        public float orbitHeightEnd = 5f;

        // ──────────────────────────────────────────────────────────────────────
        // Look At
        // ──────────────────────────────────────────────────────────────────────
        [Header("Look At")]
        [Tooltip("Ponto de mundo que a câmera olha. Ignorado se lookAtTransform estiver preenchido.")]
        public Vector3 lookAtPosition;

        [Tooltip("Transform a seguir (sobrescreve lookAtPosition se não for null).")]
        public Transform lookAtTransform;

        [Tooltip("Se verdadeiro, interpola o alvo de lookAt de lookAtPosition até lookAtEndPosition (pan cinemático).")]
        public bool useLookAtEnd;

        [Tooltip("Posição final do look-at para pan (só usado quando useLookAtEnd = true).")]
        public Vector3 lookAtEndPosition;

        // ──────────────────────────────────────────────────────────────────────
        // FOV
        // ──────────────────────────────────────────────────────────────────────
        [Header("FOV")]
        [Tooltip("Field of view no início do shot.")]
        public float fovStart = 60f;

        [Tooltip("Field of view no fim do shot.")]
        public float fovEnd = 60f;

        // ──────────────────────────────────────────────────────────────────────
        // Title & Transitions
        // ──────────────────────────────────────────────────────────────────────
        [Header("Title / Transition")]
        [Tooltip("Texto exibido no lower-third durante este shot. Deixe vazio para não exibir.")]
        public string titleText = "";

        [Tooltip("Faz um fade-in (preto → cena) no início do shot.")]
        public bool fadeInAtStart;

        [Tooltip("Faz um fade-out (cena → preto) no fim do shot.")]
        public bool fadeOutAtEnd;
    }
}
