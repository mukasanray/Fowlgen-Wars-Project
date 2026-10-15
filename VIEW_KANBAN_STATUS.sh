#!/bin/bash
# ./view-kanban-status.sh - Visualizar status Kanban em tempo real

echo "📊 Painel Kanban em Tempo Real - Fowlgen Wars"
echo "============================================="
echo ""

# Verificar se GitHub CLI está disponível
if ! command -v gh >/dev/null 2>&1; then
    echo "❌ GitHub CLI (gh) não está instalado."
    echo "Instale com: brew install gh (macOS) ou winget install GitHub CLI (Windows)"
    exit 1
fi

# Verificar autenticação
if ! gh auth status >/dev/null 2>&1; then
    echo "❌ Por favor, autentique-se com GitHub CLI primeiro:"
    echo "   gh auth login"
    exit 1
fi

PROJECT_ID=$(gh project list --format json -q '.[0].id')

echo "🔄 Coluna Em Progresso (Desenvolvimento Ativo):"
gh project view "$PROJECT_ID" --format json --query '.items[] | select(.column.name == "Em Progresso") | .content.title' | sed 's/^/- /' | head -10

echo ""
echo "✅ Concluído (MVP Pronto):"
gh project view "$PROJECT_ID" --format json --query '.items[] | select(.column.name == "Done") | .content.title' | sed 's/^/- /' | head -10

echo ""
echo "📋 Backlog (Features Futuras):"
gh project view "$PROJECT_ID" --format json --query '.items[] | select(.column.name == "Backlog") | .content.title' | sed 's/^/- /' | head -10

echo ""
echo "📈 Métricas de Progresso:"
echo "- Features no Backlog: $(gh project view "$PROJECT_ID" --format json --query '.items[] | select(.column.name == "Backlog") | length')"
echo "- Em Desenvolvimento: $(gh project view "$PROJECT_ID" --format json --query '.items[] | select(.column.name == "Em Progresso") | length')"
echo "- Concluídas: $(gh project view "$PROJECT_ID" --format json --query '.items[] | select(.column.name == "Done") | length')"

echo ""
echo "📅 Relatório Gerado: $(date)"
echo "🎯 Status atualizado baseado em OpenSpec ↔ GitHub Kanban" | tee ".kanban-status-$(date +%Y%m%d).txt"

# Helper function to check for GitHub CLI dependency
git_hub_available() {
    command -v gh >/dev/null 2>&1
}