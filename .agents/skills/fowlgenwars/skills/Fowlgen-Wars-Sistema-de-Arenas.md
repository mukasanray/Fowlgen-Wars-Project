# FOWLGEN WARS — Sistema de Arenas e Skins Temáticas

Documento de especificação do sistema de arenas cosméticas e temáticas, integrado à geometria competitiva padrão de 3 rotas e 18 torres ([`Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`](Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md)).

---

## 🌎 Conceito Central: Arenas Temáticas (Skins de Arena)

O **FOWLGEN WARS** adota o modelo de **Arena Base Única com Skins Temáticas**. 

> *"O campo de batalha muda. A guerra continua."*  
> *A arena muda de aparência, iluminação, atmosfera e elementos visuais — mas o layout competitivo e a navegação permanecem idênticos e imediatamente reconhecíveis.*

Isso viabiliza a criação de múltiplos mundos e experiências imersivas sem fragmentar a base competitiva ou exigir novos cálculos de balanceamento e navegação para cada tema.

---

## 🏟️ 1. Arenas Oficiais de Lançamento

### 🌾 1. Arena Galinheiro — Fazenda (Arena Clássica)
* **Tema:** O universo original e nativo do FOWLGEN.
* **Elementos Visuais:** Galinheiros (bases principais), cercas de madeira delimitando bordas, milharais, celeiros, silos de grãos, feno, caixas de ovos, poços de água, plantações, poças de lama, carrinhos de mão e espantalhos nas áreas de emboscada.
* **Atmosfera & Áudio:** Fazenda + Velho Oeste + Comédia. Sons de galinhas, canto de galo, rangido de porteiras, madeira quebrando, trilha com banjo e viola caipira.
* **Eventos Ambientais / Destrutíveis:** Cenário interativo com elementos de desgaste cosmético (Cerca → Caixa → Barril → Galinheiro → Celeiro).

---

### ⚔️ 2. Arena Medieval
* **Tema:** Campo de batalha épico dominado por galinhas guerreiras e fortalezas medievais.
* **Elementos Visuais:** Castelo nas bases, torres de pedra com ameias (substituindo as torres rústicas), muralhas externas, ponte levadiça nos cruzamentos de água, catapultas, estandartes/bandeiras dinâmicas, barris de pólvora, tochas acesas, ruínas e pedregulhos.
* **Atmosfera & Áudio:** Fantasia medieval épica com toque cômico. Trilha com tambores de guerra, fanfarras de cornetas, cordas clássicas e coral épico.
* **Evento Especial — Cerco ao Galinheiro:** Durante momentos de alta intensidade da partida (ex: queda da primeira torre), fragmentos de muralhas e ameias sofrem danos visuais de cerco.

---

### 🏺 3. Arena Egípcia
* **Tema:** Civilização ancestral do deserto transformada em arena de combate entre clãs avícolas.
* **Elementos Visuais:** Pirâmides ao fundo, esfinges com bico de ave, obeliscos como torres místicas, templos de arenito, dunas de areia nas bordas, palmeiras, sarcófagos, tochas douradas, estátuas de aves sagradas e hieróglifos brilhantes no piso das rotas.
* **Atmosfera & Áudio:** Mistério, aventura e humor. Trilha sonora com flautas tradicionais, percussão árabe/egípcia, cordas e efeitos de vento no deserto.
* **Evento Especial — Maldição do Faraó:** Evento visual atmosférico em que tempestades de areia sobem temporariamente ao fundo, revelando runas brilhantes nas rochas sem alterar colisões reais.

---

### 🥷 4. Arena Oriental — Samurai
* **Tema:** Japão feudal, jardins zen e estética samurai para guerreiros galináceos de elite.
* **Elementos Visuais:** Dojos nas bases, pagodes orientais, portões Torii nas entradas das lanes, cerejeiras em flor (sakura), lanternas de papel acesas, pontes vermelhas arqueadas sobre os rios, jardins de pedra, florestas de bambu e armaduras cerimoniais de galo samurai.
* **Atmosfera & Áudio:** Disciplina marcial, honra e agilidade. Instrumentos tradicionais: Taiko (percussão pesada), Shamisen, flautas Shakuhachi e efeitos metálicos de lâminas cortando o ar.
* **Evento Especial — Tempestade de Pétalas:** Rajadas de pétalas de cerejeira cruzam a arena enquanto a música ganha ritmo e eleva a tensão dos confrontos centrais.

---

### 🚀 5. Arena Futurista (Cyberpunk / High-Tech)
* **Tema:** FOWLGEN em uma metrópole tecnológica e futurista.
* **Elementos Visuais:** Plataformas de liga metálica nas rotas, hologramas de galinhas cibernéticas, painéis digitais piscantes, iluminação Neon nas bordas, drones de reconhecimento sobrevoando a arena, torres de energia de plasma, portais luminosos e estruturas suspensas no horizonte.
* **Atmosfera & Áudio:** Cyberpunk, batidas eletrônicas dinâmicas, sintetizadores, arpejos analógicos e alertas de sistemas digitais.
* **Evento Especial — Sobrecarga:** Entrando no terço final da partida, luzes da arena entram em alerta pulsante, ativando arcos voltaicos puramente estéticos nas torres energéticas.

---

### ☠️ 6. Arena do Caos
* **Tema:** A arena mais imprevisível e fragmentada, colidindo pedaços de todas as épocas e dimensões.
* **Elementos Visuais:** Ruínas colossais, crateras incandescentes, fragmentos de civilizações flutuando no vazio ao redor, portais de fenda dimensional, fogo místico, energia instável e escombros assimétricos.
* **Atmosfera & Áudio:** Fusão rítmica caótica misturando banjo, taiko tribal, sintetizadores distorcidos e efeitos de distorção cósmica.
* **Evento Especial — Modo Caos:** Efeitos visuais progressivos de colapso espacial ao redor da arena conforme torres caem, intensificando a imersão na reta final da partida.

---

## 🎨 Arquitetura do Sistema de Skins de Arena

A arena segue uma estrutura em camadas, preservando a lógica de graybox de [`Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`](Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md):

```text
┌─────────────────────────────────────────────────────────────┐
│                   ARENA BASE (GRAYBOX)                      │
│   (3 Rotas Fixas • 18 Torres • 2 Galinheiros • Simetria)    │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 SKIN TEMÁTICA (CAMADA VISUAL)               │
│  ├─ AMBIENTE & SKYBOX (Iluminação, céu, horizonte)         │
│  ├─ TEXTURAS & MATERIAIS (Piso, areia, água, grama)         │
│  ├─ PREFABS DECORATIVOS (Bordas, árvores/bambus, montanhas) │
│  ├─ PREFABS DE ESTRUTURA (Modelos de Torre e Base Galinheiro│
│  ├─ ÁUDIO (Trilha temática BGM e efeitos sonoros SFX)       │
│  └─ EVENTOS VISUAIS (Partículas cosméticas sem colisão)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Sistema de Variações de Clima e Turno (Horário)

Cada skin de arena pode comportar variações cosméticas:

* **🌾 Fazenda:** Fazenda Clássica (Diurna), Plantação (Outono), Fazenda Noturna (Luar), Fazenda Chuvosa.
* **⚔️ Medieval:** Castelo Ensolarado, Campo de Batalha (Bruma), Castelo Sombrio (Noite), Cerco em Chamas.
* **🏺 Egípcia:** Deserto ao Meio-Dia, Templo Oásis, Pirâmide Sob as Estrelas.
* **🥷 Samurai:** Primavera (Sakura), Noite do Luar Samurai, Inverno Nevado, Templo em Guerra.
* **🚀 Futurista:** Cidade Neon Noturna, Estação Espacial Orbital, Metrópole em Sobrecarga.
* **☠️ Caos:** Caos Elemental, Apocalipse Dimensional, Fragmentação Noturna.

---

## 🎮 Diretriz Mandatória: Fair Play & Zero Vantagem Competitiva

As skins de arena e suas variações climáticas são **estritamente cosméticas**:

$$\text{SKIN DE ARENA} = \text{Visual} + \text{Atmosfera} + \text{Áudio} + \text{Experiência}$$

### Proibições Absolutas:
* ❌ Nenhuma alteração na largura, colisão ou velocidade das 3 rotas.
* ❌ Nenhuma mudança no raio de alcance, hitbox ou vida das 18 torres.
* ❌ Nenhum obstáculo que bloqueie a navegação de tropas de forma diferente da Arena Base.
* ❌ Nenhum efeito que prejudique a legibilidade visual das barras de vida, magias e cores de equipe (conforme [`Fowlgen-Wars-Estudo-de-Cores.md`](Fowlgen-Wars-Estudo-de-Cores.md)).

---

## 🚀 Roteiro de Expansão Futura de Temas

* 🏴‍☠️ **Pirata / Ilha dos Corsários**
* 🦖 **Pré-Histórica / Era dos Dinossauros**
* 👽 **Alienígena / Bio-Planeta**
* 🧙 **Mágica / Floresta Encantada**
* 🧟 **Apocalipse Zumbi**
* 🏙️ **Cidade Moderna Urbana**
* 🌌 **Arena Gravidade Zero / Espacial**

---

## 🔗 Referências Relacionadas
* [`Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md`](Folwgen-Wars-Terreno-Mapa-3rota-3torres-cada.md): Geometria técnica, 3 rotas e 18 torres.
* [`Fowlgen-Wars-Estudo-de-Cores.md`](Fowlgen-Wars-Estudo-de-Cores.md): Regras de contraste cromático cenário vs personagens.
* [`Fowlgen-Wars-Biblioteca-Efeitos-Sonoros.md`](Fowlgen-Wars-Biblioteca-Efeitos-Sonoros.md): Repositórios e padrões de áudio SFX.
* [`🐔 Fowlgen-wars- Sistema-de-cores-essencias-e-classificacao.md`](%F0%9F%90%94%20Fowlgen-wars-%20Sistema-de-cores-essencias-e-classificacao.md): Identidade visual de essências e classes.
