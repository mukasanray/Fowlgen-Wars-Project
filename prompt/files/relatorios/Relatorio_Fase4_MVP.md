# Relatório de Execução - Fase 4: Infraestrutura e Orquestração (DevSecOps)

**Responsável:** Marcos (Líder Técnico / Dev Core Unity & Web3) e Jorge Espindola (DevSecOps & Cloud Architect)
**Data:** Atualização Contínua
**Escopo:** Migração da infraestrutura local de Docker Compose para Kubernetes (Minikube).

## 1. Resumo da Atualização (Migração para Kubernetes)

Nesta etapa (evoluindo da Fase 3 para a Fase 4 de infraestrutura), o projeto deu um salto significativo em direção a uma arquitetura de produção escalável e profissional para suportar o servidor multiplayer (FishNet) e o banco de dados.

### 1.1 O que foi feito:
- **Remoção do Docker Compose Local:** O antigo método de deployment simples pelo `docker-compose.yml` foi retirado da lógica de execução direta do instalador, pois não oferecia as propriedades necessárias de escalabilidade e *self-healing* exigidas para um servidor de jogo online.
- **Implementação do Minikube (K8s Local):** O script `Install.sh` foi reescrito para utilizar o Minikube como fundação arquitetural. Agora, o script possui uma área dedicada (Opção 9) apenas para gerenciar o Deploy via Kubernetes.

## 2. Componentes Migrados para o Kubernetes

### 2.1 Servidor Headless FishNet
- **Deployment:** Criado `k8s/fishnet-deployment.yaml`.
- **Service:** Criado `k8s/fishnet-service.yaml` expondo a porta `7770` UDP/TCP via `NodePort` (30770 e 30771).
- O container do jogo headless agora roda sob a tutela do Kubernetes, podendo ser reiniciado automaticamente em caso de falha.

### 2.2 Banco de Dados PostgreSQL Integrado com Secrets
- **Segurança (AppSec):** Senhas do banco de dados (hardcoded anteriormente) foram removidas. O instalador `Install.sh` agora pergunta interativamente o usuário e a senha e injeta esses dados usando `Kubernetes Secrets` de forma criptografada (`postgres-secret`).
- **Persistência de Dados (PVC):** Criado `k8s/postgres-pvc.yaml` para garantir que o *save state* do banco de dados não seja perdido quando o pod reiniciar.
- **Deployment & Service:** Criados `k8s/postgres-deployment.yaml` e `k8s/postgres-service.yaml` expondo o banco na porta interna `5432` para uso exclusivo do servidor FishNet.

## 3. Próximos Passos na Nuvem

Esta configuração local no Minikube reflete exatamente o que será feito na nuvem em serviços gerenciados (como AWS EKS ou Google GKE). A base para a infraestrutura de rede robusta e de alta disponibilidade do jogo está completamente estabelecida.
