# Relatório de Execução: Fase 3 - Off-Chain (Servidor Dedicado FishNet)

**Data:** 08 de Outubro de 2026
**Responsável:** Marcos
**Status:** Concluído com Sucesso

---

## 1. Objetivo Atingido
A Fase 3 do documento `Fowlgen-Wars-Etapas-MVP-Backend.md` exigia a preparação do ecossistema de servidor para hospedar o FishNet e a autoridade da partida de forma independente (Headless), assegurando as mecânicas anti-cheat (validação no servidor).

A meta principal da fase foi alcançada através da automação da infraestrutura com Docker e expansão do Painel de Controle (`Install.sh`).

## 2. Componentes Desenvolvidos

### 2.1 Atualização do Instalador (`Install.sh`)
- **Dependência do Docker Incluída:** O fluxo principal `[1] Primeira Instalação` agora executa de maneira autônoma e unificada a instalação do motor Docker e o Docker Compose. 
- **Gestor Híbrido (`[9] Gerenciar Servidor FishNet`):** Criado um novo fluxo interativo exclusivo para a Fase 3, possibilitando:
  - Fazer Build da Imagem Docker (`docker-compose build`).
  - Ligar Servidor e Banco em background (`docker-compose up -d`).
  - Desligar tudo (`docker-compose down`).
  - Monitorar Logs C# / FishNet em tempo real.

### 2.2 Criação da Estrutura Docker
- **`Dockerfile`:** Criado na raiz do repositório para o Unity Headless. Ele parte de uma imagem leve `ubuntu:22.04`, carrega dependências visuais residuais requeridas pelo motor Unity, copia a futura exportação em `build/LinuxServer/`, torna o executável de servidor da Unity rodável e expõe a porta padrão UDP `7770`.
- **`docker-compose.yml` atualizado:** Incorporado o novo serviço `fowlgen_server`. O `fowlgen_server` obedece a hierarquia de `depends_on: postgres`, garantindo que não subirá sem que o banco de dados (da Fase 1) já esteja pronto para processar logins.

## 3. Integração Unity Headless (Servidor)
A arquitetura foi pensada para que o servidor rode em ambiente 100% livre da necessidade de renderizar UI. Para garantir que o FishNet seja compilado corretamente no Unity 6, o fluxo validado foi documentado abaixo:

### Passo a Passo para Gerar a Build de Servidor na Unity 6 (`6000.x`):
1. **Instalar Dependência (Unity Hub):** Certificar-se de que o módulo **Linux Dedicated Server Build Support** está instalado. (Opção de Scripting Backend IL2CPP deve estar disponível e configurada).
2. **Configurar Profile:** Abrir `File > Build Profiles` na Unity.
3. **Mudar Plataforma:** Selecionar o profile de servidor, definir `Platform` como **Dedicated Server** e `Target Platform` como **Linux**.
4. **Ativar o Profile:** Clicar no botão **"Switch Profile"** no canto inferior direito para tornar o Linux Server ativo.
5. **Ajustes Finais:** Garantir que o `Multiplayer Role` está definido como **Server** e que o *Scripting Backend* suportado (IL2CPP ou Mono para Linux x64) está instalado para evitar erros de compilação.
6. **Exportar:** Clicar em **Build**.
7. **Salvar no Local Correto:** Navegar até a raiz do projeto no WSL (`\\wsl$\Ubuntu\home\marco\fowlgenwars`), criar a pasta `build`, e dentro dela a pasta `LinuxServer`. Salvar o executável com o nome `FowlgenWarsServer`.

## 4. Próximos Passos
Toda a base técnica e de devops da Fase 3 foi entregue e a arquitetura Docker foi validada (já "up" no sistema local). 
As próximas ações diretas para o time (Marcos) consistem na parte de lógica de jogo:
1. Exportar a Build de "Dedicated Server" da Unity na pasta `build/LinuxServer/`.
2. Opcionalmente, começar a codificar as conexões e interações entre os arquivos C# (`ClientAuthManager.cs` e `ServerAuthManager.cs`) e testar usando a opção `[9]` do painel para validar a conexão multiplayer entre a Unity Client e o Container Docker.
