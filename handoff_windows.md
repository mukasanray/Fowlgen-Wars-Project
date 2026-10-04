# Handoff: Fowlgen Wars - Migração para Windows 11

Este documento contém o estado atual das nossas tarefas e os próximos passos. Quando você abrir o projeto no Windows 11, basta me pedir para ler este arquivo e poderemos continuar exatamente de onde paramos.

## 1. O que foi feito (Estado Atual)
- **Anchor (Web3):** Os testes em Rust (`initialize` e `increment`) foram aprovados via LiteSVM. O projeto foi compilado (`anchor build`) com sucesso no ambiente Ubuntu.
- **Integração:** O arquivo IDL gerado (`fowlgen_wars_contract.json`) foi copiado para a pasta `unity/Assets/IDL/`.
- **Unity (C#):** Geramos o código base para as **POC-NET-01** (FishNet) e **POC-INT-01/02** (Solana MWA). *Os arquivos de script não foram criados na Unity ainda para evitar erros de compilação, visto que o pacote do FishNet ainda não está instalado.*

## 2. Códigos Gerados (Para aplicar no Windows)

### `FishNetMultiplayer.cs` (Sincronização de Rede)
```csharp
using FishNet.Object;
using FishNet.Object.Synchronizing;
using UnityEngine;

public class FishNetMultiplayer : NetworkBehaviour
{
    [SyncVar] public int HostCoreHealth = 100;
    [SyncVar] public int ClientCoreHealth = 100;

    [ServerRpc(RequireOwnership = false)]
    public void CmdTakeDamage(bool isHostTarget, int damage)
    {
        if (isHostTarget) HostCoreHealth -= damage;
        else ClientCoreHealth -= damage;
        CheckWin();
    }

    private void CheckWin()
    {
        if (HostCoreHealth <= 0) RpcGameOver(false);
        else if (ClientCoreHealth <= 0) RpcGameOver(true);
    }

    [ObserversRpc]
    private void RpcGameOver(bool hostWon)
    {
        bool isWinner = (IsServer && hostWon) || (!IsServer && !hostWon);
        if (isWinner)
        {
            FindObjectOfType<SolanaReward>()?.ClaimVictory();
        }
    }
}
```

### `SolanaReward.cs` (Integração Phantom/MWA)
```csharp
using UnityEngine;
using Solana.Unity.Wallet;
using Solana.Unity.SDK;
using Solana.Unity.Rpc.Models;
using System.Text;

public class SolanaReward : MonoBehaviour
{
    private const string ProgramId = "81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE";

    public async void ClaimVictory()
    {
        var wallet = Web3.Wallet;
        if (wallet?.Account == null) return;

        PublicKey.TryFindProgramAddress(
            new[] { Encoding.UTF8.GetBytes("counter") },
            new PublicKey(ProgramId),
            out PublicKey counterPda,
            out byte bump);

        var incrementIx = new TransactionInstruction
        {
            ProgramId = new PublicKey(ProgramId),
            Keys = new[]
            {
                AccountMeta.Writable(counterPda, false),
                AccountMeta.Writable(wallet.Account.PublicKey, true)
            },
            Data = new byte[] { 0x0b, 0x0f, 0x5a, 0x5d, 0x1c, 0xc1, 0x3d, 0x3e } 
        };

        var blockhash = await Web3.Rpc.GetLatestBlockhashAsync();
        var tx = new Transaction
        {
            FeePayer = wallet.Account.PublicKey,
            Instructions = new[] { incrementIx },
            RecentBlockHash = blockhash.Result.Value.Blockhash
        };

        var res = await wallet.SignAndSendTransaction(tx);
        
        if (res.WasSuccessful)
            Debug.Log($"Vitória! Explorer: https://explorer.solana.com/tx/{res.Result}?cluster=devnet");
        else
            Debug.LogError($"Erro na TX: {res.Reason}");
    }
}
```

## 3. Próximos Passos (No Windows)

Quando o ambiente Windows 11 estiver configurado, inicie a nossa conversa dizendo:
> *"Leia o arquivo `handoff_windows.md` e vamos aplicar as POCs na Unity."*

As ações pendentes na Unity serão:
1. Instalar o pacote do FishNet (`com.firstgeargames.fishnet`) via Package Manager.
2. Adicionar fisicamente os arquivos C# acima na pasta `unity/Assets/Scripts/POC/`.
3. Anexar os scripts `FishNetMultiplayer` e `SolanaReward` à cena da POC (1v1) e configurar os botões para testar o fluxo.
