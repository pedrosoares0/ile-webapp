import { motion, AnimatePresence } from 'framer-motion';
import { ViewType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { 
  Home, 
  Calendar, 
  LogOut,
  X,
  BookOpen,
  ShieldCheck,
  Music,
  HeartHandshake,
  Bell
} from 'lucide-react';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

interface MenuItem {
  id: ViewType;
  label: string;
  icon: any;
  isExit?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'divindades', label: 'Divindades', icon: BookOpen },
  { id: 'eventos', label: 'Calendário de Eventos', icon: Calendar },
  { id: 'pontos', label: 'Músicas & Pontos', icon: Music },
  { id: 'oracao', label: 'Pedidos de Oração', icon: HeartHandshake },
  { id: 'avisos', label: 'Avisos & Comunicados', icon: Bell },
  { id: 'cadastros', label: 'Painel Admin', icon: ShieldCheck },
  { id: 'sair', label: 'Desconectar conta', icon: LogOut, isExit: true },
];

export default function BurgerMenu({ isOpen, onClose, currentView, onNavigate }: BurgerMenuProps) {
  const { logout } = useAuth();
  const { canAccessCadastros, currentAccount } = useAppData();

  const isGlobalAdmin = currentAccount?.email === 'admin@ile.app';
  const isHubUser = currentAccount?.role === 'terreiro_user' && !currentAccount?.terreiroId;
  const logoSrc = (isGlobalAdmin || isHubUser) ? '/img/login/icone.webp' : '/img/logo-T7CA.png';

  const filteredMenuItems = MENU_ITEMS.filter(item => {
    if (isHubUser) {
      return item.id === 'home' || item.id === 'divindades' || item.id === 'sair';
    }
    if (item.id === 'cadastros' && !canAccessCadastros) return false;
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur with smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
          />

          {/* Menu Drawer - Editorial Refined Light-Glass Vibe */}
          <motion.div
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 30, stiffness: 240 }}
            className="fixed inset-y-0 right-0 z-[70] w-[290px] bg-white/95 border-l border-zinc-100 p-8 shadow-2xl flex flex-col justify-between"
            style={{
              boxShadow: '-10px 0 40px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(30px) saturate(1.8)'
            }}
          >
            {/* Top Glossy Reflection Sheen */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            <div className="flex flex-col h-full justify-between z-10">
              
              {/* Top Section */}
              <div>
                {/* Close Button Header Row */}
                <div className="flex justify-end mb-6">
                  <button 
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.03] text-[#414141]/40 active:scale-90 transition-all hover:bg-black/[0.06] hover:text-[#414141]/75"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Brand Identity Card */}
                <div className="flex flex-col items-center text-center px-2 py-4 mb-8 bg-zinc-50 border border-zinc-100 rounded-2xl">
                  <img src={logoSrc} alt="Logo" className="h-14 w-14 object-contain mb-3" />
                  <h2 className="text-lg font-bold text-[#414141] tracking-widest leading-none font-sans uppercase">
                    {(isGlobalAdmin || isHubUser) ? 'Ilê' : 'T7CA'}
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#414141]/40 mt-1.5">
                    {isGlobalAdmin ? 'Portal Administrativo' : isHubUser ? 'Hub de Terreiros' : 'Terreiro de Umbanda'}
                  </p>
                </div>

                {/* Clean Typographic Links */}
                <div className="space-y-1.5">
                  {filteredMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    const isExit = item.isExit;

                    return (
                      <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isExit) {
                            logout();
                            onClose();
                          } else {
                            onNavigate(item.id);
                            onClose();
                          }
                        }}
                        className={`group relative flex w-full items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-300 ${
                          isActive 
                            ? 'text-[#1565c0] bg-[#1565c0]/5 border border-[#1565c0]/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] font-bold' 
                            : isExit 
                              ? 'text-red-600/70 hover:bg-red-500/5 hover:text-red-700 border border-transparent' 
                              : 'text-[#414141]/75 hover:bg-black/[0.02] hover:text-[#414141] border border-transparent'
                        }`}
                      >
                        {/* Left Active Indicator Bar */}
                        {isActive && (
                          <motion.div 
                            layoutId="active-menu-bar"
                            className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-[#1565c0]"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}

                        <Icon 
                          className={`h-4.5 w-4.5 transition-colors duration-300 ${
                            isActive 
                              ? 'text-[#1565c0]' 
                              : isExit 
                                ? 'text-red-600/60 group-hover:text-red-600' 
                                : 'text-[#414141]/45 group-hover:text-[#414141]/70'
                          }`} 
                          strokeWidth={isActive ? 2.5 : 2} 
                        />
                        
                        <span className="text-[13.5px] font-semibold tracking-wide text-left leading-none font-sans">
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Metadata & Versioning */}
              <div className="border-t border-black/[0.05] pt-6 text-center">
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#414141]/35">
                  Ilê WebApp · v1.4.0
                </p>
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#414141]/20 mt-1">
                  Protegido por Axé e Lei
                </p>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
