import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthModal } from './components/AuthModal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────
interface StatItem { value: string; label: string }
interface RouteItem { num: string; route: string; classes: string; role: string }
interface ModeItem { tag: string; num: string; title: string; desc: string; meta: string; players: string }
interface ClassItem { icon: string; name: string; role: string; desc: string }

// ─────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────
const STATS: StatItem[] = [
  { value: '60fps', label: 'Combate mobile real-time' },
  { value: '4 Rotas', label: 'Estratégia multi-caminho' },
  { value: '3 Min', label: 'Partida intensa' },
  { value: '∞', label: 'Vitórias on-chain' },
];

const ROUTES: RouteItem[] = [
  { num: '01', route: 'TOP', classes: 'Tanques · Colossos · Titãs', role: 'Resistência e linha de frente' },
  { num: '02', route: 'SELVA', classes: 'Hunters · Caçadores', role: 'Emboscadas e eliminação' },
  { num: '03', route: 'MID', classes: 'Feiticeiros · Magos · Assassinos', role: 'Poder, controle e dano' },
  { num: '04', route: 'ADC', classes: 'Atiradores · Suportes', role: 'Dano à distância e proteção' },
];

const MODES: ModeItem[] = [
  {
    tag: 'PvE',
    num: '01',
    title: 'Caçada aos Colossos',
    desc: 'Colossos gigantescos emergem das ilhas corrompidas. Squads de até 5 devem coordenar rotas, habilidades e timing para vencer múltiplas fases de combate.',
    meta: 'Alto XP · Loot Raro',
    players: '1–5 Jogadores',
  },
  {
    tag: 'PvP · Principal',
    num: '02',
    title: 'Duelo das Ilhas',
    desc: 'Partidas competitivas 3v3 de 4 minutos pelo controle do cristal central. Resultado assinado pelo servidor e gravado imediatamente na Solana.',
    meta: 'Ranking · XP · Badges',
    players: 'Competitivo',
  },
  {
    tag: 'Sobrevivência',
    num: '03',
    title: 'Torre do Eclipse',
    desc: 'Ondas infinitas de criaturas corrompidas emergem sem aviso. Multiplicadores de XP crescem por onda — quanto mais alto, mais alto o risco.',
    meta: 'Badges de Temporada',
    players: 'Solo / Duo',
  },
];

const CLASSES: ClassItem[] = [
  { icon: '🛡️', name: 'Vanguarda', role: 'TOP', desc: 'Linha de frente blindada. Absorve dano e cria aberturas.' },
  { icon: '🔮', name: 'Arcano', role: 'MID', desc: 'Controle gravitacional e dano em área devastador.' },
  { icon: '🏹', name: 'Caçador', role: 'SELVA', desc: 'Furtividade, armadilhas e críticos à distância.' },
  { icon: '💥', name: 'Artilheiro', role: 'ADC', desc: 'Canhões pesados. Dano massivo em ponto único.' },
  { icon: '⚡', name: 'Arauto', role: 'SUPORTE', desc: 'Cura, amplificação e sustentação em batalhas longas.' },
];

// ─────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────
export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);

  // Refs
  const mainRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const heroStatsRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);

  const openAuth = () => { setIsModalOpen(true); setIsMobileOpen(false); };

  // ── Hero entrance
  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'expo.out' } });

    tl.fromTo(heroTitleRef.current?.querySelectorAll('.reveal-line') ?? [],
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08 }
    )
      .fromTo(heroSubRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.5'
      )
      .fromTo(heroCtaRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )
      .fromTo(heroStatsRef.current?.querySelectorAll('.stat-item') ?? [],
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        '-=0.4'
      )
      .fromTo(heroImgRef.current,
        { opacity: 0, scale: 1.04, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out' },
        '-=1.2'
      );
  }, { scope: heroRef });

  // ── Scroll reveals (editorial fade-up)
  useEffect(() => {
    const lines = gsap.utils.toArray<HTMLElement>('.editorial-reveal');
    lines.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 44 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
        }
      );
    });

    // Stagger groups
    const groups = gsap.utils.toArray<HTMLElement>('.stagger-group');
    groups.forEach((group) => {
      const children = group.querySelectorAll('.stagger-child');
      gsap.fromTo(children,
        { opacity: 0, y: 36, scale: 0.98 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: group, start: 'top 88%', toggleActions: 'play none none none' },
        }
      );
    });

    // Horizontal line reveals
    const hLines = gsap.utils.toArray<HTMLElement>('.h-line-reveal');
    hLines.forEach((el) => {
      gsap.fromTo(el,
        { scaleX: 0, transformOrigin: 'left' },
        {
          scaleX: 1, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 92%' },
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-[#050505] text-zinc-200 overflow-x-hidden selection:bg-white selection:text-black">

      {/* ══════════════ NAVBAR ══════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">

          <a href="#" className="flex items-center gap-2 group">
            <span className="text-xl leading-none">👑</span>
            <span className="font-black tracking-[0.12em] text-sm text-white uppercase">Fowlgen<span className="text-zinc-500 font-medium ml-1">Wars</span></span>
          </a>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-10">
            {[['#sobre', 'O Jogo'], ['#lore', 'O Reino'], ['#modos', 'Batalhas'], ['#apoiadores', 'Comunidade']].map(([href, label]) => (
              <a key={href} href={href} className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 hover:text-white transition-colors duration-200">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={openAuth}
              className="hidden md:block text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 hover:text-white transition-colors">
              Entrar
            </button>
            <button onClick={openAuth}
              className="text-[11px] font-black uppercase tracking-[0.15em] bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg transition-colors">
              Jogar Alpha
            </button>
            <button onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileOpen ? 'max-h-80' : 'max-h-0'}`}>
          <nav className="flex flex-col px-5 py-4 gap-1 border-t border-white/[0.06]">
            {[['#sobre', 'O Jogo'], ['#lore', 'O Reino'], ['#modos', 'Batalhas Épicas'], ['#apoiadores', 'Comunidade']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setIsMobileOpen(false)}
                className="py-3 text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border-b border-white/[0.04] last:border-0">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ══════════════ HERO ══════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-end pt-14 overflow-hidden">

        {/* Hero image — full bleed background */}
        <div ref={heroImgRef} className="absolute inset-0 z-0">
          <img
            src="/hero.png"
            alt="Fowlgen Wars — Arte Oficial"
            onLoad={() => setHeroImgLoaded(true)}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80'; setHeroImgLoaded(true); }}
            className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${heroImgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-transparent" />
        </div>

        {/* Hero content — bottom aligned editorial */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-5 sm:px-8 w-full pb-16 lg:pb-24">
          <div className="max-w-4xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8 editorial-reveal">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">GSB Studios — Alpha Preview — Unity 6 · Solana</span>
            </div>

            {/* Title — clip reveal per line */}
            <div ref={heroTitleRef} className="overflow-hidden mb-6">
              <div className="overflow-hidden">
                <div className="reveal-line text-[clamp(3rem,8vw,7rem)] font-black leading-[0.92] tracking-tight text-white uppercase">
                  A GUERRA
                </div>
              </div>
              <div className="overflow-hidden">
                <div className="reveal-line text-[clamp(3rem,8vw,7rem)] font-black leading-[0.92] tracking-tight uppercase">
                  <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>PELO REINO</span>
                </div>
              </div>
              <div className="overflow-hidden">
                <div className="reveal-line text-[clamp(3rem,8vw,7rem)] font-black leading-[0.92] tracking-tight text-white uppercase">
                  ALADO
                </div>
              </div>
            </div>

            <p ref={heroSubRef} className="text-zinc-400 text-base sm:text-lg max-w-xl leading-relaxed mb-10 opacity-0">
              Mini-MOBA mobile com combate real-time a 60 FPS e progressão on-chain imutável na Solana. Cada vitória é sua para sempre.
            </p>

            <div ref={heroCtaRef} className="flex flex-col sm:flex-row gap-4 mb-16 opacity-0">
              <button onClick={openAuth}
                className="group flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase tracking-[0.15em] px-8 py-4 rounded-xl transition-all duration-200 hover:gap-4">
                Entrar na Batalha
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a href="#sobre"
                className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-[0.15em] px-8 py-4 rounded-xl transition-all duration-200">
                Ver Mecânicas
              </a>
            </div>

            {/* Stats strip */}
            <div ref={heroStatsRef} className="h-line-reveal w-full h-px bg-white/10 mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {STATS.map((s) => (
                <div key={s.label} className="stat-item opacity-0">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{s.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ #SOBRE — MECÂNICAS ══════════════ */}
      <section id="sobre" className="py-32 border-t border-white/[0.06]">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8">

          {/* Section header */}
          <div className="flex items-start justify-between gap-8 mb-20">
            <div className="editorial-reveal">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 block mb-4">001 — O Jogo</span>
              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-[0.95]">
                Engenharia<br />de Combate
              </h2>
            </div>
            <p className="editorial-reveal hidden lg:block text-zinc-500 text-sm leading-relaxed max-w-sm pt-10">
              Gameplay fluido no Unity 6 com URP. A Solana só é chamada no resultado — sem lag, sem trapaça, sem intermediários.
            </p>
          </div>

          {/* Core principles — editorial rows */}
          <div className="stagger-group space-y-0 border-t border-white/[0.06]">
            {[
              { n: '01', title: 'Real-Time Puro', body: 'Toda movimentação, física e combate correm a 60 FPS no dispositivo. Nenhuma transação durante a batalha. A ação nunca para.' },
              { n: '02', title: 'Resultado On-Chain', body: 'Ao final de cada partida, o servidor assina o resultado e grava XP, vitórias e partidas diretamente na sua PDA na Solana via Anchor.' },
              { n: '03', title: 'Estratégia de Rota', body: '4 rotas com funções distintas: Tanques (TOP), Assassinos (SELVA), Magos (MID), Atiradores (ADC). Sincronia é a chave da vitória.' },
              { n: '04', title: 'Sem Pay-to-Win', body: 'Progressão baseada em habilidade e tempo de jogo. Vitórias verificáveis e transparentes para todos. A blockchain como árbitro.' },
            ].map((row) => (
              <div key={row.n} className="stagger-child group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 py-8 border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors px-2 -mx-2 rounded-lg cursor-default">
                <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 shrink-0 w-8">{row.n}</span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight shrink-0 sm:w-64 group-hover:text-amber-400 transition-colors duration-300">{row.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed flex-1">{row.body}</p>
              </div>
            ))}
          </div>

          {/* Routes */}
          <div className="mt-24">
            <div className="editorial-reveal flex items-center gap-4 mb-12">
              <div className="h-line-reveal flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 shrink-0">As 4 Rotas de Batalha</span>
              <div className="h-line-reveal flex-1 h-px bg-white/10" />
            </div>

            <div className="stagger-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ROUTES.map((r) => (
                <div key={r.route}
                  className="stagger-child group bg-[#0a0a0a] border border-white/[0.07] hover:border-white/20 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-default">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-700 block mb-4">{r.num}</span>
                  <div className="text-2xl font-black text-white uppercase tracking-tight mb-1 group-hover:text-amber-400 transition-colors">{r.route}</div>
                  <div className="text-xs text-zinc-400 font-medium mb-3">{r.classes}</div>
                  <div className="h-px w-8 bg-white/10 mb-3 group-hover:w-full group-hover:bg-amber-400/30 transition-all duration-500" />
                  <p className="text-zinc-600 text-[11px] leading-relaxed">{r.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ #LORE — O REINO ══════════════ */}
      <section id="lore" className="py-32 border-t border-white/[0.06] bg-[#070707]">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8">

          {/* Oversize editorial text */}
          <div className="mb-20">
            <span className="editorial-reveal text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 block mb-6">002 — A História</span>
            <h2 className="editorial-reveal text-5xl sm:text-7xl lg:text-[8rem] font-black text-white tracking-tight uppercase leading-[0.9] mb-8">
              As Ilhas de<br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.2)' }}>Aurora</span>
            </h2>
            <div className="editorial-reveal max-w-2xl">
              <div className="h-line-reveal w-16 h-px bg-white/20 mb-6" />
              <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
                Há 500 anos, os cristais de éter entraram em colapso e fragmentaram o continente em arquipélagos suspensos. Os clãs Fowlgen adaptaram suas garras e penas à magia elementar que agora permeia o ar. Agora lutam pelo Trono da Coroa Solar — e cada vitória é gravada no Livro Imutável.
              </p>
            </div>
          </div>

          {/* Classes grid — editorial */}
          <div className="stagger-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CLASSES.map((c) => (
              <div key={c.name}
                className="stagger-child group relative bg-[#0a0a0a] border border-white/[0.07] hover:border-white/20 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden cursor-default">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl pointer-events-none group-hover:bg-white/[0.03] transition-colors" />
                <span className="text-2xl block mb-5">{c.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 block mb-1">{c.role}</span>
                <h4 className="text-base font-black text-white uppercase tracking-tight mb-2 group-hover:text-zinc-200">{c.name}</h4>
                <div className="h-px w-6 bg-white/10 mb-3 group-hover:w-full transition-all duration-500 group-hover:bg-white/20" />
                <p className="text-zinc-600 text-[11px] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Lore narrative columns */}
          <div className="stagger-group mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8 pt-16 border-t border-white/[0.06]">
            {[
              { heading: 'A Grande Ruptura', body: 'Os cristais de éter que sustentavam o continente explodiram simultaneamente, elevando massas de terra. Nenhuma civilização foi poupada — todas foram forçadas a se reinventar nas alturas.' },
              { heading: 'Os Titãs Silvestres', body: 'Criaturas colossais adormecidas nos núcleos rochosos despertaram famintas. Apenas comandantes que dominam as quatro rotas conseguem enfraquecê-las.' },
              { heading: 'O Livro Imutável', body: 'Cada vitória, cada XP ganho, cada derrota heroica — tudo registrado na Solana. A história dos guerreiros não pode ser apagada ou falsificada.' },
            ].map((col) => (
              <div key={col.heading} className="stagger-child">
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">{col.heading}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ #MODOS — BATALHAS ══════════════ */}
      <section id="modos" className="py-32 border-t border-white/[0.06]">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8">

          <div className="mb-20">
            <span className="editorial-reveal text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 block mb-6">003 — Arenas</span>
            <h2 className="editorial-reveal text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-[0.95]">
              Modos de<br />Batalha
            </h2>
          </div>

          <div className="stagger-group space-y-4">
            {MODES.map((m, i) => (
              <div key={m.title}
                className="stagger-child group border border-white/[0.07] hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 cursor-default">
                <div className="flex flex-col lg:flex-row lg:items-stretch">
                  {/* Number block */}
                  <div className="hidden lg:flex items-center justify-center w-24 shrink-0 bg-white/[0.02] border-r border-white/[0.06] text-4xl font-black text-zinc-800 group-hover:text-zinc-700 transition-colors">
                    {m.num}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-7 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">{m.tag}</span>
                          {i === 1 && (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-white text-black px-2.5 py-1 rounded-full">
                              Destaque
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-zinc-100">
                          {m.title}
                        </h3>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl">{m.desc}</p>
                      </div>

                      <div className="shrink-0 sm:text-right space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-zinc-400">{m.players}</div>
                        <div className="text-[10px] font-medium text-zinc-600">{m.meta}</div>
                        <button onClick={openAuth}
                          className="mt-3 text-[10px] font-black uppercase tracking-[0.15em] border border-white/10 hover:border-white/30 hover:text-white text-zinc-400 px-4 py-2 rounded-lg transition-all block w-full sm:w-auto">
                          Jogar →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tech strip */}
          <div className="stagger-group mt-20 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-16 border-t border-white/[0.06]">
            {[
              { label: 'Engine', value: 'Unity 6 URP' },
              { label: 'Contratos', value: 'Anchor 0.30' },
              { label: 'Blockchain', value: 'Solana Devnet' },
              { label: 'Frontend', value: 'React 19 + GSAP' },
            ].map((t) => (
              <div key={t.label} className="stagger-child bg-[#0a0a0a] border border-white/[0.07] rounded-xl px-5 py-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-700 block mb-1">{t.label}</span>
                <span className="text-sm font-black text-white">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ #APOIADORES ══════════════ */}
      <section id="apoiadores" className="py-32 border-t border-white/[0.06] bg-[#070707]">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div>
              <span className="editorial-reveal text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 block mb-6">004 — Comunidade</span>
              <h2 className="editorial-reveal text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-[0.95] mb-8">
                Seja um dos<br />primeiros<br />
                <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)' }}>
                  Comandantes
                </span>
              </h2>
              <p className="editorial-reveal text-zinc-500 text-base leading-relaxed max-w-md mb-10">
                Registre sua identidade Alpha agora. Garanta seu nickname exclusivo, tenha acesso prioritário às batalhas de teste e conquiste o Badge de Fundador permanente.
              </p>
              <div className="editorial-reveal flex flex-col sm:flex-row gap-4">
                <button onClick={openAuth}
                  className="group flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase tracking-[0.15em] px-8 py-4 rounded-xl transition-all duration-200 hover:gap-4">
                  Criar Identidade Alpha
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
              <p className="editorial-reveal text-zinc-700 text-[11px] mt-4">
                Sem necessidade de carteira para registro. Integração Solana opcional.
              </p>
            </div>

            {/* Perks */}
            <div className="stagger-group space-y-3">
              {[
                { n: '01', title: 'Nickname Exclusivo', body: 'Garanta seu nome de guerreiro antes do lançamento público. Primeiros registros têm prioridade.' },
                { n: '02', title: 'Histórico On-Chain', body: 'Seu XP e vitórias registrados desde o primeiro combate na Solana. Permanente e verificável.' },
                { n: '03', title: 'Badge de Fundador', body: 'Distinção Alpha Tester visível no perfil para sempre. Não há como obtê-la após o lançamento.' },
                { n: '04', title: 'Acesso Antecipado', body: 'Participe das batalhas de teste antes de qualquer outro jogador e ajude a moldar o jogo.' },
              ].map((p) => (
                <div key={p.title}
                  className="stagger-child group flex gap-6 bg-[#0a0a0a] border border-white/[0.07] hover:border-white/20 rounded-xl p-6 transition-all duration-300 cursor-default">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-700 shrink-0 pt-0.5">{p.n}</span>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1.5 group-hover:text-zinc-200">{p.title}</h4>
                    <p className="text-zinc-600 text-[12px] leading-relaxed">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="border-t border-white/[0.06] pt-16 pb-10 bg-[#050505]">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">

            <div className="md:col-span-5 space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">👑</span>
                <span className="font-black tracking-[0.12em] text-sm text-white uppercase">
                  Fowlgen<span className="text-zinc-600 font-medium ml-1">Wars</span>
                </span>
              </div>
              <p className="text-zinc-600 text-sm leading-relaxed max-w-xs">
                Um projeto de GSB Studios. Combate tático mobile, vitórias imutáveis na Solana.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-700 bg-[#0a0a0a] border border-white/[0.06] px-4 py-2.5 rounded-lg w-fit">
                Program ID: 7UYgCSdMd4SVLqVDmZvDbhxs4AV9E2VbgBc2gXJrnD27
              </div>
            </div>

            <div className="md:col-span-3 md:col-start-7">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700 mb-5">Navegar</h4>
              <ul className="space-y-3">
                {[['#sobre', 'O Jogo'], ['#lore', 'O Reino'], ['#modos', 'Batalhas'], ['#apoiadores', 'Comunidade']].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="text-zinc-500 hover:text-white text-sm transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700 mb-5">Status</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Devnet', status: 'Ativo', color: 'bg-emerald-400' },
                  { label: 'Site Alpha', status: 'Em Dev', color: 'bg-amber-400' },
                  { label: 'Unity Build', status: 'WIP', color: 'bg-zinc-600' },
                ].map((s) => (
                  <li key={s.label} className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.color} ${s.color === 'bg-emerald-400' ? 'animate-pulse' : ''}`} />
                    <span>{s.label}</span>
                    <span className="text-zinc-700">—</span>
                    <span>{s.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-line-reveal h-px bg-white/[0.06] mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-zinc-700">© 2026 GSB Studios — Fowlgen Wars. Todos os direitos reservados.</p>
            <p className="text-[11px] text-zinc-700">Construído com Unity 6 · Anchor · React 19 · GSAP</p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}