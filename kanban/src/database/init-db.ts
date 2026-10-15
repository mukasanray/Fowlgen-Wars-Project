import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getDbConfig, testConnection } from './db.ts';
import { SyncService } from './sync-service.ts';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initDatabase(): Promise<{ success: boolean; message: string }> {
  console.log('\n🐘 Inicializando Banco de Dados PostgreSQL para o Kanban...');
  const cfg = getDbConfig();

  // 1. Testa conectividade inicial
  const targetDb = cfg.database || 'fowlgen_kanban';
  const maintenanceDb = 'postgres'; // banco administrativo para criar a nova database

  console.log(`📡 Conectando ao PostgreSQL em ${cfg.host}:${cfg.port} (usuário: ${cfg.user})...`);

  // Conecta ao banco de manutenção para checar/criar o banco 'fowlgen_kanban'
  const adminClient = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: maintenanceDb,
    connectionTimeoutMillis: 4000
  });

  try {
    await adminClient.connect();
    console.log('   ✅ Conexão administrativa estabelecida.');

    // Verifica se a database existe
    const checkDb = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (checkDb.rows.length === 0) {
      console.log(`   📦 Criando nova database "${targetDb}"...`);
      await adminClient.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`   ✅ Database "${targetDb}" criada com sucesso!`);
    } else {
      console.log(`   ✅ Database "${targetDb}" já existe.`);
    }

    await adminClient.end();
  } catch (adminErr: any) {
    console.warn(`   ⚠️  Aviso ao acessar banco de manutenção "${maintenanceDb}": ${adminErr.message}`);
    try { await adminClient.end(); } catch {}
  }

  // 2. Conecta à database alvo e executa o schema
  const dbClient = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: targetDb,
    connectionTimeoutMillis: 4000
  });

  try {
    await dbClient.connect();
    console.log(`   🔌 Conectado à database "${targetDb}". Aplicando schema SQL...`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await dbClient.query(sql);
      console.log('   ✅ Tabelas criadas/validadas com sucesso!');
    }

    await dbClient.end();

    // 3. Importa features do OpenSpec para o PostgreSQL
    console.log('\n🔄 Importando features do OpenSpec para o PostgreSQL...');
    const sync = new SyncService();
    const result = await sync.importFromOpenSpec();
    console.log(`   ✅ ${result.importedFeatures} features e ${result.importedTasks} tarefas sincronizadas com o banco!`);

    console.log('\n==================================================');
    console.log(`🎯 BANCO POSTGRESQL (${targetDb}) CONFIGURADO COM SUCESSO!`);
    console.log('==================================================\n');

    return { success: true, message: `Database ${targetDb} inicializada com sucesso!` };
  } catch (err: any) {
    try { await dbClient.end(); } catch {}
    console.log('\n⚠️  Não foi possível conectar ao PostgreSQL em localhost:5432:');
    console.log(`   Motivo: ${err.message}`);
    console.log('\n💡 DICA PARA INICIAR O POSTGRESQL:');
    console.log('   • Via Docker: Execute `docker compose up -d postgres` na raiz do projeto');
    console.log('   • Via WSL2: Execute `./install.sh` para iniciar o ambiente completo');
    console.log('   • O Kanban Studio continuará funcionando no modo Híbrido (OpenSpec Markdown) sem interrupções!\n');

    return {
      success: false,
      message: `PostgreSQL offline ou inacessível (${err.message}). O sistema continua ativo em modo Híbrido.`
    };
  }
}

// Entrypoint CLI
const isMain = process.argv[1] && (
  process.argv[1].endsWith('init-db.ts') || 
  process.argv[1].endsWith('init-db.js')
);

if (isMain) {
  initDatabase().catch(console.error);
}
