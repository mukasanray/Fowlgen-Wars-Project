using UnityEngine;
using FowlgenWars.Solana;

namespace FowlgenWars.POC
{
    public class POCSceneRoot : MonoBehaviour
    {
        public const string SceneMenu = "MainMenu";
        public const string ScenePoc01 = "POC_01_ProjectFoundation";
        public const string ScenePoc02 = "POC_02_SolanaDevnet";
        public const string ScenePoc03 = "POC_03_AnchorWorkspace";
        public const string ScenePoc04 = "POC_04_UnityAnchor";
        public const string ScenePoc05 = "POC_05_WalletTransaction";

        public enum Kind
        {
            MainMenu = 0,
            ProjectFoundation = 1,
            SolanaDevnet = 2,
            AnchorWorkspace = 3,
            UnityAnchor = 4,
            WalletTransaction = 5
        }

        [SerializeField] Kind kind;

        public Kind SceneKind
        {
            get => kind;
            set => kind = value;
        }

        void Awake()
        {
            SolanaRuntime.EnsureExists();
            POCScreenUI.EnsureOn(gameObject);
            AttachController();
        }

        void AttachController()
        {
            switch (kind)
            {
                case Kind.MainMenu:
                    AddIfMissing<MainMenuController>();
                    break;
                case Kind.ProjectFoundation:
                    AddIfMissing<POC01Controller>();
                    break;
                case Kind.SolanaDevnet:
                    AddIfMissing<POC02Controller>();
                    break;
                case Kind.AnchorWorkspace:
                    AddIfMissing<POC03Controller>();
                    break;
                case Kind.UnityAnchor:
                    AddIfMissing<POC04Controller>();
                    break;
                case Kind.WalletTransaction:
                    AddIfMissing<POC05Controller>();
                    break;
            }
        }

        void AddIfMissing<T>() where T : MonoBehaviour
        {
            if (GetComponent<T>() == null)
                gameObject.AddComponent<T>();
        }
    }
}
