import { motion } from 'framer-motion';

type ViewType = 'home' | 'pontos' | 'eventos' | 'divindades' | 'financeiro' | 'avisos';

interface BottomNavigationProps {
  currentView: ViewType;
  onNavigate: (view: any) => void;
  isVisible: boolean;
}

const NAV_ITEMS = [
  { 
    id: 'financeiro', 
    icon: '/img/financeiro-icon-navbar.webp', 
    label: 'Finanças',
    color: '#1B3B18'
  },
  { 
    id: 'pontos', 
    icon: '/img/pontos - bottomnavigation.webp', 
    label: 'Pontos',
    color: '#941c1c'
  },
  { 
    id: 'home', 
    icon: '/img/home- bottomnavigation.webp', 
    label: 'Início',
    color: '#941c1c'
  },
  { 
    id: 'eventos', 
    icon: '/img/eventos - bottomnavigation.webp', 
    label: 'Eventos',
    color: '#941c1c'
  },
  { 
    id: 'avisos', 
    icon: '/img/avisos-bottomnavigation.webp', 
    label: 'Avisos',
    color: '#5C4033'
  }
];

export default function BottomNavigation({ currentView, onNavigate, isVisible }: BottomNavigationProps) {
  return (
    <div className={`fixed bottom-8 left-1/2 z-50 w-[92%] -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
    }`}>
      <div className="relative flex h-[68px] w-full items-center justify-around rounded-[32px] bg-white/70 p-1.5 backdrop-blur-2xl border border-white/40 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-1 flex-col items-center justify-center transition-all duration-300"
            >
              <div className="relative flex flex-col items-center justify-center py-2">
                <motion.img
                  src={item.icon}
                  alt={item.label}
                  animate={{ 
                    scale: isActive ? 1.2 : 1,
                    y: isActive ? -2 : 0,
                    filter: isActive 
                      ? 'brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(3041%) hue-rotate(351deg) brightness(85%) contrast(93%)' 
                      : 'grayscale(1) brightness(0.7) opacity(0.3)'
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="h-6 w-6 object-contain"
                />
                
                <motion.span 
                  animate={{ 
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.8,
                    y: isActive ? 1 : 4
                  }}
                  className={`mt-1 text-[8px] font-black uppercase tracking-[0.15em] ${isActive ? 'text-[#941c1c]' : 'text-transparent'}`}
                >
                  {item.label}
                </motion.span>

                {/* Refined Active Indicator (Small Elegant Bar/Pill at bottom) */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 h-1 w-5 rounded-full bg-[#941c1c]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
