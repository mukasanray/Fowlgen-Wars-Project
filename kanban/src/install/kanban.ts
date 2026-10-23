import { spawn, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { GenerateDashboard } from '../scripts/generate-dashboard';
import { log } from './logger';
import { describePortOwner, httpRequest, isPortOpen, tryHttpRequest, waitFor } from './net';
import type { CheckResult } from './types';

export const RUNTIME_DIRS = ['docs', 'logs', 'backups'] as const;

export interface KanbanProbe {
  reachable: boolean;
  ours: boolean;
  status: number;
  detail: string;
}

export async function probeKanban(port: number): Promise<KanbanProbe> {
  const response = await tryHttpRequest(`http://127.0.0.1:${port}/api/config`, {}, 3000);
  if (!response) {
    return { reachable: false, ours: false, status: 0, detail: `sem resposta em http://localhost:${port}` };
  }
  if (response.status === 200) {
    try {
      const parsed = JSON.parse(response.body) as { success?: boolean; config?: unknown };
      if (parsed.success === true && parsed.config) {
        return { reachable: true, ours: true, status: 200, detail: 'Kanban Studio respondeu em /api/config' };
      }
    } catch {
      // Porta respondeu, mas não é o Kanban.
    }
  }
  return {
    reachable: true,
    ours: false,
    status: response.status,
    detail: `porta ${port} respondeu HTTP ${response.status}, mas não é o Kanban Studio`
  };
}

export function prepareRuntimeDirs(projectRoot: string, options: { checkOnly: boolean }): CheckResult {
  const startedAt = Date.now();
  const created: string[] = [];
  const existing: string[] = [];

  for (const dir of RUNTIME_DIRS) {
    const fullPath = path.join(projectRoot, dir);
    if (fs.existsSync(fullPath)) {
      existing.push(dir);
      continue;
    }
    if (!options.checkOnly) fs.mkdirSync(fullPath, { recursive: true });
    created.push(dir);
  }

  const syncLog = path.join(projectRoot, 'logs/sync-log.json');
  if (!options.checkOnly && !fs.existsSync(syncLog)) fs.writeFileSync(syncLog, '[]\n', 'utf8');

  const status: CheckResult['status'] = options.checkOnly && created.length > 0 ? 'warning' : 'ok';
  return {
    id: 'runtime-dirs',
    title: 'Estrutura de pastas',
    status,
    detail: [
      created.length > 0 ? `${options.checkOnly ? 'ausentes' : 'criados'}: ${created.join(', ')}` : '',
      existing.length > 0 ? `existentes: ${existing.join(', ')}` : ''
    ].filter(Boolean).join(' · ') || 'nada a fazer',
    remediation: status === 'warning' ? 'Rode "npm run setup" para criar as pastas.' : undefined,
    durationMs: Date.now() - startedAt
  };
}

const GITIGNORE_ENTRIES = [
  '# Kanban Dashboard',
  'kanban/docs/kanban-dashboard.*',
  'kanban/docs/kanban-dashboard.html',
  '# Kanban runtime (logs, relatórios e backups)',
  'kanban/logs/',
  'kanban/backups/'
];

/**
 * Garante as entradas do Kanban no .gitignore da raiz sem duplicar linhas
 * e sem remover regras existentes.
 */
export function ensureGitignore(projectRoot: string, options: { checkOnly: boolean }): CheckResult {
  const startedAt = Date.now();
  const gitignorePath = path.join(projectRoot, '..', '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    return {
      id: 'gitignore',
      title: '.gitignore',
      status: 'warning',
      detail: '.gitignore da raiz não encontrado',
      remediation: 'Crie o .gitignore na raiz do repositório.',
      durationMs: Date.now() - startedAt
    };
  }

  const content = fs.readFileSync(gitignorePath, 'utf8');
  const lines = new Set(content.split(/\r?\n/).map((line) => line.trim()));
  const missing = GITIGNORE_ENTRIES.filter((entry) => !entry.startsWith('#') && !lines.has(entry));

  if (missing.length === 0) {
    return {
      id: 'gitignore',
      title: '.gitignore',
      status: 'ok',
      detail: 'regras do Kanban já presentes',
      durationMs: Date.now() - startedAt
    };
  }

  if (!options.checkOnly) {
    const suffix = `${content.endsWith('\n') ? '' : '\n'}\n# Kanban runtime\n${missing.join('\n')}\n`;
    fs.writeFileSync(gitignorePath, `${content}${suffix}`, 'utf8');
  }

  return {
    id: 'gitignore',
    title: '.gitignore',
    status: options.checkOnly ? 'warning' : 'ok',
    detail: options.checkOnly ? `regras ausentes: ${missing.join(', ')}` : `regras adicionadas: ${missing.join(', ')}`,
    remediation: options.checkOnly ? 'Rode "npm run setup" para atualizar o .gitignore.' : undefined,
    durationMs: Date.now() - startedAt
  };
}

export async function generateDashboard(projectRoot: string): Promise<CheckResult> {
  const startedAt = Date.now();
  try {
    const configPath = path.join(projectRoot, 'src/config/kanban-config.json');
    const dashboard = await GenerateDashboard.fromConfig(configPath);
    await dashboard.run();
    return {
      id: 'dashboard-generate',
      title: 'Dashboard Markdown/HTML',
      status: 'ok',
      detail: 'dashboard regenerado a partir de kanban-config.json',
      durationMs: Date.now() - startedAt
    };
  } catch (error) {
    return {
      id: 'dashboard-generate',
      title: 'Dashboard Markdown/HTML',
      status: 'warning',
      detail: `não foi possível gerar: ${(error as Error).message}`,
      remediation: 'Verifique src/config/kanban-config.json e rode "npm run dashboard".',
      durationMs: Date.now() - startedAt
    };
  }
}

export function openBrowser(targetUrl: string): void {
  try {
    if (process.platform === 'win32') {
      spawnSync('cmd', ['/c', 'start', '', targetUrl], { stdio: 'ignore' });
    } else if (process.platform === 'darwin') {
      spawnSync('open', [targetUrl], { stdio: 'ignore' });
    } else {
      spawnSync('xdg-open', [targetUrl], { stdio: 'ignore' });
    }
  } catch {
    log.info(`Para abrir manualmente: ${targetUrl}`);
  }
}

export interface StartKanbanResult {
  check: CheckResult;
  started: boolean;
}

export async function ensureKanbanServer(
  projectRoot: string,
  port: number,
  options: { start: boolean; timeoutMs?: number; extraEnv?: NodeJS.ProcessEnv }
): Promise<StartKanbanResult> {
  const startedAt = Date.now();
  const probe = await probeKanban(port);

  if (probe.ours) {
    return {
      started: false,
      check: {
        id: 'kanban-server',
        title: 'Servidor Kanban',
        status: 'ok',
        detail: `já online em http://localhost:${port}`,
        durationMs: Date.now() - startedAt
      }
    };
  }

  if (await isPortOpen(port)) {
    const owner = await describePortOwner(port);
    return {
      started: false,
      check: {
        id: 'kanban-server',
        title: 'Servidor Kanban',
        status: 'failed',
        detail: `porta ${port} ocupada por ${owner}. ${probe.detail}`,
        remediation: `Libere a porta ${port} ou use --kanban-port <outra>. Nenhum processo foi encerrado.`,
        durationMs: Date.now() - startedAt
      }
    };
  }

  if (!options.start) {
    return {
      started: false,
      check: {
        id: 'kanban-server',
        title: 'Servidor Kanban',
        status: 'skipped',
        detail: 'inicialização desativada por --no-start',
        remediation: `Inicie depois com "npm run app" (porta ${port}).`,
        durationMs: Date.now() - startedAt
      }
    };
  }

  const tsxCli = path.join(projectRoot, 'node_modules/tsx/dist/cli.mjs');
  const serverScript = path.join(projectRoot, 'src/server/server.ts');
  const distScript = path.join(projectRoot, 'dist/server.js');
  const logsDir = path.join(projectRoot, 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  const logFd = fs.openSync(path.join(logsDir, 'kanban-server.log'), 'a');

  const env = { ...process.env, ...options.extraEnv, PORT: String(port), KANBAN_ROOT: projectRoot };
  let command = process.execPath;
  let args: string[];

  if (fs.existsSync(distScript)) {
    args = [distScript];
  } else if (fs.existsSync(tsxCli)) {
    args = [tsxCli, serverScript];
  } else {
    command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    args = ['run', 'app'];
  }

  const child = spawn(command, args, {
    cwd: projectRoot,
    env,
    detached: true,
    stdio: ['ignore', logFd, logFd]
  });
  child.unref();

  const ready = await waitFor({
    timeoutMs: options.timeoutMs ?? 30000,
    intervalMs: 750,
    probe: async () => (await probeKanban(port)).ours
  });

  return {
    started: true,
    check: {
      id: 'kanban-server',
      title: 'Servidor Kanban',
      status: ready ? 'ok' : 'failed',
      detail: ready
        ? `iniciado em http://localhost:${port} (log: logs/kanban-server.log)`
        : `processo iniciado, mas /api/config não respondeu em http://localhost:${port}. Veja logs/kanban-server.log`,
      remediation: ready ? undefined : `Verifique logs/kanban-server.log e a porta ${port}.`,
      durationMs: Date.now() - startedAt
    }
  };
}

/** Mantido para a página de status e testes. */
export async function isKanbanHealthy(port: number): Promise<boolean> {
  const response = await httpRequest(`http://127.0.0.1:${port}/api/config`, {}, 2000).catch(() => null);
  return response?.status === 200;
}
