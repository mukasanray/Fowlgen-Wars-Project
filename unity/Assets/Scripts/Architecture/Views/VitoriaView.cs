using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FowlgenWars.Architecture.Views
{
    public sealed class VitoriaView : MonoBehaviour
    {
        public event Action ContinueClicked;

        private void Awake()
        {
            UIDocument document = GetComponent<UIDocument>();
            if (document == null)
                document = gameObject.AddComponent<UIDocument>();
            document.visualTreeAsset = Resources.Load<VisualTreeAsset>("UI/Vitoria");
            if (document.panelSettings == null)
                document.panelSettings = ScriptableObject.CreateInstance<PanelSettings>();
            Button button = document.rootVisualElement.Q<Button>("continue-button");
            if (button != null)
                button.clicked += () => ContinueClicked?.Invoke();
        }

        public void SetStatus(string message)
        {
        }
    }
}
