using Microsoft.EntityFrameworkCore;
using Onix.Framework.Infra.Data.EFCore;
using  Onix.FowlgenWars.Acesso.Domain.Entities;
using  Onix.FowlgenWars.Acesso.Domain.Interfaces;
using  Onix.FowlgenWars.Acesso.Infra.Data.Context;
using System;
using System.Threading.Tasks;

namespace  Onix.FowlgenWars.Acesso.Infra.Data.Repositories
{
    public class UsuarioRepository(AcessosDbContext context) 
        : EFCoreRepository<Usuario>(context), IUsuarioRepository
    {
        public async Task Cadastrar(Usuario usuario)
        {
            await base.AddAsync<Usuario>(usuario);
        }

        public async Task<Usuario> PesquisarPorIdAsync(Guid id)
        {
            return await base.FindByIdAsync<Usuario, Guid>(id);
        }

        public async Task<Usuario> PesquisarPorWalletAsync(string walletAddress)
        {
            return await context.Set<Usuario>().FirstOrDefaultAsync(u => u.WalletAddress == walletAddress);
        }
    }
}
