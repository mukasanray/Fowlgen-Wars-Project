# Guia de Criação e Fatiamento de Skybox 6-Sided (Cubemap Cross)

Este documento estabelece o fluxo de trabalho padrão para geração por Inteligência Artificial (Midjourney, DALL-E, Stable Diffusion, Imagen) e importação automática de **Skyboxes 6-Sided** para o projeto **Fowlgen Wars** na Unity.

---

## 1. O Prompt ainda vale?

**Sim, 100%!** 
O prompt continua totalmente válido e calibrado. A ferramenta da Unity ([SkyboxCubemapSlicer.cs](file:///d:/Dev/Fowlgen-Wars-Project/unity/Assets/Editor/SkyboxCubemapSlicer.cs)) foi programada exatamente para ler essa estrutura de cruz 4:3, aplicando de forma automática:
- O mapeamento correto dos eixos (`+Z`, `-Z`, `+X`, `-X`).
- A rotação de 180° no Topo (`+Y`) para que o azul escuro do zênite case com a abóbada acima do horizonte.
- A sanitização de bordas de 1px contra sangramento de linhas de grade do gabarito.
- A configuração automática de **Wrap Mode: Clamp** para eliminar costuras nos cantos do cubo.

---

## 2. Formato e Especificações da Imagem

* **Proporção (Aspect Ratio)**: `4:3` (Horizontal).
* **Resoluções Recomendadas**: `1024x768`, `2048x1536` ou `4096x3072`.
* **Disposição da Cruz (4 Colunas x 3 Linhas)**:
  * **Linha 1 (Superior)**: `[Vazio]` | `Topo (+Y / Up)` | `[Vazio]` | `[Vazio]`
  * **Linha 2 (Central)**: `Esquerda (+X)` | `Frente (+Z / Sol)` | `Direita (-X)` | `Atrás (-Z)`
  * **Linha 3 (Inferior)**: `[Vazio]` | `Fundo (-Y / Down)` | `[Vazio]` | `[Vazio]`

---

## 3. Modelo de Prompt Base (Template)

> Utilize sempre os prompts em **inglês** para obter o máximo de aderência dos modelos de IA aos termos de computação gráfica:

```text
Unfolded cube map cross skybox texture layout, 4x3 horizontal cross format for 3D game engine. [TEMA / ESTILO VISUAL]: top square is the clear sky zenith (+Y), middle row has 4 seamless connected square faces (+X left, +Z front with [ELEMENTO PRINCIPAL, EX: glowing sun], -X right, -Z back) with [DETALHES DO CENÁRIO, EX: floating fantasy anime islands, waterfalls and clouds], bottom square is [PARTE INFERIOR, EX: dense ocean of clouds below (-Y)]. Seamless continuity between all adjacent cube faces, 90 degree rectilinear field of view, no edge distortion, game ready skybox texture, [ESTILO ARTÍSTICO].
```

---

## 4. Biblioteca de Prompts Prontos

### Opção A: Céu Matinal de Fantasia / Ghibli (Estilo Atual)
```text
Unfolded cube map cross skybox texture layout, 4x3 horizontal cross format for 3D game engine. Anime fantasy bright morning sky: top square is the clear blue zenith (+Y), middle row has 4 connected square faces (+X left, +Z front with bright radiant sun flare, -X right, -Z back) with lush green floating sky islands and vast white cumulus cloudscape, bottom square is dense fluffy clouds below (-Y). Seamless continuity between the cube faces, Studio Ghibli anime aesthetic, highly detailed video game skybox texture, 8k resolution.
```

### Opção B: Pôr do Sol Dourado / Golden Hour
```text
Unfolded cube map cross skybox texture layout, 4x3 horizontal cross format for 3D game engine. Fantasy anime sky at golden twilight sunset: top square is the sky zenith (+Y), middle row has 4 connected square faces (+X left, +Z front with glowing golden sun, -X right, -Z back) with floating fantasy islands and warm sunset clouds, bottom square is dense clouds below (-Y). Seamless continuity between the cube faces, anime game art style.
```

### Opção C: Noite Mágica / Celestial
```text
Unfolded cube map cross skybox texture layout, 4x3 horizontal cross format for 3D game engine. Night fantasy celestial sky: top square is deep violet zenith with glowing constellations (+Y), middle row has 4 connected square faces (+X left, +Z front with glowing giant fantasy moon and auroras, -X right, -Z back) with floating crystalline islands and glowing mist, bottom square is dark midnight clouds below (-Y). Seamless continuity, anime fantasy art style.
```

### Opção D: Tempestade Épica com Relâmpagos
```text
Unfolded cube map cross skybox texture layout, 4x3 horizontal cross format for 3D game engine. Dark fantasy storm sky: top square is turbulent dark purple storm clouds (+Y), middle row has 4 connected square faces (+X left, +Z front with distant glowing lightning strike and ominous storm clouds, -X right, -Z back) with floating dark rocky ruins, bottom square is turbulent misty clouds below (-Y). Dramatic volumetric lightning illumination, seamless continuity between cube faces.
```

---

## 5. Como Importar e Fatiar na Unity (1 Clique)

Criamos uma janela dedicada no Editor da Unity para automatizar todo o processo:

1. Salve a imagem gerada pela IA dentro de `Assets/Skybox-Folgen-Wars/Textures/` (ou em qualquer pasta do projeto).
2. Na barra de menus superior da Unity, clique em:
   **`Tools > Folgen-Wars > Cubemap Slicer (6-Sided Skybox)`**
3. Na janela que se abrir:
   * **Cubemap Cross Image**: Arraste a imagem da cruz (ex: `Example_Sunset_Cubemap_Cross.jpg`).
   * **Folder Name**: `Skybox-Folgen-Wars` (padrão).
   * **Material Name**: Digite o nome do novo material (ex: `SkySunsetGolden`).
4. Clique no botão **"Fatiar 6 Imagens e Criar Skybox"**.

### O que o script faz automaticamente:
1. **Recorta com Precisão**: Fatia as 6 faces sem margens brancas.
2. **Sanitiza as Bordas**: Realiza edge-bleed de 1px para evitar que linhas de gabarito virem costuras brancas na arena.
3. **Corrige a Orientação**: Inverte os eixos para o padrão esquerdo/direito da Unity e rotaciona o Topo (+Y) em 180°.
4. **Gera os Arquivos**: Salva os 6 arquivos PNG nomeados com padrão `Fowlgenwars_<Nome>_<Face>.png`.
5. **Configura Importers**: Define automaticamente `TextureImporterType.Default`, `WrapMode = Clamp` e `FilterMode = Bilinear`.
6. **Cria o Material**: Cria o material com o shader nativo **`Skybox/6 Sided`** com todas as 6 texturas devidamente linkadas.

Para usar o novo skybox na cena, basta arrastar o material criado para a janela **Lighting > Environment > Skybox Material** (ou via código atribuindo a `RenderSettings.skybox`).
