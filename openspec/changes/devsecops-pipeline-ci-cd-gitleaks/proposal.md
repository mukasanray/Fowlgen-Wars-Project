# Feature: devsecops-pipeline-ci-cd-gitleaks

## Title
POC-SEC-01: Pipeline DevSecOps, Gitleaks e CI/CD Anchor

## Summary
Blindagem do repositório contra vazamento de chaves privadas e seed phrases com scanner Gitleaks no GitHub Actions e pipeline de CI/CD para compilação e teste automático dos contratos Anchor em Rust.

## Motivation
Garantir segurança absoluta do repositório público e prevenir commits com secrets, evitando desclassificação no hackathon.

## Context & Existing Implementations
Workflow .github/workflows/ e arquivo .gitleaksignore configurados no repositório.

## Proposed Solution
Execução automática de cargo check, clippy, test e auditoria contínua de segredos em cada PR.

## Status
[APROVADO] por Jorge Espindola em 2026-10-15
