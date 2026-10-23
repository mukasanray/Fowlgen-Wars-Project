import { DEFAULT_OPTIONS } from './defaults';
import type { InstallOptions } from './types';

export interface ParsedArgs {
  options: InstallOptions;
  errors: string[];
}

type BooleanOptionKey =
  | 'checkOnly'
  | 'withOpenSign'
  | 'skipOpenSign'
  | 'interactive'
  | 'force'
  | 'json'
  | 'help'
  | 'backupOpenSign'
  | 'restoreOpenSignEnv';

const BOOLEAN_FLAGS: Record<string, BooleanOptionKey> = {
  '--check': 'checkOnly',
  '--verify': 'checkOnly',
  '--with-opensign': 'withOpenSign',
  '--skip-opensign': 'skipOpenSign',
  '--non-interactive': 'interactive',
  '--force': 'force',
  '--reinstall': 'force',
  '--json': 'json',
  '--help': 'help',
  '-h': 'help',
  '--backup-opensign': 'backupOpenSign',
  '--restore-opensign-env': 'restoreOpenSignEnv'
};

/**
 * Interpreta a linha de comando sem lançar exceção.
 * Flags booleanas invertidas (--no-start / --non-interactive) são tratadas
 * explicitamente para manter o comportamento previsível.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const options: InstallOptions = { ...DEFAULT_OPTIONS };
  const errors: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw || raw === '--') continue;

    const [flag, inlineValue] = raw.startsWith('--') && raw.includes('=')
      ? [raw.slice(0, raw.indexOf('=')), raw.slice(raw.indexOf('=') + 1)]
      : [raw, undefined];

    if (flag === '--port' || flag === '--kanban-port' || flag === '--opensign-port') {
      const value = inlineValue ?? argv[i + 1];
      if (inlineValue === undefined) i += 1;
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        errors.push(`Valor de porta inválido para ${flag}: "${value ?? ''}"`);
        continue;
      }
      if (flag === '--opensign-port') options.opensignPort = parsed;
      else options.kanbanPort = parsed;
      continue;
    }

    if (flag === '--no-start') {
      options.start = false;
      continue;
    }

    if (flag === '--restore-opensign') {
      const value = inlineValue ?? argv[i + 1];
      if (inlineValue === undefined) i += 1;
      if (!value) {
        errors.push('--restore-opensign requer um caminho de backup ou "latest".');
        continue;
      }
      options.restoreOpenSign = value;
      continue;
    }

    const key = BOOLEAN_FLAGS[flag];
    if (!key) {
      errors.push(`Flag desconhecida: ${flag}`);
      continue;
    }

    if (flag === '--non-interactive') options.interactive = false;
    else options[key] = true;
  }

  if (options.withOpenSign && options.skipOpenSign) {
    errors.push('Use apenas uma das flags: --with-opensign ou --skip-opensign.');
  }
  if (options.kanbanPort === options.opensignPort) {
    errors.push('As portas do Kanban e do OpenSign precisam ser diferentes.');
  }

  return { options, errors };
}

export function helpText(): string {
  return [
    'Uso: npm run setup -- [flags]',
    '',
    'Flags:',
    '  --check, --verify     Apenas verifica o ambiente (não altera nada)',
    '  --with-opensign       Inclui/força o OpenSign (requer Docker)',
    '  --skip-opensign       Ignora o OpenSign',
    '  --no-start            Não inicia servidor Kanban nem containers',
    '  --non-interactive     Não faz perguntas (padrão quando não há TTY)',
    '  --force, --reinstall  Regera artefatos gerados e revalida tudo',
    '  --kanban-port <n>     Porta do Kanban Studio (padrão 3000)',
    '  --opensign-port <n>   Porta pública do OpenSign (padrão 3001)',
    '  --json                Imprime o relatório final em JSON',
    '  --backup-opensign     Faz backup do OpenSign (MongoDB + arquivos + .env) e sai',
    '  --restore-opensign <caminho|latest>',
    '                        Restaura um backup do OpenSign (MongoDB + arquivos) e sai',
    '  --restore-opensign-env',
    '                        Ao restaurar, também sobrescreve .env.opensign.local',
    '                        (o atual é preservado como .before-restore-<data>)',
    '  -h, --help            Mostra esta ajuda',
    '',
    'Códigos de saída: 0 sucesso, 1 falha, 2 pré-requisitos ausentes, 3 abortado.'
  ].join('\n');
}
