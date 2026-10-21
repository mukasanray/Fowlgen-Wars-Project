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

    /// <summary>
    /// Contrato universal de joystick para mobile e multiplataforma.
    /// Qualquer entidade consumidora (Herói, Câmera, Veículo) observa este contrato desacoplado.
    /// </summary>
    public interface IJoystickInput
    {
        Vector2 InputDirection { get; }
        bool IsPressed { get; }
        JoystickMode CurrentMode { get; }
        event Action<Vector2> OnDirectionChanged;
        void SetMode(JoystickMode mode);
        void CycleMode();
    }
}
