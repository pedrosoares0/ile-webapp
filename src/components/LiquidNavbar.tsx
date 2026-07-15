import { motion } from 'framer-motion';
import { Calendar, Music, Home, Bell, PiggyBank } from 'lucide-react';
import { ViewType } from '../types';

interface LiquidNavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export default function LiquidNavbar({ currentView, onNavigate }: LiquidNavbarProps) {
  const navItems = [
    { id: 'eventos' as ViewType, icon: Calendar, label: 'Eventos' },
    { id: 'pontos' as ViewType, icon: Music, label: 'Pontos' },
    { id: 'home' as ViewType, icon: Home, label: 'Home' },
    { id: 'avisos' as ViewType, icon: Bell, label: 'Avisos' },
    { id: 'financeiro' as ViewType, icon: PiggyBank, label: 'Financeiro' },
  ];

  return (
    <div className="fixed safe-bottom-nav inset-x-0 z-50 flex justify-center px-4 max-w-[430px] mx-auto pointer-events-none">
      {/* Apple Liquid Glass Navigation Capsule */}
      <div 
        className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-full pointer-events-auto shadow-[0_10px_30px_rgba(0,0,0,0.05),_0_2px_6px_rgba(0,0,0,0.02)]"
        style={{
          /* Layered translucent glassmorphism */
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(32px) saturate(200%) brightness(102%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%) brightness(102%)',
          border: '1px solid rgba(255, 255, 255, 0.45)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
              className="relative flex items-center justify-center h-[46px] flex-1 cursor-pointer select-none outline-none border-none bg-transparent"
              aria-label={item.label}
              title={item.label}
            >
              {/* Active pill background indicator with spring animation */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-x-1 inset-y-0.5 rounded-full"
                  style={{
                    background: 'rgba(21, 101, 192, 0.08)',
                    border: '1px solid rgba(21, 101, 192, 0.12)',
                    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}

              {/* Icon — always outline fill="none" */}
              <Icon 
                className={`relative z-10 transition-all duration-200 ${
                  isActive 
                    ? 'h-[23px] w-[23px] text-[#1565c0]' 
                    : 'h-[20px] w-[20px] text-[#414141]/35 hover:text-[#414141]/55'
                }`} 
                strokeWidth={isActive ? 2.5 : 1.8}
                fill="none"
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
