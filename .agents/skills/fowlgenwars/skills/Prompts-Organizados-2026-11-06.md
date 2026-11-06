# 📚 Prompts Fowlgen Wars — Organização Inicial

Este arquivo consolida os prompts recebidos e resume seu status de organização e alinhamento documental.

## Status geral

- Confirmados e organizados: Prompts 01 a 09
- Todos os prompts são ideias ou propostas documentais; a organização não significa aprovação de escopo nem prova de implementação.

---

## Prompt 01 — Sistema de balanceamento de habilidades

Padronização de dados e métricas para balancear habilidades; exemplos, intervalos e percentuais continuam referências não validadas. A arquitetura separa definições configuráveis, execução, estado de partida e autoridade de rede. Os controles são **Skill T/G/Y/H**, não Q/W/E/R. Ver [Fowlgen-Wars-Prompt-01-Balanceamento-de-Habilidades.md](Fowlgen-Wars-Prompt-01-Balanceamento-de-Habilidades.md).

## Prompt 02 — Conceito de jogo medieval + mini-MOBA

### Tema
"Precisamos que o jogo chicken Wars seja feito no período medieval, pois assim existe um vasto leque de opções."

### Direção principal
- Mundo medieval como base de identidade visual e narrativa
- Extrair o melhor de vários jogos sem embutir tudo em um único produto
- Usar categorias de função e raça em combinação com o estilo do jogo

### Estrutura de funções
- TOP: Tanques colossais
- MID: Magos e assassinos
- JOG: Selvagens caçadores
- SUP: Protetores
- ADC: Atiradores

### Raças / povos sugeridos
- Druidas
- Elfos
- Anões
- Goblins
- Ogros
- Orks
- Trolls
- Ciclopes
- Vikings
- Apaches
- Templários
- Romanos
- Africanos
- Egípcios
- Árabes
- Chineses
- Samurais
- Gauleses
- Indianos
- Dragonoides

### Conceito de mapa e partida
- Mapa minúsculo, pensado para partidas curtas
- A partida não deve demorar mais do que o Clash
- O Nexus é o galinheiro que precisa ser defendido
- A ideia central é ritmo rápido, objetivo claro e pressão constante

### Classificação do prompt
- Categoria: game design / conceito de jogo
- Segmento: mini-MOBA, 3 minutos, arena compacta, defesa do galinheiro
- Uso provável: base para documento de núcleo de gameplay

---

## Prompt 04 — Vegetable Rain System v1.0

### Resumo
Sistema ambiental de chuva progressiva de legumes integrado à partida de 180 segundos.

### Mecânicas principais
1. Partida dura 180 segundos
2. 0 a 60s: chuva leve
3. 60 a 120s: intensidade crescente
4. 120 a 180s: intensidade máxima
5. Legumes surgem acima da arena e respeitam os limites do mapa
6. Cada legume tem trajetória, velocidade, colisão e estado próprios
7. Impacto direto em campeão causa dano uma vez
8. Sem impacto, o legume pode ficar no chão e virar coletável
9. Coleta recupera HP pequena quantidade
10. Cada jogador tem limite de cura por evento
11. Legume desaparece após impacto, coleta ou expiração
12. Chuva termina quando a partida termina

### Parâmetros iniciais sugeridos
- Duração da partida: 180s
- Velocidade inicial de queda: 2 a 3 unidades/s
- Dano de impacto: 2% do HP máximo
- Cura por coleta: 3% do HP máximo
- Limite de cura: 12% do HP máximo por jogador por evento
- Tempo máximo no chão: 4 a 6s
- Intervalo inicial de surgimento: 3 a 4s
- Intervalo final: 0,8 a 1,5s
- Aviso visual antes do impacto: 0,5 a 0,8s

### Arquitetura sugerida
- VegetableRainManager
- VegetableProjectile
- VegetablePickup
- HealthComponent
- VegetableRainConfig
- ObjectPool

### Regras técnicas
- Pooling para evitar instanciar e destruir em excesso
- Cada legume só pode causar dano ou ser coletado uma vez
- Colisões filtradas por campeão, cenário e chão
- Evitar surgimento em paredes ou sobre jogador
- Sincronizar em partidas online com autoridade do servidor
- Desativar objetos ao encerrar partida
- Expor parâmetros no Inspector
- Testes para impacto, cura, expiração, limite de cura, escalonamento e encerramento

### Critérios de aceitação
- Sistema começa lento e aumenta gradualmente
- Impactos causam dano limitado
- Coletas restauram HP limitado
- Sem prejuízo relevante de performance
- Resultados consistentes em partidas online

### Classificação do prompt
- Categoria: gameplay ambiental / evento de partida
- Segmento: Unity C#, sistema de chuva dinâmica, combate e sobreviver no mapa
- Uso provável: documento técnico + implementação em Unity

---

## Prompt 06 — Caso de uso: redução do tempo de espera e partidas rápidas

### Problema central
Atualmente, o jogo enfrenta longas filas, carregamento, e partidas que podem consumir muito tempo. Isso afeta disponibilidade, retenção e vontade de jogar novamente.

### Objetivo do produto
O Fowlgen Wars tem como proposta partidas curtas e intensas, com foco em:
- início rápido
- partidas até 3 minutos
- matchmaking otimizado
- preenchimento com bots em casos necessários
- menos espera e mais tempo de ação

### Indicadores a acompanhar
- Tempo médio entre clicar em "Jogar" e iniciar a partida
- % de partidas iniciadas em até 3 segundos
- Tempo de carregamento da sala
- Duração média das partidas
- Taxa de abandono durante matchmaking
- Retenção de jogadores e intenção de jogar novamente

### Proposta de negócio e solução
- Produto: jogo mobile de combate estratégico em estilo mini-MOBA
- Solução: partidas rápidas, humor brasileiro, identidade original e confrontos emocionantes
- Diferenciais principais:
  - partidas de até 3 minutos
  - humor brasileiro como aspecto central
  - universo original de personagens
  - combate estratégico com controle direto de campeões
  - arena dinâmica com eventos imprevisíveis
  - dash, parry e esquiva
  - personalização e progressão
  - comunidade e identidade cultural

### Diferencial do produto
- Combinação de estratégia + ação + humor + tempo de jogo reduzido
- A cultura brasileira entra diretamente na linguagem, no humor e na identidade do jogo
- Foco em experiência acessível e recompensadora para jogadores com pouco tempo disponível

### Classificação do prompt
- Categoria: product / business / UX de tempo de sessão
- Segmento: produto mobile competitivo, retention e experiência de partida rápida
- Uso provável: base para pitch, framing de negócio, e validação de proposta de valor

---

## Prompt 07 — Farm de Aura da Noite

Sistema de coleta, coleção e equipamento de auras cosméticas em forma de chamas coloridas. O conceito lista cinco cores com raridades e cita roxo sem classificação. Duração, probabilidades, duplicatas e regra de proteção contra azar não foram definidas.

**Arquitetura considerada:** definição de conteúdo; inventário persistente no perfil; concessão autoritativa quando conectado; camada visual isolada do combate; reutilização do sistema de recompensas. Ver [Fowlgen-Wars-Prompt-07-Aura-da-Noite.md](Fowlgen-Wars-Prompt-07-Aura-da-Noite.md).

## Prompt 08 — Badges e recompensas pendentes

Indicadores para presentes, baús, missões, itens novos e outras recompensas, com estados de visualização e resgate separados, atualização por categoria e suporte a sincronização.

**Arquitetura considerada:** serviço de recompensa e fonte de verdade; serviço de notificação calcula badges a partir dos estados; UI consome projeções; resgates idempotentes e autoritativos no servidor. Ver [Fowlgen-Wars-Prompt-08-Badges-Recompensas-Pendentes.md](Fowlgen-Wars-Prompt-08-Badges-Recompensas-Pendentes.md).

## Prompt 09 — Evolução elemental de Minions

Conceito de gerações de minions, escolhas elementais, classes e atributos em partidas de 180 segundos. A cadência sugerida de 25 segundos, os elementos, escolhas e percentuais são hipóteses pendentes de validação.

**Arquitetura considerada:** agenda ligada ao estado autoritativo da partida; definições configuráveis; UI envia intenção, não controla regras; spawn obedece limites e pool; movimento/combate reutilizam sistemas existentes; gameplay permanece off-chain. Há uma divergência entre a tabela de horários e o texto sobre geração em 175s, marcada para decisão. Ver [Fowlgen-Wars-Prompt-09-Evolucao-Elemental-de-Minions.md](Fowlgen-Wars-Prompt-09-Evolucao-Elemental-de-Minions.md).

## Prompt 03 — FOWLGEN COMMUNITY

Proposta Web para Fandom, Fanarts e Fórum. Mantém conteúdo oficial separado de contribuições, exige autorização expressa para uso de obras e trata moderação, segurança e privacidade como requisitos. A comunidade não exige wallet nem transfere reputação para poder de combate. Validar a arquitetura real de `app/` e da API antes de planejar integração. Ver [Fowlgen-Wars-Prompt-03-Community.md](Fowlgen-Wars-Prompt-03-Community.md).

## Prompt 05 — Sistema de conquistas

Conquistas de gameplay com condições verificáveis, progresso, notificações e recompensas. A lista de exemplos não é catálogo aprovado; as recompensas devem reutilizar a camada existente e ser idempotentes. Conquistas de jogo e reputação da comunidade ficam separadas. Ver [Fowlgen-Wars-Prompt-05-Conquistas.md](Fowlgen-Wars-Prompt-05-Conquistas.md).
