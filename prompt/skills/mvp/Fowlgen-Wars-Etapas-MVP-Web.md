# Fowlgen Wars - Etapas de Desenvolvimento MVP (Site e Web3)

**Data Limite:** 10 de Outubro de 2026 (Meta Interna Hackathon)
**Responsável Principal:** **Junior** (Dev Web e Integração de Ecossistema)
**Infraestrutura:** Antigravity IDE, Repositório GitHub (`app/`), Deploy na Vercel (Conta Hobby).

Neste fluxo, o site funciona como um "Hub" do jogador, hospedando a versão do jogo WebGL (que compartilha 100% do código com o jogo oficial publicado na **Google Play Console**).

---

## Fase 1 - Fundação Web na Vercel e Antigravity IDE
**Objetivo:** Colocar o portal online de forma rápida.

1. **Setup do Projeto `app/` (Responsável: Junior):**
   - Utilizar a Antigravity IDE para inicializar o site com Next.js ou Vite.
   - Configurar *Continuous Deployment* na **Vercel Hobby**.
2. **Estrutura de Páginas (Responsável: Junior):**
   - Criar a *Home* (Pitch do Jogo), *Dashboard* (Perfil) e a **Arena Web** (Página reservada para embutir o jogo).

---

## Fase 2 - Contas de Usuários (Banco de Dados Compartilhado)
**Objetivo:** Contas Web2 integradas diretamente ao ecossistema do servidor do jogo.

1. **Conexão ao Banco Único (Responsável: Junior / Dependência: Marcos):**
   - **ATENÇÃO:** O Junior *não* criará um banco de dados isolado. Ele conectará o site utilizando a *Connection String* do banco de dados (ex: Supabase/PostgreSQL) provisionado pelo **Marcos** (na Fase 1 do Backend).
2. **Autenticação e Escrita (Responsável: Junior):**
   - Criar o fluxo de Registro e Login simples no site. O site é responsável por **escrever** os novos usuários na tabela. O jogo (Unity/FishNet) posteriormente usará essa mesma tabela apenas para validar o login.
3. **Modelagem Básica Compartilhada (Responsável: Junior):**
   - Tabela de Usuários com `id_usuario`, `nickname_jogo`, `email` e `wallet_address`.

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
