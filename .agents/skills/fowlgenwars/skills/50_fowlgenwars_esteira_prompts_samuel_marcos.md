# 🐔 Esteira de Prompts: Samuel (WhatsApp) ➔ Marcos (.md) ➔ OpenSpec & Kanban

> **Documento Oficial de Rastreabilidade e Governança Criativa**  
> **Projeto:** Fowlgen Wars | **Estúdio:** G5B Studios  
> **Data de Atualização:** 16 de Outubro de 2026  

---

## 🧭 1. A Dinâmica de Criação e Engenharia: Samuel & Marcos

A vasta maioria dos documentos e especificações reunidos na pasta [`prompt/skills/`](./skills/) nasceu da parceria direta de desenvolvimento ágil entre **Samuel Menon Ramos** e **Marcos**:

```text
┌───────────────────────────────┐
│     👑 SAMUEL MENON RAMOS     │
│   (PO & Game Designer Lead)   │
│   • Concepção de Game Design  │
│   • Ideias de mecânicas       │
│   • Lore, humor e frases      │
│   • Economia e balanceamento  │
└──────────────┬────────────────┘
               │  💬 Mensagens, áudios e prompts no WhatsApp
               ▼
┌───────────────────────────────┐
│           💻 MARCOS           │
│   (Líder Técnico & Core Dev)  │
│   • Leitura e interpretação   │
│   • Estruturação em Markdown  │
│   • Diagramas ASCII e camadas │
│   • Viabilidade Unity / Web3  │
└──────────────┬────────────────┘
               │  📁 Arquivos .md estruturados em prompt/skills/
               ▼
┌───────────────────────────────┐
│           🌐 JUNIOR           │
│    (Dev Web & Gestão Docs)    │
│   • Checagem contra Claude.md │
│   • Prevenção de conflitos    │
│   • Atualização do site app/  │
└──────────────┬────────────────┘
               │  🔄 Transformação em Propostas & Checklists
               ▼
┌───────────────────────────────┐
│      📋 OPENSPEC & KANBAN     │
│   • Tarefas da Sprint (MVP)   │
│   • Funil de Ideias (Design)  │
│   • Analytics em Tempo Real   │
└───────────────────────────────┘
```

### Papéis na Esteira:
1. **Samuel (O "Quê" e o "Por Quê"):** Enviava os briefings, fluxos de jogo, regras cômicas de galinhas guerreiras, inspiração no xadrez, tipos de bombas e recompensas diretamente no WhatsApp.
2. **Marcos (O "Como" e a Arquitetura):** Coletava os textos brutos do WhatsApp, formatava em Markdown (`.md`), adicionava diagramas de blocos, delimitava camadas (ex: 6 camadas da armadilha, 10 essências, 8 camadas do personagem) e alinhava à engine Unity e smart contracts Anchor.
3. **Junior (A Guarda de Coerência):** Checava os documentos contra o `Claude.md` para evitar contradições (ex: impedir que ideias descartadas de 4 rotas ou cartas sobrescrevessem a arena canônica de 3 rotas).
4. **OpenSpec & Kanban Studio:** Consolida cada ideia em uma proposta rastreável (`proposal.md` + `tasks.md`), disponível para visualização e controle da equipe.

---

## 📊 2. Matriz de Mapeamento Completo dos 45 Documentos de `prompt/skills/`

| # | Arquivo em `prompt/skills/` | Origem do Prompt (Samuel / WhatsApp) | Estruturação Técnica (Marcos / .md) | Vínculo OpenSpec | Status no Kanban |
|---|---|---|---|---|---|
| **01** | `01_fowlgenwars_a_logica_do_fowlgen_wars.md` | Visão de longo prazo e evolução gradual (MVP primeiro) | Filosofia de projeto e escala de produto | `openspec/specs/moba-combat.md` | 📜 Canônico |
| **02** | `07_fowlgenwars_folwgen_wars_terreno_mapa_3rota_3torres_cada.md` | Terreno de 3 rotas com 18 torres de defesa | Geometria das pontes e waypoints | `arena-clean-consolidacao-moba` | ✅ Concluído |
| **03** | `🐔 Mini-Moba-MVP.md` | Adaptação das 3 rotas para combate rápido de 3 min | Mapeamento da cena `Arena_Clean.unity` | `arena-clean-consolidacao-moba` | ✅ Concluído |
| **04** | `13_fowlgenwars_sistema_de_poderes.md` | 4 poderes pré-equipados com preparação prévia | Teclas Q, W, E, R e cooldowns na HUD | `arena-clean-consolidacao-moba` | ✅ Concluído |
| **05** | `18_fowlgenwars_fowlgen_wars_minions.md` | Geração de tropas contínuas em marcha pelas rotas | Classes `MinionAgent` e rotas Top/Mid/Bot | `combate-colisoes-e-destruicao-base` | ✅ Concluído |
| **06** | `06_fowlgenwars_fowlgen_wars_regras_de_combate_e_torres.md` | Dano e vitória ao destruir o Galinheiro | Hitboxes, `StructureGalinheiro` e eventos | `combate-colisoes-e-destruicao-base` | ✅ Concluído |
| **07** | `36_fowlgenwars_fowlgen_wars_biblioteca_efeitos_sonoros.md` | Lista de sons: cocoricó, socos, penas, explosão | `AudioManager.cs` e sintetizador procedural | `audio-central-e-vfx-procedurais` | ✅ Concluído |
| **08** | `14_fowlgenwars_fowlgen_wars_sistema_de_nivelamento_proporcional.md` | Fair play absoluto, proteção anti-pay-to-win | Normalização de atributos competitivos | `openspec/specs/moba-combat.md` | ✅ Concluído |
| **09** | `40_fowlgenwars_fowlgen_wars_setup_fishnet.md` | Multiplayer em tempo real sem latência Web3 | Topologia Host/Client e Dedicated Server | `multiplayer-fishnet-1v1-hibrido` | ⚡ Em Progresso |
| **10** | `41_fowlgenwars_fowlgen_wars_setup_solanasdk.md` | Conexão à Solana Devnet com carteiras móveis | Integração `SolanaManager` e IDL Anchor | `poc-02-03-smart-contract-anchor-solana` | ✅ Concluído |
| **11** | `11_fowlgenwars_hierarquia_de_personagens.md` | Espécie, classe, função, clã e essência | Matriz de ScriptableObjects de heróis | `animacoes-personagens-mixamo` | ⚡ Em Progresso |
| **12** | `10_fowlgenwars_fowlgen_personagens_nome.md` | Nomes carismáticos (Milo, Axel, Galia, Rodilan) | Mapeamento de prefabs e avatares | `animacoes-personagens-mixamo` | ⚡ Em Progresso |
| **13** | `Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md` | Cronograma de 10 dias com meta 10/10/2026 | Estruturação de todas as 15 POCs | Todas as 15 Features | 🎯 Roadmap |
| **14** | `Fowlgen-Wars-Mapa-Tecnico-da-Fase-3.md` | Escala técnica dos 18 degraus de evolução | Quebra atômica de tarefas e critérios | Backlog e Sprints | 🎯 Técnico |
| **15** | `19_fowlgenwars_fowlgen_camada_estrategica_inspirada_no_xadrez.md` | Controle do centro, tempo e Galinheiro como Rei | Diagrama tático e área de controle | `ideia-camada-tatica-xadrez` | 🔍 Em Validação |
| **16** | `20_fowlgenwars_fowlgen_wars_sistema_de_taticas_de_batalha.md` | Cravadas, espetos e sacrifício tático no MOBA | Parâmetros de timing e iniciativa | `ideia-camada-tatica-xadrez` | 🔍 Em Validação |
| **17** | `21_fowlgenwars_fowlgen_wars_ajustes_do_sistema_de_taticas_de_guerra.md` | Dupla estratégica inseparável (ADC + Suporte) | Formação em bloco e prioridades de IA | `ideia-dupla-estrategica-duo` | 🔍 Em Validação |
| **18** | `22_fowlgenwars_fowlgen_sistema_de_armadilhas_personalizadas.md` | Armadilhas estratégicas sem menus complexos | 6 camadas modulares de armadilha | `ideia-armadilhas-personalizadas` | 💡 Novas Ideias |
| **19** | `08_fowlgenwars_fowlgen_wars_sistema_de_arenas.md` | 6 Arenas temáticas sobre a mesma geometria | Variação de URP, iluminação e props | `ideia-skins-arenas-tematicas` | 💡 Novas Ideias |
| **20** | `26_fowlgenwars_sistema_de_recompensas.md` | 7 a 10 micro-recompensas e baús pós-jogo | Categorias de moedas (Ouro, Gemas) | `ideia-economia-micro-recompensas` | 💡 Novas Ideias |
| **21** | `03_fowlgenwars_mini_moba.md` (4 rotas) | Ideia preliminar da Sprint 01 com 4 rotas | Avaliação de ergonomia e descarte | `ideia-legada-arena-4-rotas` | ❌ Rejeitado |
| **22** | `35_fowlgenwars_fwolgen_wars_frases_de_combate.md` | Frases cômicas de combate e regionalismos | Gatilhos de áudio e eventos de fala | `audio-central-e-vfx-procedurais` | 🔍 Em Validação |
| **23** | `12_fowlgenwars_fowlgen_wars_sistema_de_cores_essencias_e_classificacao.md` | As 10 essências primárias e identidades visuais | Matriz de cores e shaders de facção | `openspec/specs/arena-clean.md` | 🔍 Em Validação |
| **24** | `31_fowlgenwars_fowlgen_wars_a_era_passada.md` | Narrativa oficial e mitologia avícola | Lore canônico validado com Maria Clara | `showcase-cinemachine-video-pitch` | 🔍 Em Validação |
| **25** | `23_fowlgenwars_fowlgen_wars_caos_total.md` | Modo rápido alternativo com multiplicadores | Regras de eventos sazonais pós-MVP | Backlog Pós-MVP | 💡 Novas Ideias |
| **26** | `49_fowlgenwars_fowlgen_wars_balanceamento_nerfs_upgrades.md` | Metodologia de balanceamento e patches | Governança de parâmetros do jogo | Backlog Pós-MVP | 💡 Novas Ideias |
| **27** | `45_fowlgenwars_fowlgen_wars_privacidade_zk_cloak.md` | Proposta de privacidade com ZK-SNARKs | Estudo de viabilidade de rede | Backlog Web3 | 💡 Novas Ideias |
| **28** | `33_fowlgenwars_fowlgen_wars_conceitos_de_logotipo.md` | Identidade visual da marca e logotipo épico | Assets gráficos e aprovação da marca | `poc-01-fundacao-unity-telas` | ✅ Concluído |
| **29** | `34_fowlgenwars_fowlgen_wars_estudo_de_cores.md` | Matriz cromática e contraste MOBA mobile | Paleta de cores da UI e das barras de HP | `arena-clean-consolidacao-moba` | ✅ Concluído |
| **30** | `38_fowlgenwars_fowlgen_wars_faixas_etarias_publico_alvo.md` | Dados demográficos e foco em mobile casual/core | Pesquisa de mercado e direcionamento | `showcase-cinemachine-video-pitch` | 📜 Pitch Deck |
| **31** | `Fowlgen-Wars-GDD-MVP.md` | Game Design Document unificado do MVP | Síntese de regras vigentes para código | `openspec/specs/moba-combat.md` | 📜 Canônico |
| **32** | `43_fowlgenwars_fowlgen_wars_guia_completo_detalhado.md` | Instruções de compilação Solana e Unity | Setup de ambiente e dependências | `kanban/MANUAL.md` | 🛠️ Setup |
| **33** | `42_fowlgenwars_fowlgen_wars_guia_setup_contrato_repositorio.md` | Instruções de testes e deploy na Devnet | Guia prático de comandos cargo e anchor | `poc-02-03-smart-contract-anchor-solana` | ✅ Concluído |
| **34** | `46_fowlgenwars_fowlgen_wars_guia_mcp_unity_metaplex_antigravity.md` | Integração de MCP Servers e ferramentas de IA | Configuração da Antigravity IDE | Infraestrutura | 🛠️ Setup |
| **35** | `39_fowlgenwars_fowlgen_wars_pesquisa_captacao_recursos_2026_v1.md` | Mapeamento de investidores, editais e Colosseum | Tese de negócios para o Ramiro | `submissao-oficial-hackathon-colosseum` | 📈 Pitch |
| **36** | `47_fowlgenwars_fowlgen_wars_relatorio_metaplex_skills_cli_vs_mcp.md` | Análise comparativa CLI vs MCP Solana | Escolha de stack para o time técnico | `openspec/specs/solana-anchor.md` | 📜 Estudo |
| **37** | `Fowlgen-Wars-Roadmap-de-Pocs.md` | Roadmap de longo prazo em 5 Fases | Arquitetura alvo para lançamento | Planejamento Macro | 🎯 Macro |
| **38** | `09_fowlgenwars_fowlgen_wars_telas_game.md` | Telas mobile em landscape e joystick virtual | Implementação de Canvas e botões | `arena-clean-consolidacao-moba` | ✅ Concluído |
| **39** | `44_fowlgenwars_integracao_solana_tokens_nfts_unity_publicacao_dapps_store.md` | Arquitetura híbrida e Solana Mobile Store | Tese comercial de Web2 + Web3 | `portal-web-hub-app` | ⚡ Em Progresso |
| **40** | `Prompt-apresentacao-sprint-1.md` | Roteiro de prestação de contas da Sprint 01 | Regras de distinção entre feito e planejado | Histórico | 📜 Histórico |
| **41** | `48_fowlgenwars_relatorio_fowlgen_wars.md` | Relatório consolidado de evolução técnica | Síntese das conquistas e entregas | Histórico | 📜 Histórico |
| **42** | `fowlgen-wars-regras-hackathon-2026.md` | Regras oficiais da Colosseum e Superteam Brasil | Checklist de elegibilidade e submissão | `submissao-oficial-hackathon-colosseum` | 📋 A Fazer |
| **43** | `🐔 Fowlgen-Wars-Sprint-01.md` | Escopo e lições aprendidas da Sprint 01 | Histórico dos testes que geraram as POCs | Histórico | 📜 Histórico |
| **44** | `32_fowlgenwars_sistema_padrao_de_criatividadee_e_design.md` | Uso responsável de IA e documentação de prompts | Princípios de originalidade da equipe | Governança | 📜 Princípios |
| **45** | `02_fowlgenwars_exemplos_modelo_adaptado_fowlgen_wars_do_game_seven_seas.md` | Estudo de arquitetura desacoplada (jogo vs Web3) | Padrão técnico que embasa o FishNet | `openspec/specs/fishnet-multiplayer.md` | 📜 Referência |

---

## 🎮 3. Como Operar o Kanban Studio com Esta Estrutura

Ao acessar o **Kanban Studio** no navegador (`http://localhost:3000` via `npm run app`):

### 🎯 3.1. Aba "Tarefas da Sprint" (Execução Técnica do MVP)
- Mostra o status operacional do código e builds na branch `main`:
  - **📋 A Fazer:** Tarefas pendentes de início (ex: geração de APK físico com Maria Clara, regra de desempate do timer pelo PO Samuel, submissão final).
  - **⚡ Em Progresso:** Módulos em desenvolvimento ativo (Multiplayer FishNet 1v1 com Marcos, Rigs e Animações com Emanuel/Vaguinhow, Portal Web com Junior).
  - **👀 Em Revisão:** Módulos prontos aguardando homologação em aparelho físico (Transação de vitória com Jorge, Vídeo Pitch com Samuel/Ramiro, Pipeline CI/CD).
  - **✅ Concluído:** Entregas 100% validadas e testadas (Fundação Unity, Smart Contracts Devnet, Arena_Clean consolidada, Combate físico e Áudio/VFX).

### 💡 3.2. Aba "Funil de Ideias" (Governança e Design Samuel & Marcos)
- Permite acompanhar e gerenciar todas as ideias conceituais originadas no WhatsApp:
  - **💡 Novas Ideias:** Propostas catalogadas aguardando priorização (Armadilhas Personalizadas, Skins de Arenas, Economia de Micro-Recompensas).
  - **🔍 Em Validação:** Ideias em refinamento ativo pelo time (Camada de Xadrez, Duplas Estratégicas Duo, Frases de Combate).
  - **✅ Aprovadas:** Conceitos aprovados que foram promovidos a tarefas técnicas do MVP.
  - **❌ Rejeitadas:** Ideias descartadas com justificativa registrada (ex: Arena legada de 4 rotas descartada em prol da Arena_Clean de 3 rotas).
- **Ações Rápidas em 1 Clique:**
  - Clique em **`🔍 Validar`** para mover uma ideia para análise técnica.
  - Clique em **`✅ Aprovar`** para promover a ideia para desenvolvimento.
  - Clique em **`❌ Rejeitar`** para arquivar a ideia com justificativa de negócio.
  - Clique em **`🎯 Ver Tarefas`** para navegar diretamente para o card de execução da sprint.

### 👥 3.3. Filtro por Integrante
- Na barra superior do Kanban Studio, clique na foto/emoji de qualquer integrante para filtrar instantaneamente suas tarefas:
  - 👑 **Samuel:** Ideias de game design, decisões de PO, roteiro do pitch e gestão do kanban.
  - 💻 **Marcos:** Arquitetura off-chain (FishNet), integração Unity, smart contracts e coordenação técnica.
  - 🕹️ **Emanuel:** Cena `Arena_Clean.unity`, física de colisões, movimentação e rigs.
  - 🛡️ **Jorge:** Smart contracts Anchor em Rust, SFX/BGM, mixers e DevSecOps.
  - 🌐 **Junior:** Desenvolvimento web em `app/` e esteira de documentação.
  - 🧪 **Maria Clara:** Testes de gameplay, UX mobile em aparelho físico e coerência do lore.
  - 📈 **Ramiro:** Pitch deck, relações com investidores e estratégia de captação.
