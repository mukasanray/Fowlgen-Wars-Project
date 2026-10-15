// Fowlgen Wars - OpenSpec & Kanban Studio Client

let currentFeatures = [];
let activeTab = 'tasks';
let lastGeneratedCommand = '';

// DOM Elements
const selectFeatureTask = document.getElementById('select-feature-task');
const inputTaskId = document.getElementById('input-task-id');
const selectTaskStatus = document.getElementById('select-task-status');
const inputTaskAssignee = document.getElementById('input-task-assignee');
const inputTaskText = document.getElementById('input-task-text');

const inputIdeaId = document.getElementById('input-idea-id');
const inputIdeaTitle = document.getElementById('input-idea-title');
const inputIdeaTeam = document.getElementById('input-idea-team');
const inputIdeaReason = document.getElementById('input-idea-reason');

const commandOutput = document.getElementById('command-output');
const executionLog = document.getElementById('execution-log');
const toastContainer = document.getElementById('toast-container');

// Stat Elements
const statTotalFeatures = document.getElementById('stat-total-features');
const statTotalTasks = document.getElementById('stat-total-tasks');
const statDoneTasks = document.getElementById('stat-done-tasks');

// Git Elements & State
let currentSelectedBranch = 'local';
let gitInfoState = null;
const btnModeLocal = document.getElementById('btn-mode-local');
const btnModeMain = document.getElementById('btn-mode-main');
const currentBranchTag = document.getElementById('current-branch-tag');
const selectGitBranch = document.getElementById('select-git-branch');
const gitStatusPill = document.getElementById('git-status-pill');
const gitStatusDot = document.getElementById('git-status-dot');
const gitStatusLabel = document.getElementById('git-status-label');
const gitBranchBanner = document.getElementById('git-branch-banner');
const gitBranchBannerIcon = document.getElementById('git-branch-banner-icon');
const gitBranchBannerText = document.getElementById('git-branch-banner-text');
const gitBranchBannerActions = document.getElementById('git-branch-banner-actions');
const btnCommitOpenspec = document.getElementById('btn-commit-openspec');


// Tab Management
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
      content.classList.remove('active');
    });
    
    const targetId = btn.getAttribute('data-tab');
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
      targetContent.style.display = 'block';
      targetContent.classList.add('active');
    }
    
    activeTab = targetId.replace('tab-content-', '');
    updateCommandPreview();
  });
});

// Toast Helper
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function appendLog(text) {
  const timestamp = new Date().toLocaleTimeString();
  executionLog.textContent = `[${timestamp}] ${text}\n` + executionLog.textContent;
}

// Command Preview Generator (From PDF syntax)
function updateCommandPreview(customCmd = null) {
  if (customCmd) {
    lastGeneratedCommand = customCmd;
    commandOutput.textContent = customCmd;
    return;
  }

  const feature = selectFeatureTask.value || 'health-bar-black-bg';
  const taskId = inputTaskId.value.trim() || '2.1';
  const status = selectTaskStatus.value;
  const assignee = inputTaskAssignee.value.trim() || 'Marcos';
  const taskText = inputTaskText.value.trim() || 'Implementar BackEnd';

  const ideaId = inputIdeaId.value.trim() || 'sistema-ouro';
  const ideaTitle = inputIdeaTitle.value.trim() || 'Sistema de Ouro';
  const ideaTeam = inputIdeaTeam.value.trim() || 'dev-team';
  const ideaReason = inputIdeaReason.value.trim() || 'Sem valor';

  let cmd = '';

  if (activeTab === 'tasks') {
    cmd = `agent atualizar "**${taskId}**" "${status}" "${assignee}"`;
  } else if (activeTab === 'ideas') {
    cmd = `agent validar ideia "${ideaId}"`;
  } else if (activeTab === 'kanban') {
    cmd = `npm.cmd run sync`;
  }

  lastGeneratedCommand = cmd;
  commandOutput.textContent = cmd;
}

// Input change listeners
[selectFeatureTask, inputTaskId, selectTaskStatus, inputTaskAssignee, inputTaskText,
 inputIdeaId, inputIdeaTitle, inputIdeaTeam, inputIdeaReason].forEach(input => {
  if (input) {
    input.addEventListener('input', () => updateCommandPreview());
    input.addEventListener('change', () => updateCommandPreview());
  }
});

// Clipboard Copy
document.getElementById('btn-copy-command').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(lastGeneratedCommand);
    showToast('Comando copiado para o chat!', 'success');
  } catch (err) {
    // Fallback copy
    const textarea = document.createElement('textarea');
    textarea.value = lastGeneratedCommand;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Comando copiado!', 'success');
  }
});

// Clear Log
document.getElementById('btn-clear-log').addEventListener('click', () => {
  executionLog.textContent = '';
});

// Fetch Git Info & Branches
async function fetchGitInfo() {
  try {
    const res = await fetch('/api/git/info');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success) {
      gitInfoState = data;
      updateBranchSelector(data);
      updateGitStatusPill(data);
    }
  } catch (err) {
    console.warn('Erro ao carregar informações do Git:', err);
  }
}

function updateBranchSelector(data) {
  if (currentBranchTag) {
    currentBranchTag.textContent = data.currentBranch || 'local';
    currentBranchTag.title = `Branch local ativa: ${data.currentBranch}`;
  }

  if (!selectGitBranch) return;
  selectGitBranch.innerHTML = '<option value="" disabled selected>📂 Outras branches...</option>';

  data.branches.forEach(br => {
    if (br !== 'main' && br !== data.currentBranch) {
      const opt = document.createElement('option');
      opt.value = br;
      opt.textContent = `🌿 ${br}`;
      selectGitBranch.appendChild(opt);
    }
  });

  // Mostra o seletor apenas se houver mais branches além de main e da atual
  const otherBranchesCount = data.branches.filter(b => b !== 'main' && b !== data.currentBranch).length;
  selectGitBranch.parentElement.style.display = otherBranchesCount > 0 ? 'flex' : 'none';
}

function updateGitStatusPill(data) {
  if (!gitStatusDot || !gitStatusLabel) return;
  if (data.uncommittedChanges) {
    const count = data.modifiedFiles ? data.modifiedFiles.length : 1;
    gitStatusDot.style.background = 'var(--accent-gold)';
    gitStatusDot.style.boxShadow = '0 0 8px var(--accent-gold)';
    gitStatusLabel.textContent = `${count} pendente(s) de salvar`;
    if (gitStatusPill) {
      gitStatusPill.className = 'git-status-pill pending';
      gitStatusPill.title = `${count} arquivo(s) de tarefas alterados localmente. Clique em Salvar Alterações para registrar no Git.`;
    }
    if (btnCommitOpenspec) {
      btnCommitOpenspec.innerHTML = `💾 Salvar Alterações (${count})`;
      btnCommitOpenspec.className = 'btn btn-save btn-sm has-pending';
      btnCommitOpenspec.title = `Salvar ${count} alteração(ões) pendente(s) no Git`;
    }
  } else {
    gitStatusDot.style.background = 'var(--accent-emerald)';
    gitStatusDot.style.boxShadow = '0 0 6px var(--accent-emerald)';
    gitStatusLabel.textContent = 'Tudo Salvo';
    if (gitStatusPill) {
      gitStatusPill.className = 'git-status-pill';
      gitStatusPill.title = `Todas as tarefas estão salvas na branch ${data.currentBranch}`;
    }
    if (btnCommitOpenspec) {
      btnCommitOpenspec.innerHTML = `💾 Salvar Alterações`;
      btnCommitOpenspec.className = 'btn btn-save btn-sm';
      btnCommitOpenspec.title = `Nenhuma alteração pendente de salvar`;
    }
  }
}

// Alternar entre Modo Local e Modo Oficial
function setMode(mode) {
  currentSelectedBranch = mode;
  if (mode === 'local') {
    btnModeLocal?.classList.add('active');
    btnModeMain?.classList.remove('active');
  } else if (mode === 'main') {
    btnModeMain?.classList.add('active');
    btnModeLocal?.classList.remove('active');
  } else {
    btnModeLocal?.classList.remove('active');
    btnModeMain?.classList.remove('active');
  }
  fetchFeatures();
}

if (btnModeLocal) {
  btnModeLocal.addEventListener('click', () => {
    setMode('local');
    showToast('Modo Local: editando tarefas do seu workspace.', 'success');
  });
}

if (btnModeMain) {
  btnModeMain.addEventListener('click', () => {
    setMode('main');
    showToast('Modo Oficial (main): visualizando tarefas aprovadas.', 'info');
  });
}

if (selectGitBranch) {
  selectGitBranch.addEventListener('change', () => {
    if (selectGitBranch.value) {
      setMode(selectGitBranch.value);
    }
  });
}

// Fetch Features from Server (Local ou Git Branch)
async function fetchFeatures() {
  try {
    const res = await fetch(`/api/features?branch=${encodeURIComponent(currentSelectedBranch)}`);
    if (!res.ok) throw new Error('Falha na resposta da API');
    const data = await res.json();
    if (data.success && data.features) {
      currentFeatures = data.features;
      renderFeatures(data.features);
      updateFeatureSelect(data.features);
      updateStats(data.features);
      setConnectionStatus(true);
      renderBranchBanner(data);
    }
  } catch (err) {
    console.warn('Servidor local offline ou estático:', err);
    setConnectionStatus(false);
  }
}

function renderBranchBanner(data) {
  if (!gitBranchBanner) return;

  if (data.isGitBranch) {
    gitBranchBanner.style.display = 'flex';
    gitBranchBanner.className = 'branch-alert-banner info';
    gitBranchBannerIcon.textContent = data.branch === 'main' ? '🌐' : '🌿';

    if (data.branch === 'main') {
      if (data.isEmptyBranch) {
        gitBranchBannerText.innerHTML = `Visualizando <strong>Modo Oficial (branch main)</strong>: O OpenSpec ainda não está presente nesta branch. Assim que o Pull Request for mergeado para a <code>main</code>, as tarefas oficiais consolidadas aparecerão aqui!`;
      } else {
        gitBranchBannerText.innerHTML = `Visualizando <strong>Modo Oficial (branch main)</strong>. Este é o Kanban oficial consolidado do repositório. Para editar ou marcar tarefas em tempo real, clique em <strong>Modo Local</strong>.`;
      }
    } else {
      gitBranchBannerText.innerHTML = `Visualizando histórico da branch <strong>"${data.branch}"</strong> (Modo Leitura).`;
    }
    gitBranchBannerActions.innerHTML = `<button class="btn btn-secondary btn-sm" id="btn-return-local" style="padding: 4px 10px; font-size: 11px;">💻 Voltar para Modo Local</button>`;
    document.getElementById('btn-return-local')?.addEventListener('click', () => {
      setMode('local');
    });
  } else if (data.gitInfo && data.gitInfo.uncommittedChanges) {
    gitBranchBanner.style.display = 'flex';
    gitBranchBanner.className = 'branch-alert-banner warning';
    gitBranchBannerIcon.textContent = '⚡';
    gitBranchBannerText.innerHTML = `Você está no <strong>Modo Local</strong> na branch <code>${data.currentBranch}</code> com <strong>${data.gitInfo.modifiedFiles.length} alteração(ões) pendente(s)</strong> de salvar.`;
    gitBranchBannerActions.innerHTML = `<button class="btn btn-save btn-sm has-pending" id="btn-banner-commit" style="padding: 4px 10px; font-size: 11px;">💾 Salvar Alterações</button>`;
    document.getElementById('btn-banner-commit')?.addEventListener('click', commitOpenSpecChanges);
  } else {
    gitBranchBanner.style.display = 'none';
  }
}

async function commitOpenSpecChanges() {
  const defaultMsg = `docs(openspec): atualiza status das tarefas no kanban`;
  const msg = prompt(`Digite uma descrição para salvar as tarefas no histórico do Git:`, defaultMsg);
  if (msg === null) return;

  try {
    const res = await fetch('/api/git/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Alterações salvas com sucesso no histórico do Git!', 'success');
      appendLog(`Git commit realizado: "${msg}"`);
      fetchGitInfo();
      fetchFeatures();
    } else {
      showToast(data.error || 'Nenhuma alteração pendente para salvar', 'warning');
    }
  } catch (err) {
    showToast('Erro ao salvar alterações no Git', 'error');
  }
}

if (btnCommitOpenspec) {
  btnCommitOpenspec.addEventListener('click', commitOpenSpecChanges);
}

function setConnectionStatus(online) {
  const dot = document.getElementById('server-status-dot');
  const text = document.getElementById('server-status-text');
  if (online) {
    dot.style.background = 'var(--accent-emerald)';
    dot.style.boxShadow = '0 0 8px var(--accent-emerald)';
    text.textContent = 'Servidor Ativo • Sincronizado com OpenSpec';
  } else {
    dot.style.background = 'var(--accent-gold)';
    dot.style.boxShadow = '0 0 8px var(--accent-gold)';
    text.textContent = 'Modo Gerador de Comandos Offline';
  }
}

function updateFeatureSelect(features) {
  const currentVal = selectFeatureTask.value;
  selectFeatureTask.innerHTML = '';
  features.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.name;
    opt.textContent = `${f.name} (${f.progress}% concluído)`;
    selectFeatureTask.appendChild(opt);
  });
  if (currentVal && features.some(f => f.name === currentVal)) {
    selectFeatureTask.value = currentVal;
  }
}

function updateStats(features) {
  statTotalFeatures.textContent = features.length;
  let totalTasks = 0;
  let doneTasks = 0;
  features.forEach(f => {
    totalTasks += f.totalTasks;
    doneTasks += f.doneTasks;
  });
  statTotalTasks.textContent = totalTasks;
  statDoneTasks.textContent = doneTasks;
}

// Render Kanban Cards
function renderFeatures(features) {
  const colBacklog = document.getElementById('cards-backlog');
  const colProgress = document.getElementById('cards-progress');
  const colReview = document.getElementById('cards-review');
  const colDone = document.getElementById('cards-done');

  colBacklog.innerHTML = '';
  colProgress.innerHTML = '';
  colReview.innerHTML = '';
  colDone.innerHTML = '';

  let countBacklog = 0, countProgress = 0, countReview = 0, countDone = 0;

  features.forEach(feature => {
    const card = createFeatureCard(feature);

    if (feature.kanbanColumn === 'Done') {
      colDone.appendChild(card);
      countDone++;
    } else if (feature.kanbanColumn === 'In Progress') {
      colProgress.appendChild(card);
      countProgress++;
    } else if (feature.kanbanColumn === 'Ready') {
      colReview.appendChild(card);
      countReview++;
    } else {
      colBacklog.appendChild(card);
      countBacklog++;
    }
  });

  document.getElementById('count-backlog').textContent = countBacklog;
  document.getElementById('count-progress').textContent = countProgress;
  document.getElementById('count-review').textContent = countReview;
  document.getElementById('count-done').textContent = countDone;
}

function createFeatureCard(feature) {
  const card = document.createElement('div');
  card.className = 'feature-card';

  const tagClass = feature.kanbanColumn === 'Done' ? 'tag-done' :
                   feature.kanbanColumn === 'In Progress' ? 'tag-progress' : 'tag-backlog';

  const modifiedBadge = feature.isModifiedLocally
    ? `<span class="badge-modified-git" title="Alterações locais pendentes de commit">⚡ Modificado Local</span>`
    : '';

  const branchBadge = feature.isFromGitBranch
    ? `<span class="badge-tag" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 10px;">🌿 ${feature.branch}</span>`
    : '';

  // Task Items HTML
  const tasksHtml = feature.tasks.slice(0, 5).map(t => `
    <label class="task-item ${t.done ? 'done' : ''}">
      <input type="checkbox" ${t.done ? 'checked' : ''} ${feature.isFromGitBranch ? 'disabled title="Modo Histórico da branch (somente leitura)"' : ''} data-feature="${feature.name}" data-task-id="${t.id}" class="task-checkbox">
      <span><strong>${t.id ? '**' + t.id + '**' : ''}</strong> ${t.text}</span>
    </label>
  `).join('');

  card.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 6px; flex-wrap: wrap;">
      <span class="card-tag ${tagClass}">${feature.kanbanColumn}</span>
      <div style="display: flex; gap: 4px; align-items: center;">
        ${modifiedBadge}
        ${branchBadge}
      </div>
    </div>
    <h3 class="card-title">${feature.name}</h3>
    <div class="progress-container">
      <div class="progress-header">
        <span>Progresso (${feature.doneTasks}/${feature.totalTasks})</span>
        <span>${feature.progress}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${feature.progress}%;"></div>
      </div>
    </div>
    <div class="card-tasks">
      ${tasksHtml}
      ${feature.tasks.length > 5 ? `<span style="font-size: 11px; color: var(--text-dim);">+ ${feature.tasks.length - 5} tarefas...</span>` : ''}
    </div>
  `;

  // Select feature on card click
  card.addEventListener('click', (e) => {
    if (e.target.tagName !== 'INPUT') {
      selectFeatureTask.value = feature.name;
      inputIdeaId.value = feature.name;
      updateCommandPreview();
    }
  });

  // Task Checkbox Toggle
  card.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.addEventListener('change', async (e) => {
      const featName = e.target.getAttribute('data-feature');
      const tId = e.target.getAttribute('data-task-id');
      const isDone = e.target.checked;
      await updateTaskStatusDirect(featName, tId, isDone);
    });
  });

  return card;
}

// Action: Update Task Status Directly
async function updateTaskStatusDirect(feature, taskId, done) {
  try {
    const res = await fetch('/api/tasks/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature,
        taskId,
        done,
        status: done ? 'Concluído' : 'Em Andamento',
        assignee: inputTaskAssignee.value.trim() || 'Equipe'
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      if (data.command) updateCommandPreview(data.command);
      fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao atualizar tarefa', 'error');
    }
  } catch (err) {
    showToast('Não foi possível conectar ao servidor local', 'error');
  }
}

// -------------------------------------------------------------
// Action Handlers for PDF Commands (Buttons)
// -------------------------------------------------------------

// 1. Criar Tarefa: agent criar openspec/changes/<id>/tasks.md "**2.1** Implementar BackEnd"
document.getElementById('btn-action-create-task').addEventListener('click', async () => {
  const feature = selectFeatureTask.value;
  const taskId = inputTaskId.value.trim();
  const text = inputTaskText.value.trim() || 'Nova tarefa';
  const cmd = `agent criar openspec/changes/${feature}/tasks.md "**${taskId}** ${text}"`;
  updateCommandPreview(cmd);

  try {
    const res = await fetch('/api/tasks/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature, taskId, text })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      fetchFeatures();
    }
  } catch {
    showToast('Comando pronto para copiar pro Chat!', 'success');
  }
});

// 2. Atualizar Tarefa: agent atualizar "**2.1**" "Concluído" "João"
document.getElementById('btn-action-update-task').addEventListener('click', async () => {
  const feature = selectFeatureTask.value;
  const taskId = inputTaskId.value.trim() || '2.1';
  const status = selectTaskStatus.value;
  const assignee = inputTaskAssignee.value.trim() || 'Marcos';
  const cmd = `agent atualizar "**${taskId}**" "${status}" "${assignee}"`;
  updateCommandPreview(cmd);

  await updateTaskStatusDirect(feature, taskId, status === 'Concluído');
});

// 3. Atribuir Tarefa: agent atribuir "**2.1**" "Equipe de Backend"
document.getElementById('btn-action-assign-task').addEventListener('click', () => {
  const taskId = inputTaskId.value.trim() || '2.1';
  const assignee = inputTaskAssignee.value.trim() || 'Equipe de Backend';
  const cmd = `agent atribuir "**${taskId}**" "${assignee}"`;
  updateCommandPreview(cmd);
  appendLog(`Atribuindo tarefa: ${cmd}`);
  showToast('Comando de atribuição gerado!', 'success');
});

// 4. Listar Tarefas: agent listar openspec/changes/*/tasks.md
document.getElementById('btn-action-list-tasks').addEventListener('click', () => {
  const feature = selectFeatureTask.value || '*';
  const cmd = `agent listar openspec/changes/${feature}/tasks.md`;
  updateCommandPreview(cmd);
  fetchFeatures();
  showToast('Tarefas atualizadas no quadro!', 'success');
});

// 5. Nova Feature Completa: agent criar openspec/changes/<id>/proposal.md "# Feature: ..."
document.getElementById('btn-action-new-feature').addEventListener('click', async () => {
  const featureId = inputIdeaId.value.trim();
  const title = inputIdeaTitle.value.trim() || featureId;
  if (!featureId) {
    showToast('Por favor, informe o ID da nova feature', 'error');
    return;
  }

  const cmd = `agent criar openspec/changes/${featureId}/proposal.md "# Feature: ${title}"`;
  updateCommandPreview(cmd);

  try {
    const res = await fetch('/api/features/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureId, title, summary: `Feature: ${title}`, tasks: ['Planejamento', 'Implementação'] })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      fetchFeatures();
    } else {
      showToast(data.error, 'error');
    }
  } catch {
    showToast('Comando pronto para colar no Chat!', 'success');
  }
});

// 6. Validar Ideia: agent validar ideia "sistema-ouro"
document.getElementById('btn-action-validate-idea').addEventListener('click', async () => {
  const ideaId = inputIdeaId.value.trim() || selectFeatureTask.value;
  const cmd = `agent validar ideia "${ideaId}"`;
  updateCommandPreview(cmd);

  try {
    const res = await fetch('/api/features/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: ideaId, action: 'validate' })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      fetchFeatures();
    }
  } catch {
    showToast('Comando de validação gerado!', 'success');
  }
});

// 7. Aprovar Ideia: agent aprovar ideia "sistema-ouro" "dev-team"
document.getElementById('btn-action-approve-idea').addEventListener('click', async () => {
  const ideaId = inputIdeaId.value.trim() || selectFeatureTask.value;
  const team = inputIdeaTeam.value.trim() || 'dev-team';
  const cmd = `agent aprovar ideia "${ideaId}" "${team}"`;
  updateCommandPreview(cmd);

  try {
    const res = await fetch('/api/features/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: ideaId, action: 'approve', assignee: team })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      fetchFeatures();
    }
  } catch {
    showToast('Comando de aprovação gerado!', 'success');
  }
});

// 8. Rejeitar Ideia: agent rejeitar ideia "sistema-ouro" "Sem valor"
document.getElementById('btn-action-reject-idea').addEventListener('click', async () => {
  const ideaId = inputIdeaId.value.trim() || selectFeatureTask.value;
  const reason = inputIdeaReason.value.trim() || 'Sem valor';
  const cmd = `agent rejeitar ideia "${ideaId}" "${reason}"`;
  updateCommandPreview(cmd);

  try {
    const res = await fetch('/api/features/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: ideaId, action: 'reject', reason })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      fetchFeatures();
    }
  } catch {
    showToast('Comando de rejeição gerado!', 'success');
  }
});

// Run script helper
async function runScriptAPI(scriptName) {
  showToast(`Executando ${scriptName}...`, 'success');
  appendLog(`Iniciando npm.cmd run ${scriptName}...`);
  try {
    const res = await fetch('/api/scripts/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: scriptName })
    });
    const data = await res.json();
    appendLog(data.output || 'Concluído.');
    showToast(`Script ${scriptName} concluído!`, 'success');
    fetchFeatures();
  } catch (err) {
    appendLog(`Erro ao executar: ${err.message}`);
    showToast(`Falha ao executar ${scriptName}`, 'error');
  }
}

// Kanban automation script buttons
document.getElementById('btn-script-sync').addEventListener('click', () => runScriptAPI('sync'));
document.getElementById('btn-sync-top').addEventListener('click', () => runScriptAPI('sync'));
document.getElementById('btn-script-dashboard').addEventListener('click', () => runScriptAPI('dashboard'));
document.getElementById('btn-script-verify').addEventListener('click', () => runScriptAPI('verify'));
document.getElementById('btn-script-status').addEventListener('click', () => runScriptAPI('status'));
document.getElementById('btn-refresh').addEventListener('click', () => {
  fetchFeatures();
  showToast('Quadro atualizado!', 'success');
});

// Execute Local Button
document.getElementById('btn-execute-local').addEventListener('click', () => {
  if (activeTab === 'tasks') {
    document.getElementById('btn-action-update-task').click();
  } else if (activeTab === 'ideas') {
    document.getElementById('btn-action-validate-idea').click();
  } else {
    runScriptAPI('sync');
  }
});

// -------------------------------------------------------------
// Settings Modal: GitHub & PostgreSQL Management
// -------------------------------------------------------------
const modalSettings = document.getElementById('modal-settings');
const btnOpenSettings = document.getElementById('btn-open-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnModalCancel = document.getElementById('btn-modal-cancel');

// Modal Tabs
document.querySelectorAll('.modal-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const targetId = btn.getAttribute('data-target');
    document.querySelectorAll('.modal-view-section').forEach(sec => {
      sec.style.display = 'none';
    });
    const targetEl = document.getElementById(targetId);
    if (targetEl) targetEl.style.display = 'block';
  });
});

// GitHub Elements
const btnToggleEye = document.getElementById('btn-toggle-token-eye');
const inputGithubToken = document.getElementById('input-github-token');
const inputConfigRepo = document.getElementById('input-config-repo');
const inputConfigBranch = document.getElementById('input-config-branch');
const inputConfigProjectId = document.getElementById('input-config-project-id');
const inputConfigAssignee = document.getElementById('input-config-assignee');
const btnTestToken = document.getElementById('btn-test-token');
const tokenStatusDot = document.getElementById('token-status-dot');
const githubUserPreview = document.getElementById('github-user-preview');
const githubAvatarImg = document.getElementById('github-avatar-img');
const githubUserName = document.getElementById('github-user-name');
const githubUserLogin = document.getElementById('github-user-login');

// Database Elements
const inputDbHost = document.getElementById('input-db-host');
const inputDbPort = document.getElementById('input-db-port');
const inputDbUser = document.getElementById('input-db-user');
const inputDbDatabase = document.getElementById('input-db-database');
const inputDbPassword = document.getElementById('input-db-password');
const btnToggleDbEye = document.getElementById('btn-toggle-dbpass-eye');
const dbStatusBanner = document.getElementById('db-status-banner');
const modalDbStatusDot = document.getElementById('modal-db-status-dot');
const dbStatusTitleText = document.getElementById('db-status-title-text');
const dbStatusDescText = document.getElementById('db-status-desc-text');
const dbStatusPill = document.getElementById('db-status-pill');
const dbStatusDot = document.getElementById('db-status-dot');
const btnTestDb = document.getElementById('btn-test-db');
const btnInitDb = document.getElementById('btn-init-db');
const btnSyncDb = document.getElementById('btn-sync-db');

const btnSaveSettings = document.getElementById('btn-save-settings');

// Open / Close Modal
btnOpenSettings.addEventListener('click', () => {
  modalSettings.classList.add('open');
  checkDatabaseStatus();
});

function closeModal() {
  modalSettings.classList.remove('open');
}

btnCloseSettings.addEventListener('click', closeModal);
if (btnModalCancel) btnModalCancel.addEventListener('click', closeModal);

modalSettings.addEventListener('click', (e) => {
  if (e.target === modalSettings) closeModal();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalSettings.classList.contains('open')) closeModal();
});

// Toggle Token Visibility
btnToggleEye.addEventListener('click', () => {
  const isPass = inputGithubToken.type === 'password';
  inputGithubToken.type = isPass ? 'text' : 'password';
  btnToggleEye.textContent = isPass ? '🙈' : '👁️';
});

// Toggle DB Password Visibility
if (btnToggleDbEye && inputDbPassword) {
  btnToggleDbEye.addEventListener('click', () => {
    const isPass = inputDbPassword.type === 'password';
    inputDbPassword.type = isPass ? 'text' : 'password';
    btnToggleDbEye.textContent = isPass ? '🙈' : '👁️';
  });
}

// Check Database Status
async function checkDatabaseStatus() {
  try {
    const res = await fetch('/api/database/status');
    if (!res.ok) throw new Error('Status offline');
    const data = await res.json();

    if (data.connected) {
      if (dbStatusDot) {
        dbStatusDot.style.background = 'var(--accent-emerald)';
        dbStatusDot.style.boxShadow = '0 0 6px var(--accent-emerald)';
      }
      if (modalDbStatusDot) {
        modalDbStatusDot.style.background = 'var(--accent-emerald)';
        modalDbStatusDot.style.boxShadow = '0 0 8px var(--accent-emerald)';
      }
      if (dbStatusBanner) dbStatusBanner.className = 'db-status-banner connected';
      if (dbStatusTitleText) dbStatusTitleText.textContent = `PostgreSQL: Conectado (${data.database})`;
      if (dbStatusDescText) dbStatusDescText.textContent = `Sincronização tri-direcional ativa em ${data.host}:${data.port}`;
      if (dbStatusPill) {
        dbStatusPill.className = 'db-status-pill online';
        dbStatusPill.textContent = 'Online';
      }
    } else {
      if (dbStatusDot) {
        dbStatusDot.style.background = '#64748b';
        dbStatusDot.style.boxShadow = 'none';
      }
      if (modalDbStatusDot) {
        modalDbStatusDot.style.background = 'var(--accent-gold)';
        modalDbStatusDot.style.boxShadow = '0 0 8px var(--accent-gold)';
      }
      if (dbStatusBanner) dbStatusBanner.className = 'db-status-banner disconnected';
      if (dbStatusTitleText) dbStatusTitleText.textContent = 'PostgreSQL: Desconectado / Offline';
      if (dbStatusDescText) {
        const hint = data.error ? ` (${data.error})` : '';
        dbStatusDescText.textContent = `Modo híbrido ativo: persistindo no OpenSpec local${hint}.`;
      }
      if (dbStatusPill) {
        dbStatusPill.className = 'db-status-pill offline';
        dbStatusPill.textContent = 'Offline';
      }
    }
  } catch (err) {
    if (dbStatusDot) {
      dbStatusDot.style.background = '#64748b';
      dbStatusDot.style.boxShadow = 'none';
    }
  }
}

// Load Config
async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.config) {
      const cfg = data.config;
      if (cfg.repo) inputConfigRepo.value = cfg.repo;
      if (cfg.branch) inputConfigBranch.value = cfg.branch;
      if (cfg.projectId) inputConfigProjectId.value = cfg.projectId;
      if (cfg.assignee) inputConfigAssignee.value = cfg.assignee;

      if (cfg.hasToken) {
        tokenStatusDot.style.background = 'var(--accent-emerald)';
        tokenStatusDot.style.boxShadow = '0 0 6px var(--accent-emerald)';
        inputGithubToken.placeholder = cfg.tokenMasked || 'Token configurado';
      } else {
        tokenStatusDot.style.background = '#64748b';
        tokenStatusDot.style.boxShadow = 'none';
      }

      if (cfg.database) {
        if (cfg.database.host && inputDbHost) inputDbHost.value = cfg.database.host;
        if (cfg.database.port && inputDbPort) inputDbPort.value = cfg.database.port;
        if (cfg.database.user && inputDbUser) inputDbUser.value = cfg.database.user;
        if (cfg.database.database && inputDbDatabase) inputDbDatabase.value = cfg.database.database;
        if (cfg.database.hasPassword && inputDbPassword) {
          inputDbPassword.placeholder = '•••••••• (configurada)';
        }
      }
    }
  } catch (err) {
    // Offline mode: load from localStorage
    const savedToken = localStorage.getItem('fowlgen_gh_token');
    if (savedToken) {
      inputGithubToken.value = savedToken;
      tokenStatusDot.style.background = 'var(--accent-emerald)';
    }
  } finally {
    checkDatabaseStatus();
  }
}

// Test GitHub Token
btnTestToken.addEventListener('click', async () => {
  const token = inputGithubToken.value.trim();
  btnTestToken.disabled = true;
  btnTestToken.textContent = 'Testando...';

  try {
    const res = await fetch('/api/config/test-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await res.json();

    if (data.success && data.user) {
      githubUserPreview.style.display = 'flex';
      githubAvatarImg.src = data.user.avatar_url;
      githubUserName.textContent = data.user.name;
      githubUserLogin.textContent = `@${data.user.login} • Conectado com sucesso`;
      tokenStatusDot.style.background = 'var(--accent-emerald)';
      tokenStatusDot.style.boxShadow = '0 0 8px var(--accent-emerald)';
      showToast(`Conectado ao GitHub como @${data.user.login}!`, 'success');
      appendLog(`GitHub Token verificado: @${data.user.login}`);
    } else {
      githubUserPreview.style.display = 'none';
      showToast(data.error || 'Token inválido', 'error');
      appendLog(`Erro ao testar token: ${data.error || 'Token inválido'}`);
    }
  } catch (err) {
    showToast('Não foi possível conectar à API de teste', 'error');
  } finally {
    btnTestToken.disabled = false;
    btnTestToken.textContent = '🧪 Testar Conexão GitHub';
  }
});

// Test PostgreSQL Connection
if (btnTestDb) {
  btnTestDb.addEventListener('click', async () => {
    btnTestDb.disabled = true;
    btnTestDb.textContent = 'Testando...';

    try {
      const res = await fetch('/api/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: inputDbHost.value.trim(),
          port: inputDbPort.value.trim(),
          user: inputDbUser.value.trim(),
          password: inputDbPassword.value,
          database: inputDbDatabase.value.trim()
        })
      });
      const data = await res.json();

      if (data.connected) {
        showToast(`Conectado ao PostgreSQL com sucesso (${data.database})!`, 'success');
        appendLog(`Conexão PostgreSQL OK: banco '${data.database}'.`);
      } else {
        showToast(`Falha na conexão: ${data.error || 'PostgreSQL não alcançado'}`, 'error');
        appendLog(`PostgreSQL offline ou erro de credenciais: ${data.error}`);
      }
      checkDatabaseStatus();
    } catch (err) {
      showToast('Erro ao contatar API de teste do banco', 'error');
    } finally {
      btnTestDb.disabled = false;
      btnTestDb.textContent = '🧪 Testar Conexão';
    }
  });
}

// Init Database & Schema
if (btnInitDb) {
  btnInitDb.addEventListener('click', async () => {
    btnInitDb.disabled = true;
    btnInitDb.textContent = 'Inicializando...';

    try {
      const res = await fetch('/api/database/init', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        showToast(data.message, 'success');
        appendLog(`Schema do PostgreSQL inicializado com sucesso.`);
        checkDatabaseStatus();
      } else {
        showToast(data.error || 'Falha ao inicializar schema', 'error');
        appendLog(`Erro ao criar schema: ${data.error}`);
      }
    } catch (err) {
      showToast('Erro na requisição para criar banco', 'error');
    } finally {
      btnInitDb.disabled = false;
      btnInitDb.textContent = '⚡ Criar Schema';
    }
  });
}

// Sync Database OpenSpec <-> Postgres
if (btnSyncDb) {
  btnSyncDb.addEventListener('click', async () => {
    btnSyncDb.disabled = true;
    btnSyncDb.textContent = 'Sincronizando...';

    try {
      const res = await fetch('/api/database/sync', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        showToast(data.message, 'success');
        appendLog(data.message);
        fetchFeatures();
      } else {
        showToast(data.error || 'Erro na sincronização', 'error');
        appendLog(`Erro sync: ${data.error}`);
      }
    } catch (err) {
      showToast('Erro ao disparar sincronização com banco', 'error');
    } finally {
      btnSyncDb.disabled = false;
      btnSyncDb.textContent = '🔄 Sync OpenSpec';
    }
  });
}

// Save Settings (GitHub + Database)
btnSaveSettings.addEventListener('click', async () => {
  const token = inputGithubToken.value.trim();
  const repo = inputConfigRepo.value.trim();
  const branch = inputConfigBranch.value.trim();
  const projectId = inputConfigProjectId.value.trim();
  const assignee = inputConfigAssignee.value.trim();

  const dbHost = inputDbHost ? inputDbHost.value.trim() : '';
  const dbPort = inputDbPort ? inputDbPort.value.trim() : '';
  const dbUser = inputDbUser ? inputDbUser.value.trim() : '';
  const dbPassword = inputDbPassword ? inputDbPassword.value : '';
  const dbDatabase = inputDbDatabase ? inputDbDatabase.value.trim() : '';

  if (token) localStorage.setItem('fowlgen_gh_token', token);
  if (repo) localStorage.setItem('fowlgen_gh_repo', repo);

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        repo,
        projectId,
        assignee,
        dbHost,
        dbPort,
        dbUser,
        dbPassword,
        dbDatabase
      })
    });
    const data = await res.json();

    if (data.success) {
      showToast('Configurações salvas com sucesso!', 'success');
      appendLog('Configurações de GitHub e Banco PostgreSQL gravadas.');
      closeModal();
      loadConfig();
    } else {
      showToast('Erro ao salvar configurações', 'error');
    }
  } catch {
    showToast('Salvo localmente no navegador (Modo Offline)!', 'success');
    closeModal();
  }
});

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
  fetchGitInfo();
  fetchFeatures();
  loadConfig();
  updateCommandPreview();
});


