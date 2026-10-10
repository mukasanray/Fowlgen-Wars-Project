using Microsoft.EntityFrameworkCore;
using Onix.Framework.Infra.Data.EFCore;

namespace Onix.Fowlgenwars.Sistema.Infra.Data.Context
{
    public class SistemaDbContext(DbContextOptions<SistemaDbContext> options) : BaseDbContext(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(SistemaDbContext).Assembly);
        }
    }
}
