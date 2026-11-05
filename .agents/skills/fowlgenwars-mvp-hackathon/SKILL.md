---
name: fowlgenwars-mvp-hackathon
description: Arquivo histórico do MVP e Hackathon 2026 do Fowlgen Wars (Sprint 01, POCs 01-05, Colosseum, roadmaps e relatórios das Fases 1-4). Use SOMENTE quando a tarefa citar MVP, hackathon, Sprint 01 ou as POCs antigas. Para o game completo use a skill fowlgenwars.
---

# Fowlgen Wars — MVP / Hackathon 2026 (histórico)

> **Escopo encerrado.** Esta skill preserva o contexto do MVP e do Hackathon 2026. Prazos, restrições de escopo ("não implementar X"), inventário de POCs e roadmaps aqui eram válidos para aquele momento e **não se aplicam ao game completo**. As POCs serão elaboradas novamente. Para o desenvolvimento atual, leia [`fowlgenwars`](../fowlgenwars/SKILL.md).

## Índice dos documentos do MVP/Hackathon

- [`🐔 Fowlgen-Wars-Sprint-01.md`](skills/%F0%9F%90%94%20Fowlgen-Wars-Sprint-01.md): objetivos da Sprint 01, protótipo simples inspirado em Pong, papéis e artefatos.
- [`Prompt-apresentacao-sprint-1.md`](skills/Prompt-apresentacao-sprint-1.md): regras para relatar a Sprint 01 sem inventar e distinguindo realizado, em teste, pendente e planejado. A instrução para ignorar o roadmap alterado é específica desse vídeo/relatório, não uma regra geral para outras tarefas.
- [`Fowlgen-Wars-GDD-MVP.md`](skills/Fowlgen-Wars-GDD-MVP.md): visão consolidada do Mini-MOBA MVP; complementa o arquivo Mini-MOBA MVP existente, sem substituí-lo.
- [`Fowlgen-Wars-Roadmap-de-Pocs.md`](skills/Fowlgen-Wars-Roadmap-de-Pocs.md): roadmap canônico oficial de longo prazo (Fases 01 a 05 com arquitetura alvo Web3 Multiplayer).
- [`Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md`](skills/Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md): roadmap operacional sprint express do Hackathon 2026 (Colosseum e Superteam Brasil); separa Anchor e Unity em POCs modulares, foca no prazo máximo de entrega e orienta a resolução dos testes pendentes.
- [`Fowlgen-Wars-Mapa-Tecnico-da-Fase-3.md`](skills/Fowlgen-Wars-Mapa-Tecnico-da-Fase-3.md): mapa técnico incremental da Fase 3 em 18 níveis objetivos (do protótipo simples à primeira partida completa jogável e homologação de build/vídeo para o hackathon).
- [`🐔 Mini-Moba-MVP.md`](skills/%F0%9F%90%94%20Mini-Moba-MVP.md): adaptação do conceito Mini-MOBA para o mapa de três rotas e 18 torres; não confundir com a versão original de quatro rotas.
- [`fowlgen-wars-regras-hackathon-2026.md`](skills/fowlgen-wars-regras-hackathon-2026.md): regras oficiais, critérios de avaliação, requisitos de submissão e checklist operacional do Colosseum Global Hackathon 2026 e Trilha Brasil (Superteam Brasil).
### Trilhas Operacionais do MVP (`skills/mvp/`)
- [`Fowlgen-Wars-Etapas-MVP-Unity.md`](skills/mvp/Fowlgen-Wars-Etapas-MVP-Unity.md): checklist operacional passo a passo de desenvolvimento e polimento da frente Unity do MVP.
- [`Fowlgen-Wars-Etapas-MVP-Backend.md`](skills/mvp/Fowlgen-Wars-Etapas-MVP-Backend.md): tarefas e etapas operacionais do servidor headless FishNet e serviços de backend.
- [`Fowlgen-Wars-Etapas-MVP-Web.md`](skills/mvp/Fowlgen-Wars-Etapas-MVP-Web.md): tarefas de desenvolvimento web para o portal e interface web do projeto.
- [`Fowlgen-Wars-Producao-API-Onix.md`](skills/mvp/Fowlgen-Wars-Producao-API-Onix.md): requisitos de ambiente, configuração e deploy em produção da API Onix.
- [`Relatorio_Fase1_Instalacao.md`](files/relatorios/Relatorio_Fase1_Instalacao.md): Relatório de Inicialização e Setup (WSL, Docker, Autenticação Solana).
- [`Relatorio_Fase2_MVP.md`](files/relatorios/Relatorio_Fase2_MVP.md): Relatório da Fase 2 (Personagens, Habilidades, HUD, Spawner).
- [`Relatorio_Fase3_MVP.md`](files/relatorios/Relatorio_Fase3_MVP.md): Relatório da Fase 3 (Mapa de 3 rotas, Torres de defesa, Grid de colisão).
- [`Relatorio_Fase4_MVP.md`](files/relatorios/Relatorio_Fase4_MVP.md): Relatório da Fase 4 (Migração de infraestrutura: Docker Compose para Kubernetes/Minikube, K8s Secrets e Dedicated Game Server FishNet).
- [`Relatorio_Andamento_Etapas_MVP_Unity.md`](files/relatorios/Relatorio_Andamento_Etapas_MVP_Unity.md): relatório de acompanhamento de status das etapas de desenvolvimento do MVP Unity.
- [`Planilha_Analise_Desenvolvimento_EAP.md`](files/relatorios/Planilha_Analise_Desenvolvimento_EAP.md) e [`Fowlgen_Wars_Analise_EAP_MVP.xlsx`](files/relatorios/Fowlgen_Wars_Analise_EAP_MVP.xlsx): Estrutura Analítica de Projeto (EAP/WBS) mapeando escopo, estimativas e entregas do MVP.
- [`Relatorio_Consolidacao_Arena_Clean_MVP.md`](files/relatorios/Relatorio_Consolidacao_Arena_Clean_MVP.md): relatório técnico da consolidação da arena única e canônica `Arena_Clean.unity` e saneamento de cenas legadas.

## Divergências e status do MVP (registro histórico)

- O projeto possui dois roadmaps alinhados com propósitos complementares:
  1. [`Fowlgen-Wars-Roadmap-de-Pocs.md`](skills/Fowlgen-Wars-Roadmap-de-Pocs.md): roadmap canônico de longo prazo (Fases 01 a 05, cobrindo fundação, ativos on-chain, multiplayer com Dedicated Game Server e publicação).
  2. [`Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md`](skills/Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md): roadmap operacional e pragmático para o Hackathon 2026, com foco na entrega do **game 100% jogável até 10/10/2026** (antecipando o prazo final oficial da Colosseum de 12/10/2026 às 23h59 PDT / 13/10 às 03h59 BRT), separação modular das POCs de Anchor e Unity, e resolução pontual dos 4 testes de QA reprovados.
- Inventário da Fase 1, Telas e Testes NÃO Reprovados (Validados e Funcionais):
  - **Inicialização Unity:** ✅ Aprovado no QA da Sprint 01 (inicialização do motor, ciclo de vida e GameBootstrap operando).
  - **Telas e UI Funcionais da Fase 1:**
    - [`Play.unity`](../../../unity/Assets/Scenes/Game/Play.unity) e [`MainMenuController.cs`](../../../unity/Assets/Modules/Presentation/Controllers/MainMenuController.cs): tela inicial responsiva, navegação de cenas e seletor das POCs.
    - [`POCScreenUI.cs`](../../../unity/Assets/Modules/POC/POCScreenUI.cs) e [`POCSceneRoot.cs`](../../../unity/Assets/Modules/POC/POCSceneRoot.cs): sistema de telas de teste com tabela de status, botões de ação e feedback visual via toasts (verde, amarelo e vermelho).
  - **POCs da Fase 01 Validadas (Cenas e Scripts C#):**
    - `POC 01` ([`Modules/POC/POC01Controller.cs`](../../../unity/Assets/Scenes/POC/Modules/POC/POC01Controller.cs)): Fundação Unity, checagem de plataforma e Canvas.
    - `POC 02` ([`Modules/POC/POC02Controller.cs`](../../../unity/Assets/Scenes/POC/Modules/POC/POC02Controller.cs)): Conexão via Solana Unity SDK (`SolanaManager`, `SolanaConnection`) com a Solana Devnet (`https://api.devnet.solana.com`).
    - `POC 03` ([`Modules/POC/POC03Controller.cs`](../../../unity/Assets/Scenes/POC/Modules/POC/POC03Controller.cs)): Workspace Anchor estruturado e contrato Rust compilado.
    - `POC 04` ([`Modules/POC/POC04Controller.cs`](../../../unity/Assets/Scenes/POC/Modules/POC/POC04Controller.cs)): Leitura e parsing de IDL (`fowlgen_wars_contract.json`) e preparação das instruções.
    - `POC 05` ([`Modules/POC/POC05Controller.cs`](../../../unity/Assets/Scenes/POC/Modules/POC/POC05Controller.cs)): Conexão de carteira (Phantom via Mobile Wallet Adapter, importação da área de transferência ou keypair Devnet), consulta de saldo em SOL e envio de transações reais confirmadas no contrato ativo da Devnet (`81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`).
  - **Smart Contract Anchor On-Chain:**
    - Teste de integração [`test_initialize.rs`](../../../program/programs/fowlgen_wars_contract/tests/test_initialize.rs) ✅ Aprovado com 100% de sucesso via LiteSVM (`cargo test` executado e passando em 0.29s).
    - Contrato implantado e executável na Solana Devnet sob o Program ID `81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`.
- Status dos Testes Reprovados da Sprint 01 (Foco Exclusivo de Correção na Trilha Unity):
  - Validados em PlayMode batch em 2026-10-13 (`unity/Assets/Tests/Gameplay/CombatAndBaseDestructionTests.cs` 4/4 PASS — `TmpTestBatch.Run`, ver `fw_run8.log`): colisão por overlap + detecção, dano parametrizado (`MinionDataSO`), HP da base e evento único `OnStructureDestroyed` (POC-UNI-02 / itens 27 + 30). FacingMinions comprova frente-a-frente parada + troca de dano até derrota em runtime em 1.5m + destruição da base por minion aliado. Pendência residual: bloqueio físico por `transform.position` (sem física) ainda não valida barreira/terreno; desempate do timer (`GameMatchManager` `playerHp >= enemyHp`) pendente PO.
  - Multiplayer FishNet (`unity/Assets/Modules/POC/FishNetMultiplayer.cs` + `FishNetPOCLauncher.cs`) integrado para teste local na `Arena_Clean` (`NetworkManager` + `NetworkObject`/`FishNetPOC` na cena, 10810af); `CmdTakeDamage` → `TakeDamage` validado via SyncVars, Docker headless ainda Backlog.

## Regras do Hackathon 2026 e MVP Express (escopo encerrado)

- **Cronograma e Datas Limite Estritas:**
  - **Meta Interna da Equipe:** Entrega do **GAME 100% FUNCIONANDO até o dia 10 de outubro de 2026** (APK jogável, loop de combate de 3 minutos, áudio, UI, transação Devnet e multiplayer híbrido operando perfeitamente).
  - **Prazo Oficial Impreterível do Hackathon Colosseum 2026:** **12 de outubro de 2026, às 23h59 PDT (horário da Califórnia)**, correspondente a **13 de outubro de 2026, às 03h59 BRT (horário de Brasília)**.
  - A entrega no dia 10/10/2026 assegura uma margem de segurança de 48 horas para testes finais de estresse de QA (Maria Clara), refinamento do vídeo pitch de no máximo 3 minutos (Samuel) e homologação sem risco na Colosseum Arena e Superteam Brasil.
- **Padrão Canônico de Especificação das POCs:** O documento [`Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md`](skills/Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md) adota rigorosamente o padrão estrutural de [`Fowlgen-Wars-Roadmap-de-Pocs.md`](skills/Fowlgen-Wars-Roadmap-de-Pocs.md), detalhando para cada POC: *Objetivo, Responsável, Passos Detalhados, Estrutura Técnica & Scripts, Critério de Aceite, Procedimento de Teste e Entregáveis*.
- **Arquitetura Híbrida do MVP:** Para eliminar o risco do "jurado solitário" e demonstrar multiplayer em tempo real no vídeo de pitch, o jogo possui:
  1. *Modo Batalha Rápida (Solo vs IA):* Jogo offline/local nas 3 rotas, garantindo que qualquer jurado avalie a partida inteira sem depender de outro jogador online.
  2. *Modo Batalha 1v1 (FishNet Host & Client):* Conexão P2P/LAN para demonstração no vídeo pitch gravando 2 smartphones interagindo sincronizados em tempo real.
- **Desacoplamento de POCs para o time:** As frentes de smart contract Anchor (Rust) e gameplay Unity (C#) devem avançar de forma independente e paralela, evitando bloqueios mútuos.
- **Na Trilha Anchor:** O contrato deve manter testes automatizados passando 100% (`cargo test`), Program ID sincronizado com a Devnet (`81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`), IDL exportado para a Unity e chamadas verificáveis no Solana Explorer.
- **Na Trilha Unity:** Foco imediato na resolução dos 4 testes de QA reprovados na Sprint 01 (movimentação de unidades, colisões e dano estáveis, interatividade nos botões de UI e feedback de áudio), garantindo que a cena principal do jogo rode perfeitamente.
- **Na Integração:** Conexão via Solana Unity SDK, assinatura de transação de demonstração ao final da partida e leitura de skin/ativo.
- **Cena de Showcase Cinemachine/Animator (`POC-CIN-01`):** Apresentação cinematográfica *in-engine* na Unity com câmeras virtuais dinâmicas sobrevoando a arena e transição suave (*blend*) para a partida, utilizada como vitrine do produto nos primeiros 40 segundos do vídeo pitch.
- **Requisitos estritos de submissão:** Vídeo demo/pitch com duração estritamente ≤ 3 minutos (180s), APK Android jogável para os jurados e repositório público limpo sem secrets.
