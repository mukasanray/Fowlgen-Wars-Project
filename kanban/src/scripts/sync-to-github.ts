// Sync OpenSpec tasks to GitHub Projects & Issues API
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

export class SyncToGitHub {
  private config: KanbanConfig;

  constructor(config: KanbanConfig) {
    this.config = config;
  }

  async run(): Promise<void> {
    console.log('📤 Exportando tarefas OpenSpec para GitHub Projects & Issues API...');

    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

    // Método 1: Sincronização direta via GitHub REST / GraphQL API (sem necessidade de gh CLI)
    if (token && token.trim()) {
      const apiSuccess = await this.syncViaGitHubApi(token.trim());
      if (apiSuccess) {
        console.log('✅ Tarefas OpenSpec sincronizadas com a API do GitHub com sucesso! 🎯');
        return;
      }
    }

    // Método 2: Fallback para GitHub CLI (gh) se instalado e autenticado
    let ghAvailable = false;
    try {
      FileSystemUtils.executeShellCommand('gh --version');
      FileSystemUtils.executeShellCommand('gh auth status');
      ghAvailable = true;
    } catch {
      ghAvailable = false;
    }

    if (ghAvailable) {
      await this.syncViaGhCli();
      return;
    }

    // Diagnóstico informativo caso nenhuma credencial esteja configurada
    console.log('ℹ️  Nenhuma credencial do GitHub ativa detectada.');
    console.log('💡 Para sincronização automatizada com GitHub Projects / Issues API:');
    console.log('   1. Insira seu token de acesso no painel de Configurações da interface Web ou no arquivo kanban/.env (GH_TOKEN=seu_token)');
    console.log('   OU 2. Autentique o GitHub CLI no terminal executando: gh auth login');
    console.log('⚠️  A sincronização com GitHub foi ignorada com segurança nesta execução.');
  }

  /**
   * Sincronização direta via REST / GraphQL API
   */
  async syncViaGitHubApi(token: string): Promise<boolean> {
    const repoFullName = (this.config.github?.repo || 'mukasanray/Fowlgen-Wars-Project').trim();
    const [owner, repo] = repoFullName.split('/');
    if (!owner || !repo) {
      console.log(`⚠️ Repositório inválido em kanban-config: "${repoFullName}"`);
      return false;
    }

    console.log(`📡 Sincronizando via GitHub REST / GraphQL API para ${owner}/${repo}...`);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Fowlgen-Wars-Kanban-Studio',
      'Content-Type': 'application/json'
    };

    let existingIssues: any[] = [];
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`, { headers });
      if (res.ok) {
        existingIssues = (await res.json()) as any[];
      } else {
        console.log(`⚠️ GitHub API retornou HTTP ${res.status} ao consultar issues: ${res.statusText}`);
      }
    } catch (err: any) {
      console.log(`⚠️ Erro de conexão com GitHub API: ${err.message}`);
    }

    const changesDir = path.join(__dirname, '../../../openspec/changes');
    const features = FileSystemUtils.getDirectories(changesDir);

    let count = 0;
    for (const feature of features) {
      const featureDir = path.join(changesDir, feature);
      const tasksFile = path.join(featureDir, 'tasks.md');
      const proposalFile = path.join(featureDir, 'proposal.md');

      if (!FileSystemUtils.fileExists(tasksFile)) continue;

      const tasksContent = FileSystemUtils.readFile(tasksFile);
      const proposalContent = FileSystemUtils.fileExists(proposalFile)
        ? FileSystemUtils.readFile(proposalFile)
        : `Feature OpenSpec: ${feature}`;

      const issueTitle = `[OpenSpec] ${feature}`;
      const issueBody = `## Proposta & Detalhes\n${proposalContent.slice(0, 1500)}\n\n## Checklist de Tarefas\n${tasksContent}`;

      const found = existingIssues.find(i =>
        i.title === issueTitle ||
        i.title === feature ||
        i.title.toLowerCase().includes(feature.toLowerCase())
      );

      try {
        if (found) {
          const patchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${found.number}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ body: issueBody })
          });
          if (patchRes.ok) {
            console.log(`🔄 Issue #${found.number} atualizada para [${feature}]`);
            count++;
          }
        } else {
          const postRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              title: issueTitle,
              body: issueBody,
              labels: ['openspec', 'sprint']
            })
          });
          if (postRes.ok) {
            const created = (await postRes.json()) as any;
            console.log(`✅ Issue #${created.number} criada no GitHub para [${feature}]`);
            count++;

            const projectId = this.config.projectId;
            if (projectId && projectId.startsWith('PVT_')) {
              try {
                const gqlQuery = `mutation($projectId: ID!, $contentId: ID!) {
                  addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
                    item { id }
                  }
                }`;
                await fetch('https://api.github.com/graphql', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    query: gqlQuery,
                    variables: { projectId, contentId: created.node_id }
                  })
                });
              } catch {}
            }
          }
        }
      } catch (err: any) {
        console.log(`⚠️ Erro ao sincronizar "${feature}": ${err.message}`);
      }
    }

    console.log(`✅ Total de ${count} feature(s) sincronizadas com a API do GitHub.`);
    return true;
  }

  /**
   * Fallback via GitHub CLI
   */
  async syncViaGhCli(): Promise<void> {
    const PROJECT_ID = this.config.projectId ||
      FileSystemUtils.executeShellCommand('gh project list --format json -q \'[0].id\'');

    console.log(`📋 Sincronizando via GitHub CLI (Project ID: ${PROJECT_ID})...`);

    const changesDir = path.join(__dirname, '../../../openspec/changes');
    const features = FileSystemUtils.getDirectories(changesDir);

    for (const feature of features) {
      const featureDir = path.join(changesDir, feature);
      const tasksFile = path.join(featureDir, 'tasks.md');
      if (!FileSystemUtils.fileExists(tasksFile)) continue;

      const tasksContent = FileSystemUtils.readFile(tasksFile);
      const taskLines = tasksContent.match(/^\s*\[.?\].*/gm) || [];
      const proposalFile = path.join(featureDir, 'proposal.md');
      const proposalContent = FileSystemUtils.fileExists(proposalFile) ?
        FileSystemUtils.readFile(proposalFile).substring(0, 1000) :
        `Feature: ${feature}`;

      const createCmd = `gh project item-create "${PROJECT_ID}" \
        --title "${feature}" \
        --body "${proposalContent.replace(/"/g, '\\"')}" \
        --label "${this.config.defaultLabels.join(',')}" \
        --assignee "${this.config.assignee}" \
        --status "Backlog"`;

      try {
        FileSystemUtils.executeShellCommand(createCmd);
        console.log(`✅ Feature "${feature}" enviada para o projeto`);
      } catch (error) {
        // Ignora erro se item já existir
      }
    }

    console.log('✅ Tarefas OpenSpec sincronizadas com GitHub Kanban via CLI! 🎯');
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