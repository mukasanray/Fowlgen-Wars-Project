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

// Board View State: 'tasks' (Tarefas da Sprint) vs 'ideas' (Funil de Ideias)
let currentBoardView = 'tasks';
let currentAssigneeFilter = 'all';

const btnViewTasks = document.getElementById('btn-view-tasks');
const btnViewIdeas = document.getElementById('btn-view-ideas');
const badgeTotalTasksView = document.getElementById('badge-total-tasks-view');
const badgeTotalIdeasView = document.getElementById('badge-total-ideas-view');
const colTitle1 = document.getElementById('col-title-1');
const colTitle2 = document.getElementById('col-title-2');
const colTitle3 = document.getElementById('col-title-3');
const colTitle4 = document.getElementById('col-title-4');

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
      updateDeveloperIdentity(data);
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

// Board View Switcher (Tarefas da Sprint vs Funil de Ideias)
function setBoardView(view) {
  currentBoardView = view;
  if (view === 'tasks') {
    btnViewTasks?.classList.add('active');
    btnViewIdeas?.classList.remove('active');
    if (colTitle1) colTitle1.innerHTML = '📋 A Fazer';
    if (colTitle2) colTitle2.innerHTML = '⚡ Em Progresso';
    if (colTitle3) colTitle3.innerHTML = '👀 Em Revisão';
    if (colTitle4) colTitle4.innerHTML = '✅ Concluído';
  } else {
    btnViewIdeas?.classList.add('active');
    btnViewTasks?.classList.remove('active');
    if (colTitle1) colTitle1.innerHTML = '💡 Novas Ideias';
    if (colTitle2) colTitle2.innerHTML = '🔍 Em Validação';
    if (colTitle3) colTitle3.innerHTML = '✅ Aprovadas';
    if (colTitle4) colTitle4.innerHTML = '❌ Rejeitadas';
  }
  renderFeatures(currentFeatures);
}

btnViewTasks?.addEventListener('click', () => setBoardView('tasks'));
btnViewIdeas?.addEventListener('click', () => setBoardView('ideas'));

// Member Filter Handler
function setMemberFilter(assignee) {
  currentAssigneeFilter = assignee;
  document.querySelectorAll('.member-pill').forEach(pill => {
    if (pill.getAttribute('data-assignee') === assignee) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
  renderFeatures(currentFeatures);
}

document.querySelectorAll('.member-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    setMemberFilter(pill.getAttribute('data-assignee') || 'all');
  });
});

// Render Kanban Cards (Sprint Tasks or Ideas Funnel)
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

  // Atualiza os badges de contagem do alternador de visão
  const totalTasksCount = features.reduce((acc, f) => acc + (f.totalTasks || 0), 0);
  if (badgeTotalTasksView) badgeTotalTasksView.textContent = totalTasksCount;
  if (badgeTotalIdeasView) badgeTotalIdeasView.textContent = features.length;

  // Filtragem por integrante
  const filtered = features.filter(feature => {
    if (currentAssigneeFilter === 'all') return true;
    const filterLower = currentAssigneeFilter.toLowerCase();
    
    // Verifica em ideaAssignee
    if (feature.ideaAssignee && feature.ideaAssignee.toLowerCase().includes(filterLower)) return true;
    
    // Verifica na lista de assignees da feature
    if (feature.assignees && feature.assignees.some(a => a.toLowerCase().includes(filterLower))) return true;
    
    // Verifica nas tarefas individuais
    if (feature.tasks && feature.tasks.some(t => {
      const text = (t.text || '').toLowerCase();
      const raw = (t.raw || '').toLowerCase();
      const assignee = (t.assignee || '').toLowerCase();
      return text.includes(filterLower) || raw.includes(filterLower) || assignee.includes(filterLower);
    })) return true;

    return false;
  });

  if (currentBoardView === 'tasks') {
    // -----------------------------------------------------------------
    // VISÃO DE TAREFAS TÉCNICAS (Sprint)
    // -----------------------------------------------------------------
    filtered.forEach(feature => {
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
  } else {
    // -----------------------------------------------------------------
    // VISÃO DE FUNIL DE IDEIAS (Game Design & Propostas)
    // -----------------------------------------------------------------
    filtered.forEach(feature => {
      const card = createIdeaCard(feature);

      const ideaCol = feature.ideaColumn || feature.ideaStatus || 'Criado';
      if (ideaCol === 'Aprovado') {
        colReview.appendChild(card); // Coluna 3: Aprovadas
        countReview++;
      } else if (ideaCol === 'Validado') {
        colProgress.appendChild(card); // Coluna 2: Em Validação
        countProgress++;
      } else if (ideaCol === 'Rejeitado') {
        colDone.appendChild(card); // Coluna 4: Rejeitadas
        countDone++;
      } else {
        colBacklog.appendChild(card); // Coluna 1: Novas Ideias
        countBacklog++;
      }
    });
  }

  document.getElementById('count-backlog').textContent = countBacklog;
  document.getElementById('count-progress').textContent = countProgress;
  document.getElementById('count-review').textContent = countReview;
  document.getElementById('count-done').textContent = countDone;
}

function createIdeaCard(feature) {
  const card = document.createElement('div');
  card.className = 'feature-card idea-card';

  const status = feature.ideaStatus || 'Criado';
  let tagClass = 'tag-created';
  let statusEmoji = '💡';
  if (status === 'Aprovado') {
    tagClass = 'tag-approved';
    statusEmoji = '✅';
  } else if (status === 'Validado') {
    tagClass = 'tag-validated';
    statusEmoji = '🔍';
  } else if (status === 'Rejeitado') {
    tagClass = 'tag-rejected';
    statusEmoji = '❌';
  }

  const assigneeBadge = `<span class="badge-tag" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); font-size: 10px;">👤 ${feature.ideaAssignee || 'dev-team'}</span>`;

  const modifiedBadge = feature.isModifiedLocally
    ? `<span class="badge-modified-git" title="Alterações locais pendentes de salvar">⚡ Modificado</span>`
    : '';

  // Quick Action Buttons for the Idea
  let actionButtonsHtml = '';
  if (status === 'Criado') {
    actionButtonsHtml = `
      <div class="idea-actions-row">
        <button type="button" class="btn-idea-action btn-val" title="Marcar como validado tecnicamente">🔍 Validar</button>
        <button type="button" class="btn-idea-action btn-app" title="Aprovar para desenvolvimento">✅ Aprovar</button>
        <button type="button" class="btn-idea-action btn-rej" title="Rejeitar proposta">❌ Rejeitar</button>
      </div>
    `;
  } else if (status === 'Validado') {
    actionButtonsHtml = `
      <div class="idea-actions-row">
        <button type="button" class="btn-idea-action btn-app" title="Aprovar para desenvolvimento">✅ Aprovar para Sprint</button>
        <button type="button" class="btn-idea-action btn-rej" title="Rejeitar proposta">❌ Rejeitar</button>
      </div>
    `;
  } else if (status === 'Aprovado') {
    actionButtonsHtml = `
      <div class="idea-actions-row">
        <button type="button" class="btn-idea-action btn-goto-tasks" style="color: #34d399;" title="Ver tarefas no quadro de sprint">🎯 Ver Tarefas (${feature.totalTasks})</button>
        <button type="button" class="btn-idea-action btn-reset" title="Voltar para análise">↺ Reabrir</button>
      </div>
    `;
  } else if (status === 'Rejeitado') {
    actionButtonsHtml = `
      <div class="idea-actions-row">
        <button type="button" class="btn-idea-action btn-reset" title="Reconsiderar ideia">↺ Reconsiderar</button>
      </div>
    `;
  }

  const title = feature.title || feature.name;
  const summary = feature.summary || 'Proposta de feature para Fowlgen Wars.';

  card.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 6px; flex-wrap: wrap;">
      <span class="card-tag ${tagClass}">${statusEmoji} ${status}</span>
      <div style="display: flex; gap: 4px; align-items: center;">
        ${assigneeBadge}
        ${modifiedBadge}
      </div>
    </div>
    <h3 class="card-title" style="margin-bottom: 4px;">${title}</h3>
    <div style="font-size: 11px; color: var(--text-dim); margin-bottom: 8px; font-family: var(--font-mono);">📁 ${feature.name}</div>
    <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin-bottom: 10px;">${summary}</p>
    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
      <span>📋 ${feature.totalTasks} tarefa(s) vinculada(s)</span>
      <span>${feature.progress}% concluído</span>
    </div>
    ${actionButtonsHtml}
  `;

  // Click card to populate form inputs
  card.addEventListener('click', (e) => {
    if (!e.target.closest('button')) {
      inputIdeaId.value = feature.name;
      inputIdeaTitle.value = feature.title || feature.name;
      selectFeatureTask.value = feature.name;
      updateCommandPreview();
    }
  });

  // Action button clicks
  card.querySelector('.btn-val')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    await triggerIdeaAction(feature.name, 'validate');
  });

  card.querySelector('.btn-app')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const assignee = currentAssigneeFilter !== 'all' ? currentAssigneeFilter : (feature.ideaAssignee || 'dev-team');
    await triggerIdeaAction(feature.name, 'approve', assignee);
  });

  card.querySelector('.btn-rej')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const reason = prompt(`Motivo da rejeição da ideia "${feature.name}":`, 'Fora do escopo da sprint atual');
    if (reason !== null) {
      await triggerIdeaAction(feature.name, 'reject', undefined, reason);
    }
  });

  card.querySelector('.btn-reset')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    await triggerIdeaAction(feature.name, 'reset');
  });

  card.querySelector('.btn-goto-tasks')?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectFeatureTask.value = feature.name;
    setBoardView('tasks');
    showToast(`Visualizando tarefas da feature "${feature.name}"!`, 'info');
  });

  return card;
}

async function triggerIdeaAction(featureName, action, assignee, reason) {
  try {
    const res = await fetch('/api/features/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: featureName, action, assignee, reason })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      fetchFeatures();
      fetchGitInfo();
    } else {
      showToast(data.error || 'Erro ao processar ideia', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao processar ideia', 'error');
  }
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

  const assigneesHtml = feature.assignees && feature.assignees.length > 0
    ? feature.assignees.map(a => `<span class="badge-tag" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 10px;">👤 ${a}</span>`).join(' ')
    : `<span class="badge-tag" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; font-size: 10px;">👥 dev-team</span>`;

  // Task Items HTML
  const tasksHtml = feature.tasks.slice(0, 5).map(t => {
    const cleanText = t.text.replace(/\(([^)]+)\)|@([\w-]+)|\[([\w-]+)\]/g, '').trim();
    return `
    <label class="task-item ${t.done ? 'done' : ''}">
      <input type="checkbox" ${t.done ? 'checked' : ''} ${feature.isFromGitBranch ? 'disabled title="Modo Histórico da branch (somente leitura)"' : ''} data-feature="${feature.name}" data-task-id="${t.id}" class="task-checkbox">
      <span><strong>${t.id ? '**' + t.id + '**' : ''}</strong> ${cleanText || t.text}</span>
      ${t.assignee ? `<span style="font-size: 10px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.25); padding: 1px 6px; border-radius: 10px; margin-left: 6px; white-space: nowrap;">👤 ${t.assignee}</span>` : ''}
    </label>
    `;
  }).join('');

  card.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 6px; flex-wrap: wrap;">
      <span class="card-tag ${tagClass}">${feature.kanbanColumn}</span>
      <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
        ${assigneesHtml}
        ${modifiedBadge}
        ${branchBadge}
      </div>
    </div>
    <h3 class="card-title">${feature.title || feature.name}</h3>
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

// 4.5. Gerar Proposta e Tarefas com IA Local
document.getElementById('btn-action-generate-ai')?.addEventListener('click', async () => {
  const featureId = inputIdeaId.value.trim();
  const title = inputIdeaTitle.value.trim() || featureId;
  if (!featureId) {
    showToast('Informe o ID ou nome da feature para gerar com IA (ex: sistema-ranking)', 'warning');
    inputIdeaId.focus();
    return;
  }

  showToast('🪄 IA Local analisando e gerando proposta...', 'info');
  appendLog(`Gerando proposta e checklist com IA Local para "${featureId}"...`);

  try {
    const res = await fetch('/api/features/ai-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureId, title })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      updateCommandPreview(data.command);
      fetchFeatures();
      fetchGitInfo();
    } else {
      showToast(data.error || 'Erro ao gerar feature com IA', 'error');
    }
  } catch (err) {
    showToast('Erro ao comunicar com gerador local', 'error');
  }
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

const btnSaveSettings = document.getElementById('btn-save-settings');

// Open / Close Modal
btnOpenSettings.addEventListener('click', () => {
  modalSettings.classList.add('open');
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
    }
  } catch (err) {
    // Offline mode: load from localStorage
    const savedToken = localStorage.getItem('fowlgen_gh_token');
    if (savedToken) {
      inputGithubToken.value = savedToken;
      tokenStatusDot.style.background = 'var(--accent-emerald)';
    }
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

// Save Settings (GitHub & Projects)
btnSaveSettings.addEventListener('click', async () => {
  const token = inputGithubToken.value.trim();
  const repo = inputConfigRepo.value.trim();
  const branch = inputConfigBranch.value.trim();
  const projectId = inputConfigProjectId.value.trim();
  const assignee = inputConfigAssignee.value.trim();

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
        assignee
      })
    });
    const data = await res.json();

    if (data.success) {
      showToast('Configurações salvas com sucesso!', 'success');
      appendLog('Configurações de GitHub salvas com sucesso.');
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

// -------------------------------------------------------------
// Team Members & Developer Identity Management (100% Git-Native & Privacy-First)
// -------------------------------------------------------------
let teamMembers = [];
let memberSearchQuery = '';
let detectedDevMember = null;
let gitUserLocal = { name: '', email: '' };
let isGitNoticeDismissed = false;

const memberFilterPillsContainer = document.getElementById('member-filter-pills');
const inputSearchMembers = document.getElementById('input-search-members');
const btnQuickManageMembers = document.getElementById('btn-quick-manage-members');

// Developer Profile Chip Elements
const developerProfileChip = document.getElementById('developer-profile-chip');
const devChipAvatar = document.getElementById('dev-chip-avatar');
const devChipName = document.getElementById('dev-chip-name');
const btnMySpace = document.getElementById('btn-my-space');

// Git Notice Banner Elements (Privacidade Total)
const gitUserNoticeBanner = document.getElementById('git-user-notice-banner');
const gitUserNoticeDesc = document.getElementById('git-user-notice-desc');
const gitUserCmdCopy = document.getElementById('git-user-cmd-copy');
const btnCopyGitCmd = document.getElementById('btn-copy-git-cmd');
const selectQuickGitMember = document.getElementById('select-quick-git-member');
const btnQuickLinkGit = document.getElementById('btn-quick-link-git');
const btnDismissGitNotice = document.getElementById('btn-dismiss-git-notice');

// Git Modal Diagnostic Elements
const gitIdentityStatusBadge = document.getElementById('git-identity-status-badge');
const selectModalGitMember = document.getElementById('select-modal-git-member');
const inputGitUserName = document.getElementById('input-git-user-name');
const btnApplyGitConfig = document.getElementById('btn-apply-git-config');
const gitConfigFeedback = document.getElementById('git-config-feedback');

// Member Form Inputs (Sem e-mail pessoal - 100% Privado)
const inputMemberEditId = document.getElementById('input-member-edit-id');
const memberFormTitle = document.getElementById('member-form-title');
const btnCancelEditMember = document.getElementById('btn-cancel-edit-member');
const inputMemberName = document.getElementById('input-member-name');
const inputMemberRole = document.getElementById('input-member-role');
const inputMemberGithub = document.getElementById('input-member-github');
const inputMemberAvatar = document.getElementById('input-member-avatar');
const inputMemberColor = document.getElementById('input-member-color');
const btnSaveMember = document.getElementById('btn-save-member');
const membersListCards = document.getElementById('members-list-cards');
const memberCountBadge = document.getElementById('member-count-badge');

function updateDeveloperIdentity(data) {
  if (!data) return;
  if (data.gitUser) gitUserLocal = data.gitUser;
  if (data.detectedMember !== undefined) detectedDevMember = data.detectedMember;

  // 1. Atualiza Card de Diagnóstico do Modal
  if (inputGitUserName && (gitUserLocal.name || detectedDevMember?.name)) {
    inputGitUserName.value = gitUserLocal.name || detectedDevMember?.name;
  }
  if (selectModalGitMember && detectedDevMember) {
    selectModalGitMember.value = detectedDevMember.id;
  }

  if (detectedDevMember) {
    // Desenvolvedor Reconhecido via Arquivo Local ou Git
    if (developerProfileChip) {
      developerProfileChip.style.display = 'inline-flex';
      if (devChipAvatar) devChipAvatar.textContent = detectedDevMember.avatar || '💻';
      if (devChipName) devChipName.textContent = detectedDevMember.name;
      developerProfileChip.title = `Você está conectado como ${detectedDevMember.name} (Privacidade ativa: salvo apenas localmente)`;
    }

    if (gitUserNoticeBanner) {
      gitUserNoticeBanner.style.display = 'none';
    }

    if (gitIdentityStatusBadge) {
      gitIdentityStatusBadge.textContent = `🔒 Identificado (${detectedDevMember.name})`;
      gitIdentityStatusBadge.className = 'git-identity-badge ok';
    }

    if (gitConfigFeedback) {
      gitConfigFeedback.textContent = `Vinculado a "${detectedDevMember.name}" com privacidade total (identity.local.json).`;
      gitConfigFeedback.style.color = 'var(--accent-emerald)';
    }

    // Pré-preenche o campo de responsável no formulário se estiver vazio
    if (inputTaskAssignee && (!inputTaskAssignee.value || inputTaskAssignee.value === 'Equipe')) {
      inputTaskAssignee.value = detectedDevMember.name;
    }
  } else {
    // Desenvolvedor Não Reconhecido
    if (developerProfileChip) {
      developerProfileChip.style.display = 'none';
    }

    if (gitUserNoticeBanner && !isGitNoticeDismissed) {
      gitUserNoticeBanner.style.display = 'flex';
      gitUserNoticeDesc.innerHTML = 'Identifique quem é você na equipe para filtrar suas tarefas neste computador. A identificação fica salva apenas na sua máquina e <strong>nenhum e-mail pessoal é enviado para o Git</strong>.';
    }

    if (gitIdentityStatusBadge) {
      gitIdentityStatusBadge.textContent = '🔒 Não Identificado';
      gitIdentityStatusBadge.className = 'git-identity-badge warning';
    }

    if (gitConfigFeedback) {
      gitConfigFeedback.textContent = 'Escolha quem é você na equipe e salve para vincular com privacidade.';
      gitConfigFeedback.style.color = 'var(--accent-gold)';
    }
  }

  // Atualiza texto do comando sugerido para copiar
  if (gitUserCmdCopy) {
    const defaultName = detectedDevMember?.name || gitUserLocal.name || 'Seu Nome';
    gitUserCmdCopy.textContent = `git config user.name "${defaultName}"`;
  }
}

async function fetchMembers() {
  try {
    const res = await fetch('/api/members');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.members) {
      teamMembers = data.members;
      renderMemberFilterPills();
      renderModalMembersList();
      populateQuickGitSelect();
      if (data.gitUser || data.detectedMember !== undefined) {
        updateDeveloperIdentity(data);
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar integrantes:', err);
  }
}

function populateQuickGitSelect() {
  const selects = [selectQuickGitMember, selectModalGitMember];
  selects.forEach(sel => {
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">Selecione quem é você na equipe...</option>';
    teamMembers.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.avatar || '👤'} ${m.name} (${m.role || 'Membro'})`;
      sel.appendChild(opt);
    });
    if (currentVal) sel.value = currentVal;
    else if (detectedDevMember) sel.value = detectedDevMember.id;
  });
}

function renderMemberFilterPills() {
  if (!memberFilterPillsContainer) return;
  memberFilterPillsContainer.innerHTML = '';

  // 1. Botão "Todos"
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = `member-pill ${currentAssigneeFilter === 'all' ? 'active' : ''}`;
  allBtn.setAttribute('data-assignee', 'all');
  allBtn.textContent = '👥 Todos';
  allBtn.addEventListener('click', () => setMemberFilter('all'));
  memberFilterPillsContainer.appendChild(allBtn);

  // 2. Filtra membros pelo input de busca se houver
  const filtered = teamMembers.filter(m => {
    if (!memberSearchQuery) return true;
    return m.name.toLowerCase().includes(memberSearchQuery) ||
           (m.role && m.role.toLowerCase().includes(memberSearchQuery));
  });

  filtered.forEach(m => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isAct = currentAssigneeFilter.toLowerCase() === m.id.toLowerCase() ||
                  currentAssigneeFilter.toLowerCase() === m.name.toLowerCase();
    btn.className = `member-pill ${isAct ? 'active' : ''}`;
    btn.setAttribute('data-assignee', m.name);
    btn.style.borderLeft = `3px solid ${m.color || '#38bdf8'}`;
    btn.innerHTML = `${m.avatar || '👤'} ${m.name}`;
    btn.title = `${m.name} (${m.role || 'Membro'})`;
    btn.addEventListener('click', () => setMemberFilter(m.name));
    memberFilterPillsContainer.appendChild(btn);
  });
}

function renderModalMembersList() {
  if (!membersListCards) return;
  membersListCards.innerHTML = '';
  if (memberCountBadge) memberCountBadge.textContent = teamMembers.length;

  teamMembers.forEach(m => {
    const card = document.createElement('div');
    card.className = 'member-row-card';
    card.innerHTML = `
      <div class="member-info-left">
        <div class="member-avatar-circle" style="border-color: ${m.color || '#38bdf8'}; color: ${m.color || '#38bdf8'};">
          ${m.avatar || '👤'}
        </div>
        <div>
          <div class="member-details-name">
            ${m.name}
            ${m.github ? `<span style="font-size: 11px; color: #a78bfa; background: rgba(139, 92, 246, 0.1); padding: 1px 6px; border-radius: 4px; font-weight: normal; margin-left: 6px;">🐙 @${m.github}</span>` : ''}
          </div>
          <div class="member-details-role">${m.role || 'Membro da Equipe'}</div>
        </div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button type="button" class="btn btn-secondary btn-sm btn-edit-member" style="padding: 4px 8px; font-size: 11px;" title="Alterar dados do integrante">
          ✏️ Editar
        </button>
        <button type="button" class="btn btn-danger btn-sm btn-delete-member" style="padding: 4px 8px; font-size: 11px;" title="Remover integrante">
          🗑️ Excluir
        </button>
      </div>
    `;

    card.querySelector('.btn-edit-member')?.addEventListener('click', () => {
      startEditMember(m);
    });

    card.querySelector('.btn-delete-member')?.addEventListener('click', async () => {
      if (confirm(`Deseja remover o integrante "${m.name}"?`)) {
        if (inputMemberEditId && inputMemberEditId.value === m.id) {
          cancelEditMember();
        }
        await deleteMember(m.id);
      }
    });

    membersListCards.appendChild(card);
  });
}

function startEditMember(m) {
  if (inputMemberEditId) inputMemberEditId.value = m.id;
  if (inputMemberName) inputMemberName.value = m.name;
  if (inputMemberRole) inputMemberRole.value = m.role || '';
  if (inputMemberGithub) inputMemberGithub.value = m.github || '';
  if (inputMemberAvatar) inputMemberAvatar.value = m.avatar || '👤';
  if (inputMemberColor) inputMemberColor.value = m.color || '#38bdf8';

  if (memberFormTitle) memberFormTitle.innerHTML = `✏️ Alterar Integrante (${m.name})`;
  if (btnSaveMember) btnSaveMember.innerHTML = '💾 Salvar Alterações';
  if (btnCancelEditMember) btnCancelEditMember.style.display = 'inline-block';

  inputMemberName?.focus();
}

function cancelEditMember() {
  if (inputMemberEditId) inputMemberEditId.value = '';
  if (inputMemberName) inputMemberName.value = '';
  if (inputMemberRole) inputMemberRole.value = '';
  if (inputMemberGithub) inputMemberGithub.value = '';
  if (inputMemberAvatar) inputMemberAvatar.value = '👤';
  if (inputMemberColor) inputMemberColor.value = '#38bdf8';

  if (memberFormTitle) memberFormTitle.innerHTML = '➕ Novo Integrante';
  if (btnSaveMember) btnSaveMember.innerHTML = '💾 Cadastrar Integrante';
  if (btnCancelEditMember) btnCancelEditMember.style.display = 'none';
}

async function saveOrUpdateMember() {
  const editId = inputMemberEditId?.value.trim();
  const name = inputMemberName?.value.trim();
  const role = inputMemberRole?.value.trim() || 'Membro da Equipe';
  const github = inputMemberGithub?.value.trim().replace(/^@/, '') || '';
  const avatar = inputMemberAvatar?.value || '👤';
  const color = inputMemberColor?.value || '#38bdf8';

  if (!name) {
    showToast('Informe o nome do integrante', 'warning');
    inputMemberName?.focus();
    return;
  }

  const isEditing = Boolean(editId);
  const endpoint = isEditing ? '/api/members/update' : '/api/members';
  const method = isEditing ? 'PUT' : 'POST';
  const payload = isEditing ? { id: editId, name, role, github, avatar, color } : { name, role, github, avatar, color };

  try {
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      cancelEditMember();
      fetchMembers();
      fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao salvar integrante', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao salvar integrante', 'error');
  }
}

async function deleteMember(id) {
  try {
    const res = await fetch('/api/members/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      fetchMembers();
    } else {
      showToast(data.error || 'Erro ao excluir integrante', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao excluir integrante', 'error');
  }
}

async function setLocalDeveloperIdentity(memberId, optionalName) {
  if (!memberId) {
    showToast('Selecione um integrante na lista', 'warning');
    return;
  }
  try {
    const res = await fetch('/api/git/set-local-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      if (optionalName && optionalName.trim()) {
        try {
          await fetch('/api/git/config-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: optionalName.trim() })
          });
        } catch {}
      }
      fetchGitInfo();
      fetchMembers();
    } else {
      showToast(data.error || 'Erro ao salvar identidade local', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao definir identidade local', 'error');
  }
}

// Event Listeners for Developer Identity & Git Actions
btnMySpace?.addEventListener('click', () => {
  if (detectedDevMember) {
    setMemberFilter(detectedDevMember.name);
    showToast(`🎯 Visualizando tarefas de ${detectedDevMember.name}`, 'info');
  }
});

btnDismissGitNotice?.addEventListener('click', () => {
  isGitNoticeDismissed = true;
  if (gitUserNoticeBanner) gitUserNoticeBanner.style.display = 'none';
});

btnCopyGitCmd?.addEventListener('click', async () => {
  const cmd = gitUserCmdCopy ? gitUserCmdCopy.textContent : 'git config user.name "Seu Nome"';
  try {
    await navigator.clipboard.writeText(cmd);
    showToast('Comando Git copiado para o clipboard!', 'success');
  } catch {
    showToast('Comando pronto no terminal!', 'info');
  }
});

// 1-Clique na barra de aviso
btnQuickLinkGit?.addEventListener('click', async () => {
  const memberId = selectQuickGitMember?.value;
  if (!memberId) {
    showToast('Selecione um integrante na lista para vincular à sua máquina', 'warning');
    return;
  }
  await setLocalDeveloperIdentity(memberId);
});

// Salvar identidade local a partir do modal
btnApplyGitConfig?.addEventListener('click', async () => {
  const memberId = selectModalGitMember?.value;
  const name = inputGitUserName?.value.trim();
  if (!memberId) {
    showToast('Selecione um integrante para vincular a esta máquina', 'warning');
    return;
  }
  await setLocalDeveloperIdentity(memberId, name);
});

// Quick Search
inputSearchMembers?.addEventListener('input', (e) => {
  memberSearchQuery = e.target.value.trim().toLowerCase();
  renderMemberFilterPills();
});

// Quick Manage button in header
btnQuickManageMembers?.addEventListener('click', () => {
  modalSettings?.classList.add('open');
  document.getElementById('modal-tab-members')?.click();
});

// Save or update member button in modal
btnSaveMember?.addEventListener('click', saveOrUpdateMember);
btnCancelEditMember?.addEventListener('click', cancelEditMember);

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
  fetchGitInfo();
  fetchMembers();
  fetchFeatures();
  loadConfig();
  updateCommandPreview();
});




