# Relatório — Verificação e Aplicação Fase 1 do Plano de Balanceamento

**Data:** 2026-10-13  
**Fonte:** `pasted-context-1.txt` (Plano Profissional de Balanceamento, Nerfs e Upgrades v1.0) + `prompt/skills/Fowlgen-Wars-Balanceamento-Nerfs-Upgrades.md`  
**Referência normativa:** `prompt/Claude.md`  
**Escopo deste relatório:** verificar conformidade do plano vs regras do projeto e documentar o que foi aplicado (Fase 1) vs o que ficou em backlog.

---

## 1. Objetivo

Transformar o plano de balanceamento (documento de Game Design) em base testável no Unity sem aplicar números sem evidência e sem violar `Claude.md § Escopo de gameplay` e `§ Não completar lacunas com suposição`.

---

## 2. O que o plano propõe (resumo fiel, sem inventar %)

- **Princípio:** nenhuma unidade domina tudo; cada com função, forte, fraqueza e contra-jogo.
- **Partidas ≤180s** — dano/vida/deslocamento/respawn/destruição galinheiro devem fechar no limite.
- **Faixas de teste:** upgrade 5–8%, nerf 5–10% — isolado, mede, decide. Não aplicar tudo simultâneo.
- **5 papéis:** Tanque TOP, Suporte/ADC, Caçador/Jungle, Mago/MID, ADC Atirador — já mapeados com métricas (tempo sobrevivido, dano absorvido, DPS etc).
- **Estruturas:** torres/X-besta/galinheiro/catapulta com upgrades/nerfs 5–10% e regras (X-besta não faz tudo sozinha).
- **Tropas:** 8 tipos + bots — balancear comportamento antes de vida/dano; mira com erro, reação não instantânea.
- **Habilidades 4 slots:** Ataque/Defesa/Especial/Ultimate — recarga por impacto real.
- **Métricas obrigatórias por mudança:** problema → evidência → alteração (atributo + %) → efeito esperado → resultado teste → decisão manter/ajustar/reverter. Win rate ~50% só com amostra grande + contexto.
- **Ordem Unity:** Fase1 base combate → Fase2 campeões/bots → Fase3 torres/tropas → Fase4 bombas/armadilhas → Fase5 testes/métricas.
- **Estado Fowlgen vs doc:** catálogo real limitado (Milo 1000HP 55dmg 0.9s, Axel 1200HP 40dmg, minion genérico, galinheiro 1000HP, timer 180s, 3 rotas). Sem ficha §8 por unidade, sem métricas coletadas. Doc avisa: sem isso não há % exato.

---

## 3. Verificação vs `Claude.md` — Conforme

| Ponto do plano | `Claude.md` | Veredito |
|---|---|---|
| `Status: proposta, não patch` + `sem catálogo + sem métrica não há % exato` | "Não completar lacunas com suposição nem apresentar planejamento como implementação" | **Conforme** — respeitado |
| `5–10% isolado, mede, decide` | "menor mudança, verifique com teste, não declare sucesso só porque compila" | **Conforme** |
| Estrutura `problema→evidência→alteração→efeito→teste→decisão` | Rastreabilidade exigida | **Conforme** |
| Win rate `~50% com amostra grande + contexto` | Não afirma regra absoluta, preserva conflito | **Conforme** — não foi absolutizado |

---

## 4. Divergências preservadas (não aplicar automático)

1. **Gália — Garra de Ferro (Tanque) nomeada no §2** — `Fowlgen-Personagens-Nome.md` proíbe inferir classe por nome; roster atual é Milo/Axel. Tratada como **exemplo fictício pendente PO**, não canon.
2. **§3 X-besta/torres 6 variações + §6 bombas/armadilhas/caixas + §4 8 tropas** — `Claude.md § Escopo de gameplay`: *"Não implementar cartas, loja, inventário, economia, armadilhas ou sistemas completos de progressão sem tarefa e critério de aceite explícitos."* → **Fase 3–4 do doc é backlog futuro, não MVP hackathon 10/10.**
3. **5 papéis completos vs código real** — só `HeroAgent`, `MinionAgent`, `StructureGalinheiro` existem. Sem ficha §8 por unidade → **não atribuir nerf/upgrade sem métrica.**
4. **Timer 180s e vitória `StructureGalinheiro → GameMatchManager`** — já implementado; Fase1 do doc já existe, não recriar.

---

## 5. Plano de aplicação quebrado em rungs (Claude.md: quebre tarefas grandes)

**Fase 1 — única autorizada agora:**

1. `FowlgenBalanceConfigSO` — expõe `vida/dano/def/vel/alcance/cooldown` de Milo/Axel/minion/galinheiro para tuning 5–10% no Inspector sem código. `ponytail:` sem CSV.
2. `BalanceMetricsCollector` mínimo — loga `win rate, DPS, tempo sobrevivido, dano absorvido` por partida via `MatchRuntimeStateSO`. Sem UI completa.
3. Teste espelhado 10 partidas `Arena_Clean` com `BaseHP 700 vs 1000` para validar fechamento em 180s. Só depois decide manter/ajustar/reverter.

**Fase 2–5 em backlog:** 5 funções completas, X-besta, armadilhas — não codar até PO validar métricas Fase 1 + roster.

---

## 6. O que foi aplicado (Fase 1)

**Criados:**
- `unity/Assets/Modules/Gameplay/Domain/FowlgenBalanceConfigSO.cs` — SO `CreateAssetMenu Fowlgen Wars/Config/Balance Config (Fase1)` com `MatchDurationSeconds 180`, `BaseGalinheiroHealth 1000`, `EnemyWaveInterval 8`, `MinionBalance` e `HeroBalance Milo/Axel` (§8.1).
- `unity/Assets/Modules/Gameplay/Metrics/BalanceMetricsCollector.cs` — coleta `duration, timerLeft, baseHP P/E, damageDealt/taken, DPS, timeAlive, deaths`, log `[BalanceMetrics] Fase1 report` + `PlayerPrefs Fowlgen_Balance_LastReport` em `Victory/Defeat`. `ponytail:` sem CSV/analytics.

**Modificados (com fallback):**
- `unity/Assets/Modules/Gameplay/Domain/MinionDataSO.cs` — campo `balanceOverride` + getters sobrepõem se não null.
- `unity/Assets/Modules/Gameplay/Agents/HeroAgent.cs` — campo `balanceConfig` + `ApplyBalanceConfig()` em `Awake()` escolhe Milo vs Axel por nome/team.
- `unity/Assets/Modules/Gameplay/Managers/GameMatchManager.cs` — campo `balanceConfig`; `Start/HandleCountdownFinished/Update` usam balance se presente senão `MatchConfig`.
- `unity/Assets/Editor/SetupMobaArenaComplete.cs` — cria/carrega `Assets/Resources/Architecture/FowlgenBalanceConfig.asset`, binda em Milo/Axel/Minion/GameMatchManager, garante `BalanceMetricsCollector` em cena via `EnsureBalanceMetrics()`.

**Doc já existente:** `prompt/skills/Fowlgen-Wars-Balanceamento-Nerfs-Upgrades.md` — sem conflito histórico.

**Fora de escopo (skipped):** nerfs/upgrades Fase 3–4, tabela X-besta/armadilhas, 8 tropas diferenciadas. Add quando Fase 1 métricas coletadas.

---

## 7. Critério de aceite Fase 1

- `Arena_Clean` roda.
- `Fowlgen Wars > Configurar MOBA Arena Completa (Todas Etapas)` binda config.
- Partida termina em ≤180s por dano ou timeout.
- Métricas logadas no console em `Victory/Defeat`.
- Build 0 erro.

**Build verificado:**
- `dotnet build FowlgenWars.Modules.Gameplay.csproj` → 0 erro(s) (warnings só `FindObjectsSortMode` obsoleto)
- `dotnet build Assembly-CSharp.csproj` → 0 erro(s)
- `dotnet build Assembly-CSharp-Editor.csproj` → 0 erro(s)
- `assets-refresh ForceUpdate` executado para incluir novos `.cs`.

PlayMode em Editor ainda pendente para validar asset gerado em cena.

---

## 8. Próximo passo

1. Rodar `Configurar MOBA Arena Completa` no Editor.
2. Play `Arena_Clean` — 10 partidas espelhadas (BaseHP 1000 vs 700 se quiser testar fechamento).
3. Inspecionar `PlayerPrefs.GetString("Fowlgen_Balance_LastReport")` + console `[BalanceMetrics]`.
4. Só então aplicar **um** ajuste isolado 5–10% com registro §10: problema/evidência/alteração/efeito/teste/decisão.

Sem esse ciclo, qualquer % é chute — doc mesmo avisa.

---

## 9. Riscos e pendências

- Sem `10 partidas espelhadas` não há decisão válida de nerf/upgrade.
- `Gália` e 5 papéis completos seguem pendentes PO — não viram canon até validação roster.
- Fase 3–4 só com tarefa e critério de aceite explícitos (`Claude.md`).

---

## Referências

- `prompt/skills/Fowlgen-Wars-Balanceamento-Nerfs-Upgrades.md`
- `prompt/Claude.md` §§ Escopo de gameplay, Regras de execução, Divergências
- `prompt/skills/Fowlgen-Personagens-Nome.md`
- `unity/Assets/Modules/Gameplay/Domain/FowlgenBalanceConfigSO.cs`
- `unity/Assets/Modules/Gameplay/Metrics/BalanceMetricsCollector.cs`
- `unity/Assets/Modules/Gameplay/Agents/HeroAgent.cs`
- `unity/Assets/Modules/Gameplay/Managers/GameMatchManager.cs`
- `unity/Assets/Editor/SetupMobaArenaComplete.cs`
