using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FowlgenWars.Architecture.Views
{
    public sealed class VitoriaView : ScreenViewBase
    {
        public event Action RewardClicked;
        public event Action ExplorerClicked;
        public event Action MenuClicked;

        private Label statusLabel;
        private Label rewardDetailsLabel;
        private Button rewardBtn;
        private Button explorerBtn;
        private Button menuBtn;

        protected override void Awake()
        {
            SetResources("UI/Vitoria", "UI/Vitoria");
            base.Awake();

            var bgTexture = Resources.Load<Texture2D>("Image/Vitoria");
            if (bgTexture != null && Root != null)
            {
                Root.style.backgroundImage = new StyleBackground(bgTexture);
            }

            statusLabel = Root?.Q<Label>("victory-status");
            rewardDetailsLabel = Root?.Q<Label>("reward-details");

            rewardBtn = Root?.Q<Button>("reward-button");
            if (rewardBtn != null)
            {
                rewardBtn.clicked += () => RewardClicked?.Invoke();
            }

            explorerBtn = Root?.Q<Button>("explorer-button");
            if (explorerBtn != null)
            {
                explorerBtn.style.display = DisplayStyle.None;
                explorerBtn.clicked += () => ExplorerClicked?.Invoke();
            }

            menuBtn = Root?.Q<Button>("menu-button");
            if (menuBtn != null)
            {
                menuBtn.clicked += () => MenuClicked?.Invoke();
            }
        }

        public void SetRewardButtonEnabled(bool enabled)
        {
            if (rewardBtn != null)
            {
                rewardBtn.SetEnabled(enabled);
            }
        }

        public void ShowExplorerButton(bool visible)
        {
            if (explorerBtn != null)
            {
                explorerBtn.style.display = visible ? DisplayStyle.Flex : DisplayStyle.None;
            }
        }

        public void SetRewardDetails(string details)
        {
            if (rewardDetailsLabel != null && !string.IsNullOrEmpty(details))
            {
                rewardDetailsLabel.text = details;
            }
        }

        public override void SetStatus(string message)
        {
            if (statusLabel != null)
                statusLabel.text = message ?? string.Empty;
        }
    }
}
