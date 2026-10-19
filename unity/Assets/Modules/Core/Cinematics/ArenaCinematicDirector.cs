// ============================================================================
//  ArenaCinematicDirector.cs – Fowlgen Wars (Cinemachine 3 Native)
//  Sequenciador profissional de apresentação cinemática baseado em 
//  CinemachineCameras e CinemachineBrain do Unity 6.
//
//  Controles em Play Mode:
//    C     – Iniciar / Reiniciar a sequência cinemática
//    Space – Pausar / Retomar
//    Esc   – Parar e retornar imediatamente para a câmera de combate
//    H     – Ocultar / Exibir barras e títulos (letterbox)
// ============================================================================

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Cinemachine;

namespace FowlgenWars.Cinematic
{
    [System.Serializable]
    public class CinemachineShotStep
    {
        public string shotName = "Shot";
        public CinemachineCamera virtualCamera;
        [Tooltip("Tempo em segundos que a câmera permanece ativa antes de transicionar.")]
        public float holdDuration = 5f;
        [Tooltip("Título exibido no lower-third.")]
        public string titleText = "";
        [Tooltip("Subtítulo exibido no lower-third.")]
        public string subtitleText = "";
    }

    [AddComponentMenu("FowlgenWars/Cinematic/Arena Cinematic Director (Cinemachine)")]
    public class ArenaCinematicDirector : MonoBehaviour
    {
        [Header("Cinemachine Brain")]
        [SerializeField] private CinemachineBrain _brain;

        [Header("Sequência de Câmeras Cinemachine")]
        [SerializeField] private List<CinemachineShotStep> _steps = new List<CinemachineShotStep>();

        [Header("Configurações")]
        [SerializeField] private bool _playOnStart = false;
        [SerializeField] private bool _loop = false;
        [SerializeField] private bool _showLetterbox = true;
        [SerializeField] private bool _showTitles = true;

        [Header("Câmera Final de Gameplay")]
        [SerializeField] private CinemachineCamera _gameplayCamera;

        // Estado runtime
        private bool _isPlaying;
        private bool _isPaused;
        private bool _overlayHidden;
        private int _currentStepIndex = -1;
        private string _currentTitle = "";
        private string _currentSubtitle = "";
        private Coroutine _sequenceCoroutine;

        // GUI Styles
        private GUIStyle _titleStyle;
        private GUIStyle _subStyle;

        public event Action OnSequenceFinished;

        private void Awake()
        {
            if (_brain == null && Camera.main != null)
            {
                _brain = Camera.main.GetComponent<CinemachineBrain>();
                if (_brain == null)
                    _brain = Camera.main.gameObject.AddComponent<CinemachineBrain>();
            }
        }

        private void Start()
        {
            if (_steps == null || _steps.Count == 0)
            {
                BuildDefaultCinemachineRigs();
            }

            if (_playOnStart)
            {
                Play();
            }
            else
            {
                SetOnlyActiveCamera(_gameplayCamera);
            }
        }

        private void Update()
        {
#if ENABLE_INPUT_SYSTEM
            var kb = UnityEngine.InputSystem.Keyboard.current;
            if (kb != null)
            {
                if (kb.cKey.wasPressedThisFrame) Play();
                if (kb.escapeKey.wasPressedThisFrame) Stop();
                if (kb.spaceKey.wasPressedThisFrame) _isPaused = !_isPaused;
                if (kb.hKey.wasPressedThisFrame) _overlayHidden = !_overlayHidden;
            }
#else
            if (Input.GetKeyDown(KeyCode.C)) Play();
            if (Input.GetKeyDown(KeyCode.Escape)) Stop();
            if (Input.GetKeyDown(KeyCode.Space)) _isPaused = !_isPaused;
            if (Input.GetKeyDown(KeyCode.H)) _overlayHidden = !_overlayHidden;
#endif
        }

        public void Play()
        {
            if (_steps == null || _steps.Count == 0)
            {
                Debug.LogWarning("[ArenaCinematicDirector] Nenhuma câmera configurada.");
                return;
            }

            Stop();
            _isPlaying = true;
            _isPaused = false;
            _sequenceCoroutine = StartCoroutine(RunCinemachineSequence());
        }

        public void Stop()
        {
            if (_sequenceCoroutine != null)
            {
                StopCoroutine(_sequenceCoroutine);
                _sequenceCoroutine = null;
            }

            _isPlaying = false;
            _isPaused = false;
            _currentTitle = "";
            _currentSubtitle = "";
            _currentStepIndex = -1;

            if (_gameplayCamera != null)
            {
                SetOnlyActiveCamera(_gameplayCamera);
            }
        }

        private IEnumerator RunCinemachineSequence()
        {
            Debug.Log("[ArenaCinematicDirector] Iniciando apresentação cinemática de pitch...");

            for (int i = 0; i < _steps.Count; i++)
            {
                _currentStepIndex = i;
                var step = _steps[i];
                if (step == null || step.virtualCamera == null) continue;

                _currentTitle = step.titleText;
                _currentSubtitle = step.subtitleText;

                SetOnlyActiveCamera(step.virtualCamera);

                float timer = 0f;
                while (timer < step.holdDuration)
                {
                    if (!_isPaused)
                    {
                        timer += Time.deltaTime;
                    }
                    yield return null;
                }
            }

            // Transição final para a câmera de combate
            _currentTitle = "Fowlgen Wars";
            _currentSubtitle = "Batalha Iniciada!";
            if (_gameplayCamera != null)
            {
                SetOnlyActiveCamera(_gameplayCamera);
            }

            yield return new WaitForSeconds(2.5f);

            _currentTitle = "";
            _currentSubtitle = "";
            _isPlaying = false;
            _sequenceCoroutine = null;

            Debug.Log("[ArenaCinematicDirector] Sequência concluída com sucesso. Câmera de combate ativa.");
            OnSequenceFinished?.Invoke();

            if (_loop)
            {
                Play();
            }
        }

        private void SetOnlyActiveCamera(CinemachineCamera activeCam)
        {
            if (activeCam == null) return;

            // Define prioridade alta para a ativa e baixa para todas as outras
            if (_steps != null)
            {
                foreach (var s in _steps)
                {
                    if (s != null && s.virtualCamera != null)
                    {
                        bool isTarget = s.virtualCamera == activeCam;
                        s.virtualCamera.Priority = new PrioritySettings { Value = isTarget ? 20 : 10 };
                    }
                }
            }

            if (_gameplayCamera != null)
            {
                bool isTarget = _gameplayCamera == activeCam;
                _gameplayCamera.Priority = new PrioritySettings { Value = isTarget ? 20 : 10 };
            }
        }

        [ContextMenu("Rebuild Default Cinemachine Rigs")]
        public void BuildDefaultCinemachineRigs()
        {
            Transform rigsParent = transform.Find("Cinematic_Cinemachine_Rigs");
            if (rigsParent == null)
            {
                var go = new GameObject("Cinematic_Cinemachine_Rigs");
                go.transform.SetParent(transform);
                rigsParent = go.transform;
            }

            // Garante CinemachineBrain
            if (_brain == null && Camera.main != null)
            {
                _brain = Camera.main.GetComponent<CinemachineBrain>();
                if (_brain == null)
                    _brain = Camera.main.gameObject.AddComponent<CinemachineBrain>();
            }

            if (_brain != null)
            {
                _brain.DefaultBlend = new CinemachineBlendDefinition(CinemachineBlendDefinition.Styles.EaseInOut, 1.8f);
            }

            // 1. Cam 1: Sobrevoo Panorâmico
            var cam1 = CreateOrGetVirtualCam(rigsParent, "CM_Cam1_Sobrevoo", 
                new Vector3(-14f, 35f, -34f), 
                new Vector3(0f, 10.5f, 0f), 
                52f);

            // 2. Cam 2: Base Aliada & Galinheiro Dourado
            var cam2 = CreateOrGetVirtualCam(rigsParent, "CM_Cam2_BaseAliada", 
                new Vector3(0f, 18f, 28f), 
                new Vector3(0.32f, 10.51f, 20.65f), 
                46f);

            // 3. Cam 3: Herói Milo de Frente (Close Épico)
            var cam3 = CreateOrGetVirtualCam(rigsParent, "CM_Cam3_HeroiMilo", 
                new Vector3(1.8f, 13.2f, 10.0f), 
                new Vector3(0f, 12.2f, 15.41f), 
                44f);

            // 4. Cam 4: Câmera Oficial de Gameplay
            var cam4 = CreateOrGetVirtualCam(rigsParent, "CM_Cam4_GameplayBlend", 
                new Vector3(-22.0f, 28.5f, -1.5f), 
                Quaternion.Euler(40.8f, 88.2f, 0f), 
                50f);

            _gameplayCamera = cam4;

            _steps = new List<CinemachineShotStep>
            {
                new CinemachineShotStep
                {
                    shotName = "01 – Sobrevoo Panorâmico",
                    virtualCamera = cam1,
                    holdDuration = 5.5f,
                    titleText = "FOWLGEN WARS",
                    subtitleText = "O Primeiro Mini-MOBA na Solana"
                },
                new CinemachineShotStep
                {
                    shotName = "02 – Base Aliada & Galinheiro",
                    virtualCamera = cam2,
                    holdDuration = 4.5f,
                    titleText = "Defenda seu Galinheiro",
                    subtitleText = "Estratégia e Combate nas 3 Rotas"
                },
                new CinemachineShotStep
                {
                    shotName = "03 – Herói Milo Atirador",
                    virtualCamera = cam3,
                    holdDuration = 5.0f,
                    titleText = "Milo – O Galo Paladino",
                    subtitleText = "Habilidades Ágeis & Dano à Distância"
                },
                new CinemachineShotStep
                {
                    shotName = "04 – Blend para Combate Real",
                    virtualCamera = cam4,
                    holdDuration = 4.0f,
                    titleText = "Batalha Iniciada!",
                    subtitleText = "Partidas Rápidas de 3 Minutos"
                }
            };

            SetOnlyActiveCamera(_gameplayCamera);

#if UNITY_EDITOR
            UnityEditor.EditorUtility.SetDirty(this);
#endif
            Debug.Log("[ArenaCinematicDirector] 4 Câmeras Cinemachine criadas com blends suaves profissionais!");
        }

        private CinemachineCamera CreateOrGetVirtualCam(Transform parent, string name, Vector3 pos, Vector3 lookAtPos, float fov)
        {
            Transform existing = parent.Find(name);
            GameObject go = existing != null ? existing.gameObject : new GameObject(name);
            go.transform.SetParent(parent);
            go.transform.position = pos;
            go.transform.LookAt(lookAtPos);

            var cam = go.GetComponent<CinemachineCamera>();
            if (cam == null) cam = go.AddComponent<CinemachineCamera>();

            cam.Lens.FieldOfView = fov;
            cam.Priority = new PrioritySettings { Value = 10 };
            return cam;
        }

        private CinemachineCamera CreateOrGetVirtualCam(Transform parent, string name, Vector3 pos, Quaternion rot, float fov)
        {
            Transform existing = parent.Find(name);
            GameObject go = existing != null ? existing.gameObject : new GameObject(name);
            go.transform.SetParent(parent);
            go.transform.position = pos;
            go.transform.rotation = rot;

            var cam = go.GetComponent<CinemachineCamera>();
            if (cam == null) cam = go.AddComponent<CinemachineCamera>();

            cam.Lens.FieldOfView = fov;
            cam.Priority = new PrioritySettings { Value = 10 };
            return cam;
        }

        // ── Interface de Cinema (OnGUI) ───────────────────────────────────────
        private void OnGUI()
        {
            if (!_isPlaying || _overlayHidden) return;

            InitStyles();

            float sw = Screen.width;
            float sh = Screen.height;

            // Letterbox 2.35:1
            if (_showLetterbox)
            {
                float targetH = sw / 2.35f;
                float barH = Mathf.Max(0f, (sh - targetH) * 0.5f);
                if (barH > 0f)
                {
                    Color prev = GUI.color;
                    GUI.color = Color.black;
                    GUI.DrawTexture(new Rect(0, 0, sw, barH), Texture2D.whiteTexture);
                    GUI.DrawTexture(new Rect(0, sh - barH, sw, barH), Texture2D.whiteTexture);
                    GUI.color = prev;
                }
            }

            // Lower-third title
            if (_showTitles && !string.IsNullOrEmpty(_currentTitle))
            {
                float panelW = Mathf.Min(sw * 0.7f, 700f);
                float panelH = 75f;
                float x = (sw - panelW) * 0.5f;
                float y = sh - (sh * 0.16f);

                GUI.Label(new Rect(x, y, panelW, 35f), _currentTitle, _titleStyle);
                if (!string.IsNullOrEmpty(_currentSubtitle))
                {
                    GUI.Label(new Rect(x, y + 36f, panelW, 26f), _currentSubtitle, _subStyle);
                }
            }
        }

        private void InitStyles()
        {
            if (_titleStyle != null) return;

            _titleStyle = new GUIStyle
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = Mathf.Clamp(Mathf.RoundToInt(Screen.height * 0.042f), 18, 38),
                fontStyle = FontStyle.Bold,
                normal = { textColor = new Color(1f, 0.92f, 0.4f, 1f) } // Dourado épico
            };

            _subStyle = new GUIStyle
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = Mathf.Clamp(Mathf.RoundToInt(Screen.height * 0.026f), 12, 22),
                fontStyle = FontStyle.Normal,
                normal = { textColor = new Color(0.95f, 0.95f, 0.95f, 0.9f) } // Branco suave
            };
        }
    }
}
