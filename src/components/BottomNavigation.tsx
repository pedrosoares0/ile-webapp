import { motion } from 'framer-motion';
import { ViewType } from '../types';

interface BottomNavigationProps {
  currentView: ViewType;
  onNavigate: (view: any) => void;
  isVisible: boolean;
}

const NAV_ITEMS = [
  { 
    id: 'financeiro', 
    icon: '/img/financeiro-icon-navbar.webp', 
    label: 'Pgtos.',
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
      <div className="glass-container h-[68px] w-full rounded-[34px]">
        <div className="glass-filter"></div>
        <div className="glass-overlay"></div>
        <div className="glass-specular"></div>
        
        <div className="glass-content w-full h-full justify-around p-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative flex flex-1 flex-col items-center justify-center transition-all duration-300"
              >
                {/* Active Background Pill (Horizontal Pill-shaped) - Focus of the change */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute z-0 h-[62px] w-[115%] sm:w-[98%] rounded-[30px] bg-black/[0.08]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center justify-center py-1">
                  <motion.img
                    src={item.icon}
                    alt={item.label}
                    animate={{ 
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -1 : 0,
                      filter: isActive 
                        ? 'brightness(0) saturate(100%) invert(18%) sepia(88%) saturate(3041%) hue-rotate(351deg) brightness(85%) contrast(93%)' 
                        : 'grayscale(1) brightness(0.7) opacity(0.5)'
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="h-6 w-6 object-contain"
                  />
                  
                  <motion.span 
                    animate={{ 
                      opacity: isActive ? 1 : 0.6,
                      scale: isActive ? 1.1 : 0.95,
                      y: isActive ? 1 : 2
                    }}
                    className={`mt-1 text-[10px] font-bold tracking-tight ${isActive ? 'text-[#941c1c]' : 'text-black/60'}`}
                  >
                    {item.label}
                  </motion.span>
                </div>
              </button>
            );
          })}
        </div>

        {/* SVG FILTER DEFINITION */} 
        <svg style={{ display: 'none' }}> 
          <filter id="lg-dist" x="-20%" y="-20%" width="140%" height="140%"> 
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="2" seed="92" result="noise" /> 
            <feGaussianBlur in="noise" stdDeviation="2.5" result="blurred" /> 
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="18" xChannelSelector="R" yChannelSelector="G" /> 
          </filter> 
        </svg> 
      </div>
    </div>
  );
}
