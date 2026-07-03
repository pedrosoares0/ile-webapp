import { motion } from 'framer-motion';
import { Calendar, CreditCard, BookOpen, Home, Menu } from 'lucide-react';
import { ViewType } from '../types';

interface LiquidNavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onToggleMenu: () => void;
}

export default function LiquidNavbar({ currentView, onNavigate, onToggleMenu }: LiquidNavbarProps) {
  const navItems = [
    { id: 'home' as ViewType, icon: Home, label: 'Home' },
    { id: 'divindades' as ViewType, icon: BookOpen, label: 'Divindades' },
    { id: 'eventos' as ViewType, icon: Calendar, label: 'Eventos' },
    { id: 'financeiro' as ViewType, icon: CreditCard, label: 'Financeiro' },
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 max-w-[430px] mx-auto pointer-events-none">
      {/* Horizontal Premium Light Glassmorphism Navigation Capsule */}
      <div 
        className="flex items-center gap-2 bg-white/25 backdrop-blur-2xl saturate-[1.8] border border-white/45 px-4 py-1.5 rounded-full pointer-events-auto shadow-sm"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex items-center justify-center h-10 w-14 cursor-pointer select-none transition-all duration-300 group"
            >
              {isActive && (
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  {/* Glass bubble active capsule */}
                  <motion.div
                    layoutId="active-bubble"
                    className="absolute inset-0 rounded-full border border-white/50 bg-white/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.04)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                  {/* Glossy sheen reflection on top of bubble */}
                  <div className="absolute top-[1px] inset-x-3.5 h-[3px] rounded-full bg-gradient-to-b from-white/40 to-transparent blur-[0.2px]" />
                </div>
              )}

              <Icon 
                className={`h-5 w-5 transition-all duration-300 relative z-10 ${
                  isActive ? 'text-[#1565c0] scale-105 filter drop-shadow-[0_1px_2px_rgba(21,101,192,0.15)]' : 'text-[#414141]/40 group-hover:text-[#414141]/70'
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
                fill={isActive && (item.id === 'home' || item.id === 'eventos') ? 'currentColor' : 'none'}
              />
            </div>
          );
        })}

        {/* Vertical Divider */}
        <div className="w-[1px] h-5 bg-[#414141]/10 mx-0.5" />

        {/* Menu Tab Button */}
        <div
          onClick={onToggleMenu}
          className="flex items-center justify-center h-10 w-11 cursor-pointer select-none rounded-full hover:bg-black/[0.03] active:scale-95 transition-all group"
        >
          <Menu className="h-5 w-5 text-[#414141]/40 group-hover:text-[#414141]/75 transition-colors" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
