# Tasks for health-bar-black-bg

## 1. Planning
- [x] **1.1** (Marcos) Revisar spec vs Claude.md + conflito dano preservado

## 2. Implementation
- [x] **2.1** (Marcos) WorldHealthBarView BG preto + fill clamp + SetTeamColor (GreenA #22C55E / RedB #EF4444 / BgBlack #000)
- [x] **2.2** (Marcos) HeroAgent Start/Initialize/TakeDamage/Die/Respawn SetTeamColor+Clamp+UpdateHealth(0) - sem mexer dano/IA
- [x] **2.3** (Marcos) MinionAgent Initialize/TakeDamage SetTeamColor+Clamp
- [x] **2.4** (Marcos) StructureGalinheiro Awake/Initialize/TakeDamage SetTeamColor+Clamp - Base_HealthBar billboard

## 3. Verification
- [x] **3.1** (Marcos) Play Arena_Clean validar 65%/25%/0% fill proporcional BG imóvel - PASS (DRAIN2: 650/1000=0.65, 250/1000=0.25, 0/1000=0.00 barActive True, bg #000)
- [x] **3.2** (Marcos) Validar 4 grupos billboard câmera - PASS (BAR_AFTER_FIX 4 bars: Milo, Axel, Base-Amarela, Base-Roxa-Inimiga, sz 2.4x0.36 / 4.00x0.50)
- [x] **3.3** (Marcos) Cena salva persistindo HealthBar_Canvas em Milo/Axel - PASS (FINAL_SAVE saved True, RESET_BAR 4 bars fill 1.00)
