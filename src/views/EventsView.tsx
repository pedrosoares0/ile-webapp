import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Plus, CalendarDays, X, Menu } from 'lucide-react';
import '../styles/Calendar.css';
import { Event } from '../types';

const mockEvents: Event[] = [
  { 
    id: '1',
    date: new Date(2026, 2, 3), 
    title: 'Gira de Caboclo', 
    time: '19:00', 
    location: 'Terreiro T7CA', 
    type: 'importante',
    category: 'Religioso'
  },
  { 
    id: '2',
    date: new Date(2026, 2, 12), 
    title: 'Limpeza do Terreiro', 
    time: '09:00', 
    location: 'Terreiro T7CA', 
    type: 'normal',
    category: 'Manutenção'
  },
  { 
    id: '3',
    date: new Date(2026, 2, 15), 
    title: 'Festa de Ogum', 
    time: '18:00', 
    location: 'Largo do Jenipapeiro', 
    type: 'importante',
    category: 'Festa'
  },
  { 
    id: '4',
    date: new Date(2026, 2, 24), 
    title: 'Deitada de Santo', 
    time: '19:00', 
    location: 'Terreiro T7CA', 
    type: 'importante',
    category: 'Fundamento'
  },
  { 
    id: '5',
    date: new Date(2026, 2, 28), 
    title: 'Reunião de Cambonos', 
    time: '15:00', 
    location: 'Sala de Estudos', 
    type: 'normal',
    category: 'Estudo'
  },
];

const EventsView = ({ onToggleMenu }: { onToggleMenu: () => void }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    location: '',
    type: 'normal' as 'normal' | 'importante',
    category: 'Religioso'
  });

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const dayEvents = events.filter(event => event.date.toDateString() === date.toDateString());
      if (dayEvents.length > 0) {
        return (
          <div className="dot-container">
            {dayEvents.slice(0, 3).map((event, i) => (
              <div key={i} className={`dot ${event.type}`} />
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const selectedDayEvents = events.filter(
    event => event.date.toDateString() === selectedDate.toDateString()
  );

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: Event = {
      id: Date.now().toString(),
      date: selectedDate,
      ...newEvent
    };
    setEvents([...events, event]);
    setShowAddModal(false);
    setNewEvent({ title: '', time: '', location: '', type: 'normal', category: 'Religioso' });
  };

  return (
    <div className="min-h-screen bg-[#fef7e7] px-6 pt-16 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header with Menu Button */}
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-[32px] font-black text-[#414141] leading-tight">Eventos</h1>
            <p className="text-[11px] font-bold text-[#941c1c] opacity-30 uppercase tracking-[0.2em]">Calendário T7CA</p>
          </div>
          <button 
            onClick={onToggleMenu}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg border border-black/5 text-[#414141] active:scale-90 transition-transform"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar Section */}
        <div className="relative overflow-hidden rounded-[40px] bg-white p-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-black/5">
          <Calendar 
            onChange={(d) => setSelectedDate(d as Date)} 
            value={selectedDate} 
            tileContent={tileContent}
            locale="pt-BR"
          />
        </div>

        {/* Activities of the Day */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div>
              <h3 className="text-[11px] font-bold text-[#941c1c] opacity-30 uppercase tracking-[0.2em] mb-1">Atividades de Hoje</h3>
              <p className="text-2xl font-bold text-[#414141] tracking-tight">
                {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAddModal(true)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#941c1c] text-white shadow-xl shadow-[#941c1c]/20 transition-all hover:bg-[#a82424]"
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </motion.button>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                    className="group relative overflow-hidden rounded-[32px] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-2 w-2 rounded-full ${event.type === 'importante' ? 'bg-[#941c1c]' : 'bg-green-500'} ring-4 ${event.type === 'importante' ? 'ring-[#941c1c]/10' : 'ring-green-500/10'}`} />
                          <span className="text-[10px] font-bold text-[#414141]/30 uppercase tracking-widest">{event.category}</span>
                        </div>
                        <h4 className="text-[18px] font-bold text-[#414141] leading-tight group-hover:text-[#941c1c] transition-colors">{event.title}</h4>
                        <div className="flex items-center gap-5 pt-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#fef7e7]">
                              <Clock className="h-3.5 w-3.5 text-[#941c1c]" />
                            </div>
                            <span className="text-[12px] font-semibold text-[#414141]/60">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#fef7e7]">
                              <MapPin className="h-3.5 w-3.5 text-[#941c1c]" />
                            </div>
                            <span className="text-[12px] font-semibold text-[#414141]/60">{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-8 w-8 rounded-full bg-[#fef7e7] flex items-center justify-center">
                          <Plus className="h-4 w-4 text-[#941c1c] rotate-45" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-14 rounded-[40px] border-2 border-dashed border-black/[0.03] bg-white/30"
                >
                  <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                    <CalendarDays className="h-8 w-8 text-[#941c1c]/20" />
                  </div>
                  <p className="text-[12px] font-bold text-[#414141]/20 uppercase tracking-[0.2em]">Sem atividades agendadas</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[70] rounded-t-[45px] bg-white p-8 shadow-2xl"
            >
              <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-black/10" />
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#414141]">Novo Evento</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full bg-black/5">
                  <X className="h-5 w-5 text-[#414141]/40" />
                </button>
              </div>
              <form onSubmit={handleAddEvent} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#414141]/30 uppercase tracking-widest ml-4">Título do Evento</label>
                  <input
                    required
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Ex: Gira de Caboclo"
                    className="w-full rounded-2xl bg-black/5 px-6 py-4 text-sm font-semibold outline-none focus:ring-2 ring-[#941c1c]/20 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#414141]/30 uppercase tracking-widest ml-4">Horário</label>
                    <div className="relative">
                      <Clock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#414141]/30" />
                      <input
                        required
                        type="time"
                        value={newEvent.time}
                        onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                        className="w-full rounded-2xl bg-black/5 pl-12 pr-6 py-4 text-sm font-semibold outline-none focus:ring-2 ring-[#941c1c]/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#414141]/30 uppercase tracking-widest ml-4">Categoria</label>
                    <select
                      value={newEvent.category}
                      onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                      className="w-full rounded-2xl bg-black/5 px-6 py-4 text-sm font-semibold outline-none focus:ring-2 ring-[#941c1c]/20 transition-all appearance-none"
                    >
                      <option>Religioso</option>
                      <option>Festa</option>
                      <option>Estudo</option>
                      <option>Manutenção</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#414141]/30 uppercase tracking-widest ml-4">Localização</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#414141]/30" />
                    <input
                      required
                      type="text"
                      value={newEvent.location}
                      onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                      placeholder="Ex: Terreiro T7CA"
                      className="w-full rounded-2xl bg-black/5 pl-12 pr-6 py-4 text-sm font-semibold outline-none focus:ring-2 ring-[#941c1c]/20 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#941c1c] py-5 text-sm font-bold text-white shadow-xl shadow-[#941c1c]/20 active:scale-[0.98] transition-all mt-4"
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
};

export default EventsView;
