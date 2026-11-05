# 🐔 FOWLGEN WARS — Mini-MOBA MVP

## Objetivo e status

Este documento adapta o conceito de [`🐔 Mini-MOBA`](%F0%9F%90%94%20Mini-Moba.md) para o MVP descrito no mapa de três rotas. O MVP mantém o núcleo do conceito original: cada jogador comanda uma força de Minions gerada continuamente pelo seu Galinheiro, pressiona o campo adversário por rotas e disputa uma partida curta.

Esta é uma especificação de gameplay para orientar o MVP. Ela não prova que o modo esteja implementado ou validado. O mapa e as regras de torre ainda são uma proposta/documentação, não uma cena Unity aprovada em runtime.

## Referências e precedência

- [`🐔 Mini-MOBA`](%F0%9F%90%94%20Mini-Moba.md): conceito-base de exército, Galinheiro, geração contínua, avanço das tropas, combate e partida de aproximadamente três minutos. A versão original descreve quatro rotas.
- [`Mapa de três rotas e três torres por lado`](Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md): definição mais recente para esta arena: três rotas, três torres por lado em cada rota, 18 torres no total e um Galinheiro em cada campo.
- [`FOWLGEN WARS — Minions`](Fowlgen-Wars-Minions.md): produção progressiva, limite de unidades ativas, avanço nas três rotas e validações da POC.
- [`Sistema de poderes`](%F0%9F%90%94%20Sistema-de%20poderes.md): quatro slots conceituais, Ataque, Defesa, Especial e Supremo; a aplicação desses slots ao loop de controle de exército precisa ser definida.
- [`Hierarquia de personagens`](%F0%9F%90%94%20Hierarquia-de-Personagens.md): separa rota, função, classe e espécie.
- [`Camada estratégica inspirada no xadrez`](Fowlgen-Camada-Estrategica-Inspirada-No-Xadrez.md): referências conceituais de pressão de rotas, centro e iniciativa; não são regras implementadas por si só.
- [`Roadmap de POCs`](Fowlgen-Wars-Roadmap-de-Pocs-alterada.md), POCs 33–36 e 52–53: geração, limite de tropas ativas, rotas, partida de três minutos, resultado e QA.

A versão original do Mini-MOBA fala em quatro rotas; este MVP usa as três rotas definidas em [`Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`](Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md), sem reescrever silenciosamente o conceito original.

## Conceito da partida

- Partida mobile multiplayer entre dois jogadores, cada um com seu campo e Galinheiro.
- O jogador comanda sua força como um conjunto; o loop não exige selecionar e mover cada Minion individualmente.
- Cada Galinheiro gera Minions periodicamente durante a partida. A cadência pode aumentar gradualmente conforme configuração aprovada.
- Os Minions avançam em direção ao campo adversário pelas rotas atribuídas e entram em combate conforme as regras existentes/configuradas.
- O jogador toma decisões de pressão entre as três rotas. A interface e o método exato de atribuição de rota ainda não estão definidos.
- Duração-alvo conceitual: aproximadamente três minutos. O encerramento precisa de uma regra de resultado determinística antes de ser considerado pronto.

## Mapa do MVP

O mapa possui exatamente três rotas contínuas:

| Rota | Posição no mapa | Uso no MVP |
| --- | --- | --- |
| Rota 1 | Faixa superior | Caminho de avanço entre os dois campos |
| Rota 2 | Faixa central | Caminho de avanço entre os dois campos |
| Rota 3 | Faixa inferior | Caminho de avanço entre os dois campos |

Há um Galinheiro em cada campo. Cada rota contém três torres fixas de cada lado, espelhadas entre os dois jogadores:

- 3 rotas × 3 torres por lado × 2 lados = 18 torres no total.
- A quantidade e a posição-base são fixas para esta arena.
- A função mecânica das torres ainda está pendente. Este documento não define se elas atacam, bloqueiam, protegem, dão visão ou podem ser destruídas.
- Pontes, lagos, terreno e áreas laterais de emboscada seguem o mapa de terreno; não devem interromper o caminho de Minions nem criar atalhos não aprovados.

A versão anterior do conceito tinha TOP, SELVA, MID e ADC. Neste mapa, as rotas são identificadas espacialmente como superior, central e inferior. Não atribuir automaticamente uma classe a cada rota.

## Tropas e arquétipos

O conceito original de diferentes estilos de combate continua possível sem obrigar a criação de uma quarta rota:

- Linha de frente: Tanques, Colossos, Titãs e Parrudos.
- Caça e mobilidade: Hunters, Caçadores e Lutadores.
- Poder e controle: Feiticeiros, Magos, Bruxos e Assassinos.
- Dano à distância e proteção: Atiradores e Protetores/Suportes.

Esses são arquétipos descritos nas skills, não uma lista final de Minions do MVP. Quantidade de tipos, atributos, aparência, progressão e composição de ondas devem vir de dados aprovados ou permanecer como configuração temporária. A Selva/Jungle da versão de quatro rotas pode inspirar emboscadas e mobilidade entre rotas, mas não representa uma quarta rota neste MVP.

## Ciclo de jogo

```text
PARTIDA INICIA
      ↓
CADA GALINHEIRO GERA MINIONS
      ↓
MINIONS RECEBEM/SEGUEM UMA ROTA
      ↓
AVANÇAM EM DIREÇÃO AO CAMPO ADVERSÁRIO
      ↓
ENCONTRAM MINIONS ADVERSÁRIOS E COMBATEM
      ↓
JOGADORES DECIDEM ONDE PRESSIONAR OU DEFENDER
      ↓
A GERAÇÃO PROSSEGUE ATÉ O FIM DA PARTIDA
      ↓
RESULTADO DA PARTIDA
```

## Geração e progressão da cadência

- Produção sucessiva por ambos os Galinheiros enquanto o estado da partida permitir.
- A cadência pode aumentar gradualmente durante a partida, conforme a direção de design solicitada.
- Os intervalos, os marcos da progressão e quaisquer quantidades por geração não estão definidos neste documento; mantê-los configuráveis até validação de balanceamento.
- “Geração contínua/sem total fixo” não significa quantidade simultânea ilimitada. Respeitar o limite de Minions ativos previsto no roadmap e definido na configuração do modo.
- O escopo do limite (por Galinheiro, por equipe ou partida) e a política ao atingir o limite ainda precisam ser decididos.
- A geração deve parar no fim da partida. O comportamento quando um Galinheiro é derrotado depende da condição de vitória/derrota aprovada.

## Combate, torres e resultado

- Minions avançam e se enfrentam usando os sistemas de movimento, alvo, ataque, vida e dano efetivamente presentes no projeto.
- Não inventar prioridade de alvo, velocidade, alcance, dano, vida, frequência de ataque, bônus ou recompensa.
- Não criar regra de combate com as torres enquanto sua função não for aprovada.
- A documentação prevê resultado, partida com duração aproximada de três minutos e condição de derrota do Galinheiro, mas não fecha como o vencedor é determinado. Aprovar se o resultado será decidido por destruição do Galinheiro, objetivo/torres, estado ao fim do tempo ou outra regra antes da implementação final.
- Recompensas e progressão ficam fora do loop principal até existirem regras de produto e integração aprovadas. Ações de combate permanecem off-chain na Unity; Anchor/Solana não sincroniza movimento ou ataques.

## Multiplayer

- FishNet é a tecnologia indicada para o multiplayer em tempo real, mas sua integração precisa ser comprovada no projeto e testada com dois clientes.
- A autoridade sobre geração, rota, movimento, combate, destruição e resultado da partida precisa de decisão técnica e teste; não presumir host ou servidor dedicado.
- A partida local deve poder ser testada sem wallet, RPC ou transação, conforme o roadmap de gameplay.
- Não descrever matchmaking, reconexão ou proteção contra trapaça como implementados sem evidência.

## Fluxo conceitual de três minutos

Os marcos abaixo adaptam o ritmo ilustrativo do Mini-MOBA original; não são intervalos ou metas de balanceamento aprovados:

- `0:00`: a partida inicia e os Galinheiros começam a gerar Minions.
- `0:30`: os primeiros encontros podem acontecer conforme o caminho e a cadência configurados.
- `1:00`: o jogador avalia qual das três rotas pressionar ou defender.
- `1:30`: a cadência e a intensidade podem escalar conforme configuração aprovada.
- `2:00`: o jogador ajusta a pressão das rotas.
- `2:30`: fase final ilustrativa; não implica novas unidades ou poderes sem configuração.
- `3:00`: duração-alvo e apresentação do resultado conforme regra de vitória aprovada.

## Escopo inicial de implementação

1. Validar a cena e os caminhos das três rotas.
2. Confirmar os pontos de spawn dos dois Galinheiros.
3. Gerar Minions progressivamente nos dois lados com cadência configurável e limite ativo.
4. Fazer os Minions seguirem sua rota sem atravessar obstáculos, sair de faixa ou passar por uma torre por comportamento presumido.
5. Validar encontro e combate local somente com regras disponíveis/configuradas.
6. Definir e testar condição de fim/resultado em uma partida local.
7. Integrar FishNet depois da POC local e testar a mesma partida com dois clientes.

## Critérios de aceite do MVP

- Dois campos espelhados, cada um com um Galinheiro.
- Exatamente três rotas e três torres fixas por lado em cada rota (18 no total).
- Geração recorrente dos dois Galinheiros com curva ajustável e limite de unidades ativas respeitado.
- Minions percorrem as rotas atribuídas e confrontam o lado oposto segundo as regras de combate configuradas.
- O jogador consegue influenciar a pressão entre rotas; método de input deve ser definido e testado, sem depender de seleção manual de cada Minion.
- Há condição de término e cálculo de resultado explícitos e reproduzíveis.
- O loop principal funciona sem wallet e sem transações on-chain.
- Multiplayer só é aprovado após teste de dois clientes com FishNet; teste local não conta como validação de rede.

## Decisões necessárias antes do balanceamento final

- Como o jogador distribui, muda ou prioriza Minions nas três rotas.
- Tipos e composição inicial dos Minions.
- Curva/intervalo de geração e limite de unidades ativas.
- Função das torres.
- Condição de vitória/derrota e resultado ao terminar o tempo.
- Autoridade FishNet e comportamento em desconexão.
- Se os quatro poderes se aplicam a um personagem controlável, ao exército ou a ambos neste modo.
