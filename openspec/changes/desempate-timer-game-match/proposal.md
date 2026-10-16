# Feature: desempate-timer-game-match

## Title
Regra de Desempate do Timer da Partida de 3 Minutos

## Summary
Definição e implementação da regra formal de desempate quando o cronômetro atinge 00:00 sem destruição total de nenhum dos Galinheiros, resolvendo a pendência técnica registrada em Claude.md.

## Motivation
Eliminar ambiguidade no GameMatchManager onde playerHp >= enemyHp aguarda decisão formal do PO Samuel Menon.

## Context & Existing Implementations
MatchHUDTimerTracker.cs e GameMatchManager.cs na Unity.

## Proposed Solution
Comparação da porcentagem de vida dos Galinheiros ou critério de maior número de tropas ativas, com feedback visual de fim de tempo.

## Status
[CRIADO] por Samuel em 2026-10-16
