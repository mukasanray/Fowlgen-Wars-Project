# Feature: portal-web-hub-app

## Title
POC-WEB-01: Portal Web Oficial e API REST de Produção para o Site

## Summary
Desenvolvimento e integração entre o **Site Oficial Público do Game** (`app/`) e a **API REST Backend** (`api/`):
1. **Site Oficial Público do Game (`app/` — Junior):** Vitrine para a comunidade e jogadores (`Player`), download do APK, container do jogo Unity WebGL, integração Web3 com carteira Solana, mural público de apoiadores e página "Apoie-nos".
2. **API REST Backend para o Site (`api/` — Marcos):** Catálogo unificado de endpoints para suportar o portal web, cadastro de usuários, autenticação Web3, persistência de apoiadores comunitários (`/api/supporters`), RBAC (5 Perfis) e verificação de saúde da API (`GET /api/health`).
3. **Decisão sobre o Kanban (`kanban/`):** O projeto Kanban será desacoplado do repositório no futuro para se tornar um projeto/produto independente de visualização multi-projetos. Portanto, mantemos o `kanban/` exatamente no formato atual (gerador de dashboard interno via CLI) sem acoplamento de telas de backoffice neste momento.

## Motivation
Focar a entrega imediata no site público para os jurados da Colosseum e na API REST robusta em .NET 9, preservando o Kanban como ferramenta interna estável.

## Context & Existing Implementations
- Diretório `app/`: Estrutura Web oficial voltada ao jogador desenvolvida com React/TS/Tailwind.
- Diretório `api/src/backend/`: API em ASP.NET Core (.NET 9) com arquitetura DDD e Onix.Framework.
- Diretório `kanban/`: Ferramenta interna de integração OpenSpec e dashboard mantida no formato atual.

## Proposed Solution
- **Junior (`app/`):** Refatoração da vitrine pública de acordo com a API, conexão da carteira Solana, páginas Apoie-nos e Apoiadores, e UI/UX de alto padrão.
- **Marcos (`api/`):** Implementação da API REST de produção para o site, persistência EF Core, RBAC para os 5 perfis e endpoints de apoiadores.

## Status
[APROVADO] por Samuel em 2026-10-14 (Atualizado com direcionamento do Kanban e API para o site em 2026-10-20)
