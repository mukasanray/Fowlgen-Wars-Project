# Fowlgen Wars - Etapas de Desenvolvimento MVP (Site e Web3)

**Data Limite:** 10 de Outubro de 2026 (Meta Interna Hackathon)
**Responsável Principal:** **Junior** (Dev Web e Integração de Ecossistema)
**Infraestrutura:** Antigravity IDE, Repositório GitHub (`app/`), Deploy na Vercel (Conta Hobby).

Neste fluxo, o site funciona como um "Hub" do jogador, hospedando a versão do jogo WebGL (que compartilha 100% do código com o jogo oficial publicado na **Google Play Console**).

---

## Fase 1 - Fundação Web na Vercel e Antigravity IDE
**Objetivo:** Colocar o portal online de forma rápida com os mocks de telas da plataforma.

> **Nota de Alinhamento:** As telas do jogo dentro da Unity já foram construídas pelo **Marcos**: `Auth.unity` (onde o usuário entra conectando sua carteira Web3), `Play.unity`, `Vitoria.unity` e `Derrota.unity` (não existe tela "Login" convencional nem "MainMenu", a entrada é via carteira Web3 em `Auth.unity` seguida pela tela `Play.unity`). O escopo do **Junior** no site refere-se exclusivamente à construção dos **mocks visuais no Site/Web Hub** (front-end isolado), para depois conectar com a API/Backend do Marcos.

1. **Setup do Projeto `app/` (Responsável: Junior):**
   - Utilizar a Antigravity IDE para inicializar o site com Next.js ou Vite.
   - Configurar *Continuous Deployment* na **Vercel Hobby**.
2. **Estrutura de Páginas e Mocks Visuais (Responsável: Junior):**
   - Criar a *Home* (Pitch do Jogo), *Dashboard* (Perfil) e a **Arena Web** (Página reservada para embutir o jogo).
   - Desenvolver **mocks visuais no site** para futura integração com API, lidando com os campos definidos pelo backend: `id_usuario`, `nickname_jogo`, `email` e `wallet_address`.

---

## Fase 2 - Contas de Usuários (Banco de Dados Compartilhado)
**Objetivo:** Contas Web2 integradas diretamente ao ecossistema do servidor do jogo.

1. **Comunicação com a API Central (Responsável: Junior / Dependência: Marcos):**
   - **ATENÇÃO:** O Junior *não* se conectará diretamente ao banco de dados. Ele consumirá a **API REST (.NET 9 / Onix.Framework)** construída pelo **Marcos**.
2. **Autenticação e Escrita via API (Responsável: Junior):**
   - Criar o fluxo de Registro e Login no site. O site fará requisições HTTP `POST` para a API do Marcos a fim de registrar e buscar os novos usuários.
3. **Modelagem Consumida via DTOs da API (Responsável: Junior):**
   - O payload enviado/recebido lidará com os campos definidos pelo backend: `id_usuario`, `nickname_jogo`, `email` e `wallet_address`.

---

## Fase 3 - Integração On-Chain e Wallet
**Objetivo:** Ligar o Hub à blockchain Solana (Web3).

1. **Setup de Wallet Adapter (Responsável: Junior):**
   - Adicionar botão "Connect Wallet" (Phantom/Solflare) no Dashboard via `@solana/wallet-adapter-react`.
2. **Vinculação de Conta (Responsável: Junior):**
   - Salvar o *Wallet Address* do jogador na sua conta no banco de dados após assinatura simples.
3. **Leitura de Dados On-Chain (Responsável: Junior):**
   - Exibir NFTs, Tokens e vitórias do jogador lendo diretamente da blockchain (usando RPC ou o contrato Anchor).

---

## Fase 4 - Hospedagem da Unity WebGL (A Grande Unificação)
**Objetivo:** Integrar o esforço de desenvolvimento do Marcos (Unity) dentro do Site da Vercel.

1. **Recepção da Build WebGL (Responsável: Junior / Dependência: Marcos):**
   - O Marcos fará o build do **WebGL** a partir da Unity e o entregará ao Junior.
2. **Embutir o Jogo (Responsável: Junior):**
   - O Junior adicionará a build ao projeto da Vercel (geralmente usando bibliotecas como `react-unity-webgl` ou um `<iframe/>` estático).
3. **Conexão Bridge e Server (Responsáveis: Junior e Marcos):**
   - Através de um *hook* em JavaScript, o site passa a ID do usuário logado para a Unity. O WebGL então utiliza o FishNet via WebSockets para conectar-se de forma invisível ao Servidor mantido pelo backend, validando a partida autenticada.

---

## Próximas Tarefas — Site Oficial do Game (Responsável: Junior)
- [ ] **2.1** Página de vitrine do MVP com botão de download do APK Android.
- [ ] **2.2** Preparação do container de apresentação para embutir o jogo Unity WebGL.
- [x] **2.3** Validação cruzada dos textos e prompts do site contra Claude.md.
- [ ] **2.4** Atualização dos links da comunidade e redes sociais no rodapé.
- [x] **2.5** Organização do acervo de referências conceituais e READMEs históricos em prompt/files/referencias/.
- [ ] **2.6** Refatorar o sistema de cadastro e nickname: substituir o `prompt()` local por formulário/modal real conectado a `POST /api/users`.
- [ ] **2.7** Refatorar o fluxo de autenticação Web3: conectar assinatura de mensagem da carteira ao endpoint `POST /api/auth/login-web3` e gerenciar JWT.
- [ ] **2.8** Refatorar o modelo de dados do jogador no frontend para os campos oficiais da API: `id_usuario`, `nickname_jogo`, `email` e `wallet_address`.
- [ ] **2.9** Refatorar e modernizar o estilo visual do site (CSS/Tailwind, botões 3D táteis, tipografia e responsividade mobile).
- [ ] **2.10** Criar a página/seção "Apoie-nos" com apresentação dos Tiers de Apoio, opções de contribuição e formulário para enviar mensagem de apoio.
- [ ] **2.11** Criar a página/seção "Apoiadores" com mural público dinâmico consumindo `GET /api/supporters`.
- [ ] **2.12** Atualizar links de navegação na Navbar e no Footer direcionando para "Apoiadores" e "Apoie-nos".
- [ ] **2.13** Implementação de componente/lógica de paginação no client HTTP do site para consumir as listagens paginadas da API.
- [ ] **2.14** Tratamento e exibição de badges visuais de status da conta do jogador (`Ativo`, `Inativo`, `Bloqueado`) nos componentes de perfil.

