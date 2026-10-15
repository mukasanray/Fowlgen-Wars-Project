import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { testConnection, getDbConfig, closePool } from '../database/db.ts';
import { SyncService } from '../database/sync-service.ts';
import { initDatabase } from '../database/init-db.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const syncService = new SyncService();

const REPO_ROOT = path.resolve(__dirname, '../../../');
const OPEN_SPEC_DIR = path.resolve(__dirname, '../../../openspec/changes');
const WEB_DIR = path.resolve(__dirname, '../web');
const KANBAN_ROOT = path.resolve(__dirname, '../../');
const ENV_PATH = path.join(KANBAN_ROOT, '.env');
const CONFIG_PATH = path.join(KANBAN_ROOT, 'src/config/kanban-config.json');

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

    return {
      currentBranch,
      branches,
      uncommittedChanges: modifiedFiles.length > 0,
      modifiedFiles,
      lastCommit
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
        try {
          proposal = execSync(`git show ${branch}:openspec/changes/${featureName}/proposal.md`, { encoding: 'utf8', cwd: REPO_ROOT, stdio: ['pipe', 'pipe', 'ignore'] });
          if (proposal.includes('[APROVADO]')) status = 'Aprovado';
          else if (proposal.includes('[VALIDADO]')) status = 'Validado';
          else if (proposal.includes('[REJEITADO]')) status = 'Rejeitado';
        } catch {}

        let tasks: Array<{ id: string; text: string; done: boolean; raw: string; section: string }> = [];
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
              tasks.push({
                id: taskId,
                text,
                done,
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

        features.push({
          name: featureName,
          status,
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

    if (fs.existsSync(proposalPath)) {
      proposal = fs.readFileSync(proposalPath, 'utf8');
      if (proposal.includes('[APROVADO]')) {
        status = 'Aprovado';
      } else if (proposal.includes('[VALIDADO]')) {
        status = 'Validado';
      } else if (proposal.includes('[REJEITADO]')) {
        status = 'Rejeitado';
      }
    }

    const tasks: Array<{ id: string; text: string; done: boolean; raw: string; section: string }> = [];
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
          tasks.push({
            id: taskId,
            text,
            done,
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

    return {
      name,
      status,
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

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
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
      const dbCfg = getDbConfig();

      sendJSON(res, 200, {
        success: true,
        config: {
          repo: configData.github?.repo || 'mukasanray/Fowlgen-Wars-Project',
          branch: configData.github?.branch || 'main',
          projectId: configData.projectId || '',
          assignee: configData.assignee || 'Samuel Menon Ramos',
          hasToken: Boolean(token),
          tokenMasked: maskedToken,
          database: {
            host: dbCfg.host,
            port: dbCfg.port,
            user: dbCfg.user,
            database: dbCfg.database,
            hasPassword: Boolean(dbCfg.password)
          }
        }
      });
      return;
    }

    // API: Save GitHub config, token and Database credentials
    if (req.method === 'POST' && pathname === '/api/config') {
      const { token, repo, projectId, assignee, dbHost, dbPort, dbUser, dbPassword, dbDatabase } = await parseJSONBody(req);

      if (token && token.trim()) {
        const cleanToken = token.trim();
        process.env.GH_TOKEN = cleanToken;
        process.env.GITHUB_TOKEN = cleanToken;
      }

      if (dbHost) process.env.POSTGRES_HOST = dbHost.trim();
      if (dbPort) process.env.POSTGRES_PORT = String(dbPort).trim();
      if (dbUser) process.env.POSTGRES_USER = dbUser.trim();
      if (dbPassword !== undefined && dbPassword !== '') process.env.POSTGRES_PASSWORD = dbPassword;
      if (dbDatabase) process.env.POSTGRES_DB = dbDatabase.trim();

      // Grava no .env
      const currentToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
      const envContent = [
        `# Fowlgen Wars - Kanban & OpenSpec Environment`,
        `GH_TOKEN=${currentToken}`,
        `GITHUB_TOKEN=${currentToken}`,
        ``,
        `# PostgreSQL Database (Produção / install.sh)`,
        `POSTGRES_HOST=${process.env.POSTGRES_HOST || 'localhost'}`,
        `POSTGRES_PORT=${process.env.POSTGRES_PORT || '5432'}`,
        `POSTGRES_USER=${process.env.POSTGRES_USER || 'fowlgen'}`,
        `POSTGRES_PASSWORD=${process.env.POSTGRES_PASSWORD || 'fowlgen_password'}`,
        `POSTGRES_DB=${process.env.POSTGRES_DB || 'fowlgen_kanban'}`,
        ``
      ].join('\n');
      fs.writeFileSync(ENV_PATH, envContent, 'utf8');

      // Fecha pool existente para recarregar com novas credenciais
      await closePool();

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
        message: 'Configurações de GitHub e Banco PostgreSQL salvas com sucesso!'
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
        const ghRes = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Fowlgen-Wars-Kanban-Studio',
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (ghRes.ok) {
          const user = await ghRes.json();
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

    // API: Test PostgreSQL Connection
    if (req.method === 'POST' && pathname === '/api/database/test') {
      const body = await parseJSONBody(req);
      const conn = await testConnection({
        host: body.host || process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(body.port || process.env.POSTGRES_PORT || '5432', 10),
        user: body.user || process.env.POSTGRES_USER || 'fowlgen',
        password: body.password !== undefined ? body.password : (process.env.POSTGRES_PASSWORD || 'fowlgen_password'),
        database: body.database || process.env.POSTGRES_DB || 'fowlgen_kanban'
      });
      sendJSON(res, 200, {
        success: conn.connected,
        connected: conn.connected,
        database: conn.database,
        error: conn.error
      });
      return;
    }

    // API: Database status
    if (req.method === 'GET' && pathname === '/api/database/status') {
      const cfg = getDbConfig();
      const conn = await testConnection();
      sendJSON(res, 200, {
        success: true,
        connected: conn.connected,
        database: conn.database || cfg.database,
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        error: conn.error
      });
      return;
    }

    // API: Initialize database
    if (req.method === 'POST' && pathname === '/api/database/init') {
      const result = await initDatabase();
      sendJSON(res, 200, result);
      return;
    }

    // API: Sync OpenSpec <-> PostgreSQL
    if (req.method === 'POST' && pathname === '/api/database/sync') {
      const result = await syncService.importFromOpenSpec();
      sendJSON(res, 200, {
        success: true,
        message: `Sincronização concluída: ${result.importedFeatures} features e ${result.importedTasks} tarefas no PostgreSQL.`,
        data: result
      });
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

      // Sincroniza no PostgreSQL e OpenSpec
      await syncService.syncTask(feature, taskId || '1.0', false, 'Backlog', 'Equipe', text);

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
      const { feature, taskId, done, status, assignee } = await parseJSONBody(req);
      if (!feature || !taskId) {
        sendJSON(res, 400, { success: false, error: 'Feature e taskId são obrigatórios.' });
        return;
      }

      // Sincroniza no OpenSpec (e banco se ativo)
      await syncService.syncTask(feature, taskId, Boolean(done), status, assignee);

      const displayStatus = done ? 'Concluído' : (status || 'Em Andamento');
      const displayAssignee = assignee || 'Equipe';

      sendJSON(res, 200, {
        success: true,
        message: `Tarefa **${taskId}** atualizada para ${displayStatus} (OpenSpec Git-Native)`,
        command: `agent atualizar "**${taskId}**" "${displayStatus}" "${displayAssignee}"`
      });
      return;
    }

    // API: Create new feature
    if (req.method === 'POST' && pathname === '/api/features/create') {
      const { featureId, title, summary, tasks } = await parseJSONBody(req);
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

      const proposalContent = `# Feature: ${cleanId}\n\n## Title\n${title || cleanId}\n\n## Summary\n${summary || 'Proposta de feature para Fowlgen Wars.'}\n\n## Status\n[CRIADO]\n`;
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
        const team = assignee || 'dev-team';
        proposalContent += `\n\n## Status\n[APROVADO] por ${team} em ${new Date().toISOString().split('T')[0]}\n`;
        command = `agent aprovar ideia "${feature}" "${team}"`;
      } else if (action === 'validate') {
        proposalContent += `\n\n## Status\n[VALIDADO] em ${new Date().toISOString().split('T')[0]}\n`;
        command = `agent validar ideia "${feature}"`;
      } else if (action === 'reject') {
        const mot = reason || 'Sem valor de negócio';
        proposalContent += `\n\n## Status\n[REJEITADO] Motivo: ${mot} em ${new Date().toISOString().split('T')[0]}\n`;
        command = `agent rejeitar ideia "${feature}" "${mot}"`;
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

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n🎮 Fowlgen Wars - OpenSpec Control Center & Kanban Studio`);
  console.log(`📡 Servidor rodando em: ${url}`);
  console.log(`💡 Pressione Ctrl+C para encerrar.`);
});

export { server };
