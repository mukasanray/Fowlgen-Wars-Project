import * as fs from 'fs';
import * as path from 'path';

/**
 * Leitura/escrita idempotente de arquivos .env.
 *
 * Regras:
 * - nunca remove chaves existentes (inclusive as que o instalador não conhece);
 * - preserva comentários, linhas em branco e a ordem original;
 * - atualiza somente os valores das chaves desejadas;
 * - recusa valores com quebra de linha (evita injeção de variáveis);
 * - grava com permissão 0600.
 */

export type EnvLineKind = 'blank' | 'comment' | 'pair' | 'invalid';

export interface EnvLine {
  kind: EnvLineKind;
  raw: string;
  key?: string;
  value?: string;
}

export interface ParsedEnv {
  entries: Map<string, string>;
  lines: EnvLine[];
}

export interface MergeResult {
  content: string;
  addedKeys: string[];
  updatedKeys: string[];
  unchangedKeys: string[];
}

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function unquote(value: string): string {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if (first === '"' && last === '"') {
      return value.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    if (first === "'" && last === "'") return value.slice(1, -1);
  }
  return value;
}

function stripInlineComment(value: string): string {
  // Comentário inline só é reconhecido quando precedido por espaço,
  // preservando valores como "abc#123".
  const match = value.match(/\s+#/);
  return match ? value.slice(0, match.index).trimEnd() : value;
}

export function parseEnv(content: string): ParsedEnv {
  const entries = new Map<string, string>();
  const lines: EnvLine[] = [];

  for (const raw of content.split(/\r?\n/)) {
    const trimmed = raw.trim();
    if (!trimmed) {
      lines.push({ kind: 'blank', raw });
      continue;
    }
    if (trimmed.startsWith('#')) {
      lines.push({ kind: 'comment', raw });
      continue;
    }

    const withoutExport = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const separator = withoutExport.indexOf('=');
    if (separator < 1) {
      lines.push({ kind: 'invalid', raw });
      continue;
    }

    const key = withoutExport.slice(0, separator).trim();
    if (!KEY_PATTERN.test(key)) {
      lines.push({ kind: 'invalid', raw });
      continue;
    }

    const value = unquote(stripInlineComment(withoutExport.slice(separator + 1).trim()));
    entries.set(key, value);
    lines.push({ kind: 'pair', raw, key, value });
  }

  return { entries, lines };
}

export function assertSafeEnvValue(key: string, value: string): void {
  if (/[\r\n]/.test(value)) {
    throw new Error(`Valor inválido para ${key}: quebra de linha não é permitida em arquivos .env.`);
  }
}

function serializeValue(value: string): string {
  if (value === '') return '';
  if (/[\s#"']/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

export function mergeEnv(existing: string, desired: Record<string, string>): MergeResult {
  const parsed = parseEnv(existing);
  const addedKeys: string[] = [];
  const updatedKeys: string[] = [];
  const unchangedKeys: string[] = [];

  const lines = parsed.lines.map((line) => {
    if (line.kind !== 'pair' || !line.key) return line.raw;
    if (!(line.key in desired)) return line.raw;

    const nextValue = desired[line.key];
    assertSafeEnvValue(line.key, nextValue);
    if (line.value === nextValue) {
      unchangedKeys.push(line.key);
      return line.raw;
    }
    updatedKeys.push(line.key);
    return `${line.key}=${serializeValue(nextValue)}`;
  });

  for (const [key, value] of Object.entries(desired)) {
    if (parsed.entries.has(key)) continue;
    assertSafeEnvValue(key, value);
    addedKeys.push(key);
    lines.push(`${key}=${serializeValue(value)}`);
  }

  while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
  return { content: `${lines.join('\n')}\n`, addedKeys, updatedKeys, unchangedKeys };
}

export interface EnsureEnvResult {
  path: string;
  created: boolean;
  changed: boolean;
  addedKeys: string[];
  updatedKeys: string[];
}

export function ensureEnvFile(
  envPath: string,
  desired: Record<string, string>,
  options: { force?: boolean } = {}
): EnsureEnvResult {
  const created = !fs.existsSync(envPath);
  const existing = created ? '' : fs.readFileSync(envPath, 'utf8');
  const result = mergeEnv(existing, desired);

  const changed = created || result.content !== normalize(existing);
  if (changed) {
    fs.mkdirSync(path.dirname(envPath), { recursive: true });
    fs.writeFileSync(envPath, result.content, { encoding: 'utf8', mode: 0o600 });
  }
  // Garante 0600 mesmo quando o arquivo já existia com permissões amplas.
  try {
    fs.chmodSync(envPath, 0o600);
  } catch {
    // Sistemas de arquivos sem suporte a chmod (ex.: alguns mounts Windows).
  }

  if (options.force && !created && result.content === normalize(existing)) {
    fs.writeFileSync(envPath, result.content, { encoding: 'utf8', mode: 0o600 });
  }

  return {
    path: envPath,
    created,
    changed,
    addedKeys: result.addedKeys,
    updatedKeys: result.updatedKeys
  };
}

function normalize(content: string): string {
  if (!content) return '';
  return content.endsWith('\n') ? content : `${content}\n`;
}

export function readEnvFile(envPath: string): Map<string, string> {
  if (!fs.existsSync(envPath)) return new Map();
  return parseEnv(fs.readFileSync(envPath, 'utf8')).entries;
}
