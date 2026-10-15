#!/bin/bash
# Update GitHub Kanban columns based on OpenSpec status

echo "🔄 Atualizando colunas Kanban baseado em OpenSpec..."

# Verify GitHub CLI is available
if ! command -v gh >/dev/null 2>&1; then
    echo "❌ GitHub CLI (gh) is required but not installed."
    exit 1
fi

PROJECT_ID=$(gh project list --format json -q '.[0].id')
echo "📋 Using GitHub Project ID: $PROJECT_ID"

# Process each feature in OpenSpec
for feature_dir in openspec/changes/*/; do
    if [ -d "$feature_dir" ]; then
        feature_name=$(basename "$feature_dir")
        echo "🔍 Processing feature: $feature_name"
        
        # Get status from OpenSpec
        status=$(agent listar "$feature_dir"tasks.md 2>/dev/null | grep -E "## [0-9]+\." | grep -v "\[x\]" | tail -1 | sed 's/.*-//' | sed 's/^[ \t]*//' | sed 's/\[.\] *//')
        
        # Find the issue in GitHub with this title
        issue=$(gh issue list --format json --jq "[.[] | select(.title == \"$feature_name\")]")
        if [ -n "$issue" ] && [ "$issue" != "null" ]; then
            issue_id=$(echo "$issue" | jq -r '.id')
            
            # Update GitHub status based on OpenSpec
            case "$status" in
                "Em Andamento"|"Implementando"|"Em Progresso")
                    gh project item-update "$PROJECT_ID" --id "$issue_id" --status "Em Progresso"
                    echo "🔄 Updated $feature_name to Em Progresso"
                    ;;
                "Testando"|"Verificação")
                    gh project item-update "$PROJECT_ID" --id "$issue_id" --status "Review"
                    echo "🔬 Updated $feature_name to Review"
                    ;;
                "Concluído"|"Done"|"Completo")
                    gh project item-update "$PROJECT_ID" --id "$issue_id" --status "Done"
                    echo "✅ Updated $feature_name to Done"
                    ;;
                *)
                    gh project item-update "$PROJECT_ID" --id "$issue_id" --status "Backlog"
                    echo "📝 Updated $feature_name to Backlog"
                    ;;
            esac
        fi
    fi
done

echo "✅ Colunas Kanban atualizadas! 🎯"

# Helper function to check for GitHub CLI dependency
git_hub_available() {
    command -v gh >/dev/null 2>&1
}