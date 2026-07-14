import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HomeView from './views/HomeView'
import EventsView from './views/EventsView'
import DivindadesView from './views/DivindadesView'
import LoginView from './views/LoginView'
import CadastrosView from './views/CadastrosView'
import HubView from './views/HubView'
import PontosView from './views/PontosView'
import OracaoView from './views/OracaoView'
import AvisosView from './views/AvisosView'
import BurgerMenu from './components/BurgerMenu'
import { ViewType } from './types'
import { useAuth } from './context/AuthContext'
import { useAppData } from './context/AppDataContext'

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const { currentAccount, isLoading } = useAppData()

  const isHubUser = currentAccount?.role === 'terreiro_user' && !currentAccount?.terreiroId;

  // Ensure user is logged out if account data is missing (safety check from feat branch)
  // Uses a timeout to avoid race conditions between AuthContext and AppDataContext
  useEffect(() => {
    if (!isLoading && isAuthenticated && !currentAccount) {
      const timer = setTimeout(() => {
        logout()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentAccount, isAuthenticated, logout, isLoading])

  // Reset view to home when logging in or out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('home')
    }
  }, [isAuthenticated])

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view)
  }

  if (!isAuthenticated) {
    return <LoginView />
  }

  return (
    <div className={`mx-auto max-w-[430px] bg-[#FFFFFF] relative shadow-2xl overflow-x-hidden font-inter text-[#414141] transition-all duration-300 ${
      currentView === 'home' ? 'h-[100dvh] overflow-hidden' : 'min-h-screen pb-0'
    }`}>
      <BurgerMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        currentView={currentView}
        onNavigate={handleNavigate}
      />


      <motion.div 
        animate={isMenuOpen ? { filter: 'blur(8px)', scale: 0.98 } : { filter: 'blur(0px)', scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full flex flex-col ${currentView === 'home' ? 'h-full' : 'min-h-screen'}`}
      >
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            isHubUser ? (
              <HubView key="hub" onToggleMenu={() => setIsMenuOpen(true)} />
            ) : (
              <HomeView key="home" onNavigate={setCurrentView} onToggleMenu={() => setIsMenuOpen(true)} />
            )
          ) : currentView === 'eventos' ? (
            <EventsView key="eventos" onToggleMenu={() => setIsMenuOpen(true)} onBack={() => setCurrentView('home')} />
          ) : currentView === 'divindades' ? (
            <DivindadesView 
              key="divindades" 
              onToggleMenu={() => setIsMenuOpen(true)} 
              onBack={() => setCurrentView('home')} 
            />
          ) : currentView === 'cadastros' ? (
            <CadastrosView key="cadastros" onBack={() => setCurrentView('home')} />
          ) : currentView === 'pontos' ? (
            <PontosView key="pontos" onBack={() => setCurrentView('home')} />
          ) : currentView === 'oracao' ? (
            <OracaoView key="oracao" onBack={() => setCurrentView('home')} />
          ) : currentView === 'avisos' ? (
            <AvisosView key="avisos" onBack={() => setCurrentView('home')} />
          ) : (
            <motion.div 
              key="coming-soon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="h-24 w-24 rounded-full bg-[#1565c0]/10 flex items-center justify-center mb-6">
                <img src={`/img/${currentView === 'financeiro' ? 'financeiro' : 'avisos'}-icon-navbar.webp`} className="h-12 w-12 opacity-40 grayscale" alt="" />
              </div>
              <h2 className="text-2xl font-bold text-[#1565c0] mb-2 uppercase tracking-tight">Em breve</h2>
              <p className="text-sm opacity-60">A seção de {currentView === 'financeiro' ? 'Financeiro' : 'Avisos'} está sendo preparada com muito carinho.</p>
              <button 
                onClick={() => setCurrentView('home')}
                className="mt-8 px-6 py-3 bg-[#1565c0] text-white rounded-full font-bold text-sm shadow-lg shadow-[#1565c0]/20"
              >
                Voltar para o Início
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
