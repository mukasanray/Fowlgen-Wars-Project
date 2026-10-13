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
    /// Validação da POC-UNI-02 (Colisão, Dano e Vida dos Galinheiros) e da destruição da base
    /// no nível de unidade. Não cobre GameMatchManager (transição de cena), FishNet nem torres.
    /// </summary>
    public class CombatAndBaseDestructionTests
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
        public void Base_TakeDamage_ReducesHealthAndClampsAtZero()
        {
            var baseEnemy = CreateBase(Vector3.zero, Team.Enemy, 1000);

            baseEnemy.TakeDamage(300);
            Assert.AreEqual(700, baseEnemy.CurrentHealth);
            Assert.IsTrue(baseEnemy.IsAlive);

            baseEnemy.TakeDamage(5000);
            Assert.AreEqual(0, baseEnemy.CurrentHealth);
            Assert.IsFalse(baseEnemy.IsAlive);
        }

        [Test]
        public void Base_DestructionEvent_FiresOnceWithTeam_AndIgnoresLaterDamage()
        {
            var baseEnemy = CreateBase(Vector3.zero, Team.Enemy, 1000);
            int calls = 0;
            Team? reported = null;
            baseEnemy.OnStructureDestroyed += team =>
            {
                calls++;
                reported = team;
            };

            baseEnemy.TakeDamage(1000);
            baseEnemy.TakeDamage(1000);

            Assert.AreEqual(1, calls);
            Assert.AreEqual(Team.Enemy, reported);
        }

        [UnityTest]
        public IEnumerator FacingMinions_StopAndTradeDamage_AndDefeatedOneIsDeactivated()
        {
            var data = CreateMinionData(attackDamage: 15, attackInterval: 1.2f);
            var allyPos = Vector3.zero;
            var enemyPos = new Vector3(1.5f, 0f, 0f);
            var ally = CreateMinion(allyPos, Team.Player, data);
            var enemy = CreateMinion(enemyPos, Team.Enemy, data);

            yield return null;
            yield return null;

            Assert.That(ally.transform.position, Is.EqualTo(allyPos).Within(0.01f), "Tropa aliada não deve andar em combate");
            Assert.That(enemy.transform.position, Is.EqualTo(enemyPos).Within(0.01f), "Tropa inimiga não deve andar em combate");

            float elapsed = 0f;
            while (ally.IsAlive && enemy.IsAlive && elapsed < 30f)
            {
                yield return null;
                elapsed += Time.deltaTime;
            }

            Assert.IsFalse(ally.IsAlive && enemy.IsAlive, "Nenhuma tropa foi derrotada em 30 s");

            foreach (var agent in new[] { ally, enemy })
            {
                if (!agent.IsAlive)
                {
                    Assert.IsFalse(agent.gameObject.activeSelf, "Tropa derrotada deve ser desativada");
                }
                else
                {
                    Assert.Less(GetHealth(agent), GetMaxHealth(data), "Tropa sobrevivente deve ter recebido dano");
                }
            }
        }

        [UnityTest]
        public IEnumerator PlayerMinion_DestroysEnemyBase_AndBaseReportsEnemyTeam()
        {
            var data = CreateMinionData(attackDamage: 400, attackInterval: 0.1f);
            var enemyBase = CreateBase(Vector3.zero, Team.Enemy, 1000);
            CreateMinion(new Vector3(1.0f, 0f, 0f), Team.Player, data);

            Team? destroyed = null;
            enemyBase.OnStructureDestroyed += team => destroyed = team;

            float elapsed = 0f;
            while (enemyBase.IsAlive && elapsed < 15f)
            {
                yield return null;
                elapsed += Time.deltaTime;
            }

            Assert.IsFalse(enemyBase.IsAlive, "A base inimiga deveria ser destruída por uma tropa aliada");
            Assert.AreEqual(0, enemyBase.CurrentHealth);
            Assert.AreEqual(Team.Enemy, destroyed);
        }

        private StructureGalinheiro CreateBase(Vector3 position, Team team, int hp)
        {
            var go = Track(new GameObject($"Base_{team}"));
            go.transform.position = position;
            go.AddComponent<BoxCollider>().size = new Vector3(2f, 2f, 2f);
            var structure = go.AddComponent<StructureGalinheiro>();
            SetField(structure, "team", team);
            structure.Initialize(hp, null);
            return structure;
        }

        private MinionAgent CreateMinion(Vector3 position, Team team, MinionDataSO data)
        {
            var go = Track(new GameObject($"Minion_{team}"));
            go.transform.position = position;
            go.AddComponent<SphereCollider>().radius = 0.5f;
            var agent = go.AddComponent<MinionAgent>();
            agent.Initialize(data, team, LaneType.Mid, null);
            return agent;
        }

        private static MinionDataSO CreateMinionData(int attackDamage, float attackInterval)
        {
            var data = ScriptableObject.CreateInstance<MinionDataSO>();
            SetField(data, "maxHealth", 120);
            SetField(data, "attackDamage", attackDamage);
            SetField(data, "attackInterval", attackInterval);
            SetField(data, "attackRange", 1.8f);
            SetField(data, "moveSpeed", 0f);
            return data;
        }

        private static int GetHealth(MinionAgent agent) => (int)GetField(agent, "currentHealth");

        private static int GetMaxHealth(MinionDataSO data) => (int)GetField(data, "maxHealth");

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

        private static object GetField(object target, string name)
        {
            FieldInfo field = FindField(target.GetType(), name);
            Assert.IsNotNull(field, $"Campo '{name}' não encontrado em {target.GetType().Name}");
            return field.GetValue(target);
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
