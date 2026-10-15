# Feature: route-lines-hidden

## Title
Ocultar Linhas de Debug dos Trilhos em Jogo

## Summary
Ocultar LineRenderer das 3 rotas em gameplay. Visível só em Editor (Gizmos) ou debug temporário HighlightTemporarily 2.5s.

## Motivation
Print mostra trilhos ciano/amarelo/magenta poluindo gameplay. EAP Item 25: rota é debug.

## Proposed Solution
WaypointPath: debugLineVisibleInGame=false default, SetupVisualLine enabled=debugFlag, HighlightPulse volta a false se debug off, OnDrawGizmos intacto.

## Alternatives Considered
Remover LineRenderer total - adiado, mantém debug opcional.

## Impact
- [ ] Breaking changes
- [x] Menor mudança visual

## Status
[APROVADO] por Marcos em 2026-10-15
