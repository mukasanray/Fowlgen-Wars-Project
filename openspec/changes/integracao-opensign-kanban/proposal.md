# Feature: integracao-opensign-kanban

## Title
Integração OpenSign com Kanban Studio e GitHub Codespaces

## Summary
Integração completa do OpenSign (plataforma self-hosted de assinatura digital de documentos) ao Kanban Studio do Fowlgen Wars, incluindo suporte nativo a desenvolvimento em GitHub Codespaces com port forwarding automático, menu superior esquerdo (hamburger), modal/iframe integrado, cliente tipado TypeScript e webhook com validação criptográfica HMAC SHA-256.

## Motivation
Permitir que a equipe, produtores e apoiadores criem, gerenciem e assinem digitalmente termos, contratos e acordos de produção e marketing sem sair do ecossistema ágil do Fowlgen Wars, suportando múltiplos métodos de autenticação de signatários (WhatsApp, SMS, E-mail e Certificados digitais).

## Context & Existing Implementations
- Diretório `kanban/` com servidor Node.js/TypeScript (`src/server/server.ts`), interface Web responsiva (`src/web/`), testes E2E (`test-e2e.cjs`) e configurador mestre (`install.ts`).
- Documento de especificação técnica e arquitetura em `prompt/files/relatorios/Relatorio_Integracao_OpenSign_Kanban.md`.

## Proposed Solution
1. **Setup Codespaces / Docker:** Configurações em `kanban/.devcontainer/` (`devcontainer.json`, `setup-codespace.sh`, `start-codespace.sh`), `docker-compose.dev.yml` e script de inicialização de bancos de dados Postgres (`scripts/init-multiple-dbs.sh`).
2. **Interface Kanban (UI):** Botão de menu no cabeçalho esquerdo (hamburger ☰), dropdown com item "OpenSign" (grafia estrita sem typos), modal responsivo com iframe embutido, botão de recarregar e link para nova aba.
3. **Backend & Segurança:** Endpoint `GET /api/config` para fornecer URLs públicas do ambiente e handler `POST /api/webhooks/opensign` com verificação de assinatura HMAC SHA-256 (`timingSafeEqual`).
4. **SDK & Clientes Tipados:** Módulo `src/lib/opensign.ts` com tipagem completa de signatários, criação de requisições de assinatura e validação de webhooks.

## Status
[APROVADO] por Samuel e Marcos em 2026-10-21
