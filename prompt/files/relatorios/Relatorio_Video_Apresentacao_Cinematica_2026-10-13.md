# Relatório — Vídeo de Apresentação com Animação de Câmera Cinemática

**Data:** 2026-10-13  
**Projeto:** Fowlgen Wars — G5B Studios  
**Escopo:** Telas Login/Play/Arena_Clean + BGM `music-fowlGenwars_001.ogg` + Sistema Cinemático de Pitch  
**Responsável técnico:** Marcos / Audio Jorge / Antigravity Pair Dev  
**Refs:** `ArenaCinematicDirector.cs`, `SetupMobaArenaComplete.cs`, `ArenaCinematicMenu.cs`, `AudioManager.cs`, `AuthController.cs`, `PlayController.cs`, `ArenaController.cs`

---

## 1. OBJETIVO

Responder: podemos gravar vídeo de apresentação com animação de câmera? Qual tela inicia animação? Já configurado?

---

## 2. DEPENDÊNCIAS

- Cena canônica: `unity/Assets/Scenes/Game/Arena_Clean.unity` — única cena com gameplay + cinemática.
- Telas Login=`Auth.unity` e Play=`Play.unity` — sem cinemática, apenas BGM persistente.
- `Assets/Audio/music-fowlGenwars_001.ogg` (1.4 MB) + cópia `Assets/Resources/Audio/music-fowlGenwars_001.ogg` para `Resources.Load`.
- `AudioManager` singleton `DontDestroyOnLoad` com `EnsureBgmPlaying()`.
- FishNet/Audio/MatchManagers não bloqueiam câmera.

---

## 3. IMPLEMENTAÇÃO — ESTADO ATUAL VERIFICADO EM DISCO

### 3.1 Sistema Cinemático

| Item | Valor verificado |
|---|---|
| Script | `unity/Assets/Modules/Core/Cinematics/ArenaCinematicDirector.cs` (726 linhas) |
| Menu Editor | `unity/Assets/Editor/ArenaCinematicMenu.cs` → `Fowlgen/Cinematic/Add Director To Open Scene` |
| Auto-setup | `unity/Assets/Editor/SetupMobaArenaComplete.cs` §11 cria `ArenaCinematicDirector` em `Arena_Clean` + `BuildDefaultArenaShots()` |
| Presença na cena | `Arena_Clean.unity` contém `GameObject ArenaCinematicDirector` (linha 1951), `_targetCamera: {fileID: 1765627252}` = MainCamera |
| Shots | 7 shots via `BuildDefaultArenaShots()` |
| Duração total | ~50s + fades 0.6s cada |
| Overlay | letterbox 2.35:1 + lower-third titles + fade crossfade |
| Captura | `ScreenCapture.CaptureScreenshot` em `LateUpdate`, pasta `Recordings/YYYYMMDD_HHMMSS/frame_%05d.png` |

### 3.2 Sequência de 7 Shots (coordenadas mundo Arena_Clean)

| # | Nome | Tipo | Duração | Descrição |
|---|---|---|---|---|
| 01 | Órbita Revelação (debaixo → cima) | Orbit | 10s | raio 40, altura -16→20, ângulo 30°→280° ao redor centro (0,0,0), FOV 55→50, fadeIn/Out |
| 02 | Descida ao Rio | Dolly | 6s | (0,22,-30)→(1.5,3.5,-18), look (0,1,-8)→(0,1,0), FOV 50→62 |
| 03 | Passagem Ponte Superior | Dolly | 5s | (4,8,-18)→(-3,4.5,-4), look TopBridge (-0.5,0.4,-9), FOV 62→55 |
| 04 | Base Vermelha (estátua galo) | Orbit | 8s | centro (13.3,4,-1.3), raio 8, ângulo 200→340°, altura 4→7, title "Base Vermelha" |
| 05 | Base Azul (travessia) | Dolly | 7s | (8,6,0)→(-11,6,-1), look (0,2,0)→(-13.3,4,-1.3), title "Base Azul" |
| 06 | Torreta low-angle push | Dolly | 5s | (3.5,2.5,-14)→(6.2,0.8,-11), look torreta (7.5,3.5,-9.5), FOV 68→50 |
| 07 | Fowlgen Wars crane overview | Dolly | 9s | (6,2,-9)→(0,42,34) gameplay pose, look (0,0,0)→(0,0,-1), FOV 50→42, title "Fowlgen Wars" |

Câmera gameplay preservada: `MobaCameraController` pos (-22,28.5,-1.5) pitch 40.8 yaw 88.2. Director restaura `_originalPosition/Rotation/Fov` em `Stop()`.

### 3.3 Flags Atuais em Arena_Clean.unity

```
_playOnStart: 0
_loop: 0
_fadeDuration: 0.6
_showLetterbox: 1
_showTitles: 1
_captureFrames: 0
_captureFps: 30
```

→ Não inicia sozinho. Requer input `C` em Play Mode. Sem loop. Sem captura até habilitar.

### 3.4 Controles Runtime

- `C` — Play/Restart sequência
- `Esc` — Stop + restaura câmera original
- `Space` — Pause/Resume
- `H` — Hide/Show overlay (letterbox + titles + fade)
- `OnSequenceFinished` event — pode encadear início de partida.

### 3.5 Áudio — BGM Persistente nas 3 Telas

- `AudioManager` modificado: `defaultBgm` + `defaultBgmResourcePath="Audio/music-fowlGenwars_001"` + `ResolveDefaultBgm()` + `Start()` auto-play + `EnsureBgmPlaying()` (checa `isPlaying && clip == target` para não restart).
- `AuthController`, `PlayController`, `ArenaController` chamam `EnsureFowlgenBgm()` em `Awake` + `Start` → cria `AudioManager` se ausente, garante BGM contínua entre Login→Play→Arena_Clean.
- `DontDestroyOnLoad` → troca de cena sem gap. Respeita `PlayerPrefs` Master/BGM/SFX e `AudioMixer` se atribuído.

---

## 4. ARQUIVOS

```
unity/Assets/Modules/Core/Cinematics/ArenaCinematicDirector.cs
unity/Assets/Editor/ArenaCinematicMenu.cs
unity/Assets/Editor/SetupMobaArenaComplete.cs
unity/Assets/Modules/Gameplay/Audio/AudioManager.cs
unity/Assets/Modules/Presentation/Controllers/AuthController.cs
unity/Assets/Modules/Presentation/Controllers/PlayController.cs
unity/Assets/Modules/Presentation/Controllers/ArenaController.cs
unity/Assets/Audio/music-fowlGenwars_001.ogg
unity/Assets/Resources/Audio/music-fowlGenwars_001.ogg
unity/Assets/Scenes/Game/Arena_Clean.unity  (contém ArenaCinematicDirector)
unity/Assets/Scenes/Game/Auth.unity
unity/Assets/Scenes/Game/Play.unity
```

---

## 5. TESTE

- Leitura direta `Arena_Clean.unity` confirma director presente, shots serializados, flags acima.
- `grep` captura: `ScreenCapture.CaptureScreenshot` OK, `Time.captureFramerate = _captureFps` OK.
- `Recordings/` pasta não existe ainda em disco (0 frames) — esperado, `captureFrames` off.
- Build Unity / Play Mode não executado neste ambiente headless. Validação Editor necessária.
- BGM: `ls Resources/Audio` 1.4MB OK, `AudioManager` compila sem erro sintático verificado.

Não verificado: frame drop em mobile, áudio muxado no vídeo, letterbox em 16:9 vs 19.5:9, yank pitch hackathon 3min.

---

## 6. RESULTADO ESPERADO

- Abrir `Arena_Clean` em Editor, pressionar `C` → câmera voa 50s pelos 7 shots sem travar gameplay.
- Habilitando `captureFrames`, pasta `Recordings/<timestamp>/` enche de PNGs sequenciais.
- BGM toca contínua desde Login, sem restart ao entrar Arena_Clean.
- Vídeo final montado via ffmpeg pronto para pitch ≤3min.

---

## 7. PROCEDIMENTO GRAVAÇÃO — PASSO NORMAL

> Sequência multi-step: siga ordem exata. Falha em etapa invalida captura.

1. Unity Editor → Open `Assets/Scenes/Game/Arena_Clean.unity`
2. Hierarchy → selecione `ArenaCinematicDirector` → Inspector:
   - Confirme `Target Camera` = MainCamera
   - Habilite `Capture Frames` = true, `Capture Fps` = 30
   - Opcional: habilite `Play On Start` para gravação sem pressionar C
   - Mantenha `Show Letterbox` e `Show Titles` = true para trailer épico
3. Pressione `Play`
4. Se `Play On Start` off, pressione `C` (teclado Input System ou Legacy)
5. Aguarde ~50s até log `[ArenaCinematicDirector] Sequência concluída.` (overlay some, câmera restaura se não loop)
6. Pressione `Esc` se precisar interromper/restaurar.
7. Saia de Play Mode → verifique pasta `Recordings/YYYYMMDD_HHMMSS/` na raiz projeto (ao lado de `Assets`)
8. Monte vídeo:
```bash
ffmpeg -framerate 30 -start_number 0 -i "Recordings/YYYYMMDD_HHMMSS/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart fowlgen_wars_trailer.mp4
```
9. Para pitch 40s (requisito 40s showcase nos 180s totais): edite `BuildDefaultArenaShots()` durations ou corte shots 05-06, mantenha 01+07 como vitrine.
10. Áudio: `CaptureScreenshot` não captura áudio. Grave BGM separado via OBS ou mux depois:
```bash
ffmpeg -i fowlgen_wars_trailer.mp4 -i "Assets/Audio/music-fowlGenwars_001.ogg" -c:v copy -c:a aac -shortest fowlgen_wars_trailer_com_audio.mp4
```

---

## 8. LIMITAÇÕES E PENDÊNCIAS

- `captureFrames` off por padrão — precisa habilitar manual antes de gravar.
- Sem `Unity Recorder` package — sem encode áudio automático, sem 4K HDR, sem timeline sync.
- BGM não ducking durante shots — `DuckBgm()` existe mas não chamado pela sequência.
- Letterbox só aplica quando `currentAspect < 2.35` — em ultrawide pode não aparecer.
- Não testado em device Android — `ScreenCapture` custo alto, risco frame drop.

---

## 9. PRÓXIMO PASSO

1. Validar gravação real em Editor (habilitar capture, rodar sequência, conferir PNGs + ffmpeg).
2. Decidir com PO se trailer usa 50s completo ou corte 40s (shots 01+02+07) para caber nos 180s.
3. Atribuir `music-fowlGenwars_001.ogg` direto no campo `defaultBgm` do `AudioManager` na cena para evitar `Resources.Load` runtime.
4. Opcional: adicionar `Unity Recorder` quando precisar áudio muxado automático + 4K.

→ skipped: Recorder package + timeline blend automático, add quando precisar 4K sem ffmpeg manual. `ponytail:` crossfade BGM entre cenas não integrado à cinemática.
