# Feature: migrate-joystick-to-mobilecontrols

## Title
POC-UNI-01: Migração Completa do Joystick Pack para o Módulo DDD MobileControls

## Summary
Migração de todos os recursos do pacote legado `Assets/Joystick Pack` (modos Fixed, Floating e Dynamic, sprites e prefab) para o módulo interno de domínio `Assets/Modules/MobileControls/`. Desacopla o `MobilePlayerController`, atualiza o `SetupMobaArenaComplete.cs` e a cena `BattleArena.unity`, permitindo a remoção limpa e segura da pasta `Assets/Joystick Pack`.

## Motivation
Eliminar dependências de assets de terceiros acoplados à lógica de gameplay, consolidando a arquitetura orientada a domínio (DDD) com o assembly `FowlgenWars.Modules.MobileControls`, garantindo zero alocação de GC, suporte a múltiplos modos de toque e compilação limpa.

## Context & Existing Implementations
- `Assets/Joystick Pack`: pacote legado contendo `VariableJoystick`, scripts, sprites e prefabs.
- `Assets/Modules/MobileControls`: módulo próprio com contrato `IJoystickInput` e view `VirtualJoystickView.cs`.
- `Assets/Modules/Gameplay/Agents/MobilePlayerController.cs`: controlador do jogador com referências legadas a `Joystick` e `VariableJoystick`.
- `Assets/Editor/SetupMobaArenaComplete.cs`: gerador da arena canônica instanciando prefab legado.
- `Assets/Scenes/Game/BattleArena.unity`: cena canônica com o prefab legado configurado.

## Proposed Solution
1. **Contrato de Modos em `IJoystickInput.cs`**:
   - Adicionar enum `JoystickMode { Fixed, Floating, Dynamic }`.
   - Adicionar propriedades e métodos `JoystickMode CurrentMode`, `void SetMode(JoystickMode mode)`, `void CycleMode()`.
2. **Evolução do `VirtualJoystickView.cs`**:
   - Implementar modos `Fixed`, `Floating` e `Dynamic` com área de toque (touch zone / safe zone), manipulação de `background` e `handle`.
   - Implementação de `IPointerDownHandler`, `IDragHandler`, `IPointerUpHandler` sem alocação no `Update`.
3. **Assets no Módulo `MobileControls`**:
   - Mover/copiar os sprites de base e manopla para `Assets/Modules/MobileControls/Sprites/`.
   - Criar o prefab canônico `Assets/Modules/MobileControls/Prefabs/Virtual Joystick.prefab`.
4. **Refatoração do `MobilePlayerController.cs`**:
   - Remover dependências de `Joystick` e `VariableJoystick`.
   - Consumir puramente `IJoystickInput` e chamar `SetMode`/`CycleMode` através da interface.
5. **Atualização do `SetupMobaArenaComplete.cs`**:
   - Carregar e instanciar `Assets/Modules/MobileControls/Prefabs/Virtual Joystick.prefab`.
   - Conectar via `miloMove.BindJoystick(virtualJoystick)`.
6. **Limpeza do Assembly `FowlgenWars.Modules.Gameplay.asmdef`**:
   - Remover referência a `JoystickPack`.
7. **Atualização da Cena `BattleArena.unity`**:
   - Configurar o novo prefab do `MobileControls` no HUD da cena.
8. **Exclusão de `Assets/Joystick Pack`**:
   - Remover a pasta `Assets/Joystick Pack` e sua `.meta`.

## Status
[CONCLUÍDO] Migração realizada com sucesso e validada em 2026-10-20. Zero erros de compilação.
