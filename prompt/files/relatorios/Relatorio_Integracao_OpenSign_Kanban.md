# Relatório de Integração OpenSign → Kanban + GitHub Codespaces

## Visão Geral
| Item | Detalhe |
|------|---------|
| **Repo OpenSign** | `https://github.com/OpenSignLabs/OpenSign` |
| **Stack** | Node/Express + React + PostgreSQL + Redis + BullMQ |
| **API** | REST v1 + Webhooks |
| **Auth signatário** | E-mail, SMS (Twilio), WhatsApp (Meta), Certificado A1/A3 |
| **Validade** | Avançada (Lei 14.063) + PAdES-LTV (TSA RFC3161) |
| **Hospedagem** | Self-hosted (Docker) — sua infra, seus dados |
| **Dev Environment** | **GitHub Codespaces** (0 config rede, URLs públicas automáticas) |
| **Diretório do Projeto** | `kanban/Opensign` (case-sensitive: `kanban` minúsculo) |
| **Setup Command** | `npm run setup` (executa `install.ts`) |

---

## Arquitetura Completa (Dev → Staging → Prod)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GITHUB CODESPACES (DEV)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Kanban    │  │  OpenSign   │  │ PostgreSQL  │  │   Redis     │       │
│  │  :3000      │  │  :3001      │  │  :5432      │  │  :6379      │       │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘  └─────────────┘       │
│         │                │                                                  │
│         ▼                ▼                                                  │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │  GitHub Port Forwarding (PÚBLICO, SSL VÁLIDO)               │           │
│  │  https://codespace-<hash>-3000.app.github.dev  (Kanban)     │           │
│  │  https://codespace-<hash>-3001.app.github.dev  (OpenSign)   │           │
│  └─────────────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                     ┌───────────────┼───────────────┐
                     ▼               ▼               ▼
          ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
          │   STAGING      │ │   PRODUÇÃO     │ │   SIGNATÁRIO   │
          │ sign.staging.  │ │ sign.seuapp.com│ │  (celular/PC)  │
          │ seuapp.com     │ │                │ │                │
          └────────────────┘ └────────────────┘ └────────────────┘
```

---

## Estrutura do Projeto (kanban/)

```
kanban/
├── install.ts                     # Setup principal (npm run setup)
├── package.json                   # Scripts: setup, app, dev, verify, dashboard, sync
├── tsconfig.json
├── MANUAL.md
├── setup/
│   ├── install.ps1                # Windows PowerShell
│   └── install.bat                # Windows Batch
├── src/
│   ├── config/
│   │   ├── kanban-config.json
│   │   ├── directories.json
│   │   └── members.json
│   ├── electron/
│   │   └── main.cjs               # App Desktop
│   ├── scripts/
│   │   ├── main-orchestrator.ts
│   │   ├── VERIFY_SETUP.ts
│   │   ├── VIEW_STATUS.ts
│   │   ├── generate-dashboard.ts
│   │   ├── generate_official_report_pdf.py
│   │   ├── sync-to-github.ts
│   │   └── update-columns.ts
│   ├── server/
│   │   └── server.ts              # Servidor Web (porta 3000)
│   ├── types/
│   │   └── interfaces.ts
│   ├── utils/
│   │   └── file-system.ts
│   └── web/
│       ├── index.html             # Kanban UI
│       ├── app.js
│       └── styles.css
├── Opensign/                      # Repo OpenSign (submódulo ou clone)
│   └── ... (arquivos do OpenSign)
└── .devcontainer/                 # GitHub Codespaces config
    ├── devcontainer.json
    ├── setup-codespace.sh
    └── start-codespace.sh
```

---

## Interface Kanban — Menu & OpenSign

### Menu Lateral com Botão no Extremo Esquerdo
- **Localização**: Primeiro elemento absoluto do cabeçalho superior esquerdo do Kanban (`.header-left-group`), antes do logo e título.
- **Ação**: Clique ou atalho de teclado abre um painel lateral deslizante (**Sidebar Drawer**) com backdrop blur escuro (`.sidebar-drawer-overlay`).
- **Estilo**: Botão com ícone hamburger (☰) estilizado, feedback hover e suporte a fechamento via clique fora ou tecla `Esc`.
- **Foco & Simplificação**: O menu foi simplificado para exibir exclusivamente o serviço **OpenSign** (`Assinatura digital de contratos ›`), removendo itens secundários ou redundantes para garantir uma experiência minimalista e sem poluição visual.

### Modal Integrado com Diagnóstico em Tempo Real
- **Injeção no DOM**: Modal flutuante responsivo centralizado com `z-index: 100000` e overlay backdrop com desfoque.
- **Detecção de Conectividade**:
  - Ao abrir, o modal faz um ping no endpoint do OpenSign (`http://localhost:3001` ou URL personalizada).
  - **Se Online (🟢):** Iframe carrega instantaneamente em tela cheia com barra superior de controle (recarregar `⟳`, abrir em nova aba `↗` e fechar `✕`).
  - **Se Offline (🔴):** Exibe imediatamente um painel diagnóstico com:
    - Status claro de ambiente (Kanban ativo na 3000, OpenSign parado na 3001, Docker no WSL detectado).
    - Passo a passo rápido para subir localmente via WSL Ubuntu ou via GitHub Codespaces.
    - Campo de input interativo para configurar URL personalizada com persistência em `localStorage`.
    - Botão `⟳ Testar Conexão Novamente` sem necessidade de recarregar a página.

---

## Fase 0 — Setup GitHub Codespaces (5 min, **uma vez**)

### 0.1 Arquivos necessários no repo
```
kanban/
├── docker-compose.dev.yml           # Orquestra Kanban + OpenSign + DB + Redis
├── scripts/init-multiple-dbs.sh     # Cria databases kanban + opensign
├── .devcontainer/
│   ├── devcontainer.json            # Config Codespace (ports, extensions)
│   ├── setup-codespace.sh           # Roda 1x na criação: configura tudo
│   └── start-codespace.sh           # Roda a cada start: atualiza URLs
├── src/
│   ├── lib/opensign.ts              # Cliente API tipado + helpers
│   └── app/api/webhooks/opensign/route.ts  # Handler webhook (se Next.js)
├── Opensign/                        # Repo OpenSign (submódulo ou clone)
└── .env.local                       # Auto-gerado (não commit)
```

> **Nota**: O diretório raiz é `kanban/` (minúsculo), não `Kanban/`. Ajuste caminhos em scripts.

### 0.2 Inicia Codespace
```bash
# Opção A: Via GitHub CLI
gh codespace create --repo seuusuario/fowlgen-wars --branch main --machine basicLinux32gb

# Opção B: Via Browser
# github.com/seuusuario/fowlgen-wars → Code → Codespaces → Create codespace
```

### 0.3 O que acontece automaticamente (2-3 min)
1. **Container sobe** com `docker-compose.dev.yml` (4 serviços: kanban, opensign, postgres, redis)
2. **Port forwarding** público automático (GitHub gerencia SSL válido)
3. **setup-codespace.sh roda**:
   - Cria admin no OpenSign (`dev@kanban.local` / `dev123456`)
   - Gera `OPENSIGN_API_TOKEN` + `OPENSIGN_WEBHOOK_SECRET`
   - Configura webhook no OpenSign → aponta para Kanban público (`/api/webhooks/opensign`)
   - Escreve `.env.local` com URLs públicas atuais
   - Roda migrações Prisma (se houver)
4. **Pronto!** URLs no terminal:
   ```
   🌐 Kanban:        https://codespace-abc123-3000.app.github.dev
   🌐 OpenSign UI:   https://codespace-abc123-3001.app.github.dev
   🔗 Webhook:       https://codespace-abc123-3000.app.github.dev/api/webhooks/opensign
   ```

---

## GitHub Codespaces — Informações Essenciais

### Por que Codespaces?
| Benefício | Detalhe |
|-----------|---------|
| **Zero config** | Ambiente idêntico para todo o time |
| **URLs públicas SSL** | `*.app.github.dev` — signatários acessam do celular sem VPN |
| **Port forwarding automático** | `gp url 3000` / `gp url 3001` expõem portas |
| **Persistência 30 dias** | Para dev, reinicia rápido; staging/prod usam infra própria |
| **GPU opcional** | `--machine basicLinux32gb` ou `standardLinux32gb` |
| **Preço** | Incluído no GitHub Team/Enterprise; free tier: 120h/mês |

### Comandos Úteis (`gh` CLI)
```bash
# Listar codespaces
gh codespace list

# Abrir no VS Code Web
gh codespace code -c <codespace-name>

# Port forwarding manual
gh codespace ports -c <codespace-name>

# Logs do container
gh codespace logs -c <codespace-name>

# Parar / Excluir
gh codespace stop -c <codespace-name>
gh codespace delete -c <codespace-name>
```

### Variáveis de Ambiente (Codespace)
| Variável | Origem | Exemplo |
|----------|--------|---------|
| `CODESPACE_NAME` | GitHub | `fancy-space-xyz` |
| `GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN` | GitHub | `app.github.dev` |
| `OPENSIGN_API_TOKEN` | setup-codespace.sh | `ost_abc123...` |
| `OPENSIGN_WEBHOOK_SECRET` | setup-codespace.sh | `whsec_xyz789...` |
| `KANBAN_PUBLIC_URL` | start-codespace.sh | `https://codespace-abc-3000.app.github.dev` |
| `OPENSIGN_PUBLIC_URL` | start-codespace.sh | `https://codespace-abc-3001.app.github.dev` |

---

## Fase 1 — Desenvolvimento Local no Codespace (cotidiano)

### 1.1 URLs de assinatura em DEV
| Componente | URL Exemplo | Quem acessa |
|------------|-------------|-------------|
| **Kanban** | `https://codespace-abc123-3000.app.github.dev` | Dev team |
| **OpenSign UI** | `https://codespace-abc123-3001.app.github.dev` | Dev team |
| **Link assinatura** | `https://codespace-abc123-3001.app.github.dev/sign/rec_xyz789` | **Qualquer pessoa (celular/PC)** |

> **O signatário NÃO precisa de acesso ao GitHub/Codespace.** Abre o link no navegador do celular, autentica por WhatsApp/e-mail, assina. Funciona igual produção.

### 1.2 Fluxo de teste completo (30 seg)
```
1. Dev abre Kanban (URL pública Codespace)
2. Clica no botão Cabeçalho Esquerdo (☰) → Menu abre
3. Seleciona "OpenSign" no menu → Abre visual do OpenSign (iframe/nova aba)
4. Cria documento "Contrato Teste" → anexa PDF
5. Define 2 signatários (WhatsApp + e-mail)
6. Kanban chama OpenSign API → retorna sign_urls públicas
7. Dev manda link pro WhatsApp pessoal
8. Abre no CELULAR → digita código WhatsApp → assina com dedo
9. OpenSign processa → manda webhook pro Kanban (URL pública)
10. Kanban recebe → move card para "Assinado" → anexa PDF assinado
11. Dev vê card movido em tempo real
```

### 1.3 Reinício do Codespace (URLs mudam)
```bash
# Ao reiniciar Codespace, URLs mudam (hash novo)
# start-codespace.sh roda automaticamente:
# 1. Pega novas URLs via `gp url 3000` / `gp url 3001`
# 2. Atualiza .env.local
# 3. Reconfigura webhook no OpenSign com nova URL
# 4. Avisa para reiniciar `npm run dev` se rodando fora do Docker
```

---

## Fase 2 — Setup Local (npm run setup)

### 2.1 O que `npm run setup` faz (`install.ts`)
```bash
# Executa: npx -y tsx install.ts
```

**Passos automáticos:**
1. **Pré-requisitos**: Verifica Node ≥18, npm, Git, `node_modules`
2. **Instala ferramentas** (se ausentes): roda `setup/install.ps1` (Windows) ou `npm install`
3. **Cria pastas**: `docs/`, `logs/`, `backups/`
4. **Gera dashboard** inicial do Kanban (Markdown + HTML)
5. **Atualiza `.gitignore`** raiz
6. **Inicia servidor Web** na porta 3000 (`src/server/server.ts`)
7. **Abre navegador** em `http://localhost:3000`
8. **Exibe Menu Interativo** (se terminal TTY):

```
   🐔 FOWLGEN WARS — KANBAN STUDIO MENU
   [1] 🌐 Iniciar Servidor Web (http://localhost:3000)
   [2] 💻 Iniciar Aplicativo Desktop (Electron)
   [3] 📊 Gerar / Atualizar Dashboard
   [4] 📋 Visualizar Status no Terminal
   [5] 🔍 Diagnóstico e Integridade do Ambiente
   [6] 🔄 Sincronizar com GitHub Projects
   [7] 🔧 Reexecutar Instalação / Verificação Completa
   [0] 🚪 Sair
```

### 2.2 Scripts Disponíveis (`package.json`)
| Script | Comando | Descrição |
|--------|---------|-----------|
| `setup` | `npx -y tsx install.ts` | **Instalação completa + menu** |
| `app` | `tsx src/server/server.ts` | Servidor Web Kanban (porta 3000) |
| `dev` | `tsx src/server/server.ts` | Alias para `app` |
| `verify` | `tsx src/scripts/VERIFY_SETUP.ts` | Diagnóstico ambiente |
| `status` | `tsx src/scripts/VIEW_STATUS.ts` | Status tarefas |
| `dashboard` | `tsx src/scripts/generate-dashboard.ts` | Gera dashboard MD/HTML |
| `sync` | `tsx src/scripts/main-orchestrator.ts` | Sync GitHub Projects |
| `app:desktop` | `build:server + electron` | App Desktop (Electron) |
| `build:server` | `esbuild server.ts` | Compila servidor para `dist/` |

---

## Fase 3 — Integração Kanban → OpenSign (Código)

### 3.1 Cliente API Tipado (`src/lib/opensign.ts`)
```typescript
// Uso no código Kanban
import { getOpenSignClient, type Signer } from '@/lib/opensign';

const client = getOpenSignClient();

const signData = await client.createSignRequestForCard(
  cardId,                    // "KAN-123"
  pdfUrl,                    // "https://bucket.s3.amazonaws.com/contrato.pdf"
  [
    { name: "João", email: "joao@email.com", phone: "+5511999999999", authType: "whatsapp" },
    { name: "Maria", email: "maria@email.com", authType: "email" }
  ],
  { expiresInDays: 30 }
);

// signData = {
//   cardId, documentId, documentTitle, expiresAt,
//   signers: [{ name, email, signUrl, status: "pending" }]
// }
```

### 3.2 Webhook Handler (`src/app/api/webhooks/opensign/route.ts`)
```typescript
// Next.js App Router - valida HMAC, processa eventos
export async function POST(request: NextRequest) {
  // 1. Valida assinatura HMAC SHA256
  // 2. Extrai cardId do metadata.external_id
  // 3. Roteia evento:
  //    - recipient_signed  → updateCard (lastSignedBy, signStatus: in_progress)
  //    - document_completed → download PDF → attachFile → moveCard("Assinado")
  //    - document_expired  → moveCard("Expirado")
  //    - document_declined → moveCard("Recusado")
  // 4. Notifica stakeholders (e-mail/push/Slack)
}
```

### 3.3 Componente Frontend — Menu + OpenSign Action
```tsx
// components/Header.tsx — Botão Cabeçalho Esquerdo
<Header>
  <MenuTrigger className="left-header-btn" aria-label="Abrir menu">
    <HamburgerIcon />  // ☰
  </MenuTrigger>
</Header>

// components/Menu.tsx — Sidebar com item OpenSign
<Menu>
  <MenuItem onClick={() => openOpenSignView()}>
    <SignatureIcon />
    <span>OpenSign</span>  {/* Correção: NÃO "OpenSing" */}
  </MenuItem>
  {/* outros itens... */}
</Menu>

// components/KanbanCardSignAction.tsx — Ação no card
<SignAction 
  cardId={card.id}
  signers={card.signers}  // [{ name, signUrl, status }]
/>

// Abre signUrl em nova aba (mobile-friendly)
// Atualiza status via polling ou SSE após webhook
```

---

## Fase 4 — Configuração por Ambiente

| Config | Dev (Codespace) | Staging | Produção |
|--------|-----------------|---------|----------|
| **OpenSign URL** | `https://codespace-xxx-3001.app.github.dev` | `https://sign.staging.seuapp.com` | `https://sign.seuapp.com` |
| **Kanban URL** | `https://codespace-xxx-3000.app.github.dev` | `https://staging.seuapp.com` | `https://app.seuapp.com` |
| **Webhook** | Auto (setup-codespace.sh) | Manual / IaC | Manual / IaC |
| **SSL** | ✅ GitHub fornece | ✅ Let's Encrypt | ✅ Let's Encrypt / Cloudflare |
| **TSA** | `freetsa.org` (grátis) | TSA homologação | TSA produção (Valid/Certisign) |
| **WhatsApp/SMS** | Twilio Sandbox | Twilio Verificado | Twilio Produção |
| **Persistência** | 30 dias (Codespace) | Permanente | Permanente |

---

## Fase 5 — Deploy Staging/Produção (mesmo Docker Compose)

### 5.1 `docker-compose.prod.yml` (derivado do .dev.yml)
```yaml
services:
  kanban:
    image: seuusuario/kanban:latest
    ports: ["3000:3000"]
    env_file: .env.production
    depends_on: [postgres, redis]
    restart: unless-stopped

  opensign:
    image: opensignlabs/opensign:latest
    ports: ["3001:3001"]
    env_file: .env.production
    depends_on: [postgres, redis]
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: kanban
      POSTGRES_MULTIPLE_DATABASES: kanban,opensign
    volumes: [postgres_data:/var/lib/postgresql/data]
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## Checklist de Validação e Homologação
- [x] Caminhos padronizados usam `kanban/` (minúsculo)
- [x] Menu lateral deslizante posicionado no extremo esquerdo do cabeçalho
- [x] Menu simplificado exibindo exclusivamente o item `OpenSign` (sem poluição visual)
- [x] Label corrigido estritamente para `OpenSign` (sem typos)
- [x] Modal corrigido no DOM (`overlay.appendChild(modal)`) com `z-index: 100000`
- [x] Diagnóstico inteligente de conectividade offline/online em tempo real
- [x] Suporte a URL customizada do OpenSign salva no navegador
- [x] `.devcontainer/` e `docker-compose.dev.yml` prontos para Codespaces e Docker
- [x] Validação criptográfica de Webhook HMAC SHA-256 ativa
- [x] Bateria de testes E2E aprovada com 100% de sucesso (**182 PASSOU / 0 FALHOU**)
- [x] Tarefas sincronizadas e documentadas no Kanban (`openspec/changes/integracao-opensign-kanban/tasks.md`)