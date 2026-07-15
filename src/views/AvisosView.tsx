import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Menu, 
  Plus, 
  X, 
  Bell, 
  Megaphone, 
  Calendar, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Pencil, 
  Trash2 
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Notice } from '../types';

export default function AvisosView({ 
  onBack, 
  onToggleMenu,
  onToggleNavbar
}: { 
  onBack: () => void; 
  onToggleMenu: () => void;
  onToggleNavbar?: (hide: boolean) => void;
}) {
  const { 
    notices, 
    saveNotice, 
    deleteNotice, 
    currentAccount, 
    isTerreiroAdmin 
  } = useAppData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<Notice['category']>('Geral');
  const [formDate, setFormDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle global navbar visibility when form is open/closed
  useEffect(() => {
    if (onToggleNavbar) {
      onToggleNavbar(showAddForm);
    }
    return () => {
      if (onToggleNavbar) onToggleNavbar(false);
    };
  }, [showAddForm, onToggleNavbar]);

  // Filter notices for current terreiro
  const filteredNotices = useMemo(() => {
    const tId = currentAccount?.terreiroId || '';
    return notices.filter(n => n.terreiroId === tId);
  }, [notices, currentAccount]);

  const handleCloseForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('Geral');
    setFormDate('');
    setFormError(null);
    setEditingNoticeId(null);
    setShowAddForm(false);
  };

  const handleEditClick = (notice: Notice, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormTitle(notice.title);
    setFormContent(notice.content);
    setFormCategory(notice.category);
    if (notice.date) {
      setFormDate(new Date(notice.date).toISOString().split('T')[0]);
    } else {
      setFormDate('');
    }
    setFormError(null);
    setEditingNoticeId(notice.id);
    setShowAddForm(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError('O título é obrigatório.');
      return;
    }
    if (!formContent.trim()) {
      setFormError('O conteúdo do comunicado é obrigatório.');
      return;
    }

    const existingNotice = editingNoticeId ? notices.find(n => n.id === editingNoticeId) : null;

    const newNotice: Notice = {
      id: editingNoticeId || `not_${Date.now()}`,
      title: formTitle.trim(),
      content: formContent.trim(),
      category: formCategory,
      date: formDate ? new Date(formDate).toISOString() : '',
      createdAt: existingNotice?.createdAt || new Date().toISOString(),
      terreiroId: currentAccount?.terreiroId || ''
    };

    try {
      await saveNotice(newNotice);
      setSuccessMessage(editingNoticeId ? 'Aviso atualizado com sucesso!' : 'Aviso publicado com sucesso!');
      handleCloseForm();
      
      // Show Toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      setFormError('Erro ao salvar o aviso. Tente novamente.');
    }
  };

  const handleDeleteNotice = async (noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza de que deseja excluir este aviso permanentemente?')) {
      try {
        await deleteNotice(noticeId);
        setSuccessMessage('Aviso excluído com sucesso!');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } catch (err) {
        alert('Erro ao excluir o aviso.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 px-6 pt-12 pb-24 relative overflow-x-hidden z-10">
      
      {/* Aurora Backdrop Effect */}
      <div 
        className="absolute inset-x-0 top-0 h-[35dvh] pointer-events-none overflow-hidden z-0 select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)'
        }}
      >
        <div className="absolute w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-rose-500/15 to-red-700/5 blur-[60px] -top-[18%] -left-[10%] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute w-[80vw] h-[80vw] rounded-full bg-gradient-to-tr from-pink-400/25 to-rose-600/10 blur-[70px] -top-[20%] -right-[15%] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between h-14 w-full z-10 mb-8">
        <button 
          onClick={onBack}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.04),_0_1px_2px_rgba(0,0,0,0.02)] border border-zinc-200/40 text-zinc-800 hover:bg-white active:scale-95 transition-all"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
        
        <div className="w-full text-center px-14">
          <h1 className="text-2xl font-black bg-gradient-to-r from-zinc-800 to-rose-700 bg-clip-text text-transparent leading-none font-behind-it">Mural</h1>
          <p className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-[0.25em] mt-2 leading-none">
            Avisos e Comunicados
          </p>
        </div>

        <button 
          onClick={onToggleMenu}
          className="absolute right-0 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.04),_0_1px_2px_rgba(0,0,0,0.02)] border border-zinc-200/40 text-zinc-800 hover:bg-white active:scale-95 transition-all"
        >
          <Menu className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>

      {/* Sub-Header Row matching Pontos inline styling */}
      <div className="relative z-10 flex items-end justify-between mb-8 px-1">
        <div>
          <span className="text-[10px] font-black text-rose-700 uppercase tracking-[0.25em]">Mural Virtual</span>
          <h3 className="text-xl font-extrabold text-zinc-800 tracking-tight mt-1.5">Comunicados Fixados</h3>
        </div>
        {isTerreiroAdmin && (
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setFormError(null);
              setShowAddForm(true);
            }}
            className="flex h-11 px-4 gap-1.5 items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-[0_4px_16px_rgba(225,29,72,0.22)] border border-rose-600/10 text-xs font-bold transition-all"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span>Novo</span>
          </motion.button>
        )}
      </div>

      {/* Notice Feed List */}
      <div className="relative z-10 space-y-6 pb-12">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const categoryConfig = {
              Importante: {
                bg: 'bg-rose-50 border-rose-100 text-rose-800',
                icon: ShieldAlert,
                label: 'Atenção',
                pinColor: 'bg-rose-500'
              },
              Programação: {
                bg: 'bg-blue-50 border-blue-100 text-blue-800',
                icon: Calendar,
                label: 'Agenda',
                pinColor: 'bg-blue-500'
              },
              Geral: {
                bg: 'bg-zinc-50 border-zinc-150 text-zinc-700',
                icon: Megaphone,
                label: 'Informativo',
                pinColor: 'bg-amber-500'
              }
            }[notice.category] || {
              bg: 'bg-zinc-50 border-zinc-150 text-zinc-700',
              icon: Megaphone,
              label: 'Geral',
              pinColor: 'bg-zinc-500'
            };

            const Icon = categoryConfig.icon;

            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="pt-6 pb-5 px-5 rounded-[28px] bg-white/95 border border-zinc-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-md relative overflow-visible"
              >
                {/* 3D Push Pin Element */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none select-none">
                  {/* Pin Head */}
                  <div className={`h-4 w-4 rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.18),_inset_0_-2px_4px_rgba(0,0,0,0.15)] ${categoryConfig.pinColor}`} />
                  {/* Pin Metallic Stem */}
                  <div className="h-2 w-0.5 bg-zinc-300 shadow-xs" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider leading-none border ${categoryConfig.bg}`}>
                        <Icon className="h-2.5 w-2.5 shrink-0" />
                        <span>{categoryConfig.label}</span>
                      </span>
                      <span className="text-[10.5px] text-zinc-400 font-bold uppercase tracking-wider">
                        {new Date(notice.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* Admin edit & delete options directly in card */}
                    {isTerreiroAdmin && (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleEditClick(notice, e)}
                          className="h-8 w-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-all active:scale-90"
                          title="Editar Comunicado"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteNotice(notice.id, e)}
                          className="h-8 w-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all active:scale-90"
                          title="Excluir Comunicado"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-800 tracking-tight leading-snug">
                    {notice.title}
                  </h3>
                  
                  <p className="text-[13px] leading-relaxed text-zinc-500 font-medium mt-2">
                    {notice.content}
                  </p>

                  {notice.date && (
                    <div className="mt-4 pt-3.5 border-t border-zinc-100/80 flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="h-3.5 w-3.5 text-zinc-300" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Agenda: {new Date(notice.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-[32px] bg-zinc-50 border border-zinc-150 py-12 px-6 text-center shadow-xs">
            <Bell className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-zinc-800">Sem avisos no momento</h4>
            <p className="text-xs text-zinc-400 font-medium mt-1 px-4 leading-relaxed">
              O mural está limpo. Novos comunicados serão exibidos aqui assim que postados pela administração.
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Input Drawer */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 z-[110] max-h-[85vh] bg-white rounded-t-[40px] border-t border-zinc-200/50 p-6 pb-8 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.12)] overflow-y-auto no-scrollbar pointer-events-auto"
            >
              {/* Top Handle Drag indicator */}
              <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-6 shrink-0" />

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                    {editingNoticeId ? 'Editar Comunicado' : 'Publicar Comunicado'}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                    {editingNoticeId ? 'Atualize as informações do aviso' : 'Insira as informações do aviso'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseForm}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 active:scale-90 transition-all"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 mb-5 rounded-2xl bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2 border border-red-100">
                  <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveNotice} className="space-y-4 flex-1 pb-6">
                {/* Title */}
                <div className="flex items-center gap-3.5 bg-zinc-50 border border-zinc-150 focus-within:border-rose-600/30 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(225,29,72,0.02)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                  <Megaphone className="h-5 w-5 text-zinc-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Título do Comunicado</span>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mutirão de Limpeza Geral"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-800 font-bold placeholder-zinc-300 focus:ring-0 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="flex items-center gap-3.5 bg-zinc-50 border border-zinc-150 focus-within:border-rose-600/30 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(225,29,72,0.02)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                  <ShieldAlert className="h-5 w-5 text-zinc-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Prioridade / Categoria</span>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as Notice['category'])}
                      className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-800 font-bold focus:ring-0 focus:outline-hidden"
                    >
                      <option value="Geral">Geral (Informativo)</option>
                      <option value="Programação">Programação (Datas e giras)</option>
                      <option value="Importante">Importante (Atenção obrigatória)</option>
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div className="flex items-start gap-3.5 bg-zinc-50 border border-zinc-150 focus-within:border-rose-600/30 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(225,29,72,0.02)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                  <Megaphone className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Conteúdo do Comunicado</span>
                    <textarea
                      rows={4}
                      required
                      placeholder="Descreva de forma completa as informações do comunicado..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-800 font-bold placeholder-zinc-300 focus:ring-0 focus:outline-hidden resize-none leading-snug"
                    />
                  </div>
                </div>

                {/* Target Date */}
                <div className="flex items-center gap-3.5 bg-zinc-50 border border-zinc-150 focus-within:border-rose-600/30 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(225,29,72,0.02)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                  <Calendar className="h-5 w-5 text-zinc-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Data Relacionada (Opcional)</span>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-800 font-bold placeholder-zinc-300 focus:ring-0 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                    className="w-full py-4 rounded-2xl text-sm font-bold text-white bg-rose-700 shadow-lg shadow-rose-700/20 active:scale-[0.98] transition-all hover:bg-rose-800 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4.5 w-4.5" strokeWidth={2.5} />
                    {editingNoticeId ? 'Salvar Alterações' : 'Publicar Comunicado'}
                  </motion.button>
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
            className="fixed bottom-6 inset-x-6 z-[120] p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl flex items-center gap-3 text-white"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <h5 className="text-[12.5px] font-black leading-none">{successMessage}</h5>
              <p className="text-[10px] text-zinc-400 font-medium mt-1">O mural de avisos foi atualizado com sucesso.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
