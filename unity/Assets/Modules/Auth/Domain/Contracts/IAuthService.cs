using System;

namespace FowlgenWars.Modules.Auth.Domain.Contracts
{
    /// <summary>
    /// Contrato para serviços de autenticação do jogador (Web3 + FishNet + WebApi).
    /// </summary>
    public interface IAuthService
    {
        string CurrentWalletAddress { get; }
        bool IsAuthenticated { get; }

        event Action<bool, string> OnAuthCompleted;

        void Login(Action<bool, string> callback = null);
    }
}
