import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseEnv, mergeEnv, ensureEnvFile, readEnvFile } from './env-file';

test('parseEnv lê comentários, export, aspas e comentário inline', () => {
  const parsed = parseEnv(
    [
      '# comentário',
      '',
      'A=1',
      'export B=dois',
      'C="valor com espaço"',
      "D='outro valor'",
      'E=abc#123',
      'F=valor # comentário inline',
      'invalido'
    ].join('\n')
  );

  assert.equal(parsed.entries.get('A'), '1');
  assert.equal(parsed.entries.get('B'), 'dois');
  assert.equal(parsed.entries.get('C'), 'valor com espaço');
  assert.equal(parsed.entries.get('D'), 'outro valor');
  assert.equal(parsed.entries.get('E'), 'abc#123');
  assert.equal(parsed.entries.get('F'), 'valor');
  assert.equal(parsed.lines.filter((line) => line.kind === 'invalid').length, 1);
});

test('mergeEnv preserva chaves desconhecidas, comentários e ordem', () => {
  const existing = ['# topo', 'KEEP=1', '', 'CHANGE=old', '# rodapé', 'OUTRA=2'].join('\n');
  const result = mergeEnv(existing, { CHANGE: 'new', NOVA: 'x y' });

  assert.deepEqual(result.updatedKeys, ['CHANGE']);
  assert.deepEqual(result.addedKeys, ['NOVA']);
  assert.ok(result.content.includes('# topo'));
  assert.ok(result.content.includes('KEEP=1'));
  assert.ok(result.content.includes('OUTRA=2'));
  assert.ok(result.content.includes('CHANGE=new'));
  assert.ok(result.content.includes('NOVA="x y"'));
});

test('mergeEnv é idempotente', () => {
  const first = mergeEnv('A=1\nB=2\n', { B: '3' });
  const second = mergeEnv(first.content, { B: '3' });
  assert.equal(second.content, first.content);
  assert.deepEqual(second.updatedKeys, []);
  assert.deepEqual(second.addedKeys, []);
});

test('mergeEnv recusa quebra de linha (injeção de variável)', () => {
  assert.throws(() => mergeEnv('A=1\n', { A: 'x\nMALICIOSO=1' }), /quebra de linha/);
});

test('ensureEnvFile grava 0600 e é idempotente com o mesmo conjunto de valores', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kanban-env-'));
  const envPath = path.join(dir, '.env.test');

  const first = ensureEnvFile(envPath, { MASTER_KEY: 'segredo-existente', OUTRA: '1' });
  assert.equal(first.created, true);
  assert.equal(readEnvFile(envPath).get('MASTER_KEY'), 'segredo-existente');

  const second = ensureEnvFile(envPath, { MASTER_KEY: 'segredo-existente', OUTRA: '1' });
  assert.equal(second.created, false);
  assert.equal(second.changed, false);
  assert.deepEqual(second.addedKeys, []);

  if (process.platform !== 'win32') {
    const mode = fs.statSync(envPath).mode & 0o777;
    assert.equal(mode, 0o600);
  }

  fs.rmSync(dir, { recursive: true, force: true });
});
