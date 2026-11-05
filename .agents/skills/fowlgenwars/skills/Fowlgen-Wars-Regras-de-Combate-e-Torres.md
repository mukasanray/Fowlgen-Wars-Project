# FOWLGEN WARS — Regras de Combate e Torres

## Objetivo e status

Este documento separa as regras já apoiadas pelas fontes do projeto das decisões necessárias para combate e torres no Mini-MOBA MVP. A contagem de torres está definida, mas sua função ainda não. Nenhuma opção abaixo deve ser tratada como regra aprovada sem validação do Product Owner.

## Fontes

- [`🐔 Mini-Moba-MVP.md`](%F0%9F%90%94%20Mini-Moba-MVP.md): loop da partida, três rotas, Minions e decisões pendentes.
- [`Fowlgen-Wars-Minions.md`](Fowlgen-Wars-Minions.md): geração, avanço, limite ativo e combate dos Minions.
- [`Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`](Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md): três rotas, três torres por lado em cada rota (18 no total), campos simétricos.
- [`Fowlgen-Wars-Roadmap-de-Pocs-alterada.md`](Fowlgen-Wars-Roadmap-de-Pocs-alterada.md), POCs 18–22 e 33–36: ataque/colisão/dano local, vida, derrota, habilidade e resultado de partida como áreas de implementação/teste.
- [`🐔 Sistema-de poderes.md`](%F0%9F%90%94%20Sistema-de%20poderes.md): quatro slots conceituais; cooldowns listados são exemplos balanceáveis.
- [`Fowlgen-Sistema-de-Armadilhas-Personalizadas.md`](Fowlgen-Sistema-de-Armadilhas-Personalizadas.md): armadilhas são um sistema configurável e não requisito automático deste MVP.

## Regras atualmente definidas

- Há um Galinheiro em cada campo.
- A arena deste MVP tem três rotas.
- Cada rota tem três torres por lado; há 18 torres no total, em disposição espelhada.
- Os Galinheiros geram Minions periodicamente; eles avançam pelas rotas e podem enfrentar Minions adversários segundo o sistema de combate implementado.
- A quantidade simultânea de Minions deve respeitar um limite configurável definido para o modo.
- Movimento, colisão e combate pertencem ao loop Unity/off-chain; não são transações Anchor.
- Os documentos de referência não definem a função mecânica das torres, os valores de combate nem a condição final de vitória.

## Regras-base para a POC local

Até aprovação de regras completas:

- Implementar somente ataque, alvo, vida, dano e derrota que já existam no projeto ou sejam especificamente aprovados para a POC.
- Manter estatísticas e tempos em configuração; não copiar exemplos ilustrativos como valores finais.
- Não permitir que Minions ignorem, ataquem, sejam bloqueados por ou recebam proteção de torres por comportamento presumido.
- Não conceder recursos, XP, tokens, NFTs ou recompensas por derrotas sem regra aprovada.
- Testar o combate local sem wallet, RPC ou transação. Validar a rede em separado na POC FishNet.

## Matriz de decisão das torres

| Decisão | Estado atual | Definição necessária |
| --- | --- | --- |
| Quantidade | Definida | 3 por rota em cada campo; 18 total |
| Posição | Base fixa e simétrica | Validar distâncias e pontos na cena do mapa |
| Alvos | Pendente | Minions, jogador, ambos ou nenhum |
| Ataque e alcance | Pendente | Tipo, alcance e cadência, se aplicável |
| Vida e dano | Pendente | Valores e condições, se aplicável |
| Bloqueio de caminho | Pendente | Se torre pode bloquear, ser atravessada ou ser contornada |
| Destrutibilidade | Pendente | Se pode ser destruída e o efeito disso na rota |
| Visão/controle | Pendente | Se fornece visão ou altera controle de área |
| Relação com o Galinheiro | Pendente | Se todas as torres precisam cair antes de atingir a base |

Exemplos de visão/ataque/destruição presentes em documentos estratégicos são possibilidades de design, não decisões para este MVP.

## Matriz de combate

| Regra | Estado atual |
| --- | --- |
| Quem pode combater | Minions adversários; outros atores dependem do escopo aprovado |
| Seleção de alvo | Pendente |
| Alcance e frequência de ataque | Pendente e balanceável |
| Vida, dano e tipos de dano | Pendente e balanceável |
| Empate/retarget quando um alvo desaparece | Pendente |
| Morte, remoção e reposição de Minions | A POC prevê destruição/remoção; política final depende de configuração |
| Habilidades | Quatro slots conceituais existem; uso por exército/controlador não foi definido |
| Autoridade multiplayer | Definir e validar na POC FishNet |

## Condição de fim e resultado

As fontes citam Galinheiro, condição de derrota e partida de aproximadamente três minutos, mas não fixam uma regra completa de vitória. Antes de implementar resultado final, aprovar:

- se o alvo final é o Galinheiro adversário;
- se torres precisam ser derrotadas/desativadas antes do Galinheiro;
- como termina a partida ao atingir o tempo-alvo;
- como tratar empate, desconexão ou falha de sessão;
- qual estado produz o vencedor e como é validado pelo sistema de rede.

Não escolher uma dessas alternativas silenciosamente. A regra aprovada deve ser registrada no GDD e implementada/testada localmente antes da integração de recompensa on-chain.

## Checklist de teste

- Testar movimento e colisão em cada uma das três rotas.
- Confirmar que um Minion não atravessa obstáculo ou torre sem regra explícita.
- Testar alvo, ataque, dano, derrota e remoção com valores de configuração conhecidos.
- Testar limites, retarget e casos sem alvo.
- Testar a condição final de vitória/empate somente após aprovação da regra.
- Repetir testes em sessão FishNet com dois clientes e comparar com o teste local.
- Registrar caso, pré-condição, resultado esperado/obtido, evidência e build testada.
