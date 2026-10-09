# 🛡️ Fowlgen Wars — DevSecOps & Security Checklist

> **Framework de Segurança Contínua para Web3 & Mobile Game**  
> **Responsável / Auditor:** Jorge Espindola (`jpespindola` — DevSecOps & Security Engineer)  
> **Padrão de Conformidade:** OWASP MASVS (Mobile), Solana Security Best Practices (Neodyme / OtterSec), Rust Security Guidelines.

---

## 🧭 1. Resumo Executivo das Camadas de Defesa

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                        CAMADA 0: REPOSITÓRIO & SECRETS                │
 │       Gitleaks Scan • Pre-commit Rules • Rigorous .gitignore          │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │
 ┌──────────────────────────────────▼─────────────────────────────────────┐
 │                     CAMADA 1: SMART CONTRACTS (RUST/ANCHOR)           │
 │       Signer Verification • PDA Validation • Integer Overflow Checks   │
 │       Cargo Audit (CVEs) • Cargo Clippy • LiteSVM Automated Tests      │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │
 ┌──────────────────────────────────▼─────────────────────────────────────┐
 │                      CAMADA 2: UNITY & CLIENTE C# MOBILE               │
 │       MWA Wallet Isolation • Non-custodial Key Management              │
 │       Zero Plaintext Private Keys • Memory Safe Deserialization        │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │
 ┌──────────────────────────────────▼─────────────────────────────────────┐
 │                  CAMADA 3: INFRAESTRUTURA & MULTIPLAYER OFF-CHAIN      │
 │       Docker Rootless • Minimal Alpine/Debian Images • Network Limits  │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 2. Checklist Detalhado por POC (Proof of Concept)

### 🔹 POC 01: Fundação Unity & Build Settings
- [x] **Configuração de Permissões Android:** Manifest restrito apenas às permissões necessárias (`INTERNET` para RPC).
- [x] **IL2CPP & Striping:** Configurado para compilação segura sem expor símbolos sensíveis em produção.
- [x] **Sanitização de Logs:** Logs de debug desabilitados ou mascarados para builds de produção (`Release`).

### 🔹 POC 02: Camada de Conexão RPC Solana Devnet
- [x] **HTTPS/WSS Obrigatório:** Conexões RPC utilizam endpoints seguros criptografados (`https://api.devnet.solana.com`).
- [x] **Fallback & Timeout:** Implementação de timeouts para evitar bloqueio e *Denial of Service* (DoS) na Main Thread.
- [x] **Sem Exposição de API Keys:** Nenhuma API Key ou secret de RPC privado injetada em código-fonte.

### 🔹 POC 03: Workspace Anchor & Smart Contract Rust
- [x] **Verificação de Signatários (`Signer<'info>`):** Toda instrução que altera estado valida se o remetente é signatário da transação.
- [x] **Validação de PDAs & Seeds (`seeds = [...], bump`):** Verificação canônica de bumps para evitar colisões e falsificação de contas.
- [x] **Proteção contra Integer Overflow/Underflow:** Uso de tipos seguros e `checked_add` / `checked_sub` em operações de saldo/score.
- [x] **Account Ownership Checks:** Validação rigorosa de que contas de dados pertencem ao `ID` do programa (`owner == program_id`).
- [x] **Reentrancy Protection:** Arquitetura do modelo de contas da Solana isolando estado por transação atômica.

### 🔹 POC 04: Unity ↔ Anchor IDL Bridge
- [x] **Integridade do IDL:** Validação do hash e assinatura do schema JSON gerado pelo Anchor.
- [x] **Desserialização Segura (Borsh):** Tratamento de exceções em dados corrompidos para evitar crashes e *Buffer Overflow*.
- [x] **Separação de Camadas:** O cliente Unity opera como interface agnóstica sem privilégios administrativos on-chain.

### 🔹 POC 05: Wallet & Fluxo de Transações (Web3 Security)
- [x] **Isolamento de Chaves Privadas:** O aplicativo Unity **NUNCA** armazena, solicita ou manuseia chaves privadas ou seed phrases em disco/memória.
- [x] **Delegação via MWA (Mobile Wallet Adapter):** Toda assinatura de transação é delegada com segurança para carteiras externas auditadas (ex: Phantom / Solflare).
- [x] **Prevenção de Assinatura Cega (Blind Signing):** Instruções claramente discriminadas para que o jogador visualize o que está aprovando.

### 🔹 POC-UNI-04: Audio Engine & Performance Mobile
- [x] **Prevenção de Garbage Collection Spikes:** `AudioManager` em pool pré-alocado, sem alocações contínuas de memória no loop de 60 FPS.
- [x] **Compressão & Formatos Otimizados:** Uso de Vorbis/OGG para músicas de fundo e ADPCM para efeitos sonoros de disparo rápido.

### 🔹 POC-OFF-01: Infraestrutura Headless / Docker (FishNet Server)
- [x] **Execução Não-Root:** Contêineres configurados para rodar sob usuário sem privilégios administrativos.
- [x] **Imagens Imutáveis & Mínimas:** Imagem base minimalista sem compiladores ou ferramentas dispensáveis em tempo de execução.
- [x] **Rate Limiting & Network Bounds:** Limitação de payload de rede por socket para evitar exaustão de buffer.

---

## 🤖 3. Matriz de Automação no CI/CD (GitHub Actions)

A esteira de automação executa as seguintes verificações em cada `push` e `pull_request`:

| Ferramenta | Escopo | Objetivo de Segurança |
| :--- | :--- | :--- |
| **Gitleaks** | Todo o repositório | Detecta chaves privadas Solana (`id.json`), JWTs, API keys e tokens commitados acidentalmente. |
| **Cargo Audit** | `/program` (Rust) | Escaneia a árvore de dependências Rust contra a base de dados de vulnerabilidades da RustSec. |
| **Cargo Clippy & Fmt** | `/program` (Rust) | Linter rigoroso para detectar anti-patterns, potenciais bugs de memória e inconsistências de código. |
| **LiteSVM Test Suite** | `/program` (Anchor) | Executa testes unitários e de integração determinísticos sem dependência de rede externa. |
| **Dotnet / C# Security Linter** | `/unity` (C#) | Varre os scripts C# buscando práticas inseguras de armazenamento de segredos e chamadas inseguras. |

---

## 🔄 5. Passo a Passo para Validação Contínua (A Cada Commit)

Para manter a conformidade de segurança e evitar quebras na esteira de CI/CD, todo desenvolvedor deve seguir o seguinte fluxo antes de enviar alterações:

```text
  [Alteração no Código]
           │
           ▼
  [1. Checagem de Chaves] ──► git diff (Garantir 0 chaves/secrets em staging)
           │
           ▼
  [2. Teste do Smart Contract] ──► cd program && cargo test (LiteSVM deve dar 100% OK)
           │
           ▼
  [3. Auditoria & Linter] ──► cargo clippy & cargo fmt (Sem warnings críticos)
           │
           ▼
  [4. Commit & Push] ──► Disparo automático dos Workflows no GitHub Actions
           │
           ▼
  [5. Status no GitHub] ──► Badges Verdes ✅ no PR (Gitleaks + Audit + Anchor CI)
```

### 🛠️ Comandos Rápidos para Validação Local (Antes do Commit):

1. **Smart Contracts (Rust/Anchor):**
   ```bash
   cd program
   cargo test              # Valida instruções on-chain no LiteSVM
   cargo clippy            # Linter de segurança e boas práticas
   ```

2. **Detecção Local de Segredos:**
   ```bash
   git status              # Verifique se nenhum id.json ou .env está listado
   ```

3. **Validação Automática no GitHub:**
   - Ao abrir um PR ou dar `git push`, os workflows **`Security & DevSecOps Suite`** e **`Anchor Smart Contract CI`** rodam automaticamente e barram o merge se houver falhas.

