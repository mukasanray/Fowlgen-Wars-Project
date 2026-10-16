# Feature: multiplayer-fishnet-1v1-hibrido

## Title
POC-NET-01: Multiplayer Híbrido FishNet 1v1

## Summary
Implementação do modo multiplayer 1v1 local (Host & Client) via FishNet na cena Arena_Clean.unity para demonstração de combate em tempo real com dois smartphones sincronizados no vídeo pitch de 3 minutos.

## Motivation
Permitir demonstrar combate em tempo real entre dois aparelhos móveis sem latência de blockchain, comprovando a arquitetura híbrida do projeto.

## Context & Existing Implementations
FishNetMultiplayer.cs, FishNetPOCLauncher.cs e NetworkManager integrado na Arena_Clean.

## Proposed Solution
Topologia Host & Client com transporte Tugboat, sincronização de SyncVars de dano e lobby de conexão local LAN/Wi-Fi.

## Status
[APROVADO] por Marcos em 2026-10-14
