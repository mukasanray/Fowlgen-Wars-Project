# 📖 Manual do Usuário e Desenvolvedor — Kanban Studio & OpenSpec

> **Fowlgen Wars — Sistema de Gestão Visual de Tarefas e Sincronização Git-Native**

---

## 1. Visão Geral e Objetivo

O **Kanban Studio** é uma central de controle visual para o gerenciamento de tarefas do projeto **Fowlgen Wars**. Ele conecta de forma transparente a especificação técnica **OpenSpec** (arquivos Markdown na pasta `openspec/changes/`) com a rotina de desenvolvimento diária e o **GitHub Projects**.

### Principais Benefícios:
* **Sem Complicação**: Permite marcar tarefas como feitas com um clique, arrastar cards entre colunas e commitar as alterações no Git sem precisar editar arquivos Markdown manualmente.
* **Padrão Git-Native em Produção**: A fonte da verdade (*single source of truth*) são os próprios arquivos do repositório Git. Não há dependência de banco de dados externo ou servidores em nuvem pagos.
* **Separação Clara de Modos**: Alternância instantânea entre o que está sendo editado no seu computador (**Modo Local**) e o que já foi aprovado e consolidado no repositório (**Modo Oficial / main**).

---

## 2. Como Iniciar o Kanban Studio

### Pré-requisitos
* Node.js v18 ou superior instalado.
* Terminal na pasta `kanban/`.

### Inicialização
Abra o terminal e execute:
```bash
cd kanban
npm run app
```

O servidor iniciará automaticamente em:
👉 **http://localhost:3000**

---

## 3. Guia da Interface (Como Usar)

### 3.1. Cabeçalho e Seleção de Modo

No topo da página, você encontra os seguintes controles principais:

```
+----------------------------------------------------------------------------------------------------+
|  [💻 Modo Local (Em Edição)  branch-atual] [🌐 Modo Oficial (main)]  | 🟢 Tudo Salvo | 💾 Salvar Alterações |
+----------------------------------------------------------------------------------------------------+
```

1. **`💻 Modo Local (Em Edição)`** *(Recomendado para o dia a dia)*:
   * Carrega as tarefas diretamente dos arquivos da sua máquina local na branch ativa (ex: `fowlgenwars-unity-marcos`).
   * **Você pode editar**: marcar checkboxes de subtarefas, arrastar cards entre colunas e adicionar novas tarefas.
2. **`🌐 Modo Oficial (main)`**:
   * Consulta diretamente o histórico da branch `main` no Git.
   * Permite que qualquer pessoa da equipe veja exatamente o que já foi mergeado e oficializado no projeto.
   * Enquanto estiver nesse modo, o kanban opera em modo leitura com um banner informativo.
3. **Pílula de Status (`🟢 Tudo Salvo` / `🟡 X pendente(s)`)**:
   * Mostra em tempo real se você tem alterações locais não salvas no Git.
4. **Botão `💾 Salvar Alterações`**:
   * Substitui o antigo "Commit Git".
   * Quando há tarefas marcadas ou modificadas, ele fica verde e pulsa sutilmente com o contador (ex.: `💾 Salvar Alterações (2)`).
   * Ao clicar, você pode digitar uma breve descrição e as alterações são gravadas no histórico do Git de forma limpa.

---

### 3.2. As 4 Colunas do Kanban

As tarefas do OpenSpec são organizadas automaticamente em 4 estágios:

| Coluna | Significado | Como uma tarefa entra aqui |
|---|---|---|
| **📋 A Fazer (To Do)** | Tarefas planejadas e prontas para início. | Tarefa não iniciada (`[ ]`) no `tasks.md`. |
| **⚡ Em Progresso (In Progress)** | Tarefas que alguém já começou a codificar. | Marcada como em andamento ou arrastada para esta coluna. |
| **👀 Em Revisão (In Review)** | Tarefas codificadas aguardando validação ou teste. | Arrastada para revisão ou quando subtarefas técnicas são concluídas. |
| **✅ Concluído (Done)** | Tarefas 100% finalizadas e testadas. | Todos os checkboxes marcados ou card arrastado para Concluído. |

---

### 3.3. Interações nos Cards de Tarefas

Cada card representa uma funcionalidade ou conjunto de tarefas de uma mudança no OpenSpec:

* **Checkbox de Subtarefa**: Clique diretamente na caixinha de seleção dentro do card para marcar `[x]` ou desmarcar `[ ]`. A barra de progresso do card atualiza na mesma hora.
* **Arrastar e Soltar (Drag & Drop)**: Segure o card e arraste-o entre as colunas para atualizar seu status.
* **Detalhes da Tarefa**: Clique no card para abrir o modal com a descrição completa, responsável (*assignee*), dependências e checklist detalhado.
* **Filtro por Feature**: No topo do quadro, use o dropdown para isolar uma única funcionalidade (ex: `health-bar-black-bg`) ou exibir todas ao mesmo tempo.

---

### 3.4. Gerador de Comandos para Agentes de IA

Abaixo do quadro Kanban, você encontra a seção de **Controle e Automação**:

* **Aba Tarefas**: Preencha o ID da tarefa, status e responsável para gerar o comando padronizado (ex.: `agent atualizar "**2.1**" "in_progress" "Marcos"`).
* **Aba Ideias**: Permite aprovar ou arquivar propostas de ideias de novos sistemas.
* **Botão "Copiar Comando"**: Copia o comando formatado com um clique para colar diretamente no chat com agentes ou no terminal.

---

## 4. Integração com GitHub Projects

O Kanban Studio foi desenhado para sincronizar bidirecionalmente com o **GitHub Projects**:

1. Clique no botão **`⚙️ Configurações`** no cabeçalho.
2. Insira seu **GitHub Personal Access Token (PAT)** com escopos `repo` e `project`.
3. Defina o repositório (ex.: `mukasanray/Fowlgen-Wars-Project`).
4. Clique em **Salvar Configurações**.
5. As tarefas podem ser exportadas como issues ou cards no GitHub Projects pelo script `npm run sync`.

---

## 5. Estrutura de Arquivos do Projeto

```
kanban/
├── src/
│   ├── server/
│   │   └── server.ts          # Servidor HTTP local (API REST, leitor Git e OpenSpec)
│   ├── web/
│   │   ├── index.html         # Interface HTML com design moderno
│   │   ├── styles.css         # Estilização com paleta HSL, efeitos de hover e responsividade
│   │   └── app.js             # Lógica cliente, drag-and-drop, toggle e requisições
│   ├── scripts/
│   │   ├── main-orchestrator.ts # Script de sincronização automática com o GitHub
│   │   ├── sync-to-github.ts    # Envio de tarefas para o GitHub Projects API v2 (GraphQL)
│   │   └── VIEW_STATUS.ts       # Visualizador de status via linha de comando
│   ├── database/              # (Opcional) Conector PostgreSQL para cenários legados
│   │   ├── init-db.ts
│   │   └── sync-cli.ts
│   └── config/
│       └── kanban-config.json # Configuração de colunas e mapeamentos
├── package.json               # Dependências e scripts de execução
└── MANUAL.md                  # Este manual
```

---

## 6. Referência de Comandos (Linha de Comando)

| Comando | Descrição |
|---|---|
| `npm run app` ou `npm run dev` | Inicia o servidor Web visual no navegador (`localhost:3000`). |
| `npm run sync` | Roda o orquestrador para sincronizar o OpenSpec local com o GitHub Projects. |
| `npm run status` | Exibe no terminal o resumo das tarefas de todas as features ativas. |
| `npm run verify` | Valida se todos os caminhos do OpenSpec e ferramentas estão funcionando. |
| `npm run db:init` | *(Opcional)* Cria as tabelas no PostgreSQL caso queira espelhar localmente. |
| `npm run db:sync` | *(Opcional)* Sincroniza os arquivos Markdown com o banco PostgreSQL. |

---

## 7. Perguntas Frequentes (FAQ)

### P: Preciso do PostgreSQL rodando para usar o Kanban?
**R:** **Não.** O modo oficial de produção é **Git-Native**. Todas as tarefas ficam salvas em arquivos Markdown no repositório (`openspec/changes/*/tasks.md`), o que garante histórico de versões completo, funciona offline e não tem custo de infraestrutura. O PostgreSQL é apenas um recurso extra e opcional.

### P: O que acontece quando clico em "Salvar Alterações"?
**R:** O Kanban faz um `git add` dos arquivos de tarefas modificados e cria um commit limpo no Git com a mensagem que você digitar. Suas alterações ficam salvas com segurança no histórico do projeto.

### P: Como as tarefas vão para a branch `main`?
**R:** Quando você terminar sua funcionalidade no **Modo Local**, abra um **Pull Request (PR)** no GitHub. Assim que o PR for aprovado e mergeado na `main`, qualquer pessoa que clicar em **`Modo Oficial (main)`** no Kanban Studio verá as tarefas consolidadas automaticamente!
