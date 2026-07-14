import { motion, AnimatePresence } from 'framer-motion';
import { Menu, MapPin, Copy, Check, Megaphone, Flame, Crown, Calendar, Music, PiggyBank } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

import { ViewType } from '../types';
import { useAppData } from '../context/AppDataContext';

const HERO_BACKGROUNDS = [
  '/img/fundo-hero4.jpg',
  '/img/fundo-hero3.jpg',
  '/img/fundo-hero5.jpg',
  '/img/fundo-hero6.jpg',
];

interface HomeViewProps {
  onNavigate: (view: ViewType) => void;
  onToggleMenu: () => void;
}

// Definition of Preset Styles mapping to the cards design
interface PresetStyle {
  id: string;
  label: string;
  defaultTitle: string;
  imageUrl: string;
  theme: 'claro' | 'escuro';
  bgColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  dateColor: string;
  isCustom?: boolean;
}

const PRESET_STYLES: Record<string, PresetStyle> = {
  preto_velho_claro: {
    id: 'preto_velho_claro',
    label: 'Preto Velho (Claro)',
    defaultTitle: 'Preto Velho',
    imageUrl: '/img/eventos/preto-velho.webp',
    theme: 'claro',
    bgColor: '#F7F2E8',
    textColor: '#4E3629',
    badgeBg: '#3A322D',
    badgeText: '#F7F2E8',
    dateColor: '#4E3629'
  },
  preto_velho_escuro: {
    id: 'preto_velho_escuro',
    label: 'Preto Velho (Escuro)',
    defaultTitle: 'Preto Velho',
    imageUrl: '/img/eventos/preto-velho.webp',
    theme: 'escuro',
    bgColor: '#4E2E1A',
    textColor: '#FAF4E9',
    badgeBg: '#FAF4E9',
    badgeText: '#4E2E1A',
    dateColor: '#DBC6AB'
  },
  exu_pomba_gira_claro: {
    id: 'exu_pomba_gira_claro',
    label: 'Exu & Pomba Gira (Claro)',
    defaultTitle: 'Exu & Pomba Gira',
    imageUrl: '/img/eventos/exu-pomba.webp',
    theme: 'claro',
    bgColor: '#F7F2E8',
    textColor: '#8B0000',
    badgeBg: '#3E0000',
    badgeText: '#F7F2E8',
    dateColor: '#8B0000'
  },
  exu_pomba_gira_escuro: {
    id: 'exu_pomba_gira_escuro',
    label: 'Exu & Pomba Gira (Escuro)',
    defaultTitle: 'Exu & Pomba Gira',
    imageUrl: '/img/eventos/exu-pomba.webp',
    theme: 'escuro',
    bgColor: '#7A0000',
    textColor: '#FAF4E9',
    badgeBg: '#FAF4E9',
    badgeText: '#7A0000',
    dateColor: '#FAF4E9'
  },
  orixas_claro: {
    id: 'orixas_claro',
    label: 'Orixás (Claro)',
    defaultTitle: 'Orixás',
    imageUrl: '/img/eventos/orixas.webp',
    theme: 'claro',
    bgColor: '#F7F2E8',
    textColor: '#1565C0',
    badgeBg: '#0A2540',
    badgeText: '#F7F2E8',
    dateColor: '#1565C0'
  },
  orixas_escuro: {
    id: 'orixas_escuro',
    label: 'Orixás (Escuro)',
    defaultTitle: 'Orixás',
    imageUrl: '/img/eventos/orixas.webp',
    theme: 'escuro',
    bgColor: '#1B528A',
    textColor: '#FAF4E9',
    badgeBg: '#FAF4E9',
    badgeText: '#1B528A',
    dateColor: '#DBC6AB'
  },
  caboclos_claro: {
    id: 'caboclos_claro',
    label: 'Caboclos (Claro)',
    defaultTitle: 'Caboclos',
    imageUrl: '/img/eventos/caboclos.webp',
    theme: 'claro',
    bgColor: '#F7F2E8',
    textColor: '#275A24',
    badgeBg: '#153512',
    badgeText: '#F7F2E8',
    dateColor: '#275A24'
  },
  caboclos_escuro: {
    id: 'caboclos_escuro',
    label: 'Caboclos (Escuro)',
    defaultTitle: 'Caboclos',
    imageUrl: '/img/eventos/caboclos.webp',
    theme: 'escuro',
    bgColor: '#1E3A1A',
    textColor: '#FAF4E9',
    badgeBg: '#FAF4E9',
    badgeText: '#1E3A1A',
    dateColor: '#DBC6AB'
  },
  personalizado_claro: {
    id: 'personalizado_claro',
    label: 'Personalizado (Claro)',
    defaultTitle: '',
    imageUrl: '',
    theme: 'claro',
    bgColor: '#F7F2E8',
    textColor: '#414141',
    badgeBg: '#414141',
    badgeText: '#FAF4E9',
    dateColor: '#414141',
    isCustom: true
  },
  personalizado_escuro: {
    id: 'personalizado_escuro',
    label: 'Personalizado (Escuro)',
    defaultTitle: '',
    imageUrl: '',
    theme: 'escuro',
    bgColor: '#333333',
    textColor: '#FAF4E9',
    badgeBg: '#FAF4E9',
    badgeText: '#333333',
    dateColor: '#DBC6AB',
    isCustom: true
  }
};

function getEventPresetStyle(type: string, title: string): PresetStyle {
  if (PRESET_STYLES[type]) {
    return PRESET_STYLES[type];
  }
  const cleanTitle = title.toLowerCase();
  if (cleanTitle.includes('preto velho')) return PRESET_STYLES.preto_velho_claro;
  if (cleanTitle.includes('exu') || cleanTitle.includes('pomba')) return PRESET_STYLES.exu_pomba_gira_claro;
  if (cleanTitle.includes('orixá') || cleanTitle.includes('orixa')) return PRESET_STYLES.orixas_claro;
  if (cleanTitle.includes('caboclo')) return PRESET_STYLES.caboclos_claro;

  return PRESET_STYLES.personalizado_claro;
}

// Convert category string to punchy short uppercase name matching Figma
function getShortCategoryName(category: string): string {
  const clean = category.toLowerCase().trim();
  if (clean.includes('atendimento')) return 'ATENDIMENTO';
  if (clean.includes('festiva')) return 'FESTIVA';
  if (clean.includes('manutenção') || clean.includes('manutencao')) return 'MANUTENÇÃO';
  if (clean.includes('estudo')) return 'ESTUDO';
  return category.toUpperCase();
}

export default function HomeView({ onNavigate, onToggleMenu }: HomeViewProps) {
  const [currentBg, setCurrentBg] = useState(0);
  const { currentAccount, events, terreiros } = useAppData();

  const isGlobalAdmin = currentAccount?.email === 'admin@ile.app';
  const logoSrc = isGlobalAdmin ? '/img/logo-ile.webp' : '/img/logo-T7CA.png';

  const currentTerreiro = useMemo(() => {
    if (!currentAccount) return null;
    return terreiros.find((t) => t.id === currentAccount.terreiroId) ?? null;
  }, [currentAccount, terreiros]);

  const terreiroDisplayName = useMemo(() => {
    if (!currentTerreiro) return 'SISTEMA ILÊ';
    const name = currentTerreiro.nome;
    const dashIdx = name.indexOf(' - ');
    return dashIdx > 0 ? name.substring(0, dashIdx).trim() : name;
  }, [currentTerreiro]);

  // Robust Upcoming Events — all events within next 7 days, sorted
  const upcomingEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    const terreiroEvents = events.filter(e => !currentAccount || e.terreiroId === currentAccount.terreiroId);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + 7);
    const limitStr = limitDate.toISOString().split('T')[0];

    return terreiroEvents
      .filter(e => {
        const eDateStr = new Date(e.date).toISOString().split('T')[0];
        return eDateStr >= todayStr && eDateStr <= limitStr;
      })
      .sort((a, b) => {
        const dateAStr = new Date(a.date).toISOString().split('T')[0];
        const dateBStr = new Date(b.date).toISOString().split('T')[0];
        if (dateAStr !== dateBStr) return dateAStr.localeCompare(dateBStr);
        return a.time.localeCompare(b.time);
      })
      .map(event => {
        const style = getEventPresetStyle(event.type, event.title);
        const eDate = new Date(event.date);
        return {
          event,
          style,
          date: {
            month: eDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
            day: eDate.toLocaleDateString('pt-BR', { day: 'numeric' })
          }
        };
      });
  }, [events, currentAccount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Format gender welcome check
  const isFemale = useMemo(() => {
    const name = currentAccount?.nome?.toLowerCase() ?? '';
    return name.endsWith('a') || name.includes('ana') || name.includes('maria') || name.includes('beatriz') || name.includes('julia');
  }, [currentAccount]);

  const welcomeMsg = isFemale ? 'Seja muito bem vinda!' : 'Seja muito bem-vindo!';

  const [activeEventIdxRaw, setActiveEventIdx] = useState(0);
  // Clamp so index is always valid even if events list shrinks
  const activeEventIdx = Math.min(activeEventIdxRaw, Math.max(upcomingEvents.length - 1, 0));

  const [navigatingTo, setNavigatingTo] = useState<ViewType | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyInviteCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTerreiro?.id) {
      navigator.clipboard.writeText(currentTerreiro.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNavigate = (view: ViewType) => {
    if (navigatingTo) return;
    setNavigatingTo(view);

    const iconEl = document.querySelector(`[data-icon-view="${view}"]`) as any;
    if (iconEl) {
      if (iconEl.playerInstance && typeof iconEl.playerInstance.goToAndPlay === 'function') {
        iconEl.playerInstance.goToAndPlay(0);
      } else if (typeof iconEl.goToAndPlay === 'function') {
        iconEl.goToAndPlay(0);
      } else if (iconEl.player && typeof iconEl.player.play === 'function') {
        iconEl.player.play();
      } else if (typeof iconEl.play === 'function') {
        iconEl.play();
      }
    }

    setTimeout(() => {
      onNavigate(view);
      setNavigatingTo(null);
    }, 600);
  };

  // Spring-based tap animation config (Apple: critically damped, response 0.4)
  // Emil: button press 100-160ms, scale 0.95-0.98
  const buttonTapSpring = {
    scale: 0.96,
    transition: { type: 'spring' as const, duration: 0.35, bounce: 0 }
  };

  // Fill sweep spring — slight bounce since it's momentum-driven
  const fillSpring = {
    type: 'spring' as const,
    duration: 0.7,
    bounce: 0.1
  };

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      style={{ background: '#FFFFFF' }}
      className="flex flex-col h-full w-full p-4 pb-6 box-border overflow-y-auto no-scrollbar relative z-10 gap-4"
    >
      {/* Aurora Backdrop Style and Animations */}
      <style>{`
        @keyframes aurora-flow-1 {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(6%, -5%) scale(1.06) rotate(120deg); }
          66% { transform: translate(-5%, 6%) scale(0.94) rotate(240deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        @keyframes aurora-flow-2 {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          50% { transform: translate(-6%, 5%) scale(0.92) rotate(-180deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
        }
        .aurora-blob-1 {
          animation: aurora-flow-1 25s ease-in-out infinite;
          will-change: transform;
        }
        .aurora-blob-2 {
          animation: aurora-flow-2 32s ease-in-out infinite;
          will-change: transform;
        }

      `}</style>

      {/* Aurora Backdrop Effect behind the main card */}
      <div
        className="absolute inset-x-0 top-0 h-[45dvh] pointer-events-none overflow-hidden z-0 select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 100%)'
        }}
      >
        <div
          className="absolute w-[72vw] h-[72vw] rounded-full bg-gradient-to-br from-[#0d47a1]/85 to-[#1565c0]/45 blur-[60px] -top-[18%] -left-[12%] aurora-blob-1"
        />
        <div
          className="absolute w-[85vw] h-[85vw] rounded-full bg-gradient-to-tr from-[#00b0ff]/80 to-[#00e5ff]/35 blur-[70px] -top-[22%] -right-[18%] aurora-blob-2"
        />
      </div>

      {/* Huge cover image card */}
      <div className="mystical-glow h-[390px] sm:h-[420px] w-full rounded-[40px] shadow-[0_20px_45px_rgba(0,0,0,0.15)] relative z-10 shrink-0">
        <div className="mystical-glow-content flex flex-col h-full w-full relative">
          <AnimatePresence>
            <motion.img
              key={HERO_BACKGROUNDS[currentBg]}
              src={HERO_BACKGROUNDS[currentBg]}
              alt="Cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-black/25" />

          {/* Top Header Row inside the card */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
            <img src={logoSrc} alt="Logo" className="h-11 w-11 object-contain brightness-110 shrink-0" />

            <h2
              className="text-[19px] sm:text-[22px] font-normal tracking-[0.24em] text-white uppercase font-behind not-italic"
              style={{ textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}
            >
              {terreiroDisplayName}
            </h2>

            <button
              onClick={onToggleMenu}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white active:scale-95 transition-all shrink-0 z-30"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          {/* Text Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col items-center text-center z-10">
            <h1
              className="text-[44px] sm:text-[50px] font-normal leading-none text-white/90 font-behind-it tracking-wide mb-2"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
            >
              {currentAccount?.role === 'terreiro_admin'
                ? `Olá pai ${currentAccount?.nome?.split(' ')[0] ?? ''}`
                : `Olá ${currentAccount?.nome?.split(' ')[0] ?? 'Visitante'}`}
            </h1>
            {currentAccount?.role !== 'terreiro_admin' && (
              <p
                className="text-white/95 text-[11px] font-medium tracking-[0.18em] uppercase mt-1 font-behind not-italic"
                style={{ textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}
              >
                {welcomeMsg}
              </p>
            )}
            {currentAccount?.role === 'terreiro_admin' && currentTerreiro && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyInviteCode}
                className="mt-3 px-6 py-2 bg-white/10 hover:bg-white/18 backdrop-blur-md rounded-full text-[12px] font-bold text-white tracking-widest border border-white/15 shadow-sm flex items-center gap-2.5 transition-all duration-200 cursor-pointer"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
              >
                <span>CONVITE: {currentTerreiro.id}</span>
                <Copy className="h-3.5 w-3.5 opacity-80" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Próximo(s) Evento(s) Header */}
      {upcomingEvents.length > 0 && (
        <div className="flex items-center justify-center mt-1 relative z-10 shrink-0">
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400">
            {upcomingEvents.length > 1 ? 'Próximos eventos' : 'Próximo evento'}
          </span>
        </div>
      )}

      {/* Stacked Carousel — Premium Event Cards */}
      <div className="shrink-0 relative z-10">
        {upcomingEvents.length > 0 ? (
          <div className="flex flex-col items-stretch">
            {/* Cards stack container */}
            <div
              className="relative"
              style={{ height: `${109 + Math.min(upcomingEvents.length - 1, 2) * 8}px` }}
            >
              {upcomingEvents.map((item, idx) => {
                const offset = idx - activeEventIdx;
                if (offset < 0 || offset > 2) return null;

                const isActive = offset === 0;
                const stackScale = 1 - offset * 0.04;
                const stackY = offset * 8;
                const stackOpacity = 1 - offset * 0.25;
                const { event: ev, style: evStyle, date: evDate } = item;

                return (
                  <motion.div
                    key={ev.id}
                    animate={{
                      y: stackY,
                      scale: stackScale,
                      opacity: stackOpacity,
                    }}
                    transition={{ type: 'spring', duration: 0.5, bounce: 0.12 }}
                    className="absolute left-0 right-0 top-0"
                    style={{
                      transformOrigin: 'center top',
                      zIndex: upcomingEvents.length - offset,
                      pointerEvents: isActive ? 'auto' : 'auto',
                    }}
                  >
                    {/* Mystical-glow animated border — same as hero card */}
                    <div
                      className="mystical-glow rounded-[28px] shadow-[0_8px_18px_rgba(0,0,0,0.08),_0_2px_5px_rgba(0,0,0,0.03)]"
                      onClick={() => {
                        if (isActive) {
                          onNavigate('eventos');
                        } else {
                          setActiveEventIdx(idx);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div
                        className="mystical-glow-content group relative overflow-hidden p-4 min-h-[105px] flex flex-col justify-center"
                        style={{ backgroundColor: evStyle.bgColor, borderRadius: 'inherit' }}
                      >
                        <div className="flex items-center justify-between z-10 relative pr-24 w-full">
                          <div className="flex items-center gap-4 w-full">
                            {/* Left: Date & Time */}
                            <div className="flex flex-col items-center justify-start shrink-0" style={{ color: evStyle.dateColor }}>
                              <span className="text-[8px] font-black uppercase tracking-[0.15em] leading-none opacity-60">{evDate.month}</span>
                              <span className="text-[30px] font-bold leading-none tracking-tighter mt-0.5">{evDate.day}</span>
                              <span className="text-[11px] font-extrabold font-mono tracking-wide mt-1 opacity-85">{ev.time}</span>
                            </div>

                            {/* Middle: Content */}
                            <div className="min-w-0 flex-1">
                              {ev.category && (
                                <span
                                  className="inline-block px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-widest leading-none mb-1"
                                  style={{
                                    backgroundColor: evStyle.theme === 'claro' ? evStyle.textColor : '#FFFFFF',
                                    color: evStyle.theme === 'claro' ? '#FFFFFF' : evStyle.bgColor
                                  }}
                                >
                                  {getShortCategoryName(ev.category)}
                                </span>
                              )}

                              <h4
                                className="text-[18.5px] font-bold leading-tight font-behind"
                                style={{ color: evStyle.textColor }}
                              >
                                {ev.title}
                              </h4>

                              {ev.description && (
                                <p
                                  className="mt-1 text-[10px] leading-snug font-normal truncate"
                                  style={{ color: evStyle.theme === 'claro' ? '#414141' : '#FAF4E9' }}
                                >
                                  {ev.description}
                                </p>
                              )}

                              <div
                                className="flex items-center gap-1 mt-1.5 text-[9.5px] font-bold"
                                style={{ color: evStyle.theme === 'claro' ? '#757575' : '#FAF4E9', opacity: evStyle.theme === 'claro' ? 1 : 0.6 }}
                              >
                                <MapPin className="h-2.5 w-2.5" strokeWidth={2.5} style={{ color: evStyle.theme === 'claro' ? '#757575' : evStyle.textColor }} />
                                <span className="truncate">{ev.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Blended preset illustration */}
                        {evStyle.imageUrl && (
                          <div
                            className="absolute right-0 bottom-0 top-0 w-[42%] pointer-events-none select-none z-0 overflow-hidden"
                            style={{
                              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
                            }}
                          >
                            <img
                              src={evStyle.imageUrl}
                              alt=""
                              className="h-full w-full object-contain object-right-bottom scale-[1.12] translate-y-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Dot indicators — outside the stacked container, in normal flow */}
            {upcomingEvents.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {upcomingEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveEventIdx(idx)}
                    className="rounded-full"
                    style={{
                      width: idx === activeEventIdx ? 16 : 5,
                      height: 5,
                      backgroundColor: idx === activeEventIdx ? '#242424' : '#D4D4D8',
                      transition: 'width 200ms cubic-bezier(0.23, 1, 0.32, 1), background-color 200ms ease-out',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[24px] bg-[#FAF8F5] shadow-xs py-6 px-4 text-center border border-black/[0.015]">
            <p className="text-[12px] font-bold text-[#414141]/60">Nenhum evento agendado</p>
          </div>
        )}
      </div>

      {/* Six Button Apple Music Style Pill Grid */}
      <div className="grid grid-cols-2 gap-3 shrink-0 relative z-10 pb-6">
        {/* Eventos */}
        <motion.button
          onClick={() => handleNavigate('eventos')}
          whileTap={buttonTapSpring}
          className="relative overflow-hidden flex items-center gap-3.5 pl-3 pr-4 rounded-full bg-white border border-zinc-100 shadow-[0_8px_18px_rgba(0,0,0,0.08),_0_2px_5px_rgba(0,0,0,0.03)] text-left transition-shadow duration-150 ease-out w-full h-14 active:shadow-[0_4px_10px_rgba(0,0,0,0.06),_0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <AnimatePresence>
            {navigatingTo === 'eventos' && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={fillSpring}
                className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-white/10 via-[#e0f2fe]/40 to-[#bae6fd] z-0 pointer-events-none origin-left rounded-full"
              />
            )}
          </AnimatePresence>
          <motion.div
            animate={navigatingTo === 'eventos' ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="relative z-10 w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0"
          >
            <Calendar className="h-5.5 w-5.5 text-zinc-800" strokeWidth={2.2} />
          </motion.div>
          <span className="relative z-10 text-[14px] font-extrabold text-zinc-800 tracking-tight leading-none truncate">
            Eventos
          </span>
        </motion.button>

        {/* Músicas & Pontos */}
        <motion.button
          onClick={() => handleNavigate('pontos')}
          whileTap={buttonTapSpring}
          className="relative overflow-hidden flex items-center gap-3.5 pl-3 pr-4 rounded-full bg-white border border-zinc-100 shadow-[0_8px_18px_rgba(0,0,0,0.08),_0_2px_5px_rgba(0,0,0,0.03)] text-left transition-shadow duration-150 ease-out w-full h-14 active:shadow-[0_4px_10px_rgba(0,0,0,0.06),_0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <AnimatePresence>
            {navigatingTo === 'pontos' && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={fillSpring}
                className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-white/10 via-[#ffe4e6]/40 to-[#fecdd3] z-0 pointer-events-none origin-left rounded-full"
              />
            )}
          </AnimatePresence>
          <motion.div
            animate={navigatingTo === 'pontos' ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="relative z-10 w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0"
          >
            <Music className="h-5.5 w-5.5 text-zinc-800" strokeWidth={2.2} />
          </motion.div>
          <span className="relative z-10 text-[14px] font-extrabold text-zinc-800 tracking-tight leading-none truncate">
            Pontos
          </span>
        </motion.button>

        {/* Pedidos de Oração */}
        <motion.button
          onClick={() => handleNavigate('oracao')}
          whileTap={buttonTapSpring}
          className="relative overflow-hidden flex items-center gap-3.5 pl-3 pr-4 rounded-full bg-white border border-zinc-100 shadow-[0_8px_18px_rgba(0,0,0,0.08),_0_2px_5px_rgba(0,0,0,0.03)] text-left transition-shadow duration-150 ease-out w-full h-14 active:shadow-[0_4px_10px_rgba(0,0,0,0.06),_0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <AnimatePresence>
            {navigatingTo === 'oracao' && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={fillSpring}
                className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-white/10 via-[#fef3c7]/40 to-[#fde68a] z-0 pointer-events-none origin-left rounded-full"
              />
            )}
          </AnimatePresence>
          <motion.div
            animate={navigatingTo === 'oracao' ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="relative z-10 w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0"
          >
            <Flame className="h-5.5 w-5.5 text-zinc-800" strokeWidth={2.2} />
          </motion.div>
          <span className="relative z-10 text-[14px] font-extrabold text-zinc-800 tracking-tight leading-none truncate">
            Orações
          </span>
        </motion.button>

        {/* Avisos */}
        <motion.button
          onClick={() => handleNavigate('avisos')}
          whileTap={buttonTapSpring}
          className="relative overflow-hidden flex items-center gap-3.5 pl-3 pr-4 rounded-full bg-white border border-zinc-100 shadow-[0_8px_18px_rgba(0,0,0,0.08),_0_2px_5px_rgba(0,0,0,0.03)] text-left transition-shadow duration-150 ease-out w-full h-14 active:shadow-[0_4px_10px_rgba(0,0,0,0.06),_0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <AnimatePresence>
            {navigatingTo === 'avisos' && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={fillSpring}
                className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-white/10 via-[#f3e8ff]/40 to-[#e9d5ff] z-0 pointer-events-none origin-left rounded-full"
              />
            )}
          </AnimatePresence>
          <motion.div
            animate={navigatingTo === 'avisos' ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="relative z-10 w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0"
          >
            <Megaphone className="h-5.5 w-5.5 text-zinc-800" strokeWidth={2.2} />
          </motion.div>
          <span className="relative z-10 text-[14px] font-extrabold text-zinc-800 tracking-tight leading-none truncate">
            Avisos
          </span>
        </motion.button>

        {/* Divindades */}
        <motion.button
          onClick={() => handleNavigate('divindades')}
          whileTap={buttonTapSpring}
          className="relative overflow-hidden flex items-center gap-3.5 pl-3 pr-4 rounded-full bg-white border border-zinc-100 shadow-[0_8px_18px_rgba(0,0,0,0.08),_0_2px_5px_rgba(0,0,0,0.03)] text-left transition-shadow duration-150 ease-out w-full h-14 active:shadow-[0_4px_10px_rgba(0,0,0,0.06),_0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <AnimatePresence>
            {navigatingTo === 'divindades' && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={fillSpring}
                className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-white/10 via-[#ecfeff]/40 to-[#cffafe] z-0 pointer-events-none origin-left rounded-full"
              />
            )}
          </AnimatePresence>
          <motion.div
            animate={navigatingTo === 'divindades' ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="relative z-10 w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0"
          >
            <Crown className="h-5.5 w-5.5 text-zinc-800" strokeWidth={2.2} />
          </motion.div>
          <span className="relative z-10 text-[14px] font-extrabold text-zinc-800 tracking-tight leading-none truncate">
            Divindades
          </span>
        </motion.button>

        {/* Financeiro */}
        <motion.button
          onClick={() => handleNavigate('financeiro')}
          whileTap={buttonTapSpring}
          className="relative overflow-hidden flex items-center gap-3.5 pl-3 pr-4 rounded-full bg-white border border-zinc-100 shadow-[0_8px_18px_rgba(0,0,0,0.08),_0_2px_5px_rgba(0,0,0,0.03)] text-left transition-shadow duration-150 ease-out w-full h-14 active:shadow-[0_4px_10px_rgba(0,0,0,0.06),_0_1px_3px_rgba(0,0,0,0.02)]"
        >
          <AnimatePresence>
            {navigatingTo === 'financeiro' && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={fillSpring}
                className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-white/10 via-[#dcfce7]/40 to-[#bbf7d0] z-0 pointer-events-none origin-left rounded-full"
              />
            )}
          </AnimatePresence>
          <motion.div
            animate={navigatingTo === 'financeiro' ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="relative z-10 w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0"
          >
            <PiggyBank className="h-5.5 w-5.5 text-zinc-800" strokeWidth={2.2} />
          </motion.div>
          <span className="relative z-10 text-[14px] font-extrabold text-zinc-800 tracking-tight leading-none truncate">
            Financeiro
          </span>
        </motion.button>
      </div>

      {/* Lordicon Definitions */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        {/* Kept empty helper SVG structure if needed, previous linearGradients removed as SVGs are replaced by Lordicons */}
      </svg>

      {/* Discrete Toast Alert */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-50 px-4.5 py-2.5 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 text-white text-[12px] font-bold rounded-full shadow-lg flex items-center gap-2"
          >
            <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />
            <span>Convite copiado!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
