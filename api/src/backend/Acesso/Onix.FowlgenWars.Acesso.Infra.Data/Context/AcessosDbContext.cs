using Microsoft.EntityFrameworkCore;
using Onix.Framework.Infra.Data.EFCore;
using Onix.FowlgenWars.Acesso.Domain.Entities;

namespace Onix.FowlgenWars.Acesso.Infra.Data.Context
{
    public class AcessosDbContext(DbContextOptions<AcessosDbContext> options) : BaseDbContext(options)
    {
        public DbSet<Usuario> Usuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureDefaultTypes(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AcessosDbContext).Assembly);
        }
    }
}
