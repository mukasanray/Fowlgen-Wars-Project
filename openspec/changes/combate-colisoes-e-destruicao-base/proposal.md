# Feature: combate-colisoes-e-destruicao-base

## Title
POC-UNI-02: Colisão Física, Dano e Queda dos Galinheiros

## Summary
Resolução do teste de colisão física e combate reprovado na Sprint 01. Sistema de colisão por overlap, dano parametrizado via MinionDataSO, barras de vida 3D dos Galinheiros e validação automatizada em PlayMode batch (CombatAndBaseDestructionTests 4/4 PASS).

## Motivation
Garantir combate fluido e confiável entre heróis, tropas e bases sem atravessar obstáculos ou gerar travamentos físicos.

## Context & Existing Implementations
Scripts StructureGalinheiro.cs, HeroAgent.cs, MinionAgent.cs e CombatAndBaseDestructionTests.cs.

## Proposed Solution
Detecção de combate frente a frente, dedução de HP, evento OnStructureDestroyed e testes automatizados.

## Status
[APROVADO] por Manuel em 2026-10-13
