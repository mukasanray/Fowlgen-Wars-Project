using System;
using UnityEngine;

namespace FowlgenWars.Modules.MobileControls.Domain.Contracts
{
    public enum JoystickMode
    {
        Fixed,
        Floating,
        Dynamic
    }

    public enum AxisOptions
    {
        Both,
        Horizontal,
        Vertical
    }

    /// <summary>
    /// Contrato universal de joystick para mobile e multiplataforma.
    /// Qualquer entidade consumidora (Herói, Câmera, Veículo) observa este contrato desacoplado.
    /// Suporta múltiplos modos de toque, restrição de eixos (horizontal/vertical) e snapping direcional.
    /// </summary>
    public interface IJoystickInput
    {
        Vector2 InputDirection { get; }
        float Horizontal { get; }
        float Vertical { get; }
        bool IsPressed { get; }
        JoystickMode CurrentMode { get; }
        AxisOptions CurrentAxisOption { get; }
        bool SnapX { get; }
        bool SnapY { get; }

        event Action<Vector2> OnDirectionChanged;

        void SetMode(JoystickMode mode);
        void CycleMode();
        void SetAxisOptions(AxisOptions axisOptions);
        void SetSnapping(bool snapX, bool snapY);
    }
}
