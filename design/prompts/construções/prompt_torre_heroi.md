# Prompt da Torre do Herói (Torre de Defesa / Balista)

Documentação do prompt para recriar a imagem `Torre_heroi.png`: torre de defesa com uma grande balista (besta gigante) no topo, em estilo 3D estilizado, vista isométrica, sobre fundo branco.

> **Regra de times:** a torre existe em **duas versões com a mesma estrutura e silhueta**, mudando apenas a paleta de cores:
>
> | Versão | Lado | Cor de destaque |
> |---|---|---|
> | 🟡 **Amarela / Dourada** | Lado do **player** (aliado) | Dourado `#F5B800` |
> | 🟣 **Roxa** | Lado do **adversário** (inimigo) | Roxo `#7B2CBF` |
>
> Madeira, pedra, corda, metal e musgo permanecem iguais nas duas versões. Só trocam as cores de destaque (ponta da flecha, acabamentos da besta, estandartes, penas decorativas, cristais e rebites em losango). Assim o jogador identifica o time de forma instantânea.

---

## 1. Prompt base (com variável de cor do time)

Use este modelo e troque `{COR}` e `{COR_CRISTAL}` conforme a versão desejada (valores nas seções 2 e 3).

```
Isometric 3/4 view game asset, stylized 3D hand-painted render, fantasy RTS / mobile strategy defense tower, isolated on a pure white background, centered composition, high detail, crisp clean edges, vibrant saturated colors, soft warm lighting, soft contact shadow only.

A rooster-themed ballista defense tower: a tall round wooden tower shaft built from vertical brown wooden planks, reinforced with dark steel bands and steel corner brackets studded with small {COR} diamond rivets, standing on a circular stepped base of grey-beige stone blocks with patches of green moss and small grass tufts.

On top of the tower, a rotating wooden platform with crossed timber supports carries a giant wooden crossbow / ballista: a thick curved wooden bow arm with plank texture, {COR} metal caps with diamond studs on the bow tips, steel brackets with rivets, thick twisted rope string pulled back, rope lashing and wrapped rope coils around the winding mechanism, and a huge faceted {COR_CRISTAL} crystal arrowhead bolt loaded and pointing forward to the right.

Around the upper ring of the tower shaft, decorative {COR} feather ornaments and steel brackets with {COR} diamond studs. Two hanging banners on the shaft, in {COR} cloth with a dark rooster silhouette emblem, with swallow-tail cut ends.

Four heavy wooden beams reinforced with steel brackets extend diagonally outward from the base in an X pattern, each ending on a small stone pillar with a steel cap and {COR} trim. The two back pillars are topped with a glowing {COR_CRISTAL} crystal flanked by two {COR} feathers; the two front pillars are topped with a pair of {COR} feathers.

Art style: stylized 3D game asset, hand-painted textures, chunky proportions, beveled edges, rich material contrast (wood, stone, steel, rope, crystal), Clash-of-Clans / Warcraft-like fantasy RTS defense tower, clean silhouette, game-ready, 4k.
```

---

## 2. 🟡 Versão AMARELA (lado do player)

Substituições na variável do prompt base:

| Variável | Valor |
|---|---|
| `{COR}` | golden yellow |
| `{COR_CRISTAL}` | golden yellow-orange |

### Prompt completo (pronto para copiar)

```
Isometric 3/4 view game asset, stylized 3D hand-painted render, fantasy RTS / mobile strategy defense tower, isolated on a pure white background, centered composition, high detail, crisp clean edges, vibrant saturated colors, soft warm lighting, soft contact shadow only.

A rooster-themed ballista defense tower, PLAYER TEAM version in golden yellow: a tall round wooden tower shaft built from vertical brown wooden planks, reinforced with dark steel bands and steel corner brackets studded with small golden yellow diamond rivets, standing on a circular stepped base of grey-beige stone blocks with patches of green moss and small grass tufts.

On top of the tower, a rotating wooden platform with crossed timber supports carries a giant wooden crossbow / ballista: a thick curved wooden bow arm with plank texture, golden yellow metal caps with diamond studs on the bow tips, steel brackets with rivets, thick twisted rope string pulled back, rope lashing and wrapped rope coils around the winding mechanism, and a huge faceted golden yellow-orange crystal arrowhead bolt loaded and pointing forward to the right.

Around the upper ring of the tower shaft, decorative golden yellow feather ornaments and steel brackets with golden yellow diamond studs. Two hanging banners on the shaft, in golden yellow cloth with a dark rooster silhouette emblem, with swallow-tail cut ends.

Four heavy wooden beams reinforced with steel brackets extend diagonally outward from the base in an X pattern, each ending on a small stone pillar with a steel cap and golden yellow trim. The two back pillars are topped with a glowing golden yellow-orange crystal flanked by two golden yellow feathers; the two front pillars are topped with a pair of golden yellow feathers.

Art style: stylized 3D game asset, hand-painted textures, chunky proportions, beveled edges, rich material contrast (wood, stone, steel, rope, crystal), Clash-of-Clans / Warcraft-like fantasy RTS defense tower, clean silhouette, game-ready, 4k.
```

---

## 3. 🟣 Versão ROXA (lado do adversário)

Substituições na variável do prompt base:

| Variável | Valor |
|---|---|
| `{COR}` | royal purple / violet |
| `{COR_CRISTAL}` | glowing purple amethyst |

### Prompt completo (pronto para copiar)

```
Isometric 3/4 view game asset, stylized 3D hand-painted render, fantasy RTS / mobile strategy defense tower, isolated on a pure white background, centered composition, high detail, crisp clean edges, vibrant saturated colors, soft warm lighting, soft contact shadow only.

A rooster-themed ballista defense tower, ENEMY TEAM version in royal purple: a tall round wooden tower shaft built from vertical brown wooden planks, reinforced with dark steel bands and steel corner brackets studded with small violet diamond rivets, standing on a circular stepped base of grey-beige stone blocks with patches of green moss and small grass tufts.

On top of the tower, a rotating wooden platform with crossed timber supports carries a giant wooden crossbow / ballista: a thick curved wooden bow arm with plank texture, royal purple metal caps with diamond studs on the bow tips, steel brackets with rivets, thick twisted rope string pulled back, rope lashing and wrapped rope coils around the winding mechanism, and a huge faceted glowing purple amethyst crystal arrowhead bolt loaded and pointing forward to the right.

Around the upper ring of the tower shaft, decorative royal purple feather ornaments and steel brackets with violet diamond studs. Two hanging banners on the shaft, in royal purple cloth with a dark rooster silhouette emblem, with swallow-tail cut ends.

Four heavy wooden beams reinforced with steel brackets extend diagonally outward from the base in an X pattern, each ending on a small stone pillar with a steel cap and royal purple trim. The two back pillars are topped with a glowing purple amethyst crystal flanked by two royal purple feathers; the two front pillars are topped with a pair of royal purple feathers.

Art style: stylized 3D game asset, hand-painted textures, chunky proportions, beveled edges, rich material contrast (wood, stone, steel, rope, crystal), Clash-of-Clans / Warcraft-like fantasy RTS defense tower, clean silhouette, game-ready, 4k.
```

---

## 4. Prompt negativo (vale para as duas versões)

```
blurry, low quality, realistic photo, 2D flat, pixel art, top-down view, characters, people, rooster character, extra buildings, background scenery, sky, ground, gradient background, text, watermark, signature, logo, extra towers, asymmetrical pillars, cropped structure, mixed team colors, purple in the yellow version, yellow in the purple version, jpeg artifacts
```

> Dica: mantenha "mixed team colors" no negativo para evitar que as duas paletas se misturem.

---

## 5. Parâmetros sugeridos

| Item | Valor |
|---|---|
| Proporção | 1:1 (ex.: 1254×1254 ou 1024×1024) |
| Fundo | Branco puro (facilita recorte para remover fundo) |
| Estilo | 3D estilizado, hand-painted, game asset isométrico |
| Midjourney | adicionar `--ar 1:1 --style raw --s 250` |
| Stable Diffusion | CFG 7–8, sampler DPM++ 2M Karras, 30–40 steps |
| Consistência entre times | Usar a mesma `seed` nas duas versões e trocar só as cores |

---

## 6. Paletas de cores

### Elementos comuns às duas versões

| Elemento | Cor aproximada |
|---|---|
| Madeira da torre e da besta | Marrom `#7A4A2A` / marrom escuro `#4A2A1A` |
| Pedra da base e dos pilares | Bege acinzentado `#B8AE98` |
| Reforços metálicos | Cinza aço escuro `#4A4F58` |
| Corda | Bege palha `#C9A56A` |
| Musgo e grama | Verde `#4E9B2F` |
| Silhueta do galo nos estandartes | Marrom escuro `#5A3418` |

### Cores que mudam por time

| Elemento | 🟡 Amarelo (player) | 🟣 Roxo (adversário) |
|---|---|---|
| Acabamentos metálicos da besta e rebites em losango | `#F5B800` | `#7B2CBF` |
| Ponta da flecha (cristal) | Dourado `#FFC21F` | Ametista `#A855F7` |
| Estandartes | `#F5B800` | `#7B2CBF` |
| Penas decorativas | `#F2A900` | `#8E3FD0` |
| Cristais dos pilares | Dourado `#FFD21F` | Ametista `#B76BF5` |
| Acabamento dos pilares | `#E8A317` | `#5A1E96` |

---

## 7. Descrição dos elementos

| Elemento | Detalhes |
|---|---|
| Corpo da torre | Fuste redondo de madeira com tábuas verticais e cintas de aço |
| Base | Degraus circulares de pedra com musgo e tufos de grama |
| Plataforma superior | Plataforma giratória de madeira com apoios cruzados |
| Balista | Besta gigante de madeira com arco curvo, ponteiras de metal com losangos, corda trançada esticada e rolos de corda |
| Projétil | Flecha com ponta de cristal facetado, apontando para frente à direita |
| Estandartes | Dois, no fuste, com silhueta escura de galo e pontas em cauda de andorinha |
| Ornamentos | Penas decorativas e suportes de aço com rebites em losango no anel superior |
| Vigas | Quatro vigas de madeira reforçadas com aço, em X, saindo da base |
| Pilares | Quatro pilares de pedra: os dois de trás com cristal e duas penas, os dois da frente com um par de penas |

---

## 8. Observações para uso no jogo

- Gerar as duas versões com a **mesma composição e a mesma seed**, mudando só a paleta, para facilitar a troca de sprite por time.
- O fundo branco facilita o recorte (remover fundo) para exportar PNG transparente.
- Combina com o Galinheiro dos Heróis: as torres laterais da construção principal seguem o mesmo estilo e a mesma paleta de times.
