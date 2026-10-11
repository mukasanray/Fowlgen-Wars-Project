using UnityEngine;

namespace FowlgenWars.POC
{
    public class MainMenuController : POCBaseController
    {
        protected override void InitializeScreen()
        {
            screenUI.Configure(
                "MENU PRINCIPAL - TESTES POC",
                new[] { "Rede", "Objetivo", "Solana SDK", "Cena Atual" },
                new[] { "Devnet", "Validação das POCs 1 a 5", SolanaSdkStatus(), "MainMenu" });

            screenUI.AddButton("POC 01 - TESTE BASE UNITY", () => POCScreenUI.LoadPoc(POCSceneRoot.ScenePoc01));
            screenUI.AddButton("POC 02 - TESTAR REDE DEVNET", () => POCScreenUI.LoadPoc(POCSceneRoot.ScenePoc02));
            screenUI.AddButton("POC 03 - VERIFICAR IDL DO CONTRATO", () => POCScreenUI.LoadPoc(POCSceneRoot.ScenePoc03));
            screenUI.AddButton("POC 04 - LER CONTRATO DA CARTEIRA", () => POCScreenUI.LoadPoc(POCSceneRoot.ScenePoc04));
            screenUI.AddButton("POC 05 - ENVIAR TRANSAÇÃO DA CARTEIRA", () => POCScreenUI.LoadPoc(POCSceneRoot.ScenePoc05));

            Log("Selecione uma POC para testar as funcionalidades do jogo e do smart contract na Devnet.");
        }

        static string SolanaSdkStatus()
        {
            return FowlgenWars.Solana.SolanaSdkProbe.IsSdkAssemblyLoaded(out string detail)
                ? "INSTALADO"
                : "NÃO INSTALADO";
        }
    }
}

