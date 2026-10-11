using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FowlgenWars.Architecture.Views
{
    public sealed class PlayView : ScreenViewBase
    {
        public event Action PlayClicked;
        public event Action AirdropClicked;
        public event Action DisconnectClicked;

        private Label walletAddressLabel;
        private Label walletBalanceLabel;
        private Label statusLabel;
        private Button airdropBtn;

        protected override void Awake()
        {
            SetResources("UI/Play", "UI/Play");
            base.Awake();

            var bgTexture = Resources.Load<Texture2D>("Image/Play") ?? Resources.Load<Texture2D>("Image/play");
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

            airdropBtn = Root?.Q<Button>("airdrop-button");
            if (airdropBtn != null)
            {
                airdropBtn.clicked += () => AirdropClicked?.Invoke();
            }

            var disconnectBtn = Root?.Q<Button>("disconnect-button");
            if (disconnectBtn != null)
            {
                disconnectBtn.clicked += () => DisconnectClicked?.Invoke();
            }
        }

        public void SetAirdropEnabled(bool enabled)
        {
            if (airdropBtn != null)
            {
                airdropBtn.SetEnabled(enabled);
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
