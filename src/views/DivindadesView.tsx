import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronLeft, X, BookOpen, Wind, Droplets, Hammer, Zap, CloudLightning, Trees, Sparkles, Waves, ShieldAlert, Compass, Rainbow, Smile, Calendar, Palette, Sparkle, Heart, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Divindade {
  id: string;
  nome: string;
  titulo: string;
  cor: string;
  corDestaque: string;
  imagem: string;
  saudacao: string;
  elemento: string;
  sincretismo: string;
  diaSemana: string;
  cores: string;
  simbolo: string;
  historia: string;
  youtubeId: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }
};

const getElementIcon = (id: string) => {
  switch (id) {
    case 'oxala': return <Wind className="h-4 w-4" />;
    case 'iemanja': return <Droplets className="h-4 w-4" />;
    case 'ogum': return <Hammer className="h-4 w-4" />;
    case 'xango': return <Zap className="h-4 w-4" />;
    case 'iansa': return <CloudLightning className="h-4 w-4" />;
    case 'oxossi': return <Trees className="h-4 w-4" />;
    case 'oxum': return <Sparkles className="h-4 w-4" />;
    case 'nanaburuque': return <Waves className="h-4 w-4" />;
    case 'obaluae': return <ShieldAlert className="h-4 w-4" />;
    case 'exu': return <Compass className="h-4 w-4" />;
    case 'oxumare': return <Rainbow className="h-4 w-4" />;
    case 'ibeji': return <Smile className="h-4 w-4" />;
    default: return <Sparkles className="h-4 w-4" />;
  }
};

function SparksEffect({ cor }: { cor: string }) {
  const [sparks, setSparks] = useState<{ id: number; left: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const items = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: Math.random() * 92 + 4, // 4% to 96%
      size: Math.random() * 2.5 + 1.2, // 1.2px to 3.7px
      delay: Math.random() * 3,
      duration: Math.random() * 3.5 + 2.5 // 2.5s to 6.0s
    }));
    setSparks(items);
  }, [cor]);

  return (
    <div className="absolute inset-x-0 bottom-0 h-[120px] pointer-events-none overflow-hidden z-20 select-none">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rise-sparks {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-110px) scale(0.2);
            opacity: 0;
          }
        }
        .animate-rise-sparks {
          animation-name: rise-sparks;
        }
      `}} />
      {sparks.map(spark => (
        <span
          key={spark.id}
          className="absolute bottom-0 rounded-full opacity-0 animate-rise-sparks"
          style={{
            left: `${spark.left}%`,
            width: `${spark.size}px`,
            height: `${spark.size}px`,
            backgroundColor: cor,
            boxShadow: `0 0 6px ${cor}, 0 0 12px ${cor}`,
            animationDelay: `${spark.delay}s`,
            animationDuration: `${spark.duration}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear'
          }}
        />
      ))}
    </div>
  );
}

const DIVINDADES: Divindade[] = [
  {
    id: 'oxala',
    nome: 'Oxalá',
    titulo: 'Pai da Criação',
    cor: '#e0d8c3',
    corDestaque: '#7c6a46',
    imagem: '/img/divindades/oxala.jpg',
    saudacao: 'Epa Babá!',
    elemento: 'Ar e Céu',
    sincretismo: 'Senhor do Bonfim / Jesus Cristo',
    diaSemana: 'Sexta-feira',
    cores: 'Branco e Prateado',
    simbolo: 'Opaxorô (Cajado de metal branco)',
    historia: 'Oxalá é o Orixá da paz, da pureza e da criação. É o pai de todos os seres e o regente do branco. Representa a sabedoria e a calma necessária para a evolução espiritual.',
    youtubeId: '3k_mQyYvAoo'
  },
  {
    id: 'ogum',
    nome: 'Ogum',
    titulo: 'Senhor da Guerra',
    cor: '#3182CE',
    corDestaque: '#1a5276',
    imagem: '/img/divindades/ogum.jpg',
    saudacao: 'Ogunhê!',
    elemento: 'Fogo e Terra (Metal)',
    sincretismo: 'São Jorge',
    diaSemana: 'Terça-feira',
    cores: 'Azul Escuro, Verde ou Vermelho (a depender da linha)',
    simbolo: 'Espada e ferramentas de ferro',
    historia: 'Ogum é o Orixá do ferro, da guerra, da tecnologia e dos caminhos. Vencedor de demandas, rege a coragem, a lei divina e a proteção dos guerreiros.',
    youtubeId: 'x0R7h5UvWzo'
  },
  {
    id: 'oxossi',
    nome: 'Oxóssi',
    titulo: 'Rei da Mata',
    cor: '#319795',
    corDestaque: '#1a5f5d',
    imagem: '/img/divindades/oxossi.jpg',
    saudacao: 'Okê Arô!',
    elemento: 'Terra e Vegetais (Mata)',
    sincretismo: 'São Sebastião',
    diaSemana: 'Quinta-feira',
    cores: 'Verde e Azul-Turquesa',
    simbolo: 'Ofá (Arco e flecha) e Eruequerê',
    historia: 'Oxóssi é o caçador das matas. Rege a busca pelo conhecimento, a fartura, a alimentação e a sintonia fina com as forças da natureza selvagem.',
    youtubeId: 'kHlDk-N1M5E'
  },
  {
    id: 'xango',
    nome: 'Xangô',
    titulo: 'Rei da Justiça',
    cor: '#E53E3E',
    corDestaque: '#9b1c1c',
    imagem: '/img/divindades/xango.jpg',
    saudacao: 'Kaô Kabecilê!',
    elemento: 'Fogo e Rochas (Trovão)',
    sincretismo: 'São João Batista / São Jerônimo',
    diaSemana: 'Quarta-feira',
    cores: 'Marrom e Vermelho',
    simbolo: 'Oxê (Machado de duas lâminas)',
    historia: 'Xangô é o rei da justiça divina, do equilíbrio e das leis. Rege o fogo, os trovões e as pedreiras. Ensina a imparcialidade, a sabedoria de liderança e a dignidade.',
    youtubeId: 'b-G4iG-P0tE'
  },
  {
    id: 'iemanja',
    nome: 'Iemanjá',
    titulo: 'Rainha do Mar',
    cor: '#BEE3F8',
    corDestaque: '#2b6cb0',
    imagem: '/img/divindades/yemanja.jpg',
    saudacao: 'Odoyá!',
    elemento: 'Águas Salgadas',
    sincretismo: 'Nossa Senhora dos Navegantes',
    diaSemana: 'Sábado',
    cores: 'Azul claro e Branco',
    simbolo: 'Abebé (Espelho metalizado) e Coroa',
    historia: 'Iemanjá é a mãe de quase todos os Orixás. Rege a maternidade, o equilíbrio emocional e as águas do mar. É a protetora dos distribuidores de axé, pescadores e das famílias.',
    youtubeId: 'Z_d-r1_hJ1E'
  },
  {
    id: 'oxum',
    nome: 'Oxum',
    titulo: 'Dona das Águas Doces',
    cor: '#D69E2E',
    corDestaque: '#976a10',
    imagem: '/img/divindades/oxum.jpg',
    saudacao: 'Ora Yê Yê Ô!',
    elemento: 'Águas Doces (Cachoeiras e Rios)',
    sincretismo: 'Nossa Senhora da Conceição / Aparecida',
    diaSemana: 'Sábado',
    cores: 'Amarelo e Dourado',
    simbolo: 'Abebé (Espelho metalizado) e Ouro',
    historia: 'Oxum é a deusa do amor, da prosperidade, da beleza e da fertilidade. Rege o ouro, a gestação e o fluxo da sensibilidade emocional e artística dos seres humanos.',
    youtubeId: 'Jp_M3Jg5M24'
  },
  {
    id: 'iansa',
    nome: 'Iansã',
    titulo: 'Rainha dos Ventos',
    cor: '#DD6B20',
    corDestaque: '#9c420e',
    imagem: '/img/divindades/iansa.jpg',
    saudacao: 'Eparrey!',
    elemento: 'Ar em Movimento (Ventos e Tempestades)',
    sincretismo: 'Santa Bárbara',
    diaSemana: 'Quarta-feira',
    cores: 'Vermelho, Coral ou Amarelo',
    simbolo: 'Eruexim (Espanador de rabo de cavalo) e Espada',
    historia: 'Iansã ou Oyá é a guerreira dos ventos, tempestades e raios. Rege o direcionamento dos espíritos desencarnados e a força das transformações rápidas na vida.',
    youtubeId: 'wB6Y4K1Jg1o'
  },
  {
    id: 'nanaburuque',
    nome: 'Nanã Buruquê',
    titulo: 'Avó dos Orixás',
    cor: '#805AD5',
    corDestaque: '#553c9a',
    imagem: '/img/divindades/nana.jpg',
    saudacao: 'Saluba Nanã!',
    elemento: 'Água e Terra (Lama/Pântano)',
    sincretismo: 'Sant\'Ana',
    diaSemana: 'Terça-feira ou Sábado',
    cores: 'Roxo, Lilás e Branco',
    simbolo: 'Ibiri (Cetro de palha de costa e búzios)',
    historia: 'Nanã é a Orixá mais antiga do panteão. Rege os pântanos, a lama de onde a vida se molda e o portal da reencarnação, decantando memórias de vidas passadas.',
    youtubeId: 'Qd1NlH5M2K4'
  },
  {
    id: 'obaluae',
    nome: 'Obaluaê',
    titulo: 'Senhor da Cura',
    cor: '#4A5568',
    corDestaque: '#2d3748',
    imagem: '/img/divindades/obaluae.jpg',
    saudacao: 'Atotô!',
    elemento: 'Terra e Doenças',
    sincretismo: 'São Lázaro / São Roque',
    diaSemana: 'Segunda-feira',
    cores: 'Preto, Branco e Vermelho / Palha',
    simbolo: 'Xaxará (Vassoura de palha de costa)',
    historia: 'Obaluaê ou Omulu é o senhor das doenças e da cura. Ele rege a terra e a passagem entre os mundos. É o protetor da saúde e dos enfermos.',
    youtubeId: 'Pl8D2E4J5M1'
  },
  {
    id: 'exu',
    nome: 'Exu',
    titulo: 'Senhor do Caminho',
    cor: '#1a1a1a',
    corDestaque: '#c53030',
    imagem: '/img/divindades/exu.png',
    saudacao: 'Laroyé!',
    elemento: 'Encruzilhadas',
    sincretismo: 'Santo Antônio (por vezes associado)',
    diaSemana: 'Segunda-feira',
    cores: 'Preto e Vermelho',
    simbolo: 'Tridente e Ogó (Cetro esculpido)',
    historia: 'Exu é o mensageiro entre os mundos, o dono das encruzilhadas e o princípio de tudo. Ele rege a comunicação, o movimento e o equilíbrio.',
    youtubeId: 'gR4K1Jg5M2o'
  },
  {
    id: 'oxumare',
    nome: 'Oxumarê',
    titulo: 'Senhor do Arco-Íris',
    cor: '#D53F8C',
    corDestaque: '#97266d',
    imagem: '/img/divindades/oxumare.jpg',
    saudacao: 'Arroboboi!',
    elemento: 'Arco-Íris e Ciclos',
    sincretismo: 'São Bartolomeu',
    diaSemana: 'Terça-feira',
    cores: 'Colorido / Amarelo e Verde',
    simbolo: 'Serpente de metal e Arco-íris',
    historia: 'Oxumarê é o senhor da mobilidade e dos ciclos. Representado pela serpente e pelo arco-íris, ele traz a renovação e a continuidade da vida.',
    youtubeId: 'kHlDk2J5M1E'
  },
  {
    id: 'ibeji',
    nome: 'Ibeji',
    titulo: 'Senhores da Alegria',
    cor: '#4FD1C5',
    corDestaque: '#234e52',
    imagem: '/img/divindades/ibeji.jpg',
    saudacao: 'Ony Beijada!',
    elemento: 'Crianças e Alegria',
    sincretismo: 'São Cosme and São Damião',
    diaSemana: 'Domingo',
    cores: 'Rosa, Azul e todas as cores',
    simbolo: 'Brinquedos, Doces e Cabaças',
    historia: 'Os Ibejis representam a dualidade, a pureza e a alegria das crianças. Trazem a sorte, a proteção aos partos e a renovação da esperança.',
    youtubeId: 'Jp_M3Jg5M24'
  }
];

interface DivindadesViewProps {
  onToggleMenu: () => void;
  onBack: () => void;
  onModalToggle?: (isOpen: boolean) => void;
}

export default function DivindadesView({ onToggleMenu, onBack, onModalToggle }: DivindadesViewProps) {
  const [selectedDivindade, setSelectedDivindade] = useState<Divindade | null>(null);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleOpenDetail = (divindade: Divindade) => {
    setDirection(0);
    setSelectedDivindade(divindade);
    onModalToggle?.(true);
  };

  const handleCloseDetail = () => {
    setSelectedDivindade(null);
    onModalToggle?.(false);
    setDirection(0);
  };

  return (
    <div 
      style={{ background: '#FFFFFF' }}
      className={`flex flex-col min-h-screen relative overflow-x-hidden z-10 ${selectedDivindade ? 'h-[100dvh] overflow-hidden' : ''}`}
    >
      {/* Aurora Backdrop Effect (Vivid Light/Dark Blue glows pushed closer to the top) */}
      <div 
        className="absolute inset-x-0 top-0 h-[35dvh] pointer-events-none overflow-hidden z-0 select-none"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)'
        }}
      >
        {/* Strong Dark Blue Glow */}
        <div 
          className="absolute w-[68vw] h-[68vw] rounded-full bg-gradient-to-br from-[#0d47a1]/85 to-[#1565c0]/45 blur-[50px] -top-[35%] -left-[10%] animate-[pulse_6s_ease-in-out_infinite]"
        />
        {/* Strong Light Blue Glow */}
        <div 
          className="absolute w-[75vw] h-[75vw] rounded-full bg-gradient-to-tr from-[#00b0ff]/80 to-[#00e5ff]/35 blur-[60px] -top-[40%] -right-[15%] animate-[pulse_8s_ease-in-out_infinite_1.2s]"
        />
      </div>

      {/* Header */}
      <div className="relative z-20 px-6 pt-12 flex flex-col items-center text-center">
        {/* Left absolute back button */}
        <button
          onClick={onBack}
          className="absolute left-6 top-12 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-black/[0.03] text-[#414141] active:scale-95 transition-transform"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>

        {/* Right absolute menu button */}
        <button
          onClick={onToggleMenu}
          className="absolute right-6 top-12 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-black/[0.03] text-[#414141] active:scale-95 transition-transform"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>

        {/* Centered Title */}
        <h1 className="text-4xl font-bold text-[#414141] font-behind-it tracking-wide">
          Divindades
        </h1>
        
        {/* Centered Subtitle */}
        <p className="mt-3.5 text-xs font-semibold text-[#414141]/55 leading-relaxed max-w-[290px] mx-auto">
          Explore a história, saudações, mistérios e fundamentos dos Orixás que guiam nossos passos.
        </p>
      </div>

      {/* Apple Arcade style vertical feed - Tarot Card Collectibles (with inner image frame and details on card bottom) */}
      <div className="mt-8 px-6 pb-32 grid grid-cols-2 gap-4 relative z-10">
        {DIVINDADES.map((divindade) => (
          <motion.div
            key={divindade.id}
            layoutId={`card-${divindade.id}`}
            onClick={() => handleOpenDetail(divindade)}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className="relative h-[295px] rounded-[22px] bg-[#FEF9ED] p-1.5 flex flex-col shadow-[0_12px_28px_rgba(65,65,65,0.07)] border border-white cursor-pointer group select-none"
          >
            {/* Image container inside the card frame */}
            <div className="relative flex-1 w-full rounded-[15px] overflow-hidden">
              <motion.img
                layoutId={`image-${divindade.id}`}
                src={divindade.imagem}
                alt={divindade.nome}
                className="absolute inset-0 h-full w-full object-cover object-top filter brightness-[0.95] contrast-[1.02]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/200x300?text=${divindade.nome}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

              {/* Soft tint indicator tab on left top */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/35 backdrop-blur-md border border-white/20">
                <div
                  className="h-1.5 w-1.5 rounded-full shadow-sm"
                  style={{ backgroundColor: divindade.cor }}
                />
                <span className="text-[7.5px] font-black uppercase tracking-wider text-white">
                  {divindade.saudacao.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Details at the bottom frame of the card */}
            <div className="pt-3 pb-1 text-center shrink-0">
              <motion.h3
                layoutId={`title-${divindade.id}`}
                className="text-[19px] font-bold text-[#414141] leading-none font-behind-it"
              >
                {divindade.nome}
              </motion.h3>
              <p className="text-[#1565c0]/65 text-[8.5px] font-black uppercase tracking-widest mt-1.5 truncate">
                {divindade.titulo}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded Detail View (Shared Element Transition modal) */}
      <AnimatePresence>
        {selectedDivindade && (
          <div className="fixed inset-0 z-[100] flex justify-center items-end max-w-[430px] mx-auto">
            {/* Smooth Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDetail}
              className="absolute inset-0 bg-black/55 backdrop-blur-md"
            />

            {/* Expanding Card Body */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute top-[40px] inset-x-0 bottom-0 bg-[#FEF9ED] rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border-t border-black/5"
            >
              {/* iOS Drag bar */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-black/10 z-50" />

              {/* Float Close Button */}
              <div className="absolute top-5 right-5 z-50">
                <button
                  onClick={handleCloseDetail}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-[#414141] shadow-md border border-black/5 active:scale-90 transition-transform"
                >
                  <X className="h-5 w-5" strokeWidth={2.2} />
                </button>
              </div>

              {/* Swipeable details container wrapper */}
              <div className="flex-1 relative overflow-hidden flex flex-col">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={selectedDivindade.id}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({
                        x: dir > 0 ? 380 : dir < 0 ? -380 : 0,
                        opacity: 0.1
                      }),
                      center: {
                        x: 0,
                        opacity: 1
                      },
                      exit: (dir: number) => ({
                        x: dir < 0 ? 380 : dir > 0 ? -380 : 0,
                        opacity: 0.1
                      })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 220, damping: 25 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.4}
                    onDragEnd={(_, info) => {
                      const threshold = 55;
                      if (info.offset.x < -threshold) {
                        // swipe left -> next Orixá
                        setDirection(1);
                        const idx = DIVINDADES.findIndex(d => d.id === selectedDivindade.id);
                        const nextIdx = (idx + 1) % DIVINDADES.length;
                        setSelectedDivindade(DIVINDADES[nextIdx]);
                      } else if (info.offset.x > threshold) {
                        // swipe right -> prev Orixá
                        setDirection(-1);
                        const idx = DIVINDADES.findIndex(d => d.id === selectedDivindade.id);
                        const prevIdx = (idx - 1 + DIVINDADES.length) % DIVINDADES.length;
                        setSelectedDivindade(DIVINDADES[prevIdx]);
                      }
                    }}
                    className="absolute inset-0 flex flex-col overflow-y-auto no-scrollbar pb-32 select-none cursor-grab active:cursor-grabbing"
                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                  >
                    {/* Hero Header Image */}
                    <div className="relative h-[420px] w-full overflow-hidden shrink-0">
                      <motion.img
                        layoutId={`image-${selectedDivindade.id}`}
                        src={selectedDivindade.imagem}
                        alt={selectedDivindade.nome}
                        className="h-full w-full object-cover object-top filter brightness-[0.98] contrast-[1.01]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${selectedDivindade.nome}`;
                        }}
                      />
                      <SparksEffect cor={selectedDivindade.corDestaque} />
                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FEF9ED] to-transparent" />
                    </div>

                    {/* Content with dynamic Orixá themed elements and staggered entrance animation */}
                    <motion.div 
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
                        hidden: {}
                      }}
                      className="px-6 -mt-10 relative z-10"
                    >
                      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3">
                        <div
                          className="h-2.5 w-10 rounded-full shadow-sm"
                          style={{ backgroundColor: selectedDivindade.corDestaque }}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#414141]/50">
                          Orixá Regente
                        </span>
                      </motion.div>

                      <motion.h2
                        variants={itemVariants}
                        layoutId={`title-${selectedDivindade.id}`}
                        className="text-5xl font-bold text-[#414141] leading-none font-behind-it"
                      >
                        {selectedDivindade.nome}
                      </motion.h2>
                      
                      <motion.p 
                        variants={itemVariants}
                        className="text-sm font-bold uppercase tracking-wider mt-2.5 italic"
                        style={{ color: selectedDivindade.corDestaque }}
                      >
                        "{selectedDivindade.saudacao}"
                      </motion.p>

                      {/* Bento Grid layout for details (Apple/Airbnb grid strategy themed dynamically with icons) */}
                      <div className="grid grid-cols-2 gap-4 mt-8">
                        {/* Elemento */}
                        <motion.div 
                          variants={itemVariants}
                          className="p-5 rounded-[24px] border flex flex-col gap-2.5 justify-between"
                          style={{ backgroundColor: `${selectedDivindade.cor}12`, borderColor: `${selectedDivindade.corDestaque}28` }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="p-1 rounded-md" style={{ backgroundColor: `${selectedDivindade.corDestaque}18`, color: selectedDivindade.corDestaque }}>
                              {getElementIcon(selectedDivindade.id)}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#414141]/50">Elemento</span>
                          </div>
                          <span className="text-sm font-bold text-[#414141] block leading-tight">{selectedDivindade.elemento}</span>
                        </motion.div>

                        {/* Dia da Semana */}
                        <motion.div 
                          variants={itemVariants}
                          className="p-5 rounded-[24px] border flex flex-col gap-2.5 justify-between"
                          style={{ backgroundColor: `${selectedDivindade.cor}12`, borderColor: `${selectedDivindade.corDestaque}28` }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="p-1 rounded-md" style={{ backgroundColor: `${selectedDivindade.corDestaque}18`, color: selectedDivindade.corDestaque }}>
                              <Calendar className="h-4 w-4" />
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#414141]/50">Dia da Semana</span>
                          </div>
                          <span className="text-sm font-bold text-[#414141] block leading-tight">{selectedDivindade.diaSemana}</span>
                        </motion.div>

                        {/* Cores */}
                        <motion.div 
                          variants={itemVariants}
                          className="p-5 rounded-[24px] border col-span-2 flex flex-col gap-2.5"
                          style={{ backgroundColor: `${selectedDivindade.cor}12`, borderColor: `${selectedDivindade.corDestaque}28` }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="p-1 rounded-md" style={{ backgroundColor: `${selectedDivindade.corDestaque}18`, color: selectedDivindade.corDestaque }}>
                              <Palette className="h-4 w-4" />
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#414141]/50">Cores da Guia</span>
                          </div>
                          <span className="text-sm font-bold text-[#414141] block leading-tight">{selectedDivindade.cores}</span>
                        </motion.div>

                        {/* Símbolo */}
                        <motion.div 
                          variants={itemVariants}
                          className="p-5 rounded-[24px] border col-span-2 flex flex-col gap-2.5"
                          style={{ backgroundColor: `${selectedDivindade.cor}12`, borderColor: `${selectedDivindade.corDestaque}28` }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="p-1 rounded-md" style={{ backgroundColor: `${selectedDivindade.corDestaque}18`, color: selectedDivindade.corDestaque }}>
                              <Sparkle className="h-4 w-4" />
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#414141]/50">Símbolo Sagrado</span>
                          </div>
                          <span className="text-sm font-bold text-[#414141] block leading-tight">{selectedDivindade.simbolo}</span>
                        </motion.div>

                        {/* Sincretismo */}
                        <motion.div 
                          variants={itemVariants}
                          className="p-5 rounded-[24px] border col-span-2 flex flex-col gap-2.5"
                          style={{ backgroundColor: `${selectedDivindade.corDestaque}12`, borderColor: `${selectedDivindade.corDestaque}35` }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="p-1 rounded-md" style={{ backgroundColor: `${selectedDivindade.corDestaque}22`, color: selectedDivindade.corDestaque }}>
                              <Heart className="h-4 w-4" />
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#414141]/50" style={{ color: selectedDivindade.corDestaque }}>Sincretismo Católico</span>
                          </div>
                          <span className="text-sm font-bold block leading-tight" style={{ color: selectedDivindade.corDestaque }}>{selectedDivindade.sincretismo}</span>
                        </motion.div>

                        {/* História / Fundamento (Large full span text) */}
                        <motion.div 
                          variants={itemVariants}
                          className="col-span-2 p-6 rounded-[28px] border mt-2 relative overflow-hidden"
                          style={{ backgroundColor: `${selectedDivindade.corDestaque}08`, borderColor: `${selectedDivindade.corDestaque}1E` }}
                        >
                          <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full" style={{ backgroundColor: selectedDivindade.corDestaque }} />
                          <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-3" style={{ color: selectedDivindade.corDestaque }}>
                            <BookOpen className="h-4 w-4" style={{ color: selectedDivindade.corDestaque }} />
                            <span>História & Fundamentos</span>
                          </h3>
                          <p className="text-xs leading-relaxed text-[#414141]/85 font-medium whitespace-pre-line">
                            {selectedDivindade.historia}
                          </p>
                        </motion.div>

                        {/* YouTube Video Player Embed */}
                        <motion.div 
                          variants={itemVariants}
                          className="col-span-2 p-5 rounded-[28px] border mt-4 relative overflow-hidden flex flex-col gap-3"
                          style={{ backgroundColor: `${selectedDivindade.corDestaque}08`, borderColor: `${selectedDivindade.corDestaque}1E` }}
                        >
                          <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: selectedDivindade.corDestaque }}>
                            <Youtube className="h-4 w-4" style={{ color: selectedDivindade.corDestaque }} />
                            <span>Conheça a História em Vídeo</span>
                          </h3>
                          <div className="relative w-full rounded-[18px] overflow-hidden aspect-video shadow-sm border border-black/5 bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${selectedDivindade.youtubeId}`}
                              title={`História de ${selectedDivindade.nome}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
