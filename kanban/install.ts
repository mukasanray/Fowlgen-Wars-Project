import { FileSystemUtils } from './src/utils/file-system';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import * as readline from 'readline';
import * as http from 'http';
import { randomBytes } from 'node:crypto';
import { GenerateDashboard } from './src/scripts/generate-dashboard';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_WINDOWS = process.platform === 'win32';
const IS_LINUX = process.platform === 'linux';
const IS_CODESPACES = !!process.env.CODESPACES;

function askQuestion(query: string, defaultValue = ''): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(`${query}${defaultValue ? ` [${defaultValue}]` : ''}: `, (ans) => {
      rl.close();
      resolve(ans.trim() || defaultValue);
    });
  });
}

export class InstallSetup {
  isInstalled(): boolean {
    const installLogPath = path.join(__dirname, 'logs/install-log.json');
    const syncLogPath = path.join(__dirname, 'logs/sync-log.json');
    const docsDir = path.join(__dirname, 'docs');
    return (
      FileSystemUtils.fileExists(installLogPath) &&
      FileSystemUtils.fileExists(syncLogPath) &&
      FileSystemUtils.directoryExists(docsDir)
    );
  }

  hasAllPrerequisites(): boolean {
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    const hasModules = FileSystemUtils.directoryExists(nodeModulesPath);
    let hasGit = false;
    try {
      execSync('git --version', { stdio: 'ignore' });
      hasGit = true;
    } catch {
      hasGit = false;
    }
    return hasModules && hasGit;
  }

  hasDocker(): boolean {
    try {
      execSync('docker --version', { stdio: 'ignore' });
      execSync('docker compose version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  async runSetupScripts(): Promise<void> {
    console.log('\n⚙️ Ferramentas ausentes detectadas. Executando scripts da pasta setup/...');
    const setupPs1 = path.join(__dirname, 'setup/install.ps1');
    const setupBat = path.join(__dirname, 'setup/install.bat');

    try {
      if (process.platform === 'win32') {
        if (FileSystemUtils.fileExists(setupPs1)) {
          execSync(`powershell.exe -NoLogo -ExecutionPolicy Bypass -File "${setupPs1}" -ToolsOnly`, {
            stdio: 'inherit',
            cwd: __dirname
          });
        } else if (FileSystemUtils.fileExists(setupBat)) {
          execSync(`"${setupBat}" --tools-only`, { stdio: 'inherit', cwd: __dirname });
        }
      } else {
        execSync('npm install', { stdio: 'inherit', cwd: __dirname });
      }
      console.log('✅ Ferramentas e dependências preparadas com sucesso pela pasta setup/\n');
    } catch (error: any) {
      console.log(`⚠️ Aviso ao executar scripts da pasta setup: ${error?.message || error}`);
    }
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

  private async setupOpenSignAfterKanban(): Promise<void> {
    console.log('\n✍️ Configurando OpenSign...');

    if (!this.hasDocker()) {
      console.log('   ⚠️ Docker não encontrado. OpenSign requer Docker para rodar.');
      if (IS_WINDOWS) {
        console.log('   💡 Instale o Docker Desktop: https://www.docker.com/products/docker-desktop/');
      } else if (IS_LINUX) {
        console.log('   💡 Instale o Docker Engine: https://docs.docker.com/engine/install/ubuntu/');
      } else if (IS_CODESPACES) {
        console.log('   💡 No Codespace, o Docker já deve estar disponível. Verifique a configuração.');
      }
      console.log('   💡 O Kanban continua instalado; instale o Docker e execute novamente pela opção [8] → [2].');
      return;
    }

    try {
      const config = await this.collectOpenSignConfig();
      const envPath = this.writeOpenSignEnv(config);
      if (!fs.existsSync(envPath)) throw new Error(`Arquivo de ambiente não foi criado: ${envPath}`);

      console.log('   🐳 Validando docker-compose...');
      execSync('docker compose --env-file .env.opensign.local -f docker-compose.dev.yml config --quiet', { stdio: 'inherit', cwd: __dirname });

      console.log('   🚀 Iniciando containers OpenSign (PostgreSQL, Redis, MongoDB, OpenSign Server, OpenSign Frontend, Caddy)...');
      execSync('docker compose --env-file .env.opensign.local -f docker-compose.dev.yml up --pull always -d', { stdio: 'inherit', cwd: __dirname });

      console.log(`   ✅ OpenSign iniciado usando ${envPath}.`);
      console.log('   🌐 Kanban: http://localhost:3000 | OpenSign: http://localhost:3001');
      console.log('   👤 Crie a primeira conta administradora em: http://localhost:3001/addadmin');

      // Wait for Caddy/OpenSign to be ready
      console.log('   ⏳ Aguardando OpenSign ficar disponível...');
      for (let i = 0; i < 24; i++) {
        await new Promise(r => setTimeout(r, 2000));
        if (await this.isServerRunning(3001)) {
          console.log('   ✅ OpenSign online em http://localhost:3001!');
          break;
        }
      }
    } catch (error: any) {
      console.log(`   ⚠️ Não foi possível iniciar o OpenSign: ${error?.message || error}`);
      console.log('   💡 O Kanban continua instalado; tente novamente pela opção [8] → [2].');
    }
  }

  async run(): Promise<void> {
    const forceInstall = process.argv.includes('--force') ||
      process.argv.includes('--reinstall') ||
      process.env.npm_config_force === 'true';

    // 1. Se não tiver as ferramentas ou for instalação forçada, chama os scripts da pasta setup/
    if (!this.hasAllPrerequisites() || forceInstall) {
      await this.runSetupScripts();
    }

    // 2. Se já estiver completamente instalado, abre direto o menu
    const installationScope = process.stdin.isTTY ? await this.askInstallationScope() : 'kanban';

    if (this.isInstalled() && !forceInstall) {
      console.log('⚡ OpenSpec Kanban integration já está instalado e configurado!');
      if (process.stdin.isTTY) {
        await this.showMenu();
      } else {
        console.log('   💡 Execute no terminal interativo para abrir o menu de opções.');
      }
      return;
    }

    // 3. Executa a finalização da instalação (pastas, dashboard, logs)


    await this.performInstallation();

    if (installationScope === 'kanban-opensign') {
      await this.setupOpenSignAfterKanban();
    }

    // 4. Ao final da instalação, exibe o menu interativo!
    if (process.stdin.isTTY) {
      await this.showMenu();
    }
  }

  async performInstallation(): Promise<void> {
    console.log('🔧 Finalizando instalação do OpenSpec Kanban...');

    // 1. Verify Prerequisites (Node, npm, Git, node_modules)
    this.checkPrerequisites();

    // 2. Create output directories
    console.log('\n📁 Verificando estrutura de pastas...');
    const dirs = [
      'docs',
      'logs',
      'backups'
    ];

    for (const dir of dirs) {
      const fullPath = path.join(__dirname, dir);
      if (!FileSystemUtils.directoryExists(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`   ✅ Criado: ${dir}`);
      } else {
        console.log(`   ✅ Existe: ${dir}`);
      }
    }

    // 3. List detected TypeScript scripts
    console.log('\n⚡ Scripts TypeScript detectados:');
    console.log('   ✅ install.ts (Setup Principal)');
    const scriptsDir = path.join(__dirname, 'src/scripts');
    if (FileSystemUtils.directoryExists(scriptsDir)) {
      const files = FileSystemUtils.getFiles(scriptsDir);
      for (const file of files) {
        if (file.endsWith('.ts')) {
          console.log(`   ✅ src/scripts/${file}`);
        }
      }
    }

    // 4. Create sync log if not exists
    console.log('\n📝 Criando arquivo de log...');
    const logPath = path.join(__dirname, 'logs/sync-log.json');
    if (!FileSystemUtils.fileExists(logPath)) {
      FileSystemUtils.writeFile(logPath, '[]');
      console.log('   ✅ sync-log.json criado');
    } else {
      console.log('   ✅ sync-log.json já existe');
    }

    // 5. Create .gitignore if not exists
    console.log('\n📝 Atualizando .gitignore...');
    const rootGitignore = path.join(__dirname, '../.gitignore');
    if (FileSystemUtils.fileExists(rootGitignore)) {
      const content = FileSystemUtils.readFile(rootGitignore);
      if (!content.includes('kanban/docs/kanban-dashboard.*')) {
        const newContent = content + '\n# Kanban Dashboard\nkanban/docs/kanban-dashboard.*\nkanban/docs/kanban-dashboard.html\n';
        FileSystemUtils.writeFile(rootGitignore, newContent);
        console.log('   ✅ .gitignore atualizado');
      } else {
        console.log('   ✅ .gitignore já configurado');
      }
    }

    // 6. Check for TypeScript configuration
    console.log('\n📦 Verificando configuração TypeScript...');
    const tsConfigPath = path.join(__dirname, 'tsconfig.json');
    if (FileSystemUtils.fileExists(tsConfigPath)) {
      console.log('   ✅ TypeScript project encontrado');
    } else {
      console.log('   ⚠️  tsconfig.json não encontrado');
    }

    // 7. Generate dashboard
    console.log('\n📊 Gerando dashboard inicial do Kanban...');
    try {
      const configPath = path.join(__dirname, 'src/config/kanban-config.json');
      const dashboard = await GenerateDashboard.fromConfig(configPath);
      await dashboard.run();
    } catch (error: any) {
      console.log(`⚠️  Não foi possível gerar o dashboard automaticamente: ${error?.message || error}`);
    }

    // 8. Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(50));

    // 9. Start Kanban Studio server
    console.log('\n🌐 Preparando inicialização do Servidor Web do Kanban...');
    await this.ensureServerRunning(3000);

    // 10. Setup OpenSign (on all platforms with Docker)
    if (this.hasDocker()) {
      console.log('\n🔧 Configurando OpenSign...');
      await this.setupOpenSignAfterKanban();
    } else {
      console.log('\n⚠️ Docker não detectado. OpenSign não será iniciado automaticamente.');
      console.log('   💡 Instale o Docker e execute "npm run setup" → opção [8] → [2] para iniciar o OpenSign.');
    }

    // 11. Open admin registration page
    const adminUrl = 'http://localhost:3001/addadmin';
    console.log(`\n🌐 Abrindo página de cadastro do admin (${adminUrl})...`);
    this.openBrowser(adminUrl);
    console.log('   ✅ Página de cadastro do administrador aberta no navegador!');

    // 10. Write installation log
    const logEntry = {
      timestamp: new Date().toISOString(),
      status: 'completed',
      message: 'Kanban integration installation completed successfully'
    };

    const installLogPath = path.join(__dirname, 'logs/install-log.json');
    try {
      let logData: any[] = [];
      if (FileSystemUtils.fileExists(installLogPath)) {
        try {
          logData = JSON.parse(FileSystemUtils.readFile(installLogPath));
        } catch {
          logData = [];
        }
      }
      logData.push(logEntry);
      FileSystemUtils.writeFile(installLogPath, JSON.stringify(logData, null, 2));
    } catch (error: any) {
      console.log(`⚠️  Could not write install log: ${error?.message || error}`);
    }
  }

  async isServerRunning(port = 3000): Promise<boolean> {
    return new Promise((resolve) => {
      const checkPath = port === 3000 ? '/api/config' : '/';
      const req = http.get(`http://localhost:${port}${checkPath}`, (res) => {
        resolve(res.statusCode !== undefined && res.statusCode < 500);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(1200, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  private ensureRuntimeDirectories(): void {
    for (const dir of ['docs', 'logs', 'backups']) {
      const fullPath = path.join(__dirname, dir);
      if (!FileSystemUtils.directoryExists(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`   ✅ Diretório criado: ${dir}`);
      }
    }
    const syncLogPath = path.join(__dirname, 'logs/sync-log.json');
    if (!FileSystemUtils.fileExists(syncLogPath)) FileSystemUtils.writeFile(syncLogPath, '[]');
  }

  async ensureServerRunning(port = 3000): Promise<void> {
    const isUp = await this.isServerRunning(port);
    if (isUp) {
      console.log(`   📡 Servidor Kanban Studio já está online em http://localhost:${port}`);
      return;
    }

    console.log(`   🚀 Iniciando Servidor Web do Kanban Studio na porta ${port}...`);

    const tsxCli = path.join(__dirname, 'node_modules/tsx/dist/cli.mjs');
    const serverScript = path.join(__dirname, 'src/server/server.ts');
    const distScript = path.join(__dirname, 'dist/server.js');
    const isCompiled = fs.existsSync(distScript);

    const env = {
      ...process.env,
      PORT: port.toString(),
      KANBAN_ROOT: __dirname
    };

    let child;
    if (isCompiled) {
      child = spawn(process.execPath, [distScript], {
        cwd: __dirname,
        env,
        detached: true,
        stdio: 'ignore'
      });
    } else if (fs.existsSync(tsxCli)) {
      child = spawn(process.execPath, [tsxCli, serverScript], {
        cwd: __dirname,
        env,
        detached: true,
        stdio: 'ignore'
      });
    } else {
      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      child = spawn(npmCmd, ['run', 'app'], {
        cwd: __dirname,
        env,
        detached: true,
        stdio: 'ignore',
        shell: true
      });
    }

    if (child && typeof child.unref === 'function') {
      child.unref();
    }

    // Aguarda até o servidor responder
    console.log('   ⏳ Aguardando servidor inicializar...');
    for (let i = 0; i < 16; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await this.isServerRunning(port)) {
        console.log(`   ✅ Servidor online com sucesso em http://localhost:${port}!`);
        return;
      }
    }
    console.log(`   💡 Servidor iniciado em segundo plano. Acesse: http://localhost:${port}`);
  }

  openBrowser(targetUrl: string): void {
    try {
      if (process.platform === 'win32') {
        execSync(`start "" "${targetUrl}"`, { stdio: 'ignore', shell: 'cmd.exe' });
      } else if (process.platform === 'darwin') {
        execSync(`open "${targetUrl}"`, { stdio: 'ignore' });
      } else {
        execSync(`xdg-open "${targetUrl}"`, { stdio: 'ignore' });
      }
    } catch {
      console.log(`   💡 Para abrir manualmente: ${targetUrl}`);
    }
  }

  async showMenu(): Promise<void> {
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
        case '1':
          console.log('\n🌐 Verificando Servidor Web do Kanban Studio...');
          if (await this.isServerRunning(3000)) {
            console.log('   📡 Servidor já está rodando em http://localhost:3000!');
            console.log('   🌐 Abrindo navegador no Kanban Studio (http://localhost:3000)...\n');
            this.openBrowser('http://localhost:3000');
          } else {
            console.log('\n🌐 Iniciando Servidor Web do Kanban Studio...');
            console.log('💡 Pressione Ctrl+C para encerrar o servidor e voltar ao menu.\n');
            this.checkPrerequisites();
            this.ensureRuntimeDirectories();
            await this.ensureServerRunning(3000);
            this.openBrowser('http://localhost:3000');
          }
          // Also check OpenSign status
          if (await this.isServerRunning(3001)) {
            console.log('   📡 OpenSign também está rodando em http://localhost:3001');
            console.log('   👤 Admin: http://localhost:3001/addadmin');
          } else {
            console.log('   ℹ️ OpenSign não está rodando. Use a opção [8] → [2] para iniciar.');
          }
          break;
        case '2':
          console.log('\n💻 Iniciando Aplicativo Desktop (Electron)...\n');
          this.executeNpm('run app:desktop');
          break;
        case '3':
          console.log('\n📊 Atualizando Dashboard do Kanban...\n');
          this.executeNpm('run dashboard');
          break;
        case '4':
          console.log('\n📋 Visualizando Status das Tarefas...\n');
          this.executeNpm('run status');
          break;
        case '5':
          console.log('\n🔍 Executando verificação de integridade...\n');
          this.executeNpm('run verify');
          break;
        case '6':
          console.log('\n🔄 Sincronizando com GitHub Projects...\n');
          this.executeNpm('run sync');
          break;
        case '7':
          console.log('\n🔧 Reexecutando instalação completa...');
          await this.performInstallation();
          break;
        case '8':
          await this.manageOpenSignDeployment();
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

  private normalizeOpenSignIdentifier(value: string, fallback: string): string {
    const normalized = value.normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
    return normalized || fallback;
  }

  private getExistingOpenSignEnvValue(key: string): string | undefined {
    const envPath = path.join(__dirname, '.env.opensign.local');
    if (!fs.existsSync(envPath)) return undefined;
    const prefix = `${key}=`;
    const line = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).find((entry) => entry.startsWith(prefix));
    return line?.slice(prefix.length).trim() || undefined;
  }

  private getExistingOpenSignMasterKey(): string | undefined {
    const value = this.getExistingOpenSignEnvValue('MASTER_KEY');
    return value && /^[A-Za-z0-9]{12,}$/.test(value) ? value : undefined;
  }

  private async collectOpenSignConfig(): Promise<Record<string, string>> {
    // Check for non-interactive mode via environment variables
    const nonInteractive = process.env.OPENSIGN_NON_INTERACTIVE === 'true';

    // MongoDB connection differs by platform
    let mongodbUri = 'mongodb://host.docker.internal:27018/opensign';
    if (IS_LINUX && !IS_CODESPACES) {
      mongodbUri = 'mongodb://host.docker.internal:27018/opensign';
    }

    // In non-interactive mode, use env vars or defaults
    const projectName = nonInteractive
      ? (process.env.OPENSIGN_PROJECT_NAME || 'opensign-local')
      : await askQuestion('Nome do projeto', 'opensign-local');

    const defaultSlug = this.normalizeOpenSignIdentifier(projectName, 'opensign-local');
    const projectSlug = nonInteractive
      ? (process.env.OPENSIGN_PROJECT_SLUG || defaultSlug)
      : this.normalizeOpenSignIdentifier(await askQuestion('Slug do projeto OpenSign', defaultSlug), defaultSlug);

    const databaseName = nonInteractive
      ? (process.env.OPENSIGN_DB_NAME || projectSlug)
      : this.normalizeOpenSignIdentifier(await askQuestion('Nome do banco OpenSign', projectSlug), projectSlug);

    const databaseUser = nonInteractive
      ? (process.env.OPENSIGN_DB_USER || projectSlug)
      : this.normalizeOpenSignIdentifier(await askQuestion('Usuário do banco OpenSign', projectSlug), projectSlug);

    const databasePassword = nonInteractive
      ? (process.env.OPENSIGN_DB_PASSWORD || 'opensign123')
      : await askQuestion('Senha do banco OpenSign');

    if (!databasePassword) throw new Error('A senha do banco é obrigatória.');

    const masterKey = this.getExistingOpenSignMasterKey() ?? randomBytes(32).toString('hex');
    const jwtSecret = this.getExistingOpenSignEnvValue('OPENSIGN_JWT_SECRET') ?? randomBytes(32).toString('hex');
    const webhookSecret = this.getExistingOpenSignEnvValue('OPENSIGN_WEBHOOK_SECRET') ?? randomBytes(32).toString('hex');

    if (!nonInteractive) {
      console.log('\n🔐 Configuração do OpenSign concluída.');
    }

    return {
      OPENSIGN_PROJECT_NAME: projectName,
      OPENSIGN_PROJECT_SLUG: projectSlug,
      OPENSIGN_DB_NAME: databaseName,
      OPENSIGN_DB_USER: databaseUser,
      OPENSIGN_DB_PASSWORD: databasePassword,
      MASTER_KEY: masterKey,
      OPENSIGN_JWT_SECRET: jwtSecret,
      OPENSIGN_WEBHOOK_SECRET: webhookSecret,
      MONGODB_URI: mongodbUri,
      DATABASE_URL: mongodbUri,
      HOST_URL: 'http://localhost:3001',
      REACT_APP_SERVERURL: 'http://localhost:3001/api/app',
      OPENSIGN_API_TOKEN: ''
    };
  }

  private writeOpenSignEnv(config: Record<string, string>): string {
    const envPath = path.join(__dirname, '.env.opensign.local');
    fs.writeFileSync(envPath, Object.entries(config).map(([key, value]) => `${key}=${value.replace(/\r?\n/g, '')}`).join('\n') + '\n', { encoding: 'utf8', mode: 0o600 });
    return envPath;
  }

  async manageOpenSignDeployment(): Promise<void> {
    const dockerAvailable = this.hasDocker();
    const platformInfo = IS_WINDOWS ? 'Windows (Docker Desktop)' : IS_LINUX ? 'Linux (Docker Engine)' : IS_CODESPACES ? 'GitHub Codespaces' : 'Desconhecido';

    console.log('\n' + '-'.repeat(54));
    console.log(`   🚀 DEPLOY & OPENSIGN — ${platformInfo}`);
    console.log('-'.repeat(54));
    console.log('   [1] 🐳 Iniciar OpenSign (Docker Compose)');
    console.log('   [2] 🛑 Parar OpenSign');
    console.log('   [3] 📊 Status dos containers');
    console.log('   [4] 🔍 Testar conexão OpenSign (porta 3001)');
    console.log('   [5] 🌐 Abrir GitHub Codespaces (para cloud)');
    console.log('   [0] ↩️  Voltar ao Menu Principal');
    console.log('-'.repeat(54));

    if (!dockerAvailable && !IS_CODESPACES) {
      console.log('\n⚠️  Docker não detectado neste ambiente.');
      if (IS_WINDOWS) console.log('   💡 Instale o Docker Desktop para usar OpenSign localmente.');
      if (IS_LINUX) console.log('   💡 Instale o Docker Engine para usar OpenSign localmente.');
      console.log('   💡 Ou use a opção [5] para abrir no GitHub Codespaces.\n');
    }

    const subChoice = await askQuestion('👉 Escolha a ação desejada: ');

    switch (subChoice) {
      case '1': {
        if (!dockerAvailable && !IS_CODESPACES) {
          console.log('\n❌ Docker não disponível. Instale o Docker primeiro.');
          break;
        }
        console.log('\n🐳 Iniciando OpenSign via Docker Compose...');
        try {
          const config = await this.collectOpenSignConfig();
          const envPath = this.writeOpenSignEnv(config);
          if (!fs.existsSync(envPath)) throw new Error(`Arquivo de ambiente não foi criado: ${envPath}`);
          execSync('docker compose --env-file .env.opensign.local -f docker-compose.dev.yml config --quiet', { stdio: 'inherit', cwd: __dirname });
          execSync('docker compose --env-file .env.opensign.local -f docker-compose.dev.yml up --pull always -d', { stdio: 'inherit', cwd: __dirname });
          console.log(`   ✅ Containers iniciados usando ${envPath}.`);
          console.log('   🌐 Kanban: http://localhost:3000 | OpenSign: http://localhost:3001');
          console.log('   👤 Admin: http://localhost:3001/addadmin');

          // Wait for readiness
          console.log('   ⏳ Aguardando OpenSign ficar disponível...');
          for (let i = 0; i < 24; i++) {
            await new Promise(r => setTimeout(r, 2000));
            if (await this.isServerRunning(3001)) {
              console.log('   ✅ OpenSign online em http://localhost:3001!');
              this.openBrowser('http://localhost:3001/addadmin');
              break;
            }
          }
        } catch (err: any) {
          console.log(`   ❌ Erro ao iniciar OpenSign: ${err?.message || err}`);
        }
        break;
      }
      case '2': {
        if (!dockerAvailable && !IS_CODESPACES) {
          console.log('\n❌ Docker não disponível.');
          break;
        }
        console.log('\n🛑 Parando containers do OpenSign...');
        try {
          execSync('docker compose --env-file .env.opensign.local -f docker-compose.dev.yml down', { stdio: 'inherit', cwd: __dirname });
          console.log('   ✅ Containers finalizados.');
        } catch (err: any) {
          console.log(`   ❌ Erro ao parar containers: ${err?.message || err}`);
        }
        break;
      }
      case '3': {
        if (!dockerAvailable && !IS_CODESPACES) {
          console.log('\n❌ Docker não disponível.');
          break;
        }
        console.log('\n📊 Status dos containers OpenSign:');
        try {
          execSync('docker compose --env-file .env.opensign.local -f docker-compose.dev.yml ps', { stdio: 'inherit', cwd: __dirname });
        } catch (err: any) {
          console.log(`   ❌ Erro ao obter status: ${err?.message || err}`);
        }
        break;
      }
      case '4': {
        console.log('\n🔍 Testando conectividade com OpenSign...');
        const isRunning = await this.isServerRunning(3001);
        console.log(isRunning ? '   ✅ OpenSign está ativo na porta 3001.' : '   ❌ OpenSign está offline na porta 3001.');
        if (isRunning) {
          console.log('   👤 Admin: http://localhost:3001/addadmin');
        }
        break;
      }
      case '5': {
        console.log('\n🌐 Abrindo GitHub Codespaces...');
        const config = await this.collectOpenSignConfig();
        const envPath = this.writeOpenSignEnv(config);
        this.openBrowser('https://github.com/mukasanray/Fowlgen-Wars-Project/codespaces');
        console.log(`   ✅ Configuração local salva em ${envPath}.`);
        console.log('   💡 Dentro do Codespace, execute "npm run setup" e escolha [8] → [1].');
        break;
      }
      case '0':
      default:
        break;
    }
  }
  private executeNpm(scriptArgs: string, extraEnv: NodeJS.ProcessEnv = {}): void {
    try {
      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      execSync(`${npmCmd} ${scriptArgs}`, {
        stdio: 'inherit',
        cwd: __dirname,
        env: { ...process.env, ...extraEnv }
      });
    } catch {
      console.log('\n↩️  Comando finalizado. Retornando ao menu...');
    }
  }

  private checkPrerequisites(): void {
    console.log('\n🔍 Verificando pré-requisitos do ambiente...');

    // Node.js version check
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0], 10);
    if (major < 18) {
      console.log(`   ⚠️  Node.js: ${nodeVersion} detectado (Recomendado: v18+).`);
    } else {
      console.log(`   ✅ Node.js: ${nodeVersion}`);
    }

    // npm check
    try {
      const npmCmd = process.platform === 'win32' ? 'npm.cmd --version' : 'npm --version';
      const npmVer = execSync(npmCmd, { encoding: 'utf8' }).trim();
      console.log(`   ✅ npm: v${npmVer}`);
    } catch {
      console.log('   ⚠️  npm não respondeu diretamente no PATH.');
    }

    // Git check & auto-installation
    let hasGit = false;
    try {
      const gitVer = execSync('git --version', { encoding: 'utf8' }).trim();
      console.log(`   ✅ Git: ${gitVer}`);
      hasGit = true;
    } catch {
      hasGit = false;
    }

    if (!hasGit) {
      console.log('   ⚠️  Git não encontrado!');
      if (process.platform === 'win32') {
        console.log('   ⏳ Instalando Git automaticamente via winget...');
        try {
          execSync('winget install Git.Git --silent --accept-package-agreements --accept-source-agreements', { stdio: 'inherit' });
          console.log('   ✅ Git instalado com sucesso!');
        } catch {
          console.log('   💡 Instale o Git manualmente em: https://git-scm.com/');
        }
      } else {
        console.log('   💡 Instale o Git usando o gerenciador de pacotes do seu sistema.');
      }
    }

    // node_modules check & auto-installation
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (!FileSystemUtils.directoryExists(nodeModulesPath)) {
      console.log('\n📦 Dependências ausentes (node_modules não encontrado).');
      console.log('   ⏳ Instalando dependências automaticamente com npm install...');
      try {
        const npmCmd = process.platform === 'win32' ? 'npm.cmd install' : 'npm install';
        execSync(npmCmd, { stdio: 'inherit', cwd: __dirname });
        console.log('   ✅ Dependências instaladas com sucesso!');
      } catch (err: any) {
        console.log(`   ❌ Falha ao instalar dependências: ${err?.message || err}`);
        console.log('   💡 Execute manualmente: npm install');
      }
    } else {
      console.log('   ✅ Dependências do projeto instaladas (node_modules)');
    }
  }
}

// Entrypoint CLI
const isMain = process.argv[1] && (
  process.argv[1].toLowerCase().endsWith('install.ts') || 
  process.argv[1].toLowerCase().endsWith('install.js')
);

if (isMain) {
  new InstallSetup().run().catch((error: any) => {
    console.error('Fatal error during install setup:', error?.message || error);
    process.exit(1);
  });
}
