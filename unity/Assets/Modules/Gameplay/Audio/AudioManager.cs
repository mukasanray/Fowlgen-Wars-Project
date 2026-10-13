using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;

namespace FowlgenWars.Gameplay.Audio
{
    public enum CombatSoundType
    {
        Punch,
        Whoosh,
        RoosterCrow,
        FeatherFlutter,
        Hit,
        Heal,
        Ultimate,
        Explosion,
        UIClick,
        Victory,
        Defeat
    }

    /// <summary>
    /// Gerenciador central de áudio do Fowlgen Wars (BGM, SFX, UI).
    /// Suporta reprodução de AudioClips reais bem como síntese procedural de efeitos caso clips não estejam vinculados.
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [Header("Audio Mixer (EAP Item 68 - opcional, criado via Window > Audio > Audio Mixer)")]
        [SerializeField] private AudioMixer audioMixer;
        [SerializeField] private string masterVolParam = "MasterVolume";
        [SerializeField] private string bgmVolParam = "BgmVolume";
        [SerializeField] private string sfxVolParam = "SfxVolume";
        [SerializeField] private float duckVolumeDb = -12f;
        [SerializeField] private float duckDuration = 0.35f;

        [Header("Audio Sources")]
        [SerializeField] private AudioSource bgmSource;
        [SerializeField] private AudioSource uiSource;
        [SerializeField] private int sfxPoolSize = 12;

        [Header("Volume Settings")]
        [Range(0f, 1f)] [SerializeField] private float masterVolume = 1f;
        [Range(0f, 1f)] [SerializeField] private float sfxVolume = 0.9f;
        [Range(0f, 1f)] [SerializeField] private float bgmVolume = 0.65f;

        [Header("Audio Clips Opcionais (Asset Store / Custom)")]
        [SerializeField] private AudioClip clipPunch;
        [SerializeField] private AudioClip clipWhoosh;
        [SerializeField] private AudioClip clipRoosterCrow;
        [SerializeField] private AudioClip clipFeatherFlutter;
        [SerializeField] private AudioClip clipHit;
        [SerializeField] private AudioClip clipHeal;
        [SerializeField] private AudioClip clipUltimate;
        [SerializeField] private AudioClip clipExplosion;
        [SerializeField] private AudioClip clipUIClick;
        [SerializeField] private AudioClip clipVictory;
        [SerializeField] private AudioClip clipDefeat;

        private readonly List<AudioSource> sfxPool = new List<AudioSource>();
        private readonly Dictionary<CombatSoundType, AudioClip> proceduralCache = new Dictionary<CombatSoundType, AudioClip>();

        private const string PrefKeyMaster = "FW_Audio_MasterVolume";
        private const string PrefKeyBgm = "FW_Audio_BgmVolume";
        private const string PrefKeySfx = "FW_Audio_SfxVolume";

        public float MasterVolume => masterVolume;
        public float BgmVolume => bgmVolume;
        public float SfxVolume => sfxVolume;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            LoadVolumePreferences();
            InitializeAudioSources();
        }

        private void LoadVolumePreferences()
        {
            masterVolume = PlayerPrefs.GetFloat(PrefKeyMaster, masterVolume);
            bgmVolume = PlayerPrefs.GetFloat(PrefKeyBgm, bgmVolume);
            sfxVolume = PlayerPrefs.GetFloat(PrefKeySfx, sfxVolume);
        }

        public void SetMasterVolume(float vol)
        {
            masterVolume = Mathf.Clamp01(vol);
            PlayerPrefs.SetFloat(PrefKeyMaster, masterVolume);
            PlayerPrefs.Save();
            ApplyVolumes();
        }

        public void SetBgmVolume(float vol)
        {
            bgmVolume = Mathf.Clamp01(vol);
            PlayerPrefs.SetFloat(PrefKeyBgm, bgmVolume);
            PlayerPrefs.Save();
            ApplyVolumes();
        }

        public void SetSfxVolume(float vol)
        {
            sfxVolume = Mathf.Clamp01(vol);
            PlayerPrefs.SetFloat(PrefKeySfx, sfxVolume);
            PlayerPrefs.Save();
            ApplyVolumes();
        }

        private void ApplyVolumes()
        {
            // Mixer path (quando mixer atribuído, usa dB). Fallback: volume direto nos sources.
            if (audioMixer != null)
            {
                float masterDb = masterVolume <= 0.0001f ? -80f : Mathf.Log10(masterVolume) * 20f;
                float bgmDb = bgmVolume <= 0.0001f ? -80f : Mathf.Log10(bgmVolume) * 20f;
                float sfxDb = sfxVolume <= 0.0001f ? -80f : Mathf.Log10(sfxVolume) * 20f;
                audioMixer.SetFloat(masterVolParam, masterDb);
                audioMixer.SetFloat(bgmVolParam, bgmDb);
                audioMixer.SetFloat(sfxVolParam, sfxDb);
            }
            if (bgmSource != null) bgmSource.volume = audioMixer == null ? bgmVolume * masterVolume : 1f;
            if (uiSource != null) uiSource.volume = audioMixer == null ? sfxVolume * masterVolume : 1f;
        }

        /// <summary>EAP Item 68: ducking BGM durante SFX marcante.</summary>
        public void DuckBgm(bool duck)
        {
            if (audioMixer == null || string.IsNullOrEmpty(bgmVolParam)) return;
            StopCoroutine(nameof(DuckRoutine));
            StartCoroutine(DuckRoutine(duck));
        }

        private IEnumerator DuckRoutine(bool duck)
        {
            float target = duck ? duckVolumeDb : (bgmVolume <= 0.0001f ? -80f : Mathf.Log10(bgmVolume) * 20f);
            audioMixer.GetFloat(bgmVolParam, out float cur);
            float t = 0f;
            while (t < duckDuration)
            {
                t += Time.unscaledDeltaTime;
                float v = Mathf.Lerp(cur, target, t / duckDuration);
                audioMixer.SetFloat(bgmVolParam, v);
                yield return null;
            }
            audioMixer.SetFloat(bgmVolParam, target);
        }

        private void InitializeAudioSources()
        {
            if (bgmSource == null)
            {
                bgmSource = gameObject.AddComponent<AudioSource>();
                bgmSource.loop = true;
                bgmSource.playOnAwake = false;
                bgmSource.volume = bgmVolume * masterVolume;
            }

            if (uiSource == null)
            {
                uiSource = gameObject.AddComponent<AudioSource>();
                uiSource.loop = false;
                uiSource.playOnAwake = false;
                uiSource.volume = sfxVolume * masterVolume;
            }

            for (int i = 0; i < sfxPoolSize; i++)
            {
                AudioSource src = gameObject.AddComponent<AudioSource>();
                src.loop = false;
                src.playOnAwake = false;
                src.spatialBlend = 0f; // 2D por padrão para clareza em mobile
                sfxPool.Add(src);
            }
        }

        public void PlayBGM(AudioClip musicClip, float volume = 1f)
        {
            if (bgmSource == null || musicClip == null) return;
            bgmSource.clip = musicClip;
            bgmSource.volume = bgmVolume * masterVolume * volume;
            bgmSource.Play();
        }

        public void StopBGM()
        {
            if (bgmSource != null) bgmSource.Stop();
        }

        public void PlayCombatSound(CombatSoundType type, Vector3? position = null, float volume = 1f)
        {
            AudioClip clip = GetClipForType(type);
            if (clip == null)
            {
                clip = GetOrCreateProceduralClip(type);
            }

            if (clip != null)
            {
                PlayClip(clip, volume, pitch: UnityEngine.Random.Range(0.92f, 1.08f));
            }
        }

        public void PlayClip(AudioClip clip, float volume = 1f, float pitch = 1f)
        {
            if (clip == null) return;

            AudioSource availableSource = GetAvailableSFXSource();
            if (availableSource != null)
            {
                availableSource.pitch = pitch;
                availableSource.volume = sfxVolume * masterVolume * volume;
                availableSource.PlayOneShot(clip);
            }
        }

        public void PlayUIClick()
        {
            PlayCombatSound(CombatSoundType.UIClick, volume: 0.8f);
        }

        private AudioSource GetAvailableSFXSource()
        {
            for (int i = 0; i < sfxPool.Count; i++)
            {
                if (!sfxPool[i].isPlaying) return sfxPool[i];
            }
            return sfxPool.Count > 0 ? sfxPool[0] : null;
        }

        private AudioClip GetClipForType(CombatSoundType type)
        {
            return type switch
            {
                CombatSoundType.Punch => clipPunch,
                CombatSoundType.Whoosh => clipWhoosh,
                CombatSoundType.RoosterCrow => clipRoosterCrow,
                CombatSoundType.FeatherFlutter => clipFeatherFlutter,
                CombatSoundType.Hit => clipHit,
                CombatSoundType.Heal => clipHeal,
                CombatSoundType.Ultimate => clipUltimate,
                CombatSoundType.Explosion => clipExplosion,
                CombatSoundType.UIClick => clipUIClick,
                CombatSoundType.Victory => clipVictory,
                CombatSoundType.Defeat => clipDefeat,
                _ => null
            };
        }

        private AudioClip GetOrCreateProceduralClip(CombatSoundType type)
        {
            if (proceduralCache.TryGetValue(type, out var cached) && cached != null)
            {
                return cached;
            }

            AudioClip generated = GenerateProceduralSound(type);
            if (generated != null)
            {
                proceduralCache[type] = generated;
            }
            return generated;
        }

        private AudioClip GenerateProceduralSound(CombatSoundType type)
        {
            int sampleRate = 44100;
            float duration = type switch
            {
                CombatSoundType.Punch => 0.18f,
                CombatSoundType.Whoosh => 0.35f,
                CombatSoundType.RoosterCrow => 0.65f,
                CombatSoundType.FeatherFlutter => 0.28f,
                CombatSoundType.Hit => 0.12f,
                CombatSoundType.Heal => 0.45f,
                CombatSoundType.Ultimate => 0.85f,
                CombatSoundType.Explosion => 0.60f,
                CombatSoundType.UIClick => 0.06f,
                CombatSoundType.Victory => 1.20f,
                CombatSoundType.Defeat => 1.00f,
                _ => 0.2f
            };

            int samplesCount = Mathf.CeilToInt(sampleRate * duration);
            float[] samples = new float[samplesCount];

            switch (type)
            {
                case CombatSoundType.Punch:
                {
                    // Onda senoidal de impacto grave com decaimento exponencial rápido
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float freq = Mathf.Lerp(160f, 40f, t / duration);
                        float env = Mathf.Exp(-t * 22f);
                        float noise = (UnityEngine.Random.value * 2f - 1f) * 0.2f * Mathf.Exp(-t * 40f);
                        samples[i] = (Mathf.Sin(2f * Mathf.PI * freq * t) * 0.8f + noise) * env;
                    }
                    break;
                }
                case CombatSoundType.Whoosh:
                {
                    // Ruído branco filtrado com curva de velocidade (dash)
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float env = Mathf.Sin((t / duration) * Mathf.PI);
                        float noise = (UnityEngine.Random.value * 2f - 1f);
                        samples[i] = noise * env * 0.45f;
                    }
                    break;
                }
                case CombatSoundType.RoosterCrow:
                {
                    // Frequência harmônica modulada característica de cocoricó estilizado
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float progress = t / duration;
                        float freq = progress < 0.25f ? 420f : (progress < 0.6f ? 740f : Mathf.Lerp(680f, 320f, (progress - 0.6f) / 0.4f));
                        float env = progress < 0.85f ? 0.7f : Mathf.Lerp(0.7f, 0f, (progress - 0.85f) / 0.15f);
                        float wave = Mathf.Sin(2f * Mathf.PI * freq * t) + 0.4f * Mathf.Sin(4f * Mathf.PI * freq * t);
                        samples[i] = wave * env * 0.5f;
                    }
                    break;
                }
                case CombatSoundType.FeatherFlutter:
                {
                    // Suave bater de asas / penas esvoaçando
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float env = Mathf.Exp(-t * 12f);
                        float mod = Mathf.Sin(2f * Mathf.PI * 28f * t);
                        float noise = (UnityEngine.Random.value * 2f - 1f) * mod;
                        samples[i] = noise * env * 0.4f;
                    }
                    break;
                }
                case CombatSoundType.Hit:
                {
                    // Estalo seco de impacto
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float env = Mathf.Exp(-t * 35f);
                        float freq = Mathf.Lerp(380f, 90f, t / duration);
                        samples[i] = Mathf.Sin(2f * Mathf.PI * freq * t) * env * 0.8f;
                    }
                    break;
                }
                case CombatSoundType.Heal:
                {
                    // Arpeggio ascendente brilhante (Campainha mágica)
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float step = Mathf.Floor((t / duration) * 4f);
                        float freq = 523.25f * Mathf.Pow(1.2599f, step); // Dó maior arpeggiado
                        float env = Mathf.Sin((t / duration) * Mathf.PI);
                        samples[i] = Mathf.Sin(2f * Mathf.PI * freq * t) * env * 0.5f;
                    }
                    break;
                }
                case CombatSoundType.Ultimate:
                {
                    // Trovão grave com crescimento contínuo de energia
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float freq = Mathf.Lerp(80f, 240f, t / duration);
                        float env = (t / duration) < 0.7f ? Mathf.Lerp(0.2f, 1f, t / (duration * 0.7f)) : Mathf.Lerp(1f, 0f, (t - duration * 0.7f) / (duration * 0.3f));
                        float noise = (UnityEngine.Random.value * 2f - 1f) * 0.3f;
                        samples[i] = (Mathf.Sin(2f * Mathf.PI * freq * t) + noise) * env * 0.85f;
                    }
                    break;
                }
                case CombatSoundType.Explosion:
                {
                    // Explosão estrondosa com decaimento de ruído
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float env = Mathf.Exp(-t * 6f);
                        float sub = Mathf.Sin(2f * Mathf.PI * 55f * t) * 0.6f;
                        float noise = (UnityEngine.Random.value * 2f - 1f) * 0.7f;
                        samples[i] = (sub + noise) * env * 0.8f;
                    }
                    break;
                }
                case CombatSoundType.UIClick:
                {
                    // Blip metálico suave
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float env = Mathf.Exp(-t * 80f);
                        samples[i] = Mathf.Sin(2f * Mathf.PI * 1200f * t) * env * 0.45f;
                    }
                    break;
                }
                case CombatSoundType.Victory:
                {
                    // Acorde fanfarra triunfante
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float env = Mathf.Clamp01(1f - (t / duration));
                        float chord = Mathf.Sin(2f * Mathf.PI * 523.25f * t) +
                                      Mathf.Sin(2f * Mathf.PI * 659.25f * t) +
                                      Mathf.Sin(2f * Mathf.PI * 783.99f * t);
                        samples[i] = (chord / 3f) * env * 0.75f;
                    }
                    break;
                }
                case CombatSoundType.Defeat:
                {
                    // Acorde menor descendente
                    for (int i = 0; i < samplesCount; i++)
                    {
                        float t = (float)i / sampleRate;
                        float env = Mathf.Clamp01(1f - (t / duration));
                        float chord = Mathf.Sin(2f * Mathf.PI * 440f * t) +
                                      Mathf.Sin(2f * Mathf.PI * 523.25f * t) +
                                      Mathf.Sin(2f * Mathf.PI * 622.25f * t);
                        samples[i] = (chord / 3f) * env * 0.75f;
                    }
                    break;
                }
            }

            AudioClip clip = AudioClip.Create($"Procedural_{type}", samplesCount, 1, sampleRate, false);
            clip.SetData(samples, 0);
            return clip;
        }
    }
}
