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
