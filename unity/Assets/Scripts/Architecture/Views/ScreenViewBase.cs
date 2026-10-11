using UnityEngine;
using UnityEngine.UIElements;
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
            Document = GetComponent<UIDocument>();
            if (Document == null)
                Document = gameObject.AddComponent<UIDocument>();

            VisualTreeAsset layout = Resources.Load<VisualTreeAsset>(layoutResource);
            if (layout == null)
            {
                Debug.LogError($"[UI] Layout não encontrado: {layoutResource}");
                return;
            }

            Document.visualTreeAsset = layout;
            if (Document.panelSettings == null)
            {
                var defaultSettings = Resources.Load<PanelSettings>("UI/PanelSettings");
                Document.panelSettings = defaultSettings != null 
                    ? defaultSettings 
                    : ScriptableObject.CreateInstance<PanelSettings>();
            }

            StyleSheet styles = Resources.Load<StyleSheet>(styleResource);
            if (styles != null)
                Root.styleSheets.Add(styles);
        }

        public abstract void SetStatus(string message);
    }
}
