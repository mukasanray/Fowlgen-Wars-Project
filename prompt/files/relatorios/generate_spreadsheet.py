import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

data = [
    {
        "id": 23,
        "tarefa": "Implementar spawner de tropas do Galinheiro",
        "dependencia": "20",
        "area": "Engenharia Full Cycle",
        "horas": "10h",
        "status": "Implementado",
        "data_inicio": "2026-10-09",
        "data_fim": "2026-10-11",
        "o_que_foi_feito": "GameMatchManager.cs implementa RequestPlayerSpawn e SpawnEnemyWave gerando tropas com cooldown por rota a partir das bases aliada e inimiga.",
        "o_que_falta": "Calibração final dos custos de mana/energia e seleção de múltiplos tipos de minions pela UI."
    },
    {
        "id": 24,
        "tarefa": "Programar logica de rotas e waypoints na arena",
        "dependencia": "23",
        "area": "Engenharia Full Cycle",
        "horas": "10h",
        "status": "Implementado",
        "data_inicio": "2026-10-09",
        "data_fim": "2026-10-11",
        "o_que_foi_feito": "WaypointPath.cs com 3 rotas (Top, Mid, Bot) espelhadas. MinionAgent.cs avança sequencialmente pelos nós da rota.",
        "o_que_falta": "Suavização opcional com curvas Bezier no visual da arena."
    },
    {
        "id": 25,
        "tarefa": "Destacar visualmente rota ativa com shader leve",
        "dependencia": "24",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-11",
        "data_fim": "2026-10-12",
        "o_que_foi_feito": "WaypointPath.HighlightTemporarily(2.5s) + LineRenderer pulso via GameMatchManager.RequestPlayerSpawn.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 26,
        "tarefa": "Codificar FSM de combate em FowlgenUnit C#",
        "dependencia": "24",
        "area": "Engenharia Full Cycle",
        "horas": "12h",
        "status": "Implementado",
        "data_inicio": "2026-10-10",
        "data_fim": "2026-10-12",
        "o_que_foi_feito": "Ciclo de estados operando em MinionAgent.cs e FowlgenUnit.cs: Idle, Marcha/Rota, Detecção de Alvo, Ataque e Morte.",
        "o_que_falta": "Conectar nós de animação do Animator Controller final com os triggers de combate."
    },
    {
        "id": 27,
        "tarefa": "Implementar colisao fisica e calculo de dano",
        "dependencia": "26",
        "area": "Engenharia Full Cycle",
        "horas": "8h",
        "status": "Implementado",
        "data_inicio": "2026-10-11",
        "data_fim": "2026-10-13",
        "o_que_foi_feito": "OverlapSphereNonAlloc (zero GC Alloc), colliders nos Galinheiros e método TakeDamage(int) consumindo stats do MinionDataSO.",
        "o_que_falta": "Cálculo de acerto crítico randômico (opcional para o MVP)."
    },
    {
        "id": 28,
        "tarefa": "Criar Floating Combat Text com dano animado",
        "dependencia": "27",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-12",
        "data_fim": "2026-10-13",
        "o_que_foi_feito": "Dano subtraído com precisão nos pontos de vida e logado no console.",
        "o_que_falta": "Concluído: FloatingCombatTextManager pool zero-GC com subida e fade."
    },
    {
        "id": 29,
        "tarefa": "Programar barras de vida flutuantes sobre tropas",
        "dependencia": "27",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-11",
        "data_fim": "2026-10-13",
        "o_que_foi_feito": "WorldHealthBarView.cs integrado sobre os Minions e Galinheiros com billboard voltado para a câmera e cores Verde/Vermelho.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 30,
        "tarefa": "Codificar logica de destruicao da base inimiga",
        "dependencia": "27",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-12",
        "data_fim": "2026-10-13",
        "o_que_foi_feito": "StructureGalinheiro.cs monitora HP e aciona evento OnStructureDestroyed -> GameMatchManager encerra a partida e carrega tela Vitória/Derrota.",
        "o_que_falta": "Partícula/VFX de destruição e explosão no momento da queda da base."
    },
    {
        "id": 31,
        "tarefa": "Implementar Camera Shake em impactos criticos",
        "dependencia": "30",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-12",
        "data_fim": "2026-10-13",
        "o_que_foi_feito": "MobaCameraController.Instance.Shake() acionado em impactos críticos, explosões e Ultimate R.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 32,
        "tarefa": "Criar contagem regressiva de inicio de partida",
        "dependencia": "20",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-12",
        "data_fim": "2026-10-13",
        "o_que_foi_feito": "MatchCountdownIntro.cs overlay 3, 2, 1, LUTA! com som UI e cocoricó.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 33,
        "tarefa": "Criar timer regressivo de partida de 3 minutos",
        "dependencia": "30",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-12",
        "data_fim": "2026-10-14",
        "o_que_foi_feito": "MatchRuntimeStateSO e GameMatchManager controlando 180s com finalização por tempo e desempate por maior HP.",
        "o_que_falta": "Concluído e operando; sem pendências impeditivas."
    },
    {
        "id": 34,
        "tarefa": "Implementar tela de Vitoria e Derrota da partida",
        "dependencia": "33",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-12",
        "data_fim": "2026-10-14",
        "o_que_foi_feito": "Cenas Vitoria.unity e Derrota.unity com VitoriaPresenter.cs e DerrotaPresenter.cs conectadas ao fluxo pós-jogo.",
        "o_que_falta": "Animações visuais de entrada dos banners de vitória/derrota."
    },
    {
        "id": 35,
        "tarefa": "Otimizar pooling de objetos para 60 FPS mobile",
        "dependencia": "27",
        "area": "Engenharia Full Cycle",
        "horas": "8h",
        "status": "Em Andamento",
        "data_inicio": "2026-10-13",
        "data_fim": "2026-10-15",
        "o_que_foi_feito": "Buffers de colisão estáticos com zero GC Alloc implementados em MinionAgent.cs.",
        "o_que_falta": "Implementar ObjectPool formal (UnityEngine.Pool) para reciclar prefabs de Minions sem Instantiate/Destroy contínuos."
    },
    {
        "id": 36,
        "tarefa": "Ajustar camera isometrica com limites de toque",
        "dependencia": "20",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-11",
        "data_fim": "2026-10-12",
        "o_que_foi_feito": "MobaCameraController.cs calibrado em 50° com seguimento suave do herói sem conflito com o joystick virtual.",
        "o_que_falta": "Clamping de limites extremos do mapa (opcional)."
    },
    {
        "id": 37,
        "tarefa": "Implementar menu de pausa com reinicio",
        "dependencia": "33",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-13",
        "data_fim": "2026-10-14",
        "o_que_foi_feito": "MatchPauseMenuController Time.timeScale 0/1 + painel Reiniciar/Sair e sliders volume.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 38,
        "tarefa": "Criar aviso de perda de conexao de internet",
        "dependencia": "33",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-13",
        "data_fim": "2026-10-14",
        "o_que_foi_feito": "NetworkStatusMonitor poll internetReachability + banner vermelho/verde topo.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 39,
        "tarefa": "Definir estrutura da conta PDA PlayerProfile",
        "dependencia": "11",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-09",
        "data_fim": "2026-10-10",
        "o_que_foi_feito": "Definido no Anchor smart contract (state.rs): conta Player com authority, xp, matches_played e wins.",
        "o_que_falta": "Concluído e validado com testes LiteSVM."
    },
    {
        "id": 40,
        "tarefa": "Codificar instrucao record_battle_result em Rust",
        "dependencia": "39",
        "area": "Engenharia Full Cycle",
        "horas": "10h",
        "status": "Implementado",
        "data_inicio": "2026-10-09",
        "data_fim": "2026-10-11",
        "o_que_foi_feito": "Instrução claim_reward no smart contract atualiza partidas jogadas, vitórias e pontuação de XP de forma atômica.",
        "o_que_falta": "Concluído e testado no smart contract."
    },
    {
        "id": 41,
        "tarefa": "Criar instrucao claim_reward para recompensas",
        "dependencia": "40",
        "area": "Engenharia Full Cycle",
        "horas": "8h",
        "status": "Implementado",
        "data_inicio": "2026-10-10",
        "data_fim": "2026-10-12",
        "o_que_foi_feito": "claim_reward.rs no smart contract compilado e testado com verificação de server_authority.",
        "o_que_falta": "Configuração da chave autorizadora do servidor no ambiente de produção final."
    },
    {
        "id": 42,
        "tarefa": "Otimizar limite de Compute Units da transacao",
        "dependencia": "41",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-11",
        "data_fim": "2026-10-12",
        "o_que_foi_feito": "TransactionManager ComputeBudgetProgram.SetComputeUnitLimit(200_000) no builder.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 43,
        "tarefa": "Escrever testes de integracao LiteSVM do contrato",
        "dependencia": "41",
        "area": "Engenharia Full Cycle",
        "horas": "8h",
        "status": "Implementado",
        "data_inicio": "2026-10-11",
        "data_fim": "2026-10-12",
        "o_que_foi_feito": "test_initialize.rs testa todo o fluxo (airdrop, init config, init player e claim_reward) passando em milissegundos via LiteSVM.",
        "o_que_falta": "Concluído e automatizado."
    },
    {
        "id": 44,
        "tarefa": "Criar script helper para airdrop SOL na Devnet",
        "dependencia": "8",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-11",
        "data_fim": "2026-10-12",
        "o_que_foi_feito": "WalletManager.RequestAirdrop() implementado com chamada RPC e redirecionamento para o web faucet oficial.",
        "o_que_falta": "Concluído e operando."
    },
    {
        "id": 45,
        "tarefa": "Fazer deploy do contrato oficial na Devnet",
        "dependencia": "43",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-12",
        "data_fim": "2026-10-13",
        "o_que_foi_feito": "Contrato compilado e implantado na Solana Devnet com Program ID canônico no IDL.",
        "o_que_falta": "Atualizar README caso gere nova chave de deploy."
    },
    {
        "id": 46,
        "tarefa": "Executar smoke test automatizado pos-deploy",
        "dependencia": "45",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-12",
        "data_fim": "2026-10-13",
        "o_que_foi_feito": "Instruções validadas contra o cluster Devnet através das cenas de POC e testes do SDK.",
        "o_que_falta": "Configuração opcional em GitHub Actions."
    },
    {
        "id": 47,
        "tarefa": "Integrar botao de liquidacao pos-jogo no Unity",
        "dependencia": "34, 45",
        "area": "Engenharia Full Cycle",
        "horas": "8h",
        "status": "Implementado",
        "data_inicio": "2026-10-13",
        "data_fim": "2026-10-14",
        "o_que_foi_feito": "Botão 'Recompensa' nas telas de Vitória e Derrota dispara TransactionManager e retorna à tela Play com saldo atualizado.",
        "o_que_falta": "Concluído e integrado."
    },
    {
        "id": 48,
        "tarefa": "Criar modal de loading para processar transacao",
        "dependencia": "47",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-13",
        "data_fim": "2026-10-14",
        "o_que_foi_feito": "Vitoria/DerrotaPresenter SetStatus processando + bloqueio botão durante sendTransaction.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 49,
        "tarefa": "Exibir hash da transacao com link Solana Explorer",
        "dependencia": "48",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-13",
        "data_fim": "2026-10-14",
        "o_que_foi_feito": "VitoriaPresenter e DerrotaPresenter formatam o hash da transação e abrem link no Solana Explorer via Application.OpenURL.",
        "o_que_falta": "Botão do Explorer estilizado com visual final na tela."
    },
    {
        "id": 50,
        "tarefa": "Implementar tratamento de erro e timeout RPC",
        "dependencia": "49",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-14",
        "data_fim": "2026-10-15",
        "o_que_foi_feito": "Tratamento de timeout, try/catch robusto em chamadas RPC e fallback de simulação offline caso a Devnet oscile.",
        "o_que_falta": "Concluído e operando."
    },
    {
        "id": 69,
        "tarefa": "Integrar AudioManager com pool de sons na Unity",
        "dependencia": "68",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-13",
        "data_fim": "2026-10-14",
        "o_que_foi_feito": "AudioManager.cs pool 12 SFX + BGM/UI + procedural fallback conectado a Milo/Axel/Minions/Galinheiro.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 70,
        "tarefa": "Programar controle de volume com PlayerPrefs",
        "dependencia": "69",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-13",
        "data_fim": "2026-10-14",
        "o_que_foi_feito": "AudioManager PlayerPrefs Master/Bgm/Sfx + sliders em MatchPauseMenuController.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 71,
        "tarefa": "Integrar fluxo de login de carteira no MainMenu",
        "dependencia": "14",
        "area": "Engenharia Full Cycle",
        "horas": "8h",
        "status": "Implementado",
        "data_inicio": "2026-10-12",
        "data_fim": "2026-10-13",
        "o_que_foi_feito": "Tela Auth com WalletManager conecta Phantom MWA e carteira Devnet salvando chave localmente no PlayerPrefs.",
        "o_que_falta": "Concluído e operando."
    },
    {
        "id": 72,
        "tarefa": "Exibir saldo de SOL e chave publica na UI",
        "dependencia": "71",
        "area": "Engenharia Full Cycle",
        "horas": "4h",
        "status": "Implementado",
        "data_inicio": "2026-10-12",
        "data_fim": "2026-10-13",
        "o_que_foi_feito": "Tela Play exibe a chave pública e consulta o saldo de SOL em tempo real via RPC Devnet.",
        "o_que_falta": "Botão de 'Refresh' manual do saldo na UI (opcional)."
    },
    {
        "id": 73,
        "tarefa": "Configurar pipeline de build APK Android Release",
        "dependencia": "6",
        "area": "Engenharia Full Cycle",
        "horas": "8h",
        "status": "Implementado",
        "data_inicio": "2026-10-09",
        "data_fim": "2026-10-11",
        "o_que_foi_feito": "AndroidReleaseBuildPipeline: PlayerSettings ARM64/Landscape + BuildPipeline menu Build APK.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 74,
        "tarefa": "Aplicar striping IL2CPP e compressao ASTC",
        "dependencia": "73",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "Implementado",
        "data_inicio": "2026-10-13",
        "data_fim": "2026-10-14",
        "o_que_foi_feito": "AndroidReleaseBuildPipeline: IL2CPP + ARM64 + ASTC + stripEngineCode.",
        "o_que_falta": "Concluído e operando; sem pendências."
    },
    {
        "id": 75,
        "tarefa": "Executar testes de compatibilidade em Android 10+",
        "dependencia": "74",
        "area": "Engenharia Full Cycle",
        "horas": "8h",
        "status": "A Fazer",
        "data_inicio": "2026-10-14",
        "data_fim": "2026-10-15",
        "o_que_foi_feito": "Validação de proporções e aspect ratios mobile no Unity Device Simulator.",
        "o_que_falta": "Instalar a APK no smartphone físico para validar taxa de 60 FPS e resposta do toque."
    },
    {
        "id": 76,
        "tarefa": "Executar auditoria anti-leak antes da submissao",
        "dependencia": "19",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "A Fazer",
        "data_inicio": "2026-10-14",
        "data_fim": "2026-10-15",
        "o_que_foi_feito": "Gitleaks configurado no repositório (diretório devsecops/).",
        "o_que_falta": "Rodar a varredura do gitleaks antes do commit da APK final."
    },
    {
        "id": 77,
        "tarefa": "Gerar e validar build APK Release final",
        "dependencia": "69, 75, 76",
        "area": "Engenharia Full Cycle",
        "horas": "6h",
        "status": "A Fazer",
        "data_inicio": "2026-10-16",
        "data_fim": "2026-10-17",
        "o_que_foi_feito": "Todas as 5 cenas integradas no fluxo do Build Settings (Auth, Play, Arena, Vitoria, Derrota).",
        "o_que_falta": "Executar compilação final e exportar o arquivo FowlgenWars_MVP_v1.0.apk."
    },
    {
        "id": 78,
        "tarefa": "Hospedar APK e gerar link direto de download",
        "dependencia": "77",
        "area": "Engenharia Full Cycle",
        "horas": "2h",
        "status": "A Fazer",
        "data_inicio": "2026-10-16",
        "data_fim": "2026-10-17",
        "o_que_foi_feito": "Repositório estruturado para release.",
        "o_que_falta": "Subir o APK gerado no Google Drive ou GitHub Releases e gerar link público de download."
    },
    {
        "id": 95,
        "tarefa": "Desenvolver servidor dedicado FishNet em Docker",
        "dependencia": "35",
        "area": "Engenharia Full Cycle",
        "horas": "40h",
        "status": "Backlog",
        "data_inicio": "2026-10-20",
        "data_fim": "2026-11-05",
        "o_que_foi_feito": "POC de multiplayer FishNet explorada na Sprint 01 (POC/FishNetMultiplayer.cs).",
        "o_que_falta": "Containerização Docker do servidor Unity em modo headless e orquestração (Pós-MVP)."
    },
    {
        "id": 96,
        "tarefa": "Implementar orquestracao de salas multiplayer AWS",
        "dependencia": "95",
        "area": "Engenharia Full Cycle",
        "horas": "30h",
        "status": "Backlog",
        "data_inicio": "2026-11-01",
        "data_fim": "2026-11-15",
        "o_que_foi_feito": "Conceito documentado no roadmap.",
        "o_que_falta": "Setup de AWS GameLift ou Agones Kubernetes para alocação de servidores (Pós-MVP)."
    },
    {
        "id": 97,
        "tarefa": "Integrar privacidade ZK-Cloak com Light Protocol",
        "dependencia": "40",
        "area": "Engenharia Full Cycle",
        "horas": "50h",
        "status": "Backlog",
        "data_inicio": "2026-11-10",
        "data_fim": "2026-11-30",
        "o_que_foi_feito": "Documentação e regras de armadilhas secretas catalogadas.",
        "o_que_falta": "Integração com SDK do Light Protocol para estado comprimido ZK (Pós-MVP)."
    },
    {
        "id": 98,
        "tarefa": "Desenvolver matchmaking com calculo de ELO",
        "dependencia": "96",
        "area": "Engenharia Full Cycle",
        "horas": "35h",
        "status": "Backlog",
        "data_inicio": "2026-11-15",
        "data_fim": "2026-11-30",
        "o_que_foi_feito": "Regras de ELO documentadas no GDD do jogo.",
        "o_que_falta": "Microsserviço de matchmaking e pareamento competitivo de jogadores (Pós-MVP)."
    },
    {
        "id": 99,
        "tarefa": "Criar colecao de Character NFTs Metaplex Core",
        "dependencia": "39",
        "area": "Engenharia Full Cycle",
        "horas": "25h",
        "status": "Backlog",
        "data_inicio": "2026-12-01",
        "data_fim": "2026-12-15",
        "o_que_foi_feito": "Metaplex skills e documentação configurados em .agents/skills/metaplex/.",
        "o_que_falta": "Minting on-chain dos 5 galos heróis como NFTs Metaplex Core com atributos dinâmicos (Pós-MVP)."
    },
    {
        "id": 100,
        "tarefa": "Desenvolver portal web em APP/ com login Web3",
        "dependencia": "99",
        "area": "Engenharia Full Cycle",
        "horas": "40h",
        "status": "Backlog",
        "data_inicio": "2026-12-01",
        "data_fim": "2026-12-20",
        "o_que_foi_feito": "Diretório app/ inicializado no repositório.",
        "o_que_falta": "Frontend completo em Next.js para consulta de histórico de partidas e inventário (Pós-MVP)."
    },
    {
        "id": 101,
        "tarefa": "Publicar na Solana Mobile DApp Store Seeker",
        "dependencia": "77",
        "area": "Engenharia Full Cycle",
        "horas": "20h",
        "status": "Backlog",
        "data_inicio": "2026-12-15",
        "data_fim": "2026-12-30",
        "o_que_foi_feito": "Suporte a MWA (Mobile Wallet Adapter) integrado no Unity SDK.",
        "o_que_falta": "Empacotamento de acordo com os requisitos da DApp Store do Solana Seeker e envio do manifesto (Pós-MVP)."
    },
    {
        "id": 104,
        "tarefa": "Desenvolver sistema de Guildas e Clas de galos",
        "dependencia": "98",
        "area": "Engenharia Full Cycle",
        "horas": "50h",
        "status": "Backlog",
        "data_inicio": "2027-02-01",
        "data_fim": "2027-02-28",
        "o_que_foi_feito": "Lore e regras sociais de alianças documentadas no GDD.",
        "o_que_falta": "Smart contracts e sistema social de guildas (Pós-MVP)."
    },
    {
        "id": 105,
        "tarefa": "Implementar torneios on-chain automatizados",
        "dependencia": "104",
        "area": "Engenharia Full Cycle",
        "horas": "40h",
        "status": "Backlog",
        "data_inicio": "2027-03-01",
        "data_fim": "2027-03-25",
        "o_que_foi_feito": "Estrutura inicial de regras de torneio documentada.",
        "o_que_falta": "Smart contract de custódia e liquidação automática de chaves de campeonatos (Pós-MVP)."
    }
]

# 1. Export CSV with UTF-8 BOM
csv_path = "prompt/files/relatorios/Planilha_Status_Tarefas_MVP.csv"
fieldnames = ["ID", "Atividade / Demanda", "Dependência", "Área Responsável", "Horas Estimadas", "Status Atual", "Data Início", "Data Fim", "O que já foi implementado", "O que falta para encerrar o MVP"]

with open(csv_path, mode="w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(fieldnames)
    for row in data:
        writer.writerow([
            row["id"],
            row["tarefa"],
            row["dependencia"],
            row["area"],
            row["horas"],
            row["status"],
            row["data_inicio"],
            row["data_fim"],
            row["o_que_foi_feito"],
            row["o_que_falta"]
        ])

print(f"CSV exported successfully: {csv_path}")

# 2. Export Excel (.xlsx) styled professionally
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Status MVP Fowlgen Wars"

# Palette
navy_header = "1A365D"
white_text = "FFFFFF"
border_color = "CBD5E1"
thin = Side(border_style="thin", color=border_color)
cell_border = Border(left=thin, right=thin, top=thin, bottom=thin)

status_colors = {
    "Implementado": {"fill": "DCFCE7", "font": "166534"}, # green
    "Em Andamento": {"fill": "FEF3C7", "font": "92400E"}, # amber
    "A Fazer":      {"fill": "FEE2E2", "font": "991B1B"}, # red
    "Backlog":      {"fill": "E2E8F0", "font": "334155"}  # gray
}

# Write Title Banner
ws.merge_cells("A1:J1")
title_cell = ws["A1"]
title_cell.value = "FOWLGEN WARS — PLANILHA DE ANÁLISE E STATUS DE DESENVOLVIMENTO (MVP)"
title_cell.font = Font(name="Calibri", size=14, bold=True, color=white_text)
title_cell.fill = PatternFill(start_color=navy_header, end_color=navy_header, fill_type="solid")
title_cell.alignment = Alignment(horizontal="center", vertical="center")
ws.row_dimensions[1].height = 35

# Write Subtitle
ws.merge_cells("A2:J2")
sub_cell = ws["A2"]
sub_cell.value = "Sincronizado diretamente com a base de código C# (Unity), Smart Contracts Rust/Anchor e EAP do Hackathon"
sub_cell.font = Font(name="Calibri", size=10, italic=True, color="475569")
sub_cell.fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
sub_cell.alignment = Alignment(horizontal="center", vertical="center")
ws.row_dimensions[2].height = 22

# Headers
headers = ["ID", "Atividade / Demanda", "Dep.", "Área Responsável", "Horas", "Status Atual", "Data Início", "Data Fim", "O que já foi implementado", "O que falta para encerrar o MVP"]
ws.row_dimensions[3].height = 28

for col_num, h in enumerate(headers, 1):
    c = ws.cell(row=3, column=col_num)
    c.value = h
    c.font = Font(name="Calibri", size=11, bold=True, color=white_text)
    c.fill = PatternFill(start_color="2B6CB0", end_color="2B6CB0", fill_type="solid")
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    c.border = cell_border

# Rows
for r_idx, item in enumerate(data, 4):
    ws.row_dimensions[r_idx].height = 36
    
    c_id = ws.cell(row=r_idx, column=1, value=item["id"])
    c_id.alignment = Alignment(horizontal="center", vertical="center")
    
    c_task = ws.cell(row=r_idx, column=2, value=item["tarefa"])
    c_task.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    
    c_dep = ws.cell(row=r_idx, column=3, value=item["dependencia"])
    c_dep.alignment = Alignment(horizontal="center", vertical="center")
    
    c_area = ws.cell(row=r_idx, column=4, value=item["area"])
    c_area.alignment = Alignment(horizontal="center", vertical="center")
    
    c_hours = ws.cell(row=r_idx, column=5, value=item["horas"])
    c_hours.alignment = Alignment(horizontal="center", vertical="center")
    
    st = item["status"]
    c_status = ws.cell(row=r_idx, column=6, value=st)
    c_status.alignment = Alignment(horizontal="center", vertical="center")
    c_status.font = Font(name="Calibri", size=10, bold=True, color=status_colors[st]["font"])
    c_status.fill = PatternFill(start_color=status_colors[st]["fill"], end_color=status_colors[st]["fill"], fill_type="solid")
    
    c_start = ws.cell(row=r_idx, column=7, value=item["data_inicio"])
    c_start.alignment = Alignment(horizontal="center", vertical="center")
    
    c_end = ws.cell(row=r_idx, column=8, value=item["data_fim"])
    c_end.alignment = Alignment(horizontal="center", vertical="center")
    
    c_done = ws.cell(row=r_idx, column=9, value=item["o_que_foi_feito"])
    c_done.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    
    c_missing = ws.cell(row=r_idx, column=10, value=item["o_que_falta"])
    c_missing.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    for col_i in range(1, 11):
        ws.cell(row=r_idx, column=col_i).border = cell_border

# Set custom column widths
col_widths = {
    1: 8,   # ID
    2: 38,  # Tarefa
    3: 10,  # Dep
    4: 24,  # Area
    5: 10,  # Horas
    6: 18,  # Status
    7: 14,  # Inicio
    8: 14,  # Fim
    9: 50,  # Feito
    10: 50  # Falta
}

for col_idx, width in col_widths.items():
    ws.column_dimensions[get_column_letter(col_idx)].width = width

# Enable freeze pane for headers
ws.freeze_panes = "A4"

excel_path = "prompt/files/relatorios/Planilha_Status_Tarefas_MVP.xlsx"
wb.save(excel_path)
print(f"Excel exported successfully: {excel_path}")

