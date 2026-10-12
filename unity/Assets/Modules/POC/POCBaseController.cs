using UnityEngine;

namespace FowlgenWars.POC
{
    public abstract class POCBaseController : MonoBehaviour
    {
        [SerializeField] protected POCScreenUI screenUI;

        protected virtual void Start()
        {
            if (screenUI == null)
                screenUI = POCScreenUI.EnsureOn(gameObject);

            InitializeScreen();
        }

        protected abstract void InitializeScreen();

        protected void Log(string message)
        {
            if (screenUI != null)
                screenUI.AppendLog(message);
            else
                Debug.Log("[Fowlgen Wars] " + message);
        }
    }
}
