# 🐔 Prompt 09 — Evolução elemental de Minions

## Status e relação com a especificação vigente

Este é um conceito de expansão para geração, especialização e evolução de Minions. **Não substitui nem altera silenciosamente** a especificação existente em [`Fowlgen-Wars-Minions.md`](Fowlgen-Wars-Minions.md), que exige cadência, atributos, limites e regras ainda pendentes de validação.

O material recebido propõe geração a cada 25 segundos, escolhas elementais, seis elementos, classes especializadas e evolução de atributos. Esses números e mecânicas continuam hipóteses até validação do Product Owner. A recomendação de fazer escolhas aos 25, 75 e 125 segundos também é uma proposta, não uma decisão aprovada.

## Visão do conceito

Galinheiros geram tropas continuamente durante partidas de 180 segundos. Novas gerações recebem perfis visuais e táticos diferentes. Em intervalos definidos, o jogador escolhe uma tendência elemental para influenciar gerações futuras. Unidades antigas continuam até serem removidas pelas regras da partida. O total simultâneo permanece limitado.

## Calendário descrito no prompt

| Faixa de tempo | Proposta recebida |
|---|---|
| 0–25s | Geração 1, tropas básicas |
| 25–50s | Geração 2, primeira evolução |
| 50–75s | Geração 3, especialização inicial |
| 75–100s | Geração 4, evolução elemental |
| 100–125s | Geração 5, especialização avançada |
| 125–150s | Geração 6, evolução de combate |
| 150–175s | Geração 7, alto impacto |
| 175–180s | Encerramento |

O texto também diz “uma nova geração a cada 25 segundos”, o que pode sugerir uma geração adicional em 175s, mas a tabela reserva esse intervalo para encerramento. Para manter a POC pequena, validar explicitamente se os marcos são 0, 25, 50, 75, 100, 125 e 150 segundos, sem geração aos 175 segundos. Não decidir isso por implementação.

## Elementos e identidade proposta

- **Fogo:** pressão ofensiva e dano contínuo; menor resistência.
- **Gelo:** desaceleração/controle; dano direto moderado e controle limitado.
- **Eletricidade:** velocidade, ataques sequenciais e possível interrupção controlada; menor resistência.
- **Terra:** resistência e proteção; menor mobilidade.
- **Veneno:** desgaste gradual; evitar acúmulo ilimitado.
- **Vento:** mobilidade e ataques rápidos; menor resistência e vulnerabilidade a controle.

O prompt cita combinações secundárias entre elementos e classes de minion: básico, ataque, blindado, longo alcance, suporte, explosivo, veloz e elemental. Bônus, fraquezas, efeitos de controle e identidades visuais ainda precisam de desenho e balanceamento aprovados.

## Escolhas do jogador

O conceito propõe apresentar três opções com elemento, bônus, fraqueza e descrição curta. A partida não pausa; a interface não deve bloquear controles nem visão da batalha. Uma escolha padrão temporária deve ser definida caso o jogador não responda. O tempo de decisão sugerido (4–6 segundos) e os intervalos entre escolhas são parâmetros propostos, não validados.

## Arquitetura compatível com o projeto

- **Dados de conteúdo:** `MinionDefinition`, `ElementDefinition` e perfis de evolução como definições configuráveis; evitar duplicar atributos em vários componentes.
- **Estado da partida:** coordenador de partida controla relógio e agenda; `MinionGenerationController` calcula o marco atual e solicita geração sem depender da abertura da UI.
- **Autoridade:** FishNet/servidor autoritativo, se a integração existente for confirmada, decide calendário, seleção aceita, perfil de cada geração, spawn e interações de combate. Clientes apresentam o estado replicado; não definem atributos localmente.
- **Escolha/UI:** `ElementSelectionController` envia intenção de escolha; serviço da partida valida prazo e opção. A UI é uma camada de apresentação sobre estado da partida, sem ser dona da regra de evolução.
- **Spawn/limites:** serviço de spawn aplica limite configurado por lado/equipe e reutiliza pool existente. Política quando o limite é atingido continua a mesma decisão pendente da especificação de Minions.
- **Movimento/combate:** reutilizar rotas, waypoints, colisões, vida e combate existentes. Não criar uma segunda IA nem novas regras de torres; a função mecânica das torres permanece pendente.
- **Fim da partida:** agenda e escolhas param com o estado autoritativo de fim; limpar unidades conforme regra existente, sem deixar timers ativos.
- **Persistência:** escolhas e gerações pertencem à sessão de partida; não persistir poderes de combate entre partidas como progressão permanente sem decisão explícita.
- **Blockchain:** geração, movimento, colisão, dano e escolhas em tempo real ficam off-chain. Não enviar ciclos de minions ou frames para Solana.

```text
Relógio/Estado da Partida (autoridade)
        ├── Agenda de geração ──> Spawn + limite/pool ──> Minions existentes
        ├── Janela de escolha <── UI mobile (intenção)
        └── Estado elemental replicado ──> Clientes/UI/VFX
Minions ──> rotas, IA, combate e estruturas já existentes
```

## Pontos de conflito e decisões necessárias

- A especificação atual pede curva configurável sem fixar intervalos não aprovados; 25 segundos é uma nova proposta que precisa de aprovação.
- A arena vigente documentada tem três rotas e 18 torres. Usar essas rotas; não mudar a topologia.
- A função mecânica das torres continua pendente; não adicionar alvos, dano ou bloqueio de torres.
- Limite simultâneo é obrigatório, mas sua unidade (por Galinheiro, equipe ou partida) e política de fila/substituição precisam ser decididas.
- “Minions antigos continuam em campo” é sujeito ao limite, à duração da partida e às regras existentes de remoção.
- Evolução que aumenta dano/vida por geração pode desequilibrar o combate. Os percentuais do prompt (dano 3–6%, vida 2–4%) são hipóteses, não balanceamento aprovado.
- Efeitos de veneno, congelamento, interrupção, provocação e explosão alteram combate e exigem critérios de contrajogo e limites.
- As cinco rotas/funções mencionadas em outros prompts não devem ser inferidas como distribuição de Minions.

## Escopo recomendado para uma POC, após validação

1. Confirmar com o Product Owner o calendário, número de escolhas, limite de unidades e fallback.
2. Inspecionar cena, rotas, prefabs, sistemas de spawn, movimento, combate, estado da partida e FishNet real.
3. Testar uma unidade base, uma agenda configurável, um limite de unidades e uma escolha elemental sem efeitos complexos.
4. Só então comparar atributos/evoluções com partidas espelhadas e expandir elementos.
5. Validar em partida completa de 180 segundos; testar multiplayer separadamente com clientes reais se a integração estiver disponível.

