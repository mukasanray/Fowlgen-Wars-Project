# FOWLGEN WARS — Mapa de Três Rotas Tres torres cada.

## Objetivo e status

Este documento especifica uma proposta de arena mobile em Unity com três rotas conectando os campos dos dois jogadores. Cada rota terá três torres fixas em cada lado, distribuídas de forma simétrica: 18 torres no total. Esta configuração atualiza a proposta anterior de rota única, mas não representa um mapa já construído ou validado.

O documento Mini-MOBA existente descreve quatro rotas. A configuração de três rotas deste mapa é a direção definida para esta arena; a diferença em relação ao conceito anterior fica registrada e não altera silenciosamente os demais documentos de design.

## Fontes e limites

- **Pedido atual:** três rotas entre os campos dos jogadores; cada rota possui três torres fixas por lado, com a mesma configuração nos dois campos. São 18 torres no mapa (3 rotas × 3 torres × 2 lados). A função das torres ainda será definida.
- **Pedido atual:** pontes, lagos, grama, árvores, areia, planícies, montanhas ao lado das rotas e possibilidades de emboscada.
- **Pedido atual:** grama, árvores, areia, planícies, montanhas, pontes, lagos e emboscadas devem compor uma arena coerente; não adicionar elementos apenas como decoração sem função ou leitura clara.
- **Mini-MOBA:** partida compacta, Galinheiro como origem de tropas e selva associada a emboscadas; o documento fala em quatro rotas. Para esta arena, a definição mais recente é três rotas.
- **Estratégia inspirada em xadrez:** centro e pontos de controle como decisões posicionais; ponte pode ser passagem, colina pode afetar alcance e torre pode oferecer visão como exemplos de design, não regras já aprovadas.
- **Sistema de armadilhas:** prevê tipos e gatilhos variados, mas exige aviso visual/sonoro e janela de reação. Não determina que toda armadilha ou tipo já faça parte deste mapa.
- **Roadmap de gameplay:** descreve arena compacta, limites, rotas, pontos de spawn e condições de início/fim, sem fornecer dimensões ou um layout de terreno final.
- [`Fowlgen-wars-Minions.md`](Fowlgen-wars-Minions.md): especificação proposta para Minions gerados nos dois Galinheiros e movendo-se pelas rotas; usar como critério de navegação da POC, não como prova de implementação.

Não inventar escala em metros, HP, alcance, dano, função/propriedade/vida das torres, quantidade de tropas, tipos de armadilha disponíveis, recompensas, regras de visão ou especificações de servidor. Consultar o projeto Unity e confirmar com o responsável quando esses dados forem necessários.

## Rotas e torres definidas para esta arena

O padrão desta arena é de três rotas, com três torres em cada rota no campo de cada jogador. A contagem é fixa e igual para os dois lados:

- 3 rotas × 3 torres por lado × 2 lados = 18 torres no total.
- Em cada rota, posicionar as três torres de cada lado em sequência entre o respectivo Galinheiro e o centro.
- Espelhar posição e espaçamento das torres entre os dois campos.

O número e a distribuição estão definidos; a função mecânica de cada torre ainda precisa ser definida antes de implementar regras de combate. Torre como ponto de visão é apenas um exemplo presente no documento estratégico, não uma decisão assumida aqui.

## Planta conceitual — vista superior

```text
												 CAMPO A (GALINHEIRO A)    CENTRO    CAMPO B (GALINHEIRO B)
							Rota 1 / Faixa superior:          A1 -- A2 -- A3 -- X -- B3 -- B2 -- B1
							Rota 2 / Faixa central:           A1 -- A2 -- A3 -- X -- B3 -- B2 -- B1
							Rota 3 / Faixa inferior:          A1 -- A2 -- A3 -- X -- B3 -- B2 -- B1

	Montanhas e cenário nas bordas; lagos/margens fora das faixas de combate;
	pontes nos cruzamentos de água; áreas candidatas a emboscada nas laterais.
```

Diagrama sem escala. Cada faixa representa uma rota. A1–A3 e B1–B3 são três torres por lado em cada rota, totalizando 18 torres. A planta não fixa largura, distância entre objetos ou forma final da arena.

## Organização do terreno

### Rotas de combate

- Manter exatamente três rotas contínuas, legíveis e navegáveis entre os campos opostos.
- Dispor três torres por lado em cada rota e manter os 18 pontos fixos e espelhados.
- Usar planícies como superfície predominante das rotas, sem árvores, pedras, água ou decoração bloqueando o avanço.
- Manter as três rotas distintas: não criar atalhos que contornem torres nem rotas adicionais não aprovadas.

### Lagos, margens e pontes

- Posicionar água fora das faixas de combate e usar margens de areia/terra como transição entre água e planície.
- Onde um curso d'água cruzar uma rota, manter a passagem por uma ponte claramente visível e com colisão adequada.
- Não colocar uma ponte decorativa que pareça atravessável se ela não tiver passagem/collider funcional.
- A quantidade e a posição de pontes e lagos devem ser ajustadas ao graybox; não são definidas pela contagem fixa de torres.

### Montanhas e vegetação

- Usar montanhas, colinas e rochas para enquadrar as bordas e dar leitura de arena, sem estreitar ou ocultar as rotas.
- Agrupar árvores e vegetação mais densa fora das faixas principais; manter silhuetas e alvos legíveis na câmera mobile.
- Usar grama baixa nas áreas abertas e vegetação mais alta somente nos pontos escolhidos para cobertura/emboscada.
- Usar areia junto às margens e caminhos locais, sem criar rotas adicionais às três definidas.
- Não espalhar ouro, diamantes, cristais ou outros recursos só por decoração; os documentos citam esses elementos possíveis, mas não definem posições ou uso neste mapa.

## Emboscadas e armadilhas

- Marcar pequenas clareiras ou bolsões de cobertura nas laterais das rotas, próximos a pontos de passagem e ao centro. Eles são locais candidatos a emboscada, não novas rotas que permitam ultrapassar torres.
- A ideia de caçadores surgirem de onde o oponente não espera é documentada para a selva. Neste mapa, sua aplicação exata depende de confirmar se unidades podem sair brevemente das rotas principais.
- Não colocar vegetação alta sobre torres, pontes, pontos de spawn ou entrada dos Galinheiros; cobertura não pode tornar uma ameaça ou objetivo ilegível.
- Se armadilhas forem habilitadas, especificar tipo, gatilho, efeito e área por configuração aprovada. Dar sinal visual/sonoro, animação compreensível e tempo de reação conforme o documento de armadilhas.
- Não adicionar dano, lentidão, bloqueio ou destruição de terreno sem regra de gameplay autorizada. A documentação de armadilhas apresenta essas opções como sistema configurável, não como efeitos obrigatórios para este mapa.

## Critérios de simetria e leitura

- Colocar os dois campos em extremos opostos e espelhar a distribuição das três rotas, 18 torres, pontes, cobertura e distância até o centro.
- Garantir que nenhum lado tenha atalho, cobertura ou linha de visão claramente superior por acidente.
- Preservar visão suficiente ao longo da rota para que o jogador perceba a posição de tropas e ameaças.
- Diferenciar visualmente a rota de áreas decorativas por material, altura ou borda, sem depender apenas de cor.
- Manter a arena reconhecível em câmera de jogo e em tela pequena. Usar formas simples e poucos elementos com função identificável.

## Prompt para Unity AI

```text
Crie uma primeira versão graybox do mapa mobile de FOWLGEN WARS seguindo este documento (`Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`) e inspecionando o projeto Unity existente.

Antes de modificar:
1. Confira cenas, escala, câmera, render pipeline, colliders, prefabs, sistema de navegação e pacotes já instalados.
2. Não invente APIs, scripts ou sistemas FishNet; registre o que encontrou.
3. Registre a diferença entre o conceito Mini-MOBA documentado com quatro rotas e a definição mais recente deste mapa com três rotas. Para esta arena, siga as três rotas sem reescrever silenciosamente o documento de Mini-MOBA.

Layout:
- Criar exatamente três rotas contínuas entre os campos dos jogadores.
- Em cada rota, criar três torres fixas por lado, espelhadas: 18 torres no mapa (3 rotas × 3 torres × 2 lados).
- Não variar a quantidade de torres entre partidas ou campos.
- Reservar um centro legível e espaço para combate.
- Incluir água/lagoas laterais, margens de areia e pontes onde cada rota atravessar água.
- Emoldurar a arena com montanhas/colinas; usar planícies, grama e grupos de árvores sem bloquear as três rotas.
- Marcar bolsões laterais de cobertura para possíveis emboscadas sem criar atalhos ou rotas extras.

Faça primeiro a geometria simples, colliders e teste de navegação/spawn; só depois aplique materiais e vegetação. A quantidade e a distribuição das torres estão definidas, mas não invente sua função mecânica, dano, vida, alvo ou regra de destruição. Também não crie regras de recursos, armadilhas, visão ou recompensas sem configuração/documentação existente. Não conecte o terreno à blockchain. Preserve simetria, leitura em câmera mobile e desempenho.

Ao terminar, reporte arquivos/cenas alterados, escala observada, teste realizado e decisões ainda pendentes. Teste o caminho entre os dois spawns e a passagem pelas pontes. Não declare multiplayer validado sem teste real com dois clientes.
```

## Validação antes de considerar o mapa pronto

- O corredor conecta os dois spawns e não possui bloqueios involuntários.
- Existem exatamente três rotas e a navegação não encontra rotas extras ou atalhos não aprovados.
- Minions de teste conseguem sair de cada Galinheiro e percorrer cada uma das três rotas sem atravessar bloqueios ou trocar de rota involuntariamente.
- As pontes são atravessáveis e suas colisões não prendem tropas/jogadores.
- Lagos não cobrem ou bloqueiam a única passagem.
- Cada rota tem exatamente três torres por lado; as 18 torres e os campos estão distribuídos simetricamente.
- As áreas de emboscada podem ser lidas e testadas sem ocultar ameaças de forma injusta.
- O mapa continua compreensível em câmera e resolução mobile e atende ao orçamento de desempenho observado no projeto.
- A função e a autoridade das torres, visão, armadilhas e destruição são testadas somente depois de suas regras serem definidas; geometria local não comprova essas funcionalidades.

## Referências do projeto

- [`🐔 Mini-MOBA`](%F0%9F%90%94%20Mini-Moba.md)
- [`FOWLGEN — Camada estratégica inspirada no xadrez`](Fowlgen-Camada-Estrategica-Inspirada-No-Xadrez.md)
- [`FOWLGEN — Sistema de armadilhas personalizadas`](Fowlgen-Sistema-de-Armadilhas-Personalizadas.md)
- [`Roadmap de POCs — gameplay e arena`](Fowlgen-Wars-Roadmap-de-Pocs-alterada.md)
