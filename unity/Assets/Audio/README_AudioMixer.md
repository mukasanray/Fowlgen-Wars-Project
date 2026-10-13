# AudioMixer Fowlgen Wars (EAP 68)

Criar: Window > Audio > Audio Mixer > Create > salve como Assets/Audio/FowlgenWarsAudioMixer.mixer
Grupos: Master (exposed MasterVolume), BGM (BgmVolume), SFX (SfxVolume).
Atribua em AudioManager.audioMixer. Ducking via AudioManager.DuckBgm(true/false).
Sem mixer, fallback por volume direto nos AudioSources.
