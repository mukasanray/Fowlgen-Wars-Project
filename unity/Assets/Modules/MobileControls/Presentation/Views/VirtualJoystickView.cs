using System;
using UnityEngine;
using UnityEngine.EventSystems;
using FowlgenWars.Modules.MobileControls.Domain.Contracts;

namespace FowlgenWars.Modules.MobileControls.Presentation.Views
{
    /// <summary>
    /// Componente de Joystick Virtual Touch (Canvas / UGUI) de alta performance para mobile landscape.
    /// Implementa IJoystickInput e IPointerHandlers sem alocações no Update.
    /// </summary>
    public class VirtualJoystickView : MonoBehaviour, IJoystickInput, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        [Header("Transformações UI")]
        [SerializeField] private RectTransform background;
        [SerializeField] private RectTransform handle;
        [SerializeField] private float handleRange = 75f;

        private Vector2 inputVector;
        private bool isPressed;

        public Vector2 InputDirection => inputVector;
        public bool IsPressed => isPressed;

        public event Action<Vector2> OnDirectionChanged;

        private void Start()
        {
            if (background == null) background = GetComponent<RectTransform>();
            if (handle != null) handle.anchoredPosition = Vector2.zero;
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            isPressed = true;
            OnDrag(eventData);
        }

        public void OnDrag(PointerEventData eventData)
        {
            if (background == null) return;

            if (RectTransformUtility.ScreenPointToLocalPointInRectangle(
                background,
                eventData.position,
                eventData.pressEventCamera,
                out Vector2 position))
            {
                position.x = (position.x / background.sizeDelta.x);
                position.y = (position.y / background.sizeDelta.y);

                inputVector = new Vector2(position.x * 2, position.y * 2);
                inputVector = (inputVector.magnitude > 1.0f) ? inputVector.normalized : inputVector;

                if (handle != null)
                {
                    handle.anchoredPosition = new Vector2(
                        inputVector.x * handleRange,
                        inputVector.y * handleRange);
                }

                OnDirectionChanged?.Invoke(inputVector);
            }
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            isPressed = false;
            inputVector = Vector2.zero;
            if (handle != null)
            {
                handle.anchoredPosition = Vector2.zero;
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
        }
    }
}
