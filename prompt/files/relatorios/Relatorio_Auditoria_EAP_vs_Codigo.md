# Relatório de Auditoria — EAP (105 tarefas) × Código Real

> **Data da Verificação:** 13 de Outubro de 2026
> **Responsável técnico da auditoria:** Agente de execução (Claude.md)
> **Fontes confrontadas:**
> - [`Planilha_Analise_Desenvolvimento_EAP.md`](Planilha_Analise_Desenvolvimento_EAP.md) (status declarado)
> - Árvore real do repositório (`unity/Assets/Modules`, `program/`, `docs/`, `devsecops/`, `.github/`)
> - [`prompt/Claude.md`](../../Claude.md)
>
> **Natureza:** verificação documental e estática. Não substitui QA funcional em dispositivo físico.

---

## 1. Método e ambiente

1. Leitura de [`Claude.md`](../../Claude.md) e da planilha EAP.
2. Inspeção da árvore de arquivos realmente versionada (`git ls-files`) e em disco.
3. Confronto de cada tarefa com evidência de código/artefato.
4. Coleta dos comentários de rastreabilidade `EAP Item N` presentes no código C#.
5. Tentativa de execução da suíte automatizada existente (`cargo test` no workspace Anchor).

### 1.1 Resultado da execução de testes

| Suíte | Comando | Resultado real |
| :--- | :--- | :--- |
| Anchor / LiteSVM (Rust) | `cargo test` em `program/` | ❌ **Não executável neste ambiente**: `error: linker 'link.exe' not found` (faltam as Build Tools do MSVC). Além disso, o teste usa `include_bytes!(.../deploy/fowlgen_wars_contract.so)` e `program/target/deploy/` está **vazio**, então o artefato `.so` também não existe. |
| Unity EditMode/PlayMode | — | Não há assemblies de teste (`*Tests*.asmdef`) no projeto; o `com.unity.test-framework` está no `manifest.json`, mas sem testes escritos. |
| API .NET | `dotnet test` | Existe projeto de testes em `api/src/backend/Acesso/Onix.FowlgenWars.Acesso.Tests/`, porém está fora do escopo Core do EAP e não foi executado nesta rodada. |
| DevSecOps | `devsecops/audit_anti_leak.ps1`, Gitleaks | Workflows presentes em `.github/workflows/`; scanners dependem de execução na CI. |

> **Conclusão da execução:** nenhuma suíte automatizada pôde ser executada com sucesso neste ambiente Windows. As tarefas foram verificadas por **evidência estática de código/artefato**, não por teste em runtime. Isso está sinalizado em cada linha quando aplicável.

---

## 2. Sumário da reconciliação

| Classificação | Qtd | Significado |
| :--- | :-: | :--- |
| ✅ Confirmado | 45 | Evidência de artefato/código coerente com o status da EAP. |
| ⚠️ Divergência de status | 15 | A EAP diz "Em andamento" ou "Falta", mas o requisito **já existe no código**. |
| 🔶 Parcial / não evidenciado | 12 | Implementação incompleta ou sem artefato localizável. |
| ➖ Não verificável por código | 22 | Tarefas de negócio, jurídicas, marketing, arte e build/entrega que dependem de execução humana ou artefato externo. |

> **Divergência sistêmica:** a planilha EAP está **desatualizada em relação ao código** em pelo menos 15 itens. Vários deles já possuem comentários `EAP Item N` no próprio código C#, indicando que foram implementados após a geração da planilha.

---

## 3. Divergências críticas (bloqueiam ou distorcem o MVP)

### 3.1 ⛔ Program ID inconsistente (3 valores diferentes)

O mesmo contrato aparece com **três Program IDs distintos**, o que invalida a trilha "deploy/verificação on-chain" (EAP 12, 15, 45, 46) como evidência de sucesso:

| Local | Program ID |
| :--- | :--- |
| `program/programs/fowlgen_wars_contract/src/lib.rs` (`declare_id!`) e `program/Anchor.toml [programs.devnet]` | `BiH6PWPXifeM9BQ6A1UpPo2sNxVB7sqGkyRaueP8iK7D` |
| `program/Anchor.toml [programs.localnet]` e IDL unificado `unity/Assets/Resources/fowlgen_wars_contract.json` (`"address"`) | `6C83pMDjLwNGzg1aC8R5MMgWW7pM2zKgsd4n4cKj8RjW` |
| README, `Claude.md`, EAP, `skills/`, e o **código de runtime Unity** (`SolanaConfig.cs`, `SolanaReward.cs`, `POC05Controller.cs`) | `81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE` |

**Impacto:** o cliente Unity envia instruções para `81Mpr...`, mas o contrato compila/assina com `BiH6...` e o IDL exportado aponta `6C83...`. Nenhum dos três coincide com o valor declarado no código Unity. Requer decisão do PO + `anchor keys sync` para unificar.

### 3.2 ⛔ `record_battle_result` não existe no contrato

A EAP item 40 ("Codificar instrução `record_battle_result` em Rust") está marcada **Encerrado**, mas essa instrução **não existe** em lugar algum do código. As instruções reais no `lib.rs` são: `initialize_game_config`, `initialize_player` e `claim_reward` (que é quem registra `xp`, `matches_played` e `wins`). Provável confusão de nomenclatura entre a EAP e a implementação.

### 3.3 ⛔ Cenas de POC ausentes

O `Claude.md` e a EAP (itens 7, 13, 14) referenciam cenas `POC_01_ProjectFoundation.unity` … `POC_05_WalletTransaction.unity` em `unity/Assets/Scenes/POC/`. Essas cenas **não existem**: a pasta `Scenes/` contém apenas `Scenes/Game/` (Auth, Play, Arena, Arena_Clean, BattleArena, Vitoria, Derrota). A lógica das POCs existe como scripts C# em `unity/Assets/Modules/POC/` (`POC01Controller.cs` … `POC05Controller.cs`, `POCScreenUI.cs`, `POCSceneRoot.cs`).

### 3.4 ⚠️ Links quebrados no `Claude.md`

95 links relativos verificados; **10 apontam para caminhos inexistentes**:

- 9 caminhos `../unity/Assets/Scripts/…` (a pasta `Scripts/` foi reorganizada para `Assets/Modules/` na arquitetura DDD):
  `MainMenu.unity`, `MainMenuController.cs`, `POC_01..POC_05.unity`, `POCSceneRoot.cs`, `POCScreenUI.cs`.
- 1 link de skill: `skills/🐔 Sistema-de recompensas.md` → o arquivo real é `skills/🐔 Sistema-de-Recompensas.md` (grafia diverge).

### 3.5 ⚠️ Workflow de segurança com path obsoleto

`.github/workflows/security-scan.yml`, job `csharp-security-lint`, faz `grep` em `unity/Assets/Scripts/`, diretório que **não existe mais** (agora `unity/Assets/Modules/`). Na prática, o lint anti-leak de C# é um **no-op** e não bloqueia segredos hardcoded.

### 3.6 ⚠️ Duplicação de documentação dentro de `Assets/`

Existe uma cópia integral da pasta `prompt/` **dentro** de `unity/Assets/prompt/` (169 arquivos, incluindo `Claude.md`, `files/` e `skills/`), gerando duplicação de fonte de verdade e risco de editar o arquivo errado.

### 3.7 ⚠️ Dependência com caminho absoluto de máquina

`unity/Packages/manifest.json` referencia `com.tripo3d.unitybridge` via `file:D:/Tripo3d_Unity_Bridge-latest (1)/Tripo3d_Unity_Bridge` — caminho absoluto local, quebra o build em outra máquina/CI.

---

## 4. Reconciliação tarefa a tarefa (itens 1 a 94)

Legenda: ✅ confirmado · ⚠️ divergência de status · 🔶 parcial · ➖ não verificável por código.

| # | Demanda (EAP) | EAP | Verificado | Evidência / Observação |
| :-: | :--- | :--- | :-: | :--- |
| 1 | Regras de governança e papéis | Encerrado | ✅ | `Claude.md` (seções Papel, Divergências, Decisões) + `skills/Equipe/*`. |
| 2 | Minuta de NDA | Encerrado | ✅ | `docs/legal/01_NDA_Template.md`. |
| 3 | Cessão de IP e código | Encerrado | ✅ | `docs/legal/03_IP_Assignment_Template.md` (+ `02_MOU`, `05_ThirdParty`). |
| 4 | Founders Agreement e vesting | Encerrado | ✅ | `docs/legal/04_Founders_Agreement_Vesting.md`. |
| 5 | Regras/critérios do Hackathon | Encerrado | ✅ | `prompt/skills/fowlgen-wars-regras-hackathon-2026.md`. |
| 6 | Unity 6000 + URP | Encerrado | ✅ | `ProjectVersion.txt` = 6000.6.2f1; URP 17.6.0 no `manifest.json`. |
| 7 | Cena POC_01 Foundation | Encerrado | ⚠️ | Não existe cena `.unity`; há `Modules/POC/POC01Controller.cs`. |
| 8 | Solana Unity SDK na POC_02 | Encerrado | ✅ | `Packages/com.solana.unity_sdk` (package local) + `SolanaManager`/`SolanaConnection`. |
| 9 | RPC assíncrona Devnet | Encerrado | ✅ | `Modules/Solana/Services/SolanaConnection.cs`, `SolanaSdkProbe.cs`. |
| 10 | Workspace Anchor em `program/` | Encerrado | ✅ | `program/` com `Anchor.toml`, `Cargo.toml`. |
| 11 | Compilar contrato com `initialize` | Encerrado | ✅ | `initialize_game_config.rs`, `initialize_player.rs`. |
| 12 | Gerar IDL JSON para a Unity | Encerrado | ⚠️ | IDL existe, mas `"address": 6C83…` ≠ ID declarado (81Mpr…). Ver §3.1. |
| 13 | Parser Borsh / IDL inspector | Encerrado | ✅ | `Modules/Solana/Services/IdlInspector.cs`. |
| 14 | MWA na POC_05 | Encerrado | ✅ | `Modules/Solana/Services/WalletManager.cs`; lógica em `Modules/POC/POC05Controller.cs`. |
| 15 | Assinatura de transação na Devnet | Encerrado | ⚠️ | `TransactionManager.cs` envia tx, mas Program ID divergente (§3.1) impede comprovação. |
| 16 | Workflow Anchor CI | Encerrado | ✅ | `.github/workflows/anchor-ci.yml`. |
| 17 | Testes LiteSVM | Encerrado | 🔶 | `tests/test_initialize.rs` existe; `cargo test` não rodou aqui (link.exe ausente) e `.so` ausente. |
| 18 | Scan Gitleaks | Encerrado | ✅ | `.github/workflows/security-scan.yml` (job gitleaks) + `.gitleaksignore`. |
| 19 | Checklist DevSecOps por POC | Encerrado | ✅ | `devsecops/checklist.md`. |
| 20 | Cena BattleArena com NavMesh | Encerrado | ✅ | `Scenes/Game/BattleArena.unity` + `BattleArena_NavMesh.asset`. |
| 21 | Tabela de atributos dos 5 arquétipos | Em andamento | 🔶 | Só existe `MinionData_Default.asset` com valores genéricos; não há 5 arquétipos distintos. |
| 22 | Curva do timer de 3 min | Encerrado | ✅ | `MatchConfig.asset` = `matchDurationSeconds: 180`; `MatchRuntimeStateSO.cs`. |
| 23 | Spawner de tropas do Galinheiro | Encerrado | ✅ | `Modules/Gameplay/Managers/GameMatchManager.cs`. |
| 24 | Lógica de rotas / waypoints | Encerrado | ✅ | `Modules/Gameplay/Pathfinding/WaypointPath.cs`. |
| 25 | Destacar rota ativa (shader leve) | Falta | ⚠️ | **Implementado**: `WaypointPath.HighlightTemporarily()` (comentário "EAP Item 25"), chamado por `GameMatchManager.cs`. |
| 26 | FSM de combate | Encerrado | ✅ | `FowlgenUnit.cs`, `HeroAgent.cs`, `MinionAgent.cs`. |
| 27 | Colisão física e dano | Encerrado | ✅ | `IDamageable.cs`, cálculo em `FowlgenUnit.cs`. |
| 28 | Floating Combat Text | Falta | ⚠️ | **Implementado**: `Modules/Gameplay/Feedback/FloatingCombatTextManager.cs` ("EAP Item 28"). |
| 29 | Barras de vida flutuantes | Encerrado | ✅ | `WorldHealthBarView.cs`, `MobaHUDHealthView.cs`. |
| 30 | Destruição da base inimiga | Encerrado | ✅ | `Modules/Gameplay/Structures/StructureGalinheiro.cs`. |
| 31 | Camera Shake em impactos | Encerrado | ✅ | `MobaCameraController.cs`. |
| 32 | Contagem regressiva de início | Encerrado | ✅ | `MatchCountdownIntro.cs` ("EAP Item 32"). |
| 33 | Timer regressivo de 3 min | Encerrado | ✅ | `MatchRuntimeStateSO.cs`, `MatchHUDTimerTracker.cs`. |
| 34 | Telas de Vitória/Derrota | Encerrado | ✅ | `Vitoria.unity`, `Derrota.unity`, `VitoriaPresenter`, `DerrotaPresenter`. |
| 35 | Pooling para 60 FPS | Encerrado | 🔶 | `MobilePerformanceBootstrap.cs`; não há métrica/profiling versionada. |
| 36 | Câmera isométrica com limites | Encerrado | ✅ | `Modules/Gameplay/Camera/MobaCameraController.cs`. |
| 37 | Menu de pausa com reinício | Falta | ⚠️ | **Implementado**: `Modules/Gameplay/UI/MatchPauseMenuController.cs` ("EAP Item 37"). |
| 38 | Aviso de perda de conexão | Falta | ⚠️ | **Implementado**: `Modules/Gameplay/UI/NetworkStatusMonitor.cs` ("EAP Item 38"). |
| 39 | PDA PlayerProfile | Encerrado | ✅ | `state.rs` (`Player` PDA) + `constants.rs` (`PLAYER_SEED`). |
| 40 | Instrução `record_battle_result` | Encerrado | ⚠️ | Instrução **inexistente**; o registro é feito por `claim_reward` (§3.2). |
| 41 | Instrução `claim_reward` | Em andamento | ⚠️ | Contrato `claim_reward.rs` **e** wire do botão via `MatchRewardManager.cs` existem. |
| 42 | Otimizar Compute Units | Falta | ⚠️ | **Implementado**: `TransactionManager.cs` → `SetComputeUnitLimit(200_000)` ("EAP Item 42"). |
| 43 | Testes de integração LiteSVM | Encerrado | 🔶 | `test_initialize.rs` (cobre init + claim_reward); não executado aqui. |
| 44 | Airdrop SOL na Devnet | Encerrado | ✅ | `PlayPresenter.cs` (`RequestAirdrop`), `WalletManager.cs`. |
| 45 | Deploy oficial na Devnet | Encerrado | 🔶 | Sem artefato de deploy (`program/target/deploy/` vazio) e Program ID divergente (§3.1). |
| 46 | Smoke test pós-deploy | Encerrado | ➖ | Sem evidência versionada do smoke test. |
| 47 | Botão de liquidação pós-jogo | Em andamento | ⚠️ | Ligado em `VitoriaPresenter`/`DerrotaPresenter` (`RewardClicked` → `MatchRewardManager`). |
| 48 | Modal de loading de transação | Falta | ⚠️ | **Implementado**: `SetStatus("Processando registro on-chain na Solana Devnet...")` nos presenters. |
| 49 | Hash + link Solana Explorer | Falta | ⚠️ | **Implementado**: botão `explorer-button` + `explorer.solana.com/tx/{sig}` nos presenters. |
| 50 | Tratamento de erro/timeout RPC | Encerrado | ✅ | `AuthPresenter.cs` (try/catch e fallback). |
| 51 | Modelar galos low-poly | Em andamento | 🔶 | `unity/Assets/Art/Characters/` está **vazio**; modelos existem em `Assets/TripoModels/` (Milo, Axel, Bases). Endereço declarado na EAP não corresponde. |
| 52 | Galinhas/tropas low-poly | Encerrado | ✅ | `TripoModels/Minion-Calinha-Caipira/Rodilan` + prefabs `Minion_Caipira_Player`, `Minion_Rodilan_Enemy`. |
| 53 | Rigs dos 5 arquétipos | Em andamento | 🔶 | FBX em `TripoModels/`; sem evidência de rig dos 5 arquétipos. |
| 54 | Animações Idle/Run/Attack | Em andamento | ✅ | `Animations/Axel_AnimatorController`, `Milo_…`, `Minion_…`. |
| 55 | Animações Hit/Death | Falta | 🔶 | Controllers existem; não há clipes Hit/Death localizáveis na auditoria. |
| 56 | Materiais/texturas URP leves | Encerrado | ✅ | `Art/Environment/Materials/*.mat`, texturas em `Art/Environment/Terrain/Textures`. |
| 57 | Prefabs com Animator Controller | Encerrado | ✅ | `Prefabs/Minion_Caipira_Player.prefab`, `Minion_Rodilan_Enemy.prefab`. |
| 58 | VFX de ataque/explosão | Encerrado | ✅ | `CombatVFXManager.cs` (feather burst, impacto, cura, shockwave, explosão). |
| 59 | Layout HUD touch no Figma | Encerrado | 🔶 | UXML/USS de HUD existem; o arquivo Figma não é versionado. |
| 60 | Logotipo e ícone do app | Encerrado | ➖ | Sem artefato de ícone/logo localizável no repositório. |
| 61 | Sprites 2D de botões/barras | Encerrado | 🔶 | `Resources/UI/*.uxml/.uss`; não há pasta de sprites versionada. |
| 62 | Menu Principal com UI Toolkit | Encerrado | ✅ | `PlayView.cs`, `PlayPresenter.cs`, `Resources/UI/Play.uxml`. |
| 63 | HUD de combate com spawn | Encerrado | ✅ | `GameplayHUDView.cs`, `Arena.uxml`. |
| 64 | Trilha sonora dinâmica | Em andamento | ➖ | `Assets/Audio/` está **vazio**; sem trilha versionada. |
| 65 | Tema musical do Menu | Falta | ➖ | Sem BGM versionada. |
| 66 | SFX cacarejos/passos | Em andamento | ➖ | `Assets/Audio/` vazio; `AudioManager` é procedural. |
| 67 | SFX de golpes/projéteis/explosões | Encerrado | ✅ | `AudioManager.cs` (procedural + suporte a clips). |
| 68 | Audio Mixer Groups com Ducking | Falta | ⚠️ | Confirmado que **ainda falta**: nenhum arquivo `.mixer` no projeto (`Assets/Audio/` vazio). |
| 69 | AudioManager com pool | Encerrado | ✅ | `Modules/Gameplay/Audio/AudioManager.cs`. |
| 70 | Volume com PlayerPrefs | Falta | ⚠️ | **Implementado**: `AudioManager.cs` (`PlayerPrefs` Master/BGM/SFX) + sliders em `MatchPauseMenuController` ("EAP Item 70"). |
| 71 | Fluxo de login de carteira | Encerrado | ✅ | `AuthController/AuthPresenter/AuthView`, `ClientAuthManager`, `ServerAuthManager`. |
| 72 | Saldo SOL + chave pública na UI | Em andamento | ⚠️ | **Implementado**: `PlayView.UpdateWalletInfo()` → `"Saldo: {sol:F3} SOL"`. |
| 73 | Pipeline APK Android Release | Em andamento | ⚠️ | **Implementado**: `Editor/AndroidReleaseBuildPipeline.cs` (app id, landscape, ARM64). |
| 74 | Striping IL2CPP + ASTC | Falta | ⚠️ | **Implementado**: `AndroidReleaseBuildPipeline.cs` (`IL2CPP`, `ASTC`, ARM64). |
| 75 | Testes Android 10+ | Falta | ➖ | Depende de dispositivo físico; sem evidência. |
| 76 | Auditoria anti-leak pré-submissão | Falta | 🔶 | `devsecops/audit_anti_leak.ps1` existe, mas o job de C# na CI aponta path obsoleto (§3.5). |
| 77 | Build APK Release final | Falta | 🔶 | Menu de build existe ("EAP Item 77" em `AndroidReleaseBuildPipeline.cs`); o `.apk` não está versionado. |
| 78 | Hospedar APK / link | Falta | ➖ | Sem link/artefato no repositório. |
| 79 | Tese econômica / sinks | Encerrado | ✅ | `prompt/skills/🐔 Sistema-de-Recompensas.md`. |
| 80 | Pitch Deck 10–12 slides | Em andamento | ➖ | Não versionado no repositório. |
| 81 | FAQ para banca | Falta | ➖ | Não versionado. |
| 82 | Roteiro do vídeo 180s | Em andamento | ➖ | Não versionado. |
| 83 | Gravação de gameplay Android | Falta | ➖ | Depende de captura em dispositivo. |
| 84 | Gravação carteira/hash Devnet | Falta | ➖ | Depende de captura + Program ID válido. |
| 85 | Narração do pitch | Falta | ➖ | Não versionado. |
| 86 | Edição final do vídeo (≤180s) | Falta | ➖ | Não versionado. |
| 87 | Thumbnail do pitch | Falta | ➖ | Não versionada. |
| 88 | Teaser 15s | Falta | ➖ | Não versionado. |
| 89 | Upload YouTube/Loom | Falta | ➖ | Não versionado. |
| 90 | Backup do vídeo em nuvem | Falta | ➖ | Não versionado. |
| 91 | Validar perfis Superteam Earn | Falta | ➖ | Ação externa. |
| 92 | README com Program ID | Falta | ⚠️ | **Presente**: `README.md` linha 180 já traz `81Mpr…` — mas esse ID não corresponde ao contrato (§3.1). |
| 93 | Submissão Colosseum | Falta | ➖ | Ação externa. |
| 94 | Submissão Superteam Brasil | Falta | ➖ | Ação externa. |

> **Itens 95–105** constam no sumário da EAP como backlog pós-MVP, porém **não estão listados** no documento (a planilha termina no item 94).

---

## 5. Recomendações priorizadas

1. **Unificar o Program ID** (§3.1) — decisão do PO; depois rodar `anchor keys sync` e regerar o IDL. É bloqueante para as tarefas 12, 15, 41, 45, 46, 84.
2. **Corrigir a planilha EAP**: promover para "Encerrado" os itens 25, 28, 37, 38, 42, 47, 48, 49, 70, 72, 73, 74 (ver §3 divergências); corrigir a descrição do item 40; marcar 45/46 como pendentes de evidência.
3. **Corrigir o job `csharp-security-lint`** em `security-scan.yml` (path `Assets/Scripts/` → `Assets/Modules/`).
4. **Atualizar os links do `Claude.md`** (§3.4): repontar/ajustar os 10 links quebrados e remover a ambiguidade `MainMenu.unity` (a cena não existe; hoje há `Play.unity`).
5. **Remover a duplicação** `unity/Assets/prompt/` (§3.6) após confirmar que não é usada em runtime.
6. **Tornar o Tripo3D bridge portátil** (§3.7) — mover a dependência para dentro do repo ou usar URL.
7. **Disponibilizar ambiente de build Rust** (MSVC Build Tools) para que `cargo test` volte a rodar na verificação local.

---

## 6. Ressalvas de verificação

- Este relatório é **verificação estática**. Não houve execução da build Unity nem `cargo test` (bloqueado por ambiente).
- Tarefas de marketing, jurídicas, de arte externa e de entrega (vídeo, APK, submissão) foram classificadas como **não verificáveis por código** e dependem de confirmação humana.
- Nenhuma alteração de código de produto foi feita nesta auditoria; apenas este relatório foi adicionado.
