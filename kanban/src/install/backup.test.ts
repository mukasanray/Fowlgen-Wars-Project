import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { backupOpenSign, backupTimestampSlug, listOpenSignBackups, resolveBackupDir, restoreOpenSign } from './backup';

function tempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kanban-opensign-backup-'));
}

test('backupTimestampSlug gera um nome de diretório seguro (sem : nem .)', () => {
  const slug = backupTimestampSlug(new Date('2026-01-02T03:04:05.678Z'));
  assert.equal(slug, '2026-01-02_03-04-05');
  assert.doesNotMatch(slug, /[:.]/);
});

test('backupOpenSign não cria diretório quando mongo/opensign-server não estão no ar', () => {
  const projectRoot = tempRoot();
  const backupsRoot = path.join(projectRoot, 'backups', 'opensign');

  const result = backupOpenSign(projectRoot, backupsRoot);

  assert.equal(result.ok, false);
  assert.equal(result.dir, '');
  assert.equal(result.steps.length, 1);
  assert.equal(result.steps[0].id, 'precondition');
  assert.match(result.steps[0].detail, /opensign:up/);
  assert.equal(fs.existsSync(backupsRoot), false);

  fs.rmSync(projectRoot, { recursive: true, force: true });
});

test('listOpenSignBackups retorna [] quando o diretório de backups não existe', () => {
  const root = tempRoot();
  const backupsRoot = path.join(root, 'nao-existe');
  assert.deepEqual(listOpenSignBackups(backupsRoot), []);
  fs.rmSync(root, { recursive: true, force: true });
});

test('listOpenSignBackups lê os manifests e ordena do mais recente para o mais antigo', () => {
  const root = tempRoot();
  const backupsRoot = path.join(root, 'backups', 'opensign');

  const older = path.join(backupsRoot, '2026-01-01_00-00-00');
  const newer = path.join(backupsRoot, '2026-02-01_00-00-00');
  fs.mkdirSync(older, { recursive: true });
  fs.mkdirSync(newer, { recursive: true });
  fs.writeFileSync(path.join(older, 'manifest.json'), JSON.stringify({ createdAt: '2026-01-01T00:00:00.000Z', ok: true }));
  fs.writeFileSync(path.join(newer, 'manifest.json'), JSON.stringify({ createdAt: '2026-02-01T00:00:00.000Z', ok: false }));

  const list = listOpenSignBackups(backupsRoot);
  assert.equal(list.length, 2);
  assert.equal(list[0].dir, newer);
  assert.equal(list[0].ok, false);
  assert.equal(list[1].dir, older);
  assert.equal(list[1].ok, true);

  fs.rmSync(root, { recursive: true, force: true });
});

test('resolveBackupDir resolve "latest" para o backup mais recente', () => {
  const root = tempRoot();
  const backupsRoot = path.join(root, 'backups', 'opensign');
  const older = path.join(backupsRoot, '2026-01-01_00-00-00');
  const newer = path.join(backupsRoot, '2026-02-01_00-00-00');
  fs.mkdirSync(older, { recursive: true });
  fs.mkdirSync(newer, { recursive: true });
  fs.writeFileSync(path.join(older, 'manifest.json'), JSON.stringify({ createdAt: '2026-01-01T00:00:00.000Z', ok: true }));
  fs.writeFileSync(path.join(newer, 'manifest.json'), JSON.stringify({ createdAt: '2026-02-01T00:00:00.000Z', ok: true }));

  const resolved = resolveBackupDir(backupsRoot, 'latest');
  assert.equal(resolved.dir, newer);
  assert.equal(resolved.error, undefined);

  fs.rmSync(root, { recursive: true, force: true });
});

test('resolveBackupDir reporta erro quando não há backups para "latest"', () => {
  const root = tempRoot();
  const backupsRoot = path.join(root, 'backups', 'opensign');
  const resolved = resolveBackupDir(backupsRoot, 'latest');
  assert.equal(resolved.dir, '');
  assert.match(resolved.error ?? '', /Nenhum backup encontrado/);
  fs.rmSync(root, { recursive: true, force: true });
});

test('resolveBackupDir reporta erro quando o caminho explícito não existe', () => {
  const root = tempRoot();
  const backupsRoot = path.join(root, 'backups', 'opensign');
  const resolved = resolveBackupDir(backupsRoot, 'nao-existe');
  assert.equal(resolved.dir, '');
  assert.match(resolved.error ?? '', /não encontrado/);
  fs.rmSync(root, { recursive: true, force: true });
});

test('restoreOpenSign reporta erro quando o diretório do backup não existe', () => {
  const projectRoot = tempRoot();
  const result = restoreOpenSign(projectRoot, path.join(projectRoot, 'backups', 'opensign', 'inexistente'));
  assert.equal(result.ok, false);
  assert.equal(result.steps.length, 1);
  assert.equal(result.steps[0].id, 'precondition');
  assert.match(result.steps[0].detail, /backup não encontrado/);
  fs.rmSync(projectRoot, { recursive: true, force: true });
});

test('restoreOpenSign não mexe em nada quando mongo/opensign-server não estão no ar', () => {
  const projectRoot = tempRoot();
  const backupDir = path.join(projectRoot, 'backups', 'opensign', '2026-01-01_00-00-00');
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(path.join(backupDir, 'mongo.archive.gz'), Buffer.from('fake'));

  const result = restoreOpenSign(projectRoot, backupDir);

  assert.equal(result.ok, false);
  assert.equal(result.steps.length, 1);
  assert.equal(result.steps[0].id, 'precondition');
  assert.match(result.steps[0].detail, /opensign:up/);

  fs.rmSync(projectRoot, { recursive: true, force: true });
});
