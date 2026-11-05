# 🐔 Fowlgen Wars — Relatório de Alinhamento Técnico & Auditoria de Entrega
## Status Consolidado de Tarefas: Concluído vs. Pendente — Junior (Web) & Marcos (Backend API)

> **Projeto:** Fowlgen Wars (G5B Studios)  
> **Data de Atualização:** 21 de Outubro de 2026 (Pós-auditoria dos commits `d2e84dd` e `063d607`)  
> **Frente Site Oficial:** Junior (Dev Web & Documentação)  
> **Frente Backend / API:** Marcos (Líder Técnico & Arquiteto .NET)  
> **Referências Canônicas:** [`portal-web-hub-app/tasks.md`](../../../openspec/changes/portal-web-hub-app/tasks.md), [`Fowlgen-Wars-Etapas-MVP-Web.md`](../../skills/mvp/Fowlgen-Wars-Etapas-MVP-Web.md) e [`Fowlgen-Wars-Etapas-MVP-Backend.md`](../../skills/mvp/Fowlgen-Wars-Etapas-MVP-Backend.md)  
> **Arquivo PDF Diagramado:** [`prompt/files/pdf/Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.pdf`](../pdf/Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.pdf)

---

## 1. Quadro Resumo Executivo (Status do Portal & API)

| Integrante | Frente de Atuação | Tarefas Concluídas | Tarefas Pendentes | Status Atual | Próximo Marco Crítico |
|---|---|:---:|:---:|:---:|---|
| **Junior** | Site Oficial Público (`app/`) | **18 Tarefas** (100% da vitrine, facções, fauna e mocks) | **8 Tarefas** (Chaveamento `.env`, desacoplamento e homologação real) | ⚡ Em Progresso (Mock Operacional) | Implementar flag `VITE_USE_API` e aguardar API |
| **Marcos** | API REST Backend (`api/`) | **Especificação & DTOs** (Arquitetura DDD, rotas e RBAC definidos) | **8 Tarefas** (Trilha 3: persistência EF Core, controllers, auth e rewards) | ⚡ Em Progresso (Modelagem Pronta) | Subir endpoints reais da API .NET 9 |

---

## 2. Detalhamento da Frente do Junior (Dev Web)

### ✅ O Que Está CONCLUÍDO pelo Junior:
* [x] **Tarefa 2.1:** Vitrine do MVP com botões de download do APK Android vinculados ao Itch.io.
* [x] **Tarefa 2.2:** Container responsivo 16:9 (`aspect-video`) preparado para embutir o jogo Unity 6 WebGL com botão de launch da demo.
* [x] **Tarefa 2.3:** Validação cruzada dos textos, termos técnicos e prompts do site contra as definições canônicas de `Claude.md`.
* [x] **Tarefa 2.4:** Rodapé oficial atualizado com links para as redes da comunidade (Discord, X, Telegram e Itch.io).
* [x] **Tarefa 2.5:** Organização do acervo de referências conceituais e READMEs históricos em `prompt/files/referencias/`.
* [x] **Tarefa 2.6 (Refatoração):** Eliminação completa do `prompt()` nativo; modal real de autenticação na UI conectado à estrutura da API.
* [x] **Tarefa 2.7 (Refatoração):** Autenticação Web3 integrada à carteira Solana (Phantom/Solflare via `window.solana`), disparo de assinatura `signMessage` e emissão de JWT simulado.
* [x] **Tarefa 2.8 (Refatoração):** Modelagem de dados alinhada aos DTOs oficiais da API (.NET 9), operando formalmente com `id_usuario` (Guid), `nickname_jogo`, `email`, `wallet_address`, `status` e atualização cadastral.
* [x] **Tarefa 2.9 (Refatoração):** Reestruturação visual com design editorial dark de alta fidelidade, animações GSAP ScrollTrigger (zoom de banner hero, scroll reveals), tipografia harmônica e micro-interações táteis.
* [x] **Tarefa 2.10:** Seção **"Apoie-nos"** com seleção interativa dos 3 Tiers (Escudeiro, Cavaleiro e Patrono) e formulário de contribuição.
* [x] **Tarefa 2.11:** Seção **"Apoiadores"** com mural público dinâmico consumindo feed de apoiadores e fallback offline gracioso (`FALLBACK_SUPPORTERS`).
* [x] **Tarefa 2.12:** Atualização de links de navegação na Navbar e no Footer direcionando para `#apoiadores` e `#apoie-nos`.
* [x] **Tarefa 2.13:** Componente de paginação no client HTTP do site (`pageIndex`, `pageSize = 4`, botões Anterior/Próxima e indicador de páginas).
* [x] **Tarefa 2.14:** Badges visuais de status da conta do jogador no cabeçalho (`Ativo` em verde, `Inativo` em âmbar, `Bloqueado` em vermelho).
* [x] **Tarefa 2.15 (Inovação):** **Seção de Juramento de Facções (Reino vs Império):** Criação dos estandartes visuais (`bandeira-imperio.png` e `bandeira-reino.png`), apresentação temática da *Ordem Imperial da Luz Suprema* e do *Reino Obscuro do Caos Arcano*, e seleção interativa com persistência em `localStorage`.
* [x] **Tarefa 2.16 (Inovação):** **Seção de Conscientização & Fauna Brasileira Ameaçada:** Criação e integração dos assets da Arara-Azul (`arara-azul.png`) e Mico-Leão-Dourado (`mico-leao.png`), estruturando cards de heróis com classes e compromisso ecológico contra o tráfico de animais silvestres.
* [x] **Tarefa 2.17 (Inovação):** **Vitrine da Loja Oficial & Micro-Recompensas Anti-P2W:** Seção `#loja` com mocks visuais de Baú Real Pós-Partida (mérito exclusivo de combate), colecionáveis físicos e cosméticos oficiais sem vantagem competitiva.
* [x] **Tarefa 2.18 (Inovação):** **Monitor Reativo de Integridade da API (`GET /api/health`):** Ping contínuo de status exibindo badge no cabeçalho ("API Online" / "G5B Studios Fallback").

### ⏳ O Que Está PENDENTE para o Junior (Trilha 4):
* [ ] **Tarefa 4.1:** **Implementação da Flag Booleana no `.env`:** Criar controle estrito onde `VITE_USE_API=true` conecta na API real e `VITE_USE_API=false` roda 100% mockado offline; criar template `app/.env.example` documentado.
* [ ] **Tarefa 4.2:** **Desacoplamento Arquitetural:** Plugar os arquivos criados [`apiService.ts`](../../app/src/services/apiService.ts) e [`AuthModal.tsx`](../../app/src/components/AuthModal.tsx) diretamente no [`App.tsx`](../../app/src/App.tsx), eliminando fetches inline e formulários redundantes.
* [ ] **Tarefa 4.3:** **Correção de Tipagens TypeScript e Build Limpo:** Criar `app/src/vite-env.d.ts`, tipar eventos estritamente em formulários e garantir execução de `npm run build` sem erros de compilação.
* [ ] **Tarefa 4.4:** **Homologação Cadastro Real:** Conectar formulário a `POST /api/users` real, gravando no PostgreSQL da API e recebendo o Guid oficial.
* [ ] **Tarefa 4.5:** **Homologação Login Web3 Real:** Conectar carteira Phantom/Solflare a `POST /api/auth/login-web3` real e armazenar JWT oficial da API.
* [ ] **Tarefa 4.6:** **Homologação Perfil & Recompensas Reais:** Validar consulta de perfil (`GET /api/users/{id}`), atualização cadastral (`PUT /api/users/{id}`) e conectar o mock visual de micro-recompensas (Ouro, Diamantes, Baús e XP) ao endpoint real `GET /api/users/{id}/rewards` quando `VITE_USE_API=true`.
* [ ] **Tarefa 4.7:** **Homologação Mural de Apoiadores Real:** Conectar mural a `POST /api/supporters` e `GET /api/supporters` reais com paginação e moderação de status (`Aprovado`).
* [ ] **Tarefa 4.8:** **Teste de Resiliência:** Garantir que quando `VITE_USE_API=true`, caso a API oscile, o site ative fallback gracioso sem quebrar a navegação.

---

## 3. Detalhamento da Frente do Marcos (Líder Técnico & Arquiteto API)

### ✅ O Que Está CONCLUÍDO pelo Marcos:
* [x] **Arquitetura da API REST:** Estruturação da solução em ASP.NET Core (.NET 9) com arquitetura limpa / DDD e Onix.Framework em `api/src/backend/`.
* [x] **Catálogo Oficial de Endpoints:** Mapeamento completo dos contratos de entrada e saída (DTOs) para suporte ao portal web do Junior.
* [x] **Mapeamento de Perfis de Acesso (RBAC):** Definição das 5 roles canônicas (`Admin`, `Staff`, `Moderador`, `Suporte`, `Player`).
* [x] **Planejamento de Persistência:** Estrutura de banco PostgreSQL, tabelas de usuários, perfis, apoiadores e integração com Docker / K8s.

### ⏳ O Que Está PENDENTE para o Marcos (Trilha 3 — 8 Tarefas):
* [ ] **Tarefa 3.1:** Implementação no módulo `Core` e `Acesso` dos Value Objects (`Senha` e `Salt` com hashing criptográfico seguro PBKDF2/SHA512 e validações de domínio).
* [ ] **Tarefa 3.2:** Modelagem das entidades de domínio de Acesso: `Perfil` com as seeds de produção oficiais (`Admin`, `Staff`, `Moderador`, `Suporte`, `Player`), `Permissao`, `PerfilPermissao` e relacionamento com `Usuario`.
* [ ] **Tarefa 3.3:** Implementação de persistência EF Core (mapeamentos Fluent API, `DbSet` no `AcessosDbContext` e migrations do banco).
* [ ] **Tarefa 3.4:** Desenvolvimento do CRUD completo com paginação (`pageIndex`, `pageSize`) e alteração de status para `Usuario` (`GET`, `POST`, `PUT`, `PATCH /status`, `DELETE`).
* [ ] **Tarefa 3.5:** Desenvolvimento dos endpoints CRUD paginados e gestão de status para `Perfil` e `Permissao` (`PerfisController` e `PermissoesController`).
* [ ] **Tarefa 3.6:** Criação do `SupportersController.cs` com catálogo completo para o site: `GET /api/supporters` (mural público), `GET /api/supporters/admin` (auditoria), `GET /api/supporters/{id}`, `POST /api/supporters` (registro de apoio), `PUT /api/supporters/{id}` (atualização cadastral), `PATCH /api/supporters/{id}/status` (moderação de status) e `DELETE /api/supporters/{id}`.
* [ ] **Tarefa 3.7:** Configuração de segurança RBAC por Roles/Policies (`AdminOnly`, `StaffOnly`, `ModOnly`, `PlayerOnly`) no `ApiConfig.cs`, endpoints de autenticação corporativa e Web3 (`/api/auth`), Swagger unificado e endpoint `GET /api/health`.
* [ ] **Tarefa 3.8:** Modelagem de inventário e endpoint de recompensas do jogador: criar endpoint `GET /api/users/{id}/rewards` (ou incluir no DTO de `GET /api/users/{id}`) retornando saldo de micro-recompensas (Ouro, Diamantes, Baús conquistados e progresso de XP) para alimentar o perfil do jogador no site.

---

## 4. Regra de Chaveamento Mock ↔ API Real (`app/.env`)

O Junior deve disponibilizar a configuração no `app/.env`:
```env
# app/.env
VITE_API_URL=http://localhost:5000
VITE_USE_API=false   # false = Modo Mock Local (Offline) | true = Modo API Real (.NET 9)
```

1. **Modo Mock (`VITE_USE_API=false`):** Utilizado para desenvolvimento ágil da interface e demonstrações locais. Não dispara requisições externas e usa os dados mockados de apoiadores e jogadores.
2. **Modo Produção Real (`VITE_USE_API=true`):** Utilizado quando o Marcos subir a API localmente ou em homologação. Todas as requisições fluem para a API .NET 9 e gravam dados reais no banco PostgreSQL.

---

## 5. Catálogo Resumido de Endpoints da API REST (.NET 9) Consumidos pelo Site

| Método & Rota | Controller | Acesso RBAC | Payload / Parâmetros | Finalidade no Site Oficial | Status Atual |
|---|---|---|---|---|:---:|
| `POST /api/users` | `UsersController` | Público | Body: `{ email, nickname, password }` | Cadastro inicial no modal de autenticação | Mock ✓ (Aguardando API) |
| `GET /api/users/{id}` | `UsersController` | Autenticado / Owner | Path: `id` (Guid) | Sincronização de perfil e badge de status | Mock ✓ (Aguardando API) |
| `PUT /api/users/{id}` | `UsersController` | Owner / Admin | Body: `{ nickname, avatarUrl }` | Atualização cadastral no modal de perfil | Mock ✓ (Aguardando API) |
| `POST /api/auth/login-web3` | `AuthController` | Público | Body: `{ walletAddress, signature, msg }` | Autenticação Phantom/Solflare e emissão de JWT | Mock ✓ (Aguardando API) |
| `GET /api/supporters` | `SupportersController` | Público | Query: `pageIndex`, `pageSize` | Feed paginado do Mural Público de Apoiadores | Mock ✓ (Aguardando API) |
| `POST /api/supporters` | `SupportersController` | Público / User | Body: `{ nickname, wallet, tier, tx, msg }` | Envio de registro no formulário "Apoie-nos" | Mock ✓ (Aguardando API) |
| `GET /api/users/{id}/rewards` | `UsersController` | Autenticado / Owner | Path: `id` (Guid) | Saldo de micro-recompensas (Ouro, Diamante, Baú, XP) | Mock ✓ (Aguardando API) |
| `GET /api/health` | `HealthController` | Público | N/A | Verificação online e badge dinâmico no Navbar | Ping Ativo ✓ |

