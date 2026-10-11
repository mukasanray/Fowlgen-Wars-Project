using UnityEngine;

namespace FowlgenWars.POC
{
    public class POC01Controller : POCBaseController
    {
        protected override void InitializeScreen()
        {
            screenUI.Configure(
                "POC 01 / ESTRUTURA BASE UNITY",
                new[] { "Unity", "Plataforma", "Cena", "Produto" },
                new[]
                {
                    Application.unityVersion,
                    Application.platform.ToString(),
                    gameObject.scene.name,
                    Application.productName
                });

            screenUI.AddButton("TESTAR UNITY", TestFoundation);
            Log("Cena do Unity carregada. Verificação base concluída.");
        }

        void TestFoundation()
        {
            screenUI.SetRow(0, Application.unityVersion);
            screenUI.SetRow(1, Application.platform.ToString());
            screenUI.ShowToast("? Teste Base do Unity Executado com Sucesso!", Color.green);
            Log("POC 01 OK: Modo Play, Canvas e botões estão operando corretamente.");
        }
    }
}
