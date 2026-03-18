import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Play, Clock, Youtube, FileText } from 'lucide-react';
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

export default function PontosView() {
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
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[45px] bg-white/60 p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.02)] border border-white/40">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#941c1c]/40 uppercase">BIBLIOTECA</p>
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
                : 'bg-white text-[#941c1c] border border-[#941c1c]/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Pontos Cards */}
      <div className="mt-8 space-y-6">
        {filteredPontos.map((ponto) => (
          <motion.div
            key={ponto.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedPonto(ponto)}
            className="relative h-[220px] w-full overflow-hidden rounded-[45px] shadow-xl group cursor-pointer"
          >
            <img src={ponto.thumbnail} alt={ponto.titulo} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div>
                <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-[9px] font-bold text-white uppercase tracking-widest mb-3 border border-white/20">
                  {ponto.categoria}
                </span>
                <h3 className="text-2xl font-bold text-white tracking-tight">{ponto.titulo}</h3>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">TERREIRO DE UMBANDA T7CA</p>
              </div>
              
              <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="h-6 w-6 text-white fill-white ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Video Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-[430px] bg-[#fef7e7] p-8 rounded-t-[45px] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-[32px] font-black text-[#941c1c]">Novo Ponto</h2>
                  <p className="text-[12px] font-bold text-[#941c1c]/40 uppercase tracking-widest">Adicionar à biblioteca</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="h-12 w-12 rounded-full bg-[#941c1c]/5 text-[#941c1c] flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddPonto} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[#941c1c]/40 uppercase tracking-widest ml-4 mb-2 block">Título do Ponto</label>
                  <input 
                    required
                    value={newPonto.titulo}
                    onChange={e => setNewPonto({...newPonto, titulo: e.target.value})}
                    placeholder="Ex: Ponto de Abertura"
                    className="w-full rounded-[25px] bg-white/80 border border-white px-6 py-4 text-[#941c1c] font-bold placeholder:text-[#941c1c]/20 focus:outline-none focus:ring-2 focus:ring-[#941c1c]/20"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#941c1c]/40 uppercase tracking-widest ml-4 mb-2 block">Categoria</label>
                  <select 
                    value={newPonto.categoria}
                    onChange={e => setNewPonto({...newPonto, categoria: e.target.value})}
                    className="w-full rounded-[25px] bg-white/80 border border-white px-6 py-4 text-[#941c1c] font-bold focus:outline-none focus:ring-2 focus:ring-[#941c1c]/20 appearance-none"
                  >
                    {categories.filter(c => c !== 'TODOS').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#941c1c]/40 uppercase tracking-widest ml-4 mb-2 block">Link do YouTube</label>
                  <input 
                    required
                    value={newPonto.youtubeUrl}
                    onChange={e => setNewPonto({...newPonto, youtubeUrl: e.target.value})}
                    placeholder="https://youtu.be/..."
                    className="w-full rounded-[25px] bg-white/80 border border-white px-6 py-4 text-[#941c1c] font-bold placeholder:text-[#941c1c]/20 focus:outline-none focus:ring-2 focus:ring-[#941c1c]/20"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#941c1c]/40 uppercase tracking-widest ml-4 mb-2 block">Descrição / Fundamento</label>
                  <textarea 
                    required
                    value={newPonto.descricao}
                    onChange={e => setNewPonto({...newPonto, descricao: e.target.value})}
                    rows={3}
                    placeholder="Conte a história ou fundamento deste ponto..."
                    className="w-full rounded-[25px] bg-white/80 border border-white px-6 py-4 text-[#941c1c] font-bold placeholder:text-[#941c1c]/20 focus:outline-none focus:ring-2 focus:ring-[#941c1c]/20 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full rounded-[28px] bg-[#941c1c] py-6 text-sm font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-[#941c1c]/20 transition-all active:scale-[0.98] mt-4"
                >
                  SALVAR PONTO
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Player Modal */}
      <AnimatePresence>
        {selectedPonto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPonto(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-[430px] h-full bg-[#fef7e7] overflow-y-auto rounded-t-[45px]"
            >
              {/* Video Area */}
              <div className="relative aspect-video w-full bg-black">
                {getYoutubeId(selectedPonto.youtubeUrl) ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${getYoutubeId(selectedPonto.youtubeUrl)}?autoplay=1`}
                    title={selectedPonto.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    className="absolute inset-0"
                  ></iframe>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                    <Youtube className="h-12 w-12 text-white/20" />
                  </div>
                )}
                <button 
                  onClick={() => setSelectedPonto(null)}
                  className="absolute top-6 right-6 z-10 h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md border border-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#941c1c] px-5 py-2 text-[10px] font-bold text-white uppercase tracking-widest">
                    {selectedPonto.categoria}
                  </span>
                  <div className="flex items-center gap-2 text-[#941c1c]/40">
                    <Clock className="h-4 w-4" />
                    <span className="text-[11px] font-bold tracking-widest">4:20</span>
                  </div>
                </div>

                <h2 className="mt-6 text-[32px] font-black text-[#414141] leading-tight">
                  {selectedPonto.titulo}
                </h2>

                <p className="mt-6 text-[14px] leading-relaxed text-[#414141]/60 font-medium">
                  {selectedPonto.descricao}
                </p>

                {/* Letra & Fundamento Section */}
                <div className="mt-10 rounded-[35px] bg-white/60 p-8 border border-white shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-full bg-[#941c1c]/5 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-[#941c1c]/30" />
                    </div>
                    <span className="text-[10px] font-black text-[#941c1c]/30 uppercase tracking-[0.2em]">LETRA & FUNDAMENTO</span>
                  </div>
                  
                  <div className="space-y-4 text-[#941c1c] font-bold text-sm leading-loose">
                    <p>"Ele vem na gira,</p>
                    <p>Pra salvar quem tem fé!"</p>
                  </div>
                </div>

                {/* Concluir Button */}
                <button 
                  onClick={() => setSelectedPonto(null)}
                  className="mt-8 w-full rounded-[28px] bg-[#941c1c] py-6 text-sm font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-[#941c1c]/20 transition-all active:scale-[0.98]"
                >
                  CONCLUIR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
