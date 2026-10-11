# Plano de Arquitetura Modular (DDD + MVP + .csproj Independentes) — Fowlgen Wars

> **Documento de Especificação e Execução Técnica**  
> **Fontes Canônicas:** [`Claude.md`](../../Claude.md), [`Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md`](../../skills/Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md)  
> **Status:** Aprovado para Execução em Etapas  
> **Meta:** Modularização Vertical (DDD Bounded Contexts) com Injeção de Dependências Autônoma e `.asmdef` dedicados.

---

## 1. Visão Arquitetural

Cada módulo opera como um pacote autocontido (Bounded Context do DDD) contendo sua própria tríade **Domain (Contratos/Entities)**, **Presentation (MVP / UI Toolkit)**, **Infrastructure (Adapters)** e **DI (Composition Root / Injetor)**.

```
Assets/Modules/
├── MobileControls/   ──► FowlgenWars.Modules.MobileControls.csproj
├── Solana/           ──► FowlgenWars.Modules.Solana.csproj
├── Auth/             ──► FowlgenWars.Modules.Auth.csproj
└── Gameplay/         ──► FowlgenWars.Modules.Gameplay.csproj
```

---

## 2. Cronograma de Execução em 4 Etapas

### 🔹 ETAPA 1: Módulo Piloto `MobileControls` (Autocontido & Zero Risco)
* **Objetivo:** Isolar o joystick mobile e botões virtuais em um módulo próprio com seu `.asmdef`, desacoplando da lógica do jogo e permitindo remover `Starter Assets`.
* **Estrutura:**
  * `Domain/Contracts/IJoystickInput.cs`
  * `Presentation/Views/VirtualJoystickView.cs`
  * `Runtime/MobileInputReader.cs`
  * `DI/MobileControlsInstaller.cs`
  * `FowlgenWars.Modules.MobileControls.asmdef`
* **Critério de Aceite:** O joystick compila em seu próprio `.csproj` e emite eventos `Vector2` para qualquer entidade móvel.

---

### 🔹 ETAPA 2: Módulo `Solana` (Web3 / Anchor / SDK)
* **Objetivo:** Encapsular toda a lógica de carteira, RPC e chamadas on-chain sem vazamento de dependência para a UI.
* **Estrutura:**
  * `Domain/Contracts/IWalletProvider.cs`, `ITransactionService.cs`
  * `Domain/Models/SolanaConfig.cs` (ScriptableObject)
  * `Infrastructure/WalletManager.cs`, `TransactionManager.cs`, `MatchRewardManager.cs`, `IdlInspector.cs`
  * `DI/SolanaModuleInstaller.cs`
  * `FowlgenWars.Modules.Solana.asmdef` (depende apenas do `com.solana.unity_sdk`)
* **Critério de Aceite:** `FowlgenWars.Modules.Solana.csproj` compila isolado; todas as chamadas Anchor utilizam a fonte oficial `Assets/Resources/fowlgen_wars_contract.json`.

---

### 🔹 ETAPA 3: Módulo `Auth` (FishNet + Solana Signer + WebApi)
* **Objetivo:** Agrupar telas de autenticação (`AuthView`), orquestrador (`AuthPresenter`), estado (`SessionState`) e adaptadores FishNet/WebApi em um Bounded Context.
* **Estrutura:**
  * `Domain/Contracts/IAuthService.cs`, `IAuthView.cs`
  * `Domain/Models/SessionState.cs` (ScriptableObject)
  * `Presentation/Views/AuthView.cs`, `AuthPresenter.cs`
  * `Infrastructure/ClientAuthManager.cs`, `ServerAuthManager.cs`
  * `DI/AuthModuleInstaller.cs`
  * `FowlgenWars.Modules.Auth.asmdef` (depende de `FishNet.Runtime` e `FowlgenWars.Modules.Solana`)
* **Critério de Aceite:** Fluxo completo de login Phantom + Devnet com fallback e validação FishNet/WebApi funcionando sem referências circulares.

---

### 🔹 ETAPA 4: Módulo `Gameplay` e Limpeza Final de Legados
* **Objetivo:** Encapsular a simulação da partida (Herói, Minions, Galinheiros, Rotas) e a HUD (`GameplayHUDView`), conectando com `MobileControls` via DI.
* **Ações:**
  * Remover os pacotes legados restantes de `Starter Assets/` não utilizados.
  * Centralizar os scripts antigos de teste em `Legacy_POC/`.
* **Critério de Aceite:** Partida inicializa na cena `Arena.unity` e o herói se move com o novo módulo `MobileControls`.

---

## 3. Matriz de Dependência dos `.csproj`

| Módulo / Csproj | Depende de | NÃO Pode Depender de (Proibido) |
| :--- | :--- | :--- |
| **`FowlgenWars.Modules.MobileControls`** | `UnityEngine.UI`, `Unity.InputSystem` | Solana, FishNet, Gameplay, Auth |
| **`FowlgenWars.Modules.Solana`** | `com.solana.unity_sdk` | FishNet, UI Toolkit, MobileControls |
| **`FowlgenWars.Modules.Auth`** | `FishNet.Runtime`, `Solana` | Gameplay, MobileControls |
| **`FowlgenWars.Modules.Gameplay`** | `MobileControls`, `FishNet.Runtime` | Auth |

---

## 4. Diretriz Canônica para Ativos de Arte (`Assets/Art/`)

A arte 3D e visual do jogo é tratada como **Biblioteca Canônica Compartilhada de Conteúdo**, isolada da lógica de código para manter a produtividade da equipe e compatibilidade com Git LFS:

```
Assets/
├── Modules/                   (Apenas Código C#, Contratos, Presenters e .asmdef)
│   ├── MobileControls/        (UI específica de touch/joystick)
│   ├── Solana/
│   ├── Auth/
│   └── Gameplay/
│
├── Art/                       (Ativos Visuais e Estéticos Globais)
│   ├── Characters/            (Modelos 3D: Milo, BlueRooster, galinhas, minions)
│   ├── Environment/           (Malhas do mapa, 3 rotas, árvores, obstáculos)
│   ├── Animations/            (Clipes de animação: Idle, Run, Attack, Death)
│   └── Materials/             (Shaders e Texturas compartilhadas URP)
│
├── Audio/                     (Mixers, SFX de combate e BGM da arena)
├── Prefabs/                   (O elo de ligação: Malha 3D de Art + Scripts de Modules)
└── Scenes/                    (Cenas do jogo que amarram Arte e Módulos)
```

* **Princípio:** Artistas trabalham exclusivamente em `Assets/Art/` sem tocar em arquivos `.asmdef` ou código C#.
* **Elo de Ligação:** A pasta `Assets/Prefabs/` instancia as malhas de `Art/` e acopla os componentes lógicos de `Modules/`.
