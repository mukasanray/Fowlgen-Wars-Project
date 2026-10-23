import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOpenSignEnv, detectPublicBaseUrl, normalizeSlug, opensignPublicUrl } from './opensign';

test('normalizeSlug remove acentos e caracteres inválidos', () => {
  assert.equal(normalizeSlug('OpenSign Local Ção!'), 'opensign-local-cao');
  assert.equal(normalizeSlug('***'), 'opensign-local');
});

test('buildOpenSignEnv gera segredos e mantém o mesmo valor entre execuções', () => {
  const first = buildOpenSignEnv(new Map(), { port: 3001 });
  assert.ok(first.desired.MASTER_KEY);
  assert.ok(first.desired.OPENSIGN_JWT_SECRET);
  assert.ok(first.desired.OPENSIGN_WEBHOOK_SECRET);
  assert.ok(first.desired.OPENSIGN_DB_PASSWORD);
  assert.deepEqual(
    first.generatedKeys.sort(),
    ['MASTER_KEY', 'OPENSIGN_DB_PASSWORD', 'OPENSIGN_JWT_SECRET', 'OPENSIGN_WEBHOOK_SECRET'].sort()
  );
  assert.equal(first.desired.HOST_URL, 'http://localhost:3001');
  assert.equal(first.desired.SERVER_URL, 'http://localhost:3001/api/app');
  assert.equal(first.desired.MONGODB_URI, 'mongodb://mongo:27017/opensign');
  assert.equal(first.desired.OPENSIGN_API_TOKEN, undefined);

  // Segunda execução: nada é regenerado.
  const existing = new Map(Object.entries(first.desired));
  const second = buildOpenSignEnv(existing, { port: 3001 });
  assert.deepEqual(second.generatedKeys, []);
  assert.equal(second.desired.MASTER_KEY, first.desired.MASTER_KEY);
  assert.equal(second.desired.OPENSIGN_WEBHOOK_SECRET, first.desired.OPENSIGN_WEBHOOK_SECRET);
  assert.equal(second.desired.OPENSIGN_DB_PASSWORD, first.desired.OPENSIGN_DB_PASSWORD);
});

test('buildOpenSignEnv regenera MASTER_KEY inválido e preserva token real', () => {
  const existing = new Map<string, string>([
    ['MASTER_KEY', 'curto'],
    ['OPENSIGN_API_TOKEN', 'token-real'],
    ['OPENSIGN_API_BASE_URL', 'https://app.opensignlabs.com/api/v1.1']
  ]);
  const result = buildOpenSignEnv(existing, { port: 3100 });
  assert.notEqual(result.desired.MASTER_KEY, 'curto');
  assert.ok(result.desired.MASTER_KEY.length >= 12);
  assert.equal(result.desired.OPENSIGN_API_TOKEN, 'token-real');
  assert.equal(result.desired.OPENSIGN_API_BASE_URL, 'https://app.opensignlabs.com/api/v1.1');
  assert.equal(result.desired.HOST_URL, 'http://localhost:3100');
});

test('detectPublicBaseUrl ignora Codespaces fora do ambiente real e sem override', () => {
  assert.equal(detectPublicBaseUrl(3001, new Map(), {}), null);
});

test('detectPublicBaseUrl detecta Codespaces pelas variáveis de ambiente', () => {
  const env = {
    CODESPACES: 'true',
    CODESPACE_NAME: 'friendly-chainsaw-6p9pxrp5qqc96r',
    GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: 'app.github.dev'
  };
  assert.equal(
    detectPublicBaseUrl(3001, new Map(), env),
    'https://friendly-chainsaw-6p9pxrp5qqc96r-3001.app.github.dev'
  );
});

test('detectPublicBaseUrl prioriza OPENSIGN_PUBLIC_BASE_URL explícito sobre Codespaces', () => {
  const env = {
    CODESPACES: 'true',
    CODESPACE_NAME: 'friendly-chainsaw-6p9pxrp5qqc96r',
    GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: 'app.github.dev'
  };
  const existing = new Map([['OPENSIGN_PUBLIC_BASE_URL', 'https://meu-dominio.exemplo.com/']]);
  assert.equal(detectPublicBaseUrl(3001, existing, env), 'https://meu-dominio.exemplo.com');
});

test('buildOpenSignEnv usa publicBaseUrl quando fornecida (Codespaces)', () => {
  const result = buildOpenSignEnv(new Map(), {
    port: 3001,
    publicBaseUrl: 'https://friendly-chainsaw-6p9pxrp5qqc96r-3001.app.github.dev'
  });
  assert.equal(result.desired.HOST_URL, 'https://friendly-chainsaw-6p9pxrp5qqc96r-3001.app.github.dev');
  assert.equal(
    result.desired.REACT_APP_SERVERURL,
    'https://friendly-chainsaw-6p9pxrp5qqc96r-3001.app.github.dev/api/app'
  );
});

test('opensignPublicUrl usa HOST_URL do .env e cai para localhost quando ausente', () => {
  assert.equal(opensignPublicUrl(new Map([['HOST_URL', 'https://foo.example.com/']]), 3001), 'https://foo.example.com');
  assert.equal(opensignPublicUrl(new Map(), 3001), 'http://localhost:3001');
});
