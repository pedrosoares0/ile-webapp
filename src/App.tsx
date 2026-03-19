import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HomeView from './views/HomeView'
import EventsView from './views/EventsView'
import PontosView from './views/PontosView'
import DivindadesView from './views/DivindadesView'
import BurgerMenu from './components/BurgerMenu'
import BottomNavigation from './components/BottomNavigation'

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'pontos' | 'eventos' | 'divindades' | 'financeiro' | 'avisos'>('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleNavigate = (view: 'home' | 'pontos' | 'eventos' | 'divindades' | 'financeiro' | 'avisos') => {
    if (['home', 'pontos', 'eventos', 'divindades', 'financeiro', 'avisos'].includes(view)) {
      setCurrentView(view)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-[430px] bg-[#fef7e7] pb-32 relative shadow-2xl overflow-x-hidden font-inter text-[#414141]">
      <BurgerMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      <motion.div 
        animate={isMenuOpen ? { filter: 'blur(8px)', scale: 0.98 } : { filter: 'blur(0px)', scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full min-h-screen flex flex-col"
      >
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            <HomeView key="home" onNavigate={setCurrentView} onToggleMenu={() => setIsMenuOpen(true)} />
          ) : currentView === 'eventos' ? (
            <EventsView key="eventos" onToggleMenu={() => setIsMenuOpen(true)} />
          ) : currentView === 'pontos' ? (
            <PontosView key="pontos" onToggleMenu={() => setIsMenuOpen(true)} />
          ) : currentView === 'divindades' ? (
            <DivindadesView 
              key="divindades" 
              onToggleMenu={() => setIsMenuOpen(true)} 
              onBack={() => setCurrentView('home')} 
              onModalToggle={setIsModalOpen}
            />
          ) : (
            <motion.div 
              key="coming-soon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="h-24 w-24 rounded-full bg-[#941c1c]/10 flex items-center justify-center mb-6">
                <img src={`/img/${currentView === 'financeiro' ? 'financeiro' : 'avisos'}-icon-navbar.webp`} className="h-12 w-12 opacity-40 grayscale" alt="" />
              </div>
              <h2 className="text-2xl font-bold text-[#941c1c] mb-2 uppercase tracking-tight">Em breve</h2>
              <p className="text-sm opacity-60">A seção de {currentView === 'financeiro' ? 'Financeiro' : 'Avisos'} está sendo preparada com muito carinho.</p>
              <button 
                onClick={() => setCurrentView('home')}
                className="mt-8 px-6 py-3 bg-[#941c1c] text-white rounded-full font-bold text-sm shadow-lg shadow-[#941c1c]/20"
              >
                Voltar para o Início
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Global Bottom Navigation */}
      <BottomNavigation 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        isVisible={!isMenuOpen && !isModalOpen}
      />
    </div>
  )
}
