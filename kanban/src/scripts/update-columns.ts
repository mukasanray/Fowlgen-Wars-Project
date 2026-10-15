// Update GitHub Kanban columns based on OpenSpec status
import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { FileSystemUtils } from '../utils/file-system';
import { KanbanConfig } from '../types/interfaces';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Auto-load .env token if present
const envPath = path.join(__dirname, '../../.env');
if (FileSystemUtils.fileExists(envPath)) {
  const envContent = FileSystemUtils.readFile(envPath);
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      const val = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  }
}

export class UpdateColumns {
  private config: KanbanConfig;

  constructor(config: KanbanConfig) {
    this.config = config;
  }

  async run(): Promise<void> {
    console.log('🔄 Atualizando colunas Kanban baseado em OpenSpec...');

    // Verify GitHub CLI is available
    try {
      FileSystemUtils.executeShellCommand('gh --version');
    } catch {
      console.log('⚠️  GitHub CLI (gh) não está instalado ou não está no PATH.');
      return;
    }

    const PROJECT_ID = this.config.projectId || 
      FileSystemUtils.executeShellCommand('gh project list --format json -q \'[0].id\'');

    console.log(`📋 Using GitHub Project ID: ${PROJECT_ID}`);

    // Process each feature in OpenSpec
    const changesDir = path.join(__dirname, '../../../openspec/changes');
    const features = FileSystemUtils.getDirectories(changesDir);

    for (const feature of features) {
      const featureDir = path.join(changesDir, feature);
      console.log(`🔍 Processing feature: ${feature}`);

      const tasksFile = path.join(featureDir, 'tasks.md');
      if (!FileSystemUtils.fileExists(tasksFile)) {
        continue;
      }

      const tasksContent = FileSystemUtils.readFile(tasksFile);
      const statusMatch = tasksContent.match(/## \d+\.\s*([^*\n]+)/);
      let status = 'Backlog'; // default

      if (statusMatch) {
        const rawStatus = statusMatch[1].trim();
        
        // Map OpenSpec status to GitHub column
        if (rawStatus.includes('Em Andamento') || rawStatus.includes('Implementando') || rawStatus.includes('Em Progresso')) {
          status = 'In Progress';
        } else if (rawStatus.includes('Testando') || rawStatus.includes('Verificação')) {
          status = 'Review';
        } else if (rawStatus.includes('Concluído') || rawStatus.includes('Done') || rawStatus.includes('Completo')) {
          status = 'Done';
        } else {
          status = 'Backlog';
        }

        // Find the issue in GitHub with this title
        try {
          const issueList = FileSystemUtils.executeShellCommand(
            `gh issue list --format json --jq "[.[] | select(.title == \"${feature}\")]"`
          );
          
          if (issueList && issueList !== 'null' && issueList !== '') {
            const issues = JSON.parse(issueList);
            if (issues.length > 0) {
              const issue = issues[0];
              const issueId = issue.id;

              // Update GitHub status based on OpenSpec
              FileSystemUtils.executeShellCommand(
                `gh project item-update "${PROJECT_ID}" --id "${issueId}" --status "${status}"`
              );
              console.log(`🔄 Updated ${feature} to ${status}`);
            }
          }
        } catch (error) {
          // Ignore issue list errors if not authenticated
        }
      }
    }

    console.log('✅ Colunas Kanban atualizadas! 🎯');
  }

  static async fromConfig(configPath: string): Promise<UpdateColumns> {
    const configContent = FileSystemUtils.readFile(configPath);
    const config: KanbanConfig = JSON.parse(configContent);
    return new UpdateColumns(config);
  }
}

// Entrypoint CLI
const isMain = process.argv[1] && (
  process.argv[1].endsWith('update-columns.ts') || 
  process.argv[1].endsWith('update-columns.js')
);

if (isMain) {
  const configPath = path.join(__dirname, '../config/kanban-config.json');
  UpdateColumns.fromConfig(configPath).then(updater => updater.run()).catch((error) => {
    console.error('Fatal error updating columns:', error);
    process.exit(1);
  });
}