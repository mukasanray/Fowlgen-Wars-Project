import { spawnSync } from 'child_process';
import * as path from 'path';

export interface ComposeResult {
  ok: boolean;
  status: number;
  output: string;
}

export interface ComposeContainer {
  Name?: string;
  Service?: string;
  State?: string;
  Health?: string;
  Status?: string;
}

export const COMPOSE_FILE = 'docker-compose.dev.yml';
export const OPENSIGN_ENV_FILE = '.env.opensign.local';
export const OPENSIGN_PROFILE = 'opensign';

export function composeArgs(projectRoot: string, args: string[]): string[] {
  return [
    'compose',
    '--project-directory',
    projectRoot,
    '--env-file',
    path.join(projectRoot, OPENSIGN_ENV_FILE),
    '-f',
    path.join(projectRoot, COMPOSE_FILE),
    '--profile',
    OPENSIGN_PROFILE,
    ...args
  ];
}

export function runCompose(projectRoot: string, args: string[], options: { inherit?: boolean; timeoutMs?: number } = {}): ComposeResult {
  const result = spawnSync('docker', composeArgs(projectRoot, args), {
    cwd: projectRoot,
    encoding: 'utf8',
    timeout: options.timeoutMs ?? 300000,
    stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe']
  });

  const output = options.inherit
    ? ''
    : `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();

  if (result.error) {
    return { ok: false, status: -1, output: result.error.message };
  }
  return { ok: result.status === 0, status: result.status ?? -1, output };
}

export function validateCompose(projectRoot: string): ComposeResult {
  return runCompose(projectRoot, ['config', '--quiet'], { timeoutMs: 30000 });
}

export function startOpenSignStack(projectRoot: string): ComposeResult {
  return runCompose(projectRoot, ['up', '-d', '--no-build'], { inherit: true, timeoutMs: 600000 });
}

export function stopOpenSignStack(projectRoot: string): ComposeResult {
  // Nunca usa -v: os volumes com dados do OpenSign são preservados.
  return runCompose(projectRoot, ['down'], { inherit: true, timeoutMs: 180000 });
}

export function composeContainers(projectRoot: string): ComposeContainer[] {
  const result = runCompose(projectRoot, ['ps', '--format', 'json'], { timeoutMs: 30000 });
  if (!result.ok || !result.output) return [];

  const text = result.output.trim();
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return text
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as ComposeContainer;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is ComposeContainer => entry !== null);
  }
}

export function describeContainers(containers: ComposeContainer[]): string {
  if (containers.length === 0) return 'nenhum container do projeto em execução';
  return containers
    .map((container) => {
      const name = container.Service || container.Name || '?';
      const state = container.State || container.Status || '?';
      const health = container.Health ? `/${container.Health}` : '';
      return `${name}=${state}${health}`;
    })
    .join(', ');
}

export function containerLogs(projectRoot: string, service: string, lines = 25): string {
  const result = runCompose(projectRoot, ['logs', '--no-color', '--tail', String(lines), service], { timeoutMs: 30000 });
  return result.output;
}
