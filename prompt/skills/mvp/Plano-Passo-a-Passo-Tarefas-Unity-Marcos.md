# 📋 Plano Passo a Passo — Conclusão das Tarefas Unity (Marcos)
> **Projeto:** Fowlgen Wars (G5B Studios)  
> **Líder Técnico:** Marcos (@Marcos)  
> **Cena Canônica Oficial:** `Arena_Clean.unity`  
> **Meta:** Fechamento das pendências de Core Gameplay, Multiplayer, Solana e Build APK para o Hackathon.

---

## 🎯 Visão Geral da Sequência de Execução

- [x] **1. Regra de Desempate e Timer (1.2 e 1.3)** — *Concluído no commit `324c0fe` (Testes NUnit 114/114).*
- [x] **2. Sincronização Galinheiros FishNet (1.3 e 1.4)** — *Concluído no commit `a00d69f` (LAN/Wi-Fi e RpcGameOver).*
- [x] **3. Integração Transação On-Chain Solana (1.2)** — *Concluído no commit `06b1a2c` (Explorer link e increment).*
- [x] **4. Tomadas Cinemachine Pitch (1.1)** — *Concluído no commit `0ebc4f0` (ArenaCinematicDirector).*
- [x] **5. Configuração Build APK Android (1.1)** — *Concluído no commit `0ebc4f0` (PlayerSettings Landscape e pipeline).*
- [ ] **5.2. Compilação do Binário APK Final (1.2)** — *Pronto para exportar no Android NDK/SDK.*

---

## ⏱️ Etapa 1: Regras de Partida e Desempate (Timer de 3 Minutos)
* **Épico OpenSpec:** `openspec/changes/desempate-timer-game-match/`
* **Tarefas:** `1.2` e `1.3`
* **Arquivos-Chave:**
  - `Assets/Modules/Gameplay/Managers/GameMatchManager.cs`
  - `Assets/Modules/Presentation/Views/MatchHUDTimerTracker.cs`
  - `Assets/Scenes/Game/Arena_Clean.unity`

### Passo a Passo:
1. **Regra de Desempate no `GameMatchManager.cs`:**
   - Localizar o método `EndMatchByTimeout()` (linha 250).
   - Implementar critério determinístico e balanceado:
     - **Critério 1:** Maior porcentagem (%) de HP restante do Galinheiro.
     - **Critério 2 (se empatado em HP exato):** Maior quantidade de tropas vivas no campo ou maior quantidade de torres de defesa ainda intactas.
     - **Critério 3 (empate absoluto):** Vitória declarada como *Empate Técnico / Duelo Honroso* ou desempate por primeira base que causou dano.
2. **Feedback Visual de Fim de Tempo no `MatchHUDTimerTracker.cs`:**
   - Adicionar animação ou evento visual quando o timer zerar (`00:00` piscando em vermelho + banner "TEMPO ESGOTADO!").
   - Aguardar delay de 1.5 a 2 segundos antes de disparar `SceneManager.LoadScene("Vitoria")` ou `"Derrota"`, dando feedback claro ao jogador.
3. **Validação:**
   - Executar a cena `Arena_Clean.unity` com timer reduzido para 10 segundos no inspector e verificar o comportamento no fim do tempo.

---

## 🌐 Etapa 2: Sincronização de Rede FishNet & Galinheiros (Multiplayer 1v1)
* **Épico OpenSpec:** `openspec/changes/multiplayer-fishnet-1v1-hibrido/`
* **Tarefas:** `1.3` e `1.4`
* **Arquivos-Chave:**
  - `Assets/Modules/Gameplay/Combat/ChickenCoopBase.cs`
  - `Assets/Modules/Gameplay/Managers/GameMatchManager.cs`
  - `Assets/Scenes/Game/Arena_Clean.unity`

### Passo a Passo:
1. **Sincronização do Evento de Vitória/Derrota em Rede:**
   - Garantir que a destruição do Galinheiro execute um `[ObserversRpc]` no script de rede.
   - Se o Host destruir a base Inimiga:
     - Host executa transição para `Vitoria.unity`.
     - Client simultaneamente executa transição para `Derrota.unity`.
2. **Handshake e Conexão LAN/P2P:**
   - Na cena de Menu ou HUD da Arena, validar os botões simples:
     - **Criar Partida (Host)**: Inicia servidor + cliente local via `NetworkManager.ServerManager.StartConnection()` e `ClientManager.StartConnection()`.
     - **Entrar na Partida (Client)**: Conecta no IP local do Host porta `7770`.
3. **Validação:**
   - Testar com duas instâncias locais: Editor Unity + Standalone Windows Build ou dois dispositivos na mesma rede Wi-Fi.

---

## ⛓️ Etapa 3: Integração da Transação de Vitória On-Chain (Solana Devnet)
* **Épico OpenSpec:** `openspec/changes/transacao-onchain-vitoria-solana/`
* **Tarefa:** `1.2`
* **Arquivos-Chave:**
  - `Assets/Modules/Web3/TransactionManager.cs` (ou controlador de Solana SDK)
  - `Assets/Scenes/Game/Vitoria.unity`
  - `program/target/idl/fowlgen_wars_contract.json`

### Passo a Passo:
1. **Carregamento da Chave / Sessão de Carteira:**
   - No carregamento da cena `Vitoria.unity`, ler a carteira conectada do jogador (via Solana Unity SDK / MWA ou Keypair de teste da Devnet).
2. **Construção da Instrução `increment`:**
   - Montar a transação chamando o método `increment` do smart contract Anchor (`Program ID` oficial sincronizado).
3. **Assinatura e Feedback Visual:**
   - Enviar a transação para o nó RPC da Devnet (`https://api.devnet.solana.com`).
   - Retornar o hash da assinatura e montar o link direto do Solana Explorer (`https://explorer.solana.com/tx/<txHash>?cluster=devnet`).
   - Repassar o status para o painel de UI construído por @Jorge-Espindola.

---

## 🎥 Etapa 4: Câmera Cinemachine & Tomadas do Pitch de 15s
* **Épico OpenSpec:** `openspec/changes/showcase-cinemachine-video-pitch/`
* **Tarefa:** `1.1`
* **Arquivos-Chave:**
  - `Assets/Scenes/Game/Arena_Clean.unity` (GameObjects Cinemachine)

### Passo a Passo:
1. **Ajuste da Cinemachine Virtual Camera:**
   - Verificar os presets já criados na cena `Arena_Clean.unity`.
   - Garantir o enquadramento ideal: visão isométrica limpa a 50° que mostre as 3 rotas, os minions avançando e os dois heróis (Milo e Axel) em combate.
2. **Take de Gameplay Suave:**
   - Ativar o modo de interpolação suave (Damping `0.2` a `0.5`) para eliminar tremores de gravação.
   - Deixar a cena pronta para a gravação dos takes de 15s a 30s necessários para a montagem do pitch final por @Samuel e @Ramiro.

---

## 📱 Etapa 5: Configuração e Build do APK Android (Homologação QA)
* **Épico OpenSpec:** `openspec/changes/build-apk-android-homologacao-qa/`
* **Tarefas:** `1.1` e `1.2`

### Passo a Passo:
1. **Player Settings Android:**
   - Em **File > Build Settings > Android**:
     - **Default Interface Orientation:** `Landscape Left` (com auto-rotação apenas para `Landscape Right`).
     - **Scripting Backend:** `IL2CPP`.
     - **Target Architectures:** Marcar `ARM64` (e `ARMv7` se necessário).
     - **Target API Level:** Android 13 ou 14 (API Level 33/34).
2. **Compilação do APK:**
   - Gerar o build final nomeado como: `FowlgenWars_MVP_Colosseum2026.apk`.
   - Testar instalação via ADB no smartphone de teste:
     ```bash
     adb install -r FowlgenWars_MVP_Colosseum2026.apk
     ```
3. **Entrega para Homologação:**
   - Disponibilizar o arquivo APK para @Maria-Clara executar o checklist de QA funcional e usabilidade dos joysticks táteis.

---

## 📋 Etapa 6: Atualização de Governança (OpenSpec e Kanban Studio)

Ao finalizar cada etapa:
1. Atualizar o arquivo correspondente em `openspec/changes/<change-id>/tasks.md` marcando `- [x]`.
2. Validar integridade com o Kanban Studio ou MCP OpenSpec.
3. Comitar com mensagem semântica clara (ex: `feat(gameplay): implementar regra formal de desempate e timer`).
