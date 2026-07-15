import { TerreiroEvent } from '../types';

function getEventTimeParts(time: string) {
  const [hours, minutes] = time.split(':').map((part) => Number(part));
  return {
    hours: Number.isFinite(hours) ? hours : 0,
    minutes: Number.isFinite(minutes) ? minutes : 0,
  };
}

export function getEventTimestamp(event: TerreiroEvent) {
  const date = parseLocalDate(event.date);
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

export function parseLocalDate(dateStr: string | Date | undefined | null): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return new Date();
    return dateStr;
  }

  const cleanStr = String(dateStr).trim();

  // Match YYYY-MM-DD
  const match = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);

    const timeMatch = cleanStr.match(/[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
    const hours = timeMatch ? parseInt(timeMatch[1], 10) : 12; // default to 12 to avoid timezone shifts
    const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const seconds = timeMatch && timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

    return new Date(year, month, day, hours, minutes, seconds);
  }

  const parsed = new Date(cleanStr);
  if (isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

export function formatDateYYYYMMDD(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = parseLocalDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

