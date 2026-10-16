# Feature: web3-hub-app-solana-devnet-jorge

## Title
POC-WEB-02: Hub Web3 Solana Devnet, Wallet Adapter e Deploy Vercel (Jorge Espindola)

## Summary
Implementação da camada Web3 e integração de carteiras Solana no portal web oficial na pasta app/. Desenvolvido exclusivamente por Jorge Espindola (@Jorge-Espindola / jpespindola), cobrindo conexão com Phantom/Solflare, consulta RPC de saldo SOL na Devnet, autenticação criptográfica Ed25519, configuração de deploy na Vercel (vercel.json) e ponte WebGL resiliente para execução na Itch.io.

## Motivation
Separar e evidenciar com total clareza a contribuição técnica individual de Jorge Espindola no desenvolvimento da pasta app/, desacoplando de Marcos (Core Unity/FishNet/K8s) e de Junior (Conteúdo/Layout Web).

## Context & Existing Implementations
- Commits `a3a505e`, `31b37a6` e `a02e21c` na pasta `app/`.
- Arquivos: `app/app.ts`, `app/app.js`, `app/index.html`, `app/vercel.json` e `rollback.sh`.

## Proposed Solution
Isolamento formal da entrega Web3 no OpenSpec com rastreabilidade direta aos commits do autor Jorge Espíndola.

## Status
[APROVADO] por Jorge Espindola em 2026-10-13
