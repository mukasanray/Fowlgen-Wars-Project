#!/bin/bash
# VERIFY_SETUP.sh - Verificação rápida da configuração OpenSpec ↔ GitHub Kanban

echo "🔍 Verificando configuração OpenSpec ↔ GitHub Kanban..."
echo ""

# Verificar scripts necessários
SCRIPT_FILES=(
    "fowlgowwars-kanban-sync.sh"
    "sync-openpec-to-github.sh"
    "update-kanban-columns.sh"
    "generate-kanban-dashboard.sh"
    "VIEW_KANBAN_STATUS.sh"
)

ALL_SCRIPTS_OK=true
for script in "${SCRIPT_FILES[@]}"; do
    if [ -f "$script" ]; then
        echo "✅ $script encontrado"
        # Verificar se tem shebang
        if grep -q "^#!/bin/bash" "$script"; then
            echo "   - Possui shebang bash"
        else
            echo "   ⚠️  Sem shebang bash"
        fi
    else
        echo "❌ $script NÃO encontrado"
        ALL_SCRIPTS_OK=false
    fi
done

echo ""

# Verificar diretório openspec
if [ -d "openspec/changes" ]; then
    echo "✅ Diretório openspec/changes encontrado"
    FEATURE_COUNT=$(ls openspec/changes/*/ 2>/dev/null | wc -l)
    echo "   - Features: $FEATURE_COUNT"
    
    for feature_dir in openspec/changes/*/; do
        if [ -d "$feature_dir" ] && [ -f "$feature_dir"proposal.md" ] && [ -f "$feature_dir"tasks.md" ]; then
            echo "   ✅ $(basename "$feature_dir"): proposal.md e tasks.md"
        else
            echo "   ⚠️  $(basename "$feature_dir") incompleto"
        fi
    done
else
    echo "❌ Diretório openspec/changes NÃO encontrado"
    ALL_SCRIPTS_OK=false
fi

echo ""

# Verificar GitHub Actions
if [ -f ".github/workflows/kanban-sync.yml" ]; then
    echo "✅ GitHub Actions workflow encontrado"
    if grep -q "cron:" ".github/workflows/kanban-sync.yml"; then
        echo "   - Configurado para executar diariamente"
    fi
else
    echo "❌ GitHub Actions workflow NÃO encontrado"
    ALL_SCRIPTS_OK=false
fi

echo ""

# Verificar documentação
if [ -f "CONFIG_SETUP.md" ]; then
    echo "✅ Documentação encontrada (CONFIG_SETUP.md)"
fi

if [ -f "QUICK_START.md" ]; then
    echo "✅ Quick start encontrado (QUICK_START.md)"
fi

echo ""

if [ "$ALL_SCRIPTS_OK" = true ]; then
    echo "🎉 Configuração verificada! Todos os componentes estão prontos."
    echo ""
    echo "Próximos passos:"
    echo "1. Configure GH_TOKEN no GitHub Secrets (para GitHub Actions)"
    echo "2. Execute: ./fowlgowwars-kanban-sync.sh (teste inicial)"
    echo "3. Execute: ./VIEW_KANBAN_STATUS.sh (visualizar status)"
    echo "4. Configure GitHub Actions (opcional, para execução automática)"
else
    echo "⚠️  Alguns componentes estão faltando. Verifique o CONFIG_SETUP.md"
fi
echo ""
echo "Para mais informações, consulte CONFIG_SETUP.md"

# Helper function to check for GitHub CLI dependency
git_hub_available() {
    command -v gh >/dev/null 2>&1
}