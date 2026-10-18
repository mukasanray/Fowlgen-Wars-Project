// Update GitHub Kanban columns based on OpenSpec status (API & CLI)
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
      if (val) process.env[key] = val;
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

    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

    // Método 1: GitHub API
    if (token && token.trim()) {
      await this.updateViaGitHubApi(token.trim());
      console.log('✅ Colunas Kanban atualizadas via GitHub API! 🎯');
      return;
    }

    // Método 2: Fallback para gh CLI se disponível
    let ghAvailable = false;
    try {
      FileSystemUtils.executeShellCommand('gh --version');
      FileSystemUtils.executeShellCommand('gh auth status');
      ghAvailable = true;
    } catch {
      ghAvailable = false;
    }

    if (ghAvailable) {
      await this.updateViaGhCli();
      console.log('✅ Colunas Kanban atualizadas via GitHub CLI! 🎯');
      return;
    }

    console.log('ℹ️  Nenhuma credencial GitHub detectada para atualização de colunas (ignorado com segurança).');
  }

  async updateViaGitHubApi(token: string): Promise<void> {
    const repoFullName = (this.config.github?.repo || 'mukasanray/Fowlgen-Wars-Project').trim();
    const [owner, repo] = repoFullName.split('/');
    if (!owner || !repo) return;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Fowlgen-Wars-Kanban-Studio',
      'Content-Type': 'application/json'
    };

    let existingIssues: any[] = [];
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`, { headers });
      if (res.ok) existingIssues = (await res.json()) as any[];
    } catch {}

    const changesDir = path.join(__dirname, '../../../openspec/changes');
    const features = FileSystemUtils.getDirectories(changesDir);

    for (const feature of features) {
      const featureDir = path.join(changesDir, feature);
      const tasksFile = path.join(featureDir, 'tasks.md');
      if (!FileSystemUtils.fileExists(tasksFile)) continue;

      const tasksContent = FileSystemUtils.readFile(tasksFile);
      const taskLines = tasksContent.match(/^\s*\[.?\].*/gm) || [];
      const total = taskLines.length;
      const done = taskLines.filter(l => l.includes('[x]')).length;

      let column = 'Backlog';
      if (total > 0 && done === total) {
        column = 'Done';
      } else if (done > 0) {
        column = 'In Progress';
      }

      const issue = existingIssues.find(i =>
        i.title === `[OpenSpec] ${feature}` ||
        i.title === feature ||
        i.title.toLowerCase().includes(feature.toLowerCase())
      );

      if (issue) {
        try {
          const isDone = column === 'Done';
          await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              state: isDone ? 'closed' : 'open',
              state_reason: isDone ? 'completed' : 'reopened'
            })
          });
          console.log(`🔄 Status da Issue #${issue.number} atualizado para ${column}`);
        } catch {}
      }
    }
  }

  async updateViaGhCli(): Promise<void> {
    const PROJECT_ID = this.config.projectId ||
      FileSystemUtils.executeShellCommand('gh project list --format json -q \'[0].id\'');

    const changesDir = path.join(__dirname, '../../../openspec/changes');
    const features = FileSystemUtils.getDirectories(changesDir);

    for (const feature of features) {
      const featureDir = path.join(changesDir, feature);
      const tasksFile = path.join(featureDir, 'tasks.md');
      if (!FileSystemUtils.fileExists(tasksFile)) continue;

      const tasksContent = FileSystemUtils.readFile(tasksFile);
      const taskLines = tasksContent.match(/^\s*\[.?\].*/gm) || [];
      const total = taskLines.length;
      const done = taskLines.filter(l => l.includes('[x]')).length;

      let status = 'Backlog';
      if (total > 0 && done === total) {
        status = 'Done';
      } else if (done > 0) {
        status = 'In Progress';
      }

      try {
        const issueList = FileSystemUtils.executeShellCommand(
          `gh issue list --format json --jq "[.[] | select(.title == \\"${feature}\\" or .title == \\"[OpenSpec] ${feature}\\")]"`
        );

        if (issueList && issueList !== 'null' && issueList !== '') {
          const issues = JSON.parse(issueList);
          if (issues.length > 0) {
            const issueId = issues[0].id;
            FileSystemUtils.executeShellCommand(
              `gh project item-update "${PROJECT_ID}" --id "${issueId}" --status "${status}"`
            );
            console.log(`🔄 Updated ${feature} to ${status}`);
          }
        }
      } catch (error) {
        // Ignore issue list errors
      }
    }
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
  UpdateColumns.fromConfig(configPath).then(u => u.run()).catch((error) => {
    console.error('Fatal error updating columns:', error);
    process.exit(1);
  });
}