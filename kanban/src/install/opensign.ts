import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { composeContainers, containerLogs, describeContainers, startOpenSignStack } from './docker';
import { ensureEnvFile, readEnvFile } from './env-file';
import { log } from './logger';
import { httpRequest, isPortOpen, tryHttpRequest, waitFor, type HttpResponse } from './net';

export const OPENSIGN_ENV_FILENAME = '.env.opensign.local';

export interface OpenSignEnvBuild {
  desired: Record<string, string>;
  generatedKeys: string[];
}

export interface ReadinessResult {
  backend: HttpResponse | null;
  ui: HttpResponse | null;
  addadmin: HttpResponse | null;
  backendOk: boolean;
  uiOk: boolean;
  ready: boolean;
}

export interface AdminState {
  state: 'exist' | 'not_exist' | 'unknown';
  detail: string;
}

function generateSecret(bytes: number, encoding: 'hex' | 'base64url' = 'hex'): string {
  return randomBytes(bytes).toString(encoding);
}

function isValidMasterKey(value: string | undefined): boolean {
  return Boolean(value && /^[A-Za-z0-9]{12,}$/.test(value));
}

/**
 * Detecta a URL pública real do OpenSign.
 *
 * Em GitHub Codespaces, a porta publicada em 127.0.0.1 não é o endereço que o
 * navegador do operador usa: o Codespaces encaminha tudo por
 * https://<nome>-<porta>.<domínio>. Se HOST_URL/REACT_APP_SERVERURL continuar
 * apontando para http://localhost:<porta>, o front-end do OpenSign tenta
 * chamar a API em "localhost" a partir de um domínio diferente — o navegador
 * bloqueia por mixed content (https → http) ou simplesmente não há nada
 * escutando naquele host, e a tela de login fica presa sem nunca conseguir
 * verificar/exibir a página de cadastro do admin (/addadmin).
 *
 * Prioridade:
 *   1) OPENSIGN_PUBLIC_BASE_URL (override explícito, ex.: domínio próprio)
 *   2) Codespaces: https://$CODESPACE_NAME-<porta>.$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
 *   3) null (quem chamar decide o fallback, normalmente http://localhost:<porta>)
 */
export function detectPublicBaseUrl(
  port: number,
  existing: Map<string, string> = new Map(),
  env: NodeJS.ProcessEnv = process.env
): string | null {
  const explicit = existing.get('OPENSIGN_PUBLIC_BASE_URL') || env.OPENSIGN_PUBLIC_BASE_URL;
  if (explicit && explicit.trim()) return explicit.trim().replace(/\/+$/, '');

  const codespaceName = env.CODESPACE_NAME;
  const forwardingDomain = env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
  if (env.CODESPACES === 'true' && codespaceName && forwardingDomain) {
    return `https://${codespaceName}-${port}.${forwardingDomain}`;
  }

  return null;
}

export function normalizeSlug(value: string, fallback = 'opensign-local'): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return normalized || fallback;
}

/**
 * Monta o ambiente do OpenSign preservando segredos já existentes.
 * Nenhum valor é inventado: o que não existe é gerado aleatoriamente uma única vez.
 */
export function buildOpenSignEnv(
  existing: Map<string, string>,
  options: { port: number; publicHost?: string; publicBaseUrl?: string }
): OpenSignEnvBuild {
  const generatedKeys: string[] = [];
  const port = options.port;
  const baseUrl = (options.publicBaseUrl ?? `http://${options.publicHost ?? `localhost:${port}`}`).replace(/\/+$/, '');
  const projectName = existing.get('OPENSIGN_PROJECT_NAME') || 'opensign-local';
  const slug = normalizeSlug(existing.get('OPENSIGN_PROJECT_SLUG') || projectName);

  const takeOrGenerate = (key: string, generate: () => string): string => {
    const current = existing.get(key);
    if (current && current.trim()) return current.trim();
    generatedKeys.push(key);
    return generate();
  };

  const dbPassword = takeOrGenerate('OPENSIGN_DB_PASSWORD', () => generateSecret(24, 'base64url'));
  const masterKey = isValidMasterKey(existing.get('MASTER_KEY'))
    ? (existing.get('MASTER_KEY') as string)
    : (() => {
        generatedKeys.push('MASTER_KEY');
        return generateSecret(16, 'hex');
      })();

  const desired: Record<string, string> = {
    OPENSIGN_PROJECT_NAME: projectName,
    OPENSIGN_PROJECT_SLUG: slug,
    OPENSIGN_DB_NAME: existing.get('OPENSIGN_DB_NAME') || slug,
    OPENSIGN_DB_USER: existing.get('OPENSIGN_DB_USER') || slug,
    OPENSIGN_DB_PASSWORD: dbPassword,
    MASTER_KEY: masterKey,
    APP_ID: existing.get('APP_ID') || 'opensign',
    MONGODB_URI: 'mongodb://mongo:27017/opensign',
    DATABASE_URL: 'mongodb://mongo:27017/opensign',
    HOST_URL: baseUrl,
    PUBLIC_URL: baseUrl,
    SERVER_URL: `${baseUrl}/api/app`,
    REACT_APP_SERVERURL: `${baseUrl}/api/app`,
    REACT_APP_APPID: existing.get('REACT_APP_APPID') || 'opensign',
    USE_LOCAL: 'true',
    NODE_ENV: 'production',
    SMTP_ENABLE: existing.get('SMTP_ENABLE') || 'false',
    OPENSIGN_HOST_PORT: String(port),
    OPENSIGN_BIND_ADDR: existing.get('OPENSIGN_BIND_ADDR') || '127.0.0.1'
  };

  if (existing.get('OPENSIGN_JWT_SECRET')) {
    desired.OPENSIGN_JWT_SECRET = existing.get('OPENSIGN_JWT_SECRET') as string;
  } else {
    generatedKeys.push('OPENSIGN_JWT_SECRET');
    desired.OPENSIGN_JWT_SECRET = generateSecret(32);
  }

  if (existing.get('OPENSIGN_WEBHOOK_SECRET')) {
    desired.OPENSIGN_WEBHOOK_SECRET = existing.get('OPENSIGN_WEBHOOK_SECRET') as string;
  } else {
    generatedKeys.push('OPENSIGN_WEBHOOK_SECRET');
    desired.OPENSIGN_WEBHOOK_SECRET = generateSecret(32);
  }

  // Opcional: só é propagado quando o operador já forneceu um token real.
  const apiToken = existing.get('OPENSIGN_API_TOKEN');
  if (apiToken && apiToken.trim()) desired.OPENSIGN_API_TOKEN = apiToken.trim();

  const apiBaseUrl = existing.get('OPENSIGN_API_BASE_URL');
  if (apiBaseUrl && apiBaseUrl.trim()) desired.OPENSIGN_API_BASE_URL = apiBaseUrl.trim();

  return { desired, generatedKeys };
}

export interface PrepareEnvResult {
  envPath: string;
  exists: boolean;
  created: boolean;
  addedKeys: string[];
  updatedKeys: string[];
  generatedKeys: string[];
  env: Map<string, string>;
}

export function prepareOpenSignEnv(
  projectRoot: string,
  options: { port: number; checkOnly: boolean }
): PrepareEnvResult {
  const envPath = path.join(projectRoot, OPENSIGN_ENV_FILENAME);
  const existing = readEnvFile(envPath);
  const publicBaseUrl = detectPublicBaseUrl(options.port, existing) ?? undefined;
  const { desired, generatedKeys } = buildOpenSignEnv(existing, { port: options.port, publicBaseUrl });

  if (options.checkOnly) {
    const missing = Object.keys(desired).filter((key) => !existing.has(key));
    return {
      envPath,
      exists: fs.existsSync(envPath),
      created: false,
      addedKeys: missing,
      updatedKeys: [],
      generatedKeys,
      env: existing
    };
  }

  const result = ensureEnvFile(envPath, desired);
  return {
    envPath,
    exists: fs.existsSync(envPath),
    created: result.created,
    addedKeys: result.addedKeys,
    updatedKeys: result.updatedKeys,
    generatedKeys: result.created ? generatedKeys : generatedKeys.filter((key) => result.addedKeys.includes(key)),
    env: readEnvFile(envPath)
  };
}

export function checkEnvPermissions(envPath: string): { ok: boolean; mode: string } {
  try {
    const stat = fs.statSync(envPath);
    const mode = (stat.mode & 0o777).toString(8).padStart(3, '0');
    return { ok: (stat.mode & 0o077) === 0, mode };
  } catch {
    return { ok: false, mode: '000' };
  }
}

function isParseHealth(response: HttpResponse | null): boolean {
  if (!response || response.status !== 200) return false;
  if (!response.contentType.includes('application/json')) return false;
  try {
    const parsed = JSON.parse(response.body) as { status?: string };
    return parsed.status === 'ok';
  } catch {
    return false;
  }
}

function isFrontend(response: HttpResponse | null): boolean {
  return Boolean(
    response &&
    response.status === 200 &&
    response.contentType.includes('text/html') &&
    response.body.includes('id="root"')
  );
}

export async function inspectReadiness(port: number): Promise<ReadinessResult> {
  const base = `http://127.0.0.1:${port}`;
  const [backend, ui, addadmin] = await Promise.all([
    tryHttpRequest(`${base}/api/app/health`, {}, 5000),
    tryHttpRequest(`${base}/`, {}, 5000),
    tryHttpRequest(`${base}/addadmin`, {}, 5000)
  ]);
  const backendOk = isParseHealth(backend);
  const uiOk = isFrontend(ui);

  return {
    backend,
    ui,
    addadmin,
    backendOk,
    uiOk,
    ready: backendOk && uiOk
  };
}

export interface StartResult {
  attempted: boolean;
  alreadyRunning: boolean;
  ready: boolean;
  readiness: ReadinessResult | null;
  containers: string;
  error?: string;
}

export async function startOpenSign(
  projectRoot: string,
  port: number,
  options: { timeoutMs?: number } = {}
): Promise<StartResult> {
  const before = await inspectReadiness(port);
  if (before.ready) {
    return {
      attempted: false,
      alreadyRunning: true,
      ready: true,
      readiness: before,
      containers: describeContainers(composeContainers(projectRoot))
    };
  }

  const result = startOpenSignStack(projectRoot);
  if (!result.ok) {
    return {
      attempted: true,
      alreadyRunning: false,
      ready: false,
      readiness: null,
      containers: describeContainers(composeContainers(projectRoot)),
      error: result.output.split(/\r?\n/).slice(-12).join('\n')
    };
  }

  const timeoutMs = options.timeoutMs ?? 180000;
  let readiness: ReadinessResult | null = null;
  const ready = await waitFor({
    timeoutMs,
    intervalMs: 3000,
    probe: async () => {
      readiness = await inspectReadiness(port);
      return readiness.ready;
    }
  });

  if (!ready) {
    log.warn('OpenSign não respondeu no tempo esperado. Últimos logs do backend:');
    const logs = containerLogs(projectRoot, 'opensign-server', 20);
    if (logs) console.log(logs);
  }

  return {
    attempted: true,
    alreadyRunning: false,
    ready,
    readiness: readiness ?? (await inspectReadiness(port)),
    containers: describeContainers(composeContainers(projectRoot))
  };
}

export function publicHostFor(port: number, existing: Map<string, string> = new Map()): string {
  const baseUrl = detectPublicBaseUrl(port, existing);
  if (!baseUrl) return `localhost:${port}`;
  try {
    return new URL(baseUrl).host;
  } catch {
    return `localhost:${port}`;
  }
}

export async function detectAdminState(
  port: number,
  appId = 'opensign',
  publicHost = publicHostFor(port)
): Promise<AdminState> {
  const response = await tryHttpRequest(
    `http://127.0.0.1:${port}/api/app/functions/getlogobydomain`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': appId
      },
      body: JSON.stringify({ domain: publicHost })
    },
    8000
  );

  if (!response) return { state: 'unknown', detail: 'sem resposta do endpoint getlogobydomain' };
  if (!response.ok) return { state: 'unknown', detail: `HTTP ${response.status} em getlogobydomain` };

  try {
    const parsed = JSON.parse(response.body) as { result?: { user?: string } };
    if (parsed.result?.user === 'exist') return { state: 'exist', detail: 'tenant/admin já registrado' };
    if (parsed.result?.user === 'not_exist') return { state: 'not_exist', detail: 'nenhum admin registrado ainda' };
    return { state: 'unknown', detail: 'resposta sem campo result.user' };
  } catch {
    return { state: 'unknown', detail: 'resposta inválida de getlogobydomain' };
  }
}

export interface ApiProbeResult {
  configured: boolean;
  reachable: boolean;
  status: number;
  detail: string;
}

/**
 * Testa a API v1.1 SOMENTE quando existe token real configurado.
 * Nunca inventa credenciais e nunca trata ausência de token como sucesso.
 */
export async function probeApiToken(
  apiBaseUrl: string,
  apiToken: string | undefined
): Promise<ApiProbeResult> {
  if (!apiToken || !apiToken.trim()) {
    return {
      configured: false,
      reachable: false,
      status: 0,
      detail: 'OPENSIGN_API_TOKEN não configurado'
    };
  }

  const url = `${apiBaseUrl.replace(/\/+$/, '')}/getuser`;
  const response = await tryHttpRequest(
    url,
    { headers: { 'x-api-token': apiToken, Accept: 'application/json' } },
    10000
  );

  if (!response) {
    return { configured: true, reachable: false, status: 0, detail: `sem resposta de ${url}` };
  }
  return {
    configured: true,
    reachable: response.ok,
    status: response.status,
    detail: response.ok ? 'token aceito por /getuser' : `HTTP ${response.status} em /getuser`
  };
}

/**
 * URL pública a mostrar ao operador: usa HOST_URL já gravado no .env
 * (correto mesmo em Codespaces) e só cai para http://localhost:<porta>
 * quando o arquivo ainda não existe.
 */
export function opensignPublicUrl(env: Map<string, string>, port: number): string {
  const hostUrl = env.get('HOST_URL');
  return hostUrl && hostUrl.trim() ? hostUrl.trim().replace(/\/+$/, '') : `http://localhost:${port}`;
}

export function apiBaseUrlFromEnv(env: Map<string, string>, port: number): string {
  const explicit = env.get('OPENSIGN_API_BASE_URL');
  if (explicit && explicit.trim()) return explicit.trim();
  const publicUrl = env.get('HOST_URL') || `http://localhost:${port}`;
  return `${publicUrl.replace(/\/+$/, '')}/api/v1.1`;
}

export async function portState(port: number): Promise<'free' | 'busy'> {
  return (await isPortOpen(port)) ? 'busy' : 'free';
}
