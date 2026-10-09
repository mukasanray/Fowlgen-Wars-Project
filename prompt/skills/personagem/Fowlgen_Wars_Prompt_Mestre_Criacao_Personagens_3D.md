# FOWLGEN WARS — Prompt Mestre para Criação de Personagens 3D

**Ferramenta utilizada:** ChatGPT Astra 6  
**Finalidade:** geração de character design sheets profissionais para orientar concept art, modelagem 3D, texturização, rig, animação e implementação futura na Unity.

---

# 1. Objetivo do prompt

Este documento define um **prompt mestre reutilizável** para criação visual dos personagens do FOWLGEN WARS.

O prompt deve preservar a hierarquia oficial de criação:

**PERSONAGEM → RAÇA/ESPÉCIE → CLÃ/CIVILIZAÇÃO → PERÍODO/TEMA → FUNÇÃO → CLASSE → ROTA → PERSONALIDADE**

A função deste sistema é impedir que conceitos diferentes sejam misturados.

## Regra estrutural principal

**ROTA ≠ CLASSE ≠ RAÇA ≠ CULTURA ≠ PERÍODO**

- **Raça/Espécie:** o que o personagem é.
- **Clã/Civilização/Cultura:** de onde vem ou a qual grupo pertence.
- **Período/Tema:** estética, época, tecnologia e linguagem visual.
- **Função:** o papel geral em combate.
- **Classe:** especialização de combate.
- **Rota:** onde atua no mapa.
- **Personalidade:** quem ele é como indivíduo.
- **Alinhamento:** herói, vilão ou outra posição narrativa.
- **Essência/Poder:** fonte temática das habilidades, quando definida.

Nenhum atributo deve ser inferido apenas pelo nome, gênero ou alinhamento.

---

# 2. Hierarquia oficial de criação

Antes de gerar qualquer personagem, preencher:

```text
NOME:
GÊNERO:
ALINHAMENTO:

RAÇA / ESPÉCIE:
SUBESPÉCIE / FUSÃO GENÉTICA:
EFEITO DA GUERRA DO CAOS:

CLÃ / CIVILIZAÇÃO / CULTURA:
REGIÃO / ORIGEM:
PERÍODO / TEMA:

FUNÇÃO:
CLASSE:
ROTA:

PERSONALIDADE:
ESSÊNCIA / FONTE DE PODER:
TIPO DE COMBATE:
ARMA PRINCIPAL:
ARMA SECUNDÁRIA:
EQUIPAMENTOS IMPORTANTES:

SILHUETA:
PORTE FÍSICO:
POSTURA:
FORMA DE LOCOMOÇÃO:

PALETA:
MATERIAIS:
EMBLEMA:
SÍMBOLO DA CLASSE:
ELEMENTOS VISUAIS OBRIGATÓRIOS:
ELEMENTOS QUE NÃO DEVEM APARECER:
```

Se alguma informação não estiver definida, usar:

**[NÃO DEFINIDO — AGUARDAR APROVAÇÃO]**

Não inventar automaticamente clã, poderes, espécie, história, rota ou classe.

---

# 3. Contexto visual do FOWLGEN WARS

Crie uma **character design sheet profissional de jogo hero-shooter / Mini-MOBA estilizado**, projetada para servir como referência real de produção 3D.

A direção visual deve combinar:

- fantasia estilizada;
- leitura rápida em câmera isométrica/top-down;
- proporções exageradas;
- silhuetas imediatamente reconhecíveis;
- formas grandes e limpas;
- materiais claramente distinguíveis;
- armaduras e acessórios com design robusto;
- cores saturadas;
- acabamento de concept art AAA;
- aparência 3D pintada / stylized semi-realista;
- anatomia estilizada, nunca hiper-realista;
- detalhes concentrados em regiões importantes;
- menor densidade de detalhes em áreas pouco visíveis durante gameplay.

O personagem precisa funcionar tanto em:

- render promocional;
- seleção de personagem;
- tela de perfil;
- câmera isométrica do jogo;
- animações rápidas;
- leitura mobile.

## Direção de câmera

O design deve considerar que o personagem será visto frequentemente de cima em ângulo isométrico.

Portanto, priorizar:

- cabeça;
- ombros;
- armas;
- escudo;
- capa;
- chapéus;
- asas;
- efeitos;
- silhueta lateral;
- cores de equipe;
- elementos grandes reconhecíveis.

Pequenos detalhes escondidos na cintura, sola dos pés ou interior da armadura devem ser secundários.

---

# 4. Prompt mestre

```text
Crie uma CHARACTER DESIGN SHEET profissional para o universo FOWLGEN WARS.

O resultado deve representar um personagem de um Mini-MOBA / hero-shooter mobile estilizado, pronto para orientar concept art, modelagem 3D, texturização, rig, animação e implementação na Unity.

FORMATO:
- prancha vertical;
- fundo bege claro limpo #EDE9E3;
- iluminação suave de estúdio;
- arte 3D pintada / stylized semi-realista;
- acabamento polido de concept art AAA;
- cores saturadas;
- materiais legíveis;
- proporções exageradas;
- forte leitura de silhueta;
- design adequado para câmera isométrica/top-down.

--------------------------------------------------
## IDENTIDADE DO PERSONAGEM

Nome: [NOME]
Gênero: [GÊNERO]
Alinhamento: [HERÓI / VILÃO / OUTRO]

Raça/Espécie: [ESPÉCIE]
Subespécie/Fusão genética: [SE EXISTIR]
Alterações provocadas pela Guerra do Caos:
[DESCREVER SOMENTE SE DEFINIDO]

Clã/Civilização/Cultura:
[CLÃ / CIVILIZAÇÃO / CULTURA]

Região/Origem:
[ORIGEM]

Período/Tema:
[MEDIEVAL / ANTIGO / ORIENTAL / NÓRDICO / ESPACIAL / FUTURISTA / PÓS-APOCALÍPTICO / OUTRO]

Função:
[FUNÇÃO]

Classe:
[CLASSE]

Rota:
[TOP / MID / JUNGLE-HUNTER / ADC / SUPORTE]

Personalidade:
[PERSONALIDADE]

Essência/Fonte de poder:
[SE DEFINIDA]

--------------------------------------------------
## ANATOMIA E PROPORÇÕES

Porte físico:
[DESCRIÇÃO]

Altura aparente:
[BAIXO / MÉDIO / ALTO / GIGANTE]

Proporções:
[DESCREVER CABEÇA, TORSO, BRAÇOS, PERNAS, MÃOS, PÉS]

Postura:
[DESCREVER]

Centro de gravidade:
[BAIXO / MÉDIO / ALTO]

Forma de movimentação:
[PESADA / ÁGIL / ELEGANTE / FURTIVA / FLUTUANTE / OUTRA]

O corpo deve comunicar a classe antes mesmo de o jogador observar armas ou interface.

--------------------------------------------------
## SILHUETA

Desenvolva uma silhueta única e reconhecível.

Defina:
- forma dominante;
- largura dos ombros;
- volume do torso;
- relação torso/pernas;
- tamanho das mãos;
- tamanho das armas;
- extensão de capas, caudas, penas, asas ou acessórios;
- assimetrias importantes;
- elemento visual que permita reconhecer o personagem apenas pela sombra.

Evitar silhuetas genéricas.

--------------------------------------------------
## ROSTO E EXPRESSÃO

Formato da cabeça:
[DESCREVER]

Olhos:
[COR / FORMATO / EXPRESSÃO]

Bico/Focinho/Boca:
[DESCREVER CONFORME ESPÉCIE]

Cabelo/Crista/Chifres/Orelhas:
[DESCREVER]

Expressão base:
[DESCREVER]

O rosto deve continuar legível em miniatura e manter identidade consistente em todas as vistas.

--------------------------------------------------
## ARMADURA E ROUPAS

Descrever por camadas:

1. roupa base;
2. proteção do torso;
3. ombreiras;
4. braços;
5. manoplas;
6. cintura;
7. quadril;
8. pernas;
9. botas/patas;
10. capa/tabardo/cachecol;
11. ornamentos;
12. acessórios narrativos.

Cada peça deve:
- possuir função visual clara;
- seguir a cultura e período definidos;
- respeitar a classe;
- evitar peças excessivamente finas;
- ser plausível para modelagem 3D;
- funcionar em animação.

--------------------------------------------------
## ARMAS E EQUIPAMENTOS

Arma principal:
[ARMA]

Arma secundária:
[ARMA]

Equipamento de classe:
[EQUIPAMENTO]

Escudo/artefato/invocação:
[SE APLICÁVEL]

Explique:
- forma;
- proporção em relação ao corpo;
- material;
- mecanismo;
- empunhadura;
- região onde fica quando não utilizada;
- elemento visual de destaque.

--------------------------------------------------
## PALETA E MATERIAIS

Paleta principal:
[CORES]

Paleta secundária:
[CORES]

Cor de destaque:
[COR]

Materiais:
- metal;
- tecido;
- couro;
- madeira;
- osso;
- pedra;
- cristal;
- energia;
- penas/pelo/escamas;
- outros.

Os materiais devem apresentar diferenças claras de:
- brilho;
- rugosidade;
- textura;
- espessura;
- desgaste.

--------------------------------------------------
## EMBLEMAS E IDENTIDADE

Emblema pessoal:
[EMBLEMA]

Símbolo da classe:
[SÍMBOLO]

Símbolo do clã:
[SÍMBOLO]

Aplicar símbolos de forma coerente em:
- escudo;
- cinto;
- tabardo;
- ombreira;
- arma;
- acessório principal.

Evitar repetir o emblema em excesso.

--------------------------------------------------
## LAYOUT DA PRANCHA

1. TOPO ESQUERDO
Logo/emblema + nome do personagem em letras grandes e grossas.
Classe abaixo em letras menores.

2. HERO RENDER
Grande render no lado esquerdo ocupando aproximadamente 55% da largura.
Pose dinâmica representativa da classe.
Vista 3/4 frontal.
Personagem inteiro.
Sombra suave no chão.

3. TURNAROUND
Grade 2x2:
- FRONT
- SIDE
- BACK
- 3/4

Mesma escala.
Mesmas proporções.
Mesma roupa.
Mesmas armas.
Pose neutra de produção.
Braços levemente afastados.
Sem perspectiva exagerada.

4. EQUIPMENT BREAKDOWN
Seis close-ups.
Os itens devem ser escolhidos conforme a classe do personagem.

5. SILHOUETTES
Quatro silhuetas:
- 01 NEUTRAL
- 02 MOVEMENT
- 03 ATTACK
- 04 CLASS POSE

6. EXPRESSIONS
Quatro retratos:
- NEUTRAL
- DETERMINED
- ANGRY
- VICTORY

7. COLOR & MATERIALS
Amostras separadas dos principais materiais.

8. IN-GAME VIEW
Três miniaturas em perspectiva isométrica:
- IDLE
- MOVE
- SKILL

A miniatura SKILL deve apresentar claramente o efeito característico da classe.

--------------------------------------------------
## TIPOGRAFIA

Títulos de seção:
- caixa alta;
- sans-serif fina;
- espaçamento largo;
- cinza escuro;
- linha fina separadora.

Exemplo:
E Q U I P M E N T   B R E A K D O W N

Legendas:
- pequenas;
- centralizadas;
- caixa alta.

--------------------------------------------------
## CONSISTÊNCIA OBRIGATÓRIA

O personagem deve ser IDÊNTICO em todas as vistas.

Manter:
- proporções;
- cores;
- materiais;
- armadura;
- armas;
- número de acessórios;
- emblemas;
- espécie;
- detalhes faciais.

Os close-ups devem corresponder ao hero render.

Não alterar equipamentos entre FRONT, SIDE, BACK e 3/4.

Não criar peças novas somente para preencher a prancha.

Sem texto extra.
Sem marca d'água.
Sem personagens adicionais.
Sem alteração de espécie.
Sem troca de classe.
Sem mistura aleatória de períodos históricos.
```

---

# 5. Linguagem visual por rota e classe

A classe deve alterar **silhueta, postura, equipamento, proporção e animação percebida**, e não apenas a arma.

---

# 5.1 TOP — Tanques, Colossos, Titãs e Parrudos

## Função

Absorver dano, iniciar combate, ocupar espaço, bloquear passagem e proteger aliados.

## Linguagem visual

- silhueta larga;
- centro de gravidade baixo;
- torso grande;
- ombros largos;
- mãos e pés robustos;
- pernas relativamente curtas;
- equipamentos pesados;
- formas geométricas grandes;
- poucos elementos finos;
- sensação de peso.

### TANQUE

Características:
- defesa e proteção;
- escudo, placas ou armadura pesada;
- postura fechada e resistente.

Equipment Breakdown sugerido:

```text
SHIELD
SHOULDER
GAUNTLET
BELT
LEG ARMOR
TABARD / CHEST
```

Pose:
- escudo à frente;
- pernas afastadas;
- corpo inclinado ligeiramente para frente.

### COLOSSO

Características:
- muito maior visualmente;
- braços enormes;
- armadura parcial;
- sensação de força bruta.

Equipamentos:

```text
FIST / WEAPON
SHOULDER
CHEST ARMOR
BELT
LEG ARMOR
BACK DETAIL
```

### TITÃ

Características:
- presença quase monumental;
- formas verticais e pesadas;
- elementos míticos;
- placas maiores que as de um Tank comum.

### PARRUDO / BRUISER DEFENSIVO

Características:
- menos proteção que Tank;
- mais mobilidade;
- mistura de armadura e anatomia aparente;
- braços fortes;
- arma corpo a corpo.

---

# 5.2 MID — Magos, Bruxos, Feiticeiros e Assassinos

## Função

Dano explosivo, magia, controle de área ou eliminação rápida.

## Linguagem geral

- silhueta mais vertical;
- roupas, capas, energia e ornamentos;
- mãos, olhos, cajados e armas devem receber destaque;
- leitura visual forte de poder sobrenatural.

### MAGO

Características:
- foco em controle e magia;
- postura confiante;
- cajado, grimório, orbe ou catalisador.

Equipamentos:

```text
STAFF
FOCUS / ORB
MANTLE
BELT
BOOTS
MAGIC RELIC
```

### BRUXO

Características:
- magia mais agressiva ou proibida;
- silhueta assimétrica;
- talismãs;
- runas;
- materiais escuros;
- efeitos sobrenaturais.

Equipamentos:

```text
CATALYST
MASK / HEADPIECE
TALISMAN
BELT
GLOVES
RELIC
```

### FEITICEIRO

Características:
- poder mágico vindo do próprio personagem;
- menos dependência de armas;
- mãos e efeitos mágicos destacados;
- roupas mais leves.

### ASSASSINO

Características:
- corpo mais estreito;
- postura baixa;
- linhas diagonais;
- armas curtas;
- máscara, capuz ou lenço;
- sensação de velocidade.

Equipamentos:

```text
BLADES
MASK
SHOULDER
BELT
BOOTS
SCARF / CLOAK
```

---

# 5.3 JUNGLE / HUNTER — Caçadores e Lutadores

## Função

Circular pelo mapa, perseguir inimigos, emboscar e aproveitar oportunidades.

## Linguagem visual

- silhueta atlética;
- postura inclinada para frente;
- equipamentos utilitários;
- bolsas;
- cordas;
- troféus;
- armas adaptadas à perseguição;
- leitura forte de mobilidade.

### HUNTER

Características:
- rastreamento;
- armadilhas;
- equipamentos de sobrevivência;
- troféus de caça.

Equipamentos:

```text
MAIN WEAPON
TRAP
HUNTER GEAR
BELT
BOOTS
TROPHY
```

### CAÇADOR

Pode enfatizar:
- arco;
- lança;
- besta;
- machado;
- armas híbridas.

### LUTADOR

Características:
- corpo atlético ou musculoso;
- armadura média;
- punhos ou arma curta;
- mobilidade alta;
- equilíbrio entre resistência e dano.

Equipamentos:

```text
WEAPON
GAUNTLET
SHOULDER
BELT
KNEE ARMOR
BOOTS
```

---

# 5.4 ADC — Atiradores, Snipers e Artilheiros

## Função

Causar dano consistente à distância.

## Linguagem visual

- silhueta orientada pela arma;
- tronco menos pesado;
- braços preparados para mira;
- munição visível;
- equipamento técnico;
- postura com leitura direcional.

### ATIRADOR

Características:
- arma média ou longa;
- boa mobilidade;
- silhueta equilibrada.

Equipamentos:

```text
PRIMARY WEAPON
AMMO
GLOVE
BELT
BOOTS
SIGHT / ACCESSORY
```

### SNIPER

Características:
- arma longa;
- silhueta fina;
- mira;
- capa ou elemento de ocultação;
- postura disciplinada.

Equipamentos:

```text
SNIPER WEAPON
SCOPE
AMMO
CLOAK
BELT
BOOTS
```

### ARTILHEIRO

Características:
- arma muito grande;
- munição pesada;
- mochila ou mecanismo de energia;
- postura compensando o peso.

Equipamentos:

```text
HEAVY WEAPON
AMMO SYSTEM
BACKPACK
GAUNTLET
BELT
LEG SUPPORT
```

### ATIRADOR DE LONGO ALCANCE

Priorizar:
- leitura clara da arma;
- design que comunique precisão;
- silhueta que permaneça identificável em câmera isométrica.

---

# 5.5 SUPORTE — Protetores, Invocadores e Curandeiros

## Função

Proteger, fortalecer, curar, criar escudos ou invocar unidades.

## Linguagem visual

- postura aberta;
- elementos circulares;
- símbolos de proteção;
- cores secundárias mais luminosas;
- equipamentos menos agressivos;
- leitura visual de utilidade.

### PROTETOR

Características:
- escudo mágico ou físico;
- barreiras;
- placas médias;
- postura defensiva.

Equipamentos:

```text
SHIELD / FOCUS
SHOULDER
GAUNTLET
BELT
BOOTS
PROTECTION RELIC
```

### INVOCADOR

Características:
- catalisadores;
- totens;
- grimórios;
- criaturas ou símbolos;
- silhueta acompanhada de elementos orbitais.

Equipamentos:

```text
SUMMON FOCUS
GRIMOIRE
TOTEM
BELT
GLOVES
SUMMON RELIC
```

### CURANDEIRO

Características:
- formas suaves;
- materiais claros;
- símbolos de restauração;
- frascos, cajado ou dispositivo.

Equipamentos:

```text
HEALING FOCUS
STAFF / DEVICE
POTION / MODULE
BELT
GLOVES
BOOTS
```

### SUPORTE DEFENSIVO

Características:
- mistura entre Tank leve e suporte;
- escudos;
- barreiras;
- equipamento de proteção de equipe.

---

# 6. Raças e espécies

Todos os personagens do universo podem ter sofrido alterações provocadas pela **Guerra do Caos**, porém essas alterações devem ser definidas individualmente.

## Aves

Exemplos:

- galinha;
- galo;
- pato;
- ganso;
- marreco;
- harpia;
- outras aves.

## Animais

Exemplos:

- raposa;
- jacaré;
- javali;
- outras espécies.

## Povos e espécies fantásticas

Exemplos:

- elfos;
- orcs;
- ogros;
- duendes;
- anões;
- outras espécies.

### Regra

Espécie não define classe.

Um galo pode ser Tank, Mago, Assassin, Hunter, ADC ou Support.

---

# 7. Clãs, civilizações e culturas

Podem existir:

## Clãs

- Ninja;
- Samurai;
- Caçadores;
- Penas Duras;
- outros.

## Civilizações

- Egípcios;
- Romanos;
- Nórdicos;
- Templários;
- outras.

## Organizações

- militares;
- mercenários;
- ordens mágicas;
- grupos tecnológicos;
- facções.

A cultura deve influenciar:

- arquitetura da armadura;
- ornamentos;
- tecidos;
- armas;
- emblemas;
- penteados;
- materiais;
- padrões gráficos.

Não deve definir automaticamente espécie ou classe.

---

# 8. Períodos e temas

## Medieval

Elementos possíveis:
- placas;
- couro;
- cota;
- espadas;
- escudos;
- brasões.

## Antigo

Pode incluir:
- Egito;
- Roma;
- outras civilizações.

## Oriental

Pode incluir:
- ninjas;
- samurais;
- tecidos sobrepostos;
- lâminas;
- máscaras.

## Nórdico

Pode incluir:
- runas;
- peles;
- metal;
- madeira;
- mitologia.

## Espacial

Pode incluir:
- trajes pressurizados;
- tecnologia orbital;
- hologramas;
- módulos.

## Futurista

Pode incluir:
- cybertecnologia;
- armas energéticas;
- armaduras avançadas;
- componentes mecânicos.

## Pós-apocalíptico

Pode incluir:
- sucata;
- remendos;
- equipamentos improvisados;
- desgaste intenso.

### Regra de combinação

Pode haver fusões temáticas, mas devem ser deliberadas.

Exemplo válido:

```text
Samurai + Futurista
```

Exemplo inadequado:

Misturar aleatoriamente Viking, Egípcio, Samurai e Cyberpunk no mesmo personagem sem justificativa visual ou narrativa.

---

# 9. Regras para personagens geneticamente modificados pela Guerra do Caos

Quando aplicável, definir:

- alteração anatômica;
- mutação;
- aumento de força;
- aumento de tamanho;
- capacidade mágica;
- bioluminescência;
- prótese;
- integração tecnológica;
- alteração de penas/pelo/escamas;
- capacidade especial.

A modificação deve:

1. ser visualmente legível;
2. não apagar a espécie original;
3. possuir função narrativa ou de gameplay;
4. aparecer de forma consistente na prancha;
5. poder ser reproduzida em 3D.

---

# 10. Critérios para modelagem 3D

O concept deve evitar elementos impossíveis ou desnecessariamente complexos.

Priorizar:

- volumes grandes;
- partes claramente separáveis;
- acessórios modeláveis;
- espessura real de armaduras;
- pontos de articulação livres;
- braços afastados do torso no turnaround;
- mãos visíveis;
- pernas separadas;
- armas completas;
- interior do escudo simplificado;
- ausência de interpenetrações graves.

## Separação sugerida de meshes

```text
Head
Eyes
Beak / Mouth
Hair / Crest / Horns
Torso
Arm_L
Arm_R
Forearm_L
Forearm_R
Hand_L
Hand_R
Leg_Thigh_L
Leg_Thigh_R
Leg_Shin_L
Leg_Shin_R
Foot_L
Foot_R
Shoulder_L
Shoulder_R
Gauntlet_L
Gauntlet_R
Belt
Tabard
Cape
Weapon
Shield
Accessories
Tail / Feathers
```

Não é obrigatório usar exatamente esses nomes, mas a prancha deve facilitar essa separação.

---

# 11. Regras para câmera mobile/isométrica

O personagem deve ser reconhecível mesmo em tamanho pequeno.

Priorizar o contraste entre:

- cabeça;
- ombros;
- arma;
- escudo;
- capa;
- cauda;
- efeitos;
- cores principais.

Evitar depender de:

- inscrições pequenas;
- detalhes minúsculos;
- texturas finas;
- pequenos símbolos invisíveis à distância.

A vista IN-GAME deve provar que o design continua legível.

---

# 12. Lista atual de personagens

## Masculinos — Heróis

- Milo
- Cody
- Ollie
- Ren
- Ken
- Haru
- Kaito

## Masculinos — Vilões

- Otto
- Axel
- Jin
- Kage
- Kuro

## Femininos — Heroínas

- Mel
- Maya
- Nina
- Luna
- Ruby
- Daisy
- Mei
- Yume
- Hina

## Femininos — Vilãs

- Eva
- Hex
- Saya
- Yami
- Jing

**Total: 26 personagens.**

### Regra para esta lista

A lista acima determina apenas:

- nome;
- gênero;
- alinhamento.

Não inferir automaticamente:

- espécie;
- clã;
- civilização;
- período;
- classe;
- rota;
- essência;
- personalidade;
- poderes;
- arma.

Esses campos devem ser aprovados individualmente.

---

# 13. Exemplo oficial — Milo

```text
Nome: MILO
Classe: TANK
Rota: TOP

Espécie:
Galo antropomórfico.

Descrição:
Galo extremamente musculoso, torso enorme, pernas curtas e robustas,
postura imponente e levemente curvada, expressão determinada.

Função visual:
Ser imediatamente reconhecido como linha de frente e defensor.

Armadura:
Ombreiras grandes;
braçadeiras e manoplas em aço cinza;
bordas metálicas douradas;
cinto de couro marrom;
fivela hexagonal;
tabardo azul;
proteção pesada nas pernas.

Equipamento principal:
Escudo oval grande azul com borda dourada.

Paleta:
Azul escuro #1C3F8F
Azul médio #2F6FD0
Dourado metálico
Aço cinza
Couro marrom
Branco/creme
Vermelho

Emblema:
Asas douradas.

Personalidade:
Protetor, firme e valente.
```

## Silhueta do Milo

- ombros extremamente largos;
- cabeça relativamente pequena;
- torso em formato de V;
- cintura menor que o peito;
- braços grandes;
- manoplas pesadas;
- pernas curtas;
- pés robustos;
- escudo grande dominando um lado da silhueta.

## Equipment Breakdown

```text
SHIELD
SHOULDER
GAUNTLET
BELT
LEG ARMOR
TABARD
```

---

# 14. Modelo para criação de novos personagens

Copiar este bloco antes de gerar qualquer novo personagem:

```text
NOME:
GÊNERO:
ALINHAMENTO:

RAÇA / ESPÉCIE:
FUSÃO / MUTAÇÃO:
EFEITO DA GUERRA DO CAOS:

CLÃ:
CIVILIZAÇÃO:
CULTURA:
REGIÃO:

PERÍODO / TEMA:

ROTA:
FUNÇÃO:
CLASSE:

PERSONALIDADE:
ESSÊNCIA:
PODER:

PORTE FÍSICO:
POSTURA:
SILHUETA:

ARMA PRINCIPAL:
ARMA SECUNDÁRIA:
EQUIPAMENTO DE CLASSE:

PALETA:
MATERIAIS:

EMBLEMA PESSOAL:
EMBLEMA DO CLÃ:
SÍMBOLO DA CLASSE:

ELEMENTOS OBRIGATÓRIOS:
ELEMENTOS PROIBIDOS:
```

---

# 15. Checklist de validação da prancha

Antes de aprovar uma geração, conferir:

## Identidade

- [ ] Nome correto.
- [ ] Classe correta.
- [ ] Rota correta.
- [ ] Espécie correta.
- [ ] Cultura correta.
- [ ] Tema correto.
- [ ] Personalidade perceptível.

## Consistência visual

- [ ] FRONT, SIDE, BACK e 3/4 representam exatamente o mesmo personagem.
- [ ] Armadura permanece igual.
- [ ] Armas permanecem iguais.
- [ ] Número de dedos/garras/penas/chifres permanece igual.
- [ ] Cores permanecem iguais.
- [ ] Emblemas permanecem iguais.

## Gameplay

- [ ] Classe é reconhecível pela silhueta.
- [ ] Rota é compatível com o design.
- [ ] Personagem é legível em câmera isométrica.
- [ ] Arma principal pode ser identificada à distância.
- [ ] Elemento mais importante não fica escondido.

## Produção 3D

- [ ] Turnaround possui vistas úteis.
- [ ] Braços estão afastados do corpo.
- [ ] Armas não escondem completamente o torso em todas as vistas.
- [ ] Equipamentos possuem espessura.
- [ ] Não há acessórios impossíveis de interpretar.
- [ ] Materiais estão claramente diferenciados.
- [ ] Close-ups correspondem ao modelo principal.

---

# 16. Fórmula definitiva de criação

```text
QUEM É?
→ Raça / Espécie

DE ONDE VEM?
→ Clã / Civilização / Cultura

QUAL É O CONTEXTO VISUAL?
→ Período / Tema

O QUE FAZ NA BATALHA?
→ Função

COMO LUTA?
→ Classe

ONDE LUTA?
→ Rota

QUEM ELE É COMO INDIVÍDUO?
→ Personalidade

O QUE O TORNA ÚNICO?
→ Silhueta + Equipamento + Emblema + Poder
```

Essa estrutura permite expandir o elenco sem transformar o universo em uma coleção de conceitos desconectados.

---

# 17. Princípio de progressão do jogo

A criação dos personagens deve coexistir com uma ideia central do FOWLGEN WARS:

> **Toda partida precisa entregar sensação de progresso. O jogador nunca deve terminar uma partida sentindo que não ganhou nada.**

Isso pode influenciar futuramente:

- progressão visual;
- skins;
- emblemas;
- maestria;
- equipamentos cosméticos;
- evolução narrativa;
- recompensas;
- desbloqueios;
- coleções.

Esses elementos não devem alterar automaticamente o design base sem aprovação.
