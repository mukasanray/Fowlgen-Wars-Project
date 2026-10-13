using System.IO;
using UnityEditor;
using UnityEditor.Animations;
using UnityEngine;

namespace FowlgenWars.EditorScripts
{
    /// <summary>
    /// Fase 8: Utilitário para criar os Animator Controllers de Milo, Axel e Minions
    /// com a máquina de estados (Idle, Move, Attack, Death) e parâmetros padronizados.
    /// </summary>
    public static class CreateMobaAnimatorControllers
    {
        private const string AnimDir = "Assets/Animations";

        [MenuItem("Fowlgen Wars/Gerar Animator Controllers (Fase 8 - Anima\u00e7\u00f5es)")]
        public static void GenerateAllControllers()
        {
            if (!AssetDatabase.IsValidFolder(AnimDir))
            {
                AssetDatabase.CreateFolder("Assets", "Animations");
            }

            var miloCtrl = CreateCharacterController($"{AnimDir}/Milo_AnimatorController.controller");
            var axelCtrl = CreateCharacterController($"{AnimDir}/Axel_AnimatorController.controller");
            var minionCtrl = CreateCharacterController($"{AnimDir}/Minion_AnimatorController.controller");

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            // Vincular Animators na cena ativa se os objetos existirem
            BindAnimatorToSceneHero("Milo", miloCtrl);
            BindAnimatorToSceneHero("Axel", axelCtrl);

            // Vincular Animators nos prefabs de minions
            BindAnimatorToMinionPrefab("Assets/Prefabs/Minion_Caipira_Player.prefab", minionCtrl);
            BindAnimatorToMinionPrefab("Assets/Prefabs/Minion_Rodilan_Enemy.prefab", minionCtrl);

            Debug.Log("[Fase 8] Animator Controllers gerados e vinculados com sucesso para Milo, Axel e Minions!");
        }

        public static AnimatorController CreateCharacterController(string assetPath)
        {
            var existing = AssetDatabase.LoadAssetAtPath<AnimatorController>(assetPath);
            if (existing != null)
            {
                return existing;
            }

            var controller = AnimatorController.CreateAnimatorControllerAtPath(assetPath);

            // 1. Adicionar parâmetros padronizados
            controller.AddParameter("Speed", AnimatorControllerParameterType.Float);
            controller.AddParameter("Attack", AnimatorControllerParameterType.Trigger);
            controller.AddParameter("IsDead", AnimatorControllerParameterType.Bool);

            // 2. Montar State Machine
            var rootStateMachine = controller.layers[0].stateMachine;

            var idleState = rootStateMachine.AddState("Idle");
            var moveState = rootStateMachine.AddState("Move");
            var attackState = rootStateMachine.AddState("Attack");
            var deathState = rootStateMachine.AddState("Death");

            rootStateMachine.defaultState = idleState;

            // Transição Idle -> Move (quando Speed > 0.1)
            var idleToMove = idleState.AddTransition(moveState);
            idleToMove.AddCondition(AnimatorConditionMode.Greater, 0.1f, "Speed");
            idleToMove.hasExitTime = false;
            idleToMove.duration = 0.15f;

            // Transição Move -> Idle (quando Speed < 0.1)
            var moveToIdle = moveState.AddTransition(idleState);
            moveToIdle.AddCondition(AnimatorConditionMode.Less, 0.1f, "Speed");
            moveToIdle.hasExitTime = false;
            moveToIdle.duration = 0.15f;

            // Transição AnyState -> Attack
            var anyToAttack = rootStateMachine.AddAnyStateTransition(attackState);
            anyToAttack.AddCondition(AnimatorConditionMode.If, 0, "Attack");
            anyToAttack.hasExitTime = false;
            anyToAttack.duration = 0.1f;

            // Transição Attack -> Idle (após execução)
            var attackToIdle = attackState.AddTransition(idleState);
            attackToIdle.hasExitTime = true;
            attackToIdle.exitTime = 0.75f;
            attackToIdle.duration = 0.2f;

            // Transição AnyState -> Death (quando IsDead == true)
            var anyToDeath = rootStateMachine.AddAnyStateTransition(deathState);
            anyToDeath.AddCondition(AnimatorConditionMode.If, 0, "IsDead");
            anyToDeath.hasExitTime = false;
            anyToDeath.duration = 0.1f;

            return controller;
        }

        private static void BindAnimatorToSceneHero(string heroName, RuntimeAnimatorController controller)
        {
            var go = GameObject.Find(heroName);
            if (go == null) return;

            var anim = go.GetComponent<Animator>();
            if (anim == null)
            {
                anim = go.AddComponent<Animator>();
            }

            anim.runtimeAnimatorController = controller;
            anim.applyRootMotion = false;
            EditorUtility.SetDirty(go);
        }

        private static void BindAnimatorToMinionPrefab(string prefabPath, RuntimeAnimatorController controller)
        {
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            if (prefab == null) return;

            var anim = prefab.GetComponent<Animator>();
            if (anim == null)
            {
                anim = prefab.AddComponent<Animator>();
            }

            anim.runtimeAnimatorController = controller;
            anim.applyRootMotion = false;
            EditorUtility.SetDirty(prefab);
        }
    }
}
