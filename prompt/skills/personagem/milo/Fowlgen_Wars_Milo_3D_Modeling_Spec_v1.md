# FOWLGEN WARS - MILO 3D GAME-READY MODELING SPEC v1.0

## 1. Objetivo e regra de precisão
Este documento transforma o concept do Milo em uma especificação técnica replicável para modelagem 3D por IA, Blender e Unity. A referência visual define identidade, proporções relativas e peças. Como uma imagem 2D não contém medidas físicas ou coordenadas 3D reais, as medidas X/Y/Z abaixo são o **sistema canônico oficial proposto para o asset**, não medições extraídas da imagem. Isso torna o resultado reproduzível.

**Sistema canônico**: 1 Blender Unit = 1 metro; origem global no centro entre os pés; chão em Z=0; Milo em pose neutra/A-pose; frente do personagem aponta para -Y; direita do personagem = +X; costas = +Y. Altura máxima: Z=2.000 m. Largura máxima do corpo sem escudo: ~1.220 m. Profundidade máxima do corpo: ~0.720 m. Escudo é objeto separado, preso ao braço esquerdo.

## 2. Meta técnica geral
- Plataforma alvo: mobile / Unity URP.
- Estilo: cartoon 3D, formas grandes, bordas arredondadas, leitura isométrica/top-down, sem microgeometria desnecessária.
- Modelo principal LOD0: **13.800 triângulos alvo**, tolerância de +/- 8% (12.700-14.900).
- LOD1: ~6.500 tris. LOD2: ~2.800 tris.
- Materiais: 1 material principal + 1 material opcional para escudo/metal; preferir atlas único.
- Textura principal: 2048x2048 durante produção; export mobile 1024x1024. Normal opcional 1024; ORM/máscaras 1024.
- Rig sugerido: 32-38 bones, sem bones em detalhes rígidos que possam ser parentados.
- Shading: smooth shading + weighted normals/auto smooth; bevel visual largo, não realista.

## 3. Paleta canônica
| ID | Cor | Hex | Uso principal |
|---|---|---|---|
| C01 | Azul Real Fowlgen | #2457A6 | tecido, escudo, placas azuis, tabardo |
| C02 | Azul Profundo | #17345F | sombras pintadas, recessos, bordas internas |
| C03 | Ouro Principal | #E6A33A | molduras, brasões, acabamentos, garras metálicas |
| C04 | Ouro Claro | #F4C566 | highlights de ouro e bordas superiores |
| C05 | Pena Marfim | #F2E6D2 | cabeça, pescoço, braços, cauda |
| C06 | Pena Sombra | #CFC7BC | separação de penas e sombra ambiente |
| C07 | Crista Vermelha | #D93B32 | crista e barbela |
| C08 | Crista Luz | #F05A47 | highlights da crista/barbela |
| C09 | Bico/Garra | #D99024 | bico e unhas/garras |
| C10 | Couro | #6A3F2A | cinto, bolsas, tiras, botas |
| C11 | Couro Escuro | #3B271F | cavidades, sola, luvas e sombras do couro |
| C12 | Aço Claro | #AEB4B8 | placas centrais de armadura |
| C13 | Aço Sombra | #6F777D | juntas, recessos e placas secundárias |
| C14 | Olho/contorno | #211B1A | pupila, sobrancelha, linhas de separação |

**Regra 60/25/10/5**: ~60% marfim/aço neutro, 25% azul, 10% ouro, 5% vermelho/couro escuro. O vermelho deve ficar concentrado na cabeça para reconhecimento instantâneo.

## 4. Componentes, polígonos e coordenadas canônicas
As caixas X/Y/Z são limites de modelagem em pose neutra, em metros. São metas para manter escala e silhueta consistentes.

| Componente | Tris alvo | X min/max | Y min/max | Z min/max | Cores | Observações |
|---|---:|---|---|---|---|---|
| Cabeça + penas faciais | 1.150 | -0.270 / +0.270 | -0.285 / +0.215 | 1.420 / 1.825 | C05,C06,C14 | cabeça grande, bochechas/penas em massas, olhos inclinados |
| Crista | 420 | -0.170 / +0.170 | -0.090 / +0.150 | 1.770 / 2.000 | C07,C08 | 3-4 lóbulos grandes; silhueta limpa |
| Bico + barbela | 330 | -0.135 / +0.135 | -0.410 / -0.175 | 1.420 / 1.690 | C07,C08,C09 | bico curto e robusto; barbela dupla simplificada |
| Pescoço/colar de penas | 520 | -0.390 / +0.390 | -0.250 / +0.260 | 1.250 / 1.540 | C05,C06,C01 | transição cabeça-torso; cachecol azul sobreposto |
| Peitoral/torso blindado | 1.300 | -0.500 / +0.500 | -0.310 / +0.330 | 0.900 / 1.480 | C12,C13,C01,C03 | volume em barril; brasão central legível |
| Ombreiras (par) | 1.350 | -0.610 / +0.610 | -0.260 / +0.290 | 1.190 / 1.600 | C01,C03,C04 | maiores que anatomia; pontas arredondadas, motivo de pena |
| Braços + penas (par) | 1.100 | -0.650 / +0.650 | -0.260 / +0.270 | 0.720 / 1.350 | C05,C06,C13 | cilindros grossos, cotovelos simples |
| Manoplas/braçadeiras (par) | 780 | -0.690 / +0.690 | -0.300 / +0.300 | 0.620 / 1.120 | C01,C03,C12,C11 | punhos grandes; mão fechada legível |
| Escudo | 1.650 | -0.980 / -0.490 | -0.430 / -0.020 | 0.500 / 1.550 | C01,C02,C03,C04,C05 | objeto separado; frente convexa; brasão de pena em relevo baixo |
| Cinto + bolsas + fivelas | 820 | -0.500 / +0.500 | -0.350 / +0.350 | 0.720 / 1.020 | C10,C11,C03 | 2-3 bolsas grandes, sem costura geométrica fina |
| Tabardo/adornos frontais | 420 | -0.230 / +0.230 | -0.340 / -0.200 | 0.420 / 0.930 | C01,C03,C05 | peça azul central com borda ouro e pena clara |
| Quadril + pernas | 1.100 | -0.410 / +0.410 | -0.250 / +0.260 | 0.180 / 0.780 | C11,C13,C05 | pernas curtas, afastadas, centro de massa baixo |
| Botas/grevas + pés | 980 | -0.450 / +0.450 | -0.360 / +0.240 | 0.000 / 0.480 | C10,C11,C03,C09,C13 | 3 garras grandes por pé; sola plana Z=0 |
| Cauda/penas traseiras | 780 | -0.350 / +0.350 | +0.230 / +0.600 | 0.620 / 1.180 | C05,C06 | 4-6 massas de pena, não penas individuais |
| **TOTAL** | **13.800** |  |  |  |  | alvo LOD0 |

### Marcos anatômicos
- Centro da cabeça: (0.000, -0.055, 1.620)
- Centro do peito: (0.000, -0.020, 1.180)
- Linha dos ombros: Z=1.390
- Linha do cinto: Z=0.880
- Centro do quadril/root: (0.000, 0.000, 0.690)
- Joelho E/D: (+/-0.260, -0.015, 0.390)
- Tornozelo E/D: (+/-0.285, -0.020, 0.160)
- Pés: contato em Z=0.000
- Pivot do escudo: (-0.610, -0.120, 0.960)

## 5. Construção visual por área
### Cabeça
Forma base quase esférica achatada lateralmente. Testa larga, olhos grandes porém agressivos, sobrancelhas espessas. Penas da bochecha em 3-5 massas grandes. Não modelar fios. Bico curto em cunha arredondada. A cabeça deve permanecer reconhecível em 64-96 px de altura na tela.

### Crista
Três a quatro volumes carnudos conectados. Lóbulo frontal mais alto, traseiros decrescentes. Evitar pontas finas. Gradiente pintado C07 -> C08 nas áreas superiores; AO escurecido na base.

### Ombreiras
Silhueta de "asas blindadas": casca azul C01, aro grosso ouro C03, highlight C04 e 2-3 penas/placas azuis levantadas. Ombreiras devem ampliar a largura aparente do Milo sem criar superfícies muito finas.

### Peitoral
Aço claro C12 com placas largas e linhas de separação C13. Moldura/brasão central em C03/C04. Emblema de pena em C03 sobre fundo C01. Não usar gravações pequenas.

### Escudo
Elemento de leitura primária. Forma de escudo medieval arredondado/heroico, topo largo, base em ponta curta. Moldura ouro grossa. Campo azul. Emblema central de pena/asa em marfim + ouro. Espessura visual 5-7 cm. Curvatura convexa leve. Deve ocupar ~45-50% da altura visual do corpo.

### Cinto e adornos
Couro C10, sombras C11, ferragens C03. Bolsas quadradas com cantos arredondados. Tabardo C01 com borda C03 e símbolo C05. Todo adorno deve ser legível de longe; detalhes menores que ~2 cm devem ir para textura.

### Botas/pés
Grevas compactas e grossas. Pés de galo estilizados com três garras frontais grandes C09. Nada de dedos finos. A base precisa ser estável para animação e leitura top-down.

## 6. Textura - atlas canônico
**Importante:** uma textura UV final pixel-perfect só pode ser criada depois que o mesh possuir UV unwrap. Antes disso, esta é a especificação exata do atlas e da pintura.

### Atlas BaseColor 2048x2048
- 0-1023 x 0-1023: torso, peito, costas e pescoço.
- 1024-1535 x 0-767: cabeça, crista, bico e barbela.
- 1536-2047 x 0-1023: ombreiras, braços e manoplas.
- 0-767 x 1024-2047: escudo (maior densidade visual).
- 768-1279 x 1024-1791: pernas, grevas e pés.
- 1280-1663 x 1024-1663: cinto, bolsas e tabardo.
- 1664-2047 x 1024-1663: cauda e penas secundárias.
- 768-2047 x 1792-2047: trims, símbolos, pequenos acessórios e padding.

**Padding UV:** mínimo 12 px no atlas 2048; 8 px no atlas 1024. Não sobrepor UVs do escudo, rosto, brasão ou assimetrias. Espelhamento permitido apenas em peças simétricas sem emblema.

### Pintura
BaseColor deve carregar grande parte da leitura cartoon: sombras suaves pintadas nos recessos, highlights largos nas bordas superiores e variação mínima de roughness. Evitar ruído, sujeira fotográfica, metal realista e scratches pequenos.

### Mapas
- BaseColor: sRGB.
- Normal: OpenGL para Blender; converter/validar conforme pipeline Unity.
- ORM opcional: R=AO, G=Roughness, B=Metallic. Ouro/aço metallic 0.65-0.85; couro/pena/tecido 0.0. Roughness: pena 0.72, tecido 0.78, couro 0.62, aço 0.42, ouro 0.36.
- Emission: normalmente 0; reservar apenas se uma skin/habilidade exigir.

## 7. Prompt mestre - MILO
```text
Crie um modelo 3D GAME-READY original do personagem MILO, Tank de FOWLGEN WARS, usando a imagem de referência fornecida como autoridade visual para identidade e proporções relativas. Não copie personagens de outros jogos. A direção deve ser cartoon 3D mobile, com formas grossas, arredondadas, legíveis em câmera isométrica/top-down e silhueta heroica.

SISTEMA DE COORDENADAS OBRIGATÓRIO:
1 Blender Unit = 1 metro. Origem (0,0,0) no centro entre os pés. Chão Z=0. Personagem olhando para -Y. Direita do personagem = +X. Costas = +Y. Altura máxima exatamente Z=2.000 m. Pose neutra/A-pose levemente agachada, simétrica, própria para rig.

SILHUETA:
Galo antropomórfico Tank. Cabeça grande, tronco extremamente largo, ombros enormes, braços grossos, pernas curtas e robustas, centro de massa baixo. Largura corporal sem escudo ~1.220 m. Profundidade ~0.720 m. Escudo grande no braço esquerdo, objeto separado, cobrindo aproximadamente 45-50% da altura visual.

ORÇAMENTO LOD0: alvo 13.800 triângulos, tolerância +/-8%. Distribuir aproximadamente: cabeça/penas 1.150; crista 420; bico/barbela 330; pescoço/colar 520; peitoral/torso 1.300; ombreiras 1.350; braços 1.100; manoplas 780; escudo 1.650; cinto/bolsas 820; tabardo 420; quadril/pernas 1.100; botas/pés 980; cauda 780. Não desperdiçar polígonos em superfícies planas ou microdetalhes.

CORES EXATAS:
Azul principal #2457A6; azul profundo #17345F; ouro #E6A33A; ouro claro #F4C566; penas marfim #F2E6D2; sombra das penas #CFC7BC; crista/vermelho #D93B32; highlight vermelho #F05A47; bico/garras #D99024; couro #6A3F2A; couro escuro #3B271F; aço claro #AEB4B8; aço sombra #6F777D; olhos/contornos #211B1A.

PEÇAS OBRIGATÓRIAS:
Cabeça de galo com olhos determinados e sobrancelhas grossas; crista vermelha de 3-4 lóbulos; bico curto dourado; barbela vermelha; colar de penas; cachecol/tecido azul; peitoral de aço segmentado com brasão central; ombreiras azuis e douradas com motivo de asa/pena; braços emplumados; manoplas reforçadas; cinto de couro com bolsas grandes; tabardo frontal azul/dourado; grevas e botas robustas; pés com três garras; cauda de 4-6 massas de penas; escudo azul e dourado com grande emblema de pena/asa.

MODELAGEM:
Priorize silhueta e volumes grandes. Penas devem ser grupos/placas grossas, nunca fios individuais. Bevels largos e suaves. Evitar superfícies finas, detalhes menores que 2 cm, inscrições, sujeira realista e ornamentos que desapareçam na câmera de gameplay. Escudo, bolsas e acessórios rígidos podem ser objetos separados. Topologia limpa, quads quando útil para deformação, loops extras apenas em ombros, cotovelos, quadril, joelhos, pescoço e face.

TEXTURAS:
Criar UV atlas 2048x2048, exportável para 1024x1024. Estilo hand-painted/PBR estilizado. BaseColor limpo, sombras suaves pintadas, highlights largos. Normal discreta. ORM opcional. Metal estilizado, não fotorealista. Nenhum ruído fino. Usar as cores hex fornecidas sem alterar a identidade cromática.

ENTREGA:
Mesh em escala real, transforms aplicados, normals corretas, sem non-manifold, sem faces internas desnecessárias, sem interseções graves, pivots coerentes. Separar e nomear: MILO_Body, MILO_Head, MILO_Crest, MILO_Shoulder_L/R, MILO_Gauntlet_L/R, MILO_Shield, MILO_Belt, MILO_Tabard, MILO_Leg_L/R, MILO_Foot_L/R, MILO_Tail. Preparar para rig humanoide customizado e export FBX/GLB para Unity.
```

## 8. Template replicável para QUALQUER Fowlgen
Use a mesma estrutura e substitua apenas os blocos marcados [VARIÁVEL]. Isso mantém escala, performance e linguagem visual consistentes entre classes.

```text
Crie um modelo 3D GAME-READY original de [PERSONAGEM], [CLASSE/FUNÇÃO] de FOWLGEN WARS, usando [REFERÊNCIA] como autoridade visual. Estilo cartoon 3D mobile original, leitura isométrica/top-down.

COORDENADAS: 1 BU=1 m; origem entre os pés; Z=0 no chão; frente=-Y; direita=+X; costas=+Y; altura=[ALTURA] m; largura=[LARGURA] m; profundidade=[PROFUNDIDADE] m; pose neutra própria para rig.

SILHUETA DA CLASSE: [3-5 FORMAS PRIMÁRIAS QUE IDENTIFICAM A CLASSE].
ORÇAMENTO LOD0: [TOTAL] tris (+/-8%). Distribuição: [COMPONENTE: TRIS...]. LOD1=[~47% LOD0]. LOD2=[~20% LOD0].

PALETA: [HEX + ÁREA EXATA DE USO]. Manter no máximo 4 cores dominantes + neutros.
PEÇAS OBRIGATÓRIAS: [CABEÇA], [CRISTA/CABELO], [TORSO], [OMBROS], [BRAÇOS], [ARMA/EQUIPAMENTO], [CINTO/ADORNO], [PERNAS/PÉS], [CAUDA/CAPA].

CAIXAS XYZ: fornecer min/max X,Y,Z de cada componente em metros e pivots dos equipamentos.
MODELAGEM: formas grandes; detalhes menores que 2 cm em textura; topologia limpa; deformação apenas onde necessário; acessórios rígidos separados quando útil.
TEXTURA: atlas 2048 produção / 1024 mobile; BaseColor + Normal discreta + ORM opcional; padding >=12 px em 2048; maior texel density em rosto, arma e símbolo de classe.
ENTREGA: nomes padronizados [PERSONAGEM]_[PEÇA], transforms aplicados, normals corretas, manifold, pronto para rig e Unity.
```

## 9. Adaptação por classe
| Classe | Silhueta | Tris LOD0 sugeridos | Prioridade de textura | Regra visual |
|---|---|---:|---|---|
| Tank | massa, ombros, escudo/arma pesada | 12k-15k | rosto, peito, escudo | largo e baixo |
| Atirador | arma, braços, linha corporal limpa | 9k-12k | rosto e arma | leitura direcional |
| Mago | cabeça, mãos, foco/cajado, capa | 10k-13k | rosto, mãos, foco | formas mágicas grandes |
| Assassino | pernas, braços, lâminas, capa curta | 9k-12k | rosto e armas | triângulos/diagonais, corpo compacto |
| Suporte | foco, mochila/totem, braços | 9k-12k | rosto e equipamento | silhueta amigável/funcional |
| Lutador | mãos/arma, torso, pés | 10k-13k | rosto, punhos/arma | centro de massa médio |

## 10. Checklist de replicação por IA
1. Anexar turnaround/concept frontal, lateral e traseiro sempre que existir.
2. Informar altura canônica e eixo frontal; nunca deixar a IA escolher escala.
3. Fixar orçamento de tris antes da geração.
4. Listar peças e separar equipamento crítico.
5. Fixar paleta HEX e mapa de aplicação.
6. Fixar bounding boxes XYZ e pivots.
7. Gerar primeiro blockout/silhueta; validar antes dos detalhes.
8. Gerar/refinar LOD0.
9. Fazer retopologia se o gerador produzir densidade irregular.
10. Fazer UV unwrap e só então produzir a textura final pixel-perfect.
11. Validar em câmera real de gameplay antes de aumentar detalhes.
12. Criar LOD1/LOD2, testar rig e exportar para Unity.

## 11. Critérios de aceite do Milo
- Altura 2.000 m e pés em Z=0.
- Silhueta reconhecível em miniatura.
- 12.7k-14.9k tris no LOD0.
- Escudo separado e pivô funcional.
- Paleta dentro dos HEX definidos, sem mudança de identidade.
- Nenhuma pena individual de alta densidade.
- Nenhum microdetalhe geométrico desnecessário.
- UV sem overlaps indevidos; padding correto.
- Materiais <=2.
- Sem non-manifold/normal invertida/interseção grave.
- Pronto para rig, animação e Unity URP.
