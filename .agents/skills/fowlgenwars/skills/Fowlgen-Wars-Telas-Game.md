# FOWLGEN WARS — Prompt de Telas e Controles Mobile

## Objetivo e status

Este documento orienta a criação e prototipagem das telas do FOWLGEN WARS em Unity, usando as ferramentas de IA da Unity quando estiverem disponíveis. A orientação de jogar com o smartphone na horizontal foi definida pelo usuário. O layout abaixo do controller é uma proposta inicial para validação; não afirma que os controles já estejam implementados ou testados.

Este material complementa o protótipo inicial inspirado em Pong e os conceitos posteriores de partida multiplayer. Não transforma o Mini-MOBA, o mapa de três rotas, cartas, armadilhas ou sistemas on-chain em requisitos automáticos da Sprint atual.

## Fontes verificadas

- [`🐔 FOWLGEN WARS — Sprint 01`](%F0%9F%90%94%20Fowlgen-Wars-Sprint-01.md): a primeira tela é conceitual; a Sprint cita botões Jogar, Cartas, Personagem e Configurações. O protótipo inicial é inspirado em Pong.
- [`Relatório FOWLGEN WARS`](Relatorio-Fowlgen-Wars.md): os testes relatam UI/botões, movimento e colisões como reprovados; valide o estado real antes de apresentar esses itens como funcionais.
- [`🐔 Sistema de Poderes`](%F0%9F%90%94%20Sistema-de%20poderes.md): quatro poderes já disponíveis durante a partida: Ataque, Defesa, Especial e Supremo. A personalização é fora da partida; tempos de recarga são exemplos balanceáveis, não valores finais.
- [`FOWLGEN WARS — Roadmap de POCs`](Fowlgen-Wars-Roadmap-de-Pocs-alterada.md): a POC de FOWLGEN Controller prevê input, movimento, câmera e feedback, sem determinar joystick ou mapeamento de toque. Consulte o roadmap ativo; os documentos de POCs divergem sobre Web/WebGL e Android.
- [`FOWLGEN WARS — Mini-MOBA`](%F0%9F%90%94%20Mini-Moba.md): conceito de partida de aproximadamente três minutos, Galinheiro e quatro rotas. Não presumir que esses elementos estejam presentes no protótipo atual.
- [`FOWLGEN WARS — Mapa de Três Rotas`](Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md): proposta de arena ainda não validada, com três rotas e 18 torres de quantidade fixa; a função mecânica das torres ainda será definida.
- [`🐔 Hierarquia de Personagens`](%F0%9F%90%94%20Hierarquia-de-Personagens.md) e [`🐔 Sistema de cores, essências e classificação`](%F0%9F%90%94%20Fowlgen-wars-%20Sistema-de-cores-essencias-e-classificacao.md): distinguem rota, função, classe, espécie, essência e raridade; não inferir poder ou função pela cor isoladamente.
- [`FOWLGEN — Sistema de Armadilhas Personalizadas`](Fowlgen-Sistema-de-Armadilhas-Personalizadas.md): armadilhas devem ser legíveis e oferecer reação, mas continuam sendo conceito a habilitar conforme escopo aprovado.
- [`Integração Solana, tokens, NFTs e Unity`](Integracao-Solana-tokens-NFTs-Unity-Publicacao-Dapps-Store.md): combate, movimento, UI e partida são off-chain; blockchain não deve participar do loop de toque em tempo real.
- [`Claude.md`](../Claude.md): instruções para não inventar implementação, confirmar divergências e registrar decisões pendentes. O prompt mestre anteriormente referido como `teste.md` não está presente na árvore atual do workspace.

## Decisões e limites

### Definido

- O jogo mobile deve ser apresentado e operado em orientação horizontal (landscape).
- Unity é o motor do jogo. FishNet foi indicado no prompt mestre como a escolha para multiplayer em tempo real, mas sua integração ainda exige POC e evidência.
- Os quatro slots de combate são Ataque, Defesa, Especial e Supremo, conforme o documento de poderes.
- A interface de jogo deve permanecer separada de Solana/Anchor. Wallet/transações não são controles da partida.

### Proposta de controller para validação

- Joystick virtual no quadrante inferior esquerdo para movimento contínuo do personagem.
- Quatro botões de ação no quadrante inferior direito, organizados em grade 2x2: Ataque, Defesa, Especial e Supremo. O Supremo deve ser visualmente distinguível sem depender apenas da cor.
- Cada botão mostra disponibilidade, cooldown ou estado indisponível; não inventar duração, custo, alcance ou efeito. Ler valores de configuração existentes quando houver.
- Não adicionar botão de ataque separado, esquiva, interação, bomba, armadilha, troca de rota ou comandos por gesto sem decisão de gameplay documentada.
- Joystick e posição/ordem dos botões são uma hipótese de UX. Antes de conectar input de produção, comparar com o controller e o loop de jogo realmente implementados. Se o modo for de controle de tropas ou Pong e não de movimento direto de personagem, adaptar o protótipo após validação do Product Owner.

### Ainda não definido

Topologia e autoridade FishNet, formato da partida, reconexão, matchmaking real, função mecânica das torres no mapa de três rotas, escala de HUD, gestos, acessibilidade de controle, dimensões-alvo e valores de cooldown. Não simular conexão real nem progresso persistente sem integração existente.

## Fluxo proposto de telas

Trate os nomes e a navegação a seguir como estrutura de protótipo UI. Use apenas telas pertinentes ao escopo autorizado e reaproveite cenas, prefabs, sistema de UI e navegação que já existam no projeto.

```text
Inicialização
	↓
Menu principal ── Personagem
	│             Coleção/Cartas
	│             Configurações
	↓
Preparação de partida
	↓
Fila/conexão (somente quando houver serviço real)
	↓
Entrada na partida
	↓
HUD de combate ── Pausa/Configurações
	↓
Resultado
	↓
Menu principal
```

### 1. Inicialização

- Exibir carregamento apenas enquanto a cena/recursos realmente inicializam.
- Não bloquear a entrada no jogo esperando wallet ou RPC.
- Se houver erro, apresentar mensagem e ação de tentar novamente/voltar conforme o estado disponível.

### 2. Menu principal

- Usar o wireframe da Sprint 01 como referência de navegação: `Jogar`, `Personagem`, `Cartas/Coleção` e `Configurações`.
- `Jogar` leva à preparação ou, se ela não fizer parte do modo, à entrada de partida definida pelo projeto.
- Não anunciar matchmaking, coleção ou funcionalidades que ainda sejam apenas telas sem backend; identificar dados de exemplo como demonstração.

### 3. Personagem e coleção

- Apresentar somente atributos existentes/configurados. Separar espécie, essência, classe, função/rota e raridade conforme a hierarquia documental.
- A coleção/cartas é uma tela de consulta e progressão futura, não parte obrigatória do protótipo Pong.
- Não sugerir que raridade ou cor representam força.

### 4. Preparação

- Mostrar o personagem/loadout que será usado, se esses dados existirem.
- Para o conceito de quatro poderes, apresentar Ataque, Defesa, Especial e Supremo já equipados. A troca personalizada, se autorizada, ocorre antes da partida, nunca por inventário durante o combate.
- Não criar loja, economia ou compra para tornar esta tela funcional.

### 5. Fila e conexão

- Se houver integração FishNet implementada, representar estados reais separadamente: desconectado, conectando, procurando/aguardando, conectado, falha e cancelamento, usando somente estados fornecidos pelo projeto.
- Incluir ação de cancelar quando o serviço permitir. Tratar timeout/erro com texto claro e opção de tentar novamente/voltar.
- Sem FishNet funcional, apresentar a tela apenas como protótipo identificado; não fabricar jogador adversário, latência, sessão ou sucesso de conexão.

### 6. HUD da partida em landscape

- Manter a área central livre para a arena e personagens. Organizar informações persistentes junto às bordas, fora das zonas de toque.
- Topo: exibir apenas estado e objetivos fornecidos pelo modo atual (por exemplo, tempo ou vida do Galinheiro se realmente usados). Não inserir timer de três minutos, estado funcional das torres ou objetivos do mapa de três rotas sem confirmação.
- Inferior esquerdo: joystick virtual proposto, limitado a uma área de toque estável.
- Inferior direito: quatro ações (Ataque, Defesa, Especial, Supremo), cada uma com feedback de pressionado, indisponível e cooldown.
- Topo direito: botão de pausa/menu, desde que pausa seja válida para a sessão multiplayer. Se não for possível pausar a partida, abrir somente opções locais permitidas e indicar o comportamento real.
- Exibir vida, cooldown, estado de conexão ou objetivos apenas quando fornecidos pelo jogo; não usar valores inventados.

### 7. Pausa e configurações durante a partida

- Abrir como painel/modal sobre o jogo, sem disparar ações de combate por toque acidental.
- Oferecer apenas comandos implementados, como retomar ou sair. Confirmar saída se houver risco de abandonar uma partida.
- Não presumir que a partida pode pausar globalmente em multiplayer.

### 8. Resultado

- Mostrar vencedor/derrota e estatísticas somente a partir do resultado produzido pela partida.
- Botão para continuar/voltar ao menu. Recompensas podem aparecer somente quando o sistema e os valores estiverem definidos; não prometer token, NFT ou prêmio on-chain.

### 9. Configurações

- Começar pelos controles realmente disponíveis no projeto, volume e opções gráficas existentes.
- Não mostrar toggles ou sliders sem comportamento. Preservar as escolhas do jogador quando houver persistência implementada.
- Testar controles e textos em paisagem, áreas seguras, recortes e diferentes proporções de tela.

## Movimento e feedback da interface

- Usar transições curtas e consistentes entre telas; manter o botão Voltar/Cancelar previsível e evitar empilhamento de painéis.
- Botões devem ter estados visualmente distintos: normal, pressionado, indisponível, carregando e foco/acessibilidade quando suportado.
- Nos quatro poderes, o toque deve gerar feedback imediato; cooldown deve ter indicação numérica/visual compreensível. Não depender apenas de vermelho/verde ou de diferenças de cor.
- Feedback de erro, acerto, conexão e resultado deve ser legível sem cobrir personagens/objetivos importantes.
- Não animar HUD crítico continuamente. Respeitar redução de movimento se já houver suporte; não criar animações que mudem a posição dos alvos de toque.
- Manter áreas de toque e dimensões dos controles estáveis para que rótulos, ícones e cooldown não movam os botões.

## Prompt principal para Unity AI

```text
Trabalhe no projeto Unity FOWLGEN WARS existente e use este documento como especificação de UX. Use Unity AI/Assistant apenas para acelerar inspeção, prototipagem, geração de UI e scripts compatíveis com a versão e os pacotes realmente encontrados no projeto.

Antes de editar:
1. Inspecione cenas, hierarquia, sistema de UI (UI Toolkit ou uGUI), input system, prefabs, orientação, render pipeline, pacotes e scripts de gameplay/multiplayer existentes.
2. Leia as skills citadas neste documento. Registre divergências e não trate conceitos ou relatórios como prova de implementação.
3. Confirme que o jogo roda em orientação horizontal. Preserve a configuração atual até localizar a configuração correta a alterar.
4. Não instale pacotes, reestruture cenas, substitua input system, crie backend ou altere arquitetura sem necessidade demonstrada.

Implemente primeiro um protótipo visual navegável das telas que cabem no escopo atual: Menu (Jogar, Personagem, Cartas/Coleção e Configurações), preparação quando aplicável, HUD landscape, painel de pausa e resultado demonstrativo claramente identificado. Reutilize componentes e padrões existentes. Use dados temporários somente quando marcados como placeholder.

Para o HUD mobile de combate, monte como proposta de UX um joystick virtual à esquerda e quatro botões à direita: Ataque, Defesa, Especial e Supremo. Esses slots vêm do documento Sistema de Poderes; o joystick e seu mapeamento ainda precisam ser validados com o controller real. Não adicione ações/gestos extras. Não conecte controles a mecânicas inventadas. Antes de fazer binding, encontre o input/gameplay API real; se não existir, mantenha ações como callbacks explícitos sem efeito de jogo e registre a dependência.

Faça FishNet usar apenas componentes/serviços encontrados no projeto. Se a integração estiver ausente, não invente APIs nem simule matchmaking real: deixe a tela em estado de protótipo e reporte a POC necessária. Não faça UI depender de wallet, RPC, Solana ou Anchor para movimento/combate.

Garanta safe area e legibilidade em proporções landscape diferentes. Não use timer, vida de Galinheiro, torres, recompensas ou status de conexão a menos que o modo forneça esses dados. Use identidade visual original FOWLGEN e não imite propriedade intelectual de terceiros.

Valide: navegação entre telas; back/cancel; estados normal/pressionado/indisponível; layout sem sobreposição; áreas de toque estáveis; orientação landscape; comportamento em dois clientes apenas se FishNet já puder ser executado. Não declare multiplayer validado por um teste visual local.

Ao concluir, informe arquivos/cenas alterados, componentes reaproveitados, o que funciona de verdade, o que continua placeholder, testes executados e decisões pendentes. Não marque itens como concluídos sem evidência.
```

## Critérios de aceite do protótipo de telas

- As telas suportadas pelo escopo atual abrem, navegam e retornam sem erros.
- A aplicação mantém orientação landscape em dispositivo compatível e respeita safe areas.
- A tela de partida não cobre a área central de jogo nem desloca os botões durante atualização de cooldown.
- A proposta do controller contém exatamente os quatro slots de poder documentados; joystick permanece identificado como decisão de UX pendente.
- Botões sem integração não aparentam executar ações reais.
- Conexão, matchmaking, pause multiplayer e resultado refletem apenas estados fornecidos pelos serviços existentes.
- Os testes de UI e input são reportados separadamente dos testes de rede FishNet e das POCs Anchor/Solana.

## Próxima validação de produto

Confirmar se o primeiro controller real será para o protótipo Pong ou para movimento direto de personagem na arena multiplayer. Depois confirmar o mapeamento do joystick, a pausa permitida em partida online e quais informações entram no HUD do modo escolhido. Até lá, manter esses pontos configuráveis e sem assumir que a proposta esteja aprovada.
