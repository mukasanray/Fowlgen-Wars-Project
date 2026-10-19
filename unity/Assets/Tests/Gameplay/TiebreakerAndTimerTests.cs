using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using FowlgenWars.Gameplay;

namespace FowlgenWars.Tests.Gameplay
{
    /// <summary>
    /// Validação formal da regra de desempate por tempo (desempate-timer-game-match).
    /// Testa os critérios determinísticos de % de HP de Galinheiro e contagem de tropas vivas.
    /// </summary>
    public class TiebreakerAndTimerTests
    {
        private readonly List<GameObject> spawned = new List<GameObject>();

        [TearDown]
        public void TearDown()
        {
            foreach (var go in spawned)
            {
                if (go != null) UnityEngine.Object.Destroy(go);
            }
            spawned.Clear();
        }

        [Test]
        public void MinionAgent_ActiveMinions_RegistersAndUnregistersProperly()
        {
            int initialCount = MinionAgent.ActiveMinions.Count;

            var go = Track(new GameObject("TestMinion"));
            var agent = go.AddComponent<MinionAgent>();

            Assert.AreEqual(initialCount + 1, MinionAgent.ActiveMinions.Count);

            go.SetActive(false);
            Assert.AreEqual(initialCount, MinionAgent.ActiveMinions.Count);

            go.SetActive(true);
            Assert.AreEqual(initialCount + 1, MinionAgent.ActiveMinions.Count);
        }

        [Test]
        public void MatchRuntimeState_TimerZero_UpdatesProperly()
        {
            var state = ScriptableObject.CreateInstance<MatchRuntimeStateSO>();
            state.Initialize(180f, 1000);

            float lastReported = -1f;
            state.OnTimerUpdated += t => lastReported = t;

            state.UpdateTimer(0f);
            Assert.AreEqual(0f, state.RemainingSeconds);
            Assert.AreEqual(0f, lastReported);

            // Valores negativos devem ser clampados em zero
            state.UpdateTimer(-5f);
            Assert.AreEqual(0f, state.RemainingSeconds);
        }

        [UnityTest]
        public IEnumerator Tiebreaker_PlayerHigherHealthPct_ResultsInVictory()
        {
            var state = ScriptableObject.CreateInstance<MatchRuntimeStateSO>();
            state.Initialize(180f, 1000);

            UnityEngine.TestTools.LogAssert.Expect(LogType.Error, "[GameMatchManager] MatchConfigSO nem BalanceConfig atribuídos!");

            var gmGo = Track(new GameObject("GameMatchManager"));
            var gmm = gmGo.AddComponent<GameMatchManager>();

            var playerBase = CreateBase(Vector3.zero, Team.Player, 1000);
            var enemyBase = CreateBase(Vector3.forward * 10, Team.Enemy, 1000);

            // Player perde 100 de vida (90% restante)
            playerBase.TakeDamage(100);
            // Inimigo perde 500 de vida (50% restante)
            enemyBase.TakeDamage(500);

            SetField(gmm, "playerGalinheiro", playerBase);
            SetField(gmm, "enemyGalinheiro", enemyBase);
            SetField(gmm, "runtimeState", state);
            SetField(gmm, "isMatchActive", true);

            // Inicia rotina de desempate
            MethodInfo endTimeoutMethod = typeof(GameMatchManager).GetMethod("EndMatchByTimeout", BindingFlags.Instance | BindingFlags.NonPublic);
            Assert.IsNotNull(endTimeoutMethod);
            endTimeoutMethod.Invoke(gmm, null);

            // Aguarda 1 frame para o resultado ser aplicado no runtimeState
            yield return null;

            Assert.AreEqual(MatchState.Victory, state.CurrentState);
        }

        [UnityTest]
        public IEnumerator Tiebreaker_EnemyHigherHealthPct_ResultsInDefeat()
        {
            var state = ScriptableObject.CreateInstance<MatchRuntimeStateSO>();
            state.Initialize(180f, 1000);

            UnityEngine.TestTools.LogAssert.Expect(LogType.Error, "[GameMatchManager] MatchConfigSO nem BalanceConfig atribuídos!");

            var gmGo = Track(new GameObject("GameMatchManager"));
            var gmm = gmGo.AddComponent<GameMatchManager>();

            var playerBase = CreateBase(Vector3.zero, Team.Player, 1000);
            var enemyBase = CreateBase(Vector3.forward * 10, Team.Enemy, 1000);

            // Player perde 800 de vida (20% restante)
            playerBase.TakeDamage(800);
            // Inimigo perde 200 de vida (80% restante)
            enemyBase.TakeDamage(200);

            SetField(gmm, "playerGalinheiro", playerBase);
            SetField(gmm, "enemyGalinheiro", enemyBase);
            SetField(gmm, "runtimeState", state);
            SetField(gmm, "isMatchActive", true);

            MethodInfo endTimeoutMethod = typeof(GameMatchManager).GetMethod("EndMatchByTimeout", BindingFlags.Instance | BindingFlags.NonPublic);
            Assert.IsNotNull(endTimeoutMethod);
            endTimeoutMethod.Invoke(gmm, null);

            yield return null;

            Assert.AreEqual(MatchState.Defeat, state.CurrentState);
        }

        private StructureGalinheiro CreateBase(Vector3 position, Team team, int maxHealth)
        {
            var go = Track(new GameObject($"Base_{team}"));
            go.transform.position = position;
            go.AddComponent<BoxCollider>();
            var baseComp = go.AddComponent<StructureGalinheiro>();
            SetField(baseComp, "team", team);
            SetField(baseComp, "maxHealth", maxHealth);
            SetField(baseComp, "currentHealth", maxHealth);
            return baseComp;
        }

        private GameObject Track(GameObject go)
        {
            spawned.Add(go);
            return go;
        }

        private static void SetField(object target, string name, object value)
        {
            FieldInfo field = FindField(target.GetType(), name);
            Assert.IsNotNull(field, $"Campo '{name}' não encontrado em {target.GetType().Name}");
            field.SetValue(target, value);
        }

        private static FieldInfo FindField(Type type, string name)
        {
            const BindingFlags flags = BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic;
            for (Type t = type; t != null; t = t.BaseType)
            {
                FieldInfo field = t.GetField(name, flags);
                if (field != null) return field;
            }
            return null;
        }
    }
}
