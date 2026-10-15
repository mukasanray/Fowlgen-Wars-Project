# Configuração de Integração OpenSpec ↔ GitHub Kanban para Fowlgen Wars

## Visão Geral

Este documento explica como configurar o sistema completo de integração entre OpenSpec e GitHub Projects para Fowlgen Wars, permitindo uma sincronização bidirecional perfeita entre o sistema de gerenciamento de tarefas OpenSpec e o Kanban GitHub.

## Pré-requisitos

### 1. GitHub CLI (gh)
- **Instalação**: `brew install gh` (macOS) ou `winget install GitHub CLI` (Windows)
- **Autenticação**: `gh auth login`
- **Permissões**: Acesso de leitura/escrita ao repositório

### 2. Dependências Node.js (opcional, para GitHub Actions)
- Node.js 18+ recomendado
- Dependências do projeto (se necessárias)

### 3. OpenSpec CLI/CLI Tools
- Sistema OpenSpec já configurado (presente em openspec/)
- Comandos OpenSpec disponíveis no PATH

## Configuração Rápida

```bash
# 1. Torna os scripts executáveis (Windows: use PowerShell como Administrador)
chmod +x fowlgowwars-kanban-sync.sh
sync-openpec-to-github.sh
update-kanban-columns.sh
generate-kanban-dashboard.sh
VIEW_KANBAN_STATUS.sh

# 2. Configure o token do GitHub (se necessário)
export GH_TOKEN="seu-token-aqui"

# 3. Teste a sincronização
./fowlgowwars-kanban-sync.sh
```

## Script de Sincronização Completa

### `fowlgowwars-kanban-sync.sh`
- Executa todo o pipeline de sincronização
- Exporta tarefas do OpenSpec para o GitHub
- Valida ideias aprovadas
- Atualiza colunas do Kanban
- Gera dashboard
- Commit as alterações

### `sync-openpec-to-github.sh`
- Exporta todas as features do OpenSpec para o GitHub Projects
- Cria/atualiza cards no Backlog de Features
- Importa tarefas individuais como subtarefas
- Gerencia status (Backlog, Em Progresso, Concluído)

### `update-kanban-columns.sh`
- Sincroniza as mudanças de status do OpenSpec para o GitHub
- Atualiza cards entre colunas (Backlog → Em Progresso → Review → Done)
- Mantém o GitHub Kanban consistente com o OpenSpec

### `generate-kanban-dashboard.sh`
- Gera painel de status em tempo real
- Mostra métricas (Features no Backlog, Em Desenvolvimento, Concluídas)
- Salva relatório com timestamp

### `VIEW_KANBAN_STATUS.sh`
- Visualização rápida do status Kanban
- Mostra cards em cada coluna
- Exibe métricas de progresso

## Fluxo de Trabalho (Pipeline)

1. **Exportar do OpenSpec**: Todas as features e tarefas são exportadas para o GitHub
2. **Validar Aprovações**: Ideias aprovadas pelo PO são validadas no OpenSpec
3. **Sincronizar Colunas**: Status são mantidos sincronizados entre sistemas
4. **Gerar Relatório**: Dashboard é atualizado com métricas
5. **Versionar**: Alterações são commitadas no repositório

## Configuração do GitHub Actions

### `/.github/workflows/kanban-sync.yml`

**Características:**
- Executa diariamente de segunda a sexta às 9h
- Dispara manualmente quando necessário
- Usa token seguro do GitHub (GH_TOKEN)
- Mantém histórico de commits da sincronização

**Variáveis Secretas:**
- `GH_TOKEN`: Token de acesso do GitHub com permissões de escrita

## Configuração Específica de Fowlgen Wars

### Colunas GitHub Projects

O Kanban usa estas colunas (já configuradas):
1. **Backlog** → Features novas/pendentes
2. **Em Progresso** → Features em desenvolvimento
3. **Review** → Features em teste/REVISÃO
4. **Done** → Features concluídas

### Responsabilidades da Equipe

| Função | Responsável | Scripts |
|--------|-------------|---------|
| Backlog Kanban | Samuel Menon Ramos (PO) | `agent consultar`, `gh project list`, `agent validar` |
| Desenvolvimento | Marcos, Jorge, Maria | `agent atualizar`, `gh issue edit` |
| QA e Verificação | Maria Clara | `agent atualizar`, `gh issue create` |

### Fluxo de Trabalho Detalhado

#### Para Desenvolvimento (Marcos/Jorge/Maria):

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

#### Para QA e Verificação (Maria Clara):

```bash
# 1. Testar feature
agent atualizar "**2.5**" "Testando" "Maria"

# 2. Validar no GitHub
gh issue create --title "Test: $(agent consultar openspec/changes/*/proposal.md)" --label "testando,aprovado"

# 3. Reportar bugs
gh issue create --title "Bug: <descrição>" --label "bug,reportado"
```

## Gerenciamento de Problemas

### Problemas Comuns e Soluções

1. **GitHub CLI não encontrado**
   ```bash
   # macOS
   brew install gh
   # Windows
   winget install GitHub CLI
   ```

2. **Problemas de autenticação**
   ```bash
   gh auth login
   ```

3. **Sem permissões de escrita**
   - Adicione o GitHub User Bot como colaborador
   - Configure GH_TOKEN com permissões de repositório completo

4. **Tarefas não aparecem**
   - Verifique se o OpenSpec CLI está no PATH
   - Execute `agent listar openspec/changes/*/tasks.md`

## Manutenção e Atualização

### Testar a Configuração

```bash
# 1. Execute sincronização completa
./fowlgowwars-kanban-sync.sh

# 2. Visualize status
./VIEW_KANBAN_STATUS.sh

# 3. Verifique logs de commit
/git log --oneline --grep="sync:" -5
```

### Atualizar Fluxo de Trabalho

```bash
# Atualize scripts
git pull
./fowlgowwars-kanban-sync.sh
```

### Remover Configuração

```bash
# Desative o GitHub Actions
# Edite .github/workflows/kanban-sync.yml e defina "on: []"

# Remova scripts locais (opcional)
rm fowlgowwars-kanban-sync.sh sync-openpec-to-github.sh update-kanban-columns.sh generate-kanban-dashboard.sh VIEW_KANBAN_STATUS.sh
```

## Monitoramento

### Visualizar Status Kanban

Execute:
```bash
./VIEW_KANBAN_STATUS.sh
```

Resultado:
- Cards em cada coluna
- Métricas de progresso
- Relatório com timestamp salvo em `.kanban-status-YYYYMMDD.txt`

### Logs de Sincronização

- Logs de todos os scripts são exibidos no terminal
- Resultados do GitHub Projects são mostrados
- Erros são capturados e exibidos

## Segurança

### Tokens e Autenticação

- Armazene GH_TOKEN como GitHub secret (não hardcoded)
- Use OAuth tokens com permissões mínimas necessárias
- Revogue tokens regularmente

### Permissões de Arquivo

- Scripts devem ter `+x` permissions (Unix) ou serem executáveis (Windows)
- Não compartilhe scripts que contenham tokens ou segredos

## Resumo

✅ Sistema de integração OpenSpec ↔ GitHub Kanban completo
✅ Scripts de sincronização automatizada
✅ GitHub Actions para execução diária
✅ Painel de monitoramento e relatório
✅ Fluxo de trabalho específico para Fowlgen Wars
✅ Documentação e troubleshooting

**Próximos Passos:**
1. Configure GitHub CLI e autentique-se
2. Execute o script de sincronização inicial
3. Configure GitHub Actions com GH_TOKEN
4. Comece a usar os scripts diários

🎯 **Resultado**: Seu sistema OpenSpec existente se integra perfeitamente com o Kanban GitHub que já está funcionando em Fowlgen Wars! 🎯

---

*Para mais informações, consulte o AGENTS.md no repositório openspec/*
*Leia prompt/Claude.md antes de codar*
*Seguir menor mudança, preservar conflitos, validar em Arena_Clean.*