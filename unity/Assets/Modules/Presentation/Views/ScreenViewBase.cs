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

            // Garante dimensões completas (flexGrow = 1, width = 100%, height = 100%) no Root e contêineres filhos
            if (Root != null)
            {
                Root.style.flexGrow = 1;
                Root.style.width = Length.Percent(100);
                Root.style.height = Length.Percent(100);

                foreach (var child in Root.Children())
                {
                    child.style.flexGrow = 1;
                    child.style.width = Length.Percent(100);
                    child.style.height = Length.Percent(100);

                    // Garante que o elemento .screen dentro do template também tenha dimensões completas
                    foreach (var grandChild in child.Children())
                    {
                        if (grandChild.ClassListContains("screen"))
                        {
                            grandChild.style.flexGrow = 1;
                            grandChild.style.width = Length.Percent(100);
                            grandChild.style.height = Length.Percent(100);
                        }
                    }
                }
            }

            StyleSheet styles = Resources.Load<StyleSheet>(styleResource);
            if (styles != null && Root != null && !Root.styleSheets.Contains(styles))
                Root.styleSheets.Add(styles);

            Debug.Log($"[UI] {GetType().Name} inicializado com sucesso. Elementos: {Root?.childCount}");
        }

        public abstract void SetStatus(string message);
    }
}
