document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connectWalletBtn');
    
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            console.log("Botão de carteira clicado!");
            
            // Verifica se o objeto solana existe no navegador
            const provider = window.solana;

            if (provider && provider.isPhantom) {
                try {
                    const response = await provider.connect();
                    console.log("Conectado com sucesso:", response.publicKey.toString());
                    
                    const pubKey = response.publicKey.toString();
                    const shortAddress = `${pubKey.substring(0, 4)}...${pubKey.substring(pubKey.length - 4)}`;
                    
                    document.getElementById('walletBtnText').innerText = shortAddress;
                    connectBtn.classList.remove('bg-purple-500', 'hover:bg-purple-700');
                    connectBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
                } catch (err) {
                    console.error("Erro ao aprovar conexão na Phantom:", err);
                }
            } else {
                console.warn("Phantom não detetada. A abrir o site oficial...");
                window.open("https://phantom.app/", "_blank");
            }
        });
    }
});