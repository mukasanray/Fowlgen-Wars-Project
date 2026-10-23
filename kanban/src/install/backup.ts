import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { composeArgs, composeContainers, describeContainers, type ComposeContainer } from './docker';

export interface BackupStepResult {
  id: string;
  title: string;
  ok: boolean;
  detail: string;
  path?: string;
  bytes?: number;
}

export interface BackupResult {
  ok: boolean;
  dir: string;
  steps: BackupStepResult[];
}

/** Gera um slug de timestamp seguro para nome de diretório (sem ":" nem "."). */
export function backupTimestampSlug(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
}

function isServiceUp(containers: ComposeContainer[], service: string): boolean {
  return containers.some((c) => {
    const name = c.Service || c.Name || '';
    if (!name.includes(service)) return false;
    const state = `${c.State ?? ''} ${c.Status ?? ''}`.toLowerCase();
    return state.includes('running') || state.includes('up');
  });
}

/** Faz o dump completo do MongoDB (via mongodump dentro do container) e grava em disco. */
function dumpMongo(projectRoot: string, destDir: string): BackupStepResult {
  const title = 'Dump do MongoDB (mongodump --archive --gzip)';
  const filePath = path.join(destDir, 'mongo.archive.gz');

  const result = spawnSync(
    'docker',
    composeArgs(projectRoot, ['exec', '-T', 'mongo', 'mongodump', '--archive', '--gzip']),
    { cwd: projectRoot, timeout: 300000, maxBuffer: 1024 * 1024 * 1024 }
  );

  if (result.error) return { id: 'mongo', title, ok: false, detail: result.error.message };
  if (result.status !== 0) {
    const stderr = result.stderr ? result.stderr.toString('utf8').trim().split(/\r?\n/).slice(-6).join('\n') : '';
    return { id: 'mongo', title, ok: false, detail: stderr || `mongodump saiu com código ${result.status}` };
  }

  const buffer = result.stdout as Buffer;
  if (!buffer || buffer.length === 0) {
    return { id: 'mongo', title, ok: false, detail: 'mongodump não retornou nenhum byte (archive vazio)' };
  }

  fs.writeFileSync(filePath, buffer);
  return { id: 'mongo', title, ok: true, detail: `${buffer.length} bytes`, path: filePath, bytes: buffer.length };
}

/** Copia os arquivos enviados/assinados do volume do opensign-server para o host. */
function copyFiles(projectRoot: string, destDir: string): BackupStepResult {
  const title = 'Arquivos enviados/assinados (/usr/src/app/files)';
  const filesDir = path.join(destDir, 'files');

  const result = spawnSync(
    'docker',
    composeArgs(projectRoot, ['cp', 'opensign-server:/usr/src/app/files', filesDir]),
    { cwd: projectRoot, encoding: 'utf8', timeout: 120000 }
  );

  if (result.error) return { id: 'files', title, ok: false, detail: result.error.message };
  if (result.status !== 0) {
    return { id: 'files', title, ok: false, detail: (result.stderr || '').trim() || `docker cp saiu com código ${result.status}` };
  }
  return { id: 'files', title, ok: true, detail: filesDir, path: filesDir };
}

/** Copia .env.opensign.local (segredos/credenciais) junto do backup, com permissão 0600. */
function copyEnvFile(projectRoot: string, destDir: string): BackupStepResult {
  const title = '.env.opensign.local (segredos)';
  const envPath = path.join(projectRoot, '.env.opensign.local');
  if (!fs.existsSync(envPath)) {
    return { id: 'env', title, ok: false, detail: 'arquivo .env.opensign.local não encontrado' };
  }
  const destPath = path.join(destDir, '.env.opensign.local');
  fs.copyFileSync(envPath, destPath);
  try {
    fs.chmodSync(destPath, 0o600);
  } catch {
    /* Windows não suporta chmod POSIX; ignora. */
  }
  return { id: 'env', title, ok: true, detail: destPath, path: destPath };
}

/**
 * Faz backup completo do OpenSign (MongoDB + arquivos + segredos) em
 * kanban/backups/opensign/<timestamp>/. Nunca apaga nem altera dados em uso;
 * falha cedo (sem criar diretório) se mongo/opensign-server não estiverem no ar.
 */
export function backupOpenSign(
  projectRoot: string,
  backupsRoot: string = path.join(projectRoot, 'backups', 'opensign')
): BackupResult {
  const containers = composeContainers(projectRoot);
  const mongoUp = isServiceUp(containers, 'mongo');
  const serverUp = isServiceUp(containers, 'opensign-server');

  if (!mongoUp || !serverUp) {
    return {
      ok: false,
      dir: '',
      steps: [
        {
          id: 'precondition',
          title: 'Containers do OpenSign em execução',
          ok: false,
          detail:
            `mongo=${mongoUp ? 'up' : 'down'}, opensign-server=${serverUp ? 'up' : 'down'}. ` +
            `Containers: ${describeContainers(containers)}. Rode "npm run opensign:up" antes do backup.`
        }
      ]
    };
  }

  const dir = path.join(backupsRoot, backupTimestampSlug());
  fs.mkdirSync(dir, { recursive: true });

  const steps = [dumpMongo(projectRoot, dir), copyFiles(projectRoot, dir), copyEnvFile(projectRoot, dir)];
  const ok = steps.every((step) => step.ok);

  const manifest = {
    createdAt: new Date().toISOString(),
    ok,
    steps: steps.map(({ id, title, ok: stepOk, detail, bytes }) => ({ id, title, ok: stepOk, detail, bytes }))
  };
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  return { ok, dir, steps };
}

/** Lista os backups já feitos (mais recente primeiro), lendo o manifest.json de cada um. */
export function listOpenSignBackups(
  backupsRoot: string
): Array<{ dir: string; createdAt: string; ok: boolean }> {
  if (!fs.existsSync(backupsRoot)) return [];
  return fs
    .readdirSync(backupsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(backupsRoot, entry.name);
      const manifestPath = path.join(dir, 'manifest.json');
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { createdAt?: string; ok?: boolean };
        return { dir, createdAt: manifest.createdAt ?? entry.name, ok: Boolean(manifest.ok) };
      } catch {
        return { dir, createdAt: entry.name, ok: false };
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
