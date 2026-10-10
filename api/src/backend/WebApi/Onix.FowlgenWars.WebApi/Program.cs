using  Onix.FowlgenWars.WebApi.Config;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiConfiguration();
builder.Services.AddSwaggerConfiguration();
builder.Services.AddDbContextConfiguration(builder.Configuration);

var app = builder.Build();

// Automatically run EF Core Migrations
using (var scope = app.Services.CreateScope())
{
    var scopedServices = scope.ServiceProvider;
    try
    {
        var context = scopedServices.GetRequiredService<Onix.FowlgenWars.Acesso.Infra.Data.Context.AcessosDbContext>();
        context.Database.Migrate();
    }
    catch (System.Exception ex)
    {
        var logger = scopedServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocorreu um erro ao aplicar as migrations do banco de dados.");
    }
}

app.UseSwaggerConfiguration();
app.UseApiConfiguration(app.Environment);

app.Run();
