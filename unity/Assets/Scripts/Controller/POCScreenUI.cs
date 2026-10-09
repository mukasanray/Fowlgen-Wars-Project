using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace FowlgenWars.POC
{
    /// <summary>
    /// UI do Fowlgen Wars com fontes grandes, legíveis e cores harmoniosas para smartphones (1080x2340).
    /// </summary>
    public class POCScreenUI : MonoBehaviour
    {
        public const string MenuSceneName = "MainMenu";

        [SerializeField] Canvas canvas;

        readonly List<Text> valueLabels = new List<Text>();
        readonly List<string> logLines = new List<string>();
        Text logText;
        Transform buttonColumn;
        Text toastText;
        Coroutine toastCoroutine;

        public static POCScreenUI EnsureOn(GameObject host)
        {
            POCScreenUI existing = FindAnyObjectByType<POCScreenUI>();
            if (existing != null)
                return existing;

            return host.AddComponent<POCScreenUI>();
        }

        public void Configure(string subtitle, string[] labels, string[] values, params string[] unusedButtonCaptions)
        {
            EnsureCanvas();
            ClearDynamicUI();
            valueLabels.Clear();
            logLines.Clear();

            // Título & Subtítulo Grandes e Legíveis
            CreateText("Title", "FOWLGEN WARS", 52, new Vector2(0, 810), new Vector2(980, 90), TextAnchor.MiddleCenter, Color.white, FontStyle.Bold);
            CreateText("Subtitle", subtitle, 32, new Vector2(0, 730), new Vector2(980, 60), TextAnchor.MiddleCenter, new Color(0.85f, 0.90f, 1.0f, 1f), FontStyle.Bold);

            // Tabela de Dados (Rótulos e Valores Grandes)
            float y = 620;
            int count = Math.Min(labels.Length, values.Length);
            for (int i = 0; i < count; i++)
            {
                CreateText("Label_" + i, labels[i], 30, new Vector2(-280, y), new Vector2(440, 56), TextAnchor.MiddleLeft, new Color(0.90f, 0.90f, 0.95f, 1f), FontStyle.Bold);
                valueLabels.Add(CreateText("Value_" + i, values[i], 28, new Vector2(280, y), new Vector2(440, 56), TextAnchor.MiddleRight, new Color(0.40f, 0.95f, 0.65f, 1f), FontStyle.Bold));
                y -= 76;
            }

            // Coluna de Botões
            buttonColumn = new GameObject("Buttons", typeof(RectTransform)).transform;
            buttonColumn.SetParent(canvas.transform, false);
            var columnRect = buttonColumn.GetComponent<RectTransform>();
            columnRect.anchoredPosition = new Vector2(0, y - 60);
            columnRect.sizeDelta = new Vector2(920, 500);

            // Banner Flutuante de Notificação (Toast)
            toastText = CreateText("Toast", "", 28, new Vector2(0, -650), new Vector2(980, 64), TextAnchor.MiddleCenter, Color.yellow, FontStyle.Bold);
            toastText.gameObject.SetActive(false);

            // Log de Execução Legível
            logText = CreateText("Log", "LOGS DA SESSÃO:\nPronto.", 24, new Vector2(0, -780), new Vector2(980, 220), TextAnchor.UpperLeft, new Color(0.90f, 0.95f, 1.0f, 1f));

            if (SceneManager.GetActiveScene().name != MenuSceneName)
                AddButton("VOLTAR AO MENU", LoadMenu, new Color(0.20f, 0.22f, 0.28f, 1f));
        }

        public void SetRow(int index, string value)
        {
            if (index < 0 || index >= valueLabels.Count)
                return;
            valueLabels[index].text = value;
        }

        public Button AddButton(string caption, UnityAction action, Color? color = null)
        {
            EnsureCanvas();
            if (buttonColumn == null)
                return null;

            int index = buttonColumn.childCount;
            var go = new GameObject("POCButton_" + index, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(buttonColumn, false);

            var rect = go.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(880, 94);
            rect.anchoredPosition = new Vector2(0, -index * 106);

            Color btnColor = color ?? new Color(0.12f, 0.55f, 0.28f, 1f);
            go.GetComponent<Image>().color = btnColor;

            var label = CreateText("Label", caption, 30, Vector2.zero, new Vector2(880, 94), TextAnchor.MiddleCenter, Color.white, FontStyle.Bold);
            label.transform.SetParent(go.transform, false);
            label.GetComponent<RectTransform>().anchoredPosition = Vector2.zero;

            var button = go.GetComponent<Button>();
            button.onClick.AddListener(action);
            return button;
        }

        public void SetAction(UnityAction action)
        {
            if (buttonColumn == null || buttonColumn.childCount == 0)
                return;

            var button = buttonColumn.GetChild(buttonColumn.childCount - 1).GetComponent<Button>();
            if (button == null)
                return;

            button.onClick.RemoveAllListeners();
            button.onClick.AddListener(action);
        }

        public void ShowToast(string message, Color? textColor = null)
        {
            if (toastText == null) return;
            if (toastCoroutine != null) StopCoroutine(toastCoroutine);
            toastCoroutine = StartCoroutine(ToastRoutine(message, textColor ?? Color.yellow));
        }

        private IEnumerator ToastRoutine(string message, Color textColor)
        {
            toastText.text = message;
            toastText.color = textColor;
            toastText.gameObject.SetActive(true);
            yield return new WaitForSeconds(3.5f);
            if (toastText != null)
                toastText.gameObject.SetActive(false);
        }

        public void SetLog(string message)
        {
            logLines.Clear();
            AppendLog(message);
        }

        public void AppendLog(string message)
        {
            string line = DateTime.Now.ToString("HH:mm:ss") + "  " + message;
            logLines.Add(line);
            while (logLines.Count > 7)
                logLines.RemoveAt(0);

            if (logText != null)
                logText.text = "LOGS DA SESSÃO:\n" + string.Join("\n", logLines);

            Debug.Log("[Fowlgen Wars] " + message);
        }

        public static void LoadMenu()
        {
            SceneManager.LoadScene(MenuSceneName);
        }

        public static void LoadPoc(string sceneName)
        {
            SceneManager.LoadScene(sceneName);
        }

        void EnsureCanvas()
        {
            EnsureEventSystem();

            if (canvas != null)
                return;

            var go = new GameObject("Canvas", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            go.transform.SetParent(transform, false);
            canvas = go.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            var scaler = go.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080, 2340);
            scaler.matchWidthOrHeight = 0.5f;

            var bg = new GameObject("Background", typeof(RectTransform), typeof(Image));
            bg.transform.SetParent(go.transform, false);
            var bgRect = bg.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;
            bg.GetComponent<Image>().color = new Color(0.05f, 0.09f, 0.07f, 1f);
            bg.GetComponent<Image>().raycastTarget = false;
        }

        static void EnsureEventSystem()
        {
            if (FindAnyObjectByType<EventSystem>() != null)
                return;

            var go = new GameObject("EventSystem");
            go.AddComponent<EventSystem>();

            Type inputModule = Type.GetType("UnityEngine.InputSystem.UI.InputSystemUIInputModule, Unity.InputSystem");
            if (inputModule != null)
                go.AddComponent(inputModule);
            else
                go.AddComponent<StandaloneInputModule>();
        }

        void ClearDynamicUI()
        {
            if (canvas == null)
                return;

            for (int i = canvas.transform.childCount - 1; i >= 0; i--)
            {
                Transform child = canvas.transform.GetChild(i);
                if (child.name == "Background")
                    continue;
                Destroy(child.gameObject);
            }
        }

        Text CreateText(string objectName, string content, int fontSize, Vector2 position,
            Vector2 size, TextAnchor anchor = TextAnchor.MiddleCenter, Color? color = null, FontStyle fontStyle = FontStyle.Normal)
        {
            var go = new GameObject(objectName, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(canvas.transform, false);

            var rect = go.GetComponent<RectTransform>();
            rect.anchoredPosition = position;
            rect.sizeDelta = size;

            var text = go.GetComponent<Text>();
            text.text = content;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            if (text.font == null)
                text.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            text.fontSize = fontSize;
            text.fontStyle = fontStyle;
            text.alignment = anchor;
            text.color = color ?? Color.white;
            text.horizontalOverflow = HorizontalWrapMode.Wrap;
            text.verticalOverflow = VerticalWrapMode.Overflow;

            return text;
        }
    }
}

