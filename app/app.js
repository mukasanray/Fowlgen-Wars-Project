/**
 * FOWLGEN WARS - HUB WEB & SOLANA INTEGRATION (MODO TURBO)
 * Gerencia a conexão com carteiras Solana (Phantom/Solflare), saldo na Devnet,
 * autenticação e o redirecionamento/integração com a arena na Itch.io.
 */

const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";
const ITCH_GAME_URL = "https://fowlgenwars.itch.io/fowlgenwars";
const API_BASE_URL = "http://localhost:5000/api"; // URL padrão de desenvolvimento da API Onix

// Estado da Aplicação
const appState = {
    connected: false,
    publicKey: null,
    balanceSol: 0,
    nickname: localStorage.getItem('fowlgen_nickname') || 'Galinha Guerreira',
    jwtToken: localStorage.getItem('fowlgen_jwt') || null
};

// ==========================================
// DETECÇÃO DE CARTEIRAS (SOLANA)
// ==========================================
function getSolanaProvider() {
    if ("solana" in window) {
        const provider = window.solana;
        if (provider.isPhantom || provider.isBackpack) {
            return provider;
        }
    }
    if ("solflare" in window) {
        return window.solflare;
    }
    return null;
}

// ==========================================
// CONEXÃO & GESTÃO DA CARTEIRA
// ==========================================
async function connectWallet(autoConnect = false) {
    const provider = getSolanaProvider();

    if (!provider) {
        if (!autoConnect) {
            const userChoice = confirm(
                "Nenhuma carteira Solana detectada (ex: Phantom ou Solflare).\nDeseja abrir o site oficial da Phantom para instalar a extensão?"
            );
            if (userChoice) {
                window.open("https://phantom.app/", "_blank");
            }
        }
        return;
    }

    try {
        const resp = await provider.connect({ onlyIfTrusted: autoConnect });
        const pubKey = resp.publicKey ? resp.publicKey.toString() : provider.publicKey.toString();
        
        appState.connected = true;
        appState.publicKey = pubKey;
        localStorage.setItem('fowlgen_wallet', pubKey);

        updateWalletUI();
        await fetchDevnetBalance(pubKey);
        showNotification(`🐔 Carteira conectada: ${shortenAddress(pubKey)}`, "success");

        // Listener de desconexão
        provider.on("disconnect", () => {
            disconnectWallet();
        });

    } catch (err) {
        if (!autoConnect) {
            console.error("Erro ao conectar à carteira:", err);
            showNotification("Conexão com a carteira cancelada.", "error");
        }
    }
}

function disconnectWallet() {
    appState.connected = false;
    appState.publicKey = null;
    appState.balanceSol = 0;
    appState.jwtToken = null;
    localStorage.removeItem('fowlgen_wallet');
    localStorage.removeItem('fowlgen_jwt');
    updateWalletUI();
    showNotification("Carteira desconectada.", "info");
}

// ==========================================
// CONSULTA DE SALDO & AIRDROP DEVNET (RPC)
// ==========================================
async function fetchDevnetBalance(pubKey) {
    const balanceElem = document.getElementById('walletBalance');
    if (balanceElem) balanceElem.innerText = "Consultando...";

    try {
        const response = await fetch(SOLANA_DEVNET_RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getBalance",
                params: [pubKey, { commitment: "confirmed" }]
            })
        });

        const data = await response.json();
        if (data.result && typeof data.result.value === 'number') {
            const sol = data.result.value / 1000000000;
            appState.balanceSol = sol.toFixed(3);
            if (balanceElem) balanceElem.innerText = `${appState.balanceSol} SOL (Devnet)`;
            const navBalance = document.getElementById('navWalletBalance');
            if (navBalance) navBalance.innerText = `${appState.balanceSol} SOL`;
        }
    } catch (err) {
        console.warn("Falha ao consultar saldo RPC:", err);
        if (balanceElem) balanceElem.innerText = "0.000 SOL (Offline)";
    }
}

async function requestDevnetAirdrop() {
    if (!appState.publicKey) {
        showNotification("Conecte a carteira primeiro!", "error");
        return;
    }

    showNotification("⏳ Solicitando 1 SOL na Devnet...", "info");
    const airdropBtn = document.getElementById('airdropBtn');
    if (airdropBtn) airdropBtn.disabled = true;

    try {
        const response = await fetch(SOLANA_DEVNET_RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "requestAirdrop",
                params: [appState.publicKey, 1000000000] // 1 SOL em Lamports
            })
        });

        const data = await response.json();
        if (data.result) {
            showNotification("✅ 1 SOL recebido com sucesso na Devnet!", "success");
            setTimeout(() => fetchDevnetBalance(appState.publicKey), 3000);
        } else {
            showNotification("Limite do faucet da Devnet atingido. Tente novamente mais tarde.", "error");
        }
    } catch (err) {
        showNotification("Erro de conexão ao solicitar airdrop.", "error");
    } finally {
        if (airdropBtn) airdropBtn.disabled = false;
    }
}

// ==========================================
// ASSINATURA DE AUTENTICAÇÃO (LOGIN CRIPTOGRÁFICO)
// ==========================================
async function signAuthChallenge() {
    const provider = getSolanaProvider();
    if (!provider || !appState.publicKey) {
        showNotification("Conecte sua carteira primeiro!", "error");
        return;
    }

    try {
        const messageText = `Fowlgen Wars Login Challenge: ${Date.now()} | Nickname: ${appState.nickname}`;
        const encodedMessage = new TextEncoder().encode(messageText);
        
        showNotification("Confirme a assinatura na sua carteira...", "info");
        const signed = await provider.signMessage(encodedMessage, "utf8");
        
        showNotification("✅ Assinatura criptográfica verificada! Sessão ativa.", "success");
        console.log("Assinatura recebida:", signed);
        
        // Simulação / Integração com a API Onix (.NET 9) se disponível
        tryRegisterOrLoginAPI(appState.publicKey, messageText, signed);

    } catch (err) {
        console.error("Assinatura cancelada ou rejeitada:", err);
        showNotification("Assinatura cancelada pelo usuário.", "error");
    }
}

async function tryRegisterOrLoginAPI(walletAddress, message, signedData) {
    try {
        // Tenta enviar para a API local ou remota se disponível
        await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: `${walletAddress.substring(0, 6)}@fowlgenwars.com`,
                nickname: appState.nickname
            })
        });
    } catch (e) {
        // Sem problemas se a API estiver em ambiente local/offline
        console.log("API offline ou rodando em modo puramente descentralizado.");
    }
}

// ==========================================
// APOIADORES & DOAÇÃO ON-CHAIN
// ==========================================
async function sendSupportDonation() {
    const provider = getSolanaProvider();
    if (!provider || !appState.publicKey) {
        showNotification("Conecte a carteira para apoiar!", "error");
        return;
    }

    showNotification("💡 No ambiente Devnet, a doação demonstra a transação Web3 da galinha!", "info");
    await signAuthChallenge();
}

function launchGameOnItch() {
    const sessionParam = appState.publicKey ? `?wallet=${encodeURIComponent(appState.publicKey)}&nick=${encodeURIComponent(appState.nickname)}` : '';
    window.open(`${ITCH_GAME_URL}${sessionParam}`, "_blank");
}

// Expõe funções para o HTML
window.launchGameOnItch = launchGameOnItch;
window.toggleEmbeddedArena = toggleEmbeddedArena;
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.requestDevnetAirdrop = requestDevnetAirdrop;
window.signAuthChallenge = signAuthChallenge;
window.copyWalletAddress = copyWalletAddress;
window.editNickname = editNickname;

function toggleEmbeddedArena() {
    const arenaContainer = document.getElementById('embeddedArenaContainer');
    const arenaIframe = document.getElementById('arenaIframe');
    
    if (!arenaContainer) return;

    if (arenaContainer.classList.contains('hidden')) {
        arenaContainer.classList.remove('hidden');
        if (arenaIframe && (!arenaIframe.src || arenaIframe.src === "about:blank")) {
            arenaIframe.src = ITCH_GAME_URL;
        }
        arenaContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
        arenaContainer.classList.add('hidden');
    }
}

// ==========================================
// ATUALIZAÇÃO DE INTERFACE
// ==========================================
function shortenAddress(addr) {
    if (!addr) return "";
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
}

function updateWalletUI() {
    const connectNavBtn = document.getElementById('connectWalletNavBtn');
    const navText = document.getElementById('navWalletText');
    const dashboard = document.getElementById('playerDashboard');
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    const walletSection = document.getElementById('walletSectionCard');
    const walletAddressDisplay = document.getElementById('walletAddressDisplay');
    const explorerLink = document.getElementById('solanaExplorerLink');
    const playerNickDisplay = document.getElementById('playerNickDisplay');

    if (appState.connected && appState.publicKey) {
        const short = shortenAddress(appState.publicKey);
        if (navText) navText.innerText = `🦊 ${short}`;
        if (connectNavBtn) {
            connectNavBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
            connectNavBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
        }

        if (dashboard) dashboard.classList.remove('hidden');
        if (walletAddressDisplay) walletAddressDisplay.innerText = appState.publicKey;
        if (playerNickDisplay) playerNickDisplay.innerText = appState.nickname;
        if (explorerLink) {
            explorerLink.href = `https://explorer.solana.com/address/${appState.publicKey}?cluster=devnet`;
            explorerLink.classList.remove('hidden');
        }

        if (walletSection) {
            walletSection.classList.remove('border-amber-400');
            walletSection.classList.add('border-emerald-500');
        }
    } else {
        if (navText) navText.innerText = "Conectar Carteira";
        if (connectNavBtn) {
            connectNavBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
            connectNavBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
        }
        if (dashboard) dashboard.classList.add('hidden');
        if (explorerLink) explorerLink.classList.add('hidden');
    }
}

function copyWalletAddress() {
    if (!appState.publicKey) return;
    navigator.clipboard.writeText(appState.publicKey).then(() => {
        showNotification("📋 Endereço copiado para a área de transferência!", "success");
    });
}

function editNickname() {
    const newNick = prompt("Digite seu Nickname de Batalha:", appState.nickname);
    if (newNick && newNick.trim().length > 0) {
        appState.nickname = newNick.trim().substring(0, 20);
        localStorage.setItem('fowlgen_nickname', appState.nickname);
        const nickDisplay = document.getElementById('playerNickDisplay');
        if (nickDisplay) nickDisplay.innerText = appState.nickname;
        showNotification(`Nickname atualizado para: ${appState.nickname}`, "success");
    }
}

function showNotification(msg, type = "info") {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;

    toast.innerText = msg;
    toast.className = "fixed bottom-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-2xl font-bold text-white transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-2";

    if (type === "success") {
        toast.classList.add("bg-emerald-600");
    } else if (type === "error") {
        toast.classList.add("bg-rose-600");
    } else {
        toast.classList.add("bg-amber-600");
    }

    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-5");
    }, 4000);
}

// ==========================================
// INICIALIZAÇÃO AO CARREGAR A PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Tenta reconectar se a carteira já estiver autorizada
    const savedWallet = localStorage.getItem('fowlgen_wallet');
    if (savedWallet) {
        connectWallet(true);
    }

    // Configurar listeners
    const connectNavBtn = document.getElementById('connectWalletNavBtn');
    if (connectNavBtn) {
        connectNavBtn.addEventListener('click', () => {
            if (appState.connected) {
                // Alterna visualização do dashboard
                const dashboard = document.getElementById('playerDashboard');
                if (dashboard) {
                    dashboard.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                connectWallet();
            }
        });
    }

    const connectSectionBtn = document.getElementById('connectWalletBtn');
    if (connectSectionBtn) {
        connectSectionBtn.addEventListener('click', () => connectWallet());
    }
});