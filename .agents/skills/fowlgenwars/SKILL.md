---
name: fowlgenwars
description: Diretrizes do projeto Fowlgen Wars. Leia antes de codar, escrever documentos ou prompts e identifique o que gera conflito no desenvolvimento do game (escopo, fontes divergentes, roadmaps, camadas Unity/Solana). Menor mudança, preservar conflitos, validar em BattleArena.
---

# SKILL.md — Agente de Execução do FOWLGEN WARS

## Objetivo desta skill (leia primeiro)

Esta skill é o guia obrigatório para qualquer agente que trabalhe no Fowlgen Wars. Ao carregá-la, **leia-a por inteiro e identifique o que pode gerar conflito no desenvolvimento do game** antes de escrever código, documentos ou prompts. O objetivo é evitar retrabalho causado por decisões contraditórias, escopo não aprovado e afirmações sem evidência.

### O que causa conflito neste projeto

1. **MVP/Hackathon vs. game completo:** o MVP e o Hackathon 2026 foram encerrados. Prazos, restrições de escopo, o inventário das POCs antigas e os roadmaps daquela fase ficam na skill [`fowlgenwars-mvp-hackathon`](../fowlgenwars-mvp-hackathon/SKILL.md) e não valem para o game completo. Consulte-a apenas como histórico.
   - **Escopo de gameplay divergente:** Pong (Sprint 01) vs. Mini-MOBA de 4 rotas vs. mapa de 3 rotas e 18 torres. Confirme o modo vigente antes de unificar especificações.
2. **Mecânicas não aprovadas tratadas como escopo:** cartas, loja, inventário, economia, armadilhas, progressão completa, minions e função das torres. Sem tarefa e critério de aceite explícitos, não implemente. Restrições do MVP não são regra permanente: o que foi adiado no MVP é backlog do game completo.
3. **Fontes que discordam entre si:** documentos históricos (equipe antiga, Sprint 01) vs. documentos oficiais atuais (Fase 2, 7 integrantes). Preserve o conflito, explique o impacto e não escolha silenciosamente.
4. **Roadmaps e POCs:** as POCs serão elaboradas novamente para o game completo. Não use o roadmap do MVP/Hackathon como plano vigente nem misture prazos e escopos antigos.
5. **Camadas misturadas:** gameplay em tempo real (Unity/FishNet) vs. Solana/Anchor on-chain. Movimento, colisões e ações instantâneas nunca vão em transações.
6. **Planejamento tratado como implementação:** só o estado real dos arquivos e testes executados prova que algo existe. Relatórios e planos não substituem essa evidência.
7. **Inferências proibidas:** não deduzir espécie, classe, rota, poder, raridade ou lore a partir de nome ou cor; não inventar conteúdo narrativo.
8. **Segredos e Git:** nunca expor seed phrase, chave privada, `.env` ou `.keypair`.
9. **Mudanças amplas:** renomear, apagar ou reestruturar sem autorização. Siga a menor mudança viável e preserve contratos existentes.

### Como proceder

- Antes de codar, cruze a tarefa com os documentos pertinentes e com o código real.
- Se encontrar conflito, registre-o (fontes, impacto, decisão necessária) e peça validação ao Product Owner somente quando impedir a execução segura.
- Valide a mudança em `BattleArena`/`Arena_Clean` e informe com clareza o que não foi testado.
- Todo novo prompt ou documento Markdown deve ser checado contra esta skill antes de ser incorporado.

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
- [`Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md`](files/Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md): documento oficial de organização da equipe ativa (7 integrantes), matriz de responsabilidades, alinhamento de DevSecOps, nova distribuição de QA e planejamento Kanban da Fase 2.
- [`Fowlgen-Wars-Organizacao.md`](files/Fowlgen-Wars-Organizacao.md): documento oficial de organização, papéis, pontos focais de esteira ágil, quadro Kanban e modelo de briefing.
- [`G5B-Studios-Codigo-de-Principios-de-Colaboracao-da-Equipe.md`](files/G5B-Studios-Codigo-de-Principios-de-Colaboracao-da-Equipe.md): código de princípios de colaboração e cultura da G5B Studios (ajuda mútua, aprendizado contínuo, protocolo de 6 passos para resolução de problemas e foco absoluto no Fowlgen Wars).
- [`Fowlgen-Wars-Telas-Game.md`](skills/Fowlgen-Wars-Telas-Game.md): prompt de telas mobile em landscape e controller de toque; joystick é proposta pendente de validação, enquanto os quatro slots de poder estão documentados.
- [`Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`](skills/Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md): especificação da arena com três rotas e 18 torres; a função das torres permanece pendente.
- [`Fowlgen-Wars-Sistema-de-Arenas.md`](skills/Fowlgen-Wars-Sistema-de-Arenas.md): sistema de arena base única com skins temáticas (Fazenda, Medieval, Egípcia, Samurai, Futurista, Caos), variações de clima/horário e regras de fair play (sem vantagem competitiva).
- [`Fowlgen-Wars-Regras-de-Combate-e-Torres.md`](skills/Fowlgen-Wars-Regras-de-Combate-e-Torres.md): registra fatos confirmados e decisões ainda pendentes de combate, torres e condição de resultado.
- [`Fowlgen-wars-Minions.md`](skills/Fowlgen-wars-Minions.md): especificação proposta para geração contínua, limite de unidades ativas e avanço pelas três rotas; valores e regras ainda pendem de aprovação.
- [`Fowlgen-Personagens-Nome.md`](skills/Fowlgen-Personagens-Nome.md): lista de nomes com alinhamento; não inferir espécie, classe, rota, essência, poder ou lore pelo nome.
- [`🐔 Mini-Moba.md`](skills/%F0%9F%90%94%20Mini-Moba.md): conceito de Mini-MOBA, quatro rotas e partida de aproximadamente três minutos. Não tratar como escopo da Sprint 01 sem confirmação.
- [`🐔 Sistema-de poderes.md`](skills/%F0%9F%90%94%20Sistema-de%20poderes.md): conceito de quatro poderes pré-equipados, cooldowns e preparação fora da partida.
- [`🐔 Fowlgen-wars- Sistema-de-cores-essencias-e-classificacao.md`](skills/%F0%9F%90%94%20Fowlgen-wars-%20Sistema-de-cores-essencias-e-classificacao.md): identidade visual e distinção entre essência, classe, função e raridade; não inferir poder a partir de cor/raridade.
- [`🐔 Hierarquia-de-Personagens.md`](skills/%F0%9F%90%94%20Hierarquia-de-Personagens.md): separação entre rota, função/classe, espécie, clã/civilização e tema.
- [`Fowlgen_Wars_Prompt_Mestre_Criacao_Personagens_3D.md`](skills/personagem/Fowlgen_Wars_Prompt_Mestre_Criacao_Personagens_3D.md): prompt mestre reutilizável para criação de design sheets de personagens, respeitando a hierarquia oficial e linguagem visual 3D.
- [`Fowlgen-Camada-Estrategica-Inspirada-No-Xadrez.md`](skills/Fowlgen-Camada-Estrategica-Inspirada-No-Xadrez.md): propostas de estratégia e mapa; confirmar escopo antes de implementar.
- [`Fowlgen-Wars-Sistema-de-Taticas-de-Batalha.md`](skills/Fowlgen-Wars-Sistema-de-Taticas-de-Batalha.md): sistema tático do jogo unindo tomada de decisão inspirada no xadrez (controle de centro, garfo, cravada, espeto, sacrifício, tempo e Galinheiro como Rei) à ação rápida de Mini-MOBA.
- [`Fowlgen-Wars-Ajustes-do-Sistema-de-Taticas-de-Guerra.md`](skills/Fowlgen-Wars-Ajustes-do-Sistema-de-Taticas-de-Guerra.md): ajustes e especificação do sistema de dupla estratégica (Duo inseparável: ADC frágil de alto dano + Suporte escudo protetor, rotação de dupla em bloco e prioridades de IA).
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
- [`metaplex/SKILL.md`](../metaplex/SKILL.md): skill do ecossistema Metaplex na pasta `.agents/skills/metaplex/SKILL.md`; referência oficial para criação de coleções Metaplex Core, NFTs, Bubblegum (compressed NFTs), Candy Machine, Token Metadata e comandos da CLI `mplx`.
- [`Fowlgen-Wars-Setup-FishNet.md`](skills/Fowlgen-Wars-Setup-FishNet.md): guia de setup e parâmetros de rede multiplayer FishNet (arquitetura client-server headless, portas UDP/TCP 7770, spawner de entidades e sincronização de estado).
- [`Fowlgen-Wars-Setup-SolanaSDK.md`](skills/Fowlgen-Wars-Setup-SolanaSDK.md): setup e inicialização do Solana Unity SDK para conexão com nós RPC da Devnet e envio de transações on-chain a partir do cliente Unity.
- [`Fowlgen-Wars-Privacidade-ZK-Cloak.md`](skills/Fowlgen-Wars-Privacidade-ZK-Cloak.md): estudo e proposta de arquitetura de privacidade usando ZK-SNARKs / protocolo Cloak para proteção de táticas e mecânicas confidenciais.
- [`Fowlgen-Wars-Relatorio-Metaplex-Skills-CLI-vs-MCP.md`](skills/Fowlgen-Wars-Relatorio-Metaplex-Skills-CLI-vs-MCP.md): análise técnica comparativa entre a CLI `mplx` e servidores MCP para automação e manipulação de ativos Metaplex na IDE Antigravity.
- [`Relatorio-Fowlgen-Wars.md`](skills/Relatorio-Fowlgen-Wars.md): relatório técnico consolidado registrando a evolução arquitetural do jogo (FishNet, Solana Devnet, testes e orquestração).

### Modelagem 3D e Especificações de Personagem (`skills/personagem/`)
- [`Fowlgen_Wars_Milo_3D_Modeling_Spec_v1.md`](skills/personagem/milo/Fowlgen_Wars_Milo_3D_Modeling_Spec_v1.md): especificação técnica de modelagem 3D do personagem Milo (polycount ≤ 8k triângulos mobile, topologia, loops de deformação para rig, mapeamento UV e texturização PBR).

### Briefings Individuais da Equipe (`skills/Equipe/`)
- [`Marcos.md`](skills/Equipe/Marcos.md): direcionamento e atribuições do Líder Técnico / Dev Core Unity & Web3 (arquitetura off-chain FishNet, contratos Anchor e coordenação técnica).
- [`Emanuel.md`](skills/Equipe/Emanuel.md): atribuições do Dev Unity / Gameplay Core focado em layout de arena de 3 rotas, obstáculos, ambiente e colisões.
- [`Jorge.md`](skills/Equipe/Jorge.md): atribuições do Engenheiro DevSecOps, Cloud Architect (K8s/CI-CD/Docker), suporte Anchor Web3 e áudio/SFX do jogo.
- [`Maria_Clara.md`](skills/Equipe/Maria_Clara.md): atribuições do QA Funcional (experiência do jogador/UX testing) e coerência da narrativa/lore.
- [`Ramiro_e_Samuel.md`](skills/Equipe/Ramiro_e_Samuel.md): atribuições integradas de Product Owner (Samuel) e Marketing Estratégico/Relações com Investidores (Ramiro).

### Relatórios de Fases e Execução (`files/relatorios/`)
- [`Relatorio_Arquitetura_MVP_ScriptableObjects.md`](files/relatorios/Relatorio_Arquitetura_MVP_ScriptableObjects.md): arquitetura de dados desacoplada baseada em ScriptableObjects para heróis, stats e habilidades.
- [`Relatorio_Integracao_Auth_FishNet_API.md`](files/relatorios/Relatorio_Integracao_Auth_FishNet_API.md): fluxo integrado de autenticação segura conectando cliente Unity, servidor de autoridade FishNet e API.
- [`Plano_Arquitetura_Modular_DDD_Csproj.md`](files/relatorios/Plano_Arquitetura_Modular_DDD_Csproj.md): plano de arquitetura modular orientada a domínio (DDD) com isolamento em projetos C# e assemblies.
- [`Fluxo_Telas_Fowlgen_Wars_Mermaid.md`](files/relatorios/Fluxo_Telas_Fowlgen_Wars_Mermaid.md): diagrama estruturado em Mermaid detalhando a máquina de estados e o fluxo de transição entre todas as telas do jogo.
- [`relatorio_ajustes_ui_toolkit.md`](files/relatorios/relatorio_ajustes_ui_toolkit.md): documentação técnica dos ajustes e padronização na interface gráfica utilizando UI Toolkit.
- [`relatorio_analise_instalador.md`](files/relatorios/relatorio_analise_instalador.md): análise e refatoração do script mestre de instalação do ambiente (`Install.sh`).
- [`Relatorio-Fowlgen-Wars-Producao-API-Onix.md`](files/relatorios/Relatorio-Fowlgen-Wars-Producao-API-Onix.md): planejamento de infraestrutura e ambiente de produção da API Onix.
- [`Catalogo_Assets_Audio_VFX_Free.md`](files/relatorios/Catalogo_Assets_Audio_VFX_Free.md): catálogo de pacotes gratuitos de áudio (SFX/BGM) e VFX recomendados da Unity Asset Store para o ecossistema URP mobile.
- [`Relatorio_Consolidacao_Audio_VFX_Mixamo_Orientacao.md`](files/relatorios/Relatorio_Consolidacao_Audio_VFX_Mixamo_Orientacao.md): relatório técnico de consolidação de texturas dos minions, áudio/VFX procedurais, fix de 180° de orientação de tela e integração do Mixamo MCP.
- [`Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.md`](files/relatorios/Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.md): relatório técnico de alinhamento das tarefas do site Web (Junior) com a API REST backend .NET 9 (Marcos), incluindo refatorações obrigatórias e módulo de Apoiadores.

### Documentos de Referência, Apresentações e PDFs (`files/pdf/` e `files/referencias/`)
- [`Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.pdf`](files/pdf/Relatorio_Alinhamento_Site_API_Apoiadores_Junior_Marcos.pdf): versão diagramada em PDF do relatório de alinhamento das tarefas do site (Junior), API backend (Marcos) e páginas de Apoiadores.
- [`Site Fowlgenwars.pdf`](files/pdf/Site%20Fowlgenwars.pdf): layout e referência visual do site oficial.
- [`Bibliotecas-efeitos sonoros.pdf`](files/pdf/Bibliotecas-efeitos%20sonoros.pdf): compilação de repositórios e recomendações de bibliotecas SFX para Unity.
- [`Estudo-Cores.pdf`](files/pdf/Estudo-Cores.pdf): estudo aprofundado de contraste e paleta cromática para MOBAs mobile.
- [`Faixas-etárias.pdf`](files/pdf/Faixas-et%C3%A1rias.pdf): levantamento estatístico de mercado e demografia de público por faixa etária.
- [`Ferramentas Wsl Ubuntu, Antigravity IDE - Remote-Wsl e MCPs.pdf`](files/pdf/Ferramentas%20Wsl%20Ubuntu,%20Antigravity%20IDE%20-%20Remote-Wsl%20e%20MCPs.pdf): guia visual de setup do ambiente WSL Ubuntu, Antigravity IDE e MCPs.
- [`Fowlgen-Wars-Guia-Completo-e-Detalhado.pdf`](files/pdf/Fowlgen-Wars-Guia-Completo-e-Detalhado.pdf): versão diagramada do guia completo de setup Solana/Unity.
- [`Relatorio_Tecnico_Metaplex_vs_MCP_Solana.pdf`](files/pdf/Relatorio_Tecnico_Metaplex_vs_MCP_Solana.pdf): versão diagramada do relatório comparativo Metaplex vs MCP Solana.
- [`Fowlgen wars negocio.pdf`](files/pdf/Fowlgen%20wars%20negocio.pdf) e `Fowlgen wars negocio.docx`: tese de negócios, visão estratégica e monetização do projeto.
- [`referencias/README.md`](files/referencias/README.md): índice e notas de organização dos diretórios de referências visuais e de design.

## Divergências conhecidas

- Os documentos históricos da Sprint 01 e relatórios anteriores registram estruturas antigas de equipe (Alexandre e Vyctor foram desligados). A composição oficial ativa da Fase 2 está consolidada em [`Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md`](files/Fowlgen-Wars-Estrutura-da-Equipe-Planejamento-kanban-Fase2.md) e [`Fowlgen-Wars-Organizacao.md`](files/Fowlgen-Wars-Organizacao.md) com 7 integrantes ativos:
  1. **Samuel Menon Ramos**: Product Owner (PO), Game Designer, Growth & Marketing, e Gestão do Kanban.
  2. **Marcos**: Líder Técnico / Dev Core Unity & Web3; condução e desenvolvimento da **camada Off-chain** (FishNet, multiplayer em tempo real, Dedicated Server e física server-authoritative sem latência de blockchain), arquitetura Web3 (Anchor) e **ajuste do time de desenvolvimento** (orientação técnica, code reviews e sincronia entre frentes).
  3. **Manuel**: Dev Unity (C#) / Gameplay Core; ajuda o Marcos no desenvolvimento Unity especializando-se no **ambiente do game e colisões** (cenário, arena 3 rotas, layout do mapa, obstáculos e física de colisões de tropas e bombas).
  4. **Jorge Espindola**: DevSecOps Engineer & Cloud/Web3 Solutions Architect; ajuda o Marcos no desenvolvimento **Anchor Web 3** na pasta `program/`, além de atuar no **Áudio** do game (SFX/BGM, mixers e triggers na Unity), na **Documentação Técnica**, em pipelines CI/CD, Docker headless FishNet e AppSec (Gitleaks e Threat Modeling).
  5. **Junior**: Dev Web (Node.js, React, TypeScript em `app/`; substitui Vyctor) e Gestão de Documentação/Prompts em `.agents/skills/fowlgenwars/skills/` (conversão em Markdown com checagem rigorosa contra o `SKILL.md` para evitar conflitos conceituais); atua exclusivamente no reajuste do site oficial e na esteira de prompts, não participando do desenvolvimento do game na Unity.
  6. **Maria Clara**: QA Funcional (UX Testing, experiência do jogador) e Coerência Narrativa / Lore.
  7. **Ramiro**: Marketing Estratégico, Captação de Recursos e Relações com Investidores (One-Pager, Pitch Deck, Tese Web3 Híbrida Fun-First anti-P2W e Solana Mobile DApp Store).

## Decisões técnicas e limites

### Escopo de gameplay

- A visão de longo prazo não significa que todas as mecânicas estejam aprovadas para o protótipo atual.
- A Sprint 01 (histórica, ver `fowlgenwars-mvp-hackathon`) descreve uma mecânica simples inspirada em Pong. O Mini-MOBA de quatro rotas e três minutos é uma direção de design posterior, enquanto a proposta de mapa específica define três rotas; confirme o modo vigente antes de unificar essas especificações.
- Cartas, loja, inventário, economia, armadilhas e sistemas completos de progressão fazem parte do backlog do game completo. Não os implemente sem tarefa, decisão do Product Owner e critério de aceite explícitos.

### Multiplayer e blockchain

- O usuário definiu FishNet como a tecnologia a usar para multiplayer em tempo real. FishNet não está documentado nos arquivos de `skills/` e sua integração não deve ser descrita como validada ou concluída sem prova.
- Antes de construir sistemas extensos, proponha/execute uma POC isolada: conexão, entrada de jogadores e sincronização mínima pertinente ao protótipo. Consulte documentação oficial compatível com a versão selecionada.
- Topologia, hospedagem, autoridade, segurança do servidor, reconexão e escalabilidade não estão decididas neste conjunto documental. Não as presuma; registre a decisão necessária.
- Unity/FishNet é o caminho do gameplay em tempo real. Solana/Anchor é uma camada separada para transações e dados que precisam de propriedade ou verificação on-chain. Não coloque movimento, frames, colisões ou ações instantâneas em transações.
- Siga as POCs de Solana/Anchor (a serem reelaboradas) na ordem aplicável e use Devnet e wallet de desenvolvimento. Nunca exponha seed phrase ou chave privada no projeto, Git, logs ou documentação compartilhada.
- NFTs, PDAs, SPL Tokens e recompensas on-chain são etapas posteriores, não requisitos automáticos do protótipo.

### DevSecOps, Infraestrutura e AppSec (Jorge)

- **Princípio:** DevSecOps opera como habilitador de velocidade com guardrails automáticos silenciosos (CI/CD, linters, testes e scanners), nunca como entrave burocrático.
- **Blindagem de Repositório e Anti-Leak de Segredos:** Implementação obrigatória de scanner de segredos (Gitleaks ou TruffleHog) no GitHub Actions, impedindo commits com private keys, seed phrases, `.keypair`, `.env` ou chaves de Devnet/Mainnet.
- **Pipeline de CI/CD para Smart Contracts Anchor (`program/`):** Manter `.github/workflows/anchor-ci.yml` ativo para rodar `cargo check`, `cargo clippy`, `cargo audit` (detecção de vulnerabilidades em crates Rust) e `anchor test` a cada PR.
- **Dedicated Game Server FishNet e Banco de Dados (Kubernetes/Minikube - Fase 4) [Responsável: Marcos]:** A infraestrutura evoluiu do Docker local para orquestração completa no Kubernetes (Minikube). O servidor FishNet headless e o banco PostgreSQL operam com alta disponibilidade, utilizando Kubernetes Secrets para gerenciar credenciais (eliminando senhas hardcoded) e PVCs para persistência. O script `Install.sh` foi atualizado para gerenciar a compilação local de imagens e a aplicação de manifestos K8s.
- **Threat Modeling da Arquitetura Híbrida:** A autoridade do servidor dedicado deve assinar a conclusão e métricas da partida antes de qualquer instrução de premiação ou XP ser submetida ao contrato Anchor (`claim_reward`), mitigando ataques de modificação de memória no cliente mobile.

### Esteira de Prompts e Coerência Documental (Junior & Samuel)

- **Fluxo de Ingestão de Prompts:** O PO Samuel gera direcionamentos, ideias e especificações conceituais. Junior é o responsável por coletar esses materiais, estruturá-los em Markdown (`.md`) padronizado e alocá-los nas pastas `app/` e `.agents/skills/fowlgenwars/skills/`.
- **Checagem Obrigatória de Conflitos (`SKILL.md`):** Todo novo prompt Markdown deve ser validado contra este `SKILL.md` antes de ser incorporado, garantindo alinhamento de terminologias, integridade de decisões tomadas e prevenção de conflitos de ideias ou sobreposição de escopos com documentos existentes.

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
