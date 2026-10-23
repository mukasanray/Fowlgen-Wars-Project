import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { buildApiBaseUrl, normalizeEvent, OpenSignApiError, OpenSignClient } from './opensign';
import { registerDocument, resolveCardId } from './opensign-registry';

function tempRoot(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'kanban-opensign-'));
}

test('buildApiBaseUrl usa v1.1 e remove barra final', () => {
  assert.equal(buildApiBaseUrl('http://localhost:3001/'), 'http://localhost:3001/api/v1.1');
});

test('normalizeEvent mapeia os eventos documentados', () => {
  assert.equal(normalizeEvent('signed'), 'recipient_signed');
  assert.equal(normalizeEvent('completed'), 'document_completed');
  assert.equal(normalizeEvent('declined'), 'document_declined');
  assert.equal(normalizeEvent('viewed'), 'document_viewed');
  assert.equal(normalizeEvent('created'), 'document_created');
  assert.equal(normalizeEvent('desconhecido'), 'unknown');
});

test('registro documento -> card é idempotente e resolve o card', () => {
  const root = tempRoot();
  registerDocument(root, 'doc-1', 'card-1');
  registerDocument(root, 'doc-1', 'card-2');
  assert.equal(resolveCardId(root, 'doc-1'), 'card-2');
  assert.equal(resolveCardId(root, 'doc-inexistente'), undefined);
  fs.rmSync(root, { recursive: true, force: true });
});

test('createDocument envia x-api-token e o corpo documentado', async (t) => {
  const root = tempRoot();
  const client = new OpenSignClient({
    baseUrl: 'http://opensign.test/api/v1.1',
    apiToken: 'token-de-teste',
    rootDir: root
  });

  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;

  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url);
    capturedInit = init;
    return new Response(JSON.stringify({
      objectId: 'doc-123',
      message: 'Document sent successfully!',
      signurl: [{ email: 'signer@example.com', url: 'https://sign.example/abc' }]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  const result = await client.createSignRequestForCard('card-9', 'JVBERi0xLjQ=', [
    { name: 'Signer', email: 'signer@example.com' }
  ]);

  assert.equal(capturedUrl, 'http://opensign.test/api/v1.1/createdocument');
  const headers = capturedInit?.headers as Record<string, string>;
  assert.equal(headers['x-api-token'], 'token-de-teste');
  assert.equal(headers.Authorization, undefined);

  const body = JSON.parse(String(capturedInit?.body)) as Record<string, unknown>;
  assert.equal(body.file, 'JVBERi0xLjQ=');
  assert.equal(body.title, 'Card card-9');
  assert.equal((body.signers as Array<Record<string, string>>)[0].email, 'signer@example.com');
  assert.equal(body.timeToCompleteDays, 30);

  assert.equal(result.documentId, 'doc-123');
  assert.equal(result.signers[0].signUrl, 'https://sign.example/abc');
  assert.equal(resolveCardId(root, 'doc-123'), 'card-9');

  fs.rmSync(root, { recursive: true, force: true });
});

test('createDocument rejeita URL no lugar de base64 (sem chamada HTTP)', async (t) => {
  const root = tempRoot();
  const client = new OpenSignClient({ baseUrl: 'http://opensign.test/api/v1.1', apiToken: 'x', rootDir: root });
  let called = false;
  t.mock.method(globalThis, 'fetch', async () => {
    called = true;
    return new Response('{}', { status: 200 });
  });

  await assert.rejects(
    () => client.createSignRequestForCard('card-1', 'https://example.com/a.pdf', [
      { name: 'S', email: 's@example.com' }
    ]),
    /base64/
  );
  assert.equal(called, false);
  fs.rmSync(root, { recursive: true, force: true });
});

test('erros da API expõem status sem vazar o token', async (t) => {
  const root = tempRoot();
  const client = new OpenSignClient({ baseUrl: 'http://opensign.test/api/v1.1', apiToken: 'segredo', rootDir: root });
  t.mock.method(globalThis, 'fetch', async () => new Response('Invalid API Token!', { status: 405 }));

  await assert.rejects(
    () => client.getUser(),
    (error: unknown) => {
      assert.ok(error instanceof OpenSignApiError);
      assert.equal(error.status, 405);
      assert.ok(!error.message.includes('segredo'));
      return true;
    }
  );
  fs.rmSync(root, { recursive: true, force: true });
});

test('parseWebhook normaliza payload real e resolve o card pelo registro', () => {
  const root = tempRoot();
  const secret = 'webhook-secret';
  const client = new OpenSignClient({
    baseUrl: 'http://opensign.test/api/v1.1',
    apiToken: 'x',
    webhookSecret: secret,
    rootDir: root
  });
  registerDocument(root, 'doc-real', 'card-real');

  const body = JSON.stringify({
    event: 'signed',
    type: 'DOCUMENT_TYPE',
    objectId: 'doc-real',
    file: 'https://files.example/doc.pdf',
    name: 'Contrato',
    signer: { name: 'Ana', email: 'ana@example.com' },
    signedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  });
  const signature = createHmac('sha256', secret).update(body).digest('hex');

  const payload = client.parseWebhook(body, signature);
  assert.equal(payload.event, 'recipient_signed');
  assert.equal(payload.rawEvent, 'signed');
  assert.equal(payload.documentId, 'doc-real');
  assert.equal(payload.documentTitle, 'Contrato');
  assert.equal(payload.metadata.external_id, 'card-real');
  assert.equal(payload.signers[0].status, 'signed');
  assert.equal(payload.pdfUrl, 'https://files.example/doc.pdf');

  assert.throws(() => client.parseWebhook(body, 'assinatura-invalida'), /Assinatura/);
  fs.rmSync(root, { recursive: true, force: true });
});

test('parseWebhook aceita payload legado com metadata.external_id', () => {
  const root = tempRoot();
  const secret = 's';
  const client = new OpenSignClient({ baseUrl: 'http://x/api/v1.1', apiToken: 'x', webhookSecret: secret, rootDir: root });
  const body = JSON.stringify({
    event: 'recipient_signed',
    documentId: 'doc-legado',
    documentTitle: 'Legado',
    metadata: { external_id: 'card-legado' },
    signers: [{ id: 's1', name: 'B', email: 'b@example.com', status: 'signed' }]
  });
  const signature = createHmac('sha256', secret).update(body).digest('hex');
  const payload = client.parseWebhook(body, signature);
  assert.equal(payload.documentId, 'doc-legado');
  assert.equal(payload.metadata.external_id, 'card-legado');
  assert.equal(payload.signers[0].status, 'signed');
  fs.rmSync(root, { recursive: true, force: true });
});
