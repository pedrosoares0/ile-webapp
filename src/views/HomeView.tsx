import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';

const HERO_BACKGROUNDS = [
  '/img/fundo-hero1.png',
  '/img/fundo-hero2.jpg',
  '/img/fundo-hero3.jpg',
  '/img/fundo-hero4.jpg',
  '/img/fundo-hero5.jpg',
  '/img/fundo-hero6.jpg',
  '/img/fundo-hero7.jpg',
];

interface HomeViewProps {
  onNavigate: (view: 'home' | 'pontos' | 'eventos') => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      key="home"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero Card */}
      <div className="relative h-[480px] w-full overflow-hidden rounded-b-[45px] shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
        <AnimatePresence mode="wait">
          <motion.img 
            key={HERO_BACKGROUNDS[currentBg]}
            src={HERO_BACKGROUNDS[currentBg]}
            alt="Hero Background" 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Header Controls */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-12">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/30 font-bold text-lg shadow-lg">
            U
          </div>
          
          <div className="mx-3 flex h-10 flex-1 items-center gap-2 rounded-full bg-white/10 px-4 backdrop-blur-md border border-white/20">
            <Search className="h-4 w-4 text-white/70" strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Procure por eventos..."
              className="w-full bg-transparent text-[11px] text-white placeholder:text-white/60 outline-none font-medium"
              disabled
            />
          </div>
          
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/30 shadow-lg">
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>

        {/* User Welcome Card */}
        <div className="absolute bottom-10 left-6 right-6 z-10">
          <div className="rounded-[32px] bg-black/10 p-5 backdrop-blur-md border border-white/10 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-60" style={{ color: '#fee3c5' }}>Bem-vindo</p>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#fee3c5' }}>Usuário</h1>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#fee3c5] animate-pulse" />
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase opacity-50" style={{ color: '#fee3c5' }}>Terreiro de Umbanda T7CA</span>
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-[#fee3c5]/15 p-1 backdrop-blur-md border border-[#fee3c5]/30 shadow-lg flex items-center justify-center overflow-hidden">
                <img src="/img/logo-T7CA.png" alt="Logo" className="h-[85%] w-[85%] object-contain brightness-110" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Event Card */}
      <div className="mt-10 px-5">
        <div className="group relative h-28 w-full overflow-hidden rounded-[24px] shadow-[0_12px_24px_rgba(148,28,28,0.15)] bg-[#941c1c] active:scale-[0.98] transition-all duration-200">
          <img 
            src="/img/fundo-evento1.png" 
            alt="Event Background" 
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#941c1c] via-[#941c1c]/40 to-transparent" />
          
          <div className="relative z-10 flex h-full flex-col justify-center px-8">
            <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-white/90">Próximo evento</p>
            <h2 className="mt-0.5 text-[32px] leading-tight" style={{ color: '#fee3c5', fontFamily: 'BehindTheNinetiesItalic' }}>Deitada de Santo</h2>
            <p className="mt-1 text-[10px] font-medium text-white/80">Largo do Jenipapeiro - 24/03 | 19h</p>
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 px-5">
        <button className="group flex h-[76px] items-center gap-3 rounded-[24px] bg-[#E8F8E4] px-4 shadow-[0_6px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all duration-200">
          <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center">
            <img src="/img/financeiro-icon.png" alt="Financeiro" className="h-full w-full object-contain" />
          </div>
          <span className="text-[11px] font-bold text-[#414141] text-left leading-tight flex-1">Financeiro</span>
        </button>

        <button 
          onClick={() => onNavigate('eventos')}
          className="group flex h-[76px] items-center gap-3 rounded-[24px] bg-[#FCE8C3] px-4 shadow-[0_6px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all duration-200"
        >
          <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center">
            <img src="/img/eventos-icon.png" alt="Eventos" className="h-full w-full object-contain" />
          </div>
          <span className="text-[11px] font-bold text-[#414141] text-left leading-tight flex-1">Eventos</span>
        </button>

        <button 
          onClick={() => onNavigate('pontos')}
          className="group flex h-[76px] items-center gap-3 rounded-[24px] bg-white px-4 shadow-[0_6px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all duration-200"
        >
          <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center">
            <img src="/img/pontos-icon.png" alt="Pontos Cantados" className="h-full w-full object-contain" />
          </div>
          <span className="text-[11px] font-bold text-[#414141] text-left leading-tight flex-1">Pontos Cantados</span>
        </button>

        <button className="group flex h-[76px] items-center gap-3 rounded-[24px] bg-white px-4 shadow-[0_6px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all duration-200">
          <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center">
            <img src="/img/divindade-icon.png" alt="Divindades" className="h-full w-full object-contain" />
          </div>
          <span className="text-[11px] font-bold text-[#414141] text-left leading-tight flex-1">Divindades</span>
        </button>
      </div>
    </motion.div>
  );
}
