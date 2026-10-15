# FOWLGEN WARS — CAOS TOTAL

> Conceito de gameplay • Sistema de eventos imprevisíveis • MVP mobile
> Prompt ingerido de direcionamento do PO Samuel. Convertido para Markdown por Junior.

## Objetivo e status

Este documento consolida a proposta **Caos do Galinheiro**: sistema de acontecimentos absurdos, armadilhas ambientais e eventos globais que transformam cada partida de ~3 minutos em história diferente.

**Status: proposta conceitual.** Não é escopo aprovado do MVP canônico nem prova de implementação em Unity/FishNet. Complementa [`🐔 Mini-Moba-MVP.md`](%F0%9F%90%94%20Mini-Moba-MVP.md) e [`Fowlgen-Wars-GDD-MVP.md`](Fowlgen-Wars-GDD-MVP.md), sem substituí-los. Requer validação do PO antes de virar tarefa de código/arte.

> Regra de ouro: caos surpreende, provoca risada e cria oportunidade de reação — não injustiça sem contrajogo.

## Referências e precedência

- [`🐔 Mini-Moba-MVP.md`](%F0%9F%90%94%20Mini-Moba-MVP.md): partida 3 min, 3 rotas, 18 torres, geração contínua, loop sem inventar balanceamento.
- [`Fowlgen-Wars-GDD-MVP.md`](Fowlgen-Wars-GDD-MVP.md): escopo MVP canônico (armadilhas fora do escopo inicial até tarefa explícita).
- [`Fowlgen-Sistema-de-Armadilhas-Personalizadas.md`](Fowlgen-Sistema-de-Armadilhas-Personalizadas.md): armadilhas **colocadas pelo jogador** (4 slots pré-partida). Caos Total são **eventos de arena / sistema** (server-authoritative), não armadilhas de loadout.
- [`Fowlgen-Wars-Sistema-de-Arenas.md`](Fowlgen-Wars-Sistema-de-Arenas.md): arena base única + skins, fair play (sem vantagem competitiva por arena).
- [`Fowlgen-Wars-Telas-Game.md`](Fowlgen-Wars-Telas-Game.md), [`Fowlgen-Wars-Regras-de-Combate-e-Torres.md`](Fowlgen-Wars-Regras-de-Combate-e-Torres.md): UI e combate pendentes.
- [`prompt/Claude.md`](../Claude.md): ordem de leitura e checagem de conflitos.

**Precedência:** se houver conflito entre Caos Total e GDD MVP / Mini-Moba-MVP sobre escopo MVP, prevalece o GDD MVP até decisão explícita do PO. Caos entra como expansão pós-MVP ou feature flag experimental.

## 1. Sistema principal: CAOS DO GALINHEIRO

Campo possui acontecimentos secretos, eventos globais e armadilhas ambientais que surgem durante o combate. Jogador nunca sabe exatamente a próxima surpresa, mas sempre tem **sinal + janela de reação**.

### 4 eventos base (núcleo MVP do caos)

| # | Evento | O que faz | Contrajogo |
|---|--------|-----------|------------|
| 01 | **Buraco do Desafortunado** | Chão abre sob campeão, cai em túnel, lançado por canhão de penas para outra rota | Rachaduras, sombras, tremor sutil antes de abrir |
| 02 | **Mina de Bosta de Galinha** | Mina disfarçada (cocô). `PLOFT!` fumaça marrom + penas, arremessa e interrompe habilidade | Textura suspeita, dá para desviar ou empurrar inimigo para cima |
| 03 | **Laser Apocalíptico** | Alarme `PIU-PIU-PIU… LASER LIBERADO!` Feixe atravessa faixa da arena, força reposicionamento | Zona marcada 0,8–1,5s antes, dá para fugir/bloquear/usar contra adversário |
| 04 | **Lei da Gravidade Foi Demitida** | Bigorna / barril explosivo / chuva de ovos cai do céu | Sinais audiovisuais rápidos + área marcada, recompensa reflexo |

### +10 acontecimentos absurdos (pool pós-MVP)

| # | Evento | Efeito |
|---|--------|--------|
| 05 | **Ímã de Galinheiro** | Ímã gigante puxa armaduras, projéteis metálicos e aliados |
| 06 | **Pista de Ovo Frito** | Gema cobre rota, escorrega, erra ataques, pode lançar contra parede/torre |
| 07 | **Raio da Vergonha** | Transforma em pintinho: minúsculo + veloz, perde ataque temporariamente |
| 08 | **Sequestro Extraterrestre** | Disco voador captura e solta em outro ponto — pode virar escape |
| 09 | **Galinha Inflável do Juízo Final** | Galinha gigante quica atravessando arena, empurra tropas, interrompe |
| 10 | **Furacão de Penas** | Redemoinho percorre rota, levanta campeões, pode servir de transporte |
| 11 | **Clonagem Acidental** | 3 cópias falsas do campeão, adversário precisa achar o verdadeiro |
| 12 | **Ovo Nuclear** | Ovo enorme rola, acelera e explode em obstáculo, atinge qualquer time |
| 13 | **Troca-Troca Dimensional** | Dois campeões próximos trocam de posição |
| 14 | **Deus-Galinha Acordou** | Estátua colossal desperta, persegue área; derrotar dá vantagem temporária |

> Todos afetam os dois times de forma equivalente, salvo regra explícita (ex.: Deus-Galinha com recompensa por abate).

## 2. Como fazer o caos funcionar em 3 minutos

Surpresa divertida + decisão importa. Ritmo proposto (não balanceado, precisa teste):

```
0:00–0:30  Aquecimento      → combate normal, pistas discretas, micro-armadilhas
0:30–1:30  Primeiro caos    → 1 evento de arena + possível armadilha individual
1:30–2:30  Escalada         → eventos mais intensos, combos, viradas
2:30–3:00  Caos final       → evento especial anunciado, alto risco, jogada decisiva
```

## 3. Regras iniciais de balanceamento (ponto de partida, não definitivo)

| Mecânica | Regra proposta MVP |
|----------|-------------------|
| Evento global | 1 evento principal por partida |
| Armadilhas ativas | Limite 2 por área |
| Aviso | 0,8–1,5s para alto impacto |
| Controle incapacitante | Preferencialmente ≤1s |
| Dano extremo | Evitar eliminação instantânea sem contrajogo |
| Repetição | Não repetir mesmo evento em sequência |
| Justiça | Afeta ambos times igual, salvo regra explícita |

Para laser: jogador precisa conseguir escapar/bloquear. Não pode surgir em cima e eliminar sem reação.

## 4. DNA DO CAOS — cada partida diferente

Combinação de 3 eixos sorteada no início (server-authoritative):

- **DNA 1 — Arena:** Pântano escorregadio, Laboratório maluco, Fazenda explosiva, Zona alienígena, Galinheiro vulcânico (skins da arena base única — sem vantagem competitiva).
- **DNA 2 — Evento secreto:** Seleção aleatória do pool respeitando frequência/impacto.
- **DNA 3 — Mutação da partida:** Regra temporária (habilidades com efeito diferente, tropas velozes, gravidade reduzida).

Exemplo: arena alienígena + mina de cocô na perseguição + alarme de laser. Próxima partida: mapa/evento/mutação diferentes.

> **Autoridade:** servidor / lógica autoritativa decide. Nunca RNG por cliente. Evita manipulação e divergência entre clientes.

## 5. Progressão (fora do loop competitivo, cosmética)

Sem vender vantagem. Ideias para validar com PO:

- **Colecionador do Caos:** registra eventos encontrados
- **Sobrevivente do Impossível:** vence após sequência de eventos
- **Mestre da Gambiarra:** elimina inimigo usando armadilha ambiental
- **Replay do Desastre:** reveja momentos absurdos
- **Desafio Diário:** combinação fixa arena + evento
- **Livro das Catástrofes:** variações raras + frases cômicas
- **Título da Vergonha:** título engraçado por cair em armadilha / ser lançado

Recompensas: cosméticos, títulos, emotes, descobertas. Anti-pay-to-win.

## 6. MVP express — começar pequeno

Para não estourar escopo, MVP do caos testa só **3 eventos** (um de cada tipo):

- **Buraco Surpresa** — reposicionamento
- **Mina de Cocô** — dano moderado + empurrão + animação cômica
- **Laser Apocalíptico** — ameaça global sinalizada

Validar: combate segue legível e divertido → expandir pool em updates.

Conexão com armadilhas existentes: armadilhas do jogador (4 slots) continuam separadas; eventos de caos são do sistema. Não misturar cooldowns.

## Decisões pendentes antes de implementar

1. Aprovar se caos entra no MVP ou pós-MVP / feature flag.
2. Definir autoridade FishNet vs Dedicated Server para sorteio e disparo de eventos.
3. Fechar valores: dano, área, duração, cooldown, janela de aviso (0,8–1,5s placeholder).
4. Aprovar lista final de arenas/mutações do DNA (reuso de skins vs novas).
5. Definir telemetria e replay para balancear frequência/impacto.
6. Validar UX de aviso (visual + som + vibração) em mobile landscape.
7. Confirmar que eventos não quebram regra de 18 torres / colisão de rotas.

## Critérios de aceite documental

- [ ] 14 eventos descritos com efeito + contrajogo
- [ ] Timeline 0–3 min e tabela de balanceamento registradas como proposta testável
- [ ] DNA de 3 eixos com exemplo
- [ ] Progressão cosmética sem pay-to-win
- [ ] MVP de 3 eventos isolado e testável
- [ ] Conflito com GDD MVP (armadilhas fora de escopo) preservado e escalado ao PO
- [ ] Links relativos válidos e sem reescrever histórico de 4 rotas vs 3 rotas

## Conflito registrado (Claude.md)

- `Fowlgen-Wars-GDD-MVP.md` § Sistemas fora do escopo inicial lista armadilhas como não-requisito do MVP. Este doc propõe eventos de arena. **Não tratar como aprovado.** Aguardar aceite PO para virar POC/tarefa.
- `Fowlgen-Sistema-de-Armadilhas-Personalizadas.md` já propõe MVP de 4 armadilhas de jogador. Caos propõe MVP de 3 eventos de sistema. São sistemas distintos; se ambos forem para MVP, priorizar um e deixar outro como backlog.
