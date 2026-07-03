import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Plus, CalendarDays, X, Menu, AlertCircle, ChevronLeft } from 'lucide-react';
import '../styles/Calendar.css';
import { TerreiroEvent, EventCategory, EventType } from '../types';
import { useAppData } from '../context/AppDataContext';

export default function EventsView({ onToggleMenu, onBack }: { onToggleMenu: () => void; onBack: () => void }) {
  const { events, saveEvent, currentAccount, terreiros, isTerreiroAdmin } = useAppData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const currentTerreiro = useMemo(() => {
    if (!currentAccount) return null;
    return terreiros.find(t => t.id === currentAccount.terreiroId);
  }, [currentAccount, terreiros]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    location: '',
    type: 'normal' as EventType,
    category: 'Religioso' as EventCategory,
    description: ''
  });

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
    if (!newEvent.title || !newEvent.time || !newEvent.location) {
      setFormError('Preencha os campos obrigatórios.');
      return;
    }
    const event: TerreiroEvent = {
      id: Math.random().toString(36).substring(2, 9),
      title: newEvent.title,
      time: newEvent.time,
      location: newEvent.location,
      type: newEvent.type,
      category: newEvent.category,
      description: newEvent.description,
      date: new Date(`${selectedDateString}T00:00:00`),
      terreiroId: currentAccount?.terreiroId ? String(currentAccount.terreiroId) : '1',
      createdAt: new Date().toISOString()
    };
    
    saveEvent(event);
    setShowAddModal(false);
    setFormError(null);
    setNewEvent({ 
      title: '', 
      time: '', 
      location: '', 
      type: 'normal', 
      category: 'Religioso',
      description: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#e3f2fd] px-6 pt-12 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="space-y-8"
      >
        {/* Header (Clean, spacious, high contrast, back button included) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-black/[0.03] text-[#414141] active:scale-95 transition-transform"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#414141] leading-tight font-behind-it">Calendário</h1>
              <p className="text-[10px] font-bold text-[#1565c0]/50 uppercase tracking-[0.2em] mt-0.5">
                {currentTerreiro?.nome ?? 'Agenda da Comunidade'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onToggleMenu}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-black/[0.03] text-[#414141] active:scale-95 transition-transform"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Apple Calendar Section (Ultra clean background card) */}
        <div className="relative overflow-hidden rounded-[36px] bg-white p-6 shadow-[0_15px_30px_rgba(0,0,0,0.03)] border border-black/[0.03]">
          <Calendar 
            onChange={(d) => setSelectedDate(d as Date)} 
            value={selectedDate} 
            tileContent={tileContent}
            locale="pt-BR"
          />
        </div>

        {/* Day Activities List */}
        <div className="space-y-5">
          <div className="flex items-end justify-between px-1">
            <div>
              <span className="text-[10px] font-black text-[#1565c0]/40 uppercase tracking-[0.2em]">Programação</span>
              <p className="text-2xl font-bold text-[#414141] tracking-tight mt-0.5">
                {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            {isTerreiroAdmin && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFormError(null);
                  setShowAddModal(true);
                }}
                className="flex h-11 px-4 gap-1.5 items-center justify-center rounded-full bg-[#1565c0] text-white shadow-md shadow-[#1565c0]/10 text-xs font-bold transition-all hover:bg-[#0d47a1]"
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
                  const isImportante = event.type === 'importante';
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: idx * 0.05, type: "spring", stiffness: 150, damping: 20 }}
                      className={`group relative overflow-hidden rounded-[28px] p-5 border shadow-sm transition-all ${
                        isImportante 
                          ? 'bg-[#1565c0]/5 border-[#1565c0]/10' 
                          : 'bg-[#E8F8E4]/50 border-emerald-500/10'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Time Left Badge */}
                        <div className="flex flex-col items-center justify-center pt-0.5 shrink-0">
                          <span className={`text-base font-bold font-mono ${isImportante ? 'text-[#1565c0]' : 'text-emerald-700'}`}>
                            {event.time}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-wider text-black/35 mt-0.5">HORAS</span>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${isImportante ? 'bg-[#1565c0]' : 'bg-emerald-500'}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isImportante ? 'text-[#1565c0]/60' : 'text-emerald-600'}`}>
                              {event.category}
                            </span>
                          </div>
                          <h4 className="text-[17px] font-bold text-[#414141] mt-1.5 leading-tight group-hover:text-[#1565c0] transition-colors truncate">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-2 text-[#414141]/50 text-xs font-semibold">
                            <MapPin className="h-3.5 w-3.5 text-[#1565c0]" strokeWidth={2.2} />
                            <span className="truncate">{event.location}</span>
                          </div>
                          {event.description && (
                            <p className="mt-3 text-xs leading-relaxed text-[#414141]/60 font-medium">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 rounded-[32px] border border-dashed border-black/[0.04] bg-white/20"
                >
                  <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                    <CalendarDays className="h-6 w-6 text-[#1565c0]/20" />
                  </div>
                  <p className="text-[11px] font-bold text-[#414141]/35 uppercase tracking-[0.2em]">Nenhum evento agendado</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Add Event Modal (Sleek Apple style drawer) */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 z-[70] rounded-t-[40px] bg-white p-7 pb-10 shadow-2xl border-t border-black/5"
            >
              {/* Drag Indicator */}
              <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-black/10" />
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#414141] font-behind-it">Novo Evento</h2>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="p-2 rounded-full bg-black/5 text-[#414141]/40 active:scale-90 transition-transform"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {formError && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-red-600 mb-5">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-semibold leading-relaxed">{formError}</p>
                </div>
              )}

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Título</label>
                  <input
                    required
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Ex: Gira de Caboclo"
                    className="w-full rounded-2xl bg-black/5 border border-transparent px-5 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-[#1565c0]/10 focus:ring-4 focus:ring-[#1565c0]/5 transition-all text-[#414141]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Horário</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#414141]/35" />
                      <input
                        required
                        type="time"
                        value={newEvent.time}
                        onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                        className="w-full rounded-2xl bg-black/5 border border-transparent pl-11 pr-5 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-[#1565c0]/10 focus:ring-4 focus:ring-[#1565c0]/5 transition-all text-[#414141]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Categoria</label>
                    <select
                      value={newEvent.category}
                      onChange={e => setNewEvent({...newEvent, category: e.target.value as EventCategory})}
                      className="w-full rounded-2xl bg-black/5 border border-transparent px-5 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-[#1565c0]/10 focus:ring-4 focus:ring-[#1565c0]/5 transition-all appearance-none text-[#414141]"
                    >
                      <option>Religioso</option>
                      <option>Festa</option>
                      <option>Estudo</option>
                      <option>Manutenção</option>
                      <option>Fundamento</option>
                      <option>Administrativo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Tipo</label>
                    <select
                      value={newEvent.type}
                      onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})}
                      className="w-full rounded-2xl bg-black/5 border border-transparent px-5 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-[#1565c0]/10 focus:ring-4 focus:ring-[#1565c0]/5 transition-all appearance-none text-[#414141]"
                    >
                      <option value="normal">Público (Normal)</option>
                      <option value="importante">Interno (Importante)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Localização</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#414141]/35" />
                      <input
                        required
                        type="text"
                        value={newEvent.location}
                        onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                        placeholder="Ex: Terreiro T7CA"
                        className="w-full rounded-2xl bg-black/5 border border-transparent pl-11 pr-5 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-[#1565c0]/10 focus:ring-4 focus:ring-[#1565c0]/5 transition-all text-[#414141]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#414141]/35 uppercase tracking-widest ml-3">Descrição (Opcional)</label>
                  <textarea
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Detalhes ou orientações do ritual..."
                    rows={2}
                    className="w-full rounded-2xl bg-black/5 border border-transparent px-5 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:border-[#1565c0]/10 focus:ring-4 focus:ring-[#1565c0]/5 transition-all resize-none text-[#414141]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#1565c0] py-4.5 text-sm font-bold text-white shadow-md shadow-[#1565c0]/10 active:scale-[0.98] transition-transform mt-4"
                >
                  Agendar Evento
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
