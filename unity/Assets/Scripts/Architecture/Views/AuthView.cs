using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FowlgenWars.Architecture.Views
{
    public sealed class AuthView : ScreenViewBase
    {
        public event Action ConnectClicked;
        private Label status;

        protected override void Awake()
        {
            SetResources("UI/Auth", "UI/Auth");
            base.Awake();

            var bgTexture = Resources.Load<Texture2D>("Image/login");
            if (bgTexture != null && Root != null)
            {
                Root.style.backgroundImage = new StyleBackground(bgTexture);
            }

            status = Root?.Q<Label>("login-status");
            var button = Root?.Q<Button>("connect-button");
            if (button != null)
            {
                button.clicked += () => ConnectClicked?.Invoke();
            }
        }

        public override void SetStatus(string message)
        {
            if (status != null)
                status.text = message ?? string.Empty;
        }
    }
}
