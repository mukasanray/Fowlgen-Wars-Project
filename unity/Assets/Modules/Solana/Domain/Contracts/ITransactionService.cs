using System;
using System.Threading.Tasks;

namespace FowlgenWars.Modules.Solana.Domain.Contracts
{
    /// <summary>
    /// Contrato para execução de transações e instruções Anchor on-chain.
    /// </summary>
    public interface ITransactionService
    {
        string ProgramId { get; }
        Task<string> SendInstructionAsync(string instructionName, object payload);
        Task<string> ClaimRewardAsync(string playerPubkey, int matchResult);
    }
}
