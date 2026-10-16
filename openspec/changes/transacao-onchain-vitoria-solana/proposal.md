# Feature: transacao-onchain-vitoria-solana

## Title
POC-INT-02: Registro On-Chain da Vitória na Solana Devnet

## Summary
Fluxo de assinatura de transação real na Solana Devnet disparando a instrução increment do contrato Anchor 81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE após a vitória do jogador na Arena_Clean, gerando link verificável no Solana Explorer.

## Motivation
Critério de altíssimo peso dos jurados do Hackathon: demonstrar conexão inequívoca entre gameplay na Unity e liquidação na blockchain Solana.

## Context & Existing Implementations
TransactionManager.cs, IDL fowlgen_wars_contract.json e botão no VictoryDefeatPanel.

## Proposed Solution
Montagem de transação assinada pela carteira conectada, broadcast RPC para a Devnet e toast com link do Explorer.

## Status
[APROVADO] por Jorge em 2026-10-15
