const SECRET_ASSIGNMENT = /\b([A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PASSWD|MASTER_KEY|PRIVATE_KEY|API_KEY|APIKEY)[A-Z0-9_]*)=([^\s]+)/g;

/** Mascara valores sensíveis em textos de log (pares CHAVE=valor). */
export function redactText(text: string): string {
  return text.replace(SECRET_ASSIGNMENT, (_match, key: string) => `${key}=***`);
}

export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (/token|secret|key|password/i.test(key)) parsed.searchParams.set(key, '***');
    }
    return parsed.toString();
  } catch {
    return redactText(url);
  }
}

type LogLevel = 'info' | 'ok' | 'warn' | 'error' | 'step';

const PREFIX: Record<LogLevel, string> = {
  info: '   ℹ️',
  ok: '   ✅',
  warn: '   ⚠️',
  error: '   ❌',
  step: '\n▶'
};

function emit(level: LogLevel, message: string): void {
  const line = `${PREFIX[level]} ${redactText(message)}`;
  if (level === 'error') console.error(line);
  else console.log(line);
}

export const log = {
  info: (message: string) => emit('info', message),
  ok: (message: string) => emit('ok', message),
  warn: (message: string) => emit('warn', message),
  error: (message: string) => emit('error', message),
  step: (message: string) => emit('step', message),
  raw: (message: string) => console.log(message),
  blank: () => console.log('')
};
