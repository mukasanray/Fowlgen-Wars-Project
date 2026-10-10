using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
// using Onix.Framework.Security.JwtConfig; // Needs to be added to framework or available
using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;

namespace  Onix.FowlgenWars.WebApi.Config
{
    public static class ApiConfig
    {
        public static IServiceCollection AddApiConfiguration(this IServiceCollection services)
        {
            // Dependencies Config
            Onix.Fowlgenwars.Core.Infra.IoC.NativeInjectorBootStrapper.AddConfiguration(services);
            Onix.Fowlgenwars.Sistema.Infra.IoC.NativeInjectorBootStrapper.AddConfiguration(services);

            // New Modules
            Onix.FowlgenWars.Acesso.Infra.IoC.NativeInjectorBootStrapper.AddConfiguration(services);
            // Controllers & Json
            services.AddLocalization();
            services
                .AddControllers()
                .AddJsonOptions(opts => opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));

            services.AddEndpointsApiExplorer();

            // Cors
            services.AddCors(options =>
            {
                options.AddPolicy("Total",
                    builder =>
                        builder
                            .AllowAnyOrigin()
                            .AllowAnyMethod()
                            .AllowAnyHeader());
            });

            // Authentication Policies (Optional: adapt as needed)
            var authorizationBuilder = services.AddAuthorizationBuilder();
            authorizationBuilder.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
            authorizationBuilder.AddPolicy("PlayerOnly", policy => policy.RequireRole("Player"));

            // JWT (Assuming Framework provides this extension)
            // services.AddJwtConfiguration();

            // AutoMapper
            services.AddAutoMapper(cfg => { }, AppDomain.CurrentDomain.GetAssemblies());

            return services;
        }

        public static IApplicationBuilder UseApiConfiguration(this IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors("Total");

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            return app;
        }
    }
}
