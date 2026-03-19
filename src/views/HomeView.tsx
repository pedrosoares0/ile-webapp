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
  onNavigate: (view: 'home' | 'pontos' | 'eventos' | 'divindades') => void;
  onToggleMenu: () => void;
}

export default function HomeView({ onNavigate, onToggleMenu }: HomeViewProps) {
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
          {/* Profile Icon with Glassmorphism */}
          <div className="glass-container h-11 w-11 rounded-full">
            <div className="glass-filter"></div>
            <div className="glass-overlay"></div>
            <div className="glass-specular"></div>
            <div className="glass-content h-full w-full items-center justify-center font-bold text-lg text-white">
              U
            </div>
          </div>
          
          {/* Search Bar with Glassmorphism */}
          <div className="glass-container mx-3 h-10 flex-1 rounded-full">
            <div className="glass-filter"></div>
            <div className="glass-overlay"></div>
            <div className="glass-specular"></div>
            <div className="glass-content h-full w-full items-center gap-2 px-4">
              <Search className="h-4 w-4 text-white/70" strokeWidth={2.5} />
              <input 
                type="text" 
                placeholder="Procure por eventos..."
                className="w-full bg-transparent text-[11px] text-white placeholder:text-white/60 outline-none font-medium"
                disabled
              />
            </div>
          </div>
          
          {/* Burger Menu with Glassmorphism */}
          <button 
            onClick={onToggleMenu}
            className="glass-container h-11 w-11 rounded-full active:scale-90 transition-transform"
          >
            <div className="glass-filter"></div>
            <div className="glass-overlay"></div>
            <div className="glass-specular"></div>
            <div className="glass-content h-full w-full items-center justify-center text-white">
              <Menu className="h-6 w-6" strokeWidth={2} />
            </div>
          </button>
        </div>

        {/* User Welcome Card */}
        <div className="absolute bottom-10 left-4 right-4 z-10">
          <div className="glass-container mx-auto w-fit min-w-[320px] max-w-full rounded-full">
            <div className="glass-filter rounded-full"></div>
            <div className="glass-overlay rounded-full"></div>
            <div className="glass-specular rounded-full"></div>
            
            <div className="glass-content w-full p-4 pl-7 justify-between items-center rounded-full">
              <div className="flex flex-col pr-2">
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-60" style={{ color: '#fee3c5' }}>Bem-vindo</p>
                <h1 className="text-2xl font-bold tracking-tight leading-none mt-0.5" style={{ color: '#fee3c5' }}>Usuário</h1>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#fee3c5] animate-pulse" />
                  <span className="text-[8px] font-bold tracking-[0.1em] uppercase opacity-50" style={{ color: '#fee3c5' }}>Terreiro de Umbanda T7CA</span>
                </div>
              </div>
              <div className="glass-container h-14 w-14 rounded-full border-none shadow-none bg-transparent flex-shrink-0">
                <div className="glass-filter rounded-full"></div>
                <div className="glass-overlay rounded-full opacity-30"></div>
                <div className="glass-specular rounded-full border-none shadow-none"></div>
                <div className="glass-content h-full w-full items-center justify-center overflow-hidden p-1.5">
                  <img src="/img/logo-T7CA.png" alt="Logo" className="h-[90%] w-[90%] object-contain brightness-110" />
                </div>
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
            <h2 className="mt-0.5 text-[32px] leading-tight font-behind-it" style={{ color: '#fee3c5' }}>Deitada de Santo</h2>
            <p className="mt-1 text-[10px] font-medium text-white/80">Largo do Jenipapeiro - 24/03 | 19h</p>
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 px-5 pb-10">
        <motion.button 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="group relative flex h-[140px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-[#E8F8E4] p-5 shadow-[0_10px_30px_rgba(45,90,39,0.08)]"
        >
          {/* Decorative Icon Background */}
          <div className="absolute -right-4 -top-4 opacity-[0.08] transition-transform group-hover:scale-110 duration-500">
            <img src="/img/financeiro-icon.png" alt="" className="h-32 w-32 object-contain" />
          </div>
          
          <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/40 shadow-sm backdrop-blur-sm border border-white/40">
            <img src="/img/financeiro-icon.png" alt="Financeiro" className="h-8 w-8 object-contain" />
          </div>
          
          <div className="relative z-10 text-center">
            <h3 className="text-[22px] leading-tight text-[#1B3B18] font-behind-it">Financeiro</h3>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#1B3B18]/40">Mensalidades</p>
          </div>
        </motion.button>

        <motion.button 
          onClick={() => onNavigate('eventos')}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="group relative flex h-[140px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-[#FCE8C3] p-5 shadow-[0_10px_30px_rgba(184,134,11,0.08)]"
        >
          <div className="absolute -right-4 -top-4 opacity-[0.08] transition-transform group-hover:scale-110 duration-500">
            <img src="/img/eventos-icon.png" alt="" className="h-32 w-32 object-contain" />
          </div>
          
          <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/40 shadow-sm backdrop-blur-sm border border-white/40">
            <img src="/img/eventos-icon.png" alt="Eventos" className="h-8 w-8 object-contain" />
          </div>
          
          <div className="relative z-10 text-center">
            <h3 className="text-[22px] leading-tight text-[#5C4033] font-behind-it">Eventos</h3>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#5C4033]/40">Calendário</p>
          </div>
        </motion.button>

        <motion.button 
          onClick={() => onNavigate('pontos')}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="group relative flex h-[140px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-[#FCE5E5] p-5 shadow-[0_10px_30px_rgba(148,28,28,0.08)]"
        >
          <div className="absolute -right-4 -top-4 opacity-[0.08] transition-transform group-hover:scale-110 duration-500">
            <img src="/img/pontos-icon.png" alt="" className="h-32 w-32 object-contain" />
          </div>
          
          <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/40 shadow-sm backdrop-blur-sm border border-white/40">
            <img src="/img/pontos-icon.png" alt="Pontos" className="h-8 w-8 object-contain" />
          </div>
          
          <div className="relative z-10 text-center">
            <h3 className="text-[22px] leading-tight text-[#941c1c] font-behind-it">Pontos</h3>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#941c1c]/40">Cantados</p>
          </div>
        </motion.button>

        <motion.button 
          onClick={() => onNavigate('divindades')}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="group relative flex h-[140px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-[#E3F2FD] p-5 shadow-[0_10px_30px_rgba(25,118,210,0.08)]"
        >
          <div className="absolute -right-4 -top-4 opacity-[0.08] transition-transform group-hover:scale-110 duration-500">
            <img src="/img/divindade-icon.png" alt="" className="h-32 w-32 object-contain" />
          </div>
          
          <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/40 shadow-sm backdrop-blur-sm border border-white/40">
            <img src="/img/divindade-icon.png" alt="Divindades" className="h-8 w-8 object-contain" />
          </div>
          
          <div className="relative z-10 text-center">
            <h3 className="text-[22px] leading-tight text-[#1565C0] font-behind-it">Divindades</h3>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#1565C0]/40">Estudo</p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
