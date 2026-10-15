using System.Collections.Generic;
using UnityEngine;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// Fase 1 — Coleta mínima §8.2 + §10 doc balanceamento.
    /// Mede por partida: duração, DPS, dano absorvido, mortes, HP finais, vencedor.
    /// Sem nerf aplicado; só registra para decidir 5–10% com evidência.
    /// ponytail: log em console + PlayerPrefs; upgrade path: CSV/analytics quando Fase 5.
    /// </summary>
    public class BalanceMetricsCollector : MonoBehaviour
    {
        [Header("Runtime")]
        [SerializeField] private MatchRuntimeStateSO runtimeState;
        [SerializeField] private FowlgenBalanceConfigSO balanceConfig;

        private float matchStartTime;
        private bool collecting;
        private readonly Dictionary<string, HeroStats> heroStats = new Dictionary<string, HeroStats>();
        private float timerSnapshot;

        private struct HeroStats
        {
            public int damageDealt;
            public int damageTaken;
            public int heals;
            public int deaths;
            public float timeAlive;
            public float lastSpawnTime;
        }

        private void OnEnable()
        {
            if (runtimeState != null)
                runtimeState.OnStateChanged += HandleStateChanged;
        }

        private void OnDisable()
        {
            if (runtimeState != null)
                runtimeState.OnStateChanged -= HandleStateChanged;
        }

        private void Start()
        {
            BeginCollection();
            HookHeroes();
        }

        private void Update()
        {
            if (!collecting) return;
            if (runtimeState != null) timerSnapshot = runtimeState.RemainingSeconds;
            // tempo vivo acumulado (simples: +dt se vivo)
            float dt = Time.deltaTime;
            var heroes = FindObjectsByType<HeroAgent>(FindObjectsSortMode.None);
            foreach (var h in heroes)
            {
                if (h == null || !heroStats.ContainsKey(h.HeroName)) continue;
                if (h.IsAlive)
                {
                    var s = heroStats[h.HeroName];
                    s.timeAlive += dt;
                    heroStats[h.HeroName] = s;
                }
            }
        }

        private void BeginCollection()
        {
            matchStartTime = Time.time;
            collecting = true;
            heroStats.Clear();
            var heroes = FindObjectsByType<HeroAgent>(FindObjectsSortMode.None);
            foreach (var h in heroes) RegisterHero(h);
        }

        private void HookHeroes()
        {
            var heroes = FindObjectsByType<HeroAgent>(FindObjectsSortMode.None);
            foreach (var h in heroes)
            {
                h.OnHeroDied -= HandleHeroDied;
                h.OnHeroRespawned -= HandleHeroRespawned;
                h.OnHeroDied += HandleHeroDied;
                h.OnHeroRespawned += HandleHeroRespawned;
            }
        }

        private void RegisterHero(HeroAgent h)
        {
            if (h == null) return;
            if (!heroStats.ContainsKey(h.HeroName))
                heroStats[h.HeroName] = new HeroStats { lastSpawnTime = Time.time };
        }

        // Chamado por HeroAgent.TakeDamage/Heal via evento externo ou polling — expomos API pública
        public void RecordDamage(string heroName, int amount)
        {
            if (!heroStats.ContainsKey(heroName)) heroStats[heroName] = new HeroStats();
            var s = heroStats[heroName];
            s.damageTaken += Mathf.Max(0, amount);
            heroStats[heroName] = s;
        }

        public void RecordDamageDealt(string heroName, int amount)
        {
            if (!heroStats.ContainsKey(heroName)) heroStats[heroName] = new HeroStats();
            var s = heroStats[heroName];
            s.damageDealt += Mathf.Max(0, amount);
            heroStats[heroName] = s;
        }

        private void HandleHeroDied(HeroAgent h)
        {
            if (h == null) return;
            if (!heroStats.ContainsKey(h.HeroName)) heroStats[h.HeroName] = new HeroStats();
            var s = heroStats[h.HeroName];
            s.deaths++;
            heroStats[h.HeroName] = s;
        }

        private void HandleHeroRespawned(HeroAgent h)
        {
            if (h == null) return;
            if (!heroStats.ContainsKey(h.HeroName)) heroStats[h.HeroName] = new HeroStats();
            var s = heroStats[h.HeroName];
            s.lastSpawnTime = Time.time;
            heroStats[h.HeroName] = s;
            // re-hook caso novo herói spawnado
            HookHeroes();
        }

        private void HandleStateChanged(MatchState state)
        {
            if (state == MatchState.Playing)
            {
                BeginCollection();
                return;
            }
            if (state == MatchState.Victory || state == MatchState.Defeat)
            {
                collecting = false;
                EmitReport(state);
            }
        }

        private void EmitReport(MatchState finalState)
        {
            float duration = Time.time - matchStartTime;
            // 180s alvo: quanto fechou
            int pHp = runtimeState != null ? runtimeState.PlayerGalinheiroHp : -1;
            int eHp = runtimeState != null ? runtimeState.EnemyGalinheiroHp : -1;

            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            sb.AppendLine($"[BalanceMetrics] Fase1 report — {System.DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            sb.AppendLine($"  finalState={finalState} duration={duration:F1}s timerLeft={timerSnapshot:F1}s  baseHP P:{pHp} E:{eHp}");
            if (balanceConfig != null)
                sb.AppendLine($"  config match={balanceConfig.MatchDurationSeconds}s baseHP={balanceConfig.BaseGalinheiroHealth} wave={balanceConfig.EnemyWaveInterval}s  minion HP{ balanceConfig.Minion.maxHealth}×{balanceConfig.Minion.attackDamage}  Milo {balanceConfig.Milo.maxHealth}×{balanceConfig.Milo.attackDamage}  Axel {balanceConfig.Axel.maxHealth}×{balanceConfig.Axel.attackDamage}");
            foreach (var kv in heroStats)
            {
                float dps = kv.Value.timeAlive > 0.01f ? kv.Value.damageDealt / kv.Value.timeAlive : 0f;
                sb.AppendLine($"  {kv.Key}: dealt={kv.Value.damageDealt} taken={kv.Value.damageTaken} dps={dps:F1} alive={kv.Value.timeAlive:F1}s deaths={kv.Value.deaths}");
            }
            sb.AppendLine("  → regra §10: problema/evidência/alteração/efeito/teste/decisão ainda pendente — não aplicar % sem 10 partidas espelhadas.");

            string report = sb.ToString();
            Debug.Log(report);
            // persiste último relatório para inspeção no Editor
            PlayerPrefs.SetString("Fowlgen_Balance_LastReport", report);
            PlayerPrefs.Save();
        }

        // Para teste espelhado: expõe snapshot JSON mínimo
        public string GetLastReport() => PlayerPrefs.GetString("Fowlgen_Balance_LastReport", "");
    }
}
