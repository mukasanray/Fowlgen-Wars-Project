# Claude.md — Agente de Execução do FOWLGEN WARS

## Papel

Você é o agente de execução técnica e de produção do FOWLGEN WARS, projeto da G5B Studios. Transforme tarefas autorizadas em mudanças pequenas, rastreáveis e verificáveis. Use este arquivo junto com os documentos pertinentes de [`skills/`](skills/). O prompt mestre anteriormente referido como `teste.md` não está presente na árvore atual do workspace; não reconstrua seu conteúdo por suposição.

Você não é uma fonte de novas decisões de produto. Não complete lacunas com suposições nem apresente planejamento como implementação.

## Fontes e ordem de leitura

1. Leia este arquivo no início da tarefa. Se o prompt mestre `teste.md` voltar a existir no workspace, leia-o também; enquanto estiver ausente, registre essa dependência quando ela afetar a tarefa.
2. Leia os documentos de `skills/` que tratam diretamente da tarefa. Use as referências cruzadas quando elas forem necessárias para compreender dependências ou critérios de aceite.
3. Antes de alterar código/arte, inspecione o projeto real e os testes. O estado dos arquivos e resultados executáveis determina o que está implementado; planos e relatórios não substituem essa evidência.
4. Se duas fontes discordarem, preserve o conflito, explique seu impacto e não escolha silenciosamente. Peça validação do Product Owner apenas quando a decisão impedir a execução segura; se possível, avance em uma tarefa independente.

## Índice dos documentos do projeto

Considere os seguintes arquivos como fontes de design, planejamento, processo ou contexto, conforme a tarefa:

- [`🐔 A-Logica-do-Fowlgen-Wars.md`](skills/%F0%9F%90%94%20A-Logica-do-Fowlgen-Wars.md): etapas de evolução do projeto e objetivo de chegar a uma demo jogável validada com usuários.
- [`🐔 Fowlgen-Wars-Sprint-01.md`](skills/%F0%9F%90%94%20Fowlgen-Wars-Sprint-01.md): objetivos da Sprint 01, protótipo simples inspirado em Pong, papéis e artefatos.
- [`Prompt-apresentacao-sprint-1.md`](skills/Prompt-apresentacao-sprint-1.md): regras para relatar a Sprint 01 sem inventar e distinguindo realizado, em teste, pendente e planejado. A instrução para ignorar o roadmap alterado é específica desse vídeo/relatório, não uma regra geral para outras tarefas.
- [`Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md`](files/Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md): documento oficial de organização da equipe ativa (7 integrantes), matriz de responsabilidades, alinhamento de DevSecOps, nova distribuição de QA e planejamento Kanban da Fase 2.
- [`Fowlgen-Wars-Organizacao.md`](files/Fowlgen-Wars-Organizacao.md): documento oficial de organização, papéis, pontos focais de esteira ágil, quadro Kanban e modelo de briefing.
- [`Fowlgen-Wars-Telas-Game.md`](skills/Fowlgen-Wars-Telas-Game.md): prompt de telas mobile em landscape e controller de toque; joystick é proposta pendente de validação, enquanto os quatro slots de poder estão documentados.
- [`Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`](skills/Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md): especificação da arena com três rotas e 18 torres; a função das torres permanece pendente.
- [`Fowlgen-Wars-Sistema-de-Arenas.md`](skills/Fowlgen-Wars-Sistema-de-Arenas.md): sistema de arena base única com skins temáticas (Fazenda, Medieval, Egípcia, Samurai, Futurista, Caos), variações de clima/horário e regras de fair play (sem vantagem competitiva).
- [`Fowlgen-Wars-GDD-MVP.md`](skills/Fowlgen-Wars-GDD-MVP.md): visão consolidada do Mini-MOBA MVP; complementa o arquivo Mini-MOBA MVP existente, sem substituí-lo.
- [`Fowlgen-Wars-Regras-de-Combate-e-Torres.md`](skills/Fowlgen-Wars-Regras-de-Combate-e-Torres.md): registra fatos confirmados e decisões ainda pendentes de combate, torres e condição de resultado.
- [`Fowlgen-Wars-Roadmap-de-Pocs.md`](skills/Fowlgen-Wars-Roadmap-de-Pocs.md): roadmap canônico oficial de longo prazo (Fases 01 a 05 com arquitetura alvo Web3 Multiplayer).
- [`Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md`](skills/Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md): roadmap operacional sprint express do Hackathon 2026 (Colosseum e Superteam Brasil); separa Anchor e Unity em POCs modulares, foca no prazo máximo de entrega e orienta a resolução dos testes pendentes.
- [`Fowlgen-Wars-Mapa-Tecnico-da-Fase-3.md`](skills/Fowlgen-Wars-Mapa-Tecnico-da-Fase-3.md): mapa técnico incremental da Fase 3 em 18 níveis objetivos (do protótipo simples à primeira partida completa jogável e homologação de build/vídeo para o hackathon).
- [`Fowlgen-wars-Minions.md`](skills/Fowlgen-wars-Minions.md): especificação proposta para geração contínua, limite de unidades ativas e avanço pelas três rotas; valores e regras ainda pendem de aprovação.
- [`🐔 Mini-Moba-MVP.md`](skills/%F0%9F%90%94%20Mini-Moba-MVP.md): adaptação do conceito Mini-MOBA para o mapa de três rotas e 18 torres; não confundir com a versão original de quatro rotas.
- [`Fowlgen-Personagens-Nome.md`](skills/Fowlgen-Personagens-Nome.md): lista de nomes com alinhamento; não inferir espécie, classe, rota, essência, poder ou lore pelo nome.
- [`🐔 Mini-Moba.md`](skills/%F0%9F%90%94%20Mini-Moba.md): conceito de Mini-MOBA, quatro rotas e partida de aproximadamente três minutos. Não tratar como escopo da Sprint 01 sem confirmação.
- [`🐔 Sistema-de poderes.md`](skills/%F0%9F%90%94%20Sistema-de%20poderes.md): conceito de quatro poderes pré-equipados, cooldowns e preparação fora da partida.
- [`🐔 Fowlgen-wars- Sistema-de-cores-essencias-e-classificacao.md`](skills/%F0%9F%90%94%20Fowlgen-wars-%20Sistema-de-cores-essencias-e-classificacao.md): identidade visual e distinção entre essência, classe, função e raridade; não inferir poder a partir de cor/raridade.
- [`🐔 Hierarquia-de-Personagens.md`](skills/%F0%9F%90%94%20Hierarquia-de-Personagens.md): separação entre rota, função/classe, espécie, clã/civilização e tema.
- [`Fowlgen-Camada-Estrategica-Inspirada-No-Xadrez.md`](skills/Fowlgen-Camada-Estrategica-Inspirada-No-Xadrez.md): propostas de estratégia e mapa; confirmar escopo antes de implementar.
- [`Fowlgen-Sistema-de-Armadilhas-Personalizadas.md`](skills/Fowlgen-Sistema-de-Armadilhas-Personalizadas.md): conceito de armadilhas e personalização; não presumir que faça parte do MVP.
- [`🐔 Sistema-de-Recompensas.md`](skills/%F0%9F%90%94%20Sistema-de%20recompensas.md): ideias de progressão/recompensas; valores e economia ainda dependem de validação.
- [`🐔Sistema-Padrao-de-criatividadee-e-Design.md`](skills/%F0%9F%90%94Sistema-Padrao-de-criatividadee-e-Design.md): uso responsável de IA, originalidade e registro do processo criativo.
- [`🐔 Fwolgen-Wars - Frases-de-Combate.md`](skills/%F0%9F%90%94%20Fwolgen-Wars%20-%20Frases-de-Combate.md): referência de tom e falas; aplicar apenas quando a tarefa envolver texto/áudio do jogo.
- [`Fowlgen-Wars-Guia-Completo-Detalhado.md`](skills/Fowlgen-Wars-Guia-Completo-Detalhado.md): setup documentado de Solana, Rust e Anchor. Verifique versões e instruções oficiais antes de executá-las.
- [`Fowlgen-Wars-Guia-Setup-Contrato-Repositorio.md`](skills/Fowlgen-Wars-Guia-Setup-Contrato-Repositorio.md): guia prático de compilação, testes, sincronização de chaves e deploy na Devnet do smart contract Anchor a partir da pasta `program/` do repositório.
- [`Integracao-Solana-tokens-NFTs-Unity-Publicacao-Dapps-Store.md`](skills/Integracao-Solana-tokens-NFTs-Unity-Publicacao-Dapps-Store.md): arquitetura híbrida e estudo de ativos on-chain, Unity SDK e publicação futura.
- [`Exemplos-Modelo-Adaptado-Fowlgen-wars-do-Game-Seven-Seas.md`](skills/Exemplos-Modelo-Adaptado-Fowlgen-wars-do-Game-Seven-Seas.md): referência conceitual para separar gameplay e ativos; não copiar implementação nem tratar propostas futuras como escopo aprovado.
- [`Fowlgen-Wars-Pesquisa-Captacao-Recursos-2026-v1.md`](skills/Fowlgen-Wars-Pesquisa-Captacao-Recursos-2026-v1.md): pesquisa de captação, editais, publishers e validação; não é especificação de gameplay.
- [`Fowlgen-Wars-Faixas-Etarias-Publico-Alvo.md`](skills/Fowlgen-Wars-Faixas-Etarias-Publico-Alvo.md): análise de dados demográficos de jogadores por faixa etária (crianças, pré-adolescentes, Geração Z e adultos), gêneros, plataformas e modelos monetários.
- [`Fowlgen-Wars-Biblioteca-Efeitos-Sonoros.md`](skills/Fowlgen-Wars-Biblioteca-Efeitos-Sonoros.md): guia e ranking de repositórios de efeitos sonoros (SFX), licenças de uso comercial/atribuição e formatos recomendados para Unity.
- [`Fowlgen-Wars-Estudo-de-Cores.md`](skills/Fowlgen-Wars-Estudo-de-Cores.md): estudo e matriz de cores de arenas/mapas MOBA (Wild Rift, Mobile Legends, HoK, Clash Royale, AoV e Rush Royale), ergonomia e regras de contraste cenário vs VFX/heróis.
- [`Fowlgen-Wars-A-Era-Passada.md`](skills/Fowlgen-wars-A-Era-Passada.md): lore. Use como cânone somente quando a documentação do projeto assim indicar; não introduza conteúdo narrativo não confirmado.
- [`Fowlgen-Wars-Conceitos-de-Logotipo.md`](skills/Fowlgen-Wars-Conceitos-de-Logotipo.md): conceitos de logotipo, identidade visual da marca (estilos épico, cartoon, minimalista, pixel e identidade recomendada), sistema de logos e frase conceitual.
- [`Fowlgen-Wars-Guia-MCP-Unity-Metaplex-Antigravity.md`](skills/Fowlgen-Wars-Guia-MCP-Unity-Metaplex-Antigravity.md): guia de configuração de MCP Servers, Skills e Agents para Unity (ivanmurzak/unity-mcp e Unity AI Assistant) e Metaplex Core na IDE Antigravity.
- [`🐔 Fowlgen-Wars-Sistema-de-Nivelamento-Proporcional.md`](skills/%F0%9F%90%94%20Fowlgen-Wars-Sistema-de-Nivelamento-Proporcional.md): sistema de nivelamento proporcional e normalização automática em partidas competitivas; separação estrita entre progressão de conta e poder de combate, garantindo fair play e proteção anti-pay-to-win.
- [`fowlgen-wars-regras-hackathon-2026.md`](skills/fowlgen-wars-regras-hackathon-2026.md): regras oficiais, critérios de avaliação, requisitos de submissão e checklist operacional do Colosseum Global Hackathon 2026 e Trilha Brasil (Superteam Brasil).
- [`metaplex/SKILL.md`](../.agents/skills/metaplex/SKILL.md): skill do ecossistema Metaplex na pasta `.agents/skills/metaplex/SKILL.md`; referência oficial para criação de coleções Metaplex Core, NFTs, Bubblegum (compressed NFTs), Candy Machine, Token Metadata e comandos da CLI `mplx`.

O PDF `files/pdf/Site Fowlgenwars.pdf` é uma referência visual disponível no workspace. Consulte-o quando a tarefa envolver o site ou apresentação visual; não infira conteúdo que não possa ser lido/confirmado.

## Divergências conhecidas

- Os documentos históricos da Sprint 01 e relatórios anteriores registram estruturas antigas de equipe (Alexandre e Vyctor foram desligados). A composição oficial ativa da Fase 2 está consolidada em [`Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md`](files/Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md) e [`Fowlgen-Wars-Organizacao.md`](files/Fowlgen-Wars-Organizacao.md) com 7 integrantes ativos:
  1. **Samuel Menon Ramos**: Product Owner (PO), Game Designer, Growth & Marketing, e Gestão do Kanban.
  2. **Marcos**: Líder Técnico / Dev Core Unity & Web3; condução e desenvolvimento da **camada Off-chain** (FishNet, multiplayer em tempo real, Dedicated Server e física server-authoritative sem latência de blockchain), arquitetura Web3 (Anchor) e **ajuste do time de desenvolvimento** (orientação técnica, code reviews e sincronia entre frentes).
  3. **Manuel**: Dev Unity (C#) / Gameplay Core; ajuda o Marcos no desenvolvimento Unity especializando-se no **ambiente do game e colisões** (cenário, arena 3 rotas, layout do mapa, obstáculos e física de colisões de tropas e bombas).
  4. **Jorge Espindola**: DevSecOps Engineer & Cloud/Web3 Solutions Architect; ajuda o Marcos no desenvolvimento **Anchor Web 3** na pasta `program/`, além de atuar no **Áudio** do game (SFX/BGM, mixers e triggers na Unity), na **Documentação Técnica**, em pipelines CI/CD, Docker headless FishNet e AppSec (Gitleaks e Threat Modeling).
  5. **Junior**: Dev Web (Node.js, React, TypeScript em `app/`; substitui Vyctor) e Gestão de Documentação/Prompts em `prompt/skills/` (conversão em Markdown com checagem rigorosa contra o `Claude.md` para evitar conflitos conceituais); atua exclusivamente no reajuste do site oficial e na esteira de prompts, não participando do desenvolvimento do game na Unity.
  6. **Maria Clara**: QA Funcional (UX Testing, experiência do jogador) e Coerência Narrativa / Lore.
  7. **Ramiro**: Marketing Estratégico, Captação de Recursos e Relações com Investidores (One-Pager, Pitch Deck, Tese Web3 Híbrida Fun-First anti-P2W e Solana Mobile DApp Store).
- O projeto possui dois roadmaps alinhados com propósitos complementares:
  1. [`Fowlgen-Wars-Roadmap-de-Pocs.md`](skills/Fowlgen-Wars-Roadmap-de-Pocs.md): roadmap canônico de longo prazo (Fases 01 a 05, cobrindo fundação, ativos on-chain, multiplayer com Dedicated Game Server e publicação).
  2. [`Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md`](skills/Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md): roadmap operacional e pragmático para o Hackathon 2026, com foco na entrega do **game 100% jogável até 10/10/2026** (antecipando o prazo final oficial da Colosseum de 12/10/2026 às 23h59 PDT / 13/10 às 03h59 BRT), separação modular das POCs de Anchor e Unity, e resolução pontual dos 4 testes de QA reprovados.
- Inventário da Fase 1, Telas e Testes NÃO Reprovados (Validados e Funcionais):
  - **Inicialização Unity:** ✅ Aprovado no QA da Sprint 01 (inicialização do motor, ciclo de vida e GameBootstrap operando).
  - **Telas e UI Funcionais da Fase 1:**
    - [`MainMenu.unity`](../unity/Assets/Scenes/Game/MainMenu.unity) e [`MainMenuController.cs`](../unity/Assets/Scripts/Controller/MainMenuController.cs): tela inicial responsiva, navegação de cenas e seletor das POCs.
    - [`POCScreenUI.cs`](../unity/Assets/Scripts/Controller/POCScreenUI.cs) e [`POCSceneRoot.cs`](../unity/Assets/Scripts/Controller/POCSceneRoot.cs): sistema de telas de teste com tabela de status, botões de ação e feedback visual via toasts (verde, amarelo e vermelho).
  - **POCs da Fase 01 Validadas (Cenas e Scripts C#):**
    - `POC 01` ([`POC_01_ProjectFoundation.unity`](../unity/Assets/Scenes/POC/POC_01_ProjectFoundation.unity)): Fundação Unity, checagem de plataforma e Canvas.
    - `POC 02` ([`POC_02_SolanaDevnet.unity`](../unity/Assets/Scenes/POC/POC_02_SolanaDevnet.unity)): Conexão via Solana Unity SDK (`SolanaManager`, `SolanaConnection`) com a Solana Devnet (`https://api.devnet.solana.com`).
    - `POC 03` ([`POC_03_AnchorWorkspace.unity`](../unity/Assets/Scenes/POC/POC_03_AnchorWorkspace.unity)): Workspace Anchor estruturado e contrato Rust compilado.
    - `POC 04` ([`POC_04_UnityAnchor.unity`](../unity/Assets/Scenes/POC/POC_04_UnityAnchor.unity)): Leitura e parsing de IDL (`fowlgen_wars_contract.json`) e preparação das instruções.
    - `POC 05` ([`POC_05_WalletTransaction.unity`](../unity/Assets/Scenes/POC/POC_05_WalletTransaction.unity)): Conexão de carteira (Phantom via Mobile Wallet Adapter, importação da área de transferência ou keypair Devnet), consulta de saldo em SOL e envio de transações reais confirmadas no contrato ativo da Devnet (`81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`).
  - **Smart Contract Anchor On-Chain:**
    - Teste de integração [`test_initialize.rs`](../program/programs/fowlgen_wars_contract/tests/test_initialize.rs) ✅ Aprovado com 100% de sucesso via LiteSVM (`cargo test` executado e passando em 0.29s).
    - Contrato implantado e executável na Solana Devnet sob o Program ID `81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`.
- Status dos Testes Reprovados da Sprint 01 (Foco Exclusivo de Correção na Trilha Unity):
  - 4 reprovações fundamentais de gameplay (movimentação, colisão, interatividade de botões de UI e áudio). Isoladas nas POCs `POC-UNI-01` a `POC-UNI-04` do roadmap MVP do Hackathon para resolução rápida pelo time de gameplay sem bloquear a frente de Solana.

## Decisões técnicas e limites

### Escopo de gameplay

- A visão de longo prazo não significa que todas as mecânicas estejam aprovadas para o protótipo atual.
- A Sprint 01 descreve uma mecânica simples inspirada em Pong. O Mini-MOBA de quatro rotas e três minutos é uma direção de design posterior, enquanto a proposta de mapa específica define três rotas; confirme o modo vigente antes de unificar essas especificações.
- Não implementar cartas, loja, inventário, economia, armadilhas ou sistemas completos de progressão sem tarefa e critério de aceite explícitos.

### Multiplayer e blockchain

- O usuário definiu FishNet como a tecnologia a usar para multiplayer em tempo real. FishNet não está documentado nos arquivos de `skills/` e sua integração não deve ser descrita como validada ou concluída sem prova.
- Antes de construir sistemas extensos, proponha/execute uma POC isolada: conexão, entrada de jogadores e sincronização mínima pertinente ao protótipo. Consulte documentação oficial compatível com a versão selecionada.
- Topologia, hospedagem, autoridade, segurança do servidor, reconexão e escalabilidade não estão decididas neste conjunto documental. Não as presuma; registre a decisão necessária.
- Unity/FishNet é o caminho do gameplay em tempo real. Solana/Anchor é uma camada separada para transações e dados que precisam de propriedade ou verificação on-chain. Não coloque movimento, frames, colisões ou ações instantâneas em transações.
- Siga as POCs de Solana/Anchor na ordem aplicável e use Devnet e wallet de desenvolvimento. Nunca exponha seed phrase ou chave privada no projeto, Git, logs ou documentação compartilhada.
- NFTs, PDAs, SPL Tokens e recompensas on-chain são etapas posteriores, não requisitos automáticos do protótipo.

### Hackathon 2026 e Entrega de MVP Express

- **Cronograma e Datas Limite Estritas:**
  - **Meta Interna da Equipe:** Entrega do **GAME 100% FUNCIONANDO até o dia 10 de outubro de 2026** (APK jogável, loop de combate de 3 minutos, áudio, UI, transação Devnet e multiplayer híbrido operando perfeitamente).
  - **Prazo Oficial Impreterível do Hackathon Colosseum 2026:** **12 de outubro de 2026, às 23h59 PDT (horário da Califórnia)**, correspondente a **13 de outubro de 2026, às 03h59 BRT (horário de Brasília)**.
  - A entrega no dia 10/10/2026 assegura uma margem de segurança de 48 horas para testes finais de estresse de QA (Maria Clara), refinamento do vídeo pitch de no máximo 3 minutos (Samuel) e homologação sem risco na Colosseum Arena e Superteam Brasil.
- **Padrão Canônico de Especificação das POCs:** O documento [`Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md`](skills/Fowlgen-Roadmaps-Pocs-MVP-Hackathon.md) adota rigorosamente o padrão estrutural de [`Fowlgen-Wars-Roadmap-de-Pocs.md`](skills/Fowlgen-Wars-Roadmap-de-Pocs.md), detalhando para cada POC: *Objetivo, Responsável, Passos Detalhados, Estrutura Técnica & Scripts, Critério de Aceite, Procedimento de Teste e Entregáveis*.
- **Arquitetura Híbrida do MVP:** Para eliminar o risco do "jurado solitário" e demonstrar multiplayer em tempo real no vídeo de pitch, o jogo possui:
  1. *Modo Batalha Rápida (Solo vs IA):* Jogo offline/local nas 3 rotas, garantindo que qualquer jurado avalie a partida inteira sem depender de outro jogador online.
  2. *Modo Batalha 1v1 (FishNet Host & Client):* Conexão P2P/LAN para demonstração no vídeo pitch gravando 2 smartphones interagindo sincronizados em tempo real.
- **Desacoplamento de POCs para o time:** As frentes de smart contract Anchor (Rust) e gameplay Unity (C#) devem avançar de forma independente e paralela, evitando bloqueios mútuos.
- **Na Trilha Anchor:** O contrato deve manter testes automatizados passando 100% (`cargo test`), Program ID sincronizado com a Devnet (`81MprTi78xQvtVg9aaK4s4Cw9K62CU6PtcPYsChLNyxE`), IDL exportado para a Unity e chamadas verificáveis no Solana Explorer.
- **Na Trilha Unity:** Foco imediato na resolução dos 4 testes de QA reprovados na Sprint 01 (movimentação de unidades, colisões e dano estáveis, interatividade nos botões de UI e feedback de áudio), garantindo que a cena principal do jogo rode perfeitamente.
- **Na Integração:** Conexão via Solana Unity SDK, assinatura de transação de demonstração ao final da partida e leitura de skin/ativo.
- **Cena de Showcase Cinemachine/Animator (`POC-CIN-01`):** Apresentação cinematográfica *in-engine* na Unity com câmeras virtuais dinâmicas sobrevoando a arena e transição suave (*blend*) para a partida, utilizada como vitrine do produto nos primeiros 40 segundos do vídeo pitch.
- **Requisitos estritos de submissão:** Vídeo demo/pitch com duração estritamente ≤ 3 minutos (180s), APK Android jogável para os jurados e repositório público limpo sem secrets.

### DevSecOps, Infraestrutura e AppSec (Jorge)

- **Princípio:** DevSecOps opera como habilitador de velocidade com guardrails automáticos silenciosos (CI/CD, linters, testes e scanners), nunca como entrave burocrático.
- **Blindagem de Repositório e Anti-Leak de Segredos:** Implementação obrigatória de scanner de segredos (Gitleaks ou TruffleHog) no GitHub Actions, impedindo commits com private keys, seed phrases, `.keypair`, `.env` ou chaves de Devnet/Mainnet.
- **Pipeline de CI/CD para Smart Contracts Anchor (`program/`):** Manter `.github/workflows/anchor-ci.yml` ativo para rodar `cargo check`, `cargo clippy`, `cargo audit` (detecção de vulnerabilidades em crates Rust) e `anchor test` a cada PR.
- **Dedicated Game Server FishNet (Container Docker):** O servidor FishNet deve operar em container Docker headless Linux isolado, permitindo testes locais e deploy desacoplado do cliente Unity.
- **Threat Modeling da Arquitetura Híbrida:** A autoridade do servidor dedicado deve assinar a conclusão e métricas da partida antes de qualquer instrução de premiação ou XP ser submetida ao contrato Anchor (`claim_reward`), mitigando ataques de modificação de memória no cliente mobile.

### Esteira de Prompts e Coerência Documental (Junior & Samuel)

- **Fluxo de Ingestão de Prompts:** O PO Samuel gera direcionamentos, ideias e especificações conceituais. Junior é o responsável por coletar esses materiais, estruturá-los em Markdown (`.md`) padronizado e alocá-los nas pastas `app/` e `prompt/skills/`.
- **Checagem Obrigatória de Conflitos (`Claude.md`):** Todo novo prompt Markdown deve ser validado contra o `Claude.md` antes de ser incorporado, garantindo alinhamento de terminologias, integridade de decisões tomadas e prevenção de conflitos de ideias ou sobreposição de escopos com documentos existentes.

### Ferramentas de arte e produção

Ferramentas como Blender, Unity, Tripo Studio, Google Flow, Figma, Lovable e ferramentas de IA aparecem como ferramentas ou sugestões em documentos do projeto. Use apenas as que forem relevantes, disponíveis e aprovadas para a tarefa; não alegue que foram usadas sem evidência. Todo conteúdo assistido por IA deve respeitar as regras de originalidade e manter registros do processo quando possível.

## Regras de execução

- Antes de editar, inspecione a estrutura existente, arquivos relacionados, instruções locais e alterações já presentes. Preserve o trabalho do usuário.
- Escolha a menor mudança que resolva a tarefa e mantenha convenções e APIs existentes.
- Não apague, renomeie ou reestruture funcionalidades sem autorização e justificativa.
- Quebre tarefas grandes em etapas pequenas, com dependências, arquivos envolvidos e critério de aceite.
- Faça alterações somente depois de localizar a implementação que realmente controla o comportamento.
- Após editar, execute primeiro o teste, build ou validação mais próxima da mudança. Corrija falhas locais e repita a mesma validação.
- Não declare sucesso apenas porque o código compila. Informe cobertura, limitações e testes não executados.
- Para tarefas documentais, verifique consistência de termos, links relativos e correspondência com as fontes.
- Registre qualquer decisão nova como proposta ou decisão explícita do usuário, sem reescrever o histórico documental como se já existisse.

## Formato da resposta de execução

Use este formato quando entregar uma tarefa de projeto:

**OBJETIVO**
O que foi solicitado.

**DEPENDÊNCIAS**
O que precisava existir ou qual conflito foi encontrado.

**IMPLEMENTAÇÃO**
O que foi feito e o que ficou deliberadamente fora de escopo.

**ARQUIVOS**
Arquivos criados ou modificados.

**TESTE**
Comando/check executado e resultado real; indique claramente o que não foi possível verificar.

**RESULTADO ESPERADO**
Comportamento ou artefato que agora existe, sem prometer validação além da evidência.

**PRÓXIMO PASSO**
Somente a próxima ação útil e documentada.
