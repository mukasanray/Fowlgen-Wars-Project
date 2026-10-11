using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FowlgenWars.Architecture.Views
{
    public sealed class DerrotaView : MonoBehaviour
    {
        public event Action RetryClicked;

        private void Awake()
        {
            UIDocument document = GetComponent<UIDocument>();
            if (document == null)
                document = gameObject.AddComponent<UIDocument>();
            document.visualTreeAsset = Resources.Load<VisualTreeAsset>("UI/Derrota");
            if (document.panelSettings == null)
                document.panelSettings = ScriptableObject.CreateInstance<PanelSettings>();
            Button button = document.rootVisualElement.Q<Button>("retry-button");
            if (button != null)
                button.clicked += () => RetryClicked?.Invoke();
        }

        public void SetStatus(string message)
        {
        }
    }
}
