import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import PerfilTerreiroModal from './PerfilTerreiroModal';
import { 
  Home, 
  Calendar, 
  LogOut,
  X,
  BookOpen,
  Music,
  HeartHandshake,
  Bell,
  Users,
  Sparkles,
  Wallet
} from 'lucide-react';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

interface MenuItem {
  id: ViewType | 'perfil';
  label: string;
  icon: any;
  isExit?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'perfil', label: 'Perfil', icon: Sparkles },
  { id: 'cadastros', label: 'Cadastros', icon: Users },
  { id: 'financeiro', label: 'Financeiro', icon: Wallet },
  { id: 'divindades', label: 'Divindades', icon: BookOpen },
  { id: 'eventos', label: 'Eventos', icon: Calendar },
  { id: 'pontos', label: 'Pontos', icon: Music },
  { id: 'oracao', label: 'Oração', icon: HeartHandshake },
  { id: 'avisos', label: 'Mural', icon: Bell },
  { id: 'sair', label: 'Sair', icon: LogOut, isExit: true },
];

// Apple staggered entry variants for items
const containerVariants = {
  open: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  },
  closed: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 }
  }
};

const itemVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
  closed: {
    x: 20,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeInOut' }
  }
};

export default function BurgerMenu({ isOpen, onClose, currentView, onNavigate }: BurgerMenuProps) {
  const { logout } = useAuth();
  const { canAccessCadastros, currentAccount } = useAppData();
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);

  const isGlobalAdmin = currentAccount?.email === 'admin@ile.app';
  const isHubUser = currentAccount?.role === 'terreiro_user' && !currentAccount?.terreiroId;

  const { terreiros } = useAppData();
  const currentTerreiro = terreiros.find(t => t.id === currentAccount?.terreiroId) || null;
  const logoSrc = currentTerreiro?.logoUrl || ((isGlobalAdmin || isHubUser) ? '/img/login/icone.webp' : '/img/logo-T7CA.webp');
  const terreiroSigla = currentTerreiro?.sigla || currentTerreiro?.nome?.split(' - ')[0] || 'Terreiro';

  const filteredMenuItems = MENU_ITEMS.filter(item => {
    if (isHubUser) {
      return item.id === 'home' || item.id === 'divindades' || item.id === 'sair';
    }
    if ((item.id === 'cadastros' || item.id === 'financeiro') && !canAccessCadastros) return false;
    if (item.id === 'perfil' && (!currentTerreiro || !canAccessCadastros)) return false;
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur with premium smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-md"
          />

          {/* Menu Drawer - Apple Frosted Glass Vibe */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-[70] w-[300px] bg-white/70 border-l border-white/20 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto no-scrollbar"
            style={{
              backdropFilter: 'blur(30px) saturate(190%)',
              WebkitBackdropFilter: 'blur(30px) saturate(190%)',
              boxShadow: '-10px 0 50px rgba(0,0,0,0.06)'
            }}
          >
            {/* Ambient inner soft glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none z-0" />

            <div className="flex flex-col h-full justify-between z-10 relative">
              
              {/* Top Section */}
              <div>
                {/* Close Button Header Row */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#414141]/30 uppercase">Navegação</span>
                  <button 
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] text-[#414141]/50 active:scale-90 transition-transform duration-100 ease-out hover:bg-black/[0.08]"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Profile Header — Clean, no background card */}
                <div className="flex flex-col items-center text-center px-2 py-2 mb-6">
                  <div className="relative mb-3">
                    <div className="h-20 w-20 rounded-full border-2 border-white shadow-md overflow-hidden bg-white/80 flex items-center justify-center shrink-0">
                      <img src={logoSrc} alt="Logo" className="h-full w-full object-cover" />
                    </div>
                  </div>
                   <h2 className="text-[17px] font-black text-[#242424] tracking-[0.18em] leading-none uppercase">
                    {(isGlobalAdmin || isHubUser) ? 'ILÊ' : terreiroSigla}
                  </h2>
                  <p className="text-[11px] font-semibold text-[#414141]/55 mt-1.5 leading-snug max-w-[220px]">
                    {isGlobalAdmin ? 'Portal Administrativo' : isHubUser ? 'Hub de Terreiros' : (currentTerreiro?.nome || 'Terreiro de Umbanda')}
                  </p>
                  {currentAccount?.orixa && (
                    <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/[0.04] border border-black/[0.03] text-[9.5px] font-black uppercase tracking-wider text-[#414141]/50">
                      ✨ Filho(a) de {currentAccount.orixa}
                    </div>
                  )}
                </div>

                {/* Staggered Navigation Links */}
                <motion.div 
                  variants={containerVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="space-y-1"
                >
                  {filteredMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    const isExit = item.isExit;

                    return (
                      <motion.button
                        key={item.id}
                        variants={itemVariants}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (isExit) {
                            logout();
                            onClose();
                          } else if (item.id === 'perfil') {
                            setIsPerfilModalOpen(true);
                          } else {
                            onNavigate(item.id as ViewType);
                            onClose();
                          }
                        }}
                        className={`group relative flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                          isActive 
                            ? 'bg-white border border-black/[0.03] shadow-[0_4px_12px_rgba(0,0,0,0.03)] font-bold' 
                            : isExit 
                              ? 'text-red-500 hover:bg-red-50/50 hover:text-red-600 border border-transparent' 
                              : 'text-[#414141]/75 hover:bg-white/40 hover:text-[#242424] border border-transparent'
                        }`}
                        style={isActive ? { color: 'var(--theme-color, #BF2429)' } : undefined}
                      >
                        {/* Selected vertical bar indicator */}
                        {isActive && (
                          <motion.div 
                            layoutId="active-menu-bar"
                            className="absolute left-1.5 top-3.5 bottom-3.5 w-1 rounded-full"
                            style={{ backgroundColor: 'var(--theme-color, #BF2429)' }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}

                        <Icon 
                          className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-105 ${
                            isActive 
                              ? '' 
                              : isExit 
                                ? 'text-red-400 group-hover:text-red-500' 
                                : 'text-[#414141]/40 group-hover:text-[#242424]'
                          }`} 
                          style={isActive ? { color: 'var(--theme-color, #BF2429)' } : undefined}
                          strokeWidth={isActive ? 2.5 : 2} 
                        />
                        
                        <span className="text-[13.5px] font-semibold tracking-wide text-left leading-none">
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>

              {/* Bottom Metadata & Versioning */}
              <div className="border-t border-black/[0.04] pt-6 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#414141]/35">
                  Ilê WebApp · v1.4.0
                </p>
                <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#414141]/20 mt-1">
                  Protegido por Axé e Lei
                </p>
              </div>

            </div>
          </motion.div>
        </>
      )}

      {/* Terreiro Profile Modal for Color & Logo customization */}
      <PerfilTerreiroModal
        isOpen={isPerfilModalOpen}
        onClose={() => setIsPerfilModalOpen(false)}
        terreiro={currentTerreiro}
      />
    </AnimatePresence>
  );
}
