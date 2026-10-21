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



            BindUI();
        }

        private void Start()
        {
            if (playBtn == null)
            {
                BindUI();
            }
        }

        private Button playBtn;

        private void BindUI()
        {
            if (Root == null) return;

            walletAddressLabel = Root.Q<Label>("wallet-address-label");
            walletBalanceLabel = Root.Q<Label>("wallet-balance-label");
            statusLabel = Root.Q<Label>("play-status");

            playBtn = Root.Q<Button>("play-button");
            if (playBtn != null)
            {
                SetupInteractiveButton(playBtn, OnPlayClick);
            }

            airdropBtn = Root.Q<Button>("airdrop-button");
            if (airdropBtn != null)
            {
                SetupInteractiveButton(airdropBtn, OnAirdropClick);
            }

            var disconnectBtn = Root.Q<Button>("disconnect-button");
            if (disconnectBtn != null)
            {
                SetupInteractiveButton(disconnectBtn, OnDisconnectClick);
            }
        }

        private void OnPlayClick() => PlayClicked?.Invoke();
        private void OnAirdropClick() => AirdropClicked?.Invoke();
        private void OnDisconnectClick() => DisconnectClicked?.Invoke();

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
