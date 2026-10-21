using System;
using UnityEngine;
using UnityEngine.EventSystems;
using FowlgenWars.Modules.MobileControls.Domain.Contracts;

namespace FowlgenWars.Modules.MobileControls.Presentation.Views
{
    /// <summary>
    /// Componente de Joystick Virtual Touch (Canvas / UGUI) de alta performance para mobile landscape.
    /// Suporta modos Fixed, Floating e Dynamic, restrição de eixos (Both, Horizontal, Vertical) e snapping.
    /// Implementa IJoystickInput e IPointerHandlers com zero alocações no Update.
    /// </summary>
    public class VirtualJoystickView : MonoBehaviour, IJoystickInput, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        [Header("Modo de Operação")]
        [SerializeField] private JoystickMode joystickMode = JoystickMode.Floating;
        [SerializeField] private float moveThreshold = 1.0f;

        [Header("Configuração de Eixos & Snapping")]
        [SerializeField] private AxisOptions axisOptions = AxisOptions.Both;
        [SerializeField] private bool snapX = false;
        [SerializeField] private bool snapY = false;

        [Header("Transformações UI")]
        [SerializeField] private RectTransform background;
        [SerializeField] private RectTransform handle;
        [SerializeField] private float handleRange = 75f;
        [Tooltip("Quando ativado, handleRange é tratado como fator multiplicador do raio do background (ex: 1.0 = 100%). Se falso, é valor fixo em pixels.")]
        [SerializeField] private bool relativeHandleRange = false;
        [SerializeField] private float deadZone = 0.05f;

        private RectTransform baseRect;
        private Canvas canvas;
        private Vector2 fixedPosition = Vector2.zero;
        private Vector2 rawInputVector = Vector2.zero;
        private Vector2 processedInputVector = Vector2.zero;
        private bool isPressed;

        public Vector2 InputDirection => processedInputVector;
        public float Horizontal => processedInputVector.x;
        public float Vertical => processedInputVector.y;
        public bool IsPressed => isPressed;
        public JoystickMode CurrentMode => joystickMode;
        public AxisOptions CurrentAxisOption => axisOptions;
        public bool SnapX => snapX;
        public bool SnapY => snapY;

        public event Action<Vector2> OnDirectionChanged;

        private void Awake()
        {
            baseRect = GetComponent<RectTransform>();
            canvas = GetComponentInParent<Canvas>();

            if (background == null && transform.Find("Background") != null)
            {
                background = transform.Find("Background").GetComponent<RectTransform>();
            }

            if (background != null && handle == null && background.Find("Handle") != null)
            {
                handle = background.Find("Handle").GetComponent<RectTransform>();
            }

            ConfigureAnchors();

            if (background != null)
            {
                fixedPosition = background.anchoredPosition;
            }
        }

        private void Start()
        {
            if (canvas == null)
            {
                canvas = GetComponentInParent<Canvas>();
            }

            ConfigureAnchors();

            if (handle != null)
            {
                handle.anchoredPosition = Vector2.zero;
            }

            SetMode(joystickMode);
        }

        public void ConfigureAnchors()
        {
            Vector2 center = new Vector2(0.5f, 0.5f);
            if (background != null)
            {
                background.pivot = center;
            }

            if (handle != null)
            {
                handle.anchorMin = center;
                handle.anchorMax = center;
                handle.pivot = center;
            }
        }

        private void OnValidate()
        {
            deadZone = Mathf.Max(0f, deadZone);
            handleRange = Mathf.Max(0.01f, handleRange);
            moveThreshold = Mathf.Max(0.01f, moveThreshold);
            ConfigureAnchors();
        }

        public void SetMode(JoystickMode mode)
        {
            joystickMode = mode;

            if (background == null) return;

            if (joystickMode == JoystickMode.Fixed)
            {
                background.anchoredPosition = fixedPosition != Vector2.zero ? fixedPosition : new Vector2(220f, 220f);
                background.gameObject.SetActive(true);
            }
            else
            {
                background.gameObject.SetActive(false);
            }
        }

        public void CycleMode()
        {
            int nextMode = ((int)joystickMode + 1) % 3;
            SetMode((JoystickMode)nextMode);
        }

        public void SetAxisOptions(AxisOptions newAxisOptions)
        {
            axisOptions = newAxisOptions;
        }

        public void SetSnapping(bool newSnapX, bool newSnapY)
        {
            snapX = newSnapX;
            snapY = newSnapY;
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            isPressed = true;

            if (background != null && joystickMode != JoystickMode.Fixed)
            {
                background.anchoredPosition = ScreenPointToAnchoredPosition(eventData.position);
                background.gameObject.SetActive(true);
            }

            OnDrag(eventData);
        }

        public void OnDrag(PointerEventData eventData)
        {
            if (background == null) return;

            Camera cam = (canvas != null && canvas.renderMode == RenderMode.ScreenSpaceCamera) ? canvas.worldCamera : null;
            Vector2 position = RectTransformUtility.WorldToScreenPoint(cam, background.position);
            float scale = (canvas != null && canvas.scaleFactor > 0.001f) ? canvas.scaleFactor : 1f;
            Vector2 radius = background.sizeDelta * 0.5f;

            if (radius.x < 1f || radius.y < 1f)
            {
                radius = new Vector2(handleRange, handleRange);
            }

            Vector2 rawInput = (eventData.position - position) / (radius * scale);
            float magnitude = rawInput.magnitude;

            if (magnitude > deadZone)
            {
                if (magnitude > 1f)
                {
                    if (joystickMode == JoystickMode.Dynamic && magnitude > moveThreshold)
                    {
                        Vector2 diff = rawInput.normalized * (magnitude - moveThreshold) * radius;
                        background.anchoredPosition += diff;
                    }

                    rawInputVector = rawInput.normalized;
                }
                else
                {
                    rawInputVector = rawInput;
                }
            }
            else
            {
                rawInputVector = Vector2.zero;
            }

            // 1. Restrição de Eixos
            Vector2 formatted = FormatInput(rawInputVector);

            // 2. Aplicação de Snapping Direcional
            float snapFinalX = snapX ? SnapFloat(formatted.x, AxisOptions.Horizontal, formatted) : formatted.x;
            float snapFinalY = snapY ? SnapFloat(formatted.y, AxisOptions.Vertical, formatted) : formatted.y;

            processedInputVector = new Vector2(snapFinalX, snapFinalY);

            // 3. Posicionamento visual da manopla (Handle)
            if (handle != null)
            {
                float effectiveRange = relativeHandleRange ? (radius.x * handleRange) : handleRange;
                handle.anchoredPosition = new Vector2(
                    rawInputVector.x * effectiveRange,
                    rawInputVector.y * effectiveRange);
            }

            OnDirectionChanged?.Invoke(processedInputVector);
        }

        private Vector2 FormatInput(Vector2 input)
        {
            if (axisOptions == AxisOptions.Horizontal)
            {
                return new Vector2(input.x, 0f);
            }
            if (axisOptions == AxisOptions.Vertical)
            {
                return new Vector2(0f, input.y);
            }
            return input;
        }

        private float SnapFloat(float value, AxisOptions snapAxis, Vector2 fullInput)
        {
            if (Mathf.Abs(value) < 0.0001f)
            {
                return 0f;
            }

            if (axisOptions == AxisOptions.Both)
            {
                float angle = Vector2.Angle(fullInput, Vector2.up);
                if (snapAxis == AxisOptions.Horizontal)
                {
                    if (angle < 22.5f || angle > 157.5f)
                        return 0f;
                    return (value > 0f) ? 1f : -1f;
                }
                else if (snapAxis == AxisOptions.Vertical)
                {
                    if (angle > 67.5f && angle < 112.5f)
                        return 0f;
                    return (value > 0f) ? 1f : -1f;
                }
                return value;
            }
            else
            {
                if (value > 0f) return 1f;
                if (value < 0f) return -1f;
            }

            return 0f;
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            isPressed = false;
            rawInputVector = Vector2.zero;
            processedInputVector = Vector2.zero;

            if (handle != null)
            {
                handle.anchoredPosition = Vector2.zero;
            }

            if (background != null && joystickMode != JoystickMode.Fixed)
            {
                background.gameObject.SetActive(false);
            }

            OnDirectionChanged?.Invoke(Vector2.zero);
        }

        private void OnDisable()
        {
            isPressed = false;
            rawInputVector = Vector2.zero;
            processedInputVector = Vector2.zero;

            if (handle != null)
            {
                handle.anchoredPosition = Vector2.zero;
            }

            if (background != null && joystickMode != JoystickMode.Fixed)
            {
                background.gameObject.SetActive(false);
            }
        }

        private Vector2 ScreenPointToAnchoredPosition(Vector2 screenPosition)
        {
            Camera cam = (canvas != null && canvas.renderMode == RenderMode.ScreenSpaceCamera) ? canvas.worldCamera : null;
            RectTransform targetRect = baseRect != null ? baseRect : (transform as RectTransform);

            if (targetRect != null && RectTransformUtility.ScreenPointToLocalPointInRectangle(targetRect, screenPosition, cam, out Vector2 localPoint))
            {
                Vector2 pivotOffset = targetRect.pivot * targetRect.sizeDelta;
                return localPoint - (background.anchorMax * targetRect.sizeDelta) + pivotOffset;
            }

            return screenPosition;
        }
    }
}
