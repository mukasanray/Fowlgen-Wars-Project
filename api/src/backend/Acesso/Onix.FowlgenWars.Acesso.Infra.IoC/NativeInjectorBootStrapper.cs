using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Onix.FowlgenWars.Acesso.Application.Interfaces;
using Onix.FowlgenWars.Acesso.Application.Services;
using Onix.FowlgenWars.Acesso.Infra.Data.Context;
using Onix.Fowlgenwars.Acesso.Domain.Validators;
using Onix.FowlgenWars.Acesso.Domain.Interfaces;
using Onix.FowlgenWars.Acesso.Infra.Data.Repositories;
using Onix.FowlgenWars.Acesso.Infra.Data.UnitOfWork;

namespace  Onix.FowlgenWars.Acesso.Infra.IoC
{
    public static class NativeInjectorBootStrapper
    {
        public static void AddDbContext(IServiceCollection services, string connectionString)
        {
            services.AddDbContext<AcessosDbContext>(options =>
            {
                options.UseNpgsql(connectionString);
            });
        }
        public static void AddConfiguration(IServiceCollection services)
        {
            // HTTP Context
            services.AddHttpContextAccessor();

            // Application
            services.AddScoped<IUsuarioAppService, UsuarioAppService>();

            // Domain
            services.AddScoped<IUsuarioValidator, UsuarioValidator>();
            

            // Infra Data
            services.AddScoped<IUsuarioRepository, UsuarioRepository>();
            services.AddScoped<IAcessosUnitOfWork, AcessosUnitOfWork>();
        }
    }
}
