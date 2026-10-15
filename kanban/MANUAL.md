# 📋 Manual Rápido — Kanban Studio

> Central visual de tarefas do projeto **Fowlgen Wars**. Simples, direto e 100% integrado ao Git.

---

## ⚡ 1. O que você precisa ter instalado

Apenas **duas ferramentas** básicas:

1. **Node.js** (versão 18 ou superior) — [Baixar Node.js](https://nodejs.org/)
2. **Git** — [Baixar Git](https://git-scm.com/)

*(Opcional: **GitHub CLI `gh`**, necessário apenas caso você queira sincronizar tarefas com o GitHub Projects na nuvem).*

> 💡 **Importante:** Você **não precisa** de Docker, MySQL ou nenhum banco de dados. Tudo roda localmente e fica salvo nos próprios arquivos do repositório.

---

## 🚀 2. Como Instalar e Rodar (3 passos simples)

Abra o seu terminal e execute:

### Passo 1: Entrar na pasta do Kanban
```bash
cd kanban
```

### Passo 2: Instalar (apenas na 1ª vez)
```bash
npm install
```

### Passo 3: Iniciar
```bash
npm run app
```

Pronto! O sistema estará acessível em:  
👉 **http://localhost:3000**

---

## 🎮 3. Como Usar no Dia a Dia

### 💻 3.1. Modo Local vs 🌐 Modo Oficial
No topo da página você escolhe o modo de visualização:
* **`💻 Modo Local`** *(Recomendado para o dia a dia)*: Trabalha diretamente na sua branch. Aqui você marca checkboxes, arrasta cards e salva suas alterações.
* **`🌐 Modo Oficial (main)`**: Modo de leitura para ver o que já foi aprovado e consolidado no projeto oficial.

---

### 🎯 3.2. Visões do Quadro

Você pode alternar entre duas telas principais no topo:

1. **Tarefas da Sprint**: O fluxo de trabalho de desenvolvimento:
   * **📋 A Fazer** ➔ **⚡ Em Progresso** ➔ **👀 Em Revisão** ➔ **✅ Concluído**
   * Você pode marcar os checkboxes `[x]` diretamente dentro dos cards.
   * Você pode arrastar e soltar os cards entre as colunas.
2. **Funil de Ideias**: Para propor novas ideias, mecânicas ou ajustes, com botões rápidos para **Validar**, **Aprovar** ou **Rejeitar**.

---

### 👤 3.3. Filtrar pelo seu Nome
No topo do quadro, clique no seu nome (ex: **Marcos**, **Samuel**, etc.) para filtrar e ver apenas as tarefas atribuídas a você.

---

### 💾 3.4. Como Salvar Alterações no Git
1. Sempre que você marcar tarefas ou mover cards, o botão **`💾 Salvar Alterações`** no topo ficará verde.
2. Clique nele, digite um texto curto sobre o que você fez (ex: *"conclui barra de vida"*) e confirme.
3. O Kanban cria o commit no Git automaticamente para você!

---

## ⌨️ 4. Comandos Úteis

| Comando | O que faz |
|---|---|
| `npm run app` | Inicia o Kanban Studio no navegador (`localhost:3000`). |
| `npm run status` | Mostra um resumo rápido das tarefas direto no terminal. |
| `npm run verify` | Testa se todas as pastas e configurações estão corretas. |
| `npm run sync` | Sincroniza as tarefas com o GitHub Projects (se configurado). |

---

## ❓ 5. Dúvidas Comuns

* **Onde ficam salvas as tarefas?**  
  Nos arquivos da pasta `openspec/changes/`.
* **Como minhas tarefas vão para a branch principal (`main`)?**  
  Quando terminar sua funcionalidade, envie sua branch com `git push` e abra um Pull Request (PR) normal no GitHub. Assim que for aprovado e mergeado na `main`, qualquer pessoa que abrir o **Modo Oficial** verá as tarefas concluídas.
