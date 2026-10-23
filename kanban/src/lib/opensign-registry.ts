import * as fs from 'fs';
import * as path from 'path';

/**
 * Registro local documento OpenSign -> card do Kanban.
 *
 * O webhook do OpenSign (API v1.1) NÃO envia metadata customizada: os eventos
 * trazem apenas `objectId`. Este registro fecha essa lacuna sem inventar
 * campos no payload do provedor.
 */

export interface DocumentLink {
  documentId: string;
  cardId: string;
  createdAt: string;
}

const MAX_ENTRIES = 5000;

export function registryPath(rootDir: string): string {
  return path.join(rootDir, 'logs', 'opensign-documents.json');
}

function readRegistry(rootDir: string): DocumentLink[] {
  const file = registryPath(rootDir);
  if (!fs.existsSync(file)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(parsed) ? (parsed as DocumentLink[]) : [];
  } catch {
    return [];
  }
}

function writeRegistry(rootDir: string, entries: DocumentLink[]): void {
  const file = registryPath(rootDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(entries.slice(-MAX_ENTRIES), null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
}

export function registerDocument(rootDir: string, documentId: string, cardId: string): DocumentLink {
  if (!documentId || !cardId) throw new Error('documentId e cardId são obrigatórios');
  const entries = readRegistry(rootDir).filter((entry) => entry.documentId !== documentId);
  const link: DocumentLink = { documentId, cardId, createdAt: new Date().toISOString() };
  entries.push(link);
  writeRegistry(rootDir, entries);
  return link;
}

export function resolveCardId(rootDir: string, documentId: string): string | undefined {
  if (!documentId) return undefined;
  return readRegistry(rootDir)
    .slice()
    .reverse()
    .find((entry) => entry.documentId === documentId)?.cardId;
}
