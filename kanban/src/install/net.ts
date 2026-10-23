import * as net from 'net';

export interface HttpResponse {
  status: number;
  ok: boolean;
  body: string;
  contentType: string;
}

export const DEFAULT_HTTP_TIMEOUT_MS = 5000;

export async function httpRequest(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_HTTP_TIMEOUT_MS
): Promise<HttpResponse> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs)
  });
  const body = await response.text();
  return {
    status: response.status,
    ok: response.ok,
    body,
    contentType: response.headers.get('content-type') ?? ''
  };
}

export async function tryHttpRequest(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_HTTP_TIMEOUT_MS
): Promise<HttpResponse | null> {
  try {
    return await httpRequest(url, init, timeoutMs);
  } catch {
    return null;
  }
}

export interface WaitOptions {
  timeoutMs: number;
  intervalMs?: number;
  probe: () => Promise<boolean>;
}

export async function waitFor({ timeoutMs, intervalMs = 1000, probe }: WaitOptions): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  do {
    if (await probe()) return true;
    if (Date.now() >= deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  } while (Date.now() < deadline);
  return false;
}

/** Verifica se algo está escutando na porta (sem encerrar processo algum). */
export function isPortOpen(port: number, host = '127.0.0.1', timeoutMs = 800): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (open: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(open);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

export async function findFreePort(start: number, attempts = 50, host = '127.0.0.1'): Promise<number | null> {
  for (let port = start; port < start + attempts; port += 1) {
    if (!(await isPortOpen(port, host))) return port;
  }
  return null;
}

/** Tenta descobrir o dono da porta apenas para relatório (nunca mata o processo). */
export async function describePortOwner(port: number): Promise<string> {
  if (process.platform === 'win32') return 'processo desconhecido (Windows)';
  try {
    const { execFileSync } = await import('child_process');
    const output = execFileSync('ss', ['-ltnp', `sport = :${port}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 2000
    });
    const match = output.match(/users:\(\("([^"]+)",pid=(\d+)/);
    return match ? `${match[1]} (pid ${match[2]})` : 'processo desconhecido';
  } catch {
    return 'processo desconhecido';
  }
}
