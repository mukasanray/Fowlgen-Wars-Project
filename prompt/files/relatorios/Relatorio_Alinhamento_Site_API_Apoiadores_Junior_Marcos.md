# 🐔 Fowlgen Wars — Relatório de Alinhamento Técnico
## Guia Operacional para o Junior: O Que Foi Concluído, O Que Verificar/Refatorar e Alinhamento com a API Backend (.NET 9) do Marcos

> **Projeto:** Fowlgen Wars (G5B Studios)  
> **Data:** 20 de Outubro de 2026  
> **Frente Site Oficial:** Junior (Dev Web & Documentação)  
> **Frente Backend / API:** Marcos (Líder Técnico & Arquiteto .NET)  
> **Referências Canônicas:** [`Fowlgen-Wars-Etapas-MVP-Web.md`](../../skills/mvp/Fowlgen-Wars-Etapas-MVP-Web.md) e [`Fowlgen-Wars-Etapas-MVP-Backend.md`](../../skills/mvp/Fowlgen-Wars-Etapas-MVP-Backend.md)  
> **Arquivo PDF Oficial:** [`prompt/files/pdf/Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.pdf`](../pdf/Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.pdf)

---

## 1. Princípio Fundamental de Separação de Escopos

| Frente | Escopo & Aplicação | Público-Alvo | Responsável |
|---|---|---|---|
| **Site Oficial Público (`app/`)** | Vitrine do jogo, download do APK, container Unity WebGL, mural dinâmico de apoiadores (`GET /api/supporters`), página "Apoie-nos" e login Web3 do jogador. | Jogadores finais (`Player`), comunidade e visitantes | **Junior** |
| **API REST Backend para o Site (`api/`)** | Arquitetura .NET 9 / Onix.Framework: Módulos Core, Sistema e Acesso (5 Perfis RBAC), CRUD paginado, Supporters e healthcheck. | Consumida diretamente pelo Site e pelo Game | **Marcos** |
| **Kanban Interno (`kanban/`)** | Ferramenta de apoio interno da equipe para dashboard e OpenSpec (projeto multi-projetos futuro desacoplado). | Equipe técnica G5B Studios | **Marcos** |
| **Game Engine (`unity/`)** | Jogo 3D mobile / WebGL: combates na arena de 3 rotas, física de minions, multiplayer FishNet headless e Anchor. | Jogador executando o cliente do jogo | **Marcos** (& equipe) |

> ⚠️ **Atenção:** O Junior atua **exclusivamente no Site Público (`app/`)** e na documentação (`prompt/skills/`). Toda a lógica do game Unity permanece sob responsabilidade do time de engine.

---

## 2. Checklist do Junior: O Que Foi Concluído vs. O Que Precisa Verificar e Refazer

### ✅ O Que Já Foi Concluído pelo Junior:
* [x] **Tarefa 2.3:** Validação cruzada dos textos, termos técnicos e prompts do site contra as definições canônicas de `Claude.md`.
* [x] **Tarefa 2.5:** Organização do acervo de referências conceituais e READMEs históricos em `prompt/files/referencias/`.

---

### ⚠️ O Que o Junior Já Fez Provisoriamente e Precisa VERIFICAR / REFATORAR:

| Funcionalidade no Site | Como o Junior Fez (Provisório) | O Que o Junior Precisa Verificar e Refazer (De acordo com a API) | Status / Tarefa |
|---|---|---|:---:|
| **Cadastro & Nickname** | Utilizou o comando `prompt()` nativo do navegador e salvou a string isolada no `localStorage.setItem('fowlgen_nickname')`. | **Substituir o prompt() por formulário/modal real na UI**, enviando requisição `POST /api/users` (`email`, `nickname`) e guardando o `id_usuario` retornado pelo backend. | ⚠️ **Tarefa 2.6** (A Refatorar) |
| **Login Web3 & Carteira** | Disparava assinatura na Phantom/Solflare, mas ficava restrito ao navegador sem validação no servidor. | **Conectar a assinatura ao endpoint `POST /api/auth/login-web3`**, enviando `walletAddress`, `signature` e `message` para validação e emissão de token JWT oficial. | ⚠️ **Tarefa 2.7** (A Refatorar) |
| **Modelagem do Jogador** | Manipulava apenas duas variáveis soltas (`fowlgen_wallet` e `fowlgen_nickname`). | **Adequar o estado do frontend para os DTOs oficiais da API**: lidando formalmente com `id_usuario`, `nickname_jogo`, `email` e `wallet_address`. | ⚠️ **Tarefa 2.8** (A Refatorar) |
| **Estilo Visual & UI** | CSS básico simplificado de ~20 linhas e componentes Tailwind genéricos. | **Aprimorar o visual**: botões 3D táteis com micro-interações, tipografia harmônica, contraste balanceado e responsividade mobile de alto padrão. | ⚠️ **Tarefa 2.9** (A Refatorar) |

---

### 🚀 Novas Funcionalidades a Serem Implementadas pelo Junior no Site:
* [ ] **Tarefa 2.1:** Construir a página/seção de vitrine do MVP com botão direto de download do APK Android.
* [ ] **Tarefa 2.2:** Preparar o container de apresentação responsivo para embutir o jogo Unity WebGL.
* [ ] **Tarefa 2.4:** Atualizar links de redes sociais e comunidade oficial no rodapé do portal.
* [ ] **Tarefa 2.10:** Criar a página/seção **"Apoie-nos"** com apresentação dos Tiers de Apoio, canais de contribuição e formulário para envio de mensagem de apoio.
* [ ] **Tarefa 2.11:** Criar a página/seção **"Apoiadores"** com mural público dinâmico consumindo o feed de aprovados da API (`GET /api/supporters`).
* [ ] **Tarefa 2.12:** Atualizar links de navegação na Navbar e no Footer direcionando para "Apoiadores" e "Apoie-nos".
* [ ] **Tarefa 2.13:** Implementar suporte a paginação no client HTTP do site para consumir as listagens paginadas da API (`pageIndex`, `pageSize`).
* [ ] **Tarefa 2.14:** Tratar e exibir badges visuais de status da conta do jogador (`Ativo`, `Inativo`, `Bloqueado`) nos componentes de perfil.

---

## 3. Catálogo de Endpoints da API REST Backend (.NET 9) para o Site (Marcos)

O backend disponibiliza os seguintes endpoints para integração direta com o site do Junior:

| Método & Rota | Controller | Acesso RBAC | Payload / Parâmetros | Finalidade no Site |
|---|---|---|---|---|
| `POST /api/users` | `UsersController` | Público | Body: `{ email, nickname, password }` | Cadastro inicial do jogador pelo formulário/modal |
| `GET /api/users/{id}` | `UsersController` | Autenticado / Owner | Path: `id` (Guid) | Obtenção do perfil completo e dados do jogador |
| `PUT /api/users/{id}` | `UsersController` | Owner / Admin | Body: `{ nickname, avatarUrl }` | Atualização cadastral de dados do perfil |
| `POST /api/auth/login-web3` | `AuthController` | Público | Body: `{ walletAddress, signature, msg }` | Autenticação Web3 via Phantom/Solflare e emissão de JWT |
| `POST /api/auth/refresh-token` | `AuthController` | Autenticado | Body: `{ refreshToken }` | Renovação do token JWT expirado de sessão |
| `GET /api/supporters` | `SupportersController` | Público | Query: `pageIndex`, `pageSize` | Feed dinâmico do mural de apoiadores (apenas `Aprovado`) |
| `POST /api/supporters` | `SupportersController` | Público / User | Body: `{ nickname, wallet, tier, tx, msg }` | Envio de registro de apoio comunitário e tier |
| `GET /api/health` | `HealthController` | Público | N/A | Verificação online de saúde da API pelo frontend |

---

## 4. Matriz de Tarefas da Trilha 2 de Backend (api/) — Responsável: @Marcos

Tarefas necessárias na API para sustentar o site oficial em produção:

- [ ] **3.1** Implementação no módulo `Core` e `Acesso` dos Value Objects (`Senha` e `Salt` com hashing criptográfico seguro PBKDF2/SHA512 e validações de domínio).
- [ ] **3.2** Modelagem das entidades de domínio de Acesso: `Perfil` com as seeds de produção oficiais (`Admin`, `Staff`, `Moderador`, `Suporte`, `Player`), `Permissao`, `PerfilPermissao` e relacionamento com `Usuario`.
- [ ] **3.3** Implementação de persistência EF Core (mapeamentos Fluent API, `DbSet` no `AcessosDbContext` e migrations).
- [ ] **3.4** Desenvolvimento do CRUD completo com paginação (`pageIndex`, `pageSize`) e alteração de status para `Usuario` (`GET`, `POST`, `PUT`, `PATCH /status`, `DELETE`).
- [ ] **3.5** Desenvolvimento dos endpoints CRUD paginados e gestão de status para `Perfil` e `Permissao` (`PerfisController` e `PermissoesController`).
- [ ] **3.6** Criação do `SupportersController.cs` com catálogo completo para o site: `GET /api/supporters` (mural público), `GET /api/supporters/admin` (auditoria), `GET /api/supporters/{id}`, `POST /api/supporters` (registro de apoio), `PUT /api/supporters/{id}` (atualização cadastral), `PATCH /api/supporters/{id}/status` (moderação de status) e `DELETE /api/supporters/{id}`.
- [ ] **3.7** Configuração de segurança RBAC por Roles/Policies (`AdminOnly`, `StaffOnly`, `ModOnly`, `PlayerOnly`) no `ApiConfig.cs`, endpoints de autenticação corporativa e Web3 (`/api/auth`), Swagger unificado e endpoint `GET /api/health`.
