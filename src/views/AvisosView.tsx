import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, X, Bell, Megaphone, Calendar, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'Importante' | 'Programação' | 'Geral';
  date: string;
  createdAt: string;
  terreiroId: string;
}

const SEED_NOTICES: Notice[] = [
  {
    id: 'not_1',
    title: 'Gira Extraordinária de Pretos Velhos',
    content: 'Informamos a todos os membros e consulentes que teremos uma gira festiva extraordinária de Pretos Velhos no próximo sábado. Tragam flores e velas brancas se desejarem firmar intenções.',
    category: 'Programação',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    terreiroId: 'terreiro_t7ca'
  },
  {
    id: 'not_2',
    title: 'Uso obrigatório de roupas brancas',
    content: 'Relembramos a importância do respeito às vestimentas rituais. O uso de trajes completamente brancos e adequados é obrigatório para adentrar a corrente de trabalhos.',
    category: 'Importante',
    date: new Date().toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    terreiroId: 'terreiro_t7ca'
  },
  {
    id: 'not_3',
    title: 'Manutenção do Terreiro no Domingo',
    content: 'Contamos com a colaboração de todos os filhos da casa no mutirão de limpeza e pintura das salas de atendimento que ocorrerá neste domingo a partir das 9h.',
    category: 'Geral',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    terreiroId: 'terreiro_t7ca'
  }
];

export default function AvisosView({ onBack }: { onBack: () => void }) {
  const { currentAccount, isTerreiroAdmin } = useAppData();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<Notice['category']>('Geral');
  const [formDate, setFormDate] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Load notices from LocalStorage or fallback to seeds
  useEffect(() => {
    const key = `ile_notices_${currentAccount?.terreiroId || 'default'}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setNotices(JSON.parse(stored));
      } catch (e) {
        setNotices(SEED_NOTICES);
      }
    } else {
      setNotices(SEED_NOTICES);
      localStorage.setItem(key, JSON.stringify(SEED_NOTICES));
    }
  }, [currentAccount]);

  const saveToStorage = (updatedNotices: Notice[]) => {
    const key = `ile_notices_${currentAccount?.terreiroId || 'default'}`;
    localStorage.setItem(key, JSON.stringify(updatedNotices));
    setNotices(updatedNotices);
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const newNotice: Notice = {
      id: `not_${Date.now()}`,
      title: formTitle.trim(),
      content: formContent.trim(),
      category: formCategory,
      date: formDate ? new Date(formDate).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      terreiroId: currentAccount?.terreiroId || 'default'
    };

    const updated = [newNotice, ...notices];
    saveToStorage(updated);

    // Reset Form
    setFormTitle('');
    setFormContent('');
    setFormCategory('Geral');
    setFormDate('');
    setShowAddForm(false);

    // Show Toast
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleDeleteNotice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza de que deseja excluir este aviso permanentemente?')) {
      const updated = notices.filter(n => n.id !== id);
      saveToStorage(updated);
    }
  };

  // Filter notices for current terreiro
  const filteredNotices = useMemo(() => {
    const tId = currentAccount?.terreiroId || 'default';
    return notices.filter(n => n.terreiroId === tId);
  }, [notices, currentAccount]);

  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-24 relative overflow-x-hidden z-10">
      
      {/* Aurora Backdrop Effect */}
      <div 
        className="absolute inset-x-0 top-0 h-[35dvh] pointer-events-none overflow-hidden z-0 select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)'
        }}
      >
        <div className="absolute w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-rose-500/20 to-red-700/10 blur-[60px] -top-[18%] -left-[10%] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute w-[80vw] h-[80vw] rounded-full bg-gradient-to-tr from-pink-400/35 to-rose-600/15 blur-[70px] -top-[20%] -right-[15%] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between h-14 w-full z-10 mb-8">
        <button 
          onClick={onBack}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF8F5] shadow-xs border border-black/[0.03] text-[#414141] active:scale-95 transition-transform"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
        
        <div className="w-full text-center">
          <h1 className="text-3xl font-bold text-rose-700 leading-none font-behind-it">Mural de Avisos</h1>
          <p className="text-[10px] font-bold text-[#414141]/40 uppercase tracking-[0.2em] mt-1.5">
            Notificações e Comunicados do Terreiro
          </p>
        </div>
      </div>

      {/* Notice Feed List */}
      <div className="relative z-10 space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const categoryConfig = {
              Importante: {
                bg: 'bg-rose-50 border-rose-100 text-rose-800',
                icon: ShieldAlert,
                label: 'Atenção'
              },
              Programação: {
                bg: 'bg-blue-50 border-blue-100 text-blue-800',
                icon: Calendar,
                label: 'Programação'
              },
              Geral: {
                bg: 'bg-zinc-50 border-zinc-100 text-zinc-700',
                icon: Megaphone,
                label: 'Geral'
              }
            }[notice.category];

            const Icon = categoryConfig.icon;

            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-[28px] bg-white border border-zinc-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:border-zinc-200 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[8.5px] font-black uppercase tracking-widest leading-none border ${categoryConfig.bg}`}>
                        <Icon className="h-2.5 w-2.5 shrink-0" />
                        <span>{categoryConfig.label}</span>
                      </span>
                      <span className="text-[11px] text-zinc-400 font-semibold tracking-tight">
                        {new Date(notice.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {isTerreiroAdmin && (
                      <button
                        onClick={(e) => handleDeleteNotice(notice.id, e)}
                        className="text-zinc-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors active:scale-90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-zinc-800 tracking-tight leading-snug">
                    {notice.title}
                  </h3>
                  
                  <p className="text-[13px] leading-relaxed text-zinc-600 font-medium mt-2">
                    {notice.content}
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-[32px] bg-zinc-50 border border-zinc-100 py-12 px-6 text-center shadow-xs">
            <Bell className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-zinc-800">Sem avisos no momento</h4>
            <p className="text-xs text-zinc-400 font-medium mt-1 px-4 leading-relaxed">
              O mural está limpo. Novos comunicados serão exibidos aqui assim que postados pela administração.
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Notice Button */}
      {isTerreiroAdmin && (
        <motion.button
          onClick={() => setShowAddForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed right-6 bottom-24 h-14 w-14 rounded-full bg-rose-700 text-white flex items-center justify-center shadow-xl shadow-rose-700/20 active:scale-95 transition-all z-40 border border-rose-800/10"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Fullscreen Input Drawer */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 240 }}
              className="fixed inset-x-0 bottom-0 z-[110] max-h-[85vh] bg-white rounded-t-[40px] border-t border-zinc-100 p-6 flex flex-col shadow-2xl overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-6 shrink-0" />

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-800 font-behind-it">Publicar Comunicado</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 active:scale-90"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateNotice} className="space-y-5 flex-1 pb-10">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Título do Aviso</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mutirão de Limpeza Geral"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-rose-600/30 focus:ring-0 focus:outline-hidden transition-all duration-300"
                  />
                </div>

                {/* Category selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Categoria / Prioridade</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Notice['category'])}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-rose-600/30 focus:ring-0 focus:outline-hidden transition-all duration-300"
                  >
                    <option value="Geral">Geral (Informativo)</option>
                    <option value="Programação">Programação (Datas e giras)</option>
                    <option value="Importante">Importante (Atenção obrigatória)</option>
                  </select>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Conteúdo do Comunicado</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Descreva de forma completa as informações do aviso..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-rose-600/30 focus:ring-0 focus:outline-hidden transition-all duration-300 resize-none"
                  />
                </div>

                {/* Target Date */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Data Relacionada (Opcional)</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-rose-600/30 focus:ring-0 focus:outline-hidden transition-all duration-300"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 active:scale-98 transition-all shadow-lg shadow-rose-700/15 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4.5 w-4.5" />
                    <span>Publicar Aviso</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 inset-x-6 z-50 p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl flex items-center gap-3 text-white"
          >
            <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0" />
            <div className="min-w-0">
              <h5 className="text-[12.5px] font-black leading-none">Aviso Publicado!</h5>
              <p className="text-[10px] text-zinc-400 font-medium mt-1">Todos os membros do terreiro poderão visualizá-lo.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
