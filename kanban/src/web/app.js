// Fowlgen Wars - OpenSpec & Kanban Studio Client

let currentFeatures = [];
let teamMembers = [];
let activeTab = 'tasks';
let lastGeneratedCommand = '';

function isMemberActive(name) {
  if (!name || name === 'Todos' || name === 'dev-team') return true;
  const clean = String(name).replace(/^@/, '').trim().toLowerCase();
  const found = teamMembers.find(m =>
    m.name.toLowerCase() === clean ||
    m.id.toLowerCase() === clean
  );
  if (!found) return true;
  return found.active !== false && found.status !== 'inactive';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// DOM Elements
const selectFeatureTask = document.getElementById('select-feature-task');
const inputTaskId = document.getElementById('input-task-id');
const selectTaskStatus = document.getElementById('select-task-status');
const selectTaskAssignee = document.getElementById('select-task-assignee');
const inputTaskAssignee = document.getElementById('input-task-assignee') || selectTaskAssignee;
const inputTaskText = document.getElementById('input-task-text');

const inputIdeaTitle = document.getElementById('input-idea-title');
const inputIdeaId = document.getElementById('input-idea-id');
const inputIdeaPrompt = document.getElementById('input-idea-prompt');
const selectIdeaTeam = document.getElementById('select-idea-team');
const inputIdeaTeam = document.getElementById('input-idea-team') || selectIdeaTeam;
const inputIdeaReason = document.getElementById('input-idea-reason');
const btnSlugifyTitle = document.getElementById('btn-slugify-title');

const commandOutput = document.getElementById('command-output');
const executionLog = document.getElementById('execution-log');
const toastContainer = document.getElementById('toast-container');

// Stat Elements
const statTotalFeatures = document.getElementById('stat-total-features');
const statTotalTasks = document.getElementById('stat-total-tasks');
const statDoneTasks = document.getElementById('stat-done-tasks');

// Details Modal Elements ("Outra Tela")
const modalItemDetails = document.getElementById('modal-item-details');
const btnCloseDetails = document.getElementById('btn-close-details');
const btnCloseDetailsFooter = document.getElementById('btn-close-details-footer');
const detailHeaderIcon = document.getElementById('detail-header-icon');
const detailHeaderTitle = document.getElementById('detail-header-title');
const detailHeaderSubtitle = document.getElementById('detail-header-subtitle');
const detailBadgeStatus = document.getElementById('detail-badge-status');
const detailBadgeAssignee = document.getElementById('detail-badge-assignee');
const detailBadgeModified = document.getElementById('detail-badge-modified');
const detailBadgeBranch = document.getElementById('detail-badge-branch');
const detailProgressLabel = document.getElementById('detail-progress-label');
const detailProgressBar = document.getElementById('detail-progress-bar');
const detailTasksCount = document.getElementById('detail-tasks-count');
const detailProposalFormatted = document.getElementById('detail-proposal-formatted');
const detailProposalRaw = document.getElementById('detail-proposal-raw');
const btnProposalModeView = document.getElementById('btn-proposal-mode-view');
const btnProposalModeEdit = document.getElementById('btn-proposal-mode-edit');
const btnSaveProposalContent = document.getElementById('btn-save-proposal-content');
const detailTasksList = document.getElementById('detail-tasks-list');
const detailNewTaskId = document.getElementById('detail-new-task-id');
const detailNewTaskAssignee = document.getElementById('detail-new-task-assignee');
const detailNewTaskText = document.getElementById('detail-new-task-text');
const btnDetailAddTask = document.getElementById('btn-detail-add-task');
const detailFooterActions = document.getElementById('detail-footer-actions');
const detailCmdValidate = document.getElementById('detail-cmd-validate');
const detailCmdApprove = document.getElementById('detail-cmd-approve');
const detailCmdReject = document.getElementById('detail-cmd-reject');
const detailCmdList = document.getElementById('detail-cmd-list');

let currentDetailFeature = null;

// Slugify Helper (converte Título em ID kebab-case limpo)
function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Resolve o ID da ideia priorizando o campo ID, depois gerando do Título, depois do seletor
function resolveTargetIdeaId() {
  let id = inputIdeaId ? inputIdeaId.value.trim() : '';
  if (!id && inputIdeaTitle && inputIdeaTitle.value.trim()) {
    id = slugify(inputIdeaTitle.value.trim());
    if (inputIdeaId) inputIdeaId.value = id;
  }
  if (!id && selectFeatureTask && selectFeatureTask.value) {
    id = selectFeatureTask.value.trim();
  }
  return id;
}

let userManuallyEditedId = false;

if (inputIdeaId) {
  inputIdeaId.addEventListener('input', () => {
    userManuallyEditedId = inputIdeaId.value.trim().length > 0;
  });
}

if (inputIdeaTitle) {
  inputIdeaTitle.addEventListener('input', () => {
    if (!userManuallyEditedId || !inputIdeaId.value.trim()) {
      inputIdeaId.value = slugify(inputIdeaTitle.value);
    }
    updateCommandPreview();
  });
}

if (btnSlugifyTitle) {
  btnSlugifyTitle.addEventListener('click', () => {
    inputIdeaId.value = slugify(inputIdeaTitle.value || 'nova-feature');
    userManuallyEditedId = false;
    updateCommandPreview();
    showToast(`ID gerado a partir do título: "${inputIdeaId.value}"`, 'info');
  });
}

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

// Board View State: 'tasks' (Tarefas da Sprint) vs 'ideas' (Funil de Ideias) vs 'analytics' (Analytics & Métricas)
let currentBoardView = 'tasks';
let currentAssigneeFilter = 'all';

const btnViewTasks = document.getElementById('btn-view-tasks');
const btnViewIdeas = document.getElementById('btn-view-ideas');
const btnViewAnalytics = document.getElementById('btn-view-analytics');
const kanbanColumnsContainer = document.querySelector('.kanban-columns');
const analyticsDashboardContainer = document.getElementById('analytics-dashboard-container');
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

  const taskId = inputTaskId ? (inputTaskId.value.trim() || '2.1') : '2.1';
  const status = selectTaskStatus ? selectTaskStatus.value : 'Backlog';
  const assignee = (selectTaskAssignee?.value || inputTaskAssignee?.value || 'Marcos').trim();

  // Resolve ID e Título da Ideia
  let ideaId = inputIdeaId ? inputIdeaId.value.trim() : '';
  const ideaTitle = inputIdeaTitle ? inputIdeaTitle.value.trim() : '';
  if (!ideaId && ideaTitle) {
    ideaId = slugify(ideaTitle);
  }

  let cmd = '';

  if (activeTab === 'tasks') {
    cmd = `agent atualizar "**${taskId}**" "${status}" "${assignee}"`;
  } else if (activeTab === 'ideas') {
    if (ideaId && ideaTitle) {
      cmd = `agent criar openspec/changes/${ideaId}/proposal.md "# Feature: ${ideaTitle}"`;
    } else if (ideaId) {
      cmd = `agent validar ideia "${ideaId}"`;
    } else {
      cmd = `agent validar ideia "[informe-o-titulo-ou-id]"`;
    }
  } else if (activeTab === 'kanban') {
    cmd = `npm.cmd run sync`;
  }

  lastGeneratedCommand = cmd;
  commandOutput.textContent = cmd;
}

// Input change listeners
[selectFeatureTask, inputTaskId, selectTaskStatus, selectTaskAssignee, inputTaskAssignee, inputTaskText,
  inputIdeaId, inputIdeaTitle, inputIdeaPrompt, selectIdeaTeam, inputIdeaTeam, inputIdeaReason].forEach(input => {
    if (input) {
      input.addEventListener('input', () => updateCommandPreview());
      input.addEventListener('change', () => updateCommandPreview());
    }
  });

// Clipboard Copy com validação para nunca copiar placeholders
document.getElementById('btn-copy-command').addEventListener('click', async () => {
  if (lastGeneratedCommand.includes('[informe-o-titulo-ou-id]') || lastGeneratedCommand.includes('<id>')) {
    showToast('⚠️ Preencha o Título ou ID da ideia antes de copiar o comando!', 'warning');
    if (inputIdeaTitle) inputIdeaTitle.focus();
    return;
  }

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

  // Opção padrão no topo: Em branco / Tarefas Gerais
  const optDefault = document.createElement('option');
  optDefault.value = 'tarefas-gerais';
  optDefault.textContent = '📋 (Em branco - Tarefas Gerais / Avulsas)';
  selectFeatureTask.appendChild(optDefault);

  features.forEach(f => {
    if (f.name === 'tarefas-gerais') return;
    const opt = document.createElement('option');
    opt.value = f.name;
    opt.textContent = `${f.name} (${f.progress}% concluído)`;
    selectFeatureTask.appendChild(opt);
  });

  if (currentVal && (currentVal === 'tarefas-gerais' || features.some(f => f.name === currentVal))) {
    selectFeatureTask.value = currentVal;
  } else {
    selectFeatureTask.value = 'tarefas-gerais';
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

// Board View Switcher (Tarefas da Sprint vs Funil de Ideias vs Analytics)
function setBoardView(view) {
  currentBoardView = view;

  if (view === 'analytics') {
    btnViewAnalytics?.classList.add('active');
    btnViewTasks?.classList.remove('active');
    btnViewIdeas?.classList.remove('active');
    if (kanbanColumnsContainer) kanbanColumnsContainer.style.display = 'none';
    if (analyticsDashboardContainer) analyticsDashboardContainer.style.display = 'flex';
    renderAnalyticsDashboard(currentFeatures);
    return;
  }

  if (kanbanColumnsContainer) kanbanColumnsContainer.style.display = 'grid';
  if (analyticsDashboardContainer) analyticsDashboardContainer.style.display = 'none';

  if (view === 'tasks') {
    btnViewTasks?.classList.add('active');
    btnViewIdeas?.classList.remove('active');
    btnViewAnalytics?.classList.remove('active');
    if (colTitle1) colTitle1.innerHTML = '📋 A Fazer';
    if (colTitle2) colTitle2.innerHTML = '⚡ Em Progresso';
    if (colTitle3) colTitle3.innerHTML = '👀 Em Revisão';
    if (colTitle4) colTitle4.innerHTML = '✅ Concluído';
  } else {
    btnViewIdeas?.classList.add('active');
    btnViewTasks?.classList.remove('active');
    btnViewAnalytics?.classList.remove('active');
    if (colTitle1) colTitle1.innerHTML = '💡 Novas Ideias';
    if (colTitle2) colTitle2.innerHTML = '🔍 Em Validação';
    if (colTitle3) colTitle3.innerHTML = '✅ Aprovadas';
    if (colTitle4) colTitle4.innerHTML = '❌ Rejeitadas';
  }
  renderFeatures(currentFeatures);
}

btnViewTasks?.addEventListener('click', () => setBoardView('tasks'));
btnViewIdeas?.addEventListener('click', () => setBoardView('ideas'));
btnViewAnalytics?.addEventListener('click', () => setBoardView('analytics'));

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
  if (currentBoardView === 'analytics') {
    renderAnalyticsDashboard(currentFeatures);
  } else {
    renderFeatures(currentFeatures);
  }
}

document.querySelectorAll('.member-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    setMemberFilter(pill.getAttribute('data-assignee') || 'all');
  });
});

// =============================================================
// 3ª ABA: ANALYTICS & MÉTRICAS (Dashboard Integrado)
// =============================================================
function renderAnalyticsDashboard(features) {
  if (!analyticsDashboardContainer) return;

  const totalFeatures = features.length;
  let totalTasks = 0;
  let doneTasks = 0;
  let inProgressTasks = 0;
  let reviewTasks = 0;
  let backlogTasks = 0;

  let doneFeatures = 0;
  let inProgressFeatures = 0;
  let readyFeatures = 0;
  let backlogFeatures = 0;

  // Mapa de carga de trabalho por membro (somente membros ativos)
  const memberWorkload = new Map();
  const activeMembersOnly = teamMembers.filter(m => m.active !== false && m.status !== 'inactive');
  activeMembersOnly.forEach(m => {
    memberWorkload.set(m.id.toLowerCase(), {
      id: m.id,
      name: m.name,
      role: m.role || 'Desenvolvedor',
      avatar: m.avatar || '👤',
      totalTasks: 0,
      doneTasks: 0
    });
  });

  features.forEach(f => {
    const fTotal = f.totalTasks || 0;
    const fDone = f.doneTasks || 0;
    totalTasks += fTotal;
    doneTasks += fDone;

    if (f.kanbanColumn === 'Done') doneFeatures++;
    else if (f.kanbanColumn === 'In Progress') inProgressFeatures++;
    else if (f.kanbanColumn === 'Ready') readyFeatures++;
    else backlogFeatures++;

    if (f.tasks && f.tasks.length > 0) {
      f.tasks.forEach(t => {
        if (!t.done) {
          if (f.kanbanColumn === 'In Progress') inProgressTasks++;
          else if (f.kanbanColumn === 'Ready') reviewTasks++;
          else backlogTasks++;
        }

        const rawAssignee = t.assignee || f.ideaAssignee || '';
        if (rawAssignee) {
          const key = rawAssignee.toLowerCase().replace(/^@/, '').trim();
          let foundMember = memberWorkload.get(key);
          if (!foundMember) {
            for (const [mId, mObj] of memberWorkload.entries()) {
              const nameLower = mObj.name.toLowerCase();
              const firstWord = nameLower.split(' ')[0];
              if (
                nameLower === key ||
                nameLower.includes(key) ||
                key.includes(nameLower) ||
                mId === key ||
                mId.includes(key) ||
                key.includes(mId) ||
                firstWord === key
              ) {
                foundMember = mObj;
                break;
              }
            }
          }
          if (foundMember) {
            foundMember.totalTasks++;
            if (t.done) foundMember.doneTasks++;
          }
        }
      });
    } else {
      const pending = fTotal - fDone;
      if (f.kanbanColumn === 'In Progress') inProgressTasks += pending;
      else if (f.kanbanColumn === 'Ready') reviewTasks += pending;
      else backlogTasks += pending;
    }
  });

  const nonDone = totalTasks - doneTasks;
  if (inProgressTasks + reviewTasks + backlogTasks !== nonDone && nonDone > 0) {
    backlogTasks = Math.max(0, nonDone - inProgressTasks - reviewTasks);
  }

  const overallProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const readyOrDone = doneFeatures + readyFeatures;
  const deliveryVelocity = totalFeatures > 0 ? Math.round((readyOrDone / totalFeatures) * 100) : 0;
  const activeMembersList = Array.from(memberWorkload.values());
  const activeCount = activeMembersList.filter(m => m.totalTasks > 0).length || activeMembersOnly.length;

  // Donut SVG Calculations
  const r = 70;
  const circumference = 2 * Math.PI * r; // ~439.82
  const donePct = totalTasks > 0 ? (doneTasks / totalTasks) : 0;
  const inProgPct = totalTasks > 0 ? (inProgressTasks / totalTasks) : 0;
  const revPct = totalTasks > 0 ? (reviewTasks / totalTasks) : 0;
  const backPct = totalTasks > 0 ? (backlogTasks / totalTasks) : 0;

  const lenDone = donePct * circumference;
  const lenInProg = inProgPct * circumference;
  const lenRev = revPct * circumference;
  const lenBack = backPct * circumference;

  let offset = 0;
  const offDone = offset; offset -= lenDone;
  const offInProg = offset; offset -= lenInProg;
  const offRev = offset; offset -= lenRev;
  const offBack = offset;

  // Build SVG Paths
  let donutSvgContent = '';
  if (totalTasks === 0) {
    donutSvgContent = `
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="20" />
      <text x="100" y="105" text-anchor="middle" font-size="14" fill="#94a3b8" font-family="system-ui, sans-serif">Sem tarefas</text>
    `;
  } else {
    donutSvgContent = `
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="20" />
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="#10b981" stroke-width="20"
        stroke-dasharray="${lenDone.toFixed(2)} ${circumference.toFixed(2)}"
        stroke-dashoffset="${offDone.toFixed(2)}" transform="rotate(-90 100 100)" stroke-linecap="round" />
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="#38bdf8" stroke-width="20"
        stroke-dasharray="${lenInProg.toFixed(2)} ${circumference.toFixed(2)}"
        stroke-dashoffset="${offInProg.toFixed(2)}" transform="rotate(-90 100 100)" stroke-linecap="round" />
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="#f59e0b" stroke-width="20"
        stroke-dasharray="${lenRev.toFixed(2)} ${circumference.toFixed(2)}"
        stroke-dashoffset="${offRev.toFixed(2)}" transform="rotate(-90 100 100)" stroke-linecap="round" />
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="#64748b" stroke-width="20"
        stroke-dasharray="${lenBack.toFixed(2)} ${circumference.toFixed(2)}"
        stroke-dashoffset="${offBack.toFixed(2)}" transform="rotate(-90 100 100)" stroke-linecap="round" />
      <text x="100" y="94" text-anchor="middle" font-size="28" font-weight="800" fill="#ffffff" font-family="system-ui, sans-serif">${overallProgress}%</text>
      <text x="100" y="112" text-anchor="middle" font-size="11" font-weight="700" fill="#94a3b8" font-family="system-ui, sans-serif" letter-spacing="0.5">CONCLUÍDO</text>
    `;
  }

  // Build Team Workload Cards HTML
  let teamCardsHtml = '';
  if (activeMembersList.length === 0) {
    teamCardsHtml = `<div style="grid-column: 1/-1; padding: 20px; text-align: center; color: var(--text-dim);">Nenhum integrante cadastrado.</div>`;
  } else {
    teamCardsHtml = activeMembersList.map(m => {
      const mPct = m.totalTasks > 0 ? Math.round((m.doneTasks / m.totalTasks) * 100) : 0;
      return `
        <div class="team-workload-card" data-member-id="${m.id}" title="Clique para filtrar as tarefas de ${m.name}">
          <div class="team-workload-top">
            <div class="team-workload-avatar">${m.avatar}</div>
            <div class="team-workload-info">
              <div class="team-workload-name">${m.name}</div>
              <div class="team-workload-role">${m.role}</div>
            </div>
            <span style="font-size: 11px; font-weight: 700; color: ${mPct === 100 && m.totalTasks > 0 ? '#10b981' : '#38bdf8'}; font-family: monospace;">${mPct}%</span>
          </div>
          <div class="team-workload-stats">
            <span>${m.doneTasks} de ${m.totalTasks} tarefas</span>
            <span style="color: var(--text-dim); font-size: 11px;">🔍 Filtrar</span>
          </div>
          <div class="progress-bar-container" style="height: 5px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; margin: 0;">
            <div class="progress-fill" style="width: ${mPct}%; height: 100%; background: linear-gradient(90deg, #38bdf8, #10b981); border-radius: 999px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Build Features Table Rows HTML
  let featuresRowsHtml = '';
  if (features.length === 0) {
    featuresRowsHtml = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-dim);">Nenhuma feature cadastrada no OpenSpec.</td></tr>`;
  } else {
    featuresRowsHtml = features.map(f => {
      let statusBadge = '<span class="badge-tag" style="background: rgba(100, 116, 139, 0.15); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3);">📋 A Fazer</span>';
      if (f.kanbanColumn === 'Done') {
        statusBadge = '<span class="badge-tag" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">✅ Concluído</span>';
      } else if (f.kanbanColumn === 'In Progress') {
        statusBadge = '<span class="badge-tag" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">⚡ Em Progresso</span>';
      } else if (f.kanbanColumn === 'Ready') {
        statusBadge = '<span class="badge-tag" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">👀 Em Revisão</span>';
      }

      const rawAssignee = (f.ideaAssignee && isMemberActive(f.ideaAssignee))
        ? f.ideaAssignee
        : ((f.assignees && f.assignees.find(a => isMemberActive(a))) || 'Todos');
      const displayAssignee = (rawAssignee === 'dev-team' || !isMemberActive(rawAssignee)) ? 'Todos' : rawAssignee;
      const progressVal = f.progress || 0;

      return `
        <tr data-feature-name="${f.name}">
          <td>
            <div style="font-weight: 700; color: #fff; font-size: 13px;">${f.title || f.name}</div>
            <code style="font-size: 10.5px; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 1px 5px; border-radius: 4px;">${f.name}</code>
          </td>
          <td>${statusBadge}</td>
          <td>
            <span style="font-size: 12px; color: #cbd5e1; display: inline-flex; align-items: center; gap: 4px;">
              <span>👤</span> ${displayAssignee}
            </span>
          </td>
          <td>
            <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #fff;">${f.doneTasks || 0} / ${f.totalTasks || 0}</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="progress-bar-container" style="flex: 1; min-width: 80px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; margin: 0;">
                <div class="progress-fill" style="width: ${progressVal}%; height: 100%; background: linear-gradient(90deg, #38bdf8, #10b981); border-radius: 999px;"></div>
              </div>
              <span style="font-size: 11px; font-weight: 700; font-family: monospace; color: #fff; width: 34px; text-align: right;">${progressVal}%</span>
            </div>
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn btn-secondary btn-sm btn-analytics-view-feature" data-feature-name="${f.name}" style="padding: 4px 10px; font-size: 11.5px; border-radius: var(--radius-sm);">
              🔍 Detalhes
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Full Container HTML
  analyticsDashboardContainer.innerHTML = `
    <!-- Barra de Ações Rápidas -->
    <div class="analytics-quick-actions-bar">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">📊</span>
        <div>
          <div style="font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.2px;">Painel de Analytics & Métricas da Sprint</div>
          <div style="font-size: 12px; color: var(--text-dim);">Acompanhamento em tempo real de tarefas OpenSpec, distribuição e equipe</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary btn-sm" id="btn-analytics-refresh" title="Atualizar dados do servidor">
          🔄 Atualizar
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-analytics-copy-md" title="Copiar relatório resumido em Markdown">
          📋 Copiar Resumo MD
        </button>
        <button type="button" class="btn btn-primary btn-sm" id="btn-analytics-goto-tasks" title="Ir para o quadro visual de tarefas da Sprint">
          🎯 Ver Tarefas
        </button>
      </div>
    </div>

    <!-- Grade de KPIs -->
    <div class="analytics-kpis-grid">
      <div class="analytics-kpi-card" style="--kpi-accent: #10b981;">
        <div class="analytics-kpi-header">
          <span class="analytics-kpi-title">Conclusão da Sprint</span>
          <span class="analytics-kpi-icon">🎯</span>
        </div>
        <div class="analytics-kpi-value" style="color: #34d399;">${overallProgress}%</div>
        <div class="analytics-kpi-subtitle">${doneTasks} de ${totalTasks} tarefas finalizadas</div>
      </div>

      <div class="analytics-kpi-card" style="--kpi-accent: #38bdf8;">
        <div class="analytics-kpi-header">
          <span class="analytics-kpi-title">Features OpenSpec</span>
          <span class="analytics-kpi-icon">📦</span>
        </div>
        <div class="analytics-kpi-value">${totalFeatures}</div>
        <div class="analytics-kpi-subtitle">${inProgressFeatures} ativas | ${doneFeatures} prontas</div>
      </div>

      <div class="analytics-kpi-card" style="--kpi-accent: #a855f7;">
        <div class="analytics-kpi-header">
          <span class="analytics-kpi-title">Equipe Ativa</span>
          <span class="analytics-kpi-icon">👥</span>
        </div>
        <div class="analytics-kpi-value">${activeMembersOnly.length}</div>
        <div class="analytics-kpi-subtitle">${activeCount} ativos com tarefas atribuídas</div>
      </div>

      <div class="analytics-kpi-card" style="--kpi-accent: #f59e0b;">
        <div class="analytics-kpi-header">
          <span class="analytics-kpi-title">Taxa de Entrega</span>
          <span class="analytics-kpi-icon">⚡</span>
        </div>
        <div class="analytics-kpi-value" style="color: #fbbf24;">${deliveryVelocity}%</div>
        <div class="analytics-kpi-subtitle">${readyOrDone} features prontas ou em revisão</div>
      </div>
    </div>

    <!-- Gráficos e Distribuição -->
    <div class="analytics-charts-grid">
      <!-- Donut Chart -->
      <div class="analytics-card">
        <div class="analytics-card-header">
          <div class="analytics-card-title">
            <span>📈</span> Status das Tarefas
          </div>
          <span class="analytics-card-badge">${totalTasks} Tarefas</span>
        </div>
        <div class="donut-chart-container">
          <svg width="200" height="200" viewBox="0 0 200 200" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
            ${donutSvgContent}
          </svg>
          <div class="donut-legend">
            <div class="donut-legend-item">
              <span class="donut-legend-dot" style="background: #10b981;"></span>
              <span>Concluídas</span>
              <span class="donut-legend-count">${doneTasks}</span>
            </div>
            <div class="donut-legend-item">
              <span class="donut-legend-dot" style="background: #38bdf8;"></span>
              <span>Em Progresso</span>
              <span class="donut-legend-count">${inProgressTasks}</span>
            </div>
            <div class="donut-legend-item">
              <span class="donut-legend-dot" style="background: #f59e0b;"></span>
              <span>Em Revisão</span>
              <span class="donut-legend-count">${reviewTasks}</span>
            </div>
            <div class="donut-legend-item">
              <span class="donut-legend-dot" style="background: #64748b;"></span>
              <span>A Fazer</span>
              <span class="donut-legend-count">${backlogTasks}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Workload -->
      <div class="analytics-card">
        <div class="analytics-card-header">
          <div class="analytics-card-title">
            <span>👥</span> Carga de Trabalho por Integrante
          </div>
          <span class="analytics-card-badge">${activeMembersOnly.length} Integrantes Ativos</span>
        </div>
        <div class="team-workload-grid">
          ${teamCardsHtml}
        </div>
      </div>
    </div>

    <!-- Features Delivery Matrix -->
    <div class="analytics-card">
      <div class="analytics-card-header">
        <div class="analytics-card-title">
          <span>📋</span> Matriz de Entrega das Features (OpenSpec)
        </div>
        <span class="analytics-card-badge">${features.length} Features Registradas</span>
      </div>
      <div style="overflow-x: auto;">
        <table class="analytics-table">
          <thead>
            <tr>
              <th>Feature / ID</th>
              <th>Status Kanban</th>
              <th>Responsável</th>
              <th>Tarefas</th>
              <th style="min-width: 140px;">Progresso</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${featuresRowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach Listeners to dynamic elements in Analytics
  document.getElementById('btn-analytics-refresh')?.addEventListener('click', async () => {
    await fetchFeatures();
    showToast('Métricas da Sprint atualizadas!', 'success');
  });

  document.getElementById('btn-analytics-goto-tasks')?.addEventListener('click', () => {
    setBoardView('tasks');
  });

  document.getElementById('btn-analytics-copy-md')?.addEventListener('click', async () => {
    const mdSummary = [
      `# 📊 Fowlgen Wars - Métricas da Sprint`,
      `**Data:** ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
      `**Conclusão Geral:** ${overallProgress}% (${doneTasks}/${totalTasks} tarefas)`,
      `**Features OpenSpec:** ${totalFeatures} (${doneFeatures} concluídas, ${inProgressFeatures} em progresso, ${readyFeatures} em revisão, ${backlogFeatures} a fazer)`,
      `**Membros Cadastrados:** ${teamMembers.length}`,
      ``,
      `### Distribuição de Tarefas:`,
      `- ✅ Concluídas: ${doneTasks} (${Math.round(donePct * 100)}%)`,
      `- ⚡ Em Progresso: ${inProgressTasks} (${Math.round(inProgPct * 100)}%)`,
      `- 👀 Em Revisão: ${reviewTasks} (${Math.round(revPct * 100)}%)`,
      `- 📋 A Fazer: ${backlogTasks} (${Math.round(backPct * 100)}%)`,
      ``,
      `### Matriz de Features:`,
      ...features.map(f => `- **${f.title || f.name}** (\`${f.name}\`): ${f.progress || 0}% (${f.doneTasks || 0}/${f.totalTasks || 0} tarefas) - [${f.kanbanColumn || 'Backlog'}]`)
    ].join('\n');

    try {
      await navigator.clipboard.writeText(mdSummary);
      showToast('Relatório Markdown copiado para a área de transferência!', 'success');
    } catch {
      showToast('Não foi possível copiar o relatório', 'warning');
    }
  });

  // Clicking a team member workload card filters and switches to Sprint view
  analyticsDashboardContainer.querySelectorAll('.team-workload-card').forEach(card => {
    card.addEventListener('click', () => {
      const memberId = card.getAttribute('data-member-id');
      if (memberId) {
        setMemberFilter(memberId);
        setBoardView('tasks');
        const mObj = teamMembers.find(x => x.id === memberId);
        showToast(`Filtrando tarefas de ${mObj ? mObj.name : memberId} na Sprint!`, 'info');
      }
    });
  });

  // Clicking "🔍 Detalhes" button in features table opens the rich feature details modal
  analyticsDashboardContainer.querySelectorAll('.btn-analytics-view-feature').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const featName = btn.getAttribute('data-feature-name');
      const feat = features.find(f => f.name === featName);
      if (feat) {
        openFeatureDetailsModal(feat, 'proposal');
      }
    });
  });
}

// Render Kanban Cards (Sprint Tasks or Ideas Funnel)
function renderFeatures(features) {
  // Atualiza os badges de contagem do alternador de visão
  const totalTasksCount = features.reduce((acc, f) => acc + (f.totalTasks || 0), 0);
  if (badgeTotalTasksView) badgeTotalTasksView.textContent = totalTasksCount;
  if (badgeTotalIdeasView) badgeTotalIdeasView.textContent = features.length;

  if (currentBoardView === 'analytics') {
    renderAnalyticsDashboard(features);
    return;
  }

  const colBacklog = document.getElementById('cards-backlog');
  const colProgress = document.getElementById('cards-progress');
  const colReview = document.getElementById('cards-review');
  const colDone = document.getElementById('cards-done');

  colBacklog.innerHTML = '';
  colProgress.innerHTML = '';
  colReview.innerHTML = '';
  colDone.innerHTML = '';

  let countBacklog = 0, countProgress = 0, countReview = 0, countDone = 0;

  // Filtragem por integrante
  const filtered = features.filter(feature => {
    if (currentAssigneeFilter === 'all') return true;
    const filterLower = currentAssigneeFilter.toLowerCase().replace(/^@/, '').trim();

    // Encontra o membro selecionado em teamMembers
    const selectedMem = teamMembers.find(m =>
      m.id.toLowerCase() === filterLower ||
      m.name.toLowerCase() === filterLower ||
      m.name.toLowerCase().includes(filterLower) ||
      filterLower.includes(m.name.toLowerCase()) ||
      m.name.toLowerCase().split(' ')[0] === filterLower
    );

    // Conjunto de tokens para validação cruzada
    const searchTokens = new Set([filterLower]);
    if (selectedMem) {
      searchTokens.add(selectedMem.id.toLowerCase());
      searchTokens.add(selectedMem.name.toLowerCase());
      searchTokens.add(selectedMem.name.toLowerCase().split(' ')[0]);
      if (selectedMem.github) searchTokens.add(selectedMem.github.toLowerCase());
    }

    const matchesToken = (val) => {
      if (!val) return false;
      const v = String(val).toLowerCase().replace(/^@/, '').trim();
      for (const token of searchTokens) {
        if (v === token || v.includes(token) || token.includes(v)) return true;
      }
      return false;
    };

    // Verifica em ideaAssignee
    if (matchesToken(feature.ideaAssignee)) return true;

    // Verifica na lista de assignees da feature
    if (feature.assignees && feature.assignees.some(a => matchesToken(a))) return true;

    // Verifica nas tarefas individuais
    if (feature.tasks && feature.tasks.some(t => {
      return matchesToken(t.assignee) || matchesToken(t.text) || matchesToken(t.raw);
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

  const rawAssignee = (feature.ideaAssignee && isMemberActive(feature.ideaAssignee)) ? feature.ideaAssignee : 'Todos';
  const displayAssignee = (rawAssignee === 'dev-team' || !isMemberActive(rawAssignee)) ? 'Todos' : rawAssignee;
  const assigneeBadge = `<span class="badge-tag" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); font-size: 10px;">👥 ${displayAssignee}</span>`;

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
    <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 8px; font-family: var(--font-mono);">📁 ${feature.name}</div>
    <p class="card-summary">${summary}</p>
    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
      <span>📋 ${feature.totalTasks} tarefa(s) vinculada(s)</span>
      <span>${feature.progress}% concluído</span>
    </div>
    <div class="card-hover-hint">🔍 Clique para ver os detalhes completos da ideia ("outra tela")</div>
    ${actionButtonsHtml}
  `;

  // Click card to open Details Modal ("outra tela") and populate form inputs
  card.addEventListener('click', (e) => {
    if (!e.target.closest('button')) {
      inputIdeaId.value = feature.name;
      inputIdeaTitle.value = feature.title || feature.name;
      selectFeatureTask.value = feature.name;
      if (selectIdeaTeam) selectIdeaTeam.value = (feature.ideaAssignee && feature.ideaAssignee !== 'dev-team') ? feature.ideaAssignee : 'Todos';
      updateCommandPreview();
      openFeatureDetailsModal(feature, 'proposal');
    }
  });

  // Action button clicks
  card.querySelector('.btn-val')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    await triggerIdeaAction(feature.name, 'validate');
  });

  card.querySelector('.btn-app')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const assignee = currentAssigneeFilter !== 'all' ? currentAssigneeFilter : ((feature.ideaAssignee && feature.ideaAssignee !== 'dev-team') ? feature.ideaAssignee : 'Todos');
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

  const activeAssignees = (feature.assignees || []).filter(a => isMemberActive(a));

  const assigneesHtml = activeAssignees.length > 0
    ? activeAssignees.map(a => `<span class="badge-tag" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 10px;">👤 ${a === 'dev-team' ? 'Todos' : a}</span>`).join(' ')
    : `<span class="badge-tag" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; font-size: 10px;">👥 Todos</span>`;

  // Task Items HTML
  const tasksHtml = feature.tasks.slice(0, 5).map(t => {
    const cleanText = t.text.replace(/\(([^)]+)\)|@([\w-]+)|\[([\w-]+)\]/g, '').trim();
    const showAssignee = t.assignee && isMemberActive(t.assignee);
    const promptBadge = t.prompt
      ? `<span title="${escapeHtml(t.prompt)}" style="font-size: 10px; color: #c084fc; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); padding: 1px 5px; border-radius: 8px; margin-left: 4px; cursor: help;">💬 Prompt</span>`
      : '';
    return `
    <label class="task-item ${t.done ? 'done' : ''}">
      <input type="checkbox" ${t.done ? 'checked' : ''} ${feature.isFromGitBranch ? 'disabled title="Modo Histórico da branch (somente leitura)"' : ''} data-feature="${feature.name}" data-task-id="${t.id}" class="task-checkbox">
      <span><strong>${t.id ? '**' + t.id + '**' : ''}</strong> ${cleanText || t.text}</span>
      ${promptBadge}
      ${showAssignee ? `<span style="font-size: 10px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.25); padding: 1px 6px; border-radius: 10px; margin-left: 6px; white-space: nowrap;">👤 ${t.assignee}</span>` : ''}
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
    <div class="card-hover-hint">🔍 Clique para ver os detalhes da tarefa e proposta ("outra tela")</div>
  `;

  // Select feature and open Details Modal on card click
  card.addEventListener('click', (e) => {
    if (e.target.tagName !== 'INPUT' && !e.target.closest('button')) {
      selectFeatureTask.value = feature.name;
      inputIdeaId.value = feature.name;
      inputIdeaTitle.value = feature.title || feature.name;
      updateCommandPreview();
      openFeatureDetailsModal(feature, 'tasks');
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

// 1. Criar Tarefa: agent criar openspec/changes/<id>/tasks.md "**2.1** Implementar BackEnd (@Nome)"
document.getElementById('btn-action-create-task').addEventListener('click', async () => {
  const feature = (selectFeatureTask?.value || '').trim() || 'tarefas-gerais';
  const taskId = inputTaskId.value.trim();
  const text = inputTaskText.value.trim();
  if (!text) {
    showToast('Informe a descrição da tarefa que deseja criar', 'warning');
    inputTaskText?.focus();
    return;
  }

  const assignee = (selectTaskAssignee?.value || inputTaskAssignee?.value || '').trim();
  const status = selectTaskStatus?.value || 'Backlog';
  const assigneeTag = assignee && assignee !== 'Todos' ? ` (@${assignee})` : '';
  const firstLine = text.split(/\r?\n/)[0].trim();
  const cmd = `agent criar openspec/changes/${feature}/tasks.md "${taskId ? '**' + taskId + '** ' : ''}${firstLine}${assigneeTag}"`;
  updateCommandPreview(cmd);

  try {
    const res = await fetch('/api/tasks/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature,
        taskId,
        text,
        assignee: assignee && assignee !== 'Todos' ? assignee : undefined,
        status
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      inputTaskText.value = '';
      if (inputTaskId) inputTaskId.value = '';
      await fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao criar tarefa', 'error');
    }
  } catch {
    showToast('Não foi possível conectar ao servidor', 'error');
  }
});

// Setup prompt chips for quick templates
document.querySelectorAll('.btn-prompt-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    const templateType = btn.getAttribute('data-template');
    let templateText = '';
    if (templateType === 'ia') {
      templateText = `[Prompt IA] Objetivo:\nInstruções:\n- \nCritério de Aceite:\n- `;
    } else if (templateType === 'bugfix') {
      templateText = `[Bugfix] Problema:\nCausa provável:\nCorreção esperada:\n- `;
    } else if (templateType === 'arena') {
      templateText = `[Gameplay] Testar na Arena_Clean:\n- Cenário:\n- Validação esperada:\n`;
    }
    if (templateText && inputTaskText) {
      if (inputTaskText.value.trim()) {
        inputTaskText.value += '\n' + templateText;
      } else {
        inputTaskText.value = templateText;
      }
      inputTaskText.focus();
      inputTaskText.scrollTop = inputTaskText.scrollHeight;
    }
  });
});

// 2. Atualizar Tarefa: agent atualizar "**2.1**" "Concluído" "João"
document.getElementById('btn-action-update-task').addEventListener('click', async () => {
  const feature = (selectFeatureTask?.value || '').trim() || 'tarefas-gerais';
  const taskId = inputTaskId.value.trim() || '1.1';
  const status = selectTaskStatus.value;
  const assignee = (selectTaskAssignee?.value || inputTaskAssignee?.value || '').trim();
  const cmd = `agent atualizar "**${taskId}**" "${status}" "${assignee || 'Todos'}"`;
  updateCommandPreview(cmd);

  await updateTaskStatusDirect(feature, taskId, status === 'Concluído', (assignee && assignee !== 'Todos') ? assignee : undefined);
});

// 3. Atribuir Tarefa: agent atribuir "**2.1**" "Equipe de Backend"
document.getElementById('btn-action-assign-task').addEventListener('click', async () => {
  const feature = (selectFeatureTask?.value || '').trim() || 'tarefas-gerais';
  const taskId = inputTaskId.value.trim() || '1.1';
  const assignee = (selectTaskAssignee?.value || inputTaskAssignee?.value || 'Todos').trim();
  const cmd = `agent atribuir "**${taskId}**" "${assignee}"`;
  updateCommandPreview(cmd);

  try {
    const res = await fetch('/api/tasks/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature, taskId, assignee })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      await fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao atribuir tarefa', 'error');
    }
  } catch {
    showToast('Não foi possível conectar ao servidor local', 'error');
  }
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
  const featureId = resolveTargetIdeaId();
  const title = (inputIdeaTitle ? inputIdeaTitle.value.trim() : '') || (featureId ? featureId.replace(/-/g, ' ') : '');
  const promptText = inputIdeaPrompt ? inputIdeaPrompt.value.trim() : '';

  if (!featureId) {
    showToast('⚠️ Informe o Título ou o ID da feature antes de gerar com IA!', 'warning');
    if (inputIdeaTitle) inputIdeaTitle.focus();
    return;
  }

  showToast('🪄 IA Local analisando e gerando proposta...', 'info');
  appendLog(`Gerando proposta e checklist com IA Local para "${featureId}"...`);

  try {
    const res = await fetch('/api/features/ai-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureId, title, prompt: promptText })
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
  const featureId = resolveTargetIdeaId();
  const title = (inputIdeaTitle ? inputIdeaTitle.value.trim() : '') || (featureId ? featureId.replace(/-/g, ' ') : '');
  const promptText = inputIdeaPrompt ? inputIdeaPrompt.value.trim() : '';

  if (!featureId) {
    showToast('⚠️ Informe o Título ou o ID da nova feature antes de criar!', 'warning');
    if (inputIdeaTitle) inputIdeaTitle.focus();
    return;
  }

  const cmd = `agent criar openspec/changes/${featureId}/proposal.md "# Feature: ${title}"`;
  updateCommandPreview(cmd);

  try {
    const res = await fetch('/api/features/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        featureId,
        title,
        summary: promptText || `Feature: ${title}`,
        prompt: promptText,
        tasks: ['Planejamento', 'Implementação']
      })
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
  const ideaId = resolveTargetIdeaId();

  if (!ideaId) {
    showToast('⚠️ Informe o Título ou o ID da ideia que deseja validar!', 'warning');
    if (inputIdeaTitle) inputIdeaTitle.focus();
    return;
  }

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
    } else {
      showToast(data.error || 'Erro ao validar ideia', 'error');
    }
  } catch {
    showToast('Comando de validação gerado!', 'success');
  }
});

// 7. Aprovar Ideia: agent aprovar ideia "sistema-ouro" "Todos"
document.getElementById('btn-action-approve-idea').addEventListener('click', async () => {
  const ideaId = resolveTargetIdeaId();

  if (!ideaId) {
    showToast('⚠️ Informe o Título ou o ID da ideia que deseja aprovar!', 'warning');
    if (inputIdeaTitle) inputIdeaTitle.focus();
    return;
  }

  const team = (selectIdeaTeam ? selectIdeaTeam.value : (inputIdeaTeam?.value || 'Todos')).trim() || 'Todos';
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
    } else {
      showToast(data.error || 'Erro ao aprovar ideia', 'error');
    }
  } catch {
    showToast('Comando de aprovação gerado!', 'success');
  }
});

// 8. Rejeitar Ideia: agent rejeitar ideia "sistema-ouro" "Sem valor"
document.getElementById('btn-action-reject-idea').addEventListener('click', async () => {
  const ideaId = resolveTargetIdeaId();

  if (!ideaId) {
    showToast('⚠️ Informe o Título ou o ID da ideia que deseja rejeitar!', 'warning');
    if (inputIdeaTitle) inputIdeaTitle.focus();
    return;
  }

  const reason = inputIdeaReason ? (inputIdeaReason.value.trim() || 'Sem valor') : 'Sem valor';
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

// -------------------------------------------------------------
// Dashboard Integration & Management
// -------------------------------------------------------------
const modalDashboardView = document.getElementById('modal-dashboard-view');
const btnViewDashboard = document.getElementById('btn-view-dashboard');
const btnCloseDashboard = document.getElementById('btn-close-dashboard');
const btnCloseDashboardFooter = document.getElementById('btn-close-dashboard-footer');
const btnDashboardOpenNewTab = document.getElementById('btn-dashboard-open-new-tab');
const btnDashboardRefresh = document.getElementById('btn-dashboard-refresh');
const iframeDashboard = document.getElementById('iframe-dashboard');
const textareaDashboardMd = document.getElementById('textarea-dashboard-md');
const btnCopyDashboardMd = document.getElementById('btn-copy-dashboard-md');
const dashboardLastUpdatedLabel = document.getElementById('dashboard-last-updated-label');

async function refreshDashboardData() {
  if (iframeDashboard) {
    iframeDashboard.src = `/dashboard?t=${Date.now()}`;
  }
  try {
    const res = await fetch('/api/dashboard');
    const data = await res.json();
    if (data.success) {
      if (textareaDashboardMd) textareaDashboardMd.value = data.markdown || '';
      if (dashboardLastUpdatedLabel) {
        dashboardLastUpdatedLabel.textContent = `Relatório gerado em: ${new Date().toLocaleTimeString()}`;
      }
    }
  } catch (err) {
    console.error('Erro ao buscar dados do dashboard:', err);
  }
}

async function openDashboardModal() {
  setBoardView('analytics');
}

function closeDashboardModal() {
  if (modalDashboardView) {
    modalDashboardView.classList.remove('open');
  }
}

btnViewDashboard?.addEventListener('click', () => {
  setBoardView('analytics');
  showToast('Exibindo Analytics & Métricas da Sprint!', 'info');
});

btnCloseDashboard?.addEventListener('click', closeDashboardModal);
btnCloseDashboardFooter?.addEventListener('click', closeDashboardModal);
modalDashboardView?.addEventListener('click', (e) => {
  if (e.target === modalDashboardView) closeDashboardModal();
});

btnDashboardOpenNewTab?.addEventListener('click', () => {
  window.open('/dashboard', '_blank');
});

btnDashboardRefresh?.addEventListener('click', async () => {
  showToast('Regerando dashboard...', 'info');
  await runScriptAPI('dashboard');
  await fetchFeatures();
  if (currentBoardView === 'analytics') {
    renderAnalyticsDashboard(currentFeatures);
  }
  showToast('Dashboard e métricas atualizadas com sucesso!', 'success');
});

btnCopyDashboardMd?.addEventListener('click', async () => {
  if (textareaDashboardMd && textareaDashboardMd.value) {
    try {
      await navigator.clipboard.writeText(textareaDashboardMd.value);
      showToast('Relatório Markdown copiado para o chat!', 'success');
    } catch {
      showToast('Não foi possível copiar o markdown', 'warning');
    }
  }
});

// Dashboard internal tabs (HTML vs Markdown)
document.getElementById('tab-btn-dash-html')?.addEventListener('click', () => {
  document.getElementById('tab-btn-dash-html')?.classList.add('active');
  document.getElementById('tab-btn-dash-md')?.classList.remove('active');
  const viewHtml = document.getElementById('dash-view-html');
  const viewMd = document.getElementById('dash-view-md');
  if (viewHtml) viewHtml.style.display = 'block';
  if (viewMd) viewMd.style.display = 'none';
});

document.getElementById('tab-btn-dash-md')?.addEventListener('click', () => {
  document.getElementById('tab-btn-dash-md')?.classList.add('active');
  document.getElementById('tab-btn-dash-html')?.classList.remove('active');
  const viewHtml = document.getElementById('dash-view-html');
  const viewMd = document.getElementById('dash-view-md');
  if (viewHtml) viewHtml.style.display = 'none';
  if (viewMd) viewMd.style.display = 'flex';
});

// Kanban automation script buttons
document.getElementById('btn-script-sync').addEventListener('click', () => runScriptAPI('sync'));
document.getElementById('btn-sync-top').addEventListener('click', () => runScriptAPI('sync'));
document.getElementById('btn-script-dashboard').addEventListener('click', async () => {
  await runScriptAPI('dashboard');
  await fetchFeatures();
  setBoardView('analytics');
  showToast('Dashboard gerado e exibido na aba Analytics!', 'success');
});
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
  if (typeof cancelEditMember === 'function') {
    cancelEditMember();
  }
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
const memberStatusBreakdown = document.getElementById('member-status-breakdown');

// Deactivate Member Modal Elements
const modalDeactivateMember = document.getElementById('modal-deactivate-member');
const btnCloseDeactivateModal = document.getElementById('btn-close-deactivate-modal');
const btnCancelDeactivate = document.getElementById('btn-cancel-deactivate');
const btnConfirmDeactivate = document.getElementById('btn-confirm-deactivate');
const selectDeactivateSuccessor = document.getElementById('select-deactivate-successor');
const inputDeactivateMemberId = document.getElementById('input-deactivate-member-id');
const deactivateMemberNameLabel = document.getElementById('deactivate-member-name-label');

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
      populateTeamSelects();
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
  const activeMembers = teamMembers.filter(m => m.active !== false && m.status !== 'inactive');
  selects.forEach(sel => {
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">Selecione quem é você na equipe...</option>';
    activeMembers.forEach(m => {
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

  const activeMembers = teamMembers.filter(m => m.active !== false && m.status !== 'inactive');

  // Se o filtro atual pertencia a um membro que foi inativado, reseta para 'all'
  if (currentAssigneeFilter !== 'all') {
    const isCurrentActive = activeMembers.some(m =>
      m.id.toLowerCase() === currentAssigneeFilter.toLowerCase() ||
      m.name.toLowerCase() === currentAssigneeFilter.toLowerCase()
    );
    if (!isCurrentActive) {
      currentAssigneeFilter = 'all';
    }
  }

  // 1. Botão "Todos"
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = `member-pill ${currentAssigneeFilter === 'all' ? 'active' : ''}`;
  allBtn.setAttribute('data-assignee', 'all');
  allBtn.textContent = '👥 Todos';
  allBtn.addEventListener('click', () => setMemberFilter('all'));
  memberFilterPillsContainer.appendChild(allBtn);

  // 2. Filtra membros ativos pelo input de busca se houver
  const filtered = activeMembers.filter(m => {
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

  const activeMembers = teamMembers.filter(m => m.active !== false && m.status !== 'inactive');
  const inactiveMembers = teamMembers.filter(m => m.active === false || m.status === 'inactive');

  if (memberCountBadge) memberCountBadge.textContent = teamMembers.length;
  if (memberStatusBreakdown) {
    memberStatusBreakdown.textContent = `${activeMembers.length} ativos • ${inactiveMembers.length} inativos`;
  }

  teamMembers.forEach(m => {
    const isActive = m.active !== false && m.status !== 'inactive';
    const card = document.createElement('div');
    card.className = 'member-row-card';
    card.style.opacity = isActive ? '1' : '0.75';
    card.innerHTML = `
      <div class="member-info-left" style="min-width: 0;">
        <div class="member-avatar-circle" style="border-color: ${isActive ? (m.color || '#38bdf8') : '#64748b'}; color: ${isActive ? (m.color || '#38bdf8') : '#94a3b8'};">
          ${m.avatar || '👤'}
        </div>
        <div style="min-width: 0;">
          <div class="member-details-name" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span>${m.name}</span>
            ${isActive
        ? '<span class="badge-tag" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px;">🟢 Ativo</span>'
        : '<span class="badge-tag" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 4px;">⚪ Inativo</span>'
      }
            ${m.github ? `<span style="font-size: 11px; color: #a78bfa; background: rgba(139, 92, 246, 0.1); padding: 1px 6px; border-radius: 4px; font-weight: normal;">🐙 @${m.github}</span>` : ''}
          </div>
          <div class="member-details-role">${m.role || 'Membro da Equipe'}</div>
        </div>
      </div>
      <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
        <button type="button" class="btn btn-secondary btn-sm btn-edit-member" style="padding: 4px 8px; font-size: 11px;" title="Alterar dados do integrante">
          ✏️ Editar
        </button>
        ${isActive
        ? `<button type="button" class="btn btn-warning btn-sm btn-deactivate-member" style="padding: 4px 8px; font-size: 11px;" title="Inativar integrante e transferir tarefas">
              ⏸️ Inativar
            </button>`
        : `<button type="button" class="btn btn-success btn-sm btn-activate-member" style="padding: 4px 8px; font-size: 11px;" title="Reativar integrante na equipe">
              ▶️ Reativar
            </button>`
      }
        <button type="button" class="btn btn-danger btn-sm btn-delete-member" style="padding: 4px 8px; font-size: 11px;" title="Remover integrante">
          🗑️ Excluir
        </button>
      </div>
    `;

    card.querySelector('.btn-edit-member')?.addEventListener('click', () => {
      startEditMember(m);
    });

    card.querySelector('.btn-deactivate-member')?.addEventListener('click', () => {
      openDeactivateModal(m);
    });

    card.querySelector('.btn-activate-member')?.addEventListener('click', async () => {
      await activateMember(m.id);
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

  if (btnSaveMember) {
    btnSaveMember.disabled = true;
    btnSaveMember.innerHTML = '⏳ Salvando...';
  }

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
      await fetchMembers();
      await fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao salvar integrante', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao salvar integrante', 'error');
  } finally {
    if (btnSaveMember) {
      btnSaveMember.disabled = false;
      if (inputMemberEditId && inputMemberEditId.value) {
        btnSaveMember.innerHTML = '💾 Salvar Alterações';
      } else {
        btnSaveMember.innerHTML = '💾 Cadastrar Integrante';
      }
    }
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
        } catch { }
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

// Member Form: Cadastrar / Alterar Integrante e Cancelar Edição
btnSaveMember?.addEventListener('click', saveOrUpdateMember);
btnCancelEditMember?.addEventListener('click', cancelEditMember);

[inputMemberName, inputMemberRole, inputMemberGithub].forEach(input => {
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveOrUpdateMember();
    } else if (e.key === 'Escape') {
      cancelEditMember();
    }
  });
});

// Deactivate & Reactivate Member Handlers
function openDeactivateModal(m) {
  if (!modalDeactivateMember) return;
  if (inputDeactivateMemberId) inputDeactivateMemberId.value = m.id;
  if (deactivateMemberNameLabel) deactivateMemberNameLabel.textContent = m.name;

  // Popula o select com os OUTROS membros ATIVOS
  if (selectDeactivateSuccessor) {
    selectDeactivateSuccessor.innerHTML = '';
    const activeOthers = teamMembers.filter(other =>
      other.id !== m.id &&
      other.name.toLowerCase() !== m.name.toLowerCase() &&
      other.active !== false &&
      other.status !== 'inactive'
    );

    if (activeOthers.length === 0) {
      selectDeactivateSuccessor.innerHTML = '<option value="">⚠️ Nenhum outro integrante ativo disponível</option>';
      if (btnConfirmDeactivate) btnConfirmDeactivate.disabled = true;
    } else {
      if (btnConfirmDeactivate) btnConfirmDeactivate.disabled = false;
      activeOthers.forEach(other => {
        const opt = document.createElement('option');
        opt.value = other.id;
        opt.textContent = `${other.avatar || '👤'} ${other.name} • 🟢 Membro Ativo (${other.role || 'Membro'})`;
        selectDeactivateSuccessor.appendChild(opt);
      });
    }
  }

  modalDeactivateMember.classList.add('open');
}

function closeDeactivateModal() {
  if (modalDeactivateMember) {
    modalDeactivateMember.classList.remove('open');
  }
}

async function confirmDeactivateMember() {
  const memberId = inputDeactivateMemberId?.value.trim();
  const successorId = selectDeactivateSuccessor?.value.trim();
  const scopeEl = document.querySelector('input[name="deactivate-scope"]:checked');
  const transferScope = scopeEl ? scopeEl.value : 'pending';

  if (!memberId) {
    showToast('Identificador do integrante inválido', 'error');
    return;
  }
  if (!successorId) {
    showToast('Selecione um Membro Ativo para assumir as tarefas', 'warning');
    return;
  }

  if (btnConfirmDeactivate) {
    btnConfirmDeactivate.disabled = true;
    btnConfirmDeactivate.innerHTML = '⏳ Repassando tarefas...';
  }

  try {
    const res = await fetch('/api/members/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId,
        reassignTo: successorId,
        transferScope
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      closeDeactivateModal();
      await fetchMembers();
      await fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao inativar integrante', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao inativar integrante', 'error');
  } finally {
    if (btnConfirmDeactivate) {
      btnConfirmDeactivate.disabled = false;
      btnConfirmDeactivate.innerHTML = 'Confirmar e Repassar Tarefas';
    }
  }
}

async function activateMember(memberId) {
  try {
    const res = await fetch('/api/members/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      await fetchMembers();
      await fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao reativar integrante', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao reativar integrante', 'error');
  }
}

// Modal Inativação Listeners
btnCloseDeactivateModal?.addEventListener('click', closeDeactivateModal);
btnCancelDeactivate?.addEventListener('click', closeDeactivateModal);
btnConfirmDeactivate?.addEventListener('click', confirmDeactivateMember);
modalDeactivateMember?.addEventListener('click', (e) => {
  if (e.target === modalDeactivateMember) {
    closeDeactivateModal();
  }
});

// Populate Team / Assignee Selects with active members only
function populateTeamSelects() {
  const activeMembers = teamMembers.filter(m => m.active !== false && m.status !== 'inactive');

  if (selectIdeaTeam) {
    const curVal = selectIdeaTeam.value;
    selectIdeaTeam.innerHTML = '<option value="Todos">👥 Todos</option>';
    activeMembers.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = `${m.avatar || '👤'} ${m.name} (${m.role || 'Membro'})`;
      selectIdeaTeam.appendChild(opt);
    });
    if (curVal && curVal !== 'dev-team') {
      selectIdeaTeam.value = curVal;
    } else {
      selectIdeaTeam.value = 'Todos';
    }
  }

  if (selectTaskAssignee) {
    const curVal = selectTaskAssignee.value;
    selectTaskAssignee.innerHTML = '';
    activeMembers.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = `${m.avatar || '👤'} ${m.name} (${m.role || 'Membro'})`;
      selectTaskAssignee.appendChild(opt);
    });
    const todosOpt = document.createElement('option');
    todosOpt.value = 'Todos';
    todosOpt.textContent = '👥 Todos';
    selectTaskAssignee.appendChild(todosOpt);
    if (curVal && curVal !== 'dev-team') {
      selectTaskAssignee.value = curVal;
    } else {
      selectTaskAssignee.value = 'Todos';
    }
  }

  if (detailNewTaskAssignee) {
    const curVal = detailNewTaskAssignee.value;
    detailNewTaskAssignee.innerHTML = '';
    activeMembers.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = `${m.avatar || '👤'} ${m.name} (${m.role || 'Membro'})`;
      detailNewTaskAssignee.appendChild(opt);
    });
    const todosOpt = document.createElement('option');
    todosOpt.value = 'Todos';
    todosOpt.textContent = '👥 Todos';
    detailNewTaskAssignee.appendChild(todosOpt);
    if (curVal && curVal !== 'dev-team') {
      detailNewTaskAssignee.value = curVal;
    } else {
      detailNewTaskAssignee.value = 'Todos';
    }
  }
}

// Markdown Parser for Details Screen
function renderMarkdownToHtml(markdown) {
  if (!markdown) return '<p style="color: var(--text-dim); font-style: italic;">Nenhum conteúdo na proposta.</p>';

  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Status badges
  html = html
    .replace(/\[APROVADO\]/gi, '<span class="card-tag tag-approved">✅ APROVADO</span>')
    .replace(/\[VALIDADO\]/gi, '<span class="card-tag tag-validated">🔍 VALIDADO</span>')
    .replace(/\[REJEITADO\]/gi, '<span class="card-tag tag-rejected">❌ REJEITADO</span>')
    .replace(/\[CRIADO\]/gi, '<span class="card-tag tag-created">💡 CRIADO</span>');

  // Headings
  html = html
    .replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

  // Checklist items
  html = html
    .replace(/^- \[x\] (.*$)/gim, '<div class="md-task-item"><span style="color: #34d399;">✅</span> <span style="text-decoration: line-through; color: var(--text-dim);">$1</span></div>')
    .replace(/^- \[ \] (.*$)/gim, '<div class="md-task-item"><span style="color: var(--text-dim);">⬜</span> <span>$1</span></div>')
    .replace(/^- (.*$)/gim, '<li style="margin-left: 20px;">$1</li>');

  // Bold & Italics & Code
  html = html
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code class="md-code">$1</code>');

  // Line breaks to paragraphs
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<li')) return p;
    return `<p class="md-p">${p.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return html;
}

// Open Details Modal ("Outra Tela")
function openFeatureDetailsModal(feature, defaultTab = 'proposal') {
  currentDetailFeature = feature;
  if (!modalItemDetails) return;

  const isIdea = currentBoardView === 'ideas';
  if (detailHeaderIcon) detailHeaderIcon.textContent = isIdea ? '💡' : '🎯';
  if (detailHeaderTitle) detailHeaderTitle.textContent = feature.title || feature.name;
  if (detailHeaderSubtitle) detailHeaderSubtitle.textContent = `openspec/changes/${feature.name}/`;

  // Status & Badges
  if (detailBadgeStatus) {
    if (isIdea) {
      const status = feature.ideaStatus || 'Criado';
      detailBadgeStatus.textContent = status.toUpperCase();
      detailBadgeStatus.className = 'card-tag ' + (status === 'Aprovado' ? 'tag-approved' : status === 'Validado' ? 'tag-validated' : status === 'Rejeitado' ? 'tag-rejected' : 'tag-created');
    } else {
      detailBadgeStatus.textContent = feature.kanbanColumn || 'Backlog';
      detailBadgeStatus.className = 'card-tag ' + (feature.kanbanColumn === 'Done' ? 'tag-done' : feature.kanbanColumn === 'In Progress' ? 'tag-progress' : 'tag-backlog');
    }
  }

  if (detailBadgeAssignee) {
    const rawAssignee = (feature.ideaAssignee && isMemberActive(feature.ideaAssignee))
      ? feature.ideaAssignee
      : ((feature.assignees && feature.assignees.find(a => isMemberActive(a))) || 'Todos');
    const assignee = (!rawAssignee || !isMemberActive(rawAssignee) || rawAssignee === 'dev-team') ? 'Todos' : rawAssignee;
    detailBadgeAssignee.textContent = `👥 ${assignee}`;
  }

  if (detailBadgeModified) {
    detailBadgeModified.style.display = feature.isModifiedLocally ? 'inline-flex' : 'none';
  }

  if (detailBadgeBranch) {
    if (feature.isFromGitBranch) {
      detailBadgeBranch.style.display = 'inline-flex';
      detailBadgeBranch.textContent = `🌿 ${feature.branch}`;
    } else {
      detailBadgeBranch.style.display = 'none';
    }
  }

  // Progress
  const total = feature.totalTasks || 0;
  const done = feature.doneTasks || 0;
  const prog = feature.progress || 0;
  if (detailProgressLabel) detailProgressLabel.textContent = `Progresso: ${done}/${total} (${prog}%)`;
  if (detailProgressBar) detailProgressBar.style.width = `${prog}%`;
  if (detailTasksCount) detailTasksCount.textContent = feature.tasks ? feature.tasks.length : 0;

  // Proposal Content
  const proposalText = feature.proposal || `# Feature: ${feature.name}\n\n## Title\n${feature.title || feature.name}\n\n## Summary\n${feature.summary || 'Proposta para Fowlgen Wars.'}\n\n## Status\n[${(feature.ideaStatus || 'CRIADO').toUpperCase()}]\n`;
  if (detailProposalFormatted) detailProposalFormatted.innerHTML = renderMarkdownToHtml(proposalText);
  if (detailProposalRaw) detailProposalRaw.value = proposalText;
  setProposalMode('view');

  // Render Tasks Checklist inside Modal
  renderDetailTasksList(feature);

  // Next Suggested Task ID
  if (detailNewTaskId) {
    const nextIdx = (feature.tasks ? feature.tasks.length : 0) + 1;
    detailNewTaskId.value = `1.${nextIdx}`;
  }
  if (detailNewTaskText) detailNewTaskText.value = '';

  const aprAssignee = (feature.ideaAssignee === 'dev-team' || !feature.ideaAssignee) ? 'Todos' : feature.ideaAssignee;
  if (detailCmdValidate) detailCmdValidate.textContent = `agent validar ideia "${feature.name}"`;
  if (detailCmdApprove) detailCmdApprove.textContent = `agent aprovar ideia "${feature.name}" "${aprAssignee}"`;
  if (detailCmdReject) detailCmdReject.textContent = `agent rejeitar ideia "${feature.name}" "Fora do escopo"`;
  if (detailCmdList) detailCmdList.textContent = `agent listar openspec/changes/${feature.name}/tasks.md`;

  // Footer Actions
  renderDetailFooterActions(feature);

  // Switch to default Tab
  switchDetailTab(defaultTab);

  // Open Modal
  modalItemDetails.classList.add('open');
}

function closeFeatureDetailsModal() {
  if (modalItemDetails) modalItemDetails.classList.remove('open');
  currentDetailFeature = null;
}

function renderDetailTasksList(feature) {
  if (!detailTasksList) return;
  detailTasksList.innerHTML = '';

  if (!feature.tasks || feature.tasks.length === 0) {
    detailTasksList.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-dim);">Nenhuma tarefa cadastrada em tasks.md.<br><span style="font-size: 12px;">Adicione uma tarefa no formulário abaixo!</span></div>`;
    return;
  }

  feature.tasks.forEach(t => {
    const card = document.createElement('div');
    card.className = `detail-task-card ${t.done ? 'done' : ''}`;

    const cleanText = t.text.replace(/\(([^)]+)\)|@([\w-]+)|\[([\w-]+)\]/g, '').trim();
    const activeTaskAssignee = (t.assignee && isMemberActive(t.assignee)) ? t.assignee : '';
    const assigneeHtml = activeTaskAssignee
      ? `<span class="badge-tag" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 11px;">👤 ${activeTaskAssignee}</span>`
      : '';

    const promptHtml = t.prompt
      ? `<div class="task-prompt-box">
          <div class="prompt-header">
            <span style="color: #c084fc; font-weight: 600;">🤖 Prompt / Instruções:</span>
            <button type="button" class="btn-copy-prompt" title="Copiar prompt completo para a área de transferência">📋 Copiar Prompt</button>
          </div>
          <div class="prompt-text" style="white-space: pre-wrap; font-family: var(--font-mono); font-size: 12px; color: #cbd5e1;">${escapeHtml(t.prompt)}</div>
        </div>`
      : '';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <label class="detail-task-label" style="flex: 1;">
          <input type="checkbox" ${t.done ? 'checked' : ''} ${feature.isFromGitBranch ? 'disabled' : ''} class="detail-task-chk" data-task-id="${t.id}">
          <span><strong>${t.id ? '**' + t.id + '**' : ''}</strong> ${cleanText || t.text}</span>
        </label>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${assigneeHtml}
        </div>
      </div>
      ${promptHtml}
    `;

    card.querySelector('.btn-copy-prompt')?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(t.prompt).then(() => {
        showToast('Prompt copiado para a área de transferência!', 'success');
      }).catch(() => {
        showToast('Não foi possível copiar o prompt', 'error');
      });
    });

    card.querySelector('.detail-task-chk')?.addEventListener('change', async (e) => {
      const isDone = e.target.checked;
      await updateTaskStatusDirect(feature.name, t.id, isDone);
      t.done = isDone;
      card.classList.toggle('done', isDone);
      const doneCount = feature.tasks.filter(x => x.done).length;
      feature.doneTasks = doneCount;
      feature.progress = Math.round((doneCount / feature.tasks.length) * 100);
      if (detailProgressLabel) detailProgressLabel.textContent = `Progresso: ${feature.doneTasks}/${feature.totalTasks} (${feature.progress}%)`;
      if (detailProgressBar) detailProgressBar.style.width = `${feature.progress}%`;
    });

    detailTasksList.appendChild(card);
  });
}

function renderDetailFooterActions(feature) {
  if (!detailFooterActions) return;
  detailFooterActions.innerHTML = '';

  if (currentBoardView === 'ideas') {
    const btnVal = document.createElement('button');
    btnVal.className = 'btn btn-secondary btn-sm';
    btnVal.innerHTML = '🔍 Validar Ideia';
    btnVal.onclick = async () => {
      await triggerIdeaAction(feature.name, 'validate');
      feature.ideaStatus = 'Validado';
      openFeatureDetailsModal(feature, 'proposal');
    };
    detailFooterActions.appendChild(btnVal);

    const btnApp = document.createElement('button');
    btnApp.className = 'btn btn-success btn-sm';
    btnApp.innerHTML = '✅ Aprovar Ideia';
    btnApp.onclick = async () => {
      const rawAssignee = feature.ideaAssignee || (selectIdeaTeam ? selectIdeaTeam.value : 'Todos');
      const assignee = (rawAssignee === 'dev-team') ? 'Todos' : rawAssignee;
      await triggerIdeaAction(feature.name, 'approve', assignee);
      feature.ideaStatus = 'Aprovado';
      openFeatureDetailsModal(feature, 'proposal');
    };
    detailFooterActions.appendChild(btnApp);

    const btnRej = document.createElement('button');
    btnRej.className = 'btn btn-danger btn-sm';
    btnRej.innerHTML = '❌ Rejeitar';
    btnRej.onclick = async () => {
      const reason = prompt(`Motivo da rejeição da ideia "${feature.name}":`, 'Fora do escopo da sprint atual');
      if (reason !== null) {
        await triggerIdeaAction(feature.name, 'reject', undefined, reason);
        feature.ideaStatus = 'Rejeitado';
        openFeatureDetailsModal(feature, 'proposal');
      }
    };
    detailFooterActions.appendChild(btnRej);
  } else {
    const btnTasks = document.createElement('button');
    btnTasks.className = 'btn btn-primary btn-sm';
    btnTasks.innerHTML = '🎯 Ir para Funil de Ideias';
    btnTasks.onclick = () => {
      closeFeatureDetailsModal();
      setBoardView('ideas');
    };
    detailFooterActions.appendChild(btnTasks);
  }
}

function switchDetailTab(tabName) {
  const map = {
    'proposal': { btnId: 'detail-tab-proposal', secId: 'detail-view-proposal' },
    'tasks': { btnId: 'detail-tab-tasks', secId: 'detail-view-tasks' },
    'commands': { btnId: 'detail-tab-commands', secId: 'detail-view-commands' }
  };
  const item = map[tabName] || map['proposal'];
  document.querySelectorAll('#modal-item-details .modal-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(item.btnId)?.classList.add('active');
  document.querySelectorAll('#modal-item-details .modal-view-section').forEach(s => s.style.display = 'none');
  const sec = document.getElementById(item.secId);
  if (sec) sec.style.display = 'block';
}

function setProposalMode(mode) {
  if (mode === 'edit') {
    if (detailProposalFormatted) detailProposalFormatted.style.display = 'none';
    if (detailProposalRaw) detailProposalRaw.style.display = 'block';
    if (btnSaveProposalContent) btnSaveProposalContent.style.display = 'inline-flex';
    if (btnProposalModeEdit) btnProposalModeEdit.classList.add('active');
    if (btnProposalModeView) btnProposalModeView.classList.remove('active');
  } else {
    if (detailProposalRaw && detailProposalFormatted) {
      detailProposalFormatted.innerHTML = renderMarkdownToHtml(detailProposalRaw.value);
    }
    if (detailProposalFormatted) detailProposalFormatted.style.display = 'block';
    if (detailProposalRaw) detailProposalRaw.style.display = 'none';
    if (btnSaveProposalContent) btnSaveProposalContent.style.display = 'none';
    if (btnProposalModeView) btnProposalModeView.classList.add('active');
    if (btnProposalModeEdit) btnProposalModeEdit.classList.remove('active');
  }
}

// Modal Detail Event Listeners
document.querySelectorAll('#modal-item-details .modal-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    if (target) {
      document.querySelectorAll('#modal-item-details .modal-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#modal-item-details .modal-view-section').forEach(s => s.style.display = 'none');
      const targetSec = document.getElementById(target);
      if (targetSec) targetSec.style.display = 'block';
    }
  });
});

btnProposalModeView?.addEventListener('click', () => setProposalMode('view'));
btnProposalModeEdit?.addEventListener('click', () => setProposalMode('edit'));

btnSaveProposalContent?.addEventListener('click', async () => {
  if (!currentDetailFeature) return;
  const content = detailProposalRaw.value;
  try {
    const res = await fetch('/api/features/update-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: currentDetailFeature.name, content })
    });
    const data = await res.json();
    if (data.success) {
      currentDetailFeature.proposal = content;
      showToast('Proposta atualizada no proposal.md!', 'success');
      appendLog(`Proposta de "${currentDetailFeature.name}" salva.`);
      setProposalMode('view');
      fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao salvar proposta', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao salvar proposta', 'error');
  }
});

btnDetailAddTask?.addEventListener('click', async () => {
  if (!currentDetailFeature) return;
  const taskId = detailNewTaskId ? detailNewTaskId.value.trim() : '';
  const text = detailNewTaskText ? detailNewTaskText.value.trim() : '';
  const assignee = detailNewTaskAssignee ? (detailNewTaskAssignee.value || 'Todos') : 'Todos';

  if (!text) {
    showToast('Informe a descrição da nova tarefa', 'warning');
    detailNewTaskText?.focus();
    return;
  }

  try {
    const res = await fetch('/api/tasks/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature: currentDetailFeature.name,
        taskId: taskId || '',
        text: text,
        assignee: assignee !== 'Todos' ? assignee : undefined
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      if (!currentDetailFeature.tasks) currentDetailFeature.tasks = [];
      currentDetailFeature.tasks.push({
        id: taskId,
        text,
        done: false,
        status: 'Backlog',
        assignee
      });
      currentDetailFeature.totalTasks = currentDetailFeature.tasks.length;
      renderDetailTasksList(currentDetailFeature);
      if (detailNewTaskText) detailNewTaskText.value = '';
      if (detailNewTaskId) {
        const parts = taskId.split('.');
        if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
          detailNewTaskId.value = `${parts[0]}.${parseInt(parts[1]) + 1}`;
        }
      }
      fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao adicionar tarefa', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao criar tarefa', 'error');
  }
});

btnCloseDetails?.addEventListener('click', closeFeatureDetailsModal);
btnCloseDetailsFooter?.addEventListener('click', closeFeatureDetailsModal);
modalItemDetails?.addEventListener('click', (e) => {
  if (e.target === modalItemDetails) closeFeatureDetailsModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modalItemDetails && modalItemDetails.classList.contains('open')) {
      closeFeatureDetailsModal();
    }
    if (modalDashboardView && modalDashboardView.classList.contains('open')) {
      closeDashboardModal();
    }
  }
});

document.querySelectorAll('.btn-copy-detail-cmd').forEach(btn => {
  btn.addEventListener('click', async () => {
    const targetId = btn.getAttribute('data-target');
    const el = document.getElementById(targetId);
    if (el) {
      try {
        await navigator.clipboard.writeText(el.textContent);
        showToast('Comando copiado para a área de transferência!', 'success');
      } catch {
        showToast('Não foi possível copiar o comando', 'warning');
      }
    }
  });
});

// Sidebar Collapse / Expand Logic
function toggleSidebar(forceState) {
  const container = document.querySelector('.app-container');
  if (!container) return;
  const isCollapsed = forceState !== undefined
    ? forceState
    : !container.classList.contains('sidebar-collapsed');

  container.classList.toggle('sidebar-collapsed', isCollapsed);
  try {
    localStorage.setItem('kanban_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  } catch { }
  updateSidebarToggleButtons(isCollapsed);
}

function updateSidebarToggleButtons(isCollapsed) {
  const btnTop = document.getElementById('btn-toggle-sidebar-top');
  if (btnTop) {
    btnTop.innerHTML = isCollapsed ? '⚡ Mostrar Painel' : '⚡ Ocultar Painel';
    btnTop.classList.toggle('active', !isCollapsed);
  }
  const btnKanban = document.getElementById('btn-toggle-sidebar-kanban');
  if (btnKanban) {
    btnKanban.innerHTML = isCollapsed
      ? '<span class="toggle-icon">▶</span> <span class="toggle-label">Abrir Painel OpenSpec</span>'
      : '<span class="toggle-icon">◀</span> <span class="toggle-label">Recolher Painel</span>';
    btnKanban.classList.toggle('collapsed', isCollapsed);
  }
}

const btnToggleTop = document.getElementById('btn-toggle-sidebar-top');
const btnToggleKanban = document.getElementById('btn-toggle-sidebar-kanban');
const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');

btnToggleTop?.addEventListener('click', () => toggleSidebar());
btnToggleKanban?.addEventListener('click', () => toggleSidebar());
btnCollapseSidebar?.addEventListener('click', () => toggleSidebar(true));

// Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    e.preventDefault();
    toggleSidebar();
  }
});

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
  try {
    const savedSidebarState = localStorage.getItem('kanban_sidebar_collapsed');
    if (savedSidebarState === 'true') {
      toggleSidebar(true);
    } else {
      updateSidebarToggleButtons(false);
    }
  } catch { }
  fetchGitInfo();
  fetchMembers();
  fetchFeatures();
  loadConfig();
  updateCommandPreview();
});




