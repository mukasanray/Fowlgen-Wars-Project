import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { CheckResult } from './types';

const MIN_NODE_MAJOR = 18;

function elapsed(startedAt: number): number {
  return Date.now() - startedAt;
}

function run(command: string, args: string[], cwd?: string): { ok: boolean; output: string } {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: 15000,
    shell: process.platform === 'win32'
  });
  if (result.error) return { ok: false, output: result.error.message };
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  return { ok: result.status === 0, output };
}

export function checkNode(): CheckResult {
  const startedAt = Date.now();
  const major = Number(process.versions.node.split('.')[0]);
  const status = major >= MIN_NODE_MAJOR ? 'ok' : 'failed';
  return {
    id: 'node',
    title: `Node.js ${process.version}`,
    status,
    detail: status === 'ok' ? undefined : `É necessário Node.js >= ${MIN_NODE_MAJOR}.`,
    remediation: status === 'ok' ? undefined : 'Instale Node.js 18+ (https://nodejs.org) e rode novamente.',
    durationMs: elapsed(startedAt)
  };
}

export function checkNpm(): CheckResult {
  const startedAt = Date.now();
  const result = run('npm', ['--version']);
  return {
    id: 'npm',
    title: 'npm',
    status: result.ok ? 'ok' : 'warning',
    detail: result.ok ? `v${result.output}` : result.output,
    remediation: result.ok ? undefined : 'Verifique se o npm está no PATH.',
    durationMs: elapsed(startedAt)
  };
}

export function checkGit(): CheckResult {
  const startedAt = Date.now();
  const result = run('git', ['--version']);
  return {
    id: 'git',
    title: 'Git',
    status: result.ok ? 'ok' : 'failed',
    detail: result.ok ? result.output : result.output,
    remediation: result.ok ? undefined : 'Instale o Git (https://git-scm.com) e rode novamente.',
    durationMs: elapsed(startedAt)
  };
}

export function checkDocker(): CheckResult {
  const startedAt = Date.now();
  const version = run('docker', ['--version']);
  if (!version.ok) {
    return {
      id: 'docker',
      title: 'Docker',
      status: 'failed',
      detail: version.output,
      remediation: 'Instale Docker Engine/Desktop e rode novamente.',
      durationMs: elapsed(startedAt)
    };
  }
  const compose = run('docker', ['compose', 'version', '--short']);
  if (!compose.ok) {
    return {
      id: 'docker',
      title: 'Docker Compose',
      status: 'failed',
      detail: compose.output,
      remediation: 'Instale o plugin Docker Compose v2 (docker compose).',
      durationMs: elapsed(startedAt)
    };
  }
  const daemon = run('docker', ['info', '--format', '{{.ServerVersion}}']);
  if (!daemon.ok) {
    return {
      id: 'docker',
      title: `Docker ${version.output.replace(/^Docker version\s*/i, '')}`,
      status: 'failed',
      detail: `Daemon indisponível: ${daemon.output}`,
      remediation: 'Inicie o daemon do Docker e rode novamente.',
      durationMs: elapsed(startedAt)
    };
  }
  return {
    id: 'docker',
    title: 'Docker',
    status: 'ok',
    detail: `${version.output.replace(/^Docker version\s*/i, '')} · compose ${compose.output} · daemon ${daemon.output}`,
    durationMs: elapsed(startedAt)
  };
}

export function checkNodeModules(root: string): CheckResult {
  const startedAt = Date.now();
  const exists = fs.existsSync(path.join(root, 'node_modules'));
  return {
    id: 'node_modules',
    title: 'Dependências do projeto',
    status: exists ? 'ok' : 'failed',
    detail: exists ? 'node_modules presente' : 'node_modules ausente',
    remediation: exists ? undefined : 'Execute "npm install" em kanban/ e rode novamente.',
    durationMs: elapsed(startedAt)
  };
}

export interface PrerequisiteOptions {
  requireDocker: boolean;
}

export function checkPrerequisites(root: string, options: PrerequisiteOptions): CheckResult[] {
  const checks = [checkNode(), checkNpm(), checkGit(), checkNodeModules(root)];
  if (options.requireDocker) checks.push(checkDocker());
  return checks;
}
