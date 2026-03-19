import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  Info,
  MapPin,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from 'lucide-react';
import '../styles/Calendar.css';
import EmptyStateCard from '../components/EmptyStateCard';
import SheetModal from '../components/SheetModal';
import { useAppData } from '../context/AppDataContext';
import { formatDateInputValue, getUpcomingEvent, isSameDay, isSameMonth, sortEvents } from '../lib/date';
import { createId } from '../lib/id';
import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EventCategory,
  EventType,
  TerreiroEvent,
} from '../types';

interface EventFormState {
  title: string;
  time: string;
  location: string;
  type: EventType;
  category: EventCategory;
  terreiroId: string;
  description: string;
  date: string;
}

function getDefaultEventForm(selectedDate: Date, terreiroId: string): EventFormState {
  return {
    title: '',
    time: '',
    location: '',
    type: 'normal',
    category: 'Religioso',
    terreiroId,
    description: '',
    date: formatDateInputValue(selectedDate),
  };
}

export default function EventsView() {
  const { events, terreiros, saveEvent, deleteEvent } = useAppData();
  const initialSelectedDate = getUpcomingEvent(events)?.date ?? new Date();
  const firstTerreiroId = terreiros[0]?.id ?? '';
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>(() =>
    getDefaultEventForm(initialSelectedDate, firstTerreiroId),
  );

  const orderedEvents = sortEvents(events);
  const selectedDayEvents = orderedEvents.filter((event) => isSameDay(event.date, selectedDate));
  const currentMonthEvents = orderedEvents.filter((event) => isSameMonth(event.date, selectedDate));

  function getTerreiroName(terreiroId: string) {
    return terreiros.find((terreiro) => terreiro.id === terreiroId)?.nome ?? 'Terreiro não encontrado';
  }

  function openCreateModal() {
    setFormError(null);
    setEditingEventId(null);
    setEventForm(getDefaultEventForm(selectedDate, firstTerreiroId));
    setShowEventModal(true);
  }

  function openEditModal(event: TerreiroEvent) {
    setFormError(null);
    setEditingEventId(event.id);
    setEventForm({
      title: event.title,
      time: event.time,
      location: event.location,
      type: event.type,
      category: event.category,
      terreiroId: event.terreiroId,
      description: event.description,
      date: formatDateInputValue(event.date),
    });
    setShowEventModal(true);
  }

  function closeModal() {
    setFormError(null);
    setShowEventModal(false);
    setEditingEventId(null);
  }

  function handleDeleteCurrentEvent() {
    if (!editingEventId) {
      return;
    }

    const shouldDelete = window.confirm('Deseja realmente excluir este evento?');

    if (!shouldDelete) {
      return;
    }

    deleteEvent(editingEventId);
    closeModal();
  }

  function tileContent({ date, view }: { date: Date; view: string }) {
    if (view !== 'month') {
      return null;
    }

    const dayEvents = events.filter((event) => isSameDay(event.date, date));

    if (dayEvents.length === 0) {
      return null;
    }

    return (
      <div className="dot-container">
        {dayEvents.slice(0, 3).map((event) => (
          <div key={event.id} className={`dot ${event.type}`} />
        ))}
      </div>
    );
  }

  function handleSaveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!eventForm.terreiroId) {
      setFormError('Cadastre ao menos um terreiro antes de criar eventos.');
      return;
    }

    const eventDate = new Date(`${eventForm.date}T00:00:00`);

    const nextEvent: TerreiroEvent = {
      id: editingEventId ?? createId('event'),
      date: eventDate,
      title: eventForm.title.trim(),
      time: eventForm.time,
      location: eventForm.location.trim(),
      type: eventForm.type,
      category: eventForm.category,
      terreiroId: eventForm.terreiroId,
      description: eventForm.description.trim(),
      createdAt:
        events.find((registeredEvent) => registeredEvent.id === editingEventId)?.createdAt ??
        new Date().toISOString(),
    };

    saveEvent(nextEvent);
    setSelectedDate(eventDate);
    closeModal();
  }

  return (
    <div className="min-h-screen bg-[#fef7e7] px-6 pb-32 pt-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="relative overflow-hidden rounded-[40px] border border-black/5 bg-white p-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]">
          <Calendar
            onChange={(date) => setSelectedDate(date as Date)}
            value={selectedDate}
            tileContent={tileContent}
            locale="pt-BR"
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div>
              <h3 className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#941c1c] opacity-30">
                Atividades do Dia
              </h3>
              <p className="text-2xl font-bold tracking-tight text-[#414141]">
                {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={openCreateModal}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#941c1c] text-white shadow-xl shadow-[#941c1c]/20 transition-all hover:bg-[#a82424]"
              aria-label="Cadastrar evento"
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </motion.button>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event, index) => (
                  <motion.button
                    key={event.id}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                    onClick={() => openEditModal(event)}
                    className="group relative w-full overflow-hidden rounded-[32px] border border-black/5 bg-white p-6 text-left shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              event.type === 'importante' ? 'bg-[#941c1c] ring-[#941c1c]/10' : 'bg-green-500 ring-green-500/10'
                            } ring-4`}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#414141]/30">
                            {event.category}
                          </span>
                        </div>
                        <h4 className="text-[18px] font-bold leading-tight text-[#414141] transition-colors group-hover:text-[#941c1c]">
                          {event.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#fef7e7] p-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#941c1c]" />
                            </div>
                            <span className="text-[12px] font-semibold text-[#414141]/60">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#fef7e7] p-1.5">
                              <MapPin className="h-3.5 w-3.5 text-[#941c1c]" />
                            </div>
                            <span className="text-[12px] font-semibold text-[#414141]/60">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#fef7e7] p-1.5">
                              <Building2 className="h-3.5 w-3.5 text-[#941c1c]" />
                            </div>
                            <span className="text-[12px] font-semibold text-[#414141]/60">
                              {getTerreiroName(event.terreiroId)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fef7e7]">
                          <Pencil className="h-4 w-4 text-[#941c1c]" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))
              ) : (
                <EmptyStateCard
                  icon={<CalendarDays className="h-8 w-8 text-[#941c1c]/20" />}
                  title="Sem atividades agendadas"
                  description="Cadastre eventos deste dia para montar a agenda completa do terreiro."
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6 pt-6">
          <div className="px-2">
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#941c1c] opacity-30">
              Destaques do Mês
            </h3>
            <p className="text-2xl font-bold capitalize tracking-tight text-[#414141]">
              {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="-mx-6 flex gap-5 overflow-x-auto px-6 pb-8 scrollbar-hide">
            {currentMonthEvents.length > 0 ? (
              currentMonthEvents.map((event) => (
                <motion.button
                  key={`month-${event.id}`}
                  type="button"
                  whileHover={{ y: -5 }}
                  onClick={() => openEditModal(event)}
                  className="relative w-[290px] flex-shrink-0 overflow-hidden rounded-[36px] border border-black/5 bg-white p-7 text-left shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div
                      className={`rounded-xl px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest ${
                        event.type === 'importante'
                          ? 'bg-[#941c1c]/10 text-[#941c1c]'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {event.category}
                    </div>
                    <div className="min-w-[50px] rounded-2xl bg-[#fef7e7] px-3 py-2 text-center">
                      <p className="mb-0.5 text-[18px] font-black leading-none text-[#941c1c]">
                        {event.date.getDate()}
                      </p>
                      <p className="text-[9px] font-bold uppercase text-[#941c1c]/40">
                        {event.date.toLocaleDateString('pt-BR', { month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <h4 className="mb-3 text-[19px] font-bold leading-tight text-[#414141]">{event.title}</h4>
                  <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#941c1c]/40">
                    {getTerreiroName(event.terreiroId)}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f8f8f8]">
                        <Clock className="h-3.5 w-3.5 text-[#414141]/30" />
                      </div>
                      <span className="text-[11px] font-bold text-[#414141]/50">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f8f8f8]">
                        <MapPin className="h-3.5 w-3.5 text-[#414141]/30" />
                      </div>
                      <span className="truncate text-[11px] font-bold text-[#414141]/50">{event.location}</span>
                    </div>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="w-full">
                <EmptyStateCard
                  icon={<CalendarDays className="h-8 w-8 text-[#941c1c]/20" />}
                  title="Mês sem destaques"
                  description="Os eventos cadastrados deste mês vão aparecer aqui em formato de destaque."
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <SheetModal
        isOpen={showEventModal}
        title={editingEventId ? 'Editar Evento' : 'Novo Evento'}
        subtitle={`Para: ${new Date(`${eventForm.date}T00:00:00`).toLocaleDateString('pt-BR')}`}
        onClose={closeModal}
      >
        <form onSubmit={handleSaveEvent} className="space-y-6">
          {formError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-[#941c1c]/10 bg-white px-5 py-4 text-[#941c1c]">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="text-[13px] font-semibold leading-relaxed">{formError}</p>
            </div>
          ) : null}

          <div>
            <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
              Título do Evento
            </label>
            <div className="relative">
              <Info className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#941c1c]/20" />
              <input
                required
                value={eventForm.title}
                onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })}
                placeholder="Ex: Gira de Pretos Velhos"
                className="w-full rounded-[25px] border border-white bg-white px-14 py-4 font-bold text-[#414141] placeholder:text-[#414141]/20 focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
                Data
              </label>
              <input
                required
                type="date"
                value={eventForm.date}
                onChange={(event) => setEventForm({ ...eventForm, date: event.target.value })}
                className="w-full rounded-[25px] border border-white bg-white px-6 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10"
              />
            </div>
            <div>
              <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
                Horário
              </label>
              <div className="relative">
                <Clock className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#941c1c]/20" />
                <input
                  required
                  type="time"
                  value={eventForm.time}
                  onChange={(event) => setEventForm({ ...eventForm, time: event.target.value })}
                  className="w-full rounded-[25px] border border-white bg-white px-14 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
                Tipo
              </label>
              <div className="relative">
                <Tag className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#941c1c]/20" />
                <select
                  value={eventForm.type}
                  onChange={(event) =>
                    setEventForm({ ...eventForm, type: event.target.value as EventType })
                  }
                  className="w-full appearance-none rounded-[25px] border border-white bg-white px-14 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type === 'normal' ? 'Normal' : 'Importante'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
                Categoria
              </label>
              <select
                value={eventForm.category}
                onChange={(event) =>
                  setEventForm({ ...eventForm, category: event.target.value as EventCategory })
                }
                className="w-full appearance-none rounded-[25px] border border-white bg-white px-6 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10"
              >
                {EVENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
              Localização
            </label>
            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#941c1c]/20" />
              <input
                required
                value={eventForm.location}
                onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })}
                placeholder="Ex: Terreiro T7CA"
                className="w-full rounded-[25px] border border-white bg-white px-14 py-4 font-bold text-[#414141] placeholder:text-[#414141]/20 focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
              Terreiro
            </label>
            <div className="relative">
              <Building2 className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#941c1c]/20" />
              <select
                value={eventForm.terreiroId}
                onChange={(event) => setEventForm({ ...eventForm, terreiroId: event.target.value })}
                className="w-full appearance-none rounded-[25px] border border-white bg-white px-14 py-4 font-bold text-[#414141] focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10"
              >
                {terreiros.map((terreiro) => (
                  <option key={terreiro.id} value={terreiro.id}>
                    {terreiro.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 ml-4 block text-[10px] font-black uppercase tracking-widest text-[#941c1c]/40">
              Descrição
            </label>
            <div className="relative">
              <FileText className="absolute left-6 top-6 h-5 w-5 text-[#941c1c]/20" />
              <textarea
                value={eventForm.description}
                onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })}
                rows={4}
                placeholder="Detalhes do evento, observações internas ou contexto espiritual."
                className="w-full resize-none rounded-[25px] border border-white bg-white px-14 py-4 font-bold text-[#414141] placeholder:text-[#414141]/20 focus:outline-none focus:ring-2 focus:ring-[#941c1c]/10"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="mt-4 w-full rounded-[28px] bg-[#941c1c] py-6 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-[#941c1c]/20 transition-all active:scale-[0.98]"
            >
              {editingEventId ? 'SALVAR ALTERAÇÕES' : 'CRIAR EVENTO'}
            </button>

            {editingEventId ? (
              <button
                type="button"
                onClick={handleDeleteCurrentEvent}
                className="flex w-full items-center justify-center gap-2 rounded-[28px] bg-white py-5 text-sm font-black uppercase tracking-[0.16em] text-[#941c1c] shadow-sm transition-all active:scale-[0.98]"
              >
                <Trash2 className="h-4 w-4" />
                Excluir Evento
              </button>
            ) : null}
          </div>
        </form>
      </SheetModal>
    </div>
  );
}
