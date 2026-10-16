# Feature: animacoes-personagens-mixamo

## Title
Fase 8: Rigging e Animator Controllers dos Personagens

## Summary
Configuração de rigs de animação e controladores de estado (Animator Controllers) para os heróis Milo e Axel e tropas Minion Caipira e Rodilan via Mixamo MCP, com locomoção suave (BlendTree Speed) e triggers de Attack e Death.

## Motivation
Elevar o acabamento visual do combate, substituindo poses estáticas por animações completas de corrida, golpe e derrota.

## Context & Existing Implementations
Pacote com.mixamo.mcp integrado no projeto e modelos 3D Tripo3D com esqueleto Armature.

## Proposed Solution
Criação dos controladores MiloAnimatorController, AxelAnimatorController e MinionAnimatorController com sincronização aos eventos de combate.

## Status
[APROVADO] por Manuel em 2026-10-14
