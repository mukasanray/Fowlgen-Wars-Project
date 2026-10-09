# Usa uma imagem base do Ubuntu para rodar a Unity em modo Headless
FROM ubuntu:22.04

# Instala dependências básicas do sistema que a engine da Unity pode precisar
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libx11-6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Cria o diretório de trabalho do servidor
WORKDIR /app

# Copia os binários compilados da Unity para dentro do container
# [IMPORTANTE] O Marcos deverá configurar o Build Settings da Unity para exportar 
# o projeto Linux (Server Build ativado) dentro da pasta 'build/LinuxServer/' do repositório.
COPY build/LinuxServer/ /app/

# Dá permissão de execução ao binário (Ajuste o nome do arquivo se sua build tiver outro nome)
RUN chmod +x ./FowlgenWarsServer.x86_64

# Expõe as portas do FishNet (Padrão Tugboat: 7770 UDP. Se for WebGL, use as portas de WebSocket)
EXPOSE 7770/udp
EXPOSE 7770/tcp

# Inicia o binário forçando o modo headless e batchmode
CMD ["./FowlgenWarsServer.x86_64", "-batchmode", "-nographics"]
