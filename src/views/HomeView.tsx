import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BookOpen, CreditCard, ChevronRight, Menu } from 'lucide-react';
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

export default function HomeView({ onNavigate, onToggleMenu }: HomeViewProps) {
  const [currentBg, setCurrentBg] = useState(0);
  const { currentAccount, events, terreiros } = useAppData();

  const isGlobalAdmin = currentAccount?.email === 'admin@ile.app';
  const logoSrc = isGlobalAdmin ? '/img/logo-ile.webp' : '/img/logo-T7CA.png';

  const currentTerreiro = useMemo(() => {
    if (!currentAccount) return null;
    return terreiros.find((t) => t.id === currentAccount.terreiroId) ?? null;
  }, [currentAccount, terreiros]);

  const nextEvent = useMemo(() => {
    if (!events || events.length === 0) return null;

    // Find events from current terreiro or global
    const terreiroEvents = events.filter(e => !currentAccount || e.terreiroId === currentAccount.terreiroId);

    const now = new Date();
    const upcoming = terreiroEvents
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcoming[0] ?? null;
  }, [events, currentAccount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 3500); // Faster slide interval transition
    return () => clearInterval(timer);
  }, []);

  // Format date for the ticket badge if an event exists
  const eventDateObj = nextEvent ? new Date(nextEvent.date) : null;
  const dayStr = eventDateObj ? eventDateObj.toLocaleDateString('pt-BR', { day: '2-digit' }) : '';
  const monthStr = eventDateObj ? eventDateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase() : '';

  // Polished gender welcome check
  const isFemale = useMemo(() => {
    const name = currentAccount?.nome?.toLowerCase() ?? '';
    return name.endsWith('a') || name.includes('ana') || name.includes('maria') || name.includes('beatriz') || name.includes('julia');
  }, [currentAccount]);

  const welcomeMsg = isFemale ? 'Seja muito bem vinda!' : 'Seja muito bem-vindo!';

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
      {/* Aurora Backdrop Effect behind the main card (More vivid and stronger Light/Dark Blue glows) */}
      <div 
        className="absolute inset-x-0 top-0 h-[45dvh] pointer-events-none overflow-hidden z-0 select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 100%)'
        }}
      >
        {/* Strong Dark Blue Glow */}
        <div
          className="absolute w-[72vw] h-[72vw] rounded-full bg-gradient-to-br from-[#0d47a1]/85 to-[#1565c0]/45 blur-[60px] -top-[18%] -left-[12%] animate-[pulse_6s_ease-in-out_infinite]"
        />
        {/* Strong Light Blue Glow */}
        <div
          className="absolute w-[85vw] h-[85vw] rounded-full bg-gradient-to-tr from-[#00b0ff]/80 to-[#00e5ff]/35 blur-[70px] -top-[22%] -right-[18%] animate-[pulse_8s_ease-in-out_infinite_1.2s]"
        />
      </div>

      {/* Huge cover image card with dynamic white hairline border glow */}
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
              transition={{ duration: 0.65, ease: "easeInOut" }} // Faster fade transition
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          {/* Vignette overlay (Removed the dark bottom shadow completely, replaced with soft 20% opacity cover) */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Top Header Row inside the card */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
            {/* Logo image directly (no background, matches menu button h-11 w-11) */}
            <img src={logoSrc} alt="Logo" className="h-11 w-11 object-contain brightness-110 shrink-0" />

            {/* Terreiro Name (Straight font-behind) */}
            <h2
              className="text-[13.5px] font-normal tracking-[0.22em] text-white uppercase font-behind not-italic"
              style={{ textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}
            >
              {currentTerreiro?.nome ?? 'SISTEMA ILÊ'}
            </h2>

            {/* Glassmorphic Burger Menu Button */}
            <button
              onClick={onToggleMenu}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white active:scale-95 transition-all shrink-0 z-30"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          {/* Text Overlay (Bottom Center of card - moved closer to the footer) */}
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
          </div>
        </div>
      </div>

      {/* Next Activity Section (Less rounded [rounded-[28px]] and larger, using third color #FEF9ED) */}
      <div className="mt-4 shrink-0 relative z-10">
        {nextEvent ? (
          <motion.div
            onClick={() => onNavigate('eventos')}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-[28px] bg-[#FEF9ED] shadow-[0_12px_28px_rgba(65,65,65,0.08)] p-6 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              {/* Apple Calendar Style Ticket (Blue) */}
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-[18px] bg-[#1565c0]/5 border border-[#1565c0]/10 shrink-0">
                <span className="text-[8px] font-black tracking-widest text-[#1565c0] opacity-80 leading-none">{monthStr}</span>
                <span className="text-xl font-bold text-[#1565c0] leading-none mt-1">{dayStr}</span>
              </div>

              <div className="flex-1 min-w-0">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-green-500/10 text-green-700">
                  {nextEvent.category}
                </span>
                <h3 className="text-[15px] font-bold text-[#414141] mt-1 leading-tight group-hover:text-[#1565c0] transition-colors truncate">
                  {nextEvent.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-[#414141]/55 text-xs font-semibold">
                  <span className="truncate">{nextEvent.time} · {nextEvent.location}</span>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-[#414141]/30 group-hover:text-[#1565c0] group-hover:translate-x-0.5 transition-all" />
            </div>
          </motion.div>
        ) : (
          <div className="rounded-[28px] bg-[#FEF9ED] shadow-[0_12px_28px_rgba(65,65,65,0.08)] py-6 px-6 text-center">
            <p className="text-[14px] font-bold text-[#414141]/60">Nenhum evento agendado</p>
          </div>
        )}
      </div>

      {/* Three Button Pill Row (Calendário, Financeiro, Divindades, using third color #FEF9ED) */}
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
