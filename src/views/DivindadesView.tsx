import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ArrowLeft, X, BookOpen, Wind, Droplets, Hammer, Zap, CloudLightning, Trees, Sparkles, Waves, ShieldAlert, Compass, Rainbow, Smile, Calendar, Palette, Sparkle, Heart, Youtube, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Terreiro } from '../types';

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
  slideshowImagens?: string[];
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
      <style dangerouslySetInnerHTML={{
        __html: `
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
    youtubeId: '3k_mQyYvAoo',
    slideshowImagens: [
      '/img/divindades/oxala.jpg',
      'https://i.pinimg.com/736x/8b/d4/fd/8bd4fdf8288aa8ba22a0aec393ab2559.jpg',
      'https://i.pinimg.com/736x/bc/5c/4e/bc5c4ef46a6cb39512a1d0b18e65cbe0.jpg'
    ]
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
    historia: 'Ogum é o Orixá do ferro, da guerra, da tecnologia and dos caminhos. Vencedor de demandas, rege a coragem, a lei divina e a proteção dos guerreiros.',
    youtubeId: 'x0R7h5UvWzo',
    slideshowImagens: [
      '/img/divindades/ogum.jpg',
      'https://i.pinimg.com/1200x/76/eb/6f/76eb6f2ecc6623e05d77a7a5703cf9ad.jpg',
      'https://i.pinimg.com/1200x/3e/a3/0e/3ea30e790a628e16c71f4e315fe37628.jpg'
    ]
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
    youtubeId: 'kHlDk-N1M5E',
    slideshowImagens: [
      '/img/divindades/oxossi.jpg',
      'https://i.pinimg.com/1200x/4e/bd/a9/4ebda944168ba0d243bb8399f0c7fba5.jpg',
      'https://i.pinimg.com/1200x/2e/c8/e6/2ec8e6d609f8281a3b3c5af4ba835e67.jpg'
    ]
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
    youtubeId: 'b-G4iG-P0tE',
    slideshowImagens: [
      '/img/divindades/xango.jpg',
      'https://i.pinimg.com/1200x/2c/6a/bb/2c6abb62711b1f62dc9c4acb99431055.jpg',
      'https://i.pinimg.com/1200x/2c/6a/bb/2c6abb62711b1f62dc9c4acb99431055.jpg'
    ]
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
    youtubeId: 'Z_d-r1_hJ1E',
    slideshowImagens: [
      '/img/divindades/yemanja.jpg',
      'https://i.pinimg.com/736x/c5/53/a2/c553a26715308e17979e4a33e5f95cd4.jpg',
      'https://i.pinimg.com/736x/7b/41/9c/7b419cc6a3fb2c80c4a6a38d40c85fa8.jpg'
    ]
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
    youtubeId: 'Jp_M3Jg5M24',
    slideshowImagens: [
      '/img/divindades/oxum.jpg',
      'https://i.pinimg.com/736x/10/44/99/104499e4c210d49f665ab7c9643e1dde.jpg',
      'https://i.pinimg.com/1200x/01/8b/b3/018bb391b26c1c98852b6c5166c92361.jpg'
    ]
  },
  {
    id: 'iansa',
    nome: 'Iansã',
    titulo: 'Rainha dos Ventos',
    cor: '#DD6B20',
    corDestaque: '#9c420e',
    imagem: 'https://i.pinimg.com/1200x/8b/9d/d0/8b9dd0f03253d53e792c68b3ca09f305.jpg',
    saudacao: 'Eparrey!',
    elemento: 'Ar em Movimento (Ventos e Tempestades)',
    sincretismo: 'Santa Bárbara',
    diaSemana: 'Quarta-feira',
    cores: 'Vermelho, Coral ou Amarelo',
    simbolo: 'Eruexim (Espanador de rabo de cavalo) e Espada',
    historia: 'Iansã ou Oyá é a guerreira dos ventos, tempestades e raios. Rege o direcionamento dos espíritos desencarnados e a força das transformações rápidas na vida.',
    youtubeId: 'wB6Y4K1Jg1o',
    slideshowImagens: [
      'https://i.pinimg.com/1200x/8b/9d/d0/8b9dd0f03253d53e792c68b3ca09f305.jpg',
      'https://i.pinimg.com/736x/fe/3a/75/fe3a757b594439bb85c0db119c98702e.jpg',
      'https://i.pinimg.com/736x/d7/3e/8b/d73e8b3aa172e27c02b4bedffaef35e1.jpg'
    ]
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
    youtubeId: 'Qd1NlH5M2K4',
    slideshowImagens: [
      '/img/divindades/nana.jpg',
      'https://i.pinimg.com/736x/e2/4f/3e/e24f3e61565784780351f3c8cdb4f802.jpg',
      'https://i.pinimg.com/736x/a3/02/3a/a3023af788df9836fb6f84c4e35e1469.jpg'
    ]
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
    youtubeId: 'Pl8D2E4J5M1',
    slideshowImagens: [
      '/img/divindades/obaluae.jpg',
      'https://i.pinimg.com/736x/29/a7/99/29a799ede855461a8584d032f3e53212.jpg',
      'https://i.pinimg.com/1200x/8b/eb/81/8beb8150e801e48203a5691d00dc2e59.jpg'
    ]
  },
  {
    id: 'exu',
    nome: 'Exu',
    titulo: 'Senhor do Caminho',
    cor: '#1a1a1a',
    corDestaque: '#c53030',
    imagem: 'https://i.pinimg.com/1200x/38/f1/81/38f18101861125933e2dc730810deb71.jpg',
    saudacao: 'Laroyé!',
    elemento: 'Encruzilhadas',
    sincretismo: 'Santo Antônio (por vezes associado)',
    diaSemana: 'Segunda-feira',
    cores: 'Preto e Vermelho',
    simbolo: 'Tridente e Ogó (Cetro esculpido)',
    historia: 'Exu é o mensageiro entre os mundos, o dono das encruzilhadas e o princípio de tudo. Ele rege a comunicação, o movimento e o equilíbrio.',
    youtubeId: 'gR4K1Jg5M2o',
    slideshowImagens: [
      'https://i.pinimg.com/1200x/38/f1/81/38f18101861125933e2dc730810deb71.jpg',
      'https://i.pinimg.com/1200x/35/6c/7f/356c7f98a050b8e14e8d8f786625236f.jpg',
      'https://i.pinimg.com/1200x/a3/39/d0/a339d0bbb56b17238274d6c1bf5cd17b.jpg'
    ]
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
    youtubeId: 'kHlDk2J5M1E',
    slideshowImagens: [
      '/img/divindades/oxumare.jpg',
      'https://i.pinimg.com/736x/5d/aa/1a/5daa1a88c268be00644daacead4e0091.jpg',
      'https://i.pinimg.com/736x/f8/7a/52/f87a52d455c98370b11c1eaf3d7efa53.jpg'
    ]
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
    youtubeId: 'Jp_M3Jg5M24',
    slideshowImagens: [
      '/img/divindades/ibeji.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUY30PqVEABZ2gPt8GBlK-4NupI7UrBQ2cD1NpXczGukItLWOJBVMsJJY&s=10',
      'https://i.pinimg.com/1200x/5c/be/8b/5cbe8bc3b11fe9afd261b424fbf6f7a0.jpg'
    ]
  }
];

export interface OrixaTheme {
  isDark: boolean;
  bgGradientStart: string;
  bgGradientEnd: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  pillText: string;
  dividerColor: string;
}

export const getOrixaTheme = (id: string): OrixaTheme => {
  const getAccentColor = (id: string) => {
    switch (id) {
      case 'oxala': return '#8C7A53';
      case 'ogum': return '#1A5276';
      case 'oxossi': return '#1A5F5D';
      case 'xango': return '#9B1C1C';
      case 'iemanja': return '#2B6CB0';
      case 'oxum': return '#976A10';
      case 'iansa': return '#9C420E';
      case 'nanaburuque': return '#553C9A';
      case 'obaluae': return '#2D3748';
      case 'exu': return '#C53030';
      case 'oxumare': return '#97266D';
      case 'ibeji': return '#234E52';
      default: return '#2B6CB0';
    }
  };

  const accentColor = getAccentColor(id);

  return {
    isDark: false,
    bgGradientStart: '#FEF9ED',
    bgGradientEnd: '#FDF3DF',
    textColor: '#414141',
    subtextColor: 'rgba(65, 65, 65, 0.65)',
    accentColor: accentColor,
    cardBg: 'rgba(255, 255, 255, 0.75)',
    cardBorder: `${accentColor}22`,
    iconBg: `${accentColor}12`,
    pillText: accentColor,
    dividerColor: `${accentColor}25`
  };
};

interface DivindadesViewProps {
  onToggleMenu: () => void;
  onBack: () => void;
  onModalToggle?: (isOpen: boolean) => void;
}

export default function DivindadesView({ onToggleMenu, onBack, onModalToggle }: DivindadesViewProps) {
  const { currentAccount, terreiros } = useAppData();
  const currentTerreiro = terreiros.find((t: Terreiro) => t.id === currentAccount?.terreiroId);
  const themeColor = currentTerreiro?.corTema || '#BF2429';

  const [selectedDivindade, setSelectedDivindade] = useState<Divindade | null>(null);
  const [direction, setDirection] = useState(0);
  const [imageIdx, setImageIdx] = useState(0);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Automatic slideshow cross-fade interval
  useEffect(() => {
    if (!selectedDivindade) return;
    const images = selectedDivindade.slideshowImagens || [selectedDivindade.imagem];
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setImageIdx((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedDivindade]);

  const handleOpenDetail = (divindade: Divindade) => {
    setDirection(0);
    setImageIdx(0);
    setSelectedDivindade(divindade);
    onModalToggle?.(true);
  };

  const handleCloseDetail = () => {
    setSelectedDivindade(null);
    onModalToggle?.(false);
    setDirection(0);
    setImageIdx(0);
  };

  return (
    <div
      style={{ background: '#FFFFFF' }}
      className={`flex flex-col min-h-[100dvh] relative overflow-x-hidden z-10 ${selectedDivindade ? 'h-[100dvh] overflow-hidden' : ''}`}
    >
      {/* Aurora Backdrop Effect */}
      <div
        className="absolute inset-x-0 top-0 h-[40dvh] pointer-events-none overflow-hidden z-0 select-none opacity-90"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 100%)'
        }}
      >
        <div
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[55px] -top-[25%] -left-[10%] animate-[pulse_6s_ease-in-out_infinite]"
          style={{ background: `radial-gradient(circle, ${themeColor}dd 0%, ${themeColor}44 60%, transparent 100%)` }}
        />
        <div
          className="absolute w-[85vw] h-[85vw] rounded-full blur-[65px] -top-[28%] -right-[15%] animate-[pulse_8s_ease-in-out_infinite_1.2s]"
          style={{ background: `radial-gradient(circle, ${themeColor}bb 0%, ${themeColor}22 60%, transparent 100%)`, filter: 'hue-rotate(15deg)' }}
        />
      </div>

      {/* Header */}
      <div className="relative z-20 px-6 safe-pt-view flex flex-col items-center text-center">
        <button
          onClick={onBack}
          className="absolute left-6 safe-top-12 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08),_0_2px_6px_rgba(0,0,0,0.04)] border border-zinc-100 text-zinc-800 active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>

        {/* Right absolute menu button */}
        <button
          onClick={onToggleMenu}
          className="absolute right-6 safe-top-12 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08),_0_2px_6px_rgba(0,0,0,0.04)] border border-zinc-100 text-zinc-800 active:scale-95 transition-transform"
        >
          <Menu className="h-5 w-5" strokeWidth={2.2} />
        </button>

        {/* Centered Title */}
        <h1 className="text-4xl font-bold font-behind-it tracking-wide" style={{ color: themeColor }}>
          Divindades
        </h1>

        {/* Centered Subtitle */}
        <p className="mt-3.5 text-xs font-semibold text-[#414141]/55 leading-relaxed max-w-[290px] mx-auto">
          Explore a história, saudações, mistérios e fundamentos dos Orixás que guiam nossos passos.
        </p>
      </div>

      {/* Apple Arcade style vertical feed - Tarot Card Collectibles (with full-bleed image and details on card bottom) */}
      <div className="mt-8 px-6 pb-32 grid grid-cols-2 gap-4 relative z-10">
        {DIVINDADES.map((divindade) => (
          <motion.div
            key={divindade.id}
            onClick={() => handleOpenDetail(divindade)}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="relative h-[310px] rounded-[24px] overflow-hidden flex flex-col border border-white/10 cursor-pointer group select-none transition-all duration-300"
            style={{
              boxShadow: `0 16px 32px ${divindade.corDestaque}28, 0 4px 12px rgba(0,0,0,0.06)`
            }}
          >
            {/* Full-bleed Image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={divindade.imagem}
                alt={divindade.nome}
                className="h-full w-full object-cover object-top filter brightness-[0.93] contrast-[1.02] transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/200x300?text=${divindade.nome}`;
                }}
              />
              {/* Softer Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent z-10" />
            </div>

            {/* Soft glass greeting tag on top left */}
            <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 shadow-sm">
              <div
                className="h-1.5 w-1.5 rounded-full animate-pulse shadow-sm"
                style={{ backgroundColor: divindade.cor, boxShadow: `0 0 8px ${divindade.cor}` }}
              />
              <span className="text-[8px] font-black uppercase tracking-wider text-white">
                {divindade.saudacao}
              </span>
            </div>

            {/* Details at the bottom inside the card */}
            <div className="mt-auto p-4 relative z-20 flex flex-col text-left">
              <h3 className="text-2xl font-bold text-white leading-none font-behind-it drop-shadow-sm">
                {divindade.nome}
              </h3>
              <p
                className="text-[9px] font-black uppercase tracking-widest mt-1.5 drop-shadow-sm"
                style={{ color: divindade.cor === '#e0d8c3' ? '#FAF9F6' : divindade.cor }}
              >
                {divindade.titulo}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded Detail View (Shared Element Transition modal) */}
      <AnimatePresence>
        {selectedDivindade && (() => {
          const theme = getOrixaTheme(selectedDivindade.id);
          return (
            <div className="fixed inset-0 z-[100] flex justify-center items-end max-w-[430px] mx-auto">
              {/* Smooth Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseDetail}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />

              {/* Expanding Card Body */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 30, stiffness: 280 }}
                className="absolute top-[40px] inset-x-0 bottom-0 rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border-t border-white/10"
                style={{ background: `linear-gradient(to bottom, ${theme.bgGradientStart}, ${theme.bgGradientEnd})` }}
              >
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
                          setImageIdx(0);
                          const idx = DIVINDADES.findIndex(d => d.id === selectedDivindade.id);
                          const nextIdx = (idx + 1) % DIVINDADES.length;
                          setSelectedDivindade(DIVINDADES[nextIdx]);
                        } else if (info.offset.x > threshold) {
                          // swipe right -> prev Orixá
                          setDirection(-1);
                          setImageIdx(0);
                          const idx = DIVINDADES.findIndex(d => d.id === selectedDivindade.id);
                          const prevIdx = (idx - 1 + DIVINDADES.length) % DIVINDADES.length;
                          setSelectedDivindade(DIVINDADES[prevIdx]);
                        }
                      }}
                      className="absolute inset-0 flex flex-col overflow-y-auto no-scrollbar pb-32 select-none cursor-grab active:cursor-grabbing"
                      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                    >
                      {/* Floating Hero Card Header (Detached from borders, larger, rounded-[32px]) */}
                      {(() => {
                        const slideshowImages = selectedDivindade.slideshowImagens || [selectedDivindade.imagem];
                        const currentImage = slideshowImages[imageIdx] || selectedDivindade.imagem;
                        return (
                          <div className="relative h-[500px] mx-4 mt-5 overflow-hidden shrink-0 select-none bg-black/10 rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.18)] border border-white/20">
                            <AnimatePresence mode="popLayout">
                              <motion.img
                                key={currentImage}
                                src={currentImage}
                                initial={{ opacity: 0, scale: 1.03 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 1.0, ease: "easeInOut" }}
                                className="absolute inset-0 h-full w-full object-cover object-top filter brightness-[0.85] contrast-[1.01]"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${selectedDivindade.nome}`;
                                }}
                              />
                            </AnimatePresence>

                            <SparksEffect cor={theme.accentColor} />

                            {/* Close Button Inside Card */}
                            <div className="absolute top-4 right-4 z-50">
                              <button
                                onClick={handleCloseDetail}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-md text-white border border-white/10 active:scale-90 transition-all hover:bg-black/50"
                              >
                                <X className="h-4.5 w-4.5" strokeWidth={2.5} />
                              </button>
                            </div>

                            {/* Solid Dark Text Contrast Vignette */}
                            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 via-black/15 to-transparent z-10 pointer-events-none" />

                            {/* Cinematic Overlay Text with Anchor left-border */}
                            <div
                              className="absolute bottom-8 left-6 z-20 flex flex-col text-left border-l-[3px] pl-3.5"
                              style={{ borderColor: theme.accentColor }}
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col text-left"
                              >
                                <span
                                  className="text-[10px] font-black uppercase tracking-[0.25em] drop-shadow-md leading-none mb-1"
                                  style={{ color: '#FFFFFF' }}
                                >
                                  {selectedDivindade.titulo}
                                </span>
                              </motion.div>

                              <motion.h2
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl font-bold leading-none font-behind-it drop-shadow-2xl"
                                style={{
                                  backgroundImage: `linear-gradient(to bottom, #FFFFFF 50%, color-mix(in srgb, ${theme.accentColor} 35%, #FFFFFF) 100%)`,
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  backgroundClip: 'text'
                                }}
                              >
                                {selectedDivindade.nome}
                              </motion.h2>

                              <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[15px] font-black tracking-wide italic mt-2.5 font-serif"
                                style={{
                                  color: '#FFFFFF',
                                  textShadow: `0 2px 10px rgba(0,0,0,0.5), 0 0 14px ${theme.accentColor}70`
                                }}
                              >
                                "{selectedDivindade.saudacao}"
                              </motion.p>
                            </div>

                            {/* Manual slide indicators (Left/Right Chevrons grouped in bottom-right corner) */}
                            {slideshowImages.length > 1 && (
                              <div className="absolute bottom-8 right-6 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/10 shadow-lg">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageIdx((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
                                  }}
                                  className="flex h-7.5 w-7.5 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all select-none"
                                >
                                  <ChevronLeft className="h-4.5 w-4.5" strokeWidth={2.5} />
                                </button>
                                <div className="h-3 w-[1px] bg-white/25" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageIdx((prev) => (prev + 1) % slideshowImages.length);
                                  }}
                                  className="flex h-7.5 w-7.5 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all select-none"
                                >
                                  <ChevronRight className="h-4.5 w-4.5" strokeWidth={2.5} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Content with dynamic Orixá themed elements and staggered entrance animation */}
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                          visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
                          hidden: {}
                        }}
                        className="px-6 relative z-10 pt-6"
                      >

                        {/* Bento Grid layout for details (Apple/Airbnb grid strategy themed dynamically with icons) */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                          {/* Elemento */}
                          <motion.div
                            variants={itemVariants}
                            className="p-5 rounded-[24px] border flex flex-col gap-2.5 justify-between backdrop-blur-md"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="p-1 rounded-md" style={{ backgroundColor: theme.iconBg, color: theme.accentColor }}>
                                {getElementIcon(selectedDivindade.id)}
                              </span>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${theme.isDark ? 'text-white/40' : 'text-[#414141]/50'}`}>Elemento</span>
                            </div>
                            <span className={`text-sm font-bold block leading-tight ${theme.isDark ? 'text-white' : 'text-[#414141]'}`}>{selectedDivindade.elemento}</span>
                          </motion.div>

                          {/* Dia da Semana */}
                          <motion.div
                            variants={itemVariants}
                            className="p-5 rounded-[24px] border flex flex-col gap-2.5 justify-between backdrop-blur-md"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="p-1 rounded-md" style={{ backgroundColor: theme.iconBg, color: theme.accentColor }}>
                                <Calendar className="h-4 w-4" />
                              </span>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${theme.isDark ? 'text-white/40' : 'text-[#414141]/50'}`}>Dia da Semana</span>
                            </div>
                            <span className={`text-sm font-bold block leading-tight ${theme.isDark ? 'text-white' : 'text-[#414141]'}`}>{selectedDivindade.diaSemana}</span>
                          </motion.div>

                          {/* Cores */}
                          <motion.div
                            variants={itemVariants}
                            className="p-5 rounded-[24px] border col-span-2 flex flex-col gap-2.5 backdrop-blur-md"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="p-1 rounded-md" style={{ backgroundColor: theme.iconBg, color: theme.accentColor }}>
                                <Palette className="h-4 w-4" />
                              </span>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${theme.isDark ? 'text-white/40' : 'text-[#414141]/50'}`}>Cores da Guia</span>
                            </div>
                            <span className={`text-sm font-bold block leading-tight ${theme.isDark ? 'text-white' : 'text-[#414141]'}`}>{selectedDivindade.cores}</span>
                          </motion.div>

                          {/* Símbolo */}
                          <motion.div
                            variants={itemVariants}
                            className="p-5 rounded-[24px] border col-span-2 flex flex-col gap-2.5 backdrop-blur-md"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="p-1 rounded-md" style={{ backgroundColor: theme.iconBg, color: theme.accentColor }}>
                                <Sparkle className="h-4 w-4" />
                              </span>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${theme.isDark ? 'text-white/40' : 'text-[#414141]/50'}`}>Símbolo Sagrado</span>
                            </div>
                            <span className={`text-sm font-bold block leading-tight ${theme.isDark ? 'text-white' : 'text-[#414141]'}`}>{selectedDivindade.simbolo}</span>
                          </motion.div>

                          {/* Sincretismo */}
                          <motion.div
                            variants={itemVariants}
                            className="p-5 rounded-[24px] border col-span-2 flex flex-col gap-2.5 backdrop-blur-md"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="p-1 rounded-md" style={{ backgroundColor: theme.iconBg, color: theme.accentColor }}>
                                <Heart className="h-4 w-4" />
                              </span>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${theme.isDark ? 'text-white/40' : 'text-[#414141]/50'}`}>Sincretismo Católico</span>
                            </div>
                            <span className={`text-sm font-bold block leading-tight ${theme.isDark ? 'text-white' : 'text-[#414141]'}`}>{selectedDivindade.sincretismo}</span>
                          </motion.div>

                          {/* História / Fundamento (Large full span text) */}
                          <motion.div
                            variants={itemVariants}
                            className="col-span-2 p-6 rounded-[28px] border mt-2 relative overflow-hidden backdrop-blur-md"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                          >
                            <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-3" style={{ color: theme.accentColor }}>
                              <BookOpen className="h-4 w-4" style={{ color: theme.accentColor }} />
                              <span>História & Fundamentos</span>
                            </h3>
                            <p className={`text-xs leading-relaxed font-medium whitespace-pre-line ${theme.isDark ? 'text-white/80' : 'text-[#414141]/85'}`}>
                              {selectedDivindade.historia}
                            </p>
                          </motion.div>

                          {/* YouTube Video Player Embed */}
                          <motion.div
                            variants={itemVariants}
                            className="col-span-2 p-5 rounded-[28px] border mt-4 relative overflow-hidden flex flex-col gap-3 backdrop-blur-md"
                            style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}
                          >
                            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: theme.accentColor }}>
                              <Youtube className="h-4 w-4" style={{ color: theme.accentColor }} />
                              <span>Conheça a História em Vídeo</span>
                            </h3>
                            <div className="relative w-full rounded-[18px] overflow-hidden aspect-video shadow-lg border border-black/10 bg-black">
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
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
