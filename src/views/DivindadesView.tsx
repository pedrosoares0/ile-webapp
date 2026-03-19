import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronLeft, Info, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Divindade {
  id: string;
  nome: string;
  titulo: string;
  cor: string;
  imagem: string;
  historia: string;
  saudacao: string;
  elemento: string;
}

const DIVINDADES: Divindade[] = [
  {
    id: 'oxala',
    nome: 'Oxalá',
    titulo: 'Pai da Criação',
    cor: '#FFFFFF',
    imagem: '/img/divindades/oxala.jpg',
    saudacao: 'Epa Babá!',
    elemento: 'Ar e Céu',
    historia: 'Oxalá é o Orixá da paz, da pureza e da criação. É o pai de todos os seres e o regente do branco. Representa a sabedoria e a calma necessária para a evolução espiritual.'
  },
  {
    id: 'iemanja',
    nome: 'Iemanjá',
    titulo: 'Rainha do Mar',
    cor: '#BEE3F8',
    imagem: '/img/divindades/yemanja.jpg',
    saudacao: 'Odoyá!',
    elemento: 'Águas Salgadas',
    historia: 'Iemanjá é a mãe de quase todos os Orixás. Rege a maternidade, o equilíbrio emocional e as águas do mar. É a protetora dos pescadores e das famílias.'
  },
  {
    id: 'ogum',
    nome: 'Ogum',
    titulo: 'Senhor da Guerra',
    cor: '#2B6CB0',
    imagem: '/img/divindades/ogum.jpg',
    saudacao: 'Ogunhê!',
    elemento: 'Ferro e Caminhos',
    historia: 'Ogum é o Orixá da tecnologia, do ferro e da guerra justa. Ele abre caminhos, protege contra demandas e é o executor da lei e da ordem.'
  },
  {
    id: 'xango',
    nome: 'Xangô',
    titulo: 'Rei da Justiça',
    cor: '#C53030',
    imagem: '/img/divindades/xango.jpg',
    saudacao: 'Kaô Kabecilê!',
    elemento: 'Fogo e Pedreiras',
    historia: 'Xangô é o Orixá da justiça, do trovão e do fogo. Ele pune o erro e premia o acerto. É o símbolo do poder real e da administração equilibrada.'
  },
  {
    id: 'oxum',
    nome: 'Oxum',
    titulo: 'Rainha das Águas Doces',
    cor: '#ECC94B',
    imagem: '/img/divindades/oxum.jpg',
    saudacao: 'Ora Yê Yê Ô!',
    elemento: 'Águas Doces e Ouro',
    historia: 'Oxum é a Orixá do amor, da fertilidade e da riqueza. Rege as águas doces, as cachoeiras e o brilho do ouro. É a doçura e a diplomacia.'
  },
  {
    id: 'iansa',
    nome: 'Iansã',
    titulo: 'Rainha dos Ventos',
    cor: '#9B2C2C',
    imagem: '/img/divindades/iansa.jpg',
    saudacao: 'Eparrey!',
    elemento: 'Ventos e Tempestades',
    historia: 'Iansã é a Orixá guerreira, senhora dos ventos, raios e tempestades. Ela comanda os espíritos dos mortos e representa a força da transformação.'
  },
  {
    id: 'oxossi',
    nome: 'Oxóssi',
    titulo: 'Rei da Caça',
    cor: '#2F855A',
    imagem: '/img/divindades/oxossi.jpg',
    saudacao: 'Okê Arô!',
    elemento: 'Matas e Conhecimento',
    historia: 'Oxóssi é o caçador de uma flecha só. Orixá das matas, da fartura e do conhecimento. Representa a busca pelo alimento espiritual e material.'
  },
  {
    id: 'nana',
    nome: 'Nanã',
    titulo: 'Mãe Ancestral',
    cor: '#553C9A',
    imagem: '/img/divindades/nana.jpg',
    saudacao: 'Saluba Nanã!',
    elemento: 'Lama e Pântanos',
    historia: 'Nanã Buruquê é a Orixá mais velha, senhora da lama e dos pântanos. Representa a ancestralidade, a morte e o renascimento, a moldagem do ser.'
  },
  {
    id: 'obaluae',
    nome: 'Obaluaê',
    titulo: 'Senhor da Cura',
    cor: '#744210',
    imagem: '/img/divindades/obaluae.jpg',
    saudacao: 'Atotô!',
    elemento: 'Terra e Doenças',
    historia: 'Obaluaê ou Omulu é o senhor das doenças e da cura. Ele rege a terra e a passagem entre os mundos. É o protetor da saúde e dos enfermos.'
  },
  {
    id: 'exu',
    nome: 'Exu',
    titulo: 'Senhor do Caminho',
    cor: '#000000',
    imagem: '/img/divindades/exu.png',
    saudacao: 'Laroyé!',
    elemento: 'Encruzilhadas',
    historia: 'Exu é o mensageiro entre os mundos, o dono das encruzilhadas e o princípio de tudo. Ele rege a comunicação, o movimento e o equilíbrio.'
  },
  {
    id: 'oxumare',
    nome: 'Oxumarê',
    titulo: 'Senhor do Arco-Íris',
    cor: '#D53F8C',
    imagem: '/img/divindades/oxumare.jpg',
    saudacao: 'Arroboboi!',
    elemento: 'Arco-Íris e Ciclos',
    historia: 'Oxumarê é o senhor da mobilidade e dos ciclos. Representado pela serpente e pelo arco-íris, ele traz a renovação e a continuidade da vida.'
  },
  {
    id: 'ibeji',
    nome: 'Ibeji',
    titulo: 'Senhores da Alegria',
    cor: '#4FD1C5',
    imagem: '/img/divindades/ibeji.jpg',
    saudacao: 'Ony Beijada!',
    elemento: 'Crianças e Alegria',
    historia: 'Os Ibejis representam a dualidade, a pureza e a alegria das crianças. Trazem a sorte, a proteção aos partos e a renovação da esperança.'
  }
];

interface DivindadesViewProps {
  onToggleMenu: () => void;
  onBack: () => void;
  onModalToggle?: (isOpen: boolean) => void;
}

export default function DivindadesView({ onToggleMenu, onBack, onModalToggle }: DivindadesViewProps) {
  const [selectedDivindade, setSelectedDivindade] = useState<Divindade | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleOpenModal = (divindade: Divindade) => {
    setSelectedDivindade(divindade);
    onModalToggle?.(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedDivindade(null);
    onModalToggle?.(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-[#fef7e7]"
    >
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-12">
        <button 
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md text-[#414141] active:scale-90 transition-transform"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>
        
        <h1 className="text-3xl font-bold text-[#414141]" style={{ fontFamily: 'BehindTheNinetiesItalic' }}>Divindades</h1>
        
        <button 
          onClick={onToggleMenu}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md text-[#414141] active:scale-90 transition-transform"
        >
          <Menu className="h-6 w-6" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-6 px-6">
        <p className="text-[13px] font-medium text-[#414141]/60 leading-relaxed">
          Conheça a história e os fundamentos dos principais Orixás que regem nossa casa e nossa fé.
        </p>
      </div>

      {/* Optimized Mobile Carousel */}
      <div className="mt-8 flex-1 overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto px-6 pb-12 snap-x snap-mandatory no-scrollbar touch-pan-x"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {DIVINDADES.map((divindade) => (
            <motion.div
              key={divindade.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenModal(divindade)}
              className="relative min-w-[280px] h-[420px] rounded-[40px] overflow-hidden shadow-2xl snap-center border-4 border-white"
            >
              {/* Image Placeholder with Gradient */}
              <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
              <img 
                src={divindade.imagem} 
                alt={divindade.nome}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x600?text=${divindade.nome}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Card Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="h-2 w-8 rounded-full" 
                    style={{ backgroundColor: divindade.cor }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                    {divindade.saudacao}
                  </span>
                </div>
                <h3 className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'BehindTheNinetiesItalic' }}>
                  {divindade.nome}
                </h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                  {divindade.titulo}
                </p>
              </div>

              {/* Info Badge */}
              <div className="absolute top-6 right-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                  <Info className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedDivindade && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            {/* Backdrop with a subtle white fade at the very bottom to prevent the beige gap */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full h-[92vh] bg-white rounded-t-[50px] overflow-hidden flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.15)]"
            >
              {/* Modal Drag Indicator */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-black/10 z-[120]" />

              <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {/* Modal Header/Image - Added object-top to prevent cutting heads */}
                <div className="relative h-96 w-full">
                  <img 
                    src={selectedDivindade.imagem} 
                    alt={selectedDivindade.nome}
                    className="h-full w-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${selectedDivindade.nome}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
                  <button 
                    onClick={handleCloseModal}
                    className="absolute top-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl text-white border border-white/30 active:scale-90 shadow-lg z-20"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="px-10 -mt-20 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="h-3 w-14 rounded-full shadow-lg" 
                      style={{ backgroundColor: selectedDivindade.cor }}
                    />
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-[#414141]/40">
                      {selectedDivindade.elemento}
                    </span>
                  </div>
                  
                  <h2 className="text-6xl font-bold text-[#414141] mb-2 leading-none" style={{ fontFamily: 'BehindTheNinetiesItalic' }}>
                    {selectedDivindade.nome}
                  </h2>
                  <p className="text-xl font-bold text-[#941c1c] mb-12 italic">
                    "{selectedDivindade.saudacao}"
                  </p>

                  <div className="space-y-12">
                    <section className="relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#941c1c]/10 rounded-full" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#414141]/30 mb-4">História e Fundamento</h4>
                      <p className="text-[#414141] leading-relaxed text-[17px] font-medium text-justify">
                        {selectedDivindade.historia}
                      </p>
                    </section>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-[#fef7e7]/50 p-6 rounded-[32px] border border-[#414141]/5 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#414141]/30 mb-2">Título</p>
                        <p className="text-[15px] font-bold text-[#414141] leading-tight">{selectedDivindade.titulo}</p>
                      </div>
                      <div className="bg-[#fef7e7]/50 p-6 rounded-[32px] border border-[#414141]/5 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#414141]/30 mb-2">Elemento</p>
                        <p className="text-[15px] font-bold text-[#414141] leading-tight">{selectedDivindade.elemento}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom White Safety Area - Covers the beige gap on Safari/Mobile browsers */}
              <div className="h-10 w-full bg-white shrink-0" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
