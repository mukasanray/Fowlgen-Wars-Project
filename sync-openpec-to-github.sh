#!/bin/bash
# Sync OpenSpec tasks to GitHub Projects

echo "📤 Exportando tarefas OpenSpec para GitHub Projects..."

# Verify GitHub CLI is available
if ! command -v gh >/dev/null 2>&1; then
    echo "❌ GitHub CLI (gh) is required but not installed."
    echo "Install with: brew install gh (macOS) or winget install GitHub CLI (Windows)"
    exit 1
fi

# Verify authenticated to GitHub
if ! gh auth status >/dev/null 2>&1; then
    echo "❌ Please authenticate with GitHub CLI first:"
    echo "   gh auth login"
    exit 1
fi

PROJECT_ID=$(gh project list --format json -q '.[0].id')  # Backlog de Features

echo "📋 Using GitHub Project ID: $PROJECT_ID"

# Clear existing items from Backlog column
for item_id in $(gh project item list "$PROJECT_ID" --format json -q '.[].id' 2>/dev/null || echo ""); do
    gh project item-delete "$PROJECT_ID" --id "$item_id" 2>/dev/null || true
done

# Process each feature in OpenSpec
for feature_dir in openspec/changes/*/; do
    if [ -d "$feature_dir" ]; then
        feature_name=$(basename "$feature_dir")
        echo "🔍 Processing feature: $feature_name"
        
        # Count tasks and status
        tasks_count=$(agent listar "$feature_dir"tasks.md 2>/dev/null | grep -E "\[.?\]" | wc -l)
        done_count=$(agent listar "$feature_dir"tasks.md 2>/dev/null | grep "\[x\]" | wc -l)
        
        echo "📊 Tasks: $tasks_count total, $done_count completed"
        
        # Create/update card in GitHub Projects
        gh project item-create "$PROJECT_ID" \
          --title "$feature_name" \
          --body "$(cat "$feature_dir"proposal.md 2>/dev/null)" \
          --label "pendente,desenvolvimento" \
          --assignee "Samuel Menon Ramos" \
          --status "Backlog"
        
        # Import individual tasks as subtasks
        task_lines=$(agent listar "$feature_dir"tasks.md 2>/dev/null)
        while read -r task_line; do
            if [[ "$task_line" == *"[x]"* ]]; then
                task_title=$(echo "$task_line" | sed 's/\[x\]//' | sed 's/.***\(.*\)**.*/\1/')
                gh project item-create "$PROJECT_ID" \
                  --title "✓ $task_title" \
                  --status "Concluído"
            else
                task_title=$(echo "$task_line" | sed 's/.***\(.*\)**.*/\1/')
                gh project item-create "$PROJECT_ID" \
                  --title "⏳ $task_title" \
                  --status "Em Progresso"
            fi
        done <<< "$task_lines"
    fi
done

echo "✅ Tarefas OpenSpec sincronizadas com GitHub Kanban! 🎯"

# Helper function to check for GitHub CLI dependency
git_hub_available() {
    command -v gh >/dev/null 2>&1
}