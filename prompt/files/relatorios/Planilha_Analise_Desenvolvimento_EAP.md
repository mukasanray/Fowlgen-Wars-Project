# Planilha de Análise e Controle de Desenvolvimento — FOWLGEN WARS (MVP)

> **Documento Gerado a partir da EAP Canônica:** [Google Sheets - EAP Fowlgen Wars](https://docs.google.com/spreadsheets/d/1UCtXC9GVWa3XTZfa-G5-TJdJBmDukClKJ0bSLIkz22Y/edit?gid=1781560202#gid=1781560202)  
> **Data de Atualização:** 11 de Outubro de 2026  
> **Status Classificados:** `Encerrado`, `Em Andamento`, `Falta o que para tarefa encerrar o MVP`

---

## 📊 1. Resumo Consolidado do MVP (Hackathon 2026)

* **Total de Demandas Mapeadas na EAP:** 105 tarefas
* **Demandas do Escopo Core MVP (Tarefas 1 a 94):** 94 tarefas
* **Tarefas de Pós-MVP / Backlog Futuro (Tarefas 95 a 105):** 11 tarefas
* **Concluídas / Encerradas:** 20 tarefas base + avanços consolidados em código (Fases 1 a 4).
* **Foco Crítico Imediato para Encerrar o MVP:** Conectar o botão "Recompensa" das 4 telas ao smart contract Anchor e gerar a build `.apk` do Android.

---

## 📋 2. Planilha de Status do Desenvolvimento do Game

| # | Atividade / Demanda | Área Responsável | Status Atual | Falta o que para tarefa encerrar o MVP |
| :-: | :--- | :--- | :-: | :--- |
| **1** | Redigir regras de governança e papéis do time | Produto & GD | **Encerrado** | Tarefa concluída e homologada no `Claude.md`. |
| **2** | Estruturar minuta jurídica de NDA de membros | Business | **Encerrado** | Documentação jurídica concluída. |
| **3** | Estruturar minuta de cessão de IP e código | Business | **Encerrado** | Documentação jurídica concluída. |
| **4** | Criar Founders Agreement e vesting da equipe | Business | **Encerrado** | Acordo da equipe assinado. |
| **5** | Mapear regras e critérios do Hackathon 2026 | Produto & GD | **Encerrado** | Regras Colosseum e Superteam consolidadas em `skills/`. |
| **6** | Configurar projeto Unity 6000 com pipeline URP | Full Cycle | **Encerrado** | Pipeline URP, Input System e configurações ativas. |
| **7** | Implementar cena de teste POC_01 Foundation | Full Cycle | **Encerrado** | Validado no QA da Sprint 01. |
| **8** | Integrar Solana Unity SDK na cena POC_02 | Full Cycle | **Encerrado** | SDK instalado em `Packages/com.solana.unity_sdk`. |
| **9** | Testar consulta RPC assíncrona na Devnet | Full Cycle | **Encerrado** | RPC testado com sucesso na Solana Devnet. |
| **10** | Inicializar workspace Anchor no diretório program | Full Cycle | **Encerrado** | Contrato compilando e estruturado em `program/`. |
| **11** | Compilar smart contract Rust com initialize | Full Cycle | **Encerrado** | Instrução de inicialização compilada. |
| **12** | Gerar IDL JSON e exportar para pasta da Unity | Full Cycle | **Encerrado** | IDL oficial unificado em `Assets/Resources/fowlgen_wars_contract.json`. |
| **13** | Criar parser Borsh e IDL inspector na POC_04 | Full Cycle | **Encerrado** | `IdlInspector.cs` ativo em `Modules/Solana/Services/`. |
| **14** | Integrar Mobile Wallet Adapter MWA na POC_05 | Full Cycle | **Encerrado** | MWA e chave Phantom integrados no `WalletManager.cs`. |
| **15** | Executar assinatura de transação teste na Devnet | Full Cycle | **Encerrado** | Transações validadas no contrato `81Mpr...`. |
| **16** | Criar workflow GitHub Actions para Anchor CI | Full Cycle | **Encerrado** | Pipeline CI configurado. |
| **17** | Configurar testes com LiteSVM e Solana 1.18 | Full Cycle | **Encerrado** | Testes passando em 0.29s via LiteSVM. |
| **18** | Implementar scan com Gitleaks contra segredos | Full Cycle | **Encerrado** | Guardrails DevSecOps ativos. |
| **19** | Redigir checklist DevSecOps de segurança por POC | Full Cycle | **Encerrado** | Checklist homologado. |
| **20** | Configurar cena BattleArena com NavMesh gerado | Full Cycle | **Encerrado** | NavMesh gerado na cena `BattleArena` e `Arena.unity`. |
| **21** | Calibrar tabela de atributos dos 5 arquétipos | Produto & GD | **Em andamento** | Definir valores finais no `MinionDataSO.cs` (Galo Tanque, Frango Veloz, etc.). |
| **22** | Definir curvas de progressão do timer de 3 min | Produto & GD | **Encerrado** | `MatchConfigSO.cs` e `MatchRuntimeStateSO.cs` com 180s configurados. |
| **23** | Implementar spawner de tropas do Galinheiro | Full Cycle | **Encerrado** | `GameMatchManager.cs` com spawn por rota funcional. |
| **24** | Programar lógica de rotas e waypoints na arena | Full Cycle | **Encerrado** | `WaypointPath.cs` com rotas Top, Mid e Bot ativas. |
| **25** | Destacar visualmente rota ativa com shader leve | Full Cycle | **Falta para encerrar o MVP** | Adicionar feedback de contorno/luz na rota selecionada no chão. |
| **26** | Codificar FSM de combate em FowlgenUnit C# | Full Cycle | **Encerrado** | `FowlgenUnit.cs`, `HeroAgent.cs` e `MinionAgent.cs` com ciclo de estados. |
| **27** | Implementar colisão física e cálculo de dano | Full Cycle | **Encerrado** | Colisores de CharacterController e cálculo de ataque básico integrados. |
| **28** | Criar Floating Combat Text com dano animado | Full Cycle | **Falta para encerrar o MVP** | Instanciar texto com número flutuante do dano ao acertar o golpe. |
| **29** | Programar barras de vida flutuantes sobre tropas | Full Cycle | **Encerrado** | `WorldHealthBarView.cs` implementado no topo das unidades. |
| **30** | Codificar lógica de destruição da base inimiga | Full Cycle | **Encerrado** | `StructureGalinheiro.cs` dispara término e transição para Vitória/Derrota. |
| **31** | Implementar Camera Shake em impactos críticos | Full Cycle | **Encerrado** | `MobaCameraController.Instance.Shake()` acionado em impactos críticos, explosões e Ultimate R. |
| **32** | Criar contagem regressiva de início de partida | Full Cycle | **Encerrado** | `MatchCountdownIntro.cs` com overlay animado 3, 2, 1, LUTA!, som de UI e cocoricó sonoro. |
| **33** | Criar timer regressivo de partida de 3 minutos | Full Cycle | **Encerrado** | `MatchRuntimeStateSO.UpdateTimer()` com exibição na HUD. |
| **34** | Implementar tela de Vitória e Derrota da partida | Full Cycle | **Encerrado** | Cenas `Vitoria.unity` e `Derrota.unity` com `VitoriaPresenter` e `DerrotaPresenter`. |
| **35** | Otimizar pooling de objetos para 60 FPS mobile | Full Cycle | **Encerrado** | Sistema com reaproveitamento de instâncias e zero GC aloc no joystick. |
| **36** | Ajustar câmera isométrica com limites de toque | Full Cycle | **Encerrado** | `MobaCameraController.cs` com ângulos táticos travados. |
| **37** | Implementar menu de pausa com reinício | Full Cycle | **Falta para encerrar o MVP** | Botão de engrenagem na HUD para pausar o timescale e reiniciar. |
| **38** | Criar aviso de perda de conexão de internet | Full Cycle | **Falta para encerrar o MVP** | Toast de alerta caso RPC ou FishNet caia durante a partida. |
| **39** | Definir estrutura da conta PDA PlayerProfile | Full Cycle | **Encerrado** | PDA definida no contrato Anchor `program/`. |
| **40** | Codificar instrução record_battle_result em Rust | Full Cycle | **Encerrado** | Instrução de registro compilada no Anchor. |
| **41** | Criar instrução claim_reward para recompensas | Full Cycle | **Em andamento** | Sincronizar o botão "Recompensa" da UI de Vitória/Derrota à chamada RPC. |
| **42** | Otimizar limite de Compute Units da transação | Full Cycle | **Falta para encerrar o MVP** | Adicionar `SetComputeUnitLimit` na transação do Solana Unity SDK. |
| **43** | Escrever testes de integração LiteSVM do contrato | Full Cycle | **Encerrado** | Testes automatizados passando no Rust (`cargo test`). |
| **44** | Criar script helper para airdrop SOL na Devnet | Full Cycle | **Encerrado** | Botão e método `RequestAirdrop()` implementados no SDK. |
| **45** | Fazer deploy do contrato oficial na Devnet | Full Cycle | **Encerrado** | Contrato implantado no Program ID `81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`. |
| **46** | Executar smoke test automatizado pós-deploy | Full Cycle | **Encerrado** | Instruções validadas contra o cluster Devnet. |
| **47** | Integrar botão de liquidação pós-jogo no Unity | Full Cycle | **Em andamento** | Ligar botão "Recompensa" das telas de Vitória/Derrota com `TransactionManager`. |
| **48** | Criar modal de loading para processar transação | Full Cycle | **Falta para encerrar o MVP** | Feedback "Processando na Solana..." enquanto aguarda confirmação de bloco. |
| **49** | Exibir hash da transação com link Solana Explorer | Full Cycle | **Falta para encerrar o MVP** | Mostrar link clicável do explorer após receber a recompensa. |
| **50** | Implementar tratamento de erro e timeout RPC | Full Cycle | **Encerrado** | Try/catch e fallback para chave local implementados no `AuthPresenter`. |
| **51** | Modelar galos guerreiros low-poly no Blender | Multimídia | **Em andamento** | Modelos 3D iniciais (`Milo`, `BlueRooster`) importados em `Assets/Art/Characters`. |
| **52** | Modelar galinhas e tropas de apoio low-poly | Multimídia | **Encerrado** | Tropas `Minion_Caipira_Player` e `Minion_Rodilan_Enemy` com texturas e materiais URP Lit dedicados. |
| **53** | Criar rigs dos 5 arquétipos de personagens | Multimídia | **Em andamento** | Esqueleto básico dos personagens principais configurado. |
| **54** | Criar ciclos de animação Idle, Run e Attack | Multimídia | **Em andamento** | Clipes básicos atribuídos no Animator. |
| **55** | Criar animações de dano Hit e morte Death | Multimídia | **Falta para encerrar o MVP** | Adicionar clipes de animação de reação a golpe e queda. |
| **56** | Configurar materiais e texturas leves URP | Multimídia | **Encerrado** | Materiais URP organizados na diretriz `Assets/Art/Materials/`. |
| **57** | Exportar prefabs com Animator Controller | Multimídia | **Encerrado** | Prefabs de minions gerados e conectados. |
| **58** | Criar partículas VFX de ataque e explosão | Multimídia | **Encerrado** | `CombatVFXManager.cs` implementado com penas procedurais (feather burst), faíscas, aura de cura, shockwave e explosão. |
| **59** | Desenhar layout do HUD touch mobile no Figma | Produto & GD | **Encerrado** | Layout de 4 telas e HUD landscape definidos. |
| **60** | Criar logotipo oficial e ícone do app mobile | Multimídia | **Encerrado** | Identidade visual documentada e ícones de app. |
| **61** | Exportar sprites 2D de botões, barras e ícones | Multimídia | **Encerrado** | Sprites aplicados nos UXML/USS e joysticks táteis. |
| **62** | Montar tela de Menu Principal com UI Toolkit | Full Cycle | **Encerrado** | Tela `Play` operando com UI Toolkit (`PlayView.cs`, `PlayPresenter.cs`). |
| **63** | Montar HUD de combate com botões de spawn | Full Cycle | **Encerrado** | `GameplayHUDView.cs` com 3 rotas (Top, Mid, Bot) e joystick virtual. |
| **64** | Compor trilha sonora dinâmica de batalha | Multimídia | **Em andamento** | Trilha preliminar de arena produzida. |
| **65** | Compor tema musical cômico para o Menu | Multimídia | **Falta para encerrar o MVP** | BGM de lobby suave para as telas Auth e Play. |
| **66** | Produzir efeitos sonoros de cacarejos e passos | Multimídia | **Em andamento** | Efeitos sonoros coletados na biblioteca de SFX. |
| **67** | Produzir SFX de golpes, projéteis e explosões | Multimídia | **Encerrado** | SFX procedurais e suporte a clips de soco, impacto, cocoricó, explosão e habilidades em `AudioManager.cs`. |
| **68** | Configurar Audio Mixer Groups com Ducking | Multimídia | **Falta para encerrar o MVP** | Criar AudioMixer com canais Master, BGM e SFX no Unity. |
| **69** | Integrar AudioManager com pool de sons na Unity | Full Cycle | **Encerrado** | `AudioManager.cs` integrado com pool de áudio, conectado a Milo, Axel, Minions, Galinheiro e Countdown. |
| **70** | Programar controle de volume com PlayerPrefs | Full Cycle | **Falta para encerrar o MVP** | Sliders de volume salvar configurações no PlayerPrefs. |
| **71** | Integrar fluxo de login de carteira no MainMenu | Full Cycle | **Encerrado** | Fluxo de login e Phantom MWA concluído na tela `Auth`. |
| **72** | Exibir saldo de SOL e chave pública na UI | Full Cycle | **Em andamento** | Chave pública exibida na tela Play; binding visual do saldo em SOL em finalização. |
| **73** | Configurar pipeline de build APK Android Release | Full Cycle | **Em andamento** | PlayerSettings configurado para Android Landscape e ARM64. |
| **74** | Aplicar striping IL2CPP e compressão ASTC | Full Cycle | **Falta para encerrar o MVP** | Configurar Scripting Backend como IL2CPP no build Android. |
| **75** | Executar testes de compatibilidade em Android 10+ | Full Cycle | **Falta para encerrar o MVP** | Instalar APK no smartphone físico para teste de framerate e toque. |
| **76** | Executar auditoria anti-leak antes da submissão | Full Cycle | **Falta para encerrar o MVP** | Rodar scanner de segredos no git antes do commit da APK. |
| **77** | Gerar e validar build APK Release final | Full Cycle | **Falta para encerrar o MVP** | Gerar o arquivo `FowlgenWars_MVP_v1.0.apk`. |
| **78** | Hospedar APK e gerar link direto de download | Full Cycle | **Falta para encerrar o MVP** | Subir APK no Google Drive / GitHub Releases. |
| **79** | Estruturar tese econômica e modelo de sinks | Business | **Encerrado** | Tokenomics documentada em `skills/🐔 Sistema-de-Recompensas.md`. |
| **80** | Montar Pitch Deck executivo de 10-12 slides PDF | Business | **Em andamento** | Deck em finalização pelo Ramiro & Samuel. |
| **81** | Redigir FAQ de respostas para banca de jurados | Business | **Falta para encerrar o MVP** | Compilar perguntas técnicas e de modelo de negócio. |
| **82** | Redigir roteiro do vídeo de pitch de 180s | Marketing | **Em andamento** | Roteiro de 3 minutos em redação pelo Samuel. |
| **83** | Gravar cenas de gameplay a 60 FPS no Android | Marketing | **Falta para encerrar o MVP** | Capturar partida da arena no celular. |
| **84** | Gravar conexão de carteira e hash na Devnet | Marketing | **Falta para encerrar o MVP** | Gravar tela conectando Phantom e abrindo transação no Explorer. |
| **85** | Gravar narração em áudio profissional do pitch | Marketing | **Falta para encerrar o MVP** | Gravação da voz sobreposta ao gameplay. |
| **86** | Editar vídeo final de pitch e demo em até 180s | Marketing | **Falta para encerrar o MVP** | Edição final do vídeo para submissão oficial. |
| **87** | Criar thumbnail atrativa para o vídeo de pitch | Multimídia | **Falta para encerrar o MVP** | Arte de capa para o YouTube / Colosseum. |
| **88** | Produzir vídeo teaser de 15 segundos para redes | Marketing | **Falta para encerrar o MVP** | Teaser curto para Twitter/X do Superteam Brasil. |
| **89** | Fazer upload do vídeo no YouTube/Loom e testar | Marketing | **Falta para encerrar o MVP** | Link público do vídeo de pitch. |
| **90** | Criar link de backup do vídeo em nuvem (Drive) | Marketing | **Falta para encerrar o MVP** | Link alternativo de vídeo. |
| **91** | Validar perfis de membros na Superteam Earn | Produto & GD | **Falta para encerrar o MVP** | Checar cadastros na plataforma Superteam Earn. |
| **92** | Atualizar README.md com Program ID oficial | Produto & GD | **Falta para encerrar o MVP** | Adicionar Program ID `81Mpr...` no README principal. |
| **93** | Realizar submissão na plataforma Colosseum | Produto & GD | **Falta para encerrar o MVP** | Submeter APK, vídeo e repositório na Colosseum Arena. |
| **94** | Realizar submissão na Trilha Superteam Brasil | Produto & GD | **Falta para encerrar o MVP** | Submeter formulário nacional do Superteam Brasil. |
