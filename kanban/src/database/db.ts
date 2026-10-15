import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carrega .env do kanban se presente
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      const val = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

export function getDbConfig(): DbConfig {
  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'fowlgen',
    password: process.env.POSTGRES_PASSWORD || 'fowlgen_password',
    database: process.env.POSTGRES_DB || 'fowlgen_kanban'
  };
}

let pool: pg.Pool | null = null;
let lastConnectionStatus: { connected: boolean; error?: string; checkedAt: string } = {
  connected: false,
  checkedAt: new Date().toISOString()
};

export function getPool(configOverride?: Partial<DbConfig>): pg.Pool {
  const cfg = { ...getDbConfig(), ...configOverride };
  if (!pool) {
    pool = new Pool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000
    });

    pool.on('error', (err) => {
      console.warn('⚠️ [PostgreSQL Pool Error]:', err.message);
      lastConnectionStatus = { connected: false, error: err.message, checkedAt: new Date().toISOString() };
    });
  }
  return pool;
}

export async function testConnection(configOverride?: Partial<DbConfig>): Promise<{ connected: boolean; error?: string; database?: string }> {
  const cfg = { ...getDbConfig(), ...configOverride };
  const testPool = new Pool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    connectionTimeoutMillis: 3000
  });

  try {
    const client = await testPool.connect();
    const res = await client.query('SELECT current_database() as db, version() as ver');
    client.release();
    await testPool.end();

    lastConnectionStatus = { connected: true, checkedAt: new Date().toISOString() };
    return {
      connected: true,
      database: res.rows[0]?.db || cfg.database
    };
  } catch (err: any) {
    lastConnectionStatus = {
      connected: false,
      error: err.message,
      checkedAt: new Date().toISOString()
    };
    try { await testPool.end(); } catch {}
    return {
      connected: false,
      error: err.message || 'Falha ao conectar com PostgreSQL'
    };
  }
}

export function getConnectionStatus() {
  return lastConnectionStatus;
}

export async function query(text: string, params?: any[]): Promise<pg.QueryResult<any>> {
  const p = getPool();
  return p.query(text, params);
}

export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.end();
    } catch {}
    pool = null;
  }
}
