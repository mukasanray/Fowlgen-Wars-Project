# Feature: infra-k8s-fishnet-server-headless

## Title
Dedicated Game Server Headless & Infraestrutura K8s

## Summary
Infraestrutura de servidor dedicado FishNet em container Linux headless com orquestração em Kubernetes (Minikube), K8s Secrets e banco PostgreSQL para suporte escalável da autoridade off-chain pós-MVP.

## Motivation
Atender aos requisitos da Fase 4 de infraestrutura documentados em Relatorio_Fase4_MVP.md e Claude.md.

## Context & Existing Implementations
Diretório k8s/ e scripts de automação install.sh na raiz do repositório.

## Proposed Solution
Build headless do servidor Unity, exposição da porta UDP 7770 e persistência com PVCs.

## Status
[CRIADO] por Marcos em 2026-10-16
