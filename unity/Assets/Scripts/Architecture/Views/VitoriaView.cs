using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FowlgenWars.Architecture.Views
{
    public sealed class VitoriaView : ScreenViewBase
    {
        public event Action RewardClicked;
        private Label statusLabel;
        private Label rewardDetailsLabel;

        protected override void Awake()
        {
            SetResources("UI/Vitoria", "UI/Vitoria");
            base.Awake();

            statusLabel = Root?.Q<Label>("victory-status");
            rewardDetailsLabel = Root?.Q<Label>("reward-details");

            var rewardBtn = Root?.Q<Button>("reward-button");
            if (rewardBtn != null)
            {
                rewardBtn.clicked += () => RewardClicked?.Invoke();
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
