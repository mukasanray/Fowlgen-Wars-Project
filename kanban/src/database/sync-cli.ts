import { SyncService } from './sync-service.ts';

async function main() {
  console.log('🔄 Sincronizando OpenSpec ↔ PostgreSQL...');
  const sync = new SyncService();
  const res = await sync.importFromOpenSpec();
  console.log(`✅ Sincronização concluída!`);
  console.log(`   • Features processadas: ${res.importedFeatures}`);
  console.log(`   • Tarefas processadas:  ${res.importedTasks}`);
}

main().catch(err => {
  console.error('❌ Erro na sincronização:', err);
  process.exit(1);
});
