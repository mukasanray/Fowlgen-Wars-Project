using System;
using UnityEngine.UIElements;

namespace FowlgenWars.Architecture.Views
{
    public sealed class PlayView : ScreenViewBase
    {
        public event Action PlayClicked;

        protected override void Awake()
        {
            SetResources("UI/Play", "UI/Play");
            base.Awake();
            Root.Q<Button>("play-button").clicked += () => PlayClicked?.Invoke();
        }

        public override void SetStatus(string message)
        {
        }
    }
}
