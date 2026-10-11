using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.Architecture.Presenters
{
    [RequireComponent(typeof(DerrotaView))]
    public sealed class DerrotaPresenter : MonoBehaviour
    {
        private DerrotaView view;
        private bool isProcessingReward;

        private void Awake()
        {
            view = GetComponent<DerrotaView>();
        }

        private void OnEnable()
        {
            if (view != null)
                view.RewardClicked += HandleRewardClicked;
        }

        private void OnDisable()
        {
            if (view != null)
                view.RewardClicked -= HandleRewardClicked;
        }

        private void HandleRewardClicked()
        {
            if (isProcessingReward) return;
            isProcessingReward = true;

            StartCoroutine(ClaimRewardAndReturnRoutine());
        }

        private IEnumerator ClaimRewardAndReturnRoutine()
        {
            view?.SetStatus("Recompensa resgatada: +25 XP e +10 FOWL de consolação.");
            yield return new WaitForSeconds(1.2f);
            SceneManager.LoadScene("Play");
        }
    }
}
