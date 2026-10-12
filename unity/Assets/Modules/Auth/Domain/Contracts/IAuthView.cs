using System;

namespace FowlgenWars.Modules.Auth.Domain.Contracts
{
    /// <summary>
    /// Contrato da camada visual (Passive View) da tela de Login / Auth.
    /// </summary>
    public interface IAuthView
    {
        event Action OnConnectClicked;
        void SetStatus(string message);
        void SetLoading(bool isLoading);
    }
}
