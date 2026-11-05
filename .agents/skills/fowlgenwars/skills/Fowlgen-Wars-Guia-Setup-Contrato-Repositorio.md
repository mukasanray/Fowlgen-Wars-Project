# FOWLGEN WARS — Guia de Setup e Compilação do Contrato Anchor a partir do Repositório

Guia passo a passo para configurar o ambiente de desenvolvimento on-chain (**WSL2 Ubuntu, Rust, Solana CLI, Anchor**) e compilar, testar e publicar na Devnet o smart contract existente na pasta `program/` do repositório oficial do projeto [Fowlgen-Wars-Project](https://github.com/mukasanray/Fowlgen-Wars-Project).

---

## 1. Stack Tecnológica e Versões Recomendadas

| Ferramenta / Tecnologia | Versão / Especificação | Finalidade |
| :--- | :--- | :--- |
| **Ambiente Base** | Windows 11 com WSL2 (Ubuntu 22.04 LTS ou superior) | Ambiente Linux para ferramentas Solana/Rust |
| **Node.js & Yarn** | Node v18+ / v20+ LTS e Yarn | Gerenciamento de testes TypeScript |
| **Rust & Cargo** | `rustc` / `cargo` (via rustup) | Compilação de programas BPF on-chain |
| **Solana CLI** | v1.18.26 | Interação com clusters e gerenciamento de wallets |
| **Anchor CLI & AVM** | Latest (via Anchor Version Manager) | Framework de desenvolvimento do smart contract |
| **Repositório do Projeto** | `https://github.com/mukasanray/Fowlgen-Wars-Project.git` | Código-fonte do jogo e da pasta `/program` |

---

## ⚡ Instalação Automatizada via `Install.sh`

Para automatizar 100% da instalação e compilação do contrato no Ubuntu / WSL2 em um único comando:

```bash
chmod +x Install.sh
./Install.sh
```

O script [`Install.sh`](file:///d:/Dev/FowlgenWars/Install.sh) instala todas as dependências do sistema, Node.js v20, Yarn, Rust, Solana CLI v1.18.26, AVM, Anchor CLI, configura a Devnet e executa a compilação do contrato na pasta `program/`.

---

## 2. Preparação Manual do Ambiente no WSL (Ubuntu)

Caso deseje executar os passos manualmente no terminal do **WSL (Ubuntu)**, siga as instruções abaixo:

### Passo 2.1 — Atualizar o Sistema e Instalar Pacotes Essenciais
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install build-essential pkg-config libssl-dev libudev-dev git curl wget -y
```

### Passo 2.2 — Instalar Node.js e Yarn
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn
```
Confirme as versões:
```bash
node -v
yarn -v
```

### Passo 2.3 — Instalar o Compilador Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
```
Verifique a instalação:
```bash
rustc --version
cargo --version
```

### Passo 2.4 — Instalar a Solana CLI (v1.18.26)
```bash
cd ~
wget https://github.com/solana-labs/solana/releases/download/v1.18.26/solana-release-x86_64-unknown-linux-gnu.tar.bz2
tar jxf solana-release-x86_64-unknown-linux-gnu.tar.bz2
echo 'export PATH="$HOME/solana-release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```
Verifique se o comando está acessível:
```bash
solana --version
```

### Passo 2.5 — Instalar AVM (Anchor Version Manager) e Anchor CLI
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```
Confirme a versão instalada:
```bash
anchor --version
```

---

## 3. Configuração da Carteira e Solana Devnet

### Passo 3.1 — Apontar a Solana CLI para a Devnet
```bash
solana config set --url devnet
solana config get
```

### Passo 3.2 — Gerar ou Verificar a Carteira Local
Verifique se já existe uma chave configurada:
```bash
solana address
```
Caso não exista, crie uma nova wallet de desenvolvimento:
```bash
solana-keygen new --no-bip39-passphrase --outfile ~/.config/solana/id.json
```

### Passo 3.3 — Obter SOL de Teste (Airdrop / Faucet)
Solicite saldo na Devnet:
```bash
solana airdrop 2
```
Confira o saldo:
```bash
solana balance
```
> [!TIP]
> Caso a Devnet apresente erro de *Rate Limit* (429), solicite saldo diretamente pelo faucet web oficial em [faucet.solana.com](https://faucet.solana.com) inserindo o seu endereço gerado por `solana address`.

---

## 4. Obtenção e Acesso ao Contrato do Repositório

O smart contract Anchor do FOWLGEN WARS encontra-se na pasta `program/` do repositório oficial.

### Opção A — Clonar o Repositório no WSL (Recomendado para máxima performance de compilação)
```bash
cd ~
git clone https://github.com/mukasanray/Fowlgen-Wars-Project.git
cd Fowlgen-Wars-Project/program
```

### Opção B — Acessar a Pasta do Projeto já clonado no Windows através do WSL
```bash
cd /mnt/d/Dev/FowlgenWars/program
```

### Passo 4.1 — Instalar Dependências TypeScript do Anchor
Na pasta `program/`, execute:
```bash
yarn install
```

---

## 5. Estrutura do Programa no Repositório

A pasta `program/` está organizada da seguinte forma:

```text
program/
├── Anchor.toml                     # Configuração de redes (Localnet/Devnet), programas e carteira
├── Cargo.toml                      # Workspace Rust
├── package.json                    # Dependências TS (Mocha, Chai, Anchor SDK)
├── tsconfig.json                   # Configurações TypeScript
├── programs/
│   └── fowlgen_wars/
│       ├── Cargo.toml              # Dependências do programa Anchor
│       └── src/
│           └── lib.rs              # Código Rust com declare_id! e instrução initialize
└── tests/
    └── fowlgen_wars.ts             # Testes de integração automatizados
```

---

## 6. Sincronização do Program ID

Antes de realizar o deploy na Devnet, é fundamental que o ID do programa gerado localmente corresponda ao `declare_id!()` do código Rust e à configuração no `Anchor.toml`.

### Passo 6.1 — Sincronizar Chaves do Programa
Execute na pasta `program/`:
```bash
anchor keys sync
```
Este comando atualiza automaticamente o endereço no arquivo `programs/fowlgen_wars/src/lib.rs` e no `Anchor.toml`.

Para visualizar o Program ID associado à sua chave de compilação:
```bash
anchor keys list
```

---

## 7. Compilação e Geração do IDL

### Passo 7.1 — Compilar o Contrato
```bash
anchor build
```

O comando `anchor build` gera:
1. **Binário compilado (.so):** `target/deploy/fowlgen_wars.so`
2. **Keypair do Programa:** `target/deploy/fowlgen_wars-keypair.json`
3. **IDL (Interface Definition Language):** `target/idl/fowlgen_wars.json`
4. **Tipos TypeScript:** `target/types/fowlgen_wars.ts`

---

## 8. Execução dos Testes Locais

Execute a suíte de testes TypeScript para validar a instrução `initialize`:

```bash
anchor test
```

> O Anchor subirá um validador local de teste, executará o deploy do programa compilado, rodará os testes em `tests/fowlgen_wars.ts` e confirmará a saída `✅ Fowlgen Wars program initialized successfully!`.

---

## 9. Exportar e Integrar o IDL ao Projeto Unity (Solana Unity SDK)

O arquivo IDL informa ao cliente Unity todas as instruções, parâmetros e contas do smart contract.

### Passo 9.1 — Copiar o IDL para a Pasta de Resources do Unity
No terminal ou no Windows Explorer:
* **Origem:** `program/target/idl/fowlgen_wars.json`
* **Destino no Unity:** `unity/Assets/Resources/IDL/fowlgen_wars.json` (ou pasta designada de RPC/IDL).

> Sempre que o código em Rust (`lib.rs`) for alterado e novas instruções/PDAs forem criadas, execute novamente `anchor build` e atualize o JSON no Unity.

---

## 10. Publicar o Contrato na Solana Devnet

Com o contrato compilado, Program ID sincronizado e saldo de SOL disponível na carteira:

### Passo 10.1 — Deploy na Devnet
```bash
anchor deploy
```

Saída esperada no terminal:
```text
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: /home/usuario/.config/solana/id.json
Deploying program "fowlgen_wars"...
Program path: .../program/target/deploy/fowlgen_wars.so
Program Id: <PROGRAM_ID_PUBLICADO>
Deploy success
```

### Passo 10.2 — Executar Testes Diretos na Devnet
```bash
anchor test --skip-local-validator
```

---

## 11. Validação no Solana Explorer

1. Acesse o [Solana Explorer](https://explorer.solana.com/?cluster=devnet).
2. Certifique-se de que o cluster selecionado no topo direito é **Custom RPC / Devnet**.
3. Cole o **Program Id** do `fowlgen_wars` na barra de busca.
4. Confirme que o status do programa é apresentado como **Executable: Yes** e vinculado ao seu endereço de autoridade (*Upgrade Authority*).

---

## 12. Resumo do Fluxo Operacional

```text
1. Instalar WSL2 + Rust + Solana CLI + Anchor CLI
                          ↓
2. Configurar Solana Devnet e obter SOL no Faucet
                          ↓
3. Acessar pasta /program do repositório (yarn install)
                          ↓
4. anchor keys sync (Sincronizar Program ID)
                          ↓
5. anchor build (Gerar .so e IDL target/idl/fowlgen_wars.json)
                          ↓
6. anchor test (Validar na Localnet)
                          ↓
7. Copiar IDL para o Unity (Assets/Resources/IDL/)
                          ↓
8. anchor deploy (Publicar na Devnet)
                          ↓
9. Validar no Solana Explorer
```

---

## 🔗 Referências Relacionadas
* Repositório Oficial do Projeto: [Fowlgen-Wars-Project](https://github.com/mukasanray/Fowlgen-Wars-Project)
* Pasta do Programa Anchor: [`program/`](file:///d:/Dev/FowlgenWars/program)
* Guia Conceitual Completo: [`Fowlgen-Wars-Guia-Completo-Detalhado.md`](Fowlgen-Wars-Guia-Completo-Detalhado.md)
* Integração Solana Unity SDK: [`Integracao-Solana-tokens-NFTs-Unity-Publicacao-Dapps-Store.md`](Integracao-Solana-tokens-NFTs-Unity-Publicacao-Dapps-Store.md)
