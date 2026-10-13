using System.Collections.Generic;
using UnityEngine;

namespace FowlgenWars.Gameplay.Feedback
{
    /// <summary>
    /// Gerenciador de Efeitos Visuais (VFX) de Combate do Fowlgen Wars.
    /// Cria e reutiliza sistemas de partículas procedurais otimizados para Mobile (URP).
    /// </summary>
    public class CombatVFXManager : MonoBehaviour
    {
        public static CombatVFXManager Instance { get; private set; }

        private ParticleSystem featherPS;
        private ParticleSystem impactPS;
        private ParticleSystem healPS;
        private ParticleSystem shockwavePS;
        private ParticleSystem explosionPS;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            BuildProceduralParticleSystems();
        }

        private void BuildProceduralParticleSystems()
        {
            featherPS = CreateParticleSystem("VFX_Feathers", isLooping: false, maxParticles: 200);
            impactPS = CreateParticleSystem("VFX_Impact", isLooping: false, maxParticles: 150);
            healPS = CreateParticleSystem("VFX_Heal", isLooping: false, maxParticles: 100);
            shockwavePS = CreateParticleSystem("VFX_Shockwave", isLooping: false, maxParticles: 80);
            explosionPS = CreateParticleSystem("VFX_Explosion", isLooping: false, maxParticles: 250);
        }

        private ParticleSystem CreateParticleSystem(string psName, bool isLooping, int maxParticles)
        {
            GameObject go = new GameObject(psName);
            go.transform.SetParent(transform, false);

            ParticleSystem ps = go.AddComponent<ParticleSystem>();
            var main = ps.main;
            main.playOnAwake = false;
            main.loop = isLooping;
            main.maxParticles = maxParticles;
            main.simulationSpace = ParticleSystemSimulationSpace.World;
            main.scalingMode = ParticleSystemScalingMode.Hierarchy;

            var emission = ps.emission;
            emission.enabled = false;

            ParticleSystemRenderer rend = go.GetComponent<ParticleSystemRenderer>();
            rend.renderMode = ParticleSystemRenderMode.Billboard;

            // Material padrão de partícula URP
            Shader particleShader = Shader.Find("Universal Render Pipeline/Particles/Unlit");
            if (particleShader == null) particleShader = Shader.Find("Mobile/Particles/Additive");
            if (particleShader != null)
            {
                Material mat = new Material(particleShader);
                mat.name = $"{psName}_Mat";
                rend.sharedMaterial = mat;
            }

            return ps;
        }

        /// <summary>
        /// Explosão de penas voando e caindo suavemente (marca registrada de Fowlgen Wars).
        /// </summary>
        public void SpawnFeatherBurst(Vector3 position, int count = 12, Color? featherColor = null)
        {
            if (featherPS == null) return;

            Color col = featherColor ?? new Color(1f, 0.95f, 0.8f, 1f);

            var emitParams = new ParticleSystem.EmitParams
            {
                position = position + Vector3.up * 0.8f,
                startColor = col,
                startLifetime = UnityEngine.Random.Range(1.0f, 1.6f),
                startSize = UnityEngine.Random.Range(0.25f, 0.45f)
            };

            for (int i = 0; i < count; i++)
            {
                Vector3 randomVel = UnityEngine.Random.insideUnitSphere * 3.5f;
                randomVel.y = Mathf.Abs(randomVel.y) * 1.5f + 1.2f; // Impulso para cima
                emitParams.velocity = randomVel;
                emitParams.startLifetime = UnityEngine.Random.Range(0.9f, 1.5f);
                featherPS.Emit(emitParams, 1);
            }
        }

        /// <summary>
        /// Faíscas e clarão de impacto seco em golpe.
        /// </summary>
        public void SpawnHitImpact(Vector3 position, Color? sparkColor = null)
        {
            if (impactPS == null) return;

            Color col = sparkColor ?? new Color(1f, 0.85f, 0.2f, 1f);

            var emitParams = new ParticleSystem.EmitParams
            {
                position = position + Vector3.up * 0.7f,
                startColor = col,
                startSize = 0.35f
            };

            for (int i = 0; i < 8; i++)
            {
                emitParams.velocity = UnityEngine.Random.insideUnitSphere * 4.0f;
                emitParams.startLifetime = UnityEngine.Random.Range(0.15f, 0.30f);
                impactPS.Emit(emitParams, 1);
            }
        }

        /// <summary>
        /// Brilhos ascendentes de cura e buff.
        /// </summary>
        public void SpawnHealAura(Vector3 position)
        {
            if (healPS == null) return;

            var emitParams = new ParticleSystem.EmitParams
            {
                startColor = new Color(0.2f, 0.95f, 0.4f, 0.9f),
                startSize = 0.3f
            };

            for (int i = 0; i < 16; i++)
            {
                Vector2 circle = UnityEngine.Random.insideUnitCircle * 1.2f;
                emitParams.position = position + new Vector3(circle.x, 0.1f, circle.y);
                emitParams.velocity = Vector3.up * UnityEngine.Random.Range(2.0f, 3.5f);
                emitParams.startLifetime = UnityEngine.Random.Range(0.6f, 1.0f);
                healPS.Emit(emitParams, 1);
            }
        }

        /// <summary>
        /// Rastro de vento e poeira ao avançar em disparada (Dash).
        /// </summary>
        public void SpawnDashTrail(Vector3 position, Vector3 direction)
        {
            if (impactPS == null) return;

            var emitParams = new ParticleSystem.EmitParams
            {
                position = position + Vector3.up * 0.3f,
                startColor = new Color(0.9f, 0.95f, 1f, 0.6f),
                startSize = 0.4f,
                velocity = -direction * 2.0f + Vector3.up * 0.5f,
                startLifetime = 0.35f
            };

            for (int i = 0; i < 5; i++)
            {
                impactPS.Emit(emitParams, 1);
            }
        }

        /// <summary>
        /// Onda de choque de Ultimate / Habilidade em Área.
        /// </summary>
        public void SpawnUltimateShockwave(Vector3 position)
        {
            if (shockwavePS == null) return;

            // Anel de partículas expandindo em 360 graus no solo
            int ringPoints = 24;
            for (int i = 0; i < ringPoints; i++)
            {
                float angle = (i / (float)ringPoints) * Mathf.PI * 2f;
                Vector3 dir = new Vector3(Mathf.Cos(angle), 0.1f, Mathf.Sin(angle));

                var emitParams = new ParticleSystem.EmitParams
                {
                    position = position + dir * 0.5f,
                    velocity = dir * 6.0f,
                    startColor = new Color(1f, 0.6f, 0.1f, 0.9f),
                    startSize = 0.5f,
                    startLifetime = 0.45f
                };
                shockwavePS.Emit(emitParams, 1);
            }
        }

        /// <summary>
        /// Explosão violenta com fumaça e faíscas (queda de base ou torre).
        /// </summary>
        public void SpawnExplosion(Vector3 position)
        {
            if (explosionPS == null) return;

            for (int i = 0; i < 35; i++)
            {
                Vector3 vel = UnityEngine.Random.insideUnitSphere * 8.0f;
                vel.y = Mathf.Abs(vel.y) * 1.5f + 2.0f;

                Color c = UnityEngine.Random.value > 0.4f
                    ? new Color(1f, 0.4f, 0.1f, 1f)
                    : new Color(0.2f, 0.2f, 0.2f, 0.8f);

                var emitParams = new ParticleSystem.EmitParams
                {
                    position = position + Vector3.up * 1.5f,
                    velocity = vel,
                    startColor = c,
                    startSize = UnityEngine.Random.Range(0.6f, 1.2f),
                    startLifetime = UnityEngine.Random.Range(0.6f, 1.2f)
                };
                explosionPS.Emit(emitParams, 1);
            }

            // Penas douradas explodindo no galinheiro
            SpawnFeatherBurst(position, count: 40, new Color(1f, 0.85f, 0.3f, 1f));
        }
    }
}
