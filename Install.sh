#!/usr/bin/env bash
# ==============================================================================
# 🐔 FOWLGEN WARS — INSTALADOR & PAINEL DE CONTROLE ANCHOR (UBUNTU / WSL2)
# ==============================================================================
# Repositório Oficial: https://github.com/mukasanray/Fowlgen-Wars-Project.git
# Comportamento:
#   [1] Primeira Instalação: Fluxo clássico completo com resumo final
#   [2] Atualização de Ambiente & Recompilação do Contrato
#   [3] Deploy / Atualizar Smart Contract (Localnet / Devnet / Mainnet)
#   [4] Gerenciar Carteiras (Criar, Recuperar, Consultar Saldos, Airdrop)
#   [5] Configurar Program ID & Clusters (Anchor.toml & lib.rs)
#   [6] Executar Testes Automatizados (Anchor / Cargo)
#   [7] Diagnóstico do Ambiente (Health Check)
#   [8] Gerenciar Validador Local (solana-test-validator)
#   [9] Gerenciar Servidor FishNet (Docker)
# ==============================================================================

# Paleta de Cores para o Terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # Sem cor

# Identificação Dinâmica de Diretórios
CURRENT_EXEC_DIR="$(pwd)"
REPO_URL="https://github.com/mukasanray/Fowlgen-Wars-Project.git"

if [ -d "$CURRENT_EXEC_DIR/program" ] && [ -f "$CURRENT_EXEC_DIR/program/Anchor.toml" ]; then
    BASE_DIR="$CURRENT_EXEC_DIR"
    PROGRAM_DIR="$CURRENT_EXEC_DIR/program"
elif [ -d "$CURRENT_EXEC_DIR/fowlgenwars/program" ]; then
    BASE_DIR="$CURRENT_EXEC_DIR/fowlgenwars"
    PROGRAM_DIR="$BASE_DIR/program"
else
    BASE_DIR="$CURRENT_EXEC_DIR/fowlgenwars"
    PROGRAM_DIR="$BASE_DIR/program"
fi

export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$HOME/.avm/bin:$HOME/solana-release/bin:$PATH"
export ANCHOR_BUILD_SBF_ARCH="v0"

pausar() {
    echo ""
    read -rp "Pressione [Enter] para continuar..." _
}

banner() {
    clear
    echo -e "${PURPLE}${BOLD}"
    echo "  ███████╗ ██████╗ ██╗    ██╗██╗      ██████╗ ███████╗███╗   ██╗"
    echo "  ██╔════╝██╔═══██╗██║    ██║██║     ██╔════╝ ██╔════╝████╗  ██║"
    echo "  █████╗  ██║   ██║██║ █╗ ██║██║     ██║  ███╗█████╗  ██╔██╗ ██║"
    echo "  ██╔══╝  ██║   ██║██║███╗██║██║     ██║   ██║██╔══╝  ██║╚██╗██║"
    echo "  ██║     ╚██████╔╝╚███╔███╔╝███████╗╚██████╔╝███████╗██║ ╚████║"
    echo "  ╚═╝      ╚═════╝  ╚══╝╚══╝ ╚══════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝"
    echo "                    ⚔️  W A R S  ⚔️                                "
    echo -e "${NC}"
    echo -e "${CYAN}${BOLD}Instalador & Painel de Controle On-Chain — FOWLGEN WARS${NC}"
    echo -e "${YELLOW}Repositório Oficial:${NC} https://github.com/mukasanray/Fowlgen-Wars-Project.git"
    echo "------------------------------------------------------------------"
}

obter_carteira_configurada() {
    local wallet=""
    if [ -f "$PROGRAM_DIR/Anchor.toml" ]; then
        wallet=$(grep -E '^\s*wallet\s*=' "$PROGRAM_DIR/Anchor.toml" | head -n1 | cut -d'=' -f2 | tr -d ' "' | tr -d "'" | sed "s|^~|$HOME|")
    fi
    if [ -z "$wallet" ]; then
        wallet="$HOME/.config/solana/id.json"
    fi
    echo "$wallet"
}

# ==============================================================================
# 1. PRIMEIRA INSTALAÇÃO (Fluxo Original Completo)
# ==============================================================================
func_primeira_instalacao() {
    banner
    echo -e "${CYAN}${BOLD}Iniciando a Primeira Instalação Completa do Ambiente On-Chain e Off-Chain...${NC}\n"

    # 1. Dependências Base do Sistema Operacional e Docker
    echo -e "\n${BLUE}${BOLD}[1/8] Instalando dependências essenciais do Linux e Docker...${NC}"
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y build-essential pkg-config libssl-dev libudev-dev \
                        libclang-dev protobuf-compiler git curl wget tar bzip2

    echo -e "${YELLOW}Configurando Docker e Docker Compose (Fase 1 e Fase 3)...${NC}"
    sudo apt-get update && sudo apt-get install -y docker.io docker-compose
    sudo usermod -aG docker $USER
    echo -e "\n${CYAN}${BOLD}--- Configuração do Banco de Dados PostgreSQL ---${NC}"
    read -rp "Digite o USUÁRIO do banco de dados [fowlgen]: " DB_USER
    DB_USER=${DB_USER:-"fowlgen"}
    read -rp "Digite a SENHA do banco de dados [fowlgen_password]: " DB_PASS
    DB_PASS=${DB_PASS:-"fowlgen_password"}
    read -rp "Digite o NOME do banco de dados [fowlgenwars]: " DB_NAME
    DB_NAME=${DB_NAME:-"fowlgenwars"}
    
    # Salva as credenciais em um arquivo .env para o Docker Compose legado (se aplicável)
    echo "POSTGRES_USER=$DB_USER" > "$CURRENT_EXEC_DIR/.env"
    echo "POSTGRES_PASSWORD=$DB_PASS" >> "$CURRENT_EXEC_DIR/.env"
    echo "POSTGRES_DB=$DB_NAME" >> "$CURRENT_EXEC_DIR/.env"
    echo -e "${GREEN}✓ Credenciais salvas em .env localmente.${NC}"

    echo -e "${YELLOW}Configurando Minikube...${NC}"
    if ! command -v minikube &> /dev/null; then
        curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
        sudo install minikube-linux-amd64 /usr/local/bin/minikube
        rm minikube-linux-amd64
    else
        echo -e "${GREEN}✓ Minikube já instalado.${NC}"
    fi

    echo -e "${YELLOW}Iniciando Minikube...${NC}"
    minikube start

    # Injeta as credenciais no Kubernetes via Secrets (Criptografado)
    if command -v minikube &> /dev/null; then
        echo -e "${YELLOW}Criando o Secret do PostgreSQL no Kubernetes...${NC}"
        minikube kubectl -- create secret generic postgres-secret \
          --from-literal=POSTGRES_USER="$DB_USER" \
          --from-literal=POSTGRES_PASSWORD="$DB_PASS" \
          --from-literal=POSTGRES_DB="$DB_NAME" \
          --dry-run=client -o yaml | minikube kubectl -- apply -f -
        echo -e "${GREEN}✓ Secret criado com sucesso no Kubernetes!${NC}"
    fi

    # 2. Criar Pasta 'fowlgenwars' e Baixar a Pasta /program do Repositório
    echo -e "\n${BLUE}${BOLD}[2/8] Configurando pasta 'fowlgenwars' no local de execução...${NC}"
    if [ -d "$BASE_DIR/.git" ]; then
        echo -e "${GREEN}✓ Pasta 'fowlgenwars' já encontrada com repositório em:${NC} ${BOLD}${BASE_DIR}${NC}"
        echo -e "${YELLOW}Atualizando código via 'git pull origin main'...${NC}"
        cd "$BASE_DIR"
        git pull origin main || true
    elif [ -d "$PROGRAM_DIR" ] && [ -f "$PROGRAM_DIR/Anchor.toml" ]; then
        echo -e "${GREEN}✓ Pasta 'fowlgenwars/program' já existe e está pronta.${NC}"
    else
        echo -e "${YELLOW}Criando pasta e clonando repositório em:${NC} ${BOLD}${BASE_DIR}${NC}"
        cd "$CURRENT_EXEC_DIR"
        git clone "$REPO_URL" "$BASE_DIR"
        echo -e "${GREEN}✓ Repositório baixado com sucesso! Pasta do contrato disponível em:${NC} ${BOLD}${PROGRAM_DIR}${NC}"
    fi

    # 3. Node.js (v22 LTS Recomendado) e Yarn
    echo -e "\n${BLUE}${BOLD}[3/8] Verificando e configurando Node.js (v22 LTS) e Yarn...${NC}"
    local NODE_MAJOR="0"
    if command -v node &> /dev/null; then
        NODE_MAJOR=$(node -v 2>/dev/null | cut -d'.' -f1 | tr -d 'v')
        NODE_MAJOR=${NODE_MAJOR:-0}
    fi
    if [ "$NODE_MAJOR" -lt 22 ]; then
        echo -e "${YELLOW}Instalando/Atualizando para Node.js v22.x LTS...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        sudo apt update
        sudo apt install -y nodejs
        hash -r
    fi

    echo -e "${YELLOW}Atualizando npm para versão mais recente...${NC}"
    sudo npm install -g npm@latest || true
    hash -r

    if ! command -v yarn &> /dev/null; then
        echo -e "${YELLOW}Instalando Yarn globalmente via npm...${NC}"
        sudo npm install -g yarn
        hash -r
    fi
    echo -e "${GREEN}✓ Node.js: $(node -v 2>/dev/null) | Yarn: $(yarn -v 2>/dev/null)${NC}"

    # 4. Compilador Rust & Cargo
    echo -e "\n${BLUE}${BOLD}[4/8] Verificando e configurando Compilador Rust...${NC}"
    if ! command -v rustc &> /dev/null; then
        echo -e "${YELLOW}Instalando Rust via rustup oficial...${NC}"
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env"
    else
        echo -e "${GREEN}✓ Rust já instalado. Sincronizando com toolchain estável...${NC}"
        rustup update stable
    fi

    export PATH="$HOME/.cargo/bin:$PATH"
    source "$HOME/.cargo/env" 2>/dev/null || true
    echo -e "${GREEN}✓ Rust: $(rustc --version) | Cargo: $(cargo --version)${NC}"

    # 5. Solana CLI (v1.18.26 Oficial do Projeto)
    SOLANA_VERSION="v1.18.26"
    echo -e "\n${BLUE}${BOLD}[5/8] Instalando e configurando Solana CLI (${SOLANA_VERSION})...${NC}"
    if ! command -v solana &> /dev/null || [[ "$(solana --version 2>/dev/null)" != *"${SOLANA_VERSION#v}"* ]]; then
        echo -e "${YELLOW}Baixando Solana CLI ${SOLANA_VERSION}...${NC}"
        cd "$HOME"
        wget -q --show-progress "https://github.com/solana-labs/solana/releases/download/${SOLANA_VERSION}/solana-release-x86_64-unknown-linux-gnu.tar.bz2"
        rm -rf "$HOME/solana-release"
        tar jxf solana-release-x86_64-unknown-linux-gnu.tar.bz2
        rm -f solana-release-x86_64-unknown-linux-gnu.tar.bz2

        if ! grep -q 'solana-release/bin' "$HOME/.bashrc"; then
            echo 'export PATH="$HOME/solana-release/bin:$PATH"' >> "$HOME/.bashrc"
        fi
    fi

    export PATH="$HOME/solana-release/bin:$PATH"
    echo -e "${GREEN}✓ Solana CLI: $(solana --version)${NC}"

    # 6. AVM (Anchor Version Manager) & Anchor CLI
    echo -e "\n${BLUE}${BOLD}[6/8] Instalando AVM e Anchor Framework...${NC}"
    if ! command -v avm &> /dev/null; then
        echo -e "${YELLOW}Compilando AVM via cargo (aguarde alguns minutos)...${NC}"
        cargo install --git https://github.com/coral-xyz/anchor avm --locked
    fi

    if ! grep -q '.avm/bin' "$HOME/.bashrc"; then
        echo 'export PATH="$HOME/.avm/bin:$PATH"' >> "$HOME/.bashrc"
    fi
    export PATH="$HOME/.avm/bin:$PATH"

    if ! grep -q 'ANCHOR_BUILD_SBF_ARCH' "$HOME/.bashrc"; then
        echo 'export ANCHOR_BUILD_SBF_ARCH="v0"' >> "$HOME/.bashrc"
    fi
    export ANCHOR_BUILD_SBF_ARCH="v0"

    echo -e "${YELLOW}Ativando versão mais recente do Anchor...${NC}"
    avm install latest
    avm use latest
    echo -e "${GREEN}✓ Anchor Framework: $(anchor --version)${NC}"

    # 7. Configuração da Solana Devnet & Wallet Local
    echo -e "\n${BLUE}${BOLD}[7/8] Configurando Solana Devnet e Carteira Local...${NC}"
    solana config set --url devnet

    mkdir -p "$HOME/.config/solana"
    if [ ! -f "$HOME/.config/solana/id.json" ]; then
        echo -e "${YELLOW}Gerando nova carteira Devnet em ~/.config/solana/id.json...${NC}"
        solana-keygen new --no-bip39-passphrase --outfile "$HOME/.config/solana/id.json"
    fi

    DEV_WALLET=$(solana address)
    echo -e "${GREEN}✓ Endereço da Carteira Devnet:${NC} ${BOLD}${DEV_WALLET}${NC}"

    echo -e "${YELLOW}Solicitando SOL de teste via Airdrop na Devnet...${NC}"
    solana airdrop 2 "$DEV_WALLET" 2>/dev/null || echo -e "${YELLOW}⚠️  Aviso: Limite de airdrop atingido. Acesse https://faucet.solana.com para solicitar saldo.${NC}"
    echo -e "${GREEN}✓ Saldo Devnet Atual: $(solana balance)${NC}"

    # 8. Setup do Contrato na Pasta fowlgenwars/program
    echo -e "\n${BLUE}${BOLD}[8/8] Configurando e compilando o smart contract em '${PROGRAM_DIR}'...${NC}"
    if [ -d "$PROGRAM_DIR" ]; then
        cd "$PROGRAM_DIR"

        echo -e "${YELLOW}Instalando dependências TypeScript (yarn install)...${NC}"
        yarn install

        echo -e "${YELLOW}Sincronizando Program ID (anchor keys sync)...${NC}"
        anchor keys sync

        echo -e "${YELLOW}Limpando downloads incompletos de platform-tools da Solana...${NC}"
        rm -rf "$HOME/.cache/solana/v1.41"
        rm -rf "$HOME/.cache/solana/v1.4"* 2>/dev/null || true

        echo -e "${YELLOW}Executando compilação do contrato (anchor build --arch v0)...${NC}"
        cd "$PROGRAM_DIR"

        if ! anchor build --arch v0; then
            echo -e "${YELLOW}⚠️ Primeira tentativa falhou ou download foi interrompido. Limpando cache e tentando novamente...${NC}"
            rm -rf "$HOME/.cache/solana/v1.41"
            rm -rf "$HOME/.cache/solana/v1.4"* 2>/dev/null || true
            cd "$PROGRAM_DIR"
            anchor build --arch v0
        fi

        echo -e "${GREEN}✓ Contrato compilado e IDL gerado em: ${PROGRAM_DIR}/target/idl/fowlgen_wars_contract.json${NC}"
    else
        echo -e "${RED}Erro: Pasta do contrato não encontrada em ${PROGRAM_DIR}.${NC}"
        pausar
        return
    fi

    # Resumo Final e Comandos de Operação (Original)
    echo -e "\n${GREEN}${BOLD}=================================================================="
    echo "    🎉 INSTALAÇÃO E SETUP DO FOWLGEN WARS CONCLUÍDOS COM SUCESSO! "
    echo -e "==================================================================${NC}"
    echo -e "${CYAN}${BOLD}Pasta Criada e Configurada:${NC}"
    echo -e "  • Pasta do Projeto:  ${BOLD}${BASE_DIR}${NC}"
    echo -e "  • Pasta do Contrato: ${BOLD}${PROGRAM_DIR}${NC}"
    echo -e "  • Node.js:           ${BOLD}$(node -v 2>/dev/null || echo 'Não instalado')${NC}"
    echo -e "  • Yarn:              ${BOLD}$(yarn -v 2>/dev/null || echo 'Não instalado')${NC}"
    echo -e "  • Rust:              ${BOLD}$(rustc --version 2>/dev/null || echo 'Não instalado')${NC}"
    echo -e "  • Solana CLI:        ${BOLD}$(solana --version 2>/dev/null || echo 'Não instalado')${NC}"
    echo -e "  • Anchor Framework:  ${BOLD}$(anchor --version 2>/dev/null || echo 'Não instalado')${NC}"
    echo -e "  • Carteira Devnet:   ${BOLD}${DEV_WALLET}${NC}"
    echo ""
    echo -e "${YELLOW}${BOLD}Como Testar e Publicar o Contrato:${NC}"
    echo -e "  1. ${BOLD}cd ${PROGRAM_DIR}${NC}"
    echo -e "  2. ${BOLD}anchor test${NC}                    -> Executa os testes automatizados TypeScript"
    echo -e "  3. ${BOLD}anchor program deploy${NC}          -> Publica o contrato na Solana Devnet"
    echo -e "  4. ${BOLD}anchor test --skip-local-validator${NC} -> Valida o contrato direto na Devnet"
    echo ""
    echo -e "${PURPLE}Para atualizar as variáveis de ambiente no seu terminal execute:${NC}"
    echo -e "  ${BOLD}source ~/.bashrc${NC}"
    echo "=================================================================="
    pausar
}

# ==============================================================================
# 2. ATUALIZAR AMBIENTE & RECOMPILAR CONTRATO
# ==============================================================================
func_atualizar_ambiente() {
    banner
    echo -e "${BLUE}${BOLD}>>> [2] Atualizando Repositório, Dependências e Contrato...${NC}\n"

    if [ -d "$BASE_DIR/.git" ]; then
        echo -e "${YELLOW}Puxando alterações mais recentes do repositório (git pull origin main)...${NC}"
        cd "$BASE_DIR"
        git pull origin main
    fi

    echo -e "\n${YELLOW}Sincronizando compilador Rust estável...${NC}"
    rustup update stable

    if [ -d "$PROGRAM_DIR" ]; then
        cd "$PROGRAM_DIR"
        echo -e "\n${YELLOW}Atualizando dependências TypeScript (yarn install)...${NC}"
        yarn install

        echo -e "\n${YELLOW}Sincronizando Program ID (anchor keys sync)...${NC}"
        anchor keys sync

        echo -e "\n${YELLOW}Recompilando smart contract (anchor build --arch v0)...${NC}"
        anchor build --arch v0
        echo -e "\n${GREEN}${BOLD}✓ Ambiente e contrato atualizados com sucesso!${NC}"
    else
        echo -e "${RED}Erro: Diretório do contrato não encontrado em ${PROGRAM_DIR}.${NC}"
    fi
    pausar
}

# ==============================================================================
# 3. DEPLOY & UPGRADE DO SMART CONTRACT
# ==============================================================================
func_deploy_contrato() {
    banner
    echo -e "${BLUE}${BOLD}>>> [3] Deploy / Atualização do Smart Contract${NC}\n"

    if [ ! -d "$PROGRAM_DIR" ]; then
        echo -e "${RED}Erro: Pasta do contrato não encontrada em: ${PROGRAM_DIR}${NC}"
        pausar
        return
    fi

    cd "$PROGRAM_DIR"

    echo "Selecione o cluster de destino para o Deploy/Upgrade:"
    echo -e "  ${BOLD}[1]${NC} localnet (Validador local de teste)"
    echo -e "  ${BOLD}[2]${NC} devnet   (Solana Devnet pública de testes - Recomendado)"
    echo -e "  ${BOLD}[3]${NC} mainnet  (Solana Mainnet-Beta - CUIDADO: Fundos Reais!)"
    echo -e "  ${BOLD}[0]${NC} Cancelar e voltar ao menu"
    echo ""
    read -rp "Opção [0-3]: " CLUSTER_OPT

    local CHOSEN_CLUSTER=""
    case "$CLUSTER_OPT" in
        1) CHOSEN_CLUSTER="localnet" ;;
        2) CHOSEN_CLUSTER="devnet" ;;
        3) CHOSEN_CLUSTER="mainnet" ;;
        0) return ;;
        *) echo -e "${RED}Opção inválida.${NC}"; pausar; return ;;
    esac

    echo -e "\n${BLUE}${BOLD}--- Verificando Pré-Requisitos para Deploy (${CHOSEN_CLUSTER}) ---${NC}"
    
    local CONFIGURED_WALLET
    CONFIGURED_WALLET=$(obter_carteira_configurada)
    echo -e "${CYAN}Carteira configurada no Anchor.toml:${NC} ${BOLD}${CONFIGURED_WALLET}${NC}"

    if [ ! -f "$CONFIGURED_WALLET" ]; then
        echo -e "${RED}❌ ERRO: Arquivo de chave não encontrado em: ${CONFIGURED_WALLET}${NC}"
        echo -e "${YELLOW}Use a opção [4] do menu para criar ou importar uma carteira válida.${NC}"
        pausar
        return
    fi

    local WALLET_PUBKEY
    WALLET_PUBKEY=$(solana-keygen pubkey "$CONFIGURED_WALLET" 2>/dev/null || echo "")
    echo -e "${GREEN}✓ Chave Pública:${NC} ${BOLD}${WALLET_PUBKEY}${NC}"

    if [ "$CHOSEN_CLUSTER" == "mainnet" ]; then
        if ! grep -q '\[programs\.mainnet\]' Anchor.toml; then
            echo -e "${YELLOW}⚠️ Aviso: [programs.mainnet] está ausente ou comentado no Anchor.toml.${NC}"
        fi

        echo -e "\n${RED}${BOLD}🚨 ATENÇÃO CRÍTICA: DEPLOY NA MAINNET CONSOME SOL REAL!${NC}"
        local MAINNET_BAL
        MAINNET_BAL=$(solana balance "$WALLET_PUBKEY" --url mainnet-beta 2>/dev/null || echo "0 SOL")
        echo -e "${CYAN}Saldo da carteira na Mainnet:${NC} ${BOLD}${MAINNET_BAL}${NC}"
        read -rp "Para confirmar a publicação na MAINNET, digite 'CONFIRMAR-MAINNET': " CONFIRM_TXT
        if [ "$CONFIRM_TXT" != "CONFIRMAR-MAINNET" ]; then
            echo -e "${YELLOW}Operação cancelada com segurança.${NC}"
            pausar
            return
        fi
    elif [ "$CHOSEN_CLUSTER" == "devnet" ]; then
        local DEV_BAL
        DEV_BAL=$(solana balance "$WALLET_PUBKEY" --url devnet 2>/dev/null || echo "0 SOL")
        echo -e "${CYAN}Saldo na Devnet:${NC} ${BOLD}${DEV_BAL}${NC}"
        if [[ "$DEV_BAL" == "0 SOL"* ]]; then
            echo -e "${YELLOW}Solicitando 2 SOL de teste via airdrop...${NC}"
            solana airdrop 2 "$WALLET_PUBKEY" --url devnet 2>/dev/null || true
            echo -e "${CYAN}Saldo atualizado:${NC} $(solana balance "$WALLET_PUBKEY" --url devnet 2>/dev/null || echo '0 SOL')"
        fi
    elif [ "$CHOSEN_CLUSTER" == "localnet" ]; then
        echo -e "${CYAN}Checando validador local (127.0.0.1:8899)...${NC}"
        if ! curl -s http://127.0.0.1:8899 >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️ O validador local não está ativo.${NC}"
            read -rp "Deseja iniciá-lo em segundo plano agora? (s/N): " START_VAL
            if [[ "$START_VAL" =~ ^[sS]$ ]]; then
                nohup solana-test-validator --reset > "$HOME/solana-test-validator.log" 2>&1 &
                echo -e "${GREEN}Validador local iniciado em segundo plano.${NC}"
                sleep 4
            else
                echo -e "${YELLOW}Operação cancelada.${NC}"
                pausar
                return
            fi
        else
            echo -e "${GREEN}✓ Validador local ativo.${NC}"
        fi
    fi

    echo -e "\n${YELLOW}Sincronizando chaves e compilando binário (anchor build --arch v0)...${NC}"
    anchor keys sync
    anchor build --arch v0

    echo -e "\n${YELLOW}Executando: anchor program deploy --provider.cluster ${CHOSEN_CLUSTER} --provider.wallet ${CONFIGURED_WALLET}${NC}"
    if anchor program deploy --provider.cluster "$CHOSEN_CLUSTER" --provider.wallet "$CONFIGURED_WALLET"; then
        echo -e "\n${GREEN}${BOLD}🎉 DEPLOY / UPGRADE EXECUTADO COM SUCESSO!${NC}"
        
        echo ""
        read -rp "Deseja inicializar/atualizar o IDL on-chain agora? (S/n): " UPGRADE_IDL
        if [[ ! "$UPGRADE_IDL" =~ ^[nN]$ ]]; then
            local PROG_ID
            PROG_ID=$(anchor keys list 2>/dev/null | grep fowlgen_wars_contract | awk '{print $2}')
            if [ -n "$PROG_ID" ] && [ -f "target/idl/fowlgen_wars_contract.json" ]; then
                echo -e "${YELLOW}Atualizando IDL on-chain para o Program ID: ${PROG_ID}...${NC}"
                anchor idl upgrade "$PROG_ID" -f target/idl/fowlgen_wars_contract.json --provider.cluster "$CHOSEN_CLUSTER" 2>/dev/null || \
                anchor idl init "$PROG_ID" -f target/idl/fowlgen_wars_contract.json --provider.cluster "$CHOSEN_CLUSTER" 2>/dev/null || true
                echo -e "${GREEN}✓ Operação de IDL concluída.${NC}"
            fi
        fi
    else
        echo -e "\n${RED}⚠️ Falha no deploy. Verifique se a carteira possui saldo suficiente.${NC}"
    fi
    pausar
}

# ==============================================================================
# 4. GESTÃO DE CARTEIRAS (WALLETS)
# ==============================================================================
func_gerenciar_carteiras() {
    while true; do
        banner
        echo -e "${BLUE}${BOLD}>>> [4] Gerenciador de Carteiras (Solana Wallets)${NC}\n"

        local CURRENT_WALLET
        CURRENT_WALLET=$(obter_carteira_configurada)
        local PUBKEY=""
        if [ -f "$CURRENT_WALLET" ]; then
            PUBKEY=$(solana-keygen pubkey "$CURRENT_WALLET" 2>/dev/null || echo "Inacessível")
        fi

        echo -e "Carteira Atual no Anchor.toml: ${BOLD}${CURRENT_WALLET}${NC}"
        echo -e "Chave Pública:                 ${CYAN}${BOLD}${PUBKEY:-'Nenhuma carteira configurada'}${NC}\n"

        echo "Escolha a operação desejada:"
        echo -e "  ${BOLD}[1]${NC} Consultar saldos nos clusters (Localnet, Devnet, Mainnet)"
        echo -e "  ${BOLD}[2]${NC} Criar NOVA carteira de desenvolvimento (Keypair)"
        echo -e "  ${BOLD}[3]${NC} Recuperar carteira existente via Seed Phrase (Mnemônica)"
        echo -e "  ${BOLD}[4]${NC} Vincular arquivo de carteira (.json) existente ao Anchor.toml"
        echo -e "  ${BOLD}[5]${NC} Solicitar Airdrop de 2 SOL na Devnet"
        echo -e "  ${BOLD}[0]${NC} Voltar ao menu principal"
        echo ""
        read -rp "Opção [0-5]: " W_OPT

        case "$W_OPT" in
            1)
                echo -e "\n${YELLOW}${BOLD}Consultando saldos com 'solana balance'...${NC}\n"
                if [ -n "$PUBKEY" ]; then
                    echo -e "${CYAN}${BOLD}Carteira Ativa no Anchor.toml:${NC} ${BOLD}${CURRENT_WALLET}${NC}"
                    echo -e "  • Endereço:        ${BOLD}${PUBKEY}${NC}"
                    echo -e "  • Devnet:          $(solana balance --url devnet "$PUBKEY" 2>/dev/null || echo 'Erro ao consultar')"
                    echo -e "  • Mainnet:         $(solana balance --url mainnet-beta "$PUBKEY" 2>/dev/null || echo 'Erro ao consultar')"
                    echo -e "  • Localnet (8899): $(solana balance --url http://127.0.0.1:8899 "$PUBKEY" 2>/dev/null || echo 'Validador Offline')"
                else
                    echo -e "${RED}Nenhuma carteira ativa encontrada no Anchor.toml.${NC}"
                fi

                # Lista também todas as outras carteiras do sistema
                local all_wallets=("$HOME/.config/solana"/*.json)
                echo -e "\n${CYAN}${BOLD}Todas as Carteiras encontradas em ~/.config/solana/:${NC}"
                for w in "${all_wallets[@]}"; do
                    if [ -f "$w" ]; then
                        local w_name
                        w_name=$(basename "$w")
                        local w_pub
                        w_pub=$(solana-keygen pubkey "$w" 2>/dev/null || echo "Inválida")
                        local w_bal
                        w_bal=$(solana balance --url devnet "$w_pub" 2>/dev/null || echo "0 SOL")
                        echo -e "  • ${BOLD}${w_name}${NC} (${w_pub}) -> Devnet: ${GREEN}${BOLD}${w_bal}${NC}"
                    fi
                done
                pausar
                ;;
            2)
                echo ""
                read -rp "Digite o nome para o arquivo (ex: carteira_teste): " NEW_NAME
                NEW_NAME=${NEW_NAME:-"carteira_teste"}
                local OUT_PATH="$HOME/.config/solana/${NEW_NAME}.json"
                mkdir -p "$HOME/.config/solana"
                solana-keygen new --outfile "$OUT_PATH"
                echo -e "\n${GREEN}✓ Nova carteira criada em:${NC} ${BOLD}${OUT_PATH}${NC}"
                read -rp "Deseja configurar esta carteira como padrão no Anchor.toml? (S/n): " SET_DEF
                if [[ ! "$SET_DEF" =~ ^[nN]$ ]]; then
                    sed -i "s|^\s*wallet\s*=.*|wallet = \"${OUT_PATH}\"|" "$PROGRAM_DIR/Anchor.toml"
                    echo -e "${GREEN}✓ Anchor.toml atualizado com a nova carteira!${NC}"
                fi
                pausar
                ;;
            3)
                echo ""
                read -rp "Digite o nome para salvar a carteira recuperada (ex: carteira_recuperada): " REC_NAME
                REC_NAME=${REC_NAME:-"carteira_recuperada"}
                local REC_PATH="$HOME/.config/solana/${REC_NAME}.json"
                mkdir -p "$HOME/.config/solana"
                echo -e "${YELLOW}Digite a sua frase semente (12 ou 24 palavras) quando solicitado:${NC}"
                solana-keygen recover "prompt://?key=0/0" --outfile "$REC_PATH"
                echo -e "\n${GREEN}✓ Carteira recuperada em:${NC} ${BOLD}${REC_PATH}${NC}"
                read -rp "Deseja vincular esta carteira no Anchor.toml? (S/n): " SET_REC
                if [[ ! "$SET_REC" =~ ^[nN]$ ]]; then
                    sed -i "s|^\s*wallet\s*=.*|wallet = \"${REC_PATH}\"|" "$PROGRAM_DIR/Anchor.toml"
                    echo -e "${GREEN}✓ Anchor.toml atualizado!${NC}"
                fi
                pausar
                ;;
            4)
                selecionar_e_vincular_carteira
                pausar
                ;;
            5)
                if [ -n "$PUBKEY" ]; then
                    echo -e "\n${YELLOW}Solicitando 2 SOL na Devnet para ${PUBKEY}...${NC}"
                    solana airdrop 2 "$PUBKEY" --url devnet || echo -e "${YELLOW}Falha no airdrop. Use o faucet: https://faucet.solana.com${NC}"
                    echo -e "Novo Saldo Devnet: $(solana balance "$PUBKEY" --url devnet 2>/dev/null || echo '0 SOL')"
                else
                    echo -e "${RED}Nenhuma carteira ativa encontrada.${NC}"
                fi
                pausar
                ;;
            0) break ;;
            *) echo -e "${RED}Opção inválida.${NC}"; pausar ;;
        esac
    done
}

# Função auxiliar para listar carteiras existentes e atualizar o Anchor.toml
selecionar_e_vincular_carteira() {
    echo -e "\n${CYAN}${BOLD}Buscando carteiras .json em ~/.config/solana/...${NC}"
    mkdir -p "$HOME/.config/solana"
    
    local files=("$HOME/.config/solana"/*.json)
    local valid_files=()
    local count=0

    for f in "${files[@]}"; do
        if [ -f "$f" ]; then
            valid_files+=("$f")
            ((count++))
        fi
    done

    local i=1
    local W_CHOICE=""
    if [ $count -gt 0 ]; then
        echo -e "Carteiras disponíveis no sistema:"
        for f in "${valid_files[@]}"; do
            local pubkey
            pubkey=$(solana-keygen pubkey "$f" 2>/dev/null || echo "Inacessível")
            local fname
            fname=$(basename "$f")
            echo -e "  ${BOLD}[$i]${NC} ${fname} -> ${CYAN}${pubkey}${NC}"
            ((i++))
        done
        echo -e "  ${BOLD}[M]${NC} Digitar outro caminho de arquivo manualmente"
        echo -e "  ${BOLD}[0]${NC} Cancelar"
        read -rp "Selecione o número da carteira [1-$count, M, 0]: " W_CHOICE
    else
        echo -e "${YELLOW}Nenhuma carteira .json encontrada em ~/.config/solana/${NC}"
        W_CHOICE="M"
    fi

    local SELECTED_PATH=""
    if [[ "$W_CHOICE" =~ ^[0-9]+$ ]] && [ "$W_CHOICE" -ge 1 ] && [ "$W_CHOICE" -le "$count" ]; then
        local idx=$((W_CHOICE - 1))
        SELECTED_PATH="${valid_files[$idx]}"
    elif [[ "$W_CHOICE" =~ ^[mM]$ ]]; then
        read -rp "Digite o caminho absoluto do arquivo .json: " MANUAL_PATH
        SELECTED_PATH=$(eval echo "$MANUAL_PATH")
    elif [ "$W_CHOICE" == "0" ]; then
        return
    else
        echo -e "${RED}Opção inválida.${NC}"
        return
    fi

    if [ -f "$SELECTED_PATH" ]; then
        if [ -f "$PROGRAM_DIR/Anchor.toml" ]; then
            sed -i "s|^\s*wallet\s*=.*|wallet = \"${SELECTED_PATH}\"|" "$PROGRAM_DIR/Anchor.toml"
            local new_pub
            new_pub=$(solana-keygen pubkey "$SELECTED_PATH" 2>/dev/null || echo "")
            echo -e "\n${GREEN}${BOLD}✓ Anchor.toml atualizado com sucesso!${NC}"
            echo -e "  • Novo caminho:  ${BOLD}${SELECTED_PATH}${NC}"
            echo -e "  • Chave Pública: ${CYAN}${BOLD}${new_pub}${NC}"
        else
            echo -e "${RED}Arquivo Anchor.toml não encontrado em ${PROGRAM_DIR}${NC}"
        fi
    else
        echo -e "${RED}Arquivo de carteira não existe: ${SELECTED_PATH}${NC}"
    fi
}

# ==============================================================================
# 5. CONFIGURAR PROGRAM ID & CLUSTERS (Anchor.toml & lib.rs)
# ==============================================================================
func_configurar_program_e_clusters() {
    while true; do
        banner
        echo -e "${BLUE}${BOLD}>>> [5] Configurar Program ID, Carteira & Clusters (Anchor.toml & lib.rs)${NC}\n"

        local LIB_RS="$PROGRAM_DIR/programs/fowlgen_wars_contract/src/lib.rs"
        local ANCHOR_TOML="$PROGRAM_DIR/Anchor.toml"

        local CURRENT_DECLARED_ID="Não encontrado"
        if [ -f "$LIB_RS" ]; then
            CURRENT_DECLARED_ID=$(grep -oP 'declare_id!\("\K[^"]+' "$LIB_RS" 2>/dev/null || echo "11111111111111111111111111111111")
        fi

        local CURRENT_CLUSTER="localnet"
        if [ -f "$ANCHOR_TOML" ]; then
            CURRENT_CLUSTER=$(grep -E '^\s*cluster\s*=' "$ANCHOR_TOML" | head -n1 | cut -d'=' -f2 | tr -d ' "' | tr -d "'")
        fi

        local KEYPAIR_PUBKEY="Não compilado"
        if command -v anchor &>/dev/null && [ -d "$PROGRAM_DIR" ]; then
            cd "$PROGRAM_DIR"
            KEYPAIR_PUBKEY=$(anchor keys list 2>/dev/null | grep fowlgen_wars_contract | awk '{print $2}')
            [ -z "$KEYPAIR_PUBKEY" ] && KEYPAIR_PUBKEY="Execute 'anchor build' primeiro"
        fi

        local CURRENT_W
        CURRENT_W=$(obter_carteira_configurada)
        local W_PUB
        W_PUB=$(solana-keygen pubkey "$CURRENT_W" 2>/dev/null || echo "Inacessível")

        echo -e "Carteira no Anchor.toml:        ${BOLD}${CURRENT_W}${NC}"
        echo -e "Chave Pública da Carteira:      ${CYAN}${BOLD}${W_PUB}${NC}"
        echo -e "Cluster Ativo no Anchor.toml:   ${GREEN}${BOLD}${CURRENT_CLUSTER}${NC}"
        echo -e "Program ID no lib.rs:           ${CYAN}${BOLD}${CURRENT_DECLARED_ID}${NC}"
        echo -e "Program ID real do Keypair:     ${YELLOW}${BOLD}${KEYPAIR_PUBKEY}${NC}\n"

        echo "Escolha a operação:"
        echo -e "  ${BOLD}[1]${NC} 🔄 Sincronizar automaticamente chaves (anchor keys sync)"
        echo -e "  ${BOLD}[2]${NC} ✏️  Inserir/Alterar manualmente a chave pública (Atualiza lib.rs e Anchor.toml)"
        echo -e "  ${BOLD}[3]${NC} 🌐 Alternar Cluster Ativo no Anchor.toml (localnet / devnet / mainnet)"
        echo -e "  ${BOLD}[4]${NC} 👛 Alterar Carteira Ativa no Anchor.toml (Escolher da lista ou digitar)"
        echo -e "  ${BOLD}[0]${NC} Voltar ao menu principal"
        echo ""
        read -rp "Opção [0-4]: " CFG_OPT

        case "$CFG_OPT" in
            1)
                echo -e "\n${YELLOW}Executando 'anchor keys sync' em ${PROGRAM_DIR}...${NC}"
                cd "$PROGRAM_DIR"
                anchor keys sync
                echo -e "${GREEN}✓ Chaves sincronizadas com sucesso entre o keypair, lib.rs e Anchor.toml!${NC}"
                pausar
                ;;
            2)
                echo ""
                read -rp "Cole a nova Chave Pública (Program ID): " NEW_PUBKEY
                NEW_PUBKEY=$(echo "$NEW_PUBKEY" | tr -d '[:space:]')
                if [ ${#NEW_PUBKEY} -ge 32 ] && [ ${#NEW_PUBKEY} -le 44 ]; then
                    echo -e "${YELLOW}Atualizando em lib.rs...${NC}"
                    if [ -f "$LIB_RS" ]; then
                        sed -i "s/declare_id!(\"[^\"]*\")/declare_id!(\"${NEW_PUBKEY}\")/" "$LIB_RS"
                    fi

                    echo -e "${YELLOW}Atualizando em Anchor.toml...${NC}"
                    if [ -f "$ANCHOR_TOML" ]; then
                        sed -i "s/fowlgen_wars_contract = \"[^\"]*\"/fowlgen_wars_contract = \"${NEW_PUBKEY}\"/g" "$ANCHOR_TOML"
                    fi
                    echo -e "${GREEN}✓ Program ID atualizado com sucesso para: ${BOLD}${NEW_PUBKEY}${NC}"
                else
                    echo -e "${RED}Chave pública inválida (deve possuir entre 32 e 44 caracteres base58).${NC}"
                fi
                pausar
                ;;
            3)
                echo -e "\nEscolha o novo cluster para o Anchor.toml:"
                echo -e "  ${BOLD}[1]${NC} localnet"
                echo -e "  ${BOLD}[2]${NC} devnet"
                echo -e "  ${BOLD}[3]${NC} mainnet (Produção)"
                read -rp "Opção [1-3]: " CLUST_CHOICE

                local TARGET_C=""
                case "$CLUST_CHOICE" in
                    1) TARGET_C="localnet" ;;
                    2) TARGET_C="devnet" ;;
                    3) TARGET_C="mainnet" ;;
                    *) echo -e "${RED}Opção inválida.${NC}"; pausar; continue ;;
                esac

                if [ -f "$ANCHOR_TOML" ]; then
                    sed -i "s/^\s*cluster\s*=.*/cluster = \"${TARGET_C}\"/" "$ANCHOR_TOML"
                    
                    # Se escolheu mainnet, garante que a seção esteja ativa
                    if [ "$TARGET_C" == "mainnet" ]; then
                        sed -i 's/# \[programs\.mainnet\]/\[programs\.mainnet\]/' "$ANCHOR_TOML"
                        sed -i 's/# fowlgen_wars_contract = "\(.*\)"/fowlgen_wars_contract = "\1"/' "$ANCHOR_TOML"
                    fi
                    echo -e "${GREEN}✓ Cluster no Anchor.toml alterado para: ${BOLD}${TARGET_C}${NC}"
                fi
                pausar
                ;;
            4)
                selecionar_e_vincular_carteira
                pausar
                ;;
            0) break ;;
            *) echo -e "${RED}Opção inválida.${NC}"; pausar ;;
        esac
    done
}

# ==============================================================================
# 6. EXECUTAR TESTES AUTOMATIZADOS
# ==============================================================================
func_executar_testes() {
    banner
    echo -e "${BLUE}${BOLD}>>> [6] Execução de Testes Automatizados${NC}\n"

    if [ ! -d "$PROGRAM_DIR" ]; then
        echo -e "${RED}Erro: Pasta do contrato não encontrada em: ${PROGRAM_DIR}${NC}"
        pausar
        return
    fi

    cd "$PROGRAM_DIR"

    echo "Escolha a modalidade de testes:"
    echo -e "  ${BOLD}[1]${NC} anchor test (Validador local efêmero gerenciado pelo Anchor)"
    echo -e "  ${BOLD}[2]${NC} anchor test --skip-local-validator (Executa direto no cluster do Anchor.toml)"
    echo -e "  ${BOLD}[3]${NC} cargo test  (Testes unitários puros em Rust)"
    echo -e "  ${BOLD}[0]${NC} Voltar ao menu principal"
    echo ""
    read -rp "Opção [0-3]: " T_OPT

    case "$T_OPT" in
        1)
            echo -e "\n${YELLOW}Executando 'anchor test'...${NC}"
            ANCHOR_BUILD_SBF_ARCH="v0" anchor test
            ;;
        2)
            echo -e "\n${YELLOW}Executando 'anchor test --skip-local-validator'...${NC}"
            ANCHOR_BUILD_SBF_ARCH="v0" anchor test --skip-local-validator
            ;;
        3)
            echo -e "\n${YELLOW}Executando 'cargo test'...${NC}"
            cargo test
            ;;
        0) return ;;
        *) echo -e "${RED}Opção inválida.${NC}" ;;
    esac
    pausar
}

# ==============================================================================
# 7. DIAGNÓSTICO DO AMBIENTE (Health Check)
# ==============================================================================
func_diagnostico_healthcheck() {
    banner
    echo -e "${BLUE}${BOLD}>>> [7] Diagnóstico de Saúde do Ambiente (Health Check)${NC}\n"

    check_tool() {
        local name="$1"
        local cmd="$2"
        if command -v "$name" &>/dev/null; then
            echo -e "  [${GREEN}OK${NC}] ${BOLD}${name}${NC}: $($cmd 2>/dev/null | head -n1)"
        else
            echo -e "  [${RED}FALHA${NC}] ${BOLD}${name}${NC}: Não instalado ou não encontrado no PATH"
        fi
    }

    echo -e "${CYAN}${BOLD}Ferramentas e Compiladores:${NC}"
    check_tool "node" "node -v"
    check_tool "npm" "npm -v"
    check_tool "yarn" "yarn -v"
    check_tool "rustc" "rustc --version"
    check_tool "cargo" "cargo --version"
    check_tool "solana" "solana --version"
    check_tool "avm" "avm --version"
    check_tool "anchor" "anchor --version"
    check_tool "git" "git --version"

    echo -e "\n${CYAN}${BOLD}Configurações Ativas do Anchor.toml:${NC}"
    if [ -f "$PROGRAM_DIR/Anchor.toml" ]; then
        local CLUSTER_CFG
        CLUSTER_CFG=$(grep -E '^\s*cluster\s*=' "$PROGRAM_DIR/Anchor.toml" | cut -d'=' -f2 | tr -d ' "' | tr -d "'")
        local WALLET_CFG
        WALLET_CFG=$(obter_carteira_configurada)
        
        echo -e "  • Cluster Padrão:     ${BOLD}${CLUSTER_CFG}${NC}"
        echo -e "  • Caminho da Carteira:${BOLD}${WALLET_CFG}${NC}"
        
        if [ -f "$WALLET_CFG" ]; then
            local PUB
            PUB=$(solana-keygen pubkey "$WALLET_CFG" 2>/dev/null || echo "")
            echo -e "  • Chave Pública:      ${GREEN}${BOLD}${PUB}${NC}"
            echo -e "  • Saldo na Devnet:    $(solana balance "$PUB" --url devnet 2>/dev/null || echo 'Sem conexão')"
        else
            echo -e "  • Status da Carteira: ${RED}Arquivo não encontrado no disco!${NC}"
        fi
    else
        echo -e "  ${YELLOW}Arquivo Anchor.toml não localizado em ${PROGRAM_DIR}${NC}"
    fi

    echo -e "\n${CYAN}${BOLD}Status de Serviços Locais:${NC}"
    if curl -s http://127.0.0.1:8899 >/dev/null 2>&1; then
        echo -e "  • solana-test-validator: [${GREEN}EM EXECUÇÃO${NC}] na porta 8899"
    else
        echo -e "  • solana-test-validator: [${YELLOW}PARADO${NC}]"
    fi

    echo -e "\n${CYAN}${BOLD}Status do Servidor FishNet (Docker):${NC}"
    if command -v docker &>/dev/null; then
        if docker ps --format '{{.Names}}' | grep -q "fowlgen_server"; then
            echo -e "  • fowlgen_server: [${GREEN}EM EXECUÇÃO${NC}]"
        else
            echo -e "  • fowlgen_server: [${YELLOW}PARADO${NC}]"
        fi
    else
        echo -e "  • Docker: [${RED}NÃO INSTALADO${NC}]"
    fi

    pausar
}

# ==============================================================================
# 8. GERENCIADOR DO VALIDADOR LOCAL
# ==============================================================================
func_validador_local() {
    banner
    echo -e "${BLUE}${BOLD}>>> [8] Gerenciador do Validador Local (solana-test-validator)${NC}\n"

    local STATUS="PARADO"
    if curl -s http://127.0.0.1:8899 >/dev/null 2>&1; then
        STATUS="${GREEN}ATIVO / RESPONDENDO NA PORTA 8899${NC}"
    fi

    echo -e "Status Atual: ${BOLD}${STATUS}${NC}\n"
    echo "Opções:"
    echo -e "  ${BOLD}[1]${NC} Iniciar validador local em segundo plano"
    echo -e "  ${BOLD}[2]${NC} Parar validador local em execução"
    echo -e "  ${BOLD}[3]${NC} Ver últimas 20 linhas do log"
    echo -e "  ${BOLD}[0]${NC} Voltar ao menu principal"
    echo ""
    read -rp "Opção [0-3]: " V_OPT

    case "$V_OPT" in
        1)
            if curl -s http://127.0.0.1:8899 >/dev/null 2>&1; then
                echo -e "${YELLOW}O validador já está em execução.${NC}"
            else
                echo -e "${YELLOW}Iniciando solana-test-validator...${NC}"
                nohup solana-test-validator --reset > "$HOME/solana-test-validator.log" 2>&1 &
                sleep 3
                if curl -s http://127.0.0.1:8899 >/dev/null 2>&1; then
                    echo -e "${GREEN}✓ Validador local iniciado com sucesso! Log em: ~/solana-test-validator.log${NC}"
                else
                    echo -e "${YELLOW}Iniciado. Aguarde alguns instantes até a porta 8899 abrir.${NC}"
                fi
            fi
            ;;
        2)
            echo -e "${YELLOW}Parando processos do solana-test-validator...${NC}"
            pkill -f solana-test-validator || true
            sleep 1
            echo -e "${GREEN}✓ Validador finalizado.${NC}"
            ;;
        3)
            if [ -f "$HOME/solana-test-validator.log" ]; then
                echo -e "\n${CYAN}--- Últimas linhas do log ---${NC}"
                tail -n 20 "$HOME/solana-test-validator.log"
            else
                echo -e "${YELLOW}Nenhum log encontrado em ~/solana-test-validator.log${NC}"
            fi
            ;;
        0) return ;;
        *) echo -e "${RED}Opção inválida.${NC}" ;;
    esac
    pausar
}

# ==============================================================================
# 9. GERENCIADOR DO SERVIDOR FISHNET (DOCKER)
# ==============================================================================
func_servidor_fishnet() {
    banner
    echo -e "${BLUE}${BOLD}>>> [9] Gerenciar Servidor FishNet (Kubernetes / Minikube)${NC}\n"

    echo "Opções:"
    echo -e "  ${BOLD}[1]${NC} Iniciar Minikube (minikube start)"
    echo -e "  ${BOLD}[2]${NC} Parar Minikube (minikube stop)"
    echo -e "  ${BOLD}[3]${NC} Deploy no Minikube (Build da Imagem + Iniciar Pods)"
    echo -e "  ${BOLD}[4]${NC} Parar Servidor no Minikube (Remover Deploy)"
    echo -e "  ${BOLD}[5]${NC} Ver Status e IP de Conexão (Minikube)"
    echo -e "  ${BOLD}[6]${NC} Ver Logs do Servidor no Minikube"
    echo -e "  ${BOLD}[7]${NC} Abrir Painel do Minikube (Dashboard)"
    echo -e "  ${BOLD}[0]${NC} Voltar ao menu principal"
    echo ""
    read -rp "Opção [0-7]: " FISH_OPT

    local DOCKER_DIR="$BASE_DIR"
    local MINIKUBE_BIN="$HOME/.local/bin/minikube"
    if ! command -v "$MINIKUBE_BIN" &> /dev/null; then
        MINIKUBE_BIN="minikube"
    fi

    case "$FISH_OPT" in
        1)
            echo -e "${YELLOW}Iniciando Minikube...${NC}"
            $MINIKUBE_BIN start
            ;;
        2)
            echo -e "${YELLOW}Parando Minikube...${NC}"
            $MINIKUBE_BIN stop
            ;;
        3)
            echo -e "${YELLOW}Iniciando Deploy no Minikube...${NC}"
            if [ -d "$DOCKER_DIR/k8s" ]; then
                cd "$DOCKER_DIR"
                echo "1. Compilando imagem dentro do Minikube..."
                $MINIKUBE_BIN image build -t fowlgenwars-server:latest .
                echo "2. Aplicando configurações Kubernetes (k8s/)..."
                $MINIKUBE_BIN kubectl -- apply -f k8s/
                echo -e "${GREEN}✓ Deploy concluído! Verifique o status com a opção 5.${NC}"
            else
                echo -e "${RED}Erro: Pasta k8s/ não encontrada em ${DOCKER_DIR}.${NC}"
            fi
            ;;
        4)
            echo -e "${YELLOW}Removendo Deploy do Minikube...${NC}"
            if [ -d "$DOCKER_DIR/k8s" ]; then
                cd "$DOCKER_DIR" && $MINIKUBE_BIN kubectl -- delete -f k8s/
                echo -e "${GREEN}✓ Servidor removido do Minikube.${NC}"
            fi
            ;;
        5)
            echo -e "${CYAN}--- Status do Kubernetes ---${NC}"
            $MINIKUBE_BIN kubectl -- get pods
            echo ""
            $MINIKUBE_BIN kubectl -- get services
            echo -e "\n${GREEN}IP de Conexão do Minikube (para o Client conectar):${NC} ${BOLD}$($MINIKUBE_BIN ip)${NC}"
            echo -e "${YELLOW}Use a porta 30770 no Client para se conectar a este IP.${NC}"
            ;;
        6)
            echo -e "${CYAN}Buscando logs do pod no Minikube (Pressione CTRL+C para sair):${NC}"
            POD_NAME=$($MINIKUBE_BIN kubectl -- get pods -l app=fishnet-server -o jsonpath="{.items[0].metadata.name}")
            if [ -n "$POD_NAME" ]; then
                $MINIKUBE_BIN kubectl -- logs -f "$POD_NAME"
            else
                echo -e "${RED}Nenhum pod fishnet-server encontrado.${NC}"
            fi
            ;;
        7)
            echo -e "${YELLOW}Abrindo o Minikube Dashboard...${NC}"
            $MINIKUBE_BIN dashboard
            ;;
        0) return ;;
        *) echo -e "${RED}Opção inválida.${NC}" ;;
    esac
    pausar
}

# ==============================================================================
# MENU PRINCIPAL INTERATIVO
# ==============================================================================
main_menu() {
    while true; do
        banner
        echo -e "${CYAN}${BOLD}MENU PRINCIPAL:${NC}"
        echo -e "  ${BOLD}[1]${NC} 🚀 Primeira Instalação (Fluxo Completo Original e Docker)"
        echo -e "  ${BOLD}[2]${NC} 🔄 Atualizar Ambiente & Recompilar Contrato"
        echo -e "  ${BOLD}[3]${NC} 📦 Deploy / Atualizar Smart Contract (Localnet / Devnet / Mainnet)"
        echo -e "  ${BOLD}[4]${NC} 👛 Gerenciar Carteiras (Criar, Recuperar, Consultar Saldos, Airdrop)"
        echo -e "  ${BOLD}[5]${NC} 🔑 Configurar Program ID & Clusters (Anchor.toml & lib.rs)"
        echo -e "  ${BOLD}[6]${NC} 🧪 Executar Testes Automatizados (Anchor / Cargo)"
        echo -e "  ${BOLD}[7]${NC} 🩺 Diagnóstico do Ambiente (Health Check)"
        echo -e "  ${BOLD}[8]${NC} ⚙️  Gerenciar Validador Local (solana-test-validator)"
        echo -e "  ${BOLD}[9]${NC} 🐳 Gerenciar Servidor FishNet (Docker)"
        echo -e "  ${BOLD}[0]${NC} ❌ Sair"
        echo "------------------------------------------------------------------"
        read -rp "Selecione uma opção [0-9]: " MAIN_OPT

        case "$MAIN_OPT" in
            1) func_primeira_instalacao ;;
            2) func_atualizar_ambiente ;;
            3) func_deploy_contrato ;;
            4) func_gerenciar_carteiras ;;
            5) func_configurar_program_e_clusters ;;
            6) func_executar_testes ;;
            7) func_diagnostico_healthcheck ;;
            8) func_validador_local ;;
            9) func_servidor_fishnet ;;
            0)
                echo -e "\n${GREEN}Até logo e boas batalhas no FOWLGEN WARS! 🐔⚔️${NC}\n"
                exit 0
                ;;
            *)
                echo -e "\n${RED}Opção inválida. Escolha entre 0 e 9.${NC}"
                sleep 1.5
                ;;
        esac
    done
}

# Inicialização
main_menu
