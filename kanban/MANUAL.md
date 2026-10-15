# 📋 Manual Rápido — Kanban Studio

> Central visual de tarefas e governança ágil do projeto **Fowlgen Wars**. Simples, visual, nativo e 100% integrado ao Git e OpenSpec.

---

## ⚡ 1. O que você precisa ter instalado

Apenas **duas ferramentas** básicas:

1. **Node.js** (versão 18 ou superior) — [Baixar Node.js](https://nodejs.org/)
2. **Git** — [Baixar Git](https://git-scm.com/)

*(Opcional: **GitHub CLI `gh`**, necessário apenas caso queira sincronizar diretamente com o GitHub Projects na nuvem).*

> 💡 **Privacidade e Sem Dependências Externas:** Tudo funciona localmente e fica versionado nos próprios arquivos do repositório (`openspec/changes/` e `kanban/src/config/`).

---

## 🚀 2. Como Instalar e Rodar

Abra o terminal na raiz do repositório e execute:

### Passo 1: Entrar na pasta do Kanban
```bash
cd kanban
```

### Passo 2: Instalar dependências (apenas na 1ª vez)
```bash
npm install
```

### Passo 3: Iniciar o Kanban Studio

Você pode rodar no **Navegador** ou como **Aplicativo Desktop**:

#### Opção A: No Navegador (Padrão)
```bash
npm run app
```
Acesse no seu navegador: 👉 **http://localhost:3000**

#### Opção B: Aplicativo Desktop Nativo (Janela Electron)
```bash
npm run app:desktop
```
Abre o Kanban Studio diretamente como uma aplicação desktop nativa.

---

## 🎮 3. Como Usar no Dia a Dia

### 👤 3.1. Identidade do Desenvolvedor e Privacidade
O Kanban Studio possui um sistema de detecção automática para saber quem está operando o quadro:
* **Detecção Automática Inteligente**: O sistema identifica você através de:
  1. Arquivo local de identidade (`kanban/src/config/identity.local.json` — 100% privado e ignorado pelo Git).
  2. Usuário cadastrado do GitHub vinculado ao seu git.
  3. Nome configurado no Git (`git config user.name`).
  4. Nome da branch ativa (ex: `main`).
* **Chip de Identidade no Topo**: Mostra seu avatar, nome e status. Clique nele para alternar rapidamente seu integrante sem alterar arquivos públicos.
* **Privacidade Total**: E-mails pessoais não são expostos em arquivos comitados.

---

### 💻 3.2. Modo Local vs 🌐 Modo Oficial
No cabeçalho do quadro, alterne entre:
* **`💻 Modo Local`** *(Recomendado para o dia a dia)*: Trabalha diretamente na sua branch atual. Permite marcar checkboxes `[x]`, mover cards entre colunas, criar tarefas e salvar alterações.
* **`🌐 Modo Oficial (main)`**: Modo de visualização somente-leitura para acompanhar o progresso consolidado e aprovado no branch principal.

---

### 🎯 3.3. Visões do Quadro

Você pode alternar entre duas abas no topo:

1. **Tarefas da Sprint**: O fluxo de trabalho de desenvolvimento:
   * **📋 A Fazer** ➔ **⚡ Em Progresso** ➔ **👀 Em Revisão** ➔ **✅ Concluído**
   * **Arrastar e Soltar**: Mova os cards livremente entre as colunas.
   * **Checkboxes Interativos**: Marque `[x]` ou desmarque `[ ]` diretamente dentro de cada card; o status geral do card é recalculado em tempo real.
2. **Funil de Ideias**: Visão de propostas do OpenSpec para propor novas mecânicas, requisitos ou melhorias, com ações para **Validar**, **Aprovar** ou **Rejeitar**.

---

### 👥 3.4. Gestão de Integrantes e Filtros Rápidos
* **Filtro por Integrante**: Clique na foto/nome de qualquer membro na barra superior para filtrar apenas as tarefas atribuídas a ele (ou "Todos" para limpar o filtro).
* **Gerenciar Equipe**: Clique no botão de gestão de membros para:
  * Adicionar novos integrantes com nome, cargo, usuário do GitHub, avatar emoji e cor personalizada.
  * Editar dados existentes ou remover membros inativos.

---

### 💾 3.5. Como Salvar Alterações no Git
1. Sempre que você alterar checkboxes, adicionar tarefas ou mover cards, o botão **`💾 Salvar Alterações`** no topo ficará destacado em verde.
2. Clique nele, insira uma mensagem resumindo o que foi feito (ex: *"conclui sistema de torres da arena"*) e confirme.
3. O Kanban Studio executa o commit no Git automaticamente, registrando suas modificações com precisão.

---

## ⌨️ 4. Tabela de Comandos Úteis

| Comando | O que faz |
|---|---|
| `npm run app` | Inicia o servidor e abre o Kanban no navegador (`localhost:3000`). |
| `npm run dev` | Inicia em modo desenvolvimento com auto-reload via `tsx`. |
| `npm run app:desktop` | Compila o backend e abre o aplicativo em janela Desktop (Electron). |
| `npm run build:server` | Compila o bundle do servidor de produção em `dist/server.js` via `esbuild`. |
| `npm run dist` | Cria o instalador oficial para Windows (`.exe`) na pasta `release/`. |
| `npm run dist:portable` | Cria o executável portátil para Windows na pasta `release/`. |
| `npm run status` | Exibe o status e resumo das tarefas diretamente no terminal. |
| `npm run verify` | Executa diagnóstico de integridade das pastas, OpenSpec e dependências. |
| `npm run sync` | Sincroniza tarefas com o GitHub Projects na nuvem (se configurado). |

---

## 📦 5. Gerando o Executável Desktop (.exe)

Se você preferir distribuir ou utilizar o Kanban Studio como um executável para Windows sem precisar abrir o terminal toda vez:

1. Gere o executável portátil:
   ```bash
   npm run dist:portable
   ```
2. Ou gere o instalador completo (NSIS):
   ```bash
   npm run dist
   ```
3. O executável será gerado dentro da pasta `kanban/release/`. Basta dar dois cliques no `Kanban Studio.exe` para usar.

---

## ❓ 6. Dúvidas Comuns e Boas Práticas

* **Onde ficam salvas as tarefas?**  
  Dentro de cada proposta na pasta `openspec/changes/<id_da_feature>/tasks.md`.
* **Onde fica salva a lista de integrantes da equipe?**  
  No arquivo central `kanban/src/config/members.json`.
* **O que é o `identity.local.json`?**  
  É um arquivo gerado automaticamente em `kanban/src/config/identity.local.json` quando você escolhe seu perfil. Ele é ignorado pelo `.gitignore` para garantir que a sua preferência não altere o ambiente dos outros colegas de equipe.
* **Como enviar as tarefas concluídas para a branch principal (`main`)?**  
  Após salvar suas alterações no Kanban, envie sua branch com `git push` e abra um Pull Request (PR) no GitHub. Após a revisão e merge na `main`, todos verão as tarefas concluídas no **Modo Oficial**.
