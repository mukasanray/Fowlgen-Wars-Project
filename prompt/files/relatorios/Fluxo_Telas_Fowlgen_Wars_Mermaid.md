# Fluxo Oficial do Jogo: Fowlgen Wars (4 Telas)

Este documento descreve a arquitetura operacional, telas e jornada do jogador no **Fowlgen Wars**, abrangendo o fluxo de 4 telas oficiais com autenticação Web3 (Solana/Phantom), networking dedicado (FishNet), ciclo de partida MOBA e liquidação on-chain com retorno automático ao Lobby.

---

## 1. Visão Geral das 4 Telas Oficiais

```
[1ª Tela: AUTH] 
       │  • Login via Carteira Phantom (MWA) ou Devnet Local
       │  • Autenticação e handshake com o Servidor Dedicado FishNet
       ▼
[2ª Tela: PLAY] (Lobby pós-login)
       │  • Exibe carteira conectada e saldo em SOL em tempo real
       │  • Botão "+1 SOL Devnet" (Airdrop) e Botão "Sair" (Desconectar)
       │  • Botão "BATALHAR AGORA"
       ▼
[3ª Tela: ARENA] (Partida)
       │  • Combate MOBA 3 rotas (Heróis, Minions, Galinheiros)
       │  • Cinemática de introdução e Controles Mobile (Joystick + Ataque)
       │  • Destruição de base ou fim do tempo de 3 minutos
       ├── Vitória ────────► [4ª Tela: VITÓRIA] (Recompensa On-Chain, Solana Explorer, Retorno Automático)
       └── Derrota ────────► [4ª Tela: DERROTA] (Consolação On-Chain, Solana Explorer, Retorno Automático)
```

---

## 2. Diagrama de Fluxo Completo (Mermaid)

```mermaid
flowchart TD
    %% Estilos Globais
    classDef authStyle fill:#1a2332,stroke:#f5a623,stroke-width:2px,color:#fff;
    classDef playStyle fill:#0e2a38,stroke:#22bb66,stroke-width:2px,color:#fff;
    classDef arenaStyle fill:#141f2d,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef winStyle fill:#3d2f0a,stroke:#ffcc00,stroke-width:3px,color:#fff;
    classDef defeatStyle fill:#3a1010,stroke:#e63946,stroke-width:3px,color:#fff;
    classDef rpcStyle fill:#1e152a,stroke:#9d4edd,stroke-width:2px,color:#fff;
    classDef autoStyle fill:#0a3a40,stroke:#00f2fe,stroke-width:2px,color:#fff;

    Start([Abrir Fowlgen Wars]) --> ScreenAuth["1ª TELA: AUTH\n(Auth.unity)"]

    %% ==========================================
    %% TELA 1: AUTH
    %% ==========================================
    subgraph SubgraphAuth ["1. Autenticação & Conexão"]
        ScreenAuth
        BtnPhantom["Botão: Conectar Phantom (MWA)"]
        BtnDevnet["Botão: Devnet Local"]
        FishNetHandshake["Handshake com Servidor\nDedicado FishNet"]

        ScreenAuth --> BtnPhantom
        ScreenAuth --> BtnDevnet
        BtnPhantom -->|"Mobile Wallet Adapter"| FishNetHandshake
        BtnDevnet -->|"Chave de Testes Local"| FishNetHandshake
    end

    FishNetHandshake -->|"Autenticado com Sucesso"| ScreenPlay["2ª TELA: PLAY (Lobby)\n(Play.unity)"]

    %% ==========================================
    %% TELA 2: PLAY (LOBBY)
    %% ==========================================
    subgraph SubgraphPlay ["2. Lobby do Jogador"]
        ScreenPlay
        WalletBar["Wallet Bar:\n• Carteira Conectada (ex: 7xK8...9pLm)\n• Saldo em SOL em Tempo Real"]
        BtnAirdrop["Botão: +1 SOL Devnet\n(Airdrop RPC)"]
        BtnDisconnect["Botão: Sair\n(Desconectar Sessão)"]
        BtnBattle["Botão: BATALHAR AGORA"]

        ScreenPlay --- WalletBar
        ScreenPlay --> BtnAirdrop
        ScreenPlay --> BtnDisconnect
        ScreenPlay --> BtnBattle

        BtnAirdrop -->|"RPC requestAirdrop"| SolRPC[("Solana Devnet RPC")]
        SolRPC -->|"Atualiza Saldo em Tempo Real"| WalletBar
        BtnDisconnect -->|"Limpa Tokens e Sessão"| ScreenAuth
    end

    BtnBattle -->|"Carrega Cena de Partida"| ScreenArena["3ª TELA: ARENA\n(Arena.unity)"]

    %% ==========================================
    %% TELA 3: ARENA (PARTIDA)
    %% ==========================================
    subgraph SubgraphArena ["3. Partida MOBA (Combate 3 Rotas)"]
        ScreenArena
        IntroCinematic["Cinemática de Abertura\n(ArenaCinematicDirector)"]
        Controls["Controles Mobile:\n• Virtual Joystick\n• Botão de Ataque / Skills"]
        GameplayLoop["Mini-MOBA 3 Rotas (Top, Mid, Bot):\n• Heróis e Agentes Minions\n• Galinheiros e Torres\n• Duração Máxima: 3 Minutos"]
        OutcomeCondition{"Condição de Término:\n• Base Inimiga Destruída\n• Base Aliada Destruída\n• Fim do Timer (3:00)"}

        ScreenArena --> IntroCinematic
        IntroCinematic --> Controls
        Controls --> GameplayLoop
        GameplayLoop --> OutcomeCondition
    end

    OutcomeCondition -->|"Vitória (Base Inimiga Caiu)"| ScreenWin["4ª TELA: VITÓRIA\n(Vitoria.unity)"]
    OutcomeCondition -->|"Derrota (Base Aliada Caiu)"| ScreenDefeat["4ª TELA: DERROTA\n(Derrota.unity)"]

    %% ==========================================
    %% TELA 4A: VITÓRIA
    %% ==========================================
    subgraph SubgraphWin ["4A. Tela de Vitória"]
        ScreenWin
        WinRewards["Painel de Recompensas:\n• +120 XP | +50 FOWL | +0.05 SOL"]
        BtnWinClaim["Botão: Resgatar Recompensa On-Chain"]
        WinTxStatus["Status On-Chain:\n'Vitória registrada! Tx: 3J98...'"]
        BtnWinExplorer["Botão: Ver no Solana Explorer"]
        BtnWinMenu["Botão: Menu (Imediato)"]

        ScreenWin --- WinRewards
        ScreenWin --> BtnWinClaim
        ScreenWin --> BtnWinMenu
        BtnWinClaim -->|"Anchor instruction: increment"| SolContract[("Smart Contract Solana")]
        SolContract --> WinTxStatus
        WinTxStatus -.-> BtnWinExplorer
    end

    %% ==========================================
    %% TELA 4B: DERROTA
    %% ==========================================
    subgraph SubgraphDefeat ["4B. Tela de Derrota"]
        ScreenDefeat
        DefeatRewards["Painel de Consolação:\n• +25 XP | +10 FOWL"]
        BtnDefeatClaim["Botão: Resgatar Consolação On-Chain"]
        DefeatTxStatus["Status On-Chain:\n'Batalha registrada! Tx: 8F21...'"]
        BtnDefeatExplorer["Botão: Ver no Solana Explorer"]
        BtnDefeatRematch["Botão: Revanche / Jogar Novamente"]

        ScreenDefeat --- DefeatRewards
        ScreenDefeat --> BtnDefeatClaim
        ScreenDefeat --> BtnDefeatRematch
        BtnDefeatClaim -->|"Anchor instruction: record_battle"| SolContract
        SolContract --> DefeatTxStatus
        DefeatTxStatus -.-> BtnDefeatExplorer
    end

    %% ==========================================
    %% RETORNO AUTOMÁTICO AO LOBBY
    %% ==========================================
    subgraph SubgraphAutoReturn ["Retorno Automático (Pós-Recompensa)"]
        AutoDelayWin["Rotina VitoriaPresenter:\nDelay de 1.8s pós-claim"]
        AutoDelayDefeat["Rotina DerrotaPresenter:\nDelay de 1.8s pós-claim"]
    end

    WinTxStatus -->|"Dispara rotina"| AutoDelayWin
    DefeatTxStatus -->|"Dispara rotina"| AutoDelayDefeat

    AutoDelayWin -->|"Retorno Automático"| ScreenPlay
    AutoDelayDefeat -->|"Retorno Automático"| ScreenPlay
    BtnWinMenu -->|"Voltar ao Lobby"| ScreenPlay
    BtnDefeatRematch -->|"Voltar ao Lobby / Nova Fila"| ScreenPlay

    %% Aplicação de Estilos
    class ScreenAuth,BtnPhantom,BtnDevnet,FishNetHandshake authStyle;
    class ScreenPlay,WalletBar,BtnAirdrop,BtnDisconnect,BtnBattle playStyle;
    class ScreenArena,IntroCinematic,Controls,GameplayLoop,OutcomeCondition arenaStyle;
    class ScreenWin,WinRewards,BtnWinClaim,WinTxStatus,BtnWinExplorer,BtnWinMenu winStyle;
    class ScreenDefeat,DefeatRewards,BtnDefeatClaim,DefeatTxStatus,BtnDefeatExplorer,BtnDefeatRematch defeatStyle;
    class SolRPC,SolContract rpcStyle;
    class AutoDelayWin,AutoDelayDefeat autoStyle;
```

---

## 3. Detalhamento Técnico das Funcionalidades Implementadas

### [1ª Tela: AUTH] (Autenticação e Conexão)
* **Arquitetura Modular:** Gerenciado por `AuthPresenter.cs` pertencente ao módulo `FowlgenWars.Modules.Auth`.
* **Login Web3 MWA:** Integração com o protocolo **Mobile Wallet Adapter (MWA)** permitindo assinatura e login biométrico ou direto com o app Phantom Android/iOS.
* **Devnet Local:** Opção para testes em desenvolvimento simulando uma carteira Solana gerada localmente.
* **FishNet Dedicated Server Handshake:** Conexão de rede via `FishNetNetworkManager`, estabelecendo o handshake criptografado do player com o servidor autoritativo da partida.
* **Transição Direta:** Ao obter sucesso na validação de credenciais, o fluxo transita de forma direta e contínua para a tela `Play` (eliminando a antiga redundância do MainMenu).

---

### [2ª Tela: PLAY] (Lobby Pós-Login)
* **Status da Carteira em Tempo Real:** Exibe a chave pública abreviada (ex: `7xK8...9pLm`) e consulta ativa ao RPC da Solana para exibir o saldo atualizado em SOL.
* **Botão "+1 SOL Devnet" (Airdrop):**
  * Invoca `requestAirdrop` no cluster Devnet da Solana.
  * Inclui bloqueio temporário do botão durante a confirmação e atualização dinâmica do saldo na tela.
* **Botão "Sair" (Desconectar):**
  * Finaliza a sessão atual, revoga credenciais em cache e retorna o jogador para a tela inicial de `Auth`.
* **Botão "BATALHAR AGORA":**
  * Inicia o pareamento/matchmaking e carrega a cena de combate `Arena`.

---

### [3ª Tela: ARENA] (Partida MOBA 1v1)
* **Cinemática de Abertura:** Conduzida por `ArenaCinematicDirector.cs` para apresentação da arena antes do início do controle dos jogadores.
* **Controles Mobile:**
  * `Joystick.cs` para movimentação analógica com suporte a toque touch e gamepad.
  * `AttackButton.cs` para ataques básicos e acionamento de habilidades com cooldowns.
* **Dinâmica MOBA (3 Rotas):**
  * Spawn automatizado de minions por rota (`MinionAgent.cs`).
  * Galinheiros (torres de defesa e base central).
* **Condições de Vitória/Derrota:**
  * Destruição do galinheiro inimigo -> Vitória.
  * Destruição do galinheiro aliado -> Derrota.
  * Tempo limite de 3 minutos esgotado -> Vencedor calculado pelo dano acumulado nas bases.

---

### [4ª Tela: VITÓRIA] (Campeão)
* **Recompensas:** Exibição de XP (+120), Tokens do jogo (+50 FOWL) e fração de recompensa (+0.05 SOL).
* **Liquidação On-Chain:** O botão "Resgatar Recompensa On-Chain" envia instrução para o smart contract (Anchor) na rede Solana.
* **Solana Explorer:** Link direto dinâmico gerado com a transação confirmada (ex: `https://explorer.solana.com/tx/.../?cluster=devnet`).
* **Retorno Automático (Implementado):** Implementada a corrotina `ReturnToPlayDelayedRoutine(1.8f)` no `VitoriaPresenter.cs`, garantindo que após colher a recompensa, o jogador retorne automaticamente para a tela **Play (Lobby)** sem fricção.
* **Botão Menu:** Opção manual para retorno imediato ao Lobby.

---

### [4ª Tela: DERROTA] (Batalha Concluída)
* **Recompensa de Consolação:** Bonificação de participação (+25 XP, +10 FOWL).
* **Registro On-Chain:** Botão para registro da partida e resgate de consolação via Smart Contract.
* **Solana Explorer:** Hash de transação acessível para auditoria e histórico do jogador.
* **Retorno Automático (Implementado):** Mesma rotina de transição fluida `ReturnToPlayDelayedRoutine(1.8f)` no `DerrotaPresenter.cs`, retornando automaticamente para a tela **Play (Lobby)** após o claim.
* **Botão Revanche:** Atalho para reengajamento imediato.
