using UnityEngine;
using UnityEngine.UIElements;
using UnityEngine.EventSystems;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem.UI;
#endif
using FowlgenWars.Architecture.Contracts;

namespace FowlgenWars.Architecture.Views
{
    public abstract class ScreenViewBase : MonoBehaviour, IScreenView
    {
        private string layoutResource;
        private string styleResource;

        protected UIDocument Document { get; private set; }
        protected VisualElement Root => Document.rootVisualElement;

        protected void SetResources(string layout, string style)
        {
            layoutResource = layout;
            styleResource = style;
        }

        protected virtual void Awake()
        {
            EnsureEventSystem();

            Document = GetComponent<UIDocument>();
            if (Document == null)
                Document = gameObject.AddComponent<UIDocument>();

            if (Document.panelSettings == null)
            {
                var defaultSettings = Resources.Load<PanelSettings>("UI/PanelSettings");
                Document.panelSettings = defaultSettings != null 
                    ? defaultSettings 
                    : ScriptableObject.CreateInstance<PanelSettings>();
            }

            VisualTreeAsset layout = Resources.Load<VisualTreeAsset>(layoutResource);
            if (layout == null)
            {
                Debug.LogError($"[UI] Layout não encontrado: {layoutResource}");
                return;
            }

            if (Document.visualTreeAsset == null)
            {
                Document.visualTreeAsset = layout;
            }

            // Se o UIDocument não instanciou o layout automaticamente, clona no Root
            if (Root != null && Root.childCount == 0)
            {
                layout.CloneTree(Root);
            }

            StyleSheet styles = Resources.Load<StyleSheet>(styleResource);
            if (styles != null && Root != null && !Root.styleSheets.Contains(styles))
                Root.styleSheets.Add(styles);

            Debug.Log($"[UI] {GetType().Name} inicializado com sucesso. Elementos: {Root?.childCount}");
        }

        public abstract void SetStatus(string message);

#if ENABLE_INPUT_SYSTEM
        protected virtual void Update()
        {
            if (UnityEngine.InputSystem.Mouse.current != null && !UnityEngine.InputSystem.Mouse.current.enabled)
            {
                UnityEngine.InputSystem.InputSystem.EnableDevice(UnityEngine.InputSystem.Mouse.current);
            }
        }
#endif

        protected void SetupInteractiveButton(Button button, System.Action onClick)
        {
            if (button == null) return;

            float lastClick = 0f;
            void TriggerClick()
            {
                if (Time.unscaledTime - lastClick < 0.35f) return;
                lastClick = Time.unscaledTime;
                onClick?.Invoke();
            }

            button.clicked -= TriggerClick;
            button.clicked += TriggerClick;

            button.RegisterCallback<ClickEvent>(evt =>
            {
                TriggerClick();
                evt.StopPropagation();
            });

            button.RegisterCallback<PointerUpEvent>(evt =>
            {
                button.RemoveFromClassList("active-pressed");
                if (evt.button == 0)
                {
                    TriggerClick();
                }
            });

            button.RegisterCallback<PointerEnterEvent>(evt => button.AddToClassList("hovered"));
            button.RegisterCallback<PointerLeaveEvent>(evt =>
            {
                button.RemoveFromClassList("hovered");
                button.RemoveFromClassList("active-pressed");
            });

            button.RegisterCallback<PointerDownEvent>(evt =>
            {
                if (evt.button == 0)
                {
                    button.AddToClassList("active-pressed");
                }
            });
        }

        private static void EnsureEventSystem()
        {
            if (FindAnyObjectByType<EventSystem>() != null)
                return;

            var esGo = new GameObject("EventSystem");
            esGo.AddComponent<EventSystem>();

#if ENABLE_INPUT_SYSTEM
            var inputModule = esGo.AddComponent<InputSystemUIInputModule>();
#if UNITY_EDITOR
            var actions = UnityEditor.AssetDatabase.LoadAssetAtPath<UnityEngine.InputSystem.InputActionAsset>("Assets/InputSystem_Actions.inputactions");
            if (actions != null)
                inputModule.actionsAsset = actions;
            else
                inputModule.AssignDefaultActions();
#else
            inputModule.AssignDefaultActions();
#endif
#else
            esGo.AddComponent<StandaloneInputModule>();
#endif
        }
    }
}
