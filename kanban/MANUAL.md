# 📋 Manual Rápido — Kanban Studio

> Central visual de tarefas e governança ágil do projeto **Fowlgen Wars**. Simples, visual, nativo e 100% integrado ao Git e OpenSpec.

---

## 🚀 Como Executar o Instalador

Abra o terminal na pasta `kanban` e execute:

```bash
cd kanban
npm run setup
```

> 💡 **Automação Completa:** Se o ambiente ainda não tiver as ferramentas ou dependências, o `npm run setup` chama automaticamente os arquivos da pasta `setup/` para instalar tudo e, ao final da instalação, exibe o menu interativo.

---

## 🎮 Menu Interativo do Instalador

Ao executar o instalador, a **Central de Comandos** do Kanban Studio é exibida diretamente no seu terminal:

```text
======================================================
   🐔 FOWLGEN WARS — KANBAN STUDIO MENU
======================================================
   [1] 🌐 Iniciar Servidor Web (http://localhost:3000)
   [2] 💻 Iniciar Aplicativo Desktop (Electron)
   [3] 📊 Gerar / Atualizar Dashboard (Markdown e HTML)
   [4] 📋 Visualizar Status no Terminal
   [5] 🔍 Diagnóstico e Integridade do Ambiente
   [6] 🔄 Sincronizar com GitHub Projects
   [7] 🔧 Reexecutar Instalação / Verificação Completa
   [0] 🚪 Sair
======================================================
👉 Digite o número da opção desejada:
```

> 💡 **Como usar:** Digite o número da opção desejada e tecle `Enter`. Para encerrar qualquer serviço (como o servidor web na opção `[1]`) e retornar ao menu, pressione `Ctrl+C`.

---

## 🎮 2. Como Usar no Dia a Dia

### 👤 2.1. Identidade do Desenvolvedor e Privacidade
O Kanban Studio possui um sistema de detecção automática para saber quem está operando o quadro:
* **Detecção Automática Inteligente**: O sistema identifica você através de:
  1. Arquivo local de identidade (`kanban/src/config/identity.local.json` — 100% privado e ignorado pelo Git).
  2. Usuário cadastrado do GitHub vinculado ao seu git.
  3. Nome configurado no Git (`git config user.name`).
  4. Nome da branch ativa (ex: `main`).
* **Chip de Identidade no Topo**: Mostra seu avatar, nome e status. Clique nele para alternar rapidamente seu integrante sem alterar arquivos públicos.
* **Privacidade Total**: E-mails pessoais não são expostos em arquivos comitados.

---

### 💻 2.2. Modo Local vs 🌐 Modo Oficial
No cabeçalho do quadro, alterne entre:
* **`💻 Modo Local`** *(Recomendado para o dia a dia)*: Trabalha diretamente na sua branch atual. Permite marcar checkboxes `[x]`, mover cards entre colunas, criar tarefas e salvar alterações.
* **`🌐 Modo Oficial (main)`**: Modo de visualização somente-leitura para acompanhar o progresso consolidado e aprovado no branch principal.

---

### 🎯 2.3. Visões do Quadro

Você pode alternar entre duas abas no topo:

1. **Tarefas da Sprint**: O fluxo de trabalho de desenvolvimento:
   * **📋 A Fazer** ➔ **⚡ Em Progresso** ➔ **👀 Em Revisão** ➔ **✅ Concluído**
   * **Arrastar e Soltar**: Mova os cards livremente entre as colunas.
   * **Checkboxes Interativos**: Marque `[x]` ou desmarque `[ ]` diretamente dentro de cada card; o status geral do card é recalculado em tempo real.
2. **Funil de Ideias**: Visão de propostas do OpenSpec para propor novas mecânicas, requisitos ou melhorias, com ações para **Validar**, **Aprovar** ou **Rejeitar**.

---

### 👥 2.4. Gestão de Integrantes e Filtros Rápidos
* **Filtro por Integrante**: Clique na foto/nome de qualquer membro na barra superior para filtrar apenas as tarefas atribuídas a ele (ou "Todos" para limpar o filtro).
* **Gerenciar Equipe**: Clique no botão de gestão de membros para:
  * Adicionar novos integrantes com nome, cargo, usuário do GitHub, avatar emoji e cor personalizada.
  * Editar dados existentes ou remover membros inativos.

---

### 💾 2.5. Como Salvar Alterações no Git
1. Sempre que você alterar checkboxes, adicionar tarefas ou mover cards, o botão **`💾 Salvar Alterações`** no topo ficará destacado em verde.
2. Clique nele, insira uma mensagem resumindo o que foi feito (ex: *"conclui sistema de torres da arena"*) e confirme.
3. O Kanban Studio executa o commit no Git automaticamente, registrando suas modificações com precisão.

---

## ⌨️ 3. Tabela de Comandos Úteis

| Comando | O que faz |
|---|---|
| `npm run setup` | Abre o **Menu Interativo** (`install.ts`) ou executa a instalação inicial automática. |
| `npm run app` | Inicia o servidor e abre o Kanban no navegador (`localhost:3000`). |
| `npm run dev` | Inicia em modo desenvolvimento com auto-reload via `tsx`. |
| `npm run dashboard` | Atualiza os relatórios do dashboard Markdown e HTML com base no OpenSpec. |
| `npm run app:desktop` | Compila o backend e abre o aplicativo em janela Desktop (Electron). |
| `npm run build:server` | Compila o bundle do servidor de produção em `dist/server.js` via `esbuild`. |
| `npm run dist` | Cria o instalador oficial para Windows (`.exe` NSIS) na pasta `release/`. |
| `npm run dist:portable` | Cria o executável portátil para Windows (`.exe`) na pasta `release/`. |
| `npm run dist:msi` | Cria o instalador corporativo para Windows (`.msi`) na pasta `release/`. |
| `npm run status` | Exibe o status e resumo das tarefas diretamente no terminal. |
| `npm run verify` | Executa diagnóstico de integridade das pastas, OpenSpec e dependências. |
| `npm run sync` | Sincroniza tarefas com o GitHub Projects na nuvem (se configurado). |

---

## 📦 4. Gerando Executáveis Desktop (.exe / .msi)

Se você preferir distribuir ou utilizar o Kanban Studio como um aplicativo para Windows sem precisar abrir o terminal toda vez:

### Opção 1: Executável Portátil (`.exe`) *(Recomendado para abrir direto sem instalar)*
```bash
npm run dist:portable
```

### Opção 2: Instalador Padrão (`.exe` NSIS)
Instalador clássico com atalhos na Área de Trabalho e Menu Iniciar:
```bash
npm run dist
```

### Opção 3: Instalador Corporativo (`.msi`)
Instalador padrão Windows Installer para distribuição em máquinas:
```bash
npm run dist:msi
```

> 📂 Os arquivos gerados ficam dentro da pasta `kanban/release/` (ex: `Kanban Studio 1.0.0.exe`). Basta dar dois cliques para abrir!

---

## ❓ 5. Dúvidas Comuns e Boas Práticas

* **Onde ficam salvas as tarefas?**  
  Dentro de cada proposta na pasta `openspec/changes/<id_da_feature>/tasks.md`.
* **Onde fica salva a lista de integrantes da equipe?**  
  No arquivo central `kanban/src/config/members.json`.
* **O que é o `identity.local.json`?**  
  É um arquivo gerado automaticamente em `kanban/src/config/identity.local.json` quando você escolhe seu perfil. Ele é ignorado pelo `.gitignore` para garantir que a sua preferência não altere o ambiente dos outros colegas de equipe.
* **Como enviar as tarefas concluídas para a branch principal (`main`)?**  
  Após salvar suas alterações no Kanban, envie sua branch com `git push` e abra um Pull Request (PR) no GitHub. Após a revisão e merge na `main`, todos verão as tarefas concluídas no **Modo Oficial**.
