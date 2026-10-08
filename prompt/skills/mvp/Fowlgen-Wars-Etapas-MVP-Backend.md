# Fowlgen Wars - Etapas de Desenvolvimento MVP (Backend, On-Chain e Off-Chain)

**Data Limite:** 10 de Outubro de 2026 (Meta Interna Hackathon)
**Responsáveis Principais:** 
- **Marcos:** Líder Técnico, Unity Core, FishNet Headless, Desenvolvimento do `install.sh` e Integração Docker.
- **Jorge:** DevSecOps, Automação CI/CD, Infraestrutura Anchor, AppSec e Google Play Console.

---

## Fase 1 - Autenticação Off-Chain e Banco de Dados
**Objetivo:** Suportar a Tela de Login do jogo.

1. **Setup de Banco de Dados Off-Chain (Responsável: Marcos):**
   - Configurar o banco relacional (ex: PostgreSQL) para as credenciais/nicknames.
2. **Integração FishNet + Database (Responsável: Marcos):**
   - O Servidor validará as requisições de Login enviadas pela Unity.

---

## Fase 2 - On-Chain (Smart Contract Anchor na Solana)
**Objetivo:** Contrato inteligente validando a economia.

1. **Desenvolvimento do Contrato `program/` (Responsáveis: Marcos e Jorge):**
   - Lógica Anchor para registro Web3 e recompensas.
2. **Testes Locais Anchor (Responsável: Jorge):**
   - Garantir que a lógica passe com `cargo test` verde localmente usando LiteSVM.
3. **Integração IDL Temporária (Responsável: Marcos):**
   - Exportar o arquivo `.json` do IDL gerado localmente para que o Marcos já possa construir as leituras na Unity.

---

## Fase 3 - Off-Chain (Servidor Dedicado FishNet)
**Objetivo:** Hospedar a autoridade da partida via Docker.

1. **Script de Instalação `install.sh` (Responsável: Marcos):**
   - Automação de dependências (Rust, Anchor, Docker).
2. **Criação do Dockerfile e FishNet (Responsável: Marcos):**
   - Empacotar a build *Headless* (Linux) da Unity e expor UDP/WebSockets.
3. **Autoridade do Servidor (Responsável: Marcos):**
   - O Servidor FishNet controla mecânicas anti-cheat.

---

## Fase 4 - Deploys Finais (Anchor Devnet e Google Play Console)
**Objetivo:** Fechar o ciclo enviando tudo para a "nuvem" e validando segurança.

1. **DevSecOps e Anti-Leak AppSec (Responsável: Jorge):**
   - Scanner Gitleaks para garantir que as *Chaves Privadas* e *Seed Phrases* necessárias para o Deploy não vazem no repositório.
   - Manter o CI/CD rodando.
2. **Deploy do Anchor na Devnet (Responsáveis: Marcos e Jorge):**
   - Executar o comando final de Deploy na blockchain Solana (Devnet). Atualizar definitivamente o `Program ID` na Unity. Ambos acompanham para checar as transações.
3. **Deploy Android Oficial (Responsável: Jorge):**
   - Assumir a conta de desenvolvedor na Google Play.
   - Configurar a trilha de Teste Interno efetuando o upload do arquivo **`.aab` (Android App Bundle)** assinado.
