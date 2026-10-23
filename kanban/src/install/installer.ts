import * as fs from 'fs';
import * as path from 'path';
import { validateCompose, describeContainers, composeContainers } from './docker';
import { checkEnvPermissions, detectAdminState, inspectReadiness, apiBaseUrlFromEnv, opensignPublicUrl, prepareOpenSignEnv, probeApiToken, startOpenSign, OPENSIGN_ENV_FILENAME } from './opensign';
import { readEnvFile } from './env-file';
import { checkPrerequisites } from './prerequisites';
import { buildServer, checkDashboard, typecheck } from './quality';
import { ensureGitignore, ensureKanbanServer, generateDashboard, prepareRuntimeDirs, probeKanban } from './kanban';
import { log } from './logger';
import { isPortOpen } from './net';
import { EXIT_CODES, summarize, type CheckResult, type InstallOptions, type InstallReport } from './types';

const BLOCKING_PREREQUISITES = new Set(['node', 'git', 'node_modules']);

export class Installer {
  private readonly checks: CheckResult[] = [];

  constructor(
    private readonly projectRoot: string,
    private readonly options: InstallOptions
  ) {}

  private add(check: CheckResult): CheckResult {
    this.checks.push(check);
    switch (check.status) {
      case 'ok':
        log.ok(`${check.title}: ${check.detail ?? 'ok'}`);
        break;
      case 'warning':
        log.warn(`${check.title}: ${check.detail ?? ''}`);
        if (check.remediation) log.info(check.remediation);
        break;
      case 'failed':
        log.error(`${check.title}: ${check.detail ?? 'falhou'}`);
        if (check.remediation) log.info(check.remediation);
        break;
      case 'blocked':
        log.warn(`${check.title}: BLOQUEADO — ${check.detail ?? ''}`);
        if (check.remediation) log.info(check.remediation);
        break;
      case 'skipped':
        log.info(`${check.title}: ignorado (${check.detail ?? 'sem ação'})`);
        break;
    }
    return check;
  }

  private empty(id: string, title: string, status: CheckResult['status'], detail: string): CheckResult {
    return { id, title, status, detail, durationMs: 0 };
  }

  shouldIncludeOpenSign(): boolean {
    if (this.options.withOpenSign) return true;
    if (this.options.skipOpenSign) return false;
    return fs.existsSync(path.join(this.projectRoot, OPENSIGN_ENV_FILENAME));
  }

  async run(): Promise<InstallReport> {
    const mode = this.options.checkOnly ? 'check' : 'install';
    log.blank();
    log.raw('='.repeat(58));
    log.raw(`   🐔 FOWLGEN WARS — ${mode === 'check' ? 'VERIFICAÇÃO' : 'INSTALAÇÃO'} DO KANBAN`);
    log.raw('='.repeat(58));

    const includeOpenSign = this.shouldIncludeOpenSign();
    let opensignEnv = new Map<string, string>();

    log.step('Pré-requisitos');
    for (const check of checkPrerequisites(this.projectRoot, { requireDocker: includeOpenSign })) {
      this.add(check);
    }

    const blockingFailure = this.checks.some(
      (check) => BLOCKING_PREREQUISITES.has(check.id) && check.status === 'failed'
    );
    if (blockingFailure) {
      return this.finish(mode);
    }

    if (includeOpenSign) {
      log.step('OpenSign — ambiente');
      const prepared = prepareOpenSignEnv(this.projectRoot, {
        port: this.options.opensignPort,
        checkOnly: this.options.checkOnly
      });
      opensignEnv = prepared.env;

      if (!prepared.exists) {
        this.add({
          id: 'opensign-env',
          title: 'Ambiente OpenSign',
          status: 'failed',
          detail: `${OPENSIGN_ENV_FILENAME} não existe`,
          remediation: 'Rode "npm run setup -- --with-opensign" para gerar o arquivo com segredos locais.',
          durationMs: 0
        });
      } else {
        const permissions = checkEnvPermissions(path.join(this.projectRoot, OPENSIGN_ENV_FILENAME));
        this.add({
          id: 'opensign-env',
          title: 'Ambiente OpenSign',
          status: permissions.ok ? 'ok' : 'warning',
          detail: [
            prepared.created ? 'criado' : 'existente',
            permissions.ok ? `permissões ${permissions.mode}` : `permissões ${permissions.mode} (recomendado 600)`,
            prepared.addedKeys.length > 0 ? `chaves adicionadas: ${prepared.addedKeys.length}` : '',
            prepared.generatedKeys.length > 0 ? `segredos gerados: ${prepared.generatedKeys.join(', ')}` : ''
          ].filter(Boolean).join(' · '),
          remediation: permissions.ok ? undefined : 'Execute: chmod 600 kanban/.env.opensign.local',
          durationMs: 0
        });
      }
    }

    log.step('Estrutura do projeto');
    this.add(prepareRuntimeDirs(this.projectRoot, { checkOnly: this.options.checkOnly }));
    this.add(this.options.checkOnly
      ? this.checkGitignore()
      : ensureGitignore(this.projectRoot, { checkOnly: false }));

    log.step('Qualidade do código');
    this.add(typecheck(this.projectRoot));

    if (!this.options.checkOnly) {
      this.add(await generateDashboard(this.projectRoot));
      this.add(buildServer(this.projectRoot));
    } else {
      this.add(checkDashboard(this.projectRoot));
    }

    log.step('Servidor Kanban');
    if (this.options.checkOnly) {
      const probe = await probeKanban(this.options.kanbanPort);
      this.add({
        id: 'kanban-server',
        title: 'Servidor Kanban',
        status: probe.ours ? 'ok' : 'warning',
        detail: probe.detail,
        remediation: probe.ours ? undefined : `Inicie com "npm run app" (porta ${this.options.kanbanPort}).`,
        durationMs: 0
      });
    } else {
      const apiToken = opensignEnv.get('OPENSIGN_API_TOKEN');
      const webhookSecret = opensignEnv.get('OPENSIGN_WEBHOOK_SECRET');
      const apiBaseUrl = opensignEnv.get('OPENSIGN_API_BASE_URL');
      const result = await ensureKanbanServer(this.projectRoot, this.options.kanbanPort, {
        start: this.options.start,
        extraEnv: {
          OPENSIGN_PUBLIC_URL: `http://localhost:${this.options.opensignPort}`,
          ...(apiToken ? { OPENSIGN_API_TOKEN: apiToken } : {}),
          ...(webhookSecret ? { OPENSIGN_WEBHOOK_SECRET: webhookSecret } : {}),
          ...(apiBaseUrl ? { OPENSIGN_API_BASE_URL: apiBaseUrl } : {})
        }
      });
      this.add(result.check);
    }

    if (includeOpenSign) {
      await this.runOpenSignStage(opensignEnv);
    } else {
      log.step('OpenSign');
      this.add(this.empty('opensign', 'OpenSign', 'skipped', 'não solicitado (--skip-opensign ou sem .env.opensign.local)'));
    }

    return this.finish(mode);
  }

  private checkGitignore(): CheckResult {
    const gitignorePath = path.join(this.projectRoot, '..', '.gitignore');
    const startedAt = Date.now();
    if (!fs.existsSync(gitignorePath)) {
      return {
        id: 'gitignore',
        title: '.gitignore',
        status: 'warning',
        detail: '.gitignore da raiz não encontrado',
        durationMs: Date.now() - startedAt
      };
    }
    const content = fs.readFileSync(gitignorePath, 'utf8');
    const ok = content.includes('kanban/logs/') && content.includes('kanban/docs/kanban-dashboard.');
    return {
      id: 'gitignore',
      title: '.gitignore',
      status: ok ? 'ok' : 'warning',
      detail: ok ? 'artefatos gerados estão ignorados' : 'faltam regras para kanban/logs ou dashboard',
      remediation: ok ? undefined : 'Rode "npm run setup" para atualizar o .gitignore.',
      durationMs: Date.now() - startedAt
    };
  }

  private async runOpenSignStage(env: Map<string, string>): Promise<void> {
    if (env.size === 0) {
      this.add(this.empty('opensign', 'OpenSign', 'skipped', 'sem arquivo de ambiente'));
      return;
    }

    log.step('OpenSign — configuração do Compose');
    if (this.options.checkOnly) {
      const compose = validateCompose(this.projectRoot);
      this.add({
        id: 'opensign-compose',
        title: 'docker-compose.dev.yml',
        status: compose.ok ? 'ok' : 'failed',
        detail: compose.ok ? 'configuração válida' : compose.output.split(/\r?\n/).slice(-6).join(' '),
        remediation: compose.ok ? undefined : 'Corrija o compose antes de subir os containers.',
        durationMs: 0
      });
    } else {
      const compose = validateCompose(this.projectRoot);
      this.add({
        id: 'opensign-compose',
        title: 'docker-compose.dev.yml',
        status: compose.ok ? 'ok' : 'failed',
        detail: compose.ok ? 'configuração válida' : compose.output.split(/\r?\n/).slice(-6).join(' '),
        remediation: compose.ok ? undefined : 'Corrija o compose antes de subir os containers.',
        durationMs: 0
      });
      if (!compose.ok) {
        this.add(this.empty('opensign', 'OpenSign', 'skipped', 'compose inválido'));
        return;
      }
    }

    log.step('OpenSign — containers');
    if (!this.options.start) {
      this.add(this.empty('opensign-start', 'Containers OpenSign', 'skipped', '--no-start'));
    } else if (!this.options.checkOnly) {
      const start = await startOpenSign(this.projectRoot, this.options.opensignPort);
      this.add({
        id: 'opensign-start',
        title: 'Containers OpenSign',
        status: start.ready ? 'ok' : 'failed',
        detail: start.alreadyRunning
          ? 'já estavam saudáveis'
          : `${start.ready ? 'iniciados' : 'falharam'} · ${start.containers}${start.error ? ` · ${start.error}` : ''}`,
        remediation: start.ready ? undefined : 'Veja "npm run opensign:status" e os logs do serviço opensign-server.',
        durationMs: 0
      });
      if (!start.ready) {
        this.add(this.empty('opensign', 'OpenSign', 'skipped', 'containers não ficaram prontos'));
        return;
      }
    } else {
      const busy = await isPortOpen(this.options.opensignPort);
      this.add({
        id: 'opensign-start',
        title: 'Containers OpenSign',
        status: busy ? 'ok' : 'warning',
        detail: busy ? 'porta publicada e respondendo' : `nada escutando em 127.0.0.1:${this.options.opensignPort}`,
        remediation: busy ? undefined : 'Rode "npm run setup -- --with-opensign" para subir o OpenSign.',
        durationMs: 0
      });
    }

    log.step('OpenSign — saúde e proxy');
    const readiness = await inspectReadiness(this.options.opensignPort);
    const backendDetail = `backend=${readiness.backend?.status ?? 'sem resposta'}${readiness.backendOk ? ' (json ok)' : ''}`;
    const uiDetail = `ui=${readiness.ui?.status ?? 'sem resposta'}${readiness.uiOk ? ' (html ok)' : ''}`;
    this.add({
      id: 'opensign-health',
      title: 'OpenSign /api/app/health + UI',
      status: readiness.ready ? 'ok' : 'failed',
      detail: `${backendDetail} · ${uiDetail}`,
      remediation: readiness.ready
        ? undefined
        : readiness.backend?.status === 502 || readiness.ui?.status === 502
          ? 'HTTP 502 indica falha Caddy → containers. Verifique se os containers estão na mesma rede e se o host permite tráfego entre bridges (iptables-legacy FORWARD DROP bloqueia; libere a interface br-*).'
          : 'Verifique Caddy → opensign-server:8080, a dependência do Mongo e os logs de opensign-server.',
      durationMs: 0
    });
    this.add({
      id: 'opensign-addadmin-page',
      title: 'Página /addadmin',
      status: readiness.addadmin?.status === 200 && readiness.addadmin.contentType.includes('text/html') ? 'ok' : 'warning',
      detail: `HTTP ${readiness.addadmin?.status ?? 'sem resposta'} ${readiness.addadmin?.contentType ?? ''}`.trim(),
      remediation: readiness.addadmin?.status === 200 ? undefined : 'A UI do OpenSign pode não ter sido servida pelo Caddy.',
      durationMs: 0
    });

    const publicUrl = opensignPublicUrl(env, this.options.opensignPort);
    const admin = await detectAdminState(this.options.opensignPort, env.get('APP_ID') || 'opensign');
    this.add({
      id: 'opensign-admin',
      title: 'Administrador OpenSign',
      status: admin.state === 'exist' ? 'ok' : admin.state === 'not_exist' ? 'warning' : 'warning',
      detail: admin.detail,
      remediation: admin.state === 'exist'
        ? undefined
        : `Cadastre o admin em ${publicUrl}/addadmin (o fluxo addadmin é público no OpenSign — não exponha a porta sem proxy/rede confiável).`,
      durationMs: 0
    });

    log.step('OpenSign — API v1.1');
    const apiBaseUrl = apiBaseUrlFromEnv(env, this.options.opensignPort);
    const probe = await probeApiToken(apiBaseUrl, env.get('OPENSIGN_API_TOKEN'));
    if (!probe.configured) {
      this.add({
        id: 'opensign-api',
        title: 'API v1.1 (x-api-token)',
        status: 'blocked',
        detail: `${probe.detail} em ${apiBaseUrl}`,
        remediation: 'Gere um token no OpenSign (Settings → API Token). O self-host gratuito não expõe a API v1.1; use o plano cloud/enterprise. Nenhuma credencial foi inventada.',
        durationMs: 0
      });
    } else {
      this.add({
        id: 'opensign-api',
        title: 'API v1.1 (x-api-token)',
        status: probe.reachable ? 'ok' : 'failed',
        detail: `${probe.detail} em ${apiBaseUrl}`,
        remediation: probe.reachable ? undefined : 'Confirme OPENSIGN_API_BASE_URL (padrão: <host>/api/v1.1) e se o plano instalado expõe a API v1.1.',
        durationMs: 0
      });
    }

    if (composeContainers(this.projectRoot).length > 0) {
      log.info(`Containers: ${describeContainers(composeContainers(this.projectRoot))}`);
    }
  }

  private finish(mode: 'check' | 'install'): InstallReport {
    const summary = summarize(this.checks);
    const blockingFailure = this.checks.some(
      (check) => BLOCKING_PREREQUISITES.has(check.id) && check.status === 'failed'
    );
    const exitCode = blockingFailure
      ? EXIT_CODES.prerequisites
      : summary.ok
        ? EXIT_CODES.success
        : EXIT_CODES.failure;

    const report: InstallReport = {
      generatedAt: new Date().toISOString(),
      mode,
      ok: summary.ok,
      exitCode,
      options: this.options,
      checks: this.checks
    };

    this.printSummary(summary);

    if (mode === 'install') {
      this.writeReports(report);
    }

    return report;
  }

  private printSummary(summary: ReturnType<typeof summarize>): void {
    log.blank();
    log.raw('='.repeat(58));
    log.raw(
      `   ${summary.ok ? '✅ INSTALAÇÃO/VERIFICAÇÃO CONCLUÍDA' : '❌ FALHAS ENCONTRADAS'} — ` +
      `${this.checks.length} checagens · ${summary.failed.length} falha(s) · ${summary.warnings.length} aviso(s) · ${summary.blocked.length} bloqueio(s)`
    );
    log.raw('='.repeat(58));

    if (summary.failed.length > 0) {
      log.raw('\nFalhas:');
      for (const check of summary.failed) {
        log.raw(` - ${check.id}: ${check.detail ?? ''}${check.remediation ? ` → ${check.remediation}` : ''}`);
      }
    }
    if (summary.blocked.length > 0) {
      log.raw('\nBloqueios externos (não impedem o uso do Kanban):');
      for (const check of summary.blocked) {
        log.raw(` - ${check.id}: ${check.detail ?? ''}`);
      }
    }
    if (summary.ok) {
      log.raw(`\nKanban: http://localhost:${this.options.kanbanPort}`);
      if (this.shouldIncludeOpenSign()) {
        const envPath = path.join(this.projectRoot, OPENSIGN_ENV_FILENAME);
        const env = fs.existsSync(envPath) ? readEnvFile(envPath) : new Map<string, string>();
        const publicUrl = opensignPublicUrl(env, this.options.opensignPort);
        log.raw(`OpenSign: ${publicUrl} · admin: ${publicUrl}/addadmin`);
      }
    }
  }

  private writeReports(report: InstallReport): void {
    const logsDir = path.join(this.projectRoot, 'logs');
    try {
      fs.mkdirSync(logsDir, { recursive: true });
      fs.writeFileSync(
        path.join(logsDir, 'install-report.json'),
        `${JSON.stringify(report, null, 2)}\n`,
        'utf8'
      );

      const historyPath = path.join(logsDir, 'install-log.json');
      let history: unknown[] = [];
      if (fs.existsSync(historyPath)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
          history = Array.isArray(parsed) ? parsed : [];
        } catch {
          history = [];
        }
      }
      history.push({
        timestamp: report.generatedAt,
        status: report.ok ? 'completed' : 'failed',
        mode: report.mode,
        failed: report.checks.filter((check) => check.status === 'failed').map((check) => check.id),
        warnings: report.checks.filter((check) => check.status === 'warning').map((check) => check.id),
        blocked: report.checks.filter((check) => check.status === 'blocked').map((check) => check.id)
      });
      fs.writeFileSync(historyPath, `${JSON.stringify(history, null, 2)}\n`, 'utf8');
      log.info('Relatório: logs/install-report.json (histórico em logs/install-log.json)');
    } catch (error) {
      log.warn(`Não foi possível gravar o relatório: ${(error as Error).message}`);
    }
  }
}
