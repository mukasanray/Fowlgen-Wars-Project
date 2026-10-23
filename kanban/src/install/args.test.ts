import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from './args';

test('parseArgs usa padrões e ignora o separador do npm', () => {
  const { options, errors } = parseArgs(['--']);
  assert.deepEqual(errors, []);
  assert.equal(options.kanbanPort, 3000);
  assert.equal(options.opensignPort, 3001);
  assert.equal(options.start, true);
  assert.equal(options.checkOnly, false);
});

test('parseArgs interpreta flags de escopo e portas', () => {
  const { options, errors } = parseArgs([
    '--check',
    '--with-opensign',
    '--no-start',
    '--non-interactive',
    '--kanban-port', '3100',
    '--opensign-port=3101'
  ]);
  assert.deepEqual(errors, []);
  assert.equal(options.checkOnly, true);
  assert.equal(options.withOpenSign, true);
  assert.equal(options.start, false);
  assert.equal(options.interactive, false);
  assert.equal(options.kanbanPort, 3100);
  assert.equal(options.opensignPort, 3101);
});

test('parseArgs rejeita porta inválida', () => {
  const { errors } = parseArgs(['--port', 'abc']);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /porta inválido/i);
});

test('parseArgs rejeita escopos conflitantes e portas iguais', () => {
  const conflict = parseArgs(['--with-opensign', '--skip-opensign']);
  assert.equal(conflict.errors.length, 1);

  const samePorts = parseArgs(['--kanban-port', '3001', '--opensign-port', '3001']);
  assert.equal(samePorts.errors.length, 1);
  assert.match(samePorts.errors[0], /diferentes/);
});

test('parseArgs interpreta flags de backup e restauração do OpenSign', () => {
  const backup = parseArgs(['--backup-opensign']);
  assert.deepEqual(backup.errors, []);
  assert.equal(backup.options.backupOpenSign, true);

  const restore = parseArgs(['--restore-opensign', 'latest', '--restore-opensign-env']);
  assert.deepEqual(restore.errors, []);
  assert.equal(restore.options.restoreOpenSign, 'latest');
  assert.equal(restore.options.restoreOpenSignEnv, true);

  const inline = parseArgs(['--restore-opensign=backups/opensign/2026-01-01_00-00-00']);
  assert.deepEqual(inline.errors, []);
  assert.equal(inline.options.restoreOpenSign, 'backups/opensign/2026-01-01_00-00-00');

  const semValor = parseArgs(['--restore-opensign']);
  assert.equal(semValor.errors.length, 1);
  assert.match(semValor.errors[0], /requer um caminho/);
});

test('parseArgs sinaliza flag desconhecida sem lançar exceção', () => {
  const { options, errors } = parseArgs(['--inexistente']);
  assert.equal(options.kanbanPort, 3000);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /desconhecida/);
});
