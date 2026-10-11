using System;
using UnityEngine.UIElements;

namespace FowlgenWars.Architecture.Views
{
    public sealed class ArenaView : ScreenViewBase
    {
        public event Action BackClicked;

        protected override void Awake()
        {
            SetResources("UI/Arena", "UI/Arena");
            base.Awake();
            Root.Q<Button>("back-button").clicked += () => BackClicked?.Invoke();
        }

        public override void SetStatus(string message)
        {
        }
    }
}
