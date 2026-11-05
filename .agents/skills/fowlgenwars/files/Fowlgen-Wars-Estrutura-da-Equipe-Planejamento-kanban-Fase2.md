# FOWLGEN WARS — G5B Studios
## Estrutura da Equipe, Planejamento & Kanban — Fase 2

Documento oficial de organização da equipe ativa, distribuição de responsabilidades, fluxo de trabalho e planejamento Kanban para a **Fase 2** do projeto **FOWLGEN WARS**, desenvolvido pela **G5B Studios**.

---

### Status do Projeto
* **Fase 1:** ✅ Concluída (Organização, estruturação conceitual e preparação).
* **Fase Atual:** 🚀 **Fase 2 — Desenvolvimento e Integração do MVP**.
* **Equipe Ativa:** 7 integrantes.
* **Projeto:** FOWLGEN WARS
* **Estúdio:** G5B Studios

---

## 👥 1. Equipe Ativa — Fase 2

### 👑 1. Samuel Menon Ramos
**Product Owner (PO) • Game Designer • Growth Marketing • Gestão do Kanban**
* **Responsabilidade Principal:** Visão de produto, direção criativa, Game Design, priorização de backlog e gestão do fluxo ágil (Kanban).
* **Atividades:**
  * Definição e priorização do backlog geral e visão do produto.
  * Gestão direta do quadro **Kanban** e fluxo das Sprints no GitHub Projects.
  * Elaboração de GDD e documentação técnica de Game Design.
  * Definição das mecânicas centrais (partidas de 3 min, sistema de bombas, Galinheiro, classes, funções e rotas).
  * Economia do jogo, balanceamento conceitual e Sistema de Nivelamento Proporcional (anti-P2W).
  * Geração e direcionamento dos prompts de produto para documentação.
  * Validação final de personagens, artes, sistemas e critérios de aceite (**Aprovação do PO**).
  * Identidade e posicionamento da marca FOWLGEN WARS / G5B Studios.
  * Alinhamento estratégico com Ramiro para apresentação a investidores, pitch decks e hackathons.
* 🎯 **Regra de Ouro:** O PO define o *"o quê"* e o *"por quê"*; a equipe técnica define o *"como"*. Samuel centraliza o produto, a direção, o Kanban e a validação final.

---

### 💻 2. Marcos
**Líder Técnico • Dev Core Unity & Web3**
* **Responsabilidade Principal:** Arquitetura técnica global, liderança e **ajuste do time de desenvolvimento**, condução da **camada Off-chain** (FishNet, multiplayer em tempo real) e coordenação dos smart contracts Solana/Anchor.
* **Atividades:**
  * **Camada Off-chain, FishNet & Multiplayer:** Arquitetura de rede em tempo real, topologia Host/Client e Dedicated Server, sincronização de estado, tick rate, autoridade de servidor e isolamento da física e do combate off-chain com latência zero de blockchain.
  * **Ajuste e Alinhamento do Time de Desenvolvimento:** Orientação técnica direta aos desenvolvedores (Manuel, Jorge e Junior), remoção de gargalos técnicos, code review contínuo, definição de padrões de engenharia e sincronização entre as frentes de Unity, Web3 e Web.
  * Liderança técnica dos smart contracts Solana/Anchor junto a Jorge.
  * Gerenciamento de release engineering e validação técnica final das builds (APK Android / WebGL).
* 🎯 **Regra:** Marcos conduz a arquitetura técnica, foca na camada off-chain/FishNet, lidera o Web3 e alinha a equipe técnica.

---

### 🕹️ 3. Manuel
**Desenvolvedor Unity • Gameplay Core & Ambiente do Game**
* **Responsabilidade Principal:** Desenvolvimento Unity focado no **ambiente do game e colisões**, liberando Marcos para a arquitetura de rede e camada off-chain.
* **Atividades Técnicas:**
  * Atuação na pasta [`unity/`](../../unity/).
  * Construção e ajuste do **ambiente do game**: arena de 3 rotas, layout dos cenários, waypoints e posicionamento do Galinheiro e torres.
  * Sistema de **física e colisões**: detecção precisa de colisões entre personagens, tropas/minions, bombas e obstáculos do cenário.
  * Movimentação de tropas e heróis pelo mapa.
  * Conexão dos inputs de toque e botões de habilidade no HUD.
  * Suporte na montagem de cenas e resolução de bugs de física e performance na Unity.
* 🎯 **Regra:** Manuel sustenta o ambiente e a física do jogo na Unity, permitindo que Marcos se concentre no multiplayer e na camada de rede off-chain.

---

### 🛡️ 4. Jorge Espindola
**DevSecOps Engineer & Cloud/Web3 Solutions Architect • Áudio & Documentação Técnica**
* **Responsabilidade Principal:** Substituto de Alexandre na frente técnica; foco em desenvolvimento Web3 (Anchor), DevSecOps, **Áudio** do game e **Documentação Técnica**.
* **Alocação:** Atuação na pasta [`program/`](../../program/), infraestrutura de CI/CD e suporte a áudio/docs na Unity e no repositório.
* **Atividades Técnicas e Web3:**
  * Desenvolvimento de smart contracts Anchor em Rust e Solana MCPs em parceria com Marcos.
  * Manipulação de PDAs, regras on-chain e revisão de segurança (`claim_reward`, authorities, rent exemption).
* 🎧 **Responsabilidade de Áudio:**
  * Estruturação e organização da biblioteca de SFX/BGM do projeto ([`Fowlgen-Wars-Biblioteca-Efeitos-Sonoros.md`](../skills/Fowlgen-Wars-Biblioteca-Efeitos-Sonoros.md)).
  * Implementação de audio triggers, mixers de som e controle de volume na Unity.
  * Integração dos efeitos sonoros essenciais (bombas, passos, impactos de dano, cliques de UI, fanfarra de vitória/derrota).
* 📝 **Documentação Técnica:**
  * Elaboração e manutenção da documentação técnica de infraestrutura, setup de nós/servidores, arquitetura híbrida e relatórios de segurança.
* 🛡️ **DevSecOps, Infraestrutura & AppSec:**
  * **Anti-Leak de Segredos:** Verificação automática com Gitleaks/TruffleHog no GitHub Actions contra vazamento de private keys/seed phrases; auditoria de `.gitignore`.
  * **Pipeline de CI/CD Anchor:** Manutenção de `.github/workflows/anchor-ci.yml` rodando `cargo check`, `cargo clippy`, `cargo audit` e `anchor test`.
  * **Container Docker do Servidor Dedicado FishNet:** Criação do Dockerfile headless Linux para o servidor FishNet.
  * **Threat Modeling da Arquitetura Híbrida:** Garantia de que a partida seja validada pelo servidor dedicado antes de atualizar dados on-chain.
* 🤝 **Princípio de Atuação:** DevSecOps e AppSec atuam como habilitadores de velocidade com guardrails automáticos silenciosos.

---

### 🌐 5. Junior
**Desenvolvedor Web (Node.js / React / TypeScript) • Gestão de Documentação & Prompts**
* **Responsabilidade Principal:** Substituto de Vyctor Rodrigues no desenvolvimento Web; responsável pelo site oficial e pela ponte de documentação/prompts.
* **Alocação:** Atuação nas pastas [`app/`](../../app/) e [`prompt/skills/`](../skills/).
* **Atividades Web & Front-end:**
  * Desenvolvimento e manutenção do site oficial do Fowlgen Wars na pasta `app/` utilizando Node.js, React e TypeScript.
  * Integração com carteiras Solana (Phantom, Solflare via Solana Wallet Adapter) no portal Web.
  * Responsividade mobile, páginas informativas, roadmap e vitrine de download da build.
* 📝 **Gestão de Prompts e Documentação:**
  * Coleta ativa dos prompts, ideias e especificações criadas pelo Samuel (PO).
  * Estruturação e conversão dos prompts em documentos Markdown (`.md`) padronizados.
  * Checagem e validação cruzada contínua com o [`Claude.md`](../Claude.md) para garantir total coerência conceitual e evitar duplicidades ou conflitos de escopo entre prompts.
* 🎯 **Regra:** Junior assegura a presença Web sólida do jogo e a consistência documental dos prompts com o documento mestre.

---

### 🧪 6. Maria Clara
**QA Funcional • Experiência do Jogador • Coerência Narrativa & Lore**
* **Responsabilidade Principal:** Qualidade da experiência do usuário (UX Testing), testes funcionais de gameplay e coerência da narrativa.
* **Atividades de QA:**
  * Testes funcionais contínuos do fluxo de gameplay sob a ótica do jogador.
  * Avaliação de usabilidade, layout dos controles touch e sensação de combate.
  * Validação das regras de jogo e critérios de aceite.
  * Registro e triagem de bugs funcionais no Kanban.
* 📖 **Narrativa / Lore:**
  * Gestão do lore oficial ([`Fowlgen-Wars-A-Era-Passada.md`](../skills/Fowlgen-wars-A-Era-Passada.md)).
  * Revisão textual, fichas de personagens e coerência de diálogos e frases de combate.
* 🎯 **Regra:** Maria Clara avalia a experiência real do jogador e preserva a identidade narrativa do universo Fowlgen Wars.

---

### 📈 7. Ramiro
**Marketing Estratégico • Captação de Recursos • Relações com Investidores**
* **Responsabilidade Principal:** Envelopamento comercial do projeto, posicionamento de mercado e atração de investidores e publishers.
* **Atividades:**
  * **Kit de Apresentação (Pitch Deck):** Estruturação do One-Pager Executivo e do Pitch Deck oficial (8 a 12 slides cobrindo oportunidade, tese, tecnologia híbrida, monetização e equipe).
  * **Tese do Produto ("Fun-First"):** Apresentação do Fowlgen Wars como Mini-MOBA mobile competitivo de partidas de 3 minutos, com apelo tanto para o mercado mobile massivo (Web2) quanto para o ecossistema Web3.
  * **Defesa da Economia Anti-P2W:** Explicação do Sistema de Nivelamento Proporcional, garantindo fair play total e monetização baseada em cosméticos colecionáveis e passes de temporada.
  * **Camada Web3 Híbrida Inteligente:** Comunicação clara sobre a separação técnica (tempo real off-chain via Unity/FishNet e propriedade on-chain via Solana/Anchor/Metaplex Core); destaque para taxas mínimas (< $0.001) e foco estratégico na **Solana Mobile DApp Store (smartphones Saga e Seeker)**.
  * **Transparência de Roadmap:** Posicionamento transparente junto a investidores do status da Fase 2 (desenvolvimento de MVP/protótipo jogável) vs. fases futuras.
* 🎯 **Regra:** Ramiro posiciona o Fowlgen Wars com autoridade e credibilidade perante o ecossistema financeiro e investidores globais.

---

## 🔄 2. Matriz Atualizada de Distribuição do QA

| Área de QA / Validação | Responsável Primário | Apoio / Validação |
| :--- | :--- | :--- |
| **Teste Funcional & Experiência (UX)** | Maria Clara | — |
| **Fluxo do Jogador & Usabilidade** | Maria Clara | Manuel |
| **Textos & Coerência de Lore** | Maria Clara | Samuel |
| **Revisão de Prompts vs Claude.md** | Junior | Samuel / Marcos |
| **Triagem & Registro de Bugs no Kanban** | Samuel Menon Ramos | Maria Clara |
| **Ambiente do Game & Colisões (Unity)** | Manuel | Marcos |
| **Testes de Gameplay Unity (C#)** | Manuel | Marcos |
| **Áudio, SFX & Mixers na Unity** | Jorge Espindola | Manuel / Maria Clara |
| **Multiplayer, FishNet & Camada Off-chain** | Marcos | Jorge Espindola |
| **Segurança Web3 & AppSec** | Jorge Espindola | Marcos |
| **Auditoria de CI/CD & Docker FishNet** | Jorge Espindola | Marcos |
| **Documentação Técnica & Guias** | Jorge Espindola | Marcos / Junior |
| **Validação Técnica Final & Ajuste do Time** | Marcos | Jorge Espindola |
| **Critérios de Aceite de Produto & PO** | Samuel Menon Ramos | — |

```text
Fluxo de Qualidade em Rede:
Desenvolvimento (Marcos/Manuel/Jorge/Junior) ──> Samuel prioriza no Kanban ──> Maria testa UX/Funcional ──> Jorge valida AppSec/Áudio/Docs ──> Marcos valida código/rede ──> Samuel valida produto
```

---

## 🏗️ 3. Estrutura Organizacional e Frentes de Atuação

```text
               🎮 PRODUTO, GAME DESIGN & KANBAN
                     Samuel Menon Ramos (PO)
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
💻 TECNOLOGIA & DEVSECOPS  🌐 WEB & DOCUMENTAÇÃO   📈 MARKETING & CAPTAÇÃO
Marcos (Líder Técnico)     Junior (Node/React/TS)  Ramiro (Investidores/Pitch)
  ├─ Manuel (Ambiente/Colisões)↳ Conversão Markdown    ↳ Pitch Deck & One-Pager
  └─ Jorge (Web3/Áudio/Docs)   & Checagem Claude.md  ↳ Tese Web3 Híbrida / Saga
                                                        │
                                                        ▼
                                                🧪 QA & NARRATIVA
                                                Maria Clara (Funcional/Lore)
```

---

## 💻 4. Núcleo de Tecnologia & Engenharia

```text
📋 KANBAN / PRODUTO (Samuel)
│
▼
💻 FRENTE DE TECNOLOGIA & ENGENHARIA (Liderança & Ajuste do Time: Marcos)
┌───────────────────────────────────┬───────────────────────────────────┐
▼                                   ▼                                   ▼
Marcos                              Manuel                              Jorge Espindola
🎮 FishNet, Multiplayer em          🕹️ Gameplay Unity (C#)              🛡️ DevSecOps, AppSec,
   Tempo Real & Camada Off-chain       Ambiente do Game & Colisões         Anchor Web3, Áudio & Docs
```

---

## 🚀 5. Objetivo e Prioridades da Fase 2

> **Meta da Fase 2:** Entregar o **jogo 100% jogável, integrado e testável**, pronto para o Hackathon 2026 e apresentações a investidores.

### Prioridades Técnicas e Operacionais:
1. **Rede e Camada Off-chain (Marcos):** Arquitetura FishNet Host/Client e Dedicated Server, sincronização fluida e autoridade da partida off-chain.
2. **Ambiente do Game e Colisões (Manuel):** Montagem do cenário nas 3 rotas, colisões físicas, física de bombas e movimentação na Unity.
3. **Web3, Áudio e DevSecOps (Jorge):** Smart contracts Anchor em Rust na pasta `program/`, implementação de SFX/BGM na Unity, documentação técnica, CI/CD e anti-leak Gitleaks.
4. **Plataforma Web & Prompts (Junior):** Site responsivo com suporte a Phantom Wallet na pasta `app/` e esteira de documentação em Markdown com checagem contra o `Claude.md`.
5. **Validação de Experiência (Maria Clara):** Bateria de testes de usabilidade, homologação dos 4 testes corrigidos da Sprint 01 e revisão do lore.
6. **Envelopamento de Investidores (Ramiro + Samuel):** Finalização do One-Pager Executivo e Pitch Deck de 8 a 12 slides.

---

## 📋 6. Kanban — Fase 2 (Gestão: Samuel Menon Ramos)

### 📥 Backlog Futuro (Fases Posteriores)
* Mapas e skins secundárias de arena ([`Fowlgen-Wars-Sistema-de-Arenas.md`](../skills/Fowlgen-Wars-Sistema-de-Arenas.md)).
* Marketplace completo de NFTs e coleções em Mainnet.
* Dublagens e frases regionais expandidas.
* Torneios e publicação em escala na Google Play e Solana Mobile DApp Store.

### 📌 Ready — Tarefas Prontas para Execução

* **💻 Rede & Multiplayer (Marcos):**
  - [ ] Implementar e validar topologia FishNet Host/Client para modo 1v1 local (`POC-NET-01`).
  - [ ] Sincronização de estado da partida e vida do Galinheiro na camada off-chain.
  - [ ] Alinhamento técnico contínuo e code review com Manuel e Jorge.

* **🕹️ Unity / Ambiente & Colisões (Manuel):**
  - [ ] Estruturação do ambiente do game e waypoints das 3 rotas na cena `Arena3Lanes.unity`.
  - [ ] Sistema de colisão física com o cenário, torres e minions (`POC-UNI-02`).
  - [ ] Física e área de explosão das bombas.
  - [ ] Conexão dos botões e slots de habilidade no HUD (`POC-UNI-03`).

* **🛡️ Web3, DevSecOps, Áudio & Docs (Jorge):**
  - [ ] Smart contract Anchor em Rust na pasta `program/` e sincronização de IDL (`POC-03`/`POC-04`).
  - [ ] Implementação do AudioManager na Unity com os 5 SFX essenciais (`POC-UNI-04`).
  - [ ] Configuração do pipeline GitHub Actions com Gitleaks para verificação de segredos.
  - [ ] Pipeline CI/CD para Anchor (`cargo check`, `cargo clippy`, `cargo audit`, `anchor test`).
  - [ ] Criação do Dockerfile headless Linux para o Dedicated Game Server FishNet.
  - [ ] Documentação técnica de arquitetura híbrida e relatórios de segurança.

  - [ ] Criação do Dockerfile headless Linux para o Dedicated Game Server FishNet.
  - [ ] Threat Modeling da arquitetura híbrida para validação de partidas on-chain.
  - [ ] Auditoria e blindagem do `.gitignore` em todas as frentes.

* **🌐 Web & Documentação (Junior):**
  - [ ] Setup e responsividade do site em Node.js / React / TypeScript (`app/`).
  - [ ] Conexão com carteira Phantom via Solana Wallet Adapter no site.
  - [ ] Rotina de conversão de prompts do Samuel em `.md` com checagem no `Claude.md`.

* **📈 Marketing & Captação (Ramiro):**
  - [ ] One-Pager Executivo consolidado para investidores.
  - [ ] Pitch Deck de 8 a 12 slides estruturado.
  - [ ] Mapeamento de contatos e editais de fomento.

* **🧪 QA & Narrativa (Maria Clara):**
  - [ ] Execução de checklist funcional da Fase 2.
  - [ ] Teste de jogabilidade nos modos Batalha Rápida (Solo vs IA) e 1v1.
  - [ ] Revisão textual das fichas dos 4 personagens do MVP.

* **📋 Produto & Kanban (Samuel):**
  - [ ] Organização e priorização dos cards no GitHub Projects.
  - [ ] Acompanhamento do progresso das frentes e remoção de bloqueios.

---

## 🔄 7. Ciclo de Vida Obrigatório de uma Tarefa

$$\text{BACKLOG} \longrightarrow \text{READY} \longrightarrow \text{IN PROGRESS} \longrightarrow \text{REVIEW} \longrightarrow \text{QA} \longrightarrow \text{DONE}$$

### Exemplo Prático:
1. Manuel implementa o arremesso de bombas em C# na Unity.
2. Marcos e Jorge revisam o código e scripts (*Review / AppSec*).
3. Maria Clara testa a sensação e resposta dos controles touch (*QA Funcional*).
4. Samuel move o card no Kanban e valida a conformidade com o GDD (*Aprovação do PO* $\rightarrow$ **DONE**).

---

## 🤝 8. Princípios e Regras de Ouro da Equipe

* **Ajude e Seja Ajudado:**
  1. Tentar entender.
  2. Pesquisar.
  3. Tentar solucionar.
  4. Se persistir travado, levantar a mão imediatamente e pedir ajuda.
* **Comunicação Ativa:** *"Quem sabe, compartilha. Quem não sabe, pergunta. Quem aprende, ensina."*
* **Regra de Ouro da Entrega:**  
  $$\text{1 Tarefa} \longrightarrow \text{1 Responsável} \longrightarrow \text{1 Critério de Aceite} \longrightarrow \text{1 Teste} \longrightarrow \text{1 Entrega}$$
* **Diretrizes Rápidas:**
  * 🐔 Menos conversa solta $\rightarrow$ **Mais cards no Kanban**.
  * 🐔 Menos tarefas abertas $\rightarrow$ **Mais entregas concluídas**.
  * 🐔 Menos sobrecarga individual $\rightarrow$ **Mais colaboração em rede**.
  * 🐔 Menos ideias soltas $\rightarrow$ **Mais protótipo funcionando**.

