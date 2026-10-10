using System.Threading.Tasks;

namespace Onix.FowlgenWars.Acesso.Domain.Interfaces
{
    public interface IAcessosUnitOfWork
    {
        Task<int> CommitAsync();
    }
}
