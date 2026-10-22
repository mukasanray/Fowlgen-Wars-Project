#!/bin/bash
# start-codespace.sh - Roda a CADA START do Codespace
# Atualiza URLs públicas (mudam a cada reinício) e reconfigura webhook

set -e

echo "🔄 [start-codespace] Atualizando URLs do Codespace..."

# Pega URLs públicas atuais (hash muda a cada reinício)
KANBAN_PUBLIC_URL=$(gp url 3000 2>/dev/null || echo "https://codespace-$(hostname)-3000.app.github.dev")
OPENSIGN_PUBLIC_URL=$(gp url 3001 2>/dev/null || echo "https://codespace-$(hostname)-3001.app.github.dev")

WEBHOOK_URL="${KANBAN_PUBLIC_URL}/api/webhooks/opensign"

echo "   Kanban:  $KANBAN_PUBLIC_URL"
echo "   OpenSign: $OPENSIGN_PUBLIC_URL"
echo "   Webhook:  $WEBHOOK_URL"

# Lê token e secret do .env.local anterior (se existir)
if [ -f /app/.env.local ]; then
  export $(grep -v '^#' /app/.env.local | xargs)
fi

# Se não tem token, tenta pegar do ambiente ou re-criar
if [ -z "$OPENSIGN_API_TOKEN" ]; then
  echo "⚠️  OPENSIGN_API_TOKEN não encontrado, tentando login..."
  LOGIN_RESPONSE=$(curl -s -X POST http://opensign:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "${OPENSIGN_ADMIN_EMAIL}", "password": "${OPENSIGN_ADMIN_PASSWORD}"}')
  OPENSIGN_API_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .accessToken // .data.token // empty')
fi

if [ -z "$OPENSIGN_WEBHOOK_SECRET" ]; then
  OPENSIGN_WEBHOOK_SECRET=$(openssl rand -hex 32)
fi

# Reconfigura webhook no OpenSign com NOVA URL
echo "🔗 Reconfigurando webhook no OpenSign..."
WEBHOOK_RESPONSE=$(curl -s -X POST "${OPENSIGN_PUBLIC_URL}/api/v1/webhooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OPENSIGN_API_TOKEN}" \
  -d "{
    \"url\": \"${WEBHOOK_URL}\",
    \"secret\": \"${OPENSIGN_WEBHOOK_SECRET}\",
    \"events\": [\"document_completed\", \"recipient_signed\", \"document_expired\", \"document_declined\"]
  }" || true)

echo "   Resposta: $WEBHOOK_RESPONSE"

# Atualiza .env.local com novas URLs
cat > /app/.env.local <<EOF
# Auto-gerado por start-codespace.sh - NÃO COMMITAR
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kanban
REDIS_URL=redis://redis:6379

# OpenSign
OPENSIGN_URL=http://opensign:3001
OPENSIGN_PUBLIC_URL=${OPENSIGN_PUBLIC_URL}
OPENSIGN_API_TOKEN=${OPENSIGN_API_TOKEN}
OPENSIGN_WEBHOOK_SECRET=${OPENSIGN_WEBHOOK_SECRET}
OPENSIGN_JWT_SECRET=${OPENSIGN_JWT_SECRET}

# Kanban
KANBAN_PUBLIC_URL=${KANBAN_PUBLIC_URL}
WEBHOOK_URL=${WEBHOOK_URL}
EOF

echo "✅ [start-codespace] URLs atualizadas!"
echo ""
echo "📋 URLs atuais:"
echo "   🌐 Kanban:        ${KANBAN_PUBLIC_URL}"
echo "   🌐 OpenSign UI:   ${OPENSIGN_PUBLIC_URL}"
echo "   🔗 Webhook:       ${WEBHOOK_URL}"
echo ""
echo "💡 Se 'npm run dev' já estava rodando, reinicie para pegar novas URLs."