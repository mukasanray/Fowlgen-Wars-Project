import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { CheckResult } from './types';

function run(command: string, args: string[], cwd: string, timeoutMs = 180000): { ok: boolean; output: string } {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
    shell: process.platform === 'win32'
  });
  if (result.error) return { ok: false, output: result.error.message };
  return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim() };
}

function tail(text: string, lines = 8): string {
  return text.split(/\r?\n/).filter(Boolean).slice(-lines).join('\n');
}

export function typecheck(projectRoot: string): CheckResult {
  const startedAt = Date.now();
  const tsc = path.join(projectRoot, 'node_modules/typescript/bin/tsc');
  if (!fs.existsSync(tsc)) {
    return {
      id: 'typecheck',
      title: 'TypeScript (tsc --noEmit)',
      status: 'warning',
      detail: 'typescript não instalado em node_modules',
      remediation: 'Execute "npm install" em kanban/.',
      durationMs: Date.now() - startedAt
    };
  }

  const result = run(process.execPath, [tsc, '--noEmit'], projectRoot);
  return {
    id: 'typecheck',
    title: 'TypeScript (tsc --noEmit)',
    status: result.ok ? 'ok' : 'failed',
    detail: result.ok ? 'sem erros de tipo' : tail(result.output),
    remediation: result.ok ? undefined : 'Corrija os erros de tipo listados acima.',
    durationMs: Date.now() - startedAt
  };
}

export function buildServer(projectRoot: string): CheckResult {
  const startedAt = Date.now();
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = run(npm, ['run', 'build:server'], projectRoot);
  const distFile = path.join(projectRoot, 'dist/server.js');
  const built = result.ok && fs.existsSync(distFile);
  return {
    id: 'build',
    title: 'Build do servidor (dist/server.js)',
    status: built ? 'ok' : 'failed',
    detail: built ? 'bundle gerado com esbuild' : tail(result.output),
    remediation: built ? undefined : 'Verifique se esbuild está instalado (npm install).',
    durationMs: Date.now() - startedAt
  };
}

export function checkDashboard(projectRoot: string): CheckResult {
  const startedAt = Date.now();
  const docs = path.join(projectRoot, 'docs');
  const hasDocs = fs.existsSync(docs) && fs.readdirSync(docs).length > 0;
  return {
    id: 'dashboard',
    title: 'Dashboard gerado',
    status: hasDocs ? 'ok' : 'warning',
    detail: hasDocs ? 'docs/ possui artefatos' : 'docs/ vazio',
    remediation: hasDocs ? undefined : 'Execute "npm run dashboard".',
    durationMs: Date.now() - startedAt
  };
}
