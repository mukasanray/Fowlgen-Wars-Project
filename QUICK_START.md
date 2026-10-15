# Quick Start: OpenSpec ↔ GitHub Kanban para Fowlgen Wars

## Comece em 5 Minutos

### 1. Execute Script de Sincronização (uma vez)
```bash
./fowlgowwars-kanban-sync.sh
```

### 2. Execute Diário (GitHub Actions)
```yaml
# .github/workflows/kanban-sync.yml já configurado
# Executa seg-sex às 9h
```

### 3. Visualize Status Kanban
```bash
./VIEW_KANBAN_STATUS.sh
```

## Comandos Úteis

### Backlog Kanban (Samuel - PO)
```bash
# 1. Verificar backlog OpenSpec
agent consultar openspec/changes/*/tasks.md

# 2. Priorizar no GitHub Projects
gh project list --format json | jq '.[] | select(.name == "Backlog de Features")'

# 3. Validar e aprovar
agent validar ideia "<id>"
agent aprovar ideia "<id>" "Samuel"
```

### Desenvolvimento (Marcos/Jorge/Maria)
```bash
# 1. Iniciar tarefa
agent atualizar "**2.1**" "Em Andamento" "Marcos"

# 2. Progresso no GitHub
gh issue edit "$ISSUE_ID" --label "em-progresso"

# 3. Testar
agent atualizar "**2.5**" "Testando" "Maria"

# 4. Concluir
agent atualizar "**2.5**" "Concluído" "Maria"
gh issue edit "$ISSUE_ID" --label "concluído" --status "Done"
```

## Status Atual

```bash
./VIEW_KANBAN_STATUS.sh
```

## Arquivos Recentes

```bash
ls -la *.sh
ls -la .github/workflows/
ls -la .kanban-status-*.txt
```

## Problemas?

- **GitHub CLI não instalado**: `brew install gh` (macOS) ou `winget install GitHub CLI` (Windows)
- **Problemas de autenticação**: `gh auth login`
- **Tarefas não aparecem**: Execute `./fowlgowwars-kanban-sync.sh` primeiro

## Configure GitHub Actions (Opcional)

```bash
# Configure o token do GitHub
# 1. Vá em GitHub Settings > Developer settings > Personal access tokens
# 2. Crie token com permissões de repositório
# 3. Adicione como GH_TOKEN no GitHub Secrets
# 4. O workflow executará automaticamente diariamente
```

---

**Resultado**: Kanban sincronizado automaticamente! 🎯
**Equipe**: Samuel (PO), Marcos/Jorge/Maria (Dev), Maria Clara (QA)
**Colunas**: Backlog → Em Progresso → Review → Done