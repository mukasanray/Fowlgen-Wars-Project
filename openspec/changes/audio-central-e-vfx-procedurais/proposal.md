# Feature: audio-central-e-vfx-procedurais

## Title
POC-UNI-04: AudioManager Central e Efeitos Visuais (VFX)

## Summary
Implementação do sistema central de áudio com sintetizador procedural (11 SFX de combate), sistema de partículas de penas e auras (CombatVFXManager.cs) a 60 FPS, vinculação de texturas URP Lit dos Minions e correção de orientação 180°.

## Motivation
Resolver a reprovação de áudio da Sprint 01 e conferir impacto audiovisual ao combate do Mini-MOBA.

## Context & Existing Implementations
AudioManager.cs, CombatVFXManager.cs, materiais URP Lit dos minions Caipira e Rodilan.

## Proposed Solution
Pool de 12 canais de áudio, áudio procedural matemático em tempo real, partículas Shuriken leves e AutoRotation horizontal.

## Status
[APROVADO] por Jorge Espindola em 2026-10-13
