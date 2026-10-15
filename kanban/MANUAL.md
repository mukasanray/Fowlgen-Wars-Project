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

### 3.2. Dois Modos de Quadro: Tarefas da Sprint vs Funil de Ideias

No topo do quadro visual, você pode alternar entre duas perspectivas de trabalho:

```
[ 🎯 Tarefas da Sprint (7) ] [ 💡 Funil de Ideias (2) ]  |  👤 Integrante: [ 👥 Todos ] [ 👤 Marcos ] [ 👤 Samuel ] [ 👥 Dev Team ] [ 🤖 Agente IA ]
```

1. **`🎯 Modo Tarefas da Sprint`** *(Foco em Desenvolvimento)*:
   * Colunas:
     * **📋 A Fazer (To Do)**: Tarefas planejadas e prontas para início.
     * **⚡ Em Progresso (In Progress)**: Tarefas que já começaram a ser codificadas.
     * **👀 Em Revisão (In Review)**: Tarefas codificadas aguardando validação ou teste de arena.
     * **✅ Concluído (Done)**: Tarefas 100% finalizadas e testadas.

2. **`💡 Modo Funil de Ideias`** *(Foco em Game Design & Propostas)*:
   * Colunas:
     * **💡 Novas Ideias (Propostas)**: Ideias recém-criadas (`[CRIADO]`), com botões rápidos de `🔍 Validar`, `✅ Aprovar` e `❌ Rejeitar`.
     * **🔍 Em Validação**: Ideias em teste técnico ou prova de conceito na `Arena_Clean`.
     * **✅ Aprovadas**: Ideias prontas para o time ou IA codificar. Suas tarefas aparecem ativas no modo Tarefas da Sprint.
     * **❌ Rejeitadas**: Ideias descartadas com o motivo registrado e botão de reconsideração.

---

### 3.3. Filtro Rápido por Integrante (Meu Quadro Pessoal)

Permite isolar as tarefas e ideias de um integrante específico com 1 clique ou pesquisar no campo `🔍 Buscar...`:

* **`👥 Todos`**: Visão panorâmica de todo o projeto da Sprint.
* **`👑 Samuel`**: Product Owner • Game Design • Gestão do Kanban.
* **`💻 Marcos`**: Líder Técnico • Dev Core Unity & Web3.
* **`🕹️ Manuel`**: Dev Unity • Gameplay Core & Ambiente.
* **`🛡️ Jorge Espindola`**: DevSecOps Engineer & Web3 • Áudio & Docs.
* **`🌐 Junior`**: Dev Web (React/Node) • Docs & Prompts.
* **`🧪 Maria Clara`**: QA Funcional • UX Testing & Lore.
* **`📈 Ramiro`**: Marketing Estratégico & Pitch Deck.
* **`👥 Dev Team`**: Equipe Técnica Geral.
* **`🤖 Agente IA`**: Automação & Copilot de Código.

* **`🤖 Agente IA`**: Automação & Copilot de Código.

---

### 3.4. Identificação do Desenvolvedor (Arquitetura Privacy-First & 100% Git-Native)

Para garantir **privacidade total e segurança**, nenhum e-mail pessoal é armazenado nos arquivos versionados pelo Git:

1. **Privacidade por Padrão (Sem e-mails no repositório)**:
   * O arquivo `kanban/src/config/members.json` contém apenas dados públicos da equipe: `nome`, `função`, `avatar`, `cor` e `github username` (ex.: `@mukasanray`).
   * E-mails pessoais não são solicitados nem salvos no repositório público.

2. **Como Funciona a Identificação em 4 Camadas de Privacidade**:
   * **Camada 1 (Arquivo Local Ignorado pelo Git)**: Quando você se identifica, o Kanban grava sua preferência em `kanban/src/config/identity.local.json`. Esse arquivo está protegido pelo `.gitignore` e **nunca sobe para o Git**.
   * **Camada 2 (GitHub Username)**: O Kanban compara seu `@username` público do GitHub.
   * **Camada 3 (Nome do Git)**: Verifica se o `git config user.name` (ex.: `Marcos`) corresponde a algum integrante.
   * **Camada 4 (Branch Ativa)**: Se você estiver em uma branch pessoal como `fowlgenwars-unity-marcos`, o Kanban reconhece o Marcos automaticamente!

3. **Banner de Identificação Rápida**:
   * Se você abrir o Kanban em uma nova máquina ou perfil sem vínculo, o banner permite escolher seu nome em 1 clique e salvar localmente com privacidade total.
   * Botão **`🎯 Minhas Tarefas`**: Filtra instantaneamente as tarefas atribuídas a você!
   * **API REST Disponível**:
     * `GET /api/members`: Lista todos os integrantes e retorna o `gitUser` e `detectedMember`.
     * `POST /api/members`: Cadastra novo integrante com e-mail e github.
     * `PUT /api/members/update`: Altera nome, papel, email, github, avatar ou cor.
     * `POST /api/git/config-user`: Aplica `git config user.name` e `git config user.email` no repositório local.
     * `DELETE /api/members/delete`: Remove integrante.

### 3.4. Interações nos Cards de Tarefas e Ideias

* **Checkboxes de Subtarefas**: Marque diretamente no card da Sprint (`[x]` ou `[ ]`) para atualizar o progresso em tempo real.
* **Botões de Ação Rápida de Ideia**: Valide, aprove ou rejeite uma ideia direto no card sem precisar abrir formulários.
* **Arrastar e Soltar (Drag & Drop)**: Mova os cards entre as colunas para atualizar status automaticamente.
* **Filtro por Feature**: No topo do painel, isole uma feature específica (ex: `health-bar-black-bg`) quando desejar foco total.

---

### 3.4. Gestão de Ideias e Automação com IA Local

Abaixo do quadro Kanban, você encontra a seção de **Controle e Automação**:

* **Aba Tarefas**: Preencha o ID da tarefa, status e responsável para gerar o comando padronizado (ex.: `agent atualizar "**2.1**" "in_progress" "Marcos"`).
* **Aba Ideias**:
  * **`🪄 Gerar Tarefas com IA`**: Digite o ID e título da ideia (ex: `sistema-ranking`). O gerador de IA local cria automaticamente a proposta completa e o checklist de 3 fases (`Planejamento`, `Implementação`, `Validação em Arena_Clean`) pronto para o Kanban.
  * **`📁 Nova Feature`**: Cria uma estrutura limpa de arquivos em branco.
  * **`🔍 Validar Ideia` / `✅ Aprovar` / `❌ Rejeitar`**: Atualiza o status oficial no `proposal.md` com um clique.
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
│   └── config/
│       ├── kanban-config.json # Configuração de colunas e mapeamentos
│       └── members.json       # Cadastro Git-Native de integrantes da equipe
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

---

## 7. Perguntas Frequentes (FAQ)

### P: Preciso de banco de dados para usar o Kanban?
**R:** **Não!** O sistema é **100% Git-Native**. Todas as tarefas, ideias e integrantes ficam salvos diretamente em arquivos versionados no repositório (`openspec/changes/*/tasks.md` e `kanban/src/config/members.json`), garantindo versionamento com Git, funcionamento offline rápido e zero dependências de bancos externos.

### P: O que acontece quando clico em "Salvar Alterações"?
**R:** O Kanban faz um `git add` dos arquivos de tarefas modificados e cria um commit limpo no Git com a mensagem que você digitar. Suas alterações ficam salvas com segurança no histórico do projeto.

### P: Como as tarefas vão para a branch `main`?
**R:** Quando você terminar sua funcionalidade no **Modo Local**, abra um **Pull Request (PR)** no GitHub. Assim que o PR for aprovado e mergeado na `main`, qualquer pessoa que clicar em **`Modo Oficial (main)`** no Kanban Studio verá as tarefas consolidadas automaticamente!
