// Tipos compartilhados do instalador do Kanban Studio.
// Mantidos sem dependências para poderem ser testados com node:test.

export type CheckStatus = 'ok' | 'warning' | 'failed' | 'skipped' | 'blocked';

export interface CheckResult {
  id: string;
  title: string;
  status: CheckStatus;
  detail?: string;
  remediation?: string;
  durationMs: number;
}

export const EXIT_CODES = {
  success: 0,
  failure: 1,
  prerequisites: 2,
  aborted: 3
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

export interface InstallOptions {
  /** Apenas verifica o ambiente; não cria arquivos, não inicia serviços. */
  checkOnly: boolean;
  /** Força a inclusão do OpenSign. */
  withOpenSign: boolean;
  /** Força a exclusão do OpenSign. */
  skipOpenSign: boolean;
  /** Não inicia servidor Kanban nem containers. */
  start: boolean;
  /** Permite perguntas interativas. */
  interactive: boolean;
  /** Regera artefatos gerados (env ausente, dashboard, etc.). */
  force: boolean;
  /** Emite o relatório final em JSON no stdout. */
  json: boolean;
  help: boolean;
  kanbanPort: number;
  opensignPort: number;
  /** Faz backup do OpenSign (MongoDB + arquivos + .env) e sai, sem rodar o instalador. */
  backupOpenSign: boolean;
}

export interface InstallReport {
  generatedAt: string;
  mode: 'check' | 'install';
  ok: boolean;
  exitCode: ExitCode;
  options: InstallOptions;
  checks: CheckResult[];
}

export function summarize(checks: CheckResult[]): {
  ok: boolean;
  failed: CheckResult[];
  warnings: CheckResult[];
  blocked: CheckResult[];
} {
  const failed = checks.filter((c) => c.status === 'failed');
  const warnings = checks.filter((c) => c.status === 'warning');
  const blocked = checks.filter((c) => c.status === 'blocked');
  return { ok: failed.length === 0, failed, warnings, blocked };
}
