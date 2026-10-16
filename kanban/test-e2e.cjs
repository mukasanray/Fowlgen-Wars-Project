const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(options.path, BASE_URL);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (body) {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🧪 INICIANDO BATERIA COMPLETA DE TESTES DO KANBAN');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  try {
    // 1. Test Static Files & Web Interface
    console.log('--- 1. Servidor & Arquivos Estáticos ---');
    const resRoot = await request({ path: '/' });
    assert(resRoot.status === 200, 'GET / retorna 200 OK');
    assert(resRoot.data.includes('btn-view-analytics'), 'index.html contém botão da 3ª aba Analytics');
    assert(resRoot.data.includes('analytics-dashboard-container'), 'index.html contém container de Analytics');

    const resAppJs = await request({ path: '/app.js' });
    assert(resAppJs.status === 200, 'GET /app.js retorna 200 OK');
    assert(resAppJs.data.includes('renderAnalyticsDashboard'), 'app.js contém função renderAnalyticsDashboard');
    assert(resAppJs.data.includes('btn-view-analytics'), 'app.js contém seletor btn-view-analytics');

    const resStyles = await request({ path: '/styles.css' });
    assert(resStyles.status === 200, 'GET /styles.css retorna 200 OK');
    assert(resStyles.data.includes('.analytics-dashboard-container'), 'styles.css contém estilos do container Analytics');
    assert(resStyles.data.includes('.donut-chart-container'), 'styles.css contém estilos do gráfico donut');

    // 2. Test Configuration & Members API
    console.log('\n--- 2. API de Membros & Git ---');
    assert(resAppJs.data.includes('btnSaveMember?.addEventListener(\'click\', saveOrUpdateMember)'), 'app.js vincula evento de clique ao botão salvar/cadastrar integrante');
    assert(resAppJs.data.includes('btnCancelEditMember?.addEventListener(\'click\', cancelEditMember)'), 'app.js vincula evento de clique ao botão cancelar edição');

    const resMembers = await request({ path: '/api/members' });
    assert(resMembers.status === 200 && resMembers.json && resMembers.json.success, 'GET /api/members retorna 200 com lista');
    assert(Array.isArray(resMembers.json.members) && resMembers.json.members.length > 0, 'Lista de integrantes não está vazia');
    const hasCoreMembers = resMembers.json.members.some(m => m.id === 'marcos' || m.id === 'samuel');
    assert(hasCoreMembers, 'Membros core (Marcos / Samuel) estão presentes na lista de integrantes');

    // Teste Cadastro de Integrante (POST /api/members)
    const testMemberName = 'Dev Teste Automatizado';
    const resCreateMember = await request({
      path: '/api/members',
      method: 'POST'
    }, {
      name: testMemberName,
      role: 'QA & Automação',
      github: 'devteste',
      avatar: '🧪',
      color: '#10b981'
    });
    assert(resCreateMember.status === 200 && resCreateMember.json && resCreateMember.json.success, 'POST /api/members cadastra novo integrante com sucesso');
    const createdMemberId = resCreateMember.json.member.id;

    // Teste Alteração de Integrante (PUT /api/members/update)
    const resUpdateMember = await request({
      path: '/api/members/update',
      method: 'PUT'
    }, {
      id: createdMemberId,
      name: testMemberName,
      role: 'Líder de Automação & Testes',
      github: 'devteste-updated',
      avatar: '🛡️',
      color: '#6366f1'
    });
    assert(resUpdateMember.status === 200 && resUpdateMember.json && resUpdateMember.json.success, 'PUT /api/members/update altera integrante com sucesso');
    assert(resUpdateMember.json.member.github === 'devteste-updated', 'GitHub do integrante atualizado corretamente');
    assert(resUpdateMember.json.member.role === 'Líder de Automação & Testes', 'Papel do integrante atualizado corretamente');

    // Teste Exclusão de Integrante (POST /api/members/delete)
    const resDeleteMember = await request({
      path: '/api/members/delete',
      method: 'POST'
    }, {
      id: createdMemberId
    });
    assert(resDeleteMember.status === 200 && resDeleteMember.json && resDeleteMember.json.success, 'POST /api/members/delete remove integrante temporário com sucesso');

    const resGit = await request({ path: '/api/git/info' });
    assert(resGit.status === 200 && resGit.json && resGit.json.success, 'GET /api/git/info retorna dados de branch e commit');

    // 3. Test Feature Creation (OpenSpec Change)
    console.log('\n--- 3. Criação de Ideia / Feature OpenSpec ---');
    const testFeatureId = 'teste-arena-pvp';
    const testTitle = 'Arena PvP Multijogador em Tempo Real';
    const resCreate = await request({
      path: '/api/features/create',
      method: 'POST'
    }, {
      featureId: testFeatureId,
      title: testTitle,
      summary: 'Implementar arena de combate para batalhas 1v1',
      prompt: 'Arena PvP competitiva',
      tasks: [
        'Criar servidor WebSocket para o lobby',
        'Implementar sincronização de posição dos players',
        'Adicionar tela de vitória e derrota'
      ]
    });

    assert(resCreate.status === 200 && resCreate.json && resCreate.json.success, 'POST /api/features/create criou a feature com sucesso');

    // 4. Verify Feature in Features List & Structure
    console.log('\n--- 4. Listagem e Validação da Feature Criada ---');
    const resFeatures = await request({ path: '/api/features' });
    assert(resFeatures.status === 200 && resFeatures.json && resFeatures.json.success, 'GET /api/features retorna lista atualizada');
    const createdFeature = resFeatures.json.features.find(f => f.name === testFeatureId);
    assert(Boolean(createdFeature), `Feature "${testFeatureId}" encontrada na listagem`);
    assert(createdFeature && createdFeature.totalTasks === 3, 'Feature contém 3 tarefas registradas');
    assert(createdFeature && createdFeature.doneTasks === 0, 'Feature inicia com 0 tarefas concluídas');
    assert(createdFeature && createdFeature.progress === 0, 'Progresso inicial é 0%');

    // 5. Test Task Update (Check / Complete Task)
    console.log('\n--- 5. Atualização de Tarefas (Checklist Interativo) ---');
    const resUpdateTask = await request({
      path: '/api/tasks/update',
      method: 'POST'
    }, {
      feature: testFeatureId,
      taskId: '1.1',
      isCompleted: true
    });
    assert(resUpdateTask.status === 200 && resUpdateTask.json && resUpdateTask.json.success, 'POST /api/tasks/update marca tarefa 1.1 como concluída');

    // Re-verify progress
    const resFeaturesAfterCheck = await request({ path: '/api/features' });
    const featureAfterCheck = resFeaturesAfterCheck.json.features.find(f => f.name === testFeatureId);
    assert(featureAfterCheck && featureAfterCheck.doneTasks === 1, 'Feature agora possui 1 tarefa concluída');
    assert(featureAfterCheck && featureAfterCheck.progress === 33, `Progresso calculado corretamente (${featureAfterCheck?.progress}%)`);

    // 6. Test Idea Validation / Action
    console.log('\n--- 6. Ações do Funil de Ideias ---');
    const resValidate = await request({
      path: '/api/features/action',
      method: 'POST'
    }, {
      feature: testFeatureId,
      action: 'validate'
    });
    assert(resValidate.status === 200 && resValidate.json && resValidate.json.success, 'POST /api/features/action (validate) validou a ideia');

    // 7. Test Dashboard & Analytics Endpoints
    console.log('\n--- 7. Endpoints de Dashboard & Relatórios ---');
    const resDashboardApi = await request({ path: '/api/dashboard' });
    assert(resDashboardApi.status === 200 && resDashboardApi.json && resDashboardApi.json.success, 'GET /api/dashboard retorna JSON com markdown');
    assert(resDashboardApi.json && resDashboardApi.json.markdown.length > 50, 'Relatório Markdown gerado com conteúdo detalhado');

    const resDashboardHtml = await request({ path: '/dashboard' });
    assert(resDashboardHtml.status === 200, 'GET /dashboard serve HTML autônomo com 200 OK');
    assert(resDashboardHtml.data.includes('Fowlgen Wars'), 'HTML do dashboard contém cabeçalho Fowlgen Wars');

    // 8. Clean Up Test Feature
    console.log('\n--- 8. Limpeza do Ambiente de Teste ---');
    const repoRoot = path.resolve(__dirname, '..');
    const testFeatureDir = path.join(repoRoot, 'openspec', 'changes', testFeatureId);
    if (fs.existsSync(testFeatureDir)) {
      fs.rmSync(testFeatureDir, { recursive: true, force: true });
      console.log(`🧹 Diretório de teste ${testFeatureDir} removido com sucesso.`);
    }
    assert(!fs.existsSync(testFeatureDir), 'Diretório de teste foi limpo sem resíduos');

    console.log('\n====================================================');
    console.log(`📊 RESULTADO FINAL: ${passed} PASSOU / ${failed} FALHOU`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Erro inesperado durante execução dos testes:', err);
    process.exit(1);
  }
}

runAllTests();
