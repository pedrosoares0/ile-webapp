import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  Bell, 
  DollarSign, 
  CalendarCheck, 
  Droplets, 
  HelpCircle, 
  Settings, 
  LogOut,
  X,
  Info
} from 'lucide-react';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

const MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'divindades', label: 'Divindades', icon: Info },
  { id: 'eventos', label: 'Eventos', icon: Calendar },
  { id: 'avisos', label: 'Avisos', icon: Bell },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'consultas', label: 'Consultas Agendadas', icon: CalendarCheck },
  { id: 'oracao', label: 'Pedidos de Oração', icon: Droplets },
  { id: 'ajuda', label: 'Ajuda', icon: HelpCircle },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
  { id: 'sair', label: 'Sair', icon: LogOut, isExit: true },
];

export default function BurgerMenu({ isOpen, onClose, currentView, onNavigate }: BurgerMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Menu Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-[70] w-[300px] bg-white/70 backdrop-blur-2xl p-8 shadow-2xl rounded-r-[40px] border-r border-white/20"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 flex items-center justify-center">
                    <img src="/img/logo-T7CA.png" alt="Logo" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#414141] leading-tight tracking-tight">T7CA</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#414141]/40">Umbanda</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black/40 active:scale-90 transition-transform hover:bg-black/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (!item.isExit) {
                          onNavigate(item.id);
                          onClose();
                        }
                      }}
                      className={`group flex w-full items-center gap-4 rounded-[22px] px-4 py-3.5 transition-all duration-300 ${
                        isActive 
                          ? 'bg-[#941c1c] text-white shadow-[0_10px_25px_rgba(148,28,28,0.25)]' 
                          : 'text-[#414141]/60 hover:bg-black/5'
                      }`}
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                        isActive ? 'bg-white/15' : 'bg-black/5 group-hover:bg-black/10'
                      }`}>
                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#414141]/50'}`} strokeWidth={2.2} />
                      </div>
                      
                      <span 
                        className={`text-[15px] font-semibold tracking-tight text-left leading-tight ${isActive ? 'translate-x-1' : ''} transition-transform duration-300`}
                        style={{ fontFamily: isActive ? 'BehindTheNinetiesItalic' : 'inherit' }}
                      >
                        {item.label}
                      </span>

                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer Logo Background Overlay */}
              <div className="absolute bottom-[-20px] left-[-20px] opacity-[0.03] pointer-events-none">
                <img src="/img/logo-T7CA.png" alt="" className="h-48 w-48 object-contain" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
