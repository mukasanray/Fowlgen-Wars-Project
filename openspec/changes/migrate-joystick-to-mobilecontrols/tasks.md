# Tasks for migrate-joystick-to-mobilecontrols

## 1. Contrato e Domínio (MobileControls)
- [x] **1.1** Expandir `IJoystickInput.cs` com o enum `JoystickMode { Fixed, Floating, Dynamic }` e métodos `SetMode`/`CycleMode` (@Marcos)
- [x] **1.2** Evoluir `VirtualJoystickView.cs` para suportar posicionamento dinâmico nos 3 modos e reposicionamento de background/handle (@Marcos)

## 2. Recursos Visuais e Prefabs
- [x] **2.1** Copiar sprites de joystick para `Assets/Modules/MobileControls/Sprites/` (@Marcos)
- [x] **2.2** Criar prefab canônico `Assets/Modules/MobileControls/Prefabs/Virtual Joystick.prefab` com `VirtualJoystickView` (@Marcos)

## 3. Desacoplamento de Gameplay
- [x] **3.1** Refatorar `MobilePlayerController.cs` para remover campos e métodos vinculados a `JoystickPack` (@Marcos)
- [x] **3.2** Atualizar `JoystickModeSwitcher.cs` para integrar ao `MobilePlayerController` desacoplado (@Marcos)
- [x] **3.3** Remover dependência `"JoystickPack"` de `FowlgenWars.Modules.Gameplay.asmdef` (@Marcos)

## 4. Integração na Cena e Ferramenta de Setup
- [x] **4.1** Atualizar `SetupMobaArenaComplete.cs` para usar o prefab do `MobileControls` (@Marcos)
- [x] **4.2** Atualizar a cena `BattleArena.unity` com o novo componente e ligações (@Marcos)
- [x] **4.3** Excluir pasta legada `Assets/Joystick Pack` (@Marcos)
- [x] **4.4** Atualizar especificação `openspec/specs/battle-arena.md` e validar compilação (@Marcos)
