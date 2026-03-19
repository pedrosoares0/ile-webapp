import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  Clock,
  FileText,
  Play,
  Plus,
  X,
  Youtube,
} from 'lucide-react';
import { useState } from 'react';
import EmptyStateCard from '../components/EmptyStateCard';
import SheetModal from '../components/SheetModal';
import { useAppData } from '../context/AppDataContext';
import { createId } from '../lib/id';
import { buildYoutubeThumbnail, getYoutubeId } from '../lib/youtube';
import { PONTO_CATEGORIES, Ponto, PontoCategory } from '../types';

interface PontoFormState {
  titulo: string;
  categoria: PontoCategory;
  youtubeUrl: string;
  descricao: string;
  terreiroId: string;
  letra: string;
}

function getDefaultPontoForm(terreiroId: string): PontoFormState {
  return {
    titulo: '',
    categoria: 'ORIXÁS',
    youtubeUrl: '',
    descricao: '',
    terreiroId,
    letra: '',
  };
}

export default function PontosView() {
  const { pontos, terreiros, savePonto } = useAppData();
  const [activeCategory, setActiveCategory] = useState<PontoCategory | 'TODOS'>('TODOS');
  const [selectedPonto, setSelectedPonto] = useState<Ponto | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pontoForm, setPontoForm] = useState<PontoFormState>(() =>
    getDefaultPontoForm(terreiros[0]?.id ?? ''),
  );

  const categories: Array<PontoCategory | 'TODOS'> = ['TODOS', ...PONTO_CATEGORIES];
  const filteredPontos =
    activeCategory === 'TODOS' ? pontos : pontos.filter((ponto) => ponto.categoria === activeCategory);

  function getTerreiroName(terreiroId: string) {
    return terreiros.find((terreiro) => terreiro.id === terreiroId)?.nome ?? 'Terreiro não encontrado';
  }

  function openCreateModal() {
    setFormError(null);
    setPontoForm(getDefaultPontoForm(terreiros[0]?.id ?? ''));
    setShowAddModal(true);
  }

  function closeCreateModal() {
    setFormError(null);
    setShowAddModal(false);
  }

  function handleAddPonto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const videoId = getYoutubeId(pontoForm.youtubeUrl);

    if (!videoId) {
      setFormError('Informe uma URL válida do YouTube para cadastrar o ponto.');
      return;
    }

    if (!pontoForm.terreiroId) {
      setFormError('Cadastre ao menos um terreiro antes de criar pontos.');
      return;
    }

    savePonto({
      id: createId('ponto'),
      titulo: pontoForm.titulo.trim(),
      categoria: pontoForm.categoria,
      youtubeUrl: pontoForm.youtubeUrl.trim(),
      descricao: pontoForm.descricao.trim(),
      thumbnail: buildYoutubeThumbnail(videoId),
      terreiroId: pontoForm.terreiroId,
      letra: pontoForm.letra.trim(),
      createdAt: new Date().toISOString(),
    });

    closeCreateModal();
  }

  return (
    <motion.div
      key="pontos"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="px-6 pb-32 pt-16"
    >
      <div className="relative overflow-hidden rounded-[45px] border border-white/40 bg-white/60 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#941c1c]/40">BIBLIOTECA</p>
            <h1 className="mt-1 text-[44px] font-black leading-tight text-[#941c1c]">Pontos</h1>
            <p className="mt-3 max-w-[220px] text-[13px] font-medium leading-relaxed text-[#941c1c]/40">
              Cânticos sagrados, letras e fundamentos organizados por terreiro.
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={openCreateModal}
            className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#941c1c] text-white shadow-lg shadow-[#941c1c]/20 transition-colors hover:bg-[#7a1717]"
            aria-label="Adicionar ponto"
          >
            <Plus className="h-8 w-8" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      <div className="scrollbar-hide mt-10 flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap rounded-[20px] px-7 py-4 text-[11px] font-black shadow-sm transition-all duration-300 ${
              activeCategory === category
                ? 'bg-[#941c1c] text-white shadow-[#941c1c]/20'
                : 'border border-[#941c1c]/5 bg-white text-[#941c1c]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {filteredPontos.length > 0 ? (
          filteredPontos.map((ponto) => (
            <motion.button
              key={ponto.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPonto(ponto)}
              className="group relative h-[220px] w-full cursor-pointer overflow-hidden rounded-[45px] shadow-xl"
            >
              <img
                src={ponto.thumbnail}
                alt={ponto.titulo}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between gap-4">
                <div className="text-left">
                  <span className="mb-3 inline-block rounded-full border border-white/20 bg-white/20 px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                    {ponto.categoria}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight text-white">{ponto.titulo}</h3>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                    {getTerreiroName(ponto.terreiroId)}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/20 shadow-lg backdrop-blur-md transition-transform group-hover:scale-110">
                  <Play className="ml-1 h-6 w-6 fill-white text-white" />
                </div>
              </div>
            </motion.button>
          ))
        ) : (
          <EmptyStateCard
            icon={<FileText className="h-8 w-8 text-[#941c1c]/20" />}
            title="Nenhum ponto nesta categoria"
            description="Cadastre pontos, letras e links de referência para construir a biblioteca da casa."
          />
        )}
      </div>

      <SheetModal
        isOpen={showAddModal}
        title="Novo Ponto"
        subtitle="Adicionar à biblioteca"
        onClose={closeCreateModal}
      >
        <form onSubmit={handleAddPonto} className="space-y-6">
          {formError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-[#941c1c]/10 bg-white px-5 py-4 text-[#941c1c]">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-[13px] font-semibold leading-relaxed">{formError}</p>
            </div>
          ) : null}

          <div>
            <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
              Título do Ponto
            </label>
            <input
              required
              value={pontoForm.titulo}
              onChange={(event) => setPontoForm({ ...pontoForm, titulo: event.target.value })}
              placeholder="Ex: Ponto de Abertura"
              className="w-full rounded-[25px] border border-white bg-white/80 px-6 py-4 font-bold text-[#941c1c] placeholder:text-[#941c1c]/20 focus:outline-none focus:ring-2 focus:ring-[#941c1c]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
                Categoria
              </label>
              <select
                value={pontoForm.categoria}
                onChange={(event) =>
                  setPontoForm({ ...pontoForm, categoria: event.target.value as PontoCategory })
                }
                className="w-full appearance-none rounded-[25px] border border-white bg-white/80 px-6 py-4 font-bold text-[#941c1c] focus:outline-none focus:ring-2 focus:ring-[#941c1c]/20"
              >
                {PONTO_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
                Terreiro
              </label>
              <div className="relative">
                <Building2 className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#941c1c]/20" />
                <select
                  value={pontoForm.terreiroId}
                  onChange={(event) => setPontoForm({ ...pontoForm, terreiroId: event.target.value })}
                  className="w-full appearance-none rounded-[25px] border border-white bg-white/80 px-14 py-4 font-bold text-[#941c1c] focus:outline-none focus:ring-2 focus:ring-[#941c1c]/20"
                >
                  {terreiros.map((terreiro) => (
                    <option key={terreiro.id} value={terreiro.id}>
                      {terreiro.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
              Link do YouTube
            </label>
            <input
              required
              value={pontoForm.youtubeUrl}
              onChange={(event) => setPontoForm({ ...pontoForm, youtubeUrl: event.target.value })}
              placeholder="https://youtu.be/..."
              className="w-full rounded-[25px] border border-white bg-white/80 px-6 py-4 font-bold text-[#941c1c] placeholder:text-[#941c1c]/20 focus:outline-none focus:ring-2 focus:ring-[#941c1c]/20"
            />
          </div>

          <div>
            <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
              Descrição / Fundamento
            </label>
            <textarea
              required
              value={pontoForm.descricao}
              onChange={(event) => setPontoForm({ ...pontoForm, descricao: event.target.value })}
              rows={3}
              placeholder="Conte a história ou fundamento deste ponto..."
              className="w-full resize-none rounded-[25px] border border-white bg-white/80 px-6 py-4 font-bold text-[#941c1c] placeholder:text-[#941c1c]/20 focus:outline-none focus:ring-2 focus:ring-[#941c1c]/20"
            />
          </div>

          <div>
            <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
              Letra
            </label>
            <textarea
              value={pontoForm.letra}
              onChange={(event) => setPontoForm({ ...pontoForm, letra: event.target.value })}
              rows={4}
              placeholder="Digite a letra do ponto para consulta interna."
              className="w-full resize-none rounded-[25px] border border-white bg-white/80 px-6 py-4 font-bold text-[#941c1c] placeholder:text-[#941c1c]/20 focus:outline-none focus:ring-2 focus:ring-[#941c1c]/20"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-[28px] bg-[#941c1c] py-6 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-[#941c1c]/20 transition-all active:scale-[0.98]"
          >
            SALVAR PONTO
          </button>
        </form>
      </SheetModal>

      <AnimatePresence>
        {selectedPonto ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPonto(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative h-full w-full max-w-[430px] overflow-y-auto rounded-t-[45px] bg-[#fef7e7]"
            >
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
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                    <Youtube className="h-12 w-12 text-white/20" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPonto(null)}
                  className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md"
                  aria-label="Fechar player"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-[#941c1c] px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white">
                    {selectedPonto.categoria}
                  </span>
                  <div className="flex items-center gap-2 text-[#941c1c]/40">
                    <Clock className="h-4 w-4" />
                    <span className="text-[11px] font-bold tracking-widest">Biblioteca Ilê</span>
                  </div>
                </div>

                <h2 className="mt-6 text-[32px] font-black leading-tight text-[#414141]">{selectedPonto.titulo}</h2>

                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#941c1c]/40">
                  {getTerreiroName(selectedPonto.terreiroId)}
                </p>

                <p className="mt-6 text-[14px] font-medium leading-relaxed text-[#414141]/60">
                  {selectedPonto.descricao}
                </p>

                <div className="mt-10 rounded-[35px] border border-white bg-white/60 p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#941c1c]/5">
                      <FileText className="h-4 w-4 text-[#941c1c]/30" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#941c1c]/30">
                      LETRA & FUNDAMENTO
                    </span>
                  </div>

                  <div className="space-y-4 text-sm font-bold leading-loose text-[#941c1c]">
                    {selectedPonto.letra ? (
                      selectedPonto.letra.split('\n').map((line, index) => <p key={index}>{line}</p>)
                    ) : (
                      <p>Letra ainda não cadastrada.</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPonto(null)}
                  className="mt-8 w-full rounded-[28px] bg-[#941c1c] py-6 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-[#941c1c]/20 transition-all active:scale-[0.98]"
                >
                  CONCLUIR
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
