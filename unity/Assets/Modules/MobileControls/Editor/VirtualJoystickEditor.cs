#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using FowlgenWars.Modules.MobileControls.Presentation.Views;

namespace FowlgenWars.Modules.MobileControls.Editor
{
    [CustomEditor(typeof(VirtualJoystickView))]
    public class VirtualJoystickEditor : UnityEditor.Editor
    {
        private SerializedProperty joystickMode;
        private SerializedProperty moveThreshold;
        private SerializedProperty axisOptions;
        private SerializedProperty snapX;
        private SerializedProperty snapY;
        private SerializedProperty background;
        private SerializedProperty handle;
        private SerializedProperty handleRange;
        private SerializedProperty relativeHandleRange;
        private SerializedProperty deadZone;

        private static readonly Vector2 CenterPivot = new Vector2(0.5f, 0.5f);

        private void OnEnable()
        {
            joystickMode = serializedObject.FindProperty("joystickMode");
            moveThreshold = serializedObject.FindProperty("moveThreshold");
            axisOptions = serializedObject.FindProperty("axisOptions");
            snapX = serializedObject.FindProperty("snapX");
            snapY = serializedObject.FindProperty("snapY");
            background = serializedObject.FindProperty("background");
            handle = serializedObject.FindProperty("handle");
            handleRange = serializedObject.FindProperty("handleRange");
            relativeHandleRange = serializedObject.FindProperty("relativeHandleRange");
            deadZone = serializedObject.FindProperty("deadZone");
        }

        public override void OnInspectorGUI()
        {
            serializedObject.Update();

            EditorGUILayout.LabelField("Configurações do Joystick Touch", EditorStyles.boldLabel);
            EditorGUILayout.Space(4);

            // Seção 1: Modo de Operação
            EditorGUILayout.LabelField("1. Modo de Operação", EditorStyles.boldLabel);
            EditorGUILayout.PropertyField(joystickMode, new GUIContent("Modo de Toque", "Fixed (fixo), Floating (aparece no toque) ou Dynamic (acompanha o arrasto além do limiar)."));
            if (joystickMode.enumValueIndex == 2) // Dynamic
            {
                EditorGUILayout.PropertyField(moveThreshold, new GUIContent("Move Threshold", "Distância a partir da qual o fundo do joystick começa a se mover seguindo o dedo."));
            }

            EditorGUILayout.Space(6);

            // Seção 2: Eixos e Snapping
            EditorGUILayout.LabelField("2. Eixos & Snapping", EditorStyles.boldLabel);
            EditorGUILayout.PropertyField(axisOptions, new GUIContent("Restrição de Eixos", "Both (bidirecional livre), Horizontal (apenas X) ou Vertical (apenas Y)."));
            EditorGUILayout.PropertyField(snapX, new GUIContent("Snap Horizontal (X)", "Discretiza a entrada do eixo horizontal em valores inteiros (-1, 0, 1)."));
            EditorGUILayout.PropertyField(snapY, new GUIContent("Snap Vertical (Y)", "Discretiza a entrada do eixo vertical em valores inteiros (-1, 0, 1)."));

            EditorGUILayout.Space(6);

            // Seção 3: Dimensões e UI
            EditorGUILayout.LabelField("3. Transformações e Sensibilidade", EditorStyles.boldLabel);
            EditorGUILayout.PropertyField(background, new GUIContent("Background Rect", "RectTransform da base do joystick."));
            EditorGUILayout.PropertyField(handle, new GUIContent("Handle Rect", "RectTransform da manopla/alavanca móvel."));
            EditorGUILayout.PropertyField(relativeHandleRange, new GUIContent("Alcance Relativo (%)", "Se marcado, o Handle Range é proporcional ao raio da base (ex: 1.0 = 100%). Se falso, é em pixels."));
            EditorGUILayout.PropertyField(handleRange, new GUIContent(relativeHandleRange.boolValue ? "Fator de Alcance (0.5 a 1.5)" : "Alcance em Pixels", "Distância máxima que a manopla se afasta do centro da base."));
            EditorGUILayout.PropertyField(deadZone, new GUIContent("Zona Morta (DeadZone)", "Magnitude mínima antes de registrar input analógico."));

            EditorGUILayout.Space(8);

            if (GUILayout.Button("Configurar Âncoras e Pivots Automaticamente", GUILayout.Height(26)))
            {
                if (target is VirtualJoystickView joystickView)
                {
                    joystickView.ConfigureAnchors();
                    EditorUtility.SetDirty(joystickView);
                }
            }

            serializedObject.ApplyModifiedProperties();

            // Auto-correção passiva de âncoras no editor
            if (handle != null && handle.objectReferenceValue != null)
            {
                RectTransform handleRect = (RectTransform)handle.objectReferenceValue;
                if (handleRect.anchorMax != CenterPivot || handleRect.anchorMin != CenterPivot || handleRect.pivot != CenterPivot)
                {
                    handleRect.anchorMax = CenterPivot;
                    handleRect.anchorMin = CenterPivot;
                    handleRect.pivot = CenterPivot;
                }
            }

            if (background != null && background.objectReferenceValue != null)
            {
                RectTransform backgroundRect = (RectTransform)background.objectReferenceValue;
                if (backgroundRect.pivot != CenterPivot)
                {
                    backgroundRect.pivot = CenterPivot;
                }
            }
        }
    }
}
#endif
