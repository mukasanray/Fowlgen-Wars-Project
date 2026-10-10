# Prompt de Execução: Colocar Servidor FishNet em Produção e Construção da API (Onix Framework)
**Responsável:** Marcos (Líder Técnico / Dev Core Unity & Web3)

Este documento define o plano estruturado em fases para realizar o deploy em nuvem (Produção) do servidor headless FishNet do projeto Fowlgen Wars, integrando a criação de uma API centralizada em .NET 9. Esta execução evolui a arquitetura atual para um ambiente escalável utilizando uma VPS, roteamento via Traefik (Proxy Reverso com SSL), um Domínio registrado e o ecossistema `Onix.Framework`.

Conforme recomendações de AppSec e boas práticas do ecossistema Solana, o servidor em produção deve manter a autoridade (Server-Authoritative) para validar métricas e assinar transações on-chain, prevenindo manipulações no cliente.

---

## Fase 1: Construção da API Central (.NET 9 com Onix.Framework)

**Objetivo:** Criar uma API robusta em ASP.NET Core para intermediar toda a comunicação entre o Site (Junior), o Game Server FishNet (Marcos) e o Banco de Dados (PostgreSQL), utilizando os padrões já estabelecidos pelo Líder Técnico.
- **1. Referência Arquitetural:** O projeto da API será baseado nos repositórios de referência estruturais de Marcos:
  - `https://github.com/marcospascoski/Onix.Framework` (Framework Base)
  - `https://github.com/marcospascoski/write-book-backend` (Referência de Implementação API)
- **2. Setup da API (.NET 9):** Inicializar um projeto Web API unificando a stack do backend (C#). A API será o **único ponto de contato** com o banco de dados PostgreSQL.
- **3. ORM e Modelagem (Entity Framework Core):** 
  - Utilizar o EF Core integrado ao padrão do `Onix.Framework` para criar as tabelas automaticamente no PostgreSQL (Migrations).
  - Modelo `Usuario`: `IdUsuario` (Guid), `Nickname` (String), `Email` (String), `WalletAddress` (String).
- **4. Endpoints REST (Comunicação Segura Web2 -> Web3):**
  - O Hub Web do Junior deixará de acessar o banco diretamente. Em vez disso, o site fará chamadas `POST /api/users` para registrar jogadores e carteiras Solana.
  - O Game Server FishNet fará chamadas `GET /api/users/{id}/wallet` via `HttpClient` para descobrir a carteira associada à conta logada e assinar as transações no Anchor de forma isolada e segura.
- **5. Deploy da API no Kubernetes:** Empacotar a API .NET em um container Docker e criar o Deployment/Service no Kubernetes, operando via Ingress Traefik.

## Fase 2: Preparação da Infraestrutura e Domínio (Cloud Setup)

**Objetivo:** Estabelecer o servidor físico/virtual e a rota de internet pública.
- **1. Provisionamento de VPS:** Contratar/Criar uma VPS com Linux (Ubuntu 24.04 recomendado) em um provedor de nuvem (AWS EC2, DigitalOcean, Hetzner, etc).
- **2. Setup do Kubernetes de Produção:** Ao invés do Minikube, instalar uma distribuição leve e pronta para produção como **K3s** (da Rancher) ou **MicroK8s** na VPS.
- **3. Configuração de DNS:** Registrar um domínio (ex: `play.fowlgenwars.com`) e configurar um apontamento Tipo A (A Record) no painel de DNS, direcionando o tráfego para o IP público da VPS.

## Fase 3: Configuração do Traefik (Ingress & SSL)

**Objetivo:** Receber o tráfego externo de forma segura e roteá-lo para os Pods internos da API e do FishNet.
- **1. Instalação do Traefik:** Implantar o Traefik como *Ingress Controller* no cluster K3s/MicroK8s.
- **2. Criação do IngressRoute (TCP/UDP e HTTP):** 
  - Regras para a API HTTP (`/api`) usando o Traefik.
  - Regras para o FishNet (`IngressRouteUDP`/TCP) direcionando conexões da porta 7770 para o Service `fishnet-server-service`.
- **3. Certificados TLS (Let's Encrypt):** Configurar o Traefik para provisionar e renovar automaticamente certificados SSL/TLS para o domínio (Segurança WSS e HTTPS).

## Fase 4: Registro de Imagem e Adaptação dos Manifestos K8s

**Objetivo:** Evoluir a lógica de build local da imagem docker.
- **1. Container Registry:** Alterar o processo de build do FishNet e da API para realizar o push das imagens para um registro de containers remoto (GHCR ou Docker Hub).
- **2. Atualização dos Manifestos:** Alterar os arquivos YAML para puxar as imagens remotamente e substituir dependências de `NodePort` estático pelo roteamento gerenciado pelo Ingress Traefik.
- **3. Storage Class (PVC):** Garantir que o manifesto de banco de dados (`postgres-pvc.yaml`) utilize a *StorageClass* adequada da VPS para persistência segura.

## Fase 5: Atualização do Install.sh e CI/CD

**Objetivo:** Automatizar a gestão da produção a partir da máquina local/repositório.
- **1. Novo Módulo no Install.sh:** Adicionar a Opção `[10] Deploy em Produção (VPS/Nuvem)` no menu principal.
- **2. Comandos de Operação Remota:** Configurar o script para aplicar manifestos usando `kubectl` remoto.
- **3. Injeção de Segredos:** Assegurar que o banco de dados, chaves JWT da API e as chaves de autoridade da carteira (`id.json`) da Solana operem estritamente via Kubernetes Secrets.

## Fase 6: Validação Híbrida e Segurança On-Chain (Solana)

**Objetivo:** Garantir a autoridade do servidor antes da comunicação com a Blockchain.
- **1. Validação de Conexão:** Testar a API e o Unity Client via Domínio em rede 4G.
- **2. Server-Authoritative Logic:** Reforçar que apenas o FishNet Server pode disparar assinaturas de fim de partida no contrato Anchor, consultando a carteira do usuário de forma segura através da API em `Onix.Framework`.
