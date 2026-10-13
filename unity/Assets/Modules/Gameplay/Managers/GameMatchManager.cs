using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace FowlgenWars.Gameplay
{
    /// <summary>
    /// POC-UNI-05: Loop completo de GameMatchManager controlando o estado do jogo (3 minutos),
    /// geração de tropas por rota e transição de Vitória/Derrota.
    /// </summary>
    public class GameMatchManager : MonoBehaviour
    {
        [Header("Configurações (Models)")]
        [SerializeField] private MatchConfigSO matchConfig;
        [SerializeField] private MatchRuntimeStateSO runtimeState;

        [Header("Estruturas (Galinheiros)")]
        [SerializeField] private StructureGalinheiro playerGalinheiro;
        [SerializeField] private StructureGalinheiro enemyGalinheiro;

        [Header("Rotas (Waypoints)")]
        [SerializeField] private WaypointPath topPath;
        [SerializeField] private WaypointPath midPath;
        [SerializeField] private WaypointPath botPath;

        [Header("Spawn Points")]
        [SerializeField] private Transform playerSpawnPoint;
        [SerializeField] private Transform enemySpawnPoint;

        [Header("Prefabs de Minions por Equipe")]
        [SerializeField] private GameObject playerMinionPrefab;
        [SerializeField] private GameObject enemyMinionPrefab;

        private float currentTimer;
        private float nextEnemyWaveTime;
        private bool isMatchActive;

        // Controle de cooldown de spawn por rota para o jogador
        private readonly Dictionary<LaneType, float> playerCooldowns = new Dictionary<LaneType, float>
        {
            { LaneType.Top, 0f },
            { LaneType.Mid, 0f },
            { LaneType.Bot, 0f }
        };

        private void Start()
        {
            Time.timeScale = 1f;
            if (matchConfig == null)
            {
                Debug.LogError("[GameMatchManager] MatchConfigSO não atribuído!");
                return;
            }

            int baseHp = matchConfig.BaseGalinheiroHealth;
            currentTimer = matchConfig.MatchDurationSeconds;
            isMatchActive = true;

            if (runtimeState != null)
            {
                runtimeState.Initialize(currentTimer, baseHp);
            }

            if (playerGalinheiro != null)
            {
                playerGalinheiro.Initialize(baseHp, runtimeState);
                playerGalinheiro.OnStructureDestroyed += HandleStructureDestroyed;
            }

            if (enemyGalinheiro != null)
            {
                enemyGalinheiro.Initialize(baseHp, runtimeState);
                enemyGalinheiro.OnStructureDestroyed += HandleStructureDestroyed;
            }

            nextEnemyWaveTime = Time.time + matchConfig.EnemyWaveInterval;
        }

        private void OnDestroy()
        {
            if (playerGalinheiro != null) playerGalinheiro.OnStructureDestroyed -= HandleStructureDestroyed;
            if (enemyGalinheiro != null) enemyGalinheiro.OnStructureDestroyed -= HandleStructureDestroyed;
        }

        private void Update()
        {
            if (!isMatchActive) return;

            // 1. Atualizar timer regressivo (3 minutos)
            currentTimer -= Time.deltaTime;
            if (runtimeState != null)
            {
                runtimeState.UpdateTimer(currentTimer);
            }

            if (currentTimer <= 0f)
            {
                EndMatchByTimeout();
                return;
            }

            // 2. Geração contínua de ondas automáticas para ambos os lados
            if (Time.time >= nextEnemyWaveTime)
            {
                SpawnEnemyWave();
                SpawnPlayerWave();
                nextEnemyWaveTime = Time.time + matchConfig.EnemyWaveInterval;
            }
        }

        public bool CanSpawnMinion(LaneType lane)
        {
            return Time.time >= playerCooldowns[lane];
        }

        public float GetSpawnCooldownProgress(LaneType lane)
        {
            float readyTime = playerCooldowns[lane];
            if (Time.time >= readyTime) return 0f;

            float totalCd = matchConfig.DefaultMinionData != null ? matchConfig.DefaultMinionData.SpawnCooldown : 3f;
            float remaining = readyTime - Time.time;
            return Mathf.Clamp01(remaining / totalCd);
        }

        public bool RequestPlayerSpawn(LaneType lane)
        {
            if (!isMatchActive || !CanSpawnMinion(lane)) return false;

            MinionDataSO data = matchConfig != null ? matchConfig.DefaultMinionData : null;
            GameObject prefab = playerMinionPrefab != null ? playerMinionPrefab : (data != null ? data.Prefab : null);
            if (prefab == null) return false;

            WaypointPath path = GetPath(lane);
            if (path == null) return false;

            path.HighlightTemporarily(2.5f);

            Vector3 spawnPos = playerSpawnPoint != null ? playerSpawnPoint.position : path.GetPoint(0, Team.Player);
            GameObject unitGo = Instantiate(prefab, spawnPos, Quaternion.identity);
            MinionAgent agent = unitGo.GetComponent<MinionAgent>();
            if (agent == null) agent = unitGo.AddComponent<MinionAgent>();

            agent.Initialize(data, Team.Player, lane, path);

            // Registrar cooldown
            float cd = data != null ? data.SpawnCooldown : 3f;
            playerCooldowns[lane] = Time.time + cd;
            return true;
        }

        private void SpawnEnemyWave()
        {
            MinionDataSO data = matchConfig != null ? matchConfig.DefaultMinionData : null;
            GameObject prefab = enemyMinionPrefab != null ? enemyMinionPrefab : (data != null ? data.Prefab : null);
            if (prefab == null) return;

            // Gera minions nas rotas Top, Mid e Bot para a IA
            LaneType[] lanes = { LaneType.Top, LaneType.Mid, LaneType.Bot };
            foreach (var lane in lanes)
            {
                WaypointPath path = GetPath(lane);
                if (path == null) continue;

                Vector3 spawnPos = path.GetPoint(0, Team.Enemy);
                GameObject unitGo = Instantiate(prefab, spawnPos, Quaternion.identity);
                MinionAgent agent = unitGo.GetComponent<MinionAgent>();
                if (agent == null) agent = unitGo.AddComponent<MinionAgent>();

                agent.Initialize(data, Team.Enemy, lane, path);
            }
        }

        private void SpawnPlayerWave()
        {
            MinionDataSO data = matchConfig != null ? matchConfig.DefaultMinionData : null;
            GameObject prefab = playerMinionPrefab != null ? playerMinionPrefab : (data != null ? data.Prefab : null);
            if (prefab == null) return;

            // Gera minions nas rotas Top, Mid e Bot para o Jogador
            LaneType[] lanes = { LaneType.Top, LaneType.Mid, LaneType.Bot };
            foreach (var lane in lanes)
            {
                WaypointPath path = GetPath(lane);
                if (path == null) continue;

                Vector3 spawnPos = path.GetPoint(0, Team.Player);
                GameObject unitGo = Instantiate(prefab, spawnPos, Quaternion.identity);
                MinionAgent agent = unitGo.GetComponent<MinionAgent>();
                if (agent == null) agent = unitGo.AddComponent<MinionAgent>();

                agent.Initialize(data, Team.Player, lane, path);
            }
        }

        private WaypointPath GetPath(LaneType lane)
        {
            switch (lane)
            {
                case LaneType.Top: return topPath;
                case LaneType.Mid: return midPath;
                case LaneType.Bot: return botPath;
                default: return midPath;
            }
        }

        private void HandleStructureDestroyed(Team destroyedTeam)
        {
            if (!isMatchActive) return;

            if (destroyedTeam == Team.Enemy)
            {
                TriggerMatchEnd(MatchState.Victory);
            }
            else
            {
                TriggerMatchEnd(MatchState.Defeat);
            }
        }

        private void EndMatchByTimeout()
        {
            int playerHp = playerGalinheiro != null ? playerGalinheiro.CurrentHealth : 0;
            int enemyHp = enemyGalinheiro != null ? enemyGalinheiro.CurrentHealth : 0;

            if (playerHp >= enemyHp)
            {
                TriggerMatchEnd(MatchState.Victory);
            }
            else
            {
                TriggerMatchEnd(MatchState.Defeat);
            }
        }

        private void TriggerMatchEnd(MatchState finalState)
        {
            isMatchActive = false;
            if (runtimeState != null)
            {
                runtimeState.SetState(finalState);
            }

            if (finalState == MatchState.Victory)
            {
                SceneManager.LoadScene("Vitoria");
            }
            else
            {
                SceneManager.LoadScene("Derrota");
            }
        }
    }
}
