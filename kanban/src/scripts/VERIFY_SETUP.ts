// Verify OpenSpec Kanban integration setup
import { FileSystemUtils } from '../utils/file-system';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class VerifySetup {
  async run(): Promise<void> {
    console.log('🔍 Verificando configuração do OpenSpec Kanban integration...');

    let allChecksPassed = true;

    // Check 1: Config directory exists
    console.log('\n1. 📁 Verificando estrutura de pastas...');
    const requiredDirs = [
      '../config',
      '../../docs',
      '../../logs'
    ];

    for (const dir of requiredDirs) {
      const fullPath = path.join(__dirname, dir);
      if (FileSystemUtils.directoryExists(fullPath)) {
        console.log(`   ✅ ${dir}`);
      } else {
        console.log(`   ❌ ${dir} - AUSENTE`);
        allChecksPassed = false;
      }
    }

    // Check 2: Config files exist
    console.log('\n2. 📄 Verificando arquivos de configuração...');
    const configDir = path.join(__dirname, '../config');
    const configFiles = ['kanban-config.json'];
    for (const configFile of configFiles) {
      const fullPath = path.join(configDir, configFile);
      if (FileSystemUtils.fileExists(fullPath)) {
        try {
          const config = JSON.parse(FileSystemUtils.readFile(fullPath));
          console.log(`   ✅ ${configFile} - Válido`);
        } catch (error: any) {
          console.log(`   ❌ ${configFile} - JSON inválido: ${error?.message || error}`);
          allChecksPassed = false;
        }
      } else {
        console.log(`   ❌ ${configFile} - AUSENTE`);
        allChecksPassed = false;
      }
    }

    // Check 3: Scripts exist
    console.log('\n3. ⚡ Verificando scripts...');
    const requiredScripts = [
      'main-orchestrator.ts',
      'sync-to-github.ts',
      'update-columns.ts',
      'generate-dashboard.ts'
    ];

    for (const script of requiredScripts) {
      const fullPath = path.join(__dirname, script);
      if (FileSystemUtils.fileExists(fullPath)) {
        console.log(`   ✅ ${script}`);
      } else {
        console.log(`   ❌ ${script} - AUSENTE`);
        allChecksPassed = false;
      }
    }

    // Check 4: OpenSpec structure
    console.log('\n4. 🔍 Verificando estrutura OpenSpec...');
    const openspecPath = path.join(__dirname, '../../../openspec');
    if (FileSystemUtils.directoryExists(openspecPath)) {
      console.log('   ✅ Diretório openspec/ encontrado');
      
      const changesPath = path.join(openspecPath, 'changes');
      if (FileSystemUtils.directoryExists(changesPath)) {
        const features = FileSystemUtils.getDirectories(changesPath);
        console.log(`   ✅ ${features.length} features OpenSpec encontradas`);
        
        for (const feature of features) {
          const proposalPath = path.join(changesPath, feature, 'proposal.md');
          const tasksPath = path.join(changesPath, feature, 'tasks.md');
          
          if (FileSystemUtils.fileExists(proposalPath)) {
            console.log(`   ✅ ${feature}/ - proposal.md presente`);
          } else {
            console.log(`   ⚠️  ${feature}/ - proposal.md ausente`);
          }
          if (FileSystemUtils.fileExists(tasksPath)) {
            console.log(`   ✅ ${feature}/ - tasks.md presente`);
          } else {
            console.log(`   ⚠️  ${feature}/ - tasks.md ausente`);
          }
        }
      } else {
        console.log('   ❌ openspec/changes/ - AUSENTE');
        allChecksPassed = false;
      }
    } else {
      console.log('   ❌ Diretório openspec/ AUSENTE');
      allChecksPassed = false;
    }

    // Check 5: GitHub CLI
    console.log('\n5. 🔗 Verificando GitHub CLI...');
    try {
      execSync('gh --version', { stdio: 'pipe' });
      console.log('   ✅ GitHub CLI (gh) disponível');
      
      // Check if authenticated
      try {
        execSync('gh auth status', { stdio: 'pipe' });
        console.log('   ✅ Autenticado no GitHub');
      } catch (error) {
        console.log('   ⚠️  Não autenticado no GitHub (execute: gh auth login)');
      }
    } catch (error) {
      console.log('   ⚠️  GitHub CLI (gh) não disponível no PATH');
    }

    // Check 6: Documentation files
    console.log('\n6. 📚 Verificando documentação...');
    const docs = ['README.md'];
    for (const doc of docs) {
      const docPath = path.join(__dirname, '../', doc);
      if (FileSystemUtils.fileExists(docPath)) {
        console.log(`   ✅ ${doc} - Documentação encontrada`);
      } else {
        console.log(`   ⚠️  ${doc} - Documentação ausente`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    if (allChecksPassed) {
      console.log('✅ TODAS AS VERIFICAÇÕES PASSARAM!');
      console.log('O OpenSpec Kanban integration está pronto para uso.');
    } else {
      console.log('⚠️  ALGUMAS VERIFICAÇÕES FALHARAM');
      console.log('Corrija os itens marcados com ❌ antes de usar.');
    }
    console.log('='.repeat(50));

    process.exit(allChecksPassed ? 0 : 1);
  }
}

// Entrypoint CLI
const isMain = process.argv[1] && (
  process.argv[1].endsWith('VERIFY_SETUP.ts') || 
  process.argv[1].endsWith('VERIFY_SETUP.js')
);

if (isMain) {
  new VerifySetup().run().catch((error) => {
    console.error('Fatal error during verification:', error);
    process.exit(1);
  });
}