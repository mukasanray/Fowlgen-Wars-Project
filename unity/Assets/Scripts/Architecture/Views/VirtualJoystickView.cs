using UnityEngine;
using UnityEngine.EventSystems;

namespace FowlgenWars.Architecture.Views
{
    /// <summary>
    /// POC-UNI-01: Virtual Joystick otimizado para mobile touch em tela landscape.
    /// Zero alocação no Update para 60 FPS garantido no Android.
    /// </summary>
    public class VirtualJoystickView : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        [SerializeField] private RectTransform background;
        [SerializeField] private RectTransform handle;
        [SerializeField] private float handleRange = 75f;

        private Vector2 inputVector;

        public Vector2 InputDirection => inputVector;

        private void Start()
        {
            if (background == null) background = GetComponent<RectTransform>();
            if (handle != null) handle.anchoredPosition = Vector2.zero;
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            OnDrag(eventData);
        }

        public void OnDrag(PointerEventData eventData)
        {
            if (background == null) return;

            Vector2 position;
            if (RectTransformUtility.ScreenPointToLocalPointInRectangle(
                background,
                eventData.position,
                eventData.pressEventCamera,
                out position))
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
            }
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            inputVector = Vector2.zero;
            if (handle != null)
            {
                handle.anchoredPosition = Vector2.zero;
            }
        }
    }
}
