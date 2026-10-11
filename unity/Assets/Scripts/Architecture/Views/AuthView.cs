using System;
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
            status = Root.Q<Label>("login-status");
            Root.Q<Button>("connect-button").clicked += () => ConnectClicked?.Invoke();
        }

        public override void SetStatus(string message)
        {
            if (status != null)
                status.text = message ?? string.Empty;
        }
    }
}
