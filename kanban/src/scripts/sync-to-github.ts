// Sync OpenSpec tasks to GitHub Projects
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

export class SyncToGitHub {
  private config: KanbanConfig;

  constructor(config: KanbanConfig) {
    this.config = config;
  }

  async run(): Promise<void> {
    console.log('📤 Exportando tarefas OpenSpec para GitHub Projects...');

    // Verify GitHub CLI is available
    try {
      FileSystemUtils.executeShellCommand('gh --version');
    } catch {
      console.log('⚠️  GitHub CLI (gh) não está instalado ou não está no PATH.');
      console.log('Instale com: winget install GitHub.cli (Windows) ou brew install gh (macOS)');
      return;
    }

    // Verify authenticated to GitHub
    try {
      FileSystemUtils.executeShellCommand('gh auth status');
    } catch (error) {
      console.log('❌ Autentique-se com o GitHub CLI primeiro:');
      console.log('   gh auth login');
      return;
    }

    const PROJECT_ID = this.config.projectId ||
      FileSystemUtils.executeShellCommand('gh project list --format json -q \'[0].id\'');

    console.log(`📋 Using GitHub Project ID: ${PROJECT_ID}`);

    // Clear existing items from Backlog column
    const items = FileSystemUtils.executeShellCommand(
      `gh project item list "${PROJECT_ID}" --format json -q '.[].id' 2>/dev/null || echo ""`
    ).split('\n').filter(Boolean);

    for (const item_id of items) {
      try {
        FileSystemUtils.executeShellCommand(
          `gh project item-delete "${PROJECT_ID}" --id "${item_id}" 2>/dev/null || true`
        );
      } catch (error) {
        // Ignore errors
      }
    }

    // Process each feature in OpenSpec
    const changesDir = path.join(__dirname, '../../../openspec/changes');
    const features = FileSystemUtils.getDirectories(changesDir);

    for (const feature of features) {
      const featureDir = path.join(changesDir, feature);
      console.log(`🔍 Processing feature: ${feature}`);

      const tasksFile = path.join(featureDir, 'tasks.md');
      if (!FileSystemUtils.fileExists(tasksFile)) {
        console.log(`⚠️  No tasks file found for ${feature}`);
        continue;
      }

      const tasksContent = FileSystemUtils.readFile(tasksFile);
      const taskLines = tasksContent.match(/^\s*\[.?\].*/gm) || [];
      const tasksCount = taskLines.length;
      const doneCount = taskLines.filter(line => line.includes('[x]')).length;

      console.log(`📊 Tasks: ${tasksCount} total, ${doneCount} completed`);

      // Create/update card in GitHub Projects
      const proposalFile = path.join(featureDir, 'proposal.md');
      const proposalContent = FileSystemUtils.fileExists(proposalFile) ?
        FileSystemUtils.readFile(proposalFile).substring(0, 1000) :
        `Feature: ${feature}`;

      const createCmd = `gh project item-create "${PROJECT_ID}" \
        --title "${feature}" \
        --body "${proposalContent}" \
        --label "${this.config.defaultLabels.join(',')}"" \
        --assignee "${this.config.assignee}" \
        --status "Backlog"`;

      try {
        FileSystemUtils.executeShellCommand(createCmd);
      } catch (error) {
        console.log(`❌ Error creating card for ${feature}: ${error}`);
      }

      // Import individual tasks as subtasks
      for (const line of taskLines) {
        const cleanLine = line.replace(/^[\s\[.?\]]*|[\[.\]]*$/g, '').trim();
        const taskTitle = cleanLine.replace(/^.*?\*\*?(.*?)\*\*?.*$/, '$1');

        const status = line.includes('[x]') ? 'Done' : 'In Progress';
        const titlePrefix = line.includes('[x]') ? '✓ ' : '⏳ ';

        const taskCmd = `gh project item-create "${PROJECT_ID}" \
          --title "${titlePrefix}${taskTitle}" \
          --status "${status}"`;

        try {
          FileSystemUtils.executeShellCommand(taskCmd);
        } catch (error) {
          // Ignore individual task creation errors
        }
      }
    }

    console.log('✅ Tarefas OpenSpec sincronizadas com GitHub Kanban! 🎯');
  }

  static async fromConfig(configPath: string): Promise<SyncToGitHub> {
    const configContent = FileSystemUtils.readFile(configPath);
    const config: KanbanConfig = JSON.parse(configContent);
    return new SyncToGitHub(config);
  }
}

// Entrypoint CLI
const isMain = process.argv[1] && (
  process.argv[1].endsWith('sync-to-github.ts')
);

if (isMain) {
  const configPath = path.join(__dirname, '../config/kanban-config.json');
  SyncToGitHub.fromConfig(configPath).then(sync => sync.run()).catch((error) => {
    console.error('Fatal error syncing to GitHub:', error);
    process.exit(1);
  });
}