import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Search, 
  Plus, 
  Play, 
  Pause, 
  Music, 
  Trash2, 
  X, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  AlertCircle
} from 'lucide-react';
import { Ponto, PontoCategory, PONTO_CATEGORIES } from '../types';
import { useAppData } from '../context/AppDataContext';

// Helper to extract YouTube video ID
function getYoutubeId(url: string) {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

function buildYoutubeThumbnail(videoId: string) {
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
}

export default function PontosView({ onBack }: { onBack: () => void }) {
  const { pontos, savePonto, deletePonto, currentAccount, isTerreiroAdmin } = useAppData();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PontoCategory | 'TODOS'>('TODOS');

  // Form states (Add Ponto)
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formCategory, setFormCategory] = useState<PontoCategory>('OUTROS');
  const [formDescription, setFormDescription] = useState('');
  const [formLyrics, setFormLyrics] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Player states
  const [activePonto, setActivePonto] = useState<Ponto | null>(null);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Track Simulated Progress bar for YouTube
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered Points based on Search and Selected Category
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

  // Simulate audio progress when playing
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 180) { // reset or cap at 3 mins if duration is mocked
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying]);

  // Format time (e.g. 02:45)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handlePlayPonto = (ponto: Ponto) => {
    setActivePonto(ponto);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(180); // 3 mins default simulation
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

    const newPonto: Ponto = {
      id: `ponto_${Date.now()}`,
      titulo: formTitle.trim(),
      categoria: formCategory,
      youtubeUrl: formYoutubeUrl.trim(),
      descricao: formDescription.trim(),
      thumbnail: buildYoutubeThumbnail(videoId),
      terreiroId: currentAccount?.terreiroId || '',
      letra: formLyrics.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      await savePonto(newPonto);
      // Reset form
      setFormTitle('');
      setFormYoutubeUrl('');
      setFormCategory('OUTROS');
      setFormDescription('');
      setFormLyrics('');
      setShowAddForm(false);
    } catch (err) {
      setFormError('Erro ao salvar o ponto. Tente novamente.');
    }
  };

  const handleDeletePonto = async (pontoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este ponto permanentemente?')) {
      if (activePonto?.id === pontoId) {
        setActivePonto(null);
        setIsPlaying(false);
      }
      await deletePonto(pontoId);
    }
  };

  const activeVideoId = activePonto ? getYoutubeId(activePonto.youtubeUrl) : '';

  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-24 relative overflow-x-hidden z-10">
      
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
      </div>

      {/* Header Row */}
      <div className="relative flex items-center justify-between h-14 w-full z-10 mb-8">
        <button 
          onClick={onBack}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF8F5] shadow-xs border border-black/[0.03] text-[#414141] active:scale-95 transition-transform"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
        
        <div className="w-full text-center">
          <h1 className="text-3xl font-bold text-[#1565c0] leading-none font-behind-it">Curimba</h1>
          <p className="text-[10px] font-bold text-[#414141]/40 uppercase tracking-[0.2em] mt-1.5">
            Pontos e Cantos Sagrados
          </p>
        </div>
      </div>

      {/* Search Input Bar (Airbnb Inspired) */}
      <div className="relative w-full z-10 mb-6 shadow-xs border border-zinc-100/80 rounded-2xl bg-zinc-50/50 focus-within:bg-white focus-within:border-[#1565c0]/30 transition-all duration-300">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-[#414141]/40" />
        </div>
        <input
          type="text"
          placeholder="Buscar ponto pelo título ou guia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-transparent border-0 rounded-2xl text-[14px] text-[#414141] focus:ring-0 focus:outline-hidden font-medium"
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

      {/* Category Pills (Horizontal Scrollable) */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-3 mb-6 relative z-10 -mx-6 px-6">
        <button
          onClick={() => setSelectedCategory('TODOS')}
          className={`px-4.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 ${
            selectedCategory === 'TODOS'
              ? 'bg-[#1565c0] text-white shadow-md shadow-[#1565c0]/15'
              : 'bg-zinc-50 border border-zinc-100 text-[#414141]/70 hover:bg-zinc-100'
          }`}
        >
          Todos
        </button>
        {PONTO_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 ${
              selectedCategory === cat
                ? 'bg-[#1565c0] text-white shadow-md shadow-[#1565c0]/15'
                : 'bg-zinc-50 border border-zinc-100 text-[#414141]/70 hover:bg-zinc-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Points list */}
      <div className="relative z-10 space-y-4">
        {filteredPontos.length > 0 ? (
          filteredPontos.map((ponto) => {
            const isCurrent = activePonto?.id === ponto.id;
            return (
              <motion.div
                key={ponto.id}
                onClick={() => handlePlayPonto(ponto)}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-[24px] border transition-all duration-300 cursor-pointer flex items-center gap-4 relative overflow-hidden group ${
                  isCurrent 
                    ? 'bg-zinc-50 border-[#1565c0]/25 shadow-xs' 
                    : 'bg-white border-zinc-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:border-zinc-200'
                }`}
              >
                {/* Youtube Thumbnail / Cover */}
                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-zinc-100 relative shrink-0">
                  {ponto.thumbnail ? (
                    <img 
                      src={ponto.thumbnail} 
                      alt="" 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-emerald-500/10 text-emerald-600">
                      <Music className="h-6 w-6" />
                    </div>
                  )}
                  {/* Play Overlay indicator */}
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isCurrent && isPlaying ? (
                      <Pause className="h-5 w-5 text-white fill-white" />
                    ) : (
                      <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <span className="inline-block px-2 py-0.5 rounded-[4px] bg-zinc-100 text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1.5">
                    {ponto.categoria}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-800 tracking-tight leading-snug truncate">
                    {ponto.titulo}
                  </h4>
                  <p className="text-xs text-zinc-400 font-medium tracking-tight mt-0.5 truncate pr-4">
                    {ponto.descricao || 'Sem descrição cadastrada'}
                  </p>
                </div>

                {/* Actions: Play and Delete */}
                <div className="flex items-center gap-2">
                  {isTerreiroAdmin && (
                    <button
                      onClick={(e) => handleDeletePonto(ponto.id, e)}
                      className="p-2.5 rounded-full text-zinc-400 hover:text-red-600 active:scale-90 hover:bg-red-50/50 transition-colors shrink-0"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="rounded-[32px] bg-zinc-50 border border-zinc-100 py-12 px-6 text-center shadow-xs">
            <Music className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-zinc-800">Nenhum ponto gravado</h4>
            <p className="text-xs text-zinc-400 font-medium mt-1 px-4 leading-relaxed">
              Não encontramos nenhum canto sagrado nesta categoria ou com este nome.
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Button for Admin */}
      {isTerreiroAdmin && (
        <motion.button
          onClick={() => setShowAddForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed right-6 bottom-24 h-14 w-14 rounded-full bg-[#1565c0] text-white flex items-center justify-center shadow-xl shadow-[#1565c0]/20 active:scale-95 transition-all z-40 border border-[#1565c0]/10"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Fullscreen Add Form Drawer/Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            {/* Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xs"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 240 }}
              className="fixed inset-x-0 bottom-0 z-[110] max-h-[85vh] bg-white rounded-t-[40px] border-t border-zinc-100 p-6 flex flex-col shadow-2xl overflow-y-auto no-scrollbar"
            >
              {/* Top Handle Drag indicator */}
              <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-6 shrink-0" />

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-800 font-behind-it">Adicionar Novo Ponto</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 active:scale-90"
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

              <form onSubmit={handleSavePonto} className="space-y-5 flex-1 pb-10">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Título do Ponto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ponto de Ogum Beira-Mar"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-[#1565c0]/30 focus:ring-0 focus:outline-hidden transition-all duration-300"
                  />
                </div>

                {/* YouTube Link */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Link do YouTube</label>
                  <input
                    type="url"
                    required
                    placeholder="Ex: https://www.youtube.com/watch?v=..."
                    value={formYoutubeUrl}
                    onChange={(e) => setFormYoutubeUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-[#1565c0]/30 focus:ring-0 focus:outline-hidden transition-all duration-300"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Linha / Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as PontoCategory)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-[#1565c0]/30 focus:ring-0 focus:outline-hidden transition-all duration-300"
                  >
                    {PONTO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Leve Descrição</label>
                  <textarea
                    rows={2}
                    placeholder="Uma breve frase sobre o ponto, guia ou momento..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-[#1565c0]/30 focus:ring-0 focus:outline-hidden transition-all duration-300 resize-none"
                  />
                </div>

                {/* Lyrics */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Letra (Opcional)</label>
                  <textarea
                    rows={4}
                    placeholder="Insira a letra do ponto aqui para que todos possam acompanhar e cantar junto..."
                    value={formLyrics}
                    onChange={(e) => setFormLyrics(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-[#1565c0]/30 focus:ring-0 focus:outline-hidden transition-all duration-300 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full text-sm font-bold text-white active:scale-[0.97] transition-transform duration-150 ease-out"
                    style={{
                      background: 'linear-gradient(180deg, #7DD3FC 0%, #38BDF8 40%, #0EA5E9 100%)',
                      border: '1.5px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 4px 15px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    Cadastrar Ponto
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Bottom Mini-Player (Apple Music Style) */}
      <AnimatePresence>
        {activePonto && !isPlayerExpanded && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => setIsPlayerExpanded(true)}
            className="fixed bottom-4 inset-x-4 z-50 h-16 rounded-2xl bg-white/70 backdrop-blur-md border border-zinc-200/50 shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-2 pr-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                {activePonto.thumbnail ? (
                  <img src={activePonto.thumbnail} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[#1565c0]/10 text-[#1565c0]">
                    <Music className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[13px] font-extrabold text-zinc-800 tracking-tight leading-tight truncate">
                  {activePonto.titulo}
                </h4>
                <p className="text-[10px] text-zinc-400 font-semibold tracking-tight uppercase mt-0.5 leading-none">
                  {activePonto.categoria}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              {/* Play / Pause Toggle */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-10 w-10 rounded-full flex items-center justify-center text-zinc-700 bg-zinc-50 hover:bg-zinc-100 active:scale-90 shadow-xs border border-zinc-100"
              >
                {isPlaying ? (
                  <Pause className="h-4.5 w-4.5 fill-zinc-700 text-zinc-700" />
                ) : (
                  <Play className="h-4.5 w-4.5 fill-zinc-700 text-zinc-700 ml-0.5" />
                )}
              </button>
              {/* Maximize */}
              <button
                onClick={() => setIsPlayerExpanded(true)}
                className="h-10 w-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 bg-zinc-50 active:scale-90 hover:bg-zinc-100 border border-zinc-100"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Premium Liquid Glass Player (WWDC Fluid Motion Concept) */}
      <AnimatePresence>
        {isPlayerExpanded && activePonto && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-[120] bg-black flex flex-col justify-between overflow-hidden"
          >
            {/* Simulated Animated Colorful Backdrop Glows inside black background (Liquid Glass) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-45">
              <div className="absolute w-[120vw] h-[120vw] rounded-full bg-gradient-to-br from-emerald-600/70 to-blue-700/35 blur-[100px] -top-[30%] -left-[20%] animate-[pulse_10s_ease-in-out_infinite]" />
              <div className="absolute w-[130vw] h-[130vw] rounded-full bg-gradient-to-tr from-cyan-500/60 to-purple-600/25 blur-[110px] -bottom-[30%] -right-[20%] animate-[pulse_12s_ease-in-out_infinite_3s]" />
            </div>

            {/* Inner Content wrapper in glassmorphism */}
            <div className="relative z-10 flex flex-col h-full w-full justify-between p-6 bg-black/40 backdrop-blur-2xl box-border">
              
              {/* 1. Header controls */}
              <div className="flex justify-between items-center h-14 shrink-0">
                <button
                  onClick={() => setIsPlayerExpanded(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/10 text-white active:scale-90"
                >
                  <Minimize2 className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.25em] leading-none block">
                    REPRODUZINDO DO TERREIRO
                  </span>
                  <span className="text-[13px] font-bold text-white mt-1 block max-w-[180px] truncate">
                    {activePonto.titulo}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsPlayerExpanded(false);
                    setActivePonto(null);
                    setIsPlaying(false);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400 active:scale-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 2. Main Reposition area (Image/Video and Lyrics) */}
              <div className="flex-1 flex flex-col justify-center gap-6 my-4 overflow-y-auto no-scrollbar">
                
                {/* Embed YouTube Player and Video Container */}
                <div className="w-full shrink-0 relative aspect-video rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl flex items-center justify-center group">
                  {/* Standard Hidden/Visible YouTube Iframe */}
                  {activeVideoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1&mute=${isMuted ? '1' : '0'}&play=1`}
                      title={activePonto.titulo}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        showVideo ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                      }`}
                    />
                  ) : null}

                  {/* Backdrop Cover when video is hidden */}
                  {!showVideo && (
                    <div className="absolute inset-0 w-full h-full">
                      {activePonto.thumbnail ? (
                        <img 
                          src={activePonto.thumbnail} 
                          alt="" 
                          className="h-full w-full object-cover blur-xs brightness-75 scale-102" 
                        />
                      ) : (
                        <div className="h-full w-full bg-zinc-900/60 flex items-center justify-center text-white/15">
                          <Music className="h-20 w-20" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Toggle and Status Overlay */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                      onClick={() => setShowVideo(!showVideo)}
                      className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10.5px] font-bold text-white flex items-center gap-1.5 active:scale-90 transition-all"
                    >
                      {showVideo ? 'Esconder Vídeo' : 'Mostrar Vídeo'}
                    </button>
                  </div>
                </div>

                {/* Lyrics / Letra Tab */}
                <div className="flex-1 flex flex-col min-h-0 bg-white/5 border border-white/5 rounded-3xl p-5 relative overflow-hidden backdrop-blur-md shadow-inner">
                  <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-3 shrink-0">
                    <BookOpen className="h-4.5 w-4.5 text-[#00b0ff]" />
                    <span className="text-[11px] font-black text-white/70 uppercase tracking-[0.18em]">
                      Acompanhar Letra do Ponto
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                    {activePonto.letra ? (
                      <p className="text-[14.5px] font-bold leading-relaxed text-white/90 whitespace-pre-line tracking-wide text-center">
                        {activePonto.letra}
                      </p>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40">
                        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-[13px] font-semibold">Sem letra cadastrada para este ponto</p>
                        {isTerreiroAdmin && (
                          <p className="text-[10px] opacity-75 mt-1 font-medium">Você pode preenchê-la editando o ponto.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* 3. Controls & Slider area */}
              <div className="shrink-0 space-y-6 pt-2">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#00e5ff] to-[#00b0ff] rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-white/40 font-mono tracking-wider">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-8">
                  {/* Mute toggle */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                      isMuted 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                        : 'bg-white/5 border border-white/5 text-white/80 hover:text-white'
                    }`}
                  >
                    {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                  </button>

                  {/* Play / Pause (Big Central button) */}
                  <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    whileTap={{ scale: 0.94 }}
                    className="h-18 w-18 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl active:scale-95 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="h-7 w-7 fill-zinc-950 text-zinc-950" />
                    ) : (
                      <Play className="h-7 w-7 fill-zinc-950 text-zinc-950 ml-1" />
                    )}
                  </motion.button>

                  {/* Open Lyrics standalone or similar action */}
                  <button
                    onClick={() => setShowVideo(!showVideo)}
                    className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                      showVideo 
                        ? 'bg-[#00b0ff]/20 border border-[#00b0ff]/30 text-[#00e5ff]' 
                        : 'bg-white/5 border border-white/5 text-white/80 hover:text-white'
                    }`}
                  >
                    <BookOpen className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Subtitle / Description */}
                <p className="text-center text-[11px] text-white/35 font-medium px-4 leading-relaxed truncate pb-2">
                  {activePonto.descricao || 'Canto sagrado reproduzido no terreiro.'}
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
