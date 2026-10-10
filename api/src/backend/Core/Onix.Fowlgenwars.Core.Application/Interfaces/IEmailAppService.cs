using Onix.Fowlgenwars.Core.Application.ViewModels;
using System.Threading.Tasks;

namespace Onix.Fowlgenwars.Core.Application.Interfaces
{
    public interface IEmailAppService
    {
        Task<bool> EnviarEmailAsync(EmailViewModel emailViewModel);
        Task<bool> EnviarEmailConfirmacaoAsync(EmailConfirmacaoViewModel emailConfirmacaoViewModel);
        Task<bool> EnviarEmailRedefinicaoSenhaAsync(EmailRedefinicaoSenhaViewModel emailRedefinicaoSenhaViewModel);
    }
}
