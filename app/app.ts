/**
 * FOWLGEN WARS - HUB WEB OFICIAL (VERCEL)
 * Conexão com Solana (Devnet), Suporte a Phantom/Solflare, Gestão do Perfil
 * e Redirecionamento/Visualização da Arena na Itch.io.
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
        phantom?: {
            solana?: {
                publicKey: { toString(): string };
                connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
                signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
                on(event: string, callback: () => void): void;
            };
        };
        solflare?: {
            isSolflare?: boolean;
            publicKey: { toString(): string };
            connect(options?: { onlyIfTrusted?: boolean }): Promise<void>;
            signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
            on(event: string, callback: () => void): void;
        };
        handleWalletClick: () => Promise<void>;
        connectWallet: (silent?: boolean) => Promise<void>;
        disconnectWallet: () => void;
        launchGameOnItch: () => void;
        toggleEmbeddedArena: () => void;
        requestDevnetAirdrop: () => Promise<void>;
        signAuthChallenge: () => Promise<void>;
        copyWalletAddress: () => void;
        editNickname: () => void;
    }
}

const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";
const ITCH_GAME_URL = "https://fowlgenwars.itch.io/fowlgenwars";

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
    balanceSol: "0.000",
    nickname: localStorage.getItem('fowlgen_nickname') || 'Galinha Guerreira',
    jwtToken: localStorage.getItem('fowlgen_jwt') || null
};

export function getSolanaProvider() {
    if (typeof window !== 'undefined') {
        if (window.solana) return window.solana;
        if (window.phantom && window.phantom.solana) return window.phantom.solana;
        if (window.solflare) return window.solflare;
    }
    return null;
}

export async function handleWalletClick(): Promise<void> {
    if (appState.connected) {
        const dashboard = document.getElementById('playerDashboard');
        if (dashboard) {
            dashboard.style.display = 'block';
            dashboard.classList.remove('hidden');
            dashboard.scrollIntoView({ behavior: 'smooth' });
        }
        showNotification(`🦊 Carteira Ativa: ${shortenAddress(appState.publicKey!)}`, "info");
        return;
    }
    await connectWallet();
}

export async function connectWallet(silent = false): Promise<void> {
    let provider = getSolanaProvider();

    if (!provider) {
        await new Promise(resolve => setTimeout(resolve, 250));
        provider = getSolanaProvider();
    }

    if (!provider) {
        if (!silent) {
            const manualAddr = prompt(
                "Nenhuma extensão de carteira Solana detectada automaticamente.\n\nCole o seu endereço da Phantom (Devnet) para conectar:",
                ""
            );
            if (manualAddr && manualAddr.trim().length >= 32) {
                applyConnectedWallet(manualAddr.trim());
                return;
            }
            const wantInstall = confirm("Deseja abrir o site oficial da Phantom para instalar a extensão?");
            if (wantInstall) {
                window.open("https://phantom.app/", "_blank");
            }
        }
        return;
    }

    try {
        showNotification("⏳ Aguardando aprovação na Phantom...", "info");
        const resp = await provider.connect();
        const pubKey = resp && resp.publicKey ? resp.publicKey.toString() : (provider as any).publicKey.toString();
        applyConnectedWallet(pubKey);

        if ((provider as any).on) {
            (provider as any).on("disconnect", () => {
                disconnectWallet();
            });
        }
    } catch (err) {
        if (!silent) {
            showNotification("Conexão com a carteira cancelada.", "error");
        }
    }
}

function applyConnectedWallet(pubKey: string): void {
    appState.connected = true;
    appState.publicKey = pubKey;
    localStorage.setItem('fowlgen_wallet', pubKey);

    updateWalletUI();
    fetchDevnetBalance(pubKey);
    showNotification(`🐔 Carteira conectada: ${shortenAddress(pubKey)}`, "success");

    const dashboard = document.getElementById('playerDashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
        dashboard.classList.remove('hidden');
        dashboard.scrollIntoView({ behavior: 'smooth' });
    }
}

export function disconnectWallet(): void {
    appState.connected = false;
    appState.publicKey = null;
    appState.balanceSol = "0.000";
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
            const sol = (data.result.value / 1000000000).toFixed(3);
            appState.balanceSol = sol;
            if (balanceElem) balanceElem.innerText = `${sol} SOL (Devnet)`;
        }
    } catch (err) {
        if (balanceElem) balanceElem.innerText = "0.000 SOL";
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
            showNotification("Limite do faucet atingido. Tente mais tarde.", "error");
        }
    } catch (err) {
        showNotification("Erro ao solicitar airdrop.", "error");
    } finally {
        if (airdropBtn) airdropBtn.disabled = false;
    }
}

export function launchGameOnItch(): void {
    const sessionParam = appState.publicKey ? `?wallet=${encodeURIComponent(appState.publicKey)}&nick=${encodeURIComponent(appState.nickname)}` : '';
    window.open(`${ITCH_GAME_URL}${sessionParam}`, "_blank");
}

export function toggleEmbeddedArena(): void {
    const arenaContainer = document.getElementById('embeddedArenaContainer');
    const arenaIframe = document.getElementById('arenaIframe') as HTMLIFrameElement | null;
    
    if (!arenaContainer) return;

    const isHidden = (arenaContainer.style.display === 'none' || arenaContainer.classList.contains('hidden'));

    if (isHidden) {
        arenaContainer.style.display = 'block';
        arenaContainer.classList.remove('hidden');

        if (arenaIframe && (!arenaIframe.src || arenaIframe.src === "about:blank" || arenaIframe.src === window.location.href)) {
            const sessionParam = appState.publicKey ? `?wallet=${encodeURIComponent(appState.publicKey)}&nick=${encodeURIComponent(appState.nickname)}` : '';
            arenaIframe.src = `${ITCH_GAME_URL}${sessionParam}`;
        }

        arenaContainer.scrollIntoView({ behavior: 'smooth' });
        showNotification("📺 Arena carregada abaixo! Ou use o botão de tela cheia.", "info");
    } else {
        arenaContainer.style.display = 'none';
        arenaContainer.classList.add('hidden');
    }
}

export function shortenAddress(addr: string): string {
    if (!addr) return "";
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
}

export function updateWalletUI(): void {
    const navText = document.getElementById('navWalletText');
    const connectNavBtn = document.getElementById('connectWalletNavBtn');
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

        if (dashboard) {
            dashboard.style.display = 'block';
            dashboard.classList.remove('hidden');
        }
        if (walletAddressDisplay) walletAddressDisplay.innerText = appState.publicKey;
        if (playerNickDisplay) playerNickDisplay.innerText = appState.nickname;
        if (explorerLink) {
            explorerLink.href = `https://explorer.solana.com/address/${appState.publicKey}?cluster=devnet`;
            explorerLink.style.display = 'inline';
            explorerLink.classList.remove('hidden');
        }
    } else {
        if (navText) navText.innerText = "Conectar Carteira";
        if (connectNavBtn) {
            connectNavBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
            connectNavBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
        }
        if (dashboard) {
            dashboard.style.display = 'none';
            dashboard.classList.add('hidden');
        }
        if (explorerLink) {
            explorerLink.style.display = 'none';
            explorerLink.classList.add('hidden');
        }
    }
}

export function showNotification(msg: string, type: "info" | "success" | "error" = "info"): void {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;

    toast.innerText = msg;
    toast.style.display = 'flex';
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
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3500);
}

// Vincula ao Window
if (typeof window !== 'undefined') {
    window.handleWalletClick = handleWalletClick;
    window.connectWallet = connectWallet;
    window.disconnectWallet = disconnectWallet;
    window.launchGameOnItch = launchGameOnItch;
    window.toggleEmbeddedArena = toggleEmbeddedArena;
    window.requestDevnetAirdrop = requestDevnetAirdrop;
    window.copyWalletAddress = () => {
        if (!appState.publicKey) return;
        navigator.clipboard.writeText(appState.publicKey).then(() => {
            showNotification("📋 Endereço copiado!", "success");
        });
    };
    window.editNickname = () => {
        const newNick = prompt("Digite seu Nickname de Batalha:", appState.nickname);
        if (newNick && newNick.trim().length > 0) {
            appState.nickname = newNick.trim().substring(0, 20);
            localStorage.setItem('fowlgen_nickname', appState.nickname);
            const d = document.getElementById('playerNickDisplay');
            if (d) d.innerText = appState.nickname;
            showNotification(`Nickname atualizado para: ${appState.nickname}`, "success");
        }
    };
}