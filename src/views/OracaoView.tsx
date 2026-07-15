import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Flame, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

interface PrayerRequest {
  id: string;
  name: string;
  type: 'Saúde' | 'Espiritual' | 'Família' | 'Proteção' | 'Agradecimento' | 'Outros';
  content: string;
  mentalizedCount: number;
  mentalizedByMe: boolean;
  createdAt: string;
  terreiroId: string;
}

const SEED_PRAYERS: PrayerRequest[] = [
  {
    id: 'pr_1',
    name: 'Maria das Graças',
    type: 'Saúde',
    content: 'Peço orações pela saúde física e recuperação cirúrgica do meu irmão José.',
    mentalizedCount: 14,
    mentalizedByMe: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    terreiroId: 'terreiro_t7ca'
  },
  {
    id: 'pr_2',
    name: 'Anônimo',
    type: 'Espiritual',
    content: 'Pela harmonia espiritual do nosso terreiro e proteção das nossas giras semanais.',
    mentalizedCount: 22,
    mentalizedByMe: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    terreiroId: 'terreiro_t7ca'
  },
  {
    id: 'pr_3',
    name: 'Carlos Oliveira',
    type: 'Agradecimento',
    content: 'Agradeço aos guias e protetores pelo caminho aberto e pela cura alcançada.',
    mentalizedCount: 8,
    mentalizedByMe: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    terreiroId: 'terreiro_t7ca'
  }
];

export default function OracaoView({ onBack }: { onBack: () => void }) {
  const { currentAccount } = useAppData();
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formType, setFormType] = useState<PrayerRequest['type']>('Espiritual');
  const [formContent, setFormContent] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Load prayers from LocalStorage or fallback to seeds
  useEffect(() => {
    const key = `ile_prayers_${currentAccount?.terreiroId || 'default'}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setPrayers(JSON.parse(stored));
      } catch (e) {
        setPrayers(SEED_PRAYERS);
      }
    } else {
      setPrayers(SEED_PRAYERS);
      localStorage.setItem(key, JSON.stringify(SEED_PRAYERS));
    }
  }, [currentAccount]);

  // Save to LocalStorage helper
  const saveToStorage = (updatedPrayers: PrayerRequest[]) => {
    const key = `ile_prayers_${currentAccount?.terreiroId || 'default'}`;
    localStorage.setItem(key, JSON.stringify(updatedPrayers));
    setPrayers(updatedPrayers);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) return;

    const newRequest: PrayerRequest = {
      id: `pr_${Date.now()}`,
      name: isAnonymous ? 'Anônimo' : (formName.trim() || 'Membro do Terreiro'),
      type: formType,
      content: formContent.trim(),
      mentalizedCount: 1,
      mentalizedByMe: true, // Auto-mentalize mine
      createdAt: new Date().toISOString(),
      terreiroId: currentAccount?.terreiroId || 'default'
    };

    const updated = [newRequest, ...prayers];
    saveToStorage(updated);

    // Reset Form
    setFormName('');
    setIsAnonymous(false);
    setFormType('Espiritual');
    setFormContent('');
    setShowAddForm(false);

    // Show Toast
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleMentalize = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = prayers.map(pr => {
      if (pr.id === id) {
        const alreadyMentalized = pr.mentalizedByMe;
        return {
          ...pr,
          mentalizedCount: alreadyMentalized ? pr.mentalizedCount - 1 : pr.mentalizedCount + 1,
          mentalizedByMe: !alreadyMentalized
        };
      }
      return pr;
    });
    saveToStorage(updated);
  };

  // Filter prayers for the current terreiro
  const filteredPrayers = useMemo(() => {
    const tId = currentAccount?.terreiroId || 'default';
    return prayers.filter(pr => pr.terreiroId === tId);
  }, [prayers, currentAccount]);

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
        <div className="absolute w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/10 blur-[60px] -top-[18%] -left-[10%] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute w-[80vw] h-[80vw] rounded-full bg-gradient-to-tr from-orange-400/40 to-yellow-600/15 blur-[70px] -top-[20%] -right-[15%] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between h-14 w-full z-10 mb-8">
        <button 
          onClick={onBack}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08),_0_2px_6px_rgba(0,0,0,0.04)] border border-zinc-100 text-zinc-800 active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
        
        <div className="w-full text-center px-14">
          <h1 className="text-3xl font-bold text-amber-700 leading-none font-behind-it">Corrente de Oração</h1>
          <p className="text-[9px] font-bold text-[#414141]/40 uppercase tracking-[0.2em] mt-1.5 leading-relaxed">
            Pedidos e Mentalizações da Casa
          </p>
        </div>
      </div>

      {/* Hero Quote Block */}
      <div className="relative z-10 p-5 rounded-[28px] bg-amber-500/5 border border-amber-600/10 mb-6 flex gap-4 items-start">
        <div className="p-2 rounded-xl bg-amber-600/10 text-amber-700 shrink-0">
          <Flame className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-[13px] font-extrabold text-amber-900 tracking-tight leading-none mb-1">
            Corrente Magnética de Umbanda
          </h4>
          <p className="text-[11.5px] leading-relaxed text-amber-800/80 font-medium">
            Emane boas energias. Quando clicamos em mentalizar, firmamos nossa intenção e acendemos uma vela virtual em apoio ao pedido do irmão.
          </p>
        </div>
      </div>

      {/* Prayers list */}
      <div className="relative z-10 space-y-4">
        {filteredPrayers.length > 0 ? (
          filteredPrayers.map((pr) => (
            <motion.div
              key={pr.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-[28px] bg-white border border-zinc-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:border-zinc-200 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-[6px] text-[8.5px] font-black uppercase tracking-widest leading-none bg-amber-600/10 text-amber-800 border border-amber-600/5">
                      {pr.type}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-semibold tracking-tight">
                      {new Date(pr.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <span className="text-[11.5px] font-extrabold text-zinc-700 font-sans tracking-tight">
                    {pr.name}
                  </span>
                </div>

                <p className="text-[13px] leading-relaxed text-zinc-600 font-medium">
                  "{pr.content}"
                </p>
              </div>

              {/* Action Candle firmamento */}
              <div className="flex items-center justify-between border-t border-zinc-100 mt-4.5 pt-3.5">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pr.mentalizedByMe ? 'bg-amber-500' : 'bg-zinc-300'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${pr.mentalizedByMe ? 'bg-amber-600' : 'bg-zinc-400'}`}></span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-bold tracking-tight">
                    {pr.mentalizedCount} {pr.mentalizedCount === 1 ? 'vela firmada' : 'velas firmadas'}
                  </span>
                </div>

                <motion.button
                  onClick={(e) => handleMentalize(pr.id, e)}
                  whileTap={{ scale: 0.94 }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95 ${
                    pr.mentalizedByMe
                      ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  <Flame className={`h-3.5 w-3.5 ${pr.mentalizedByMe ? 'text-amber-600 fill-amber-500 animate-pulse' : 'text-zinc-400'}`} />
                  <span>{pr.mentalizedByMe ? 'Mentalizado!' : 'Mentalizar'}</span>
                </motion.button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-[32px] bg-zinc-50 border border-zinc-100 py-12 px-6 text-center shadow-xs">
            <Heart className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-zinc-800">Nenhum pedido ativo</h4>
            <p className="text-xs text-zinc-400 font-medium mt-1 px-4 leading-relaxed">
              Tudo em paz na comunidade. Se precisar, você pode registrar o primeiro pedido de orações.
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Request Button */}
      <motion.button
        onClick={() => setShowAddForm(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-6 bottom-24 h-14 w-14 rounded-full bg-amber-700 text-white flex items-center justify-center shadow-xl shadow-amber-700/20 active:scale-95 transition-all z-40 border border-amber-800/10"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </motion.button>

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
                <h3 className="text-xl font-bold text-zinc-800 font-behind-it">Firmar Pedido de Oração</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 active:scale-90"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-5 flex-1 pb-10">
                {/* Author Name */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Seu Nome</label>
                    <label className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded-sm border-zinc-300 text-amber-600 focus:ring-amber-500" 
                      />
                      <span>Enviar como Anônimo</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={isAnonymous}
                    placeholder={isAnonymous ? 'Seu nome ficará oculto' : 'Digite seu nome completo'}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-amber-600/30 focus:ring-0 focus:outline-hidden transition-all duration-300 disabled:opacity-50 disabled:bg-zinc-100"
                  />
                </div>

                {/* Request Type */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Intenção do Pedido</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as PrayerRequest['type'])}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-amber-600/30 focus:ring-0 focus:outline-hidden transition-all duration-300"
                  >
                    <option value="Espiritual">Espiritualidade e Harmonia</option>
                    <option value="Saúde">Cura e Saúde Física</option>
                    <option value="Família">Paz na Família</option>
                    <option value="Proteção">Proteção e Descarrego</option>
                    <option value="Agradecimento">Agradecimento / Graça Alcançada</option>
                    <option value="Outros">Outras intenções</option>
                  </select>
                </div>

                {/* Description Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Descrição / Pedido</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escreva aqui sua intenção de forma respeitosa e clara..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[13.5px] text-[#414141] font-semibold focus:bg-white focus:border-amber-600/30 focus:ring-0 focus:outline-hidden transition-all duration-300 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full text-sm font-bold text-white active:scale-[0.97] transition-transform duration-150 ease-out flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(180deg, #7DD3FC 0%, #38BDF8 40%, #0EA5E9 100%)',
                      border: '1.5px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 4px 15px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    <Sparkles className="h-4.5 w-4.5" />
                    <span>Firmar e Emanar Vibração</span>
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
            <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="min-w-0">
              <h5 className="text-[12.5px] font-black leading-none">Pedido Enviado com Sucesso!</h5>
              <p className="text-[10px] text-zinc-400 font-medium mt-1">Sua vela virtual foi firmada na corrente.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
