import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, Search, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import SheetModal from '../components/SheetModal';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { getUpcomingEvent } from '../lib/date';
import { AppView } from '../types';

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
  onNavigate: (view: AppView) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const [currentBg, setCurrentBg] = useState(0);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const { logout } = useAuth();
  const { currentAccount, terreiros, events, isGlobalAdmin, canAccessCadastros } = useAppData();
  const upcomingEvent = getUpcomingEvent(events);
  const upcomingTerreiro = terreiros.find((terreiro) => terreiro.id === upcomingEvent?.terreiroId) ?? null;
  const currentTerreiro =
    currentAccount?.scope === 'terreiro'
      ? terreiros.find((terreiro) => terreiro.id === currentAccount.terreiroId) ?? null
      : null;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-[480px] w-full overflow-hidden rounded-b-[45px] shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
        <AnimatePresence mode="wait">
          <motion.img
            key={HERO_BACKGROUNDS[currentBg]}
            src={HERO_BACKGROUNDS[currentBg]}
            alt="Hero Background"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="relative z-10 flex items-center justify-between px-6 pt-12">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg font-bold text-white shadow-lg backdrop-blur-md">
            {currentAccount?.nome.charAt(0).toUpperCase() ?? 'U'}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('eventos')}
            className="mx-3 flex h-10 flex-1 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-left backdrop-blur-md"
            aria-label="Abrir eventos"
          >
            <Search className="h-4 w-4 text-white/70" strokeWidth={2.5} />
            <span className="text-[11px] font-medium text-white/60">Procure por eventos...</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMenuModal(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-md"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>

        <div className="absolute bottom-10 left-6 right-6 z-10">
          <div className="rounded-[32px] border border-white/10 bg-black/10 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: '#fee3c5' }}>
                  Bem-vindo
                </p>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#fee3c5' }}>
                  {currentAccount?.nome.split(' ')[0] ?? 'Usuário'}
                </h1>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 w-1 animate-pulse rounded-full bg-[#fee3c5]" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-50" style={{ color: '#fee3c5' }}>
                    {isGlobalAdmin
                      ? 'Admin Geral do Sistema'
                      : currentAccount?.role === 'terreiro_admin'
                        ? `Admin ${currentTerreiro?.nome ?? upcomingTerreiro?.nome ?? 'do Terreiro'}`
                        : `Usuário ${currentTerreiro?.nome ?? upcomingTerreiro?.nome ?? 'do Terreiro'}`}
                  </span>
                </div>
              </div>
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#fee3c5]/30 bg-[#fee3c5]/15 p-1 shadow-lg backdrop-blur-md">
                <img
                  src="/img/logo-T7CA.png"
                  alt="Logo"
                  className="h-[85%] w-[85%] object-contain brightness-110"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 px-5">
        <button
          type="button"
          onClick={() => onNavigate('eventos')}
          className="group relative h-28 w-full overflow-hidden rounded-[24px] bg-[#941c1c] shadow-[0_12px_24px_rgba(148,28,28,0.15)] transition-all duration-200 active:scale-[0.98]"
        >
          <img
            src="/img/fundo-evento1.png"
            alt="Event Background"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#941c1c] via-[#941c1c]/40 to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-center px-8 text-left">
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/90">Próximo evento</p>
            <h2
              className="mt-0.5 text-[32px] leading-tight"
              style={{ color: '#fee3c5', fontFamily: 'BehindTheNinetiesItalic' }}
            >
              {upcomingEvent?.title ?? 'Cadastre seu primeiro evento'}
            </h2>
            <p className="mt-1 text-[10px] font-medium text-white/80">
              {upcomingEvent
                ? `${upcomingEvent.location} - ${upcomingEvent.date.toLocaleDateString('pt-BR')} | ${upcomingEvent.time}`
                : 'Abra a agenda e monte a programação do terreiro'}
            </p>
          </div>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 px-5">
        {canAccessCadastros ? (
          <button
            type="button"
            onClick={() => onNavigate('cadastros')}
            className="group flex h-[76px] items-center gap-3 rounded-[24px] bg-[#E8F8E4] px-4 shadow-[0_6px_15px_rgba(0,0,0,0.02)] transition-all duration-200 active:scale-95"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              <img src="/img/financeiro-icon.png" alt="Cadastros" className="h-full w-full object-contain" />
            </div>
            <span className="flex-1 text-left text-[11px] font-bold leading-tight text-[#414141]">Cadastros</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onNavigate('eventos')}
          className="group flex h-[76px] items-center gap-3 rounded-[24px] bg-[#FCE8C3] px-4 shadow-[0_6px_15px_rgba(0,0,0,0.02)] transition-all duration-200 active:scale-95"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
            <img src="/img/eventos-icon.png" alt="Eventos" className="h-full w-full object-contain" />
          </div>
          <span className="flex-1 text-left text-[11px] font-bold leading-tight text-[#414141]">Eventos</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('pontos')}
          className="group flex h-[76px] items-center gap-3 rounded-[24px] bg-white px-4 shadow-[0_6px_15px_rgba(0,0,0,0.02)] transition-all duration-200 active:scale-95"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
            <img src="/img/pontos-icon.png" alt="Pontos Cantados" className="h-full w-full object-contain" />
          </div>
          <span className="flex-1 text-left text-[11px] font-bold leading-tight text-[#414141]">Pontos Cantados</span>
        </button>

        {canAccessCadastros ? (
          <button
            type="button"
            onClick={() => onNavigate('cadastros')}
            className="group flex h-[76px] items-center gap-3 rounded-[24px] bg-white px-4 shadow-[0_6px_15px_rgba(0,0,0,0.02)] transition-all duration-200 active:scale-95"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              <img src="/img/divindade-icon.png" alt="Terreiros e usuários" className="h-full w-full object-contain" />
            </div>
            <span className="flex-1 text-left text-[11px] font-bold leading-tight text-[#414141]">
              Terreiros e Usuários
            </span>
          </button>
        ) : null}
      </div>

      <SheetModal
        isOpen={showMenuModal}
        title="Menu"
        subtitle={currentAccount?.email}
        onClose={() => setShowMenuModal(false)}
      >
        <div className="space-y-4">
          {canAccessCadastros ? (
            <button
              type="button"
              onClick={() => {
                setShowMenuModal(false);
                onNavigate('cadastros');
              }}
              className="flex w-full items-center justify-between rounded-[28px] bg-white px-6 py-5 text-left text-[#414141] shadow-sm"
            >
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#941c1c]">Cadastros</p>
                <p className="mt-1 text-[13px] font-medium text-[#414141]/55">
                  {isGlobalAdmin ? 'Gerenciar o sistema completo' : 'Gerenciar dados do seu terreiro'}
                </p>
              </div>
              <Settings2 className="h-5 w-5 text-[#941c1c]" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setShowMenuModal(false);
              logout();
            }}
            className="flex w-full items-center justify-between rounded-[28px] bg-[#941c1c] px-6 py-5 text-left text-white shadow-xl shadow-[#941c1c]/20"
          >
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em]">Sair</p>
              <p className="mt-1 text-[13px] font-medium text-white/70">Encerrar a sessão atual</p>
            </div>
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </SheetModal>
    </motion.div>
  );
}
