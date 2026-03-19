import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Play, Youtube, FileText, Menu } from 'lucide-react';
import { useState } from 'react';
import { Ponto } from '../types';

const MOCK_PONTOS: Ponto[] = [
  {
    id: '1',
    titulo: 'Ponto Zé Pilintra',
    categoria: 'CABOCLOS',
    youtubeUrl: 'https://youtu.be/jqoLv8hUajk',
    descricao: 'Ponto de saudação a Zé Pilintra, mestre da Jurema e da malandragem.',
    thumbnail: 'https://img.youtube.com/vi/jqoLv8hUajk/maxresdefault.jpg'
  }
];

export default function PontosView({ onToggleMenu }: { onToggleMenu: () => void }) {
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [selectedPonto, setSelectedPonto] = useState<Ponto | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pontos, setPontos] = useState<Ponto[]>(MOCK_PONTOS);

  // New Ponto Form State
  const [newPonto, setNewPonto] = useState({
    titulo: '',
    categoria: 'ORIXÁS',
    youtubeUrl: '',
    descricao: ''
  });

  const categories = ['TODOS', 'ORIXÁS', 'CABOCLOS', 'PRETOS VELHOS'];

  const filteredPontos = activeCategory === 'TODOS' 
    ? pontos 
    : pontos.filter(p => p.categoria === activeCategory);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddPonto = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = getYoutubeId(newPonto.youtubeUrl);
    
    if (!videoId) {
      alert('URL do YouTube inválida!');
      return;
    }

    const ponto: Ponto = {
      id: Date.now().toString(),
      ...newPonto,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };

    setPontos([ponto, ...pontos]);
    setShowAddModal(false);
    setNewPonto({ titulo: '', categoria: 'ORIXÁS', youtubeUrl: '', descricao: '' });
  };

  return (
    <motion.div 
      key="pontos"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="px-6 pt-16 pb-32"
    >
      {/* Header with Menu Button */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h1 className="text-[32px] font-black text-[#414141] leading-tight">Biblioteca</h1>
          <p className="text-[11px] font-bold text-[#941c1c] opacity-30 uppercase tracking-[0.2em]">Cânticos Sagrados</p>
        </div>
        <button 
          onClick={onToggleMenu}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg border border-black/5 text-[#414141] active:scale-90 transition-transform"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[45px] bg-white/60 p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-white/40">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#941c1c]/40 uppercase">CONHECIMENTO</p>
            <h1 className="text-[44px] font-black text-[#941c1c] leading-tight mt-1">Pontos</h1>
            <p className="text-[13px] font-medium text-[#941c1c]/40 mt-3 max-w-[200px] leading-relaxed">
              Cânticos sagrados e fundamentos da nossa umbanda
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddModal(true)}
            className="h-16 w-16 rounded-[22px] bg-[#941c1c] text-white flex items-center justify-center shadow-lg shadow-[#941c1c]/20 transition-colors hover:bg-[#7a1717]"
          >
            <Plus className="h-8 w-8" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-10 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-[20px] px-7 py-4 text-[11px] font-black transition-all duration-300 shadow-sm ${
              activeCategory === cat 
                ? 'bg-[#941c1c] text-white shadow-[#941c1c]/20' 
                : 'bg-white text-[#414141]/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List of Pontos */}
      <div className="mt-8 grid gap-5">
        <AnimatePresence mode="popLayout">
          {filteredPontos.map((ponto) => (
            <motion.div
              layout
              key={ponto.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative overflow-hidden rounded-[35px] bg-white p-5 shadow-[0_15px_35px_rgba(0,0,0,0.03)] border border-black/5"
              onClick={() => setSelectedPonto(ponto)}
            >
              <div className="flex gap-5">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[25px]">
                  <img src={ponto.thumbnail} alt={ponto.titulo} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <div className="h-10 w-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl">
                      <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-[#941c1c] uppercase tracking-[0.2em]">{ponto.categoria}</span>
                  <h3 className="text-xl font-bold text-[#414141] mt-1 leading-tight">{ponto.titulo}</h3>
                  <p className="text-[12px] text-[#414141]/40 mt-2 line-clamp-1">{ponto.descricao}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Ponto Detail Modal */}
      <AnimatePresence>
        {selectedPonto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPonto(null)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[70] max-h-[90vh] overflow-y-auto rounded-t-[45px] bg-white p-8 shadow-2xl"
            >
              <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-black/10" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#941c1c]/10 text-[#941c1c]">
                  <Youtube className="h-6 w-6" />
                </div>
                <button onClick={() => setSelectedPonto(null)} className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center">
                  <X className="h-5 w-5 text-[#414141]/40" />
                </button>
              </div>

              <div className="aspect-video w-full overflow-hidden rounded-[30px] bg-black shadow-2xl">
                <iframe
                  className="h-full w-full border-none"
                  src={`https://www.youtube.com/embed/${getYoutubeId(selectedPonto.youtubeUrl)}?autoplay=1`}
                  title={selectedPonto.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="mt-10">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#941c1c]/10 px-4 py-1.5 text-[10px] font-bold text-[#941c1c] uppercase tracking-widest">
                    {selectedPonto.categoria}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-[#414141] mt-5 leading-tight">{selectedPonto.titulo}</h2>
                
                <div className="mt-8 flex gap-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-[#fef7e7] flex items-center justify-center text-[#941c1c]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#414141]/30 uppercase tracking-widest">Letra</p>
                      <p className="text-[12px] font-bold text-[#414141]/60">Disponível</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 p-7 rounded-[35px] bg-[#fef7e7]/50 border border-[#fef7e7]">
                  <h4 className="text-[11px] font-bold text-[#414141]/30 uppercase tracking-[0.2em] mb-4">Descrição e Fundamento</h4>
                  <p className="text-sm font-medium text-[#414141]/70 leading-relaxed italic">
                    "{selectedPonto.descricao}"
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Ponto Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[70] rounded-t-[45px] bg-white p-8 shadow-2xl"
            >
              <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-black/10" />
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#414141]">Novo Ponto</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full bg-black/5">
                  <X className="h-5 w-5 text-[#414141]/40" />
                </button>
              </div>
              <form onSubmit={handleAddPonto} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#414141]/30 uppercase tracking-widest ml-4">Título do Ponto</label>
                  <input
                    required
                    type="text"
                    value={newPonto.titulo}
                    onChange={e => setNewPonto({...newPonto, titulo: e.target.value})}
                    placeholder="Ex: Ponto de Abertura"
                    className="w-full rounded-2xl bg-black/5 px-6 py-4 text-sm font-semibold outline-none focus:ring-2 ring-[#941c1c]/20 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#414141]/30 uppercase tracking-widest ml-4">YouTube URL</label>
                    <input
                      required
                      type="text"
                      value={newPonto.youtubeUrl}
                      onChange={e => setNewPonto({...newPonto, youtubeUrl: e.target.value})}
                      placeholder="https://youtu.be/..."
                      className="w-full rounded-2xl bg-black/5 px-6 py-4 text-sm font-semibold outline-none focus:ring-2 ring-[#941c1c]/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#414141]/30 uppercase tracking-widest ml-4">Categoria</label>
                    <select
                      value={newPonto.categoria}
                      onChange={e => setNewPonto({...newPonto, categoria: e.target.value})}
                      className="w-full rounded-2xl bg-black/5 px-6 py-4 text-sm font-semibold outline-none focus:ring-2 ring-[#941c1c]/20 transition-all appearance-none"
                    >
                      <option>ORIXÁS</option>
                      <option>CABOCLOS</option>
                      <option>PRETOS VELHOS</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#414141]/30 uppercase tracking-widest ml-4">Descrição / Fundamento</label>
                  <textarea
                    required
                    value={newPonto.descricao}
                    onChange={e => setNewPonto({...newPonto, descricao: e.target.value})}
                    placeholder="Descreva o fundamento deste ponto..."
                    rows={3}
                    className="w-full rounded-2xl bg-black/5 px-6 py-4 text-sm font-semibold outline-none focus:ring-2 ring-[#941c1c]/20 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#941c1c] py-5 text-sm font-bold text-white shadow-xl shadow-[#941c1c]/20 active:scale-[0.98] transition-all mt-4"
                >
                  Adicionar à Biblioteca
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
