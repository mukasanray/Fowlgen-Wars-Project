# 🔵 FOWLGEN WARS — Roadmap Completo de POCs

Este documento reúne a Fase 01 e as fases seguintes do roadmap técnico do FOWLGEN WARS. A execução começa pela fundação Unity + Solana + Anchor e avança até o ciclo completo de NFT, PDA, SPL Token, gameplay e publicação.

O multiplayer FishNet começa como uma POC independente na Fase 02, após a fundação Unity, e avança para sincronização de gameplay na Fase 04. O alvo de topologia definido para a arquitetura é um Dedicated Game Server. FishNet sincroniza a partida em tempo real; Solana/Anchor permanece separada para estado e transações on-chain.

## Arquitetura-alvo Web3 Multiplayer — marcos macro POC 02–05

Os diagramas abaixo registram a sequência de arquitetura solicitada. Os IDs são **marcos macro**; as POCs detalhadas da Fase 01 mantêm seus próprios IDs e são relacionadas na tabela de correspondência. Assim, o marco macro `POC 02 Multiplayer` não deve ser confundido com a POC detalhada `POC 02 Solana Unity SDK`.

### POC macro 02 — Multiplayer

```text
Unity
    ↓
FishNet
    ↓
Dedicated Game Server
    ↓
2 jogadores
    ↓
movimento + combate
```

Validar a conexão com dois clientes separados. A conexão/identidade começa na Fase 02; movimento de Minions, rotas e combate são integrados depois dos testes locais, na Fase 04. Dedicated Game Server é a topologia-alvo indicada. A autoridade da simulação, hospedagem, transporte e tratamento de desconexão ainda precisam ser validados.

### POC macro 03 — Solana

```text
Unity
    ↓
Solana SDK
    ↓
Devnet
    ↓
Wallet
```

Validar o SDK Unity, consulta à Devnet e conexão/assinatura com wallet de teste. Nunca armazenar seed phrase ou chave privada no cliente, repositório ou logs.

### POC macro 04 — Anchor

```text
Anchor
    ↓
Rust
    ↓
Program
    ↓
PDA
```

Compilar e testar um programa Anchor, chamá-lo a partir do Unity e provar criação/leitura de PDA. A PDA ligada ao Character NFT depende também das POCs de ativos on-chain da Fase 02.

### POC macro 05 — FOWLGEN Web3 Multiplayer

```text
                      WALLET
                          │
                          ▼
                  CHARACTER NFT
                          │
                          ▼
                 CHARACTER PDA
                          │
                          ▼
                        UNITY
                          │
                  ┌─────┴─────┐
                  │           │
              FishNet     Solana SDK
                  │           │
                  ▼           │
         Dedicated Game     │
             Server          │
                  │           │
         ┌──────┴──────┐    │
         ▼             ▼    │
     Player A      Player B│
         │             │    │
         └──────┬──────┘    │
                  │           │
              PARTIDA        │
                  │           │
                  ▼           │
             RESULTADO ──────┘
                  │
                  ▼
                Anchor
                  │
                  ▼
          Character PDA
                  │
          XP / Rewards
```

Este é o marco de integração final, não uma confirmação de que todo o fluxo já funciona. Ele depende do Character NFT/PDA e do gameplay multiplayer já validados. O resultado não pode ser aceito de um cliente sem validação: definir como a autoridade do servidor comprova o resultado ao Anchor antes de atualizar XP ou emitir recompensa. Não colocar chave privada do servidor no Unity; XP/recompensa só será escrita após regra e autorização aprovadas.

### Correspondência com as POCs detalhadas

| Marco macro | POCs detalhadas relacionadas | Fases |
| --- | --- | --- |
| POC 02 Multiplayer | POC N01 (conexão), POC N02 (Minions/rotas), POC N03 (combate/resultado) | Fases 02 e 04 |
| POC 03 Solana | POC detalhada 02 (Solana Unity SDK) e Wallet & Transaction | Fase 01 |
| POC 04 Anchor | POCs detalhadas 03–04 e POCs 07–08 (programa, invocação Unity e dados PDA) | Fases 01–02 |
| POC 05 Web3 Multiplayer | POCs 06–09 (NFT/PDA), N01–N03 (FishNet) e 25–28 (resultado/Anchor/upgrade) | Fases 02, 04 e 05 |

**Ordem de execução:** Unity base → conexão FishNet → Solana/Devnet → Anchor → Character NFT/PDA → sincronização de Minions/combate → resultado autenticado → eventual XP/recompensa on-chain. O aceite final da POC macro 05 depende dessas etapas detalhadas.

## Como executar a Fase 01

Este documento detalha a execução das POCs 01 a 05 do [Roadmap de POCs](Fowlgen-Wars-Roadmap-de-Pocs.md). Ele deve ser lido junto com o [Guia Completo de Configuração do Ambiente On-Chain](Fowlgen-Wars-Guia-Completo-Detalhado.md) e com a [Integração Solana, tokens, NFTs e Unity](Integracao-Solana-tokens-NFTs-Unity-Publicacao-Dapps-Store.md).

O objetivo da Fase 01 é provar a fundação técnica antes de criar NFTs, PDAs, tokens ou recompensas:

```text
UNITY
   ↓
SOLANA UNITY SDK
   ↓
WALLET DE TESTE
   ↓
SOLANA DEVNET
   ↓
ANCHOR PROGRAM
   ↓
TRANSAÇÃO CONFIRMADA NO UNITY
```

> Todas as POCs desta fase devem usar a Devnet e uma wallet exclusiva para desenvolvimento. Nunca colocar chave privada no projeto Unity, no Git ou em arquivos compartilhados.

## Resultado esperado da fase

Ao terminar a Fase 01, a equipe deverá conseguir:

- Abrir o projeto Unity em uma cena de teste.
- Gerar uma build Android simples.
- Consultar a Solana Devnet pelo Unity.
- Criar e compilar um projeto Anchor.
- Conectar uma wallet de teste.
- Assinar uma transação.
- Chamar uma instrução Anchor a partir do Unity.
- Exibir a confirmação ou o erro da transação.

---

## 1. Pré-requisitos do ambiente

### 1.1 Ferramentas

| Ferramenta | Configuração |
| --- | --- |
| Sistema base | Windows 11 com WSL2 |
| Distribuição Linux | Ubuntu |
| Linguagem on-chain | Rust via `rustup` e `cargo` |
| Solana CLI | `v1.18.26` |
| Anchor CLI | Latest, gerenciada pelo AVM |
| Cliente | Unity + C# |
| Rede | Solana Devnet |
| Controle de versão | Git/GitHub |
| Dispositivo | Android ou emulador Android |

### 1.2 Verificação no Ubuntu/WSL

Executar:

```bash
solana --version
anchor --version
rustc --version
cargo --version
solana config get
```

Configurar a Devnet:

```bash
solana config set --url devnet
solana config get
```

Criar ou selecionar uma wallet de desenvolvimento:

```bash
solana-keygen new
solana address
solana balance
```

Solicitar SOL de teste quando necessário:

```bash
solana airdrop 2
solana balance
```

Se o airdrop estiver indisponível, usar um faucet oficial da Devnet. A wallet de teste deve ser separada de qualquer carteira com ativos reais.

### 1.3 Estrutura de trabalho

```text
FOWLGEN-WARS/
├── UnityProject/
├── fowlgen_wars_contract/
├── docs/
└── README.md
```

Registrar no relatório da fase:

- Sistema operacional.
- Versão do Unity.
- Versão da Solana CLI.
- Versão do Anchor.
- Rede utilizada.
- Endereço público da wallet de teste.

Nunca registrar seed phrase ou chave privada.

---

## 🟦 POC 01 — Unity Project Foundation

### Objetivo

Criar a base do projeto cliente que receberá o gameplay e a integração blockchain.

### Passos

1. Criar o projeto Unity.
2. Escolher a versão do Unity usada pela equipe e registrá-la no README.
3. Criar a cena `Bootstrap` ou `Main`.
4. Criar as pastas `Assets/Scripts`, `Assets/Scenes`, `Assets/Blockchain` e `Assets/Prefabs`.
5. Adicionar um painel de diagnóstico para exibir status da conexão.
6. Inicializar o repositório Git.
7. Criar o `.gitignore` apropriado para Unity.
8. Fazer o primeiro commit.
9. Configurar Android como plataforma de build.
10. Gerar uma build de teste.

### Estrutura Unity sugerida

```text
Assets/
├── Blockchain/
│   ├── Runtime/
│   ├── Wallet/
│   └── Transactions/
├── Scenes/
│   └── Bootstrap.unity
├── Scripts/
│   ├── AppState.cs
│   └── DiagnosticsPanel.cs
└── Prefabs/
```

### Critério de aceite

- O projeto abre sem erros.
- A cena inicial executa.
- A build Android é gerada.
- O Git não inclui `Library`, `Temp`, `Logs`, builds ou segredos.
- O projeto possui uma tela que poderá exibir `Disconnected`, `Connecting`, `Connected`, `Confirmed` e `Failed`.

### Entregáveis

- Link do repositório.
- Captura da cena inicial.
- APK de teste ou evidência da build.
- README com versões e instruções de abertura.

---

## 🟦 POC detalhada 02 — Solana Unity SDK

### Objetivo

Conectar o projeto Unity à Solana Devnet e consultar o estado básico da rede.

### Passos

1. Adicionar o Solana Unity SDK conforme a documentação do projeto.
2. Fixar a versão ou commit utilizado.
3. Configurar o endpoint RPC da Devnet.
4. Criar um `SolanaConnectionService` ou componente equivalente.
5. Adicionar logs de conexão e erro.
6. Consultar o saldo da wallet de teste.
7. Exibir endpoint, rede e saldo no painel de diagnóstico.

### Estados do cliente

```text
DISCONNECTED
    ↓
CONNECTING
    ↓
CONNECTED
    ↓
FAILED
```

### Dados que o Unity deve exibir

- Rede atual: Devnet.
- Endpoint RPC, sem informações secretas.
- Endereço público da wallet, quando conectado.
- Saldo em SOL.
- Último erro recebido.
- Horário da última consulta.

### Critério de aceite

- O Unity consulta a Devnet.
- O saldo exibido corresponde ao saldo consultado pelo CLI.
- Um RPC indisponível gera estado `FAILED`, sem travar a cena.
- O cliente não contém seed phrase ou chave privada em texto.

### Teste manual

1. Abrir a cena `Bootstrap`.
2. Executar o projeto.
3. Confirmar que a rede exibida é Devnet.
4. Comparar o saldo com `solana balance`.
5. Desligar ou trocar o endpoint.
6. Confirmar que o erro é apresentado corretamente.

---

## 🟦 POC detalhada 03 — Anchor Workspace

### Objetivo

Criar, compilar e testar o programa Anchor que será chamado pelo Unity.

### Criar o projeto

No Ubuntu/WSL:

```bash
anchor init fowlgen_wars_contract
cd fowlgen_wars_contract
anchor build
```

### Estrutura esperada

```text
fowlgen_wars_contract/
├── Anchor.toml
├── programs/
│   └── fowlgen_wars_contract/
│       └── src/
│           └── lib.rs
├── tests/
└── migrations/
```

### Programa mínimo

A primeira instrução deve ser pequena e fácil de validar. Ela pode apenas registrar uma mensagem ou inicializar uma conta simples.

Exemplo conceitual:

```rust
pub fn initialize() -> Result<()> {
    msg!("FOWLGEN WARS Online");
    Ok(())
}
```

O código exato deve seguir a versão do Anchor instalada e o template gerado pelo `anchor init`.

### Configuração

Conferir no `Anchor.toml`:

- Cluster usado nos testes.
- Programa configurado.
- Wallet de desenvolvimento.
- Caminho dos testes.
- Provider usado pelo cliente.

### Testes

Executar:

```bash
anchor build
anchor test
```

Antes de usar Devnet, validar o programa localmente quando o ambiente da equipe permitir. Depois, fazer o deploy de teste na Devnet seguindo a documentação da versão do Anchor instalada.

### Critério de aceite

- `anchor build` termina sem erro.
- O programa possui um Program ID registrado.
- Os testes básicos passam.
- A instrução mínima pode ser chamada por um cliente de teste.
- O endereço do programa é documentado, sem confundir Program ID com wallet.

### Entregáveis

- `lib.rs` funcional.
- `Anchor.toml` configurado.
- Teste automatizado.
- Saída do `anchor build`.
- Program ID e rede documentados.

---

## 🔵 POC detalhada 04 — Unity ↔ Anchor ↔ Solana

### Objetivo

Provar a arquitetura completa com a menor transação possível: o Unity chama uma instrução Anchor na Devnet e recebe a confirmação.

### Fluxo

```text
UNITY
  │
  │ prepara a instrução
  ▼
SOLANA UNITY SDK
  │
  │ solicita assinatura
  ▼
WALLET DE TESTE
  │
  │ envia transação
  ▼
SOLANA DEVNET
  │
  ▼
ANCHOR PROGRAM
  │
  ▼
CONFIRMAÇÃO NO UNITY
```

### Preparação no Anchor

1. Fazer deploy do programa de teste na Devnet.
2. Confirmar o Program ID.
3. Gerar ou disponibilizar o IDL conforme a versão do Anchor.
4. Definir a instrução mínima.
5. Testar a instrução fora do Unity.

A instrução mínima deve fazer somente uma operação verificável, como emitir um log ou inicializar uma conta de teste.

### Preparação no Unity

1. Configurar o Program ID.
2. Configurar o endpoint Devnet.
3. Carregar o IDL ou a definição de instrução suportada pelo SDK.
4. Derivar as contas necessárias.
5. Montar a transação.
6. Solicitar assinatura.
7. Enviar a transação.
8. Aguardar confirmação.
9. Exibir assinatura, status e erro.

### Estados da transação

```text
IDLE
  ↓
BUILDING
  ↓
WAITING_SIGNATURE
  ↓
SUBMITTED
  ↓
CONFIRMED ou FAILED
```

### Critério de aceite

- O Unity chama a instrução correta.
- A wallet solicita assinatura.
- A transação aparece na Devnet.
- O Unity recebe a assinatura.
- O Unity distingue `CONFIRMED` de `FAILED`.
- Rejeitar a assinatura não quebra a cena.

### Evidências

- Program ID.
- Assinatura da transação.
- Screenshot do painel Unity.
- Screenshot ou link do explorer da Devnet.
- Log do caso aprovado.
- Log do caso rejeitado.

> Esta é a primeira prova real da arquitetura. Antes dela, não iniciar NFT, SPL Token ou integração com gameplay.

---

## 🟦 Wallet & Transaction — componente da POC macro 03

### Objetivo

Conectar uma wallet de teste ao Unity e controlar o ciclo de assinatura de uma transação.

### Fluxo da wallet

```text
DISCONNECTED
    ↓
CONNECTING
    ↓
CONNECTED
    ↓
TRANSACTION_READY
    ↓
WAITING_SIGNATURE
    ↓
SUBMITTED
    ↓
CONFIRMED ou FAILED
```

### Passos

1. Abrir o fluxo de conexão no Unity.
2. Solicitar a wallet de teste.
3. Mostrar somente o endereço público.
4. Consultar saldo e rede.
5. Montar uma transação simples.
6. Solicitar assinatura.
7. Tratar aprovação.
8. Tratar cancelamento.
9. Enviar a transação assinada.
10. Aguardar confirmação.
11. Salvar a assinatura no relatório.
12. Atualizar a interface depois da confirmação.

### Casos de erro obrigatórios

- Wallet não instalada ou indisponível.
- Usuário cancela a conexão.
- Usuário rejeita a assinatura.
- Saldo insuficiente para a transação.
- RPC indisponível.
- Transação expirada.
- Program ID incorreto.
- Conta obrigatória ausente.
- Rede configurada incorretamente.

### Regra de segurança

O Unity não deve receber nem armazenar seed phrase ou chave privada. O cliente deve solicitar a assinatura à wallet e trabalhar somente com endereço público, transação e assinatura autorizada.

### Critério de aceite

- Wallet conecta e desconecta corretamente.
- Endereço público é exibido.
- A transação pode ser assinada ou rejeitada.
- O saldo só é atualizado depois da confirmação.
- Todos os erros principais aparecem de forma compreensível.
- Nenhum segredo aparece no código, logs ou repositório.

---

## Relatório da Fase 01

Para cada POC, registrar:

- Objetivo.
- Versões utilizadas.
- Rede utilizada.
- Endereço público da wallet de teste.
- Program ID.
- Mint ou endereço de conta, quando existir.
- Assinatura da transação.
- Passos executados.
- Resultado esperado.
- Resultado obtido.
- Erros encontrados.
- Capturas de tela ou vídeo.
- Próximo passo.

### Checklist final

- [ ] POC 01 concluída.
- [ ] POC 02 concluída.
- [ ] POC 03 concluída.
- [ ] POC 04 concluída.
- [ ] POC 05 concluída.
- [ ] Devnet confirmada.
- [ ] Wallet de teste documentada sem expor segredo.
- [ ] Program ID documentado.
- [ ] Transação Unity → Anchor confirmada.
- [ ] Caso de erro testado.
- [ ] Relatório da fase preenchido.

## Referências

### Documentos do projeto

- [Guia Completo de Configuração do Ambiente On-Chain](Fowlgen-Wars-Guia-Completo-Detalhado.md)
- [Integração Solana, tokens, NFTs e Unity](Integracao-Solana-tokens-NFTs-Unity-Publicacao-Dapps-Store.md)
- Este documento reúne as fases 01 a 06 do roadmap completo.

### Solana e Unity

- [Solana Unity SDK](https://github.com/magicblock-labs/Solana.Unity-SDK)
- [Solana Game Examples — Seven Seas](https://github.com/solana-developers/solana-game-examples/tree/main/seven-seas)
- [Solana CLI `v1.18.26`](https://github.com/solana-labs/solana/releases/download/v1.18.26/solana-release-x86_64-unknown-linux-gnu.tar.bz2)

### Anchor

- [Anchor — documentação oficial](https://www.anchor-lang.com/docs)
- [Anchor — instalação](https://www.anchor-lang.com/docs/installation)
- [Anchor — quickstart](https://www.anchor-lang.com/docs/quickstart)
- [Anchor — testes](https://www.anchor-lang.com/docs/testing)
- [Anchor — Anchor.toml](https://www.anchor-lang.com/docs/references/anchor-toml)

### Devnet e segurança

- [Solana — documentação de tokens](https://solana.com/docs/tokens)
- [Solana — documentação geral](https://solana.com/docs)
- [Solana — documentação de segurança](https://solana.com/docs/references/security)

> As versões, APIs e requisitos das ferramentas podem mudar. Antes de instalar ou publicar, confirmar as instruções atuais na documentação oficial correspondente.

---

## 🟣 FASE 02 — FOWLGEN on-chain

### POC 06 — FOWLGEN NFT

#### Objetivo

Criar um ativo que represente a identidade ou a propriedade de uma galinha/personagem.

#### Decisão de escopo

Para a primeira POC, o NFT deve conter somente identidade e metadados estáveis. Não colocar toda a ficha dinâmica do personagem no NFT.

| Dado | Local recomendado |
| --- | --- |
| Nome, imagem, espécie e raridade inicial | Metadados do NFT |
| Dono do ativo | Ownership da conta/token |
| Level, XP e evolução | FOWLGENData PDA |
| Combate em tempo real | Unity/off-chain |
| Resultado verificável e recompensa | Programa Anchor |

#### Passos

1. Definir o schema mínimo do FOWLGEN NFT.
2. Preparar nome, imagem e URI dos metadados.
3. Escolher a implementação de NFT, preferencialmente Metaplex Core para o estudo atual.
4. Criar o NFT na Devnet.
5. Consultar o NFT pela wallet e pelo DAS API/cliente escolhido.
6. Salvar o mint ou asset ID no relatório da POC.
7. Exibir no Unity o nome, a imagem e o identificador do ativo.

#### Schema mínimo sugerido

```json
{
  "name": "FOWLGEN #001",
  "symbol": "FOWL",
  "description": "Personagem do universo FOWLGEN WARS",
  "image": "https://.../FOWLGEN-001.png",
  "attributes": [
    { "trait_type": "Species", "value": "FOWLGEN" },
    { "trait_type": "Rarity", "value": "Common" },
    { "trait_type": "Class", "value": "Warrior" }
  ]
}
```

#### Critério de aceite

- O NFT existe na Devnet.
- A wallet de teste é reconhecida como proprietária.
- Os metadados podem ser consultados.
- O Unity exibe o ativo sem colocar dados secretos no cliente.

#### Entregáveis

- Mint/asset ID.
- URI dos metadados.
- Imagem usada.
- Captura da wallet ou explorer.
- Script ou procedimento de criação.
- Relatório de limitações encontradas.

---

### POC 07 — FOWLGEN PDA

#### Objetivo

Criar uma conta derivada determinística para guardar o estado verificável do personagem.

```text
FOWLGEN NFT
    ↓
Mint ou asset ID
    ↓
Seeds conhecidas
    ↓
FOWLGENData PDA
```

#### Modelo de seeds

Escolher uma única convenção e mantê-la em Rust, testes e Unity:

```text
["FOWLGEN", owner_pubkey, mint_pubkey]
```

A seed deve ser documentada. Alterar a seed depois da publicação cria outro endereço e pode perder a associação com o estado anterior.

#### Passos

1. Definir as seeds.
2. Derivar o PDA no programa Anchor.
3. Derivar o mesmo PDA no teste.
4. Derivar ou consultar o endereço no cliente Unity.
5. Criar a conta com `init` e `seeds`.
6. Confirmar que o endereço é sempre o mesmo para o mesmo jogador e mint.

#### Critério de aceite

- O PDA é determinístico.
- O teste Anchor e o Unity encontram o mesmo endereço.
- Um jogador não consegue inicializar o PDA de outro jogador sem autorização.
- A conta possui tamanho definido e custo de rent calculado.

---

### POC 08 — FOWLGEN Data Account

#### Objetivo

Armazenar no PDA somente os dados necessários para propriedade, progressão e regras verificáveis.

#### Estrutura inicial sugerida

```rust
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
    Mythic,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum CharacterClass {
    Warrior,
    Guardian,
    Assassin,
    Mage,
    Support,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum Species {
    Rooster,
    Hen,
    Chameleon,
    BattleFOWLGEN,
    MythicBird,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum Clan {
    IronGrail,
    EmberNest,
    StormFeather,
    VoidPeck,
    SolarFlock,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum Role {
    Frontline,
    Midlane,
    Carry,
    Support,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum Status {
    Active,
    Locked,
    Evolving,
    Burned,
}

#[account]
pub struct FOWLGENData {
    // IDENTIDADE
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub character_id: u64,
    pub name: String,
    pub metadata_uri: String,

    // IDENTIDADE DO PERSONAGEM
    pub species: Species,
    pub clan: Clan,
    pub civilization: String,
    pub era: String,
    pub rarity: Rarity,
    pub archetype: String,

    // COMBATE
    pub class: CharacterClass,
    pub role: Role,
    pub lane: String,
    pub strength: u16,
    pub health: u16,
    pub speed: u16,
    pub defense: u16,
    pub attack_range: u16,
    pub attack_speed: u16,
    pub critical_chance: u16,

    // HABILIDADES
    pub basic_attack: String,
    pub ability_1: String,
    pub ability_2: String,
    pub ultimate: String,
    pub passive: String,

    // PROGRESSÃO
    pub level: u32,
    pub xp: u64,
    pub mastery: u64,
    pub evolution_level: u8,
    pub evolution_pieces: u16,
    pub runes: u16,

    // ESTATÍSTICAS
    pub wins: u64,
    pub losses: u64,
    pub matches: u64,
    pub kills: u64,
    pub assists: u64,
    pub damage_dealt: u64,
    pub damage_received: u64,
    pub objectives: u64,

    // PERSONALIZAÇÃO
    pub skin: String,
    pub accessories: String,
    pub emote: String,
    pub title: String,
    pub cosmetic_items: u16,

    // CONTROLE
    pub created_at: i64,
    pub updated_at: i64,
    pub version: u8,
    pub status: Status,
    pub bump: u8,
}

#[account]
pub struct PlayerData {
    pub authority: Pubkey,
    pub wins: u64,
    pub losses: u64,
    pub kills: u64,
    pub assists: u64,
    pub damage: u64,
    pub matches: u64,
    pub mastery: u64,
    pub quests: Vec<String>,
    pub achievements: Vec<String>,
    pub match_history: Vec<u64>,
    pub analytics: PlayerAnalytics,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct PlayerAnalytics {
    pub total_damage: u64,
    pub avg_kda: f64,
    pub win_rate: f64,
    pub playtime_minutes: u64,
}
```

#### Modelo conceitual da relação

```text
FOWLGEN NFT
├── Identidade
│   ├── mint
│   ├── owner
│   ├── token_id / character_id
│   ├── name
│   └── metadata_uri
├── Identidade do personagem
│   ├── species
│   ├── clan
│   ├── civilization
│   ├── era
│   ├── rarity
│   └── archetype
├── Combate
│   ├── class
│   ├── role
│   ├── lane
│   ├── strength
│   ├── health
│   ├── speed
│   ├── defense
│   ├── attack_range
│   ├── attack_speed
│   └── critical_chance
├── Habilidades
│   ├── basic_attack
│   ├── ability_1
│   ├── ability_2
│   ├── ultimate
│   └── passive
├── Progressão
│   ├── level
│   ├── xp
│   ├── mastery
│   ├── evolution_level
│   ├── evolution_pieces
│   └── runes
├── Estatísticas
│   ├── wins
│   ├── losses
│   ├── matches
│   ├── kills
│   ├── assists
│   ├── damage_dealt
│   ├── damage_received
│   └── objectives
├── Personalização
│   ├── skin
│   ├── accessories
│   ├── emote
│   ├── title
│   └── cosmetic_items
└── Controle
    ├── created_at
    ├── updated_at
    ├── version
    └── status
```

FOWLGEN NFT
│
├── 🔗 IDENTIDADE
│   ├── mint
│   ├── owner
│   ├── token_id / character_id
│   ├── name
│   └── metadata_uri
│
├── 🧬 IDENTIDADE DO PERSONAGEM
│   ├── species / raça
│   ├── clan / clã
│   ├── civilization / civilização
│   ├── era / período
│   ├── rarity / raridade
│   └── archetype / arquétipo
│
├── ⚔️ COMBATE
│   ├── class / classe
│   ├── role / função
│   ├── lane / rota
│   ├── strength
│   ├── health
│   ├── speed
│   ├── defense
│   ├── attack_range
│   ├── attack_speed
│   └── critical_chance
│
├── ✨ HABILIDADES
│   ├── basic_attack
│   ├── ability_1
│   ├── ability_2
│   ├── ultimate
│   └── passive
│
├── 📈 PROGRESSÃO
│   ├── level
│   ├── xp
│   ├── mastery
│   ├── evolution_level
│   ├── evolution_pieces
│   └── runes
│
├── 🏆 ESTATÍSTICAS
│   ├── wins
│   ├── losses
│   ├── matches
│   ├── kills
│   ├── assists
│   ├── damage_dealt
│   ├── damage_received
│   └── objectives
│
├── 🎨 PERSONALIZAÇÃO
│   ├── skin
│   ├── accessories
│   ├── emote
│   ├── title
│   └── cosmetic_items
│
└── 🔐 CONTROLE
    ├── created_at
    ├── updated_at
    ├── version
    └── status
     
│
▼
 PDA
 │
├── owner
├── mint
├── character_id
├── level
├── xp
├── rarity
├── class
├── species
├── clan
├── evolution_level
├── strength
├── health
├── defense
├── speed
└── version

PlayerData
│
├── wins
├── losses
├── kills
├── assists
├── damage
├── matches
├── mastery
├── quests
├── achievements
├── match_history
└── analytics




🐔 FOWLGEN WARS
                           │
                           ▼
                    🪙 FOWLGEN NFT
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
          🪙 MINT                  🧬 METADATA
              │                         │
              │                         ├── Nome
              │                         ├── Imagem
              │                         ├── Espécie
              │                         ├── Clã
              │                         └── Tema
              │
              ▼
        🧠 FOWLGENData PDA
              │
       ┌──────┼─────────┐
       │      │         │
       ▼      ▼         ▼
   IDENTIDADE COMBATE PROGRESSÃO
       │      │         │
       │      │         ├── Level
       │      │         ├── XP
       │      │         ├── Mastery
       │      │         ├── Evolution
       │      │         └── Runes
       │      │
       │      ├── Strength
       │      ├── Health
       │      ├── Defense
       │      ├── Speed
       │      └── Attack
       │
       ├── Owner
       ├── Mint
       ├── Character ID
       ├── Species
       ├── Clan
       ├── Class
       ├── Role
       └── Lane


#### Separação de dados

- **PDA:** level, XP, progressão, atributos selecionados e versão.
- **Metadados:** nome, imagem, lore e atributos de apresentação.
- **Unity:** posição, física, animação, cooldown e estado temporário da partida.
- **Servidor/analytics:** dados de telemetria que não precisam ser propriedade on-chain.

#### Passos

1. Definir os tipos e limites dos campos.
2. Calcular o espaço da conta, incluindo discriminator e padding quando necessário.
3. Criar a conta no `initialize_FOWLGEN`.
4. Ler a conta em um teste Anchor.
5. Ler a conta no Unity.
6. Exibir os atributos em uma tela de diagnóstico.

#### Critério de aceite

- A conta é criada uma única vez.
- O owner e o mint ficam associados corretamente.
- O Unity consegue ler o estado.
- Os limites de tipo impedem valores inválidos ou overflow.

---

### POC 09 — Anchor FOWLGEN Program

#### Objetivo

Criar as instruções que alteram o FOWLGENData PDA, sempre com validação de autoridade e regras de negócio.

#### Instruções iniciais

```rust
initialize_FOWLGEN()
upgrade_FOWLGEN()
add_xp()
update_stats()
```

#### Ordem de implementação

1. `initialize_FOWLGEN`: cria e inicializa o PDA.
2. `add_xp`: aceita apenas a autoridade definida pelo protótipo.
3. `upgrade_FOWLGEN`: valida custo, nível e limites.
4. `update_stats`: restringe quais atributos podem ser alterados.

#### Regras mínimas

- Verificar `owner` antes de modificar a conta.
- Verificar que o mint esperado corresponde ao personagem.
- Rejeitar XP negativo ou overflow.
- Rejeitar upgrade sem requisito ou saldo válido.
- Emitir eventos para facilitar diagnóstico.
- Criar erros Anchor claros para o cliente Unity.

#### Testes obrigatórios

- Inicialização correta.
- Inicialização duplicada rejeitada.
- Owner incorreto rejeitado.
- XP válido aceito.
- XP inválido rejeitado.
- Upgrade autorizado aceito.
- Upgrade sem requisito rejeitado.

Executar:

```bash
anchor test
anchor build
```

---

### POC N01 — FishNet Foundation (Fase 02)

#### Objetivo

Validar conexão e entrada de dois clientes independentes em uma mesma sessão FishNet. Esta POC pode ocorrer em paralelo às POCs on-chain da Fase 02, mas depende da fundação do projeto Unity e não depende de NFT, PDA ou wallet.

#### Antes de implementar

1. Inspecionar a versão real do Unity, packages, input, cenas e arquitetura do projeto.
2. Confirmar e registrar a versão FishNet e sua compatibilidade com a versão Unity encontrada.
3. Escolher e registrar a topologia da POC (host/player-host ou servidor dedicado); não assumir uma opção sem decisão técnica.
4. Definir qual processo de build/execução será usado para abrir dois clientes. A plataforma deve seguir o roadmap confirmado para o projeto.
5. Definir a autoridade responsável por conexão, entrada/saída e estado mínimo da sessão. A autoridade de gameplay será refinada antes de sincronizar Minions e combate.

#### Escopo

- Conectar dois clientes separados à mesma sessão.
- Criar uma identidade/representação para cada participante, sem duplicação.
- Atribuir e exibir lado/campo para cada cliente conforme a regra existente; se não houver regra, usar dados de teste claramente identificados.
- Exibir estados reais de conexão: desconectado, conectando, conectado e falha, se disponíveis na integração.
- Testar saída voluntária, encerramento inesperado de um cliente e tentativa de conexão com sessão indisponível.
- Registrar mensagens de erro e comportamento observado; não implementar matchmaking ou reconexão de produção nesta etapa.

#### Critério de aceite

- Dois clientes independentes entram na mesma sessão FishNet.
- Cada participante aparece uma única vez e ambos os clientes observam as mesmas identidades/lados.
- Entrada, saída e falha de conexão não deixam o cliente em estado enganoso ou travado.
- A sessão pode ser testada sem wallet, RPC, Solana ou Anchor.
- Versões, topologia, autoridade, plataforma de teste, passos, resultados e evidências ficam registrados.

> Este aceite valida somente conexão/participantes. Não valida sincronização de Minions, combate, autoridade final, matchmaking, reconexão garantida ou operação de servidor.

---

## 🟡 FASE 03 — SPL Token e recompensas

### POC 10 — FOWLGEN SPL Token

#### Objetivo

Criar um token fungível de teste para validar a economia de recompensas.

#### Passos

1. Definir a utilidade do token antes de criá-lo.
2. Definir decimals, supply inicial e autoridade de mint.
3. Criar o mint na Devnet.
4. Registrar o endereço do mint.
5. Criar uma conta de token para a wallet de teste.
6. Cunhar uma quantidade pequena para o teste.
7. Consultar o saldo pelo CLI e pelo Unity.

Conceitos essenciais:

- **Mint account:** identifica o token e guarda supply, decimals e autoridades.
- **Token account:** guarda a quantidade de um mint para um owner.
- **Associated Token Account:** endereço padrão derivado do owner e do mint.

#### Critério de aceite

- O mint existe na Devnet.
- A quantidade criada é conhecida.
- A wallet de teste possui uma token account.
- O Unity exibe o mesmo saldo consultado no CLI.

> A decisão entre o Token Program original e Token-2022 deve ser registrada na POC. Não misturar programas sem documentar as diferenças.

---

### POC 11 — Token Account

#### Objetivo

Garantir que o jogador possui e consulta a conta correta para o FOWLGEN Token.

#### Passos

1. Derivar a Associated Token Account pelo owner e mint.
2. Criar a ATA quando ela não existir.
3. Consultar mint, owner e amount.
4. Exibir saldo e endereço no Unity.
5. Testar wallet sem saldo e mint incorreto.

#### Critério de aceite

- A ATA é encontrada de forma determinística.
- O owner da conta é a wallet esperada.
- O mint da conta é o FOWLGEN Token.
- Um mint diferente não é aceito pelo fluxo.

---

### POC 12 — Reward Program

#### Objetivo

Criar uma instrução Anchor para distribuir uma recompensa controlada.

```rust
claim_reward()
```

#### Fluxo recomendado

```text
Resultado validado
       ↓
Anchor verifica regras
       ↓
Mint authority ou vault autoriza
       ↓
Token Account recebe a recompensa
       ↓
Unity atualiza a interface
```

#### Regras da POC

- Não confiar em um valor de vitória enviado livremente pelo cliente.
- Definir quem pode autorizar a recompensa no protótipo.
- Impedir reivindicação duplicada do mesmo evento.
- Registrar um identificador de partida ou nonce.
- Limitar a quantidade máxima por reivindicação.

#### Critério de aceite

- Recompensa válida é recebida uma vez.
- Repetição da mesma reivindicação é rejeitada.
- Wallet incorreta não recebe tokens.
- Falha de transação é apresentada no Unity.

---

### POC 13 — Earn FOWLGEN Token

1. Concluir uma ação de teste no Unity.
2. Gerar um identificador único de resultado.
3. Enviar a solicitação para `claim_reward`.
4. Solicitar assinatura da wallet.
5. Aguardar confirmação na Devnet.
6. Atualizar o saldo somente depois da confirmação.
7. Salvar assinatura e resultado no log da POC.

**Aceite:** uma ação válida gera uma recompensa confirmada e uma ação repetida não gera recompensa duplicada.

### POC 14 — Spend FOWLGEN Token

1. Definir o preço de um upgrade de teste.
2. Verificar saldo antes de enviar a transação.
3. Transferir ou consumir o valor dentro da regra Anchor.
4. Rejeitar saldo insuficiente.
5. Atualizar o saldo do Unity após confirmação.

**Aceite:** o gasto é atômico: ou o upgrade e o consumo acontecem juntos, ou nenhum dos dois acontece.

### POC 15 — Upgrade Using Token

1. Selecionar um FOWLGEN NFT e seu FOWLGENData PDA.
2. Confirmar que a wallet é owner.
3. Confirmar saldo do FOWLGEN Token.
4. Consumir o custo definido.
5. Atualizar o nível ou atributo permitido.
6. Emitir evento de upgrade.
7. Recarregar o PDA no Unity.

**Aceite:** o upgrade altera o PDA, reduz o saldo correto e não permite alteração de outro jogador.

---

## 🟢 FASE 04 — Gameplay off-chain

Nesta fase, o objetivo é construir o jogo sem transformar cada movimento em uma transação.

Primeiro valide movimento, arena, Minions e combate localmente. Depois execute as POCs N02 e N03 com dois clientes FishNet. O loop local deve continuar funcionando sem rede e sem blockchain.

### POC 16 — FOWLGEN Controller

- Criar prefab da galinha.
- Implementar input e movimento.
- Separar estado local de estado on-chain.
- Adicionar câmera e feedback visual.

**Aceite:** o personagem se movimenta sem wallet, RPC ou transação.

### POC 17 — Arena

- Criar arena compacta.
- Definir limites e rotas.
- Adicionar pontos de spawn.
- Criar condição de início e fim.

**Aceite:** a partida inicia e termina localmente com estado reproduzível.

### POC 18 — Combat

- Criar alvo.
- Implementar ataque e colisão.
- Aplicar dano local.
- Exibir feedback visual e sonoro.

**Aceite:** ataque, acerto e dano podem ser testados sem blockchain.

### POC 19 — Enemy

- Criar inimigo de teste.
- Implementar comportamento mínimo.
- Definir alvo, perseguição e derrota.
- Registrar eventos locais para depuração.

**Aceite:** o inimigo participa do loop de combate sem dependência de RPC.

### POC 20 — Health & Damage

- Criar componentes de vida e dano.
- Definir limites e estados.
- Tratar derrota.
- Impedir dano depois da derrota.

**Aceite:** os estados de combate são consistentes e testáveis localmente.

### POC 21 — Ability

- Criar uma habilidade simples.
- Definir custo, cooldown e alcance.
- Aplicar o efeito no Unity.
- Deixar a habilidade parametrizada para futura leitura do PDA.

**Aceite:** a habilidade funciona localmente e seus parâmetros podem ser substituídos por dados do personagem.

### POC 22 — Battle Result

- Definir o modelo de resultado.
- Registrar vencedor, personagem, duração e identificador da partida.
- Separar dados de analytics de dados que serão enviados ao Anchor.
- Criar um resultado assinado ou autorizado pelo fluxo do protótipo.

**Aceite:** o Unity produz um resultado claro, mas ainda não distribui recompensa automaticamente.

### POC N02 — FishNet: Minions e rotas (Fase 04)

#### Pré-requisitos

- POC N01 aprovada com dois clientes.
- Spawn, movimento local dos Minions e as três rotas validados localmente.
- Limite de unidades ativas configurado.

#### Passos

1. Sincronizar o spawn dos Minions usando a autoridade definida na POC N01; impedir que cada cliente crie sua própria cópia autoritativa.
2. Iniciar com uma rota e conferir que ambos os clientes observam as mesmas unidades, lado, rota e estado de movimento.
3. Expandir o teste para as três rotas do mapa aprovado.
4. Testar produção sucessiva e limite de unidades ativas sem divergência entre clientes.
5. Registrar latência observada, duplicações, divergência visual e falhas de spawn.

#### Critério de aceite

- Os dois clientes observam o mesmo conjunto de Minions, rotas e estados relevantes.
- Nenhum spawn duplicado ocorre por execução local nos dois clientes.
- O limite de unidades ativas é respeitado pela autoridade definida.
- O teste é repetido com dois clientes independentes e documentado.

### POC N03 — FishNet: combate, resultado e desconexão (Fase 04)

#### Pré-requisitos

- POCs N01 e N02 aprovadas.
- Regras de combate, função das torres e condição de resultado aprovadas nos documentos de design correspondentes.
- POCs 18–22 testadas localmente.

#### Passos

1. Sincronizar ataques e aplicar cada resultado uma única vez conforme a autoridade aprovada.
2. Confirmar que vida, derrota/remoção e estado final são consistentes nos dois clientes.
3. Testar ataques simultâneos, alvo removido, fim de partida e eventos fora de ordem quando aplicável.
4. Encerrar um cliente durante a sessão e registrar o comportamento da partida; não implementar migração de host/reconexão sem decisão.
5. Confirmar que o resultado observado vem do estado autorizado da partida, não de um valor livre enviado por um cliente.

#### Critério de aceite

- Ambos os clientes observam o mesmo resultado de combate e o mesmo resultado final.
- Um único evento de ataque não é aplicado em duplicidade.
- Desconexão e falha aparecem como estados reais e testáveis.
- A partida de gameplay funciona sem wallet/RPC; qualquer registro Anchor é uma etapa posterior e independente.

#### Limites desta POC

- Não inclui matchmaking de produção, operação de servidor, escalabilidade, reconexão garantida, migração de host ou anti-cheat completo.
- Topologia e autoridade devem ficar registradas como decisões testadas. Uma arquitetura server-authoritative pode ser avaliada, mas não é decisão aprovada por este documento.
- Não sincronizar movimento, frames, colisões ou ataques pela blockchain.

---

## 🔥 FASE 05 — Gameplay + Anchor

### POC 23 — NFT → Playable FOWLGEN

```text
Wallet
  ↓
FOWLGEN NFT
  ↓
FOWLGEN PDA
  ↓
Atributos selecionados
  ↓
Unity
  ↓
Playable FOWLGEN
```

#### Passos

1. Conectar a wallet.
2. Consultar NFTs/ativos da wallet.
3. Selecionar o FOWLGEN NFT.
4. Derivar o FOWLGENData PDA.
5. Ler os atributos.
6. Mapear os atributos para o prefab do Unity.
7. Usar valores padrão somente quando a leitura falhar de forma explícita.

**Aceite:** o personagem carregado no Unity corresponde ao NFT/PDA selecionado.

### POC 24 — On-chain Stats → Gameplay

- Definir o mapa de tipos on-chain para tipos C#.
- Validar ranges antes de aplicar os valores.
- Aplicar apenas atributos autorizados pelo design.
- Manter física, posição e cooldown no Unity.
- Mostrar um painel de diagnóstico com mint, PDA e atributos.

**Aceite:** dois personagens com estados on-chain diferentes apresentam diferenças esperadas no Unity.

### POC 25 — Battle Result → Anchor

1. Finalizar a partida no Unity.
2. Gerar um identificador único de resultado.
3. Enviar somente os dados previstos pela regra.
4. Validar owner, personagem, nonce e condições no Anchor.
5. Registrar evento on-chain.
6. Atualizar o estado da partida após confirmação.

**Aceite:** resultado inválido, duplicado ou de outro jogador é rejeitado.

### POC 26 — Victory → SPL Reward

1. Usar um resultado válido da POC 25.
2. Chamar `claim_reward`.
3. Validar limite e autoridade da recompensa.
4. Confirmar a transação.
5. Atualizar a ATA no Unity.

**Aceite:** vitória válida gera uma recompensa única e rastreável.

### POC 27 — SPL Reward → Upgrade

1. Ler saldo atual.
2. Mostrar custo e resultado esperado.
3. Solicitar assinatura.
4. Consumir o token dentro da instrução Anchor.
5. Atualizar o FOWLGENData PDA.
6. Recarregar saldo e atributos.

**Aceite:** saldo, upgrade e PDA permanecem consistentes depois da confirmação.

### POC 28 — Upgrade → PDA

- Persistir a evolução no FOWLGENData PDA.
- Rejeitar alteração sem owner ou autoridade.
- Recarregar o estado depois de reconectar o Unity.
- Testar transação rejeitada, RPC indisponível e assinatura cancelada.

**Aceite:** o estado continua correto depois de fechar e reabrir o Unity.

---

## 🏆 POC 29 — Complete FOWLGEN Loop

```text
👛 WALLET
    ↓
🐔 FOWLGEN NFT
    ↓
🧬 FOWLGEN PDA
    ↓
📊 ATTRIBUTES
    ↓
🎮 UNITY
    ↓
⚔️ BATTLE
    ↓
🏆 VICTORY
    ↓
🪙 SPL TOKEN
    ↓
⬆️ UPGRADE
    ↓
🧬 UPDATE PDA
    └──────────► 🐔
```

### Roteiro de execução

1. Abrir o Unity em ambiente de desenvolvimento.
2. Conectar uma wallet de teste.
3. Carregar o FOWLGEN NFT.
4. Consultar o FOWLGENData PDA.
5. Criar o personagem jogável.
6. Executar uma partida off-chain.
7. Registrar o resultado.
8. Enviar o resultado ao Anchor.
9. Receber a recompensa SPL.
10. Gastar a recompensa em um upgrade.
11. Atualizar o PDA.
12. Reabrir o Unity e confirmar o novo estado.

### Critérios de conclusão

- O NFT selecionado pertence à wallet de teste.
- O PDA correto é derivado e lido.
- Os atributos são aplicados ao personagem.
- A partida roda sem transformar cada ação em transação.
- O resultado é validado on-chain.
- A recompensa é emitida uma única vez.
- O upgrade consome o token correto.
- O PDA é atualizado e pode ser lido novamente.
- Falhas de wallet, RPC e assinatura são apresentadas ao jogador.

---

## 📱 FASE 06 — Preparação para publicação

A publicação só deve ser considerada depois de o Complete FOWLGEN Loop funcionar na Devnet.

### Checklist

- Build Android funcional.
- Wallet e transações testadas.
- Devnet configurada.
- Metadados do aplicativo preparados.
- APK gerado em modo de distribuição.
- Política da DApp Store conferida.
- Informações de privacidade e suporte preparadas.
- Processo de submissão revisado na documentação oficial.

Referências:

- [Solana Mobile — documentação da DApp Store](https://docs.solanamobile.com/dapp-publishing/intro)
- [Solana Mobile — submissão de um novo aplicativo](https://docs.solanamobile.com/dapp-store/submit-new-app)

---

## Diagnóstico e registro de cada POC

Cada POC deve gerar um pequeno relatório com:

- Objetivo.
- Ambiente e rede utilizada.
- Wallet de teste, sem expor chave privada.
- Endereços de mint, PDA e transação.
- Passos executados.
- Resultado esperado.
- Resultado obtido.
- Erros encontrados.
- Capturas de tela ou vídeo.
- Próximo bloqueio técnico.

### Estados mínimos do Unity

```text
DISCONNECTED
    ↓
CONNECTING
    ↓
CONNECTED
    ↓
SIGNING
    ↓
SUBMITTED
    ↓
CONFIRMED ou FAILED
```

Nunca atualizar saldo, upgrade ou vitória como confirmados apenas porque a transação foi enviada. O estado definitivo deve depender da confirmação recebida da rede.

## Referências técnicas

### Integração e projeto

- [Integração Solana, tokens, NFTs e Unity](Integracao-Solana-tokens-NFTs-Unity-Publicacao-Dapps-Store.md)
- [Guia Completo de Configuração do Ambiente On-Chain](Fowlgen-Wars-Guia-Completo-Detalhado.md)
- [Solana Unity SDK](https://github.com/magicblock-labs/Solana.Unity-SDK)
- [Seven Seas — Solana Game Examples](https://github.com/solana-developers/solana-game-examples/tree/main/seven-seas)

### Anchor e PDAs

- [Anchor — documentação oficial](https://www.anchor-lang.com/docs)
- [Anchor — Program Derived Address](https://www.anchor-lang.com/docs/basics/pda)
- [Anchor — testes](https://www.anchor-lang.com/docs/testing)
- [Anchor — tokens](https://www.anchor-lang.com/docs/tokens)

### Tokens e contas

- [Solana — Tokens](https://solana.com/docs/tokens)
- [Solana — Token Account e Associated Token Account](https://solana.com/docs/tokens/basics)
- [Solana Program — Token](https://github.com/solana-program/token)
- [Solana Program — Token-2022](https://github.com/solana-program/token-2022)

### NFTs e metadados

- [Metaplex — NFTs](https://www.metaplex.com/docs/nfts)
- [Metaplex — criar um NFT](https://www.metaplex.com/docs/nfts/create-nft)
- [Metaplex — consultar um NFT](https://www.metaplex.com/docs/nfts/fetch-nft)
- [Metaplex — Core](https://www.metaplex.com/docs/smart-contracts/core)
- [Metaplex — DAS API](https://www.metaplex.com/docs/dev-tools/das-api)

> As páginas externas podem mudar. Antes de executar uma POC de produção ou publicar um ativo, confirmar as versões, políticas e instruções atuais na documentação oficial.
