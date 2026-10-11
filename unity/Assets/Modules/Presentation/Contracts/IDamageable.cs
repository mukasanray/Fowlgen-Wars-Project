using UnityEngine;
using FowlgenWars.Gameplay;

namespace FowlgenWars.Architecture.Contracts
{
    public interface IDamageable
    {
        Team UnitTeam { get; }
        Transform TargetTransform { get; }
        bool IsAlive { get; }
        void TakeDamage(int damage);
    }
}
