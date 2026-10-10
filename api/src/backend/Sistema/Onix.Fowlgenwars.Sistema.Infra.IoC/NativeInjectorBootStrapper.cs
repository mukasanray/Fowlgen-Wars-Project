using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Onix.Framework.Domain.Interfaces;
using Onix.Fowlgenwars.Sistema.Domain.Interfaces;
using Onix.Fowlgenwars.Sistema.Infra.Data.Context;
using Onix.Fowlgenwars.Sistema.Infra.Data.Repositories;
using Onix.Fowlgenwars.Sistema.Infra.Data.UnitOfWork;
using Onix.Fowlgenwars.Sistema.Domain.DomainServices;
using System;

namespace Onix.Fowlgenwars.Sistema.Infra.IoC
{
    public class NativeInjectorBootStrapper
    {
        public static void AddDbContext(IServiceCollection services, string connectionString)
        {
            services.AddDbContext<SistemaDbContext>(options =>
            {
                options.UseNpgsql(connectionString);
            });
        }

        public static void AddConfiguration(IServiceCollection services)
        {
            services.AddScoped<ISistemaUnitOfWork, SistemaUnitOfWork>();
            services.AddScoped<IExceptionLogRepository, ExceptionLogRepository>();
            services.AddScoped<IExceptionProcessor, ExceptionProcessor>();
            services.AddScoped<SistemaDbContext>();
        }
    }
}