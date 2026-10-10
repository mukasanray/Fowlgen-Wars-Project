using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace  Onix.FowlgenWars.WebApi.Config
{
    public static class DbContextConfig
    {
        public static IServiceCollection AddDbContextConfiguration(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            Onix.Fowlgenwars.Sistema.Infra.IoC.NativeInjectorBootStrapper.AddDbContext(services, connectionString);
            Onix.FowlgenWars.Acesso.Infra.IoC.NativeInjectorBootStrapper.AddDbContext(services, connectionString);

            return services;
        }
    }
}
