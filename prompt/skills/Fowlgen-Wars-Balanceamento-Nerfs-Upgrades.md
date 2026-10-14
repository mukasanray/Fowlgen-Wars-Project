# FOWLGEN WARS — Plano Profissional de Balanceamento, Nerfs e Upgrades

> Documento de Game Design • Balanceamento v1.0 • Base para testes de gameplay e ajustes no Unity
>
> **Status:** proposta documental, não é patch aplicado. Nenhum número abaixo substitui teste em build.
> **Princípio:** nenhum personagem domina todas as situações; cada unidade tem função, pontos fortes, fraquezas e contra-jogo.
> **Dependência:** sem catálogo real + atributos atuais + métricas de partida não há valor exato de nerf/upgrade — atribuir % sem dado é inventar.

---

## 1. Regras Fundamentais

1. **Equilíbrio competitivo** — nível de conta, raridade ou valor pago não dá vantagem direta de combate.
2. **Partidas ≤ 180s** — dano, vida, deslocamento, respawn e destruição de estruturas devem fechar partida no limite.
3. **Contra-jogo sempre** — toda unidade forte tem vulnerabilidade explorável.
4. **IA justa** — bots úteis, sem mira perfeita, sem visão impossível, sem reação instantânea injusta.
5. **Mudanças pequenas e isoladas** — um atributo por vez, medir efeito, decidir manter/ajustar/reverter.

Faixas de teste sugeridas (não ordens): `upgrade 5–8%`, `nerf 5–10%` sobre atributo indicado.

---

## 2. Personagens — Os 5 Papéis

> Ajustes são diretrizes para teste, não ordens para alterar tudo simultaneamente.

| # | Papel | Função | Upgrade se fraco | Nerf se dominante | Limitação | Contra-jogo | Métrica |
|---|-------|--------|------------------|-------------------|-----------|-------------|---------|
| 1 | **Tanque / Colosso — TOP** | Iniciar e absorver dano | +5–10% resistência efetiva se morre antes de cumprir papel | -5–10% dano explosivo se elimina atacante frágil solo | Mobilidade reduzida, vulnerável a CC | Atiradores, kiting, punir deslocamento lento | Tempo sobrevivido, dano absorvido, participação em objetivos |
| 2 | **Suporte / Bastião — ADC** | Proteger e sustentar | +5–8% escudo/cura se ADC morre sem proteção | -5–10% cura/escudo se dupla fica imortal | Baixo dano, depende posicionamento. **Regra:** acompanha ADC, troca de rota com ele | Foco no suporte, flanco | Sobrevivência ADC, dano prevenido, cura efetiva, tempo fora de proteção |
| 3 | **Caçador / Jungle** | Mobilidade e emboscada | +5–8% mobilidade ou dano vs isolado se não cria oportunidade | -5–10% burst se mata ADC sem reação | Pouca resistência, risco ao entrar solo | Visão, agrupar, armadilhas, peel do suporte | Ganks OK, eliminações, mortes, tempo deslocamento |
| 4 | **Mago / Cientista / Assassino — MID** | Controle e dano de habilidade | Melhor consistência ou -recarga leve se habilidades inúteis | +5–10% recarga ou -5–10% dano se controla luta sem resposta | Depende de habilidades, frágil em cooldown | Aproximação, interrupção, dispersar vs AoE | Dano/habilidade, acertos, CC aplicado, picks |
| 5 | **ADC / Atirador** | Dano contínuo à distância | +5–8% DPS se não pressiona mesmo protegido | -5–10% dano por disparo ou ASPD se derrete tanque sem posição | Pouca vida, depende suporte | Assassinos, emboscada, terreno, pressão na dupla | DPS, distância média, sobrevivência, dependência suporte |

**Nota de design — Gália Garra de Ferro (Tanque):** Investida inicia, Grito de Guerra apoia, Tornado de Garras pune proximidade. Não acumular tanque + assassina + bruiser no mesmo kit.

---

## 3. Torres, X-Bestas e Estruturas Defensivas

| Elemento | Upgrades | Nerfs | Regra |
|----------|----------|-------|-------|
| Torre básica | +5–10% alcance ou vida | -5–10% dano ou vida | Não insta-kill tropa nem irrelevante |
| Torre de dano | Consistência de tiro | -dano/tiro ou -cadência | Ameaça quem se expõe |
| Torre defensiva | +proteção objetivo | -proteção acumulada ou -regen | Não estica partida indefinida |
| X-besta | +precisão/alcance/recarga | -dano/alcance/velocidade tiro | Dano alto exige contra-jogo |
| X-besta cerco | +dano vs estrutura | -dano vs campeões | Papel cerco, não substitui ADC |
| Galinheiro / Nexus | Clareza visual, feedback, vida adequada | -regen excessiva ou -proteção abusiva | Destruição possível em 180s |
| Catapulta renascimento | +previsibilidade, retorno à rota | -invulnerabilidade longa ou retorno rápido demais | Sem ataque sem resposta após renascer |

**Regras específicas X-besta**

- Alvo prioritário explícito (campeões / tropas / estruturas).
- Dano alto compensa com recarga, alcance, custo ou vulnerabilidade.
- Sinal visual claro quando mira e quando vai disparar.
- Sem auto-hit fora de visão/alcance.
- Valores espelhados nos dois lados da arena.
- **Ouro:** se uma X-besta defende rota inteira + mata campeões + destrói estruturas com eficiência máxima, acumula funções demais.

---

## 4. Tropas e Unidades Invocadas

| Tipo | Upgrade | Nerf | Fraqueza |
|------|---------|------|----------|
| Infantaria básica | +5% vida ou dano | -5–10% vida/dano | Versátil, sem especialização |
| Tanque | +resistência | -dano ou -velocidade | Sofre vs DPS e CC |
| Distância | +precisão/consistência | -dano ou -alcance | Sofre vs aproximação |
| Veloz | +rota/perseguição | -vida ou -dano explosão | Sofre vs CC e AoE |
| Cerco | +dano vs estrutura | -dano vs campeões | Frágil vs móveis |
| Suporte | +cura/proteção | -frequência/duração | Baixo dano direto |
| Invocação temp. | +utilidade habilidade | -duração ou -quantidade | Depende de recarga |
| Especial | +traço definidor | -efeitos secundários excessivos | Fraqueza explícita obrigatória |

> Força do grupo = quantidade × custo × tempo geração × dano combinado × vida total. Unidade ok solo pode dominar em massa ou com bônus simultâneos.

---

## 5. Bots e IA — Balancear Comportamento Antes de Vida/Dano

| Comportamento | Ajuste |
|---------------|--------|
| Mira/precisão | Tolerância erro, condição real de acerto |
| Reação | Sem esquiva/bloqueio instantâneo |
| Alvo | Prioriza por papel e contexto |
| Perseguição | Não abandonar rota indefinidamente |
| Retirada | Recua em desvantagem, sem fuga permanente |
| Proteção ADC | Suporte mantém prioridade peel |
| Habilidades | Considera alcance, recarga, perigo, oportunidade |
| Armadilhas | Sem saber de oculta sem regra que justifique |
| Rotas | Rotações táticas sem deixar objetivo exposto |
| Dificuldade | Melhorar decisão/coordenação antes de inflar atributos |
| Grupo | Evitar 5 bots com foco perfeito instantâneo |
| Renascimento | Respeita tempo, catapulta, rota, invuln |

---

## 6. Bombas, Armadilhas e Caixas Misteriosas

| Sistema | Upgrade | Nerf | Proteção abuso |
|---------|---------|------|----------------|
| Ovo Bomba | +área ou clareza | -dano ou -raio | Explosão anunciada visual |
| Ovo Congelante | +controle área | -duração | CC curto — não trava partida |
| Raiz Galinheiro | +imobilização | -duração/frequência | Visual + contra-jogo |
| Ovo Elétrico | +consistência | -dano cadeia | Limitar cadeias |
| Armadilhas ocultas | +variedade estratégica | -dano/duração sem resposta | Detecção ou sinal perigo |
| Caixas ? | +diversidade efeitos | -extremos | Regras claras, sem pay-to-win |

> Em partida 180s, CC que tira controle deve ser especialmente curto — não pode negar jogo por fração relevante da partida.

---

## 7. Habilidades — 4 Slots (Ataque, Defesa, Especial, Ultimate)

| Habilidade | Melhorar se | Nerfar se |
|------------|-------------|-----------|
| Ataque básico | Dano insuficiente p/ função | Dano excessivo sem risco |
| Defesa | Não protege vs ameaça prevista | Reduz dano demais ou dura demais |
| Especial | Pouca utilidade / difícil executar | Resolve combate solo |
| Ultimate | Impacto insuficiente p/ rara | Wipe sem janela reação |
| Mobilidade | Não cumpre papel | Foge de tudo sem custo |
| Cura | Equipe não se recupera | Anula dano inimigo contínuo |
| CC | Não cria oportunidade | Nega resposta adversária |

> Recarga por **impacto real**, não por classe. Kit com dano+CC+fuga exige limitação maior que kit de um efeito.

---

## 8. Sistema de Atributos e Métricas

### 8.1 Ficha por Unidade (personagem, torre, tropa, bot)

| Atributo | Registrar |
|----------|-----------|
| Vida | HP inicial e regen |
| Dano | Por acerto e DPS |
| Defesa | Redução dano, resistências |
| Velocidade | Deslocamento, ataque, reação |
| Alcance | Distância efetiva |
| Recarga | Entre usos |
| Custo | Recurso para gerar |
| Duração | Efeitos e invocações |
| IA | Prioridade alvo, perseguição, retirada |
| Resultado | Win rate, mortes, picks, dano |

### 8.2 Critérios de Validação

- Testar solo e em composição.
- Partidas espelhadas (mesmas unidades ambos lados).
- Win rate por personagem e por função — ~50% só com amostra grande + contexto (player skill, mapa, comp).
- Investigar combos com extremos.
- Registrar versão, mudança, motivo, resultado de cada ajuste.
- Uma mudança pequena por vez.
- Sem teste, sem declaração de sucesso.

---

## 9. Ordem de Implementação no Unity

| Fase | Nome | Entrega |
|------|------|---------|
| 1 | Base combate | Vida, dano, vel, alcance, morte, respawn, vitória |
| 2 | Campeões e bots | 5 funções, seleção, IA autônoma, peel ADC |
| 3 | Estruturas e tropas | Torres, X-bestas, Galinheiro, geração tropas, catapulta |
| 4 | Habilidades e especiais | Bombas, armadilhas, caixas ?, efeitos, ultimates |
| 5 | Testes e ajustes | Simulações, partidas reais, métricas, registro nerfs/upgrades |

---

## 10. Regra para Toda Alteração

Cada alteração registra:

1. **Problema** — o que está forte/fraco demais?
2. **Evidência** — em quais partidas/métricas aparece?
3. **Alteração** — qual atributo e quanto (% ou valor)?
4. **Efeito esperado** — o que deve melhorar?
5. **Resultado teste** — resolveu sem criar outro problema?
6. **Decisão** — manter, ajustar de novo ou reverter.

> **Princípio final:** nerfar não é enfraquecer por enfraquecer. Melhorar não é fortalecer indiscriminado. É ajustar cada elemento para que sua função seja relevante, suas fraquezas exploráveis e a vitória dependa de decisões melhores.

---

## 11. Integração com Projeto Atual

- Sem `BalanceConfigSO` + `MetricsCollector` não há ficha por unidade (§8) nem dado para decidir % — qualquer número seria chute.
- Roadmap MVP já prevê Fase 1 → 5 acima; Fase 1 atual já tem `MatchConfigSO`, `MinionDataSO`, `HeroAgent`, `StructureGalinheiro` com HP/dano/intervalo serializados — base para expor ficha.
- Próximo passo técnico (quando autorizado): criar `FowlgenBalanceConfigSO` + `BalanceMetricsCollector` mínimo, esqueleto de ficha, sem aplicar % até ter 10 partidas espelhadas por composição.

---

## Referências

- `Fowlgen-Wars-GDD-MVP.md`, `Mini-Moba-MVP.md`, `Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`, `Fowlgen-Wars-Telas-Game.md`, `Fowlgen-Wars-Regras-de-Combate-e-Torres.md`, `Claude.md`
