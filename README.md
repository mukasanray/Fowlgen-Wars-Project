# 🐔⚔️ Fowlgen Wars

<p align="center">
  <strong>Uma guerra épica, caótica e estratégica onde galinhas dominam o campo de batalha!</strong>
</p>

<p align="center">
  🎮 Mobile Game • ⚔️ Mini-MOBA • 🐔 Universo Original • ⛓️ Web3/Solana • 🔥 Em Desenvolvimento
</p>

---

## 🎯 Conceito

**Fowlgen Wars** é um **Mini-MOBA** mobile onde cada jogador controla um exército completo de pequenos personagens em um mapa compacto. Partidas de **3 minutos**, combate constante, 4 rotas estratégicas.

> Mini mapa. Mini personagens. Mini tropas. 4 rotas. 5 arquétipos de combate. 1 jogador comandando tudo. 3 minutos para decidir a batalha.

---

## 🗺️ As 4 Rotas

| Rota | Classes | Função |
|------|---------|--------|
| 🛡️ **TOP** | Tanques, Colossos, Titãs, Parrudos | Resistência e linha de frente |
| 🌲 **SELVA** | Hunters e Caçadores | Emboscadas e eliminação |
| 🔮 **MID** | Feiticeiros, Magos, Bruxos, Assassinos | Poder, controle e dano |
| 🏹 **ADC** | Atiradores + Protetores/Suportes | Dano à distância e proteção |

---

## 🐔 O Galinheiro

No centro do sistema está o **Galinheiro** — responsável por gerar continuamente novas tropas:

```
GALINHEIRO → GERA TROPAS → AVANÇAM → ENFRENTAM → RECURSOS → FORTALECE → REPETE
```

---

## 📁 Estrutura do Repositório

```
FowlgenWars/
│
├── APP/                          # Site do projeto (futuro)
│
├── program/                      # Anchor/Solana smart contracts
│   ├── programs/
│   │   └── fowlgen_wars/
│   │       └── src/
│   │           └── lib.rs        # Contrato principal
│   ├── tests/                    # Testes Anchor (TypeScript)
│   ├── migrations/               # Scripts de deploy
│   ├── Anchor.toml               # Config do workspace
│   ├── Cargo.toml                # Workspace Rust
│   └── package.json              # Dependências de teste
│
├── unity/
│   └── Fowlgen Wars/             # Unity 6000 (URP)
│       ├── Assets/
│       │   ├── Art/              # Characters, Environment, Materials
│       │   ├── Audio/
│       │   ├── Prefabs/
│       │   ├── Scenes/
│       │   ├── Scripts/
│       │   │   ├── Core/         # GameBootstrap, GameManager
│       │   │   ├── Gameplay/     # FowlgenUnit, Battle, Arena
│       │   │   ├── Solana/       # SolanaManager, Wallet, Transaction
│       │   │   └── UI/
│       │   ├── Solana/
│       │   │   └── IDL/          # IDL gerado pelo Anchor
│       │   └── UI/
│       ├── Packages/
│       └── ProjectSettings/
│
├── .gitignore                    # Unity + Anchor + Security
└── README.md
```

---

## 🚀 Setup

### Pré-requisitos

| Tool | Versão | Uso |
|------|--------|-----|
| **Unity** | 6000.6.2f1+ | Game engine |
| **Git** | 2.x+ | Versionamento |
| **Rust** | stable | Smart contracts |
| **Solana CLI** | latest | Deploy e interação |
| **Anchor CLI** | 0.30.x | Framework Solana |
| **Node.js** | 18+ | Testes Anchor |

### Unity

```bash
# 1. Clone o repositório
git clone <REPOSITORIO>

# 2. Abra no Unity Hub
#    Add > unity/Fowlgen Wars/

# 3. Play
#    O console deve mostrar: "Fowlgen Wars iniciado. Version: 0.1.0"
```

### Anchor (Smart Contracts)

```bash
# 1. Entre na pasta program
cd program

# 2. Instale dependências de teste
npm install

# 3. Gere o keypair do programa
anchor keys list

# 4. Sincronize o ID
anchor keys sync

# 5. Build
anchor build

# 6. Teste
anchor test
```

---

## 📋 POCs — Proof of Concepts

| POC | Descrição | Status |
|-----|-----------|--------|
| **01** | Unity Project Foundation — Scene + C# + Build | ✅ Estrutura criada |
| **02** | Solana Abstraction Layer — Config + Manager + Connection | ✅ Abstrações criadas |
| **03** | Anchor Workspace — Rust + Build + Test | ✅ Estrutura criada |
| **04** | Unity ↔ Anchor — IDL Bridge | ✅ Abstrações criadas |
| **05** | Wallet & Transaction — Sign + Send + Confirm | ✅ Abstrações criadas |

### Critério de DONE (Fase 01)

```
           GITHUB
              │
  ┌───────────┼───────────┐
  ▼           ▼           ▼
 APP        PROGRAM      UNITY
              │           │
              │           ▼
              │        SOLANA SDK
              │           │
              ▼           ▼
            ANCHOR ←──────┘
              │
              ▼
           DEVNET
              │
              ▼
            WALLET
              │
              ▼
         TRANSACTION
              │
              ▼
         CONFIRMED
```

---

## 🏗️ Arquitetura

### Separação de Responsabilidades

```
Unity (Gameplay)          Solana (Blockchain)
─────────────────         ──────────────────
FowlgenUnit               SolanaManager
Movement                  WalletManager
Combat                    TransactionManager
Animation                 FowlgenWarsProgram
UI                        SolanaConfig
```

> **Regra de ouro:** O gameplay funciona independentemente da blockchain. Solana é usado para resultados e progressão, nunca para controle em tempo real.

### O que NÃO fazer

```
❌ Galinha anda → Transaction → Solana → Galinha anda 1 metro
```

### O que fazer

```
✅ Unity → GAMEPLAY REAL-TIME → BATALHA → RESULTADO → Solana (se necessário)
```

---

## 🔒 Segurança

- **NUNCA** commitar chaves privadas, seed phrases ou `.env` files
- **NUNCA** colocar `privateKey` ou `seedPhrase` no código
- Para desenvolvimento, usar **Devnet** com wallets de teste
- O `.gitignore` já protege contra commits acidentais de keypairs

---

## 📜 Licença

Proprietário. Todos os direitos reservados.