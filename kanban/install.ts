import * as path from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';
import { execSync } from 'child_process';
import { parseArgs, helpText } from './src/install/args';
import { DEFAULT_OPTIONS } from './src/install/defaults';
import { Installer } from './src/install/installer';
import { log } from './src/install/logger';
import { composeContainers, describeContainers, stopOpenSignStack } from './src/install/docker';
import { detectAdminState, inspectReadiness, opensignPublicUrl, prepareOpenSignEnv, startOpenSign, OPENSIGN_ENV_FILENAME } from './src/install/opensign';
import { backupOpenSign, listOpenSignBackups, resolveBackupDir, restoreOpenSign } from './src/install/backup';
import { readEnvFile } from './src/install/env-file';
import { ensureKanbanServer, openBrowser } from './src/install/kanban';
import { EXIT_CODES, type InstallOptions, type InstallReport } from './src/install/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_WINDOWS = process.platform === 'win32';

function opensignUrl(port: number): string {
  const envPath = path.join(__dirname, OPENSIGN_ENV_FILENAME);
  return opensignPublicUrl(readEnvFile(envPath), port);
}

function askQuestion(query: string, defaultValue = ''): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${query}${defaultValue ? ` [${defaultValue}]` : ''}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

export class InstallSetup {
  async run(argv: string[] = process.argv.slice(2)): Promise<number> {
    const { options, errors } = parseArgs(argv);

    if (options.help) {
      console.log(helpText());
      return EXIT_CODES.success;
    }

    if (options.backupOpenSign) {
      this.runOpenSignBackup();
      const lastBackup = listOpenSignBackups(path.join(__dirname, 'backups', 'opensign'))[0];
      return lastBackup?.ok ? EXIT_CODES.success : EXIT_CODES.failure;
    }

    if (options.restoreOpenSign) {
      const ok = this.runOpenSignRestore(options.restoreOpenSign, { restoreEnv: options.restoreOpenSignEnv });
      return ok ? EXIT_CODES.success : EXIT_CODES.failure;
    }

    if (errors.length > 0) {
      for (const error of errors) log.error(error);
      log.info('Use "npm run setup -- --help" para ver as flags disponíveis.');
      return EXIT_CODES.failure;
    }

    if (options.interactive && !options.checkOnly && !options.withOpenSign && !options.skipOpenSign) {
      const scope = await this.askInstallationScope();
      options.withOpenSign = scope === 'kanban-opensign';
      options.skipOpenSign = scope === 'kanban';
    }

    const report = await new Installer(__dirname, options).run();
    if (options.json) console.log(JSON.stringify(report, null, 2));

    if (options.interactive && !options.checkOnly && report.exitCode === EXIT_CODES.success) {
      await this.showMenu(options);
    }

    return report.exitCode;
  }

  private async askInstallationScope(): Promise<'kanban' | 'kanban-opensign'> {
    console.log('\n📦 O que deseja instalar?');
    console.log('   [1] 🗂️  Somente Kanban');
    console.log('   [2] ✍️  Kanban + OpenSign');
    let choice = '';
    while (choice !== '1' && choice !== '2') {
      choice = await askQuestion('👉 Escolha uma opção', '1');
      if (choice !== '1' && choice !== '2') console.log('   ⚠️ Escolha 1 ou 2.');
    }
    return choice === '2' ? 'kanban-opensign' : 'kanban';
  }

  async showMenu(baseOptions: InstallOptions = DEFAULT_OPTIONS): Promise<void> {
    let running = true;
    while (running) {
      console.log('\n' + '='.repeat(54));
      console.log('   🐔 FOWLGEN WARS — KANBAN STUDIO MENU');
      console.log('='.repeat(54));
      console.log('   [1] 🌐 Iniciar Servidor Web (http://localhost:3000)');
      console.log('   [2] 💻 Iniciar Aplicativo Desktop (Electron)');
      console.log('   [3] 📊 Gerar / Atualizar Dashboard (Markdown e HTML)');
      console.log('   [4] 📋 Visualizar Status no Terminal');
      console.log('   [5] 🔍 Diagnóstico e Integridade do Ambiente');
      console.log('   [6] 🔄 Sincronizar com GitHub Projects');
      console.log('   [7] 🔧 Reexecutar Instalação / Verificação Completa');
      console.log('   [8] 🚀 Deploy / Inicializar OpenSign & Codespaces');
      console.log('   [0] 🚪 Sair');
      console.log('='.repeat(54));

      const choice = await askQuestion('👉 Digite o número da opção desejada: ');
      switch (choice) {
        case '1': {
          const server = await ensureKanbanServer(__dirname, baseOptions.kanbanPort, { start: true });
          if (server.check.status === 'ok') {
            openBrowser(`http://localhost:${baseOptions.kanbanPort}`);
            const readiness = await inspectReadiness(baseOptions.opensignPort);
            if (readiness.ready) {
              const publicUrl = opensignUrl(baseOptions.opensignPort);
              console.log(`   📡 OpenSign também está rodando em ${publicUrl}`);
              console.log(`   👤 Admin: ${publicUrl}/addadmin`);
            } else {
              console.log('   ℹ️ OpenSign não está rodando. Use a opção [8] → [1] para iniciar.');
            }
          }
          break;
        }
        case '2':
          this.executeNpm('run app:desktop');
          break;
        case '3':
          this.executeNpm('run dashboard');
          break;
        case '4':
          this.executeNpm('run status');
          break;
        case '5': {
          await new Installer(__dirname, { ...baseOptions, checkOnly: true, interactive: false }).run();
          break;
        }
        case '6':
          this.executeNpm('run sync');
          break;
        case '7': {
          await new Installer(__dirname, { ...baseOptions, interactive: false, force: true }).run();
          break;
        }
        case '8':
          await this.manageOpenSignDeployment(baseOptions);
          break;
        case '0':
          console.log('\n👋 Até logo! Bons códigos no Fowlgen Wars.');
          running = false;
          break;
        default:
          console.log('\n⚠️  Opção inválida. Digite um número de 0 a 8.');
      }
    }
  }

  private async manageOpenSignDeployment(options: InstallOptions): Promise<void> {
    const platform = IS_WINDOWS ? 'Windows (Docker Desktop)' : 'Linux (Docker Engine)';
    console.log('\n' + '-'.repeat(54));
    console.log(`   🚀 DEPLOY & OPENSIGN — ${platform}`);
    console.log('-'.repeat(54));
    console.log('   [1] 🐳 Iniciar OpenSign (Docker Compose)');
    console.log('   [2] 🛑 Parar OpenSign (preserva volumes)');
    console.log('   [3] 📊 Status dos containers');
    console.log('   [4] 🔍 Testar saúde, /addadmin e admin');
    console.log('   [5] 💾 Fazer backup (MongoDB + arquivos + segredos)');
    console.log('   [6] 📂 Listar backups já feitos');
    console.log('   [7] ♻️  Restaurar backup (sobrescreve o MongoDB atual)');
    console.log('   [8] 🌐 Abrir GitHub Codespaces');
    console.log('   [0] ↩️  Voltar ao Menu Principal');
    console.log('-'.repeat(54));

    const choice = await askQuestion('👉 Escolha a ação desejada: ');
    switch (choice) {
      case '1': {
        prepareOpenSignEnv(__dirname, { port: options.opensignPort, checkOnly: false });
        const result = await startOpenSign(__dirname, options.opensignPort);
        if (result.ready) {
          const publicUrl = opensignUrl(options.opensignPort);
          log.ok(`OpenSign online em ${publicUrl}`);
          openBrowser(`${publicUrl}/addadmin`);
        } else {
          log.error('OpenSign não ficou pronto. Execute a opção [3] e verifique os logs.');
        }
        break;
      }
      case '2': {
        const result = stopOpenSignStack(__dirname);
        if (result.ok) log.ok('Containers parados (volumes preservados).');
        else log.error(result.output);
        break;
      }
      case '3':
        log.raw(describeContainers(composeContainers(__dirname)));
        break;
      case '4': {
        const readiness = await inspectReadiness(options.opensignPort);
        log.info(`backend=${readiness.backend?.status ?? 'offline'} ui=${readiness.ui?.status ?? 'offline'} addadmin=${readiness.addadmin?.status ?? 'offline'}`);
        const admin = await detectAdminState(options.opensignPort);
        log.info(`admin: ${admin.state} (${admin.detail})`);
        if (admin.state !== 'exist') {
          log.info(`Cadastre em ${opensignUrl(options.opensignPort)}/addadmin`);
        }
        break;
      }
      case '5':
        this.runOpenSignBackup();
        break;
      case '6': {
        const backups = listOpenSignBackups(path.join(__dirname, 'backups', 'opensign'));
        if (backups.length === 0) {
          log.info('Nenhum backup encontrado ainda. Use a opção [5] para criar um.');
        } else {
          log.raw(
            backups
              .map((b) => `   ${b.ok ? '✅' : '⚠️ '} ${b.createdAt}  ${path.relative(__dirname, b.dir)}`)
              .join('\n')
          );
        }
        break;
      }
      case '7':
        await this.chooseAndRestoreOpenSignBackup();
        break;
      case '8':
        openBrowser('https://github.com/mukasanray/Fowlgen-Wars-Project/codespaces');
        log.info('Dentro do Codespace, execute "npm run setup".');
        break;
      case '0':
      default:
        break;
    }
  }

  private async chooseAndRestoreOpenSignBackup(): Promise<void> {
    const backupsRoot = path.join(__dirname, 'backups', 'opensign');
    const backups = listOpenSignBackups(backupsRoot);
    if (backups.length === 0) {
      log.info('Nenhum backup encontrado ainda. Use a opção [5] para criar um.');
      return;
    }

    log.raw('\n   Backups disponíveis (mais recente primeiro):');
    backups.forEach((b, index) => {
      log.raw(`   [${index + 1}] ${b.ok ? '✅' : '⚠️ '} ${b.createdAt}  ${path.relative(__dirname, b.dir)}`);
    });

    const choice = await askQuestion('👉 Número do backup a restaurar (ou Enter para cancelar)');
    const index = Number(choice);
    if (!choice || !Number.isInteger(index) || index < 1 || index > backups.length) {
      log.info('Restauração cancelada.');
      return;
    }

    log.warn('Isso vai APAGAR e SUBSTITUIR os dados atuais do MongoDB do OpenSign (mongorestore --drop).');
    const confirm1 = await askQuestion('👉 Digite "restaurar" para confirmar', '');
    if (confirm1.toLowerCase() !== 'restaurar') {
      log.info('Restauração cancelada.');
      return;
    }

    const envChoice = await askQuestion('👉 Também sobrescrever .env.opensign.local com o do backup? (s/N)', 'n');
    const restoreEnv = envChoice.toLowerCase().startsWith('s');

    this.runOpenSignRestore(backups[index - 1].dir, { restoreEnv });
  }

  private runOpenSignBackup(): void {
    log.step('Fazendo backup do OpenSign (MongoDB + arquivos + .env.opensign.local)...');
    const result = backupOpenSign(__dirname);

    for (const step of result.steps) {
      if (step.ok) log.ok(`${step.title}: ${step.detail}`);
      else log.error(`${step.title}: ${step.detail}`);
    }

    if (result.ok) {
      log.ok(`Backup concluído em ${path.relative(__dirname, result.dir)}`);
    } else if (result.dir) {
      log.warn(`Backup parcial em ${path.relative(__dirname, result.dir)} (verifique as falhas acima).`);
    } else {
      log.error('Backup não executado.');
    }
  }

  /** Resolve "latest"/caminho, restaura e reporta. Retorna true quando tudo deu certo. */
  private runOpenSignRestore(selector: string, options: { restoreEnv: boolean }): boolean {
    const backupsRoot = path.join(__dirname, 'backups', 'opensign');
    const { dir, error } = resolveBackupDir(backupsRoot, selector);
    if (error) {
      log.error(error);
      return false;
    }

    log.step(`Restaurando backup do OpenSign: ${path.relative(__dirname, dir)}${options.restoreEnv ? ' (incluindo .env.opensign.local)' : ''}...`);
    const result = restoreOpenSign(__dirname, dir, { restoreEnv: options.restoreEnv });

    for (const step of result.steps) {
      if (step.ok) log.ok(`${step.title}: ${step.detail}`);
      else log.error(`${step.title}: ${step.detail}`);
    }

    if (result.ok) log.ok('Restauração concluída.');
    else log.error('Restauração falhou ou ficou incompleta (verifique as falhas acima).');

    return result.ok;
  }

  private executeNpm(scriptArgs: string): void {
    try {
      const npmCmd = IS_WINDOWS ? 'npm.cmd' : 'npm';
      execSync(`${npmCmd} ${scriptArgs}`, { stdio: 'inherit', cwd: __dirname });
    } catch {
      console.log('\n↩️  Comando finalizado. Retornando ao menu...');
    }
  }
}

// Compatibilidade com scripts antigos que chamavam ensureServerRunning.
export async function ensureServer(port = DEFAULT_OPTIONS.kanbanPort): Promise<void> {
  const { ensureKanbanServer } = await import('./src/install/kanban');
  const result = await ensureKanbanServer(__dirname, port, { start: true });
  if (result.check.status === 'failed') log.error(result.check.detail ?? 'falha ao iniciar servidor');
}

const isMain = Boolean(
  process.argv[1] &&
  (process.argv[1].toLowerCase().endsWith('install.ts') || process.argv[1].toLowerCase().endsWith('install.js'))
);

if (isMain) {
  const setup = new InstallSetup();
  setup
    .run()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      console.error('Fatal error during install setup:', (error as Error)?.message || error);
      process.exitCode = EXIT_CODES.failure;
    });
}

export type { InstallReport };
