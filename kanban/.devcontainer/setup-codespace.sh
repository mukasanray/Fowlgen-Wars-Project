#!/bin/bash
# setup-codespace.sh - Roda UMA VEZ na criação do Codespace
# Configura OpenSign: cria admin, gera tokens, configura webhook

set -e

echo "🚀 [setup-codespace] Iniciando configuração única do Codespace..."

# Aguarda serviços ficarem prontos
echo "⏳ Aguardando PostgreSQL e Redis..."
sleep 10

# Aguarda OpenSign API responder
echo "⏳ Aguardando OpenSign API..."
for i in {1..30}; do
  if curl -s -f http://opensign:3001/api/v1/health > /dev/null 2>&1; then
    echo "✅ OpenSign API online"
    break
  fi
  sleep 2
done

# Cria admin no OpenSign (se não existir)
echo "👤 Criando admin no OpenSign..."
ADMIN_RESPONSE=$(curl -s -X POST http://opensign:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@kanban.local",
    "password": "dev123456",
    "firstName": "Dev",
    "lastName": "Kanban"
  }' || true)

echo "   Resposta: $ADMIN_RESPONSE"

# Login para pegar token
echo "🔐 Fazendo login para obter token..."
LOGIN_RESPONSE=$(curl -s -X POST http://opensign:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@kanban.local",
    "password": "dev123456"
  }')

OPENSIGN_API_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .accessToken // .data.token // empty')

if [ -z "$OPENSIGN_API_TOKEN" ] || [ "$OPENSIGN_API_TOKEN" = "null" ]; then
  echo "⚠️  Token não encontrado na resposta, tentando endpoint alternativo..."
  # Tenta endpoint v2 ou outro formato
  OPENSIGN_API_TOKEN=$(curl -s -X POST http://opensign:3001/api/v1/api-tokens \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENSIGN_API_TOKEN" \
    -d '{"name": "kanban-integration"}' | jq -r '.token // .data.token // empty')
fi

# Gera webhook secret
OPENSIGN_WEBHOOK_SECRET=$(openssl rand -hex 32)

# Pega URLs públicas do GitHub Codespaces
echo "🌐 Obtendo URLs públicas do GitHub Codespaces..."
KANBAN_PUBLIC_URL=$(gp url 3000 2>/dev/null || echo "https://codespace-$(hostname)-3000.app.github.dev")
OPENSIGN_PUBLIC_URL=$(gp url 3001 2>/dev/null || echo "https://codespace-$(hostname)-3001.app.github.dev")

WEBHOOK_URL="${KANBAN_PUBLIC_URL}/api/webhooks/opensign"

echo "   Kanban:  $KANBAN_PUBLIC_URL"
echo "   OpenSign: $OPENSIGN_PUBLIC_URL"
echo "   Webhook:  $WEBHOOK_URL"

# Configura webhook no OpenSign
echo "🔗 Configurando webhook no OpenSign..."
WEBHOOK_RESPONSE=$(curl -s -X POST "${OPENSIGN_PUBLIC_URL}/api/v1/webhooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OPENSIGN_API_TOKEN}" \
  -d "{
    \"url\": \"${WEBHOOK_URL}\",
    \"secret\": \"${OPENSIGN_WEBHOOK_SECRET}\",
    \"events\": [\"document_completed\", \"recipient_signed\", \"document_expired\", \"document_declined\"]
  }" || true)

echo "   Resposta webhook: $WEBHOOK_RESPONSE"

# Escreve .env.local
echo "📝 Escrevendo .env.local..."
cat > /app/.env.local <<EOF
# Auto-gerado por setup-codespace.sh - NÃO COMMITAR
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kanban
REDIS_URL=redis://redis:6379

# OpenSign
OPENSIGN_URL=http://opensign:3001
OPENSIGN_PUBLIC_URL=${OPENSIGN_PUBLIC_URL}
OPENSIGN_API_TOKEN=${OPENSIGN_API_TOKEN}
OPENSIGN_WEBHOOK_SECRET=${OPENSIGN_WEBHOOK_SECRET}
OPENSIGN_JWT_SECRET=opensign-dev-secret-change-in-prod

# Kanban
KANBAN_PUBLIC_URL=${KANBAN_PUBLIC_URL}
WEBHOOK_URL=${WEBHOOK_URL}
EOF

echo "✅ [setup-codespace] Configuração concluída!"
echo ""
echo "📋 Resumo:"
echo "   Kanban:        ${KANBAN_PUBLIC_URL}"
echo "   OpenSign UI:   ${OPENSIGN_PUBLIC_URL}"
echo "   Webhook:       ${WEBHOOK_URL}"
echo "   Admin:         dev@kanban.local / dev123456"
echo ""
echo "💡 Próximo: npm run dev (ou aguarde start-codespace.sh no próximo start)"