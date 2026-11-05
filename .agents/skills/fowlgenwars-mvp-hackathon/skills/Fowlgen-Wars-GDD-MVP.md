# FOWLGEN WARS — GDD do MVP

## Objetivo e status

Este documento consolida a visão do MVP jogável do FOWLGEN WARS e aponta as especificações detalhadas. Ele complementa [`🐔 Mini-Moba-MVP.md`](%F0%9F%90%94%20Mini-Moba-MVP.md), não o substitui.

Este GDD registra o escopo de produto documentado e as decisões que ainda precisam ser aprovadas. Ele não é prova de implementação ou validação em Unity.

## Visão do produto

FOWLGEN WARS é um jogo mobile multiplayer da G5B Studios. Para o MVP Mini-MOBA, cada jogador comanda uma força de Minions produzida pelo seu Galinheiro e disputa uma partida curta em uma arena de três rotas.

A meta de duração documentada é aproximadamente três minutos. O valor final e as regras de encerramento precisam ser testados e aprovados.

## Escopo definido para este MVP

- Dois campos opostos, cada um com um Galinheiro.
- Três rotas de combate: superior, central e inferior.
- Três torres fixas em cada rota de cada campo, totalizando 18 torres.
- Minions gerados periodicamente pelos Galinheiros, avançando pelas rotas e enfrentando o lado adversário.
- Produção progressiva durante a partida, com cadência configurável e limite de unidades ativas.
- Unity executa o loop de jogo em tempo real, sem transações blockchain para movimento ou combate.
- FishNet foi escolhido para networking em tempo real; integração, autoridade e topologia precisam de POC.
- Interface mobile em orientação horizontal, conforme o prompt de telas.

Consulte [`🐔 Mini-Moba-MVP.md`](%F0%9F%90%94%20Mini-Moba-MVP.md), [`Fowlgen-Wars-Minions.md`](Fowlgen-Wars-Minions.md), [`Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`](Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md), [`Fowlgen-Wars-Telas-Game.md`](Fowlgen-Wars-Telas-Game.md), [`Fowlgen-Wars-Regras-de-Combate-e-Torres.md`](Fowlgen-Wars-Regras-de-Combate-e-Torres.md) e [`Fowlgen-Wars-Roadmap-de-Pocs.md`](Fowlgen-Wars-Roadmap-de-Pocs.md) para as especificações de cada área. A POC FishNet está dentro do roadmap.

## Fluxo macro da partida

```text
ABRIR O JOGO
    ↓
ENTRAR/CRIAR SESSÃO MULTIPLAYER
    ↓
CARREGAR OS DOIS CAMPOS E GALINHEIROS
    ↓
INICIAR PARTIDA
    ↓
GALINHEIROS GERAM MINIONS
    ↓
MINIONS AVANÇAM PELAS TRÊS ROTAS E COMBATEM
    ↓
ATINGIR UMA CONDIÇÃO DE FIM APROVADA
    ↓
MOSTRAR RESULTADO
```

O fluxo é alvo de design. Estados de matchmaking, conexão, resultado e transição só podem ser apresentados como funcionais quando existirem no projeto e forem testados.

## Papel do jogador

O jogador deve tomar decisões sobre pressão e defesa entre as três rotas, mantendo o conceito de comandar um exército em vez de selecionar individualmente cada Minion.

Ainda precisa ser definido como a pessoa direciona essa pressão: escolha pré-partida, comando durante o jogo ou outra interação. A existência de um joystick e de quatro slots de poder em documentos de interface não resolve essa decisão para um modo de comando de tropas.

Os arquétipos descritos nas skills (linha de frente, caça/mobilidade, poder/controle e dano à distância/proteção) são referências conceituais. Não há distribuição aprovada de classes por rota nem roster final de Minions.

## Arena

A especificação escolhida para este MVP determina três rotas e 18 torres. Cada campo possui um Galinheiro, e as torres são espelhadas. A função mecânica das torres continua pendente.

O mapa é uma proposta documental. Dimensões, geometria final, navegação e desempenho devem ser validados na cena Unity.

## Sistemas fora do escopo inicial

Não são requisitos automáticos do MVP: loja, inventário, economia completa, recompensas on-chain, NFTs, SPL Tokens, armadilhas, ranking, clãs, temporadas, chat ou matchmaking de produção. Reintroduzi-los exige tarefa e critério de aceite próprios.

Solana/Anchor fica separado do loop de tempo real. Uma eventual persistência de resultado/recompensa é posterior e não deve afetar o funcionamento local da partida.

## Conflitos documentais

- O conceito original [`🐔 Mini-Moba.md`](%F0%9F%90%94%20Mini-Moba.md) define quatro rotas; a decisão mais recente para a arena deste MVP define três. Este GDD aplica três rotas somente a este MVP, sem reescrever o conceito original.
- A Sprint 01 e seu relatório descrevem um protótipo inicial inspirado em Pong; isso é uma etapa anterior, não o modo Mini-MOBA deste MVP.
- Os roadmaps de POCs divergem entre Web/WebGL e Android como plataforma inicial. Confirmar qual roadmap e alvo de build estão ativos antes de configurar a plataforma.
- FishNet foi escolhido como tecnologia de multiplayer, mas não há evidência de integração validada nos documentos consultados.

## Decisões de produto pendentes

1. Definir como o jogador distribui ou prioriza Minions nas três rotas.
2. Definir a função das torres e sua relação com Minions e Galinheiros.
3. Definir condição de vitória/derrota e resolução quando o tempo-alvo termina.
4. Aprovar cadência de geração, limite ativo e tipos/composição de Minions.
5. Definir aplicação dos quatro poderes ao modo de comando de tropas.
6. Validar plataforma do MVP e a topologia FishNet.
7. Definir quais dados/resultados, se houver, serão persistidos on-chain.

Detalhes de regras de combate e torres ficam em [`Fowlgen-Wars-Regras-de-Combate-e-Torres.md`](Fowlgen-Wars-Regras-de-Combate-e-Torres.md); a POC de rede fica no [`Fowlgen-Wars-Roadmap-de-Pocs.md`](Fowlgen-Wars-Roadmap-de-Pocs.md), a partir da Fase 02.

## Critérios de aceite do GDD

- O modo está descrito como Mini-MOBA de três rotas para este MVP.
- O mapa prevê dois Galinheiros e 18 torres em configuração simétrica.
- O loop macro, o papel do jogador e a produção de Minions estão descritos sem inventar balanceamento.
- Decisões pendentes têm responsável/aprovação definida antes de virarem regra implementada.
- Os critérios de gameplay, combate, rede e resultado podem ser testados separadamente.
