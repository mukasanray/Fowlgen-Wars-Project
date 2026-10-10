using Microsoft.Extensions.DependencyInjection;
using Onix.Framework.Notifications.Implementation;
using Onix.Framework.Notifications.Interfaces;
using Onix.Fowlgenwars.Core.Application.Interfaces;
using Onix.Fowlgenwars.Core.Application.Services;

namespace Onix.Fowlgenwars.Core.Infra.IoC
{
    public class NativeInjectorBootStrapper
    {
        public static void AddConfiguration(IServiceCollection services)
        {
            services.AddLocalization();
            services.AddScoped<INotificationContext, NotificationContext>();
            services.AddScoped<IEmailAppService, EmailAppService>();
        }
    }
}