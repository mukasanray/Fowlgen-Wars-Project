# Prompt do Galinheiro dos Heróis (Base / Construção Principal)

Documentação do prompt para recriar a imagem `Galinheiro_herois.jpg`: a construção principal (base) do jogo, em estilo 3D estilizado, vista isométrica, sobre fundo branco.

> **Regra de times:** a construção existe em **duas versões com a mesma estrutura e silhueta**, mudando apenas a paleta de cores:
>
> | Versão | Lado | Cor de destaque |
> |---|---|---|
> | 🟡 **Amarela / Dourada** | Lado do **player** (aliado) | Dourado `#F5B800` |
> | 🟣 **Roxa** | Lado do **adversário** (inimigo) | Roxo `#7B2CBF` |
>
> Madeira, pedra, vegetação e arquitetura permanecem iguais nas duas versões. Só trocam as cores de destaque (juba do galo, estandartes, cristais, detalhes metálicos, folhas, tochas e brilho da entrada). Assim o jogador identifica o time de forma instantânea.

---

## 1. Prompt base (com variável de cor do time)

Use este modelo e troque os trechos `{COR}` conforme a versão desejada (valores na seção 2 e 3).

```
Isometric 3/4 view game asset, stylized 3D hand-painted render, fantasy RTS / mobile strategy game building, isolated on a pure white background, centered composition, high detail, crisp clean edges, vibrant saturated colors, soft warm lighting, no ground shadow beyond the structure.

A fortified wooden rooster hall called "Hero Coop": a large central timber barn with a steep gabled roof and two lower side wings with dark brown shingled roofs trimmed in {COR} metal edges. Vertical wooden plank walls in warm brown, reinforced with dark steel corner brackets studded with small {COR} diamond rivets. A large {COR} feather emblem is carved on the central gable and smaller {COR} feather emblems sit on each side roof. {COR} leaf-shaped finials decorate the roof corners.

On top of the central roof ridge sits a giant stylized rooster head and chest as a mascot sculpture: fierce angry eyes, {COR_BICO} beak, bright red comb, cream-white face and chest feathers, and a huge fan-shaped mane of {COR_JUBA} feathers spreading like wings behind him. He wears a dark leather collar with a {COR} shield badge and small stars.

Central entrance: a rounded stone arch made of grey-beige blocks framing double wooden doors opened to reveal a bright glowing {COR_BRILHO} interior light, with a red-brown brick path leading out to the plaza.

Two tall hanging banners with a dark rooster silhouette emblem on {COR} cloth flank the entrance, mounted on wooden posts with steel brackets and {COR} crystal studs. A stone chimney tower with a {COR} crystal spire stands on the right side of the roof. Small wooden barrel by the left wall. Small shuttered wooden windows on both side wings.

On each side stands a wooden defensive tower / crank mechanism with steel reinforcements, a large {COR} crystal on top, two small rooster banners, and {COR} crystal spikes on stone bases at its feet.

In front: a circular cobblestone plaza with semicircular stone steps, a round stone fountain with glowing blue water and a floating {COR} crystal above it, and two stone pillars with burning torches ({COR_FOGO} flames). Lush green bushes with small {COR_FLOR} flowers surround the base of the whole structure.

Art style: stylized 3D game asset, hand-painted textures, chunky proportions, beveled edges, rich material contrast (wood, stone, steel, crystal), Clash-of-Clans / Warcraft-like fantasy RTS building, clean silhouette, game-ready, 4k.
```

---

## 2. 🟡 Versão AMARELA (lado do player)

Substituições na variável do prompt base:

| Variável | Valor |
|---|---|
| `{COR}` | golden yellow |
| `{COR_BICO}` | orange-yellow |
| `{COR_JUBA}` | golden-orange and amber |
| `{COR_BRILHO}` | warm golden-orange |
| `{COR_FOGO}` | orange-yellow |
| `{COR_FLOR}` | yellow |

### Prompt completo (pronto para copiar)

```
Isometric 3/4 view game asset, stylized 3D hand-painted render, fantasy RTS / mobile strategy game building, isolated on a pure white background, centered composition, high detail, crisp clean edges, vibrant saturated colors, soft warm lighting, no ground shadow beyond the structure.

A fortified wooden rooster hall called "Hero Coop", PLAYER TEAM version in golden yellow: a large central timber barn with a steep gabled roof and two lower side wings with dark brown shingled roofs trimmed in golden yellow metal edges. Vertical wooden plank walls in warm brown, reinforced with dark steel corner brackets studded with small golden yellow diamond rivets. A large golden yellow feather emblem is carved on the central gable and smaller golden yellow feather emblems sit on each side roof. Golden yellow leaf-shaped finials decorate the roof corners.

On top of the central roof ridge sits a giant stylized rooster head and chest as a mascot sculpture: fierce angry eyes, orange-yellow beak, bright red comb, cream-white face and chest feathers, and a huge fan-shaped mane of golden-orange and amber feathers spreading like wings behind him. He wears a dark leather collar with a golden yellow shield badge and small stars.

Central entrance: a rounded stone arch made of grey-beige blocks framing double wooden doors opened to reveal a bright glowing warm golden-orange interior light, with a red-brown brick path leading out to the plaza.

Two tall hanging banners with a dark rooster silhouette emblem on golden yellow cloth flank the entrance, mounted on wooden posts with steel brackets and golden yellow crystal studs. A stone chimney tower with a golden yellow crystal spire stands on the right side of the roof. Small wooden barrel by the left wall. Small shuttered wooden windows on both side wings.

On each side stands a wooden defensive tower / crank mechanism with steel reinforcements, a large golden yellow crystal on top, two small rooster banners, and golden yellow crystal spikes on stone bases at its feet.

In front: a circular cobblestone plaza with semicircular stone steps, a round stone fountain with glowing blue water and a floating golden yellow crystal above it, and two stone pillars with burning torches (orange-yellow flames). Lush green bushes with small yellow flowers surround the base of the whole structure.

Art style: stylized 3D game asset, hand-painted textures, chunky proportions, beveled edges, rich material contrast (wood, stone, steel, crystal), Clash-of-Clans / Warcraft-like fantasy RTS building, clean silhouette, game-ready, 4k.
```

---

## 3. 🟣 Versão ROXA (lado do adversário)

Substituições na variável do prompt base:

| Variável | Valor |
|---|---|
| `{COR}` | royal purple / violet |
| `{COR_BICO}` | dark magenta-purple |
| `{COR_JUBA}` | deep purple and violet with magenta highlights |
| `{COR_BRILHO}` | eerie violet-magenta |
| `{COR_FOGO}` | purple-magenta |
| `{COR_FLOR}` | lilac purple |

### Prompt completo (pronto para copiar)

```
Isometric 3/4 view game asset, stylized 3D hand-painted render, fantasy RTS / mobile strategy game building, isolated on a pure white background, centered composition, high detail, crisp clean edges, vibrant saturated colors, soft warm lighting, no ground shadow beyond the structure.

A fortified wooden rooster hall called "Hero Coop", ENEMY TEAM version in royal purple: a large central timber barn with a steep gabled roof and two lower side wings with dark brown shingled roofs trimmed in royal purple metal edges. Vertical wooden plank walls in warm brown, reinforced with dark steel corner brackets studded with small violet diamond rivets. A large royal purple feather emblem is carved on the central gable and smaller purple feather emblems sit on each side roof. Purple leaf-shaped finials decorate the roof corners.

On top of the central roof ridge sits a giant stylized rooster head and chest as a mascot sculpture: fierce angry eyes, dark magenta-purple beak, bright red comb, cream-white face and chest feathers, and a huge fan-shaped mane of deep purple and violet feathers with magenta highlights spreading like wings behind him. He wears a dark leather collar with a royal purple shield badge and small stars.

Central entrance: a rounded stone arch made of grey-beige blocks framing double wooden doors opened to reveal a bright glowing eerie violet-magenta interior light, with a red-brown brick path leading out to the plaza.

Two tall hanging banners with a dark rooster silhouette emblem on royal purple cloth flank the entrance, mounted on wooden posts with steel brackets and violet crystal studs. A stone chimney tower with a purple amethyst crystal spire stands on the right side of the roof. Small wooden barrel by the left wall. Small shuttered wooden windows on both side wings.

On each side stands a wooden defensive tower / crank mechanism with steel reinforcements, a large purple amethyst crystal on top, two small rooster banners, and purple crystal spikes on stone bases at its feet.

In front: a circular cobblestone plaza with semicircular stone steps, a round stone fountain with glowing blue water and a floating purple amethyst crystal above it, and two stone pillars with burning torches (purple-magenta flames). Lush green bushes with small lilac purple flowers surround the base of the whole structure.

Art style: stylized 3D game asset, hand-painted textures, chunky proportions, beveled edges, rich material contrast (wood, stone, steel, crystal), Clash-of-Clans / Warcraft-like fantasy RTS building, clean silhouette, game-ready, 4k.
```

---

## 4. Prompt negativo (vale para as duas versões)

```
blurry, low quality, realistic photo, 2D flat, pixel art, top-down view, side view only, characters, people, extra buildings, background scenery, sky, ground shadow, gradient background, text, watermark, signature, logo, extra rooster heads, asymmetrical layout, cropped structure, mixed team colors, purple in the yellow version, yellow in the purple version, jpeg artifacts
```

> Dica: ao gerar uma versão, mantenha o negativo "mixed team colors" para evitar que as duas paletas se misturem.

---

## 5. Parâmetros sugeridos

| Item | Valor |
|---|---|
| Proporção | 3:2 (ex.: 1536×1024) |
| Fundo | Branco puro (facilita recorte para remover fundo) |
| Estilo | 3D estilizado, hand-painted, game asset isométrico |
| Midjourney | adicionar `--ar 3:2 --style raw --s 250` |
| Stable Diffusion | CFG 7–8, sampler DPM++ 2M Karras, 30–40 steps |
| Consistência entre times | Usar a mesma `seed` nas duas versões e trocar só as cores |

---

## 6. Paletas de cores

### Elementos comuns às duas versões

| Elemento | Cor aproximada |
|---|---|
| Madeira das paredes | Marrom quente `#7A4A2A` |
| Telhado | Marrom escuro `#4A2A1A` |
| Pedra (arco, praça, chaminé) | Bege acinzentado `#B8AE98` |
| Reforços metálicos | Cinza aço escuro `#4A4F58` |
| Vegetação | Verde `#3E9B2F` |
| Água da fonte | Azul `#2FA8E0` |
| Crista do galo | Vermelho `#D9141E` |
| Rosto e peito do galo | Creme `#F5EFE0` |

### Cores que mudam por time

| Elemento | 🟡 Amarelo (player) | 🟣 Roxo (adversário) |
|---|---|---|
| Detalhes metálicos / acabamento do telhado | `#F5B800` | `#7B2CBF` |
| Juba do galo | `#E8A317` / `#C97A10` | `#5A1E96` / `#9B4DCA` |
| Bico | `#F5B800` | `#8E2D8E` |
| Estandartes | `#F5B800` | `#7B2CBF` |
| Cristais | Dourado `#FFD21F` | Ametista `#A855F7` |
| Brilho da entrada | `#FFB000` | `#C026D3` |
| Chamas das tochas | `#FF9A00` | `#D946EF` |
| Flores | Amarelo `#F7D23E` | Lilás `#C9A0F0` |

---

## 7. Descrição dos elementos

| Elemento | Detalhes |
|---|---|
| Estrutura principal | Galpão de madeira com telhado de duas águas alto e duas alas laterais mais baixas |
| Mascote no topo | Cabeça e peito de galo gigante sobre a cumeeira, com juba em leque e coleira com brasão |
| Entrada | Arco de pedra arredondado, portas abertas com luz brilhante e caminho de tijolos |
| Estandartes | Dois, ladeando a entrada, com silhueta escura de galo |
| Chaminé / torre | Torre de pedra no lado direito do telhado com ponta de cristal |
| Torres laterais | Duas torres de madeira com mecanismo, cristal no topo, estandartes pequenos e espetos de cristal na base |
| Praça | Piso circular de paralelepípedo com degraus semicirculares |
| Fonte | Fonte de pedra com água azul e cristal flutuante no centro |
| Tochas | Dois pilares de pedra com tochas acesas |
| Vegetação | Arbustos verdes com flores pequenas ao redor da base |
| Detalhes menores | Barril de madeira à esquerda, janelas com venezianas, folhas decorativas nos cantos do telhado |

---

## 8. Observações para uso no jogo

- Gerar as duas versões com a **mesma composição e a mesma seed**, mudando só a paleta. Isso mantém a leitura visual igual e facilita a troca de sprite por time.
- O fundo branco facilita o recorte (remover fundo) para exportar PNG transparente.
- Se quiser variar a aparência do inimigo sem perder a identidade, pode-se acrescentar ao prompt roxo: `slightly more menacing, darker tones, subtle dark smoke wisps` (opcional).
