# Feature: poc-02-03-smart-contract-anchor-solana

## Title
POC-ANC-01/02: Smart Contract Anchor & Deploy Devnet

## Summary
Implementação do contrato inteligente Anchor em Rust na pasta program/, testes automatizados com LiteSVM (100% PASS) e deploy on-chain persistente na Solana Devnet sob o Program ID 81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE.

## Motivation
Camada Web3 do MVP para registro de partidas e validação on-chain, desacoplada da física em tempo real conforme Claude.md.

## Context & Existing Implementations
Contrato program/programs/fowlgen_wars_contract/src/lib.rs e teste de integração tests/test_initialize.rs.

## Proposed Solution
Instruções initialize e increment implementadas, IDL exportado e verificado no Solana Explorer.

## Status
[APROVADO] por Jorge em 2026-10-13
