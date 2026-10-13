using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FowlgenWars.Architecture.Views
{
    public sealed class AuthView : ScreenViewBase
    {
        public event Action ConnectClicked;
        public event Action QuickPlayClicked;
        private Label status;

        protected override void Awake()
        {
            SetResources("UI/Auth", "UI/Auth");
            base.Awake();



            BindUI();
        }

        private void Start()
        {
            if (status == null)
            {
                BindUI();
            }
        }

        private void BindUI()
        {
            if (Root == null) return;

            status = Root.Q<Label>("login-status");
            var button = Root.Q<Button>("connect-button");
            if (button != null)
            {
                button.clicked -= OnConnectClick;
                button.clicked += OnConnectClick;
            }

            var quickButton = Root.Q<Button>("quick-play-button");
            if (quickButton != null)
            {
                quickButton.clicked -= OnQuickPlayClick;
                quickButton.clicked += OnQuickPlayClick;
            }
        }

        private void OnConnectClick() => ConnectClicked?.Invoke();
        private void OnQuickPlayClick() => QuickPlayClicked?.Invoke();

        public override void SetStatus(string message)
        {
            if (status != null)
                status.text = message ?? string.Empty;
        }
    }
}
