// Main orchestrator for OpenSpec ↔ GitHub Kanban synchronization
import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { FileSystemUtils } from '../utils/file-system';
import { KanbanConfig } from '../types/interfaces';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class KanbanOrchestrator {
  private config: KanbanConfig;

  constructor(config: KanbanConfig) {
    this.config = config;
  }

  async run(): Promise<void> {
    console.log('🚀 Iniciando sincronização OpenSpec ↔ GitHub Kanban...');

    try {
      // Step 1: Export OpenSpec tasks to GitHub
      await this.step1ExportToGitHub();
      
      // Step 2: Validate approved ideas
      await this.step2ValidateApprovedIdeas();
      
      // Step 3: Update Kanban columns
      await this.step3UpdateColumns();
      
      // Step 4: Generate dashboard
      await this.step4GenerateDashboard();
      
      // Step 5: Commit to repository
      await this.step5Commit();
      
      console.log('✅ Kanban sincronizado com sucesso! 🎯');
    } catch (error) {
      console.error('❌ Erro durante a sincronização:', error);
      process.exit(1);
    }
  }

  private async step1ExportToGitHub(): Promise<void> {
    console.log('\n📤 Step 1: Exportando tarefas OpenSpec para GitHub Projects...');
    
    const syncScript = path.join(__dirname, 'sync-to-github.ts');
    execSync(`npx tsx "${syncScript}"`, { stdio: 'inherit' });
  }

  private async step2ValidateApprovedIdeas(): Promise<void> {
    console.log('\n✅ Step 2: Validando ideias aprovadas...');
    
    try {
      const changesDir = path.join(__dirname, '../../../openspec/changes');
      const features = FileSystemUtils.getDirectories(changesDir);
      
      for (const feature of features) {
        const proposalFile = path.join(changesDir, feature, 'proposal.md');
        if (FileSystemUtils.fileExists(proposalFile) && FileSystemUtils.readFile(proposalFile).includes('[APROVADO]')) {
          console.log(`✅ Validando ideia aprovada: ${feature}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Warning during validation: ${error}`);
    }
  }

  private async step3UpdateColumns(): Promise<void> {
    console.log('\n🔄 Step 3: Atualizando colunas Kanban baseado em OpenSpec...');
    
    const updateScript = path.join(__dirname, 'update-columns.ts');
    execSync(`npx tsx "${updateScript}"`, { stdio: 'inherit' });
  }

  private async step4GenerateDashboard(): Promise<void> {
    console.log('\n📊 Step 4: Gerando dashboard Kanban...');
    
    const generateScript = path.join(__dirname, 'generate-dashboard.ts');
    execSync(`npx tsx "${generateScript}"`, { stdio: 'inherit' });
  }

  private async step5Commit(): Promise<void> {
    console.log('\n💾 Step 5: Commit no repositório...');
    
    try {
      execSync('git add kanban/docs kanban/logs', { stdio: 'pipe' });
      const commitMessage = `📊 sync: OpenSpec → GitHub Kanban ${new Date().toISOString().split('T')[0]}`;
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
      console.log('✅ Commit realizado com sucesso!');
    } catch (error) {
      console.log('⚠️  Info: Sem novas alterações para commit no git.');
    }
  }

  static async fromConfig(configPath: string): Promise<KanbanOrchestrator> {
    const configContent = FileSystemUtils.readFile(configPath);
    const config: KanbanConfig = JSON.parse(configContent);
    return new KanbanOrchestrator(config);
  }
}

// Entrypoint CLI
const isMain = process.argv[1] && (
  process.argv[1].endsWith('main-orchestrator.ts') || 
  process.argv[1].endsWith('main-orchestrator.js')
);

if (isMain) {
  const configPath = path.join(__dirname, '../config/kanban-config.json');
  KanbanOrchestrator.fromConfig(configPath).then(orchestrator => orchestrator.run()).catch((error) => {
    console.error('Fatal error in orchestrator:', error);
    process.exit(1);
  });
}