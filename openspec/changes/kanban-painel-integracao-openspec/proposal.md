# Feature: kanban-painel-integracao-openspec

## Title
Painel Kanban Studio & Central de Orquestração OpenSpec Git-Native

## Summary
Desenvolvimento do sistema completo de Kanban integrado diretamente aos arquivos Markdown do OpenSpec (proposal.md e tasks.md), com sincronização Git nativa, multi-seleção de responsáveis, filtros avançados de busca, projeto e diretório, e esteira preventiva contra ações acidentais.

## Motivation
Centralizar a gestão ágil do projeto Fowlgen Wars em uma ferramenta local, autônoma, leve e 100% alinhada com as especificações do OpenSpec e Claude.md, permitindo que líderes, desenvolvedores e agentes de IA colaborem com transparência total.

## Context & Existing Implementations
Diretório kanban/ contendo servidor Node/TypeScript (src/server/server.ts), interface web responsiva (src/web/), suite de testes automatizados (test-e2e.cjs) e configuração de membros da equipe (src/config/members.json).

## Proposed Solution
Painel com alternador de visão (Tarefas da Sprint, Funil de Ideias e Dashboard de Analytics), filtros por integrante e diretório/projeto (app, unity, prompt, kanban), pesquisa reativa, modais de confirmação e sincronização bidirecional com o repositório Git.

## Status
[APROVADO] por Samuel em 2026-10-18
