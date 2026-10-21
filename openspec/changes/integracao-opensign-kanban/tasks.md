# Tasks for integracao-opensign-kanban

## 1. Setup GitHub Codespaces e Infraestrutura Docker (Implementado)
- [x] **1.1** Criar configuração do Codespaces em `kanban/.devcontainer/devcontainer.json` com encaminhamento de portas (3000, 3001, 5432, 6379) e extensões (@Jorge Espindola)
- [x] **1.2** Criar script `kanban/.devcontainer/setup-codespace.sh` para criação de admin, geração de tokens e registro de webhook no start inicial (@Jorge Espindola)
- [x] **1.3** Criar script `kanban/.devcontainer/start-codespace.sh` para atualizar URLs públicas reativas do Codespace a cada inicialização (@Jorge Espindola)
- [x] **1.4** Criar `kanban/docker-compose.dev.yml` orquestrando Kanban, OpenSign, PostgreSQL 16 e Redis 7 (@Jorge Espindola)
- [x] **1.5** Criar `kanban/Dockerfile.dev` com Node 20, ferramentas de banco e utilitários Unix (@Jorge Espindola)
- [x] **1.6** Criar script de inicialização `kanban/scripts/init-multiple-dbs.sh` para databases `kanban` e `opensign` no PostgreSQL (@Jorge Espindola)
- [x] **1.7** Adicionar script `setup:opensign` no `kanban/package.json` para facilitar clone/submódulo do repositório OpenSign (@Marcos)

## 2. Backend, Segurança e Webhooks (Implementado)
- [x] **2.1** Desenvolver cliente tipado TypeScript em `kanban/src/lib/opensign.ts` com interfaces `Signer`, `SignRequestResult` e métodos de API (@Marcos)
- [x] **2.2** Implementar handler e middleware em `kanban/src/app/api/webhooks/opensign/route.ts` (@Marcos)
- [x] **2.3** Adicionar endpoint `GET /api/config` no `kanban/src/server/server.ts` expondo URLs públicas do OpenSign e Webhook (@Marcos)
- [x] **2.4** Adicionar endpoint `POST /api/webhooks/opensign` no `kanban/src/server/server.ts` com validação estrita HMAC SHA-256 e proteção contra falhas de timing buffer (@Marcos)
- [x] **2.5** Configurar `server.listen` na interface `0.0.0.0` para permitir acesso de containers e GitHub Codespaces Port Forwarding (@Marcos)

## 3. Interface Web Kanban e Modal OpenSign (Implementado)
- [x] **3.1** Inserir botão de menu no cabeçalho esquerdo (hamburger ☰) em `kanban/src/web/index.html` (@Marcos)
- [x] **3.2** Inserir item de menu com label correto "OpenSign" (prevenindo typo "OpenSing") e item do Dashboard em `kanban/src/web/index.html` (@Marcos)
- [x] **3.3** Implementar estilos responsivos do menu dropdown e do botão hamburger em `kanban/src/web/styles.css` (@Marcos)
- [x] **3.4** Implementar funções `initHamburgerMenu`, `openOpenSignModal` e `openOpenSignDashboard` em `kanban/src/web/app.js` (@Marcos)
- [x] **3.5** Suporte a navegação por teclado (Enter, Espaço, Escape) e recarregamento/abertura externa no modal iframe (@Marcos)

## 4. Testes Automatizados e Homologação (Implementado)
- [x] **4.1** Expandir suite E2E (`kanban/test-e2e.cjs`) com bateria completa de testes de integridade para UI do OpenSign, endpoints de configuração e validação criptográfica HMAC (@Marcos)
- [x] **4.2** Blindar execução do endpoint de reset com flag `dryRun` nos testes E2E evitando perdas de estado no repositório (@Marcos)
- [x] **4.3** Validar execução e aprovação 100% da bateria de testes (@Marcos)

## 5. Refinamento de UX, Painel Lateral e Diagnóstico Offline (Implementado)
- [x] **5.1** Posicionar botão de menu hambúrguer no extremo esquerdo do cabeçalho do Kanban (@Marcos)
- [x] **5.2** Migrar menu dropdown para Drawer Lateral deslizante (`sidebar-drawer`) com backdrop blur e animações suaves (@Marcos)
- [x] **5.3** Corrigir injeção do modal no DOM (`overlay.appendChild(modal)`) e elevar `z-index` para 100000 (@Marcos)
- [x] **5.4** Desenvolver sistema inteligente de diagnóstico de conectividade em tempo real para o OpenSign (:3001) com instruções para WSL/Docker e Codespaces (@Marcos)
- [x] **5.5** Adicionar suporte a URL personalizada com persistência em `localStorage` e botão de reconexão (@Marcos)
- [x] **5.6** Simplificar o menu lateral removendo botões redundantes (Dashboard, Configurações, Sobre) e mantendo foco exclusivo no OpenSign (@Marcos)
- [x] **5.7** Atualizar relatório oficial `Relatorio_Integracao_OpenSign_Kanban.md` com as novas diretrizes e testes (@Marcos)

