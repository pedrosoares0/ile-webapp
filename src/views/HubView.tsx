import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
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
  ChevronRight,
  Sparkles,
  Play,
  Pause,
  Send,
  CheckCircle2,
  Volume2,
  Map,
  Share2,
  MoreHorizontal,
  Bookmark
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { parseLocalDate } from '../lib/date';
import { Terreiro } from '../types';

interface HubViewProps {
  onToggleMenu?: () => void;
  isGuestMode?: boolean;
  onExitGuest?: () => void;
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
    avatar: '/img/logo-T7CA.webp',
    title: 'GIRA DE BAIANOS',
    image: 'https://acdn-us.mitiendanube.com/stores/001/743/445/products/whatsapp-image-2023-10-19-at-19-28-36-0a2774e1b6724078cb16977551547981-1024-1024.webp',
    activityDescription: 'Preparação para a Gira de Baianos com rezas, cânticos e defumação de ervas. Venha receber essa energia alegre!',
    timeAgo: '2h atrás'
  },
  {
    id: 'story_jurema',
    terreiroId: 'terreiro_jurema',
    terreiroNome: 'TUMA',
    avatar: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAHDK2s6zgk6Hb4TjdWjNn9EikVWVYHB5o3B1n3VqTlOsPSwfGLlD7QiSNuPUj03BTvX1h42ogDhR4zbEgvPVINZUm8235E1lILQGpTX3OMeKxPZrX_atOy3qxq-9Dwbk1HTBLb3=s680-w680-h510-rw',
    title: 'FESTA DE OGUM',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnL8sG6xgK5EDhB3QrNFDD7N11XXV7BTWuhq9vNG70DJfXiCnSdhh-j-QFGrhipbNRx9-dUQxbNr53dEtVZbHLyFXlN8W-ieEn_3OPZU4gHBdE4c4B_iS1MmeGNJbbkECqj4XwT=s1360-w1360-h1020-rw',
    activityDescription: 'Celebração ao Pai Ogum, senhor dos caminhos e das batalhas. Cânticos, flores e partilha sagrada.',
    timeAgo: '4h atrás'
  },
  {
    id: 'story_penabranca',
    terreiroId: 'terreiro_penabranca',
    terreiroNome: 'Pena Branca',
    avatar: 'https://caminhosdaluzsm.com.br/wp-content/uploads/2023/08/01-29.jpg',
    title: 'CONFECÇÃO E VENDA DE GUIAS',
    image: 'https://acdn-us.mitiendanube.com/stores/002/945/397/products/guia-caboclo-pana-branca4-c27064ad74f11d762c17278971946703-1024-1024.webp',
    activityDescription: 'Guias e guias cruzadas sob encomenda confeccionadas com miçangas selecionadas, sementes e o axé dos Caboclos.',
    timeAgo: '6h atrás'
  },
  {
    id: 'story_iemanja',
    terreiroId: 'terreiro_t7ca',
    terreiroNome: 'Águas Sagradas',
    avatar: '/img/login/yemanjalogin.webp',
    title: 'GIRA DOS PRETOS VELHOS',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmpiNFgyL869JlfbzvWwctZ3UH-9s4FfD8TSulEqScJv4CpjX-CrEfBRNUEDab5yrBYEGD0MFl3_nO4OrT7LIh0ZXfW8IXn3keF2S07_MqZ9r60T7vivpL_OdijU12bg3wr-hWgow=s1360-w1360-h1020-rw',
    activityDescription: 'Atendimento e sabedoria com os vovôs e vovós de Aruanda. Calma, café e conselho amoroso.',
    timeAgo: '12h atrás'
  }
];

const MOCK_POSTS = [
  {
    id: 'post_baianos',
    terreiroId: 'terreiro_t7ca',
    terreiroNome: 'T7CA - Terreiro 7 Caminhos de Aruanda',
    dirigente: 'Pai Erick de Oxalá',
    avatar: '/img/logo-T7CA.webp',
    timeAgo: 'Há 2 horas',
    location: 'Salvador, BA',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDyiPfE85MG4_7MptuepDfcOhZZ6dtithSCSpCBsE4qkKE1CUWdNr9Ad4&s=10',
    caption: 'Preparação a todo vapor para a nossa grande Gira de Baianos! Ervas selecionadas, terreiro limpo e aroma de alfazema no ar. Venham com fé e de coração aberto para receber o axé dos nossos baianos. 🕊️✨',
    likesCount: 184,
    commentsCount: 23,
    mockReactions: ['coracao', 'concha', 'folha'] as const,
    hashtags: ['#Baianos', '#Umbanda', '#Axé', '#T7CA', '#Caridade']
  },
  {
    id: 'post_ogum',
    terreiroId: 'terreiro_jurema',
    terreiroNome: 'TUMA - Terreiro Umbanda Mãe Aruanda',
    dirigente: 'Mãe Jurema',
    avatar: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAHDK2s6zgk6Hb4TjdWjNn9EikVWVYHB5o3B1n3VqTlOsPSwfGLlD7QiSNuPUj03BTvX1h42ogDhR4zbEgvPVINZUm8235E1lILQGpTX3OMeKxPZrX_atOy3qxq-9Dwbk1HTBLb3=s680-w680-h510-rw',
    timeAgo: 'Há 5 horas',
    location: 'São Paulo, SP',
    image: 'https://www.salvadordabahia.com/capitalafro/wp-content/uploads/2023/05/Terreiro-Tumba-Junsara.-Destaques.-Foto-Arthur-Seabra-1920x900.jpg',
    caption: 'Homenagem abençoada ao Pai Ogum! Que sua espada de luz venha cortando toda demanda e abrindo os caminhos de todos os filhos e visitantes. Patacori Ogum! ⚔️🛡️',
    likesCount: 312,
    commentsCount: 47,
    mockReactions: ['coracao', 'folha'] as const,
    hashtags: ['#Ogum', '#Ogunhê', '#Fé', '#TUMA', '#Proteção']
  },
  {
    id: 'post_penabranca',
    terreiroId: 'terreiro_penabranca',
    terreiroNome: 'Terreiro Caboclo Pena Branca',
    dirigente: 'Pai Joaquim das Matas',
    avatar: 'https://caminhosdaluzsm.com.br/wp-content/uploads/2023/08/01-29.jpg',
    timeAgo: 'Há 8 horas',
    location: 'Belo Horizonte, MG',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWle0dMNGBypHbKG21jj6Ic9nIsq0XPZjlvYEuTxWw88lMtKnaqFWROu9BXBS2HPUF8CrBQ-DVPnKQUakWK-Jywt0vu0_67OX112xCmxH1votzY6iSgKzm6MkFuuw09OGYMxI0_4=s1360-w1360-h1020-rw',
    caption: 'Sessão de passe magnético e cura espiritual com os Caboclos da Jurema. Que a força das ervas e da mata sagrada renove as energias e traga paz ao coração de todos os irmãos. Okê Caboclo! 🌿🏹',
    likesCount: 256,
    commentsCount: 31,
    mockReactions: ['concha'] as const,
    hashtags: ['#Caboclos', '#PenaBranca', '#CuraEspiritual', '#OkêCaboclo', '#Passe']
  }
];

export default function HubView({ isGuestMode = false, onExitGuest }: HubViewProps) {
  const { terreiros, events, pontos } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const selectedFilter: string = 'todos'; // Filters removed from UI — always show all
  const [selectedTerreiro, setSelectedTerreiro] = useState<Terreiro | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'giras' | 'curimba' | 'oracao'>('info');

  // Favorites state
  const [favoritedIds, setFavoritedIds] = useState<string[]>(['terreiro_t7ca']);
  const [likedPosts, setLikedPosts] = useState<string[]>(['post_baianos']);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reactions state (postId -> reactionType)
  type ReactionType = 'coracao' | 'concha' | 'folha';
  const [reactions, setReactions] = useState<Record<string, ReactionType>>({ post_baianos: 'coracao' });
  const [openReactionPickerId, setOpenReactionPickerId] = useState<string | null>(null);

  const REACTIONS: { id: ReactionType; src: string; label: string; shadow: string }[] = [
    { id: 'coracao', src: '/img/reactions/coracao.webp', label: 'Axé', shadow: 'rgba(220,50,50,0.45)' },
    { id: 'concha', src: '/img/reactions/concha.webp', label: 'Búzios', shadow: 'rgba(200,170,110,0.45)' },
    { id: 'folha', src: '/img/reactions/folha.webp', label: 'Folha', shadow: 'rgba(60,150,60,0.45)' },
  ];

  const toggleReaction = (postId: string, reactionId: ReactionType) => {
    setReactions(prev => {
      const current = prev[postId];
      if (current === reactionId) {
        const next = { ...prev };
        delete next[postId];
        return next;
      }
      return { ...prev, [postId]: reactionId };
    });
    setOpenReactionPickerId(null);
  };

  // Audio simulator state
  const [playingPontoId, setPlayingPontoId] = useState<string | null>(null);
  const [expandedPontoLyric, setExpandedPontoLyric] = useState<string | null>(null);

  // Prayer Request state inside detail drawer
  const [prayerName, setPrayerName] = useState('');
  const [prayerType, setPrayerType] = useState('Saúde e cura');
  const [prayerContent, setPrayerContent] = useState('');
  const [prayerSuccess, setPrayerSuccess] = useState(false);

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

  const toggleFavorite = (terreiroId: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (favoritedIds.includes(terreiroId)) {
      setFavoritedIds(prev => prev.filter(id => id !== terreiroId));
      showToast(`Removido dos favoritos`);
    } else {
      setFavoritedIds(prev => [...prev, terreiroId]);
      showToast(`Favoritado: ${name}`);
    }
  };

  const toggleLikePost = (postId: string) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(prev => prev.filter(id => id !== postId));
    } else {
      setLikedPosts(prev => [...prev, postId]);
      showToast('Publicação curtida!');
    }
  };

  const toggleSavePost = (postId: string) => {
    if (savedPosts.includes(postId)) {
      setSavedPosts(prev => prev.filter(id => id !== postId));
      showToast('Removido dos salvos');
    } else {
      setSavedPosts(prev => [...prev, postId]);
      showToast('Publicação salva!');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

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

  // Filter terreiros based on search term & active filter tag
  const filteredTerreiros = useMemo(() => {
    let result = terreiros;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.nome.toLowerCase().includes(term) ||
          t.cidade.toLowerCase().includes(term) ||
          t.estado.toLowerCase().includes(term)
      );
    }

    if (selectedFilter === 'favoritos') {
      result = result.filter(t => favoritedIds.includes(t.id));
    } else if (selectedFilter === 'giras') {
      const terreirosWithEvents = new Set(events.map(e => e.terreiroId));
      result = result.filter(t => terreirosWithEvents.has(t.id));
    } else if (selectedFilter === 'curimba') {
      const terreirosWithPontos = new Set(pontos.map(p => p.terreiroId));
      result = result.filter(t => terreirosWithPontos.has(t.id));
    }

    return result;
  }, [terreiros, searchTerm, selectedFilter, favoritedIds, events, pontos]);

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
    setPlayingPontoId(null);
    setPrayerSuccess(false);
  };

  const handlePrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPrayerSuccess(true);
    setPrayerName('');
    setPrayerContent('');
    setTimeout(() => {
      setPrayerSuccess(false);
    }, 4000);
  };

  return (
    <motion.div
      key="hub"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      style={{ background: '#FAFAFA' }}
      className="h-full w-full box-border overflow-hidden relative z-10 font-inter"
    >
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[150] bg-[#8B0000] text-white px-4 py-2 rounded-full text-xs font-extrabold shadow-xl flex items-center gap-2 border border-white/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Soft & Sophisticated Guest Mode Header Top Banner */}
      {isGuestMode && (
        <div className="bg-white/80 backdrop-blur-md border-b border-black/5 text-[#414141] px-4 py-2.5 flex items-center justify-between shadow-xs relative z-30">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#8B0000] animate-pulse" />
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase tracking-wider text-[#8B0000] leading-none">Modo Visitante</span>
              <span className="block text-[9.5px] font-semibold text-[#414141]/60 mt-0.5 leading-none">Explore o Feed Ilê livremente</span>
            </div>
          </div>
          <button
            onClick={onExitGuest}
            className="bg-[#8B0000] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm hover:bg-[#8B0000]/90 active:scale-95 transition-all"
          >
            ENTRAR / CADASTRAR
          </button>
        </div>
      )}

      {/* Scrollable Main Container */}
      <div className="h-full w-full overflow-y-auto no-scrollbar p-4 pb-28 relative z-10">

        {/* Header Bar with Logo */}
        <div className="relative z-10 flex flex-col items-center justify-center mb-5 mt-2 shrink-0">
          <div className="flex flex-col items-center text-center">
            <img
              src="/img/login/icone.webp"
              alt="Ilê"
              className="h-9 w-9 object-contain mb-1.5"
              style={{
                filter: 'brightness(0) saturate(100%) invert(11%) sepia(77%) saturate(5487%) hue-rotate(351deg) brightness(96%) contrast(114%)'
              }}
            />
            <h1 className="text-[26px] font-normal leading-none font-behind text-[#8B0000]">
              Feed Ilê
            </h1>
          </div>
        </div>

        {/* Stories Carousel Section */}
        <div className="relative z-10 mb-4 shrink-0">
          <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1.5 px-1">
            {/* Create Story Action */}
            <div className="flex flex-col items-center shrink-0">
              <div className="h-[60px] w-[60px] rounded-full border-2 border-dashed border-[#8B0000]/35 flex items-center justify-center bg-[#FEF9ED]/60 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all">
                <Plus className="h-5 w-5 text-[#8B0000]/65" strokeWidth={2.5} />
              </div>
              <span className="text-[9px] font-bold text-[#414141]/50 text-center mt-1.5 leading-none">
                Divulgar
              </span>
            </div>

            {/* Stories List */}
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
                    className="p-[2.5px] rounded-full border-2 bg-white group-hover:scale-105 active:scale-95 transition-all shadow-sm relative"
                    style={{ borderColor: storyAccent }}
                  >
                    <div
                      className="h-14 w-14 rounded-full overflow-hidden bg-white flex items-center justify-center"
                    >
                      <img
                        src={story.avatar}
                        alt=""
                        className="h-full w-full object-cover rounded-full"
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

        {/* Premium iOS Search Bar */}
        <div className="relative z-10 mb-5 group shrink-0">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#414141]/40 group-focus-within:text-[#8B0000] transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[24px] bg-white py-3.5 pl-11 pr-10 text-[13.5px] font-medium outline-none transition-all placeholder:text-[#414141]/35 border border-black/[0.06] focus:border-[#8B0000]/30 focus:ring-4 focus:ring-[#8B0000]/5 text-[#414141] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
            placeholder="Buscar por terreiro, dirigente ou cidade..."
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

        {/* Feed Section: Terreiros + Social Publications */}
        <div className="space-y-6">

          {/* Render Mock Social Publication Post Card first if 'todos' or 'publicacoes' filter active */}
          {(selectedFilter === 'todos' || selectedFilter === 'publicacoes') && (
            <div className="space-y-6">
              {MOCK_POSTS.map((post) => {
                const isSaved = savedPosts.includes(post.id);

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.04)] text-left transition-all"
                  >
                    {/* Post Header */}
                    <div className="flex items-center justify-between pb-2">
                      <div
                        onClick={() => {
                          const target = terreiros.find(t => t.id === post.terreiroId);
                          if (target) setSelectedTerreiro(target);
                        }}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="h-10 w-10 rounded-full border border-black/8 overflow-hidden bg-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                          <img src={post.avatar} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-bold text-[#414141]/90 flex items-center gap-1.5 truncate leading-tight group-hover:text-[#8B0000] transition-colors">
                            {post.terreiroNome}
                            <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 fill-sky-500/20 shrink-0" />
                          </span>
                          <span className="text-[10.5px] font-medium text-[#414141]/45 mt-0.5 leading-none">
                            {post.location} · {post.timeAgo}
                          </span>
                        </div>
                      </div>
                      <button className="text-[#414141]/35 hover:text-[#414141] p-1 rounded-full">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Framed Media Photo with Sophisticated Glass Border Ring */}
                    <div className="p-1 rounded-[26px] bg-gradient-to-b from-white/90 via-white/40 to-white/70 border border-white/90 shadow-[0_6px_20px_rgba(0,0,0,0.04),_inset_0_1px_1px_rgba(255,255,255,0.9)] my-2 backdrop-blur-sm">
                      <div
                        onDoubleClick={() => toggleLikePost(post.id)}
                        className="relative w-full aspect-[4/3] rounded-[22px] overflow-hidden bg-black/5 border border-black/5 cursor-pointer group select-none shadow-sm"
                      >
                        <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                      </div>
                    </div>

                    {/* Post Actions Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">

                          {/* Reaction Button — WhatsApp style */}
                          <div className="relative">
                            {/* Invisible backdrop to close picker on outside tap */}
                            {openReactionPickerId === post.id && (
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenReactionPickerId(null)}
                              />
                            )}

                            {/* Active Reaction Display / Tap to open picker */}
                            <button
                              onClick={() => setOpenReactionPickerId(
                                openReactionPickerId === post.id ? null : post.id
                              )}
                              className="flex items-center gap-2 text-xs font-semibold transition-transform active:scale-90 relative z-50"
                            >
                              {/* Stacked reaction icons */}
                              {(() => {
                                // Canonical visual order: folha (back) → concha → coracao (front)
                                const CANONICAL_ORDER = ['folha', 'concha', 'coracao'];
                                const userReaction = reactions[post.id];
                                const base = [...(post.mockReactions as unknown as string[])];

                                // All unique types (base + user if new)
                                const allUnique = [...new Set([...base, ...(userReaction ? [userReaction] : [])])];

                                // Sort by canonical order, keeping user's reaction always last (frontmost)
                                const withoutUser = allUnique
                                  .filter(r => r !== userReaction)
                                  .sort((a, b) => CANONICAL_ORDER.indexOf(a) - CANONICAL_ORDER.indexOf(b));

                                const allTypes = userReaction
                                  ? [...withoutUser, userReaction]
                                  : withoutUser.sort((a, b) => CANONICAL_ORDER.indexOf(a) - CANONICAL_ORDER.indexOf(b));

                                const displayTypes = allTypes.slice(-3); // max 3 stacked
                                const totalCount = post.likesCount + (userReaction ? 1 : 0);

                                return (
                                  <span className="flex items-center gap-1.5">
                                    {/* Overlapping stack */}
                                    <span className="flex items-center" style={{ position: 'relative', width: `${20 + (displayTypes.length - 1) * 14}px`, height: '26px' }}>
                                      {displayTypes.map((rid, i) => {
                                        const r = REACTIONS.find(x => x.id === rid)!;
                                        if (!r) return null;
                                        const isUser = rid === userReaction;
                                        return (
                                          <img
                                            key={rid}
                                            src={r.src}
                                            alt={r.label}
                                            style={{
                                              position: 'absolute',
                                              left: `${i * 14}px`,
                                              width: isUser ? '26px' : rid === 'folha' ? '25px' : '22px',
                                              height: isUser ? '26px' : rid === 'folha' ? '25px' : '22px',
                                              zIndex: i + 1,
                                              top: isUser ? '-1px' : rid === 'folha' ? '0px' : '2px',
                                              filter: `drop-shadow(0 2px 5px ${r.shadow})`,
                                              objectFit: 'contain',
                                              mixBlendMode: 'multiply',
                                            }}
                                          />
                                        );
                                      })}
                                    </span>
                                    <span className="font-bold text-[#414141]/65 ml-0.5">{totalCount}</span>
                                  </span>
                                );
                              })()}
                            </button>

                            {/* Reaction Picker — z-50 sits above the z-40 backdrop */}
                            <AnimatePresence>
                              {openReactionPickerId === post.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.85, y: 4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.85, y: 4 }}
                                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                                  className="absolute bottom-full left-0 mb-2 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-black/[0.07] shadow-[0_8px_28px_rgba(0,0,0,0.14)] z-50"
                                >
                                  {REACTIONS.map((r) => (
                                    <button
                                      key={r.id}
                                      onClick={() => toggleReaction(post.id, r.id)}
                                      className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all active:scale-90 hover:scale-110 ${
                                        reactions[post.id] === r.id ? 'scale-110' : ''
                                      }`}
                                      title={r.label}
                                    >
                                      <img
                                        src={r.src}
                                        alt={r.label}
                                        className="h-9 w-9 object-contain"
                                        style={{
                                          filter: `drop-shadow(0 3px 8px ${r.shadow})`,
                                          transform: reactions[post.id] === r.id ? 'scale(1.15)' : 'scale(1)',
                                          transition: 'transform 0.15s ease',
                                          mixBlendMode: 'multiply',
                                        }}
                                      />
                                      <span className="text-[9px] font-bold text-[#414141]/60">{r.label}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Map Button */}
                          <button
                            onClick={() => showToast('Mapa de terreiros em breve!')}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#414141]/50 hover:text-[#8B0000] transition-all active:scale-90"
                          >
                            <Map className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => showToast('Link da publicação copiado!')}
                            className="text-[#414141]/50 hover:text-[#8B0000] transition-transform active:scale-90"
                          >
                            <Share2 className="h-5 w-5" />
                          </button>
                        </div>

                        <button
                          onClick={() => toggleSavePost(post.id)}
                          className={`transition-transform active:scale-90 ${isSaved ? 'text-[#8B0000]' : 'text-[#414141]/40 hover:text-[#414141]'}`}
                        >
                          <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-[#8B0000]' : ''}`} />
                        </button>
                      </div>

                      {/* Soft Muted Caption Text */}
                      <p className="text-[12.5px] font-normal text-[#414141]/75 leading-relaxed">
                        <strong className="font-semibold text-[#414141]/95 mr-1.5">{post.dirigente}:</strong>
                        {post.caption}
                      </p>

                      {/* Soft Hashtags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.hashtags.map((tag) => (
                          <span key={tag} className="text-[10.5px] font-semibold text-[#8B0000]/80">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Render Terreiro Feed Cards */}
          {selectedFilter !== 'publicacoes' && filteredTerreiros.length > 0 && (
            filteredTerreiros.map((terreiro, idx) => {
                const isT7ca = terreiro.id === 'terreiro_t7ca';
                const isJurema = terreiro.id === 'terreiro_jurema';
                const houseLogo = isT7ca
                  ? '/img/logo-T7CA.webp'
                  : isJurema
                    ? 'https://instagram.fssa25-1.fna.fbcdn.net/v/t51.2885-19/209113156_403111601011697_1176465365621516809_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fssa25-1.fna.fbcdn.net&_nc_cat=105&_nc_oc=Q6cZ2gFJD5LW-m5DS4Qxid6x6WOAUflfgzGYfA8XoNu_NtLFLBqedWjoWQeKAt_D464QZes&_nc_ohc=cEuhaaJj98oQ7kNvwEoOYCv&_nc_gid=e10g7JHqewu6aRIFJM_vyQ&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AQCU68VMwh4_QojFFO0-_hGsney_rZrO-gxwgkX8GzOJ6w&oe=6A4D8D33&_nc_sid=8b3546'
                    : '/img/login/icone.webp';

                const motto = isT7ca
                  ? "Sob a regência de Oxalá, abrindo caminhos de luz, paz e caridade."
                  : isJurema
                    ? "Caridade, amor e fé sob as bênçãos dos Mensageiros de Aruanda."
                    : "Sabedoria na cura e caminhos abertos pela força dos Caboclos da floresta.";

                const isFav = favoritedIds.includes(terreiro.id);

                return (
                  <motion.div
                    key={terreiro.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 150, damping: 18 }}
                    onClick={() => setSelectedTerreiro(terreiro)}
                    className="bg-white/95 border border-[#8B0000]/10 rounded-[32px] p-2 flex flex-col shadow-[0_12px_32px_rgba(65,65,65,0.03)] backdrop-blur-md hover:shadow-[0_16px_40px_rgba(65,65,65,0.06)] transition-all duration-300 relative group cursor-pointer active:scale-[0.99]"
                  >
                    {/* Photo Frame Section */}
                    <div className="relative w-full aspect-square rounded-[26px] overflow-hidden bg-black/5 shadow-sm">
                      <img
                        src={CARD_BACKGROUNDS[idx % CARD_BACKGROUNDS.length]}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[800ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/35 z-10" />

                      {/* Top-Left: Glass Profile Badge */}
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-white/25 p-0.5 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-md">
                          <img src={houseLogo} alt="" className="h-full w-full object-contain rounded-full bg-white" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-white text-[13px] font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-1">
                            {terreiro.dirigente}
                            <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 fill-sky-400/20" />
                          </span>
                          <span className="text-white/75 text-[9px] font-semibold drop-shadow-sm">Dirigente</span>
                        </div>
                      </div>

                      {/* Top-Right: Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(terreiro.id, terreiro.nome, e)}
                        className={`absolute top-4 right-4 z-20 h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all active:scale-90 ${
                          isFav
                            ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/30'
                            : 'bg-black/20 text-white border-white/20 hover:bg-black/35'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isFav ? 'fill-white' : ''}`} />
                      </button>

                      {/* Bottom-Left: Activity Pills */}
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-[10.5px] font-bold shadow-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                          <span>1.2k</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/40" />
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-white/90" />
                          <span>Giras Ativas</span>
                        </span>
                      </div>

                      {/* Bottom-Right: Active Community Floating Avatars */}
                      <div className="absolute bottom-4 right-4 z-20 h-14 w-14 select-none pointer-events-none">
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                          className="absolute top-0 left-0 h-[24px] w-[24px] rounded-full border border-white bg-slate-300 overflow-hidden shadow-md z-10"
                        >
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" className="object-cover w-full h-full" alt="" />
                        </motion.div>
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut", delay: 0.2 }}
                          className="absolute top-3 right-0 h-[24px] w-[24px] rounded-full border border-white bg-slate-400 overflow-hidden shadow-md z-10"
                        >
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" className="object-cover w-full h-full" alt="" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Card Body - Profile & Title */}
                    <div className="flex items-center gap-3 mt-3.5 px-3">
                      <div
                        className="h-10 w-10 rounded-full overflow-hidden border bg-white flex items-center justify-center shrink-0 shadow-sm p-0.5"
                        style={{ borderColor: '#8B00001a' }}
                      >
                        <img src={houseLogo} alt="" className="h-full w-full object-contain rounded-full" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="text-[15px] font-extrabold text-[#414141] leading-tight truncate">
                          {terreiro.nome}
                        </h3>
                        <p className="text-[10px] font-semibold text-[#8B0000] mt-0.5 leading-none uppercase tracking-wider">
                          {terreiro.cidade} - {terreiro.estado}
                        </p>
                      </div>
                    </div>

                    {/* Motto & Description */}
                    <p className="text-[12.5px] font-normal text-[#414141]/75 leading-relaxed mt-2.5 px-3 text-left">
                      "{motto}" <span className="font-semibold ml-1 text-[#8B0000]/85">#Umbanda #Axé</span>
                    </p>

                    <div className="border-b border-[#414141]/6 my-3 mx-3" />

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between px-3 pb-1">
                      <div className="flex items-center gap-1.5 text-[#414141]/50 text-[10px] font-bold uppercase tracking-widest">
                        <MapPin className="h-3.5 w-3.5 text-[#8B0000]" />
                        <span>{terreiro.cidade}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTerreiro(terreiro);
                        }}
                        className="text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all duration-200 bg-[#8B0000] hover:bg-[#8B0000]/90 flex items-center gap-1.5"
                      >
                        <span>Conhecer</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
          )}
        </div>

      </div>

      {/* Expanded Terreiro Detail Drawer */}
      <AnimatePresence>
        {selectedTerreiro && (
          <div className="fixed inset-0 z-[100] flex justify-center items-end max-w-[430px] mx-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDetail}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Slider Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute top-[35px] inset-x-0 bottom-0 bg-[#FEF9ED] rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border-t border-black/10"
            >
              {/* Drag Handle Bar */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-black/15 z-50" />

              {/* Close Button */}
              <div className="absolute top-5 right-5 z-50">
                <button
                  onClick={handleCloseDetail}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#414141] shadow-md border border-black/5 active:scale-90 transition-transform"
                >
                  <X className="h-5 w-5" strokeWidth={2.2} />
                </button>
              </div>

              {/* Drawer Top Header Info */}
              <div className="pt-8 px-6 pb-3 bg-gradient-to-b from-white/60 to-transparent shrink-0">
                <div className="flex flex-col items-center text-center mt-2">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-[22px] border mb-2 shadow-sm bg-[#8B0000]/10 border-[#8B0000]/20 text-[#8B0000]"
                  >
                    <Home className="h-7 w-7" strokeWidth={1.8} />
                  </div>
                  <h2 className="text-[26px] font-normal leading-tight font-behind-it px-2 text-[#8B0000]">
                    {selectedTerreiro.nome}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8.5px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest bg-[#8B0000]/10 text-[#8B0000]">
                      CÓDIGO CONVITE: {selectedTerreiro.id.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Tab Navigation inside Drawer */}
                <div className="flex items-center justify-around border-b border-black/8 mt-5 pb-1">
                  {[
                    { id: 'info', label: 'Visão Geral' },
                    { id: 'giras', label: `Giras (${selectedTerreiroEvents.length})` },
                    { id: 'curimba', label: `Curimba (${selectedTerreiroPontos.length})` },
                    { id: 'oracao', label: 'Atendimento' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-all relative ${
                        activeTab === tab.id
                          ? 'text-[#8B0000]'
                          : 'text-[#414141]/45 hover:text-[#414141]/80'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="drawerTabIndicator"
                          className="absolute bottom-0 inset-x-0 h-0.5 bg-[#8B0000] rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Content per Active Tab */}
              <div className="flex-1 overflow-y-auto no-scrollbar pb-16 px-6 pt-4">
                {activeTab === 'info' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Core Details Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="bg-[#FAF4E9] border border-[#8B0000]/10 p-3.5 rounded-2xl flex flex-col items-center text-center shadow-sm">
                        <User className="h-5 w-5 text-[#8B0000] mb-1 opacity-80" />
                        <span className="text-[9px] font-black uppercase text-black/40 tracking-wider">Dirigente</span>
                        <span className="text-xs font-bold text-[#414141] mt-0.5 truncate w-full">{selectedTerreiro.dirigente}</span>
                      </div>
                      <div
                        onClick={() => {
                          if (selectedTerreiro.id === 'terreiro_jurema') {
                            window.open('https://share.google/TbZcUqZkai0GNU1a5', '_blank');
                          }
                        }}
                        className={`bg-[#FAF4E9] border border-[#8B0000]/10 p-3.5 rounded-2xl flex flex-col items-center text-center shadow-sm ${selectedTerreiro.id === 'terreiro_jurema' ? 'cursor-pointer hover:bg-black/5 active:scale-95 transition-all' : ''}`}
                      >
                        <MapPin className="h-5 w-5 text-[#8B0000] mb-1 opacity-80" />
                        <span className="text-[9px] font-black uppercase text-black/40 tracking-wider flex items-center gap-1">
                          Localização
                          {selectedTerreiro.id === 'terreiro_jurema' && <ExternalLink className="h-2.5 w-2.5" />}
                        </span>
                        <span className="text-xs font-bold text-[#414141] mt-0.5 truncate w-full">{selectedTerreiro.cidade} - {selectedTerreiro.estado}</span>
                      </div>
                    </div>

                    {selectedTerreiro.contato && (
                      <div className="bg-white border border-[#8B0000]/10 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="block text-[9px] font-black uppercase text-black/40 tracking-wider">Telefone / WhatsApp</span>
                            <span className="block text-xs font-bold text-[#414141]">{selectedTerreiro.contato}</span>
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/55${selectedTerreiro.contato.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-3.5 py-2 rounded-full shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                        >
                          Conversar
                        </a>
                      </div>
                    )}

                    {selectedTerreiro.observacoes && (
                      <div className="bg-[#FAF4E9]/60 border border-[#8B0000]/10 p-4 rounded-2xl">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8B0000] mb-1">Sobre a Casa</h4>
                        <p className="text-[12px] font-medium text-[#414141]/80 leading-relaxed">
                          {selectedTerreiro.observacoes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'giras' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {selectedTerreiroEvents.length > 0 ? (
                      selectedTerreiroEvents.map((evt: any) => {
                        const dateObj = parseLocalDate(evt.date);
                        const day = dateObj.toLocaleDateString('pt-BR', { day: '2-digit' });
                        const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();

                        return (
                          <div
                            key={evt.id}
                            className="bg-white border border-[#8B0000]/10 rounded-[22px] p-4 flex items-center gap-4 shadow-sm"
                          >
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-[16px] border border-[#8B0000]/15 bg-[#8B0000]/10 text-[#8B0000] shrink-0">
                              <span className="text-[8px] font-black tracking-wider leading-none">{month}</span>
                              <span className="text-xl font-bold leading-none mt-0.5">{day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider bg-[#8B0000]/10 text-[#8B0000] leading-none mb-1">
                                {evt.category}
                              </span>
                              <h4 className="text-[14px] font-bold text-[#414141] leading-tight truncate">
                                {evt.title}
                              </h4>
                              <p className="text-[10.5px] font-semibold text-[#414141]/55 mt-0.5 truncate">
                                {evt.time} · {evt.location}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white rounded-2xl py-8 text-center border border-dashed border-black/10">
                        <Calendar className="h-8 w-8 text-[#8B0000]/30 mx-auto mb-2" />
                        <p className="text-xs font-bold text-[#414141]/50">Nenhuma gira agendada no momento.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'curimba' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {selectedTerreiroPontos.length > 0 ? (
                      selectedTerreiroPontos.map((pt: any) => {
                        const isPlayingThis = playingPontoId === pt.id;
                        const isExpanded = expandedPontoLyric === pt.id;

                        return (
                          <div
                            key={pt.id}
                            className={`bg-white border rounded-[22px] p-4 transition-all shadow-sm ${
                              isPlayingThis ? 'border-[#8B0000] ring-2 ring-[#8B0000]/10' : 'border-[#8B0000]/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                                <button
                                  onClick={() => setPlayingPontoId(isPlayingThis ? null : pt.id)}
                                  className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                    isPlayingThis
                                      ? 'bg-[#8B0000] text-white shadow-md animate-pulse'
                                      : 'bg-[#8B0000]/10 text-[#8B0000] hover:bg-[#8B0000]/20'
                                  }`}
                                >
                                  {isPlayingThis ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                                </button>
                                <div className="min-w-0 flex-1">
                                  <span className="inline-block px-2 py-0.5 rounded-full text-[7.5px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-800 leading-none mb-1">
                                    {pt.categoria}
                                  </span>
                                  <h4 className="text-[13.5px] font-bold text-[#414141] leading-tight truncate">
                                    {pt.titulo}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {pt.letra && (
                                  <button
                                    onClick={() => setExpandedPontoLyric(isExpanded ? null : pt.id)}
                                    className="text-[10px] font-bold text-[#8B0000] bg-[#8B0000]/10 px-2.5 py-1.5 rounded-full"
                                  >
                                    {isExpanded ? 'Ocultar' : 'Letra'}
                                  </button>
                                )}
                                {pt.youtubeUrl && (
                                  <a
                                    href={pt.youtubeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/10 text-red-700 transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Equalizer Visualizer preview when playing */}
                            {isPlayingThis && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#8B0000] font-bold"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Volume2 className="h-4 w-4 animate-bounce" />
                                  <span>Reproduzindo Curimba...</span>
                                </div>
                                <div className="flex items-end gap-1 h-4">
                                  <span className="w-1 bg-[#8B0000] animate-[pulse_0.6s_infinite] h-full rounded-full" />
                                  <span className="w-1 bg-[#8B0000] animate-[pulse_0.9s_infinite_0.2s] h-3/4 rounded-full" />
                                  <span className="w-1 bg-[#8B0000] animate-[pulse_0.5s_infinite_0.4s] h-full rounded-full" />
                                </div>
                              </motion.div>
                            )}

                            {/* Lyric Accordion */}
                            {isExpanded && pt.letra && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 pt-3 border-t border-black/5 bg-[#FAF4E9]/50 p-3 rounded-xl text-xs font-serif text-[#414141] leading-relaxed whitespace-pre-line text-left"
                              >
                                {pt.letra}
                              </motion.div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white rounded-2xl py-8 text-center border border-dashed border-black/10">
                        <Music className="h-8 w-8 text-[#8B0000]/30 mx-auto mb-2" />
                        <p className="text-xs font-bold text-[#414141]/50">Nenhum ponto registrado por esta casa.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'oracao' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {prayerSuccess ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl text-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                        <h4 className="text-sm font-black text-emerald-800 uppercase tracking-wide">Pedido Enviado!</h4>
                        <p className="text-xs text-emerald-700 mt-1">
                          Seu pedido de oração foi entregue aos dirigentes e médiuns da casa. Que o axé fortaleça sua vida!
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handlePrayerSubmit} className="bg-white border border-[#8B0000]/10 p-4 rounded-2xl space-y-3 shadow-sm">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8B0000] text-left">
                          Solicitar Intenção / Pedido de Oração
                        </h4>

                        <input
                          required
                          type="text"
                          value={prayerName}
                          onChange={(e) => setPrayerName(e.target.value)}
                          placeholder="Seu Nome Completo"
                          className="w-full rounded-xl bg-[#FAF4E9]/50 border border-black/10 py-2.5 px-3 text-xs font-semibold outline-none focus:border-[#8B0000]"
                        />

                        <select
                          value={prayerType}
                          onChange={(e) => setPrayerType(e.target.value)}
                          className="w-full rounded-xl bg-[#FAF4E9]/50 border border-black/10 py-2.5 px-3 text-xs font-semibold outline-none focus:border-[#8B0000]"
                        >
                          <option value="Saúde e cura">Saúde e cura</option>
                          <option value="Abertura de caminhos">Abertura de caminhos</option>
                          <option value="Defesa e descarrego">Defesa e descarrego</option>
                          <option value="Família e amor">Família e amor</option>
                          <option value="Outros">Outros</option>
                        </select>

                        <textarea
                          required
                          rows={3}
                          value={prayerContent}
                          onChange={(e) => setPrayerContent(e.target.value)}
                          placeholder="Escreva sua intenção ou pedido..."
                          className="w-full rounded-xl bg-[#FAF4E9]/50 border border-black/10 py-2.5 px-3 text-xs font-semibold outline-none focus:border-[#8B0000]"
                        />

                        <button
                          type="submit"
                          className="w-full bg-[#8B0000] text-white py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-md hover:bg-[#8B0000]/90 active:scale-98 transition-all flex items-center justify-center gap-2"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Enviar Pedido de Oração</span>
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Instagram-Style Immersive Full-Screen Story Player Modal */}
      <AnimatePresence>
        {activeStoryIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black max-w-[430px] mx-auto overflow-hidden font-inter select-none"
          >
            {/* Story Card Container taking Full Viewport Height & Width */}
            <div
              className="relative w-full h-full flex flex-col justify-between overflow-hidden"
              onTouchStart={() => setIsStoryPaused(true)}
              onTouchEnd={() => setIsStoryPaused(false)}
              onMouseDown={() => setIsStoryPaused(true)}
              onMouseUp={() => setIsStoryPaused(false)}
            >
              {/* Full-bleed Edge-to-Edge Story Background Image */}
              <img
                src={MOCK_STORIES[activeStoryIndex].image}
                alt={MOCK_STORIES[activeStoryIndex].title}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />

              {/* Gradient Overlays: Top Gradient for Header, Bottom Gradient for Caption & CTA */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/85 via-black/40 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 pointer-events-none" />

              {/* Top Progress Segmented Indicators */}
              <div className="absolute top-3 inset-x-4 flex gap-1.5 z-30">
                {MOCK_STORIES.map((s, idx) => {
                  let width = '0%';
                  if (idx < activeStoryIndex) width = '100%';
                  if (idx === activeStoryIndex) width = `${storyProgress}%`;
                  return (
                    <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        className="h-full bg-white transition-all duration-[50ms] ease-linear shadow-sm"
                        style={{ width }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Top Story Header (Terreiro Avatar + Name + Time + Close Button) */}
              <div className="relative z-30 flex items-center justify-between w-full mt-6 px-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-white/40 overflow-hidden shadow-lg shrink-0">
                    <img
                      src={MOCK_STORIES[activeStoryIndex].avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-extrabold text-white leading-none tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {MOCK_STORIES[activeStoryIndex].terreiroNome}
                    </span>
                    <span className="block text-[11px] font-semibold text-white/80 mt-1 leading-none drop-shadow-sm">
                      {MOCK_STORIES[activeStoryIndex].timeAgo}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 active:scale-90 transition-all border border-white/20 shadow-md"
                >
                  <X className="h-5 w-5" strokeWidth={2.2} />
                </button>
              </div>

              {/* Tap Left / Right Overlay Area for Skipping/Rewinding */}
              <div
                className="absolute inset-0 z-20 cursor-pointer"
                onClick={handleStoryTap}
              />

              {/* Bottom Section: Caption + CTA — Premium Frosted Footer */}
              <div className="relative z-30 flex flex-col justify-end text-left">
                {/* Caption Area */}
                <div className="px-5 pb-4 pt-10">
                  {/* Subtle Event Badge */}
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/90 bg-white/15 backdrop-blur-sm border border-white/20 mb-2.5">
                    {MOCK_STORIES[activeStoryIndex].title}
                  </span>
                  {/* Caption */}
                  <p className="text-[13.5px] font-medium text-white/95 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] max-w-[90%]">
                    {MOCK_STORIES[activeStoryIndex].activityDescription}
                  </p>
                </div>

                {/* Frosted CTA Footer Bar */}
                <div
                  className="pointer-events-auto px-5 py-4 flex items-center justify-between gap-3"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 70%, transparent 100%)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {/* Terreiro mini identity */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full overflow-hidden border border-white/30 shrink-0">
                      <img
                        src={MOCK_STORIES[activeStoryIndex].avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-white/80 truncate leading-tight">
                      {MOCK_STORIES[activeStoryIndex].terreiroNome}
                    </span>
                  </div>

                  {/* Clean CTA Button */}
                  <button
                    onClick={() => {
                      const targetTerreiro = terreiros.find(t => t.id === MOCK_STORIES[activeStoryIndex!].terreiroId);
                      if (targetTerreiro) setSelectedTerreiro(targetTerreiro);
                      setActiveStoryIndex(null);
                    }}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#8B0000] text-[11px] font-bold tracking-wide shadow-md hover:bg-white/90 active:scale-95 transition-all"
                  >
                    <span>Ver terreiro</span>
                    <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
