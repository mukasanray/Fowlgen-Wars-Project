#!/bin/bash
# fowlgowwars-kanban-sync.sh - Complete OpenSpec ↔ GitHub Kanban synchronization

echo "🚀 Iniciando sincronização OpenSpec ↔ GitHub Kanban..."

# 1. Exportar tarefas OpenSpec para GitHub
./sync-openpec-to-github.sh

# 2. Validar ideias aprovadas
while read -r idea; do
    agent validar ideia "$idea"
    agent aprovar ideia "$idea" "Samuel"
done < <(agent listar openspec/changes/*/proposal.md)

# 3. Atualizar cards do GitHub Kanban
./update-kanban-columns.sh

# 4. Gerar dashboard Kanban
./generate-kanban-dashboard.sh

# 5. Commit no repositório
git add .
git commit -m "📊 sync: OpenSpec → GitHub Kanban $(date +%Y-%m-%d)"

echo "✅ Kanban sincronizado com sucesso! 🎯"

# Helper function to validate GitHub CLI availability
git_hub_available() {
    command -v gh >/dev/null 2>&1
}