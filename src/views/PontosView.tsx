import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Menu,
  Search, 
  Plus, 
  Play, 
  Music, 
  Trash2, 
  Pencil,
  X, 
  BookOpen, 
  AlertCircle,
  Link,
  Tag,
  AlignLeft,
  MoreHorizontal
} from 'lucide-react';
import { Ponto, PontoCategory, PONTO_CATEGORIES } from '../types';
import { useAppData } from '../context/AppDataContext';

// Helper to extract YouTube video ID
function getYoutubeId(url: string) {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

function buildYoutubeThumbnail(videoId: string) {
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
}

export default function PontosView({ onBack, onToggleMenu }: { onBack: () => void; onToggleMenu: () => void }) {
  const { pontos, savePonto, deletePonto, currentAccount, isTerreiroAdmin } = useAppData();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PontoCategory | 'TODOS'>('TODOS');

  // Form states (Add/Edit Ponto)
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPontoId, setEditingPontoId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formCategory, setFormCategory] = useState<PontoCategory>('OUTROS');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Active ponto (expanded inline with video)
  const [activePontoId, setActivePontoId] = useState<string | null>(null);

  // Drag-scroll for categories list
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    el.scrollLeft = scrollLeft - walk;
  };

  // Filtered Points
  const terreiroPontos = useMemo(() => {
    return pontos.filter(p => !currentAccount || p.terreiroId === currentAccount.terreiroId);
  }, [pontos, currentAccount]);

  const filteredPontos = useMemo(() => {
    return terreiroPontos.filter((p) => {
      const matchesSearch = 
        p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.descricao.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'TODOS' || p.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [terreiroPontos, searchQuery, selectedCategory]);

  const handleTogglePonto = (pontoId: string) => {
    setActivePontoId(prev => prev === pontoId ? null : pontoId);
  };

  useEffect(() => {
    if (activePontoId) {
      setTimeout(() => {
        const el = document.getElementById(`ponto-card-${activePontoId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250); // Generous timing to allow animation layout to expand
    }
  }, [activePontoId]);

  const handleCloseForm = () => {
    setFormTitle('');
    setFormYoutubeUrl('');
    setFormCategory('OUTROS');
    setFormDescription('');
    setFormError(null);
    setEditingPontoId(null);
    setShowAddForm(false);
  };

  const handleEditClick = (ponto: Ponto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormTitle(ponto.titulo);
    setFormYoutubeUrl(ponto.youtubeUrl);
    setFormCategory(ponto.categoria);
    setFormDescription(ponto.descricao || '');
    setFormError(null);
    setEditingPontoId(ponto.id);
    setShowAddForm(true);
  };

  const handleSavePonto = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError('O título é obrigatório.');
      return;
    }
    const videoId = getYoutubeId(formYoutubeUrl);
    if (!videoId) {
      setFormError('Por favor, insira um link do YouTube válido.');
      return;
    }

    const existingPonto = editingPontoId ? pontos.find(p => p.id === editingPontoId) : null;

    const newPonto: Ponto = {
      id: editingPontoId || `ponto_${Date.now()}`,
      titulo: formTitle.trim(),
      categoria: formCategory,
      youtubeUrl: formYoutubeUrl.trim(),
      descricao: formDescription.trim(),
      thumbnail: buildYoutubeThumbnail(videoId),
      terreiroId: currentAccount?.terreiroId || '',
      letra: existingPonto?.letra || '',
      createdAt: existingPonto?.createdAt || new Date().toISOString()
    };

    try {
      await savePonto(newPonto);
      handleCloseForm();
    } catch (err) {
      setFormError('Erro ao salvar o ponto. Tente novamente.');
    }
  };

  const handleDeletePonto = async (pontoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este ponto permanentemente?')) {
      if (activePontoId === pontoId) {
        setActivePontoId(null);
      }
      await deletePonto(pontoId);
    }
  };  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-8 relative overflow-x-hidden z-10">
      
      {/* Aurora Backdrop Effect at top */}
      <div 
        className="absolute inset-x-0 top-0 h-[35dvh] pointer-events-none overflow-hidden z-0 select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)'
        }}
      >
        <div className="absolute w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[#0d47a1]/70 to-[#1565c0]/35 blur-[60px] -top-[18%] -left-[10%] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute w-[80vw] h-[80vw] rounded-full bg-gradient-to-tr from-[#00b0ff]/60 to-[#00e5ff]/25 blur-[70px] -top-[20%] -right-[15%] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      </div>      {/* Header Row */}
      <div className="relative flex items-center justify-between h-14 w-full z-10 mb-8">
        <button 
          onClick={onBack}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.04),_0_1px_2px_rgba(0,0,0,0.02)] border border-zinc-200/40 text-zinc-800 hover:bg-white active:scale-95 transition-all"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
        
        <div className="w-full text-center px-14">
          <h1 className="text-2xl font-black bg-gradient-to-r from-zinc-800 to-[#1565c0] bg-clip-text text-transparent leading-none font-behind-it">Curimba</h1>
          <p className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-[0.25em] mt-2 leading-none">
            Pontos e Cantos Sagrados
          </p>
        </div>

        <button 
          onClick={onToggleMenu}
          className="absolute right-0 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.04),_0_1px_2px_rgba(0,0,0,0.02)] border border-zinc-200/40 text-zinc-800 hover:bg-white active:scale-95 transition-all"
        >
          <Menu className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full z-10 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-zinc-200/50 rounded-2xl bg-white/70 backdrop-blur-md focus-within:bg-white focus-within:border-[#1565c0]/35 focus-within:shadow-[0_8px_32px_rgba(21,101,192,0.04)] transition-all duration-300">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-zinc-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar ponto pelo título ou guia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-transparent border-0 rounded-2xl text-[14px] text-zinc-700 focus:ring-0 focus:outline-hidden font-medium"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-4 flex items-center text-[#414141]/40 active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-3 mb-6 relative z-10 -mx-6 px-6 select-none cursor-grab active:cursor-grabbing scroll-smooth"
      >
        <button
          onClick={() => setSelectedCategory('TODOS')}
          className={`px-5 py-2.5 rounded-full text-[12.5px] font-bold tracking-wide transition-all shrink-0 active:scale-95 ${
            selectedCategory === 'TODOS'
              ? 'bg-[#1565c0] text-white border border-transparent shadow-[0_4px_16px_rgba(21,101,192,0.25)]'
              : 'bg-white border border-zinc-150 text-zinc-600 shadow-[0_4px_12px_rgba(0,0,0,0.05),_0_1px_3px_rgba(0,0,0,0.02)] hover:bg-zinc-50/50'
          }`}
        >
          Todos
        </button>
        {PONTO_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-[12.5px] font-bold tracking-wide transition-all shrink-0 active:scale-95 ${
              selectedCategory === cat
                ? 'bg-[#1565c0] text-white border border-transparent shadow-[0_4px_16px_rgba(21,101,192,0.25)]'
                : 'bg-white border border-zinc-150 text-zinc-600 shadow-[0_4px_12px_rgba(0,0,0,0.05),_0_1px_3px_rgba(0,0,0,0.02)] hover:bg-zinc-50/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sub-Header Row following standard calendar event styling */}
      <div className="relative z-10 flex items-end justify-between mb-5 px-1 mt-4">
        <div>
          <span className="text-[10px] font-black text-[#1565c0] uppercase tracking-[0.25em]">Acervo de Pontos</span>
          <h3 className="text-xl font-extrabold text-zinc-800 tracking-tight mt-1.5">Cantos Gravados</h3>
        </div>
        {isTerreiroAdmin && (
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setFormError(null);
              setShowAddForm(true);
            }}
            className="flex h-11 px-4 gap-1.5 items-center justify-center rounded-full bg-gradient-to-r from-[#1565c0] to-[#0d47a1] text-white shadow-[0_4px_16px_rgba(21,101,192,0.22)] border border-[#1565c0]/10 text-xs font-bold transition-all"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span>Novo</span>
          </motion.button>
        )}
      </div>

      {/* Points list — inline expandable cards */}
      <div className="relative z-10 space-y-4 pb-24">
        {filteredPontos.length > 0 ? (
          filteredPontos.map((ponto) => {
            const isActive = activePontoId === ponto.id;
            const videoId = getYoutubeId(ponto.youtubeUrl);
            return (
              <motion.div
                key={ponto.id}
                id={`ponto-card-${ponto.id}`}
                layout
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className={`rounded-3xl transition-all duration-300 border overflow-hidden ${
                  isActive 
                    ? 'bg-white border-zinc-200 shadow-[0_12px_40px_rgba(0,0,0,0.06)]' 
                    : 'bg-white border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
                }`}
              >
                {isActive ? (
                  /* Expanded state layout: Video player at the top, info at the bottom */
                  <div className="flex flex-col p-3.5 pb-4">
                    {/* 1. Large Video Player at the top */}
                    <div className="w-full aspect-[4/3] bg-zinc-950 relative rounded-2xl overflow-hidden shadow-sm border border-black/[0.08]">
                      {videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                          title={ponto.titulo}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full border-0 object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                          <Music className="h-8 w-8 animate-pulse" />
                        </div>
                      )}
                    </div>
                    
                    {/* 2. Metadata / Details below video */}
                    <div className="pt-4 px-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-[#1565c0]/6 border border-[#1565c0]/15 text-[#1565c0] text-[10px] font-black uppercase tracking-widest">
                          {ponto.categoria}
                        </span>
                        
                        {/* Admin controls in expanded view */}
                        {isTerreiroAdmin && (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                handleEditClick(ponto, e);
                              }}
                              className="h-8 w-8 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-100 transition-colors flex items-center justify-center active:scale-90"
                              title="Editar Ponto"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                handleDeletePonto(ponto.id, e);
                              }}
                              className="h-8 w-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 transition-colors flex items-center justify-center active:scale-90"
                              title="Excluir Ponto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="text-[16px] font-extrabold text-zinc-900 tracking-tight leading-snug mt-3">
                        {ponto.titulo}
                      </h4>

                      {ponto.descricao && (
                        <p className="text-[12.5px] text-zinc-500 font-medium leading-relaxed mt-2.5">
                          {ponto.descricao}
                        </p>
                      )}

                      <div className="flex items-center justify-center mt-5 pt-4 border-t border-zinc-100/80">
                        <button
                          onClick={() => handleTogglePonto(ponto.id)}
                          className="px-5 py-2 rounded-full bg-zinc-50 border border-zinc-200/85 text-zinc-600 text-[11px] font-extrabold uppercase tracking-widest hover:bg-zinc-100 hover:text-zinc-800 transition-colors active:scale-95 shadow-3xs"
                        >
                          Recolher
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Collapsed state layout (Row) */
                  <div 
                    onClick={() => handleTogglePonto(ponto.id)}
                    className="flex items-center gap-4 p-3.5 cursor-pointer active:bg-zinc-50/60 transition-colors"
                  >
                    {/* Large thumbnail */}
                    <div className="h-[72px] w-[72px] rounded-2xl overflow-hidden bg-zinc-100 relative shrink-0 shadow-sm border border-zinc-100">
                      {ponto.thumbnail ? (
                        <img 
                          src={ponto.thumbnail} 
                          alt="" 
                          className="h-full w-full object-cover" 
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[#1565c0]/5 text-[#1565c0]">
                          <Music className="h-6 w-6" />
                        </div>
                      )}
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-white/80 shadow-md scale-90">
                          <Play className="h-3.5 w-3.5 ml-0.5 fill-zinc-800 text-zinc-800" />
                        </div>
                      </div>
                    </div>

                    {/* Text content */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[15px] font-bold tracking-tight leading-snug text-zinc-800">
                        {ponto.titulo}
                      </h4>
                      <p className="text-[12px] text-zinc-400 font-medium tracking-tight mt-0.5 truncate pr-2">
                        {ponto.descricao || ponto.categoria}
                      </p>
                      {ponto.createdAt && (
                        <p className="text-[10px] text-zinc-300 font-medium mt-1">
                          {new Date(ponto.createdAt).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>

                    {/* Right action area */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isTerreiroAdmin && (
                        <>
                          <button
                            onClick={() => handleEditClick(ponto)}
                            className="h-8 w-8 rounded-full bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 active:scale-90 flex items-center justify-center border border-zinc-100 transition-all"
                            title="Editar Ponto"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeletePonto(ponto.id, e)}
                            className="h-8 w-8 rounded-full bg-zinc-50 text-zinc-300 hover:bg-red-50 hover:text-red-500 active:scale-90 flex items-center justify-center border border-zinc-100 transition-all"
                            title="Excluir Ponto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {!isTerreiroAdmin && <MoreHorizontal className="h-5 w-5 text-zinc-300" />}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-3xl bg-zinc-50 border border-zinc-150 py-12 px-6 text-center shadow-xs">
            <Music className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-zinc-800">Nenhum ponto gravado</h4>
            <p className="text-xs text-zinc-400 font-medium mt-1 px-4 leading-relaxed">
              Não encontramos nenhum canto sagrado nesta categoria ou com este nome.
            </p>
          </div>
        )}
      </div>

      {showAddForm && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
            {/* Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 260 }}
              className="relative w-full max-w-[430px] z-[110] max-h-[85vh] bg-white rounded-t-[40px] border-t border-zinc-200/50 p-6 pb-8 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.12)] overflow-y-auto no-scrollbar pointer-events-auto"
            >
              {/* Top Handle Drag indicator */}
              <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-6 shrink-0" />

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                    {editingPontoId ? 'Editar Canto Sagrado' : 'Novo Canto Sagrado'}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                    {editingPontoId ? 'Atualize as informações do Ponto' : 'Insira as informações do Ponto'}
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
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSavePonto} className="space-y-4 flex-1 pb-6">
                {/* Title */}
                <div className="flex items-center gap-3.5 bg-zinc-50 border border-zinc-150 focus-within:border-[#1565c0]/35 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(21,101,192,0.04)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                  <BookOpen className="h-5 w-5 text-zinc-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Título do Ponto</span>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ponto de Ogum Beira-Mar"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-800 font-bold placeholder-zinc-300 focus:ring-0 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* YouTube Link */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5 bg-zinc-50 border border-zinc-150 focus-within:border-[#1565c0]/35 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(21,101,192,0.04)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                    <Link className="h-5 w-5 text-zinc-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Link do YouTube</span>
                      <input
                        type="url"
                        required
                        placeholder="Ex: https://www.youtube.com/watch?v=..."
                        value={formYoutubeUrl}
                        onChange={(e) => setFormYoutubeUrl(e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-800 font-bold placeholder-zinc-300 focus:ring-0 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* YouTube Live Preview */}
                  {(() => {
                    const videoId = getYoutubeId(formYoutubeUrl);
                    if (!videoId) return null;
                    return (
                      <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-150 flex items-center gap-4 animate-fadeIn shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
                        <div className="h-16 w-24 rounded-xl overflow-hidden bg-zinc-100 relative shrink-0 shadow-xs border border-zinc-200">
                          <img 
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                            alt="YouTube Preview" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-wider mb-1.5 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Vínculo Confirmado
                          </span>
                          <h4 className="text-[12px] font-bold text-zinc-700 truncate leading-snug">Vínculo com o YouTube confirmado</h4>
                          <p className="text-[9px] text-zinc-400 mt-1 truncate">ID do vídeo: {videoId}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Category Selection */}
                <div className="flex items-center gap-3.5 bg-zinc-50 border border-zinc-150 focus-within:border-[#1565c0]/35 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(21,101,192,0.04)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                  <Tag className="h-5 w-5 text-zinc-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Linha / Categoria</span>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as PontoCategory)}
                      className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-800 font-bold focus:ring-0 focus:outline-hidden"
                    >
                      {PONTO_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-start gap-3.5 bg-zinc-50 border border-zinc-150 focus-within:border-[#1565c0]/35 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(21,101,192,0.04)] rounded-2xl px-4 py-2.5 transition-all duration-200">
                  <AlignLeft className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Leve Descrição (Opcional)</span>
                    <textarea
                      rows={2}
                      placeholder="Uma breve frase sobre o ponto, guia ou momento..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-[13.5px] text-zinc-800 font-bold placeholder-zinc-300 focus:ring-0 focus:outline-hidden resize-none leading-snug"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                    className="w-full py-4 rounded-2xl text-sm font-bold text-white bg-[#1565c0] shadow-lg shadow-[#1565c0]/20 active:scale-[0.98] transition-all hover:bg-[#0d47a1] flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
                    {editingPontoId ? 'Salvar Alterações' : 'Cadastrar Ponto'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
