using System;
using System.Threading.Tasks;
using Onix.Fowlgenwars.Acesso.Application.ViewModels.Registrar;
using Onix.FowlgenWars.Acesso.Application.ViewModels;

namespace  Onix.FowlgenWars.Acesso.Application.Interfaces
{
    public interface IUsuarioAppService
    {
        Task<Guid> CadastrarAsync(RegistrarUsuarioViewModel model);
        Task<string> GetUserWalletAsync(Guid id);
        Task<string> LoginWalletAsync(LoginWalletViewModel model);
    }
}
