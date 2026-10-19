# Especificação: BattleArena (Canônica)

## Contexto
A cena `Assets/Scenes/Game/BattleArena.unity` é a arena canônica única do MVP de Fowlgen Wars, consolidando o layout de 3 rotas e eliminando cenas de teste legadas.

## Especificação Técnica
1. **Layout de 3 Rotas:**
   - Rota Top (Superior): Ponte `Bridge_Right` (X = +9.39, Y = 10.5).
   - Rota Mid (Central): Ponte `Bridge_Center` (X = -0.15, Y = 10.5).
   - Rota Bot (Inferior): Ponte `Bridge_Left` (X = -9.45, Y = 10.5).
2. **Câmera MOBA Tática:**
   - Script `MobaCameraController.cs` calibrado em Pitch 40.8°, Yaw 88.2°, Offset (-22, 26, 0).
   - Orientação móvel travada em Landscape horizontal com `AutoRotation` (suporte a LandscapeLeft e LandscapeRight).
3. **Controles Táteis & Habilidades:**
   - Lado Esquerdo: Joystick Virtual flutuante via `Joystick Pack`.
   - Lado Direito: Ataque básico central + 4 habilidades: Q (Investida), W (Baluarte), E (Disparo Sagrado) e R (Ultimate Fúria Aviária).
4. **Bases e Estruturas:**
   - Base Aliada: `Base-Amarela` (Galinheiro Aliado) com 1000 HP.
   - Base Inimiga: `Base-Roxa-Inimiga` (Galinheiro Inimigo) com 1000 HP.
   - Barras de HP tridimensionais no mundo sobre as estruturas.
5. **Tropas:**
   - Facção Aliada: `Minion_Caipira_Player.prefab` (modelo URP Lit com barra verde #22C55E).
   - Facção Inimiga: `Minion_Rodilan_Enemy.prefab` (modelo URP Lit com barra vermelha #EF4444).
