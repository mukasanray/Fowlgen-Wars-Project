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

        var blockhash = await Web3.Rpc.GetLatestBlockHashAsync();
        var tx = new Transaction
        {
            FeePayer = wallet.Account.PublicKey,
            Instructions = new System.Collections.Generic.List<TransactionInstruction> { incrementIx },
            RecentBlockHash = blockhash.Result.Value.Blockhash
        };

        var res = await wallet.SignAndSendTransaction(tx);
        
        if (res.WasSuccessful)
            Debug.Log($"Vitória! Explorer: https://explorer.solana.com/tx/{res.Result}?cluster=devnet");
        else
            Debug.LogError($"Erro na TX: {res.Reason}");
    }
}
