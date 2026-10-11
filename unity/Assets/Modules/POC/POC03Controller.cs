using UnityEngine;
using FowlgenWars.Solana;

namespace FowlgenWars.POC
{
    public class POC03Controller : POCBaseController
    {
        protected override void InitializeScreen()
        {
            screenUI.Configure(
                "POC 03 / IDL DO SMART CONTRACT",
                new[] { "Arquivo IDL", "Nome do Contrato", "Program ID", "Instruções" },
                new[] { "-", "-", "-", "-" });

            screenUI.AddButton("VERIFICAR CONTRATO", VerifyIdl);
            VerifyIdl();
            Log("Verifies Anchor IDL in Assets/Resources/fowlgen_wars_contract.json.");
        }

        void VerifyIdl()
        {
            TextAsset idl = IdlInspector.LoadIdlAsset();
            if (idl == null)
            {
                screenUI.SetRow(0, "AUSENTE");
                screenUI.SetRow(1, "-");
                screenUI.SetRow(2, "-");
                screenUI.SetRow(3, "-");
                screenUI.ShowToast("❌ IDL do Contrato Não Encontrado!", Color.red);
                Log("IDL não encontrado. Esperado Assets/Resources/fowlgen_wars_contract.json.");
                return;
            }

            string json = idl.text;
            string address = IdlInspector.ReadAddress(json);
            string name = IdlInspector.ReadProgramName(json);
            string[] instructions = IdlInspector.ReadInstructionNames(json);

            screenUI.SetRow(0, idl.name + ".json");
            screenUI.SetRow(1, string.IsNullOrEmpty(name) ? "(nenhum)" : name);
            screenUI.SetRow(2, string.IsNullOrEmpty(address) ? "(nenhum)" : Truncate(address, 20));
            screenUI.SetRow(3, instructions.Length == 0 ? "(nenhuma)" : string.Join(", ", instructions));

            if (IdlInspector.IsPlaceholderProgramId(address))
            {
                screenUI.ShowToast("⚠️ IDL Carregado com Program ID Placeholder", Color.yellow);
                Log("IDL carregado. Program ID é um placeholder.");
            }
            else
            {
                screenUI.ShowToast("✅ IDL do Contrato Verificado!", Color.green);
                Log($"POC 03 SUCESSO: IDL '{idl.name}.json' verificado. Program ID: {address}, Instruções: {string.Join(", ", instructions)}");
            }
        }

        static string Truncate(string value, int keep)
        {
            if (string.IsNullOrEmpty(value) || value.Length <= keep)
                return value;
            return value.Substring(0, keep) + "…";
        }
    }
}

