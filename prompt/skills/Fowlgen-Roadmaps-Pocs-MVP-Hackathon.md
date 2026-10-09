# 🚀 FOWLGEN WARS — Roadmap de POCs MVP Hackathon 2026

## Colosseum Global Hackathon & Trilha Superteam Brasil (Fast-Track de Entrega Máxima)

> **🎯 DIRETRIZES DE PRAZO E ARQUITETURA:**  
> * **DATA DE ENTREGA DO JOGO 100% FUNCIONANDO:** **10 de outubro de 2026** (Meta inegociável da equipe: APK jogável no Android, loop de 3 minutos, movimentação nas 3 rotas, colisões, HUD, áudio, transação Solana Devnet e multiplayer híbrido operantes).
> * **PRAZO OFICIAL DO HACKATHON COLOSSEUM 2026:** **12 de outubro de 2026, às 23h59 PDT (horário da Califórnia)** — correspondente a **13 de outubro de 2026, às 03h59 BRT (horário de Brasília)**.
> * **MARGEM DE SEGURANÇA (BUFFER):** **48 horas completas** entre a entrega funcional (10/10) e o deadline global (12/10), assegurando tempo para testes de estresse de QA com Maria Clara, gravação/edição do vídeo de pitch (≤ 3 min), revisão do README e submissão serena.
> * **PADRÃO OPERACIONAL DE CADA POC:** Cada prova de conceito abaixo segue rigorosamente a estrutura canônica de [`Fowlgen-Wars-Roadmap-de-Pocs.md`](Fowlgen-Wars-Roadmap-de-Pocs.md) com: *Objetivo, Responsável, Passos Detalhados, Estrutura Técnica & Scripts, Critério de Aceite, Procedimento de Teste e Entregáveis*.

---

## 🏛️ 1. Regras Mandatórias do Hackathon & Critérios de Avaliação

Toda a execução deste roadmap deve se ater rigorosamente às normas oficiais estipuladas em [`fowlgen-wars-regras-hackathon-2026.md`](fowlgen-wars-regras-hackathon-2026.md):

### 1.1 Requisitos Críticos de Submissão (Desclassificação Sumária em caso de Não Cumprimento)
1. **Vídeo de Pitch & Demonstração:**
   * **Tempo Máximo Estrito:** **Exatamente ≤ 3 minutos (180 segundos)**. Qualquer vídeo com 3m01s é sumariamente penalizado ou desclassificado.
   * **Obrigatório mostrar:** Gameplay real rodando na Unity (batalha nas rotas) + Interação real na Solana Devnet com link/transação no Solana Explorer.
2. **Build Executável / Demo Jogável:**
   * APK Android funcional e testado para que os juízes possam instalar e testar a partida em seus smartphones.
3. **Repositório Público no GitHub:**
   * Código limpo e compilável contendo `/program` (Anchor/Rust) e `/unity` (Cliente C#).
   * `README.md` completo com instruções de compilação, Program ID oficial da Devnet e transação de exemplo no Solana Explorer.
   * **Segurança Absoluta:** Proibição estrita de commitar chaves privadas (*private keys*) ou seed phrases.
4. **Elegibilidade:**
   * Todos os 7 integrantes ativos da equipe (Samuel, Marcos, Manuel, Jorge, Junior, Maria Clara, Ramiro) vinculados na plataforma [Colosseum Arena](https://colosseum.com/arena/hackathon) e na [Superteam Brasil](http://hackathon.superteam.com.br/h/colosseum-2026/).

### 1.2 Como Conquistar a Nota Máxima nos 5 Critérios dos Jurados
| Critério de Avaliação | Peso | Estratégia de Entrega do Fowlgen Wars |
| :--- | :---: | :--- |
| **1. Qualidade Técnica & Execução** | Muito Alto | Jogo rodando fluido a 60 FPS no Android, movimentação e física estáveis nas 3 rotas, smart contract Anchor sem warnings ou vulnerabilidades. |
| **2. Integração com a Solana** | Muito Alto | Demonstração inequívoca: carteira conectada via Solana Unity SDK, invocação de instrução on-chain confirmada e verificável no Solana Explorer. |
| **3. Inovação & Originalidade** | Alto | Temática cômica e cativante de galinhas guerreiras, formato pioneiro de Mini-MOBA rápido de 3 minutos adaptado para mobile. |
| **4. Impacto de Mercado & Web3** | Alto | Apelo massivo para gamers convencionais (Web2), com posse digital real e posicionamento estratégico para a Solana Mobile DApp Store (Seeker/Saga). |
| **5. Pitch & Demonstração** | Alto | Vídeo dinâmico de 2m45s focado no gancho comercial, demo ao vivo da partida e chamada para aceleração da Colosseum. |

---

## 🏗️ 2. Arquitetura Geral do MVP: "Modo Híbrido com Fallback"

Para eliminar o risco do "teste do jurado solitário" (jurado sem internet ou sem adversário online para parear) e ao mesmo tempo entregar o impacto visual do multiplayer em tempo real, adotamos a arquitetura híbrida:

```text
                                MENU PRINCIPAL (MainMenu.unity)
                                               │
                   ┌───────────────────────────┴───────────────────────────┐
                   ▼                                                       ▼
        [🎮 BATALHA RÁPIDA (SOLO)]                              [🌐 BATALHA 1V1 (FISHNET)]
         Partida local contra IA (Offline)                       Modo Host & Client (LAN / Wi-Fi)
         Garante 100% que o jurado joga a                        Usado para o VÍDEO DE DEMO mostrando
         qualquer hora sem fila de espera!                       2 celulares reais em combate ao vivo!
                   │                                                       │
                   └───────────────────────────┬───────────────────────────┘
                                               │
                                               ▼
                                   [FIM DA PARTIDA (3 MIN)]
                                               │
                                               ▼
                              [REGISTRO ON-CHAIN NA SOLANA DEVNET]
                               Conexão de Wallet via Solana Unity SDK
                               Chamada ao contrato Anchor (81MprTi78...)
                               Confirmação com link no Solana Explorer
```

---

## ✅ 3. Inventário da Fase 1 NÃO Reprovada (Base Validada e Pronta)

A equipe **não deve reconstruir** o que já foi aprovado e validado no repositório:

1. **Inicialização Unity:** ✅ Aprovado na Sprint 01 de QA. Ciclo de vida e `GameBootstrap.cs` operando sem erros.
2. **Cenas e Telas Existentes:**
   * [`unity/Assets/Scenes/Game/MainMenu.unity`](../../unity/Assets/Scenes/Game/MainMenu.unity) + [`MainMenuController.cs`](../../unity/Assets/Scripts/Controller/MainMenuController.cs): Navegação de menu responsiva e seleção de cenas.
   * Framework de Telas de Teste: [`POCScreenUI.cs`](../../unity/Assets/Scripts/Controller/POCScreenUI.cs) e [`POCSceneRoot.cs`](../../unity/Assets/Scripts/Controller/POCSceneRoot.cs) com tabela de status, botões configuráveis e toasts visuais.
3. **As 5 POCs da Fase 01 Validadas:**
   * `POC 01` ([`POC_01_ProjectFoundation.unity`](../../unity/Assets/Scenes/POC/POC_01_ProjectFoundation.unity)): Fundação Unity, checagem de versão e plataforma.
   * `POC 02` ([`POC_02_SolanaDevnet.unity`](../../unity/Assets/Scenes/POC/POC_02_SolanaDevnet.unity)): Conexão RPC com `https://api.devnet.solana.com`.
   * `POC 03` ([`POC_03_AnchorWorkspace.unity`](../../unity/Assets/Scenes/POC/POC_03_AnchorWorkspace.unity)): Workspace Anchor e compilação do contrato em Rust.
   * `POC 04` ([`POC_04_UnityAnchor.unity`](../../unity/Assets/Scenes/POC/POC_04_UnityAnchor.unity)): Parsing do IDL `fowlgen_wars_contract.json` e mapeamento das contas.
   * `POC 05` ([`POC_05_WalletTransaction.unity`](../../unity/Assets/Scenes/POC/POC_05_WalletTransaction.unity)): Conexão de carteira (Phantom via Mobile Wallet Adapter / Clipboard / Keypair Devnet), consulta de saldo e envio de transação real na Devnet para o contrato ativo.
4. **Smart Contract Anchor On-Chain:**
   * Teste unitário e de integração [`test_initialize.rs`](../../program/programs/fowlgen_wars_contract/tests/test_initialize.rs) ✅ Aprovado via LiteSVM (`cargo test` em 0.29s).
   * Contrato implantado e executável na Solana Devnet sob o Program ID [`81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`](https://explorer.solana.com/address/81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE?cluster=devnet).

---

## 📋 4. Especificação Detalhada das POCs do MVP (Padrão Canônico)

---

### 🟦 TRILHA A: POCs ANCHOR (Backend On-Chain)
*Responsáveis: Marcos (Líder Técnico & Arquitetura Web3) e Jorge (DevSecOps & Anchor Dev)*

---

#### 🔹 POC-ANC-01 — Testes Automatizados Locais (LiteSVM)

##### Objetivo
Garantir que todas as instruções do contrato Anchor (`initialize` e `increment`) compilem e passem nos testes unitários e de integração locais sem necessidade de inicializar validador pesado externo.

##### Passos
1. Navegar até a pasta `program/`.
2. Verificar a consistência do Program ID no arquivo `programs/fowlgen_wars_contract/src/lib.rs` (`declare_id!`).
3. Verificar a declaração no `Anchor.toml` nos blocos `[programs.localnet]` e `[programs.devnet]`.
4. Executar o comando de compilação e teste unitário `cargo test`.
5. Validar que o simulador `LiteSVM` executa a transação de inicialização e a transação de incremento verificando que a conta `Counter` transiciona de `0` para `1`.

##### Estrutura Técnica & Scripts
* `program/programs/fowlgen_wars_contract/src/lib.rs`: Declaração do programa e dispatcher de instruções.
* `program/programs/fowlgen_wars_contract/src/instructions/initialize.rs`: Lógica de criação da conta de estado do contador.
* `program/programs/fowlgen_wars_contract/src/instructions/increment.rs`: Lógica de incremento da pontuação/partida.
* `program/programs/fowlgen_wars_contract/tests/test_initialize.rs`: Teste de integração automatizado com `LiteSVM`.

##### Critério de Aceite
* O comando `cargo test --manifest-path program/Cargo.toml` finaliza com código 0.
* Saída do teste reporta: `test test_initialize ... ok`.
* Nenhuma falha de `DeclaredProgramIdMismatch (4100)` ou panics de desserialização.

##### Procedimento de Teste
```bash
cargo test --manifest-path program/Cargo.toml
```

##### Entregáveis
* Log limpo de execução do `cargo test`.
* Binário de teste compilado em `program/target/debug/deps/`.

---

#### 🔹 POC-ANC-02 — Deploy e Verificação On-Chain na Solana Devnet

##### Objetivo
Manter o smart contract compilado e deployed de forma persistente e pública na rede de testes Solana Devnet, pronto para receber chamadas do cliente Unity.

##### Passos
1. Verificar a configuração de cluster da Solana CLI: `solana config get` (deve apontar para Devnet).
2. Confirmar o Program ID ativo: `81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`.
3. Inspecionar o saldo e o status executável da conta on-chain.
4. Validar que o proprietário da conta é o `BPFLoaderUpgradeab1e11111111111111111111111`.

##### Estrutura Técnica & Scripts
* `program/Anchor.toml`: Configuração de provedor Devnet e caminho da carteira deployer.
* Solana Devnet RPC: `https://api.devnet.solana.com`.

##### Critério de Aceite
* A conta on-chain retorna `Executable: true`.
* A URL pública no Solana Explorer carrega sem erros reportando o programa como ativo.

##### Procedimento de Teste
```bash
solana account 81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE --url devnet
```

##### Entregáveis
* Link oficial do Explorer: `https://explorer.solana.com/address/81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE?cluster=devnet`.

---

#### 🔹 POC-ANC-03 — IDL e Sincronização com o Unity

##### Objetivo
Gerar e manter sincronizado o arquivo IDL (Interface Definition Language) JSON entre o workspace Anchor e a pasta de assets da Unity.

##### Passos
1. Exportar o IDL atualizado de `program/target/idl/fowlgen_wars_contract.json`.
2. Copiar o IDL para `unity/Assets/Resources/fowlgen_wars_contract.json`.
3. Validar que o campo `"address"` do JSON contém exatamente `81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`.
4. Testar a leitura e desserialização via `IdlInspector.cs` e `FowlgenWarsProgram.cs` na Unity.

##### Estrutura Técnica & Scripts
* `unity/Assets/Resources/fowlgen_wars_contract.json`: IDL empacotado como TextAsset.
* `unity/Assets/Scripts/Solana/IdlInspector.cs`: Parser de instruções e validação de chaves não-dummy.
* `unity/Assets/Scripts/Solana/FowlgenWarsProgram.cs`: Representação das instruções `initialize` e `increment` em C#.

##### Critério de Aceite
* O método `IdlInspector.IsPlaceholderProgramId()` retorna `false` para o Program ID configurado.
* `FowlgenWarsProgram.DescribeReadiness()` reporta "Pronto para Chamadas".

##### Procedimento de Teste
* Abrir a cena `POC_04_UnityAnchor.unity` no Unity Editor e verificar se o painel exibe "fowlgen_wars_contract / PRONTO".

##### Entregáveis
* Arquivo JSON atualizado em `unity/Assets/Resources/`.

---

### 🟩 TRILHA B: POCs UNITY (Gameplay Core, Ambiente do Game, Colisões & Áudio)
*Responsáveis: Manuel (Gameplay Core, Ambiente & Colisões), Marcos (Líder Técnico & Arquitetura) e Jorge (Áudio / SFX)*

---

#### 🔹 POC-UNI-01 — Resolução do QA 1: Movimentação de Unidades & Waypoints

##### Objetivo
Resolver a reprovação da Sprint 01 em movimentação. Implementar o deslocamento autônomo dos Minions ao longo das 3 rotas (Top, Mid, Bot) utilizando waypoints fixos na arena, além de controle direto de movimento do herói via toque/joystick.

##### Passos
1. Definir os arrays de waypoints tridimensionais (Transforms) para cada uma das 3 rotas:
   * Rota Superior (Top Lane): Galinheiro Aliado ➔ Curva Superior ➔ Galinheiro Inimigo.
   * Rota Central (Mid Lane): Galinheiro Aliado ➔ Centro da Arena ➔ Galinheiro Inimigo.
   * Rota Inferior (Bot Lane): Galinheiro Aliado ➔ Curva Inferior ➔ Galinheiro Inimigo.
2. Criar o componente `LaneWaypointFollower.cs` acoplado ao prefab de tropa.
3. Atualizar [`FowlgenUnit.cs`](../../unity/Assets/Scripts/Gameplay/FowlgenUnit.cs) para navegar em direção ao próximo waypoint com `Vector3.MoveTowards` e rotação suave com `Quaternion.LookRotation`.
4. Criar o script `VirtualJoystick.cs` para movimentação do herói controlado pelo jogador na tela sensível ao toque.

##### Estrutura Técnica & Scripts
* `unity/Assets/Scripts/Gameplay/FowlgenUnit.cs`: Lógica base de vida, velocidade e estado da tropa.
* `unity/Assets/Scripts/Gameplay/LaneWaypointFollower.cs`: Navegação sequencial de waypoints por rota com detecção de chegada (`reachDistance = 0.5f`).
* `unity/Assets/Scripts/Gameplay/VirtualJoystick.cs`: Leitura de arrasto na tela mobile e conversão em vetor de movimento `(x, z)`.
* `unity/Assets/Prefabs/Minion_Rooster.prefab`: Prefab com `CharacterController` ou `Collider` + `LaneWaypointFollower`.

##### Critério de Aceite
* Tropas instanciadas em qualquer uma das 3 rotas seguem a curva do terreno sem cortar caminho nem desviar para obstáculos.
* O herói responde instantaneamente aos toques na tela sem travamentos ou tremores de câmera.
* Teste do QA 1 transiciona de ❌ Reprovado para ✅ Aprovado.

##### Procedimento de Teste
* Abrir a cena no Editor, acionar o modo Play, instanciar tropas nas rotas Top, Mid e Bot e verificar se todas alcançam a base oposta.

##### Entregáveis
* Script `LaneWaypointFollower.cs`.
* Script `VirtualJoystick.cs`.
* Prefab de tropa com movimentação funcional.

---

#### 🔹 POC-UNI-02 — Resolução do QA 2: Colisão Física, Dano e Vida dos Galinheiros

##### Objetivo
Resolver a reprovação da Sprint 01 em colisões. Configurar colisores 3D físicos, camadas de detecção (*Layers & Tags*), troca de dano entre tropas adversárias e destruição das estruturas finais (Galinheiros).

##### Passos
1. Configurar as Layers no Unity: `AllyUnit`, `EnemyUnit`, `AllyBase`, `EnemyBase` e `Obstacle`.
2. Configurar a matriz de colisão física no projeto (`Physics.IgnoreLayerCollision`) para que unidades aliadas não colidam entre si impedindo avanço.
3. Adicionar `CapsuleCollider` e `Rigidbody` (com `isKinematic = true` para estabilidade mobile) nas tropas.
4. Implementar a rotina de combate no `FowlgenUnit.cs`:
   * Ao detectar colisão com `EnemyUnit`, a tropa para de andar e desfere golpes a cada `attackInterval = 1.0f`.
   * Dispara `target.TakeDamage(attackPower)`.
   * Quando `currentHealth <= 0`, a unidade executa `Die()` e é desativada.
5. Criar o script `GalinheiroBase.cs` com vida máxima (`1000 HP`), barra de vida e evento `OnBaseDestroyed`.

##### Estrutura Técnica & Scripts
* `unity/Assets/Scripts/Gameplay/GalinheiroBase.cs`: Gerenciador de saúde do Galinheiro com evento de vitória/derrota.
* `unity/Assets/Scripts/Gameplay/CombatHitbox.cs`: Detecção de área de impacto para ataques corpo a corpo e bombas.
* Camadas de Física configuradas no `TagManager.asset`.

##### Critério de Aceite
* Unidades não atravessam barreiras físicas nem o chão da arena.
* Tropas adversárias que se encontram na mesma rota param e iniciam o combate até uma ser derrotada.
* O Galinheiro adversário perde HP ao ser golpeado pelas tropas e dispara a condição de vitória ao atingir 0 HP.
* Teste do QA 2 transiciona de ❌ Reprovado para ✅ Aprovado.

##### Procedimento de Teste
* Spawnar 1 tropa aliada e 1 tropa inimiga frente a frente; verificar parada, dedução de HP no console e desativação da tropa derrotada.

##### Entregáveis
* Script `GalinheiroBase.cs`.
* Atualização de `FowlgenUnit.cs` com lógica de combate físico.

---

#### 🔹 POC-UNI-03 — Resolução do QA 3: HUD de Combate e Telas Interativas

##### Objetivo
Resolver a reprovação da Sprint 01 em botões de UI. Construir uma interface móvel completa em landscape contendo HUD de batalha com cronômetro de 3 minutos, botões de spawn nas rotas e telas de Vitória/Derrota responsivas.

##### Passos
1. Criar o Canvas de HUD escalável (`CanvasScaler` configurado para `Scale With Screen Size` em `1920x1080`).
2. Adicionar o display de cronômetro regressivo da partida iniciando em `03:00` controlado por `MatchTimer.cs`.
3. Criar os 3 botões táteis de spawn de tropas:
   * Botão Rota Superior (Top).
   * Botão Rota Central (Mid).
   * Botão Rota Inferior (Bot).
4. Adicionar máscara de cooldown radial sobre os botões para indicar tempo de recarga após o toque.
5. Criar o painel `VictoryDefeatPanel`:
   * Exibe "VITÓRIA!" ou "DERROTA!".
   * Botão "Registrar Vitória na Solana Devnet".
   * Botão "Jogar Novamente".

##### Estrutura Técnica & Scripts
* `unity/Assets/Scripts/UI/CombatHUDController.cs`: Controlador central da interface da partida.
* `unity/Assets/Scripts/UI/MatchTimer.cs`: Contador regressivo de 180 segundos com evento `OnTimeExpired`.
* `unity/Assets/Scripts/UI/CooldownButton.cs`: Componente de botão com feedback tátil, sonoro e bloqueio por cooldown.

##### Critério de Aceite
* Todos os botões respondem ao toque com feedback visual imediato (redução de escala e realce de cor).
* O toque nos botões Top/Mid/Bot gera uma tropa no Galinheiro na respectiva rota.
* A destruição da base inimiga abre a tela de vitória sem travar a engine.
* Teste do QA 3 transiciona de ❌ Reprovado para ✅ Aprovado.

##### Procedimento de Teste
* Executar a cena e tocar nos 3 botões; verificar se as tropas são criadas e o cooldown visual de 3 segundos bloqueia toques sucessivos.

##### Entregáveis
* Prefab de Canvas `CombatHUD.prefab`.
* Scripts `CombatHUDController.cs` e `MatchTimer.cs`.

---

#### 🔹 POC-UNI-04 — Resolução do QA 4: AudioManager e Efeitos Sonoros (SFX)

##### Objetivo
Resolver a reprovação da Sprint 01 em áudio (liderado por Jorge com apoio de Manuel na Unity). Implementar um sistema de gerenciamento de áudio robusto e leve para mobile, reproduzindo efeitos sonoros sincronizados com cada ação da partida conforme [`Fowlgen-Wars-Biblioteca-Efeitos-Sonoros.md`](Fowlgen-Wars-Biblioteca-Efeitos-Sonoros.md).

##### Passos
1. Criar o Singleton `AudioManager.cs` com 2 `AudioSource`: um para música de fundo e um pool para SFX.
2. Importar os 5 clipes de áudio essenciais para o MVP:
   * `sfx_chicken_spawn.wav`: Cacarejo de guerra ao gerar tropa.
   * `sfx_peck_attack.wav`: Som de bicada/impacto em combate.
   * `sfx_bomb_explosion.wav`: Explosão de bomba ou destruição de estrutura.
   * `sfx_ui_click.wav`: Feedback sonoro de toque nos botões.
   * `sfx_victory_fanfare.wav`: Música curta de encerramento vitorioso.
3. Conectar as chamadas de áudio nos eventos correspondentes (`OnUnitSpawned`, `TakeDamage`, `OnBaseDestroyed`, `OnButtonClicked`).

##### Estrutura Técnica & Scripts
* `unity/Assets/Scripts/Audio/AudioManager.cs`: Singleton gerenciador de áudio.
* `unity/Assets/Resources/Audio/`: Pasta contendo os arquivos `.wav` comprimidos para formato Ogg Vorbis/ADPCM (mobile-friendly).

##### Critério de Aceite
* O jogo emite áudio sincronizado com cada toque, ataque e vitória sem atrasos (latência < 50ms).
* Nenhum engasgo de frame (*frame drop*) ocorre ao disparar múltiplos efeitos simultâneos.
* Teste do QA 4 transiciona de ❌ Reprovado para ✅ Aprovado.

##### Procedimento de Teste
* Testar a partida com fone de ouvido ou saída de áudio ativada e validar a execução clara dos 5 sons principais.

##### Entregáveis
* Script `AudioManager.cs`.
* Pasta de assets de áudio configurada na Unity.

---

#### 🔹 POC-UNI-05 — Loop Completo da Partida Mini-MOBA (3 Minutos)

##### Objetivo
Integrar as POCs UNI-01 a UNI-04 na cena oficial `Arena3Lanes.unity`, consolidando o loop completo da partida jogável de 3 minutos.

##### Passos
1. Montar a cena `Arena3Lanes.unity` utilizando o terreno e as 3 rotas (Top, Mid, Bot).
2. Posicionar o Galinheiro Aliado na extremidade esquerda e o Galinheiro Inimigo na extremidade direita.
3. Conectar a IA básica do Galinheiro Inimigo (`EnemyAIController.cs`) para gerar tropas automáticas a cada 5 segundos alternando as rotas.
4. Integrar o `CombatHUDController` com os pontos de vida dos Galinheiros e o `MatchTimer`.
5. Implementar a condição de resultado:
   * Vitória: Galinheiro inimigo destruído OU tempo esgotado com maior % de vida restante.
   * Derrota: Galinheiro aliado destruído OU tempo esgotado com menor % de vida restante.

##### Estrutura Técnica & Scripts
* `unity/Assets/Scenes/Game/Arena3Lanes.unity`: Cena principal da partida.
* `unity/Assets/Scripts/Gameplay/GameMatchManager.cs`: Gerenciador de regras e estado da partida (Start, InProgress, Finished).
* `unity/Assets/Scripts/Gameplay/EnemyAIController.cs`: Spawner automático adversário.

##### Critério de Aceite
* O jogador inicia a partida na `Arena3Lanes.unity`, interage com as 3 rotas, destrói o Galinheiro adversário ou aguarda os 3 minutos e chega à tela de vitória.
* A cena executa com estabilidade absoluta a 60 FPS.

##### Procedimento de Teste
* Jogar uma partida completa de 3 minutos do início ao fim no Unity Editor e no build Android.

##### Entregáveis
* Cena `Arena3Lanes.unity` finalizada.
* Script `GameMatchManager.cs`.

---

### 🌐 TRILHA C: POC MULTIPLAYER HÍBRIDO (FishNet 1v1 & Camada Off-chain)
*Responsáveis: Marcos (Líder Técnico / Camada Off-chain & FishNet), Manuel (Gameplay/Client) e Jorge (DevSecOps / Docker Infra)*

---

#### 🔹 POC-NET-01 — Multiplayer 1v1 FishNet (Host & Client para Vídeo de Pitch)

##### Objetivo
Implementar o modo multiplayer 1v1 local (Host & Client) via FishNet, permitindo conectar dois dispositivos na mesma rede local/Wi-Fi para demonstração de combate em tempo real durante a gravação do vídeo pitch de 3 minutos.

##### Passos
1. Importar o pacote oficial FishNet no projeto Unity.
2. Adicionar o GameObject `NetworkManager` com componentes `NetworkManager` e `Tugboat` (transporte padrão).
3. Criar a tela de conexão `MultiplayerLobbyUI.cs` com dois botões:
   * "CRIAR SALA (HOST)" ➔ Dispara `NetworkManager.ServerManager.StartConnection()` e `ClientManager.StartConnection()`.
   * "ENTRAR NA SALA (CLIENT)" ➔ Dispara `ClientManager.StartConnection(ipAddress)`.
4. Converter o prefab de tropa para `NetworkObject` com `NetworkTransform`.
5. No script da partida em rede:
   * O Host controla a invocação das tropas do Galinheiro Azul.
   * O Client controla a invocação das tropas do Galinheiro Vermelho.
   * A destruição do galinheiro sincroniza o evento de vitória para ambos.

##### Estrutura Técnica & Scripts
* `unity/Assets/Scripts/Network/FishNetMatchController.cs`: Gerenciador de conexão Host/Client.
* `unity/Assets/Scripts/Network/NetworkFowlgenUnit.cs`: Sincronização de posição e HP via `SyncVar`.
* `unity/Assets/Scenes/Game/Multiplayer1v1.unity`: Cena dedicada de teste multiplayer.

##### Critério de Aceite
* Dois clientes Unity (ou 2 celulares no mesmo Wi-Fi) conectam-se como Host e Client.
* Tropa invocada no celular A aparece instantaneamente no celular B andando pela mesma rota.
* Dano e destruição de Galinheiro sincronizados em ambos os dispositivos.

##### Procedimento de Teste
* Abrir duas instâncias do jogo no mesmo PC (ou 1 no PC e 1 no celular Android); clicar em Host na primeira e Join na segunda. Verificar sincronia de movimentação.

##### Entregáveis
* Script `FishNetMatchController.cs`.
* Vídeo de demonstração de 15 segundos gravando as duas telas sincronizadas para o pitch.

---

### 🟪 TRILHA D: POCs DE INTEGRAÇÃO (Unity ↔ Solana Devnet)
*Responsáveis: Marcos (Líder Técnico / Web3) e Jorge (Anchor Web 3, AppSec & Threat Modeling)*

---

#### 🔹 POC-INT-01 — Integração de Wallet no Menu e na Partida

##### Objetivo
Integrar o sistema de conexão de carteiras já validado na `POC 05` com as telas principais do jogo, permitindo ao usuário conectar sua Phantom Wallet via Mobile Wallet Adapter no Android ou usar chave de teste Devnet no Editor.

##### Passos
1. Adicionar o componente de carteira no `MainMenu.unity` e na tela de vitória da `Arena3Lanes.unity`.
2. Ao clicar em "CONECTAR WALLET":
   * No Android: Abre o seletor do Solana Mobile Wallet Adapter (Phantom, Solflare).
   * No Editor/Devnet: Importa chave privada da área de transferência ou gera par efêmero com saldo airdropado.
3. Exibir o endereço truncado (ex: `7R1d...hk8R`) e o saldo em SOL no cabeçalho.

##### Estrutura Técnica & Scripts
* `unity/Assets/Scripts/Solana/WalletManager.cs`: Gerenciador de conexão e assinatura.
* `unity/Assets/Scripts/Solana/SolanaManager.cs`: Singleton de comunicação RPC.

##### Critério de Aceite
* O endereço público do jogador é exibido na UI após a conexão.
* O status transiciona de `Disconnected` para `Connected` com saldo atualizado.

##### Procedimento de Teste
* Conectar carteira Phantom Devnet e verificar se o saldo coincide com o Solana Explorer.

##### Entregáveis
* Componente de cabeçalho com dados da wallet integrado nas cenas.

---

#### 🔹 POC-INT-02 — Chamada de Instrução Anchor ao Final da Partida

##### Objetivo
Executar uma transação real on-chain na Solana Devnet disparando a instrução do contrato `fowlgen_wars_contract` (`81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`) após a vitória do jogador, gerando o link de comprovação no Solana Explorer.

##### Passos
1. Na tela de Vitória da partida, o botão "REGISTRAR VITÓRIA ON-CHAIN" fica habilitado.
2. Ao clicar, o `TransactionManager.cs` monta a transação contendo a instrução `increment` do contrato Anchor.
3. A transação é assinada pela carteira conectada e enviada via RPC para a Solana Devnet.
4. Exibir o toast visual: "⏳ Confirmando na Blockchain...".
5. Ao confirmar, exibir "✅ Vitória Registrada!" e botão para "Abrir no Solana Explorer".

##### Estrutura Técnica & Scripts
* `unity/Assets/Scripts/Solana/TransactionManager.cs`: Montagem de transação, inclusão de `recentBlockhash` e envio.
* Instrução do contrato: `fowlgen_wars_contract::instruction::Increment`.

##### Critério de Aceite
* A transação é confirmada na Devnet em menos de 5 segundos.
* O link do Solana Explorer exibe o status *Success* e a assinatura da transação.

##### Procedimento de Teste
* Finalizar a partida de teste, clicar no botão de registrar vitória e abrir o link no navegador confirmando a transação.

##### Entregáveis
* Link de transação real na Devnet para constar no `README.md` e no vídeo pitch.

---

### 🟧 TRILHA E: APRESENTAÇÃO DO PRODUTO & SUBMISSÃO DO HACKATHON
*Responsáveis: Samuel (PO & Gestão do Kanban), Ramiro (Marketing Estratégico & Pitch Deck), Marcos e Manuel (Cinemachine / Showcase In-Engine) e Maria Clara (QA Funcional & Demonstração)*

---

#### 🔹 POC-CIN-01 — Cena de Apresentação e Showcase do Produto (Cinemachine & Animator In-Engine)

##### Objetivo
Projetar e implementar uma sequência de apresentação cinematográfica *in-engine* na Unity utilizando **Cinemachine, Unity Timeline e Animator**, apresentando o universo de FOWLGEN WARS com câmeras dinâmicas em movimento contínuo (visão aérea das 3 rotas, closes no Galinheiro e nas galinhas guerreiras animadas), realizando uma transição suave (*blend*) para a câmera de jogabilidade ativa.

##### Passos
1. Instalar o pacote oficial Cinemachine no Unity via Package Manager.
2. Adicionar o componente `CinemachineBrain` na Câmera Principal da cena.
3. Criar o asset de Unity Timeline `Timeline_ProductShowcase.playable`.
4. Configurar as 4 Câmeras Virtuais (`CinemachineVirtualCamera`):
   * `vcam_Flyover3Lanes`: Câmera aérea com trilho *CinemachineSmoothPath* / *Tracked Dolly* sobrevoando a arena e mostrando as 3 rotas (Top, Mid, Bot).
   * `vcam_GalinheiroBase`: Plano médio com órbita em volta do Galinheiro Aliado, destacando a base e o ninho de tropas.
   * `vcam_HeroClose`: Câmera dramática em plano fechado na personagem principal (Galia) executando poses de prontidão e animações no Animator.
   * `vcam_GameplayBlend`: Câmera isométrica ortográfica que assume suavemente o controle, ativando o HUD de combate para o início da partida jogável.
5. Sincronizar na Timeline os cortes de câmera com iluminação dinâmica, partículas de combate e efeitos sonoros do `AudioManager`.
6. Configurar o tempo de transição (*Ease In/Out Blend* de 1.5s) da cena de showcase cinematográfica diretamente para a partida interativa.

##### Estrutura Técnica & Scripts
* `unity/Assets/Scenes/Game/ProductShowcase.unity` (ou Timeline acoplada na `Arena3Lanes.unity`).
* `unity/Assets/Cinematics/Timeline_ProductShowcase.playable`: Asset Timeline de controle de câmeras e animação.
* `unity/Assets/Scripts/Cinematics/ShowcaseSequenceController.cs`: Controlador que inicia o showcase e dispara a transição para a partida.
* Componentes Cinemachine: `CinemachineBrain`, `CinemachineVirtualCamera`, `CinemachineDollyCart`.

##### Critério de Aceite
* A sequência roda *in-engine* a 60 FPS com movimentos fluídos sem solavancos ou perda de foco.
* O Animator dos personagens executa animações de prontidão/ataque sincronizadas com a aproximação da câmera.
* A transição cinematográfica para o HUD de gameplay ocorre sem tela de carregamento ou corte seco.
* O material gerado fornece os takes principais de abertura (0:00 - 0:45) para a gravação do vídeo pitch.

##### Procedimento de Teste
* Abrir a cena de showcase no Unity Editor, acionar o modo Play e assistir à sequência completa de 35 segundos, confirmando os ângulos de câmera e o blend final para a jogabilidade.

##### Entregáveis
* Asset de Timeline e prefabs de câmeras virtuais configuradas.
* Script `ShowcaseSequenceController.cs`.
* Vídeo gravado em 1080p60 da sequência cinematográfica in-engine.

---

#### 🔹 POC-SUB-01 — Geração e Teste do APK Android Final

##### Objetivo
Gerar o arquivo binário instalável `FowlgenWars_MVP_Colosseum2026.apk`, assinado e testado em dispositivo físico Android, garantindo que os juízes possam jogar imediatamente.

##### Passos
1. No Unity, acessar `Build Settings`, selecionar plataforma **Android**.
2. Configurar `Player Settings`:
   * Package Name: `com.G5BStudios.FowlgenWars`.
   * Orientation: **Landscape Left**.
   * Target API Level: Android 13/14 (API Level 33+).
   * Internet Access: **Require** (para conexão com a Solana Devnet).
3. Executar o Build gerando o arquivo `.apk`.
4. Instalar via `adb install` ou transferência direta no smartphone Android de teste.
5. Maria Clara executa o checklist completo de QA em celular físico.

##### Critério de Aceite
* O APK instala sem erros de certificado ou arquitetura (ARM64).
* O jogo abre, roda a 60 FPS estáveis e executa a partida completa sem fechar sozinho (*crash*).

##### Entregáveis
* Arquivo `FowlgenWars_MVP_Colosseum2026.apk` disponibilizado no Google Drive e no GitHub Releases.

---

#### 🔹 POC-SUB-02 — Produção do Vídeo Pitch de 3 Minutos (Integrando o Showcase Cinemachine + Gameplay + Solana)

##### Objetivo
Gravar e editar o vídeo de pitch e demonstração com duração estrita entre **2m40s e 2m50s** (NUNCA ultrapassar 3m00s), integrando a apresentação cinematográfica do produto via Cinemachine, gameplay real na Unity e comprovação on-chain na Solana Devnet.

##### Estrutura Cronometrada Segundo a Segundo
* `0:00 - 0:40` — **Apresentação do Produto & Showcase Cinemachine (POC-CIN-01):** Câmera voando sobre a arena, sobrevoo das 3 rotas, close dinâmico nos personagens animados no Animator e apresentação do gancho do Mini-MOBA pela voz do Samuel.
* `0:40 - 1:45` — **Live Gameplay na Unity (Transição Cinemachine ➔ Combate):** A câmera faz o blend suave para a perspectiva de batalha; o HUD aparece e mostra a partida real rodando, spawn de tropas, combate físico e o modo multiplayer 1v1 FishNet em dois celulares sincronizados!
* `1:45 - 2:30` — **Integração Solana Devnet:** Conectar wallet Phantom, registrar a vitória com uma transação e mostrar a transação confirmada ao vivo no Solana Explorer com o Program ID `81Mpr...`.
* `2:30 - 2:45` — **Equipe & Visão de Futuro:** Apresentação da G5B Studios, foco na Solana Mobile DApp Store (Seeker/Saga) e convite para a aceleração da Colosseum.

##### Critério de Aceite
* Vídeo com duração total **estritamente inferior a 180 segundos**.
* Áudio claro, resolução 1080p a 60 FPS, demonstrando showcase cinematográfico, gameplay real e transação Solana Explorer.

##### Entregáveis
* Link do vídeo publicado no YouTube (não listado ou público).

---

#### 🔹 POC-SUB-03 — Submissão Oficial nas Plataformas

##### Objetivo
Homologar o projeto nas plataformas da **Colosseum Arena** e da **Superteam Brasil**, garantindo elegibilidade dupla aos prêmios globais e regionais.

##### Passos
1. Atualizar o `README.md` na raiz do repositório contendo proposta de valor, Program ID `81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`, link do Explorer e instruções de compilação.
2. Na plataforma [Colosseum Arena](https://colosseum.com/arena/hackathon):
   * Preencher descrição executiva, link do GitHub, link do vídeo de 3 minutos e link do APK.
   * Cadastrar todos os 7 integrantes ativos da equipe (Samuel, Marcos, Manuel, Jorge, Junior, Maria Clara e Ramiro).
3. Na plataforma [Superteam Brasil](http://hackathon.superteam.com.br/h/colosseum-2026/):
   * Conectar a submissão via Superteam Earn para concorrer aos prêmios da Trilha Brasil.

##### Critério de Aceite
* Submissão confirmada por e-mail e visível no painel da Colosseum e da Superteam antes de 12/10/2026 às 23h59 PDT.

---

## 📅 5. Cronograma Regressivo de Execução — Meta de Entrega: 10/10/2026

```text
DIAS DE EXECUÇÃO SPRINT EXPRESS (03/10 A 12/10/2026):

Data              Meta e Entregas do Dia                                  Responsáveis
────────────────────────────────────────────────────────────────────────────────────────────────────
03/10 (Sábado)    Auditoria concluída, testes Anchor aprovados (0.29s),  Marcos / Jorge
                  base da Fase 1 mapeada e tarefas no Kanban.

04/10 (Domingo)   Entrega de POC-UNI-01 (Movimentação por Waypoints)     Manuel / Marcos
                  e POC-UNI-02 (Ambiente do Game, Colisões e Galinheiro).

05/10 (Segunda)   Entrega de POC-UNI-03 (HUD com botões e timers) e      Manuel / Marcos (Unity)
                  POC-UNI-04 (AudioManager com os 5 SFX essenciais).    Jorge (Áudio/SFX)
                  Reajuste do site oficial (app/) e esteira de prompts. Junior (Site & Prompts)

06/10 (Terça)     Entrega de POC-UNI-05 (Loop de 3 min na Arena3Lanes)   Manuel / Marcos (Unity)
                  e POC-NET-01 (Modo 1v1 FishNet e Camada Off-chain).   Marcos / Jorge / Manuel

07/10 (Quarta)    Entrega de POC-INT-01/02: Conexão do resultado da      Marcos / Jorge
                  partida ao contrato Anchor na Devnet com link Explorer.

08/10 (Quinta)    Entrega de POC-SUB-01 (Build APK Android testada)      Marcos / Manuel / Maria
                  e POC-CIN-01 (Cena de Showcase Cinemachine/Animator). Manuel / Samuel

09/10 (Sexta)     Entrega de POC-SUB-02: Roteiro e gravação final do     Samuel / Ramiro / Maria
                  vídeo pitch integrando Cinemachine + Gameplay + Solana.

10/10 (Sábado)    🏆 ENTREGA INTERNA DO GAME 100% FUNCIONANDO!           TODA A EQUIPE
                  Homologação final, upload do APK e vídeo no YouTube.

11/10 (Domingo)   Buffer de segurança: Revisão de links, README.md,      Samuel / Ramiro / Jorge
                  documentação técnica e transações Devnet.

12/10 (Segunda)   Submissão Oficial na Colosseum Arena (até 23h59 PDT)  Samuel / Ramiro
                  e confirmação na Trilha Superteam Brasil!
```

---

## 🎯 6. Checklist de Homologação Final para o Envio

Antes do envio final nas plataformas do hackathon:

- [ ] `cargo test` no Anchor executando e passando 100% dos testes (`test_initialize ... ok`).
- [ ] Program ID oficial ativo na Devnet: `81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`.
- [ ] O jogo abre no menu com modo "Batalha Rápida (Solo)" e "Batalha 1v1 (FishNet)".
- [ ] Minions avançam pelas 3 rotas por waypoints sem atravessar obstáculos.
- [ ] Combate com colisão física reduz a barra de vida dos Galinheiros até a vitória/derrota.
- [ ] Efeitos sonoros reproduzindo cacarejo, golpes, explosões e cliques de botão.
- [ ] Conexão de carteira e envio de transação real na Solana Devnet confirmada no Explorer.
- [ ] APK Android gerado e testado em smartphone físico por Maria Clara.
- [ ] Vídeo pitch gravado com **duração estritamente entre 2m40s e 2m50s (NUNCA > 180s)**.
- [ ] Nenhuma chave privada ou seed phrase incluída no repositório GitHub.
- [ ] Submissão realizada na Colosseum e Superteam Brasil antes de 12/10/2026 às 23h59 PDT.
