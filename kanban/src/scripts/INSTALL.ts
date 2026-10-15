import { FileSystemUtils } from '../utils/file-system';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { GenerateDashboard } from './generate-dashboard';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class InstallSetup {
  async run(): Promise<void> {
    console.log('🔧 Instalando OpenSpec Kanban integration...');

    // Create output directories
    const dirs = [
      '../../docs',
      '../../logs',
      '../../backups'
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

    // Make all scripts executable
    console.log('\n⚡ Scripts TypeScript detectados:');
    const scriptsDir = path.join(__dirname);
    const files = FileSystemUtils.getFiles(scriptsDir);

    for (const file of files) {
      if (file.endsWith('.ts')) {
        console.log(`   ✅ ${file}`);
      }
    }

    // Create sync log if not exists
    console.log('\n📝 Criando arquivo de log...');
    const logPath = path.join(__dirname, '../../logs/sync-log.json');
    if (!FileSystemUtils.fileExists(logPath)) {
      FileSystemUtils.writeFile(logPath, '[]');
      console.log('   ✅ sync-log.json criado');
    } else {
      console.log('   ✅ sync-log.json já existe');
    }

    // Create .gitignore if not exists
    console.log('\n📝 Atualizando .gitignore...');
    const rootGitignore = path.join(__dirname, '../../../.gitignore');
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

    // Check for TypeScript configuration
    console.log('\n📦 Verificando configuração TypeScript...');
    const tsConfigPath = path.join(__dirname, '../../tsconfig.json');
    if (FileSystemUtils.fileExists(tsConfigPath)) {
      console.log('   ✅ TypeScript project encontrado');
    } else {
      console.log('   ⚠️  tsconfig.json não encontrado');
    }

    // Generate dashboard
    console.log('\n📊 Gerando dashboard inicial do Kanban...');
    try {
      const configPath = path.join(__dirname, '../config/kanban-config.json');
      const dashboard = await GenerateDashboard.fromConfig(configPath);
      await dashboard.run();
    } catch (error: any) {
      console.log(`⚠️  Não foi possível gerar o dashboard automaticamente: ${error?.message || error}`);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ INSTALAÇÃO CONCLUÍDA!');
    console.log('\n📋 Comandos úteis:');
    console.log('   • npm.cmd run app       - Iniciar Servidor Web em http://localhost:3000');
    console.log('   • npm.cmd run dashboard - Atualizar dashboard Markdown/HTML');
    console.log('   • npm.cmd run status    - Ver status atual no terminal');
    console.log('   • npm.cmd run verify    - Verificar integridade do ambiente');
    console.log('   • npm.cmd run sync      - Sincronizar com GitHub Projects');
    console.log('='.repeat(50));

    // Open dashboard in default browser (Prefer new Web Studio)
    const webStudioPath = path.join(__dirname, '../web/index.html');
    const legacyPath = path.join(__dirname, '../../docs/kanban-dashboard.html');
    const htmlPath = FileSystemUtils.fileExists(webStudioPath) ? webStudioPath : legacyPath;

    if (FileSystemUtils.fileExists(htmlPath)) {
      console.log('\n🌐 Abrindo OpenSpec & Kanban Studio no navegador padrão...');
      try {
        if (process.platform === 'win32') {
          execSync(`start "" "${htmlPath}"`, { stdio: 'ignore', shell: 'cmd.exe' });
        } else if (process.platform === 'darwin') {
          execSync(`open "${htmlPath}"`, { stdio: 'ignore' });
        } else {
          execSync(`xdg-open "${htmlPath}"`, { stdio: 'ignore' });
        }
        console.log('   ✅ Painel interativo aberto no navegador com sucesso!');
      } catch {
        console.log(`   💡 Para abrir manualmente: ${htmlPath}`);
      }
    }

    // Write installation log
    const logEntry = {
      timestamp: new Date().toISOString(),
      status: 'completed',
      message: 'Kanban integration installation completed successfully'
    };

    const installLogPath = path.join(__dirname, '../../logs/install-log.json');
    try {
      let logData = [];
      if (FileSystemUtils.fileExists(installLogPath)) {
        logData = JSON.parse(FileSystemUtils.readFile(installLogPath));
      }
      logData.push(logEntry);
      FileSystemUtils.writeFile(installLogPath, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.log('⚠️  Could not write install log');
    }
  }
}

// Entrypoint CLI
const isMain = process.argv[1] && (
  process.argv[1].endsWith('INSTALL.ts') || 
  process.argv[1].endsWith('INSTALL.js')
);

if (isMain) {
  new InstallSetup().run().catch((error) => {
    console.error('Fatal error during install setup:', error);
    process.exit(1);
  });
}