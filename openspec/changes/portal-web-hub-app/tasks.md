# Tasks for portal-web-hub-app

## 1. Estruturação e Desenvolvimento Base do Portal Web (app/)
- [x] **1.1** Criação do site oficial CW e estruturação base (app.js, app.ts, index.html, style.css) (@Vyctor Rodrigues)
- [x] **1.2** Implementação de responsividade mobile e ajustes de layout e botões (@Vyctor Rodrigues)
- [x] **1.3** Implementação do botão Membro Fundador e correção de bugs de interface (@Vyctor Rodrigues)
- [x] **1.4** Ajustes finos de rolagem da página (scroll px) e revisão ortográfica dos textos (@Vyctor Rodrigues)
- [x] **1.5** Elaboração da documentação técnica inicial do portal (README.md) (@Vyctor Rodrigues)

## 2. Site Oficial Público do Game (app/) — Responsável: @Junior
- [ ] **2.1** Página de vitrine do MVP com botão de download do APK Android (@Junior)
- [ ] **2.2** Preparação do container de apresentação para embutir o jogo Unity (@Junior)
- [x] **2.3** Validação cruzada dos textos e prompts do site contra Claude.md (@Junior)
- [ ] **2.4** Atualização dos links da comunidade e redes sociais no rodapé (@Junior)
- [x] **2.5** Organização do acervo de referências conceituais e READMEs históricos em prompt/files/referencias/ (@Junior)
- [ ] **2.6** Refatorar o sistema de cadastro e nickname: substituir o `prompt()` local do navegador e salvamento isolado em `localStorage` por formulário/modal real conectado ao endpoint `POST /api/users` (@Junior)
- [ ] **2.7** Refatorar o fluxo de autenticação Web3: conectar a assinatura de mensagem da carteira ao endpoint `POST /api/auth/login-web3` da API e gerenciar o token JWT retornado pelo backend (@Junior)
- [ ] **2.8** Refatorar o modelo de dados do jogador no frontend para operar com os campos oficiais definidos pelo backend: `id_usuario`, `nickname_jogo`, `email` e `wallet_address` (@Junior)
- [ ] **2.9** Refatorar e modernizar o estilo visual do site (CSS/Tailwind, UI/UX refinada, botões com micro-interações táteis/3D, tipografia e responsividade mobile de alto nível) (@Junior)
- [ ] **2.10** Criar a página/seção "Apoie-nos" com apresentação dos Tiers de Apoio, opções de contribuição e formulário para enviar mensagem de apoio (@Junior)
- [ ] **2.11** Criar a página/seção "Apoiadores" com mural público dinâmico consumindo a API (`GET /api/supporters`) (@Junior)
- [ ] **2.12** Atualizar links de navegação na Navbar e no Footer direcionando para "Apoiadores" e "Apoie-nos" (@Junior)
- [ ] **2.13** Implementação de componente/lógica de paginação no client HTTP do site para consumir as listagens paginadas da API (@Junior)
- [ ] **2.14** Tratamento e exibição de badges visuais de status da conta do jogador (`Ativo`, `Inativo`, `Bloqueado`) nos componentes de perfil (@Junior)

## 3. Arquitetura de Produção na API Backend: Core, Sistema e Acesso (api/) — Responsável: @Marcos
- [ ] **3.1** Implementação no módulo `Core` e `Acesso` dos Value Objects (`Senha` e `Salt` com hashing criptográfico seguro, e validações de domínio) (@Marcos)
- [ ] **3.2** Modelagem das entidades de domínio de Acesso: `Perfil` com as seeds de produção oficiais (`Admin`, `Staff`, `Moderador`, `Suporte`, `Player`), `Permissao`, `PerfilPermissao` e relacionamento com `Usuario` (@Marcos)
- [ ] **3.3** Implementação de persistência EF Core (mapeamentos Fluent API, `DbSet` de Perfil, Permissão e PerfilPermissão no `AcessosDbContext` e migrations) (@Marcos)
- [ ] **3.4** Desenvolvimento do CRUD completo com paginação (`pageIndex`, `pageSize`) e alteração de status para `Usuario` (`GET`, `POST`, `PUT`, `PATCH /status`, `DELETE`) (@Marcos)
- [ ] **3.5** Desenvolvimento dos endpoints CRUD paginados e gestão de status para `Perfil` e `Permissao` (`PerfisController` e `PermissoesController`) (@Marcos)
- [ ] **3.6** Criação do `SupportersController.cs` com catálogo completo para o site: `GET /api/supporters` (mural público paginado), `GET /api/supporters/admin` (listagem com auditoria), `GET /api/supporters/{id}`, `POST /api/supporters` (registro de apoio), `PUT /api/supporters/{id}` (atualização cadastral), `PATCH /api/supporters/{id}/status` (moderação de status: Pendente, Aprovado, Oculto) e `DELETE /api/supporters/{id}` (@Marcos)
- [ ] **3.7** Configuração de segurança RBAC por Roles/Policies (`AdminOnly`, `StaffOnly`, `ModOnly`, `PlayerOnly`) no `ApiConfig.cs`, endpoints de autenticação corporativa e Web3 (`/api/auth`), documentação Swagger interativa com catálogo unificado de endpoints e endpoint `GET /api/health` (@Marcos)

