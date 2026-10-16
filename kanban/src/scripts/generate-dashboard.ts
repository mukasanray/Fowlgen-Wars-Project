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
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>OpenSpec Kanban Dashboard - Fowlgen Wars</title>
    <style>
        :root {
            --bg-dark: #090d16;
            --card-bg: #111827;
            --border: #1e293b;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent: #38bdf8;
            --success: #10b981;
            --warning: #f59e0b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg-dark);
            color: var(--text-main);
            padding: 24px;
        }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .title { font-size: 22px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 24px; }
        .metric-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
        .metric-val { font-size: 26px; font-weight: 700; margin-top: 4px; }
        .metric-label { font-size: 11.5px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
        table { border-collapse: collapse; width: 100%; background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); font-size: 13.5px; }
        th { background: #1e293b; color: #cbd5e1; font-weight: 600; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.5px; }
        tr:hover { background: rgba(255,255,255,0.02); }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
        .status-done { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .status-in-progress { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
        .status-backlog { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); }
        .progress-bar-bg { background: #1e293b; border-radius: 6px; height: 8px; width: 100px; overflow: hidden; }
        .progress-bar-fill { background: linear-gradient(90deg, #38bdf8, #10b981); height: 100%; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1 class="title">🐔 Fowlgen Wars — OpenSpec Kanban Dashboard</h1>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Relatório Executivo de Entregas e Sprints em Tempo Real</p>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); text-align: right;">
            Gerado em:<br><strong style="color: #cbd5e1;">${dashboardData.lastUpdated}</strong>
        </div>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-label">Total de Features</div>
            <div class="metric-val" style="color: var(--accent);">${dashboardData.metrics.totalFeatures}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Em Desenvolvimento</div>
            <div class="metric-val" style="color: #60a5fa;">${dashboardData.metrics.inProgress}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Concluídas</div>
            <div class="metric-val" style="color: var(--success);">${dashboardData.metrics.completed}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">No Backlog</div>
            <div class="metric-val" style="color: #94a3b8;">${dashboardData.metrics.backlog}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Feature / Ideia</th>
                <th>Status</th>
                <th>Total Tarefas</th>
                <th>Concluídas</th>
                <th>Progresso</th>
            </tr>
        </thead>
        <tbody>
${dashboardData.features.length === 0 ? `            <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 32px;">Nenhuma feature criada ainda no diretório openspec/changes/.</td></tr>` : ''}
${dashboardData.features.map(feature => {
      let status = 'Backlog';
      const inProgressTask = feature.tasks.find(task => !task.includes('[x]'));
      if (inProgressTask) {
        status = 'In Progress';
      } else if (feature.completedTasks === feature.totalTasks && feature.totalTasks > 0) {
        status = 'Done';
      }
      const pct = feature.totalTasks > 0 ? Math.round((feature.completedTasks / feature.totalTasks) * 100) : 0;

      return `            <tr>
                <td><strong>${feature.name}</strong></td>
                <td><span class="badge status-${status.toLowerCase().replace(' ', '-')}">${status}</span></td>
                <td>${feature.totalTasks}</td>
                <td>${feature.completedTasks} / ${feature.totalTasks}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${pct}%;"></div></div>
                        <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${pct}%</span>
                    </div>
                </td>
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