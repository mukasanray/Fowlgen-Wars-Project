/**
 * Teste de integração real do fluxo de administrador do OpenSign.
 *
 * Valida, com containers reais e banco temporário:
 *   1. POST /app/users                      (Parse signup)
 *   2. POST /app/functions/addadmin         (fluxo usado pela página /addadmin)
 *   3. GET  /app/login                      (login do admin criado)
 *   4. POST /app/functions/getlogobydomain  (tenant existe)
 *   5. GET  /app/classes/contracts_Users    (UserRole = contracts_Admin)
 *
 * Não toca no stack do operador: projeto Compose, porta, volume e diretório
 * temporários, removidos no final.
 *
 * Uso: RUN_DOCKER_INTEGRATION=1 npm run test:integration
 */

import { spawnSync } from 'child_process';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { findFreePort, waitFor } from './net';

const RUN = process.env.RUN_DOCKER_INTEGRATION === '1';
const PROJECT = `opensign-it-${process.pid}-${Date.now().toString(36)}`;
const ADMIN_EMAIL = `admin-it-${Date.now().toString(36)}@example.test`;
const ADMIN_PASSWORD = 'Admin#It2026';
const MASTER_KEY = randomBytes(16).toString('hex');

function run(command: string, args: string[], cwd?: string): { ok: boolean; output: string } {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: 300000,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.error) return { ok: false, output: result.error.message };
  return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim() };
}

async function postJson(url: string, body: unknown, headers: Record<string, string> = {}): Promise<{ status: number; body: any }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Parse-Application-Id': 'opensign', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000)
  });
  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  return { status: response.status, body: parsed };
}

async function getJson(url: string, headers: Record<string, string> = {}): Promise<{ status: number; body: any }> {
  const response = await fetch(url, {
    headers: { 'X-Parse-Application-Id': 'opensign', ...headers },
    signal: AbortSignal.timeout(20000)
  });
  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  return { status: response.status, body: parsed };
}

function composeYaml(port: number): string {
  return `services:
  mongo:
    image: mongo:latest
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
      interval: 5s
      timeout: 5s
      retries: 24
  server:
    image: opensign/opensignserver:main
    ports:
      - "127.0.0.1:${port}:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - PARSE_MOUNT=/app
      - USE_LOCAL=true
      - APP_ID=opensign
      - MASTER_KEY=${MASTER_KEY}
      - MONGODB_URI=mongodb://mongo:27017/opensign
      - DATABASE_URL=mongodb://mongo:27017/opensign
      - SERVER_URL=http://localhost:${port}/api/app
      - PUBLIC_URL=http://localhost:${port}
      - SMTP_ENABLE=false
    volumes:
      - files:/usr/src/app/files
    depends_on:
      mongo:
        condition: service_healthy
volumes:
  files:
`;
}

async function main(): Promise<number> {
  if (!RUN) {
    console.log('⏭️  Teste de integração ignorado. Defina RUN_DOCKER_INTEGRATION=1 para executar.');
    return 0;
  }

  const docker = run('docker', ['info', '--format', '{{.ServerVersion}}']);
  if (!docker.ok) {
    console.error('❌ Docker indisponível:', docker.output);
    return 1;
  }

  const port = await findFreePort(46000, 40);
  if (!port) {
    console.error('❌ Nenhuma porta livre encontrada para o teste.');
    return 1;
  }

  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'opensign-admin-it-'));
  const composeFile = path.join(workdir, 'compose.yml');
  fs.writeFileSync(composeFile, composeYaml(port), 'utf8');

  const compose = (args: string[]) =>
    run('docker', ['compose', '-p', PROJECT, '-f', composeFile, ...args], workdir);

  let failed = 0;
  const check = (condition: boolean, label: string, detail = ''): void => {
    if (condition) {
      console.log(`✅ [PASS] ${label}`);
    } else {
      console.error(`❌ [FAIL] ${label}${detail ? ` — ${detail}` : ''}`);
      failed += 1;
    }
  };

  try {
    console.log(`🐳 Subindo stack temporária "${PROJECT}" na porta ${port}...`);
    const up = compose(['up', '-d']);
    if (!up.ok) {
      console.error('❌ Falha ao subir containers:', up.output.split(/\r?\n/).slice(-15).join('\n'));
      return 1;
    }

    const base = `http://127.0.0.1:${port}`;
    const ready = await waitFor({
      timeoutMs: 180000,
      intervalMs: 3000,
      probe: async () => {
        try {
          const response = await fetch(`${base}/`, { signal: AbortSignal.timeout(5000) });
          const text = await response.text();
          return response.ok && text.includes('opensign-server is running');
        } catch {
          return false;
        }
      }
    });
    check(ready, 'openSign-server responde em /');
    if (!ready) {
      const logs = compose(['logs', '--tail', '40', 'server']);
      console.error(logs.output);
      return 1;
    }

    const health = await getJson(`${base}/app/health`);
    check(health.status === 200, 'Parse /app/health retorna 200', `HTTP ${health.status}`);

    const signup = await postJson(`${base}/app/users`, {
      username: ADMIN_EMAIL,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    check(signup.status === 201 || signup.status === 200, 'Signup em /app/users', `HTTP ${signup.status} ${JSON.stringify(signup.body).slice(0, 200)}`);

    const addadmin = await postJson(`${base}/app/functions/addadmin`, {
      userDetails: {
        name: 'Admin Integração',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        phone: '11999999999',
        company: 'Fowlgen QA',
        jobTitle: 'QA',
        role: 'contracts_Admin',
        country: 'BR',
        state: 'SP',
        city: 'São Paulo',
        address: 'Rua Teste 1',
        pincode: '01000-000',
        timezone: 'America/Sao_Paulo'
      }
    });
    const addadminMessage = addadmin.body?.result?.message;
    check(
      addadmin.status === 200 && (addadminMessage === 'User sign up' || addadminMessage === 'User already exist'),
      'addadmin cria o administrador',
      `HTTP ${addadmin.status} ${JSON.stringify(addadmin.body).slice(0, 200)}`
    );
    check(Boolean(addadmin.body?.result?.sessionToken), 'addadmin devolve sessionToken');

    const login = await getJson(
      `${base}/app/login?username=${encodeURIComponent(ADMIN_EMAIL)}&password=${encodeURIComponent(ADMIN_PASSWORD)}`
    );
    check(login.status === 200 && Boolean(login.body?.sessionToken), 'Login do admin em /app/login', `HTTP ${login.status}`);

    const tenant = await postJson(`${base}/app/functions/getlogobydomain`, { domain: 'localhost' });
    check(tenant.body?.result?.user === 'exist', 'getlogobydomain reporta tenant existente', JSON.stringify(tenant.body).slice(0, 200));

    const users = await getJson(
      `${base}/app/classes/contracts_Users?where=${encodeURIComponent(JSON.stringify({ Email: ADMIN_EMAIL }))}`,
      { 'X-Parse-Master-Key': MASTER_KEY }
    );
    const role = users.body?.results?.[0]?.UserRole;
    check(users.status === 200 && role === 'contracts_Admin', 'contracts_Users.UserRole = contracts_Admin', `HTTP ${users.status} role=${role}`);
    check(Boolean(users.body?.results?.[0]?.OrganizationId), 'Organização criada pelo addadmin');

    console.log(`\n${failed === 0 ? '✅' : '❌'} Integração addadmin: ${failed === 0 ? 'todos os passos passaram' : `${failed} falha(s)`}`);
    return failed === 0 ? 0 : 1;
  } finally {
    console.log('🧹 Removendo stack e volume temporários...');
    compose(['down', '-v', '--remove-orphans']);
    fs.rmSync(workdir, { recursive: true, force: true });
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error('❌ Erro inesperado no teste de integração:', (error as Error)?.message || error);
    process.exitCode = 1;
  });
