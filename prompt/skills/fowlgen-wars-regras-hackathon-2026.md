# 🏛️ FOWLGEN WARS — Regras e Diretrizes do Hackathon 2026

## Colosseum Global Hackathon & Trilha Brasil (Superteam Brasil)

Este documento compila as regras oficiais, critérios de avaliação, requisitos de submissão e o checklist operacional para a submissão do projeto **FOWLGEN WARS** no **Colosseum Hackathon 2026** e na **Trilha Regional da Superteam Brasil**.

---

## 1. Visão Geral da Competição

* **Organização Global:** [Colosseum](https://colosseum.com/arena/hackathon) (plataforma oficial de hackathons, aceleradora e fundo de investimento do ecossistema Solana).
* **Parceiro Regional:** [Superteam Brasil](http://hackathon.superteam.com.br/h/colosseum-2026/) (Hub oficial da comunidade Solana no Brasil).
* **Objetivo:** Construir e lançar produtos de alto impacto e funcionalidade real na blockchain Solana. Os projetos vencedores concorrem a premiações em dinheiro (USDC/SOL) e à admissão no programa de aceleração da Colosseum (com investimento pré-seed de US$ 250.000).
* **Concorrência Dupla:** Participantes brasileiros inscritos na plataforma global que vincularem sua participação pela Superteam Brasil concorrem **simultaneamente** aos prêmios globais da Colosseum e aos prêmios exclusivos da Trilha Brasil (pagos via *Superteam Earn*).

---

## 2. Requisitos Obrigatórios de Elegibilidade

1. **Projeto Inédito / Não Financiado:**
   * O projeto não pode ter levantado rodadas institucionais de venture capital antes do início do hackathon.
   * Não é permitida a submissão de projetos idênticos previamente submetidos a hackathons passados da Solana sem evolução técnica substancial e evidente.
2. **Desenvolvimento no Período:**
   * O trabalho submetido deve refletir desenvolvimento ativo durante o ciclo do hackathon, comprovado pelo histórico de commits no repositório.
3. **Membros da Equipe:**
   * Cada participante só pode fazer parte de **uma única equipe** submetida.
   * Todos os integrantes ativos (G5B Studios: Samuel, Marcos, Alexandre, Emanoel, Junior, Maria Clara, Ramiro) devem ter perfil cadastrado na plataforma Colosseum e na Superteam.
4. **Respeito à Propriedade Intelectual e Segurança:**
   * É estritamente proibido incluir chaves privadas (*private keys*) ou frases de recuperação (*seed phrases*) no repositório, histórico Git ou vídeos.
   * Todo código proprietário e ativos de terceiros devem respeitar licenças legais de uso.

---

## 3. Requisitos Obrigatórios de Submissão

Para que a submissão seja homologada e avaliada pelos juízes, os seguintes itens devem ser entregues impreterivelmente até o prazo final:

### 3.1 Vídeo de Pitch & Demonstração (O Elemento Mais Crítico)
* **Tempo Máximo Estrito:** **No máximo 3 minutos** (180 segundos). Vídeos com mais de 3 minutos são sumariamente penalizados ou desclassificados.
* **Estrutura Recomendada do Vídeo (Fórmula Vencedora):**
  1. *Problema & Gancho (0:00 - 0:30):* O mercado mobile precisa de MOBAs rápidos, divertidos e com posse real de itens sem pay-to-win predatório.
  2. *Solução — Fowlgen Wars (0:30 - 1:00):* Mini-MOBA de 3 minutos, tema de galinhas guerreiras, 3 rotas e combate dinâmico.
  3. *Demo ao Vivo do Jogo (1:00 - 2:00):* Mostrar a partida rodando na Unity (geração de tropas pelo Galinheiro, avanço pelas rotas, confronto e destruição).
  4. *Integração Solana ao Vivo (2:00 - 2:35):* Conexão de wallet Devnet via Solana Unity SDK, reconhecimento de NFT/skin e instrução executada no smart contract Anchor (`fowlgen_wars_contract`) com link para o Solana Explorer.
  5. *Equipe, Roadmap & Futuro (2:35 - 3:00):* Equipe G5B Studios, foco na Solana Mobile DApp Store (Seeker/Saga) e convite aos jurados para testar.

### 3.2 Repositório de Código (GitHub)
* Repositório público (ou com acesso fornecido aos avaliadores).
* Estrutura organizada contendo o projeto Unity e o programa Anchor (`program/`).
* Arquivo `README.md` exemplar, contendo:
  * Descrição clara da proposta de valor.
  * Instruções passo a passo para compilar e rodar o projeto localmente.
  * Rede utilizada (Solana Devnet).
  * Program ID do contrato Anchor implantado e links de transações de exemplo.

### 3.3 Build Executável / Demo Jogável
* Link direto para download do APK Android (ou link para build WebGL hospedada).
* Os avaliadores devem ser capazes de instalar ou abrir o jogo e testar a partida.

### 3.4 Informações de Negócio
* Título, descrição curta (até 50 caracteres para listagem) e resumo executivo.
* Tese de sustentabilidade (como o jogo pretende crescer após o hackathon).

---

## 4. Critérios Oficiais de Avaliação (Judging Criteria)

Os jurados (formados pelo time da Colosseum, líderes da Solana Foundation, investidores e fundadores do ecossistema) avaliam os projetos com base em 5 critérios principais:

| Critério | Peso / Foco | O que os Juízes Avaliam no FOWLGEN WARS |
| :--- | :--- | :--- |
| **1. Qualidade Técnica & Execução** | Muito Alto | O jogo roda sem travamentos? O código Unity (C#) e Anchor (Rust) é bem estruturado? A simulação das 3 rotas e colisão funciona? |
| **2. Integração com a Solana** | Muito Alto | Há justificativa real para usar a Solana? O jogo usa Solana Unity SDK, Anchor e Devnet de forma funcional? A arquitetura respeita velocidade off-chain com posse on-chain? |
| **3. Inovação & Originalidade** | Alto | O jogo se destaca da média de clones cripto genéricos? A temática cômica de aves, o formato Mini-MOBA de 3 minutos e o sistema de bombas trazem frescor ao gênero? |
| **4. Impacto de Mercado & Potencial** | Alto | O produto tem viabilidade econômica? Consegue atrair jogadores Web2 convencionais? Está posicionado para o ecossistema Solana Mobile (Saga/Seeker)? |
| **5. Pitch & Demonstração** | Alto | O vídeo de até 3 minutos foi conciso, profissional e persuasivo? A demo comprovou o funcionamento real do jogo? |

---

## 5. Diferenciais e Prêmios da Trilha Brasil (Superteam Brasil)

1. **Premiação Regional:** Premiação em USDC para os melhores colocados sediados no Brasil.
2. **Mentoria & Suporte Local:** Acesso às sessões de *the/Garage*, mentorias técnicas e revisão de pitch decks antes da submissão final.
3. **Distribuição via Superteam Earn:** Os membros devem possuir contas verificadas na plataforma *Earn* para recebimento das premiações.
4. **Visibilidade:** Projetos de destaque na Trilha Brasil ganham projeção nas redes oficiais da Superteam Brasil e palco para investidores locais.

---

## 6. Checklist Operacional do FOWLGEN WARS para o Hackathon

- [ ] **Gameplay Core Pronto (Unity):**
  - [ ] Cena `Arena3Lanes` funcional.
  - [ ] Galinheiros gerando Minions com cadência ajustável.
  - [ ] Minions avançando pelas 3 rotas sem atravessar barreiras.
  - [ ] Combate com colisão e dano funcional.
  - [ ] Condição de fim de jogo (derrota do Galinheiro adversário).
- [ ] **Integração Solana (Devnet):**
  - [ ] Conexão de wallet na interface do jogo.
  - [ ] Consulta a ativo on-chain (reconhecimento de skin NFT).
  - [ ] Transação com o contrato Anchor (`fowlgen_wars_contract`) confirmada no Solana Explorer.
- [ ] **Materiais de Submissão:**
  - [ ] Build APK Android gerada e testada.
  - [ ] Vídeo gameplay + pitch gravado com duração entre **2m30s e 2m50s** (nunca > 3m00s).
  - [ ] README do GitHub revisado com instruções de execução e Program ID documentado.
  - [ ] Cadastro de todos os membros do time na Colosseum Arena e Superteam Brasil.

---

## 7. Controle do Documento

| Campo | Informação |
| :--- | :--- |
| **Documento** | Diretrizes e Regras do Hackathon 2026 |
| **Versão** | 1.0 |
| **Escopo** | Colosseum Hackathon & Trilha Brasil (Superteam) |
| **Projeto** | FOWLGEN WARS — G5B Studios |
| **Fontes Oficiais** | [Colosseum Arena](https://colosseum.com/arena/hackathon) e [Superteam Brasil](http://hackathon.superteam.com.br/h/colosseum-2026/) |
