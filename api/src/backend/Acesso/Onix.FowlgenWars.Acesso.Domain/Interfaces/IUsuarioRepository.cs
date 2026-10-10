using System;
using System.Threading.Tasks;
using  Onix.FowlgenWars.Acesso.Domain.Entities;

namespace  Onix.FowlgenWars.Acesso.Domain.Interfaces
{
    public interface IUsuarioRepository
    {
        Task Cadastrar(Usuario usuario);
        Task<Usuario> PesquisarPorIdAsync(Guid id);
        Task<Usuario> PesquisarPorWalletAsync(string walletAddress);
    }
}
