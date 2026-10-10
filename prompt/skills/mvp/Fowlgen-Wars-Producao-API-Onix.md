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
- **Módulo de Produção:** Opção `[10] Deploy em Produção` adicionada ao `install.sh`. O script agora possui suporte avançado a Traefik K8s, separando a injeção do Domínio da API e do FishNet de maneira automatizada e provisionando SSL Let's Encrypt através de um manifesto `HelmChartConfig`.

## [DESENVOLVIMENTO] Fase 4: Container Registry e Pipeline CI/CD (GitHub Actions)
**Status:** **CONCLUÍDO**
**Objetivo:** Automatizar o empacotamento do servidor para que qualquer ambiente possa baixá-lo.
- **1. GitHub Actions (GHCR):** Workflow (`.github/workflows`) operante, envia a imagem para o GitHub Container Registry a cada push na main.
- **2. Atualização dos YAMLs:** Manifestos K8s atualizados para buscar as imagens do repositório remoto (`ghcr.io/mukasanray/...`).

---

*(As fases abaixo dependem EXCLUSIVAMENTE da compra/contratação de um plano de VPS e Domínio e devem ser executadas por último)*

## [INFRAESTRUTURA] Fase 5: Cloud Setup (VPS e DNS)
**Status:** **PENDENTE (Aguardando Compra)**
**Objetivo:** Estabelecer o servidor físico/virtual e a rota de internet pública.
- **1. Provisionamento de VPS:** Contratar VPS com Linux (Ubuntu 24.04 recomendado).
- **2. Setup do Kubernetes (K3s):** Acessar a VPS, baixar o projeto e rodar a Opção `[10] Deploy em Produção` no `install.sh` (a instalação do K3s ocorrerá automaticamente caso não exista na máquina).
- **3. DNS:** Registrar um domínio e criar Apontamento A para o IP da VPS.

## [INFRAESTRUTURA] Fase 6: Storage e Validação 4G
**Status:** **PENDENTE (Aguardando VPS e Domínio online)**
**Objetivo:** Garantir persistência de dados e provar o conceito.
- **1. Storage Class (PVC):** Garantir que o `postgres-pvc.yaml` utilize a *StorageClass* adequada do provedor da VPS para não perder os dados do banco de dados (Apenas verificar ao instalar a VPS).
- **2. Teste em 4G:** Como o roteamento, ingress e certificados SSL já foram desenvolvidos em código, o teste final consistirá em conectar o Unity Client pelo celular e realizar a partida 100% hospedada na nuvem.
