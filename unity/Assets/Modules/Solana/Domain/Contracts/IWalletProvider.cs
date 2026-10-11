using System;
using System.Threading.Tasks;

namespace FowlgenWars.Modules.Solana.Domain.Contracts
{
    /// <summary>
    /// Contrato para serviços de carteira Solana (Phantom, MWA ou Keypair local).
    /// Isola as dependências do SDK do restante da aplicação.
    /// </summary>
    public interface IWalletProvider
    {
        string PublicKey { get; }
        bool IsConnected { get; }
        double BalanceSol { get; }

        event Action<bool, string> OnConnectionStatusChanged;
        event Action<double> OnBalanceUpdated;

        void Connect(Action<bool, string> onComplete = null);
        void Disconnect();
        Task<double> RefreshBalanceAsync();
        Task<byte[]> SignMessageAsync(byte[] messageBytes);
    }
}
