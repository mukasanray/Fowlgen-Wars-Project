import { useState } from 'react';
import { authService } from '../services/authService';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nickname_jogo: '',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.registerUser({
                email: formData.email,
                password: formData.password,
                nickname_jogo: formData.nickname_jogo || 'Jogador',
            });
            console.log("Sucesso no fluxo de autenticação!");
            onClose();
        } catch (error) {
            console.error("Erro na autenticação:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-xl p-4 transition-all duration-500">
            {/* Container Principal com efeito "Glow" e borda em gradiente */}
            <div className="relative w-full max-w-md">
                {/* Efeito de luz atrás do modal */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>

                <div className="relative bg-zinc-950 border border-zinc-800/50 rounded-2xl shadow-2xl p-8 overflow-hidden">

                    {/* Detalhe superior */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-rose-500"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all border border-zinc-800"
                    >
                        &times;
                    </button>

                    <div className="mb-8 text-center mt-4">
                        <div className="inline-flex items-center justify-center space-x-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full mb-6 shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="text-zinc-300 text-[10px] font-bold tracking-[0.2em] uppercase">
                                Fowlgen Network
                            </span>
                        </div>

                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-500 mb-2 tracking-tight">
                            {isLogin ? 'INICIAR SESSÃO' : 'CRIAR IDENTIDADE'}
                        </h2>
                        <p className="text-zinc-500 text-sm font-medium">
                            {isLogin ? 'Autentique-se para voltar à arena.' : 'Forje o seu nome e entre na guerra.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="relative group">
                                <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest group-focus-within:text-amber-500 transition-colors">Nickname</label>
                                <input
                                    type="text"
                                    required={!isLogin}
                                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white focus:border-amber-500 focus:bg-zinc-900 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-zinc-600 font-medium"
                                    placeholder="Seu nome de guerra"
                                    value={formData.nickname_jogo}
                                    onChange={(e) => setFormData({ ...formData, nickname_jogo: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest group-focus-within:text-amber-500 transition-colors">E-mail</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white focus:border-amber-500 focus:bg-zinc-900 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-zinc-600 font-medium"
                                placeholder="co-piloto@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="relative group">
                            <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest group-focus-within:text-amber-500 transition-colors">Palavra-passe</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white focus:border-amber-500 focus:bg-zinc-900 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-zinc-600 font-medium tracking-widest"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="relative w-full overflow-hidden rounded-xl p-[1px] mt-6 group disabled:opacity-50"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <div className="relative bg-zinc-950 px-4 py-4 rounded-xl flex justify-center items-center gap-2 transition-all duration-300 group-hover:bg-opacity-0">
                                <span className="font-bold text-sm text-white uppercase tracking-widest group-hover:text-white">
                                    {isLoading ? 'A INICIAR LIGAÇÃO...' : (isLogin ? 'ENTRAR NA ARENA' : 'FORJAR IDENTIDADE')}
                                </span>
                                {!isLoading && (
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs text-zinc-500 hover:text-white font-medium uppercase tracking-widest transition-colors"
                        >
                            {isLogin ? (
                                <span>Novo por aqui? <span className="text-amber-500">Aliste-se</span></span>
                            ) : (
                                <span>Já é um veterano? <span className="text-amber-500">Entre</span></span>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}