export {};

interface PhantomProvider {
    isPhantom?: boolean;
    connect(): Promise<{ publicKey: { toString(): string } }>;
}

interface WindowWithSolana extends Window {
    solana?: PhantomProvider;
}

async function connectSolanaWallet(): Promise<void> {
    const connectBtn = document.getElementById('connectWalletBtn') as HTMLButtonElement | null;
    const btnText = document.getElementById('walletBtnText') as HTMLElement | null;
    
    const win = window as unknown as WindowWithSolana;

    try {
        if (win.solana && win.solana.isPhantom) {
            const provider = win.solana;
            const response = await provider.connect();
            const publicKeyString = response.publicKey.toString();
            
            // Encurta o endereço da carteira
            const shortAddress = `${publicKeyString.substring(0, 4)}...${publicKeyString.substring(publicKeyString.length - 4)}`;
            
            if (btnText) {
                btnText.innerText = shortAddress;
            }
            
            if (connectBtn) {
                connectBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                connectBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
            }

            console.log("Conectado à carteira:", publicKeyString);
            return;
        }

        // Se não tiver a Phantom instalada, abre o site oficial
        window.open("https://phantom.app/", "_blank");
        
    } catch (err) {
        console.error("Erro ao conectar à carteira:", err);
        alert("A conexão com a carteira foi cancelada.");
    }
}

// Expõe a função globalmente para o HTML
(window as unknown as any).connectSolanaWallet = connectSolanaWallet;