# 🐔 Fowlgen Wars — Relatório de Alinhamento Técnico
## Alinhamento do Site Público (`app/`), API REST de Produção (.NET 9), Módulo de Apoiadores e Decisão Estratégica do Kanban

> **Projeto:** Fowlgen Wars (G5B Studios)  
> **Data:** 20 de Outubro de 2026  
> **Frente Site Público:** Junior (Dev Web & Documentação)  
> **Frente Backend / API:** Marcos (Líder Técnico & Arquiteto .NET)  
> **Governança:** OpenSpec (`openspec/changes/portal-web-hub-app/`) & Kanban Studio  
> **Arquivo PDF Oficial:** [`prompt/files/pdf/Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.pdf`](../pdf/Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.pdf)

---

## 1. Diretriz de Arquitetura & Decisão Estratégica do Kanban

1. **Site Oficial Público do Game (`app/` — Junior):** Vitrine oficial, download do APK Android, container do jogo Unity WebGL, autenticação Web3 (Solana Wallet Adapter), página "Apoie-nos" e mural público de apoiadores (`GET /api/supporters`).
2. **API REST Backend para o Site (`api/` — Marcos):** Arquitetura corporativa em .NET 9 / Onix.Framework com módulos `Core`, `Sistema` e `Acesso` (RBAC com 5 perfis), apoiadores comunitários (`/api/supporters`) e verificação de saúde (`GET /api/health`).
3. **Decisão sobre o Kanban (`kanban/`):**
   - O projeto Kanban será **desacoplado do repositório** no futuro para constituir um projeto independente voltado à gestão e visualização de múltiplos projetos.
   - **Por enquanto:** O Kanban é mantido exatamente como está hoje (ferramenta interna da equipe para acompanhamento das tasks OpenSpec e geração do dashboard via `npm run dashboard`).
   - Não serão misturadas telas de backoffice corporativo no Kanban agora, mantendo o foco total na entrega da **API para o site oficial**.

---

## 2. Princípio de Separação de Responsabilidades

| Camada | Escopo & Aplicação | Público-Alvo | Responsável |
|---|---|---|---|
| **Site Oficial Público (`app/`)** | Vitrine do jogo, download do APK, container Unity WebGL, páginas "Apoie-nos" e "Apoiadores" (mural público), conexão da carteira Solana. | Jogadores finais (`Player`), comunidade e visitantes | **Junior** |
| **API REST Backend (`api/`)** | Serviços de negócio em .NET 9, segurança RBAC (5 perfis), persistência EF Core / PostgreSQL, CRUD de apoiadores e endpoints para o site. | Consumida diretamente pelo Site Público e pelo Game | **Marcos** |
| **Kanban Interno (`kanban/`)** | Ferramenta interna de sincronização OpenSpec e painel dashboard mantida no formato atual (desacoplamento multi-projeto futuro). | Equipe técnica do projeto | **Marcos** |
| **Game Engine (`unity/`)** | Jogo 3D mobile / WebGL: combates na arena de 3 rotas, física de minions, multiplayer FishNet headless e Anchor. | Jogador executando o cliente do jogo | **Marcos** (& equipe) |

---

## 3. Catálogo Completo de Endpoints da API REST (.NET 9 / Onix.Framework)

Abaixo está o catálogo unificado de endpoints da API de produção desenvolvida pelo Marcos para suportar o ecossistema e o site oficial:

| Método & Rota | Módulo / Controller | Acesso (RBAC) | Payload / Parâmetros | Descrição & Finalidade |
|---|---|---|---|---|
| `GET /api/users` | Acesso / `UsersController` | `Staff`, `Admin` | Query: `pageIndex`, `pageSize`, `status`, `search` | Listagem paginada de usuários |
| `GET /api/users/{id}` | Acesso / `UsersController` | Owner / `Admin` | Path: `id` (Guid) | Detalhes do perfil do usuário por ID |
| `POST /api/users` | Acesso / `UsersController` | Público | Body: `{ email, nickname, password }` | Cadastro inicial de usuário/jogador no portal |
| `PUT /api/users/{id}` | Acesso / `UsersController` | Owner / `Admin` | Body: `{ nickname, avatarUrl }` | Atualização cadastral de dados |
| `PATCH /api/users/{id}/status` | Acesso / `UsersController` | `Moderador`, `Admin` | Body: `{ status, motivo }` | Alterar status: `Ativo`, `Inativo`, `Bloqueado` |
| `DELETE /api/users/{id}` | Acesso / `UsersController` | `Admin` | Path: `id` (Guid) | Exclusão lógica definitiva de usuário |
| `GET /api/users/{id}/wallet` | Acesso / `UsersController` | Server / `Admin` | Path: `id` (Guid) | Consulta de carteira associada para FishNet |
| `POST /api/auth/login-web3` | Acesso / `AuthController` | Público | Body: `{ walletAddress, signature, message }` | Login Web3 Solana (assinatura) e JWT |
| `POST /api/auth/login-institucional` | Acesso / `AuthController` | Público | Body: `{ email, password }` | Login corporativo institucional com Salt |
| `POST /api/auth/refresh-token` | Acesso / `AuthController` | Autenticado | Body: `{ refreshToken }` | Renovação do token JWT de sessão |
| `GET /api/perfis` | Acesso / `PerfisController` | `Staff`, `Admin` | Query: `pageIndex`, `pageSize` | Listagem paginada dos 5 perfis oficiais |
| `GET /api/perfis/{id}` | Acesso / `PerfisController` | `Staff`, `Admin` | Path: `id` (Guid) | Detalhes do perfil com suas permissões |
| `POST /api/perfis` | Acesso / `PerfisController` | `Admin` | Body: `{ nome, descricao }` | Criação de novo perfil de acesso |
| `PUT /api/perfis/{id}` | Acesso / `PerfisController` | `Admin` | Body: `{ nome, descricao }` | Atualização cadastral de perfil |
| `PATCH /api/perfis/{id}/status` | Acesso / `PerfisController` | `Admin` | Body: `{ ativo: boolean }` | Ativação ou desativação de perfil |
| `POST /api/perfis/{id}/permissoes` | Acesso / `PerfisController` | `Admin` | Body: `{ permissaoIds: Guid[] }` | Vincular conjunto de permissões ao perfil |
| `GET /api/permissoes` | Acesso / `PermissoesController` | `Staff`, `Admin` | Query: `pageIndex`, `pageSize`, `modulo` | Catálogo paginado de permissões por módulo |
| `GET /api/permissoes/{id}` | Acesso / `PermissoesController` | `Staff`, `Admin` | Path: `id` (Guid) | Detalhes da permissão técnica por ID |
| `POST /api/permissoes` | Acesso / `PermissoesController` | `Admin` | Body: `{ codigo, nome, modulo, desc }` | Cadastro de nova permissão técnica |
| `PUT /api/permissoes/{id}` | Acesso / `PermissoesController` | `Admin` | Body: `{ nome, modulo, descricao }` | Atualização cadastral da permissão |
| `PATCH /api/permissoes/{id}/status` | Acesso / `PermissoesController` | `Admin` | Body: `{ ativo: boolean }` | Ativação ou inativação de permissão |
| `GET /api/supporters` | Core / `SupportersController` | Público | Query: `pageIndex`, `pageSize` | Mural público paginado (apenas `Aprovado`) |
| `GET /api/supporters/admin` | Core / `SupportersController` | `Staff`, `Mod`, `Admin` | Query: `pageIndex`, `pageSize`, `status` | Fila administrativa com auditoria completa |
| `GET /api/supporters/{id}` | Core / `SupportersController` | Público se Aprovado / Admin | Path: `id` (Guid) | Detalhes do registro de apoio comunitário |
| `POST /api/supporters` | Core / `SupportersController` | Público / User | Body: `{ nickname, wallet, tier, tx, msg }` | Registro de apoio comunitário e tier |
| `PUT /api/supporters/{id}` | Core / `SupportersController` | Owner / `Admin` | Body: `{ nickname, mensagem }` | Atualização cadastral dos dados do apoio |
| `PATCH /api/supporters/{id}/status` | Core / `SupportersController` | `Moderador`, `Admin` | Body: `{ status: "Pendente" \| "Aprovado" \| "Oculto" }` | Moderação do status no mural público |
| `DELETE /api/supporters/{id}` | Core / `SupportersController` | `Admin` | Path: `id` (Guid) | Exclusão de apoio irregular ou fraudulento |
| `GET /api/health` | Sistema / `HealthController` | Público | N/A | Healthcheck e integridade do PostgreSQL |

---

## 4. Diagnóstico do Site Público: O Que Refazer de Acordo com a API

| Funcionalidade no Site | Como Estava Feito (Provisório) | Como Deve Ser Refeito (De acordo com a API) |
|---|---|---|
| **Cadastro & Nickname** | Utilizava `prompt()` do navegador e gravava string solta em `localStorage.setItem('fowlgen_nickname')`. | **Substituir por modal/formulário real** conectado ao endpoint `POST /api/users` (`email`, `nickname_jogo`), obtendo e armazenando o `id_usuario` (Guid). |
| **Login Web3 & Assinatura** | Disparava assinatura na Phantom/Solflare, mas ficava restrito ao navegador sem validação no servidor. | **Conectar ao endpoint `POST /api/auth/login-web3`**, enviando `walletAddress`, `signature` e `message` para validação criptográfica e emissão do JWT. |
| **Modelagem do Jogador** | Manipulava apenas duas variáveis soltas (`fowlgen_wallet` e `fowlgen_nickname`). | **Refatorar para os DTOs oficiais**: lidando formalmente com `id_usuario`, `nickname_jogo`, `email` e `wallet_address`. |
| **Apoiadores & Apoie-nos** | Seção com texto explicativo e link externo abrindo o site da Phantom. | **Construir páginas/seções completas**: "Apoie-nos" (tiers e canais) e mural público dinâmico consumindo `GET /api/supporters`. |
| **Estilo Visual & UI** | CSS básico de 20 linhas e Tailwind genérico. | **Refatorar o estilo visual**: botões 3D táteis, micro-interações, tipografia harmônica e alta responsividade mobile. |
| **Consumo Paginado & Status** | Nenhum controle de paginação; status não era consultado. | **Adicionar suporte a paginação** no client e badges de status visual (`Ativo`, `Inativo`, `Bloqueado`). |

---

## 5. Matriz de Tarefas no Kanban Studio (`openspec/changes/portal-web-hub-app/tasks.md`)

### Trilha 1: Site Oficial Público do Game (`app/`) — Responsável: @Junior
- [ ] **2.1** Página de vitrine do MVP com botão de download do APK Android (@Junior)
- [ ] **2.2** Preparação do container de apresentação para embutir o jogo Unity WebGL (@Junior)
- [x] **2.3** Validação cruzada dos textos e prompts do site contra Claude.md (@Junior)
- [ ] **2.4** Atualização dos links da comunidade e redes sociais no rodapé (@Junior)
- [x] **2.5** Organização do acervo de referências conceituais e READMEs históricos em prompt/files/referencias/ (@Junior)
- [ ] **2.6** Refatorar o sistema de cadastro e nickname: substituir o `prompt()` local por formulário/modal conectado a `POST /api/users` (@Junior)
- [ ] **2.7** Refatorar o fluxo de autenticação Web3: conectar assinatura de mensagem a `POST /api/auth/login-web3` e gerenciar JWT oficial (@Junior)
- [ ] **2.8** Refatorar o modelo de dados do jogador no frontend para os campos oficiais: `id_usuario`, `nickname_jogo`, `email` e `wallet_address` (@Junior)
- [ ] **2.9** Refatorar e modernizar o estilo visual do site (CSS/Tailwind, botões 3D táteis, tipografia e responsividade mobile de alto padrão) (@Junior)
- [ ] **2.10** Criar a página/seção "Apoie-nos" com apresentação dos Tiers de Apoio, canais de contribuição e formulário com mensagem (@Junior)
- [ ] **2.11** Criar a página/seção "Apoiadores" com mural público dinâmico consumindo a API (`GET /api/supporters`) (@Junior)
- [ ] **2.12** Atualizar links de navegação na Navbar e no Footer para "Apoiadores" e "Apoie-nos" (@Junior)
- [ ] **2.13** Implementação de componente/lógica de paginação no client HTTP do site para consumir as listagens paginadas da API (@Junior)
- [ ] **2.14** Tratamento e exibição de badges visuais de status da conta do jogador (`Ativo`, `Inativo`, `Bloqueado`) nos componentes de perfil (@Junior)

### Trilha 2: Arquitetura de Produção na API Backend para o Site (`api/`) — Responsável: @Marcos
- [ ] **3.1** Implementação no módulo `Core` e `Acesso` dos Value Objects (`Senha` e `Salt` com hashing criptográfico seguro e validações) (@Marcos)
- [ ] **3.2** Modelagem das entidades de domínio de Acesso: `Perfil` com as seeds de produção oficiais (`Admin`, `Staff`, `Moderador`, `Suporte`, `Player`), `Permissao`, `PerfilPermissao` e relacionamento com `Usuario` (@Marcos)
- [ ] **3.3** Implementação de persistência EF Core (mapeamentos Fluent API, `DbSet` de Perfil, Permissão e PerfilPermissão no `AcessosDbContext` e migrations) (@Marcos)
- [ ] **3.4** Desenvolvimento do CRUD completo com paginação (`pageIndex`, `pageSize`) e alteração de status para `Usuario` (`GET`, `POST`, `PUT`, `PATCH /status`, `DELETE`) (@Marcos)
- [ ] **3.5** Desenvolvimento dos endpoints CRUD paginados e gestão de status para `Perfil` e `Permissao` (`PerfisController` e `PermissoesController`) (@Marcos)
- [ ] **3.6** Criação do `SupportersController.cs` com catálogo completo para o site: `GET /api/supporters` (mural público paginado), `GET /api/supporters/admin` (listagem com auditoria), `GET /api/supporters/{id}`, `POST /api/supporters` (registro de apoio), `PUT /api/supporters/{id}` (atualização cadastral), `PATCH /api/supporters/{id}/status` (moderação de status: Pendente, Aprovado, Oculto) e `DELETE /api/supporters/{id}` (@Marcos)
- [ ] **3.7** Configuração de segurança RBAC por Roles/Policies (`AdminOnly`, `StaffOnly`, `ModOnly`, `PlayerOnly`) no `ApiConfig.cs`, endpoints de autenticação corporativa e Web3 (`/api/auth`), documentação Swagger interativa com catálogo unificado de endpoints e endpoint `GET /api/health` (@Marcos)
