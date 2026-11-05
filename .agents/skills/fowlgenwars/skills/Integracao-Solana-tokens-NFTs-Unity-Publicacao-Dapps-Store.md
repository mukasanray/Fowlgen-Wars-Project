# Integração Solana, tokens, NFTs e Unity

## FOWLGEN WARS — Estudo técnico e roteiro de desenvolvimento

Este documento organiza o estudo da integração entre Unity, Solana, tokens, NFTs, programas Anchor e publicação na Solana Mobile DApp Store.

O ambiente de desenvolvimento deve seguir o padrão definido no [Guia Completo de Configuração do Ambiente On-Chain](Fowlgen-Wars-Guia-Completo-Detalhado.md): WSL2 com Ubuntu, Rust via `rustup`, Solana CLI `v1.18.26` e Anchor CLI gerenciada pelo AVM.

## 1. Arquitetura recomendada

FOWLGEN WARS deve utilizar uma arquitetura híbrida:

- **Unity/off-chain:** combate, física, movimento, animações, interface, partidas e simulação em tempo real.
- **Solana/on-chain:** propriedade de ativos, progressão verificável, recompensas, tokens, NFTs e transações.
- **Anchor:** programa Solana responsável pelas regras que precisam ser verificadas na blockchain.
- **Wallet:** conexão do jogador com os ativos e assinatura de transações.

```text
UNITY
  ├── Combate, física e movimento
  ├── Animações e interface
  └── Simulação da partida
          │
          ▼
SOLANA UNITY SDK
          │
          ▼
SOLANA / ANCHOR
  ├── Tokens e NFTs
  ├── Ownership e progressão
  ├── Recompensas
  └── Transações
```

O objetivo não é colocar todo o gameplay on-chain. A blockchain deve registrar somente o que precisa ser verificável, transferível ou pertencente ao jogador.

## 2. Ambiente e versões oficiais

Use as mesmas versões do guia principal:

| Ferramenta | Configuração |
| --- | --- |
| Sistema base | Windows 11 com WSL2 |
| Distribuição Linux | Ubuntu |
| Linguagem | Rust via `rustup` e `cargo` |
| Solana CLI | `v1.18.26` |
| Anchor CLI | Latest, instalada e gerenciada pelo AVM |
| Motor do jogo | Unity |
| Linguagem do jogo | C# |

### 2.1 Instalação do ambiente

Os comandos de instalação devem ser executados no terminal do Ubuntu dentro do WSL:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install build-essential pkg-config libssl-dev git curl wget -y

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### 2.2 Instalação da Solana CLI

```bash
cd ~
wget https://github.com/solana-labs/solana/releases/download/v1.18.26/solana-release-x86_64-unknown-linux-gnu.tar.bz2
tar jxf solana-release-x86_64-unknown-linux-gnu.tar.bz2
echo 'export PATH="$HOME/solana-release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
solana --version
```

### 2.3 Instalação do Anchor via AVM

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest
anchor --version
```

## 3. Solana SDK para Unity

O Solana Unity SDK deve ser estudado para entender como o projeto Unity se conecta à rede Solana.

### Objetivos de estudo

- Instalar o SDK no projeto Unity.
- Configurar a conexão com a Solana.
- Conectar e utilizar wallets.
- Criar e assinar transações.
- Consultar contas e ativos.
- Interagir com programas Solana.
- Utilizar tokens e NFTs na experiência do jogo.

### Fluxo básico

```text
JOGADOR
  ↓
UNITY + SOLANA UNITY SDK
  ↓
WALLET E ASSINATURA
  ↓
SOLANA RPC
  ↓
PROGRAMA ANCHOR
```

O primeiro protótipo deve utilizar uma rede de testes, como a Devnet, antes de qualquer publicação ou operação em Mainnet.

## 4. Programa Anchor e integração com Unity

O programa on-chain deve ser criado e compilado seguindo o fluxo do guia principal:

```bash
anchor init fowlgen_wars_contract
cd fowlgen_wars_contract
anchor build
```

### Conceitos que precisam ser estudados

- Estrutura de um programa Anchor.
- `Accounts` e validação de contas.
- `Instructions` e regras de negócio.
- `Program ID`.
- Transações e assinaturas.
- PDAs (Program Derived Addresses).
- Contas de tokens e mint accounts.
- Como o Unity chama as instruções.
- Como os dados retornam ao jogo.

### Organização do projeto

- `programs/fowlgen_wars_contract/src/lib.rs`: lógica principal do programa em Rust.
- `Anchor.toml`: configuração de redes, programas e ambiente.
- `tests/`: testes do programa.
- Projeto Unity: cliente off-chain e camada de apresentação.

## 5. Tokens na Solana

Tokens podem representar recursos fungíveis da economia do jogo, desde que exista uma razão clara para mantê-los on-chain.

### Conceitos essenciais

- Token accounts.
- Mint.
- Supply.
- Transferências.
- Fungible tokens.
- NFTs e ativos únicos.
- Autoridade de mint.
- Custódia e assinatura da wallet.

### Possíveis aplicações no FOWLGEN WARS

- Recompensas de eventos.
- Recursos de progressão verificáveis.
- Moeda ou ativo de utilidade, quando houver necessidade real de transferência.
- Itens especiais vinculados a uma wallet.

O balanceamento econômico deve ser definido depois dos testes do MVP. A existência de um token não deve ser tratada como requisito para cada recurso do jogo.

## 6. NFTs e progressão de personagens

Um NFT pode representar a identidade e a propriedade de uma galinha, personagem, skin ou item especial. Ele não precisa armazenar toda a ficha dinâmica do personagem.

### Modelo NFT + PDA

```text
NFT FOWLGEN
    ↓
Mint
    ↓
PDA FOWLGENData
    ├── Level
    ├── Experiência
    ├── Atributos selecionados
    └── Progressão verificável
```

### Perguntas de design

- O NFT representa um personagem, uma skin ou outro ativo?
- Quais atributos precisam ser verificáveis?
- A progressão será permanente ou poderá ser alterada?
- O jogador recebe, compra ou conquista o NFT?
- O NFT influencia o gameplay ou funciona apenas como propriedade/coleção?
- Como evitar que a economia on-chain prejudique a experiência do jogador?

## 7. Estudo de caso: Seven Seas

O Seven Seas é uma referência para estudar a integração entre Unity, Solana e Anchor. O foco do estudo deve ser a divisão entre gameplay off-chain e dados on-chain, e não uma cópia da implementação.

### Pontos para analisar

**Gameplay**

- Como funciona o loop principal?
- Quais ações acontecem em tempo real?
- Quais ações precisam realmente estar na blockchain?
- Quais ações continuam sendo processadas apenas pelo Unity?

**Economia**

- Como o jogador ganha moedas?
- Como as recompensas são distribuídas?
- O que acontece quando um inimigo é destruído?
- Quais recursos podem ser representados por tokens?

**NFTs**

- O que o NFT representa dentro do jogo?
- Como o jogador recebe e utiliza um NFT?
- O NFT influencia gameplay, progressão ou itens?

**Blockchain**

- O que é processado on-chain?
- O que é processado off-chain?
- Como o Unity conversa com o programa Solana?
- Como o Anchor é utilizado?
- Como as transações são construídas e enviadas?

## 8. Testes e ordem de implementação

### Fase 1 — Ambiente

- Configurar WSL2 e Ubuntu.
- Instalar Rust, Solana CLI `v1.18.26` e Anchor via AVM.
- Confirmar as versões instaladas.

### Fase 2 — Programa Solana

- Criar o projeto Anchor.
- Compilar com `anchor build`.
- Criar testes básicos.
- Testar contas, instruções e PDAs.

### Fase 3 — Unity

- Instalar e configurar o Solana Unity SDK.
- Conectar uma wallet de teste.
- Consultar a rede Devnet.
- Criar uma transação simples.
- Exibir o resultado dentro do Unity.

### Fase 4 — Ativos

- Testar um token em ambiente de desenvolvimento.
- Testar criação e consulta de um NFT.
- Validar ownership e leitura de metadados.
- Definir quais dados ficam on-chain e off-chain.

### Fase 5 — MVP integrado

- Integrar a primeira recompensa da partida.
- Registrar somente eventos que realmente precisam ser verificáveis.
- Medir tempo, custo e falhas das transações.
- Testar desconexão, rejeição de assinatura e falta de saldo.

## 9. Publicação na Solana Mobile DApp Store

Depois que o protótipo estiver integrado e testado, estudar a distribuição do aplicativo.

### O que verificar

- Requisitos para Web App/Web3 App.
- Requisitos para APK Android.
- Integração da wallet.
- Informações e metadados do aplicativo.
- Processo de submissão.
- Requisitos técnicos e de distribuição.
- Política de conteúdo, segurança e atualizações.
- Compatibilidade do jogo Unity com o dispositivo-alvo.

A publicação deve ser uma etapa posterior à validação do MVP. Primeiro é necessário ter uma build funcional, testes na Devnet e documentação mínima de integração.

## 10. Referências organizadas

### Solana e exemplos de programas

- [Solana Program Examples](https://github.com/solana-foundation/program-examples)
- [Solana Game Examples — Seven Seas](https://github.com/solana-developers/solana-game-examples/tree/main/seven-seas)
- [Solana CLI `v1.18.26`](https://github.com/solana-labs/solana/releases/download/v1.18.26/solana-release-x86_64-unknown-linux-gnu.tar.bz2)

### Unity e integração

- [Solana Unity SDK — GitHub](https://github.com/magicblock-labs/Solana.Unity-SDK)

### NFTs e ativos digitais

- [Metaplex — Documentação de NFTs](https://www.metaplex.com/docs/nfts)
- [Metaplex — Documentação geral](https://www.metaplex.com/docs)

### Anchor e desenvolvimento

- [LuizTools — Como criar seu primeiro programa para Solana com Anchor](https://www.luiztools.com.br/post/como-criar-seu-primeiro-programa-para-solana-com-anchor/)
- [LuizTools — Como configurar o ambiente para desenvolvimento Solana](https://www.luiztools.com.br/post/como-configurar-ambiente-para-desenvolvimento-solana/)

### Solana Mobile DApp Store

- [Solana Mobile — documentação da DApp Store](https://docs.solanamobile.com/dapp-publishing/intro)
- [Solana Mobile — submissão de um novo aplicativo](https://docs.solanamobile.com/dapp-store/submit-new-app)

> Antes de publicar, confirme os requisitos atuais diretamente na documentação oficial da Solana Mobile, pois políticas, etapas e critérios de aprovação podem mudar.
