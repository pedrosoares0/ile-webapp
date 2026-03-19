import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useAppData } from './context/AppDataContext';
import HomeView from './views/HomeView';
import EventsView from './views/EventsView';
import PontosView from './views/PontosView';
import CadastrosView from './views/CadastrosView';
import LoginView from './views/LoginView';
import { AppView } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const { isAuthenticated, logout } = useAuth();
  const { currentAccount, canAccessCadastros } = useAppData();

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('home');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !currentAccount) {
      logout();
    }
  }, [currentAccount, isAuthenticated, logout]);

  useEffect(() => {
    if (currentView === 'cadastros' && !canAccessCadastros) {
      setCurrentView('home');
    }
  }, [canAccessCadastros, currentView]);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-[430px] overflow-x-hidden bg-[#fef7e7] pb-32 font-inter text-[#414141] shadow-2xl">
      <AnimatePresence mode="wait" initial={false}>
        {currentView === 'home' ? (
          <HomeView key="home" onNavigate={setCurrentView} />
        ) : currentView === 'eventos' ? (
          <EventsView key="eventos" />
        ) : currentView === 'pontos' ? (
          <PontosView key="pontos" />
        ) : (
          <CadastrosView key="cadastros" />
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 left-1/2 z-50 w-[90%] -translate-x-1/2">
        <div className="flex h-[68px] w-full items-center justify-around rounded-full border border-white/30 bg-white/40 px-2 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          {canAccessCadastros ? (
            <button
              type="button"
              onClick={() => setCurrentView('cadastros')}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                currentView === 'cadastros' ? 'bg-[#941c1c] shadow-lg shadow-[#941c1c]/30' : ''
              }`}
              aria-label="Cadastros"
            >
              <img
                src="/img/financeiro-icon-navbar.webp"
                alt="Cadastros"
                className={`h-6 w-6 object-contain transition-all duration-300 ${
                  currentView === 'cadastros' ? 'brightness-0 invert' : 'opacity-30 grayscale brightness-75'
                }`}
              />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setCurrentView('pontos')}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
              currentView === 'pontos' ? 'bg-[#941c1c] shadow-lg shadow-[#941c1c]/30' : ''
            }`}
            aria-label="Pontos"
          >
            <img
              src="/img/pontos - bottomnavigation.webp"
              alt="Pontos"
              className={`h-6 w-6 object-contain transition-all duration-300 ${
                currentView === 'pontos' ? 'brightness-0 invert' : 'opacity-30 grayscale brightness-75'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('home')}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
              currentView === 'home' ? 'bg-[#941c1c] shadow-lg shadow-[#941c1c]/30' : ''
            }`}
            aria-label="Home"
          >
            <img
              src="/img/home- bottomnavigation.webp"
              alt="Home"
              className={`h-6 w-6 object-contain transition-all duration-300 ${
                currentView === 'home' ? 'brightness-0 invert' : 'opacity-30 grayscale brightness-75'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('eventos')}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
              currentView === 'eventos' ? 'bg-[#941c1c] shadow-lg shadow-[#941c1c]/30' : ''
            }`}
            aria-label="Eventos"
          >
            <img
              src="/img/eventos - bottomnavigation.webp"
              alt="Eventos"
              className={`h-6 w-6 object-contain transition-all duration-300 ${
                currentView === 'eventos' ? 'brightness-0 invert' : 'opacity-30 grayscale brightness-75'
              }`}
            />
          </button>

          {canAccessCadastros ? (
            <button
              type="button"
              onClick={() => setCurrentView('cadastros')}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                currentView === 'cadastros' ? 'bg-[#941c1c] shadow-lg shadow-[#941c1c]/30' : ''
              }`}
              aria-label="Administração"
            >
              <img
                src="/img/avisos-bottomnavigation.webp"
                alt="Administração"
                className={`h-6 w-6 object-contain transition-all duration-300 ${
                  currentView === 'cadastros' ? 'brightness-0 invert' : 'opacity-30 grayscale brightness-75'
                }`}
              />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
