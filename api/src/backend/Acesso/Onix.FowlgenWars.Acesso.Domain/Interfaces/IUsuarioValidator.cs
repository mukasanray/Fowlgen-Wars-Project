using System.Threading.Tasks;
using Onix.FowlgenWars.Acesso.Domain.Entities;

namespace Onix.FowlgenWars.Acesso.Domain.Interfaces
{
    public interface IUsuarioValidator
    {
        Task<bool> IsValid(Usuario usuario);
    }
}
