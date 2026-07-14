import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Plus, CalendarDays, X, Menu, AlertCircle, ChevronLeft, Trash2, Pencil } from 'lucide-react';
import '../styles/Calendar.css';
import { TerreiroEvent } from '../types';
import { useAppData } from '../context/AppDataContext';

// Definition of Preset Styles mapping to the cards design
interface PresetStyle {
  id: string;
  label: string;
  defaultTitle: string;
  imageUrl: string;
  theme: 'claro' | 'escuro';
  bgColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  dateColor: string;
  isCustom?: boolean;
}

const PRESET_STYLES: Record<string, PresetStyle> = {
  preto_velho_claro: {
    id: 'preto_velho_claro',
    label: 'Preto Velho (Claro)',
    defaultTitle: 'Preto Velho',
    imageUrl: '/img/eventos/preto-velho.webp',
    theme: 'claro',
    bgColor: '#F7F2E8',
    textColor: '#4E3629',
    badgeBg: '#3A322D',
    badgeText: '#F7F2E8',
    dateColor: '#4E3629'
  },
  preto_velho_escuro: {
    id: 'preto_velho_escuro',
    label: 'Preto Velho (Escuro)',
    defaultTitle: 'Preto Velho',
    imageUrl: '/img/eventos/preto-velho.webp',
    theme: 'escuro',
    bgColor: '#4E2E1A',
    textColor: '#FAF4E9',
    badgeBg: '#FAF4E9',
    badgeText: '#4E2E1A',
    dateColor: '#DBC6AB'
  },
  exu_pomba_gira_claro: {
    id: 'exu_pomba_gira_claro',
    label: 'Exu & Pomba Gira (Claro)',
    defaultTitle: 'Exu & Pomba Gira',
    imageUrl: '/img/eventos/exu-pomba.webp',
    theme: 'claro',
    bgColor: '#F7F2E8',
    textColor: '#8B0000',
    badgeBg: '#3E0000',
    badgeText: '#F7F2E8',
    dateColor: '#8B0000'
  },
  exu_pomba_gira_escuro: {
    id: 'exu_pomba_gira_escuro',
    label: 'Exu & Pomba Gira (Escuro)',
    defaultTitle: 'Exu & Pomba Gira',
    imageUrl: '/img/eventos/exu-pomba.webp',
    theme: 'escuro',
    bgColor: '#7A0000',
    textColor: '#FAF4E9',
    badgeBg: '#FAF4E9',
    badgeText: '#7A0000',
    dateColor: '#FAF4E9'
  },
  orixas_claro: {
    id: 'orixas_claro',
    label: 'Orixás (Claro)',
    defaultTitle: 'Orixás',
    imageUrl: '/img/eventos/orixas.webp',
    theme: 'claro',
    bgColor: '#F7F2E8',
    textColor: '#1565C0',
    badgeBg: '#0A2540',
    badgeText: '#F7F2E8',
    dateColor: '#1565C0'
  },
  orixas_escuro: {
    id: 'orixas_escuro',
    label: 'Orixás (Escuro)',
    defaultTitle: 'Orixás',
    imageUrl: '/img/eventos/orixas.webp',
    theme: 'escuro',
    bgColor: '#1B528A',
    textColor: '#FAF4E9',
    badgeBg: '#FAF4E9',
    badgeText: '#1B528A',
    dateColor: '#DBC6AB'
  },
  caboclos_claro: {
    id: 'caboclos_claro',
    label: 'Caboclos (Claro)',
    defaultTitle: 'Caboclos',
    imageUrl: '/img/eventos/caboclos.webp',
    theme: 'claro',
    bgColor: '#F7F2E8',
    textColor: '#275A24',
    badgeBg: '#153512',
    badgeText: '#F7F2E8',
    dateColor: '#275A24'
  },
  caboclos_escuro: {
    id: 'caboclos_escuro',
    label: 'Caboclos (Escuro)',
    defaultTitle: 'Caboclos',
    imageUrl: '/img/eventos/caboclos.webp',
    theme: 'escuro',
    bgColor: '#1E3A1A',
    textColor: '#FAF4E9',
    badgeBg: '#FAF4E9',
    badgeText: '#1E3A1A',
    dateColor: '#DBC6AB'
  },
  personalizado_claro: {
    id: 'personalizado_claro',
    label: 'Personalizado (Claro)',
    defaultTitle: '',
    imageUrl: '',
    theme: 'claro',
    bgColor: '#F7F2E8',
    textColor: '#414141',
    badgeBg: '#414141',
    badgeText: '#FAF4E9',
    dateColor: '#414141',
    isCustom: true
  },
  personalizado_escuro: {
    id: 'personalizado_escuro',
    label: 'Personalizado (Escuro)',
    defaultTitle: '',
    imageUrl: '',
    theme: 'escuro',
    bgColor: '#333333',
    textColor: '#FAF4E9',
    badgeBg: '#FAF4E9',
    badgeText: '#333333',
    dateColor: '#DBC6AB',
    isCustom: true
  }
};

// Resolver helper to map event.type to a preset style
function getEventPresetStyle(type: string, title: string): PresetStyle {
  if (PRESET_STYLES[type]) {
    return PRESET_STYLES[type];
  }
  // Backward compatibility check by matching keywords in title
  const cleanTitle = title.toLowerCase();
  if (cleanTitle.includes('preto velho')) return PRESET_STYLES.preto_velho_claro;
  if (cleanTitle.includes('exu') || cleanTitle.includes('pomba')) return PRESET_STYLES.exu_pomba_gira_claro;
  if (cleanTitle.includes('orixá') || cleanTitle.includes('orixa')) return PRESET_STYLES.orixas_claro;
  if (cleanTitle.includes('caboclo')) return PRESET_STYLES.caboclos_claro;

  return PRESET_STYLES.personalizado_claro;
}

// Convert category string to punchy short uppercase name matching Figma
function getShortCategoryName(category: string): string {
  const clean = category.toLowerCase().trim();
  if (clean.includes('atendimento')) return 'ATENDIMENTO';
  if (clean.includes('festiva')) return 'FESTIVA';
  if (clean.includes('manutenção') || clean.includes('manutencao')) return 'MANUTENÇÃO';
  if (clean.includes('estudo')) return 'ESTUDO';
  return category.toUpperCase();
}

export default function EventsView({ onToggleMenu, onBack }: { onToggleMenu: () => void; onBack: () => void }) {
  const { events, saveEvent, deleteEvent, currentAccount, terreiros, isTerreiroAdmin } = useAppData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Controls fullscreen form visibility
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Selected preset logic state
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('preto_velho_claro');
  const [themeMode, setThemeMode] = useState<'claro' | 'escuro'>('claro');
  
  // Track whether editing or creating
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');

  // Form states
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('Terreiro T7CA');
  const [formCategory, setFormCategory] = useState<string>('Gira de Atendimento'); // Optional
  const [formDescription, setFormDescription] = useState('');

  // Custom premium delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Schedule confirmation modal state
  const [pendingEvent, setPendingEvent] = useState<TerreiroEvent | null>(null);

  const eventToDelete = useMemo(() => {
    if (!deleteConfirmId) return null;
    return events.find(e => e.id === deleteConfirmId) ?? null;
  }, [deleteConfirmId, events]);

  const currentTerreiro = useMemo(() => {
    if (!currentAccount) return null;
    return terreiros.find(t => t.id === currentAccount.terreiroId);
  }, [currentAccount, terreiros]);

  // Handle preset category change
  const activePreset = useMemo(() => {
    // Determine target preset based on entity selection and themeMode
    let baseKey = selectedPresetKey.split('_').slice(0, -1).join('_');
    if (selectedPresetKey.startsWith('personalizado')) {
      baseKey = 'personalizado';
    }
    const resolvedKey = `${baseKey}_${themeMode}`;
    return PRESET_STYLES[resolvedKey] || PRESET_STYLES.personalizado_claro;
  }, [selectedPresetKey, themeMode]);

  // Accent colors for the form controls based on preset and theme selection
  const formAccent = useMemo(() => {
    if (activePreset.theme === 'escuro') {
      return {
        bg: activePreset.bgColor,
        text: '#FFFFFF',
        border: activePreset.bgColor
      };
    } else {
      return {
        bg: activePreset.textColor,
        text: '#FFFFFF',
        border: activePreset.textColor
      };
    }
  }, [activePreset]);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const formattedDate = date.toISOString().split('T')[0];
      const hasEvents = events.some(e => {
        const matchTerreiro = !currentAccount || e.terreiroId === currentAccount.terreiroId;
        const eDateStr = new Date(e.date).toISOString().split('T')[0];
        return matchTerreiro && eDateStr === formattedDate;
      });
      return hasEvents ? (
        <div className="dot-container">
          <div className="dot bg-[#1565c0]" />
        </div>
      ) : null;
    }
    return null;
  };

  const selectedDateString = selectedDate.toISOString().split('T')[0];

  const selectedDayEvents = useMemo(() => {
    return events
      .filter(e => {
        const matchTerreiro = !currentAccount || e.terreiroId === currentAccount.terreiroId;
        const eDateStr = new Date(e.date).toISOString().split('T')[0];
        return matchTerreiro && eDateStr === selectedDateString;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDateString, currentAccount]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resolve Title
    const finalTitle = activePreset.isCustom ? customTitle.trim() : activePreset.defaultTitle;

    if (!finalTitle || !formTime || !formLocation) {
      setFormError('Preencha os campos obrigatórios (Título, Horário e Local).');
      return;
    }

    const event: TerreiroEvent = {
      id: editingEventId || Math.random().toString(36).substring(2, 9),
      title: finalTitle,
      time: formTime,
      location: formLocation,
      type: activePreset.id, // Save active styling key here
      category: formCategory === 'Nenhum' ? '' : formCategory,
      description: formDescription,
      date: new Date(`${selectedDateString}T00:00:00`),
      terreiroId: currentAccount?.terreiroId ? String(currentAccount.terreiroId) : 'terreiro_t7ca',
      createdAt: new Date().toISOString()
    };

    // If editing, save directly; if creating new, show confirmation
    if (editingEventId) {
      saveEvent(event);
      handleCloseForm();
    } else {
      setPendingEvent(event);
    }
  };

  const handleEditClick = (event: TerreiroEvent) => {
    setEditingEventId(event.id);
    
    // Resolve preset style and set appropriate form options
    const style = getEventPresetStyle(event.type, event.title);
    setSelectedPresetKey(style.id);
    setThemeMode(style.theme);
    
    if (style.isCustom) {
      setCustomTitle(event.title);
    } else {
      setCustomTitle('');
    }
    
    setFormTime(event.time);
    setFormLocation(event.location);
    setFormCategory(event.category || 'Nenhum');
    setFormDescription(event.description);
    
    setFormError(null);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingEventId(null);
    setCustomTitle('');
    setFormTime('');
    setFormDescription('');
    setFormLocation('Terreiro T7CA');
    setFormCategory('Gira de Atendimento');
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-16 relative">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="space-y-8"
      >
        {/* Centralized Header with Brand Theme Colors */}
        <div className="relative flex items-center justify-between h-14 w-full">
          <button 
            onClick={onBack}
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF8F5] shadow-xs border border-black/[0.03] text-[#414141] active:scale-95 transition-transform z-10"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          
          <div className="w-full text-center">
            <h1 className="text-3xl font-bold text-[#1565c0] leading-tight font-behind-it">Calendário</h1>
            <p className="text-[10px] font-bold text-[#414141]/40 uppercase tracking-[0.2em] mt-0.5">
              {currentTerreiro?.nome ?? 'Agenda da Comunidade'}
            </p>
          </div>
          
          <button 
            onClick={onToggleMenu}
            className="absolute right-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF8F5] shadow-xs border border-black/[0.03] text-[#414141] active:scale-95 transition-transform z-10"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Apple Calendar Section (Soft Grey/Beige background card) */}
        <div className="relative overflow-hidden rounded-[36px] bg-[#FAF8F5] p-6 shadow-xs border border-black/[0.02]">
          <Calendar 
            onChange={(d) => setSelectedDate(d as Date)} 
            value={selectedDate} 
            tileContent={tileContent}
            locale="pt-BR"
            formatMonthYear={(_locale, date) => {
              const str = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
              return str.replace(/\s+de\s+/gi, ' ').replace(/^\w/, (c) => c.toUpperCase());
            }}
          />
        </div>

        {/* Day Activities List */}
        <div className="space-y-5">
          <div className="flex items-end justify-between px-1">
            <div>
              <span className="text-[10px] font-black text-[#1565c0] uppercase tracking-[0.2em]">Programação</span>
              <p className="text-2xl font-bold text-[#414141] tracking-tight mt-0.5">
                {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            {isTerreiroAdmin && (
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setFormError(null);
                  setShowAddForm(true);
                }}
                className="flex h-11 px-4 gap-1.5 items-center justify-center rounded-full bg-[#1565c0] hover:bg-[#0d47a1] text-white shadow-sm text-xs font-bold transition-all"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                <span>Novo</span>
              </motion.button>
            )}
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event, idx) => {
                  const style = getEventPresetStyle(event.type, event.title);
                  
                  // Split month and day from event.date
                  const eDate = new Date(event.date);
                  const monthName = eDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
                  const dayNum = eDate.toLocaleDateString('pt-BR', { day: 'numeric' });

                  const isClaro = style.theme === 'claro';

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: idx * 0.05, type: "spring", stiffness: 150, damping: 20 }}
                      className="group relative overflow-hidden rounded-[32px] p-6 min-h-[142px] flex flex-col justify-center transition-all duration-300 shadow-xs border border-black/[0.02]"
                      style={{ backgroundColor: style.bgColor }}
                    >
                      <div className="flex items-center justify-between z-10 relative pr-24 w-full">
                        <div className="flex items-center gap-5 w-full">
                          {/* Left: Date & Time Column */}
                          <div className="flex flex-col items-center justify-start shrink-0" style={{ color: style.dateColor }}>
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none opacity-60">{monthName}</span>
                            <span className="text-[42px] font-bold leading-none tracking-tighter mt-1">{dayNum}</span>
                            <span className="text-[13px] font-extrabold font-mono tracking-wide mt-1.5 opacity-85">{event.time}</span>
                          </div>

                          {/* Middle: Content */}
                          <div className="min-w-0 flex-1">
                            {event.category && (
                              <span 
                                className="inline-block px-1.5 py-0.5 rounded-[4px] text-[7.5px] font-black uppercase tracking-widest leading-none mb-1"
                                style={{ 
                                  backgroundColor: isClaro ? style.textColor : '#FFFFFF', 
                                  color: isClaro ? '#FFFFFF' : style.bgColor 
                                }}
                              >
                                {getShortCategoryName(event.category)}
                              </span>
                            )}
                            
                            <h4 
                              className="text-[23px] font-bold leading-tight font-behind"
                              style={{ color: style.textColor }}
                            >
                              {event.title}
                            </h4>
                            
                            {event.description && (
                              <p 
                                className="mt-1 text-[11px] leading-snug font-normal" 
                                style={{ color: isClaro ? '#414141' : '#FAF4E9' }}
                              >
                                {event.description}
                              </p>
                            )}

                            <div 
                              className="flex items-center gap-1 mt-2 text-[10px] font-bold" 
                              style={{ color: isClaro ? '#757575' : '#FAF4E9', opacity: isClaro ? 1 : 0.6 }}
                            >
                              <MapPin className="h-3 w-3" strokeWidth={2.5} style={{ color: isClaro ? '#757575' : style.textColor }} />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Blended preset illustration */}
                      {style.imageUrl && (
                        <div 
                          className="absolute right-0 bottom-0 top-0 w-[45%] pointer-events-none select-none z-0 overflow-hidden"
                          style={{
                            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
                          }}
                        >
                          <img 
                            src={style.imageUrl} 
                            alt="" 
                            className="h-full w-full object-contain object-right-bottom scale-[1.08] translate-y-1.5" 
                          />
                        </div>
                      )}

                      {/* Admin edit & delete options */}
                      {isTerreiroAdmin && (
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(event)}
                            className="p-2 rounded-full bg-white/40 hover:bg-white/70 text-[#414141] transition-colors active:scale-90"
                            title="Editar Evento"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(event.id)}
                            className="p-2 rounded-full bg-white/40 hover:bg-white/70 text-red-700 transition-colors active:scale-90"
                            title="Excluir Evento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 rounded-[32px] border border-dashed border-black/[0.04] bg-white/20"
                >
                  <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-xs">
                    <CalendarDays className="h-6 w-6 text-[#414141]/20" />
                  </div>
                  <p className="text-[11px] font-bold text-[#414141]/35 uppercase tracking-[0.2em]">Nenhum evento agendado</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Creation Page overlay (z-80 ensures it is above all) */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="fixed inset-0 z-[80] bg-white overflow-y-auto pb-16 flex flex-col"
          >
            {/* Centered Fullscreen Header */}
            <div className="px-6 pt-12 pb-5 relative flex items-center justify-between border-b border-black/[0.04] bg-white sticky top-0 z-20 h-28">
              <button 
                onClick={handleCloseForm}
                className="absolute left-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF8F5] shadow-xs border border-black/[0.03] text-[#414141] active:scale-95 transition-transform z-10"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>
              
              <div className="w-full text-center">
                <h2 className="text-2xl font-bold text-[#414141] font-behind-it">
                  {editingEventId ? 'Editar Evento' : 'Novo Evento'}
                </h2>
              </div>

              <button 
                onClick={handleCloseForm} 
                className="absolute right-6 p-2.5 rounded-full bg-black/5 text-[#414141]/40 active:scale-90 transition-transform z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pt-6 space-y-6 flex-1 pb-24">
              {formError && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-red-600">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-semibold leading-relaxed">{formError}</p>
                </div>
              )}

              {/* LIVE CARD PREVIEW SIMULATOR */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Visualização do Card</span>
                
                <div 
                  className="relative overflow-hidden rounded-[32px] p-6 min-h-[142px] flex flex-col justify-center transition-all duration-300 shadow-md border border-black/[0.02]"
                  style={{ backgroundColor: activePreset.bgColor }}
                >
                  <div className="flex items-center justify-between z-10 relative pr-24 w-full">
                    <div className="flex items-center gap-5 w-full">
                      {/* Left: Date & Time */}
                      <div className="flex flex-col items-center justify-start shrink-0" style={{ color: activePreset.dateColor }}>
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none opacity-60">
                          {selectedDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}
                        </span>
                        <span className="text-[42px] font-bold leading-none tracking-tighter mt-1">
                          {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric' })}
                        </span>
                        <span className="text-[13px] font-extrabold font-mono tracking-wide mt-1.5 opacity-85">
                          {formTime || '00:00'}
                        </span>
                      </div>

                      {/* Middle: Content */}
                      <div className="min-w-0 flex-1">
                        {formCategory && formCategory !== 'Nenhum' && (
                          <span 
                            className="inline-block px-1.5 py-0.5 rounded-[4px] text-[7.5px] font-black uppercase tracking-widest leading-none mb-1"
                            style={{ 
                              backgroundColor: activePreset.theme === 'claro' ? activePreset.textColor : '#FFFFFF', 
                              color: activePreset.theme === 'claro' ? '#FFFFFF' : activePreset.bgColor 
                            }}
                          >
                            {getShortCategoryName(formCategory)}
                          </span>
                        )}
                        <h4 
                          className="text-[23px] font-bold leading-tight font-behind"
                          style={{ color: activePreset.textColor }}
                        >
                          {activePreset.isCustom ? (customTitle || 'Título Personalizado') : activePreset.defaultTitle}
                        </h4>
                        
                        {formDescription && (
                          <p 
                            className="mt-1 text-[11px] leading-snug font-normal animate-fade-in" 
                            style={{ color: activePreset.theme === 'claro' ? '#414141' : '#FAF4E9' }}
                          >
                            {formDescription}
                          </p>
                        )}

                        <div 
                          className="flex items-center gap-1 mt-2 text-[10px] font-bold" 
                          style={{ color: activePreset.theme === 'claro' ? '#757575' : '#FAF4E9', opacity: activePreset.theme === 'claro' ? 1 : 0.6 }}
                        >
                          <MapPin className="h-3 w-3" strokeWidth={2.5} style={{ color: activePreset.theme === 'claro' ? '#757575' : activePreset.textColor }} />
                          <span className="truncate">{formLocation || 'Local'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right image */}
                  {activePreset.imageUrl && (
                    <div 
                      className="absolute right-0 bottom-0 top-0 w-[45%] pointer-events-none select-none z-0 overflow-hidden"
                      style={{
                        maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
                      }}
                    >
                      <img 
                        src={activePreset.imageUrl} 
                        alt="" 
                        className="h-full w-full object-contain object-right-bottom scale-[1.08] translate-y-1.5" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* FORM FIELDS */}
              <form onSubmit={handleAddEvent} className="space-y-6">
                
                {/* PRESET ENTITY CAROUSEL */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Entidade ou Tipo</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
                    {[
                      { key: 'preto_velho_claro', label: 'Preto Velho' },
                      { key: 'exu_pomba_gira_claro', label: 'Exu & Pomba Gira' },
                      { key: 'orixas_claro', label: 'Orixás' },
                      { key: 'caboclos_claro', label: 'Caboclos' },
                      { key: 'personalizado_claro', label: 'Personalizado' }
                    ].map((opt) => {
                      const isActive = selectedPresetKey.startsWith(opt.key.split('_')[0]);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setSelectedPresetKey(opt.key);
                            if (formError) setFormError(null);
                          }}
                          className="px-4 py-2.5 rounded-full text-xs font-bold shrink-0 border transition-all shadow-xs"
                          style={{
                            backgroundColor: isActive ? formAccent.bg : '#FFFFFF',
                            color: isActive ? formAccent.text : '#414141',
                            borderColor: isActive ? 'transparent' : 'rgba(0,0,0,0.05)'
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* THEME SELECTOR MODE */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Estilo Visual</label>
                  <div className="flex gap-2.5 bg-black/[0.03] rounded-2xl p-1 max-w-[200px]">
                    <button
                      type="button"
                      onClick={() => setThemeMode('claro')}
                      className="flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all"
                      style={{
                        backgroundColor: themeMode === 'claro' ? formAccent.bg : 'transparent',
                        color: themeMode === 'claro' ? formAccent.text : '#414141',
                      }}
                    >
                      Claro
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeMode('escuro')}
                      className="flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all"
                      style={{
                        backgroundColor: themeMode === 'escuro' ? formAccent.bg : 'transparent',
                        color: themeMode === 'escuro' ? formAccent.text : '#414141',
                      }}
                    >
                      Escuro
                    </button>
                  </div>
                </div>

                {/* CUSTOM TITLE (If Personalized style is chosen) */}
                {activePreset.isCustom && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Título do Evento</label>
                    <input
                      required
                      type="text"
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      placeholder="Ex: Reunião do Terreiro"
                      className="w-full rounded-2xl bg-[#FAF8F5] border border-black/[0.04] px-5 py-3.5 text-sm font-semibold outline-none focus:bg-white transition-all text-[#414141] shadow-xs"
                      style={{
                        '--tw-ring-color': formAccent.bg
                      } as React.CSSProperties}
                    />
                  </div>
                )}

                {/* CATEGORY & TIME ROW */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Categoria (Badge)</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full rounded-2xl bg-[#FAF8F5] border border-black/[0.04] px-5 py-3.5 text-sm font-semibold outline-none focus:bg-white transition-all text-[#414141] shadow-xs"
                    >
                      <option value="Gira de Atendimento">Gira de Atendimento</option>
                      <option value="Gira Festiva">Gira Festiva</option>
                      <option value="Estudo">Estudo</option>
                      <option value="Manutenção do Terreiro">Manutenção do Terreiro</option>
                      <option value="Nenhum">Nenhum / Opcional</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Horário</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#414141]/35" />
                      <input
                        required
                        type="time"
                        value={formTime}
                        onChange={e => setFormTime(e.target.value)}
                        className="w-full rounded-2xl bg-[#FAF8F5] border border-black/[0.04] pl-11 pr-5 py-3.5 text-sm font-semibold outline-none focus:bg-white transition-all text-[#414141] shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* LOCATION */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Localização</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#414141]/35" />
                    <input
                      required
                      type="text"
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                      placeholder="Ex: Terreiro T7CA"
                      className="w-full rounded-2xl bg-[#FAF8F5] border border-black/[0.04] pl-11 pr-5 py-3.5 text-sm font-semibold outline-none focus:bg-white transition-all text-[#414141] shadow-xs"
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Descrição Curta (Exibida no Card)</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Ex: Atendimento com passes e consultas espirituais."
                    className="w-full rounded-2xl bg-[#FAF8F5] border border-black/[0.04] px-5 py-3.5 text-sm font-semibold outline-none focus:bg-white transition-all text-[#414141] shadow-xs"
                  />
                </div>

                {/* SUBMIT BUTTON WITH STANDARD PADDING AND BREATHE ROOM */}
                <div className="pt-6 pb-12">
                  <button
                    type="submit"
                    className="w-full rounded-full py-4 text-base font-bold text-white active:scale-[0.97] transition-transform duration-150 ease-out"
                    style={{
                      background: 'linear-gradient(180deg, #7DD3FC 0%, #38BDF8 40%, #0EA5E9 100%)',
                      border: '1.5px solid rgba(255,255,255,0.5)',
                      boxShadow: '0 4px 15px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    {editingEventId ? 'Salvar Alterações' : 'Agendar Evento'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Premium Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 10, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[340px] rounded-[32px] bg-white p-6 shadow-2xl border border-black/5 flex flex-col items-center text-center"
              >
                <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-[#414141] font-behind-it">Excluir Evento</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#414141]/65 font-medium px-1">
                  Tem certeza de que deseja remover o evento <strong className="text-red-700 font-bold">"{eventToDelete?.title}"</strong> permanentemente da programação? Esta ação não pode ser desfeita.
                </p>
                
                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="py-3 rounded-full text-xs font-bold text-[#414141] bg-black/[0.03] hover:bg-black/[0.06] active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (deleteConfirmId) {
                        await deleteEvent(deleteConfirmId);
                        setDeleteConfirmId(null);
                      }
                    }}
                    className="py-3 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-sm shadow-red-500/20"
                  >
                    Excluir
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Premium Schedule Confirmation Modal */}
      <AnimatePresence>
        {pendingEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingEvent(null)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 10, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[340px] rounded-[32px] bg-white p-6 shadow-2xl border border-black/5 flex flex-col items-center text-center"
              >
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <CalendarDays className="h-6 w-6 text-[#1565c0]" />
                </div>

                <h3 className="text-xl font-bold text-[#414141] font-behind-it">Confirmar Agendamento</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#414141]/65 font-medium px-1">
                  Deseja agendar o evento <strong className="text-[#1565c0] font-bold">"{pendingEvent.title}"</strong> para o dia{' '}
                  <strong className="font-bold">
                    {new Date(pendingEvent.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                  </strong>{' '}
                  às <strong className="font-bold">{pendingEvent.time}</strong> em <strong className="font-bold">{pendingEvent.location}</strong>?
                </p>

                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                  <button
                    onClick={() => setPendingEvent(null)}
                    className="py-3 rounded-full text-xs font-bold text-[#414141] bg-black/[0.03] hover:bg-black/[0.06] active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (pendingEvent) {
                        saveEvent(pendingEvent);
                        setPendingEvent(null);
                        handleCloseForm();
                      }
                    }}
                    className="py-3 rounded-full text-xs font-bold text-white active:scale-95 transition-all"
                    style={{
                      background: 'linear-gradient(180deg, #7DD3FC 0%, #38BDF8 40%, #0EA5E9 100%)',
                      boxShadow: '0 4px 15px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
                      border: '1.5px solid rgba(255,255,255,0.5)',
                    }}
                  >
                    Confirmar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
