import { FileSystemUtils } from '../utils/file-system';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ViewStatus {
  async run(): Promise<void> {
    console.log('📊 Visualizando status atual do Kanban...');

    // Read the generated dashboard
    const dashboardPath = path.join(__dirname, '../../docs/kanban-dashboard.md');
    if (FileSystemUtils.fileExists(dashboardPath)) {
      console.log('\n' + FileSystemUtils.readFile(dashboardPath));
    } else {
      console.log('❌ Dashboard não encontrado. Execute o orchestrator primeiro.');
    }

    // Also check sync log
    const logPath = path.join(__dirname, '../../logs/sync-log.json');
    if (FileSystemUtils.fileExists(logPath)) {
      const logData = JSON.parse(FileSystemUtils.readFile(logPath));
      console.log('\n📋 Últimos syncs:');
      logData.slice(-5).forEach((entry: any, index: number) => {
        console.log(`   ${index + 1}. ${entry.timestamp}: ${entry.message}`);
      });
    } else {
      console.log('\n❌ Sync log não encontrado.');
    }
  }
}

// Entrypoint CLI
const isMain = process.argv[1] && (
  process.argv[1].endsWith('VIEW_STATUS.ts') || 
  process.argv[1].endsWith('VIEW_STATUS.js')
);

if (isMain) {
  new ViewStatus().run().catch((error) => {
    console.error('Fatal error viewing status:', error);
    process.exit(1);
  });
}