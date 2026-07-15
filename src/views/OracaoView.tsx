import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Compass,
  Shield,
  Users,
  Activity,
  Infinity as InfinityIcon,
  User,
  AlignLeft,
  Calendar
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { parseLocalDate } from '../lib/date';
import { PrayerRequest } from '../types';

interface CategoryConfig {
  id: PrayerRequest['type'] | 'TODOS';
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeTextColor: string;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  { 
    id: 'TODOS', 
    label: 'Todos', 
    icon: InfinityIcon, 
    color: 'text-zinc-650', 
    badgeBg: 'bg-zinc-100', 
    badgeBorder: 'border-zinc-200/60',
    badgeTextColor: 'text-zinc-600'
  },
  { 
    id: 'Saúde e cura', 
    label: 'Saúde e cura', 
    icon: Activity, 
    color: 'text-emerald-700', 
    badgeBg: 'bg-emerald-50/70', 
    badgeBorder: 'border-emerald-600/10',
    badgeTextColor: 'text-emerald-800'
  },
  { 
    id: 'Abertura de caminhos', 
    label: 'Abertura de caminhos', 
    icon: Compass, 
    color: 'text-sky-700', 
    badgeBg: 'bg-sky-50/70', 
    badgeBorder: 'border-sky-600/10',
    badgeTextColor: 'text-sky-800'
  },
  { 
    id: 'Defesa e descarrego', 
    label: 'Defesa e descarrego', 
    icon: Shield, 
    color: 'text-rose-700', 
    badgeBg: 'bg-rose-50/70', 
    badgeBorder: 'border-rose-600/10',
    badgeTextColor: 'text-rose-800'
  },
  { 
    id: 'Família e amor', 
    label: 'Família e amor', 
    icon: Users, 
    color: 'text-pink-700', 
    badgeBg: 'bg-pink-50/70', 
    badgeBorder: 'border-pink-600/10',
    badgeTextColor: 'text-pink-850'
  },
  { 
    id: 'Outros', 
    label: 'Outros', 
    icon: Sparkles, 
    color: 'text-amber-700', 
    badgeBg: 'bg-amber-50/70', 
    badgeBorder: 'border-amber-600/10',
    badgeTextColor: 'text-amber-800'
  }
];

export default function OracaoView({ onBack }: { onBack: () => void }) {
  const { prayers, savePrayer, answerPrayer, currentAccount, isTerreiroAdmin } = useAppData();
  const [showAddForm, setShowAddForm] = useState(false);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<PrayerRequest['type'] | 'TODOS'>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<'TODOS' | 'PENDENTES' | 'ATENDIDOS'>('TODOS');

  // Form states
  const [formName, setFormName] = useState(currentAccount?.nome || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formType, setFormType] = useState<PrayerRequest['type']>('Saúde e cura');
  const [formContent, setFormContent] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create new request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const newRequest: PrayerRequest = {
      id: `pr_${Date.now()}`,
      name: isAnonymous ? 'Anônimo' : (formName.trim() || 'Membro do Terreiro'),
      type: formType,
      content: formContent.trim(),
      answered: false,
      answeredAt: null,
      accountId: currentAccount?.id || '',
      terreiroId: currentAccount?.terreiroId || '',
      createdAt: new Date().toISOString()
    };

    // Wait 1.3 seconds for the color recharge animation
    await new Promise((resolve) => setTimeout(resolve, 1300));

    try {
      await savePrayer(newRequest);
      
      // Reset Form
      setFormName(currentAccount?.nome || '');
      setIsAnonymous(false);
      setFormType('Saúde e cura');
      setFormContent('');
      setShowAddForm(false);

      // Show Toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error('Error creating prayer request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm answering a request (Admin/Pai action)
  const handleConfirmAnswer = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja confirmar o acendimento de uma vela para este pedido?')) {
      try {
        await answerPrayer(id);
      } catch (err) {
        console.error('Error answering prayer request:', err);
      }
    }
  };

  // Filtering requests
  const filteredPrayers = useMemo(() => {
    return prayers.filter(pr => {
      // 1. Filter by category
      const matchesCategory = selectedCategory === 'TODOS' || pr.type === selectedCategory;
      
      // 2. Filter by status
      let matchesStatus = true;
      if (selectedStatus === 'PENDENTES') {
        matchesStatus = !pr.answered;
      } else if (selectedStatus === 'ATENDIDOS') {
        matchesStatus = pr.answered;
      }

      return matchesCategory && matchesStatus;
    });
  }, [prayers, selectedCategory, selectedStatus]);

  // Selected icon for input display
  const SelectIcon = CATEGORY_CONFIGS.find(c => c.id === formType)?.icon || Sparkles;

  return (
    <div className="min-h-[100dvh] bg-[#F9F7F3] px-6 safe-pt-view pb-36 relative overflow-x-hidden z-10 font-sans">
      
      {/* Background Soft Shadows / Lights */}
      <div className="absolute inset-x-0 top-0 h-[40dvh] pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute w-[80vw] h-[80vw] rounded-full bg-[#f3e8ff]/25 blur-[100px] -top-[30%] -left-[10%]" />
        <div className="absolute w-[80vw] h-[80vw] rounded-full bg-[#fef3c7]/25 blur-[100px] -top-[30%] -right-[10%]" />
      </div>

      {/* Header Row */}
      <div className="relative flex items-center justify-between h-14 w-full z-10 mb-8">
        <button 
          onClick={onBack}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(139,92,26,0.06),_0_1px_2px_rgba(0,0,0,0.02)] border border-amber-900/5 text-zinc-800 active:scale-90 hover:scale-105 transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-amber-900/80" strokeWidth={2.2} />
        </button>
        
        <div className="w-full text-center px-14">
          <h1 className="text-2xl font-black text-amber-950 leading-none font-behind-it tracking-tight">Pedidos de Oração</h1>
          <p className="text-[9.5px] font-black text-amber-700/60 uppercase tracking-[0.25em] mt-2.5 leading-none">
            {isTerreiroAdmin ? 'Corrente do Terreiro' : 'Suas Conexões de Fé'}
          </p>
        </div>
      </div>

      {/* Hero Quote Block */}
      <div className="relative z-10 p-6 rounded-[28px] bg-white border border-amber-900/10 shadow-[0_12px_30px_rgba(139,92,26,0.03)] mb-8 flex gap-4 items-start">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-800 shrink-0">
          <Flame className="h-5.5 w-5.5 text-amber-700 fill-amber-600 animate-pulse" />
        </div>
        <div>
          <h4 className="text-[13px] font-black text-amber-950 tracking-tight leading-none mb-1.5 font-behind-it">
            Firme sua Corrente
          </h4>
          <p className="text-[12px] leading-relaxed text-zinc-500 font-medium">
            {isTerreiroAdmin 
              ? 'Confirme aos filhos o acendimento das velas para as orações enviadas. Você tem visão total dos pedidos da casa.' 
              : 'Registre seus pedidos de oração. Assim que o Pai ler e acender a vela no altar, você receberá a confirmação aqui.'}
          </p>
        </div>
      </div>

      {/* Status Segment Control (Pai/Admin only) */}
      {isTerreiroAdmin && (
        <div className="relative z-10 flex gap-1 p-1 bg-[#F1EDE4] rounded-2xl mb-8 shadow-inner max-w-full border border-amber-900/5">
          {(['TODOS', 'PENDENTES', 'ATENDIDOS'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-98 ${selectedStatus === status
                ? 'bg-white text-amber-900 shadow-sm border border-amber-900/5'
                : 'text-amber-800/40 hover:text-amber-800/60 bg-transparent'
                }`}
            >
              {status === 'TODOS' ? 'Todos' : status === 'PENDENTES' ? 'Pendentes' : 'Atendidos'}
            </button>
          ))}
        </div>
      )}

      {/* Category Pills Selector */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-4 mb-8 relative z-10 -mx-6 px-6 select-none scroll-smooth">
        {CATEGORY_CONFIGS.map((catConfig) => {
          const Icon = catConfig.icon;
          const isActive = selectedCategory === catConfig.id;
          return (
            <button
              key={catConfig.id}
              onClick={() => setSelectedCategory(catConfig.id)}
              className="relative px-4.5 py-3 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 flex items-center gap-2 border border-amber-900/5 shadow-2xs select-none outline-hidden bg-white/70"
              style={{
                color: isActive ? '#fff' : '#6b503d',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-oracao-category-repaired"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 shadow-md shadow-amber-900/15"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`relative z-10 h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-amber-950/40'}`} />
              <span className="relative z-10 font-bold">{catConfig.label}</span>
            </button>
          );
        })}
      </div>

      {/* Requests List (Tactile Cards / Envelopes style) */}
      <div className="relative z-10 space-y-6">
        {filteredPrayers.length > 0 ? (
          filteredPrayers.map((pr) => {
            const catConfig = CATEGORY_CONFIGS.find(c => c.id === pr.type) || CATEGORY_CONFIGS[5];
            const CatIcon = catConfig.icon;

            return (
              <motion.div
                key={pr.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[28px] bg-white border border-amber-900/10 shadow-[0_12px_28px_rgba(139,92,26,0.04)] overflow-hidden p-6 hover:shadow-[0_16px_36px_rgba(139,92,26,0.06)] hover:border-amber-900/15 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Physical Tactile Wax Seal Stamp at the top-right corner */}
                {pr.answered && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1.05, rotate: 12 }}
                    className="absolute -right-1 -top-1 pointer-events-none select-none z-20 drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                  >
                    <div className="w-13 h-13 rounded-full bg-gradient-to-br from-amber-600 via-red-600 to-red-800 flex items-center justify-center border-2 border-red-950/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),_0_2px_5px_rgba(0,0,0,0.2)] relative">
                      {/* Wax seal inner shape */}
                      <div className="absolute inset-0.5 rounded-full border border-dashed border-white/20 opacity-40" />
                      <Flame className="h-5.5 w-5.5 text-amber-200 fill-amber-300 animate-pulse" />
                    </div>
                  </motion.div>
                )}

                <div>
                  {/* Card Header Row */}
                  <div className="flex items-center justify-between mb-5 pr-8">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9.5px] font-black uppercase tracking-wider leading-none ${catConfig.badgeBg} ${catConfig.badgeTextColor} border ${catConfig.badgeBorder} shadow-3xs`}>
                      <CatIcon className="h-3 w-3" />
                      {pr.type}
                    </span>
                    
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-semibold">
                      <Calendar className="h-3 w-3 text-zinc-350" />
                      <span>{parseLocalDate(pr.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>

                  {/* Letter/Parchment Text Body */}
                  <div className="bg-[#FCFAF7] border border-amber-900/5 rounded-2xl p-4.5 mb-5 relative min-h-[70px] flex items-center shadow-3xs">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-700/10 rounded-l-2xl" />
                    <p className="text-[14.5px] leading-relaxed text-zinc-700 font-medium font-serif italic text-left w-full pl-2 pr-2">
                      "{pr.content}"
                    </p>
                  </div>
                </div>

                {/* Card Footer Status / Confirmation */}
                <div className="border-t border-amber-900/5 pt-4 flex items-center justify-between">
                  {/* Author Name */}
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#FAF5EE] border border-amber-950/10 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-amber-900/60" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[8px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Enviado por</span>
                      <span className={`block text-[12px] font-bold tracking-tight mt-0.5 leading-none ${pr.name === 'Anônimo' ? 'text-zinc-400 font-medium italic' : 'text-zinc-700'}`}>
                        {pr.name}
                      </span>
                    </div>
                  </div>

                  {/* Action or Answer Banner */}
                  {pr.answered ? (
                    <div className="bg-[#FAF5ED] border border-amber-900/10 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 select-none">
                      <Sparkles className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
                      <span className="text-[9.5px] font-black text-amber-900 uppercase tracking-wider leading-none">
                        Vela Confirmada
                      </span>
                    </div>
                  ) : (
                    /* Father action button or child pending state */
                    isTerreiroAdmin ? (
                      <motion.button
                        onClick={(e) => handleConfirmAnswer(pr.id, e)}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-md shadow-amber-900/15 border border-amber-800/10 hover:brightness-105 active:scale-95"
                      >
                        Confirmar Vela
                      </motion.button>
                    ) : (
                      <div className="bg-zinc-50 border border-zinc-150 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 select-none">
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-pulse" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider leading-none">
                          Aguardando...
                        </span>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          /* High-end Styled Empty State Card */
          <div className="rounded-[36px] bg-white border border-amber-900/10 py-16 px-6 text-center shadow-[0_12px_32px_rgba(139,92,26,0.03)] flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-amber-500/5 border border-amber-500/10 flex items-center justify-center mb-5 relative">
              <Flame className="h-7 w-7 text-zinc-300 fill-transparent" />
              <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/20 animate-[spin_20s_linear_infinite]" />
            </div>
            <h4 className="text-base font-extrabold text-zinc-800 font-behind-it">Nenhuma Intenção</h4>
            <p className="text-xs text-zinc-400 font-medium mt-2 px-6 leading-relaxed max-w-xs">
              {selectedCategory !== 'TODOS' 
                ? `Ainda não existem pedidos cadastrados na categoria "${selectedCategory}".` 
                : 'Esta corrente está calma. Toque no botão para firmar sua primeira intenção de oração.'}
            </p>
            {!isTerreiroAdmin && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-6 px-5 py-2.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/15 active:scale-95 transition-transform"
              >
                Fazer Meu Primeiro Pedido
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) (Filho/Member only) */}
      {!isTerreiroAdmin && (
        <motion.button
          onClick={() => setShowAddForm(true)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed right-6 bottom-28 h-15 w-15 rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-center shadow-lg shadow-amber-600/30 border border-white/10 active:scale-95 z-[60]"
        >
          <Plus className="h-6.5 w-6.5" strokeWidth={2.8} />
        </motion.button>
      )}

      {/* Fullscreen Input Drawer (Portaled to body to completely overlay LiquidNavbar) */}
      {createPortal(
        <AnimatePresence>
          {showAddForm && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
              {/* Scrim */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddForm(false)}
                className="absolute inset-0 bg-black/65 backdrop-blur-xs pointer-events-auto"
              />
              
              {/* Modal Body */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 260 }}
                className="relative w-full max-w-[430px] z-[110] max-h-[90vh] bg-white rounded-t-[40px] border-t border-zinc-200/40 p-6 pb-8 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.15)] overflow-y-auto no-scrollbar pointer-events-auto"
              >
                <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-6 shrink-0" />

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 tracking-tight font-behind-it">Firmar Pedido de Oração</h3>
                    <p className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-widest mt-1">Emane sua fé na Corrente</p>
                  </div>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 active:scale-90 transition-all"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <form onSubmit={handleCreateRequest} className="space-y-5 flex-1 pb-6">
                  {/* Author Name */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pl-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nome do Solicitante</label>
                      <label className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded border-zinc-350 text-amber-600 focus:ring-amber-500 h-4 w-4 transition-all" 
                        />
                        <span className="text-[11.5px] font-bold text-zinc-500">Enviar como Anônimo</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3.5 bg-[#FAF8F5] border border-amber-900/10 focus-within:border-amber-600/35 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(217,119,6,0.03)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                      <User className="h-5 w-5 text-amber-950/30 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="block text-[8px] font-black text-amber-700/60 uppercase tracking-widest leading-none mb-1">Seu Nome</span>
                        <input
                          type="text"
                          disabled={isAnonymous}
                          placeholder={isAnonymous ? 'Seu nome ficará oculto' : 'Digite seu nome completo'}
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-800 font-bold placeholder-zinc-350 focus:ring-0 focus:outline-hidden disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Request Type / Category Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Intenção / Linha de Trabalho</label>
                    <div className="flex items-center gap-3.5 bg-[#FAF8F5] border border-amber-900/10 focus-within:border-amber-600/35 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(217,119,6,0.03)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                      <SelectIcon className="h-5 w-5 text-amber-950/30 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="block text-[8px] font-black text-amber-700/60 uppercase tracking-widest leading-none mb-1">Categoria do Pedido</span>
                        <select
                          value={formType}
                          onChange={(e) => setFormType(e.target.value as PrayerRequest['type'])}
                          className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-800 font-bold focus:ring-0 focus:outline-hidden"
                        >
                          {CATEGORY_CONFIGS.filter(c => c.id !== 'TODOS').map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Description text area */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Seu Pedido ou Intenção</label>
                    <div className="flex items-start gap-3.5 bg-[#FAF8F5] border border-amber-900/10 focus-within:border-amber-600/35 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(217,119,6,0.03)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                      <AlignLeft className="h-5 w-5 text-amber-950/30 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="block text-[8px] font-black text-amber-700/60 uppercase tracking-widest leading-none mb-1">Detalhes do Pedido</span>
                        <textarea
                          rows={4}
                          required
                          placeholder="Escreva sua intenção respeitosamente. O Pai lerá no altar..."
                          value={formContent}
                          onChange={(e) => setFormContent(e.target.value)}
                          className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-700 font-semibold placeholder-zinc-350 focus:ring-0 focus:outline-hidden resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progressive Submitting/Recharging color Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative w-full py-4 rounded-2xl text-sm font-bold text-white active:scale-[0.98] transition-transform duration-150 ease-out flex items-center justify-center gap-2 overflow-hidden bg-zinc-900 shadow-lg shadow-zinc-950/15 cursor-pointer"
                    >
                      {/* Animate color loading from left to right when submitting */}
                      {isSubmitting ? (
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.2, ease: 'easeInOut' }}
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 z-0"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 opacity-95 z-0" />
                      )}

                      <Sparkles className="relative z-10 h-4.5 w-4.5 animate-pulse" />
                      <span className="relative z-10">
                        {isSubmitting ? 'Enviando...' : 'Enviar pedido de oração'}
                      </span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 inset-x-6 z-50 p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl flex items-center gap-3 text-white"
          >
            <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <h5 className="text-[12.5px] font-black leading-none">Pedido de Oração Enviado!</h5>
              <p className="text-[10px] text-zinc-400 font-medium mt-1">Sua intenção de fé foi firmada com sucesso.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
