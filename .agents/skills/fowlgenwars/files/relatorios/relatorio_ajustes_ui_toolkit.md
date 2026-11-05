# Relatório Técnico de Atualização e Otimização de Telas (UI Toolkit)

**Projeto:** Fowlgen Wars  
**Data:** 11/10/2026  
**Escopo:** Padronização visual, responsividade mobile, correção de telas pretas e enquadramento de artes das telas de interface do jogo em UI Toolkit.

---

## 1. Contexto e Objetivos

O projeto utiliza o **Unity UI Toolkit** com renderização voltada para dispositivos móveis (Landscape). Durante as sessões de desenvolvimento e testes no **Unity Device Simulator**, foram identificados e resolvidos os seguintes pontos críticos:
1. **Diferenças de escala e renderização** entre o UI Builder / Game View e o Device Simulator.
2. **Telas pretas no Device Simulator** nas cenas de resultado (`Derrota.unity` e `Vitoria.unity`), apesar de visualmente normais dentro do UI Builder.
3. **Cortes de arte e logos nos cantos de tela** (em especial a marca "GSB Studios" na tela de autenticação `Auth.uxml` em celulares modernos com aspect ratio largo ou notch/bordas curvas).
4. **Padronização e ampliação dos botões e badges** para touch mobile, mantendo tipografia nítida, contrastante e alinhada ao estilo Obsidian / Dourado / Ruby / Esmeralda.

---

## 2. Diagnóstico e Resolução Técnica

### 2.1. Configuração do PanelSettings (Escala Global)
- **Problema:** A UI utilizava dimensionamento não uniforme ou com modos de escala que distorciam os elementos entre diferentes resoluções.
- **Solução Implementada:**
  - Ambos os arquivos `PanelSettings.asset` (`Assets/Resources/UI/PanelSettings.asset` e `Assets/UI Toolkit/PanelSettings.asset`) foram parametrizados com:
    - `m_ScaleMode: 2` (Scale With Screen Size).
    - `m_ReferenceResolution: { x: 1920, y: 1080 }`.
    - `m_Match: 1.0` (Match Height).
  - Garante que a UI escale proporcionalmente em qualquer dispositivo mobile (16:9, 19.5:9, 20:9 e 21:9).

---

### 2.2. Correção de Tela Preta nas Cenas `Derrota.unity` e `Vitoria.unity`
- **Causa Raiz:** O componente `Camera` (Main Camera) das cenas continha `m_NormalizedViewPortRect` zerado (`width: 0, height: 0`).
  - No UI Builder a tela funcionava porque ele pré-visualiza o documento UXML de forma isolada;
  - No Game View e Device Simulator, a câmera tentava renderizar um retângulo de 0x0 pixels, resultando em tela 100% preta com apenas um artefato diminuto no canto.
- **Solução Implementada:**
  - Atualização dos arquivos de cena YAML para restaurar o viewport normal:
    ```yaml
    Camera:
      m_NormalizedViewPortRect:
        x: 0
        y: 0
        width: 1
        height: 1
    ```
  - Forçado repaint e reload de cena no Unity Editor, restabelecendo a renderização imediata de ambas as cenas no Simulador.

---

### 2.3. Eliminação da Faixa Escura Lateral em `Derrota.uxml`
- **Causa Raiz:** O elemento raiz `#screen` continha um estilo inline `style="width: 2086px;"` gravado acidentalmente pelo editor visual. Em telas maiores ou menores que 2086px, ocorria corte e sobra preta na lateral direita.
- **Solução Implementada:**
  - Remoção do estilo inline em `Derrota.uxml`, deixando a classe `.screen` controlar o layout via `width: 100%; height: 100%; flex-grow: 1;`.
  - A tela passou a preencher 100% da área útil do dispositivo automaticamente.

---

### 2.4. Resolução da Arte e Logo GSB Studios Cortada em `Auth.uxml`
- **Causa Raiz:** Em `Auth.uss`, a propriedade `-unity-background-scale-mode` estava definida como `scale-and-crop`.
  - Como a imagem original `bg_auth.jpeg` possui proporção 16:9 (1600x899) e os celulares modernos possuem telas ultra-wide (19.5:9 a 20:9), o modo `scale-and-crop` fazia zoom na imagem para preencher a largura e cortava mais de 130px do topo e da base.
  - Como o logo "GSB Studios" e o topo da logo "Fowlgen Wars" ficam próximos ao topo, as letras eram decepadas na borda superior.
- **Solução Implementada:**
  - Alterado o modo em `Auth.uss` para:
    ```css
    -unity-background-scale-mode: stretch-to-fill;
    ```
  - O fundo agora preenche 100% da viewport sem cortar um único pixel do topo, base ou laterais.
  - Remoção de estilos inline redundantes nos botões de `Auth.uxml` para manter a folha USS centralizada e limpa.

---

### 2.5. Padronização dos Botões Mobile e Tipografia dos Badges
- **Botões Touch Mobile (Auth, Play, Vitória, Derrota):**
  - Largura: `700px` (ou responsivo centralizado com max-width).
  - Altura: `100px`.
  - Tamanho de Fonte: `35px` bold.
  - Cantos arredondados: `20px` (primário) / `16px` (secundário).
  - Feedback tátil com estados `:hover` e `:active` (`scale: 0.96` ao tocar).
- **Badge de Recompensas (`Vitoria.uss` e `Derrota.uss`):**
  - Fundo estilo obsidian escuro com transparência elegante (`rgba(14, 20, 32, 0.92)` na Vitória e `rgba(18, 10, 14, 0.92)` na Derrota).
  - Borda luminosa de destaque (Dourada para Campeão, Rubi para Derrota).
  - Título do cabeçalho aumentado para `22px` bold com alto contraste, eliminando pixelização e blur.
  - Valores de recompensa aumentados para `32px` - `35px` bold para leitura rápida no celular.

---

## 3. Resumo dos Arquivos Modificados

| Arquivo | Modificação Realizada |
|---|---|
| `unity/Assets/Resources/UI/PanelSettings.asset` | Reference Resolution 1920x1080, Match Height 1.0, ScaleMode 2 |
| `unity/Assets/UI Toolkit/PanelSettings.asset` | Reference Resolution 1920x1080, Match Height 1.0, ScaleMode 2 |
| `unity/Assets/Scenes/Game/Derrota.unity` | Viewport Rect da Main Camera corrigido para width: 1, height: 1 |
| `unity/Assets/Scenes/Game/Vitoria.unity` | Viewport Rect da Main Camera corrigido para width: 1, height: 1 |
| `unity/Assets/Resources/UI/Derrota.uxml` | Removido width inline de 2086px; layout 100% flexível |
| `unity/Assets/Resources/UI/Derrota.uss` | Tipografia da badge otimizada (22px / 32px), botões mobile 700x100 |
| `unity/Assets/Resources/UI/Vitoria.uxml` | Estrutura semântica limpa sem overlay opaco |
| `unity/Assets/Resources/UI/Vitoria.uss` | Badges obsidian gold, botões 700x100 com fonte 35px |
| `unity/Assets/Resources/UI/Auth.uxml` | Limpeza de inline styles nos botões de conexão |
| `unity/Assets/Resources/UI/Auth.uss` | Modo `stretch-to-fill` para exibir arte e marca GSB Studios sem cortes |

---

## 4. Status Final
- Telas `Auth`, `Play`, `Vitoria` e `Derrota` validadas e renderizando de forma consistente tanto no UI Builder quanto no Unity Device Simulator.
- Elementos táteis otimizados para usabilidade em smartphones.
