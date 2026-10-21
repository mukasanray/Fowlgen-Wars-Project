# Tasks for mobilecontrols-full-feature-parity

## 1. Contrato e Domínio
- [x] **1.1** Atualizar `IJoystickInput.cs` com `AxisOptions`, `Horizontal`, `Vertical`, `SnapX`, `SnapY`, `SetAxisOptions` e `SetSnapping` (@Marcos)

## 2. Implementação na View
- [x] **2.1** Atualizar `VirtualJoystickView.cs` com suporte a `AxisOptions`, `SnapFloat`, `FormatInput`, `handleRange` relativo e auto-alinhamento de âncoras (@Marcos)
- [x] **2.2** Criar `VirtualJoystickEditor.cs` sob `#if UNITY_EDITOR` em `Assets/Modules/MobileControls/Editor/` (@Marcos)

## 3. Integração nos Controllers e Readers
- [x] **3.1** Atualizar `MobileInputReader.cs` expondo `Horizontal`, `Vertical` e `IsPressed` (@Marcos)
- [x] **3.2** Atualizar `MobilePlayerController.cs` com acesso a `Horizontal`, `Vertical`, `SetAxisOptions` e `SetSnapping` (@Marcos)

## 4. Recursos e Limpeza
- [x] **4.1** Copiar sprites de eixos (Horizontal e Vertical) para `Assets/Modules/MobileControls/Sprites/` (@Marcos)
- [x] **4.2** Remover pasta legada `Assets/Joystick Pack` (@Marcos)
- [x] **4.3** Validar compilação do projeto Unity (@Marcos)
