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
- [`Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md`](files/Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md): documento oficial de organização da equipe ativa (6 integrantes), matriz de responsabilidades, nova distribuição de QA e planejamento Kanban da Fase 2.
- [`Fowlgen-Wars-Telas-Game.md`](skills/Fowlgen-Wars-Telas-Game.md): prompt de telas mobile em landscape e controller de toque; joystick é proposta pendente de validação, enquanto os quatro slots de poder estão documentados.
- [`Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`](skills/Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md): especificação da arena com três rotas e 18 torres; a função das torres permanece pendente.
- [`Fowlgen-Wars-Sistema-de-Arenas.md`](skills/Fowlgen-Wars-Sistema-de-Arenas.md): sistema de arena base única com skins temáticas (Fazenda, Medieval, Egípcia, Samurai, Futurista, Caos), variações de clima/horário e regras de fair play (sem vantagem competitiva).
- [`Fowlgen-Wars-GDD-MVP.md`](skills/Fowlgen-Wars-GDD-MVP.md): visão consolidada do Mini-MOBA MVP; complementa o arquivo Mini-MOBA MVP existente, sem substituí-lo.
- [`Fowlgen-Wars-Regras-de-Combate-e-Torres.md`](skills/Fowlgen-Wars-Regras-de-Combate-e-Torres.md): registra fatos confirmados e decisões ainda pendentes de combate, torres e condição de resultado.
- [`Fowlgen-Wars-Roadmap-de-Pocs.md`](skills/Fowlgen-Wars-Roadmap-de-Pocs.md): roadmap canônico solicitado; POC FishNet inicia na Fase 02 e continua com sincronização de gameplay na Fase 04. FishNet permanece não validado até evidência.
- [`Fowlgen-wars-Minions.md`](skills/Fowlgen-wars-Minions.md): especificação proposta para geração contínua, limite de unidades ativas e avanço pelas três rotas; valores e regras ainda pendem de aprovação.
- [`🐔 Mini-Moba-MVP.md`](skills/%F0%9F%90%94%20Mini-Moba-MVP.md): adaptação do conceito Mini-MOBA para o mapa de três rotas e 18 torres; não confundir com a versão original de quatro rotas.
- [`Fowlgen-Personagens-Nome.md`](skills/Fowlgen-Personagens-Nome.md): lista de nomes com alinhamento; não inferir espécie, classe, rota, essência, poder ou lore pelo nome.
- [`🐔 Mini-Moba.md`](skills/%F0%9F%90%94%20Mini-Moba.md): conceito de Mini-MOBA, quatro rotas e partida de aproximadamente três minutos. Não tratar como escopo da Sprint 01 sem confirmação.
- [`🐔 Sistema-de poderes.md`](skills/%F0%9F%90%94%20Sistema-de%20poderes.md): conceito de quatro poderes pré-equipados, cooldowns e preparação fora da partida.
- [`🐔 Fowlgen-wars- Sistema-de-cores-essencias-e-classificacao.md`](skills/%F0%9F%90%94%20Fowlgen-wars-%20Sistema-de-cores-essencias-e-classificacao.md): identidade visual e distinção entre essência, classe, função e raridade; não inferir poder a partir de cor/raridade.
- [`🐔 Hierarquia-de-Personagens.md`](skills/%F0%9F%90%94%20Hierarquia-de-Personagens.md): separação entre rota, função/classe, espécie, clã/civilização e tema.
- [`Fowlgen-Camada-Estrategica-Inspirada-No-Xadrez.md`](skills/Fowlgen-Camada-Estrategica-Inspirada-No-Xadrez.md): propostas de estratégia e mapa; confirmar escopo antes de implementar.
- [`Fowlgen-Sistema-de-Armadilhas-Personalizadas.md`](skills/Fowlgen-Sistema-de-Armadilhas-Personalizadas.md): conceito de armadilhas e personalização; não presumir que faça parte do MVP.
- [`🐔 Sistema-de-Recompensas.md`](skills/%F0%9F%90%94%20Sistema-de-Recompensas.md): ideias de progressão/recompensas; valores e economia ainda dependem de validação.
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

- Os documentos históricos da Sprint 01 e relatórios anteriores registram estruturas antigas de equipe. A composição oficial da Fase 2 está consolidada em [`Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md`](files/Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md) com 6 integrantes ativos (Samuel, Marcos, Alexandre, Emanoel, Junior e Maria Clara).
- O roadmap canônico oficial do projeto é [`Fowlgen-Wars-Roadmap-de-Pocs.md`](skills/Fowlgen-Wars-Roadmap-de-Pocs.md), que integra as POCs FishNet. Versões antigas divergentes (`alterada` e `sem-modificacao copy`) foram descontinuadas do índice.
- A Sprint 01 relata falhas de QA em movimentação, colisão, UI e áudio, enquanto outros documentos descrevem sistemas mais amplos. Não considere esses sistemas validados sem nova evidência no projeto atual.

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
