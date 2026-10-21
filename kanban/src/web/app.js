// Fowlgen Wars - OpenSpec & Kanban Studio Client

let currentFeatures = [];
let teamMembers = [];
let activeTab = 'tasks';
let lastGeneratedCommand = '';

function isMemberActive(name) {
  if (!name || name === 'Todos' || name === 'dev-team') return true;
  if (typeof name === 'string' && (name.includes(',') || name.includes('/'))) {
    return name.split(/[,/]+/).map(s => s.trim()).some(s => isMemberActive(s));
  }
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
const selectTaskDirectory = document.getElementById('select-task-directory');
const inputTaskId = document.getElementById('input-task-id');
const selectTaskStatus = document.getElementById('select-task-status');
const selectTaskAssignee = document.getElementById('select-task-assignee');
const inputTaskAssignee = document.getElementById('input-task-assignee') || selectTaskAssignee;
const inputTaskText = document.getElementById('input-task-text');
const taskEditingBanner = document.getElementById('task-editing-banner');
const editingTaskIdLabel = document.getElementById('editing-task-id-label');
const btnCancelTaskEdit = document.getElementById('btn-cancel-task-edit');
const btnActionDeleteTask = document.getElementById('btn-action-delete-task');
let editingTaskInfo = null;

// Multi-Select Assignee State & Elements
let selectedTaskAssignees = [];
const multiAssigneeContainer = document.getElementById('multi-assignee-container');
const multiAssigneeTrigger = document.getElementById('multi-assignee-trigger');
const multiAssigneeDropdown = document.getElementById('multi-assignee-dropdown');
const multiAssigneeValues = document.getElementById('multi-assignee-values');
const multiAssigneeOptions = document.getElementById('multi-assignee-options');
const multiAssigneeSearch = document.getElementById('multi-assignee-search');
const assigneeCountBadge = document.getElementById('assignee-count-badge');

function updateMultiAssigneeTriggerDisplay() {
  if (!multiAssigneeValues) return;
  multiAssigneeValues.innerHTML = '';

  if (selectedTaskAssignees.length === 0) {
    const placeholder = document.createElement('span');
    placeholder.className = 'multi-select-placeholder';
    placeholder.textContent = '👤 Responsáveis... *';
    multiAssigneeValues.appendChild(placeholder);
    if (selectTaskAssignee) selectTaskAssignee.value = '';
    if (assigneeCountBadge) assigneeCountBadge.style.display = 'none';
  } else {
    if (multiAssigneeTrigger) multiAssigneeTrigger.classList.remove('has-error');
    if (selectTaskAssignee) selectTaskAssignee.value = selectedTaskAssignees.join(', ');
    if (assigneeCountBadge) {
      assigneeCountBadge.textContent = `${selectedTaskAssignees.length} selecionado(s)`;
      assigneeCountBadge.style.display = 'inline';
    }

    selectedTaskAssignees.forEach(name => {
      const member = teamMembers.find(m => m.name.toLowerCase() === name.toLowerCase());
      const avatar = member?.avatar || '👤';
      const chip = document.createElement('span');
      chip.className = 'multi-select-chip';
      chip.innerHTML = `<span>${avatar} ${escapeHtml(name)}</span><span class="chip-remove" title="Remover">&times;</span>`;
      chip.querySelector('.chip-remove')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTaskAssignee(name, false);
      });
      multiAssigneeValues.appendChild(chip);
    });
  }

  updateCommandPreview();
}

function toggleTaskAssignee(name, forceState) {
  const cleanName = (name || '').trim();
  if (!cleanName) return;

  const exists = selectedTaskAssignees.some(n => n.toLowerCase() === cleanName.toLowerCase());
  const shouldSelect = (forceState !== undefined) ? forceState : !exists;

  if (shouldSelect && !exists) {
    selectedTaskAssignees.push(cleanName);
  } else if (!shouldSelect && exists) {
    selectedTaskAssignees = selectedTaskAssignees.filter(n => n.toLowerCase() !== cleanName.toLowerCase());
  }

  updateMultiAssigneeTriggerDisplay();
  populateMultiAssigneeDropdown(multiAssigneeSearch ? multiAssigneeSearch.value.trim() : '');
}

function populateMultiAssigneeDropdown(filterText = '') {
  if (!multiAssigneeOptions) return;
  multiAssigneeOptions.innerHTML = '';

  const activeMembers = teamMembers.filter(m => m.active !== false && m.status !== 'inactive');
  const searchLower = filterText.toLowerCase();

  const filteredMembers = activeMembers.filter(m => {
    if (!searchLower) return true;
    return m.name.toLowerCase().includes(searchLower) ||
      (m.role && m.role.toLowerCase().includes(searchLower)) ||
      (m.id && m.id.toLowerCase().includes(searchLower));
  });

  if (filteredMembers.length === 0) {
    const emptyNotice = document.createElement('div');
    emptyNotice.style.padding = '10px';
    emptyNotice.style.fontSize = '12px';
    emptyNotice.style.color = 'var(--text-dim)';
    emptyNotice.style.textAlign = 'center';
    emptyNotice.textContent = 'Nenhum membro encontrado';
    multiAssigneeOptions.appendChild(emptyNotice);
    return;
  }

  filteredMembers.forEach(m => {
    const isSelected = selectedTaskAssignees.some(n => n.toLowerCase() === m.name.toLowerCase());
    const opt = document.createElement('div');
    opt.className = `multi-select-option ${isSelected ? 'selected' : ''}`;
    opt.innerHTML = `
      <input type="checkbox" ${isSelected ? 'checked' : ''}>
      <span class="option-avatar">${m.avatar || '👤'}</span>
      <div class="option-text-group">
        <span class="option-name">${escapeHtml(m.name)}</span>
        <span class="option-role">${escapeHtml(m.role || 'Membro')}</span>
      </div>
    `;

    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTaskAssignee(m.name);
    });

    const chk = opt.querySelector('input[type="checkbox"]');
    if (chk) {
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTaskAssignee(m.name, chk.checked);
      });
    }

    multiAssigneeOptions.appendChild(opt);
  });
}

// =============================================================
// Reusable Confirmation Modal System
// =============================================================
const modalConfirmAction = document.getElementById('modal-confirm-action');
const confirmModalTitleText = document.getElementById('confirm-modal-title-text');
const confirmModalIcon = document.getElementById('confirm-modal-icon');
const confirmModalMessage = document.getElementById('confirm-modal-message');
const confirmModalWarning = document.getElementById('confirm-modal-warning');
const confirmModalInputContainer = document.getElementById('confirm-modal-input-container');
const confirmModalInputLabel = document.getElementById('confirm-modal-input-label');
const confirmModalInput = document.getElementById('confirm-modal-input');
const btnConfirmModalCancel = document.getElementById('btn-confirm-modal-cancel');
const btnConfirmModalConfirm = document.getElementById('btn-confirm-modal-confirm');
const btnConfirmModalClose = document.getElementById('btn-confirm-modal-close');

let confirmModalResolver = null;

function showConfirmModal({
  title = 'Confirmar Ação',
  icon = '⚠️',
  message = 'Tem certeza que deseja prosseguir com esta ação?',
  warning = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmBtnClass = 'btn-primary',
  withInput = false,
  inputLabel = 'Motivo / Observação:',
  inputPlaceholder = 'Digite aqui...',
  inputDefault = ''
} = {}) {
  return new Promise((resolve) => {
    confirmModalResolver = resolve;

    if (confirmModalTitleText) confirmModalTitleText.textContent = title;
    if (confirmModalIcon) confirmModalIcon.textContent = icon;
    if (confirmModalMessage) {
      const escaped = escapeHtml(message);
      confirmModalMessage.innerHTML = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    if (confirmModalWarning) {
      if (warning) {
        confirmModalWarning.textContent = warning;
        confirmModalWarning.style.display = 'block';
      } else {
        confirmModalWarning.style.display = 'none';
      }
    }

    if (confirmModalInputContainer && confirmModalInput) {
      if (withInput) {
        if (confirmModalInputLabel) confirmModalInputLabel.textContent = inputLabel;
        confirmModalInput.placeholder = inputPlaceholder;
        confirmModalInput.value = inputDefault;
        confirmModalInputContainer.style.display = 'block';
      } else {
        confirmModalInputContainer.style.display = 'none';
      }
    }

    if (btnConfirmModalConfirm) {
      btnConfirmModalConfirm.textContent = confirmText;
      btnConfirmModalConfirm.className = `btn btn-sm ${confirmBtnClass}`;
    }
    if (btnConfirmModalCancel) {
      btnConfirmModalCancel.textContent = cancelText;
    }

    if (modalConfirmAction) {
      modalConfirmAction.classList.add('open');
      if (withInput && confirmModalInput) {
        setTimeout(() => confirmModalInput.focus(), 60);
      } else {
        setTimeout(() => btnConfirmModalConfirm?.focus(), 60);
      }
    }
  });
}

function closeConfirmModal(result) {
  if (modalConfirmAction) modalConfirmAction.classList.remove('open');
  if (confirmModalResolver) {
    const resolver = confirmModalResolver;
    confirmModalResolver = null;
    resolver(result);
  }
}

if (btnConfirmModalConfirm) {
  btnConfirmModalConfirm.addEventListener('click', () => {
    if (confirmModalInputContainer && confirmModalInputContainer.style.display !== 'none' && confirmModalInput) {
      const val = confirmModalInput.value.trim();
      closeConfirmModal(val || true);
    } else {
      closeConfirmModal(true);
    }
  });
}

if (btnConfirmModalCancel) {
  btnConfirmModalCancel.addEventListener('click', () => {
    closeConfirmModal(false);
  });
}

if (btnConfirmModalClose) {
  btnConfirmModalClose.addEventListener('click', () => {
    closeConfirmModal(false);
  });
}

if (modalConfirmAction) {
  modalConfirmAction.addEventListener('click', (e) => {
    if (e.target === modalConfirmAction) {
      closeConfirmModal(false);
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalConfirmAction && modalConfirmAction.classList.contains('open')) {
    closeConfirmModal(false);
  }
  if (e.key === 'Enter' && modalConfirmAction && modalConfirmAction.classList.contains('open') && e.target === confirmModalInput) {
    btnConfirmModalConfirm?.click();
  }
});

function startEditingTask(featureName, task) {
  if (!task) return;
  editingTaskInfo = { feature: featureName, taskId: task.id };

  if (selectFeatureTask) selectFeatureTask.value = featureName || 'tarefas-gerais';
  if (selectTaskDirectory) {
    selectTaskDirectory.value = (task.directory && task.directory !== 'geral') ? task.directory : '';
  }
  if (inputTaskId) inputTaskId.value = task.id || '';
  if (selectTaskStatus) selectTaskStatus.value = task.done ? 'Concluído' : 'Backlog';
  if (task.assignee) {
    const rawAss = (task.assignee || '').trim().replace(/^@/, '');
    if (rawAss && rawAss !== 'Todos') {
      const parts = rawAss.split(/[,/]+/).map(s => s.trim().replace(/^@/, '')).filter(Boolean);
      selectedTaskAssignees = parts;
    } else {
      selectedTaskAssignees = [];
    }
  } else {
    selectedTaskAssignees = [];
  }
  updateMultiAssigneeTriggerDisplay();
  populateMultiAssigneeDropdown(multiAssigneeSearch ? multiAssigneeSearch.value.trim() : '');

  const cleanText = (task.text || '').replace(/\(([^)]+)\)|@([\w-]+)|\[([\w-]+)\]/g, '').trim();
  const fullContent = task.prompt ? `${cleanText}\n${task.prompt}` : cleanText;
  if (inputTaskText) {
    inputTaskText.value = fullContent;
  }

  if (taskEditingBanner) {
    taskEditingBanner.style.display = 'flex';
  }
  if (editingTaskIdLabel) {
    editingTaskIdLabel.textContent = `${task.id || 'Avulsa'} (${featureName})`;
  }
  if (btnActionDeleteTask) {
    btnActionDeleteTask.style.display = 'inline-flex';
  }

  const btnTabTasks = document.querySelector('.tab-btn[data-tab="tasks"]');
  if (btnTabTasks) btnTabTasks.click();

  if (inputTaskText) {
    inputTaskText.focus();
  }

  const sidebar = document.querySelector('.control-panel');
  if (sidebar) sidebar.scrollTo({ top: 0, behavior: 'smooth' });

  showToast(`Tarefa ${task.id} carregada no formulário para alteração!`, 'info');
}

function clearTaskForm(silent = true) {
  editingTaskInfo = null;
  if (taskEditingBanner) taskEditingBanner.style.display = 'none';
  if (btnActionDeleteTask) btnActionDeleteTask.style.display = 'none';
  if (inputTaskId) inputTaskId.value = '';
  if (inputTaskText) inputTaskText.value = '';
  if (selectTaskStatus) selectTaskStatus.value = 'Backlog';
  if (selectTaskDirectory) {
    selectTaskDirectory.value = '';
    selectTaskDirectory.classList.remove('has-error');
  }
  updateTaskDirectoryPlaceholder();
  selectedTaskAssignees = [];
  if (selectTaskAssignee) selectTaskAssignee.value = '';
  if (inputTaskAssignee) inputTaskAssignee.value = '';
  if (multiAssigneeSearch) multiAssigneeSearch.value = '';
  if (multiAssigneeTrigger) {
    multiAssigneeTrigger.classList.remove('has-error');
    multiAssigneeTrigger.classList.remove('active');
  }
  if (multiAssigneeDropdown) multiAssigneeDropdown.style.display = 'none';
  updateMultiAssigneeTriggerDisplay();
  populateMultiAssigneeDropdown(multiAssigneeSearch ? multiAssigneeSearch.value.trim() : '');
  updateCommandPreview();
  if (!silent) {
    showToast('Formulário de tarefa limpo.', 'info');
  }
}

function cancelEditingTask() {
  clearTaskForm(true);
  showToast('Modo de alteração cancelado.', 'info');
}

const inputIdeaTitle = document.getElementById('input-idea-title');
const inputIdeaId = document.getElementById('input-idea-id');
const inputIdeaPrompt = document.getElementById('input-idea-prompt');
const selectIdeaDirectory = document.getElementById('select-idea-directory');
const selectIdeaTeam = document.getElementById('select-idea-team');
const inputIdeaTeam = document.getElementById('input-idea-team') || selectIdeaTeam;
const inputIdeaReason = document.getElementById('input-idea-reason');
const btnSlugifyTitle = document.getElementById('btn-slugify-title');

function clearIdeaForm(silent = true) {
  if (inputIdeaTitle) inputIdeaTitle.value = '';
  if (inputIdeaId) inputIdeaId.value = '';
  if (inputIdeaPrompt) inputIdeaPrompt.value = '';
  if (selectIdeaDirectory) {
    selectIdeaDirectory.value = '';
    selectIdeaDirectory.classList.remove('has-error');
  }
  if (selectIdeaTeam) selectIdeaTeam.value = 'Todos';
  if (inputIdeaTeam && inputIdeaTeam !== selectIdeaTeam) inputIdeaTeam.value = 'Todos';
  if (inputIdeaReason) inputIdeaReason.value = '';
  userManuallyEditedId = false;
  updateCommandPreview();
  if (!silent) {
    showToast('Formulário de ideia limpo.', 'info');
  }
}

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
const detailNewTaskDirectory = document.getElementById('detail-new-task-directory');
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

// Resolve o ID da ideia priorizando o campo ID, depois gerando do Título, e opcionalmente do seletor
function resolveTargetIdeaId(allowSelector = true) {
  let id = inputIdeaId ? inputIdeaId.value.trim() : '';
  if (!id && inputIdeaTitle && inputIdeaTitle.value.trim()) {
    id = slugify(inputIdeaTitle.value.trim());
    if (inputIdeaId) inputIdeaId.value = id;
  }
  if (allowSelector && !id && selectFeatureTask && selectFeatureTask.value) {
    const val = selectFeatureTask.value.trim();
    if (val && val !== 'tarefas-gerais') {
      id = val;
    }
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
const btnPushGit = document.getElementById('btn-push-git');
const btnResetRepoLocal = document.getElementById('btn-reset-repo-local');

// Board View State: 'tasks' (Tarefas da Sprint) vs 'ideas' (Funil de Ideias) vs 'analytics' (Analytics & Métricas)
let currentBoardView = 'tasks';
let currentAssigneeFilter = 'all';
let currentDirectoryFilter = 'all';
let projectDirectories = [];

// Directory Filter DOM Elements
const directoryFilterPillsContainer = document.getElementById('directory-filter-pills');
const btnQuickManageDirectories = document.getElementById('btn-quick-manage-directories');
const modalManageDirectories = document.getElementById('modal-manage-directories');
const btnCloseDirectoriesModal = document.getElementById('btn-close-directories-modal');
const btnCancelDirectories = document.getElementById('btn-cancel-directories');
const btnSaveNewDirectory = document.getElementById('btn-save-new-directory');
const inputNewDirName = document.getElementById('input-new-dir-name');
const inputNewDirIcon = document.getElementById('input-new-dir-icon');
const inputNewDirPath = document.getElementById('input-new-dir-path');
const modalDirectoriesList = document.getElementById('modal-directories-list');
const directoriesCountBadge = document.getElementById('directories-count-badge');


// Kanban Search State & Elements (Tarefas e Ideias)
let kanbanSearchQuery = '';
const inputSearchKanban = document.getElementById('input-search-kanban');
const btnClearKanbanSearch = document.getElementById('btn-clear-kanban-search');
const kanbanSearchCountBadge = document.getElementById('kanban-search-count-badge');
const kanbanSearchEmptyState = document.getElementById('kanban-search-empty-state');
const emptyStateSearchTitle = document.getElementById('empty-state-search-title');
const emptyStateSearchDesc = document.getElementById('empty-state-search-desc');
const btnClearSearchEmpty = document.getElementById('btn-clear-search-empty');

function updateSearchPlaceholder() {
  if (!inputSearchKanban) return;
  if (currentBoardView === 'tasks') {
    inputSearchKanban.placeholder = 'Pesquisar tarefas no Kanban... (Ctrl+F)';
    inputSearchKanban.title = 'Pesquisar tarefas por texto, prompt, ID ou responsável (Atalho: Ctrl+F ou /)';
  } else if (currentBoardView === 'ideas') {
    inputSearchKanban.placeholder = 'Pesquisar ideias no Kanban... (Ctrl+F)';
    inputSearchKanban.title = 'Pesquisar ideias por título, ID, briefing ou status (Atalho: Ctrl+F ou /)';
  } else {
    inputSearchKanban.placeholder = 'Filtrar features no Analytics... (Ctrl+F)';
    inputSearchKanban.title = 'Filtrar features e entregas da sprint';
  }
}

function clearKanbanSearch() {
  kanbanSearchQuery = '';
  if (inputSearchKanban) {
    inputSearchKanban.value = '';
    inputSearchKanban.focus();
  }
  if (btnClearKanbanSearch) {
    btnClearKanbanSearch.style.display = 'none';
  }
  if (kanbanSearchCountBadge) {
    kanbanSearchCountBadge.style.display = 'none';
  }
  if (kanbanSearchEmptyState) {
    kanbanSearchEmptyState.style.display = 'none';
  }
  if (currentBoardView === 'analytics') {
    renderAnalyticsDashboard(currentFeatures);
  } else {
    renderFeatures(currentFeatures);
  }
}

if (inputSearchKanban) {
  inputSearchKanban.addEventListener('input', (e) => {
    kanbanSearchQuery = e.target.value.trim().toLowerCase();
    if (btnClearKanbanSearch) {
      btnClearKanbanSearch.style.display = kanbanSearchQuery ? 'inline-flex' : 'none';
    }
    if (currentBoardView === 'analytics') {
      renderAnalyticsDashboard(currentFeatures);
    } else {
      renderFeatures(currentFeatures);
    }
  });
}

if (btnClearKanbanSearch) {
  btnClearKanbanSearch.addEventListener('click', clearKanbanSearch);
}
if (btnClearSearchEmpty) {
  btnClearSearchEmpty.addEventListener('click', clearKanbanSearch);
}

// Atalho global Ctrl+F, Ctrl+K ou "/" para focar rapidamente na busca do Kanban
document.addEventListener('keydown', (e) => {
  const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  if ((e.ctrlKey && (e.key === 'f' || e.key === 'k')) || (e.key === '/' && !isInputActive)) {
    if (inputSearchKanban) {
      e.preventDefault();
      inputSearchKanban.focus();
      inputSearchKanban.select();
    }
  } else if (e.key === 'Escape' && document.activeElement === inputSearchKanban) {
    clearKanbanSearch();
  }
});

const btnViewTasks = document.getElementById('btn-view-tasks');
const btnViewIdeas = document.getElementById('btn-view-ideas');
const btnViewAnalytics = document.getElementById('btn-view-analytics');
const btnViewGit = document.getElementById('btn-view-git');
const badgeGitViewCount = document.getElementById('badge-git-view-count');
const kanbanColumnsContainer = document.querySelector('.kanban-columns');
const analyticsDashboardContainer = document.getElementById('analytics-dashboard-container');
const kanbanSearchWrapper = document.querySelector('.kanban-search-wrapper');
const memberFilterBar = document.querySelector('.member-filter-bar');
const directoryFilterBar = document.querySelector('.directory-filter-bar');
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
  const assignee = selectedTaskAssignees.length > 0
    ? selectedTaskAssignees.join(', ')
    : (selectTaskAssignee?.value || '').trim();

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
[selectFeatureTask, selectTaskDirectory, inputTaskId, selectTaskStatus, selectTaskAssignee, inputTaskAssignee, inputTaskText,
  selectIdeaDirectory, inputIdeaId, inputIdeaTitle, inputIdeaPrompt, selectIdeaTeam, inputIdeaTeam, inputIdeaReason].forEach(input => {
    if (input) {
      input.addEventListener('input', () => updateCommandPreview());
      input.addEventListener('change', () => updateCommandPreview());
    }
  });

// Multi-Select Assignee Event Listeners
if (multiAssigneeTrigger) {
  multiAssigneeTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = !multiAssigneeDropdown || multiAssigneeDropdown.style.display === 'none';
    if (multiAssigneeDropdown) {
      multiAssigneeDropdown.style.display = isHidden ? 'block' : 'none';
    }
    multiAssigneeTrigger.classList.toggle('active', isHidden);
    if (isHidden && multiAssigneeSearch) {
      multiAssigneeSearch.value = '';
      populateMultiAssigneeDropdown('');
      setTimeout(() => multiAssigneeSearch.focus(), 50);
    }
  });
}

if (multiAssigneeSearch) {
  multiAssigneeSearch.addEventListener('input', () => {
    populateMultiAssigneeDropdown(multiAssigneeSearch.value.trim());
  });
  multiAssigneeSearch.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

document.addEventListener('click', (e) => {
  if (multiAssigneeContainer && !multiAssigneeContainer.contains(e.target)) {
    if (multiAssigneeDropdown) multiAssigneeDropdown.style.display = 'none';
    if (multiAssigneeTrigger) multiAssigneeTrigger.classList.remove('active');
  }
});

// Clipboard Copy com validação para nunca copiar placeholders
document.getElementById('btn-copy-command')?.addEventListener('click', async () => {
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
document.getElementById('btn-clear-log')?.addEventListener('click', async () => {
  if (!executionLog || !executionLog.textContent.trim()) return;
  const confirmed = await showConfirmModal({
    title: 'Limpar Logs de Execução',
    icon: '🧹',
    message: 'Deseja realmente limpar todos os logs do terminal de execução desta sessão?',
    confirmText: 'Sim, Limpar',
    confirmBtnClass: 'btn-secondary'
  });
  if (confirmed) {
    executionLog.textContent = '';
    showToast('Logs de execução limpos.', 'info');
  }
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
      btnCommitOpenspec.innerHTML = `💾 Commit Local (${count})`;
      btnCommitOpenspec.className = 'btn btn-save btn-sm has-pending';
      btnCommitOpenspec.title = `Commitar ${count} alteração(ões) pendente(s) localmente no Git`;
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
      btnCommitOpenspec.innerHTML = `💾 Commit Local`;
      btnCommitOpenspec.className = 'btn btn-save btn-sm';
      btnCommitOpenspec.title = `Nenhuma alteração pendente de commit local`;
    }
  }

  // Atualiza estado do botão Git Push / Baixar do Repo
  if (btnPushGit) {
    if (data.behindCommits && data.behindCommits > 0) {
      btnPushGit.innerHTML = `⬇️ Baixar do Repo (${data.behindCommits})`;
      btnPushGit.className = 'btn btn-pull btn-sm';
      btnPushGit.title = `O repositório remoto foi modificado com ${data.behindCommits} novo(s) commit(s). Clique para baixar e sincronizar (git pull) antes de subir.`;
      btnPushGit.setAttribute('data-action', 'pull');
    } else if (data.unpushedCommits && data.unpushedCommits > 0) {
      btnPushGit.innerHTML = `⬆️ Subir ao Repo (${data.unpushedCommits})`;
      btnPushGit.className = 'btn btn-push btn-sm has-unpushed';
      btnPushGit.title = `${data.unpushedCommits} commit(s) pendente(s) para subir ao repositório remoto. Clique para enviar (git push).`;
      btnPushGit.setAttribute('data-action', 'push');
    } else {
      btnPushGit.innerHTML = `⬆️ Subir ao Repo`;
      btnPushGit.className = 'btn btn-push btn-sm';
      btnPushGit.title = `Subir commits locais para o repositório remoto (git push)`;
      btnPushGit.setAttribute('data-action', 'push');
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
  const placeholderMsg = 'docs(openspec): atualiza status das tarefas no kanban';
  const inputResult = await showConfirmModal({
    title: 'Salvar Alterações (Git Commit)',
    icon: '💾',
    message: 'Deseja criar um commit local com as alterações pendentes no OpenSpec?',
    withInput: true,
    inputLabel: 'Mensagem do commit:',
    inputPlaceholder: placeholderMsg,
    inputDefault: '',
    confirmText: 'Salvar Commit',
    confirmBtnClass: 'btn-success'
  });
  if (!inputResult) return;

  const msg = (typeof inputResult === 'string' && inputResult.trim()) ? inputResult.trim() : placeholderMsg;

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

async function pullGitChanges() {
  const previousHtml = btnPushGit ? btnPushGit.innerHTML : '⬇️ Baixar do Repo';
  if (btnPushGit) {
    btnPushGit.disabled = true;
    btnPushGit.innerHTML = '⏳ Baixando...';
  }

  let isSuccess = false;
  try {
    showToast('Baixando atualizações do repositório remoto (git pull)...', 'info');
    appendLog('Iniciando git pull origin...');
    const res = await fetch('/api/git/pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      isSuccess = true;
      showToast(data.message || 'Repositório sincronizado com sucesso!', 'success');
      appendLog(`Git pull concluído: ${data.details || 'Tudo atualizado'}`);
      await fetchGitInfo();
      await fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao sincronizar com repositório remoto', 'error');
      appendLog(`Falha no git pull: ${data.error || 'Erro desconhecido'}`);
      await fetchGitInfo();
    }
  } catch (err) {
    showToast('Erro ao conectar com o servidor para git pull', 'error');
    appendLog(`Erro no pull: ${err.message}`);
  } finally {
    if (btnPushGit) {
      btnPushGit.disabled = false;
      if (!isSuccess && btnPushGit.innerHTML === '⏳ Baixando...') {
        btnPushGit.innerHTML = previousHtml;
      }
    }
  }
}

async function pushGitChanges() {
  const previousHtml = btnPushGit ? btnPushGit.innerHTML : '⬆️ Subir ao Repo';
  if (btnPushGit) {
    btnPushGit.disabled = true;
    btnPushGit.innerHTML = '⏳ Subindo...';
  }

  let isSuccess = false;
  try {
    showToast('Enviando commits locais para o repositório remoto...', 'info');
    appendLog('Iniciando git push...');
    const res = await fetch('/api/git/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      isSuccess = true;
      showToast(data.message || 'Git push realizado com sucesso!', 'success');
      appendLog(`Git push concluído: ${data.details || 'Tudo atualizado'}`);
      await fetchGitInfo();
      await fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao realizar git push', 'error');
      appendLog(`Falha no git push: ${data.error || 'Erro desconhecido'}`);
      if (data.needsPull) {
        await fetchGitInfo();
      }
    }
  } catch (err) {
    showToast('Erro ao conectar com o servidor para git push', 'error');
    appendLog(`Erro no push: ${err.message}`);
  } finally {
    if (btnPushGit) {
      btnPushGit.disabled = false;
      if (!isSuccess && btnPushGit.innerHTML === '⏳ Subindo...') {
        btnPushGit.innerHTML = previousHtml;
      }
    }
  }
}

async function handleGitSyncAction() {
  const action = btnPushGit ? btnPushGit.getAttribute('data-action') : 'push';
  if (action === 'pull') {
    const confirmed = await showConfirmModal({
      title: 'Baixar Alterações do Repositório',
      icon: '⬇️',
      message: 'O repositório remoto possui commits mais recentes. Deseja baixar e sincronizar as alterações (git pull)?',
      warning: 'Os arquivos locais serão atualizados com a versão mais recente do GitHub.',
      confirmText: 'Sim, Baixar e Sincronizar',
      confirmBtnClass: 'btn-primary'
    });
    if (!confirmed) return;
    await pullGitChanges();
  } else {
    const count = btnPushGit?.title?.match(/(\d+)\s*commit/)?.[1] || '';
    const confirmed = await showConfirmModal({
      title: 'Subir Commits para o Repositório',
      icon: '⬆️',
      message: count
        ? `Deseja enviar **${count} commit(s)** locais para o repositório remoto (git push)?`
        : 'Deseja enviar os commits locais para o repositório remoto (git push)?',
      warning: 'As alterações serão disponibilizadas no GitHub para toda a equipe.',
      confirmText: 'Sim, Subir ao Repo',
      confirmBtnClass: 'btn-success'
    });
    if (!confirmed) return;
    await pushGitChanges();
  }
}

if (btnPushGit) {
  btnPushGit.addEventListener('click', handleGitSyncAction);
}

async function handleResetRepoLocalAction() {
  const confirmed = await showConfirmModal({
    title: 'Resetar Repositório Local',
    icon: '↺',
    message: 'Deseja realmente **descartar todas as alterações locais não salvas** e resetar o repositório para o estado do último commit?',
    warning: 'ATENÇÃO: Todas as alterações locais em arquivos rastreados que ainda não foram commitadas serão permanentemente descartadas.',
    confirmText: 'Sim, Resetar Repo Local',
    confirmBtnClass: 'btn-danger'
  });
  if (!confirmed) return;

  const prevHtml = btnResetRepoLocal ? btnResetRepoLocal.innerHTML : '↺ Reset Repo Local';
  if (btnResetRepoLocal) {
    btnResetRepoLocal.disabled = true;
    btnResetRepoLocal.innerHTML = '⏳ Resetando...';
  }

  try {
    showToast('Resetando alterações locais do repositório...', 'info');
    appendLog('Executando Reset Repo Local (git checkout HEAD -- .)...');
    const res = await fetch('/api/git/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Repositório resetado com sucesso para o estado limpo!', 'success');
      appendLog(`Reset Repo Local concluído: ${data.details || 'Modificações descartadas.'}`);
      await fetchGitInfo();
      await fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao resetar repositório local', 'error');
      appendLog(`Falha no Reset Repo Local: ${data.error || 'Erro desconhecido'}`);
    }
  } catch (err) {
    showToast('Erro de conexão ao executar reset do repositório', 'error');
    appendLog(`Erro no reset: ${err.message}`);
  } finally {
    if (btnResetRepoLocal) {
      btnResetRepoLocal.disabled = false;
      btnResetRepoLocal.innerHTML = prevHtml;
    }
  }
}

if (btnResetRepoLocal) {
  btnResetRepoLocal.addEventListener('click', handleResetRepoLocalAction);
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
  updateTaskDirectoryPlaceholder();
}

function updateTaskDirectoryPlaceholder() {
  if (!selectTaskDirectory || !selectTaskDirectory.options || selectTaskDirectory.options.length === 0) return;
  const firstOpt = selectTaskDirectory.options[0];
  if (firstOpt) {
    firstOpt.textContent = '📁 Selecione o Projeto / Diretório... *';
  }
}

selectFeatureTask?.addEventListener('change', () => {
  updateTaskDirectoryPlaceholder();
});

function updateStats(features) {
  statTotalFeatures.textContent = features.length;
  let totalTasks = 0;
  let doneTasks = 0;
  features.forEach(f => {
    totalTasks += (f.totalTasks || 0);
    doneTasks += (f.doneTasks || 0);
  });
  statTotalTasks.textContent = totalTasks;
  statDoneTasks.textContent = doneTasks;
}

// Board View Switcher (Tarefas da Sprint vs Funil de Ideias vs Analytics vs Changes & History)
function setBoardView(view) {
  currentBoardView = view;
  updateSearchPlaceholder();

  const gitBoardContainer = document.getElementById('modal-git-desktop');

  if (view === 'git') {
    btnViewGit?.classList.add('active');
    btnViewTasks?.classList.remove('active');
    btnViewIdeas?.classList.remove('active');
    btnViewAnalytics?.classList.remove('active');
    if (kanbanColumnsContainer) kanbanColumnsContainer.style.display = 'none';
    if (kanbanSearchEmptyState) kanbanSearchEmptyState.style.display = 'none';
    if (analyticsDashboardContainer) analyticsDashboardContainer.style.display = 'none';
    if (gitBoardContainer) gitBoardContainer.style.display = 'flex';
    if (kanbanSearchWrapper) kanbanSearchWrapper.style.display = 'none';
    if (memberFilterBar) memberFilterBar.style.display = 'none';
    if (directoryFilterBar) directoryFilterBar.style.display = 'none';
    refreshGitDesktop();
    return;
  }

  // Se não for 'git', esconde o Git Desktop e restaura as barras de filtro
  if (gitBoardContainer) gitBoardContainer.style.display = 'none';
  if (btnViewGit) btnViewGit.classList.remove('active');
  if (kanbanSearchWrapper) kanbanSearchWrapper.style.display = '';
  if (memberFilterBar) memberFilterBar.style.display = '';
  if (directoryFilterBar) directoryFilterBar.style.display = '';

  if (view === 'analytics') {
    btnViewAnalytics?.classList.add('active');
    btnViewTasks?.classList.remove('active');
    btnViewIdeas?.classList.remove('active');
    if (kanbanColumnsContainer) kanbanColumnsContainer.style.display = 'none';
    if (kanbanSearchEmptyState) kanbanSearchEmptyState.style.display = 'none';
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
btnViewGit?.addEventListener('click', () => setBoardView('git'));

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
// Exportação de Relatórios da Sprint (CSV & PDF)
// =============================================================
function exportSprintCsv() {
  const branch = currentSelectedBranch || 'local';
  showToast('Gerando e baixando planilha CSV da Sprint...', 'info');
  const downloadUrl = `/api/reports/sprint/csv?branch=${encodeURIComponent(branch)}`;
  const a = document.createElement('a');
  a.href = downloadUrl;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `sprint-relatorio-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function exportSprintPdf() {
  const branch = currentSelectedBranch || 'local';
  showToast('Abrindo relatório da Sprint para visualização / impressão em PDF...', 'info');
  const printUrl = `/api/reports/sprint/pdf?branch=${encodeURIComponent(branch)}&auto=print`;
  window.open(printUrl, '_blank');
}

// =============================================================
// Exportação de Relatório Técnico Oficial em PDF (Padrão Executivo)
// =============================================================
function generateOfficialPdf(download = false) {
  const selectMember = document.getElementById('select-official-report-member');
  const memberId = selectMember ? selectMember.value : 'all';
  const memberLabel = selectMember && selectMember.selectedOptions && selectMember.selectedOptions[0]
    ? selectMember.selectedOptions[0].text
    : memberId;

  const titleMsg = memberId === 'all'
    ? 'Toda a Equipe (Consolidado)'
    : memberLabel.replace(/^[^\w\s]+/, '').trim();

  showToast(`Gerando Relatório Oficial em PDF (${titleMsg})...`, 'info');
  appendLog(`Gerando Relatório Técnico Oficial em PDF para: ${titleMsg}`);

  const url = `/api/reports/official-pdf?member=${encodeURIComponent(memberId)}${download ? '&download=true' : ''}&t=${Date.now()}`;

  if (download) {
    const a = document.createElement('a');
    a.href = url;
    a.download = memberId === 'all'
      ? 'Relatorio_Oficial_Equipe_Fowlgen_Wars.pdf'
      : `Relatorio_Oficial_${memberId.charAt(0).toUpperCase() + memberId.slice(1)}_Fowlgen_Wars.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    window.open(url, '_blank');
  }
}

function populateOfficialReportMembers() {
  const sel = document.getElementById('select-official-report-member');
  if (!sel || !teamMembers || teamMembers.length === 0) return;
  const currentVal = sel.value || 'all';

  sel.innerHTML = '<option value="all">👥 Toda a Equipe (Relatório Consolidado)</option>';
  const activeMembers = teamMembers.filter(m => m.active !== false && m.status !== 'inactive');
  activeMembers.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.avatar || '👤'} ${m.name} (${m.role || 'Membro da Equipe'})`;
    sel.appendChild(opt);
  });

  if (currentVal) sel.value = currentVal;
}

// =============================================================
// 3ª ABA: ANALYTICS & MÉTRICAS (Dashboard Integrado)
// =============================================================
function renderAnalyticsDashboard(features) {
  if (!analyticsDashboardContainer) return;

  if (currentDirectoryFilter !== 'all') {
    const targetDir = currentDirectoryFilter.toLowerCase().trim();
    features = features.filter(feature => {
      if (feature.directory && feature.directory.toLowerCase() === targetDir) return true;
      if (feature.tasks && feature.tasks.some(t => t.directory && t.directory.toLowerCase() === targetDir)) return true;
      const dirObj = projectDirectories.find(d => d.id.toLowerCase() === targetDir);
      if (dirObj) {
        const p = (dirObj.path || '').toLowerCase();
        const id = dirObj.id.toLowerCase();
        if (feature.name && (feature.name.toLowerCase().includes(id) || (p && feature.name.toLowerCase().includes(p)))) return true;
        if (feature.title && (feature.title.toLowerCase().includes(id) || (p && feature.title.toLowerCase().includes(p)))) return true;
        if (feature.tasks && feature.tasks.some(t => {
          const txt = (t.text || '').toLowerCase();
          return (p && txt.includes(p)) || txt.includes(`(${id}/)`) || txt.includes(`(${id})`);
        })) return true;
      }
      return false;
    });
  }

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

        const rawAssignees = (t.assignee || f.ideaAssignee || '').split(/[,/]+/).map(s => s.trim().replace(/^@/, '')).filter(Boolean);
        rawAssignees.forEach(keyRaw => {
          const key = keyRaw.toLowerCase().trim();
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
        });
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
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--border-color)" stroke-width="20" />
      <text x="100" y="105" text-anchor="middle" font-size="14" fill="var(--text-muted)" font-family="Outfit, system-ui, sans-serif">Sem tarefas</text>
    `;
  } else {
    donutSvgContent = `
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--border-subtle)" stroke-width="20" />
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
      <text class="donut-center-val" x="100" y="94" text-anchor="middle" font-size="28" font-weight="800" fill="var(--text-main)" font-family="Outfit, system-ui, sans-serif">${overallProgress}%</text>
      <text class="donut-center-label" x="100" y="112" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-dim)" font-family="Outfit, system-ui, sans-serif" letter-spacing="0.5">CONCLUÍDO</text>
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
            <span style="font-size: 11px; font-weight: 700; color: ${mPct === 100 && m.totalTasks > 0 ? 'var(--accent-emerald)' : 'var(--accent-sky)'}; font-family: monospace;">${mPct}%</span>
          </div>
          <div class="team-workload-stats">
            <span>${m.doneTasks} de ${m.totalTasks} tarefas</span>
            <span style="color: var(--text-dim); font-size: 11px;">🔍 Filtrar</span>
          </div>
          <div class="progress-bar-container" style="height: 5px; background: var(--bg-pill); border: 1px solid var(--border-subtle); border-radius: 999px; overflow: hidden; margin: 0;">
            <div class="progress-fill" style="width: ${mPct}%; height: 100%; background: linear-gradient(90deg, #38bdf8, #10b981); border-radius: 999px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Build Features Table Rows HTML (filtrado pela busca se ativa)
  let displayFeatures = features;
  if (kanbanSearchQuery) {
    const q = kanbanSearchQuery;
    displayFeatures = features.filter(f =>
      (f.title && f.title.toLowerCase().includes(q)) ||
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.summary && f.summary.toLowerCase().includes(q)) ||
      (f.assignees && f.assignees.some(a => a.toLowerCase().includes(q))) ||
      (f.tasks && f.tasks.some(t => (t.text && t.text.toLowerCase().includes(q)) || (t.id && t.id.toLowerCase().includes(q))))
    );
  }

  let featuresRowsHtml = '';
  if (displayFeatures.length === 0) {
    featuresRowsHtml = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-dim);">Nenhuma feature encontrada para a pesquisa atual.</td></tr>`;
  } else {
    featuresRowsHtml = displayFeatures.map(f => {
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
            <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${f.title || f.name}</div>
            <code style="font-size: 10.5px; color: var(--accent-sky); background: var(--bg-pill); border: 1px solid var(--border-subtle); padding: 1px 5px; border-radius: 4px;">${f.name}</code>
          </td>
          <td>${statusBadge}</td>
          <td>
            <span style="font-size: 12px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px;">
              <span>👤</span> ${displayAssignee}
            </span>
          </td>
          <td>
            <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: var(--text-main);">${f.doneTasks || 0} / ${f.totalTasks || 0}</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="progress-bar-container" style="flex: 1; min-width: 80px; height: 6px; background: var(--bg-pill); border: 1px solid var(--border-subtle); border-radius: 999px; overflow: hidden; margin: 0;">
                <div class="progress-fill" style="width: ${progressVal}%; height: 100%; background: linear-gradient(90deg, #38bdf8, #10b981); border-radius: 999px;"></div>
              </div>
              <span style="font-size: 11px; font-weight: 700; font-family: monospace; color: var(--text-main); width: 34px; text-align: right;">${progressVal}%</span>
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
          <div style="font-size: 16px; font-weight: 800; color: var(--text-main); letter-spacing: -0.2px;">Painel de Analytics & Métricas da Sprint</div>
          <div style="font-size: 12px; color: var(--text-muted); font-weight: 500;">Acompanhamento em tempo real de tarefas OpenSpec, distribuição e equipe</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary btn-sm" id="btn-analytics-refresh" title="Atualizar dados do servidor">
          🔄 Atualizar
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-analytics-export-csv" title="Exportar dados da Sprint em planilha CSV para Excel">
          📊 Exportar CSV
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-analytics-export-pdf" title="Exportar relatório da Sprint em formato PDF">
          📄 Exportar PDF
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
        <div class="analytics-kpi-value" style="color: var(--accent-emerald);">${overallProgress}%</div>
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
        <div class="analytics-kpi-value" style="color: var(--accent-gold);">${deliveryVelocity}%</div>
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

  document.getElementById('btn-analytics-export-csv')?.addEventListener('click', exportSprintCsv);
  document.getElementById('btn-analytics-export-pdf')?.addEventListener('click', exportSprintPdf);

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
  let filtered = features.filter(feature => {
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

  // Filtragem por Diretório / Projeto (ex: app, unity, prompt, kanban, etc.)
  if (currentDirectoryFilter !== 'all') {
    const targetDir = currentDirectoryFilter.toLowerCase().trim();
    filtered = filtered.filter(feature => {
      // 1. Diretório explicitamente atribuído à feature pelo backend
      if (feature.directory && feature.directory.toLowerCase() === targetDir) {
        return true;
      }
      // 2. Se a feature tiver tarefas com esse diretório
      if (feature.tasks && feature.tasks.some(t => t.directory && t.directory.toLowerCase() === targetDir)) {
        return true;
      }
      // 3. Fallback de matching por identificador ou caminho
      const dirObj = projectDirectories.find(d => d.id.toLowerCase() === targetDir);
      if (dirObj) {
        const p = (dirObj.path || '').toLowerCase();
        const id = dirObj.id.toLowerCase();
        if (feature.name && (feature.name.toLowerCase().includes(id) || (p && feature.name.toLowerCase().includes(p)))) return true;
        if (feature.title && (feature.title.toLowerCase().includes(id) || (p && feature.title.toLowerCase().includes(p)))) return true;
        if (feature.tasks && feature.tasks.some(t => {
          const txt = (t.text || '').toLowerCase();
          return (p && txt.includes(p)) || txt.includes(`(${id}/)`) || txt.includes(`(${id})`);
        })) return true;
      }
      return false;
    });
  }

  // Filtragem por pesquisa no Kanban (Tarefas ou Ideias)
  if (kanbanSearchQuery) {
    const q = kanbanSearchQuery;
    if (currentBoardView === 'tasks') {
      filtered = filtered.filter(feature => {
        const matchFeature = (feature.title && feature.title.toLowerCase().includes(q)) ||
          (feature.name && feature.name.toLowerCase().includes(q)) ||
          (feature.summary && feature.summary.toLowerCase().includes(q)) ||
          (feature.assignees && feature.assignees.some(a => a.toLowerCase().includes(q)));

        const matchTasks = feature.tasks && feature.tasks.some(t => {
          return (t.id && t.id.toLowerCase().includes(q)) ||
            (t.text && t.text.toLowerCase().includes(q)) ||
            (t.prompt && t.prompt.toLowerCase().includes(q)) ||
            (t.assignee && t.assignee.toLowerCase().includes(q)) ||
            (t.status && t.status.toLowerCase().includes(q));
        });

        return matchFeature || matchTasks;
      });
    } else {
      // Funil de Ideias
      filtered = filtered.filter(feature => {
        const matchTitle = feature.title && feature.title.toLowerCase().includes(q);
        const matchId = feature.name && feature.name.toLowerCase().includes(q);
        const matchSummary = feature.summary && feature.summary.toLowerCase().includes(q);
        const matchPrompt = feature.prompt && feature.prompt.toLowerCase().includes(q);
        const matchAssignee = feature.ideaAssignee && feature.ideaAssignee.toLowerCase().includes(q);
        const matchStatus = (feature.ideaStatus || feature.ideaColumn || '').toLowerCase().includes(q);
        const matchTasks = feature.tasks && feature.tasks.some(t => {
          return (t.text && t.text.toLowerCase().includes(q)) ||
            (t.id && t.id.toLowerCase().includes(q)) ||
            (t.prompt && t.prompt.toLowerCase().includes(q));
        });

        return matchTitle || matchId || matchSummary || matchPrompt || matchAssignee || matchStatus || matchTasks;
      });
    }
  }

  // Atualiza badge de contagem de pesquisa e empty-state
  if (kanbanSearchCountBadge) {
    if (kanbanSearchQuery) {
      kanbanSearchCountBadge.style.display = 'inline-block';
      const label = currentBoardView === 'tasks' ? 'tarefa(s)/feature(s)' : 'ideia(s)';
      kanbanSearchCountBadge.textContent = `${filtered.length} ${label}`;
    } else {
      kanbanSearchCountBadge.style.display = 'none';
    }
  }

  if (kanbanSearchEmptyState) {
    if (kanbanSearchQuery && filtered.length === 0) {
      kanbanSearchEmptyState.style.display = 'flex';
      if (emptyStateSearchTitle) {
        emptyStateSearchTitle.textContent = currentBoardView === 'tasks'
          ? `Nenhuma tarefa encontrada para "${kanbanSearchQuery}"`
          : `Nenhuma ideia encontrada para "${kanbanSearchQuery}"`;
      }
      if (emptyStateSearchDesc) {
        emptyStateSearchDesc.textContent = 'Verifique a digitação ou limpe a pesquisa para visualizar todo o quadro.';
      }
    } else {
      kanbanSearchEmptyState.style.display = 'none';
    }
  }

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
  if (kanbanSearchQuery) {
    card.style.borderColor = 'rgba(168, 85, 247, 0.45)';
    card.style.boxShadow = '0 0 10px rgba(168, 85, 247, 0.12)';
  }

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
  const assigneeIcon = displayAssignee === 'Todos' ? '👥' : '👤';
  const assigneeBadge = `<span class="badge-tag" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); font-size: 10px;">${assigneeIcon} ${escapeHtml(displayAssignee)}</span>`;

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

  const curDirIdea = (feature.directory || 'geral').toLowerCase();
  const dirObjIdea = projectDirectories.find(d => d.id.toLowerCase() === curDirIdea);
  const dirLabelIdea = dirObjIdea ? `${dirObjIdea.icon || '📁'} ${dirObjIdea.name}` : (feature.directory ? `📁 ${feature.directory}` : '📁 Projeto');
  const dirButtonHtmlIdea = `
    <button type="button" class="btn-card-directory" data-feature="${escapeHtml(feature.name)}" title="Clique para alterar o projeto / site desta ideia">
      <span>${escapeHtml(dirLabelIdea)}</span>
      <span style="font-size: 8px; opacity: 0.7;">▼</span>
    </button>
  `;

  card.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 6px; flex-wrap: wrap;">
      <span class="card-tag ${tagClass}">${statusEmoji} ${status}</span>
      <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
        ${dirButtonHtmlIdea}
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

  // Directory button dropdown on idea card
  card.querySelector('.btn-card-directory')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openCardDirDropdown(e.currentTarget, feature.name, feature.directory);
  });

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
    const confirmed = await showConfirmModal({
      title: 'Validar Ideia / Proposta',
      icon: '🔍',
      message: `Deseja validar tecnicamente a proposta **${feature.title || feature.name}**?`,
      confirmText: 'Sim, Validar',
      confirmBtnClass: 'btn-primary'
    });
    if (!confirmed) return;
    await triggerIdeaAction(feature.name, 'validate');
  });

  card.querySelector('.btn-app')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const assignee = currentAssigneeFilter !== 'all' ? currentAssigneeFilter : ((feature.ideaAssignee && feature.ideaAssignee !== 'dev-team') ? feature.ideaAssignee : 'Todos');
    const confirmed = await showConfirmModal({
      title: 'Aprovar Ideia para Sprint',
      icon: '✅',
      message: `Deseja aprovar a proposta **${feature.title || feature.name}** para desenvolvimento na Sprint?`,
      warning: `A feature será atribuída à equipe/membro: "${assignee}".`,
      confirmText: 'Sim, Aprovar para Sprint',
      confirmBtnClass: 'btn-success'
    });
    if (!confirmed) return;
    await triggerIdeaAction(feature.name, 'approve', assignee);
  });

  card.querySelector('.btn-rej')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const reason = await showConfirmModal({
      title: 'Rejeitar Proposta',
      icon: '❌',
      message: `Deseja realmente rejeitar a proposta **${feature.title || feature.name}**?`,
      warning: 'A proposta será movida para a coluna de Rejeitadas no Funil de Ideias.',
      confirmText: 'Confirmar Rejeição',
      confirmBtnClass: 'btn-danger',
      withInput: true,
      inputLabel: 'Motivo da rejeição:',
      inputPlaceholder: 'Informe o motivo (ex: Fora do escopo da sprint atual)',
      inputDefault: 'Fora do escopo da sprint atual'
    });
    if (reason) {
      const reasonStr = typeof reason === 'string' ? reason : 'Fora do escopo da sprint atual';
      await triggerIdeaAction(feature.name, 'reject', undefined, reasonStr);
    }
  });

  card.querySelector('.btn-reset')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const confirmed = await showConfirmModal({
      title: 'Resetar Ideia',
      icon: '🔄',
      message: `Deseja resetar o status da ideia **${feature.title || feature.name}** para "Criado"?`,
      confirmText: 'Sim, Resetar',
      confirmBtnClass: 'btn-warning'
    });
    if (!confirmed) return;
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

  // Task Items HTML (Exibe todas as tarefas com rolagem, priorizando matches de busca)
  let displayedTasks = feature.tasks ? [...feature.tasks] : [];
  if (kanbanSearchQuery) {
    const q = kanbanSearchQuery;
    const matching = displayedTasks.filter(t =>
      (t.id && t.id.toLowerCase().includes(q)) ||
      (t.text && t.text.toLowerCase().includes(q)) ||
      (t.prompt && t.prompt.toLowerCase().includes(q)) ||
      (t.assignee && t.assignee.toLowerCase().includes(q))
    );
    if (matching.length > 0) {
      const nonMatching = displayedTasks.filter(t => !matching.includes(t));
      displayedTasks = [...matching, ...nonMatching];
    }
  }

  const tasksHtml = displayedTasks.map(t => {
    const isMatching = Boolean(kanbanSearchQuery && (
      (t.id && t.id.toLowerCase().includes(kanbanSearchQuery)) ||
      (t.text && t.text.toLowerCase().includes(kanbanSearchQuery)) ||
      (t.prompt && t.prompt.toLowerCase().includes(kanbanSearchQuery)) ||
      (t.assignee && t.assignee.toLowerCase().includes(kanbanSearchQuery))
    ));
    const cleanText = t.text.replace(/\(([^)]+)\)|@([\w-]+)|\[([\w-]+)\]/g, '').trim();
    const showAssignee = t.assignee && isMemberActive(t.assignee);
    const promptBadge = t.prompt
      ? `<span title="${escapeHtml(t.prompt)}" style="font-size: 10px; color: #c084fc; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); padding: 1px 5px; border-radius: 8px; margin-left: 4px; cursor: help;">💬 Prompt</span>`
      : '';
    const matchHighlightStyle = isMatching ? 'background: rgba(168, 85, 247, 0.18); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 4px; padding: 2px 4px;' : '';
    return `
    <div class="task-item-row" style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 2px; ${matchHighlightStyle}">
      <label class="task-item ${t.done ? 'done' : ''}" style="margin-bottom: 0; flex: 1; min-width: 0; display: flex; align-items: center;">
        <input type="checkbox" ${t.done ? 'checked' : ''} ${feature.isFromGitBranch ? 'disabled title="Modo Histórico da branch (somente leitura)"' : ''} data-feature="${feature.name}" data-task-id="${t.id}" class="task-checkbox">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.id ? `<strong>${escapeHtml(t.id)}</strong> ` : ''}${escapeHtml(cleanText || t.text)}</span>
        ${promptBadge}
        ${showAssignee ? `<span style="font-size: 10px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.25); padding: 1px 6px; border-radius: 10px; margin-left: 4px; white-space: nowrap;">👤 ${t.assignee}</span>` : ''}
      </label>
      ${!feature.isFromGitBranch ? `<button type="button" class="btn-task-quick-edit" title="Alterar esta tarefa no formulário" data-task-id="${t.id}" style="background: none; border: none; color: #38bdf8; font-size: 11px; cursor: pointer; padding: 2px 4px; opacity: 0.75;">✏️</button>` : ''}
    </div>
    `;
  }).join('');

  const curDir = (feature.directory || 'geral').toLowerCase();
  const dirObj = projectDirectories.find(d => d.id.toLowerCase() === curDir);
  const dirLabel = dirObj ? `${dirObj.icon || '📁'} ${dirObj.name}` : (feature.directory ? `📁 ${feature.directory}` : '📁 Projeto');
  const dirButtonHtml = `
    <button type="button" class="btn-card-directory" data-feature="${escapeHtml(feature.name)}" title="Clique para alterar o projeto / site desta feature">
      <span>${escapeHtml(dirLabel)}</span>
      <span style="font-size: 8px; opacity: 0.7;">▼</span>
    </button>
  `;

  card.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 6px; flex-wrap: wrap;">
      <span class="card-tag ${tagClass}">${feature.kanbanColumn}</span>
      <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
        ${dirButtonHtml}
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
      ${feature.tasks && feature.tasks.length > 0 ? `
        <div class="card-tasks-header">
          <span>📋 Tarefas (${feature.doneTasks}/${feature.totalTasks})</span>
          ${feature.tasks.length > 3 ? `<span style="font-size: 10px; opacity: 0.85;">↕️ Role para ver</span>` : ''}
        </div>
      ` : ''}
      ${tasksHtml}
    </div>
    <div class="card-hover-hint">🔍 Clique para ver os detalhes da tarefa e proposta ("outra tela")</div>
  `;

  // Previne que cliques/rolagem dentro da lista de tarefas abram o modal
  card.querySelector('.card-tasks')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Dropdown para alterar diretório/projeto
  card.querySelector('.btn-card-directory')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openCardDirDropdown(e.currentTarget, feature.name, feature.directory);
  });

  // Select feature and open Details Modal on card click
  card.addEventListener('click', (e) => {
    if (e.target.tagName !== 'INPUT' && !e.target.closest('button') && !e.target.closest('.card-tasks') && !e.target.closest('.btn-card-directory')) {
      selectFeatureTask.value = feature.name;
      inputIdeaId.value = feature.name;
      inputIdeaTitle.value = feature.title || feature.name;
      updateCommandPreview();
      openFeatureDetailsModal(feature, 'tasks');
    }
  });

  // Task Checkbox Toggle com confirmação preventiva
  card.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const featName = cb.getAttribute('data-feature');
      const tId = cb.getAttribute('data-task-id');
      const targetState = !cb.checked;

      const confirmed = await showConfirmModal({
        title: targetState ? 'Concluir Tarefa' : 'Reabrir Tarefa',
        icon: targetState ? '✅' : '🔄',
        message: targetState
          ? `Deseja marcar a tarefa **${tId}** da feature "${featName}" como Concluída?`
          : `Deseja reabrir a tarefa **${tId}** da feature "${featName}" e retorná-la para pendente?`,
        warning: 'Esta alteração será registrada no arquivo tasks.md do OpenSpec.',
        confirmText: targetState ? 'Sim, Concluir' : 'Sim, Reabrir',
        confirmBtnClass: targetState ? 'btn-success' : 'btn-primary'
      });

      if (confirmed) {
        cb.checked = targetState;
        await updateTaskStatusDirect(featName, tId, targetState);
      }
    });
  });

  // Task Quick Edit Button
  card.querySelectorAll('.btn-task-quick-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const tId = btn.getAttribute('data-task-id');
      const targetTask = feature.tasks.find(x => x.id === tId);
      if (targetTask) {
        startEditingTask(feature.name, targetTask);
      }
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

  // Validação obrigatória: Responsável / Equipe é obrigatório e não pode estar vazio!
  if (!selectedTaskAssignees || selectedTaskAssignees.length === 0) {
    showToast('⚠️ Selecione ao menos um Responsável para a tarefa!', 'warning');
    if (multiAssigneeTrigger) {
      multiAssigneeTrigger.classList.add('has-error');
      if (multiAssigneeDropdown) {
        multiAssigneeDropdown.style.display = 'block';
        multiAssigneeTrigger.classList.add('active');
        if (multiAssigneeSearch) multiAssigneeSearch.focus();
      }
    }
    return;
  }

  // Validação obrigatória: Projeto / Diretório é obrigatório!
  const directory = selectTaskDirectory?.value || '';
  if (!directory) {
    showToast('⚠️ Selecione o Projeto / Diretório da tarefa!', 'warning');
    if (selectTaskDirectory) {
      selectTaskDirectory.classList.add('has-error');
      selectTaskDirectory.focus();
    }
    return;
  }

  const assignee = selectedTaskAssignees.join(', ');
  const status = selectTaskStatus?.value || 'Backlog';
  const dirTag = directory ? `(${directory}/) ` : '';
  const assigneeTag = ` (@${selectedTaskAssignees.join(', @')})`;
  const firstLine = text.split(/\r?\n/)[0].trim().replace(/^\s*\([^)]+\/\)\s*/i, '');
  const cmd = `agent criar openspec/changes/${feature}/tasks.md "${taskId ? '**' + taskId + '** ' : ''}${dirTag}${firstLine}${assigneeTag}"`;
  updateCommandPreview(cmd);

  const confirmed = await showConfirmModal({
    title: 'Criar Nova Tarefa',
    icon: '➕',
    message: `Deseja cadastrar a tarefa **${taskId ? taskId + ' - ' : ''}${firstLine}** na feature **${feature}**?`,
    warning: `Status inicial: ${status} | Responsável: ${assignee}${directory ? ` | Projeto: ${directory}` : ''}`,
    confirmText: 'Sim, Criar Tarefa',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

  try {
    const res = await fetch('/api/tasks/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature,
        taskId,
        text,
        assignee,
        status,
        directory
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      clearTaskForm(true);
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

// 2. Alterar / Atualizar Tarefa: agent atualizar "**2.1**" "Concluído" "João"
document.getElementById('btn-action-update-task').addEventListener('click', async () => {
  const feature = (selectFeatureTask?.value || '').trim() || 'tarefas-gerais';
  const originalTaskId = editingTaskInfo ? editingTaskInfo.taskId : inputTaskId.value.trim();
  const newTaskId = inputTaskId.value.trim();
  const taskId = originalTaskId || newTaskId;

  if (!taskId) {
    showToast('Informe ou selecione o ID da tarefa que deseja alterar (ex: 1.1)', 'warning');
    inputTaskId?.focus();
    return;
  }

  const text = inputTaskText ? inputTaskText.value.trim() : '';
  const status = selectTaskStatus.value;
  const directory = selectTaskDirectory ? selectTaskDirectory.value : undefined;
  const assignee = selectedTaskAssignees.length > 0
    ? selectedTaskAssignees.join(', ')
    : (selectTaskAssignee?.value || inputTaskAssignee?.value || '').trim();
  const isDone = status === 'Concluído';

  const cmd = `agent atualizar "**${newTaskId || taskId}**" "${status}" "${assignee || 'Todos'}"`;
  updateCommandPreview(cmd);

  const confirmed = await showConfirmModal({
    title: 'Atualizar Tarefa',
    icon: '✏️',
    message: `Deseja salvar as alterações na tarefa **${taskId}** da feature **${feature}**?`,
    warning: `Status: ${status} | Responsável: ${assignee || 'Todos'}${directory ? ` | Projeto: ${directory}` : ''}`,
    confirmText: 'Sim, Atualizar Tarefa',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

  try {
    const res = await fetch('/api/tasks/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature,
        taskId,
        newTaskId: (newTaskId && newTaskId !== taskId) ? newTaskId : undefined,
        text,
        status,
        assignee: assignee || 'Todos',
        done: isDone,
        directory
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      cancelEditingTask();
      await fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao alterar tarefa', 'error');
    }
  } catch {
    showToast('Não foi possível conectar ao servidor local', 'error');
  }
});

// Botão Cancelar Edição no formulário
if (btnCancelTaskEdit) {
  btnCancelTaskEdit.addEventListener('click', cancelEditingTask);
}

// Botão Excluir Tarefa
if (btnActionDeleteTask) {
  btnActionDeleteTask.addEventListener('click', async () => {
    const feature = (selectFeatureTask?.value || '').trim() || 'tarefas-gerais';
    const taskId = editingTaskInfo ? editingTaskInfo.taskId : inputTaskId.value.trim();
    if (!taskId) {
      showToast('Nenhuma tarefa selecionada para exclusão', 'warning');
      return;
    }
    const confirmed = await showConfirmModal({
      title: 'Excluir Tarefa',
      icon: '🗑️',
      message: `Deseja realmente excluir a tarefa **${taskId}** da feature "${feature}"?`,
      warning: 'A tarefa será removida permanentemente do arquivo tasks.md no Git.',
      confirmText: 'Sim, Excluir Tarefa',
      confirmBtnClass: 'btn-danger'
    });
    if (!confirmed) return;

    try {
      const res = await fetch('/api/tasks/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, taskId })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        appendLog(data.message);
        cancelEditingTask();
        await fetchFeatures();
      } else {
        showToast(data.error || 'Erro ao excluir tarefa', 'error');
      }
    } catch {
      showToast('Erro de conexão ao excluir tarefa', 'error');
    }
  });
}

// 3. Atribuir Tarefa: agent atribuir "**2.1**" "Equipe de Backend"
document.getElementById('btn-action-assign-task').addEventListener('click', async () => {
  const feature = (selectFeatureTask?.value || '').trim() || 'tarefas-gerais';
  const taskId = inputTaskId.value.trim() || '1.1';
  if (!selectedTaskAssignees || selectedTaskAssignees.length === 0) {
    showToast('⚠️ Selecione ao menos um Responsável para atribuir à tarefa!', 'warning');
    if (multiAssigneeTrigger) {
      multiAssigneeTrigger.classList.add('has-error');
      if (multiAssigneeDropdown) {
        multiAssigneeDropdown.style.display = 'block';
        multiAssigneeTrigger.classList.add('active');
        if (multiAssigneeSearch) multiAssigneeSearch.focus();
      }
    }
    return;
  }
  const assignee = selectedTaskAssignees.join(', ');
  const cmd = `agent atribuir "**${taskId}**" "${assignee}"`;
  updateCommandPreview(cmd);

  const confirmed = await showConfirmModal({
    title: 'Atribuir Responsável da Tarefa',
    icon: '👥',
    message: `Deseja atribuir a tarefa **${taskId}** da feature **${feature}** para **${assignee}**?`,
    confirmText: 'Sim, Atribuir',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

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
document.getElementById('btn-action-list-tasks')?.addEventListener('click', () => {
  const feature = selectFeatureTask?.value || '*';
  const cmd = `agent listar openspec/changes/${feature}/tasks.md`;
  updateCommandPreview(cmd);
  fetchFeatures();
  showToast('Tarefas atualizadas no quadro!', 'success');
});

// 4.5. Gerar Proposta e Tarefas com IA Local
document.getElementById('btn-action-generate-ai')?.addEventListener('click', async () => {
  const featureId = resolveTargetIdeaId(false);
  const title = (inputIdeaTitle ? inputIdeaTitle.value.trim() : '') || (featureId ? featureId.replace(/-/g, ' ') : '');
  const promptText = inputIdeaPrompt ? inputIdeaPrompt.value.trim() : '';
  const team = (selectIdeaTeam ? selectIdeaTeam.value : 'Todos') || 'Todos';
  const directory = (selectIdeaDirectory ? selectIdeaDirectory.value : 'geral') || 'geral';

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
      body: JSON.stringify({ featureId, title, prompt: promptText, team, directory })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      clearIdeaForm(true);
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
document.getElementById('btn-action-new-feature')?.addEventListener('click', async () => {
  const featureId = resolveTargetIdeaId(false);
  const title = (inputIdeaTitle ? inputIdeaTitle.value.trim() : '') || (featureId ? featureId.replace(/-/g, ' ') : '');
  const promptText = inputIdeaPrompt ? inputIdeaPrompt.value.trim() : '';
  const team = (selectIdeaTeam ? selectIdeaTeam.value : 'Todos') || 'Todos';
  const directory = selectIdeaDirectory ? selectIdeaDirectory.value : '';

  if (!featureId) {
    showToast('⚠️ Informe o Título ou o ID da nova feature antes de criar!', 'warning');
    if (inputIdeaTitle) inputIdeaTitle.focus();
    return;
  }

  // Validação obrigatória: Projeto / Diretório é obrigatório!
  if (!directory) {
    showToast('⚠️ Selecione o Projeto / Diretório da nova feature!', 'warning');
    if (selectIdeaDirectory) {
      selectIdeaDirectory.classList.add('has-error');
      selectIdeaDirectory.focus();
    }
    return;
  }

  const cmd = `agent criar openspec/changes/${featureId}/proposal.md "# Feature: ${title}"`;
  updateCommandPreview(cmd);

  const confirmed = await showConfirmModal({
    title: 'Cadastrar Nova Ideia / Feature',
    icon: '💡',
    message: `Deseja realmente cadastrar a nova feature **${title}** (\`${featureId}\`)?`,
    warning: `Projeto: ${directory} | Responsável: ${team}`,
    confirmText: 'Sim, Cadastrar Feature',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

  try {
    const res = await fetch('/api/features/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        featureId,
        title,
        summary: promptText || `Feature: ${title}`,
        prompt: promptText,
        team,
        directory,
        tasks: ['Planejamento', 'Implementação']
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      clearIdeaForm(true);
      fetchFeatures();
    } else {
      showToast(data.error, 'error');
    }
  } catch {
    showToast('Comando pronto para colar no Chat!', 'success');
  }
});

// 6. Validar Ideia: agent validar ideia "sistema-ouro"
document.getElementById('btn-action-validate-idea')?.addEventListener('click', async () => {
  const ideaId = resolveTargetIdeaId();

  if (!ideaId) {
    showToast('⚠️ Informe o Título ou o ID da ideia que deseja validar!', 'warning');
    if (inputIdeaTitle) inputIdeaTitle.focus();
    return;
  }

  const confirmed = await showConfirmModal({
    title: 'Validar Ideia / Proposta',
    icon: '🔍',
    message: `Deseja validar tecnicamente a proposta **${ideaId}**?`,
    confirmText: 'Sim, Validar',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

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
document.getElementById('btn-action-approve-idea')?.addEventListener('click', async () => {
  const ideaId = resolveTargetIdeaId();

  if (!ideaId) {
    showToast('⚠️ Informe o Título ou o ID da ideia que deseja aprovar!', 'warning');
    if (inputIdeaTitle) inputIdeaTitle.focus();
    return;
  }

  const team = (selectIdeaTeam ? selectIdeaTeam.value : (inputIdeaTeam?.value || 'Todos')).trim() || 'Todos';
  const confirmed = await showConfirmModal({
    title: 'Aprovar Ideia para Desenvolvimento',
    icon: '✅',
    message: `Deseja aprovar a proposta **${ideaId}** para desenvolvimento na Sprint?`,
    warning: `A ideia será atribuída para: "${team}".`,
    confirmText: 'Sim, Aprovar',
    confirmBtnClass: 'btn-success'
  });
  if (!confirmed) return;

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
document.getElementById('btn-action-reject-idea')?.addEventListener('click', async () => {
  const ideaId = resolveTargetIdeaId();

  if (!ideaId) {
    showToast('⚠️ Informe o Título ou o ID da ideia que deseja rejeitar!', 'warning');
    if (inputIdeaTitle) inputIdeaTitle.focus();
    return;
  }

  const reasonDefault = inputIdeaReason ? (inputIdeaReason.value.trim() || 'Fora do escopo da sprint atual') : 'Fora do escopo da sprint atual';
  const reason = await showConfirmModal({
    title: 'Rejeitar Proposta',
    icon: '❌',
    message: `Deseja rejeitar a proposta **${ideaId}**?`,
    warning: 'A proposta será movida para Rejeitado no funil.',
    confirmText: 'Confirmar Rejeição',
    confirmBtnClass: 'btn-danger',
    withInput: true,
    inputLabel: 'Motivo da rejeição:',
    inputPlaceholder: 'Informe o motivo...',
    inputDefault: reasonDefault
  });
  if (!reason) return;

  const reasonStr = typeof reason === 'string' ? reason : reasonDefault;
  const cmd = `agent rejeitar ideia "${ideaId}" "${reasonStr}"`;
  updateCommandPreview(cmd);

  try {
    const res = await fetch('/api/features/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: ideaId, action: 'reject', reason: reasonStr })
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
  if (scriptName === 'sync') {
    const confirmed = await showConfirmModal({
      title: 'Sincronizar OpenSpec & Kanban',
      icon: '🔄',
      message: 'Deseja executar a sincronização entre as propostas OpenSpec e o Kanban?',
      warning: 'Os arquivos de tarefas e status do quadro serão sincronizados.',
      confirmText: 'Sim, Sincronizar',
      confirmBtnClass: 'btn-primary'
    });
    if (!confirmed) return;
  }
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
document.getElementById('btn-script-sync')?.addEventListener('click', () => runScriptAPI('sync'));
document.getElementById('btn-sync-top')?.addEventListener('click', () => runScriptAPI('sync'));
document.getElementById('btn-script-dashboard')?.addEventListener('click', async () => {
  await runScriptAPI('dashboard');
  await fetchFeatures();
  setBoardView('analytics');
  showToast('Dashboard gerado e exibido na aba Analytics!', 'success');
});
document.getElementById('btn-export-sprint-csv')?.addEventListener('click', exportSprintCsv);
document.getElementById('btn-export-sprint-pdf')?.addEventListener('click', exportSprintPdf);
document.getElementById('btn-generate-official-pdf')?.addEventListener('click', () => generateOfficialPdf(false));
document.getElementById('btn-download-official-pdf')?.addEventListener('click', () => generateOfficialPdf(true));
document.getElementById('btn-script-verify')?.addEventListener('click', () => runScriptAPI('verify'));
document.getElementById('btn-script-status')?.addEventListener('click', () => runScriptAPI('status'));
document.getElementById('btn-refresh')?.addEventListener('click', () => {
  fetchFeatures();
  fetchGitInfo();
  showToast('Quadro atualizado!', 'success');
});

// Execute Local Button
document.getElementById('btn-execute-local')?.addEventListener('click', () => {
  if (activeTab === 'tasks') {
    document.getElementById('btn-action-update-task')?.click();
  } else if (activeTab === 'ideas') {
    document.getElementById('btn-action-validate-idea')?.click();
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

// Settings Modal Tabs (scoped strictly to #modal-settings to avoid cross-modal interference)
document.querySelectorAll('#modal-settings .modal-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#modal-settings .modal-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const targetId = btn.getAttribute('data-target');
    document.querySelectorAll('#modal-settings .modal-view-section').forEach(sec => {
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

  const confirmed = await showConfirmModal({
    title: 'Salvar Configurações',
    icon: '⚙️',
    message: 'Deseja salvar as configurações de integração com o repositório GitHub?',
    confirmText: 'Sim, Salvar Configurações',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

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
      populateOfficialReportMembers();
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

// =============================================================
// GESTÃO E FILTRO DE DIRETÓRIOS / PROJETOS (app, unity, prompt...)
// =============================================================
async function fetchDirectories() {
  try {
    const res = await fetch('/api/directories');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.directories) {
      projectDirectories = data.directories;
      renderDirectoryFilterPills();
      renderModalDirectoriesList();
      populateDirectorySelects();
    }
  } catch (err) {
    console.warn('Erro ao carregar diretórios:', err);
  }
}

function populateDirectorySelects() {
  if (selectTaskDirectory) {
    const curVal = selectTaskDirectory.value;
    selectTaskDirectory.innerHTML = '<option value="" disabled selected>📁 Selecione o Projeto / Diretório... *</option>';
    projectDirectories.forEach(dir => {
      const opt = document.createElement('option');
      opt.value = dir.id;
      opt.textContent = `${dir.icon || '📁'} ${dir.name}`;
      selectTaskDirectory.appendChild(opt);
    });
    if (!projectDirectories.some(d => d.id.toLowerCase() === 'geral')) {
      const optGeral = document.createElement('option');
      optGeral.value = 'geral';
      optGeral.textContent = '📁 Geral / Raiz';
      selectTaskDirectory.appendChild(optGeral);
    }
    if (curVal) selectTaskDirectory.value = curVal;
    updateTaskDirectoryPlaceholder();
  }

  if (selectIdeaDirectory) {
    const curVal = selectIdeaDirectory.value;
    selectIdeaDirectory.innerHTML = '<option value="" disabled selected>📁 Selecione o Projeto / Diretório... *</option>';
    projectDirectories.forEach(dir => {
      const opt = document.createElement('option');
      opt.value = dir.id;
      opt.textContent = `${dir.icon || '📁'} ${dir.name}`;
      selectIdeaDirectory.appendChild(opt);
    });
    if (!projectDirectories.some(d => d.id.toLowerCase() === 'geral')) {
      const optGeral = document.createElement('option');
      optGeral.value = 'geral';
      optGeral.textContent = '📁 Geral / Raiz';
      selectIdeaDirectory.appendChild(optGeral);
    }
    if (curVal) selectIdeaDirectory.value = curVal;
  }

  if (detailNewTaskDirectory) {
    const curVal = detailNewTaskDirectory.value;
    detailNewTaskDirectory.innerHTML = '<option value="" disabled selected>📁 Selecione o Projeto / Diretório... *</option>';
    projectDirectories.forEach(dir => {
      const opt = document.createElement('option');
      opt.value = dir.id;
      opt.textContent = `${dir.icon || '📁'} ${dir.name}`;
      detailNewTaskDirectory.appendChild(opt);
    });
    if (!projectDirectories.some(d => d.id.toLowerCase() === 'geral')) {
      const optGeral = document.createElement('option');
      optGeral.value = 'geral';
      optGeral.textContent = '📁 Geral / Raiz';
      detailNewTaskDirectory.appendChild(optGeral);
    }
    if (curVal) detailNewTaskDirectory.value = curVal;
  }
}

selectTaskDirectory?.addEventListener('change', () => selectTaskDirectory.classList.remove('has-error'));
selectIdeaDirectory?.addEventListener('change', () => selectIdeaDirectory.classList.remove('has-error'));
detailNewTaskDirectory?.addEventListener('change', () => detailNewTaskDirectory.classList.remove('has-error'));

function renderDirectoryFilterPills() {
  if (!directoryFilterPillsContainer) return;
  directoryFilterPillsContainer.innerHTML = '';

  // 1. Pílula "Todos"
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = `directory-pill ${currentDirectoryFilter === 'all' ? 'active' : ''}`;
  allBtn.setAttribute('data-directory', 'all');
  allBtn.innerHTML = '📂 Todos';
  allBtn.addEventListener('click', () => setDirectoryFilter('all'));
  directoryFilterPillsContainer.appendChild(allBtn);

  // 2. Pílula para cada diretório cadastrado
  projectDirectories.forEach(dir => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isAct = currentDirectoryFilter.toLowerCase() === dir.id.toLowerCase();
    btn.className = `directory-pill ${isAct ? 'active' : ''}`;
    btn.setAttribute('data-directory', dir.id);
    btn.innerHTML = `${dir.icon || '📁'} ${escapeHtml(dir.name)}`;
    btn.title = `Filtrar tarefas no projeto "${dir.path || dir.id}"`;
    btn.addEventListener('click', () => setDirectoryFilter(dir.id));
    directoryFilterPillsContainer.appendChild(btn);
  });
}

function setDirectoryFilter(dirId) {
  currentDirectoryFilter = dirId;
  renderDirectoryFilterPills();
  if (currentBoardView === 'analytics') {
    renderAnalyticsDashboard(currentFeatures);
  } else {
    renderFeatures(currentFeatures);
  }
}

function renderModalDirectoriesList() {
  if (!modalDirectoriesList) return;
  modalDirectoriesList.innerHTML = '';
  if (directoriesCountBadge) {
    directoriesCountBadge.textContent = `${projectDirectories.length} diretório(s)`;
  }

  projectDirectories.forEach(dir => {
    const row = document.createElement('div');
    row.className = 'directory-row-card';
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
        <span style="font-size: 20px;">${dir.icon || '📁'}</span>
        <div style="min-width: 0;">
          <div style="font-size: 13px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(dir.name)}
          </div>
          <div style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">
            caminho: <code>${escapeHtml(dir.path || dir.id)}</code> (ID: ${escapeHtml(dir.id)})
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
        <button type="button" class="btn btn-secondary btn-sm btn-filter-dir" style="padding: 3px 8px; font-size: 11px;" title="Filtrar tarefas deste projeto">
          🎯 Filtrar
        </button>
        <button type="button" class="btn btn-danger btn-sm btn-del-dir" style="padding: 3px 8px; font-size: 11px;" title="Remover diretório">
          🗑️ Excluir
        </button>
      </div>
    `;

    row.querySelector('.btn-filter-dir')?.addEventListener('click', () => {
      setDirectoryFilter(dir.id);
      if (modalManageDirectories) modalManageDirectories.classList.remove('open');
      showToast(`Filtrando tarefas do projeto "${dir.name}"!`, 'info');
    });

    row.querySelector('.btn-del-dir')?.addEventListener('click', async () => {
      const confirmed = await showConfirmModal({
        title: 'Remover Diretório de Filtro',
        icon: '🗑️',
        message: `Deseja remover o diretório **${dir.name}** (${dir.path}) da barra de filtros?`,
        confirmText: 'Sim, Remover',
        confirmBtnClass: 'btn-danger'
      });
      if (!confirmed) return;

      try {
        const res = await fetch('/api/directories/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: dir.id })
        });
        const data = await res.json();
        if (data.success) {
          projectDirectories = data.directories || projectDirectories.filter(d => d.id !== dir.id);
          if (currentDirectoryFilter === dir.id) setDirectoryFilter('all');
          else renderDirectoryFilterPills();
          renderModalDirectoriesList();
          showToast(`Diretório "${dir.name}" removido!`, 'success');
        } else {
          showToast(data.error || 'Erro ao remover diretório', 'error');
        }
      } catch (err) {
        showToast('Erro de conexão ao remover diretório', 'error');
      }
    });

    modalDirectoriesList.appendChild(row);
  });
}

// Handlers do Modal de Diretórios
if (btnQuickManageDirectories) {
  btnQuickManageDirectories.addEventListener('click', () => {
    renderModalDirectoriesList();
    if (modalManageDirectories) modalManageDirectories.classList.add('open');
  });
}

if (btnCloseDirectoriesModal) {
  btnCloseDirectoriesModal.addEventListener('click', () => {
    if (modalManageDirectories) modalManageDirectories.classList.remove('open');
  });
}

if (btnCancelDirectories) {
  btnCancelDirectories.addEventListener('click', () => {
    if (modalManageDirectories) modalManageDirectories.classList.remove('open');
  });
}

if (modalManageDirectories) {
  modalManageDirectories.addEventListener('click', (e) => {
    if (e.target === modalManageDirectories) {
      modalManageDirectories.classList.remove('open');
    }
  });
}

// Handler para salvar novo diretório
if (btnSaveNewDirectory) {
  btnSaveNewDirectory.addEventListener('click', async () => {
    const name = inputNewDirName ? inputNewDirName.value.trim() : '';
    const pathVal = inputNewDirPath ? inputNewDirPath.value.trim() : '';
    const icon = inputNewDirIcon ? (inputNewDirIcon.value.trim() || '📁') : '📁';

    if (!name || !pathVal) {
      showToast('⚠️ Preencha o Nome e o Caminho do diretório!', 'warning');
      if (!name && inputNewDirName) inputNewDirName.focus();
      else if (inputNewDirPath) inputNewDirPath.focus();
      return;
    }

    const id = pathVal.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '');

    const confirmed = await showConfirmModal({
      title: 'Cadastrar Novo Diretório',
      icon: icon || '📁',
      message: `Deseja adicionar o filtro de diretório **${name}** (caminho: \`${pathVal}\`) no Kanban?`,
      confirmText: 'Sim, Cadastrar',
      confirmBtnClass: 'btn-primary'
    });
    if (!confirmed) return;

    try {
      const res = await fetch('/api/directories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, path: pathVal, icon })
      });
      const data = await res.json();
      if (data.success) {
        projectDirectories = data.directories || [...projectDirectories, { id, name, path: pathVal, icon }];
        renderDirectoryFilterPills();
        renderModalDirectoriesList();
        if (inputNewDirName) inputNewDirName.value = '';
        if (inputNewDirPath) inputNewDirPath.value = '';
        if (inputNewDirIcon) inputNewDirIcon.value = '📁';
        showToast(`Diretório "${name}" cadastrado com sucesso!`, 'success');
      } else {
        showToast(data.error || 'Erro ao cadastrar diretório', 'error');
      }
    } catch (err) {
      showToast('Erro de conexão ao cadastrar diretório', 'error');
    }
  });
}

// =============================================================
// DROPDOWN FLUTUANTE PARA ALTERAR DIRETÓRIO / PROJETO NO CARD
// =============================================================
let activeCardDirDropdown = null;

function closeCardDirDropdown() {
  if (activeCardDirDropdown) {
    activeCardDirDropdown.remove();
    activeCardDirDropdown = null;
  }
}

// Fecha o dropdown ao clicar fora ou pressionar Escape
document.addEventListener('click', (e) => {
  if (activeCardDirDropdown && !activeCardDirDropdown.contains(e.target) && !e.target.closest('.btn-card-directory')) {
    closeCardDirDropdown();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCardDirDropdown();
  }
});

function openCardDirDropdown(targetBtn, featureName, currentDir) {
  if (activeCardDirDropdown && activeCardDirDropdown._targetBtn === targetBtn) {
    closeCardDirDropdown();
    return;
  }
  closeCardDirDropdown();

  const menu = document.createElement('div');
  menu.className = 'card-dir-dropdown-menu';
  menu.id = 'card-dir-dropdown';
  menu._targetBtn = targetBtn;

  // Header do Dropdown
  const header = document.createElement('div');
  header.style.cssText = 'font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-dim); padding: 4px 8px 6px 8px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 4px;';
  header.textContent = 'Mudar Projeto / Site';
  menu.appendChild(header);

  const curDirNorm = (currentDir || '').toLowerCase().trim();

  // Opções de diretórios cadastrados
  projectDirectories.forEach(dir => {
    const item = document.createElement('button');
    item.type = 'button';
    const isAct = curDirNorm === dir.id.toLowerCase();
    item.className = `card-dir-dropdown-item ${isAct ? 'active' : ''}`;
    item.innerHTML = `<span>${dir.icon || '📁'}</span> <span style="flex: 1; text-align: left;">${escapeHtml(dir.name)}</span> ${isAct ? '<span style="font-size: 11px;">✓</span>' : ''}`;
    item.title = `Definir projeto como "${dir.name}" (${dir.path || dir.id})`;
    item.addEventListener('click', (ev) => {
      ev.stopPropagation();
      changeFeatureDirectory(featureName, dir.id, dir.name);
    });
    menu.appendChild(item);
  });

  // Opção Geral / Padrão se não estiver na lista
  const hasGeral = projectDirectories.some(d => d.id.toLowerCase() === 'geral');
  if (!hasGeral) {
    const itemGeral = document.createElement('button');
    itemGeral.type = 'button';
    const isGeralAct = !curDirNorm || curDirNorm === 'geral';
    itemGeral.className = `card-dir-dropdown-item ${isGeralAct ? 'active' : ''}`;
    itemGeral.innerHTML = `<span>📁</span> <span style="flex: 1; text-align: left;">Geral / Raiz</span> ${isGeralAct ? '<span style="font-size: 11px;">✓</span>' : ''}`;
    itemGeral.addEventListener('click', (ev) => {
      ev.stopPropagation();
      changeFeatureDirectory(featureName, 'geral', 'Geral');
    });
    menu.appendChild(itemGeral);
  }

  document.body.appendChild(menu);
  activeCardDirDropdown = menu;

  // Posicionamento inteligente
  const rect = targetBtn.getBoundingClientRect();
  const menuWidth = 190;
  let top = rect.bottom + window.scrollY + 4;
  let left = rect.left + window.scrollX;

  if (left + menuWidth > window.innerWidth - 12) {
    left = window.innerWidth - menuWidth - 12;
  }
  if (left < 10) left = 10;

  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
}

async function changeFeatureDirectory(featureName, newDirId, dirName) {
  closeCardDirDropdown();

  const feat = currentFeatures.find(f => f.name === featureName);
  const currentDirId = ((feat && feat.directory) || 'geral').toLowerCase();
  const targetDirId = (newDirId || 'geral').toLowerCase();

  if (feat && currentDirId === targetDirId) {
    return;
  }

  const currentDirObj = projectDirectories.find(d => d.id.toLowerCase() === currentDirId);
  const currentDirDisplayName = currentDirObj ? currentDirObj.name : (currentDirId === 'geral' ? 'Geral' : currentDirId);
  const targetDirDisplayName = dirName || newDirId;

  const confirmed = await showConfirmModal({
    title: 'Alterar Projeto / Diretório',
    icon: '📁',
    message: `Deseja realmente alterar o projeto da feature **${featureName}** de *${currentDirDisplayName}* para **${targetDirDisplayName}**?`,
    warning: 'O diretório base de execução das tarefas e comandos desta feature será atualizado.',
    confirmText: 'Sim, Alterar Projeto',
    cancelText: 'Cancelar',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

  try {
    const res = await fetch('/api/features/directory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureId: featureName, directory: newDirId })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || `Projeto alterado para "${dirName || newDirId}"!`, 'success');
      appendLog(`Projeto da feature "${featureName}" alterado para "${dirName || newDirId}".`);

      // Atualiza na memória imediatamente
      const feat = currentFeatures.find(f => f.name === featureName);
      if (feat) {
        feat.directory = newDirId;
      }
      renderFeatures(currentFeatures);

      // Atualiza também se a modal de detalhes estiver aberta
      if (currentDetailFeature && currentDetailFeature.name === featureName) {
        currentDetailFeature.directory = newDirId;
        const detBadge = document.getElementById('detail-badge-directory');
        if (detBadge) {
          const dirObj = projectDirectories.find(d => d.id.toLowerCase() === newDirId.toLowerCase());
          detBadge.innerHTML = `${dirObj?.icon || '📁'} ${escapeHtml(dirObj?.name || newDirId)} <span style="font-size: 8px; opacity: 0.7;">▼</span>`;
        }
      }

      // Sincroniza estado fresco do backend
      fetchFeatures();
    } else {
      showToast(data.error || 'Erro ao alterar projeto', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao alterar projeto', 'error');
  }
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
      const confirmed = await showConfirmModal({
        title: 'Reativar Integrante',
        icon: '👤',
        message: `Deseja reativar o integrante **${m.name}** na equipe?`,
        confirmText: 'Sim, Reativar',
        confirmBtnClass: 'btn-success'
      });
      if (!confirmed) return;
      await activateMember(m.id);
    });

    card.querySelector('.btn-delete-member')?.addEventListener('click', async () => {
      const confirmed = await showConfirmModal({
        title: 'Remover Integrante',
        icon: '🗑️',
        message: `Deseja realmente remover o integrante **${m.name}** da equipe?`,
        warning: 'O integrante será removido do arquivo members.json.',
        confirmText: 'Sim, Remover',
        confirmBtnClass: 'btn-danger'
      });
      if (!confirmed) return;
      if (inputMemberEditId && inputMemberEditId.value === m.id) {
        cancelEditMember();
      }
      await deleteMember(m.id);
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

  const confirmed = await showConfirmModal({
    title: isEditing ? 'Atualizar Integrante' : 'Cadastrar Integrante',
    icon: avatar || '👤',
    message: isEditing
      ? `Deseja salvar as alterações no perfil do integrante **${name}**?`
      : `Deseja cadastrar **${name}** (${role}) na equipe?`,
    confirmText: isEditing ? 'Sim, Salvar Alterações' : 'Sim, Cadastrar',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

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
  const member = teamMembers.find(m => m.id === memberId);
  const memberName = member ? member.name : (optionalName || memberId);

  const confirmed = await showConfirmModal({
    title: 'Definir Identidade do Desenvolvedor Local',
    icon: '👤',
    message: `Deseja configurar o Git local para registrar novos commits e ações como **${memberName}**?`,
    warning: 'Seus próximos commits e alterações no repositório serão identificados com este autor.',
    confirmText: 'Sim, Definir Identidade',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

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

  // Multi-Dropdown de Responsáveis da Tarefa (Nenhum selecionado por padrão)
  populateMultiAssigneeDropdown(multiAssigneeSearch ? multiAssigneeSearch.value.trim() : '');
  updateMultiAssigneeTriggerDisplay();

  if (detailNewTaskAssignee) {
    const curVal = detailNewTaskAssignee.value;
    detailNewTaskAssignee.innerHTML = '<option value="">👤 Selecione o Responsável...</option>';
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

  const detailBadgeDirectory = document.getElementById('detail-badge-directory');
  if (detailBadgeDirectory) {
    const curDir = (feature.directory || 'geral').toLowerCase();
    const dirObj = projectDirectories.find(d => d.id.toLowerCase() === curDir);
    detailBadgeDirectory.innerHTML = `${dirObj ? `${dirObj.icon || '📁'} ${escapeHtml(dirObj.name)}` : (feature.directory ? `📁 ${escapeHtml(feature.directory)}` : '📁 Projeto')} <span style="font-size: 8px; opacity: 0.7;">▼</span>`;
    detailBadgeDirectory.onclick = (e) => {
      e.stopPropagation();
      openCardDirDropdown(detailBadgeDirectory, feature.name, feature.directory);
    };
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
  if (detailNewTaskDirectory) {
    detailNewTaskDirectory.value = (feature.directory && feature.directory !== 'geral') ? feature.directory : '';
  }

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

    const fullTextContent = t.prompt ? `${cleanText}\n${t.prompt}` : cleanText;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <label class="detail-task-label" style="flex: 1;">
          <input type="checkbox" ${t.done ? 'checked' : ''} ${feature.isFromGitBranch ? 'disabled' : ''} class="detail-task-chk" data-task-id="${t.id}">
          <span>${t.id ? `<strong>${escapeHtml(t.id)}</strong> ` : ''}${escapeHtml(cleanText || t.text)}</span>
        </label>
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          ${assigneeHtml}
          ${!feature.isFromGitBranch ? `
            <button type="button" class="btn-detail-edit-task" title="Alterar esta tarefa" style="background: none; border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; border-radius: 4px; padding: 2px 7px; font-size: 11px; cursor: pointer;">✏️ Alterar</button>
            <button type="button" class="btn-detail-del-task" title="Excluir tarefa" style="background: none; border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer;">🗑️</button>
          ` : ''}
        </div>
      </div>
      ${promptHtml}

      <!-- Inline Task Editor Container -->
      <div class="inline-task-edit-box" style="display: none; margin-top: 10px; padding: 12px; background: rgba(10, 15, 26, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px;">
        <div style="font-size: 12px; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">✏️ Alterar Tarefa</div>
        <div class="form-row" style="margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 11px;">ID da Tarefa:</label>
            <input type="text" class="form-input form-input-sm edit-id-input" value="${escapeHtml(t.id)}">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 11px;">Responsável:</label>
            <select class="form-select form-select-sm edit-assignee-select"></select>
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 8px;">
          <label style="font-size: 11px;">Descrição da Tarefa / Prompt:</label>
          <textarea class="form-textarea form-textarea-sm edit-text-input" rows="3" style="min-height: 70px; resize: vertical;">${escapeHtml(fullTextContent)}</textarea>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label style="font-size: 12px; display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <input type="checkbox" class="edit-done-chk" ${t.done ? 'checked' : ''}>
            <span>Marcar como Concluído</span>
          </label>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-secondary btn-sm btn-inline-cancel" style="padding: 4px 10px; font-size: 11px;">❌ Cancelar</button>
            <button type="button" class="btn btn-primary btn-sm btn-inline-save" style="padding: 4px 12px; font-size: 11px;">💾 Salvar</button>
          </div>
        </div>
      </div>
    `;

    // Populate members in inline editor select
    const editSelect = card.querySelector('.edit-assignee-select');
    if (editSelect) {
      editSelect.innerHTML = `<option value="Todos">👥 Todos</option>`;
      const activeMembers = teamMembers.filter(m => isMemberActive(m.name));
      activeMembers.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        if (t.assignee && (t.assignee.toLowerCase() === m.name.toLowerCase() || t.assignee.toLowerCase() === m.id.toLowerCase())) {
          opt.selected = true;
        }
        editSelect.appendChild(opt);
      });
    }

    // Toggle inline editor
    const editBox = card.querySelector('.inline-task-edit-box');
    card.querySelector('.btn-detail-edit-task')?.addEventListener('click', (e) => {
      e.stopPropagation();
      editBox.style.display = editBox.style.display === 'none' ? 'block' : 'none';
    });
    card.querySelector('.btn-inline-cancel')?.addEventListener('click', (e) => {
      e.stopPropagation();
      editBox.style.display = 'none';
    });

    // Save inline edit
    card.querySelector('.btn-inline-save')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const newId = card.querySelector('.edit-id-input')?.value.trim();
      const newAssignee = card.querySelector('.edit-assignee-select')?.value;
      const newText = card.querySelector('.edit-text-input')?.value.trim();
      const isDone = card.querySelector('.edit-done-chk')?.checked;

      if (!newText) {
        showToast('A descrição da tarefa não pode ficar vazia', 'warning');
        return;
      }

      const confirmed = await showConfirmModal({
        title: 'Salvar Alterações da Tarefa',
        icon: '✏️',
        message: `Deseja salvar as alterações na tarefa **${t.id}**?`,
        warning: `Responsável: ${newAssignee || 'Todos'} | Status: ${isDone ? 'Concluído' : 'Pendente'}`,
        confirmText: 'Sim, Salvar Alterações',
        confirmBtnClass: 'btn-primary'
      });
      if (!confirmed) return;

      try {
        const res = await fetch('/api/tasks/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feature: feature.name,
            taskId: t.id,
            newTaskId: newId !== t.id ? newId : undefined,
            text: newText,
            assignee: newAssignee || 'Todos',
            done: isDone
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          appendLog(data.message);
          await fetchFeatures();
          const updatedFeat = currentFeatures.find(f => f.name === feature.name);
          if (updatedFeat) {
            openFeatureDetailsModal(updatedFeat, 'tasks');
          }
        } else {
          showToast(data.error || 'Erro ao alterar tarefa', 'error');
        }
      } catch {
        showToast('Erro de conexão ao alterar tarefa', 'error');
      }
    });

    // Delete task from modal
    card.querySelector('.btn-detail-del-task')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmed = await showConfirmModal({
        title: 'Excluir Tarefa',
        icon: '🗑️',
        message: `Deseja realmente excluir a tarefa **${t.id}**?`,
        warning: 'Esta tarefa será removida permanentemente do arquivo tasks.md.',
        confirmText: 'Sim, Excluir',
        confirmBtnClass: 'btn-danger'
      });
      if (!confirmed) return;

      try {
        const res = await fetch('/api/tasks/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature: feature.name, taskId: t.id })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          appendLog(data.message);
          await fetchFeatures();
          const updatedFeat = currentFeatures.find(f => f.name === feature.name);
          if (updatedFeat) {
            openFeatureDetailsModal(updatedFeat, 'tasks');
          }
        } else {
          showToast(data.error || 'Erro ao excluir tarefa', 'error');
        }
      } catch {
        showToast('Erro de conexão ao excluir tarefa', 'error');
      }
    });

    card.querySelector('.btn-copy-prompt')?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(t.prompt).then(() => {
        showToast('Prompt copiado para a área de transferência!', 'success');
      }).catch(() => {
        showToast('Não foi possível copiar o prompt', 'error');
      });
    });

    card.querySelector('.detail-task-chk')?.addEventListener('click', async (e) => {
      const chk = e.target;
      e.preventDefault();
      const targetState = !chk.checked;

      const confirmed = await showConfirmModal({
        title: targetState ? 'Concluir Tarefa' : 'Reabrir Tarefa',
        icon: targetState ? '✅' : '🔄',
        message: targetState
          ? `Deseja marcar a tarefa **${t.id}** como Concluída?`
          : `Deseja reabrir a tarefa **${t.id}** e retorná-la para pendente?`,
        warning: 'Esta alteração será salva no arquivo tasks.md do OpenSpec.',
        confirmText: targetState ? 'Sim, Concluir' : 'Sim, Reabrir',
        confirmBtnClass: targetState ? 'btn-success' : 'btn-primary'
      });

      if (confirmed) {
        chk.checked = targetState;
        await updateTaskStatusDirect(feature.name, t.id, targetState);
        t.done = targetState;
        card.classList.toggle('done', targetState);
        const doneCount = feature.tasks.filter(x => x.done).length;
        feature.doneTasks = doneCount;
        feature.progress = feature.tasks.length > 0 ? Math.round((doneCount / feature.tasks.length) * 100) : 0;
        if (detailProgressLabel) detailProgressLabel.textContent = `Progresso: ${feature.doneTasks}/${feature.totalTasks} (${feature.progress}%)`;
        if (detailProgressBar) detailProgressBar.style.width = `${feature.progress}%`;
      }
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
      const confirmed = await showConfirmModal({
        title: 'Validar Proposta',
        icon: '🔍',
        message: `Deseja marcar a proposta **${feature.title || feature.name}** como Validada?`,
        confirmText: 'Sim, Validar',
        confirmBtnClass: 'btn-primary'
      });
      if (!confirmed) return;
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
      const confirmed = await showConfirmModal({
        title: 'Aprovar Proposta para Sprint',
        icon: '✅',
        message: `Deseja aprovar a proposta **${feature.title || feature.name}** para desenvolvimento na Sprint?`,
        warning: `Responsável atribuído: "${assignee}".`,
        confirmText: 'Sim, Aprovar',
        confirmBtnClass: 'btn-success'
      });
      if (!confirmed) return;
      await triggerIdeaAction(feature.name, 'approve', assignee);
      feature.ideaStatus = 'Aprovado';
      openFeatureDetailsModal(feature, 'proposal');
    };
    detailFooterActions.appendChild(btnApp);

    const btnRej = document.createElement('button');
    btnRej.className = 'btn btn-danger btn-sm';
    btnRej.innerHTML = '❌ Rejeitar';
    btnRej.onclick = async () => {
      const reason = await showConfirmModal({
        title: 'Rejeitar Proposta',
        icon: '❌',
        message: `Deseja realmente rejeitar a proposta **${feature.title || feature.name}**?`,
        warning: 'A proposta será movida para Rejeitado no funil.',
        confirmText: 'Confirmar Rejeição',
        confirmBtnClass: 'btn-danger',
        withInput: true,
        inputLabel: 'Motivo da rejeição:',
        inputPlaceholder: 'Informe o motivo...',
        inputDefault: 'Fora do escopo da sprint atual'
      });
      if (reason) {
        const reasonStr = typeof reason === 'string' ? reason : 'Fora do escopo da sprint atual';
        await triggerIdeaAction(feature.name, 'reject', undefined, reasonStr);
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

  const confirmed = await showConfirmModal({
    title: 'Salvar Proposta (proposal.md)',
    icon: '💾',
    message: `Deseja realmente salvar as alterações na proposta da feature **${currentDetailFeature.name}**?`,
    warning: 'O arquivo proposal.md no OpenSpec será atualizado com o texto editado.',
    confirmText: 'Sim, Salvar Proposta',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

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
  const directory = detailNewTaskDirectory ? detailNewTaskDirectory.value : '';

  if (!text) {
    showToast('Informe a descrição da nova tarefa', 'warning');
    detailNewTaskText?.focus();
    return;
  }

  // Validação obrigatória: Projeto / Diretório é obrigatório!
  if (!directory) {
    showToast('⚠️ Selecione o Projeto / Diretório da tarefa!', 'warning');
    if (detailNewTaskDirectory) {
      detailNewTaskDirectory.classList.add('has-error');
      detailNewTaskDirectory.focus();
    }
    return;
  }

  const confirmed = await showConfirmModal({
    title: 'Adicionar Nova Tarefa',
    icon: '➕',
    message: `Deseja adicionar a tarefa **${taskId ? taskId + ' - ' : ''}${text.slice(0, 60)}** à feature **${currentDetailFeature.name}**?`,
    warning: `Responsável: ${assignee}${directory ? ` | Projeto: ${directory}` : ''}`,
    confirmText: 'Sim, Adicionar Tarefa',
    confirmBtnClass: 'btn-primary'
  });
  if (!confirmed) return;

  try {
    const res = await fetch('/api/tasks/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature: currentDetailFeature.name,
        taskId: taskId || '',
        text: text,
        assignee: assignee !== 'Todos' ? assignee : undefined,
        directory: directory || undefined
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      appendLog(data.message);
      if (!currentDetailFeature.tasks) currentDetailFeature.tasks = [];
      const effectiveId = data.taskId || taskId;
      currentDetailFeature.tasks.push({
        id: effectiveId,
        text,
        done: false,
        status: 'Backlog',
        assignee
      });
      currentDetailFeature.totalTasks = currentDetailFeature.tasks.length;
      renderDetailTasksList(currentDetailFeature);
      if (detailNewTaskText) detailNewTaskText.value = '';
      if (detailNewTaskAssignee) detailNewTaskAssignee.value = 'Todos';
      if (detailNewTaskId && effectiveId) {
        const parts = effectiveId.split('.');
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
    btnTop.innerHTML = '⚡';
    btnTop.title = isCollapsed ? 'Mostrar Painel OpenSpec (Ctrl+B)' : 'Ocultar Painel OpenSpec (Ctrl+B)';
    btnTop.setAttribute('aria-label', btnTop.title);
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

// ============================================================
// Gerenciamento de Tema (Dark / Light - Padrão: Dark)
// ============================================================
function getSavedTheme() {
  try {
    return localStorage.getItem('kanban_theme') || 'dark';
  } catch {
    return 'dark';
  }
}

function applyTheme(theme, notify = false) {
  const currentTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (document.body) {
    document.body.setAttribute('data-theme', currentTheme);
  }

  try {
    localStorage.setItem('kanban_theme', currentTheme);
  } catch { }

  const themeIcon = document.getElementById('theme-toggle-icon');
  const themeLabel = document.getElementById('theme-toggle-label');
  const themeBtn = document.getElementById('btn-toggle-theme');

  if (currentTheme === 'dark') {
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeLabel) themeLabel.textContent = '';
    if (themeBtn) {
      themeBtn.title = 'Alternar para tema Claro';
      themeBtn.setAttribute('aria-label', 'Alternar para tema Claro');
    }
  } else {
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeLabel) themeLabel.textContent = '';
    if (themeBtn) {
      themeBtn.title = 'Alternar para tema Escuro (Padrão: Escuro)';
      themeBtn.setAttribute('aria-label', 'Alternar para tema Escuro');
    }
  }

  if (notify) {
    showToast(currentTheme === 'dark' ? '🌙 Modo Escuro ativado (Padrão)' : '☀️ Modo Claro ativado', 'info');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const nextTheme = current === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme, true);
}

function initTheme() {
  const initialTheme = getSavedTheme();
  applyTheme(initialTheme, false);

  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  btnToggleTheme?.addEventListener('click', toggleTheme);
}

// ============================================================
// CENTRAL GIT - ESTILO GITHUB DESKTOP (CHANGES & HISTORY)
// ============================================================
const modalGitDesktop = document.getElementById('modal-git-desktop');
const btnOpenGitDesktop = document.getElementById('btn-open-git-desktop');
const btnCloseGitDesktop = document.getElementById('btn-close-git-desktop');
const btnGitDesktopRefresh = document.getElementById('btn-git-desktop-refresh');
const btnGitDesktopPush = document.getElementById('btn-git-desktop-push');
const gitDesktopBranchPill = document.getElementById('git-desktop-branch-pill');
const tabBtnGitChanges = document.getElementById('tab-btn-git-changes');
const tabBtnGitHistory = document.getElementById('tab-btn-git-history');
const gitPaneChanges = document.getElementById('git-pane-changes');
const gitPaneHistory = document.getElementById('git-pane-history');
const badgeGitChangesCount = document.getElementById('badge-git-changes-count');
const badgeGitUnpushedCount = document.getElementById('badge-git-unpushed-count');

// Changes Tab Elements
const gitFilterChangesInput = document.getElementById('git-filter-changes-input');
const chkGitSelectAll = document.getElementById('chk-git-select-all');
const labelGitChangedCount = document.getElementById('label-git-changed-count');
const btnGitDiscardAll = document.getElementById('btn-git-discard-all');
const gitChangesFilesList = document.getElementById('git-changes-files-list');
const gitDiffFilePath = document.getElementById('git-diff-file-path');
const gitDiffHeaderActions = document.getElementById('git-diff-header-actions');
const btnCopyDiffPath = document.getElementById('btn-copy-diff-path');
const btnDiscardSingleFile = document.getElementById('btn-discard-single-file');
const gitDiffBody = document.getElementById('git-diff-body');
const inputGitCommitMsg = document.getElementById('input-git-commit-msg');
const textareaGitCommitDesc = document.getElementById('textarea-git-commit-desc');
const btnGitCommitSubmit = document.getElementById('btn-git-commit-submit');
const labelCommitBranch = document.getElementById('label-commit-branch');
const gitCommitUserName = document.getElementById('git-commit-user-name');
const gitCommitUserAvatar = document.getElementById('git-commit-user-avatar');

// History Tab Elements
const gitFilterHistoryInput = document.getElementById('git-filter-history-input');
const gitUnpushedBanner = document.getElementById('git-unpushed-banner');
const gitUnpushedBannerMsg = document.getElementById('git-unpushed-banner-msg');
const btnUnpushedBannerPush = document.getElementById('btn-unpushed-banner-push');
const gitHistoryCommitsList = document.getElementById('git-history-commits-list');
const gitCommitFullTitle = document.getElementById('git-commit-full-title');
const gitCommitUnpushedTag = document.getElementById('git-commit-unpushed-tag');
const gitCommitMetaRow = document.getElementById('git-commit-meta-row');
const gitCommitMetaAvatar = document.getElementById('git-commit-meta-avatar');
const gitCommitAuthorName = document.getElementById('git-commit-author-name');
const gitCommitAuthorEmail = document.getElementById('git-commit-author-email');
const gitCommitFullDate = document.getElementById('git-commit-full-date');
const gitCommitHashCode = document.getElementById('git-commit-hash-code');
const gitCommitDetailsBody = document.getElementById('git-commit-details-body');

// State
let gitDesktopActiveTab = 'changes';
let gitChangesList = [];
let gitSelectedFilePaths = new Set();
let gitActiveDiffFile = null;
let gitHistoryList = [];
let gitActiveCommitHash = null;
let gitFilterChangesQuery = '';
let gitFilterHistoryQuery = '';

function openGitDesktopModal(defaultTab = 'changes') {
  setBoardView('git');
  setGitDesktopTab(defaultTab);
  refreshGitDesktop();
}

function closeGitDesktopModal() {
  setBoardView('tasks');
}

function setGitDesktopTab(tab) {
  gitDesktopActiveTab = tab;
  if (tab === 'changes') {
    tabBtnGitChanges?.classList.add('active');
    tabBtnGitHistory?.classList.remove('active');
    if (tabBtnGitChanges) tabBtnGitChanges.setAttribute('aria-selected', 'true');
    if (tabBtnGitHistory) tabBtnGitHistory.setAttribute('aria-selected', 'false');
    if (gitPaneChanges) gitPaneChanges.style.display = 'flex';
    if (gitPaneHistory) gitPaneHistory.style.display = 'none';
    fetchGitChanges();
  } else {
    tabBtnGitHistory?.classList.add('active');
    tabBtnGitChanges?.classList.remove('active');
    if (tabBtnGitHistory) tabBtnGitHistory.setAttribute('aria-selected', 'true');
    if (tabBtnGitChanges) tabBtnGitChanges.setAttribute('aria-selected', 'false');
    if (gitPaneHistory) gitPaneHistory.style.display = 'flex';
    if (gitPaneChanges) gitPaneChanges.style.display = 'none';
    fetchGitHistory();
  }
}

async function refreshGitDesktop() {
  if (gitDesktopActiveTab === 'changes') {
    await fetchGitChanges();
  } else {
    await fetchGitHistory();
  }
  fetchGitInfo();
}

// -------------------------------------------------------------
// Changes Tab Logic
// -------------------------------------------------------------
async function fetchGitChanges() {
  try {
    const res = await fetch('/api/git/changes');
    const data = await res.json();
    if (data.success) {
      gitChangesList = data.files || [];
      if (gitDesktopBranchPill) {
        gitDesktopBranchPill.textContent = `🌿 ${data.branch || 'main'}`;
      }
      if (labelCommitBranch) {
        labelCommitBranch.textContent = data.branch || 'main';
      }
      if (badgeGitChangesCount) {
        badgeGitChangesCount.textContent = gitChangesList.length;
      }
      if (badgeGitViewCount) {
        badgeGitViewCount.textContent = gitChangesList.length;
        badgeGitViewCount.style.display = gitChangesList.length > 0 ? 'inline-block' : 'none';
      }
      if (labelGitChangedCount) {
        labelGitChangedCount.textContent = `${gitChangesList.length} changed files`;
      }

      // Atualiza identidade no commit box
      if (detectedDevMember) {
        if (gitCommitUserName) gitCommitUserName.textContent = detectedDevMember.name;
        if (gitCommitUserAvatar) gitCommitUserAvatar.textContent = detectedDevMember.avatar || '👤';
      } else if (gitUserLocal?.name) {
        if (gitCommitUserName) gitCommitUserName.textContent = gitUserLocal.name;
      }

      // Marca todos por padrão
      gitSelectedFilePaths = new Set(gitChangesList.map(f => f.path));
      if (chkGitSelectAll) {
        chkGitSelectAll.checked = gitChangesList.length > 0;
        chkGitSelectAll.indeterminate = false;
      }

      renderGitChangesList();

      // Se havia um arquivo ativo, recarrega o diff dele, ou o primeiro
      if (gitActiveDiffFile && gitChangesList.some(f => f.path === gitActiveDiffFile)) {
        loadGitDiff(gitActiveDiffFile);
      } else if (gitChangesList.length > 0) {
        loadGitDiff(gitChangesList[0].path);
      } else {
        renderEmptyDiff();
      }
    }
  } catch (err) {
    console.error('Erro ao buscar alterações locais:', err);
    showToast('Erro ao carregar alterações do Git', 'error');
  }
}

function renderGitChangesList() {
  if (!gitChangesFilesList) return;
  gitChangesFilesList.innerHTML = '';

  const filterText = gitFilterChangesQuery.toLowerCase();
  const filtered = gitChangesList.filter(f => {
    if (!filterText) return true;
    return f.path.toLowerCase().includes(filterText) || f.name.toLowerCase().includes(filterText);
  });

  if (filtered.length === 0) {
    gitChangesFilesList.innerHTML = `
      <div class="git-empty-state-small">
        ${gitChangesList.length === 0 ? 'Nenhuma alteração pendente no repositório local.' : 'Nenhum arquivo encontrado com o filtro atual.'}
      </div>
    `;
    return;
  }

  filtered.forEach(file => {
    const isSelected = file.path === gitActiveDiffFile;
    const isChecked = gitSelectedFilePaths.has(file.path);

    const item = document.createElement('div');
    item.className = `git-file-item ${isSelected ? 'selected' : ''}`;
    item.dataset.path = file.path;

    // Ícone de status: Amarelo para Modified (M), Verde para Added (+), Vermelho para Deleted (-)
    let iconClass = 'modified';
    let iconSymbol = '●';
    if (file.status === 'added' || file.status === 'untracked') {
      iconClass = 'added';
      iconSymbol = '+';
    } else if (file.status === 'deleted') {
      iconClass = 'deleted';
      iconSymbol = '−';
    } else if (file.status === 'renamed') {
      iconClass = 'renamed';
      iconSymbol = '→';
    }

    item.innerHTML = `
      <div class="git-file-item-left">
        <input type="checkbox" class="chk-git-file" ${isChecked ? 'checked' : ''} data-path="${escapeHtml(file.path)}">
        <div class="git-file-item-text" title="${escapeHtml(file.path)}">
          <span class="git-file-name">${escapeHtml(file.name)}</span>
          ${file.directory ? `<span class="git-file-dir">${escapeHtml(file.directory)}</span>` : ''}
        </div>
      </div>
      <span class="git-status-icon-badge ${iconClass}" title="${escapeHtml(file.statusLabel)}: ${file.statusCode}">
        ${iconSymbol}
      </span>
    `;

    // Click item para abrir diff
    item.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      loadGitDiff(file.path);
    });

    // Checkbox toggle
    const chk = item.querySelector('.chk-git-file');
    chk?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (chk.checked) {
        gitSelectedFilePaths.add(file.path);
      } else {
        gitSelectedFilePaths.delete(file.path);
      }
      updateSelectAllCheckboxState();
    });

    gitChangesFilesList.appendChild(item);
  });
}

function updateSelectAllCheckboxState() {
  if (!chkGitSelectAll) return;
  const total = gitChangesList.length;
  const selected = gitSelectedFilePaths.size;

  if (selected === 0) {
    chkGitSelectAll.checked = false;
    chkGitSelectAll.indeterminate = false;
  } else if (selected === total) {
    chkGitSelectAll.checked = true;
    chkGitSelectAll.indeterminate = false;
  } else {
    chkGitSelectAll.checked = false;
    chkGitSelectAll.indeterminate = true;
  }
}

async function loadGitDiff(filePath) {
  gitActiveDiffFile = filePath;

  // Atualiza classe selecionada na lista
  document.querySelectorAll('.git-file-item').forEach(item => {
    item.classList.toggle('selected', item.dataset.path === filePath);
  });

  if (gitDiffFilePath) gitDiffFilePath.textContent = filePath;
  if (gitDiffHeaderActions) gitDiffHeaderActions.style.display = 'flex';

  if (gitDiffBody) {
    gitDiffBody.innerHTML = '<div style="padding: 20px; color: var(--text-dim);">Carregando diff...</div>';
  }

  try {
    const res = await fetch(`/api/git/diff?file=${encodeURIComponent(filePath)}`);
    const data = await res.json();
    if (data.success && gitDiffBody) {
      renderDiffContent(data.diff, data.isUntracked);
    } else if (gitDiffBody) {
      gitDiffBody.innerHTML = `<div style="padding: 20px; color: var(--accent-rose);">${escapeHtml(data.error || 'Erro ao carregar diff')}</div>`;
    }
  } catch (err) {
    if (gitDiffBody) {
      gitDiffBody.innerHTML = `<div style="padding: 20px; color: var(--accent-rose);">Erro de conexão ao buscar diff.</div>`;
    }
  }
}

function renderDiffContent(rawDiff, isUntracked = false) {
  if (!gitDiffBody) return;
  gitDiffBody.innerHTML = '';

  if (!rawDiff || rawDiff === '(Nenhuma alteração de texto detectada)') {
    gitDiffBody.innerHTML = `<div style="padding: 20px; color: var(--text-dim); text-align: center;">Nenhuma alteração de texto detectada neste arquivo.</div>`;
    return;
  }

  const lines = rawDiff.split(/\r?\n/);
  const container = document.createElement('div');
  container.className = 'diff-lines-container';

  lines.forEach(line => {
    const lineEl = document.createElement('div');
    lineEl.className = 'diff-line';

    if (line.startsWith('+') && !line.startsWith('+++')) {
      lineEl.classList.add('added');
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      lineEl.classList.add('removed');
    } else if (line.startsWith('@@') || line.startsWith('diff --git')) {
      lineEl.classList.add('header');
    }

    lineEl.textContent = line;
    container.appendChild(lineEl);
  });

  gitDiffBody.appendChild(container);
}

function renderEmptyDiff() {
  gitActiveDiffFile = null;
  if (gitDiffFilePath) gitDiffFilePath.textContent = 'Nenhum arquivo selecionado';
  if (gitDiffHeaderActions) gitDiffHeaderActions.style.display = 'none';
  if (gitDiffBody) {
    gitDiffBody.innerHTML = `
      <div class="git-diff-placeholder">
        <span style="font-size: 32px; margin-bottom: 8px;">📑</span>
        <strong>Nenhum arquivo selecionado</strong>
        <p>Clique em um arquivo alterado na lista ao lado para inspecionar o diff antes de commitar ou enviar.</p>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// History Tab Logic (Commits & Unpushed Arrow)
// -------------------------------------------------------------
async function fetchGitHistory() {
  try {
    const res = await fetch('/api/git/history');
    const data = await res.json();
    if (data.success) {
      gitHistoryList = data.commits || [];
      const unpushedCount = data.unpushedCount || 0;

      // Atualiza badges e banners de unpushed commits
      if (badgeGitUnpushedCount) {
        if (unpushedCount > 0) {
          badgeGitUnpushedCount.textContent = `⬆️ ${unpushedCount}`;
          badgeGitUnpushedCount.style.display = 'inline-block';
        } else {
          badgeGitUnpushedCount.style.display = 'none';
        }
      }

      if (gitUnpushedBanner) {
        if (unpushedCount > 0) {
          gitUnpushedBanner.style.display = 'flex';
          if (gitUnpushedBannerMsg) {
            gitUnpushedBannerMsg.innerHTML = `<strong>${unpushedCount} commit(s)</strong> prontos para subir ao repositório remoto`;
          }
        } else {
          gitUnpushedBanner.style.display = 'none';
        }
      }

      if (btnGitDesktopPush) {
        btnGitDesktopPush.style.display = unpushedCount > 0 ? 'inline-flex' : 'none';
        btnGitDesktopPush.innerHTML = `⬆️ Subir ao Repo (${unpushedCount})`;
      }

      renderGitHistoryList();

      // Seleciona o primeiro commit
      if (gitActiveCommitHash && gitHistoryList.some(c => c.hash === gitActiveCommitHash)) {
        loadGitCommitDetails(gitActiveCommitHash);
      } else if (gitHistoryList.length > 0) {
        loadGitCommitDetails(gitHistoryList[0].hash);
      }
    }
  } catch (err) {
    console.error('Erro ao buscar histórico do Git:', err);
    showToast('Erro ao carregar histórico de commits', 'error');
  }
}

function renderGitHistoryList() {
  if (!gitHistoryCommitsList) return;
  gitHistoryCommitsList.innerHTML = '';

  const query = gitFilterHistoryQuery.toLowerCase();
  const filtered = gitHistoryList.filter(c => {
    if (!query) return true;
    return c.subject.toLowerCase().includes(query) ||
      c.author.toLowerCase().includes(query) ||
      c.shortHash.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    gitHistoryCommitsList.innerHTML = `
      <div class="git-empty-state-small">Nenhum commit encontrado no histórico.</div>
    `;
    return;
  }

  filtered.forEach(commit => {
    const isSelected = commit.hash === gitActiveCommitHash;
    const item = document.createElement('div');
    item.className = `git-commit-item ${isSelected ? 'selected' : ''}`;
    item.dataset.hash = commit.hash;

    // SE O COMMIT PRECISAR SUBIR AO REPO: SETINHA PRA CIMA NO LADO DIREITO
    const unpushedIndicatorHtml = commit.isUnpushed
      ? `<div class="git-commit-unpushed-indicator" title="Commit pendente de push: pronto para subir ao repositório!">⬆️</div>`
      : '';

    item.innerHTML = `
      <div class="git-commit-item-left">
        <div class="git-commit-subject" title="${escapeHtml(commit.subject)}">${escapeHtml(commit.subject)}</div>
        <div class="git-commit-sub-meta">
          <span class="git-commit-short-hash">${escapeHtml(commit.shortHash)}</span>
          <span>👤 ${escapeHtml(commit.author)}</span>
          <span>• ${escapeHtml(commit.relativeDate)}</span>
        </div>
      </div>
      ${unpushedIndicatorHtml}
    `;

    item.addEventListener('click', () => {
      loadGitCommitDetails(commit.hash);
    });

    gitHistoryCommitsList.appendChild(item);
  });
}

async function loadGitCommitDetails(hash) {
  gitActiveCommitHash = hash;

  document.querySelectorAll('.git-commit-item').forEach(item => {
    item.classList.toggle('selected', item.dataset.hash === hash);
  });

  const commit = gitHistoryList.find(c => c.hash === hash);
  if (commit) {
    if (gitCommitFullTitle) gitCommitFullTitle.textContent = commit.subject;
    if (gitCommitAuthorName) gitCommitAuthorName.textContent = commit.author;
    if (gitCommitAuthorEmail) gitCommitAuthorEmail.textContent = commit.email;
    if (gitCommitFullDate) gitCommitFullDate.textContent = `${commit.fullDate} (${commit.relativeDate})`;
    if (gitCommitHashCode) gitCommitHashCode.textContent = commit.hash;
    if (gitCommitMetaRow) gitCommitMetaRow.style.display = 'flex';

    if (gitCommitUnpushedTag) {
      gitCommitUnpushedTag.style.display = commit.isUnpushed ? 'inline-flex' : 'none';
    }
  }

  if (gitCommitDetailsBody) {
    gitCommitDetailsBody.innerHTML = '<div style="padding: 20px; color: var(--text-dim);">Carregando detalhes e diff do commit...</div>';
  }

  try {
    const res = await fetch(`/api/git/commit-details?hash=${encodeURIComponent(hash)}`);
    const data = await res.json();
    if (data.success && gitCommitDetailsBody) {
      gitCommitDetailsBody.innerHTML = '';

      if (data.stat) {
        const statBox = document.createElement('div');
        statBox.style.padding = '8px 12px';
        statBox.style.marginBottom = '12px';
        statBox.style.background = 'var(--bg-pill)';
        statBox.style.borderRadius = 'var(--radius-sm)';
        statBox.style.border = '1px solid var(--border-subtle)';
        statBox.style.whiteSpace = 'pre-wrap';
        statBox.style.fontSize = '11.5px';
        statBox.textContent = data.stat;
        gitCommitDetailsBody.appendChild(statBox);
      }

      if (data.diff) {
        const diffCont = document.createElement('div');
        diffCont.className = 'diff-lines-container';
        const lines = data.diff.split(/\r?\n/);
        lines.forEach(line => {
          const lEl = document.createElement('div');
          lEl.className = 'diff-line';
          if (line.startsWith('+') && !line.startsWith('+++')) lEl.classList.add('added');
          else if (line.startsWith('-') && !line.startsWith('---')) lEl.classList.add('removed');
          else if (line.startsWith('@@') || line.startsWith('diff --git')) lEl.classList.add('header');
          lEl.textContent = line;
          diffCont.appendChild(lEl);
        });
        gitCommitDetailsBody.appendChild(diffCont);
      }
    }
  } catch (err) {
    if (gitCommitDetailsBody) {
      gitCommitDetailsBody.innerHTML = '<div style="padding: 20px; color: var(--accent-rose);">Erro ao carregar detalhes do commit.</div>';
    }
  }
}

// -------------------------------------------------------------
// Git Desktop Action Listeners
// -------------------------------------------------------------
btnOpenGitDesktop?.addEventListener('click', () => openGitDesktopModal('changes'));
gitStatusPill?.addEventListener('click', () => openGitDesktopModal('changes'));
btnCloseGitDesktop?.addEventListener('click', closeGitDesktopModal);
document.getElementById('btn-git-back-to-kanban')?.addEventListener('click', closeGitDesktopModal);

modalGitDesktop?.addEventListener('click', (e) => {
  if (e.target === modalGitDesktop) closeGitDesktopModal();
});

btnGitDesktopRefresh?.addEventListener('click', () => {
  showToast('Atualizando status do Git...', 'info');
  refreshGitDesktop();
});

tabBtnGitChanges?.addEventListener('click', () => setGitDesktopTab('changes'));
tabBtnGitHistory?.addEventListener('click', () => setGitDesktopTab('history'));

// Filtro de alterações em tempo real
gitFilterChangesInput?.addEventListener('input', (e) => {
  gitFilterChangesQuery = e.target.value.trim();
  renderGitChangesList();
});

// Filtro de commits do histórico em tempo real
gitFilterHistoryInput?.addEventListener('input', (e) => {
  gitFilterHistoryQuery = e.target.value.trim();
  renderGitHistoryList();
});

// Checkbox global selecionar tudo
chkGitSelectAll?.addEventListener('change', () => {
  const isChecked = chkGitSelectAll.checked;
  if (isChecked) {
    gitChangesList.forEach(f => gitSelectedFilePaths.add(f.path));
  } else {
    gitSelectedFilePaths.clear();
  }
  document.querySelectorAll('.chk-git-file').forEach(chk => {
    chk.checked = isChecked;
  });
});

// Copiar caminho relativo do arquivo ativo
btnCopyDiffPath?.addEventListener('click', async () => {
  if (!gitActiveDiffFile) return;
  try {
    await navigator.clipboard.writeText(gitActiveDiffFile);
    showToast('Caminho copiado para a área de transferência!', 'success');
  } catch {
    showToast('Não foi possível copiar o caminho', 'warning');
  }
});

// Descartar alterações de arquivo individual
btnDiscardSingleFile?.addEventListener('click', async () => {
  if (!gitActiveDiffFile) return;
  const confirmed = await showConfirmModal({
    title: 'Descartar Alterações',
    icon: '↺',
    message: `Deseja realmente descartar todas as alterações locais em **${gitActiveDiffFile}**?`,
    warning: 'Esta ação não poderá ser desfeita. O arquivo retornará ao estado do último commit.',
    confirmText: 'Sim, Descartar',
    confirmBtnClass: 'btn-danger'
  });
  if (!confirmed) return;

  try {
    const res = await fetch('/api/git/discard-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: gitActiveDiffFile })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Arquivo restaurado!', 'success');
      appendLog(`Arquivo descartado: ${gitActiveDiffFile}`);
      await fetchGitChanges();
      fetchGitInfo();
    } else {
      showToast(data.error || 'Erro ao descartar alterações', 'error');
    }
  } catch {
    showToast('Erro de conexão ao descartar arquivo', 'error');
  }
});

// Descartar alterações de todos os arquivos selecionados
btnGitDiscardAll?.addEventListener('click', async () => {
  if (gitSelectedFilePaths.size === 0) {
    showToast('Selecione ao menos um arquivo para descartar', 'warning');
    return;
  }

  const count = gitSelectedFilePaths.size;
  const confirmed = await showConfirmModal({
    title: 'Descartar Arquivos Selecionados',
    icon: '↺',
    message: `Deseja realmente descartar as alterações de **${count} arquivo(s)** selecionado(s)?`,
    warning: 'As alterações locais não salvas nestes arquivos serão descartadas permanentemente.',
    confirmText: `Sim, Descartar ${count} Arquivo(s)`,
    confirmBtnClass: 'btn-danger'
  });
  if (!confirmed) return;

  for (const filePath of gitSelectedFilePaths) {
    try {
      await fetch('/api/git/discard-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: filePath })
      });
    } catch { }
  }

  showToast(`${count} arquivo(s) restaurado(s) com sucesso!`, 'success');
  appendLog(`Descartadas alterações de ${count} arquivo(s)`);
  await fetchGitChanges();
  fetchGitInfo();
});

// Commitar arquivos selecionados diretamente pela interface
btnGitCommitSubmit?.addEventListener('click', async () => {
  const summary = inputGitCommitMsg ? inputGitCommitMsg.value.trim() : '';
  const desc = textareaGitCommitDesc ? textareaGitCommitDesc.value.trim() : '';

  if (!summary) {
    showToast('Informe o resumo do commit (Summary)', 'warning');
    inputGitCommitMsg?.focus();
    return;
  }

  const selectedFiles = Array.from(gitSelectedFilePaths);
  if (selectedFiles.length === 0) {
    showToast('Selecione ao menos um arquivo para commitar', 'warning');
    return;
  }

  const confirmed = await showConfirmModal({
    title: 'Confirmar Git Commit',
    icon: '💾',
    message: `Deseja realmente criar um commit com **${selectedFiles.length} arquivo(s)** selecionado(s)?`,
    warning: `Mensagem: "${summary}"`,
    confirmText: 'Sim, Realizar Commit',
    confirmBtnClass: 'btn-success'
  });
  if (!confirmed) return;

  const fullMsg = desc ? `${summary}\n\n${desc}` : summary;

  if (btnGitCommitSubmit) {
    btnGitCommitSubmit.disabled = true;
    btnGitCommitSubmit.innerHTML = '⏳ Commitando...';
  }

  try {
    const res = await fetch('/api/git/commit-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: selectedFiles, message: fullMsg })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Commit realizado com sucesso!', 'success');
      appendLog(`Git commit: "${summary}" (${selectedFiles.length} arquivos)`);
      if (inputGitCommitMsg) inputGitCommitMsg.value = '';
      if (textareaGitCommitDesc) textareaGitCommitDesc.value = '';
      await fetchGitChanges();
      fetchGitInfo();
    } else {
      showToast(data.error || 'Erro ao realizar commit', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão ao realizar commit', 'error');
  } finally {
    if (btnGitCommitSubmit) {
      btnGitCommitSubmit.disabled = false;
      const curBranch = gitDesktopBranchPill?.textContent?.replace('🌿', '').trim() || 'main';
      btnGitCommitSubmit.innerHTML = `💾 Commit to ${curBranch}`;
    }
  }
});

// Ação de Push integrada na Central Git
btnGitDesktopPush?.addEventListener('click', async () => {
  closeGitDesktopModal();
  handleGitSyncAction();
});

btnUnpushedBannerPush?.addEventListener('click', async () => {
  closeGitDesktopModal();
  handleGitSyncAction();
});

// Escape fecha o modal Git Desktop
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalGitDesktop && modalGitDesktop.classList.contains('open')) {
    closeGitDesktopModal();
  }
});

// Initialize on Load
function initApp() {
  initTheme();
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
  fetchDirectories();
  fetchFeatures();
  loadConfig();
  updateCommandPreview();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}




