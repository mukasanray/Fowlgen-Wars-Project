using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Onix.Fowlgenwars.Sistema.Infra.Data.Context;

namespace Onix.Fowlgenwars.Sistema.Test
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // Context Config
            ConfigureDbContext(services);
            // Dependencies Config
            Core.Infra.IoC.NativeInjectorBootStrapper.AddConfiguration(services);
            Infra.IoC.NativeInjectorBootStrapper.AddConfiguration(services);
        }

        private void ConfigureDbContext(IServiceCollection services)
        {
            services.AddDbContext<SistemaDbContext>(options =>
            {
                options.UseInMemoryDatabase("Onix.Fowlgenwars.Sistema");
            });
        }
    }
}
