# Catálogo de Pacotes Free da Unity Asset Store (Áudio e Efeitos VFX)
**Projeto:** Fowlgen Wars (Superteam Brasil / Colosseum Hackathon)  
**Compatibilidade:** Unity 6 (6000.6) + Universal Render Pipeline (URP) + Android Mobile (60 FPS)

---

## 1. Pacotes de Efeitos Visuais (VFX / Partículas) Gratuitos

| Nome do Pacote | Criador | Categoria | Descrição & Uso no Fowlgen Wars | Link Asset Store |
| :--- | :--- | :--- | :--- | :--- |
| **Cartoon FX Remaster Free** | Jean Moreno (JMO) | Partículas / VFX Stylized | • Mais de 50 efeitos cartum otimizados para mobile.<br>• Impactos de socos, faíscas, poeira de dash e explosões.<br>• Perfeito para o estilo visual de galos e galinhas guerreiras. | [Cartoon FX Remaster Free](https://assetstore.unity.com/packages/vfx/particles/cartoon-fx-remaster-free-109565) |
| **War FX** | Jean Moreno (JMO) | Partículas de Combate | • Explosões de solo, fumaça, projéteis e clarões.<br>• Ideal para destruição das torres e dos galinheiros das bases. | [War FX](https://assetstore.unity.com/packages/vfx/particles/war-fx-5669) |
| **Unity Particle Pack (URP Compatible)** | Unity Technologies | VFX & Shaders | • Efeitos clássicos de fogo, faíscas, gelo e auras do Unity.<br>• Efeitos de aura de cura (Skill W) e meteoro/fúria (Skill R). | [Unity Particle Pack](https://assetstore.unity.com/packages/vfx/particles/particle-pack-127325) |

> [!TIP]
> **Já integrado no código:** O novo script [CombatVFXManager.cs](file:///d:/Dev/Fowlgen-Wars-Project/unity/Assets/Modules/Gameplay/Feedback/CombatVFXManager.cs) já gera proceduralmente a explosão de penas (`SpawnFeatherBurst`), faíscas de golpe (`SpawnHitImpact`), anel de ultimate (`SpawnUltimateShockwave`) e explosão de base (`SpawnExplosion`), garantindo feedback imediato mesmo antes da importação.

---

## 2. Pacotes de Áudio e Efeitos Sonoros (SFX & BGM) Gratuitos

| Nome do Pacote | Criador | Categoria | Descrição & Uso no Fowlgen Wars | Link Asset Store |
| :--- | :--- | :--- | :--- | :--- |
| **Universal Sound FX (Free Starter)** | Imphenzia | SFX de Combate & UI | • Impactos de socos, chutes, estalos de madeira e cliques de UI.<br>• Usado para ataques básicos e botões de habilidades. | [Universal Sound FX](https://assetstore.unity.com/packages/audio/sound-fx/universal-sound-fx-free-17256) |
| **RPG Starter Sound Effects** | Wow Sound | SFX de Aventura & Batalha | • Sons de cura mágica, gritos de combate, subida de nível e fanfarras de vitória/derrota. | [RPG Starter SFX](https://assetstore.unity.com/packages/audio/sound-fx/rpg-starter-sound-effects-159676) |
| **Animal & Bird Sounds Pack (CC0 / Open Source)** | Freesound / Sonniss GDC | Efeitos de Aves | • Cacarejos de galinha, galo cantando (cocoricó), bater de asas e penas esvoaçando.<br>• Sons nativos para o início da partida ("3, 2, 1, LUTA!") e morte de galos. | [Freesound.org](https://freesound.org/search/?q=rooster+crow) |
| **Casual Game BGM #1** | WOW SOUND | Música / Trilha Sonora | • Músicas dinâmicas, cômicas e rítmicas para MOBA casual e tela de lobby. | [Casual BGM](https://assetstore.unity.com/packages/audio/music/casual-game-bgm-1-125026) |

> [!TIP]
> **Já integrado no código:** O novo script [AudioManager.cs](file:///d:/Dev/Fowlgen-Wars-Project/unity/Assets/Modules/Gameplay/Audio/AudioManager.cs) possui sintetizador procedural embutido em tempo real (socos, bicadas, cocoricós de galo, whoosh de dash e acordes de vitória). Ele reproduz qualquer `AudioClip` importado desses pacotes automaticamente quando associado no Inspector ou na pasta `Resources/Audio/`.

---

## 3. Passo a Passo para Importar no Unity Editor

1. No navegador, faça login na sua conta Unity e clique em **"Add to My Assets"** nos links gratuitos acima.
2. No Unity Editor aberto, abra a janela:  
   `Window` > `Package Manager`.
3. No seletor superior esquerdo do Package Manager, alterne de *"Packages: In Project"* para:  
   **`Packages: My Assets`**.
4. Procure por `Cartoon FX Remaster Free` ou `Universal Sound FX`.
5. Clique em **Download** e depois em **Import**.
6. Para associar os sons ou partículas aos heróis, basta arrastar os clips de áudio para os campos expostos no componente `AudioManager` presente na cena `Arena_Clean`.
