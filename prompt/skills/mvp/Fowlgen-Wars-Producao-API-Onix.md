# Prompt de Execução: Colocar Servidor FishNet em Produção e Construção da API (Onix Framework)
**Responsável:** Marcos (Líder Técnico / Dev Core Unity & Web3)

Este documento define o plano estruturado em fases para realizar o deploy em nuvem (Produção) do servidor headless FishNet do projeto Fowlgen Wars, integrando a criação de uma API centralizada em .NET 9. Esta execução evolui a arquitetura atual para um ambiente escalável utilizando uma VPS, roteamento via Traefik (Proxy Reverso com SSL), um Domínio registrado e o ecossistema `Onix.Framework`.

Conforme recomendações de AppSec e boas práticas do ecossistema Solana, o servidor em produção deve manter a autoridade (Server-Authoritative) para validar métricas e assinar transações on-chain, prevenindo manipulações no cliente.

---

## [DESENVOLVIMENTO] Fase 1: Construção da API Central (.NET 9)
**Status:** **CONCLUÍDO**
**Objetivo:** Criar uma API robusta em ASP.NET Core para intermediar toda a comunicação entre o Site (Junior), o Game Server FishNet (Marcos) e o Banco de Dados (PostgreSQL).
- **Setup e ORM:** API criada utilizando `Onix.Framework` e Entity Framework Core (Migrations automatizadas).
- **Endpoints REST:** `POST /api/users` (Registro) e `POST /api/users/login` (Autenticação Web3 via Ed25519).

## [DESENVOLVIMENTO] Fase 2: Segurança On-Chain e Integração Unity (Solana)
**Status:** **CONCLUÍDO**
**Objetivo:** Garantir a autoridade do servidor antes da comunicação com a Blockchain.
- **Server-Authoritative Logic:** A API valida a carteira do usuário de forma segura. O `MatchRewardManager.cs` (no servidor FishNet) calcula os PDAs da rede Solana, assina a transação usando a chave de autoridade do K8s Secrets e efetua o `claim_reward` no Smart Contract Anchor da Devnet oficial (`81MprTi...`).

## [DESENVOLVIMENTO] Fase 3: Script de Instalação e Automação Local
**Status:** **CONCLUÍDO**
**Objetivo:** Automatizar a gestão da produção a partir da máquina local/repositório.
- **Módulo de Produção:** Opção `[10] Deploy em Produção (VPS/Nuvem)` adicionada ao `install.sh`. O script injeta dinamicamente o domínio de produção nas regras Host do Traefik, mantendo os arquivos YAML intactos para testes locais.

## [DESENVOLVIMENTO] Fase 4: Container Registry e Pipeline CI/CD (GitHub Actions)
**Status:** **PENDENTE**
**Objetivo:** Automatizar o empacotamento do servidor para que qualquer ambiente possa baixá-lo.
- **1. GitHub Actions (GHCR):** Criar workflow (`.github/workflows`) para fazer build das imagens Docker (API e FishNet) e subir para o GitHub Container Registry automaticamente.
- **2. Atualização dos YAMLs:** Atualizar os manifestos K8s para puxar as imagens do repositório remoto (`ghcr.io/...`) em vez do build local.

---

*(As fases abaixo dependem EXCLUSIVAMENTE da compra/contratação de um plano de VPS e Domínio e devem ser executadas por último)*

## [INFRAESTRUTURA] Fase 5: Cloud Setup (VPS e DNS)
**Status:** **PENDENTE (Aguardando Compra)**
**Objetivo:** Estabelecer o servidor físico/virtual e a rota de internet pública.
- **1. Provisionamento de VPS:** Contratar VPS com Linux (Ubuntu 24.04 recomendado).
- **2. Setup do Kubernetes:** Instalar **K3s** (Rancher) ou **MicroK8s** na VPS.
- **3. DNS:** Registrar um domínio e criar Apontamento A para o IP da VPS.

## [INFRAESTRUTURA] Fase 6: Configuração de Ingress, Storage e Traefik
**Status:** **PENDENTE (Aguardando VPS)**
**Objetivo:** Garantir roteamento, persistência e segurança SSL.
- **1. Let's Encrypt:** Configurar o Traefik Ingress na VPS com os argumentos de ACME (SSL Automático) usando o domínio real.
- **2. Storage Class (PVC):** Garantir que o `postgres-pvc.yaml` utilize a *StorageClass* adequada do provedor da VPS para não perder dados de banco.
- **3. Teste em 4G:** Conectar o Unity Client pelo celular e realizar a partida 100% hospedada na nuvem.
