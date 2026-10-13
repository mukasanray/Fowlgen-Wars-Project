using UnityEngine;

namespace FowlgenWars.Gameplay.Optimization
{
    /// <summary>
    /// Fase 9 (Polish & Otimização Mobile):
    /// Garante 60 FPS, orientação Paisagem travada, tela sempre ativa e multi-touch
    /// ativo para uso simultâneo de joystick e botões de habilidade em dispositivos Android e iOS.
    /// </summary>
    public static class MobilePerformanceBootstrap
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void InitializeMobileSettings()
        {
            // 1. Travar taxa de quadros em 60 FPS para jogabilidade fluida de MOBA
            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 0;

            // 2. Travar orientação estritamente na Horizontal (Paisagem com Auto-rotação livre)
            // Permite ajuste automático entre Paisagem Esquerda e Direita (impedindo tela de cabeça para baixo),
            // enquanto bloqueia estritamente qualquer modo vertical (Retrato).
            Screen.orientation = ScreenOrientation.AutoRotation;
            Screen.autorotateToPortrait = false;
            Screen.autorotateToPortraitUpsideDown = false;
            Screen.autorotateToLandscapeLeft = true;
            Screen.autorotateToLandscapeRight = true;

            // 3. Impedir que a tela do celular apague durante as partidas
            Screen.sleepTimeout = SleepTimeout.NeverSleep;

            // 4. Habilitar Multi-Touch para permitir andar com joystick e usar skills simultaneamente
            Input.multiTouchEnabled = true;

            Debug.Log("[MobileBootstrap] 60 FPS, LandscapeLock, NeverSleep e MultiTouch inicializados com sucesso!");
        }
    }
}
