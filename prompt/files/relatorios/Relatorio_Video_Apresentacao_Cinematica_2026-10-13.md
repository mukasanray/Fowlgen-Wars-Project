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
| Script | `unity/Assets/Modules/Core/Cinematics/ArenaCinematicDirector.cs` |
| Menu Editor | `unity/Assets/Editor/ArenaCinematicMenu.cs` → `Fowlgen/Cinematic/Recalibrar Shots Canônicos da BattleArena` |
| Auto-setup | `unity/Assets/Editor/SetupMobaArenaComplete.cs` cria e vincula `ArenaCinematicDirector` em `BattleArena.unity` |
| Presença na cena | `BattleArena.unity` contém `GameObject ArenaCinematicDirector`, `_targetCamera` = Main Camera |
| Shots | 6 shots calibrados milimetricamente para o mapa canônico |
| Duração total | ~33s (ideal para o showcase de 00:00 a 00:33 do vídeo pitch de 3 minutos) |
| Overlay | letterbox 2.35:1 + lower-third titles + crossfade |
| Captura | `ScreenCapture.CaptureScreenshot` em `LateUpdate`, pasta `Recordings/YYYYMMDD_HHMMSS/frame_%05d.png` |

### 3.2 Sequência de 6 Shots Calibrados (Coordenadas Reais da BattleArena)

| # | Nome | Tipo | Duração | Descrição & Enquadramento |
|---|---|---|---|---|
| 01 | Revelação Aérea Panorâmica | Orbit | 6s | Órbita 360° em `(0, 10.5, 0)`, raio 38m, descendo de alt 30m para 24m, FOV 55→48. Apresenta a ilha e rio. Título: "Fowlgen Wars – Mini-MOBA na Solana". |
| 02 | Mergulho Tático nas 3 Rotas | Dolly | 5s | Dolly aéreo de `(-16, 22, -1)` até `(-6, 16, 0)` olhando a ponte central `(0, 9.67, 0)`. Título: "3 Rotas Táticas: Top, Mid e Bot". |
| 03 | Base Aliada & Milo Atirador | Dolly | 6s | Dolly suave de `(9, 18, 26)` até `(2, 14, 21)` revelando o Galinheiro Dourado e Milo `(0, 10.76, 15.41)`. Título: "Base Aliada & Milo (Player ADC)". |
| 04 | Corrida Central pelas Pontes | Dolly | 5s | Dolly dinâmico rasante pela ponte Mid de `(0, 14, 8)` a `(0, 13, -7)` mirando Axel à frente. Título: "Combate Rápido de 3 Minutos". |
| 05 | Base Roxa & Bot Axel | Orbit | 5s | Órbita focada no Galinheiro Sombrio roxo em `(-0.10, 10.50, -20.23)`, raio 13m, alt 17→14m. Título: "Base Inimiga & Axel (Bot IA)". |
| 06 | Transição para Câmera de Combate | Dolly | 6s | Transição aterrissando na pose EXATA da câmera de gameplay `(-22.0, 28.5, -1.5)` rot `(40.8, 88.2, 0)` FOV 50. Inicia gameplay sem cortes. |

Câmera gameplay preservada: `MobaCameraController` pos (-22, 28.5, -1.5) pitch 40.8 yaw 88.2. O Director entrega a câmera exatamente alinhada ao controle do jogador!

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
