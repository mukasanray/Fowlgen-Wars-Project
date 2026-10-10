using Microsoft.Extensions.DependencyInjection;
using Onix.Fowlgenwars.Core.Infra.IoC;

namespace Onix.Fowlgenwars.Core.Tests
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // Dependencies Config
            NativeInjectorBootStrapper.AddConfiguration(services);

            // Configure localization to use the Resources folder
            services.AddLocalization(options => options.ResourcesPath = "Resources");
        }
    }
}
