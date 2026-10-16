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
}

function getMembers(): Member[] {
  if (fs.existsSync(MEMBERS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MEMBERS_PATH, 'utf8'));
    } catch {}
  }
  return [
    { id: 'marcos', name: 'Marcos', role: 'Unity / C# Developer', github: 'mukasanray', avatar: '👤', color: '#38bdf8' },
    { id: 'samuel', name: 'Samuel', role: 'Game Designer & Lead', github: 'samuelmenon', avatar: '👑', color: '#f59e0b' },
    { id: 'todos', name: 'Todos', role: 'Toda a Equipe', github: 'todos', avatar: '👥', color: '#10b981' },
    { id: 'ia', name: 'Agente IA', role: 'Automação & Copilot', github: 'antigravity-ai', avatar: '🤖', color: '#a855f7' }
  ];
}

function saveMembers(members: Member[]) {
  fs.writeFileSync(MEMBERS_PATH, JSON.stringify(members, null, 2), 'utf8');
}

function updateOpenSpecTask(featureId: string, taskNumber: string, isCompleted: boolean, status?: string, assignee?: string, text?: string): void {
  const tasksPath = path.join(OPEN_SPEC_DIR, featureId, 'tasks.md');
  if (fs.existsSync(tasksPath)) {
    const content = fs.readFileSync(tasksPath, 'utf8');
    const lines = content.split('\n');
    let found = false;

    const newLines = lines.map(line => {
      if (line.includes(`**${taskNumber}**`)) {
        found = true;
        const mark = isCompleted ? '[x]' : '[ ]';
        let updated = line.replace(/\[[ xX]\]/, mark);
        if (assignee && !updated.includes(assignee)) {
          updated += ` (${assignee})`;
        }
        return updated;
      }
      return line;
    });

    if (!found && text) {
      newLines.push(`- [${isCompleted ? 'x' : ' '}] **${taskNumber}** ${text}${assignee ? ` (${assignee})` : ''}`);
    }

    fs.writeFileSync(tasksPath, newLines.join('\n'), 'utf8');
  }
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

function getGitInfo() {
  try {
    let currentBranch = 'main';
    try {
      currentBranch = execSync('git branch --show-current', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
    } catch {}

    let branches: string[] = [];
    try {
      const branchOut = execSync('git branch -a', { encoding: 'utf8', cwd: REPO_ROOT });
      branches = Array.from(new Set(
        branchOut
          .split('\n')
          .map(b => b.replace(/^\*?\s+/, '').replace(/^remotes\//, '').trim())
          .filter(b => b && !b.includes('->'))
      ));
    } catch {}

    let modifiedFiles: string[] = [];
    try {
      const statusOut = execSync('git status -s openspec/changes/', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
      if (statusOut) {
        modifiedFiles = statusOut.split('\n').map(l => l.trim());
      }
    } catch {}

    let lastCommit = '';
    try {
      lastCommit = execSync('git log -1 --format="%h - %s (%cr)"', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
    } catch {}

    let gitUser = { name: '', email: '' };
    try {
      gitUser.name = execSync('git config user.name', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
    } catch {}
    try {
      gitUser.email = execSync('git config user.email', { encoding: 'utf8', cwd: REPO_ROOT }).trim();
    } catch {}

    const members = getMembers();
    let detectedMember: any = null;

    // 1. Prioridade 1: Arquivo local de identidade (.gitignore - 100% privado, só nesta máquina)
    const localIdentityPath = path.join(__dirname, '../config/identity.local.json');
    if (fs.existsSync(localIdentityPath)) {
      try {
        const localData = JSON.parse(fs.readFileSync(localIdentityPath, 'utf8'));
        if (localData && localData.memberId) {
          detectedMember = members.find(m => m.id === localData.memberId) || null;
        }
      } catch {}
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

          const teamMatch = proposal.match(/\[(APROVADO|CRIADO|VALIDADO|REJEITADO)\]\s+por\s+([^\s\n]+)/i);
          if (teamMatch) {
            ideaAssignee = teamMatch[2].trim();
            if (ideaAssignee === 'dev-team') ideaAssignee = 'Todos';
            assigneesSet.add(ideaAssignee);
          }
        } catch {}

        let tasks: Array<{ id: string; text: string; done: boolean; assignee?: string; raw: string; section: string }> = [];
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

              const assigneeMatch = text.match(/@([\w-]+)/i) || text.match(/\(([^)]+)\)\s*$/i) || text.match(/\[([\w-]+)\]\s*$/i);
              let taskAssignee = assigneeMatch ? assigneeMatch[1].trim() : '';
              if (!taskAssignee && ideaAssignee && ideaAssignee !== 'Todos' && ideaAssignee !== 'dev-team') {
                taskAssignee = ideaAssignee;
              }
              if (taskAssignee) assigneesSet.add(taskAssignee);

              tasks.push({
                id: taskId,
                text,
                done,
                assignee: taskAssignee,
                raw: tl.trim(),
                section: currentSection
              });
            }
          }
        } catch {}

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
  } catch {}

  const entries = fs.readdirSync(OPEN_SPEC_DIR, { withFileTypes: true });
  const featureDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

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

      const teamMatch = proposal.match(/\[(APROVADO|CRIADO|VALIDADO|REJEITADO)\]\s+por\s+([^\s\n]+)/i);
      if (teamMatch) {
        ideaAssignee = teamMatch[2].trim();
        if (ideaAssignee === 'dev-team') ideaAssignee = 'Todos';
        assigneesSet.add(ideaAssignee);
      }
    }

    const tasks: Array<{ id: string; text: string; done: boolean; assignee?: string; raw: string; section: string }> = [];
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

          const assigneeMatch = text.match(/@([\w-]+)/i) || text.match(/\(([^)]+)\)\s*$/i) || text.match(/\[([\w-]+)\]\s*$/i);
          let taskAssignee = assigneeMatch ? assigneeMatch[1].trim() : '';
          if (!taskAssignee && ideaAssignee && ideaAssignee !== 'Todos' && ideaAssignee !== 'dev-team') {
            taskAssignee = ideaAssignee;
          }
          if (taskAssignee) assigneesSet.add(taskAssignee);

          tasks.push({
            id: taskId,
            text,
            done,
            assignee: taskAssignee,
            raw: line.trim(),
            section: currentSection
          });
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

function generateSmartOpenSpec(featureId: string, title?: string, promptText?: string) {
  const cleanId = featureId.trim().toLowerCase().replace(/\s+/g, '-');
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
    } catch {}
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

  const proposal = `# Feature: ${cleanId}

## Title
${cleanTitle}

## Summary
Implementação da funcionalidade "${cleanTitle}" para o Fowlgen Wars com escopo delimitado, componentes modulares e verificação em Arena_Clean.

## Motivation
${motivation}

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
[CRIADO]
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

      const newMember = {
        id: cleanId,
        name: cleanName,
        role: role && role.trim() ? role.trim() : 'Membro da Equipe',
        email: email && email.trim() ? email.trim().toLowerCase() : '',
        github: github && github.trim() ? github.trim().replace(/^@/, '') : '',
        avatar: avatar && avatar.trim() ? avatar.trim() : '👤',
        color: color && color.trim() ? color.trim() : '#38bdf8'
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
        color: newColor
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

      const localIdentityPath = path.join(__dirname, '../config/identity.local.json');
      fs.writeFileSync(localIdentityPath, JSON.stringify({ memberId: targetMember.id }, null, 2), 'utf8');

      try {
        execSync(`git config user.name "${targetMember.name}"`, { cwd: REPO_ROOT });
      } catch {}

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

    // API: Get GitHub and project config + Database info
    if (req.method === 'GET' && pathname === '/api/config') {
      let configData: any = {};
      if (fs.existsSync(CONFIG_PATH)) {
        try {
          configData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        } catch {}
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
      const gitInfo = getGitInfo();
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
      const { feature, taskId, text } = await parseJSONBody(req);
      if (!feature || !text) {
        sendJSON(res, 400, { success: false, error: 'Feature e texto são obrigatórios.' });
        return;
      }

      // Sincroniza diretamente no OpenSpec Markdown
      updateOpenSpecTask(feature, taskId || '1.0', false, 'Backlog', 'Marcos', text);

      const idPrefix = taskId ? `**${taskId}** ` : '';
      sendJSON(res, 200, {
        success: true,
        message: `Tarefa criada em ${feature} (OpenSpec Git-Native)`,
        command: `agent criar openspec/changes/${feature}/tasks.md "${idPrefix}${text}"`
      });
      return;
    }

    // API: Update task status
    if (req.method === 'POST' && pathname === '/api/tasks/update') {
      const { feature, taskId, done, isCompleted, status, assignee } = await parseJSONBody(req);
      if (!feature || !taskId) {
        sendJSON(res, 400, { success: false, error: 'Feature e taskId são obrigatórios.' });
        return;
      }

      const markDone = done !== undefined ? Boolean(done) : Boolean(isCompleted);

      // Sincroniza diretamente no OpenSpec Markdown
      updateOpenSpecTask(feature, taskId, markDone, status, assignee);

      const displayStatus = markDone ? 'Concluído' : (status || 'Em Andamento');
      const displayAssignee = assignee || 'Marcos';

      sendJSON(res, 200, {
        success: true,
        message: `Tarefa **${taskId}** atualizada para ${displayStatus} (OpenSpec Git-Native)`,
        command: `agent atualizar "**${taskId}**" "${displayStatus}" "${displayAssignee}"`
      });
      return;
    }

    // API: Create new feature
    if (req.method === 'POST' && pathname === '/api/features/create') {
      const { featureId, title, summary, tasks, prompt: promptText } = await parseJSONBody(req);
      if (!featureId) {
        sendJSON(res, 400, { success: false, error: 'ID da feature é obrigatório.' });
        return;
      }

      const cleanId = featureId.trim().toLowerCase().replace(/\s+/g, '-');
      const featureDir = path.join(OPEN_SPEC_DIR, cleanId);

      if (fs.existsSync(featureDir)) {
        sendJSON(res, 400, { success: false, error: `A feature "${cleanId}" já existe.` });
        return;
      }

      fs.mkdirSync(featureDir, { recursive: true });

      const finalSummary = summary || promptText || 'Proposta de feature para Fowlgen Wars.';
      const proposalContent = `# Feature: ${cleanId}\n\n## Title\n${title || cleanId}\n\n## Summary\n${finalSummary}\n\n## Motivation\n${promptText || 'Atender à evolução contínua do Fowlgen Wars.'}\n\n## Status\n[CRIADO]\n`;
      fs.writeFileSync(path.join(featureDir, 'proposal.md'), proposalContent, 'utf8');

      const initialTasks = Array.isArray(tasks) && tasks.length > 0 ? tasks : ['Definir planejamento', 'Implementar requisitos'];
      let tasksContent = `# Tasks for ${cleanId}\n\n## 1. Planejamento\n`;
      initialTasks.forEach((t: string, idx: number) => {
        tasksContent += `- [ ] **1.${idx + 1}** ${t}\n`;
      });
      fs.writeFileSync(path.join(featureDir, 'tasks.md'), tasksContent, 'utf8');

      sendJSON(res, 200, {
        success: true,
        message: `Feature ${cleanId} criada com sucesso!`,
        command: `agent criar openspec/changes/${cleanId}/proposal.md "# Feature: ${cleanId}"`
      });
      return;
    }

    // API: AI Generate feature (Proposta estruturada e tarefas 100% locais)
    if (req.method === 'POST' && pathname === '/api/features/ai-generate') {
      const { featureId, title, prompt: promptText } = await parseJSONBody(req);
      if (!featureId) {
        sendJSON(res, 400, { success: false, error: 'ID ou tema da feature é obrigatório.' });
        return;
      }

      const generated = generateSmartOpenSpec(featureId, title, promptText);
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

      // Clear previous status badges
      proposalContent = proposalContent.replace(/\[(APROVADO|VALIDADO|REJEITADO|CRIADO)[^\]]*\]/g, '').trim();

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

    // API: Get dashboard data and html/markdown
    if (req.method === 'GET' && (pathname === '/api/dashboard' || pathname === '/api/dashboard/data')) {
      const htmlPath = path.join(KANBAN_ROOT, 'docs/kanban-dashboard.html');
      const mdPath = path.join(KANBAN_ROOT, 'docs/kanban-dashboard.md');

      if (!fs.existsSync(htmlPath)) {
        try {
          execSync('npm.cmd run dashboard', { cwd: KANBAN_ROOT, stdio: 'ignore' });
        } catch {}
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
