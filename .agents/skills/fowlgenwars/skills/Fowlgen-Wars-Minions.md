# FOWLGEN WARS — Minions, Geração e Avanço pelas Rotas

## Objetivo e status

Especificar a POC de tropas automáticas do FOWLGEN WARS: os Galinheiros dos dois campos geram Minions em intervalos sucessivos; eles avançam pelas rotas do mapa e entram em combate com o lado adversário.

Esta é uma especificação para orientar a implementação e os testes na Unity. Não afirma que o sistema já existe. Os valores de balanceamento e algumas regras de seleção ainda dependem de decisão de gameplay.

## Fontes verificadas

- [`🐔 MINI-MOBA`](%F0%9F%90%94%20Mini-Moba.md): descreve o Galinheiro como origem contínua de tropas, o avanço das tropas, confrontos e uma partida conceitual de aproximadamente três minutos.
- [`FOWLGEN WARS — Roadmap de POCs`](Fowlgen-Wars-Roadmap-de-Pocs-alterada.md), POCs 33–35: prevê temporizador de geração, tipos de tropa, limite de tropas ativas, spawn, avanço, destruição/reposição, derrota do Galinheiro e uma partida local sem wallet ou transação.
- [`Mapa de três rotas e três torres por lado`](Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md): define, para esta arena, três rotas e três torres por lado em cada rota (18 no total), com um Galinheiro em cada campo. A função mecânica das torres continua pendente.
- [`Relatório FOWLGEN WARS`](Relatorio-Fowlgen-Wars.md): descreve gameplay off-chain e falhas de QA anteriores em movimento e colisão. Verifique o projeto atual e não trate o relatório como prova de funcionamento atual.
- [`Integração Solana, tokens, NFTs e Unity`](Integracao-Solana-tokens-NFTs-Unity-Publicacao-Dapps-Store.md): movimento, física, combate e partida pertencem ao gameplay off-chain; não enviar ações de Minions à blockchain em tempo real.
- [`Claude.md`](../Claude.md): preservar divergências e não inventar implementação ou estado concluído.

## Regras do conceito

### Produção contínua

- Existe um Galinheiro para cada lado/campo; cada um é a origem dos Minions daquele lado.
- Enquanto a partida permitir produção, cada Galinheiro gera Minions repetidamente em intervalos, em vez de criar o exército inteiro no início.
- A produção pode aumentar gradualmente durante a partida. Representar a cadência/curva por configuração, sem fixar segundos ou quantidades não aprovadas.
- “Minions infinitos” significa que não há uma quantidade total predeterminada ao longo de partidas contínuas. Não significa manter unidades simultâneas sem limite na memória.
- Respeitar o estado real da partida e do Galinheiro. Não continuar gerando após fim de partida ou derrota do Galinheiro se esses estados estiverem implementados pelo modo.

### Limite de unidades ativas

O roadmap de POCs exige um limite de tropas ativas. Portanto:

- A produção pode continuar ao longo da partida, mas a quantidade viva simultânea deve respeitar um limite configurável.
- Ainda precisa ser decidido se o limite se aplica por Galinheiro, por equipe ou à partida inteira.
- Quando o limite for alcançado, não criar unidades além da capacidade. A política para o temporizador nesse caso (aguardar espaço, acumular uma unidade pendente ou outra regra) deve ser configurável e aprovada; não gerar um lote atrasado de surpresa.
- Reutilizar o mecanismo de pooling já existente no projeto. Se não houver, avaliar pooling para evitar alocações e destruições repetidas em combate prolongado; isso é uma decisão técnica, não regra de gameplay.

### Avanço e combate

- Cada Minion segue uma rota atribuída entre as três rotas do mapa. A forma de escolher ou alterar a rota ainda não está definida.
- O movimento deve seguir os caminhos/waypoints existentes na cena e respeitar limites, obstáculos e pontes atravessáveis. Não permitir que a unidade corte caminho através de terreno bloqueado ou atravesse torres sem uma regra aprovada.
- Minions dos dois lados avançam em direções opostas. Ao encontrar adversários, entram em combate segundo os sistemas de alvo, ataque, vida, dano e animação já presentes no projeto.
- Não inventar tipos, aparência, estatísticas, velocidade, vida, dano, alcance, composição de grupos ou prioridade de alvo. Reutilizar dados existentes; caso não existam, manter os dados da POC configuráveis e identificados como temporários.
- A função das torres ainda não foi definida. Não fazer Minions atacarem, serem bloqueados, protegidos por, ou ignorarem torres por uma regra presumida. A movimentação deve expor um ponto de integração futuro para regras de torre, sem implementá-las.
- Não atribuir recompensa, XP, token, NFT ou progresso por Minion derrotado sem regra aprovada.

## Decisões pendentes

Registrar antes de balancear ou tratar o sistema como final:

- intervalo inicial de spawn e curva de aumento da cadência;
- se o aumento é contínuo, por etapas ou por marcos da partida;
- limite de Minions ativos e se é por Galinheiro/equipe/partida;
- tratamento do temporizador ao atingir o limite;
- distribuição inicial dos Minions pelas três rotas e se o jogador poderá influenciá-la;
- tipos e composições de Minions;
- seleção de alvo, alcance, ataque e regras de retorno/retarget;
- se o sistema termina quando o Galinheiro é derrotado e como a derrota ocorre;
- como a autoridade e a sincronização serão feitas com FishNet.

O Mini-MOBA descreve quatro rotas, enquanto a especificação atual desta arena define três. Para esta POC, usar as três rotas do mapa atual e não alterar silenciosamente o documento Mini-MOBA.

## Escopo recomendado da POC

1. Inspecionar a cena, os prefabs, os scripts de movimento/combate, os limites da arena e os pacotes instalados.
2. Criar ou reutilizar um ponto de spawn em cada Galinheiro.
3. Produzir Minions sucessivamente com temporizador e parâmetros de configuração, respeitando o limite ativo.
4. Percorrer e testar cada uma das três rotas sem atravessar bloqueios ou trocar de faixa involuntariamente.
5. Validar encontro e combate entre unidades adversárias usando somente regras já existentes ou explicitamente temporárias.
6. Validar destruição/remoção e reposição de unidades sem crescimento descontrolado de objetos na cena.
7. Executar primeiro localmente, sem wallet, RPC ou transação.
8. Integrar FishNet somente se a biblioteca e o padrão de rede já estiverem presentes e confirmados. Caso contrário, registrar uma POC de rede separada. Não declarar sincronização multiplayer validada sem teste com dois clientes.

## Prompt para Unity AI

```text
Trabalhe no projeto Unity FOWLGEN WARS existente para prototipar a geração e avanço dos Minions, seguindo este documento e as skills citadas. Antes de alterar, inspecione cenas, Galinheiros, rotas, prefabs, scripts de movimento/combate, sistema de input, versão da Unity, packages e integração FishNet existente.

Requisitos:
- Há um Galinheiro em cada campo. Cada um gera as unidades do seu lado em intervalos sucessivos durante uma partida ativa.
- A produção total ao longo do jogo é contínua, mas a quantidade simultânea obedece a um limite configurável. Não crie Minions ilimitados ao mesmo tempo.
- A cadência deve aceitar uma curva progressiva configurável. Não invente valores de intervalo, quantidade, estatísticas ou marcos: procure configurações existentes; se não houver, exponha parâmetros temporários claramente identificados e reporte que precisam de aprovação.
- O mapa vigente desta arena tem três rotas e três torres por lado em cada rota. Cada Minion deve receber uma rota e seguir seus caminhos existentes até o campo adversário. A regra de distribuição entre rotas ainda não foi decidida; mantenha-a configurável e não invente seleção do jogador.
- Os Minions adversários podem entrar em combate usando somente sistemas existentes de alvo, ataque, vida e dano. Se esses sistemas não existirem, implemente apenas o menor stub isolado necessário para testar movimento/spawn ou registre o bloqueio; não invente balanceamento.
- A função das torres está pendente: não implemente alvo, dano, bloqueio, proteção ou destruição de torres.
- A POC de gameplay deve funcionar sem wallet, RPC, Solana ou Anchor. Não enviar spawn, movimento, combate ou destruição de Minions on-chain.
- Use FishNet apenas se estiver instalado e se houver padrão de integração no projeto. Não invente APIs nem simule uma sessão real. Se ausente, mantenha a POC local e reporte a integração de rede como pendente.

Respeite o estado de fim de partida e o estado real dos Galinheiros. Não adicionar recompensa, XP, NFT, token, novos tipos de Minion ou UI além do escopo aprovado. Reutilize padrões existentes; evite criar sistemas paralelos.

Valide: spawn repetido nos dois lados; percurso em cada uma das três rotas; ausência de passagem por obstáculos; limite de unidades simultâneas; combate e remoção, se já suportados; fim da geração após o fim da partida; estabilidade durante várias iterações. Se FishNet puder ser testado, valide com dois clientes e reporte esse resultado separado do teste local.

Ao terminar, liste arquivos/cenas alterados, sistemas reutilizados, parâmetros temporários, decisões pendentes e evidências reais. Não declare multiplayer ou balanceamento concluído sem teste correspondente.
```

## Critérios de aceite

- Os dois Galinheiros produzem Minions repetidamente enquanto o estado da partida permitir.
- A cadência pode ser ajustada por configuração e não contém valores de balanceamento inventados como definitivos.
- A quantidade viva simultânea nunca excede o limite configurado.
- As unidades percorrem as três rotas sem atravessar obstáculos, sair da faixa ou contornar regras inexistentes das torres.
- Minions adversários entram em combate apenas se houver sistema de combate configurado; o resultado pode ser testado localmente sem blockchain.
- A remoção de unidades não causa acúmulo de objetos ou produção ilimitada simultânea.
- A partida termina de forma reproduzível; o comportamento de um Galinheiro derrotado segue somente a regra efetivamente implementada.
- Teste local, teste FishNet com dois clientes e futuras recompensas on-chain são reportados como critérios distintos.

## Próximo passo

Validar com o Product Owner a curva de produção, o limite e a distribuição entre as três rotas. Definir a função das torres antes de implementar combate de Minions contra elas.
