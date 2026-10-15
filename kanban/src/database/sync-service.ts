import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from './db.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OPEN_SPEC_DIR = path.resolve(__dirname, '../../../openspec/changes');

export class SyncService {
  /**
   * Importa todas as features e tarefas do OpenSpec para o PostgreSQL
   */
  async importFromOpenSpec(): Promise<{ importedFeatures: number; importedTasks: number }> {
    const conn = await testConnection();
    if (!conn.connected) {
      return { importedFeatures: 0, importedTasks: 0 };
    }

    if (!fs.existsSync(OPEN_SPEC_DIR)) {
      return { importedFeatures: 0, importedTasks: 0 };
    }

    const entries = fs.readdirSync(OPEN_SPEC_DIR, { withFileTypes: true });
    const featureDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

    let featureCount = 0;
    let taskCount = 0;

    for (const featureName of featureDirs) {
      const featureDir = path.join(OPEN_SPEC_DIR, featureName);
      const proposalPath = path.join(featureDir, 'proposal.md');
      const tasksPath = path.join(featureDir, 'tasks.md');

      let proposalContent = '';
      let status = 'Backlog';

      if (fs.existsSync(proposalPath)) {
        proposalContent = fs.readFileSync(proposalPath, 'utf8');
        if (proposalContent.includes('[APROVADO]')) status = 'Aprovado';
        else if (proposalContent.includes('[VALIDADO]')) status = 'Validado';
        else if (proposalContent.includes('[REJEITADO]')) status = 'Rejeitado';
      }

      // Upsert na tabela de features
      await query(
        `INSERT INTO kanban_features (id, title, summary, status, proposal_raw, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           summary = EXCLUDED.summary,
           status = EXCLUDED.status,
           proposal_raw = EXCLUDED.proposal_raw,
           updated_at = CURRENT_TIMESTAMP`,
        [featureName, featureName, proposalContent.substring(0, 300), status, proposalContent]
      );
      featureCount++;

      // Processa tasks.md
      if (fs.existsSync(tasksPath)) {
        const tasksContent = fs.readFileSync(tasksPath, 'utf8');
        const lines = tasksContent.split('\n');
        let currentSection = 'Geral';

        for (const line of lines) {
          const secMatch = line.match(/^##\s*\d*\.?\s*(.+)/);
          if (secMatch) {
            currentSection = secMatch[1].trim();
            continue;
          }

          const taskMatch = line.match(/^\s*[-*]?\s*\[([ xX])\]\s*(\*\*(.+?)\*\*)?\s*(.*)/);
          if (taskMatch) {
            const isCompleted = taskMatch[1].toLowerCase() === 'x';
            const taskNumber = taskMatch[3] ? taskMatch[3].trim() : `t-${taskCount + 1}`;
            const description = taskMatch[4] ? taskMatch[4].trim() : '';

            let assignee = 'Equipe';
            const assigneeMatch = description.match(/\(([^)]+)\)$/);
            if (assigneeMatch) {
              assignee = assigneeMatch[1].trim();
            }

            const taskStatus = isCompleted ? 'Concluído' : 'Em Andamento';

            await query(
              `INSERT INTO kanban_tasks (feature_id, task_number, description, section, status, is_completed, assignee, raw_line, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
               ON CONFLICT (feature_id, task_number) DO UPDATE SET
                 description = EXCLUDED.description,
                 section = EXCLUDED.section,
                 status = EXCLUDED.status,
                 is_completed = EXCLUDED.is_completed,
                 assignee = EXCLUDED.assignee,
                 raw_line = EXCLUDED.raw_line,
                 updated_at = CURRENT_TIMESTAMP`,
              [featureName, taskNumber, description, currentSection, taskStatus, isCompleted, assignee, line.trim()]
            );
            taskCount++;
          }
        }
      }
    }

    // Registra log de auditoria
    try {
      await query(
        `INSERT INTO kanban_sync_logs (source, action, status, details)
         VALUES ($1, $2, $3, $4)`,
        ['openspec', 'import_all', 'success', JSON.stringify({ featureCount, taskCount })]
      );
    } catch {}

    return { importedFeatures: featureCount, importedTasks: taskCount };
  }

  /**
   * Atualiza ou insere uma tarefa no PostgreSQL E no OpenSpec markdown
   */
  async syncTask(featureId: string, taskNumber: string, isCompleted: boolean, status?: string, assignee?: string, text?: string): Promise<void> {
    const conn = await testConnection();

    // 1. Atualiza no PostgreSQL se conectado
    if (conn.connected) {
      try {
        const taskStatus = status || (isCompleted ? 'Concluído' : 'Em Andamento');
        const assignedTo = assignee || 'Equipe';

        await query(
          `INSERT INTO kanban_tasks (feature_id, task_number, description, status, is_completed, assignee, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
           ON CONFLICT (feature_id, task_number) DO UPDATE SET
             is_completed = EXCLUDED.is_completed,
             status = EXCLUDED.status,
             assignee = EXCLUDED.assignee,
             description = COALESCE($3, kanban_tasks.description),
             updated_at = CURRENT_TIMESTAMP`,
          [featureId, taskNumber, text || `Tarefa ${taskNumber}`, taskStatus, isCompleted, assignedTo]
        );

        await query(
          `INSERT INTO kanban_sync_logs (source, action, status, details)
           VALUES ($1, $2, $3, $4)`,
          ['studio', 'update_task', 'success', JSON.stringify({ featureId, taskNumber, isCompleted, status, assignee })]
        );
      } catch (err: any) {
        console.warn('⚠️  Erro ao atualizar task no Postgres:', err.message);
      }
    }

    // 2. Atualiza no OpenSpec tasks.md
    const tasksPath = path.join(OPEN_SPEC_DIR, featureId, 'tasks.md');
    if (fs.existsSync(tasksPath)) {
      const content = fs.readFileSync(tasksPath, 'utf8');
      const lines = content.split('\n');
      let found = false;

      const newLines = lines.map(line => {
        if (line.includes(`**${taskNumber}**`)) {
          found = true;
          const mark = isCompleted ? '[x]' : '[ ]';
          let updated = line.replace(/\[[ xX]\]/, mark);
          if (assignee && !updated.includes(assignee)) {
            updated += ` (${assignee})`;
          }
          return updated;
        }
        return line;
      });

      if (!found && text) {
        newLines.push(`- [${isCompleted ? 'x' : ' '}] **${taskNumber}** ${text}${assignee ? ` (${assignee})` : ''}`);
      }

      fs.writeFileSync(tasksPath, newLines.join('\n'), 'utf8');
    }
  }

  /**
   * Cria ou atualiza uma feature no PostgreSQL E no OpenSpec
   */
  async syncFeature(featureId: string, title: string, summary: string, status = 'Backlog'): Promise<void> {
    const conn = await testConnection();

    // 1. Atualiza no PostgreSQL
    if (conn.connected) {
      try {
        await query(
          `INSERT INTO kanban_features (id, title, summary, status, updated_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             summary = EXCLUDED.summary,
             status = EXCLUDED.status,
             updated_at = CURRENT_TIMESTAMP`,
          [featureId, title, summary, status]
        );
      } catch (err: any) {
        console.warn('⚠️  Erro ao atualizar feature no Postgres:', err.message);
      }
    }

    // 2. Garante arquivos no OpenSpec
    const featureDir = path.join(OPEN_SPEC_DIR, featureId);
    if (!fs.existsSync(featureDir)) {
      fs.mkdirSync(featureDir, { recursive: true });
    }

    const proposalPath = path.join(featureDir, 'proposal.md');
    if (!fs.existsSync(proposalPath)) {
      const content = `# Feature: ${featureId}\n\n## Title\n${title}\n\n## Summary\n${summary}\n\n## Status\n[${status.toUpperCase()}]\n`;
      fs.writeFileSync(proposalPath, content, 'utf8');
    }

    const tasksPath = path.join(featureDir, 'tasks.md');
    if (!fs.existsSync(tasksPath)) {
      const content = `# Tasks for ${featureId}\n\n## 1. Planejamento\n- [ ] **1.1** Planejamento da feature\n`;
      fs.writeFileSync(tasksPath, content, 'utf8');
    }
  }
}
