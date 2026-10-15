# Feature: health-bar-black-bg

## Title
Barra de Vida MOBA com Fundo Preto Imóvel

## Summary
Barra MOBA BG preto fixo #000 + fill que encolhe por vidaAtual/vidaMaxima (Lado A #22C55E verde, Lado B #EF4444 vermelho). Reutiliza sistema vida/dano/morte/respawn sem alterar dano/vidaMax/IA.

## Motivation
Documento exige BG preto imóvel + fill proporcional. 0% fill 0 só BG preto visível. 4 grupos mesma WorldHealthBarView com billboard.

## Proposed Solution
WorldHealthBarView: BG fillAmount=1 fixo, Fill Filled Horizontal left clamp 0..1, GreenA/RedB/BgBlack, SetTeamColor(team), EnsureVisuals corrige 2.4x0.36 cria BG remove Fill_Trail. Hero/Minion/Galinheiro: SetTeamColor + Clamp + UpdateHealth(0) morte.

## Alternatives Considered
Segmentação LoL chunks, Waypoint toggle, contact damage adiados para changes separados (revertidos nesta entrega).

## Impact
- [ ] Breaking changes
- [x] Reutiliza sistema existente - sem alterar balanceamento

## Status
[APROVADO] por Marcos em 2026-10-15
