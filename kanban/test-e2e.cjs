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

    // Teste de Inativação de Integrante e Transferência de Tarefas (POST /api/members/deactivate)
    console.log('\n--- Teste de Inativação e Sucessão de Tarefas ---');

    // 1. Tentar inativar passando a si próprio ou membro inexistente/inativo
    const resFailInactive = await request({
      path: '/api/members/deactivate',
      method: 'POST'
    }, {
      memberId: createdMemberId,
      reassignTo: createdMemberId // não pode repassar para o próprio membro sendo inativado
    });
    assert(resFailInactive.status === 400, 'POST /api/members/deactivate rejeita sucessor inválido ou inativo');

    // 2. Inativação bem-sucedida com Membro Ativo e escopo de tarefas não terminadas (pending)
    const resDeactivate = await request({
      path: '/api/members/deactivate',
      method: 'POST'
    }, {
      memberId: createdMemberId,
      reassignTo: 'marcos',
      transferScope: 'pending'
    });
    assert(resDeactivate.status === 200 && resDeactivate.json && resDeactivate.json.success, 'POST /api/members/deactivate inativa integrante com sucesso');
    assert(resDeactivate.json.member.status === 'inactive', 'Status do integrante alterado para inactive');
    assert(resDeactivate.json.member.active === false, 'Campo active alterado para false');
    assert(resDeactivate.json.scope === 'pending', 'Escopo de repasse configurado para pending (tarefas não terminadas)');

    // Teste de Reativação de Integrante (POST /api/members/activate)
    const resActivate = await request({
      path: '/api/members/activate',
      method: 'POST'
    }, {
      memberId: createdMemberId
    });
    assert(resActivate.status === 200 && resActivate.json && resActivate.json.success, 'POST /api/members/activate reativa integrante com sucesso');
    assert(resActivate.json.member.status === 'active', 'Status do integrante restaurado para active');
    assert(resActivate.json.member.active === true, 'Campo active restaurado para true');

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

    // 8. Test Multi-Dropdown & Mandatory Assignee Validation
    console.log('\n--- 8. Multi-Dropdown & Seleção Obrigatória de Responsável ---');
    assert(resRoot.data.includes('multi-assignee-container'), 'index.html contém container multi-assignee-container');
    assert(resRoot.data.includes('multi-assignee-trigger'), 'index.html contém trigger multi-assignee-trigger');
    assert(resRoot.data.includes('multi-assignee-dropdown'), 'index.html contém menu multi-assignee-dropdown');
    assert(resRoot.data.includes('Selecione o(s) responsável(is)... *'), 'index.html exibe placeholder de seleção obrigatória');
    assert(resStyles.data.includes('.multi-select-container'), 'styles.css define regras para .multi-select-container');
    assert(resStyles.data.includes('.multi-select-trigger.has-error'), 'styles.css define efeito de erro/shake para validação obrigatória');
    assert(resAppJs.data.includes('selectedTaskAssignees'), 'app.js gerencia estado selectedTaskAssignees');
    assert(resAppJs.data.includes('Selecione ao menos um Responsável para a tarefa'), 'app.js bloqueia criação sem responsável');

    // Teste de criação de tarefa com múltiplos responsáveis
    const resMultiTask = await request({
      path: '/api/tasks/create',
      method: 'POST'
    }, {
      feature: testFeatureId,
      taskId: '2.1',
      text: 'Tarefa com múltiplos responsáveis',
      assignee: 'Marcos, Samuel',
      status: 'Backlog'
    });
    assert(resMultiTask.status === 200 && resMultiTask.json && resMultiTask.json.success, 'POST /api/tasks/create cria tarefa com múltiplos responsáveis');

    const resFeaturesMulti = await request({ path: '/api/features' });
    const targetFeat = resFeaturesMulti.json.features.find(f => f.name === testFeatureId);
    const multiTask = targetFeat?.tasks.find(t => t.id === '2.1');
    assert(multiTask && multiTask.assignee === 'Marcos, Samuel', 'Tarefa criada possui ambos os responsáveis normalizados (Marcos, Samuel)');
    assert(targetFeat.assignees.includes('Marcos') && targetFeat.assignees.includes('Samuel'), 'Feature lista ambos os responsáveis na coleção de assignees');

    // 9. Test Reusable Confirmation Modal System
    console.log('\n--- 9. Sistema de Modais de Confirmação Preventiva ---');
    assert(resRoot.data.includes('modal-confirm-action'), 'index.html contém modal de confirmação modal-confirm-action');
    assert(resRoot.data.includes('btn-confirm-modal-confirm'), 'index.html contém botão confirmar');
    assert(resRoot.data.includes('btn-confirm-modal-cancel'), 'index.html contém botão cancelar');
    assert(resAppJs.data.includes('function showConfirmModal'), 'app.js implementa showConfirmModal genérico com Promise');
    assert(resAppJs.data.includes('Concluir Tarefa'), 'app.js vincula modal de confirmação ao checkbox de tarefas');
    assert(resAppJs.data.includes('Sim, Excluir Tarefa') || resAppJs.data.includes('Sim, Excluir'), 'app.js vincula modal de confirmação à exclusão de tarefas');
    assert(resAppJs.data.includes('Subir Commits para o Repositório') || resAppJs.data.includes('Baixar Alterações do Repositório'), 'app.js vincula modal de confirmação ao Git Push / Pull');
    assert(resAppJs.data.includes('Limpar Logs de Execução'), 'app.js vincula modal de confirmação à limpeza de logs');

    // 10. Test Input Clearing upon Task and Idea/Feature Registration
    console.log('\n--- 10. Limpeza de Inputs após Cadastro (Tarefas e Ideias/Features) ---');
    assert(resAppJs.data.includes('function clearTaskForm'), 'app.js implementa clearTaskForm para redefinir inputs de tarefas');
    assert(resAppJs.data.includes('function clearIdeaForm'), 'app.js implementa clearIdeaForm para redefinir inputs de ideias/features');
    assert(resAppJs.data.includes('clearTaskForm(true);'), 'btn-action-create-task invoca clearTaskForm após cadastro com sucesso');
    assert(resAppJs.data.includes('clearIdeaForm(true);'), 'btn-action-new-feature invoca clearIdeaForm após cadastro com sucesso');
    assert(resRoot.data.includes('Arte Designer 2D'), 'index.html contém opção Arte Designer 2D');
    assert(resRoot.data.includes('Arte e Animador 3D'), 'index.html contém opção Arte e Animador 3D');
    assert(!resRoot.data.includes('Arte 2D / 3D & VFX'), 'index.html não contém mais a opção combinada com VFX');

    // 11. Clean Up Test Feature
    console.log('\n--- 11. Limpeza do Ambiente de Teste ---');
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
