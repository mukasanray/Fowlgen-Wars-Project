# Feature: poc-01-fundacao-unity-telas

## Title
POC-01: Fundação Unity, Telas e Ciclo de Vida

## Summary
Estruturação da base da engine Unity 2022 URP, ciclo de vida com GameBootstrap, menu inicial responsivo em Play.unity e framework modular de telas de teste com toasts visuais.

## Motivation
Atender aos requisitos da Fase 1 do MVP conforme Claude.md e Relatório de QA da Sprint 01, estabelecendo a base arquitetural para todas as cenas de teste e produção.

## Context & Existing Implementations
Validação na cena Play.unity, MainMenuController.cs e framework POCScreenUI.cs / POCSceneRoot.cs.

## Proposed Solution
GameBootstrap operando com DontDestroyOnLoad, desacoplamento de navegação de menus e feedback visual imediato.

## Status
[APROVADO] por Marcos em 2026-10-13
