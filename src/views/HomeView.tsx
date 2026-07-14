import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BookOpen, CreditCard, Menu, MapPin } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

import { ViewType } from '../types';
import { useAppData } from '../context/AppDataContext';

const HERO_BACKGROUNDS = [
  '/img/fundo-hero4.jpg',
  '/img/fundo-hero3.jpg',
  '/img/fundo-hero5.jpg',
  '/img/fundo-hero6.jpg',
  '/img/fundo-hero7.jpg',
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

  // Robust Next Event sorting by both Date and Time
  const nextEvent = useMemo(() => {
    if (!events || events.length === 0) return null;

    // Filter events belonging to current account's terreiro
    const terreiroEvents = events.filter(e => !currentAccount || e.terreiroId === currentAccount.terreiroId);

    // Set comparison to start of today (local time) to catch today's upcoming events
    const todayStr = new Date().toISOString().split('T')[0];

    const upcoming = terreiroEvents
      .filter(e => {
        const eDateStr = new Date(e.date).toISOString().split('T')[0];
        return eDateStr >= todayStr;
      })
      .sort((a, b) => {
        const dateAStr = new Date(a.date).toISOString().split('T')[0];
        const dateBStr = new Date(b.date).toISOString().split('T')[0];
        
        // Primary sort: Date
        if (dateAStr !== dateBStr) {
          return dateAStr.localeCompare(dateBStr);
        }
        
        // Secondary sort: Time
        return a.time.localeCompare(b.time);
      });

    return upcoming[0] ?? null;
  }, [events, currentAccount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Format gender welcome check
  const isFemale = useMemo(() => {
    const name = currentAccount?.nome?.toLowerCase() ?? '';
    return name.endsWith('a') || name.includes('ana') || name.includes('maria') || name.includes('beatriz') || name.includes('julia');
  }, [currentAccount]);

  const welcomeMsg = isFemale ? 'Seja muito bem vinda!' : 'Seja muito bem-vindo!';

  // Compute style variables for the Home nextEvent card preview
  const nextEventStyle = useMemo(() => {
    if (!nextEvent) return null;
    return getEventPresetStyle(nextEvent.type, nextEvent.title);
  }, [nextEvent]);

  const nextEventDate = useMemo(() => {
    if (!nextEvent) return null;
    const eDate = new Date(nextEvent.date);
    return {
      month: eDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
      day: eDate.toLocaleDateString('pt-BR', { day: 'numeric' })
    };
  }, [nextEvent]);

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      style={{ background: 'linear-gradient(180deg, #F4E8D9 88%, #DBC6AB 100%)' }}
      className="flex flex-col h-full w-full p-4 pb-6 box-border overflow-hidden relative z-10"
    >
      {/* Aurora Backdrop Effect behind the main card */}
      <div 
        className="absolute inset-x-0 top-0 h-[45dvh] pointer-events-none overflow-hidden z-0 select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 100%)'
        }}
      >
        <div
          className="absolute w-[72vw] h-[72vw] rounded-full bg-gradient-to-br from-[#0d47a1]/85 to-[#1565c0]/45 blur-[60px] -top-[18%] -left-[12%] animate-[pulse_6s_ease-in-out_infinite]"
        />
        <div
          className="absolute w-[85vw] h-[85vw] rounded-full bg-gradient-to-tr from-[#00b0ff]/80 to-[#00e5ff]/35 blur-[70px] -top-[22%] -right-[18%] animate-[pulse_8s_ease-in-out_infinite_1.2s]"
        />
      </div>

      {/* Huge cover image card */}
      <div className="mystical-glow flex-1 w-full rounded-[40px] shadow-[0_20px_45px_rgba(0,0,0,0.15)] relative z-10">
        <div className="mystical-glow-content flex flex-col h-full w-full relative">
          <AnimatePresence mode="wait">
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

          <div className="absolute inset-0 bg-black/20" />

          {/* Top Header Row inside the card */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
            <img src={logoSrc} alt="Logo" className="h-11 w-11 object-contain brightness-110 shrink-0" />

            <h2
              className="text-[13.5px] font-normal tracking-[0.22em] text-white uppercase font-behind not-italic"
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
              className="text-[44px] sm:text-[50px] font-normal leading-none text-white font-behind-it tracking-wide"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
            >
              Olá {currentAccount?.nome?.split(' ')[0] ?? 'Visitante'}
            </h1>
            <p
              className="text-white/95 text-[11px] font-medium tracking-[0.18em] uppercase mt-2.5 font-behind not-italic"
              style={{ textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}
            >
              {welcomeMsg}
            </p>
            {currentAccount?.role === 'terreiro_admin' && currentTerreiro && (
              <span 
                className="mt-3.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9.5px] font-bold text-white tracking-widest border border-white/25 shadow-sm select-all"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                CÓDIGO CONVITE: {currentTerreiro.id}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Customizable Premium Next Event Card (Aligned with Figma specification) */}
      <div className="mt-4 shrink-0 relative z-10">
        {nextEvent && nextEventStyle && nextEventDate ? (
          <motion.div
            onClick={() => onNavigate('eventos')}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-[32px] p-6 min-h-[142px] flex flex-col justify-center transition-all duration-300 shadow-xs border border-black/[0.02] cursor-pointer"
            style={{ backgroundColor: nextEventStyle.bgColor }}
          >
            <div className="flex items-center justify-between z-10 relative pr-24 w-full">
              <div className="flex items-center gap-5 w-full">
                {/* Left: Date & Time Column */}
                <div className="flex flex-col items-center justify-start shrink-0" style={{ color: nextEventStyle.dateColor }}>
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none opacity-60">{nextEventDate.month}</span>
                  <span className="text-[42px] font-bold leading-none tracking-tighter mt-1">{nextEventDate.day}</span>
                  <span className="text-[13px] font-extrabold font-mono tracking-wide mt-1.5 opacity-85">{nextEvent.time}</span>
                </div>

                {/* Middle: Content */}
                <div className="min-w-0 flex-1">
                  {nextEvent.category && (
                    <span 
                      className="inline-block px-1.5 py-0.5 rounded-[4px] text-[7.5px] font-black uppercase tracking-widest leading-none mb-1"
                      style={{ 
                        backgroundColor: nextEventStyle.theme === 'claro' ? nextEventStyle.textColor : '#FFFFFF', 
                        color: nextEventStyle.theme === 'claro' ? '#FFFFFF' : nextEventStyle.bgColor 
                      }}
                    >
                      {getShortCategoryName(nextEvent.category)}
                    </span>
                  )}
                  
                  <h4 
                    className="text-[23px] font-bold leading-tight font-behind"
                    style={{ color: nextEventStyle.textColor }}
                  >
                    {nextEvent.title}
                  </h4>
                  
                  {nextEvent.description && (
                    <p 
                      className="mt-1 text-[11px] leading-snug font-normal truncate" 
                      style={{ color: nextEventStyle.theme === 'claro' ? '#414141' : '#FAF4E9' }}
                    >
                      {nextEvent.description}
                    </p>
                  )}

                  <div 
                    className="flex items-center gap-1 mt-2 text-[10px] font-bold" 
                    style={{ color: nextEventStyle.theme === 'claro' ? '#757575' : '#FAF4E9', opacity: nextEventStyle.theme === 'claro' ? 1 : 0.6 }}
                  >
                    <MapPin className="h-3 w-3" strokeWidth={2.5} style={{ color: nextEventStyle.theme === 'claro' ? '#757575' : nextEventStyle.textColor }} />
                    <span className="truncate">{nextEvent.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Blended preset illustration */}
            {nextEventStyle.imageUrl && (
              <div 
                className="absolute right-0 bottom-0 top-0 w-[45%] pointer-events-none select-none z-0 overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
                }}
              >
                <img 
                  src={nextEventStyle.imageUrl} 
                  alt="" 
                  className="h-full w-full object-contain object-right-bottom scale-[1.08] translate-y-1.5" 
                />
              </div>
            )}
          </motion.div>
        ) : (
          <div className="rounded-[32px] bg-[#FAF8F5] shadow-xs py-8 px-6 text-center border border-black/[0.02]">
            <p className="text-[14px] font-bold text-[#414141]/60">Nenhum evento agendado</p>
          </div>
        )}
      </div>

      {/* Three Button Pill Row */}
      <div className="grid grid-cols-3 gap-2.5 mt-4 shrink-0 relative z-10">
        {/* Calendário */}
        <motion.button
          onClick={() => onNavigate('eventos')}
          whileTap={{ scale: 0.95 }}
          className="bg-[#FEF9ED] hover:bg-[#FEF9ED]/95 rounded-full py-4 px-2 flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(65,65,65,0.06)] text-[#414141] group"
        >
          <Calendar className="h-3.5 w-3.5 text-[#1565c0]" strokeWidth={2.5} />
          <span className="text-[11px] font-bold tracking-tight text-[#414141]/85">Calendário</span>
        </motion.button>

        {/* Financeiro */}
        <motion.button
          onClick={() => onNavigate('financeiro')}
          whileTap={{ scale: 0.95 }}
          className="bg-[#FEF9ED] hover:bg-[#FEF9ED]/95 rounded-full py-4 px-2 flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(65,65,65,0.06)] text-[#414141] group"
        >
          <CreditCard className="h-3.5 w-3.5 text-[#1b3b18]" strokeWidth={2.5} />
          <span className="text-[11px] font-bold tracking-tight text-[#414141]/85">Financeiro</span>
        </motion.button>

        {/* Divindades */}
        <motion.button
          onClick={() => onNavigate('divindades')}
          whileTap={{ scale: 0.95 }}
          className="bg-[#FEF9ED] hover:bg-[#FEF9ED]/95 rounded-full py-4 px-2 flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(65,65,65,0.06)] text-[#414141] group"
        >
          <BookOpen className="h-3.5 w-3.5 text-[#1565c0]" strokeWidth={2.5} />
          <span className="text-[11px] font-bold tracking-tight text-[#414141]/85">Divindades</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
