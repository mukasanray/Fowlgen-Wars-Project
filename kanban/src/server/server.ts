import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

function findRepoRoot(startDir: string): string {
  if (process.env.REPO_ROOT && fs.existsSync(process.env.REPO_ROOT)) {
    return path.resolve(process.env.REPO_ROOT);
  }
  let current = startDir;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(current, 'openspec')) || fs.existsSync(path.join(current, '.git'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.resolve(startDir, '../../../');
}

const REPO_ROOT = findRepoRoot(__dirname);
const KANBAN_ROOT = process.env.KANBAN_ROOT
  ? path.resolve(process.env.KANBAN_ROOT)
  : (fs.existsSync(path.join(REPO_ROOT, 'kanban'))
    ? path.join(REPO_ROOT, 'kanban')
    : path.resolve(__dirname, '../../'));

const OPEN_SPEC_DIR = process.env.OPEN_SPEC_DIR
  ? path.resolve(process.env.OPEN_SPEC_DIR)
  : path.join(REPO_ROOT, 'openspec/changes');

const WEB_DIR = fs.existsSync(path.join(KANBAN_ROOT, 'src/web'))
  ? path.join(KANBAN_ROOT, 'src/web')
  : (fs.existsSync(path.resolve(__dirname, '../web'))
    ? path.resolve(__dirname, '../web')
    : path.resolve(__dirname, 'web'));

const ENV_PATH = path.join(KANBAN_ROOT, '.env');
const CONFIG_PATH = path.join(KANBAN_ROOT, 'src/config/kanban-config.json');
const MEMBERS_PATH = path.join(KANBAN_ROOT, 'src/config/members.json');

export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  github?: string;
  email?: string;
  status?: 'active' | 'inactive';
  active?: boolean;
  deactivatedAt?: string;
  transferredTo?: string;
}

function getMembers(): Member[] {
  if (fs.existsSync(MEMBERS_PATH)) {
    try {
      const parsed: Member[] = JSON.parse(fs.readFileSync(MEMBERS_PATH, 'utf8'));
      return parsed.map(m => ({
        ...m,
        status: m.status || (m.active === false ? 'inactive' : 'active'),
        active: m.active !== undefined ? m.active : (m.status !== 'inactive')
      }));
    } catch { }
  }
  return [
    { id: 'marcos', name: 'Marcos', role: 'Unity / C# Developer', github: 'mukasanray', avatar: '👤', color: '#38bdf8', status: 'active', active: true },
    { id: 'samuel', name: 'Samuel', role: 'Game Designer & Lead', github: 'samuelmenon', avatar: '👑', color: '#f59e0b', status: 'active', active: true },
    { id: 'todos', name: 'Todos', role: 'Toda a Equipe', github: 'todos', avatar: '👥', color: '#10b981', status: 'active', active: true },
    { id: 'ia', name: 'Agente IA', role: 'Automação & Copilot', github: 'antigravity-ai', avatar: '🤖', color: '#a855f7', status: 'active', active: true }
  ];
}

function saveMembers(members: Member[]) {
  fs.writeFileSync(MEMBERS_PATH, JSON.stringify(members, null, 2), 'utf8');
}

const DIRECTORIES_PATH = path.join(KANBAN_ROOT, 'src/config/directories.json');

export interface ProjectDirectory {
  id: string;
  name: string;
  path: string;
  icon: string;
  patterns?: string[];
}

function getDirectories(): ProjectDirectory[] {
  if (fs.existsSync(DIRECTORIES_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(DIRECTORIES_PATH, 'utf8'));
    } catch { }
  }
  return [
    { id: 'app', name: 'Site: app', path: 'app', icon: '🌐', patterns: ['app', 'site', 'web', 'portal', 'frontend'] },
    { id: 'unity', name: 'Game: Unity', path: 'unity', icon: '🎮', patterns: ['unity', 'game', 'arena', 'combate', 'audio', 'mixamo', 'fishnet', 'apk'] },
    { id: 'prompt', name: 'Skills: prompt', path: 'prompt', icon: '✨', patterns: ['prompt', 'skill', 'ia', 'agente', 'falas', 'claude'] },
    { id: 'kanban', name: 'Kanban: kanban', path: 'kanban', icon: '📋', patterns: ['kanban', 'studio'] },
    { id: 'program', name: 'Solana: program', path: 'program', icon: '🦀', patterns: ['program', 'solana', 'anchor', 'smart-contract'] },
    { id: 'devsecops', name: 'DevSecOps: devsecops', path: 'devsecops', icon: '🛡️', patterns: ['devsecops', 'pipeline', 'ci-cd', 'gitleaks', 'k8s'] },
    { id: 'docs', name: 'Docs: docs', path: 'docs', icon: '📄', patterns: ['docs', 'pitch', 'hackathon'] }
  ];
}

function saveDirectories(dirs: ProjectDirectory[]) {
  const dir = path.dirname(DIRECTORIES_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DIRECTORIES_PATH, JSON.stringify(dirs, null, 2), 'utf8');
}

function detectDirectory(featureName: string, title: string, summary: string, proposal: string): string {
  // 1. Prioridade máxima: Campo explícito no proposal.md (## Directory: app ou ## Projeto: unity ou [DIRETORIO: app])
  const explicitMatch = proposal.match(/##\s*(?:Directory|Diretório|Projeto)\s*\n+([^\n#]+)/i) ||
                        proposal.match(/(?:^|\n)\s*(?:Directory|Diretório|Projeto):\s*([^\n#\r]+)/i);
  if (explicitMatch) {
    const rawDir = explicitMatch[1].trim().toLowerCase();
    const dirs = getDirectories();
    const found = dirs.find(d => d.id.toLowerCase() === rawDir || d.name.toLowerCase() === rawDir || d.path.toLowerCase() === rawDir);
    if (found) return found.id;
    if (rawDir) return rawDir;
  }

  const text = `${featureName} ${title} ${summary} ${proposal}`.toLowerCase();
  const dirs = getDirectories();
  for (const dir of dirs) {
    if (featureName.toLowerCase() === dir.id.toLowerCase() || featureName.toLowerCase().startsWith(dir.id.toLowerCase() + '-')) {
      return dir.id;
    }
    if (dir.patterns && dir.patterns.some(p => text.includes(p.toLowerCase()))) {
      return dir.id;
    }
  }
  if (/portal-web|web3-hub|site|frontend|html|react|\bapp\b/i.test(text)) return 'app';
  if (/unity|arena|combate|audio|mixamo|game|fishnet|apk|android|minion|hud|gameplay/i.test(text)) return 'unity';
  if (/prompt|skill|ia|agente|falas|montarias|claude|ideia/i.test(text)) return 'prompt';
  if (/kanban/i.test(text)) return 'kanban';
  if (/solana|anchor|smart-contract|program|token|onchain/i.test(text)) return 'program';
  if (/devsecops|pipeline|ci-cd|gitleaks|k8s|docker/i.test(text)) return 'devsecops';
  if (/docs|pitch|hackathon|showcase/i.test(text)) return 'docs';
  return 'geral';
}

function setFeatureDirectory(featureId: string, directory: string): boolean {
  const clean = (featureId || '').trim().toLowerCase().replace(/\s+/g, '-');
  const proposalPath = path.join(OPEN_SPEC_DIR, clean, 'proposal.md');
  if (!fs.existsSync(proposalPath)) return false;

  let content = fs.readFileSync(proposalPath, 'utf8');
  const dirHeaderRegex = /##\s*(?:Directory|Diretório|Projeto)\s*\n+([^\n#]+)/i;
  const inlineDirRegex = /(?:^|\n)\s*(?:Directory|Diretório|Projeto):\s*([^\n#\r]+)/i;

  if (dirHeaderRegex.test(content)) {
    content = content.replace(dirHeaderRegex, `## Directory\n${directory.trim()}\n`);
  } else if (inlineDirRegex.test(content)) {
    content = content.replace(inlineDirRegex, `\nDirectory: ${directory.trim()}`);
  } else {
    if (content.includes('## Title')) {
      content = content.replace(/##\s*Title\s*\n+[^\n#]+/i, (match) => `${match}\n\n## Directory\n${directory.trim()}`);
    } else {
      content += `\n\n## Directory\n${directory.trim()}\n`;
    }
  }

  fs.writeFileSync(proposalPath, content, 'utf8');
  return true;
}

function detectTaskDirectory(taskText: string, defaultDir: string): string {
  const text = taskText.toLowerCase();
  const dirs = getDirectories();
  for (const d of dirs) {
    const id = d.id.toLowerCase();
    const p = (d.path || d.id).toLowerCase();
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedP = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\((${escapedId}|${escapedP})\\/|\\[(${escapedId}|${escapedP})\\]|\\b(${escapedId}|${escapedP}):`, 'i');
    if (re.test(text)) return d.id;
  }
  if (/\(app\/|\bapp\/|site:|\[app\]/i.test(text)) return 'app';
  if (/\(unity\/|\bunity\/|game:|\[unity\]|arena_clean/i.test(text)) return 'unity';
  if (/\(prompt\/|\bprompt\/|skills?:|\[prompt\]/i.test(text)) return 'prompt';
  if (/\(kanban\/|\bkanban\/|\[kanban\]/i.test(text)) return 'kanban';
  if (/\(program\/|\bprogram\/|solana:|\[program\]/i.test(text)) return 'program';
  if (/\(devsecops\/|\bdevsecops\/|\[devsecops\]/i.test(text)) return 'devsecops';
  if (/\(docs\/|\bdocs\/|\[docs\]/i.test(text)) return 'docs';
  return defaultDir || 'geral';
}

export function formatAssigneeTag(assigneeStr?: string): string {
  if (!assigneeStr || !assigneeStr.trim() || assigneeStr === 'Todos') return '';
  const parts = assigneeStr
    .split(/[,/]+/)
    .map(p => p.trim().replace(/^@/, ''))
    .filter(p => p.length > 0 && p !== 'Todos');
  if (parts.length === 0) return '';
  return ` (@${parts.join(', @')})`;
}

export function normalizeSingleAssignee(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const clean = trimmed.replace(/^@/, '').trim().toLowerCase();
  if (clean === 'jorge' || clean === 'jorge-espindola' || clean === 'jorge espindola' || clean === 'jpespindola') {
    return 'Jorge Espindola';
  }
  if (clean === 'manuel' || clean === 'emanuel') {
    return 'Emanuel';
  }
  if (clean === 'marcos' || clean === 'marcospascoski') {
    return 'Marcos';
  }
  if (clean === 'samuel' || clean === 'mukasanray') {
    return 'Samuel';
  }
  if (clean === 'junior' || clean === 'nobregaxaviieer') {
    return 'Junior';
  }
  if (clean === 'maria-clara' || clean === 'maria clara' || clean === 'maria') {
    return 'Maria Clara';
  }
  if (clean === 'ramiro') {
    return 'Ramiro';
  }
  if (clean === 'sthefany') {
    return 'Sthefany';
  }
  if (clean === 'vaguinhow') {
    return 'Vaguinhow';
  }
  if (clean === 'vyctor' || clean === 'vyctor rodrigues' || clean === 'vyctor-rodrigues' || clean === 'vyctorrodrigues' || clean === 'victor' || clean === 'victor rodrigues') {
    return 'Vyctor Rodrigues';
  }
  if (clean === 'dev-team') {
    return 'Todos';
  }
  return trimmed.replace(/^@/, '').trim();
}

export function normalizeAssignee(raw?: string): string {
  if (!raw) return '';
  if (raw.includes(',') || raw.includes('/')) {
    const parts = raw.split(/[,/]+/)
      .map(p => normalizeSingleAssignee(p))
      .filter(p => p.length > 0 && p !== 'Todos');
    if (parts.length > 0) {
      return parts.join(', ');
    }
  }
  return normalizeSingleAssignee(raw);
}

export function isAssigneeActive(name: string, membersList?: Member[]): boolean {
  if (!name) return false;
  if (name.includes(',') || name.includes('/')) {
    const parts = name.split(/[,/]+/).map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts.some(p => isAssigneeActive(p, membersList));
    }
  }
  const clean = name.trim().toLowerCase();
  if (clean === 'todos' || clean === 'dev-team') return true;
  const list = membersList || getMembers();
  const normalized = normalizeSingleAssignee(name).toLowerCase();
  const found = list.find(m =>
    m.name.toLowerCase() === normalized ||
    m.id.toLowerCase() === normalized ||
    m.name.toLowerCase() === clean ||
    m.id.toLowerCase() === clean
  );
  if (!found) return true;
  return found.active !== false && found.status !== 'inactive';
}

function reassignMemberTasks(oldMember: Member, newMember: Member, scope: 'all' | 'pending' = 'all'): { modifiedFiles: string[], count: number } {
  let count = 0;
  const modifiedFiles: string[] = [];

  if (!fs.existsSync(OPEN_SPEC_DIR)) {
    return { modifiedFiles, count };
  }

  const oldTokens = new Set<string>([
    oldMember.name.toLowerCase(),
    oldMember.id.toLowerCase()
  ]);
  if (oldMember.github) oldTokens.add(oldMember.github.toLowerCase());
  const slugName = oldMember.name.toLowerCase().replace(/\s+/g, '-');
  oldTokens.add(slugName);
  const firstWord = oldMember.name.toLowerCase().split(' ')[0];
  if (firstWord.length > 3 && firstWord !== 'todos') {
    oldTokens.add(firstWord);
  }

  const entries = fs.readdirSync(OPEN_SPEC_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const tasksPath = path.join(OPEN_SPEC_DIR, entry.name, 'tasks.md');
    if (!fs.existsSync(tasksPath)) continue;

    const content = fs.readFileSync(tasksPath, 'utf8');
    const lines = content.split('\n');
    let fileModified = false;

    const newLines = lines.map(line => {
      const taskMatch = line.match(/^(\s*[-*]?\s*\[([ xX])\]\s*(?:\*\*.+?\*\*|\d+\.?\d*)?\s*)(.*)/);
      if (!taskMatch) return line;

      const isDone = taskMatch[2].toLowerCase() === 'x';
      if (scope === 'pending' && isDone) {
        return line;
      }

      const rest = taskMatch[3];
      const assigneeMatch = rest.match(/\((@[^)]+)\)/i) || rest.match(/\[(@[^\]]+)\]/i) || rest.match(/\((@?[^)]+)\)\s*$/i) || rest.match(/\[(@?[^\]]+)\]\s*$/i) || rest.match(/@([\w-]+)/i);
      if (!assigneeMatch) return line;

      const matchedRaw = assigneeMatch[1] || assigneeMatch[0];
      const cleanMatched = matchedRaw.replace(/^[@()\[\]]+|[@()\[\]]+$/g, '').trim().toLowerCase();

      let isMatch = false;
      for (const token of oldTokens) {
        if (cleanMatched === token || normalizeAssignee(cleanMatched).toLowerCase() === oldMember.name.toLowerCase()) {
          isMatch = true;
          break;
        }
      }

      if (isMatch) {
        count++;
        fileModified = true;
        const successorTag = `(@${newMember.name})`;
        return line.replace(assigneeMatch[0], successorTag);
      }

      return line;
    });

    if (fileModified) {
      fs.writeFileSync(tasksPath, newLines.join('\n'), 'utf8');
      modifiedFiles.push(`openspec/changes/${entry.name}/tasks.md`);
    }

    // Also check proposal.md if creator or assignee was oldMember
    const proposalPath = path.join(OPEN_SPEC_DIR, entry.name, 'proposal.md');
    if (fs.existsSync(proposalPath)) {
      const pContent = fs.readFileSync(proposalPath, 'utf8');
      const teamRegex = /(\[(?:APROVADO|CRIADO|VALIDADO|REJEITADO)\]\s+por\s+)([^,\n\r]+?)(?=(\s+em\s+|\s*$|\n))/gi;
      let pModified = false;
      const newPContent = pContent.replace(teamRegex, (match, prefix, author) => {
        const cleanAuthor = author.trim().replace(/^@/, '').toLowerCase();
        if (oldTokens.has(cleanAuthor) || normalizeAssignee(cleanAuthor).toLowerCase() === oldMember.name.toLowerCase()) {
          pModified = true;
          return `${prefix}${newMember.name}`;
        }
        return match;
      });

      if (pModified) {
        fs.writeFileSync(proposalPath, newPContent, 'utf8');
        modifiedFiles.push(`openspec/changes/${entry.name}/proposal.md`);
      }
    }
  }

  return { modifiedFiles, count };
}

function createOpenSpecTask(
  featureId: string,
  taskNumber: string | undefined,
  isCompleted: boolean,
  status?: string,
  assignee?: string,
  text?: string,
  directory?: string
): { success: boolean; taskId: string; error?: string } {
  const cleanFeature = (featureId && featureId.trim()) ? featureId.trim().toLowerCase().replace(/\s+/g, '-') : 'tarefas-gerais';
  const targetFeature = cleanFeature || 'tarefas-gerais';
  const featureDir = path.join(OPEN_SPEC_DIR, targetFeature);

  if (!fs.existsSync(featureDir)) {
    fs.mkdirSync(featureDir, { recursive: true });
    const title = targetFeature === 'tarefas-gerais' ? 'Tarefas Gerais & Avulsas' : targetFeature.replace(/-/g, ' ');
    const proposalContent = `# Feature: ${targetFeature}\n\n## Title\n${title}\n\n## Summary\nTarefas gerais, avulsas e manutenções da equipe.\n\n## Status\n[APROVADO]\n`;
    fs.writeFileSync(path.join(featureDir, 'proposal.md'), proposalContent, 'utf8');
    fs.writeFileSync(path.join(featureDir, 'tasks.md'), `# Tasks for ${targetFeature}\n\n## 1. Backlog Geral\n`, 'utf8');
  }

  const tasksPath = path.join(featureDir, 'tasks.md');
  if (!fs.existsSync(tasksPath)) {
    fs.writeFileSync(tasksPath, `# Tasks for ${targetFeature}\n\n## 1. Backlog Geral\n`, 'utf8');
  }

  const content = fs.readFileSync(tasksPath, 'utf8');
  const lines = content.split('\n');
  const cleanTaskNum = taskNumber ? taskNumber.trim().replace(/^\*+|\*+$/g, '').trim() : '';

  // 1. Prevenir colisão/sobrescrita acidental se taskId foi fornecido
  if (cleanTaskNum) {
    const escapedNum = cleanTaskNum.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const idRegex = new RegExp(`^\\s*[-*]?\\s*(\\[[ xX]\\])?\\s*\\*\\*\\s*${escapedNum}(?!\\d)[^*]*\\*\\*`, 'i');
    for (const l of lines) {
      if (l.includes(`**${cleanTaskNum}**`) || idRegex.test(l)) {
        return {
          success: false,
          taskId: cleanTaskNum,
          error: `Já existe uma tarefa com o ID "${cleanTaskNum}" na feature "${targetFeature}". Escolha outro ID ou utilize "Salvar Alterações".`
        };
      }
    }
  }

  // 2. Determinar effectiveNumber caso não tenha sido fornecido
  let effectiveNumber = cleanTaskNum;
  if (!effectiveNumber) {
    const taskNumRegex = /^\s*[-*]?\s*\[[ xX]\]\s*\*\*(\d+)\.(\d+)\*\*/;
    let maxSection1Sub = 0;
    for (const l of lines) {
      const m = l.match(taskNumRegex);
      if (m && parseInt(m[1]) === 1) {
        const sub = parseInt(m[2]);
        if (sub > maxSection1Sub) maxSection1Sub = sub;
      }
    }
    effectiveNumber = `1.${maxSection1Sub + 1}`;
  }

  const finalAssigneeTag = formatAssigneeTag(assignee);

  const rawLines = (text || '').split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim().length > 0);
  const firstLine = (rawLines[0] || '').trim();
  let cleanFirstLine = firstLine.replace(/\s*(\((@[^)]+)\)|\[(@[^\]]+)\]|\((@?[^)]+)\)\s*$|\[(@?[^\]]+)\]\s*)/gi, '').trimEnd();

  const cleanDir = (directory && directory.trim() && directory.trim().toLowerCase() !== 'auto' && directory.trim().toLowerCase() !== 'geral')
    ? directory.trim().toLowerCase()
    : '';

  if (cleanDir) {
    cleanFirstLine = cleanFirstLine.replace(/^\s*\([^)]+\/\)\s*/i, '').replace(/^\s*\[[^\]]+\]\s*/i, '').trim();
    cleanFirstLine = `(${cleanDir}/) ${cleanFirstLine}`;
  }

  const mark = isCompleted ? '[x]' : '[ ]';
  const newLinesToInsert: string[] = [
    `- ${mark} **${effectiveNumber}** ${cleanFirstLine}${finalAssigneeTag}`
  ];
  for (let i = 1; i < rawLines.length; i++) {
    newLinesToInsert.push(`    > ${rawLines[i].trim()}`);
  }

  // 3. Inserção ordenada na seção correta
  const secParts = effectiveNumber.split('.');
  const secNum = parseInt(secParts[0]);

  let insertIndex = -1;
  if (!isNaN(secNum)) {
    const nextSecRegex = new RegExp(`^##\\s*(${secNum + 1})\\b`);
    for (let i = 0; i < lines.length; i++) {
      if (nextSecRegex.test(lines[i])) {
        insertIndex = (i > 0 && lines[i - 1].trim() === '') ? i - 1 : i;
        break;
      }
    }
  }

  if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, ...newLinesToInsert);
  } else {
    if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
      lines.push('');
    }
    lines.push(...newLinesToInsert);
  }

  fs.writeFileSync(tasksPath, lines.join('\n'), 'utf8');
  return { success: true, taskId: effectiveNumber };
}

function updateOpenSpecTask(
  featureId: string,
  taskNumber: string,
  isCompleted: boolean,
  status?: string,
  assignee?: string,
  text?: string,
  newTaskId?: string,
  directory?: string
): boolean {
  const cleanFeature = (featureId && featureId.trim()) ? featureId.trim().toLowerCase().replace(/\s+/g, '-') : 'tarefas-gerais';
  const targetFeature = cleanFeature || 'tarefas-gerais';
  const featureDir = path.join(OPEN_SPEC_DIR, targetFeature);

  if (!fs.existsSync(featureDir)) {
    fs.mkdirSync(featureDir, { recursive: true });
    const title = targetFeature === 'tarefas-gerais' ? 'Tarefas Gerais & Avulsas' : targetFeature.replace(/-/g, ' ');
    const proposalContent = `# Feature: ${targetFeature}\n\n## Title\n${title}\n\n## Summary\nTarefas gerais, avulsas e manutenções da equipe.\n\n## Status\n[APROVADO]\n`;
    fs.writeFileSync(path.join(featureDir, 'proposal.md'), proposalContent, 'utf8');
    fs.writeFileSync(path.join(featureDir, 'tasks.md'), `# Tasks for ${targetFeature}\n\n## 1. Backlog Geral\n`, 'utf8');
  }

  const tasksPath = path.join(featureDir, 'tasks.md');
  if (!fs.existsSync(tasksPath)) return false;

  const content = fs.readFileSync(tasksPath, 'utf8');
  const lines = content.split('\n');
  const cleanTaskNum = taskNumber ? taskNumber.trim().replace(/^\*+|\*+$/g, '').trim() : '';

  const escapedNum = cleanTaskNum.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const idRegex = cleanTaskNum ? new RegExp(`^\\s*[-*]?\\s*(\\[[ xX]\\])?\\s*\\*\\*\\s*${escapedNum}(?!\\d)[^*]*\\*\\*`, 'i') : null;

  let foundIndex = -1;
  let matchedTaskId = cleanTaskNum;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (cleanTaskNum && (l.includes(`**${cleanTaskNum}**`) || (idRegex && idRegex.test(l)))) {
      foundIndex = i;
      const m = l.match(/\*\*(.+?)\*\*/);
      if (m) matchedTaskId = m[1].trim();
      break;
    }
  }

  const mark = isCompleted ? '[x]' : '[ ]';
  const cleanAssignee = (assignee !== undefined && assignee !== null) ? assignee.trim().replace(/^@/, '') : undefined;
  const newTag = cleanAssignee && cleanAssignee !== 'Todos' ? formatAssigneeTag(cleanAssignee).trim() : '';

  const cleanDir = (directory !== undefined && directory !== null)
    ? ((directory.trim() && directory.trim().toLowerCase() !== 'auto' && directory.trim().toLowerCase() !== 'geral') ? directory.trim().toLowerCase() : (directory === 'auto' || directory === 'geral' ? 'auto' : ''))
    : null;

  if (foundIndex !== -1) {
    // Tarefa existente encontrada!
    const effectiveId = (newTaskId && newTaskId.trim()) ? newTaskId.trim() : matchedTaskId;

    if (text !== undefined && text !== null && text.trim().length > 0) {
      // Usuário está alterando texto/prompt
      const rawLines = text.split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim().length > 0);
      const firstLine = rawLines[0].trim();
      let cleanFirstLine = firstLine.replace(/\s*(\((@[^)]+)\)|\[(@[^\]]+)\]|\((@?[^)]+)\)\s*$|\[(@?[^\]]+)\]\s*)/gi, '').trimEnd();

      if (cleanDir !== null) {
        if (cleanDir && cleanDir !== 'auto') {
          cleanFirstLine = cleanFirstLine.replace(/^\s*\([^)]+\/\)\s*/i, '').replace(/^\s*\[[^\]]+\]\s*/i, '').trim();
          cleanFirstLine = `(${cleanDir}/) ${cleanFirstLine}`;
        } else if (cleanDir === 'auto') {
          cleanFirstLine = cleanFirstLine.replace(/^\s*\([^)]+\/\)\s*/i, '').replace(/^\s*\[[^\]]+\]\s*/i, '').trim();
        }
      }

      const updatedFirstLine = `- ${mark} **${effectiveId}** ${cleanFirstLine}${newTag ? ' ' + newTag : ''}`;

      const replacementLines = [updatedFirstLine];
      for (let k = 1; k < rawLines.length; k++) {
        replacementLines.push(`    > ${rawLines[k].trim()}`);
      }

      // Substitui as linhas antigas de continuação de prompt
      let continuationCount = 0;
      for (let j = foundIndex + 1; j < lines.length; j++) {
        const nextLine = lines[j];
        if (nextLine.trim() && !nextLine.match(/^\s*[-*]?\s*\[[ xX]\]/) && !nextLine.startsWith('#')) {
          continuationCount++;
        } else {
          break;
        }
      }

      lines.splice(foundIndex, 1 + continuationCount, ...replacementLines);
    } else {
      // Apenas status, assignee, novo ID ou diretório
      let targetLine = lines[foundIndex];
      targetLine = targetLine.replace(/\[[ xX]\]/, mark);

      if (newTaskId && newTaskId.trim() && newTaskId.trim() !== matchedTaskId) {
        targetLine = targetLine.replace(`**${matchedTaskId}**`, `**${newTaskId.trim()}**`);
      }

      if (cleanAssignee !== undefined) {
        const withoutAssignees = targetLine.replace(/\s*(\((@[^)]+)\)|\[(@[^\]]+)\]|\((@?[^)]+)\)\s*$|\[(@?[^\]]+)\]\s*)/gi, '').trimEnd();
        targetLine = newTag ? `${withoutAssignees} ${newTag}` : withoutAssignees;
      }

      if (cleanDir !== null) {
        const escapedId = effectiveId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (cleanDir && cleanDir !== 'auto') {
          targetLine = targetLine.replace(new RegExp(`(\\*\\*${escapedId}\\*\\*\\s*)(?:\\([^)]+\\/\\)\\s*)?`, 'i'), `$1(${cleanDir}/) `);
        } else if (cleanDir === 'auto') {
          targetLine = targetLine.replace(new RegExp(`(\\*\\*${escapedId}\\*\\*\\s*)(?:\\([^)]+\\/\\)\\s*)`, 'i'), '$1');
        }
      }

      lines[foundIndex] = targetLine;
    }

    fs.writeFileSync(tasksPath, lines.join('\n'), 'utf8');
    return true;
  } else if (text) {
    // Nova tarefa
    let effectiveNumber = (newTaskId && newTaskId.trim()) ? newTaskId.trim() : (taskNumber ? taskNumber.trim() : '');
    if (!effectiveNumber) {
      const existingCount = lines.filter(l => l.match(/^\s*[-*]?\s*\[[ xX]\]/)).length;
      effectiveNumber = `1.${existingCount + 1}`;
    }
    const finalAssigneeTag = formatAssigneeTag(cleanAssignee);
    const rawLines = text.split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim().length > 0);
    let firstLine = (rawLines[0] || '').trim();
    if (cleanDir !== null && cleanDir && cleanDir !== 'auto') {
      firstLine = `(${cleanDir}/) ${firstLine.replace(/^\s*\([^)]+\/\)\s*/i, '')}`;
    }
    if (rawLines.length <= 1) {
      lines.push(`- [${isCompleted ? 'x' : ' '}] **${effectiveNumber}** ${firstLine}${finalAssigneeTag}`);
    } else {
      lines.push(`- [${isCompleted ? 'x' : ' '}] **${effectiveNumber}** ${firstLine}${finalAssigneeTag}`);
      for (let i = 1; i < rawLines.length; i++) {
        lines.push(`    > ${rawLines[i].trim()}`);
      }
    }
    fs.writeFileSync(tasksPath, lines.join('\n'), 'utf8');
    return true;
  }
  return false;
}

function deleteOpenSpecTask(featureId: string, taskNumber: string): boolean {
  const cleanFeature = (featureId && featureId.trim()) ? featureId.trim().toLowerCase().replace(/\s+/g, '-') : 'tarefas-gerais';
  const tasksPath = path.join(OPEN_SPEC_DIR, cleanFeature, 'tasks.md');
  if (!fs.existsSync(tasksPath)) return false;

  const content = fs.readFileSync(tasksPath, 'utf8');
  const lines = content.split('\n');
  const cleanTaskNum = taskNumber ? taskNumber.trim().replace(/^\*+|\*+$/g, '').trim() : '';
  const escapedNum = cleanTaskNum.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const idRegex = cleanTaskNum ? new RegExp(`^\\s*[-*]?\\s*(\\[[ xX]\\])?\\s*\\*\\*\\s*${escapedNum}(?!\\d)[^*]*\\*\\*`, 'i') : null;

  let foundIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (cleanTaskNum && (l.includes(`**${cleanTaskNum}**`) || (idRegex && idRegex.test(l)))) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex === -1) return false;

  let continuationCount = 0;
  for (let j = foundIndex + 1; j < lines.length; j++) {
    const nextLine = lines[j];
    if (nextLine.trim() && !nextLine.match(/^\s*[-*]?\s*\[[ xX]\]/) && !nextLine.startsWith('#')) {
      continuationCount++;
    } else {
      break;
    }
  }

  lines.splice(foundIndex, 1 + continuationCount);
  fs.writeFileSync(tasksPath, lines.join('\n'), 'utf8');
  return true;
}

function loadEnvFile() {
  if (fs.existsSync(ENV_PATH)) {
    const content = fs.readFileSync(ENV_PATH, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        const val = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = val;
      }
    }
  }
}
loadEnvFile();

function parseJSONBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

let lastGitFetchTime = 0;
function tryFetchRemote(force = false) {
  const now = Date.now();
  if (force || now - lastGitFetchTime > 30000) {
    try {
      execSync('git fetch --quiet', { encoding: 'utf8', cwd: REPO_ROOT, timeout: 6000 });
      lastGitFetchTime = now;
    } catch { }
  }
}

function getGitInfo(forceFetch = false) {
  try {
    tryFetchRemote(forceFetch);

    let currentBranch = 'main';
    try {
      currentBranch = execSync('git branch --show-current', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
    } catch { }

    let branches: string[] = [];
    try {
      const branchOut = execSync('git branch -a', { encoding: 'utf8', cwd: REPO_ROOT });
      branches = Array.from(new Set(
        branchOut
          .split('\n')
          .map(b => b.replace(/^\*?\s+/, '').replace(/^remotes\//, '').trim())
          .filter(b => b && !b.includes('->'))
      ));
    } catch { }

    let modifiedFiles: string[] = [];
    try {
      const statusOut = execSync('git status -s openspec/changes/', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
      if (statusOut) {
        modifiedFiles = statusOut.split('\n').map(l => l.trim());
      }
    } catch { }

    let unpushedCommits = 0;
    try {
      const revOut = execSync('git rev-list @{u}..HEAD --count', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
      unpushedCommits = parseInt(revOut, 10) || 0;
    } catch { }

    let behindCommits = 0;
    try {
      const behindOut = execSync('git rev-list HEAD..@{u} --count', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
      behindCommits = parseInt(behindOut, 10) || 0;
    } catch { }

    let lastCommit = '';
    try {
      lastCommit = execSync('git log -1 --format="%h - %s (%cr)"', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
    } catch { }

    let gitUser = { name: '', email: '' };
    try {
      gitUser.name = execSync('git config user.name', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
    } catch { }
    try {
      gitUser.email = execSync('git config user.email', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
    } catch { }

    const members = getMembers().filter(m => m.active !== false && m.status !== 'inactive');
    let detectedMember: any = null;

    // 1. Prioridade 1: Arquivo local de identidade (.gitignore - 100% privado, só nesta máquina)
    const localIdentityPath = path.join(KANBAN_ROOT, 'src/config/identity.local.json');
    if (fs.existsSync(localIdentityPath)) {
      try {
        const localData = JSON.parse(fs.readFileSync(localIdentityPath, 'utf8'));
        if (localData && localData.memberId) {
          detectedMember = members.find(m => m.id === localData.memberId) || null;
        }
      } catch { }
    }

    // 2. Prioridade 2: GitHub Username (público e sem expor e-mails pessoais)
    if (!detectedMember && gitUser.name) {
      detectedMember = members.find(m => m.github && (
        m.github.toLowerCase() === gitUser.name.toLowerCase() ||
        (gitUser.email && gitUser.email.toLowerCase().includes(m.github.toLowerCase()))
      )) || null;
    }

    // 3. Prioridade 3: Nome do Git (git config user.name)
    if (!detectedMember && gitUser.name) {
      detectedMember = members.find(m =>
        m.name.toLowerCase() === gitUser.name.toLowerCase() ||
        gitUser.name.toLowerCase().includes(m.name.toLowerCase()) ||
        m.name.toLowerCase().includes(gitUser.name.toLowerCase())
      ) || null;
    }

    // 4. Prioridade 4: Branch ativa do Git (ex: fowlgenwars-unity-marcos -> marcos)
    if (!detectedMember && currentBranch) {
      detectedMember = members.find(m =>
        currentBranch.toLowerCase().includes(m.id.toLowerCase()) ||
        currentBranch.toLowerCase().includes(m.name.toLowerCase())
      ) || null;
    }

    const isGitConfigured = Boolean(detectedMember || gitUser.name);

    return {
      currentBranch,
      branches,
      uncommittedChanges: modifiedFiles.length > 0,
      modifiedFiles,
      unpushedCommits,
      behindCommits,
      hasRemoteChanges: behindCommits > 0,
      lastCommit,
      gitUser,
      detectedMember,
      isGitConfigured
    };
  } catch (err: any) {
    return {
      currentBranch: 'main',
      branches: ['main'],
      uncommittedChanges: false,
      modifiedFiles: [],
      unpushedCommits: 0,
      behindCommits: 0,
      hasRemoteChanges: false,
      lastCommit: ''
    };
  }
}

function getFeaturesFromGitBranch(branch: string) {
  try {
    const treeOut = execSync(`git ls-tree ${branch} openspec/changes/`, { encoding: 'utf8', cwd: REPO_ROOT });
    if (!treeOut || !treeOut.trim()) {
      return [];
    }
    const lines = treeOut.trim().split('\n');
    const features: any[] = [];
    const membersList = getMembers();

    for (const line of lines) {
      const match = line.match(/\topenspec\/changes\/(.+)$/);
      if (match) {
        const featureName = match[1].trim();
        let proposal = '';
        let status = 'Backlog';
        let ideaStatus = 'Criado';
        let ideaAssignee = 'Todos';
        let title = featureName.replace(/-/g, ' ');
        let summary = '';
        const assigneesSet = new Set<string>();

        try {
          proposal = execSync(`git show ${branch}:openspec/changes/${featureName}/proposal.md`, { encoding: 'utf8', cwd: REPO_ROOT, stdio: ['pipe', 'pipe', 'ignore'] });
          const titleMatch = proposal.match(/##\s*Title\s*\n+([^\n#]+)/i);
          if (titleMatch) title = titleMatch[1].trim();

          const summaryMatch = proposal.match(/##\s*Summary\s*\n+([^\n#]+)/i);
          if (summaryMatch) summary = summaryMatch[1].trim();

          if (proposal.includes('[APROVADO]')) {
            status = 'Aprovado';
            ideaStatus = 'Aprovado';
          } else if (proposal.includes('[VALIDADO]')) {
            status = 'Validado';
            ideaStatus = 'Validado';
          } else if (proposal.includes('[REJEITADO]')) {
            status = 'Rejeitado';
            ideaStatus = 'Rejeitado';
          } else {
            ideaStatus = 'Criado';
          }

          const teamMatch = proposal.match(/\[(APROVADO|CRIADO|VALIDADO|REJEITADO)\]\s+por\s+([^,\n\r]+?)(?:\s+em\s+|\s*$)/i) || proposal.match(/\[(APROVADO|CRIADO|VALIDADO|REJEITADO)\]\s+por\s+([^\s\n]+)/i);
          if (teamMatch) {
            ideaAssignee = normalizeAssignee(teamMatch[2].trim());
            if (isAssigneeActive(ideaAssignee, membersList)) {
              assigneesSet.add(ideaAssignee);
            } else {
              ideaAssignee = 'Todos';
            }
          }
        } catch { }

        const detectedDir = detectDirectory(featureName, title, summary, proposal);
        let tasks: Array<{ id: string; text: string; done: boolean; assignee?: string; directory?: string; prompt?: string; raw: string; section: string }> = [];
        try {
          const tasksContent = execSync(`git show ${branch}:openspec/changes/${featureName}/tasks.md`, { encoding: 'utf8', cwd: REPO_ROOT, stdio: ['pipe', 'pipe', 'ignore'] });
          const tlines = tasksContent.split('\n');
          let currentSection = 'Geral';
          for (const tl of tlines) {
            const secMatch = tl.match(/^##\s*\d*\.?\s*(.+)/);
            if (secMatch) {
              currentSection = secMatch[1].trim();
              continue;
            }
            const taskMatch = tl.match(/^\s*[-*]?\s*\[([ xX])\]\s*(\*\*(.+?)\*\*)?\s*(.*)/);
            if (taskMatch) {
              const done = taskMatch[1].toLowerCase() === 'x';
              const taskId = taskMatch[3] ? taskMatch[3].trim() : '';
              const text = taskMatch[4] ? taskMatch[4].trim() : '';

              const assigneeMatch = text.match(/\(([^)]+)\)\s*$/i) || text.match(/\[([^\]]+)\]\s*$/i) || text.match(/@([\w-]+)/i);
              let taskAssignee = assigneeMatch ? normalizeAssignee(assigneeMatch[1].trim()) : '';
              if (!taskAssignee && ideaAssignee && ideaAssignee !== 'Todos') {
                taskAssignee = ideaAssignee;
              }
              if (taskAssignee && isAssigneeActive(taskAssignee, membersList)) {
                const parts = taskAssignee.split(/[,/]+/).map(p => p.trim()).filter(Boolean);
                parts.forEach(p => {
                  if (isAssigneeActive(p, membersList)) {
                    assigneesSet.add(p);
                  }
                });
              } else {
                taskAssignee = '';
              }

              const taskDir = detectTaskDirectory(text, detectedDir);
              tasks.push({
                id: taskId,
                text,
                done,
                assignee: taskAssignee,
                directory: taskDir,
                raw: tl.trim(),
                section: currentSection
              });
            } else if (tasks.length > 0 && tl.trim() && !tl.startsWith('#')) {
              const lastTask = tasks[tasks.length - 1];
              const cleanPromptLine = tl.trim().replace(/^>\s*/, '');
              if (!lastTask.prompt) {
                lastTask.prompt = cleanPromptLine;
              } else {
                lastTask.prompt += '\n' + cleanPromptLine;
              }
            }
          }
        } catch { }

        const totalTasks = tasks.length;
        const doneTasks = tasks.filter(t => t.done).length;
        const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

        let kanbanColumn = 'Backlog';
        if (totalTasks > 0 && doneTasks === totalTasks) {
          kanbanColumn = 'Done';
        } else if (doneTasks > 0) {
          kanbanColumn = 'In Progress';
        } else if (status === 'Aprovado' || status === 'Validado') {
          kanbanColumn = 'Ready';
        }

        if (assigneesSet.size === 0) {
          assigneesSet.add('Todos');
        }

        features.push({
          id: featureName,
          name: featureName,
          title,
          summary,
          directory: detectedDir,
          status,
          ideaStatus,
          ideaColumn: ideaStatus,
          ideaAssignee,
          assignees: Array.from(assigneesSet),
          kanbanColumn,
          proposal,
          tasks,
          totalTasks,
          doneTasks,
          progress,
          isFromGitBranch: true,
          branch
        });
      }
    }
    return features;
  } catch (err) {
    return [];
  }
}

function getFeaturesData() {
  if (!fs.existsSync(OPEN_SPEC_DIR)) {
    return [];
  }

  let modifiedFeatures: Set<string> = new Set();
  try {
    const statusOut = execSync('git status -s openspec/changes/', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
    if (statusOut) {
      for (const line of statusOut.split('\n')) {
        const m = line.match(/openspec\/changes\/([^/\\]+)/);
        if (m) modifiedFeatures.add(m[1].trim());
      }
    }
  } catch { }

  const entries = fs.readdirSync(OPEN_SPEC_DIR, { withFileTypes: true });
  const featureDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  const membersList = getMembers();

  return featureDirs.map(name => {
    const dirPath = path.join(OPEN_SPEC_DIR, name);
    const proposalPath = path.join(dirPath, 'proposal.md');
    const tasksPath = path.join(dirPath, 'tasks.md');

    let proposal = '';
    let status = 'Backlog';
    let ideaStatus = 'Criado';
    let ideaAssignee = 'Todos';
    let title = name.replace(/-/g, ' ');
    let summary = '';
    const assigneesSet = new Set<string>();

    if (fs.existsSync(proposalPath)) {
      proposal = fs.readFileSync(proposalPath, 'utf8');

      const titleMatch = proposal.match(/##\s*Title\s*\n+([^\n#]+)/i);
      if (titleMatch) title = titleMatch[1].trim();

      const summaryMatch = proposal.match(/##\s*Summary\s*\n+([^\n#]+)/i);
      if (summaryMatch) summary = summaryMatch[1].trim();

      if (proposal.includes('[APROVADO]')) {
        status = 'Aprovado';
        ideaStatus = 'Aprovado';
      } else if (proposal.includes('[VALIDADO]')) {
        status = 'Validado';
        ideaStatus = 'Validado';
      } else if (proposal.includes('[REJEITADO]')) {
        status = 'Rejeitado';
        ideaStatus = 'Rejeitado';
      } else {
        ideaStatus = 'Criado';
      }

      const teamMatch = proposal.match(/\[(APROVADO|CRIADO|VALIDADO|REJEITADO)\]\s+por\s+([^,\n\r]+?)(?:\s+em\s+|\s*$)/i) || proposal.match(/\[(APROVADO|CRIADO|VALIDADO|REJEITADO)\]\s+por\s+([^\s\n]+)/i);
      if (teamMatch) {
        ideaAssignee = normalizeAssignee(teamMatch[2].trim());
        if (isAssigneeActive(ideaAssignee, membersList)) {
          assigneesSet.add(ideaAssignee);
        } else {
          ideaAssignee = 'Todos';
        }
      }
    }

    const detectedDir = detectDirectory(name, title, summary, proposal);
    const tasks: Array<{ id: string; text: string; done: boolean; assignee?: string; directory?: string; prompt?: string; raw: string; section: string }> = [];
    if (fs.existsSync(tasksPath)) {
      const content = fs.readFileSync(tasksPath, 'utf8');
      const lines = content.split('\n');
      let currentSection = 'Geral';

      for (const line of lines) {
        const secMatch = line.match(/^##\s*\d*\.?\s*(.+)/);
        if (secMatch) {
          currentSection = secMatch[1].trim();
          continue;
        }

        const taskMatch = line.match(/^\s*[-*]?\s*\[([ xX])\]\s*(\*\*(.+?)\*\*)?\s*(.*)/);
        if (taskMatch) {
          const done = taskMatch[1].toLowerCase() === 'x';
          const taskId = taskMatch[3] ? taskMatch[3].trim() : '';
          const text = taskMatch[4] ? taskMatch[4].trim() : '';

          const assigneeMatch = text.match(/\(([^)]+)\)\s*$/i) || text.match(/\[([^\]]+)\]\s*$/i) || text.match(/@([\w-]+)/i);
          let taskAssignee = assigneeMatch ? normalizeAssignee(assigneeMatch[1].trim()) : '';
          if (!taskAssignee && ideaAssignee && ideaAssignee !== 'Todos') {
            taskAssignee = ideaAssignee;
          }
          if (taskAssignee && isAssigneeActive(taskAssignee, membersList)) {
            const parts = taskAssignee.split(/[,/]+/).map(p => p.trim()).filter(Boolean);
            parts.forEach(p => {
              if (isAssigneeActive(p, membersList)) {
                assigneesSet.add(p);
              }
            });
          } else {
            taskAssignee = '';
          }

          const taskDir = detectTaskDirectory(text, detectedDir);
          tasks.push({
            id: taskId,
            text,
            done,
            assignee: taskAssignee,
            directory: taskDir,
            raw: line.trim(),
            section: currentSection
          });
        } else if (tasks.length > 0 && line.trim() && !line.startsWith('#')) {
          const lastTask = tasks[tasks.length - 1];
          const cleanPromptLine = line.trim().replace(/^>\s*/, '');
          if (!lastTask.prompt) {
            lastTask.prompt = cleanPromptLine;
          } else {
            lastTask.prompt += '\n' + cleanPromptLine;
          }
        }
      }
    }

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.done).length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Derived Kanban column
    let kanbanColumn = 'Backlog';
    if (totalTasks > 0 && doneTasks === totalTasks) {
      kanbanColumn = 'Done';
    } else if (doneTasks > 0) {
      kanbanColumn = 'In Progress';
    } else if (status === 'Aprovado' || status === 'Validado') {
      kanbanColumn = 'Ready';
    }

    if (assigneesSet.size === 0) {
      assigneesSet.add('Todos');
    }

    return {
      id: name,
      name,
      title,
      summary,
      directory: detectedDir,
      status,
      ideaStatus,
      ideaColumn: ideaStatus,
      ideaAssignee,
      assignees: Array.from(assigneesSet),
      kanbanColumn,
      proposal,
      tasks,
      totalTasks,
      doneTasks,
      progress,
      isModifiedLocally: modifiedFeatures.has(name)
    };
  });
}

function generateSmartOpenSpec(featureId: string, title?: string, promptText?: string, team?: string, directory?: string) {
  const cleanId = featureId
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `feature-${Date.now()}`;
  const cleanTitle = title && title.trim() ? title.trim() : cleanId.replace(/-/g, ' ');

  const textToScan = `${cleanId} ${cleanTitle} ${promptText || ''}`.toLowerCase();
  const isCombat = /combat|dano|health|vida|tiro|skill|poder|ataque|hero|minion|torre|bala|arma|montaria/i.test(textToScan);
  const isUI = /ui|hud|menu|tela|painel|botao|joystick|ranking|placar|indicador/i.test(textToScan);
  const isEconomy = /ouro|gold|moeda|loja|recompensa|nft|token|solana|metaplex|inventario/i.test(textToScan);

  let motivation = promptText && promptText.trim()
    ? `${promptText.trim()}\n\nAlinhado à evolução contínua do Fowlgen Wars com especificação clara, modular e alinhada ao Mini-MOBA MVP.`
    : `Atender à evolução contínua do Fowlgen Wars com especificação clara, modular e alinhada ao Mini-MOBA MVP.`;
  let solution = `Implementar componentes modulares respeitando as convenções de Claude.md e validando em Play mode na cena Arena_Clean.`;
  let alternatives = `Tentativas monolíticas sem isolamento de componentes foram descartadas para evitar conflitos na árvore de prefabs.`;

  let tasks = [
    {
      section: "1. Planejamento & Arquitetura",
      items: [
        `Mapear contratos de interface e referências na cena Arena_Clean para "${cleanTitle}"`,
        `Definir escopo estrito de componentes sem afetar sistemas globais de balanceamento`
      ]
    },
    {
      section: "2. Implementação Técnica",
      items: [
        `Implementar scripts modulares C# e componentes para "${cleanTitle}"`,
        `Conectar eventos de jogo e garantir serialização correta de dados`,
        `Garantir tratamento defensivo contra referências nulas (NullReferenceException)`
      ]
    },
    {
      section: "3. Validação & Testes",
      items: [
        `Validar execução sem erros no Console durante Play mode na cena Arena_Clean`,
        `Verificar aderência ao checklist DevSecOps e integridade do repositório`
      ]
    }
  ];

  if (isCombat) {
    motivation = `Aprimorar a dinâmica tática de combate e feedback visual/sonoro dos heróis e tropas no mapa de 3 rotas.`;
    solution = `Adaptar a lógica de combate mantendo contratos de dano/vida existentes e testando em modo Play na Arena_Clean.`;
    tasks[1].items = [
      `Implementar controlador de combate/efeitos para "${cleanTitle}"`,
      `Ajustar colisores, sincronização de HP e feedbacks visuais`,
      `Configurar time A (Verde #22C55E) e time B (Vermelho #EF4444) adequadamente`
    ];
  } else if (isUI) {
    motivation = `Garantir ergonomia e legibilidade de interface para jogadores mobile e desktop em proporção widescreen.`;
    solution = `Criar UI com Canvas adaptativo, âncoras relativas e isolamento de eventos de clique/toque.`;
    tasks[1].items = [
      `Construir layout Canvas e âncoras responsivas para "${cleanTitle}"`,
      `Conectar bindings de dados e reatividade aos eventos do jogo`,
      `Verificar contraste visual e área de toque para mobile landscape`
    ];
  } else if (isEconomy) {
    motivation = `Estruturar progressão e recompensas fair-play respeitando as diretrizes de Solana e Web3 modular.`;
    solution = `Separar estado de inventário do gameplay em tempo real, integrando chamadas RPC seguras.`;
    tasks[1].items = [
      `Implementar estrutura de dados para moedas/ativos de "${cleanTitle}"`,
      `Conectar validação de regras de inventário sem afetar a latência da partida`,
      `Integrar eventos de sincronização com o backend/blockchain`
    ];
  }

  // Coleta features existentes para comparar e prevenir conflitos
  const existingFeatures: string[] = [];
  if (fs.existsSync(OPEN_SPEC_DIR)) {
    try {
      const dirs = fs.readdirSync(OPEN_SPEC_DIR).filter(d => {
        return fs.statSync(path.join(OPEN_SPEC_DIR, d)).isDirectory() && d !== cleanId;
      });
      existingFeatures.push(...dirs);
    } catch { }
  }

  // Análise de Guardrails e Prevenção de Conflitos (Claude.md)
  const conflictNotes: string[] = [];
  if (/4\s*rotas?|quatro\s*rotas?/i.test(textToScan)) {
    conflictNotes.push(`- **Prevenção de Conflito de Mapa:** O mapa canônico oficial é estritamente de 3 rotas (cena Arena_Clean com 18 torres). O conceito legado de 4 rotas da Sprint 01 foi descartado para evitar divergências de arquitetura.`);
  }
  if (/cartas?|card|deck|baralho/i.test(textToScan)) {
    conflictNotes.push(`- **Prevenção de Conflito de Mecânica:** O uso de cartas ou baralhos foi descartado conforme Claude.md (linhas 149-152), priorizando o sistema canônico de 4 slots de habilidades com cooldown.`);
  }
  if (/p2w|pay.*to.*win|vantagem.*comprada/i.test(textToScan)) {
    conflictNotes.push(`- **Prevenção de Conflito de Fair-Play:** O projeto adota nivelamento proporcional e proteção anti-pay-to-win. Ativos Web3/NFTs são estritamente cosméticos.`);
  }
  if (/blockchain.*tempo.*real|solana.*frame|colis[aã]o.*on.*chain/i.test(textToScan)) {
    conflictNotes.push(`- **Prevenção de Conflito de Rede:** Física, colisão e frames operam 100% off-chain no servidor FishNet em tempo real. Solana/Anchor é reservado exclusivamente para liquidação e inventário pós-partida.`);
  }

  const existingComparison = existingFeatures.length > 0
    ? `Features ativas no OpenSpec: ${existingFeatures.slice(0, 5).map(f => `\`${f}\``).join(', ')}${existingFeatures.length > 5 ? ` (+${existingFeatures.length - 5} outras)` : ''}. Esta proposta foi desenhada de forma isolada para não interferir nas tarefas em andamento.`
    : `Nenhuma feature conflitante detectada no workspace local do OpenSpec.`;

  const author = (team && team.trim() && team !== 'Todos' && team !== 'dev-team') ? team.trim() : 'Todos';
  const dateStr = new Date().toISOString().split('T')[0];

  const cleanDir = (directory && directory.trim() && directory.trim().toLowerCase() !== 'geral') ? directory.trim().toLowerCase() : '';
  const dirSection = cleanDir ? `\n\n## Directory\n${cleanDir}` : '';

  const proposal = `# Feature: ${cleanId}

## Title
${cleanTitle}

## Summary
Implementação da funcionalidade "${cleanTitle}" para o Fowlgen Wars com escopo delimitado, componentes modulares e verificação em Arena_Clean.

## Motivation
${motivation}${dirSection}

## Context & Existing Implementations
${existingComparison}

## Proposed Solution (Solução Sem Conflito)
${solution}

## Alternatives Considered (Alternativas Avaliadas)
1. **Alternativa Monolítica (Descartada):** Modificação direta em prefabs e scripts globais existentes. Descartada para evitar quebrar testes de combate e colisão validados na cena Arena_Clean.
2. **Alternativa Baseada em Polling/Bloqueio (Descartada):** Criar dependência acoplada entre subsistemas. Descartada para manter arquitetura modular orientada a eventos.
3. **Solução Adotada (Recomendada):** ${solution}

${conflictNotes.length > 0 ? `## Análise de Diretrizes & Guardrails (Claude.md)\n${conflictNotes.join('\n')}\n` : ''}## Impact & Prevenção de Conflitos
- [ ] Breaking changes (Zero breaking changes nos sistemas em produção)
- [x] Preserva balanceamento existente e isola alterações em componentes específicos
- [x] Validado contra convenções de Claude.md e Play Mode na cena Arena_Clean
- [x] Compatível com pipeline gráfico URP Mobile e servidor FishNet

## Status
[CRIADO] por ${author} em ${dateStr}
`;

  let tasksMd = `# Tasks for ${cleanId}\n\n`;
  tasks.forEach((sec, sIdx) => {
    tasksMd += `## ${sec.section}\n`;
    sec.items.forEach((item, iIdx) => {
      tasksMd += `- [ ] **${sIdx + 1}.${iIdx + 1}** ${item}\n`;
    });
    tasksMd += `\n`;
  });

  const totalTasks = tasks.reduce((acc, s) => acc + s.items.length, 0);

  return { cleanId, cleanTitle, proposal, tasksMd, totalTasks };
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function csvEscape(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function generateSprintCsv(features: any[]): string {
  const headers = [
    'Feature ID',
    'Título da Feature',
    'Status Kanban',
    'Diretório / Projeto',
    'Responsáveis da Feature',
    'Progresso (%)',
    'Total de Tarefas',
    'Tarefas Concluídas',
    'ID Tarefa',
    'Descrição da Tarefa',
    'Status Tarefa',
    'Responsável Tarefa'
  ];

  const rows: string[] = [];
  rows.push(headers.map(h => csvEscape(h)).join(';'));

  for (const feat of features) {
    const fId = feat.name || '';
    const fTitle = feat.title || feat.name || '';
    const fColumn = feat.kanbanColumn || 'Backlog';
    const fDir = feat.directory || 'geral';
    const fAssignees = Array.isArray(feat.assignees) ? feat.assignees.join(', ') : (feat.assignee || '');
    const fProgress = typeof feat.progress === 'number' ? feat.progress : 0;
    const fTotal = feat.totalTasks || (feat.tasks ? feat.tasks.length : 0);
    const fDone = feat.doneTasks || 0;

    if (Array.isArray(feat.tasks) && feat.tasks.length > 0) {
      for (const t of feat.tasks) {
        const tId = t.id || '';
        const tDesc = t.description || t.text || '';
        const tStatus = t.done ? 'Concluída' : (t.status || 'Pendente');
        const tAssignee = Array.isArray(t.assignees) ? t.assignees.join(', ') : (t.assignee || fAssignees);

        rows.push([
          csvEscape(fId),
          csvEscape(fTitle),
          csvEscape(fColumn),
          csvEscape(fDir),
          csvEscape(fAssignees),
          csvEscape(fProgress),
          csvEscape(fTotal),
          csvEscape(fDone),
          csvEscape(tId),
          csvEscape(tDesc),
          csvEscape(tStatus),
          csvEscape(tAssignee)
        ].join(';'));
      }
    } else {
      rows.push([
        csvEscape(fId),
        csvEscape(fTitle),
        csvEscape(fColumn),
        csvEscape(fDir),
        csvEscape(fAssignees),
        csvEscape(fProgress),
        csvEscape(fTotal),
        csvEscape(fDone),
        csvEscape(''),
        csvEscape('(Sem tarefas cadastradas)'),
        csvEscape(feat.done ? 'Concluída' : 'Pendente'),
        csvEscape(fAssignees)
      ].join(';'));
    }
  }

  // Adiciona UTF-8 BOM (\uFEFF) para garantir acentuação correta no Excel brasileiro/internacional
  return '\uFEFF' + rows.join('\r\n');
}

function generateSprintPrintableHtml(features: any[], branch: string = 'local'): string {
  const totalFeatures = features.length;
  let totalTasks = 0;
  let doneTasks = 0;

  for (const f of features) {
    totalTasks += (f.totalTasks || (f.tasks ? f.tasks.length : 0));
    doneTasks += (f.doneTasks || (f.tasks ? f.tasks.filter((t: any) => t.done).length : 0));
  }

  const overallProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const now = new Date();
  const nowStr = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;

  const rowsHtml = features.map(f => {
    const tasks = Array.isArray(f.tasks) ? f.tasks : [];
    const featProg = typeof f.progress === 'number' ? f.progress : 0;
    const assignees = Array.isArray(f.assignees) ? f.assignees.join(', ') : (f.assignee || 'Não atribuído');
    const dir = f.directory || 'geral';

    const tasksListHtml = tasks.map((t: any) => {
      const isDone = t.done;
      const tAssignee = Array.isArray(t.assignees) ? t.assignees.join(', ') : (t.assignee || assignees);
      return `<li style="margin-bottom: 5px; color: ${isDone ? '#166534' : '#1e293b'};">
        <span style="display: inline-block; width: 18px; font-weight: bold;">${isDone ? '✅' : '⬜'}</span>
        <strong>${escapeHtml(t.id)}:</strong> ${escapeHtml(t.description || t.text)}
        <span style="font-size: 11px; color: #64748b; margin-left: 8px;">(${escapeHtml(tAssignee)})</span>
      </li>`;
    }).join('');

    const colClass = f.kanbanColumn === 'Done' ? 'status-done' :
      (f.kanbanColumn === 'In Progress' ? 'status-in-progress' :
      (f.kanbanColumn === 'Ready to Review' ? 'status-ready' : 'status-backlog'));

    return `
    <div class="report-feature-card">
      <div class="report-feature-header">
        <div>
          <span class="report-feature-title">${escapeHtml(f.title || f.name)}</span>
          <span class="report-feature-id">(${escapeHtml(f.name)})</span>
          <span class="report-badge dir">${escapeHtml(dir)}</span>
        </div>
        <div>
          <span class="report-badge ${colClass}">${escapeHtml(f.kanbanColumn || 'Backlog')}</span>
          <span style="font-size: 12px; font-weight: 700; color: #0284c7; margin-left: 8px;">${featProg}%</span>
        </div>
      </div>
      <div class="report-progress-bar">
        <div class="report-progress-fill" style="width: ${featProg}%;"></div>
      </div>
      <div class="report-feature-desc">
        <strong>Responsáveis:</strong> ${escapeHtml(assignees)} &bull;
        <strong>Tarefas:</strong> ${f.doneTasks || 0} de ${f.totalTasks || tasks.length} finalizadas
      </div>
      ${tasks.length > 0 ? `<ul class="report-tasks-list">${tasksListHtml}</ul>` : '<div style="font-size: 11px; color: #94a3b8; font-style: italic;">Nenhuma tarefa detalhada</div>'}
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Executivo da Sprint - Fowlgen Wars</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #fff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .report-header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .report-brand {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .report-sub {
      font-size: 13px;
      color: #64748b;
      margin-top: 2px;
    }
    .report-meta {
      text-align: right;
      font-size: 11.5px;
      color: #475569;
    }
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      background: #f8fafc;
      text-align: center;
    }
    .kpi-title {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .kpi-val {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin: 4px 0;
    }
    .kpi-desc {
      font-size: 11px;
      color: #475569;
    }
    .report-feature-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
      background: #fff;
    }
    .report-feature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .report-feature-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .report-feature-id {
      font-family: monospace;
      font-size: 12px;
      color: #64748b;
      margin-left: 4px;
    }
    .report-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      margin-left: 6px;
      border: 1px solid #cbd5e1;
      display: inline-block;
    }
    .status-done { background: #dcfce7; color: #166534; border-color: #86efac; }
    .status-in-progress { background: #e0f2fe; color: #075985; border-color: #7dd3fc; }
    .status-ready { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .status-backlog { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
    .report-badge.dir { background: rgba(14, 165, 233, 0.12); color: #0284c7; border-color: rgba(14, 165, 233, 0.3); }
    .report-progress-bar {
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .report-progress-fill {
      height: 100%;
      background: #10b981;
    }
    .report-feature-desc {
      font-size: 12px;
      color: #475569;
      margin-bottom: 10px;
    }
    .report-tasks-list {
      margin: 0;
      padding-left: 18px;
      font-size: 12px;
      line-height: 1.45;
    }
    .print-actions {
      position: fixed;
      top: 15px;
      right: 15px;
      display: flex;
      gap: 10px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .btn-print {
      background: #0ea5e9;
      color: #fff;
      border: none;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-close-print {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
    }
    @media print {
      .print-actions { display: none !important; }
      body { padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar em PDF</button>
    <button class="btn-close-print" onclick="window.close()">✕ Fechar</button>
  </div>

  <div class="report-header">
    <div>
      <div class="report-brand">🎮 Fowlgen Wars - OpenSpec Kanban</div>
      <div class="report-sub">Relatório Executivo da Sprint & Acompanhamento de Desenvolvimento</div>
    </div>
    <div class="report-meta">
      <div><strong>Emissão:</strong> ${nowStr}</div>
      <div><strong>Ambiente / Branch:</strong> ${escapeHtml(branch)}</div>
    </div>
  </div>

  <div class="kpis-grid">
    <div class="kpi-card">
      <div class="kpi-title">Conclusão da Sprint</div>
      <div class="kpi-val" style="color: #059669;">${overallProgress}%</div>
      <div class="kpi-desc">${doneTasks} de ${totalTasks} tarefas</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Features OpenSpec</div>
      <div class="kpi-val" style="color: #0284c7;">${totalFeatures}</div>
      <div class="kpi-desc">Total de propostas</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Tarefas Concluídas</div>
      <div class="kpi-val" style="color: #10b981;">${doneTasks}</div>
      <div class="kpi-desc">Finalizadas e testadas</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Tarefas Pendentes</div>
      <div class="kpi-val" style="color: #d97706;">${Math.max(0, totalTasks - doneTasks)}</div>
      <div class="kpi-desc">Em andamento ou backlog</div>
    </div>
  </div>

  <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 14px;">
    Detalhamento de Features & Tarefas
  </h3>

  ${rowsHtml}

  <script>
    if (new URLSearchParams(window.location.search).get('auto') === 'print') {
      window.addEventListener('load', () => {
        setTimeout(() => window.print(), 500);
      });
    }
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
    // API: Get members list & local git user
    if (req.method === 'GET' && pathname === '/api/members') {
      const members = getMembers();
      const gitInfo = getGitInfo();
      sendJSON(res, 200, {
        success: true,
        members,
        gitUser: gitInfo.gitUser,
        detectedMember: gitInfo.detectedMember,
        isGitConfigured: gitInfo.isGitConfigured
      });
      return;
    }

    // API: Add new member
    if (req.method === 'POST' && pathname === '/api/members') {
      const { name, role, email, github, avatar, color } = await parseJSONBody(req);
      if (!name || !name.trim()) {
        sendJSON(res, 400, { success: false, error: 'O nome do integrante é obrigatório.' });
        return;
      }

      const cleanName = name.trim();
      let cleanId = cleanName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `membro-${Date.now()}`;
      const members = getMembers();

      const existing = members.find(m => m.id === cleanId || m.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) {
        sendJSON(res, 400, { success: false, error: `Já existe um integrante cadastrado com o nome "${cleanName}".` });
        return;
      }

      let uniqueId = cleanId;
      let counter = 1;
      while (members.some(m => m.id === uniqueId)) {
        uniqueId = `${cleanId}-${counter++}`;
      }
      cleanId = uniqueId;

      const newMember: Member = {
        id: cleanId,
        name: cleanName,
        role: role && role.trim() ? role.trim() : 'Membro da Equipe',
        email: email && email.trim() ? email.trim().toLowerCase() : '',
        github: github && github.trim() ? github.trim().replace(/^@/, '') : '',
        avatar: avatar && avatar.trim() ? avatar.trim() : '👤',
        color: color && color.trim() ? color.trim() : '#38bdf8',
        status: 'active',
        active: true
      };

      members.push(newMember);
      saveMembers(members);

      sendJSON(res, 200, {
        success: true,
        message: `Integrante ${cleanName} cadastrado com sucesso!`,
        member: newMember,
        members
      });
      return;
    }

    // API: Update member (PUT /api/members, PUT /api/members/:id ou POST /api/members/update)
    const isMemberUpdate = (req.method === 'PUT' && (pathname === '/api/members' || pathname.startsWith('/api/members/'))) ||
      ((req.method === 'POST' || req.method === 'PUT') && pathname === '/api/members/update');

    if (isMemberUpdate) {
      const body = await parseJSONBody(req);
      let targetId = body.id;
      if (!targetId && pathname.startsWith('/api/members/') && pathname !== '/api/members/update') {
        targetId = decodeURIComponent(pathname.substring('/api/members/'.length));
      }

      if (!targetId) {
        sendJSON(res, 400, { success: false, error: 'ID do integrante é obrigatório para alteração.' });
        return;
      }

      const members = getMembers();
      const memberIndex = members.findIndex(m => m.id === targetId || m.name.toLowerCase() === String(targetId).toLowerCase());

      if (memberIndex === -1) {
        sendJSON(res, 404, { success: false, error: `Integrante com identificador "${targetId}" não encontrado.` });
        return;
      }

      const current = members[memberIndex];
      const newName = body.name !== undefined ? String(body.name).trim() : current.name;
      const newRole = body.role !== undefined ? String(body.role).trim() : current.role;
      const newEmail = body.email !== undefined ? String(body.email).trim().toLowerCase() : (current.email || '');
      const newGithub = body.github !== undefined ? String(body.github).trim().replace(/^@/, '') : (current.github || '');
      const newAvatar = body.avatar !== undefined ? String(body.avatar).trim() : current.avatar;
      const newColor = body.color !== undefined ? String(body.color).trim() : current.color;

      if (!newName) {
        sendJSON(res, 400, { success: false, error: 'O nome do integrante não pode ficar vazio.' });
        return;
      }

      // Verifica se o novo nome colide com OUTRO integrante diferente
      const conflict = members.find((m, idx) => idx !== memberIndex && m.name.toLowerCase() === newName.toLowerCase());
      if (conflict) {
        sendJSON(res, 400, { success: false, error: `Já existe outro integrante cadastrado com o nome "${newName}".` });
        return;
      }

      members[memberIndex] = {
        ...current,
        name: newName,
        role: newRole,
        email: newEmail,
        github: newGithub,
        avatar: newAvatar,
        color: newColor,
        status: body.status !== undefined ? body.status : (current.status || 'active'),
        active: body.active !== undefined ? Boolean(body.active) : (current.active !== undefined ? current.active : true)
      };

      saveMembers(members);

      sendJSON(res, 200, {
        success: true,
        message: `Integrante ${newName} atualizado com sucesso!`,
        member: members[memberIndex],
        members
      });
      return;
    }

    // API: Deactivate member and transfer tasks
    if (req.method === 'POST' && pathname === '/api/members/deactivate') {
      const { memberId, reassignTo, transferScope } = await parseJSONBody(req);
      if (!memberId) {
        sendJSON(res, 400, { success: false, error: 'O ID do integrante a ser inativado é obrigatório.' });
        return;
      }
      if (!reassignTo) {
        sendJSON(res, 400, { success: false, error: 'Selecione quem assume as tarefas deste integrante.' });
        return;
      }

      const members = getMembers();
      const targetIndex = members.findIndex(m => m.id === memberId || m.name.toLowerCase() === String(memberId).toLowerCase());
      if (targetIndex === -1) {
        sendJSON(res, 404, { success: false, error: 'Integrante a ser inativado não foi encontrado.' });
        return;
      }

      const successor = members.find(m => m.id === reassignTo || m.name.toLowerCase() === String(reassignTo).toLowerCase());
      if (!successor) {
        sendJSON(res, 404, { success: false, error: 'Integrante sucessor não foi encontrado na equipe.' });
        return;
      }

      if (members[targetIndex].id === successor.id) {
        sendJSON(res, 400, { success: false, error: 'O sucessor das tarefas não pode ser o mesmo integrante inativado.' });
        return;
      }

      if (successor.active === false || successor.status === 'inactive') {
        sendJSON(res, 400, { success: false, error: 'O sucessor selecionado não pode estar inativo.' });
        return;
      }

      const targetMember = members[targetIndex];
      targetMember.status = 'inactive';
      targetMember.active = false;
      targetMember.deactivatedAt = new Date().toISOString();
      targetMember.transferredTo = successor.name;

      const scope = (transferScope === 'all') ? 'all' : 'pending';
      const transferResult = reassignMemberTasks(targetMember, successor, scope);

      saveMembers(members);

      sendJSON(res, 200, {
        success: true,
        message: `Integrante "${targetMember.name}" inativado com sucesso. ${transferResult.count} tarefas ${scope === 'pending' ? 'não terminadas' : ''} repassadas para o membro ativo "${successor.name}".`,
        member: targetMember,
        successor: successor.name,
        transferredTasks: transferResult.count,
        scope,
        modifiedFiles: transferResult.modifiedFiles,
        members
      });
      return;
    }

    // API: Activate member
    if (req.method === 'POST' && pathname === '/api/members/activate') {
      const { memberId } = await parseJSONBody(req);
      if (!memberId) {
        sendJSON(res, 400, { success: false, error: 'O ID do integrante a ser reativado é obrigatório.' });
        return;
      }

      const members = getMembers();
      const targetIndex = members.findIndex(m => m.id === memberId || m.name.toLowerCase() === String(memberId).toLowerCase());
      if (targetIndex === -1) {
        sendJSON(res, 404, { success: false, error: 'Integrante não foi encontrado na equipe.' });
        return;
      }

      const targetMember = members[targetIndex];
      targetMember.status = 'active';
      targetMember.active = true;

      saveMembers(members);

      sendJSON(res, 200, {
        success: true,
        message: `Integrante "${targetMember.name}" reativado com sucesso!`,
        member: targetMember,
        members
      });
      return;
    }

    // API: Configure local git user
    if (req.method === 'POST' && pathname === '/api/git/config-user') {
      const { name, email } = await parseJSONBody(req);
      if (!name || !email) {
        sendJSON(res, 400, { success: false, error: 'Nome e E-mail são obrigatórios para configurar o Git.' });
        return;
      }

      try {
        const cleanName = name.trim().replace(/"/g, '\\"');
        const cleanEmail = email ? email.trim().replace(/"/g, '\\"') : '';
        execSync(`git config user.name "${cleanName}"`, { cwd: REPO_ROOT });
        if (cleanEmail) {
          execSync(`git config user.email "${cleanEmail}"`, { cwd: REPO_ROOT });
        }
        const gitInfo = getGitInfo();
        sendJSON(res, 200, {
          success: true,
          message: `Git local configurado com sucesso para "${cleanName}"!`,
          gitInfo
        });
      } catch (err: any) {
        sendJSON(res, 500, { success: false, error: err.message || 'Erro ao configurar Git local.' });
      }
      return;
    }

    // API: Set local developer identity (Privacy-first: saved locally in identity.local.json, ignored by git)
    if (req.method === 'POST' && pathname === '/api/git/set-local-identity') {
      const { memberId } = await parseJSONBody(req);
      if (!memberId) {
        sendJSON(res, 400, { success: false, error: 'O ID do integrante é obrigatório.' });
        return;
      }

      const members = getMembers();
      const targetMember = members.find(m => m.id === memberId || m.name.toLowerCase() === String(memberId).toLowerCase());
      if (!targetMember) {
        sendJSON(res, 404, { success: false, error: 'Integrante não encontrado na lista da equipe.' });
        return;
      }

      const localIdentityPath = path.join(KANBAN_ROOT, 'src/config/identity.local.json');
      fs.writeFileSync(localIdentityPath, JSON.stringify({ memberId: targetMember.id }, null, 2), 'utf8');

      try {
        execSync(`git config user.name "${targetMember.name}"`, { cwd: REPO_ROOT });
      } catch { }

      const gitInfo = getGitInfo();
      sendJSON(res, 200, {
        success: true,
        message: `Identidade local definida como "${targetMember.name}"! Salvo apenas na sua máquina com privacidade total.`,
        gitInfo
      });
      return;
    }

    // API: Delete member (DELETE /api/members/:id, DELETE /api/members ou POST /api/members/delete)
    const isMemberDelete = (req.method === 'POST' && pathname === '/api/members/delete') ||
      (req.method === 'DELETE' && (pathname === '/api/members' || pathname.startsWith('/api/members/')));

    if (isMemberDelete) {
      let targetId = '';
      if (req.method === 'DELETE' && pathname.startsWith('/api/members/')) {
        targetId = decodeURIComponent(pathname.substring('/api/members/'.length));
      } else {
        const body = await parseJSONBody(req);
        targetId = body.id;
      }

      if (!targetId) {
        sendJSON(res, 400, { success: false, error: 'ID do integrante é obrigatório.' });
        return;
      }

      let members = getMembers();
      const initialCount = members.length;
      members = members.filter(m => m.id !== targetId && m.name.toLowerCase() !== String(targetId).toLowerCase());

      if (members.length === initialCount) {
        sendJSON(res, 404, { success: false, error: 'Integrante não encontrado.' });
        return;
      }

      saveMembers(members);
      sendJSON(res, 200, {
        success: true,
        message: 'Integrante removido com sucesso.',
        members
      });
      return;
    }

    // API: Get project directories
    if (req.method === 'GET' && pathname === '/api/directories') {
      sendJSON(res, 200, {
        success: true,
        directories: getDirectories()
      });
      return;
    }

    // API: Add or update project directory
    if (req.method === 'POST' && pathname === '/api/directories') {
      const { id, name, path: dirPath, icon, patterns } = await parseJSONBody(req);
      if (!name || !name.trim()) {
        sendJSON(res, 400, { success: false, error: 'O nome do projeto/diretório é obrigatório.' });
        return;
      }
      const cleanPath = (dirPath && dirPath.trim())
        ? dirPath.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
        : name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const cleanId = (id && id.trim())
        ? id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
        : cleanPath;

      const dirs = getDirectories();
      const existingIdx = dirs.findIndex(d => d.id === cleanId);
      const newDir: ProjectDirectory = {
        id: cleanId,
        name: name.trim(),
        path: cleanPath,
        icon: (icon && icon.trim()) ? icon.trim() : '📁',
        patterns: Array.isArray(patterns) && patterns.length > 0
          ? patterns.map(p => String(p).trim().toLowerCase()).filter(Boolean)
          : [cleanId, cleanPath, name.trim().toLowerCase()]
      };

      if (existingIdx >= 0) {
        dirs[existingIdx] = newDir;
      } else {
        dirs.push(newDir);
      }
      saveDirectories(dirs);

      sendJSON(res, 200, {
        success: true,
        message: `Diretório "${newDir.name}" salvo com sucesso!`,
        directory: newDir,
        directories: dirs
      });
      return;
    }

    // API: Delete project directory
    if ((req.method === 'POST' && pathname === '/api/directories/delete') || (req.method === 'DELETE' && pathname.startsWith('/api/directories/'))) {
      let targetId = '';
      if (req.method === 'DELETE') {
        targetId = decodeURIComponent(pathname.substring('/api/directories/'.length));
      } else {
        const body = await parseJSONBody(req);
        targetId = body.id;
      }
      if (!targetId) {
        sendJSON(res, 400, { success: false, error: 'ID do diretório é obrigatório.' });
        return;
      }
      const dirs = getDirectories();
      const filtered = dirs.filter(d => d.id !== targetId.toLowerCase());
      saveDirectories(filtered);
      sendJSON(res, 200, {
        success: true,
        message: `Diretório "${targetId}" removido.`,
        directories: filtered
      });
      return;
    }

    // API: Set feature directory / project
    if (req.method === 'POST' && (pathname === '/api/features/directory' || pathname === '/api/features/set-directory')) {
      const body = await parseJSONBody(req);
      const featureId = body.featureId || body.feature || body.id;
      const directory = body.directory || body.dir;
      if (!featureId || !directory) {
        sendJSON(res, 400, { success: false, error: 'Parâmetros featureId e directory são obrigatórios.' });
        return;
      }
      const ok = setFeatureDirectory(featureId, directory);
      if (ok) {
        const dirs = getDirectories();
        const dirObj = dirs.find(d => d.id.toLowerCase() === directory.toLowerCase());
        sendJSON(res, 200, {
          success: true,
          message: `Projeto da feature alterado para "${dirObj?.name || directory}"!`,
          featureId,
          directory,
          directoryObj: dirObj || null
        });
      } else {
        sendJSON(res, 404, { success: false, error: `Feature "${featureId}" ou proposal.md não encontrado.` });
      }
      return;
    }

    // API: Get GitHub and project config + Database info
    if (req.method === 'GET' && pathname === '/api/config') {
      let configData: any = {};
      if (fs.existsSync(CONFIG_PATH)) {
        try {
          configData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        } catch { }
      }

      const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
      const maskedToken = token ? `${token.substring(0, 4)}••••••••${token.slice(-4)}` : '';

      sendJSON(res, 200, {
        success: true,
        config: {
          repo: configData.github?.repo || 'mukasanray/Fowlgen-Wars-Project',
          branch: configData.github?.branch || 'main',
          projectId: configData.projectId || '',
          assignee: configData.assignee || 'Marcos',
          hasToken: Boolean(token),
          tokenMasked: maskedToken
        }
      });
      return;
    }

    // API: Save GitHub config and token
    if (req.method === 'POST' && pathname === '/api/config') {
      const { token, repo, projectId, assignee } = await parseJSONBody(req);

      if (token && token.trim()) {
        const cleanToken = token.trim();
        process.env.GH_TOKEN = cleanToken;
        process.env.GITHUB_TOKEN = cleanToken;
      }

      // Grava no .env
      const currentToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
      const envContent = [
        `# Fowlgen Wars - Kanban & OpenSpec Environment`,
        `GH_TOKEN=${currentToken}`,
        `GITHUB_TOKEN=${currentToken}`,
        ``
      ].join('\n');
      fs.writeFileSync(ENV_PATH, envContent, 'utf8');

      if (fs.existsSync(CONFIG_PATH)) {
        try {
          const configData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
          if (repo) {
            configData.github = configData.github || {};
            configData.github.repo = repo.trim();
          }
          if (projectId) configData.projectId = projectId.trim();
          if (assignee) configData.assignee = assignee.trim();
          fs.writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 2), 'utf8');
        } catch (err: any) {
          console.error('Error saving kanban-config:', err);
        }
      }

      sendJSON(res, 200, {
        success: true,
        message: 'Configurações de GitHub salvas com sucesso!'
      });
      return;
    }

    // API: Test GitHub Token
    if (req.method === 'POST' && pathname === '/api/config/test-token') {
      const { token: inputToken } = await parseJSONBody(req);
      const token = (inputToken && inputToken.trim()) || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

      if (!token) {
        sendJSON(res, 400, { success: false, error: 'Nenhum token fornecido ou configurado.' });
        return;
      }

      try {
        const ghRes: any = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Fowlgen-Wars-Kanban-Studio',
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (ghRes.ok) {
          const user: any = await ghRes.json();
          sendJSON(res, 200, {
            success: true,
            user: {
              login: user.login,
              name: user.name || user.login,
              avatar_url: user.avatar_url,
              html_url: user.html_url
            }
          });
        } else {
          sendJSON(res, 200, {
            success: false,
            error: `GitHub API recusou o token (HTTP ${ghRes.status}: ${ghRes.statusText})`
          });
        }
      } catch (err: any) {
        sendJSON(res, 200, {
          success: false,
          error: `Erro ao conectar com GitHub: ${err.message}`
        });
      }
      return;
    }

    // API: Git info & branches
    if (req.method === 'GET' && pathname === '/api/git/info') {
      const forceFetch = parsedUrl.searchParams.get('fetch') === 'true' || parsedUrl.searchParams.get('fetch') === '1';
      const gitInfo = getGitInfo(forceFetch);
      sendJSON(res, 200, { success: true, ...gitInfo });
      return;
    }

    // API: Commit OpenSpec changes to Git
    if (req.method === 'POST' && pathname === '/api/git/commit') {
      const { message } = await parseJSONBody(req);
      const commitMsg = message && message.trim() ? message.trim() : 'docs(openspec): atualiza status das tarefas no kanban';
      try {
        execSync('git add openspec/', { encoding: 'utf8', cwd: REPO_ROOT });
        const commitOut = execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { encoding: 'utf8', cwd: REPO_ROOT });
        const gitInfo = getGitInfo();
        sendJSON(res, 200, {
          success: true,
          message: 'Alterações do OpenSpec commitadas com sucesso!',
          details: commitOut.trim(),
          gitInfo
        });
      } catch (err: any) {
        sendJSON(res, 200, {
          success: false,
          error: err.message || 'Nenhuma alteração para commitar ou erro no git commit'
        });
      }
      return;
    }

    // API: Pull changes from remote Git repository (Baixar do Repo)
    if (req.method === 'POST' && pathname === '/api/git/pull') {
      try {
        const gitInfo = getGitInfo(true);
        const branch = gitInfo.currentBranch || 'main';
        const pullOut = execSync(`git pull origin ${branch}`, { encoding: 'utf8', cwd: REPO_ROOT, timeout: 30000 });
        const updatedGitInfo = getGitInfo(true);
        sendJSON(res, 200, {
          success: true,
          message: `Repositório sincronizado com sucesso com origin/${branch}!`,
          details: pullOut.trim() || 'Tudo atualizado a partir do repositório remoto.',
          gitInfo: updatedGitInfo
        });
      } catch (err: any) {
        sendJSON(res, 200, {
          success: false,
          error: err.stderr || err.stdout || err.message || 'Erro ao sincronizar com git pull'
        });
      }
      return;
    }

    // API: Push commits to remote Git repository (Subir ao Repo)
    if (req.method === 'POST' && pathname === '/api/git/push') {
      try {
        const gitInfo = getGitInfo(true);
        if (gitInfo.behindCommits && gitInfo.behindCommits > 0) {
          sendJSON(res, 400, {
            success: false,
            needsPull: true,
            behindCommits: gitInfo.behindCommits,
            error: `O repositório remoto possui ${gitInfo.behindCommits} novo(s) commit(s). Clique em "Baixar do Repo" para sincronizar antes de subir.`
          });
          return;
        }

        const branch = gitInfo.currentBranch || 'main';
        const pushOut = execSync(`git push origin ${branch}`, { encoding: 'utf8', cwd: REPO_ROOT, timeout: 30000 });
        const updatedGitInfo = getGitInfo(true);
        sendJSON(res, 200, {
          success: true,
          message: `Git push realizado com sucesso para origin/${branch}!`,
          details: pushOut.trim() || 'Tudo atualizado no repositório remoto.',
          gitInfo: updatedGitInfo
        });
      } catch (err: any) {
        sendJSON(res, 200, {
          success: false,
          error: err.stderr || err.stdout || err.message || 'Erro ao executar git push'
        });
      }
      return;
    }

    // API: Reset uncommitted local changes (Reset Repo Local)
    if (req.method === 'POST' && pathname === '/api/git/reset') {
      try {
        let isDryRun = false;
        try {
          const body = await parseJSONBody(req);
          if (body && (body.dryRun === true || req.headers['x-dry-run'] === 'true')) {
            isDryRun = true;
          }
        } catch { }

        let checkoutOut = '';
        let cleanOut = '';
        if (!isDryRun) {
          checkoutOut = execSync('git checkout HEAD -- .', { encoding: 'utf8', cwd: REPO_ROOT });
          try {
            cleanOut = execSync('git clean -fd -e ".env" -e "*.local.json" -e "node_modules"', { encoding: 'utf8', cwd: REPO_ROOT });
          } catch { }
        } else {
          checkoutOut = 'Simulação: git checkout HEAD -- . (dryRun ativo)';
        }
        const updatedGitInfo = getGitInfo(true);
        sendJSON(res, 200, {
          success: true,
          message: isDryRun ? 'Simulação de reset concluída com sucesso!' : 'Repositório local resetado com sucesso para o estado limpo do commit atual!',
          details: (checkoutOut + (cleanOut ? '\n' + cleanOut : '')).trim() || 'Modificações locais descartadas com sucesso.',
          gitInfo: updatedGitInfo
        });
      } catch (err: any) {
        sendJSON(res, 200, {
          success: false,
          error: err.stderr || err.stdout || err.message || 'Erro ao resetar repositório local'
        });
      }
      return;
    }

    // API: Get all changed files in local repository (Changes screen - GitHub Desktop style)
    if (req.method === 'GET' && pathname === '/api/git/changes') {
      try {
        let currentBranch = 'main';
        try {
          currentBranch = execSync('git branch --show-current', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
        } catch { }

        let statusOut = '';
        try {
          statusOut = execSync('git status --porcelain=v1 -uall', { encoding: 'utf8', cwd: REPO_ROOT });
        } catch { }

        const files: Array<{
          path: string;
          name: string;
          directory: string;
          statusCode: string;
          status: 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed';
          statusLabel: string;
          statusIcon: string;
        }> = [];

        if (statusOut && statusOut.trim()) {
          const lines = statusOut.split('\n');
          for (const rawLine of lines) {
            const line = rawLine.trimEnd();
            if (!line || line.length < 3) continue;

            const code = line.substring(0, 2);
            let filePath = line.substring(3).trim();
            if (filePath.startsWith('"') && filePath.endsWith('"')) {
              filePath = filePath.substring(1, filePath.length - 1);
            }

            // Normaliza caminhos com barras padrão
            const normalizedPath = filePath.replace(/\\/g, '/');
            const fileName = path.basename(normalizedPath);
            const dirName = path.dirname(normalizedPath);

            let statusType: 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed' = 'modified';
            let statusLabel = 'Modificado';
            let statusIcon = '●';

            if (code.includes('?')) {
              statusType = 'untracked';
              statusLabel = 'Não rastreado';
              statusIcon = '+';
            } else if (code.includes('A')) {
              statusType = 'added';
              statusLabel = 'Adicionado';
              statusIcon = '+';
            } else if (code.includes('D')) {
              statusType = 'deleted';
              statusLabel = 'Excluído';
              statusIcon = '−';
            } else if (code.includes('R')) {
              statusType = 'renamed';
              statusLabel = 'Renomeado';
              statusIcon = '→';
            } else {
              statusType = 'modified';
              statusLabel = 'Modificado';
              statusIcon = '●';
            }

            files.push({
              path: normalizedPath,
              name: fileName,
              directory: dirName === '.' ? '' : dirName,
              statusCode: code.trim(),
              status: statusType,
              statusLabel,
              statusIcon
            });
          }
        }

        sendJSON(res, 200, {
          success: true,
          branch: currentBranch,
          total: files.length,
          files
        });
      } catch (err: any) {
        sendJSON(res, 500, {
          success: false,
          error: err.message || 'Erro ao listar alterações locais do Git'
        });
      }
      return;
    }

    // API: Get unified diff for a specific file
    if (req.method === 'GET' && pathname === '/api/git/diff') {
      const targetFile = parsedUrl.searchParams.get('file');
      if (!targetFile || !targetFile.trim()) {
        sendJSON(res, 400, { success: false, error: 'Parâmetro file é obrigatório.' });
        return;
      }

      // Previne path traversal
      const safeRelativePath = path.normalize(targetFile.trim()).replace(/^(\.\.[\/\\])+/, '');
      const fullPath = path.join(REPO_ROOT, safeRelativePath);

      try {
        let diffContent = '';
        let isUntracked = false;

        try {
          diffContent = execSync(`git diff HEAD -- "${safeRelativePath}"`, { encoding: 'utf8', cwd: REPO_ROOT });
        } catch { }

        if (!diffContent && fs.existsSync(fullPath)) {
          // Arquivo untracked ou recém-adicionado
          isUntracked = true;
          try {
            const rawContent = fs.readFileSync(fullPath, 'utf8');
            const lines = rawContent.split(/\r?\n/);
            diffContent = `--- /dev/null\n+++ b/${safeRelativePath}\n@@ -0,0 +1,${lines.length} @@\n` +
              lines.slice(0, 1000).map(l => `+${l}`).join('\n');
            if (lines.length > 1000) {
              diffContent += `\n... (+ ${lines.length - 1000} linhas omitidas)`;
            }
          } catch {
            diffContent = '[Arquivo binário ou não legível]';
          }
        }

        sendJSON(res, 200, {
          success: true,
          file: safeRelativePath,
          diff: diffContent || '(Nenhuma alteração de texto detectada)',
          isUntracked
        });
      } catch (err: any) {
        sendJSON(res, 500, {
          success: false,
          error: err.message || 'Erro ao gerar diff do arquivo'
        });
      }
      return;
    }

    // API: Get Git history of commits (History screen - GitHub Desktop style com setinha para unpushed)
    if (req.method === 'GET' && pathname === '/api/git/history') {
      try {
        let currentBranch = 'main';
        try {
          currentBranch = execSync('git branch --show-current', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
        } catch { }

        // Identifica commits unpushed (que precisam subir ao repositório)
        const unpushedHashes = new Set<string>();
        try {
          const unpushedOut = execSync('git rev-list "@{u}..HEAD"', { encoding: 'utf8', cwd: REPO_ROOT });
          if (unpushedOut && unpushedOut.trim()) {
            unpushedOut.trim().split('\n').forEach(h => {
              if (h.trim()) unpushedHashes.add(h.trim());
            });
          }
        } catch {
          try {
            const fallbackOut = execSync('git rev-list "origin/main..HEAD"', { encoding: 'utf8', cwd: REPO_ROOT });
            if (fallbackOut && fallbackOut.trim()) {
              fallbackOut.trim().split('\n').forEach(h => {
                if (h.trim()) unpushedHashes.add(h.trim());
              });
            }
          } catch { }
        }

        const limit = parseInt(parsedUrl.searchParams.get('limit') || '60', 10) || 60;
        const logOut = execSync(`git log -n ${limit} --format="%H|%h|%an|%ae|%ar|%ad|%s"`, { encoding: 'utf8', cwd: REPO_ROOT });

        const commits: Array<{
          hash: string;
          shortHash: string;
          author: string;
          email: string;
          relativeDate: string;
          fullDate: string;
          subject: string;
          isUnpushed: boolean;
        }> = [];

        if (logOut && logOut.trim()) {
          const lines = logOut.trim().split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            const parts = line.split('|');
            const hash = (parts[0] || '').trim();
            const shortHash = (parts[1] || '').trim() || hash.substring(0, 7);
            const author = (parts[2] || '').trim();
            const email = (parts[3] || '').trim();
            const relativeDate = (parts[4] || '').trim();
            const fullDate = (parts[5] || '').trim();
            const subject = parts.slice(6).join('|').trim();

            const isUnpushed = unpushedHashes.has(hash);

            commits.push({
              hash,
              shortHash,
              author,
              email,
              relativeDate,
              fullDate,
              subject,
              isUnpushed
            });
          }
        }

        sendJSON(res, 200, {
          success: true,
          currentBranch,
          unpushedCount: unpushedHashes.size,
          total: commits.length,
          commits
        });
      } catch (err: any) {
        sendJSON(res, 500, {
          success: false,
          error: err.message || 'Erro ao carregar histórico de commits do Git'
        });
      }
      return;
    }

    // API: Get details and stat of a single commit
    if (req.method === 'GET' && pathname === '/api/git/commit-details') {
      const commitHash = parsedUrl.searchParams.get('hash');
      if (!commitHash || !commitHash.trim()) {
        sendJSON(res, 400, { success: false, error: 'Parâmetro hash é obrigatório.' });
        return;
      }

      const safeHash = commitHash.trim().replace(/[^a-f0-9]/gi, '');
      if (safeHash.length < 4) {
        sendJSON(res, 400, { success: false, error: 'Hash de commit inválido.' });
        return;
      }

      try {
        const statOut = execSync(`git show --stat --format="%H|%h|%an|%ae|%ar|%ad|%s" "${safeHash}"`, { encoding: 'utf8', cwd: REPO_ROOT });
        const diffOut = execSync(`git show --format="" "${safeHash}"`, { encoding: 'utf8', cwd: REPO_ROOT });

        const firstLineEnd = statOut.indexOf('\n');
        const headerLine = firstLineEnd !== -1 ? statOut.substring(0, firstLineEnd) : statOut;
        const statBody = firstLineEnd !== -1 ? statOut.substring(firstLineEnd + 1).trim() : '';

        const parts = headerLine.split('|');
        const commitInfo = {
          hash: (parts[0] || safeHash).trim(),
          shortHash: (parts[1] || safeHash.substring(0, 7)).trim(),
          author: (parts[2] || '').trim(),
          email: (parts[3] || '').trim(),
          relativeDate: (parts[4] || '').trim(),
          fullDate: (parts[5] || '').trim(),
          subject: parts.slice(6).join('|').trim()
        };

        sendJSON(res, 200, {
          success: true,
          commit: commitInfo,
          stat: statBody,
          diff: diffOut.substring(0, 150000)
        });
      } catch (err: any) {
        sendJSON(res, 500, {
          success: false,
          error: err.message || 'Erro ao carregar detalhes do commit'
        });
      }
      return;
    }

    // API: Commit specific selected files
    if (req.method === 'POST' && pathname === '/api/git/commit-files') {
      const { files, message } = await parseJSONBody(req);
      if (!message || !message.trim()) {
        sendJSON(res, 400, { success: false, error: 'A mensagem do commit é obrigatória.' });
        return;
      }

      if (!Array.isArray(files) || files.length === 0) {
        sendJSON(res, 400, { success: false, error: 'Selecione ao menos um arquivo para commitar.' });
        return;
      }

      try {
        // Sanitiza caminhos
        const safePaths = files.map((f: string) => `"${f.replace(/"/g, '').replace(/\\/g, '/')}"`);
        execSync(`git add ${safePaths.join(' ')}`, { encoding: 'utf8', cwd: REPO_ROOT });
        const commitOut = execSync(`git commit -m "${message.trim().replace(/"/g, '\\"')}"`, { encoding: 'utf8', cwd: REPO_ROOT });

        const updatedGitInfo = getGitInfo(true);
        sendJSON(res, 200, {
          success: true,
          message: `Commit realizado com sucesso para ${files.length} arquivo(s)!`,
          details: commitOut.trim(),
          gitInfo: updatedGitInfo
        });
      } catch (err: any) {
        sendJSON(res, 200, {
          success: false,
          error: err.stderr || err.stdout || err.message || 'Erro ao executar commit dos arquivos selecionados'
        });
      }
      return;
    }

    // API: Discard local changes for a specific file
    if (req.method === 'POST' && pathname === '/api/git/discard-file') {
      const { file } = await parseJSONBody(req);
      if (!file || !file.trim()) {
        sendJSON(res, 400, { success: false, error: 'Parâmetro file é obrigatório.' });
        return;
      }

      const safeRelativePath = path.normalize(file.trim()).replace(/^(\.\.[\/\\])+/, '');
      const fullPath = path.join(REPO_ROOT, safeRelativePath);

      try {
        let discarded = false;
        try {
          execSync(`git checkout HEAD -- "${safeRelativePath}"`, { encoding: 'utf8', cwd: REPO_ROOT });
          discarded = true;
        } catch { }

        // Se o arquivo for untracked e ainda existir, remove
        if (!discarded && fs.existsSync(fullPath)) {
          if (fs.statSync(fullPath).isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(fullPath);
          }
        }

        const updatedGitInfo = getGitInfo(true);
        sendJSON(res, 200, {
          success: true,
          message: `Alterações de "${safeRelativePath}" descartadas com sucesso!`,
          gitInfo: updatedGitInfo
        });
      } catch (err: any) {
        sendJSON(res, 500, {
          success: false,
          error: err.message || 'Erro ao descartar alterações do arquivo'
        });
      }
      return;
    }

    // API: List features (Workspace local ou Git branch selecionada)
    if (req.method === 'GET' && pathname === '/api/features') {
      const selectedBranch = parsedUrl.searchParams.get('branch') || 'local';
      const gitInfo = getGitInfo();

      let features: any[] = [];
      let isGitBranch = false;
      let isEmptyBranch = false;

      if (selectedBranch === 'local' || selectedBranch === gitInfo.currentBranch) {
        features = getFeaturesData();
      } else {
        isGitBranch = true;
        features = getFeaturesFromGitBranch(selectedBranch);
        if (features.length === 0) {
          isEmptyBranch = true;
        }
      }

      sendJSON(res, 200, {
        success: true,
        features,
        directories: getDirectories(),
        branch: selectedBranch,
        currentBranch: gitInfo.currentBranch,
        isGitBranch,
        isEmptyBranch,
        gitInfo
      });
      return;
    }

    // API: Create new task
    if (req.method === 'POST' && pathname === '/api/tasks/create') {
      const { feature, taskId, text, assignee, status, directory } = await parseJSONBody(req);
      if (!text || !text.trim()) {
        sendJSON(res, 400, { success: false, error: 'O texto da tarefa é obrigatório.' });
        return;
      }

      const targetFeature = (feature && feature.trim()) ? feature.trim().toLowerCase().replace(/\s+/g, '-') : 'tarefas-gerais';
      const markDone = status === 'Concluído';
      const cleanAssignee = (assignee && assignee.trim() && assignee !== 'Todos') ? assignee.trim() : undefined;

      // Cria a tarefa de forma segura no OpenSpec Markdown prevenindo sobrescrita
      const result = createOpenSpecTask(targetFeature, taskId, markDone, status || 'Backlog', cleanAssignee, text.trim(), directory);
      if (!result.success) {
        sendJSON(res, 400, { success: false, error: result.error || 'Erro ao criar tarefa no OpenSpec.' });
        return;
      }

      const cleanDir = (directory && directory.trim() && directory.trim().toLowerCase() !== 'auto' && directory.trim().toLowerCase() !== 'geral') ? directory.trim().toLowerCase() : '';
      const dirTag = cleanDir ? `(${cleanDir}/) ` : '';
      const idPrefix = `**${result.taskId}** `;
      const assigneeSuffix = formatAssigneeTag(cleanAssignee);
      const firstLine = text.trim().split(/\r?\n/)[0];
      const cleanFirstLine = firstLine.replace(/\s*(\((@[^)]+)\)|\[(@[^\]]+)\]|\((@?[^)]+)\)\s*$|\[(@?[^\]]+)\]\s*)/gi, '').trimEnd().replace(/^\s*\([^)]+\/\)\s*/i, '');
      sendJSON(res, 200, {
        success: true,
        taskId: result.taskId,
        directory: cleanDir || undefined,
        message: `Tarefa ${idPrefix.trim()} criada em "${targetFeature}" (OpenSpec Git-Native)`,
        feature: targetFeature,
        command: `agent criar openspec/changes/${targetFeature}/tasks.md "${idPrefix}${dirTag}${cleanFirstLine}${assigneeSuffix}"`
      });
      return;
    }

    // API: Update / Alter task
    if (req.method === 'POST' && pathname === '/api/tasks/update') {
      const { feature, taskId, newTaskId, text, done, isCompleted, status, assignee, directory } = await parseJSONBody(req);
      if (!taskId) {
        sendJSON(res, 400, { success: false, error: 'taskId é obrigatório.' });
        return;
      }

      const targetFeature = (feature && feature.trim()) ? feature.trim() : 'tarefas-gerais';
      const markDone = done !== undefined ? Boolean(done) : (status === 'Concluído' || Boolean(isCompleted));
      const cleanAssignee = (assignee !== undefined && assignee !== null && assignee !== 'Todos' && assignee !== 'Equipe') ? assignee.trim() : (assignee === 'Todos' ? '' : undefined);

      // Sincroniza diretamente no OpenSpec Markdown (altera texto, prompt, status, assignee, id, directory)
      updateOpenSpecTask(targetFeature, taskId, markDone, status, cleanAssignee, text, newTaskId, directory);

      const effectiveId = (newTaskId && newTaskId.trim()) ? newTaskId.trim() : taskId;
      const displayStatus = markDone ? 'Concluído' : (status || 'Em Andamento');
      const displayAssignee = cleanAssignee || 'Todos';

      sendJSON(res, 200, {
        success: true,
        message: `Tarefa **${effectiveId}** alterada com sucesso em "${targetFeature}" (OpenSpec Git-Native)`,
        command: `agent atualizar "**${effectiveId}**" "${displayStatus}" "${displayAssignee}"`
      });
      return;
    }

    // API: Delete task
    if (req.method === 'POST' && pathname === '/api/tasks/delete') {
      const { feature, taskId } = await parseJSONBody(req);
      if (!taskId) {
        sendJSON(res, 400, { success: false, error: 'taskId é obrigatório.' });
        return;
      }

      const targetFeature = (feature && feature.trim()) ? feature.trim() : 'tarefas-gerais';
      const deleted = deleteOpenSpecTask(targetFeature, taskId);
      if (deleted) {
        sendJSON(res, 200, {
          success: true,
          message: `Tarefa **${taskId}** removida com sucesso de "${targetFeature}" (OpenSpec Git-Native)`
        });
      } else {
        sendJSON(res, 404, { success: false, error: `Tarefa **${taskId}** não encontrada em "${targetFeature}".` });
      }
      return;
    }

    // API: Assign task to member
    if (req.method === 'POST' && pathname === '/api/tasks/assign') {
      const { feature, taskId, assignee } = await parseJSONBody(req);
      if (!taskId) {
        sendJSON(res, 400, { success: false, error: 'taskId é obrigatório.' });
        return;
      }

      const targetFeature = (feature && feature.trim()) ? feature.trim() : 'tarefas-gerais';
      const cleanAssignee = (assignee && assignee.trim() && assignee !== 'Todos') ? assignee.trim() : '';
      updateOpenSpecTask(targetFeature, taskId, false, undefined, cleanAssignee);

      sendJSON(res, 200, {
        success: true,
        message: `Tarefa **${taskId}** atribuída a "${assignee || 'Todos'}" (OpenSpec Git-Native)`,
        command: `agent atribuir "**${taskId}**" "${assignee || 'Todos'}"`
      });
      return;
    }

    // API: Create new feature
    if (req.method === 'POST' && pathname === '/api/features/create') {
      const { featureId, title, summary, tasks, prompt: promptText, team, directory } = await parseJSONBody(req);
      if (!featureId || !featureId.trim()) {
        sendJSON(res, 400, { success: false, error: 'ID ou título da feature é obrigatório.' });
        return;
      }

      const cleanId = featureId
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\-]+/g, '-')
        .replace(/^-+|-+$/g, '') || `feature-${Date.now()}`;

      const featureDir = path.join(OPEN_SPEC_DIR, cleanId);

      if (fs.existsSync(featureDir)) {
        sendJSON(res, 400, { success: false, error: `A feature "${cleanId}" já existe no OpenSpec.` });
        return;
      }

      fs.mkdirSync(featureDir, { recursive: true });

      const author = (team && team.trim() && team !== 'Todos' && team !== 'dev-team') ? team.trim() : 'Todos';
      const dateStr = new Date().toISOString().split('T')[0];
      const finalSummary = summary || promptText || `Proposta de feature para ${title || cleanId}.`;
      const cleanDir = (directory && directory.trim() && directory.trim().toLowerCase() !== 'geral') ? directory.trim().toLowerCase() : '';
      const dirSection = cleanDir ? `\n\n## Directory\n${cleanDir}` : '';
      const proposalContent = `# Feature: ${cleanId}\n\n## Title\n${title || cleanId}\n\n## Summary\n${finalSummary}\n\n## Motivation\n${promptText || 'Atender à evolução contínua do Fowlgen Wars.'}${dirSection}\n\n## Status\n[CRIADO] por ${author} em ${dateStr}\n`;
      fs.writeFileSync(path.join(featureDir, 'proposal.md'), proposalContent, 'utf8');

      const initialTasks = Array.isArray(tasks) && tasks.length > 0 ? tasks : ['Definir planejamento', 'Implementar requisitos'];
      let tasksContent = `# Tasks for ${cleanId}\n\n## 1. Planejamento\n`;
      initialTasks.forEach((t: string, idx: number) => {
        tasksContent += `- [ ] **1.${idx + 1}** ${t}\n`;
      });
      fs.writeFileSync(path.join(featureDir, 'tasks.md'), tasksContent, 'utf8');

      sendJSON(res, 200, {
        success: true,
        featureId: cleanId,
        directory: cleanDir || 'geral',
        message: `Feature "${cleanId}" criada com sucesso!`,
        command: `agent criar openspec/changes/${cleanId}/proposal.md "# Feature: ${cleanId}"`
      });
      return;
    }

    // API: AI Generate feature (Proposta estruturada e tarefas 100% locais)
    if (req.method === 'POST' && pathname === '/api/features/ai-generate') {
      const { featureId, title, prompt: promptText, team, directory } = await parseJSONBody(req);
      if (!featureId || !featureId.trim()) {
        sendJSON(res, 400, { success: false, error: 'ID ou tema da feature é obrigatório.' });
        return;
      }

      const generated = generateSmartOpenSpec(featureId, title, promptText, team, directory);
      const featureDir = path.join(OPEN_SPEC_DIR, generated.cleanId);

      if (fs.existsSync(featureDir)) {
        sendJSON(res, 400, { success: false, error: `A feature "${generated.cleanId}" já existe no OpenSpec.` });
        return;
      }

      fs.mkdirSync(featureDir, { recursive: true });
      fs.writeFileSync(path.join(featureDir, 'proposal.md'), generated.proposal, 'utf8');
      fs.writeFileSync(path.join(featureDir, 'tasks.md'), generated.tasksMd, 'utf8');

      sendJSON(res, 200, {
        success: true,
        featureId: generated.cleanId,
        title: generated.cleanTitle,
        totalTasks: generated.totalTasks,
        message: `IA Local: Proposta e ${generated.totalTasks} tarefas geradas para "${generated.cleanTitle}"!`,
        command: `agent criar openspec/changes/${generated.cleanId}/proposal.md "# Feature: ${generated.cleanTitle}"`
      });
      return;
    }

    // API: Update proposal content directly from details modal
    if (req.method === 'POST' && pathname === '/api/features/update-proposal') {
      const { feature, content } = await parseJSONBody(req);
      if (!feature || content === undefined) {
        sendJSON(res, 400, { success: false, error: 'Feature e conteúdo da proposta são obrigatórios.' });
        return;
      }

      const featureDir = path.join(OPEN_SPEC_DIR, feature);
      if (!fs.existsSync(featureDir)) {
        sendJSON(res, 404, { success: false, error: `Feature "${feature}" não encontrada.` });
        return;
      }

      const proposalPath = path.join(featureDir, 'proposal.md');
      fs.writeFileSync(proposalPath, content, 'utf8');

      sendJSON(res, 200, {
        success: true,
        message: `Proposta de "${feature}" atualizada com sucesso no OpenSpec!`,
        command: `agent atualizar openspec/changes/${feature}/proposal.md`
      });
      return;
    }

    // API: Feature actions (validar, aprovar, rejeitar, deletar)
    if (req.method === 'POST' && pathname === '/api/features/action') {
      const { feature, action, assignee, reason } = await parseJSONBody(req);
      if (!feature || !action) {
        sendJSON(res, 400, { success: false, error: 'Feature e ação são obrigatórios.' });
        return;
      }

      const featureDir = path.join(OPEN_SPEC_DIR, feature);
      if (!fs.existsSync(featureDir)) {
        sendJSON(res, 404, { success: false, error: `Feature "${feature}" não encontrada.` });
        return;
      }

      const proposalPath = path.join(featureDir, 'proposal.md');
      let command = '';

      if (action === 'delete') {
        fs.rmSync(featureDir, { recursive: true, force: true });
        command = `agent deletar openspec/changes/${feature}`;
        sendJSON(res, 200, { success: true, message: `Feature "${feature}" deletada.`, command });
        return;
      }

      let proposalContent = fs.existsSync(proposalPath) ? fs.readFileSync(proposalPath, 'utf8') : `# Feature: ${feature}\n`;

      // Clear previous status section completely to avoid orphan lines and duplicate headers
      proposalContent = proposalContent.replace(/##\s*Status\s*[\s\S]*?(?=(?:\n##\s|$))/i, '').trim();

      if (action === 'approve') {
        const team = (assignee && assignee !== 'dev-team') ? assignee : 'Todos';
        proposalContent += `\n\n## Status\n[APROVADO] por ${team} em ${new Date().toISOString().split('T')[0]}\n`;
        command = `agent aprovar ideia "${feature}" "${team}"`;
      } else if (action === 'validate') {
        proposalContent += `\n\n## Status\n[VALIDADO] em ${new Date().toISOString().split('T')[0]}\n`;
        command = `agent validar ideia "${feature}"`;
      } else if (action === 'reject') {
        const mot = reason || 'Sem valor de negócio';
        proposalContent += `\n\n## Status\n[REJEITADO] Motivo: ${mot} em ${new Date().toISOString().split('T')[0]}\n`;
        command = `agent rejeitar ideia "${feature}" "${mot}"`;
      } else if (action === 'reset' || action === 'created') {
        proposalContent += `\n\n## Status\n[CRIADO] em ${new Date().toISOString().split('T')[0]}\n`;
        command = `agent resetar ideia "${feature}"`;
      }

      fs.writeFileSync(proposalPath, proposalContent, 'utf8');

      sendJSON(res, 200, {
        success: true,
        message: `Feature ${feature} atualizada com ação: ${action}`,
        command
      });
      return;
    }

    // API: Run GitHub Projects / Issues API Synchronization
    if (req.method === 'POST' && (pathname === '/api/github/sync' || pathname === '/api/sync/github')) {
      let config: any = {};
      if (fs.existsSync(CONFIG_PATH)) {
        try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch {}
      }
      const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';

      try {
        const cmd = `npm.cmd run sync`;
        const output = execSync(cmd, { cwd: KANBAN_ROOT, encoding: 'utf8', timeout: 35000 });
        sendJSON(res, 200, {
          success: true,
          message: 'Sincronização com GitHub Projects / Issues API executada com sucesso!',
          hasToken: Boolean(token),
          repo: config.github?.repo || 'mukasanray/Fowlgen-Wars-Project',
          projectId: config.projectId || null,
          output
        });
      } catch (err: any) {
        sendJSON(res, 200, {
          success: false,
          error: err.message,
          output: err.stdout || err.stderr
        });
      }
      return;
    }

    // API: Run script (dashboard, sync, verify, status)
    if (req.method === 'POST' && pathname === '/api/scripts/run') {
      const { script } = await parseJSONBody(req);
      const validScripts = ['dashboard', 'sync', 'verify', 'status', 'setup'];
      if (!validScripts.includes(script)) {
        sendJSON(res, 400, { success: false, error: 'Script inválido.' });
        return;
      }

      try {
        const cmd = `npm.cmd run ${script}`;
        const output = execSync(cmd, { cwd: KANBAN_ROOT, encoding: 'utf8', timeout: 15000 });
        sendJSON(res, 200, { success: true, script, output });
      } catch (err: any) {
        sendJSON(res, 200, {
          success: false,
          script,
          output: err.stdout || err.stderr || err.message
        });
      }
      return;
    }

    // API: Export Sprint Report as CSV (Planilha Excel/Google Sheets)
    if (req.method === 'GET' && (pathname === '/api/reports/sprint/csv' || pathname === '/api/reports/csv')) {
      const selectedBranch = parsedUrl.searchParams.get('branch') || 'local';
      const gitInfo = getGitInfo();
      let features: any[] = [];
      if (selectedBranch === 'local' || selectedBranch === gitInfo.currentBranch) {
        features = getFeaturesData();
      } else {
        features = getFeaturesFromGitBranch(selectedBranch);
      }

      const csvContent = generateSprintCsv(features);
      const today = new Date().toISOString().slice(0, 10);
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sprint-relatorio-${today}.csv"`
      });
      res.end(csvContent);
      return;
    }

    // API: Export Sprint Report as Printable PDF / HTML
    if (req.method === 'GET' && (pathname === '/api/reports/sprint/pdf' || pathname === '/api/reports/sprint/print' || pathname === '/api/reports/print')) {
      const selectedBranch = parsedUrl.searchParams.get('branch') || 'local';
      const gitInfo = getGitInfo();
      let features: any[] = [];
      if (selectedBranch === 'local' || selectedBranch === gitInfo.currentBranch) {
        features = getFeaturesData();
      } else {
        features = getFeaturesFromGitBranch(selectedBranch);
      }

      const printHtml = generateSprintPrintableHtml(features, selectedBranch);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      res.end(printHtml);
      return;
    }

    // API: Export Official Executive PDF Report (padrão Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.pdf)
    if (req.method === 'GET' && pathname === '/api/reports/official-pdf') {
      const member = parsedUrl.searchParams.get('member') || 'all';
      const isDownload = parsedUrl.searchParams.get('download') === 'true';
      const docsDir = path.join(KANBAN_ROOT, 'docs');
      if (!fs.existsSync(docsDir)) {
        try { fs.mkdirSync(docsDir, { recursive: true }); } catch {}
      }
      const tempPdfName = `relatorio-oficial-${member.replace(/[^a-zA-Z0-9_-]/g, '_')}-${Date.now()}.pdf`;
      const tempOut = path.join(docsDir, tempPdfName);
      const scriptPath = path.join(KANBAN_ROOT, 'src/scripts/generate_official_report_pdf.py');

      try {
        const cmd = `python "${scriptPath}" --member "${member}" --output "${tempOut}"`;
        execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf8', timeout: 35000 });

        if (fs.existsSync(tempOut)) {
          const pdfData = fs.readFileSync(tempOut);
          try { fs.unlinkSync(tempOut); } catch {}

          const filename = member === 'all'
            ? 'Relatorio_Oficial_Equipe_Fowlgen_Wars.pdf'
            : `Relatorio_Oficial_${member.charAt(0).toUpperCase() + member.slice(1)}_Fowlgen_Wars.pdf`;

          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="${filename}"`
          });
          res.end(pdfData);
          return;
        } else {
          sendJSON(res, 500, { success: false, error: 'O arquivo PDF não foi gerado pelo script Python.' });
          return;
        }
      } catch (err: any) {
        console.error('Erro ao gerar PDF oficial:', err);
        sendJSON(res, 500, {
          success: false,
          error: 'Falha ao executar o script Python do relatório oficial.',
          details: err.stdout || err.stderr || err.message
        });
        return;
      }
    }

    // API: Get dashboard data and html/markdown
    if (req.method === 'GET' && (pathname === '/api/dashboard' || pathname === '/api/dashboard/data')) {
      const htmlPath = path.join(KANBAN_ROOT, 'docs/kanban-dashboard.html');
      const mdPath = path.join(KANBAN_ROOT, 'docs/kanban-dashboard.md');

      if (!fs.existsSync(htmlPath)) {
        try {
          execSync('npm.cmd run dashboard', { cwd: KANBAN_ROOT, stdio: 'ignore' });
        } catch { }
      }

      const htmlContent = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
      const mdContent = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';

      sendJSON(res, 200, {
        success: true,
        htmlUrl: '/dashboard',
        html: htmlContent,
        markdown: mdContent,
        hasDashboard: Boolean(htmlContent)
      });
      return;
    }

    // Serve Standalone Dashboard HTML
    if (req.method === 'GET' && (pathname === '/dashboard' || pathname === '/kanban-dashboard.html')) {
      const htmlPath = path.join(KANBAN_ROOT, 'docs/kanban-dashboard.html');
      if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(htmlPath));
        return;
      }
    }

    // Serve Static Files from kanban/src/web
    let filePath = path.join(WEB_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(WEB_DIR, 'index.html');
    }

    const ext = path.extname(filePath);
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);

  } catch (error: any) {
    console.error('Server error:', error);
    sendJSON(res, 500, { success: false, error: error.message || 'Erro interno no servidor' });
  }
});

function openBrowser(targetUrl: string): void {
  try {
    if (process.platform === 'win32') {
      execSync(`start "" "${targetUrl}"`, { stdio: 'ignore', shell: 'cmd.exe' });
    } else if (process.platform === 'darwin') {
      execSync(`open "${targetUrl}"`, { stdio: 'ignore' });
    } else {
      execSync(`xdg-open "${targetUrl}"`, { stdio: 'ignore' });
    }
  } catch {
    console.log(`💡 Para abrir manualmente no navegador: ${targetUrl}`);
  }
}

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    const url = `http://localhost:${PORT}`;
    console.log(`\n⚠️  A porta ${PORT} já está em uso.`);
    console.log(`📡 O servidor Kanban já pode estar rodando em: ${url}`);
    if (process.env.OPEN_BROWSER === 'true' || process.argv.includes('--open')) {
      console.log(`🌐 Abrindo navegador em: ${url}\n`);
      openBrowser(url);
    }
    console.log(`💡 Pressione Ctrl+C para voltar ao menu ou encerrar.`);
  } else {
    console.error('Erro no servidor:', err);
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n🎮 Fowlgen Wars - OpenSpec Control Center & Kanban Studio`);
  console.log(`📡 Servidor rodando em: ${url}`);
  console.log(`💡 Pressione Ctrl+C para encerrar.`);

  if (process.env.OPEN_BROWSER === 'true' || process.argv.includes('--open')) {
    console.log(`🌐 Abrindo navegador em: ${url}\n`);
    openBrowser(url);
  }
});

export { server };
