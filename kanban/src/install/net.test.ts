import test from 'node:test';
import assert from 'node:assert/strict';
import * as net from 'net';
import { findFreePort, isPortOpen } from './net';

test('isPortOpen detecta porta em uso sem encerrar o processo', async () => {
  const server = net.createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('endereço inesperado');

  assert.equal(await isPortOpen(address.port), true);
  await new Promise<void>((resolve) => server.close(() => resolve()));
  assert.equal(await isPortOpen(address.port), false);
});

test('findFreePort retorna uma porta livre', async () => {
  const port = await findFreePort(45000, 10);
  assert.ok(port !== null);
  assert.ok(port >= 45000 && port < 45010);
  assert.equal(await isPortOpen(port as number), false);
});
