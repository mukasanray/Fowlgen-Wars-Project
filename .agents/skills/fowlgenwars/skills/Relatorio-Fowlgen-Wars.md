# Relatório FOWLGEN WARS

Introdução
Será que é possível criar um jogo Web3 dinâmico, divertido e com partidas de apenas 3 minutos, onde a blockchain serve exclusivamente para registrar o progresso e a real propriedade do jogador? Bem-vindo ao desenvolvimento de FOWLGEN WARS! Este relatório técnico detalha a fundação do nosso ecossistema de galinhas em guerra, unindo o motor gráfico Unity à rede de alta performance Solana.
Nesta lição, você aprenderá:
O objetivo estratégico e o escopo reduzido da Sprint 01 (foco em fundação e MVP).
Como a arquitetura técnica separa a lógica em tempo real (off-chain) dos ativos de rede (on-chain).
O progresso do time em engenharia (Unity, Solana, Anchor), design visual (2D, 3D, Animação) e garantia de qualidade (QA).
Os desafios encontrados durante a fase inicial e as prioridades definidas para a Sprint 02.
Objetivo do Sprint 01
A Sprint 01 de FOWLGEN WARS teve um foco claro: imersão, divisão de funções e entrega dos primeiros artefatos básicos. Em vez de tentar construir o universo inteiro ou o jogo completo de imediato, a equipe concentrou-se em estabelecer a base técnica e artística para um MVP funcional.
Os objetivos centrais definidos foram:
Alinhamento do Universo: Apresentar a visão do projeto e as mecânicas centrais da partida (estilo Pong adaptado para o MVP inicial).
Definição de Papéis: Garantir que cada um dos 4 integrantes do time compreendesse suas atribuições de desenvolvimento (Game Design, Programação, Arte 2D/3D, Animação, UI/UX e Áudio/QA).
Provas de Conceito (POCs): Validar as bases técnicas, permitindo que a equipe entenda como o motor gráfico Unity conversará com a blockchain Solana e o framework Anchor na Devnet.


Visão Geral do Ciclo de FOWLGEN WARS
Um mapa mental ilustrando o ciclo de gameplay de FOWLGEN WARS, conectando a geração de tropas no Galinheiro com as recompensas de combate e a evolução de ativos na blockchain.
Desenvolvimento Unity 3D
A fundação técnica do cliente de jogo foi estabelecida na Unity pelo programador da equipe, focando na organização do repositório e nas mecânicas de controle mais básicas.
Configuração do Projeto (POC 01): Criação do projeto na Unity adaptado para a plataforma Android.
Controle de Versão: Integração completa com Git e repositório GitHub para versionamento de código e colaboração.
Cena Inicial e Movimentação: Configuração da cena de testes inicial e implementação de movimentação básica.
Mecânica Base: Desenvolvimento de um protótipo simplificado inspirado em Pong para testar colisões e controle de barreira/personagem inicial.
Compilação Mobile: Configuração e preparação para os primeiros testes de compilação de APKs no Android.
Integração Solana
O principal desafio técnico do projeto é conectar o cliente Unity com a blockchain Solana de maneira fluida e eficiente.
Solana Unity SDK (POC 02): Instalação e configuração do SDK oficial (mantido pela Magicblock) no projeto da Unity.
Conexão com a Rede: Estabelecimento da conexão inicial da Unity com a rede de testes (Devnet) da Solana.
Gerenciamento de Wallets (Carteiras): Preparação técnica da interface do SDK para conexão de carteiras de criptoativos dentro da interface do jogo.
Planejamento de Ativos (On-Chain vs Off-Chain): Definição arquitetural de que o gameplay (física, partículas, movimentação e UI) rodará inteiramente na Unity (off-chain), enquanto as recompensas, propriedades de NFTs (galinhas especiais) e tokens SPL rodarão na Solana (on-chain).
Identificação de Ativos: Planejamento inicial para que o SDK reconheça os NFTs da carteira do usuário dentro do ambiente de testes.


Divisão Arquitetural: Unity vs Solana
Um infográfico demonstrando visualmente o que é processado em tempo real na Unity (off-chain) e o que é registrado de forma segura na Solana (on-chain).
Anchor Framework & Smart Contracts
Para suportar a lógica econômica e de progressão persistente, foi estruturado o ambiente de desenvolvimento de contratos inteligentes utilizando Rust.
Anchor Workspace (POC 03): Criação e estruturação inicial do projeto Anchor e diretórios para os programas Rust on-chain.
Estrutura do Smart Contract (POC 04): Definição do programa principal Fowlgen_wars (lib.rs) para validação de regras de estado e contas on-chain.
Preparação da Comunicação Unity ↔ Anchor: Configuração inicial para permitir que o cliente Unity envie transações e chame instruções do programa Rust na Devnet.
Modelagem de PDAs (Contas de Associação de Dados): Estruturação conceitual do FowlgenData para persistir dados dinâmicos do personagem (nível, XP, vitórias, atributos) vinculados ao mint do NFT de cada galinha (NFT + PDA), garantindo evolução on-chain sem perda de identidade do ativo.
Instruções Iniciais do Contrato: Planejamento das instruções básicas (initialize_Fowlgen, upgrade_Fowlgen, add_xp).
Arte 2D
A identidade visual de FOWLGEN WARS começou a ganhar vida na Sprint 01 através do trabalho de arte conceitual 2D.
Conceito de Personagem: Criação do primeiro estudo visual utilizando a personagem Galia — A Garra de Ferro como exercício de estilo.
Identidade Visual e Silhuetas: Exploração de proporções e silhuetas fortes para garantir que os personagens sejam facilmente identificados na tela do dispositivo móvel durante partidas aceleradas.
Paleta de Cores: Definição inicial das cores vibrantes e cartunescas que ditarão a atmosfera leve e bem-humorada do universo de galinhas guerreiras.
Painel de Referências: Organização de referências de arte conceitual e painéis semânticos para alinhar o estilo de todo o time de criação.
Entregável: Versão inicial do conceito da personagem principal renderizado para servir de guia para modelagem 3D.
Arte 3D
A equipe iniciou o pipeline de transição do plano bidimensional para o ambiente tridimensional de jogo.
Modelagem de Personagens: Estudo e modelagem tridimensional básica baseada no conceito 2D de Galia, utilizando a ferramenta Blender.
Pipeline Blender para Unity: Configuração da escala e exportação de malhas (meshes) no formato adequado para leitura na Unity.
Organização do Arquivo: Estruturação correta das camadas de modelagem, materiais e nomenclatura de objetos dentro do Blender para facilitar integrações futuras.
Materiais e Texturas: Aplicação de materiais e mapeamento de cores básicas para validação de visual tridimensional inicial.
Animação 2D/3D
O foco da animação foi compreender a dinâmica de movimento dos personagens estilizados dentro da engine física.
Estudos de Movimentação: Análise teórica e prática de como as galinhas guerreiras devem se comportar fisicamente no jogo.
Desenvolvimento de Ciclos Básicos: Criação de pequenos loops de teste no Blender, focando nas poses de repouso (Idle), movimentação (Walk), ataque (Attack) e vitória/comemoração (Celebration).
Rigging (Esqueleto de Deformação): [Pendente] O desenvolvimento do rig técnico final e da estrutura óssea do personagem para animações complexas ficou pendente para a próxima sprint.
Skinning (Pintura de Peso de Malha): [Pendente] A vinculação da malha 3D ao esqueleto técnico foi classificada como pendente.
Animação de Reação a Dano (Hit): [Pendente] A criação de poses e ciclos para reação a ataques inimigos ficou pendente.
Pipeline de Importação: Testes iniciais de leitura e sincronização das animações exportadas do Blender dentro do componente Animator da Unity.
Integrações e Testes Realizados
Como parte da cultura de testes (QA) estabelecida desde a primeira Sprint, foi gerada uma planilha de validação de funcionalidades do protótipo Unity para acompanhar as mecânicas fundamentais de jogo.
Matriz de Testes de QA — Sprint 01
Funcionalidade / Teste
Status
Detalhes / Observações
O jogo inicia corretamente na Unity
✅ Aprovado
Inicialização do motor e carregamento da cena padrão bem-sucedidos.
O personagem se movimenta
❌ Reprovado
Implementação de inputs e scripts de movimentação incompletos na Unity.
Sistema de colisão funciona
❌ Reprovado
Colisões físicas básicas do modelo Pong ainda não integradas de forma estável.
O botão da interface (UI) funciona
❌ Reprovado
Interatividade e links nos botões da tela conceitual pendentes de codificação.
O áudio do jogo funciona
❌ Reprovado
Efeitos sonoros básicos de galinhas, ataques e ambiente não integrados ao motor de áudio.


Estrutura do Painel Conceitual de UI
Uma apresentação em slides detalhando o wireframe inicial desenvolvido a tela inicial do jogo, incluindo os botões de iniciar partida e coleção de cartas.
Problemas, Dificuldades e Soluções
Como toda fase inicial de projeto, o desenvolvimento de FOWLGEN WARS encontrou barreiras operacionais e técnicas importantes.
Atraso no Cronograma Inicial:
Problema: O projeto foi iniciado com certo atraso de tempo, o que pressionou o cronograma da primeira sprint.
Solução: Foi adotada uma estratégia rigorosa de não tentar acumular o trabalho de duas semanas em uma. O escopo foi reduzido para focar na entrega de artefatos essenciais de cada membro do time, prezando pelo aprendizado e validação das bases.
Integração Técnica com Blockchain:
Problema: O acoplamento completo de contratos Anchor com a Unity se provou complexo para uma única semana.
Solução: A arquitetura foi simplificada. Decidiu-se que a prioridade inicial não é criar um contrato Anchor gigantesco, mas sim provar uma conexão mínima: Unity chamando uma instrução simples na Devnet da Solana (POC 01 a 04), deixando NFTs e Tokens para as sprints subsequentes.

Resultados Alcançados
Apesar das limitações de tempo e dificuldades típicas de uma primeira sprint, o time de desenvolvimento de FOWLGEN WARS obteve resultados sólidos que dão suporte para a continuidade do projeto:
Alinhamento e Divisão de Papéis: Toda a equipe de 7 integrantes foi organizada e suas funções foram validadas por meio de tarefas práticas.
Arquitetura Blockchain Definida: Estabeleceu-se uma estratégia sustentável, utilizando a Unity para o gameplay dinâmico off-chain e a Solana de forma cirúrgica para propriedade, progressão persistente em PDAs e economia.
Identidade Visual Inicial: Conceitos 2D vibrantes e as primeiras malhas 3D e ciclos de animação do Blender foram criados como fundação para a produção de assets.
Estrutura de QA: O processo de garantia de qualidade foi inicializado com a criação de matrizes de teste claras, estabelecendo a cultura de validação desde o início do projeto.
Pendências e Próximos Passos (Sprint 02)
Para a Sprint 02, o objetivo será solucionar os testes de QA reprovados e avançar no Roadmap de POCs (Provas de Conceito) técnicas estabelecido.
Prioridades para a Sprint 02:
Mecânica na Unity (Programação): Resolver a movimentação do personagem, habilitar sistemas de colisões físicas estáveis no protótipo e interligar os botões da UI na engine Unity.
Integração de Áudio: Pesquisar, gravar/selecionar e codificar os efeitos sonoros básicos de impacto, galinhas e ambiente no motor gráfico.
Animação Técnica (Blender/Unity): Concluir o Rigging e Skinning dos personagens 3D modelados e exportar as primeiras animações funcionais de repouso (Idle) e movimento (Walk).
Avanço no Roadmap de POCs (Blockchain):
POC 04: Estabelecer a chamada de instrução funcional entre Unity e Anchor.
POC 05: Assinatura de transação Devnet enviada diretamente pelo cliente de jogo Unity.
Fase 02 (Fowlgen On-Chain): Iniciar as POCs de Fowlgen NFT e Fowlgen PDA para armazenamento de atributos e evolução do personagem.
Resumo
Nesta lição, analisamos em detalhes o relatório técnico da Sprint 01 de FOWLGEN WARS:
Escopo Realista: O objetivo principal da Sprint 01 foi estabelecer processos de trabalho, definir o escopo do MVP e criar a base do projeto, e não finalizar o jogo.
Arquitetura híbrida Web3: O modelo ideal de jogo mobile com blockchain não roda todo o gameplay on-chain, mas usa a Unity off-chain (física, partículas, movimento) e a Solana on-chain para controle de ativos (NFTs, PDAs de atributos, SPL Tokens).
Progresso do Time: O projeto avançou na criação do repositório Unity, testes básicos do Solana SDK, setup do workspace Anchor, arte conceitual 2D (Galia) e modelagem 3D primária no Blender.
Ajuste de QA e Roteiro de POCs: Com 4 testes fundamentais falhando na planilha de QA inicial, a equipe possui um plano de ação claro focado em mecânicas básicas e comunicação Unity-Anchor na Sprint 02.
