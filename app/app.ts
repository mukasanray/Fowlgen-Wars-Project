/**
 * FOWLGEN WARS - HUB WEB & SOLANA INTEGRATION (MODO TURBO)
 * Gerencia a conexão com carteiras Solana (Phantom/Solflare), saldo na Devnet,
 * autenticação e o redirecionamento/integração com a arena na Itch.io.
 */

export {};

declare global {
    interface Window {
        solana?: {
            isPhantom?: boolean;
            isBackpack?: boolean;
            publicKey: { toString(): string };
            connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
            signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
            on(event: string, callback: () => void): void;
        };
        solflare?: {
            isSolflare?: boolean;
            publicKey: { toString(): string };
            connect(options?: { onlyIfTrusted?: boolean }): Promise<void>;
            signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
            on(event: string, callback: () => void): void;
        };
    }
}

const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";
const ITCH_GAME_URL = "https://fowlgenwars.itch.io/fowlgenwars";
const API_BASE_URL = "http://localhost:5000/api";

export interface AppState {
    connected: boolean;
    publicKey: string | null;
    balanceSol: string | number;
    nickname: string;
    jwtToken: string | null;
}

const appState: AppState = {
    connected: false,
    publicKey: null,
    balanceSol: 0,
    nickname: localStorage.getItem('fowlgen_nickname') || 'Galinha Guerreira',
    jwtToken: localStorage.getItem('fowlgen_jwt') || null
};

export function getSolanaProvider() {
    if (typeof window !== 'undefined' && window.solana) {
        if (window.solana.isPhantom || window.solana.isBackpack) {
            return window.solana;
        }
    }
    if (typeof window !== 'undefined' && window.solflare) {
        return window.solflare;
    }
    return null;
}

export async function connectWallet(autoConnect = false): Promise<void> {
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
        const pubKey = resp && resp.publicKey ? resp.publicKey.toString() : provider.publicKey.toString();
        
        appState.connected = true;
        appState.publicKey = pubKey;
        localStorage.setItem('fowlgen_wallet', pubKey);

        updateWalletUI();
        await fetchDevnetBalance(pubKey);
        showNotification(`🐔 Carteira conectada: ${shortenAddress(pubKey)}`, "success");

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

export function disconnectWallet(): void {
    appState.connected = false;
    appState.publicKey = null;
    appState.balanceSol = 0;
    appState.jwtToken = null;
    localStorage.removeItem('fowlgen_wallet');
    localStorage.removeItem('fowlgen_jwt');
    updateWalletUI();
    showNotification("Carteira desconectada.", "info");
}

export async function fetchDevnetBalance(pubKey: string): Promise<void> {
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
        }
    } catch (err) {
        console.warn("Falha ao consultar saldo RPC:", err);
        if (balanceElem) balanceElem.innerText = "0.000 SOL (Offline)";
    }
}

export async function requestDevnetAirdrop(): Promise<void> {
    if (!appState.publicKey) {
        showNotification("Conecte a carteira primeiro!", "error");
        return;
    }

    showNotification("⏳ Solicitando 1 SOL na Devnet...", "info");
    const airdropBtn = document.getElementById('airdropBtn') as HTMLButtonElement | null;
    if (airdropBtn) airdropBtn.disabled = true;

    try {
        const response = await fetch(SOLANA_DEVNET_RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "requestAirdrop",
                params: [appState.publicKey, 1000000000]
            })
        });

        const data = await response.json();
        if (data.result) {
            showNotification("✅ 1 SOL recebido com sucesso na Devnet!", "success");
            setTimeout(() => fetchDevnetBalance(appState.publicKey!), 3000);
        } else {
            showNotification("Limite do faucet da Devnet atingido. Tente novamente mais tarde.", "error");
        }
    } catch (err) {
        showNotification("Erro de conexão ao solicitar airdrop.", "error");
    } finally {
        if (airdropBtn) airdropBtn.disabled = false;
    }
}

export function shortenAddress(addr: string): string {
    if (!addr) return "";
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
}

export function updateWalletUI(): void {
    const connectNavBtn = document.getElementById('connectWalletNavBtn');
    const navText = document.getElementById('navWalletText');
    const dashboard = document.getElementById('playerDashboard');
    const walletAddressDisplay = document.getElementById('walletAddressDisplay');
    const explorerLink = document.getElementById('solanaExplorerLink') as HTMLAnchorElement | null;
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

export function showNotification(msg: string, type: "info" | "success" | "error" = "info"): void {
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