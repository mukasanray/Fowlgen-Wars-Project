using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FowlgenWars.Architecture.Views
{
    public sealed class PlayView : ScreenViewBase
    {
        public event Action PlayClicked;

        private Label walletAddressLabel;
        private Label walletBalanceLabel;
        private Label statusLabel;

        protected override void Awake()
        {
            SetResources("UI/Play", "UI/Play");
            base.Awake();

            var bgTexture = Resources.Load<Texture2D>("Image/play");
            if (bgTexture != null && Root != null)
            {
                Root.style.backgroundImage = new StyleBackground(bgTexture);
            }

            walletAddressLabel = Root?.Q<Label>("wallet-address-label");
            walletBalanceLabel = Root?.Q<Label>("wallet-balance-label");
            statusLabel = Root?.Q<Label>("play-status");

            var playBtn = Root?.Q<Button>("play-button");
            if (playBtn != null)
            {
                playBtn.clicked += () => PlayClicked?.Invoke();
            }
        }

        public void UpdateWalletInfo(string formattedAddress, double solBalance)
        {
            if (walletAddressLabel != null)
            {
                walletAddressLabel.text = !string.IsNullOrEmpty(formattedAddress)
                    ? $"Carteira: {formattedAddress}"
                    : "Carteira: Conectada";
            }

            if (walletBalanceLabel != null)
            {
                walletBalanceLabel.text = $"Saldo: {solBalance:F3} SOL";
            }
        }

        public override void SetStatus(string message)
        {
            if (statusLabel != null)
                statusLabel.text = message ?? string.Empty;
        }
    }
}
