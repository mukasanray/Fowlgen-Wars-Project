# Fowlgen Wars - Etapas de Desenvolvimento MVP (Backend, On-Chain e Off-Chain)

**Data Limite:** 10 de Outubro de 2026 (Meta Interna Hackathon)
**Responsáveis Principais:** 
- **Marcos:** Líder Técnico, Unity Core, FishNet Headless, Desenvolvimento do `install.sh` e Integração Docker.
- **Jorge:** DevSecOps, Automação CI/CD, Infraestrutura Anchor, AppSec e Google Play Console.

---

## Fase 1 - Autenticação Off-Chain e Banco de Dados
**Objetivo:** Suportar a Tela de Login do jogo.

1. **Setup de Banco de Dados Off-Chain (Responsável: Marcos):**
   - Configurar o banco relacional (ex: PostgreSQL) para as credenciais/nicknames.
2. **Integração FishNet + Database (Responsável: Marcos):**
   - O Servidor validará as requisições de Login enviadas pela Unity.

---

## Fase 2 - On-Chain (Smart Contract Anchor na Solana)
**Objetivo:** Contrato inteligente validando a economia.

1. **Desenvolvimento do Contrato `program/` (Responsáveis: Marcos e Jorge):**
   - Lógica Anchor para registro Web3 e recompensas.
2. **Testes Locais Anchor (Responsável: Jorge):**
   - Garantir que a lógica passe com `cargo test` verde localmente usando LiteSVM.
3. **Integração IDL Temporária (Responsável: Marcos):**
   - Exportar o arquivo `.json` do IDL gerado localmente para que o Marcos já possa construir as leituras na Unity.

---

## Fase 3 - Off-Chain (Servidor Dedicado FishNet)
**Objetivo:** Hospedar a autoridade da partida via Docker.

1. **Script de Instalação `install.sh` (Responsável: Marcos):**
   - Automação de dependências (Rust, Anchor, Docker).
2. **Criação do Dockerfile e FishNet (Responsável: Marcos):**
   - Empacotar a build *Headless* (Linux) da Unity e expor UDP/WebSockets.
3. **Autoridade do Servidor (Responsável: Marcos):**
   - O Servidor FishNet controla mecânicas anti-cheat.

---

## Fase 4 - Infraestrutura e Orquestração (Kubernetes/Minikube)
**Objetivo:** Migrar servidor do jogo e banco de dados do Docker Compose para orquestração escalável.

1. **Deploy Kubernetes (Responsável: Marcos e Jorge):**
   - Criação de manifestos K8s (Deployments, Services, Persistent Volumes) para FishNet e PostgreSQL.
   - Injeção segura de credenciais através de K8s Secrets pelo `Install.sh`.
   - Remoção de hardcodes de banco de dados.

---

## Fase 5 - Deploys Finais (Anchor Devnet e Google Play Console)
**Objetivo:** Fechar o ciclo enviando tudo para a "nuvem" e validando segurança.

1. **DevSecOps e Anti-Leak AppSec (Responsável: Jorge):**
   - Scanner Gitleaks para garantir que as *Chaves Privadas* e *Seed Phrases* necessárias para o Deploy não vazem no repositório.
   - Manter o CI/CD rodando.
2. **Deploy do Anchor na Devnet (Responsáveis: Marcos e Jorge):**
   - Executar o comando final de Deploy na blockchain Solana (Devnet). Atualizar definitivamente o `Program ID` na Unity. Ambos acompanham para checar as transações.
3. **Deploy Android Oficial (Responsável: Jorge):**
   - Assumir a conta de desenvolvedor na Google Play.
   - Configurar a trilha de Teste Interno efetuando o upload do arquivo **`.aab` (Android App Bundle)** assinado.

---

## Próximas Tarefas — API Backend para o Site (Responsável: Marcos)
- [ ] **3.1** Implementação no módulo Core e Acesso dos Value Objects (`Senha` e `Salt` com hashing criptográfico seguro PBKDF2/SHA512 e validações de domínio).
- [ ] **3.2** Modelagem das entidades de domínio de Acesso: `Perfil` com as seeds de produção oficiais (`Admin`, `Staff`, `Moderador`, `Suporte`, `Player`), `Permissao`, `PerfilPermissao` e relacionamento com `Usuario`.
- [ ] **3.3** Implementação de persistência EF Core (mapeamentos Fluent API, `DbSet` no `AcessosDbContext` e migrations).
- [ ] **3.4** Desenvolvimento do CRUD completo com paginação (`pageIndex`, `pageSize`) e alteração de status para `Usuario` (`GET`, `POST`, `PUT`, `PATCH /status`, `DELETE`).
- [ ] **3.5** Desenvolvimento dos endpoints CRUD paginados e gestão de status para `Perfil` e `Permissao` (`PerfisController` e `PermissoesController`).
- [ ] **3.6** Criação do `SupportersController.cs` com catálogo completo para o site: `GET /api/supporters` (mural público), `GET /api/supporters/admin` (auditoria), `GET /api/supporters/{id}`, `POST /api/supporters` (registro de apoio), `PUT /api/supporters/{id}` (atualização cadastral), `PATCH /api/supporters/{id}/status` (moderação de status: Pendente, Aprovado, Oculto) e `DELETE /api/supporters/{id}`.
- [ ] **3.7** Configuração de segurança RBAC por Roles/Policies (`AdminOnly`, `StaffOnly`, `ModOnly`, `PlayerOnly`) no `ApiConfig.cs`, endpoints de autenticação corporativa e Web3 (`/api/auth`), Swagger unificado e endpoint `GET /api/health`.

