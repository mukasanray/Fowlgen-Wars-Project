using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;
using FowlgenWars.Architecture.Views;

namespace FowlgenWars.Architecture.Presenters
{
    [RequireComponent(typeof(VitoriaView))]
    public sealed class VitoriaPresenter : MonoBehaviour
    {
        private VitoriaView view;
        private bool isProcessingReward;

        private void Awake()
        {
            view = GetComponent<VitoriaView>();
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
            view?.SetStatus("Recompensa resgatada com sucesso! +120 XP e Tokens creditados.");
            yield return new WaitForSeconds(1.2f);
            SceneManager.LoadScene("Play");
        }
    }
}
