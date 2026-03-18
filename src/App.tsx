import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HomeView from './views/HomeView'
import EventsView from './views/EventsView'
import PontosView from './views/PontosView'

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'pontos' | 'eventos'>('home')

  return (
    <div className="mx-auto min-h-screen max-w-[430px] bg-[#fef7e7] pb-32 relative shadow-2xl overflow-x-hidden font-inter text-[#414141]">
      <AnimatePresence mode="wait">
        {currentView === 'home' ? (
          <HomeView key="home" onNavigate={setCurrentView} />
        ) : currentView === 'eventos' ? (
          <EventsView key="eventos" />
        ) : (
          <PontosView key="pontos" />
        )}
      </AnimatePresence>

      {/* Global Bottom Navigation */}
      <div className="fixed bottom-8 left-1/2 z-50 w-[90%] -translate-x-1/2">
        <div className="flex h-[68px] w-full items-center justify-between rounded-full bg-white/40 px-2 backdrop-blur-2xl border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          {/* Financeiro */}
          <button className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300">
            <img 
              src="/img/financeiro-icon-navbar.webp" 
              alt="Financeiro" 
              className="h-6 w-6 opacity-30 grayscale brightness-75 object-contain" 
            />
          </button>
          
          {/* Pontos */}
          <button 
            onClick={() => setCurrentView('pontos')}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
              currentView === 'pontos' ? 'bg-[#941c1c] shadow-lg shadow-[#941c1c]/30' : ''
            }`}
          >
            <img 
              src="/img/pontos - bottomnavigation.webp" 
              alt="Pontos" 
              className={`h-6 w-6 transition-all duration-300 object-contain ${currentView === 'pontos' ? 'brightness-0 invert' : 'opacity-30 grayscale brightness-75'}`} 
            />
          </button>

          {/* Home */}
          <button 
            onClick={() => setCurrentView('home')}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
              currentView === 'home' ? 'bg-[#941c1c] shadow-lg shadow-[#941c1c]/30' : ''
            }`}
          >
            <img 
              src="/img/home- bottomnavigation.webp" 
              alt="Home" 
              className={`h-6 w-6 transition-all duration-300 object-contain ${currentView === 'home' ? 'brightness-0 invert' : 'opacity-30 grayscale brightness-75'}`} 
            />
          </button>

          {/* Eventos */}
          <button 
            onClick={() => setCurrentView('eventos')}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
              currentView === 'eventos' ? 'bg-[#941c1c] shadow-lg shadow-[#941c1c]/30' : ''
            }`}
          >
            <img 
              src="/img/eventos - bottomnavigation.webp" 
              alt="Eventos" 
              className={`h-6 w-6 transition-all duration-300 object-contain ${currentView === 'eventos' ? 'brightness-0 invert' : 'opacity-30 grayscale brightness-75'}`} 
            />
          </button>

          {/* Avisos */}
          <button className="flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300">
            <img 
              src="/img/avisos-bottomnavigation.webp" 
              alt="Avisos" 
              className="h-6 w-6 opacity-30 grayscale brightness-75 object-contain" 
            />
          </button>
        </div>
      </div>
    </div>
  )
}
