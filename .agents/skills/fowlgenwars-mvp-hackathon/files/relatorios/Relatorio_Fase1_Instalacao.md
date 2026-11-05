# Relatório de Inicialização e Setup: Fase 1 (WSL)

**Data da Execução:** 08/10/2026
**Responsável:** Agente (DevCore / Marcos)
**Status:** Concluído com Sucesso

## 1. Instalação e Configuração da Infraestrutura (Docker no WSL)
- O Docker Engine foi validado e instalado no subsistema WSL. (Versão identificada: `29.1.3`).
- O grupo local de permissões do docker foi ativado pelo usuário na sessão host, resolvendo as barreiras de `permission denied`.
- O arquivo de manifesto `docker-compose.yml` foi gerado na raiz do repositório configurando nativamente o banco de dados **PostgreSQL 15** exposto na porta `5432`, com mapeamento para um volume persistente.
- A diretiva de versão obsoleta do `docker-compose.yml` foi erradicada, otimizando o *build* e removendo advertências de compilação.
- **Resultado:** O container `fowlgen_db` foi instanciado e encontra-se ativo.

## 2. Fundação da Autenticação Off-Chain (Scripts FishNet/Solana Unity SDK)
Os ativos iniciais exigidos pelo documento de planejamento da Sprint MVP (`Fase1-Planejamento-WSL.md`) foram construídos para suportar validação *gas-less* baseada em *Nonce*:

### 2.1 Servidor (`ServerAuthManager.cs`)
- Criado o componente base que herda de `NetworkBehaviour`.
- Adicionado o método gerador de *Nonce* único (`Guid.NewGuid`).
- Importado o namespace de segurança criptográfica `Chaos.NaCl` proveniente da SDK Unity da Solana.
- Implementado o método de checagem matemática assíncrona `Ed25519.Verify`, responsável por decodificar a assinatura criptográfica Ed25519 do cliente.
- Previsto, via lógica controlada, o hook do banco de dados (ex: `INSERT INTO players`) ao confirmar a validação.

### 2.2 Cliente (`ClientAuthManager.cs`)
- Criado o roteador base cliente que lida com o SDK Web3 e se comunica com o FishNet.
- A função de gatilho `RequestWalletSignature(string nonce)` foi convertida em assíncrona (`async`).
- Inserido o fluxo em bloco seguro (*try-catch*) chamando a função `Web3.Wallet.SignMessage(nonceBytes)`, levantando o prompt na carteira de escolha (Phantom/Solflare) conectada na Unity.
- Estruturado e aguardando testes de rede para o disparo do gatilho remoto RPC (`[ServerRpc]`) que fará o transporte da assinatura da Unity Client até a Unity Server.

## 3. Próximas Pautas Pendentes (Roadmap Equipe Unity)
- Atrelar os novos scripts `.cs` aos Prefabs correspondentes da cena Multiplayer na Unity (Manager).
- Finalizar conexão nativa (Npgsql) entre o backend C# (FishNet) do WSL e o container PostgreSQL ativo (`fowlgen_db`).
- Sincronização do sistema com as diretrizes do roadmap do Hackathon de aprovação dos testes de colisão e áudio (QA Maria Clara).
