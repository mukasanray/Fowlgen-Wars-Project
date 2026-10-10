# Ambiente de Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /build_env

# Copia toda a pasta api (incluindo o submódulo Onix.Framework e o código DDD)
COPY . .

# Restaura dependências e compila a WebApi
WORKDIR /build_env/src/backend/WebApi/Onix.FowlgenWars.WebApi
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Ambiente de Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Onix.FowlgenWars.WebApi.dll"]
