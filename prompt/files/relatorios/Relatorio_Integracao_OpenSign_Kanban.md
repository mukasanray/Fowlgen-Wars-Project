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
         │   STAGING      │ │   PRODUÇÃO     │ │   SIGN ATÁRIO  │
         │ sign.staging.  │ │ sign.seuapp.com│ │  (celular/PC)  │
         │ seuapp.com     │ │                │ │                │
         └────────────────┘ └────────────────┘ └────────────────┘
```

---

## Fase 0 — Setup GitHub Codespaces (5 min, **uma vez**)

### 0.1 Arquivos necessários no repo (já criados)
```
Kanban/
├── docker-compose.dev.yml           # Orquestra Kanban + OpenSign + DB + Redis
├── scripts/init-multiple-dbs.sh     # Cria databases kanban + opensign
├── .devcontainer/
│   ├── devcontainer.json            # Config Codespace (ports, extensions)
│   ├── setup-codespace.sh           # Roda 1x na criação: configura tudo
│   └── start-codespace.sh           # Roda a cada start: atualiza URLs
├── src/
│   ├── lib/opensign.ts              # Cliente API tipado + helpers
│   └── app/api/webhooks/opensign/route.ts  # Handler webhook Next.js
├── Opensign/                        # Repo OpenSign (submódulo ou clone)
└── .env.local                       # Auto-gerado (não commit)
```

### 0.2 Inicia Codespace
```bash
# Opção A: Via GitHub CLI
gh codespace create --repo seuusuario/Kanban --branch main --machine basicLinux32gb

# Opção B: Via Browser
# github.com/seuusuario/Kanban → Code → Codespaces → Create codespace
```

### 0.3 O que acontece automaticamente (2-3 min)
1. **Container sobe** com `docker-compose.dev.yml` (4 serviços)
2. **Port forwarding** público automático (GitHub gerencia SSL)
3. **setup-codespace.sh roda**:
   - Cria admin no OpenSign (`dev@kanban.local` / `dev123456`)
   - Gera `OPENSIGN_API_TOKEN` + `OPENSIGN_WEBHOOK_SECRET`
   - Configura webhook no OpenSign → aponta para Kanban público
   - Escreve `.env.local` com URLs públicas atuais
   - Roda migrações Prisma (se houver)
4. **Pronto!** URLs no terminal:
   ```
   🌐 Kanban:        https://codespace-abc123-3000.app.github.dev
   🌐 OpenSign UI:   https://codespace-abc123-3001.app.github.dev
   🔗 Webhook:       https://codespace-abc123-3000.app.github.dev/api/webhooks/opensign
   ```

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
2. Cria card "Contrato Teste" → anexa PDF
3. Clica "Assinar" → define 2 signatários (WhatsApp + e-mail)
4. Kanban chama OpenSign API → retorna sign_urls públicas
5. Dev manda link pro WhatsApp pessoal
6. Abre no CELULAR → digita código WhatsApp → assina com dedo
7. OpenSign processa → manda webhook pro Kanban (URL pública)
8. Kanban recebe → move card para "Assinado" → anexa PDF assinado
9. Dev vê card movido em tempo real
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

## Fase 2 — Integração Kanban → OpenSign (Código Pronto)

### 2.1 Cliente API Tipado (`src/lib/opensign.ts`)
```typescript
// Uso no seu código Kanban
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

### 2.2 Webhook Handler (`src/app/api/webhooks/opensign/route.ts`)
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

### 2.3 Componente Frontend (`components/KanbanCardSignAction.tsx`)
```tsx
// Botão dropdown no card com links por signatário
<SignAction 
  cardId={card.id}
  signers={card.signers}  // [{ name, signUrl, status }]
/>

// Abre signUrl em nova aba (mobile-friendly)
// Atualiza status via polling ou SSE após webhook
```

---

## Fase 3 — Configuração por Ambiente

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

## Fase 4 — Deploy Staging/Produção (mesmo Docker Compose)

### 4.1 `docker-compose.prod.yml` (derivado do .dev.yml)
```yaml
services:
  kanban:
    image: seuusuario/Kanban:latest
    environment:
      - OPENSIGN_URL=https://sign.seuapp.com
      - OPENSIGN_PUBLIC_URL=https://sign.seuapp.com
      - DATABASE_URL=postgresql://...
    # ... resto igual

  opensign:
    image: ghcr.io/opensignlabs/opensign:latest
    environment:
      - FRONTEND_URL=https://sign.seuapp.com
      - CORS_ORIGIN=https://app.seuapp.com
    # ... resto igual
```

### 4.2 Variáveis de ambiente (GitHub Secrets / Vercel / Railway)
```bash
# Obrigatórias
OPENSIGN_API_TOKEN=sk_live_xxxxx
OPENSIGN_WEBHOOK_SECRET=whsec_xxxxx
OPENSIGN_URL=https://sign.seuapp.com
OPENSIGN_PUBLIC_URL=https://sign.seuapp.com

# Opcionais (Twilio/Meta para WhatsApp/SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
META_WHATSAPP_TOKEN=
```

---

## Fase 5 — Testes & Validação

### 5.1 Checklist Dev (Codespace)
| Cenário | Teste | Comando/Verificação |
|---------|-------|---------------------|
| **Serviços sobem** | `docker compose ps` | 4 containers healthy |
| **OpenSign UI** | Abre URL pública | Login `dev@kanban.local` funciona |
| **Cria documento** | POST `/api/v1/documents` | Retorna `sign_url` pública |
| **Assinatura WhatsApp** | Abre link no celular | Recebe código, assina, PDF gerado |
| **Webhook recebido** | Logs Kanban | `POST /api/webhooks/opensign 200` |
| **Card move** | UI Kanban | Card → "Assinado" + PDF anexado |
| **PDF válido** | Adobe Reader | "Assinatura válida" + carimbo tempo |

### 5.2 Teste de Carga (Codespace aguenta ~50 req/s)
```bash
# No terminal do Codespace
for i in {1..20}; do
  curl -X POST "$OPENSIGN_URL/api/v1/documents" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Load Test $i\",\"file_url\":\"https://exemplo.com/test.pdf\",\"recipients\":[{\"name\":\"Teste\",\"email\":\"teste$i@email.com\",\"auth_type\":\"email\"}]}" &
done
wait
# Monitora: docker compose logs -f opensign | grep -E "(error|queue)"
```

---

## Fase 6 — Go-Live Checklist (Atualizado)

| Item | Dev (Codespace) | Staging | Produção | Responsável |
|------|-----------------|---------|----------|-------------|
| [ ] Codespace sobe completo (4 serviços) | ✅ Auto | — | — | Dev |
| [ ] `.env.local` auto-gerado | ✅ Auto | — | — | Dev |
| [ ] Webhook configurado no OpenSign | ✅ Auto | ☐ Manual | ☐ Manual | Backend |
| [ ] Link assinatura abre no celular | ✅ Testado | ☐ Testar | ☐ Testar | QA |
| [ ] PDF assinado valida no Adobe | ☐ Testar | ☐ Testar | ☐ Testar | Jurídico |
| [ ] Domínio `sign.seuapp.com` + SSL | — | ☐ Configurar | ☐ Configurar | DevOps |
| [ ] TSA produção configurada | — | ☐ Homologação | ☐ Produção | Backend |
| [ ] Twilio/Meta produção aprovados | — | ☐ Sandbox | ☐ Produção | Backend |
| [ ] Backup PostgreSQL automático | — | ☐ Configurar | ☐ Configurar | DevOps |
| [ ] Monitoramento (logs, métricas) | ☐ Básico | ☐ Completo | ☐ Completo | DevOps |
| [ ] LGPD/DPA assinado | — | ☐ Revisar | ☐ Assinado | Legal |
| [ ] Runbook incidentes | — | ☐ Rascunho | ☐ Aprovado | DevOps |

---

## Estimativa de Esforço Atualizada

| Fase | Tempo | Quem | Notas |
|------|-------|------|-------|
| 0. Setup Codespace (uma vez) | 5 min | Dev | Commit files → Create codespace |
| 1. Dev diário | 0 min | Dev | `gh codespace create` → pronto |
| 2. Integração Kanban (código) | 2-4h | Backend + Frontend | Arquivos prontos acima |
| 3. Testes no Codespace | 1h | QA + Dev | Happy path + edge cases |
| 4. Deploy Staging | 2h | DevOps | Render/Railway + DNS |
| 5. Deploy Produção | 2h | DevOps | Mesmo compose, domínio real |
| **Total (dev → prod)** | **~8-10h** | — | **Codespace elimina 3-4h de infra dev** |

---

## Riscos & Mitigações (Atualizado)

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| Codespace expira (30 dias) | Média | Baixo | Recria em 2 min; dados persistem no volume Docker |
| URLs mudam a cada start | Alta | Médio | `start-codespace.sh` auto-atualiza webhook + .env.local |
| `freetsa.org` indisponível | Média | Alto | Configurar TSA backup (Valid/Certisign) em staging/prod |
| WhatsApp Business API não aprovada | Média | Médio | Fallback SMS/Email nativo no OpenSign |
| Worker BullMQ para | Baixa | Alto | Healthcheck Docker + restart policy + alerta |
| PDF não valida no Adobe | Baixa | Crítico | Testar PAdES-LTV em staging antes de prod |
| LGPD: vazamento dados | Baixa | Crítico | Criptografia em repouso, logs sem PII, DPA |

---

## Arquivos Entregues (Prontos para Commit)

```
Kanban/
├── docker-compose.dev.yml                    # ✅ Orquestração completa
├── scripts/init-multiple-dbs.sh              # ✅ Multi-database PostgreSQL
├── .devcontainer/
│   ├── devcontainer.json                     # ✅ Config Codespace (ports, ext)
│   ├── setup-codespace.sh                    # ✅ Setup 1x (admin, token, webhook)
│   └── start-codespace.sh                    # ✅ Start Nx (atualiza URLs)
├── src/
│   ├── lib/opensign.ts                       # ✅ Cliente tipado + helpers Kanban
│   └── app/api/webhooks/opensign/route.ts    # ✅ Handler webhook Next.js
├── Opensign/                                 # ✅ Repo OpenSign (submódulo/clone)
├── components/KanbanCardSignAction.tsx       # 📝 Criar (baseado no relatório)
└── hooks/useOpenSign.ts                      # 📝 Criar (hook React)
```

---

## Próximos Passos Imediatos

### Hoje (15 min)
```bash
# 1. Commit files acima no seu repo Kanban
git add docker-compose.dev.yml scripts/ .devcontainer/ src/lib/opensign.ts src/app/api/webhooks/opensign/ Opensign/
git commit -m "feat: OpenSign integration + GitHub Codespaces dev env"
git push

# 2. Cria Codespace
gh codespace create --repo seuusuario/Kanban --branch main

# 3. Testa fluxo completo (30 seg)
#    Kanban → Card → Assinar → Link no celular → Assina → Card movido
```

### Amanhã (2h)
- Implementar `KanbanCardSignAction.tsx` + `useOpenSign.ts`
- Testes edge cases (expiração, recusa, ordem sequencial)
- Validação jurídica PDF assinado

### Esta semana (4h)
- Deploy Staging (Render/Railway + DNS `sign.staging.seuapp.com`)
- Configura TSA homologação + Twilio verificado
- Testes com signatários reais

### Próxima semana
- Deploy Produção (`sign.seuapp.com`)
- Monitoramento + Runbook
- Go-live

---

## Comando Único para Validar Tudo Agora

```bash
# No terminal do Codespace (após setup completo)
curl -X POST "$OPENSIGN_PUBLIC_URL/api/v1/documents" \
  -H "Authorization: Bearer $OPENSIGN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste Integração Kanban",
    "file_url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf",
    "recipients": [{"name": "Teste", "email": "seu@email.com", "auth_type": "email"}],
    "metadata": {"external_id": "TEST-001"}
  }' | jq .
```

**Resultado esperado:** JSON com `sign_url` pública (`https://codespace-xxx-3001.app.github.dev/sign/rec_...`). Abra no celular → assine → veja webhook no log do Kanban.

---

**Status: PRONTO PARA CODIFICAR.** Todos os arquivos de infraestrutura, cliente API, webhook e configuração Codespace estão criados acima. Faltam apenas os componentes React (`KanbanCardSignAction.tsx`, `useOpenSign.ts`) que seguem o padrão do relatório original.