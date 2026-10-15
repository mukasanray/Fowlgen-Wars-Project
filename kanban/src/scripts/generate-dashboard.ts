// Generate Kanban dashboard status report
import { FileSystemUtils } from '../utils/file-system';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { KanbanConfig } from '../types/interfaces';
import { OpenSpecFeature, DashboardData } from '../types/interfaces';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class GenerateDashboard {
  private config: KanbanConfig;

  constructor(config: KanbanConfig) {
    this.config = config;
  }

  async run(): Promise<void> {
    console.log('📊 Painel Kanban em Tempo Real - Fowlgen Wars');
    console.log('=============================================');
    console.log('');

    const changesDir = path.join(__dirname, '../../../openspec/changes');
    const features = FileSystemUtils.getDirectories(changesDir);

    const dashboardData = await this.generateDashboardData(features, changesDir);

    // Generate Markdown dashboard
    const markdownDashboard = this.generateMarkdownDashboard(dashboardData);
    const markdownPath = path.join(__dirname, '../../docs/kanban-dashboard.md');
    FileSystemUtils.writeFile(markdownPath, markdownDashboard);
    console.log(`✅ Markdown dashboard gerado em: ${markdownPath}`);

    // Generate HTML dashboard
    const htmlDashboard = this.generateHTMLDashboard(dashboardData);
    const htmlPath = path.join(__dirname, '../../docs/kanban-dashboard.html');
    FileSystemUtils.writeFile(htmlPath, htmlDashboard);
    console.log(`✅ HTML dashboard gerado em: ${htmlPath}`);

    this.printDashboardSummary(dashboardData);
  }

  private async generateDashboardData(features: string[], changesDir: string): Promise<DashboardData> {
    const openSpecFeatures: OpenSpecFeature[] = [];

    for (const feature of features) {
      const featureDir = path.join(changesDir, feature);
      const tasksFile = path.join(featureDir, 'tasks.md');
      
      if (FileSystemUtils.fileExists(tasksFile)) {
        const tasksContent = FileSystemUtils.readFile(tasksFile);
        const taskLines = tasksContent.match(/^\s*[-*]?\s*\[[ xX]\].*/gm) || [];
        const totalTasks = taskLines.length;
        const completedTasks = taskLines.filter(line => /\[[xX]\]/.test(line)).length;

        const proposalFile = path.join(featureDir, 'proposal.md');
        const proposal = FileSystemUtils.fileExists(proposalFile) ? 
          FileSystemUtils.readFile(proposalFile).substring(0, 500) : '';

        openSpecFeatures.push({
          name: feature,
          directory: featureDir,
          proposal,
          tasks: taskLines,
          completedTasks,
          totalTasks
        });
      }
    }

    const columns = this.config.columns || [
      { name: 'Backlog', status: 'backlog', color: 'gray' },
      { name: 'In Progress', status: 'in_progress', color: 'blue' },
      { name: 'Review', status: 'review', color: 'yellow' },
      { name: 'Done', status: 'done', color: 'green' }
    ];

    const metrics = {
      totalFeatures: openSpecFeatures.length,
      inProgress: openSpecFeatures.filter(f => f.completedTasks < f.totalTasks && f.totalTasks > 0).length,
      completed: openSpecFeatures.filter(f => f.completedTasks === f.totalTasks && f.totalTasks > 0).length,
      backlog: openSpecFeatures.filter(f => f.totalTasks === 0).length
    };

    return {
      features: openSpecFeatures,
      columns,
      metrics,
      lastUpdated: new Date().toISOString()
    };
  }

  private generateMarkdownDashboard(dashboardData: DashboardData): string {
    let markdown = `# Kanban Dashboard

Generated on: ${dashboardData.lastUpdated}

## Summary

| Feature | Status | Tasks | Done | In Progress | Done |
|---------|--------|-------|------|-------------|------|

`;

    for (const feature of dashboardData.features) {
      let status = 'Backlog';
      const inProgressTask = feature.tasks.find(task => !task.includes('[x]'));
      if (inProgressTask) {
        status = '🔄 In Progress';
      } else if (feature.completedTasks === feature.totalTasks && feature.totalTasks > 0) {
        status = '✅ Done';
      }

      markdown += `| ${feature.name} | ${status} | ${feature.totalTasks} | ${feature.completedTasks} | ${feature.totalTasks - feature.completedTasks} | ${feature.completedTasks} |\n`;
    }

    markdown += `

---
*Dashboard generated automatically by OpenSpec Kanban integration*
`;

    return markdown;
  }

  private generateHTMLDashboard(dashboardData: DashboardData): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>OpenSpec Kanban Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status-done { color: green; }
        .status-in-progress { color: blue; }
        .status-backlog { color: gray; }
    </style>
</head>
<body>
    <h1>OpenSpec Kanban Dashboard</h1>
    <p>Generated: ${dashboardData.lastUpdated}</p>
    <table>
        <thead>
            <tr>
                <th>Feature</th>
                <th>Status</th>
                <th>Total Tasks</th>
                <th>Done</th>
                <th>In Progress</th>
            </tr>
        </thead>
        <tbody>
${dashboardData.features.map(feature => {
      let status = 'Backlog';
      const inProgressTask = feature.tasks.find(task => !task.includes('[x]'));
      if (inProgressTask) {
        status = 'In Progress';
      } else if (feature.completedTasks === feature.totalTasks && feature.totalTasks > 0) {
        status = 'Done';
      }

      return `            <tr>
                <td>${feature.name}</td>
                <td class="status-${status.toLowerCase().replace(' ', '-')}">${status}</td>
                <td>${feature.totalTasks}</td>
                <td class="status-done">${feature.completedTasks}</td>
                <td class="status-in-progress">${feature.totalTasks - feature.completedTasks}</td>
            </tr>`;
    }).join('\n')}
        </tbody>
    </table>
</body>
</html>`;
  }

  private printDashboardSummary(dashboardData: DashboardData): void {
    console.log('');
    console.log('📈 Métricas de Progresso:');
    console.log(`- Features no Backlog: ${dashboardData.metrics.backlog}`);
    console.log(`- Em Desenvolvimento: ${dashboardData.metrics.inProgress}`);
    console.log(`- Concluídas: ${dashboardData.metrics.completed}`);
    console.log(`- Total de Features: ${dashboardData.metrics.totalFeatures}`);

    console.log('');
    console.log(`📅 Relatório Gerado: ${new Date().toLocaleString()}`);
    console.log('🎯 Status atualizado baseado em OpenSpec ↔ GitHub Kanban');

    // Save sync log
    const syncLog = {
      timestamp: new Date().toISOString(),
      status: 'success',
      message: 'Kanban synchronization completed successfully'
    };

    const logPath = path.join(__dirname, '../../logs/sync-log.json');
    try {
      let logData = [];
      if (FileSystemUtils.directoryExists(logPath)) {
        logData = JSON.parse(FileSystemUtils.readFile(logPath));
      }
      logData.push(syncLog);
      FileSystemUtils.writeFile(logPath, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.log('⚠️  Could not write sync log');
    }
  }

  static async fromConfig(configPath: string): Promise<GenerateDashboard> {
    const configContent = FileSystemUtils.readFile(configPath);
    const config: KanbanConfig = JSON.parse(configContent);
    return new GenerateDashboard(config);
  }
}

// Entrypoint CLI
const isMain = process.argv[1] && (
  process.argv[1].endsWith('generate-dashboard.ts') || 
  process.argv[1].endsWith('generate-dashboard.js')
);

if (isMain) {
  const configPath = path.join(__dirname, '../config/kanban-config.json');
  GenerateDashboard.fromConfig(configPath).then(dashboard => dashboard.run()).catch((error) => {
    console.error('Fatal error generating dashboard:', error);
    process.exit(1);
  });
}