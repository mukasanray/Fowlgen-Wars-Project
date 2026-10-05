# Fowlgen Wars - Visão de Privacidade On-Chain (Zero-Knowledge)

Este documento registra propostas conceituais para a integração de tecnologias de privacidade financeira baseadas em Zero-Knowledge (como o protocolo Cloak e Zcash) no ecossistema de Fowlgen Wars, utilizando como referência os conceitos de arquitetura discutidos no [Superteam Privacy Week](https://privacy.superteam.com.br).

> **Importante:** Estas propostas são visões de desenvolvimento futuro (Fases 3 e 4 do Roadmap). Elas representam um diferencial competitivo para o ecossistema do jogo, focando em segurança avançada para a comunidade.

## 1. Sistema de Recompensas e "Salary" Privado (Anti-Tracking)
Em jogos Web3 competitivos (como MOBAs), a carteira dos melhores jogadores (os "Pro-Players") rapidamente se torna um alvo. As pessoas rastreiam o quanto eles ganham, com quem negociam e os usam como alvo para phishing ou engenharia social.

- **A Ideia:** Usar o protocolo Cloak (ou similar baseado em ZK) para o sistema de claim (resgate) de recompensas de torneios ou partidas rankeadas.
- **O Impacto:** O jogador solicita o resgate do prêmio na Solana, mas a transação passa por um Shielded Pool. Ninguém na rede consegue ver o saldo real do jogador ou vincular seu perfil de jogo aos seus ganhos. Isso oferece privacidade financeira real e proteção para jogadores competitivos.

## 2. O "Mercado Negro" (Swaps e Lojas Privadas)
O jogo terá um sistema de Skins, Arenas e Essências (vide [`🐔 Fowlgen-wars- Sistema-de-cores-essencias-e-classificacao.md`](%F0%9F%90%94%20Fowlgen-wars-%20Sistema-de-cores-essencias-e-classificacao.md)). O "Mercado Negro" seria uma aba especial no jogo.

- **A Ideia:** Uma loja in-game onde as compras e trocas (Swaps) são feitas através de rotas privadas (ex: integração Cloak + Jupiter).
- **O Impacto:** Jogadores que possuem grandes quantidades de tokens (Baleias) podem comprar NFTs ou fazer swaps de tokens do jogo por USDC sem "assustar" o mercado público e sem que a comunidade rastreie seus movimentos.

## 3. Tesouro de Clãs Oculto (Guild Vaults)
Com a exploração de clãs e civilizações (vide [`🐔 Hierarquia-de-Personagens.md`](%F0%9F%90%94%20Hierarquia-de-Personagens.md)), teremos dinâmicas competitivas de Clãs (GvG).

- **A Ideia:** O cofre de um clã pode ser instanciado como um Shielded Pool.
- **O Impacto:** Clãs rivais não conseguem olhar na blockchain para descobrir o "poderio financeiro" ou as reservas de um clã inimigo. O pagamento dos membros do clã também é feito de forma privada, adicionando uma camada de espionagem e blefe estratégico fora do jogo.

## 4. Fog of War On-Chain (Estratégia Oculta)
MOBAs dependem de informações ocultas (névoa de guerra). Se antes da partida os jogadores precisarem pagar uma taxa de entrada ou "comprar" consumíveis on-chain, o inimigo pode espiar a blockchain e saber a estratégia antes mesmo da partida começar.

- **A Ideia:** Usar provas de conhecimento nulo (ZK) para registrar na blockchain que o jogador "equipou" um item ou pagou a taxa, mas sem revelar **qual** item foi escolhido até o momento em que a partida carrega.
- **O Impacto:** Traz a mecânica de "blefe" e tática (já discutida em [`Fowlgen-Wars-Sistema-de-Taticas-de-Batalha.md`](Fowlgen-Wars-Sistema-de-Taticas-de-Batalha.md)) também para a camada on-chain.
