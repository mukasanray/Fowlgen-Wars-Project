# Especificação: Combate, Dano e Estruturas do Mini-MOBA

## Contexto
O combate do Mini-MOBA de Fowlgen Wars ocorre na cena `BattleArena.unity` em partidas com duração máxima de 3 minutos (180 segundos).

## Especificação Técnica
1. **Unidades de Combate:**
   - Herói Jogador (Milo) vs Bot Inimigo (Axel com raio de perseguição de 18m).
   - Tropas geradas periodicamente nas cabeceiras das 3 pontes/rotas.
2. **Ciclo de Combate:**
   - Detecção de tropas adversárias por overlap de hitbox física.
   - Troca periódica de dano parametrizada por `MinionDataSO`.
   - Derrota ao atingir 0 HP com animação de queda e emissão de penas via `CombatVFXManager`.
3. **Destruição de Estruturas:**
   - Galinheiros possuem 1000 HP com barras de vida sobre a malha.
   - Queda de estrutura dispara o evento único `OnStructureDestroyed`.
4. **Condição de Vitória:**
   - Vitória imediata ao reduzir o Galinheiro inimigo a 0 HP.
   - Encerramento pelo cronômetro de 3 minutos com desempate avaliado pelo `GameMatchManager`.
