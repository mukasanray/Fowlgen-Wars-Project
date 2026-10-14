# FOWLGEN WARS - TEMPLATE MESTRE DE PERSONAGEM 3D GAME-READY

> **Objetivo:** documento padrão, adaptável a qualquer Fowlgen, para consolidar Concept Art, Turnaround, peças, materiais, cores, orçamento geométrico, coordenadas, textura, rig e requisitos de Unity. O formato foi feito para leitura rápida por humanos e por IA.

## 0. Regras para preenchimento por IA

1. **Não inventar dados ausentes.** Use `TBD` quando a referência não permitir concluir algo.
2. **A imagem é autoridade visual.** Texto técnico define escala, orçamento e entrega.
3. **Sempre registrar o nome/ID do arquivo de cada imagem** usada.
4. **Separar observado de estimado:** `OBSERVADO`, `DEFINIDO` ou `ESTIMADO`.
5. **Triângulos são a métrica principal de performance.** Faces e vértices são estimativas até o mesh existir.
6. **Preservar silhueta, classe e leitura top-down** antes de microdetalhes.
7. **Não alterar identidade, cores ou símbolos** sem aprovação de Design/Art.

---

# 1. IDENTIFICAÇÃO RÁPIDA

| Campo | Valor |
|---|---|
| ID do personagem | `[CHAR_ID]` |
| Nome | `[NOME]` |
| Classe/Função | `[CLASSE]` |
| Raça/Espécie | `[RAÇA]` |
| Clã/Civilização | `[CLÃ]` |
| Período/Tema | `[TEMA]` |
| Rota/Papel | `[ROTA]` |
| Alinhamento | `[HERÓI/VILÃO/etc.]` |
| Versão do documento | `[vX.Y]` |
| Status | `[CONCEPT / 3D / RETOPO / RIG / GAME-READY]` |
| Responsável | `[NOME]` |
| Última atualização | `[AAAA-MM-DD]` |

### Resumo visual em 1 linha
`[Ex.: Tank largo e baixo, cabeça grande, ombros dominantes, escudo massivo e leitura azul/dourada.]`

### Assinatura de silhueta - 3 a 5 formas primárias
- `[FORMA 1]`
- `[FORMA 2]`
- `[FORMA 3]`
- `[FORMA 4 opcional]`
- `[FORMA 5 opcional]`

---

# 2. REFERÊNCIAS VISUAIS

> Preencher cada slot com a imagem ou com o caminho/ID do arquivo. Se uma vista não existir, usar `TBD`.

## 2.1 Concept principal

**IMAGE_SLOT: concept_main**  
Arquivo/ID: `[ARQUIVO]`  
Descrição: `[o que esta imagem define]`

`[INSERIR IMAGEM - CONCEPT PRINCIPAL]`

## 2.2 Turnaround

| Vista | IMAGE_SLOT | Arquivo/ID | Observações |
|---|---|---|---|
| Frente | `turn_front` | `[ARQUIVO]` | `[obs]` |
| Esquerda | `turn_left` | `[ARQUIVO]` | `[obs]` |
| Direita | `turn_right` | `[ARQUIVO]` | `[obs]` |
| Costas | `turn_back` | `[ARQUIVO]` | `[obs]` |
| 3/4 frente | `turn_3q_front` | `[ARQUIVO]` | `[opcional]` |
| 3/4 costas | `turn_3q_back` | `[ARQUIVO]` | `[opcional]` |

`[INSERIR IMAGENS DO TURNAROUND AQUI]`

## 2.3 Folha de detalhes / Exploded View

**IMAGE_SLOT: detail_sheet**  
Arquivo/ID: `[ARQUIVO]`

`[INSERIR IMAGEM COM ARMADURA/ROUPA/ADORNOS SEPARADOS]`

### Slots recomendados de detalhe
- `detail_head`: cabeça/rosto/crista/cabelo/bico.
- `detail_torso`: torso, peitoral, roupa principal.
- `detail_shoulders`: ombreiras/placas superiores.
- `detail_hands`: mãos/manoplas/luvas.
- `detail_waist`: cinto, bolsas, tabardo, acessórios.
- `detail_legs`: pernas, grevas, botas/pés.
- `detail_back`: cauda/capa/mochila.
- `detail_weapon`: arma/escudo/foco/cajado.
- `detail_symbols`: brasões, emblemas e adornos.

---

# 3. SISTEMA CANÔNICO 3D

| Parâmetro | Valor |
|---|---|
| Engine alvo | `Unity 6 / URP / Mobile` |
| Escala | `1 Blender Unit = 1 metro` |
| Origem | `centro entre os pés` |
| Chão | `Z = 0` |
| Frente no Blender | `-Y` |
| Direita | `+X` |
| Costas | `+Y` |
| Altura | `[X.XXX m]` |
| Largura corporal sem equipamento | `[X.XXX m]` |
| Profundidade corporal | `[X.XXX m]` |
| Pose de produção | `[A-pose / T-pose / neutra]` |
| Pivot de equipamento principal | `[X,Y,Z]` |

### Marcos anatômicos
| Marco | Coordenada (m) | Status |
|---|---:|---|
| Centro da cabeça | `[x,y,z]` | `[DEFINIDO/ESTIMADO]` |
| Centro do peito | `[x,y,z]` | `[ ]` |
| Linha dos ombros | `Z=[ ]` | `[ ]` |
| Linha da cintura | `Z=[ ]` | `[ ]` |
| Root/quadril | `[x,y,z]` | `[ ]` |
| Joelho L/R | `[x,y,z]` | `[ ]` |
| Tornozelo L/R | `[x,y,z]` | `[ ]` |
| Pés | `Z=0` | `DEFINIDO` |
| Pivot da arma/equipamento | `[x,y,z]` | `[ ]` |

---

# 4. INVENTÁRIO DE COMPONENTES

> **Regra:** uma linha por peça visualmente ou tecnicamente relevante. Peças rígidas que precisem de pivot próprio podem ser objetos separados.

| ID | Componente | Categoria | Objeto separado? | Deforma? | Cor/Material | Tris alvo | Faces estim. | Verts estim. | X min/max | Y min/max | Z min/max | Prioridade |
|---|---|---|---|---|---|---:|---:|---:|---|---|---|---|
| `C01` | `[Cabeça]` | Anatomia | Não | Sim | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Alta |
| `C02` | `[Crista/Cabelo]` | Anatomia | `[ ]` | `[ ]` | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Alta |
| `C03` | `[Torso/Peitoral]` | Armadura/Roupa | `[ ]` | `[ ]` | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Alta |
| `C04` | `[Ombros]` | Armadura | `[ ]` | `[ ]` | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Alta |
| `C05` | `[Braços]` | Anatomia/Roupa | `[ ]` | Sim | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Alta |
| `C06` | `[Mãos/Manoplas]` | Anatomia/Armadura | `[ ]` | Sim | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Alta |
| `C07` | `[Cinto/Adornos]` | Acessório | `[ ]` | Não | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Média |
| `C08` | `[Pernas]` | Anatomia/Roupa | `[ ]` | Sim | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Alta |
| `C09` | `[Pés/Botas]` | Anatomia/Armadura | `[ ]` | Sim | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Alta |
| `C10` | `[Cauda/Capa]` | Anatomia/Roupa | `[ ]` | `[ ]` | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Média |
| `C11` | `[Arma/Escudo]` | Equipamento | Sim | Não | `[MAT]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | Crítica |

### Como estimar faces e vértices antes do mesh existir
- **Triângulos:** orçamento principal e obrigatório.
- **Faces:** se a retopologia for majoritariamente quad, `faces_quad ≈ tris / 2`; se o asset final estiver triangulado, `faces = tris`.
- **Vértices:** apenas estimativa. Para malha manifold fechada bem distribuída, começar com `verts ≈ tris / 2` e validar após a geração/retopologia.
- Registrar números reais assim que o mesh existir; não forçar a malha a bater uma estimativa de vértices.

---

# 5. ORÇAMENTO GEOMÉTRICO TOTAL

| Nível | Triângulos alvo | Faixa aceitável | Faces esperadas | Vértices esperados | Uso |
|---|---:|---:|---:|---:|---|
| High/Source | `[opcional]` | `[ ]` | `[ ]` | `[ ]` | geração/transferência |
| LOD0 | `[TOTAL]` | `[min-max]` | `[ ]` | `[ ]` | gameplay próximo |
| LOD1 | `[~45-55% LOD0]` | `[ ]` | `[ ]` | `[ ]` | média distância |
| LOD2 | `[~18-25% LOD0]` | `[ ]` | `[ ]` | `[ ]` | longa distância |

### Faixas sugeridas por classe - ponto de partida
| Classe | LOD0 sugerido | Foco geométrico |
|---|---:|---|
| Tank | `12k-15k tris` | massa, ombros, rosto, equipamento pesado |
| Atirador | `9k-12k tris` | rosto, arma, braços, silhueta direcional |
| Mago | `10k-13k tris` | cabeça, mãos, foco/cajado, capa |
| Assassino | `9k-12k tris` | pernas, braços, lâminas, capa curta |
| Suporte | `9k-12k tris` | rosto, foco, mochila/totem, braços |
| Lutador | `10k-13k tris` | torso, mãos/arma, pés |

> Ajustar conforme silhouette complexity, equipamento e importância do personagem em câmera.

---

# 6. PEÇAS DE ROUPA, ARMADURA E ADORNOS

| ID | Peça | Zona | Forma principal | Espessura | Fixação/Pivot | Material | Cor | Separar mesh? | Observações |
|---|---|---|---|---|---|---|---|---|---|
| `A01` | `[Peitoral]` | Torso | `[ ]` | `[cm]` | `[ ]` | `[ ]` | `[HEX]` | `[S/N]` | `[ ]` |
| `A02` | `[Ombreira L]` | Ombro L | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[HEX]` | `[ ]` | `[ ]` |
| `A03` | `[Ombreira R]` | Ombro R | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[HEX]` | `[ ]` | `[ ]` |
| `A04` | `[Cinto]` | Cintura | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[HEX]` | `[ ]` | `[ ]` |
| `A05` | `[Tabardo/Capa]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[HEX]` | `[ ]` | `[ ]` |
| `A06` | `[Adorno/Símbolo]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[HEX]` | `[ ]` | `[ ]` |

### Regras de detalhe
- Detalhes `< 2 cm` que não alterem silhueta: preferir textura/normal.
- Formas que definem classe ou leitura: geometria.
- Elementos rígidos com movimento independente: objeto separado.
- Evitar microgeometria invisível na câmera real do jogo.

---

# 7. PALETA DE CORES

| ID | Nome | HEX | RGB | Área exata de uso | Material | % visual aprox. |
|---|---|---|---|---|---|---:|
| `P01` | `[Cor principal]` | `#[------]` | `[r,g,b]` | `[ ]` | `[ ]` | `[ ]%` |
| `P02` | `[Secundária]` | `#[------]` | `[ ]` | `[ ]` | `[ ]` | `[ ]%` |
| `P03` | `[Accent]` | `#[------]` | `[ ]` | `[ ]` | `[ ]` | `[ ]%` |
| `P04` | `[Neutro claro]` | `#[------]` | `[ ]` | `[ ]` | `[ ]` | `[ ]%` |
| `P05` | `[Neutro escuro]` | `#[------]` | `[ ]` | `[ ]` | `[ ]` | `[ ]%` |
| `P06` | `[Identidade especial]` | `#[------]` | `[ ]` | `[ ]` | `[ ]` | `[ ]%` |

### Regra de aplicação
`[Ex.: 55% neutros, 25% cor principal, 12% secundária, 8% accents.]`

---

# 8. MATERIAIS E TEXTURAS

| Material ID | Tipo | Áreas | Metallic | Roughness | Normal | Observações |
|---|---|---|---:|---:|---|---|
| `M01` | `[Pena/Pele/Tecido]` | `[ ]` | `[0-1]` | `[0-1]` | `[sim/não]` | `[ ]` |
| `M02` | `[Metal]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| `M03` | `[Couro]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |

### Atlas
- Produção: `2048x2048`.
- Export mobile inicial: `1024x1024` ou `2048x2048` conforme teste.
- BaseColor: `sRGB`.
- Normal: validar convenção no pipeline Unity.
- Máscaras/ORM: opcional conforme shader.
- Máximo recomendado: `1 material principal + 1 material opcional`.

### Distribuição UV
| Região | Espaço UV / prioridade | Texel density |
|---|---|---|
| Rosto/cabeça | `[Alta]` | `[ ]` |
| Torso | `[Alta]` | `[ ]` |
| Arma/equipamento | `[Alta]` | `[ ]` |
| Braços/mãos | `[Média]` | `[ ]` |
| Pernas/pés | `[Média]` | `[ ]` |
| Acessórios | `[Baixa-Média]` | `[ ]` |

Padding recomendado: `>=12 px em 2K`.

---

# 9. RETOPOLOGIA E DEFORMAÇÃO

### Prioridade de edge flow
- Ombros: `[loops]`.
- Cotovelos: `[loops]`.
- Punhos: `[loops]`.
- Pescoço: `[loops]`.
- Quadril: `[loops]`.
- Joelhos: `[loops]`.
- Tornozelos: `[loops]`.
- Face/bico: `[necessidades específicas]`.

### Regra
`Geometria onde deforma + geometria onde define silhueta. O resto deve permanecer simples.`

### Objetos esperados
```text
[CHAR]_SOURCE
[CHAR]_RETOPO
[CHAR]_Body
[CHAR]_[Weapon/Shield]
[CHAR]_[RigidPart_L]
[CHAR]_[RigidPart_R]
```

---

# 10. RIG E ANIMAÇÃO

| Item | Definição |
|---|---|
| Tipo de rig | `[Humanoid custom / Generic]` |
| Bones estimados | `[ ]` |
| Root | `[ ]` |
| Equipamento parentado a | `[bone]` |
| Cauda/capa | `[bones / rigid / cloth]` |
| Facial | `[none / simple / bones / blendshapes]` |

### Animações mínimas previstas
- Idle
- Walk/Run
- Basic Attack
- Ability 1
- Ability 2
- Ultimate / Special
- Hit
- Death

---

# 11. UNITY / ENTREGA GAME-READY

| Item | Requisito |
|---|---|
| Engine | Unity 6 |
| Render Pipeline | URP |
| Formato | FBX/GLB para intercâmbio; FBX recomendado no pipeline final |
| Escala final | 1 Unity Unit = 1 m |
| Transform | Position coerente, Rotation aplicada, Scale 1/1/1 |
| Materiais | <=2 sempre que possível |
| Colliders | simplificados; evitar MeshCollider detalhado |
| LOD Group | LOD0/LOD1/LOD2 quando houver tempo |
| Animator | configurado na Unity |
| Prefab | `[CHAR]_Prefab` |

---

# 12. CHECKLIST DE ACEITE

## Visual
- [ ] Silhueta reconhecível em miniatura.
- [ ] Concept e turnaround respeitados.
- [ ] Cores HEX aplicadas corretamente.
- [ ] Peças principais e símbolos preservados.
- [ ] Classe legível sem depender de texto.

## Geometria
- [ ] LOD0 dentro da faixa de tris aprovada.
- [ ] Faces/vértices reais registrados.
- [ ] Sem microgeometria desnecessária.
- [ ] Sem non-manifold grave.
- [ ] Sem faces internas inúteis.
- [ ] Normals corretas.
- [ ] Equipamento crítico separado quando necessário.

## Produção
- [ ] Altura e eixos corretos.
- [ ] Pés no chão.
- [ ] Pivots coerentes.
- [ ] UV válido.
- [ ] Materiais dentro do limite.
- [ ] Pronto para rig/animação.
- [ ] Testado na câmera real de gameplay.
- [ ] Pronto para Unity URP.

---

# 13. BLOCO DE LEITURA RÁPIDA PARA IA

> Preencher este bloco por último. Ele funciona como um manifesto resumido para outra IA ou ferramenta 3D.

```yaml
character:
  id: "[CHAR_ID]"
  name: "[NOME]"
  class: "[CLASSE]"
  role: "[FUNÇÃO]"
  theme: "[TEMA]"
  visual_summary: "[1 frase]"
references:
  concept_main: "[arquivo/id]"
  turn_front: "[arquivo/id]"
  turn_left: "[arquivo/id]"
  turn_right: "[arquivo/id]"
  turn_back: "[arquivo/id]"
  detail_sheet: "[arquivo/id]"
geometry:
  height_m: null
  width_m: null
  depth_m: null
  lod0_tris_target: null
  lod0_tris_min: null
  lod0_tris_max: null
  lod1_tris_target: null
  lod2_tris_target: null
  actual_vertices: null
  actual_faces: null
  actual_triangles: null
palette:
  - {id: P01, hex: "#------", usage: "[área]"}
materials:
  max_materials: 2
  texture_production: "2048x2048"
components:
  - id: "C01"
    name: "[componente]"
    separate_object: false
    deforms: true
    tris_target: null
    color_ids: ["P01"]
    bbox_m: {x: [null, null], y: [null, null], z: [null, null]}
rig:
  type: "[Humanoid custom/Generic]"
  bones_target: null
unity:
  engine: "Unity 6"
  pipeline: "URP"
  scale: "1 unit = 1 m"
  ready: false
status:
  stage: "[CONCEPT/3D/RETOPO/RIG/GAME_READY]"
  blockers: []
```

---

# 14. REGISTRO DE REVISÃO

| Versão | Data | Autor | Alteração | Aprovado por |
|---|---|---|---|---|
| `v0.1` | `[data]` | `[nome]` | Template inicial | `[ ]` |

