import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Home,
  Music,
  ExternalLink,
  Plus,
  Heart,
  ChevronRight
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

interface HubViewProps {
  onToggleMenu: () => void;
}

const CARD_BACKGROUNDS = [
  'https://lh3.googleusercontent.com/gps-cs-s/APNQkAGoa5A5Ce-N1snt0FOXnWJ1bcUqXz9YbHz7uPS3jGkPmNl97FhltLFuAxVWq_nj3P-M07Cg30r3wYr4xbySemJas13hTdei3CeQRqzMlzlghoHGurgo2dBicqnIi0oEf7N3m_JucXS7JGTz=s680-w680-h510-rw',
  'https://lh3.googleusercontent.com/gps-cs-s/APNQkAEwoHUrf_jtmoEQshZZIl3vh28d-vkqtAXZphjhPwGtrVb1hesllCu52F4-GEHHoRZjQ_POsvc-jQCNB9jAFyNi7RSSg25_2VSSwzRpm4PdU7KYd9GKUJg3mtIK75SIjJycwLY1=s680-w680-h510-rw',
  'https://i.pinimg.com/736x/a2/84/1e/a2841eb35c5b60aefc8b4811be005d00.jpg',
  'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFk6z-rI4t37w1tC-x1CgYh7h4f6nL4qXhV2iN8N1w8F8C1S5J2F3V4F5J6F7F8F9F0F1F2F3F4F5F6F7F8F9F0=s680-w680-h510-rw',
  '/img/fundo-hero3.jpg',
  '/img/fundo-hero4.jpg',
  '/img/fundo-hero5.jpg'
];

const MOCK_STORIES = [
  {
    id: 'story_t7ca',
    terreiroId: 'terreiro_t7ca',
    terreiroNome: 'T7CA',
    avatar: '/img/logo-T7CA.png',
    title: 'Gira de Baianos',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDyiPfE85MG4_7MptuepDfcOhZZ6dtithSCSpCBsE4qkKE1CUWdNr9Ad4&s=10',
    activityDescription: 'Preparação para a Gira de Baianos com rezas, cânticos e defumação de ervas. Venha receber essa energia alegre!',
    timeAgo: '2h atrás'
  },
  {
    id: 'story_jurema',
    terreiroId: 'terreiro_jurema',
    terreiroNome: 'TUMA',
    avatar: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAHDK2s6zgk6Hb4TjdWjNn9EikVWVYHB5o3B1n3VqTlOsPSwfGLlD7QiSNuPUj03BTvX1h42ogDhR4zbEgvPVINZUm8235E1lILQGpTX3OMeKxPZrX_atOy3qxq-9Dwbk1HTBLb3=s680-w680-h510-rw',
    title: 'Festa de Ogum',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTie8vdDmJZwmMDznTClPAB_heXrC2J0Dv-FEFAP7w4oYyqE275ggg93dMJ&s=10',
    activityDescription: 'Celebração ao Pai Ogum, senhor dos caminhos e das batalhas. Cânticos, flores e partilha sagrada.',
    timeAgo: '4h atrás'
  },
  {
    id: 'story_penabranca',
    terreiroId: 'terreiro_penabranca',
    terreiroNome: 'Pena Branca',
    avatar: '/img/login/icone.webp',
    title: 'Trabalho de Cura',
    image: 'https://cdn.jornalopcao.com.br/assets/2024/03/IMG-20240329-WA0091.jpg',
    activityDescription: 'Sessão especial de passes magnéticos e curas espirituais guiada pelos caboclos e pretos velhos da floresta.',
    timeAgo: '6h atrás'
  }
];

export default function HubView({ onToggleMenu }: HubViewProps) {
  const { terreiros, events, pontos } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerreiro, setSelectedTerreiro] = useState<any | null>(null);

  // Stories States
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);

  // Auto-advance stories
  useEffect(() => {
    if (activeStoryIndex === null) return;

    const interval = setInterval(() => {
      if (!isStoryPaused) {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            if (activeStoryIndex < MOCK_STORIES.length - 1) {
              setActiveStoryIndex((curr) => curr !== null ? curr + 1 : null);
              return 0;
            } else {
              setActiveStoryIndex(null);
              return 0;
            }
          }
          return prev + 1; // 1% increment every 50ms = 5s total
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeStoryIndex, isStoryPaused]);

  // Reset progress when index changes
  useEffect(() => {
    setStoryProgress(0);
  }, [activeStoryIndex]);

  // Handle tap left or right on the story modal to skip/rewind
  const handleStoryTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeStoryIndex === null) return;
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const isLeft = x < width * 0.35; // left 35% goes back

    if (isLeft) {
      if (activeStoryIndex > 0) {
        setActiveStoryIndex(activeStoryIndex - 1);
      } else {
        setStoryProgress(0);
      }
    } else {
      if (activeStoryIndex < MOCK_STORIES.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
      } else {
        setActiveStoryIndex(null);
      }
    }
  };

  // Filter terreiros based on search term
  const filteredTerreiros = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return terreiros;
    return terreiros.filter(
      (t) =>
        t.nome.toLowerCase().includes(term) ||
        t.cidade.toLowerCase().includes(term) ||
        t.estado.toLowerCase().includes(term)
    );
  }, [terreiros, searchTerm]);

  // Events of selected terreiro
  const selectedTerreiroEvents = useMemo(() => {
    if (!selectedTerreiro) return [];
    return events.filter((e) => e.terreiroId === selectedTerreiro.id);
  }, [selectedTerreiro, events]);

  // Pontos of selected terreiro
  const selectedTerreiroPontos = useMemo(() => {
    if (!selectedTerreiro) return [];
    return pontos.filter((p) => p.terreiroId === selectedTerreiro.id);
  }, [selectedTerreiro, pontos]);

  const handleCloseDetail = () => {
    setSelectedTerreiro(null);
  };

  return (
    <motion.div
      key="hub"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      style={{ background: '#FFFFFF' }}
      className="h-full w-full box-border overflow-hidden relative z-10"
    >
      {/* Scrollable Container containing Header, Stories, Search and Cards (Insta style) */}
      <div className="h-full w-full overflow-y-auto no-scrollbar p-4 pb-28 relative z-10">

        {/* Centered Brand Mark & Header */}
        <div className="relative z-10 flex flex-col items-center justify-center mb-4 mt-4 shrink-0">
          {/* Burger Menu Toggle on the absolute right */}
          <button
            onClick={onToggleMenu}
            className="absolute right-0 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white active:scale-95 transition-all shadow-sm z-30"
          >
            <Menu className="h-5 w-5 text-[#8B0000]" strokeWidth={2.2} />
          </button>

          {/* Centered Brand Mark & Title */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/img/login/icone.webp"
              alt="Logo"
              className="h-9 w-9 object-contain mb-1.5"
              style={{
                filter: 'brightness(0) saturate(100%) invert(11%) sepia(77%) saturate(5487%) hue-rotate(351deg) brightness(96%) contrast(114%)'
              }}
            />
            <h1 className="text-[26px] font-normal leading-none font-behind text-[#8B0000]">
              Hub Ilê
            </h1>
            <p className="text-[8px] font-black tracking-[0.25em] text-[#414141]/45 uppercase mt-1.5">
              Descobrir Terreiros
            </p>
          </div>
        </div>

        {/* Stories Section (Horizontal Carousel) */}
        <div className="relative z-10 mb-4 shrink-0">
          <h2 className="text-[10px] font-black tracking-widest text-[#414141]/40 uppercase mb-2 text-left pl-1">
            Atividades Ativas
          </h2>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-1">
            {/* Creator Story placeholder */}
            <div className="flex flex-col items-center shrink-0">
              <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#8B0000]/35 flex items-center justify-center bg-[#FEF9ED]/60 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all">
                <Plus className="h-5 w-5 text-[#8B0000]/65" strokeWidth={2.5} />
              </div>
              <span className="text-[9.5px] font-bold text-[#414141]/50 text-center mt-1.5 leading-none">
                Divulgar
              </span>
            </div>

            {/* Render Active Stories */}
            {MOCK_STORIES.map((story, idx) => {
              const isStoryT7ca = story.terreiroId === 'terreiro_t7ca';
              const storyAccent = isStoryT7ca ? '#1565c0' : '#8B0000';
              return (
                <div
                  key={story.id}
                  onClick={() => {
                    setActiveStoryIndex(idx);
                    setStoryProgress(0);
                  }}
                  className="flex flex-col items-center shrink-0 cursor-pointer group"
                >
                  <div
                    className="p-[2.5px] rounded-full border-2 bg-white group-hover:scale-105 active:scale-95 transition-all shadow-sm"
                    style={{ borderColor: storyAccent }}
                  >
                    <div
                      className="h-14 w-14 rounded-full overflow-hidden bg-[#FAF4E9] border flex items-center justify-center p-0.5"
                      style={{ borderColor: storyAccent + '1a' }}
                    >
                      <img
                        src={story.avatar}
                        alt=""
                        className="h-full w-full object-contain rounded-full bg-white"
                      />
                    </div>
                  </div>
                  <span className="text-[9.5px] font-bold text-[#414141] text-center mt-1.5 leading-none max-w-[65px] truncate">
                    {story.terreiroNome}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Elegant iOS Search Bar */}
        <div className="relative z-10 mb-5 group shrink-0">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B0000]/40 group-focus-within:text-[#8B0000] transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[22px] bg-white py-3.5 pl-11 pr-10 text-[14px] font-medium outline-none transition-all placeholder:text-[#414141]/35 border border-[#8B0000]/10 focus:border-[#8B0000]/40 focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[0_4px_20px_rgba(139,0,0,0.02)]"
            placeholder="Buscar terreiro por nome ou cidade..."
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-black/5 hover:bg-black/10 text-black/40 hover:text-black transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sophisticated Cards Feed */}
        <div className="space-y-6">
          {filteredTerreiros.length > 0 ? (
            filteredTerreiros.map((terreiro, idx) => {
              const isT7ca = terreiro.id === 'terreiro_t7ca';
              const isJurema = terreiro.id === 'terreiro_jurema';
              const houseLogo = isT7ca
                ? '/img/logo-T7CA.png'
                : isJurema
                  ? 'https://instagram.fssa25-1.fna.fbcdn.net/v/t51.2885-19/209113156_403111601011697_1176465365621516809_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fssa25-1.fna.fbcdn.net&_nc_cat=105&_nc_oc=Q6cZ2gFJD5LW-m5DS4Qxid6x6WOAUflfgzGYfA8XoNu_NtLFLBqedWjoWQeKAt_D464QZes&_nc_ohc=cEuhaaJj98oQ7kNvwEoOYCv&_nc_gid=e10g7JHqewu6aRIFJM_vyQ&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AQCU68VMwh4_QojFFO0-_hGsney_rZrO-gxwgkX8GzOJ6w&oe=6A4D8D33&_nc_sid=8b3546'
                  : '/img/login/icone.webp';

              // Motto descriptions based on identity
              const motto = isT7ca
                ? "Sob a regência de Oxalá, abrindo caminhos de luz, paz e caridade."
                : terreiro.id === 'terreiro_jurema'
                  ? "Caridade, amor e fé sob as bênçãos dos Mensageiros de Aruanda."
                  : "Sabedoria na cura e caminhos abertos pela força dos Caboclos da floresta.";

              return (
                <motion.div
                  key={terreiro.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 150, damping: 18 }}
                  onClick={() => setSelectedTerreiro(terreiro)}
                  className="bg-white border border-black/[0.04] rounded-[36px] p-1.5 flex flex-col shadow-[0_16px_40px_rgba(65,65,65,0.04)] hover:shadow-[0_20px_48px_rgba(65,65,65,0.07)] transition-all duration-300 relative group cursor-pointer active:scale-[0.99]"
                >
                  {/* Image Section (Framed with padding) */}
                  <div className="relative w-full aspect-square rounded-[28px] overflow-hidden bg-black/5 shadow-sm">
                    <img
                      src={CARD_BACKGROUNDS[idx % CARD_BACKGROUNDS.length]}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[800ms] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/35 z-10" />

                    {/* Top-Left: Glass User Info Badge (Directly overlaid on photo with shadow) */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full overflow-hidden border border-white/20 p-0.5 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <img src={houseLogo} alt="" className="h-full w-full object-contain rounded-full bg-white" />
                      </div>
                      <span className="text-white text-[13px] font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {terreiro.dirigente}
                      </span>
                    </div>

                    {/* Bottom-Left: Stats/Comments indicator pill */}
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-[10.5px] font-bold shadow-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                        <span>1.2k</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-white/90" />
                        <span>Atividades</span>
                      </span>
                    </div>

                    {/* Bottom-Right: Scattered Active Community Indicators with heart badges */}
                    <div className="absolute bottom-4 right-4 z-20 h-16 w-16 select-none pointer-events-none">
                      {/* Avatar 1 */}
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                        className="absolute top-0 left-0 h-[26px] w-[26px] rounded-full border border-white bg-slate-300 overflow-hidden shadow-md z-10"
                      >
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" className="object-cover w-full h-full" alt="" />
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -3, 0], scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                        className="absolute top-4 left-4 bg-red-500 rounded-full p-0.5 border border-white shadow-sm flex items-center justify-center z-30 scale-90"
                      >
                        <Heart className="h-1.5 w-1.5 fill-white text-white" />
                      </motion.div>

                      {/* Avatar 2 */}
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut", delay: 0.2 }}
                        className="absolute top-3 right-0 h-[26px] w-[26px] rounded-full border border-white bg-slate-400 overflow-hidden shadow-md z-10"
                      >
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" className="object-cover w-full h-full" alt="" />
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -4, 0], scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut", delay: 0.2 }}
                        className="absolute top-7 right-2 bg-red-500 rounded-full p-0.5 border border-white shadow-sm flex items-center justify-center z-30 scale-90"
                      >
                        <Heart className="h-1.5 w-1.5 fill-white text-white" />
                      </motion.div>

                      {/* Avatar 3 */}
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.4 }}
                        className="absolute bottom-0 left-1 h-[26px] w-[26px] rounded-full border border-white bg-slate-500 overflow-hidden shadow-md z-10"
                      >
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" className="object-cover w-full h-full" alt="" />
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -2, 0], scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.4 }}
                        className="absolute bottom-0 right-4 bg-red-500 rounded-full p-0.5 border border-white shadow-sm flex items-center justify-center z-30 scale-90"
                      >
                        <Heart className="h-1.5 w-1.5 fill-white text-white" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Card Body - Profile row */}
                  <div className="flex items-center gap-2.5 mt-4 px-3.5">
                    <div
                      className="h-9 w-9 rounded-full overflow-hidden border bg-white flex items-center justify-center shrink-0 shadow-sm"
                      style={{ borderColor: '#8B00001a' }}
                    >
                      <img src={houseLogo} alt="" className="h-full w-full object-contain rounded-full" />
                    </div>
                    <div className="text-left">
                      <span className="block text-[13px] font-bold text-[#414141] leading-none">
                        {terreiro.dirigente}
                      </span>
                      <span className="block text-[9.5px] font-semibold text-[#414141]/50 mt-1 leading-none">
                        {terreiro.nome}
                      </span>
                    </div>
                  </div>

                  {/* Motto & Hashtags aligned left */}
                  <p className="text-[12.5px] font-medium text-[#414141]/75 leading-relaxed mt-3 px-3.5 text-left">
                    "{motto}" <span className="font-semibold ml-1" style={{ color: '#8B0000' }}>#Umbanda #Caridade {isT7ca ? '#Oxalá' : terreiro.id === 'terreiro_jurema' ? '#TUMA' : '#PenaBranca'}</span>
                  </p>

                  {/* Subtle Divider */}
                  <div className="border-b border-[#414141]/5 my-3.5 mx-3.5" />

                  {/* Action Footer */}
                  <div className="flex items-center justify-between mt-0.5 px-3.5 pb-2">
                    <div className="flex items-center gap-1.5 text-[#414141]/50 text-[10px] font-bold uppercase tracking-widest">
                      <MapPin className="h-3.5 w-3.5 text-[#8B0000]" />
                      <span>{terreiro.cidade} - {terreiro.estado}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTerreiro(terreiro);
                      }}
                      className="text-white text-[9.5px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all duration-200 bg-[#8B0000] hover:bg-[#8B0000]/90"
                    >
                      Conhecer
                    </button>
                  </div>

                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p className="text-sm font-bold text-[#414141]/40">Nenhum terreiro encontrado</p>
            </div>
          )}
        </div>

      </div>

      {/* Expanded Terreiro Detail Drawer */}
      <AnimatePresence>
        {selectedTerreiro && (
          <div className="fixed inset-0 z-[100] flex justify-center items-end max-w-[430px] mx-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDetail}
              className="absolute inset-0 bg-black/55 backdrop-blur-md"
            />

            {/* Slider Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute top-[45px] inset-x-0 bottom-0 bg-[#FEF9ED] rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden border-t border-black/5"
            >
              {/* Drag Bar */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-black/10 z-50" />

              {/* Close Button */}
              <div className="absolute top-5 right-5 z-50">
                <button
                  onClick={handleCloseDetail}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#414141] shadow-md border border-black/5 active:scale-90 transition-transform"
                >
                  <X className="h-5 w-5" strokeWidth={2.2} />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div className="flex-1 overflow-y-auto no-scrollbar pb-16 px-6 pt-10">
                {/* Header Info */}
                {(() => {
                  const detailAccent = '#8B0000';
                  return (
                    <>
                      <div className="flex flex-col items-center text-center mt-3 pb-5 border-b border-black/[0.04]">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-[22px] border mb-3 shadow-sm"
                          style={{ backgroundColor: detailAccent + '0d', borderColor: detailAccent + '1a', color: detailAccent }}
                        >
                          <Home className="h-7 w-7" strokeWidth={1.8} />
                        </div>
                        <h2 className="text-[28px] font-normal leading-tight font-behind-it px-4" style={{ color: detailAccent }}>
                          {selectedTerreiro.nome}
                        </h2>
                        <span
                          className="text-[8.5px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest mt-1"
                          style={{ backgroundColor: detailAccent + '0d', color: detailAccent }}
                        >
                          CÓDIGO CONVITE: {selectedTerreiro.id}
                        </span>

                        {/* Core Details Grid */}
                        <div className="mt-5 grid grid-cols-2 gap-4 w-full">
                          <div
                            className="bg-[#FAF4E9]/50 border p-3 rounded-2xl flex flex-col items-center"
                            style={{ borderColor: detailAccent + '0d' }}
                          >
                            <User className="h-5 w-5 opacity-60 mb-1" style={{ color: detailAccent }} />
                            <span className="text-[9px] font-black uppercase text-black/35 tracking-wider">Dirigente</span>
                            <span className="text-xs font-bold text-[#414141] mt-0.5 text-center truncate w-full">{selectedTerreiro.dirigente}</span>
                          </div>
                          <div
                            onClick={() => {
                              if (selectedTerreiro.id === 'terreiro_jurema') {
                                window.open('https://share.google/TbZcUqZkai0GNU1a5', '_blank');
                              }
                            }}
                            className={`bg-[#FAF4E9]/50 border p-3 rounded-2xl flex flex-col items-center ${selectedTerreiro.id === 'terreiro_jurema' ? 'cursor-pointer hover:bg-black/[0.03] active:scale-95 transition-all' : ''}`}
                            style={{ borderColor: detailAccent + '0d' }}
                          >
                            <MapPin className="h-5 w-5 opacity-60 mb-1" style={{ color: detailAccent }} />
                            <span className="text-[9px] font-black uppercase text-black/35 tracking-wider flex items-center gap-1">
                              Localização
                              {selectedTerreiro.id === 'terreiro_jurema' && <ExternalLink className="h-2.5 w-2.5" />}
                            </span>
                            <span className="text-xs font-bold text-[#414141] mt-0.5 text-center truncate w-full">{selectedTerreiro.cidade} - {selectedTerreiro.estado}</span>
                          </div>
                        </div>

                        {selectedTerreiro.contato && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#414141]/75">
                            <Phone className="h-4 w-4" style={{ color: detailAccent + '99' }} />
                            <span>Contato: {selectedTerreiro.contato}</span>
                          </div>
                        )}
                      </div>

                      {/* Section: Atividades e Eventos */}
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="h-5 w-5" style={{ color: detailAccent }} />
                          <h3 className="text-[13px] font-extrabold uppercase tracking-widest" style={{ color: detailAccent }}>
                            Calendário de Atividades
                          </h3>
                        </div>

                        <div className="space-y-2.5">
                          {selectedTerreiroEvents.length > 0 ? (
                            selectedTerreiroEvents.map((evt: any) => {
                              const dateObj = new Date(evt.date);
                              const day = dateObj.toLocaleDateString('pt-BR', { day: '2-digit' });
                              const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();

                              return (
                                <div
                                  key={evt.id}
                                  className="bg-[#FAF4E9]/55 border rounded-[22px] p-4 flex items-center gap-4 shadow-sm"
                                  style={{ borderColor: detailAccent + '0d' }}
                                >
                                  <div
                                    className="flex flex-col items-center justify-center w-11 h-11 rounded-[16px] border shrink-0"
                                    style={{ backgroundColor: detailAccent + '0d', borderColor: detailAccent + '1a' }}
                                  >
                                    <span className="text-[7.5px] font-black tracking-wider leading-none" style={{ color: detailAccent }}>{month}</span>
                                    <span className="text-lg font-bold leading-none mt-0.5" style={{ color: detailAccent }}>{day}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span
                                      className="inline-block px-2 py-0.5 rounded-full text-[7.5px] font-extrabold uppercase tracking-wider leading-none mb-1"
                                      style={{ backgroundColor: detailAccent + '0d', color: detailAccent }}
                                    >
                                      {evt.category}
                                    </span>
                                    <h4 className="text-[13.5px] font-bold text-[#414141] leading-tight truncate">
                                      {evt.title}
                                    </h4>
                                    <p className="text-[10px] font-semibold text-[#414141]/50 mt-0.5 truncate">
                                      {evt.time} · {evt.location}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="bg-[#FAF4E9]/30 rounded-2xl py-6 text-center border border-dashed border-black/5">
                              <p className="text-xs font-bold text-[#414141]/45">Nenhum evento agendado por esta casa.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section: Curimba / Pontos Cantados */}
                      <div className="mt-8">
                        <div className="flex items-center gap-2 mb-4">
                          <Music className="h-5 w-5" style={{ color: detailAccent }} />
                          <h3 className="text-[13px] font-extrabold uppercase tracking-widest" style={{ color: detailAccent }}>
                            Pontos Cantados (Curimba)
                          </h3>
                        </div>

                        <div className="space-y-2.5">
                          {selectedTerreiroPontos.length > 0 ? (
                            selectedTerreiroPontos.map((pt: any) => (
                              <div
                                key={pt.id}
                                className="bg-[#FAF4E9]/55 border rounded-[22px] p-4 flex items-center justify-between shadow-sm"
                                style={{ borderColor: detailAccent + '0d' }}
                              >
                                <div className="flex-1 min-w-0 pr-4">
                                  <span className="inline-block px-2 py-0.5 rounded-full text-[7.5px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-700 leading-none mb-1">
                                    {pt.categoria}
                                  </span>
                                  <h4 className="text-[13.5px] font-bold text-[#414141] leading-tight truncate">
                                    {pt.titulo}
                                  </h4>
                                  <p className="text-[10px] font-semibold text-[#414141]/50 mt-0.5 truncate">
                                    {pt.descricao || 'Ponto de terreiro'}
                                  </p>
                                </div>

                                {pt.youtubeUrl && (
                                  <a
                                    href={pt.youtubeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/10 hover:bg-red-600/15 border border-red-600/20 text-red-700 transition-colors active:scale-90"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="bg-[#FAF4E9]/30 rounded-2xl py-6 text-center border border-dashed border-black/5">
                              <p className="text-xs font-bold text-[#414141]/45">Nenhum ponto de terreiro gravado.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedTerreiro.observacoes && (
                        <div
                          className="mt-8 bg-[#FAF4E9]/40 border p-4 rounded-[22px]"
                          style={{ borderColor: detailAccent + '0d' }}
                        >
                          <h4 className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: detailAccent }}>Observações</h4>
                          <p className="text-[11.5px] font-medium text-[#414141]/75 leading-relaxed">
                            {selectedTerreiro.observacoes}
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Immersive Story Player Modal */}
      <AnimatePresence>
        {activeStoryIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md max-w-[430px] mx-auto overflow-hidden"
          >
            {/* Story Card Container */}
            <div
              className="relative w-full h-full flex flex-col justify-between p-4 pb-8"
              onTouchStart={() => setIsStoryPaused(true)}
              onTouchEnd={() => setIsStoryPaused(false)}
              onMouseDown={() => setIsStoryPaused(true)}
              onMouseUp={() => setIsStoryPaused(false)}
            >
              {/* Top Progress Segmented Indicators */}
              <div className="absolute top-4 inset-x-4 flex gap-1.5 z-20">
                {MOCK_STORIES.map((s, idx) => {
                  let width = '0%';
                  if (idx < activeStoryIndex) width = '100%';
                  if (idx === activeStoryIndex) width = `${storyProgress}%`;
                  return (
                    <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-[50ms] ease-linear"
                        style={{ width }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Story Header (Terreiro Info & X Close Button) */}
              <div className="flex items-center justify-between w-full mt-4 z-20 px-1">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-white/20 bg-white/10 p-0.5 overflow-hidden flex items-center justify-center">
                    <img
                      src={MOCK_STORIES[activeStoryIndex].avatar}
                      alt=""
                      className="h-full w-full object-contain rounded-full bg-white"
                    />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-white leading-none">
                      {MOCK_STORIES[activeStoryIndex].terreiroNome}
                    </span>
                    <span className="block text-[10px] font-medium text-white/60 mt-0.5 leading-none">
                      {MOCK_STORIES[activeStoryIndex].timeAgo}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-90 transition-all border border-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Center Story Visual with Tap Area overlay */}
              <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={handleStoryTap}
              />

              {/* Big High-Res Activity Picture in the Center */}
              <div className="flex-1 flex items-center justify-center px-2 py-4 z-10 pointer-events-none select-none">
                <div className="w-full aspect-[3/4] max-h-[60vh] rounded-[24px] overflow-hidden shadow-2xl border border-white/10 relative bg-black">
                  <img
                    src={MOCK_STORIES[activeStoryIndex].image}
                    alt={MOCK_STORIES[activeStoryIndex].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-12 flex flex-col justify-end">
                    <span
                      className="inline-block self-start px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-2 shadow-md"
                      style={{ backgroundColor: '#8B0000' }}
                    >
                      {MOCK_STORIES[activeStoryIndex].title}
                    </span>
                    <p className="text-[13px] font-semibold text-white/95 leading-relaxed text-left">
                      {MOCK_STORIES[activeStoryIndex].activityDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions CTA (Visitar Terreiro button) */}
              <div className="w-full flex justify-center z-20 px-2 mt-2">
                <button
                  onClick={() => {
                    const targetTerreiro = terreiros.find(t => t.id === MOCK_STORIES[activeStoryIndex!].terreiroId);
                    if (targetTerreiro) {
                      setSelectedTerreiro(targetTerreiro);
                    }
                    setActiveStoryIndex(null);
                  }}
                  className="w-full py-4 rounded-full text-white font-bold text-xs uppercase tracking-widest shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 border border-white/10"
                  style={{
                    backgroundColor: '#8B0000',
                    boxShadow: '0 20px 25px -5px rgba(139,0,0,0.2)'
                  }}
                >
                  <span>Visitar Terreiro</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
