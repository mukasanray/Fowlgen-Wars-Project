# Fowlgen Wars - Etapas de Desenvolvimento do MVP (Unity)

**Data Limite:** 10 de Outubro de 2026 (Meta Interna Hackathon)
**Foco:** Batalha Rápida (Solo vs IA), Multiplayer Híbrido, Build Cross-Platform (Mobile e WebGL) e Tela de Login.

## Lista de Assets 3D Necessários (Via Tripo3D)
Para que o mapa e os personagens fiquem prontos a tempo, a equipe precisará gerar e exportar (em formato `.fbx` ou `.obj`) os seguintes modelos via Tripo3D para importação na Unity:
1. **Personagem Principal (ADC):** Modelo com *rigging* básico para animações.
2. **Personagem Suporte (Duo):** Modelo auxiliar da dupla estratégica.
3. **Personagem Inimigo:** Para o teste de combate.
4. **Minion (Tropa):** Modelo genérico que receberá cor/material diferente para diferenciar aliado de inimigo.
5. **Galinheiro 3D (Base Principal):** O "Rei", estrutura grande para a base.
6. **Torre de Defesa:** Modelo base da torre, será replicado 18 vezes no mapa.
7. **Props de Cenário:** Árvore padrão, Pedra grande, Pedra pequena, e tufos de grama.
8. **Arena/Terreno:** Uma malha 3D base com as 3 rotas levemente demarcadas.

---

## Fase 1 - Interface, Setup Multiplataforma e Fundação Cinemática
**Objetivo:** Preparar a base visual e de rede sem o bloqueio do login ainda.

1. **Setup de Projeto e Asset Store:**
   - Importar **FishNet**, **Cinemachine** e o **Novo Input System**.
   - Baixar um **Joystick Pack** para o controle móvel/web.
2. **Cena Principal (MainMenu) e Vitrine:**
   - Botões de navegação e diorama 3D ao fundo.
   - Criar a câmera cinematográfica (Cinemachine) de vitrine para o vídeo de pitch.

---

## Fase 2 - Terreno 3D e Câmera de Gameplay (MOBA)
**Objetivo:** Montar a arena das 3 rotas e garantir visualização tática perfeita.

1. **Montagem da Arena:**
   - Importar o terreno, as Torres e os Galinheiros. Arredondar/suavizar colisores.
2. **Setup da Câmera de Gameplay (Cinemachine):**
   - **Posicionamento Isometrico/Top-Down:** `Offset X: 0, Y: 12, Z: -10` / `Rotação: X: 50, Y: 0, Z: 0`.
3. **Ambiente:**
   - Skybox e iluminação otimizadas para mobile.

---

## Fase 3 - Controles e Compilação Unificada
**Objetivo:** Integrar os personagens importados e garantir o movimento.

1. **Movimento (PlayerController.cs):**
   - Joystick virtual repassando inputs para o FishNet (`NetworkTransform`) comunicando os passos ao Servidor.
2. **Animação:**
   - Sincronizar estados do `Animator` com o `NetworkAnimator` do FishNet.

---

## Fase 4 - Sistema de Contas, UI de Autenticação (Penúltima Etapa)
**Objetivo:** Implementar o portão de entrada do jogo conectado ao banco de dados.

1. **Cena de Login:**
   - Criar a UI de Autenticação inicial. O botão de "Entrar" fará uma requisição Off-chain ao banco de dados. Somente após a validação o jogador acessa o Main Menu.

---

## Fase 5 - Resolução de QA e Deploy Google Play
**Objetivo:** Fechar o loop de combate funcional e gerar os formatos corretos de publicação.

1. **Resolução de Colisões (Testes do QA):**
   - Matriz de colisão para Minions e Torres, garantindo estabilidade.
2. **Build Final do MVP (Exportação Dupla):**
   - **Android (Testes):** Compilar em **`.apk`** (Android Package) para testes rápidos locais entre a equipe (sideload).
   - **Android (Publicação):** Compilar a versão definitiva em **`.aab`** (Android App Bundle), assinar com o *Keystore*, e entregar ao Jorge para o upload oficial na Google Play Console.
   - **WebGL (Site):** Compilar a versão exata que o Junior embutirá no frontend (Vercel) para rodar no navegador.
