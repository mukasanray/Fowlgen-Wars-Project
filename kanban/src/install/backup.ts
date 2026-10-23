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

/** Resolve "latest" para o backup mais recente, ou valida um caminho explícito. */
export function resolveBackupDir(backupsRoot: string, selector: string): { dir: string; error?: string } {
  if (selector === 'latest') {
    const [mostRecent] = listOpenSignBackups(backupsRoot);
    if (!mostRecent) return { dir: '', error: `Nenhum backup encontrado em ${backupsRoot}.` };
    return { dir: mostRecent.dir };
  }

  const dir = path.isAbsolute(selector) ? selector : path.join(backupsRoot, selector);
  if (!fs.existsSync(dir)) return { dir: '', error: `Backup não encontrado: ${dir}` };
  return { dir };
}

export interface RestoreOptions {
  /** Também sobrescreve .env.opensign.local com o do backup (preserva uma cópia de segurança). Padrão: false. */
  restoreEnv?: boolean;
}

export interface RestoreResult {
  ok: boolean;
  backupDir: string;
  steps: BackupStepResult[];
}

/** Restaura o dump do MongoDB (mongorestore --drop) a partir do mongo.archive.gz do backup. */
function restoreMongo(projectRoot: string, backupDir: string): BackupStepResult {
  const title = 'Restauração do MongoDB (mongorestore --archive --gzip --drop)';
  const archivePath = path.join(backupDir, 'mongo.archive.gz');
  if (!fs.existsSync(archivePath)) {
    return { id: 'mongo', title, ok: false, detail: 'mongo.archive.gz não encontrado no backup' };
  }

  const archive = fs.readFileSync(archivePath);
  const result = spawnSync(
    'docker',
    composeArgs(projectRoot, ['exec', '-T', 'mongo', 'mongorestore', '--archive', '--gzip', '--drop']),
    { cwd: projectRoot, input: archive, timeout: 300000, maxBuffer: 1024 * 1024 * 1024 }
  );

  if (result.error) return { id: 'mongo', title, ok: false, detail: result.error.message };
  if (result.status !== 0) {
    const stderr = result.stderr ? result.stderr.toString('utf8').trim().split(/\r?\n/).slice(-6).join('\n') : '';
    return { id: 'mongo', title, ok: false, detail: stderr || `mongorestore saiu com código ${result.status}` };
  }
  return { id: 'mongo', title, ok: true, detail: `restaurado de ${archivePath}`, path: archivePath, bytes: archive.length };
}

/** Restaura os arquivos enviados/assinados de volta para o volume do opensign-server. */
function restoreFiles(projectRoot: string, backupDir: string): BackupStepResult {
  const title = 'Arquivos enviados/assinados (/usr/src/app/files)';
  const filesDir = path.join(backupDir, 'files');
  if (!fs.existsSync(filesDir)) {
    return { id: 'files', title, ok: false, detail: 'diretório files/ não encontrado no backup' };
  }

  // "/." copia o CONTEÚDO de filesDir para dentro do destino (sem aninhar uma pasta "files" extra).
  const result = spawnSync(
    'docker',
    composeArgs(projectRoot, ['cp', `${filesDir}${path.sep}.`, 'opensign-server:/usr/src/app/files']),
    { cwd: projectRoot, encoding: 'utf8', timeout: 120000 }
  );

  if (result.error) return { id: 'files', title, ok: false, detail: result.error.message };
  if (result.status !== 0) {
    return { id: 'files', title, ok: false, detail: (result.stderr || '').trim() || `docker cp saiu com código ${result.status}` };
  }
  return { id: 'files', title, ok: true, detail: `restaurado de ${filesDir}`, path: filesDir };
}

/**
 * Restaura .env.opensign.local do backup. Nunca descarta o arquivo atual: faz
 * uma cópia de segurança (.env.opensign.local.before-restore-<timestamp>)
 * antes de sobrescrever.
 */
function restoreEnvFile(projectRoot: string, backupDir: string): BackupStepResult {
  const title = '.env.opensign.local (segredos)';
  const srcPath = path.join(backupDir, '.env.opensign.local');
  if (!fs.existsSync(srcPath)) {
    return { id: 'env', title, ok: false, detail: '.env.opensign.local não encontrado no backup' };
  }

  const destPath = path.join(projectRoot, '.env.opensign.local');
  if (fs.existsSync(destPath)) {
    const safetyPath = `${destPath}.before-restore-${backupTimestampSlug()}`;
    fs.copyFileSync(destPath, safetyPath);
    try {
      fs.chmodSync(safetyPath, 0o600);
    } catch {
      /* Windows não suporta chmod POSIX; ignora. */
    }
  }

  fs.copyFileSync(srcPath, destPath);
  try {
    fs.chmodSync(destPath, 0o600);
  } catch {
    /* Windows não suporta chmod POSIX; ignora. */
  }
  return { id: 'env', title, ok: true, detail: destPath, path: destPath };
}

/**
 * Restaura um backup do OpenSign (MongoDB + arquivos, opcionalmente .env).
 *
 * DESTRUTIVO para os dados atuais do MongoDB (mongorestore --drop). Exige
 * mongo e opensign-server já no ar (mesma stack usada no backup). O .env
 * atual, quando existir, nunca é apagado: é renomeado para
 * ".env.opensign.local.before-restore-<timestamp>" antes de ser substituído.
 */
export function restoreOpenSign(
  projectRoot: string,
  backupDir: string,
  options: RestoreOptions = {}
): RestoreResult {
  if (!fs.existsSync(backupDir)) {
    return {
      ok: false,
      backupDir,
      steps: [{ id: 'precondition', title: 'Diretório do backup', ok: false, detail: `backup não encontrado: ${backupDir}` }]
    };
  }

  const containers = composeContainers(projectRoot);
  const mongoUp = isServiceUp(containers, 'mongo');
  const serverUp = isServiceUp(containers, 'opensign-server');

  if (!mongoUp || !serverUp) {
    return {
      ok: false,
      backupDir,
      steps: [
        {
          id: 'precondition',
          title: 'Containers do OpenSign em execução',
          ok: false,
          detail:
            `mongo=${mongoUp ? 'up' : 'down'}, opensign-server=${serverUp ? 'up' : 'down'}. ` +
            `Containers: ${describeContainers(containers)}. Rode "npm run opensign:up" antes de restaurar.`
        }
      ]
    };
  }

  const steps = [restoreMongo(projectRoot, backupDir), restoreFiles(projectRoot, backupDir)];
  if (options.restoreEnv) steps.push(restoreEnvFile(projectRoot, backupDir));

  return { ok: steps.every((step) => step.ok), backupDir, steps };
}
