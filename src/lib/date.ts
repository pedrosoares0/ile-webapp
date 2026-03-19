import { TerreiroEvent } from '../types';

function getEventTimeParts(time: string) {
  const [hours, minutes] = time.split(':').map((part) => Number(part));
  return {
    hours: Number.isFinite(hours) ? hours : 0,
    minutes: Number.isFinite(minutes) ? minutes : 0,
  };
}

export function getEventTimestamp(event: TerreiroEvent) {
  const date = new Date(event.date);
  const { hours, minutes } = getEventTimeParts(event.time);

  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

export function sortEvents(events: TerreiroEvent[]) {
  return [...events].sort((left, right) => getEventTimestamp(left) - getEventTimestamp(right));
}

export function getUpcomingEvent(events: TerreiroEvent[]) {
  const sorted = sortEvents(events);
  const now = Date.now();

  return sorted.find((event) => getEventTimestamp(event) >= now) ?? sorted[0] ?? null;
}

export function isSameDay(left: Date, right: Date) {
  return left.toDateString() === right.toDateString();
}

export function isSameMonth(left: Date, right: Date) {
  return left.getMonth() === right.getMonth() && left.getFullYear() === right.getFullYear();
}

export function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
