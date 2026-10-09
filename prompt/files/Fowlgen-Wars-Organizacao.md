# 🐔 Fowlgen Wars (G5B Studios) — Estrutura, Planejamento & Kanban

Documento oficial de organização do projeto **Fowlgen Wars**, desenvolvido pela **G5B Studios**. Este arquivo sintetiza a divisão de papéis da equipe ativa, os gargalos organizacionais, a estrutura do quadro Kanban e o modelo de briefing padronizado para assets visuais.

---

## 👥 1. Integrantes Ativos e Divisão de Papéis

### 👑 Samuel Menon Ramos — Product Owner (PO), Game Designer & Gestor do Kanban
* **Escopo**: Visão macro do produto, direção criativa, Game Design Document (GDD), decisões de mecânicas (partidas de 3 minutos, sistema de bombas e Galinheiro, 3 rotas, economia, balanceamento e nivelamento proporcional anti-P2W) e gestão do Kanban.
* **Atividades**: Centralização do quadro Kanban e priorização no GitHub Projects, coordenação com Ramiro para apresentações a investidores, validação final de critérios de aceite e governança da marca (**Fowlgen Wars / G5B Studios**).

### 💻 Marcos — Líder Técnico / Dev Core Unity & Web3
* **Escopo**: Arquitetura geral técnica, desenvolvimento core na Unity Engine (C#), condução da **camada Off-chain** (FishNet, multiplayer em tempo real) e **ajuste do time de desenvolvimento**.
* **Atividades**: Liderança técnica de software; orquestração da **camada Off-chain** (Dedicated Server FishNet, física server-authoritative e sincronização de combate em tempo real sem latência de blockchain); arquitetura de smart contracts em Rust via Anchor Framework em conjunto com Jorge; **ajuste e orientação técnica contínua do time de desenvolvimento** (Manuel, Jorge e Junior), code reviews e validação de builds (APK Android / WebGL).

### 🕹️ Manuel — Desenvolvedor Unity / Gameplay Core
* **Escopo**: Desenvolvimento direto de gameplay na Unity (C#), atuando na pasta `unity/` em colaboração direta com Marcos.
* **Atividades**: Implementação de movimentação de personagens, física e colisões, arremesso e área de impacto das bombas, IA de minions por waypoints, conexão de botões do HUD e integração de efeitos sonoros (SFX/BGM) no motor.

### 🛡️ Jorge Espindola — DevSecOps Engineer & Cloud/Web3 Solutions Architect
* **Escopo**: Ajuda o Marcos no desenvolvimento **Anchor Web 3**, além de assumir **Áudio**, **Documentação Técnica** e DevSecOps/AppSec.
* **Atividades**: Atuação na pasta `program/` ajudando Marcos no desenvolvimento de smart contracts Anchor em Rust e Solana MCPs; implementação e integração do **Áudio** do jogo na Unity (SFX de combate, bombas, passos, UI e mixers de som); elaboração e manutenção da **Documentação Técnica** de infraestrutura e arquitetura; pipelines de CI/CD no GitHub Actions (`anchor-ci.yml`), anti-leak de segredos com Gitleaks/TruffleHog e container Docker headless para o servidor FishNet.

### 🌐 Junior — Desenvolvedor Web (Node.js / React / TS) & Gestor de Documentação/Prompts
* **Escopo**: Substituto de Vyctor Rodrigues no desenvolvimento Web; responsável pelo site oficial e pela ponte de documentação/prompts.
* **Atividades**: Atuação na pasta `app/` desenvolvendo o site oficial e interface Web3 (Node.js, React, TypeScript, integração Phantom/Solflare). Atuação na pasta `prompt/skills/` coletando direcionamentos e prompts do Samuel, convertendo-os em Markdown (`.md`) e verificando com o `Claude.md` para evitar divergências conceituais.

### 🧪 Maria Clara — QA Funcional & Coerência Narrativa / Lore
* **Escopo**: Qualidade da experiência do usuário (UX Testing), testes funcionais de gameplay e coerência da narrativa.
* **Atividades**: Testes contínuos de fluxo de jogo, ergonomia de controles mobile e regras de combate; gestão do lore oficial (*A Era Passada*), revisão de textos, diálogos, frases de combate e fichas dos personagens.

### 📈 Ramiro — Marketing Estratégico, Captação & Relações com Investidores
* **Escopo**: Envelopamento comercial do game, posicionamento de mercado e atração de investidores e publishers.
* **Atividades**: Estruturação do One-Pager Executivo e do Pitch Deck oficial (8 a 12 slides). Defesa da tese "Fun-First", fair play sem Pay-to-Win, arquitetura híbrida (Unity/FishNet off-chain e Solana/Anchor on-chain) e posicionamento na Solana Mobile DApp Store (Saga e Seeker).

> **Nota de Alinhamento**: Alexandre e Vyctor Rodrigues foram desligados da equipe ativa. Suas atribuições foram redistribuídas entre Jorge Espindola (Web3, DevSecOps, Infra), Manuel (Dev Unity), Junior (Dev Web e Markdown Prompts e Site) e Samuel Menon (Kanban).

---

## 🧩 2. Gargalos e Pontos de Organização

1. **Gestão do Kanban e Backlog (Samuel)**:
   * **Ação**: O PO Samuel assume a centralização dos cards e priorização direta no GitHub Projects, garantindo que toda demanda siga o fluxo `Backlog → Ready → In Progress → Review → QA → Done`.

2. **Esteira de Prompts e Coerência Documental (Junior & Samuel)**:
   * **Ação**: Junior coleta os direcionamentos de Samuel, converte para Markdown e valida com `Claude.md` antes de consolidar em `prompt/skills/`, assegurando ausência de conflitos conceituais.

3. **Blindagem e DevSecOps (Jorge)**:
   * **Ação**: Implementação imediata de verificação Gitleaks e CI/CD para Anchor (`cargo test`, `clippy`, `audit`), além do Dockerfile do servidor FishNet.

4. **Validação do Protótipo Jogável na Unity (Marcos & Manuel)**:
   * **Ação**: Foco total na resolução dos testes pendentes da Sprint 01 (movimentação, colisões, física de bombas, HUD e áudio) para entrega do MVP jogável.

5. **Apresentação e Pitch Deck para Investidores (Ramiro & Samuel)**:
   * **Ação**: Consolidação do One-Pager e Pitch Deck para captação de recursos e hackathons.

---

## 📋 3. Quadro Kanban do Projeto (Fase 2)

### 📥 Backlog Geral (Futuras Fases)
- [ ] **[Game Design]** Detalhamento de mapas secundários e novas arenas.
- [ ] **[Web3/Dev]** Marketplace completo e coleções em Mainnet.
- [ ] **[Áudio/Dublagem]** Gravação final de dublagens regionais completas.
- [ ] **[Comercial]** Rodadas de captação e submissão em editais globais.

### 📌 Sprint Atual (Ready / A Iniciar)
- [ ] **[Unity]** Movimentação de unidades por waypoints e toque (Manuel / Marcos).
- [ ] **[Unity]** Sistema de colisão com cenário e física de bombas (Manuel / Marcos).
- [ ] **[Unity]** Conexão dos botões de habilidade no HUD (Manuel / Marcos).
- [ ] **[DevSecOps]** Configurar Gitleaks e CI/CD do Anchor no GitHub Actions (Jorge).
- [ ] **[DevSecOps]** Dockerfile headless Linux para Dedicated Server FishNet (Jorge).
- [ ] **[Web/Front]** Refinamento do site e conexão com Phantom Wallet na pasta `app/` (Junior).
- [ ] **[Documentação]** Padronização e checagem de prompts Markdown com Claude.md (Junior).
- [ ] **[Marketing/Pitch]** One-Pager Executivo e Pitch Deck de 8 a 12 slides (Ramiro / Samuel).
- [ ] **[QA Funcional]** Checklist de testes da Fase 2 e homologação de gameplay (Maria Clara).

### 🔨 Em Desenvolvimento (In Progress)
- [/] **[Unity]** Loop de combate de 3 minutos na arena de 3 rotas (Marcos / Manuel).
- [/] **[Web3/Anchor]** Instruções do contrato Anchor e sincronização de IDL (Marcos / Jorge).
- [/] **[Threat Modeling]** Arquitetura híbrida com validação de partidas pelo servidor (Jorge / Marcos).
- [/] **[Site]** Interface web responsiva em Node.js / React / TS (Junior).

### 🔎 Em Teste / Revisão (Review)
- [/] **[AppSec]** Auditoria de `.gitignore` e blindagem de segredos (Jorge).
- [/] **[QA UX]** Bateria de testes de usabilidade e ergonomia touch (Maria Clara).

### ✅ Concluído (Done)
- [x] Homologação oficial da marca **Fowlgen Wars** e estúdio **G5B Studios**.
- [x] Contrato Anchor funcional na Solana Devnet com testes automatizados passando 100% (LiteSVM).
- [x] Conexão Solana Unity SDK e leitura de IDL na Devnet.
- [x] Reestruturação da equipe ativa da Fase 2 e alinhamento do Kanban.

---

## 📝 4. Modelo de Briefing de Personagem (Template Visual)

```markdown
# 🐔 Briefing Visual — [Nome do Personagem]

### 1. 🪪 Identificação Básica
* **Nome do Personagem**: [Ex: Léo / Sophie]
* **Espécie / Fusão**: [Ex: Galinha Humanoide / Galinha + Leão]
* **Classe**: [Tanque | Atirador | Mago | Caçador]
* **Rota / Função**: [TOP | MID | JUNGLE | ADC]
* **Essência / Elemento**: [Fogo | Terra | Água | Arcano | etc.]
* **Personalidade**: [3 palavras-chave]

### 2. 🎨 Diretrizes Visuais & Anatomia
* **Porte Físico**: [Parrudo, Ágil, Mediano, Curvilíneo]
* **Características OBRIGATÓRIAS**:
  - [ ] Estilo da crista/pena
  - [ ] Vestimenta / Armadura principal
  - [ ] Arma / Equipamento nas mãos
* **RESTRIÇÕES & PROIBIÇÕES**:
  - ❌ [O que NÃO pode conter no design]

### 3. 📐 Especificações de Entrega
* **Pose**: Neutra / Vista frontal (para referência Unity/3D)
* **Formato**: PNG transparente 1:1 (2048x2048px) no Google Drive

### 4. ✅ Critérios de Aceite
- [ ] Seguir todas as especificações obrigatórias sem violar as proibições.
- [ ] Aprovação formal do PO (Samuel) no card do GitHub.
```

---
*Documento gerado para gestão do projeto Fowlgen Wars — G5B Studios.*
