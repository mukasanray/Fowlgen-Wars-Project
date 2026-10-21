using System;
using UnityEngine;
using UnityEngine.EventSystems;
using FowlgenWars.Modules.MobileControls.Domain.Contracts;

namespace FowlgenWars.Modules.MobileControls.Presentation.Views
{
    /// <summary>
    /// Componente de Joystick Virtual Touch (Canvas / UGUI) de alta performance para mobile landscape.
    /// Suporta modos Fixed, Floating e Dynamic.
    /// Implementa IJoystickInput e IPointerHandlers com zero alocações no Update.
    /// </summary>
    public class VirtualJoystickView : MonoBehaviour, IJoystickInput, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        [Header("Modo de Operação")]
        [SerializeField] private JoystickMode joystickMode = JoystickMode.Floating;
        [SerializeField] private float moveThreshold = 1.0f;

        [Header("Transformações UI")]
        [SerializeField] private RectTransform background;
        [SerializeField] private RectTransform handle;
        [SerializeField] private float handleRange = 75f;
        [SerializeField] private float deadZone = 0.05f;

        private RectTransform baseRect;
        private Canvas canvas;
        private Vector2 fixedPosition = Vector2.zero;
        private Vector2 inputVector = Vector2.zero;
        private bool isPressed;

        public Vector2 InputDirection => inputVector;
        public bool IsPressed => isPressed;
        public JoystickMode CurrentMode => joystickMode;

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

            if (handle != null)
            {
                handle.anchoredPosition = Vector2.zero;
            }

            SetMode(joystickMode);
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

                    inputVector = rawInput.normalized;
                }
                else
                {
                    inputVector = rawInput;
                }
            }
            else
            {
                inputVector = Vector2.zero;
            }

            if (handle != null)
            {
                handle.anchoredPosition = new Vector2(
                    inputVector.x * handleRange,
                    inputVector.y * handleRange);
            }

            OnDirectionChanged?.Invoke(inputVector);
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            isPressed = false;
            inputVector = Vector2.zero;

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
            inputVector = Vector2.zero;

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
