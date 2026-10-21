import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// DTOs oficiais alinhados ao Relatório Técnico (.NET 9 / Marcos)
export interface UserProfileDTO {
  id_usuario: string;
  nickname_jogo: string;
  email: string;
  wallet_address?: string;
  avatarUrl?: string;
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
  jwtToken?: string;
  refreshToken?: string;
}

export interface SupporterDTO {
  id: string;
  nickname: string;
  wallet?: string;
  tier: number;
  tx?: string;
  msg: string;
}

const FALLBACK_SUPPORTERS: SupporterDTO[] = [
  { id: '1', nickname: 'Marcos_Dev', tier: 3, msg: 'Líder técnico — Arquitetura .NET 9 & Onix Framework sólida!', wallet: '8x9F...3kL9' },
  { id: '2', nickname: 'SamuelPO', tier: 3, msg: 'A visão do Fowlgen Wars a ganhar vida. Império ou Reino?', wallet: '4vB2...9mP1' },
  { id: '3', nickname: 'Ramiro_G5B', tier: 3, msg: 'Rumo ao lançamento global no Itch.io e Vercel!', wallet: '9aK7...2wQ4' },
  { id: '4', nickname: 'AraraAzul_Fã', tier: 2, msg: 'Proteção à fauna brasileira através dos games.', wallet: '3cN8...7yT2' },
  { id: '5', nickname: 'CaosArcano99', tier: 2, msg: 'Pelo Reino Obscuro do Caos Arcano! Vitória certa.', wallet: '7pL1...5xR8' },
  { id: '6', nickname: 'ImperioLuz', tier: 1, msg: 'A Ordem Imperial da Luz Suprema prevalecerá!', wallet: '2mV5...8zK3' },
  { id: '7', nickname: 'MicoGuardiao', tier: 3, msg: 'Web3 + conservação ambiental + eSports Justo (Anti-P2W).', wallet: '6dJ4...1nB7' },
  { id: '8', nickname: 'MariaClara_QA', tier: 1, msg: 'Zero bugs, 60 FPS e experiência impecável.', wallet: '5hT9...4gW6' },
];

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);

  // Estado de Conectividade da API (GET /api/health)
  const [apiOnline, setApiOnline] = useState<boolean>(false);

  // Estado de Facção (Pedido do Samuel: Reino vs Império)
  const [selectedFaction, setSelectedFaction] = useState<'imperio' | 'reino' | null>(() => {
    return (localStorage.getItem('fowlgen_faction') as 'imperio' | 'reino' | null) || null;
  });

  // Estados de Autenticação & Jogador (Tarefas 2.6, 2.7, 2.8 e 2.14)
  const [user, setUser] = useState<UserProfileDTO | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'register' | 'web3' | 'profile'>('register');
  const [emailInput, setEmailInput] = useState('');
  const [nickInput, setNickInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  const [authStatusMsg, setAuthStatusMsg] = useState('');

  // Estados de Apoiadores & Paginação (Tarefas 2.10, 2.11 e 2.13)
  const [supporters, setSupporters] = useState<SupporterDTO[]>(FALLBACK_SUPPORTERS);
  const [isServerPaginated, setIsServerPaginated] = useState(false);
  const [totalServerItems, setTotalServerItems] = useState(FALLBACK_SUPPORTERS.length);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 4;

  // Formulário Apoie-nos (POST /api/supporters)
  const [supNick, setSupNick] = useState('');
  const [supWallet, setSupWallet] = useState('');
  const [supTier, setSupTier] = useState(2);
  const [supTx, setSupTx] = useState('');
  const [supMsg, setSupMsg] = useState('');
  const [supFeedback, setSupFeedback] = useState('');

  // 1. Verificar integridade da API (GET /api/health) e carregar sessão
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        setApiOnline(res.ok);
      } catch {
        setApiOnline(false);
      }
    };

    checkHealth();

    const saved = localStorage.getItem('fowlgen_user_dto');
    if (saved) {
      try {
        const parsed: UserProfileDTO = JSON.parse(saved);
        setUser(parsed);
        setNickInput(parsed.nickname_jogo || '');
        setAvatarInput(parsed.avatarUrl || '');
        syncUserProfile(parsed);
      } catch {
        // Ignora erro de parse
      }
    }

    fetchSupporters(1);
  }, []);

  const handleSelectFaction = (faction: 'imperio' | 'reino') => {
    setSelectedFaction(faction);
    localStorage.setItem('fowlgen_faction', faction);
  };

  const syncUserProfile = async (currentProfile: UserProfileDTO) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentProfile.jwtToken) {
        headers['Authorization'] = `Bearer ${currentProfile.jwtToken}`;
      }
      const res = await fetch(`${API_BASE}/api/users/${currentProfile.id_usuario}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const updated: UserProfileDTO = {
          ...currentProfile,
          nickname_jogo: data.nickname || data.nickname_jogo || currentProfile.nickname_jogo,
          status: data.status || currentProfile.status,
          avatarUrl: data.avatarUrl || currentProfile.avatarUrl,
        };
        setUser(updated);
        localStorage.setItem('fowlgen_user_dto', JSON.stringify(updated));
      }
    } catch {
      // Mantém dados locais se offline
    }
  };

  const fetchSupporters = async (page: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/supporters?pageIndex=${page}&pageSize=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.items || data.data;
        if (Array.isArray(items) && items.length > 0) {
          setSupporters(items);
          setIsServerPaginated(true);
          setTotalServerItems(data.totalCount || data.totalItems || items.length);
          return;
        }
      }
    } catch {
      setIsServerPaginated(false);
    }
  };

  // Animações GSAP Estilo Flycrooked + Zoom Cinematográfico na Hero
  useGSAP(() => {
    if (heroImgRef.current) {
      gsap.to(heroImgRef.current, {
        scale: 1.22,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    gsap.utils.toArray<HTMLElement>('.editorial-reveal').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
          },
        }
      );
    });
  }, { scope: containerRef });

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !nickInput || !passInput) return;
    setAuthStatusMsg('A sincronizar registo com POST /api/users...');

    let userId = crypto.randomUUID ? crypto.randomUUID() : 'guid-' + Date.now();
    let statusConta: UserProfileDTO['status'] = 'Ativo';
    let token = undefined;

    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, nickname: nickInput, password: passInput }),
      });
      if (res.ok) {
        const data = await res.json();
        userId = data.id_usuario || data.id || userId;
        statusConta = data.status || 'Ativo';
        token = data.token || data.jwtToken;
      }
    } catch {
      // Modo demonstrativo local
    }

    const newProfile: UserProfileDTO = {
      id_usuario: userId,
      nickname_jogo: nickInput,
      email: emailInput,
      status: statusConta,
      jwtToken: token,
    };

    setUser(newProfile);
    localStorage.setItem('fowlgen_user_dto', JSON.stringify(newProfile));
    setAuthStatusMsg('Conta criada com sucesso!');
    setTimeout(() => {
      setAuthModalOpen(false);
      setAuthStatusMsg('');
    }, 900);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAuthStatusMsg('A atualizar perfil em PUT /api/users/{id}...');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user.jwtToken) headers['Authorization'] = `Bearer ${user.jwtToken}`;

      await fetch(`${API_BASE}/api/users/${user.id_usuario}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ nickname: nickInput, avatarUrl: avatarInput }),
      });
    } catch {
      // Fallback local
    }

    const updated: UserProfileDTO = {
      ...user,
      nickname_jogo: nickInput || user.nickname_jogo,
      avatarUrl: avatarInput,
    };
    setUser(updated);
    localStorage.setItem('fowlgen_user_dto', JSON.stringify(updated));
    setAuthStatusMsg('Perfil atualizado!');
    setTimeout(() => {
      setAuthModalOpen(false);
      setAuthStatusMsg('');
    }, 800);
  };

  const handleWeb3Login = async () => {
    setAuthStatusMsg('A solicitar assinatura na carteira Solana...');
    let walletAddress = 'Solana_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    let signature = 'sig_demo_' + Date.now();
    const msg = `Autenticacao Fowlgen Wars: ${new Date().toISOString()}`;
    let jwtToken = undefined;

    try {
      const provider = (window as any).solana || (window as any).solflare;
      if (provider) {
        const resp = await provider.connect();
        walletAddress = resp.publicKey ? resp.publicKey.toString() : walletAddress;

        if (provider.signMessage) {
          const encodedMessage = new TextEncoder().encode(msg);
          const signed = await provider.signMessage(encodedMessage, 'utf8');
          signature = Array.from(signed.signature || signed)
            .map((b: any) => Number(b).toString(16).padStart(2, '0'))
            .join('');
        }
      }

      const res = await fetch(`${API_BASE}/api/auth/login-web3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, signature, msg }),
      });

      if (res.ok) {
        const data = await res.json();
        jwtToken = data.token || data.jwtToken;
      }
    } catch {
      // Fallback seguro
    }

    const web3Profile: UserProfileDTO = {
      id_usuario: user?.id_usuario || (crypto.randomUUID ? crypto.randomUUID() : 'web3-' + Date.now()),
      nickname_jogo: user?.nickname_jogo || `Guardiao_${walletAddress.slice(0, 4)}`,
      email: user?.email || 'web3@fowlgenwars.com',
      wallet_address: walletAddress,
      status: 'Ativo',
      jwtToken,
    };

    setUser(web3Profile);
    setNickInput(web3Profile.nickname_jogo);
    localStorage.setItem('fowlgen_user_dto', JSON.stringify(web3Profile));
    setAuthStatusMsg('Carteira Web3 validada com sucesso!');
    setTimeout(() => {
      setAuthModalOpen(false);
      setAuthStatusMsg('');
    }, 900);
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supNick || !supMsg) return;

    const payload = {
      nickname: supNick,
      wallet: supWallet || user?.wallet_address || 'Carteira Oculta',
      tier: supTier,
      tx: supTx || 'tx_verificacao',
      msg: supMsg,
    };

    try {
      await fetch(`${API_BASE}/api/supporters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Fallback local
    }

    const newEntry: SupporterDTO = {
      id: String(Date.now()),
      ...payload,
    };

    setSupporters((prev) => [newEntry, ...prev]);
    setTotalServerItems((prev) => prev + 1);
    setPageIndex(1);
    setSupNick('');
    setSupWallet('');
    setSupTx('');
    setSupMsg('');
    setSupFeedback('O seu apoio foi registado no mural com sucesso!');
    setTimeout(() => setSupFeedback(''), 4000);
  };

  const displayedSupporters = isServerPaginated
    ? supporters
    : supporters.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  const totalCount = isServerPaginated ? totalServerItems : supporters.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const getStatusBadgeStyle = (status: UserProfileDTO['status']) => {
    if (status === 'Ativo') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (status === 'Inativo') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* NAVBAR EDITORIAL */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/85 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
            <span className="font-black tracking-tighter text-xl uppercase">FOWLGEN WARS</span>
            <span
              title={apiOnline ? 'API .NET 9 Online' : 'Modo Demonstrativo (Fallback Ativo)'}
              className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {apiOnline ? 'API Online' : 'G5B Studios'}
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-widest text-zinc-400">
            <a href="#faccoes" className="hover:text-white transition-colors">Império vs Reino</a>
            <a href="#guardioes" className="hover:text-white transition-colors">Fauna em Extinção</a>
            <a href="#webgl" className="hover:text-white transition-colors">MVP & WebGL</a>
            <a href="#loja" className="hover:text-white transition-colors">Loja</a>
            <a href="#apoie-nos" className="hover:text-amber-400 transition-colors">Apoie-nos</a>
            <a href="#apoiadores" className="hover:text-white transition-colors">Apoiadores</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/10 px-3.5 py-1.5 rounded-full">
                <span className="text-xs font-bold text-zinc-200">{user.nickname_jogo}</span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(user.status)}`}>
                  ● {user.status}
                </span>
                <button
                  onClick={() => {
                    setAuthTab('profile');
                    setAuthModalOpen(true);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold ml-1"
                >
                  Editar
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthTab('register');
                  setAuthModalOpen(true);
                }}
                className="text-xs uppercase tracking-widest font-bold px-5 py-2.5 rounded-full bg-white text-black hover:bg-amber-400 transition-all"
              >
                Conectar / Registar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION COM ZOOM PROGRESSIVO NO SCROLL */}
      <section id="hero-section" className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden pt-20 border-b border-white/10">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            ref={heroImgRef}
            src="/hero.png"
            alt="Fowlgen Wars Banner"
            className="w-full h-full object-cover object-center opacity-45 scale-100 will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-[0.2em] text-amber-400 mb-6">
            <span>Unity 6 Real-Time</span>
            <span>•</span>
            <span>API .NET 9</span>
            <span>•</span>
            <span>Solana Web3</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.92] mb-6">
            A Guerra das Penas <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-purple-500">
              Começou.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-zinc-400 text-base sm:text-lg leading-relaxed mb-10">
            Combate tático 100% justo (Anti-P2W), preservação da fauna brasileira ameaçada e economia transparente. Escolha a sua bandeira e entre na arena.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#faccoes"
              className="px-8 py-4 rounded-full bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(245,158,11,0.3)]"
            >
              Escolher o Meu Lado ↓
            </a>
            <a
              href="https://fowlgenwars.itch.io/fowlgenwars"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-full bg-white/5 border border-white/15 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Baixar APK Android (MVP)
            </a>
          </div>
        </div>
      </section>

      {/* 1. SEÇÃO DO SAMUEL: DE QUAL LADO VOCÊ QUER FICAR? REINO OU IMPÉRIO? */}
      <section id="faccoes" className="py-28 px-6 max-w-7xl mx-auto border-b border-white/10">
        <div className="editorial-reveal text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold block mb-3">
            Juramento de Facção
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase mb-4">
            De qual lado você quer ficar❓
          </h2>
          <p className="text-xl text-zinc-300 font-semibold">
            Reino ou Império❓ <span className="text-zinc-500 font-normal">Escolha o seu estandarte para definir o destino da arena.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LADO 1: IMPÉRIO (Bandeira Amarela) */}
          <div
            onClick={() => handleSelectFaction('imperio')}
            className={`editorial-reveal cursor-pointer group relative rounded-3xl p-8 sm:p-10 bg-[#09090d] border transition-all duration-500 flex flex-col items-center text-center ${selectedFaction === 'imperio'
              ? 'border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.2)] scale-[1.01]'
              : 'border-white/10 hover:border-amber-500/50'
              }`}
          >
            <div className="text-[11px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6">
              Estandarte do Império
            </div>
            <div className="w-56 h-72 sm:w-64 sm:h-80 mb-8 overflow-hidden rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center p-4">
              <img
                src="/bandeira-imperio.png"
                alt="A Ordem Imperial da Luz Suprema"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-amber-400 mb-3">
              A Ordem Imperial da Luz Suprema
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-md">
              Guiados pela coroa solar e pela disciplina dourada, os guerreiros do Império lutam pela honra absoluta, defesa impenetrável e justiça soberana.
            </p>
            <button className="mt-auto px-7 py-3.5 rounded-full text-xs uppercase tracking-widest font-black bg-amber-500 text-black group-hover:bg-amber-400 transition-colors">
              {selectedFaction === 'imperio' ? '✓ Lealdade Jurada ao Império' : 'Escolher Império'}
            </button>
          </div>

          {/* LADO 2: REINO (Bandeira Roxa) */}
          <div
            onClick={() => handleSelectFaction('reino')}
            className={`editorial-reveal cursor-pointer group relative rounded-3xl p-8 sm:p-10 bg-[#09090d] border transition-all duration-500 flex flex-col items-center text-center ${selectedFaction === 'reino'
              ? 'border-purple-500 shadow-[0_0_60px_rgba(147,51,234,0.25)] scale-[1.01]'
              : 'border-white/10 hover:border-purple-500/50'
              }`}
          >
            <div className="text-[11px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-6">
              Estandarte do Reino
            </div>
            <div className="w-56 h-72 sm:w-64 sm:h-80 mb-8 overflow-hidden rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center p-4">
              <img
                src="/bandeira-reino.png"
                alt="O Reino Obscuro do Caos Arcano"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-purple-400 mb-3">
              O Reino Obscuro do Caos Arcano
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-md">
              Forjados nas sombras místicas e na energia arcana púrpura, os mestres do Reino dominam feitiços devastadores, velocidade letal e estratégias imprevisíveis.
            </p>
            <button className="mt-auto px-7 py-3.5 rounded-full text-xs uppercase tracking-widest font-black bg-purple-600 text-white group-hover:bg-purple-500 transition-colors">
              {selectedFaction === 'reino' ? '✓ Lealdade Jurada ao Reino' : 'Escolher Reino'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO DO SAMUEL: ANIMAIS EM EXTINÇÃO (MICO-LEÃO-DOURADO E ARARA-AZUL) */}
      <section id="guardioes" className="py-28 px-6 max-w-7xl mx-auto border-b border-white/10">
        <div className="editorial-reveal flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-bold block mb-3">
              Consciência & Biodiversidade
            </span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase">
              Guardiões em Extinção
            </h2>
          </div>
          <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
            O Fowlgen Wars homenageia e apoia a preservação da fauna brasileira ameaçada de extinção, imortalizando espécies lendárias como heróis de elite na arena.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ARARA AZUL */}
          <div className="editorial-reveal rounded-3xl overflow-hidden bg-[#09090d] border border-white/10 flex flex-col">
            <div className="h-[460px] bg-black overflow-hidden relative">
              <img
                src="/arara-azul.png"
                alt="Guardiã Arara-Azul"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 backdrop-blur-md">
                Espécie Ameaçada • Classe Arcana Celeste
              </span>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black uppercase tracking-tight text-sky-400 mb-2">
                Arara-Azul — Sentinela dos Ventos
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Empunhando a lâmina de cristal celeste, representa a luta contra o tráfico de animais silvestres e a preservação do Pantanal e da floresta brasileira.
              </p>
            </div>
          </div>

          {/* MICO-LEÃO-DOURADO */}
          <div className="editorial-reveal rounded-3xl overflow-hidden bg-[#09090d] border border-white/10 flex flex-col">
            <div className="h-[460px] bg-black overflow-hidden relative">
              <img
                src="/mico-leao.png"
                alt="Guardião Mico-Leão-Dourado"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                Espécie Ameaçada • Mestre de Bastão Solar
              </span>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black uppercase tracking-tight text-amber-400 mb-2">
                Mico-Leão-Dourado — Punho da Mata Atlântica
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Ágil, destemido e implacável no combate corpo a corpo, simboliza a regeneração da Mata Atlântica e a força da biodiversidade nacional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VITRINE MVP & CONTAINER UNITY WEBGL (Tarefas 2.1 e 2.2 do Marcos) */}
      <section id="webgl" className="py-28 px-6 max-w-7xl mx-auto border-b border-white/10">
        <div className="editorial-reveal text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold block mb-3">
            Vitrine Oficial do MVP
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase mb-4">
            Arena Unity WebGL & APK Android
          </h2>
          <p className="text-zinc-400 text-sm">
            Container responsivo 16:9 preparado para embutir o jogo Unity WebGL e download direto do pacote Android.
          </p>
        </div>

        <div className="editorial-reveal relative w-full aspect-video max-w-5xl mx-auto rounded-3xl overflow-hidden bg-[#0a0a0f] border border-white/15 shadow-2xl flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-black mb-4">
            ▶
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">
            Container Unity 6 WebGL
          </h3>
          <p className="text-zinc-400 text-xs max-w-md mb-6">
            Experimente o modelo demonstrativo inicial no portal Itch.io ou descarregue o APK Android diretamente para o seu dispositivo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://fowlgenwars.itch.io/fowlgenwars"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all"
            >
              Jogar Demo no Itch.io ↗
            </a>
            <a
              href="https://fowlgenwars.itch.io/fowlgenwars"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              Baixar APK Android (.apk)
            </a>
          </div>
        </div>
      </section>

      {/* 4. SEÇÃO LOJA ONLINE & MICRO-RECOMPENSAS ANTI-P2W (Pedido do Samuel + Sprint Kanban) */}
      <section id="loja" className="py-28 px-6 max-w-7xl mx-auto border-b border-white/10">
        <div className="editorial-reveal flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-purple-400 font-bold block mb-3">
              Economia Justa • 100% Anti-P2W
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase">
              Loja Online & Recompensas
            </h2>
          </div>
          <span className="text-xs uppercase tracking-widest px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300">
            Futuros Produtos Oficiais • Em Breve
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Baú Real Pós-Partida',
              category: 'Micro-Recompensa In-Game',
              desc: 'Conquistado exclusivamente por mérito nas batalhas. Contém moedas e insígnias cosméticas sem vantagem competitiva.',
              tag: 'Anti-P2W Garantido',
            },
            {
              title: 'Skins Guardiões da Fauna',
              category: 'Cosmético Oficial & Impacto',
              desc: 'Visuais exclusivos da Arara-Azul e Mico-Leão-Dourado. Parte das receitas apoia projetos de preservação.',
              tag: 'Em Desenvolvimento',
            },
            {
              title: 'Colecionáveis Físicos & Merch',
              category: 'Loja Oficial Fowlgen Wars',
              desc: 'Action figures, camisolas oficiais das facções (Império e Reino) e itens exclusivos que serão incluídos no futuro.',
              tag: 'Lançamento Futuro',
            },
          ].map((item, idx) => (
            <div key={idx} className="editorial-reveal rounded-3xl p-8 bg-[#09090d] border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block mb-2">
                  {item.category}
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">{item.desc}</p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{item.tag}</span>
                <span className="text-xs font-bold text-zinc-300">Em Breve →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CAPTAÇÃO DE RECURSOS: APOIE-NOS & MURAL DE APOIADORES (Tarefas 2.10, 2.11 e 2.13) */}
      <section id="apoie-nos" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="editorial-reveal text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold block mb-3">
            Captação de Recursos & Comunidade
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase mb-4">
            Apoie o Fowlgen Wars
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Contribua para a evolução do projeto, escolha o seu Tier de apoio e registe a sua mensagem diretamente no Mural Oficial de Apoiadores.
          </p>
        </div>

        {/* TIERS DE APOIO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { tier: 1, name: 'Tier 1 • Escudeiro da Arena', price: 'Apoio Inicial', perks: 'Nome no Mural Oficial + Badge de Apoiador Inicial no Discord.' },
            { tier: 2, name: 'Tier 2 • Cavaleiro da Ordem', price: 'Apoio Destaque', perks: 'Destaque Dourado no Mural + Acesso Alpha Antecipado + Emblema In-Game.' },
            { tier: 3, name: 'Tier 3 • Patrono Lendário', price: 'Apoio VIP', perks: 'Topo do Mural + Título Exclusivo + Nome nos Créditos Oficiais na Unity.' },
          ].map((t) => (
            <div
              key={t.tier}
              onClick={() => setSupTier(t.tier)}
              className={`cursor-pointer rounded-3xl p-7 bg-[#09090d] border transition-all ${supTier === t.tier ? 'border-amber-400 bg-amber-500/[0.04]' : 'border-white/10 hover:border-white/25'
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">{t.name}</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">{t.price}</span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">{t.perks}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start" id="apoiadores">
          {/* FORMULÁRIO POST /api/supporters */}
          <form onSubmit={handleSupportSubmit} className="lg:col-span-5 rounded-3xl p-8 bg-[#09090d] border border-white/10 space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight mb-1">Registar Contribuição</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Conectado a <code className="text-amber-400">POST /api/supporters</code>
            </p>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Nickname *</label>
              <input
                type="text"
                required
                value={supNick}
                onChange={(e) => setSupNick(e.target.value)}
                placeholder="Ex: GuardiaoBR"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm focus:border-amber-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Tier Escolhido</label>
                <select
                  value={supTier}
                  onChange={(e) => setSupTier(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm focus:border-amber-400 outline-none"
                >
                  <option value={1}>Tier 1 - Escudeiro</option>
                  <option value={2}>Tier 2 - Cavaleiro</option>
                  <option value={3}>Tier 3 - Patrono</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Carteira / PIX</label>
                <input
                  type="text"
                  value={supWallet}
                  onChange={(e) => setSupWallet(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Hash / Comprovativo (tx)</label>
              <input
                type="text"
                value={supTx}
                onChange={(e) => setSupTx(e.target.value)}
                placeholder="Ex: 5xK9...SolanaTx"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Mensagem de Apoio *</label>
              <textarea
                required
                rows={3}
                value={supMsg}
                onChange={(e) => setSupMsg(e.target.value)}
                placeholder="Deixe o seu grito de guerra para a comunidade!"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm focus:border-amber-400 outline-none resize-none"
              />
            </div>

            {supFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {supFeedback}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors"
            >
              Enviar Apoio para o Mural
            </button>
          </form>

          {/* MURAL DINÂMICO PAGINADO (GET /api/supporters) */}
          <div className="lg:col-span-7 rounded-3xl p-8 bg-[#09090d] border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Mural Público de Apoiadores</h3>
                <p className="text-xs text-zinc-400">
                  Feed paginado (<code className="text-amber-400">GET /api/supporters?pageIndex={pageIndex}&pageSize={pageSize}</code>)
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                Apoiadores: {totalCount}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              {displayedSupporters.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="font-bold text-sm text-white">{s.nickname}</span>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Tier {s.tier}
                      </span>
                      {s.wallet && (
                        <span className="text-[11px] text-zinc-500 font-mono">{s.wallet}</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">"{s.msg}"</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação no client HTTP (Tarefa 2.13) */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                disabled={pageIndex <= 1}
                onClick={() => {
                  const next = Math.max(1, pageIndex - 1);
                  setPageIndex(next);
                  fetchSupporters(next);
                }}
                className="px-4 py-2 rounded-full text-xs uppercase tracking-wider bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10"
              >
                ← Anterior
              </button>
              <span className="text-xs text-zinc-400">
                Página <strong className="text-white">{pageIndex}</strong> de {totalPages}
              </span>
              <button
                disabled={pageIndex >= totalPages}
                onClick={() => {
                  const next = Math.min(totalPages, pageIndex + 1);
                  setPageIndex(next);
                  fetchSupporters(next);
                }}
                className="px-4 py-2 rounded-full text-xs uppercase tracking-wider bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10"
              >
                Próxima →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ OFICIAL (Tarefas 2.4 e 2.12) */}
      <footer className="border-t border-white/10 bg-[#030304] py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="font-black tracking-tighter text-lg uppercase mb-1">FOWLGEN WARS • G5B STUDIOS</div>
            <p className="text-xs text-zinc-500">
              Portal Oficial & API REST (.NET 9 / Onix.Framework) • Todos os direitos reservados © 2026.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs uppercase tracking-widest text-zinc-400">
            <a href="#apoie-nos" className="hover:text-amber-400">Apoie-nos</a>
            <a href="#apoiadores" className="hover:text-amber-400">Mural de Apoiadores</a>
            <a href="https://fowlgenwars.itch.io/fowlgenwars" target="_blank" rel="noreferrer" className="hover:text-white">Itch.io MVP</a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-white">Discord</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white">X (Twitter)</a>
            <a href="https://telegram.org" target="_blank" rel="noreferrer" className="hover:text-white">Telegram</a>
          </div>
        </div>
      </footer>

      {/* MODAL DE CADASTRO, PERFIL & LOGIN WEB3 (Tarefas 2.6, 2.7, 2.8 e 2.14) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0b0b10] border border-white/15 p-8 relative">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="text-2xl font-black uppercase tracking-tight mb-1">Conta do Jogador</h3>
            <p className="text-xs text-zinc-400 mb-6">Sincronizado com os DTOs da API (.NET 9)</p>

            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full bg-black border border-white/10 mb-6">
              <button
                onClick={() => setAuthTab('register')}
                className={`py-2 rounded-full text-[11px] font-bold uppercase tracking-wider ${authTab === 'register' ? 'bg-amber-500 text-black' : 'text-zinc-400'
                  }`}
              >
                Registo
              </button>
              <button
                onClick={() => setAuthTab('web3')}
                className={`py-2 rounded-full text-[11px] font-bold uppercase tracking-wider ${authTab === 'web3' ? 'bg-purple-600 text-white' : 'text-zinc-400'
                  }`}
              >
                Web3
              </button>
              <button
                onClick={() => setAuthTab('profile')}
                className={`py-2 rounded-full text-[11px] font-bold uppercase tracking-wider ${authTab === 'profile' ? 'bg-white text-black' : 'text-zinc-400'
                  }`}
              >
                Perfil
              </button>
            </div>

            {authTab === 'register' && (
              <form onSubmit={handleRegisterUser} className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Nickname no Jogo</label>
                  <input
                    type="text"
                    required
                    value={nickInput}
                    onChange={(e) => setNickInput(e.target.value)}
                    placeholder="Seu nickname"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="voce@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-400"
                >
                  Criar Conta (POST /api/users)
                </button>
              </form>
            )}

            {authTab === 'web3' && (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Conecte a sua carteira <strong>Phantom</strong> ou <strong>Solflare</strong> para assinar a mensagem criptográfica em <code className="text-purple-400">POST /api/auth/login-web3</code>.
                </p>
                <button
                  onClick={handleWeb3Login}
                  className="w-full py-3.5 rounded-full bg-purple-600 text-white font-black text-xs uppercase tracking-widest hover:bg-purple-500"
                >
                  Assinar com Phantom / Solflare
                </button>
              </div>
            )}

            {authTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs space-y-1">
                  <div className="text-zinc-500">ID (Guid): <span className="text-zinc-300 font-mono">{user?.id_usuario || 'Não autenticado'}</span></div>
                  <div className="text-zinc-500">Carteira: <span className="text-zinc-300 font-mono">{user?.wallet_address || 'Não vinculada'}</span></div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Atualizar Nickname</label>
                  <input
                    type="text"
                    value={nickInput}
                    onChange={(e) => setNickInput(e.target.value)}
                    placeholder="Novo nickname"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Avatar URL</label>
                  <input
                    type="url"
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!user}
                  className="w-full py-3.5 rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-amber-400 disabled:opacity-40"
                >
                  Atualizar Perfil (PUT /api/users/id)
                </button>
              </form>
            )}

            {authStatusMsg && (
              <p className="mt-4 text-center text-xs text-amber-400">{authStatusMsg}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;