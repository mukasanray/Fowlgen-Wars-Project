// ============================================================================
//  ArenaCinematicDirector.cs – Fowlgen Wars
//  Sistema cinemático de câmera para gravação de vídeo de apresentação.
//
//  Controles de teclado (New Input System):
//    C     – Reproduzir / Reiniciar a sequência
//    Esc   – Parar e restaurar câmera original
//    Space – Pausar / Retomar
//    H     – Esconder / Mostrar overlay (letterbox, título, fade)
//
//  Frame Capture:
//    Ative captureFrames, defina captureFps e execute a sequência.
//    Os frames são salvos em: <projeto>/Recordings/<timestamp>/frame_00000.png
//
//    Montar vídeo com ffmpeg:
//    ffmpeg -framerate 30 -i "frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 output.mp4
//
//    Comando completo com pasta (substitua o caminho):
//    ffmpeg -framerate 30 -start_number 0 -i "/caminho/Recordings/YYYYMMDD_HHMMSS/frame_%05d.png"
//           -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart fowlgen_wars_trailer.mp4
// ============================================================================

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.InputSystem;

namespace FowlgenWars.Cinematic
{
    /// <summary>
    /// Dirige uma câmera por uma sequência de <see cref="CinematicShot"/> com easing,
    /// crossfade, letterbox 2.35:1, títulos (lower-third) e captura de frames.
    /// </summary>
    [AddComponentMenu("FowlgenWars/Cinematic/Arena Cinematic Director")]
    public class ArenaCinematicDirector : MonoBehaviour
    {
        // ── Camera ────────────────────────────────────────────────────────────
        [Header("Camera")]
        [Tooltip("Câmera controlada pela sequência. Se null, usa Camera.main.")]
        [SerializeField] private Camera _targetCamera;

        // ── Sequence ──────────────────────────────────────────────────────────
        [Header("Sequência de Shots")]
        [SerializeField] private List<CinematicShot> _shots = new List<CinematicShot>();

        [Tooltip("Reproduz automaticamente ao iniciar o jogo.")]
        [SerializeField] private bool _playOnStart;

        [Tooltip("Reinicia a sequência ao chegar no fim.")]
        [SerializeField] private bool _loop;

        // ── Crossfade ─────────────────────────────────────────────────────────
        [Header("Crossfade")]
        [Tooltip("Duração do fade-in e fade-out em segundos.")]
        [SerializeField] private float _fadeDuration = 0.6f;

        // ── Overlay ───────────────────────────────────────────────────────────
        [Header("Overlay")]
        [Tooltip("Exibe barras pretas letterbox (proporção 2.35:1).")]
        [SerializeField] private bool _showLetterbox = true;

        [Tooltip("Exibe texto de título no lower-third.")]
        [SerializeField] private bool _showTitles = true;

        // ── Frame Capture ─────────────────────────────────────────────────────
        [Header("Frame Capture")]
        [Tooltip("Quando ativo, salva cada frame como PNG para montagem de vídeo.")]
        [SerializeField] private bool _captureFrames;

        [Tooltip("FPS alvo para captura (define Time.captureFramerate).")]
        [SerializeField] private int _captureFps = 30;

        // ── Events ────────────────────────────────────────────────────────────
        /// <summary>Disparado quando a sequência completa sem loop.</summary>
        public event Action OnSequenceFinished;

        // ── Private state ─────────────────────────────────────────────────────
        private bool _isPlaying;
        private bool _isPaused;
        private bool _overlayHidden;
        private Coroutine _sequenceCoroutine;

        private float _fadeAlpha;
        private string _currentTitle = "";
        private int _currentShotIndex = -1;

        // Original camera state (para restaurar ao parar)
        private Vector3 _originalPosition;
        private Quaternion _originalRotation;
        private float _originalFov;

        // Frame capture state
        private string _captureFolder;
        private int _captureFrameIndex;

        // OnGUI style cache
        private GUIStyle _titleStyle;

        // ── Unity Lifecycle ───────────────────────────────────────────────────

        private void Awake()
        {
            if (_targetCamera == null)
                _targetCamera = Camera.main;

            if (_targetCamera != null)
            {
                _originalPosition = _targetCamera.transform.position;
                _originalRotation = _targetCamera.transform.rotation;
                _originalFov = _targetCamera.fieldOfView;
            }
        }

        private void Start()
        {
            if (_playOnStart)
                Play();
        }

        private void Update()
        {
            HandleKeyboard();
        }

        private void LateUpdate()
        {
            if (_captureFrames && _isPlaying && !string.IsNullOrEmpty(_captureFolder))
            {
                string framePath = Path.Combine(_captureFolder, $"frame_{_captureFrameIndex:D5}.png");
                ScreenCapture.CaptureScreenshot(framePath);
                _captureFrameIndex++;
            }
        }

        private void OnGUI()
        {
            if (_overlayHidden) return;

            Event e = Event.current;
            if (e.type != EventType.Repaint) return;

            // ── Letterbox ─────────────────────────────────────────────────────
            float barH = 0f;
            if (_showLetterbox && _isPlaying)
            {
                const float targetAspect = 2.35f;
                float currentAspect = (float)Screen.width / Screen.height;
                if (currentAspect < targetAspect)
                {
                    float contentH = Screen.width / targetAspect;
                    barH = (Screen.height - contentH) * 0.5f;
                    if (barH > 0.5f)
                    {
                        GUI.color = Color.black;
                        GUI.DrawTexture(new Rect(0f, 0f, Screen.width, barH), Texture2D.whiteTexture);
                        GUI.DrawTexture(new Rect(0f, Screen.height - barH, Screen.width, barH), Texture2D.whiteTexture);
                        GUI.color = Color.white;
                    }
                }
            }

            // ── Shot title (lower-third) ──────────────────────────────────────
            if (_showTitles && _isPlaying && !string.IsNullOrEmpty(_currentTitle))
            {
                EnsureTitleStyle();
                float titleH = Mathf.Max(32f, Screen.height * 0.06f);
                float baseY = Screen.height - barH - titleH - Screen.height * 0.015f;

                // Background strip
                GUI.color = new Color(0f, 0f, 0f, 0.72f);
                GUI.DrawTexture(new Rect(0f, baseY - 4f, Screen.width, titleH + 8f), Texture2D.whiteTexture);
                GUI.color = Color.white;

                // Text
                _titleStyle.fontSize = Mathf.RoundToInt(Screen.height * 0.036f);
                GUI.Label(new Rect(0f, baseY, Screen.width, titleH), _currentTitle, _titleStyle);
            }

            // ── Fade overlay (always on top) ──────────────────────────────────
            if (_fadeAlpha > 0.002f)
            {
                GUI.color = new Color(0f, 0f, 0f, _fadeAlpha);
                GUI.DrawTexture(new Rect(0f, 0f, Screen.width, Screen.height), Texture2D.whiteTexture);
                GUI.color = Color.white;
            }
        }

        // ── Public API ────────────────────────────────────────────────────────

        /// <summary>Inicia (ou reinicia) a sequência desde o shot 0.</summary>
        public void Play()
        {
            if (_targetCamera == null)
            {
                Debug.LogError("[ArenaCinematicDirector] Nenhuma câmera atribuída.");
                return;
            }

            Stop();

            _isPlaying = true;
            _isPaused = false;
            _fadeAlpha = 0f;
            _currentTitle = "";
            _currentShotIndex = 0;

            if (_captureFrames)
                StartCapture();

            _sequenceCoroutine = StartCoroutine(RunSequence());
        }

        /// <summary>Para a reprodução e restaura a câmera ao estado original.</summary>
        public void Stop()
        {
            if (_sequenceCoroutine != null)
            {
                StopCoroutine(_sequenceCoroutine);
                _sequenceCoroutine = null;
            }

            _isPlaying = false;
            _isPaused = false;
            _fadeAlpha = 0f;
            _currentTitle = "";
            _currentShotIndex = -1;

            if (_captureFrames)
                EndCapture();

            RestoreCamera();
        }

        /// <summary>Pausa ou retoma a reprodução.</summary>
        public void TogglePause()
        {
            if (!_isPlaying) return;
            _isPaused = !_isPaused;
        }

        // ── Keyboard ──────────────────────────────────────────────────────────

        private void HandleKeyboard()
        {
            Keyboard kb = Keyboard.current;
            if (kb == null) return;

            if (kb.cKey.wasPressedThisFrame)
                Play();

            if (kb.escapeKey.wasPressedThisFrame)
                Stop();

            if (kb.spaceKey.wasPressedThisFrame)
                TogglePause();

            if (kb.hKey.wasPressedThisFrame)
                _overlayHidden = !_overlayHidden;
        }

        // ── Coroutines ────────────────────────────────────────────────────────

        private IEnumerator RunSequence()
        {
            if (_shots == null || _shots.Count == 0)
            {
                Debug.LogWarning("[ArenaCinematicDirector] Nenhum shot configurado. Use BuildDefaultArenaShots.");
                _isPlaying = false;
                yield break;
            }

            do
            {
                for (int i = 0; i < _shots.Count; i++)
                {
                    if (!_isPlaying) yield break;
                    _currentShotIndex = i;
                    var shot = _shots[i];
                    if (shot == null) continue;
                    yield return StartCoroutine(RunShot(shot));
                }
            }
            while (_loop && _isPlaying);

            _isPlaying = false;
            _currentTitle = "";
            OnSequenceFinished?.Invoke();
            Debug.Log("[ArenaCinematicDirector] Sequência concluída.");
        }

        private IEnumerator RunShot(CinematicShot shot)
        {
            // Snap câmera para posição inicial ANTES de revelar via fade
            if (shot.fadeInAtStart)
            {
                _fadeAlpha = 1f;
                ApplyShotAt(shot, 0f);
                yield return StartCoroutine(AnimateFade(1f, 0f, _fadeDuration));
            }

            _currentTitle = shot.titleText;
            float elapsed = 0f;
            float totalDuration = Mathf.Max(0.001f, shot.duration);

            while (elapsed < totalDuration)
            {
                // Aguarda enquanto pausado
                while (_isPaused && _isPlaying)
                    yield return null;

                if (!_isPlaying) yield break;

                float t = elapsed / totalDuration;
                float easedT = shot.easing != null ? shot.easing.Evaluate(t) : t;
                ApplyShotAt(shot, easedT);

                elapsed += Time.deltaTime;
                yield return null;
            }

            // Garante posição exata no fim
            ApplyShotAt(shot, 1f);

            // Fade out antes do próximo shot
            if (shot.fadeOutAtEnd)
                yield return StartCoroutine(AnimateFade(0f, 1f, _fadeDuration));
        }

        private IEnumerator AnimateFade(float from, float to, float duration)
        {
            float elapsed = 0f;
            float d = Mathf.Max(0.001f, duration);
            while (elapsed < d)
            {
                _fadeAlpha = Mathf.Lerp(from, to, elapsed / d);
                elapsed += Time.deltaTime;
                yield return null;
            }
            _fadeAlpha = to;
        }

        // ── Shot Evaluation ───────────────────────────────────────────────────

        private void ApplyShotAt(CinematicShot shot, float t)
        {
            if (_targetCamera == null) return;

            Vector3 camPos = GetShotPosition(shot, t);
            Vector3 lookPos = GetLookAtPosition(shot, t);

            _targetCamera.transform.position = camPos;

            // Evita LookAt degenerado se câmera == alvo
            if ((lookPos - camPos).sqrMagnitude > 0.0001f)
                _targetCamera.transform.LookAt(lookPos, Vector3.up);

            _targetCamera.fieldOfView = Mathf.Lerp(shot.fovStart, shot.fovEnd, t);
        }

        private Vector3 GetShotPosition(CinematicShot shot, float t)
        {
            switch (shot.moveType)
            {
                case ShotMoveType.Dolly:
                    return Vector3.Lerp(shot.startPosition, shot.endPosition, t);

                case ShotMoveType.Orbit:
                {
                    float angleDeg = Mathf.Lerp(shot.orbitStartAngleDeg, shot.orbitEndAngleDeg, t);
                    float angleRad = angleDeg * Mathf.Deg2Rad;
                    float height = Mathf.Lerp(shot.orbitHeight, shot.orbitHeightEnd, t);
                    return shot.orbitCenter + new Vector3(
                        Mathf.Cos(angleRad) * shot.orbitRadius,
                        height,
                        Mathf.Sin(angleRad) * shot.orbitRadius);
                }

                case ShotMoveType.Static:
                default:
                    return shot.startPosition;
            }
        }

        private Vector3 GetLookAtPosition(CinematicShot shot, float t)
        {
            Vector3 start = shot.lookAtTransform != null
                ? shot.lookAtTransform.position
                : shot.lookAtPosition;

            if (!shot.useLookAtEnd)
                return start;

            return Vector3.Lerp(start, shot.lookAtEndPosition, t);
        }

        // ── Camera Restore ────────────────────────────────────────────────────

        private void RestoreCamera()
        {
            if (_targetCamera == null) return;
            _targetCamera.transform.position = _originalPosition;
            _targetCamera.transform.rotation = _originalRotation;
            _targetCamera.fieldOfView = _originalFov;
        }

        // ── Frame Capture ─────────────────────────────────────────────────────

        private void StartCapture()
        {
            string projectRoot = Path.GetDirectoryName(Application.dataPath);
            string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            _captureFolder = Path.Combine(projectRoot, "Recordings", timestamp);
            Directory.CreateDirectory(_captureFolder);
            _captureFrameIndex = 0;

            Time.captureFramerate = _captureFps;

            Debug.Log($"[ArenaCinematicDirector] Capturando frames em: {_captureFolder}");
            Debug.Log($"[ArenaCinematicDirector] Montar vídeo com:\n" +
                      $"ffmpeg -framerate {_captureFps} -start_number 0 " +
                      $"-i \"{Path.Combine(_captureFolder, "frame_%05d.png")}\" " +
                      $"-c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart fowlgen_wars_trailer.mp4");
        }

        private void EndCapture()
        {
            if (!_captureFrames) return;
            Time.captureFramerate = 0;
            if (!string.IsNullOrEmpty(_captureFolder))
                Debug.Log($"[ArenaCinematicDirector] Captura concluída. {_captureFrameIndex} frames em: {_captureFolder}");
            _captureFolder = "";
        }

        // ── Default Arena Shots ───────────────────────────────────────────────

        /// <summary>
        /// Preenche a lista de shots com a sequência padrão de apresentação da arena.
        /// Baseado nas coordenadas de mundo da BattleArena:
        ///   Centro (0,0,0) | Ilha raio ≈24 | Base Vermelha (16.5,0,0.5) | Base Azul (-16.5,0,0.5)
        ///   Estátua galo vermelho (13.3,4,-1.3) | Estátua galo azul (-13.3,4,-1.3)
        ///   Rio S-curve ao longo do eixo Z perto de x≈0 | Pontes: Top(-0.5,0.4,-9) Bottom(-2,0.4,10)
        ///   Torretas vermelhas (7.5,0,-9.5) e (7.8,0,9.8) | Torretas azuis (-8.2,0,-9.5) e (-8.5,0,9.8)
        ///   Câmera gameplay: pos(0,42,34) olhando (0,0,-1) FOV 42
        /// </summary>
        [ContextMenu("Build Default Arena Shots")]
        public void BuildDefaultArenaShots()
        {
            _shots = new List<CinematicShot>();

            // ── Shot 1: Wide Establishing Orbit (underbelly → overview) ─────
            // A câmera começa abaixo da ilha flutuante, mostrando a barriga,
            // e sobe em arco de 250° ao redor da arena.
            _shots.Add(new CinematicShot
            {
                shotName = "01 – Órbita Revelação (debaixo → cima)",
                duration = 10f,
                easing = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f),
                moveType = ShotMoveType.Orbit,
                orbitCenter = new Vector3(0f, 0f, 0f),
                orbitStartAngleDeg = 30f,
                orbitEndAngleDeg = 280f,
                orbitRadius = 40f,
                orbitHeight = -16f,       // começa abaixo (mostra barriga da ilha)
                orbitHeightEnd = 20f,     // sobe para visão panorâmica
                lookAtPosition = new Vector3(0f, -2f, 0f),
                fovStart = 55f,
                fovEnd = 50f,
                fadeInAtStart = true,
                fadeOutAtEnd = true,
            });

            // ── Shot 2: Descida ao Rio ───────────────────────────────────────
            // Dolly desce de altitude de visão até nível do rio, voando ao longo do vale.
            _shots.Add(new CinematicShot
            {
                shotName = "02 – Descida ao Rio",
                duration = 6f,
                easing = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f),
                moveType = ShotMoveType.Dolly,
                startPosition = new Vector3(0f, 22f, -30f),
                endPosition = new Vector3(1.5f, 3.5f, -18f),
                lookAtPosition = new Vector3(0f, 1f, -8f),
                useLookAtEnd = true,
                lookAtEndPosition = new Vector3(0f, 1f, 0f),
                fovStart = 50f,
                fovEnd = 62f,
                fadeInAtStart = true,
                fadeOutAtEnd = false,
            });

            // ── Shot 3: Passagem pela TopBridge ─────────────────────────────
            // Câmera voa por cima da ponte superior, mostrando o rio abaixo.
            _shots.Add(new CinematicShot
            {
                shotName = "03 – Passagem pela Ponte Superior",
                duration = 5f,
                easing = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f),
                moveType = ShotMoveType.Dolly,
                startPosition = new Vector3(4f, 8f, -18f),
                endPosition = new Vector3(-3f, 4.5f, -4f),
                lookAtPosition = new Vector3(-0.5f, 0.4f, -9f),   // TopBridge
                fovStart = 62f,
                fovEnd = 55f,
                fadeInAtStart = false,
                fadeOutAtEnd = true,
            });

            // ── Shot 4: Órbita da Estátua do Galo Vermelho ──────────────────
            _shots.Add(new CinematicShot
            {
                shotName = "04 – Base Vermelha (estátua do galo)",
                duration = 8f,
                easing = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f),
                moveType = ShotMoveType.Orbit,
                orbitCenter = new Vector3(13.3f, 4f, -1.3f),
                orbitStartAngleDeg = 200f,
                orbitEndAngleDeg = 340f,
                orbitRadius = 8f,
                orbitHeight = 4f,
                orbitHeightEnd = 7f,
                lookAtPosition = new Vector3(13.3f, 3.5f, -1.3f),
                fovStart = 52f,
                fovEnd = 44f,
                titleText = "Base Vermelha",
                fadeInAtStart = true,
                fadeOutAtEnd = true,
            });

            // ── Shot 5: Travessia para a Base Azul ──────────────────────────
            // Dolly lateral atravessa o mapa, pan de câmera revelando a base azul.
            _shots.Add(new CinematicShot
            {
                shotName = "05 – Base Azul (travessia)",
                duration = 7f,
                easing = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f),
                moveType = ShotMoveType.Dolly,
                startPosition = new Vector3(8f, 6f, 0f),
                endPosition = new Vector3(-11f, 6f, -1f),
                lookAtPosition = new Vector3(0f, 2f, 0f),
                useLookAtEnd = true,
                lookAtEndPosition = new Vector3(-13.3f, 4f, -1.3f),
                fovStart = 50f,
                fovEnd = 48f,
                titleText = "Base Azul",
                fadeInAtStart = true,
                fadeOutAtEnd = true,
            });

            // ── Shot 6: Push baixo ângulo na Torreta ─────────────────────────
            // Câmera rente ao chão empurra em direção à torreta vermelha (7.5,0,-9.5),
            // revelando seu tamanho e presença dramática.
            _shots.Add(new CinematicShot
            {
                shotName = "06 – Torreta (low-angle push)",
                duration = 5f,
                easing = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f),
                moveType = ShotMoveType.Dolly,
                startPosition = new Vector3(3.5f, 2.5f, -14f),
                endPosition = new Vector3(6.2f, 0.8f, -11f),
                lookAtPosition = new Vector3(7.5f, 3.5f, -9.5f),
                fovStart = 68f,
                fovEnd = 50f,
                fadeInAtStart = true,
                fadeOutAtEnd = true,
            });

            // ── Shot 7: Crane Final para câmera de gameplay ──────────────────
            // Grua épica: câmera sobe até a posição de overview usada no gameplay,
            // revelando o campo de batalha completo com o título do jogo.
            _shots.Add(new CinematicShot
            {
                shotName = "07 – Fowlgen Wars (crane overview)",
                duration = 9f,
                easing = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f),
                moveType = ShotMoveType.Dolly,
                startPosition = new Vector3(6f, 2f, -9f),
                endPosition = new Vector3(0f, 42f, 34f),           // gameplay overview pose
                lookAtPosition = new Vector3(0f, 0f, 0f),
                useLookAtEnd = true,
                lookAtEndPosition = new Vector3(0f, 0f, -1f),      // gameplay look-at
                fovStart = 50f,
                fovEnd = 42f,                                       // gameplay FOV
                titleText = "Fowlgen Wars",
                fadeInAtStart = true,
                fadeOutAtEnd = true,
            });

#if UNITY_EDITOR
            UnityEditor.EditorUtility.SetDirty(this);
#endif
            Debug.Log($"[ArenaCinematicDirector] {_shots.Count} shots criados. " +
                      $"Duração total estimada: ~{EstimateTotalDuration():F0}s");
        }

        private float EstimateTotalDuration()
        {
            float total = 0f;
            if (_shots == null) return 0f;
            foreach (var s in _shots)
            {
                if (s == null) continue;
                total += s.duration;
                if (s.fadeInAtStart) total += _fadeDuration;
                if (s.fadeOutAtEnd)  total += _fadeDuration;
            }
            return total;
        }

        // ── Gizmos ────────────────────────────────────────────────────────────

        private void OnDrawGizmosSelected()
        {
            if (_shots == null) return;

            for (int i = 0; i < _shots.Count; i++)
            {
                var shot = _shots[i];
                if (shot == null) continue;

                // Cor por índice para distinguir os shots
                float hue = (float)i / Mathf.Max(1, _shots.Count);
                Color shotColor = Color.HSVToRGB(hue, 0.85f, 1f);
                shotColor.a = 0.9f;

                switch (shot.moveType)
                {
                    case ShotMoveType.Dolly:
                        DrawDollyGizmo(shot, shotColor);
                        break;
                    case ShotMoveType.Orbit:
                        DrawOrbitGizmo(shot, shotColor);
                        break;
                    case ShotMoveType.Static:
                        Gizmos.color = shotColor;
                        Gizmos.DrawWireSphere(shot.startPosition, 0.5f);
                        DrawLookAtLine(shot.startPosition, shot, 0f, shotColor);
                        break;
                }

                // Rótulo do shot (apenas se Handles estiver disponível em editor)
#if UNITY_EDITOR
                Vector3 labelPos = GetShotPosition(shot, 0f) + Vector3.up * 1f;
                UnityEditor.Handles.color = shotColor;
                UnityEditor.Handles.Label(labelPos, $"[{i}] {shot.shotName}");
#endif
            }
        }

        private void DrawDollyGizmo(CinematicShot shot, Color color)
        {
            Gizmos.color = color;
            Gizmos.DrawLine(shot.startPosition, shot.endPosition);
            Gizmos.DrawWireSphere(shot.startPosition, 0.35f);
            Gizmos.DrawWireSphere(shot.endPosition, 0.5f);

            // Seta de direção
            Vector3 dir = (shot.endPosition - shot.startPosition).normalized;
            Vector3 mid = Vector3.Lerp(shot.startPosition, shot.endPosition, 0.5f);
            Gizmos.DrawRay(mid, dir * 1.5f);

            DrawLookAtLine(shot.endPosition, shot, 1f, color);
        }

        private void DrawOrbitGizmo(CinematicShot shot, Color color)
        {
            const int segments = 48;
            Gizmos.color = new Color(color.r, color.g, color.b, 0.35f);

            // Desenha o círculo de órbita (altura média)
            float midHeight = (shot.orbitHeight + shot.orbitHeightEnd) * 0.5f;
            Vector3 prev = Vector3.zero;
            for (int s = 0; s <= segments; s++)
            {
                float a = s * 360f / segments * Mathf.Deg2Rad;
                Vector3 p = shot.orbitCenter + new Vector3(
                    Mathf.Cos(a) * shot.orbitRadius, midHeight, Mathf.Sin(a) * shot.orbitRadius);
                if (s > 0) Gizmos.DrawLine(prev, p);
                prev = p;
            }

            // Marcadores de início e fim
            float startRad = shot.orbitStartAngleDeg * Mathf.Deg2Rad;
            float endRad   = shot.orbitEndAngleDeg   * Mathf.Deg2Rad;

            Vector3 startCamPos = shot.orbitCenter + new Vector3(
                Mathf.Cos(startRad) * shot.orbitRadius, shot.orbitHeight, Mathf.Sin(startRad) * shot.orbitRadius);
            Vector3 endCamPos = shot.orbitCenter + new Vector3(
                Mathf.Cos(endRad) * shot.orbitRadius, shot.orbitHeightEnd, Mathf.Sin(endRad) * shot.orbitRadius);

            Gizmos.color = color;
            Gizmos.DrawWireSphere(startCamPos, 0.35f);
            Gizmos.DrawWireSphere(endCamPos, 0.55f);
            Gizmos.DrawLine(shot.orbitCenter + Vector3.up * midHeight, startCamPos);

            // Linha de subida (se houver diferença de altura)
            if (Mathf.Abs(shot.orbitHeightEnd - shot.orbitHeight) > 0.1f)
                Gizmos.DrawLine(startCamPos, endCamPos);

            DrawLookAtLine(endCamPos, shot, 1f, color);
        }

        private void DrawLookAtLine(Vector3 from, CinematicShot shot, float t, Color color)
        {
            Color lookatColor = new Color(color.r * 0.6f, color.g, color.b * 0.6f, 0.5f);
            Gizmos.color = lookatColor;
            Vector3 lookTarget = GetLookAtPosition(shot, t);
            Gizmos.DrawLine(from, lookTarget);
            Gizmos.DrawWireSphere(lookTarget, 0.25f);
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private void EnsureTitleStyle()
        {
            if (_titleStyle != null) return;
            _titleStyle = new GUIStyle
            {
                alignment = TextAnchor.MiddleCenter,
                fontStyle = FontStyle.Bold,
                normal = { textColor = Color.white }
            };
        }
    }
}
