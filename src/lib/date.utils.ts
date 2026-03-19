import {
  differenceInCalendarDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  format,
  isBefore,
  startOfDay,
  addDays,
  getDay,
} from 'date-fns'
import type { Matcher } from 'react-day-picker'
import { ptBR } from 'date-fns/locale'
import { CLOSED_WEEKDAYS, MAX_ADVANCE_DAYS } from './constants'

/**
 * Returns true if the appointment can still be edited online.
 * Rule: the appointment date must be at least 2 CALENDAR days from today.
 */
export function canEditOnline(dateStr: string): boolean {
  return differenceInCalendarDays(parseISO(dateStr), new Date()) >= 2
}

/** Returns true if the date is today or in the past (bookings require at least 1 day advance) */
export function isDateInPast(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), startOfDay(addDays(new Date(), 1)))
}

/** Returns true if the date falls on a day the salon is closed */
export function isSalonClosed(dateStr: string): boolean {
  return CLOSED_WEEKDAYS.includes(getDay(parseISO(dateStr)))
}

/** Returns true if the date is beyond the maximum advance booking window */
export function isTooFarInAdvance(dateStr: string): boolean {
  return differenceInCalendarDays(parseISO(dateStr), new Date()) > MAX_ADVANCE_DAYS
}

/** Returns true if two date strings fall within the same calendar week (Sun–Sat) */
export function areDatesInSameWeek(date1: string, date2: string): boolean {
  const d1 = parseISO(date1)
  const d2 = parseISO(date2)
  const weekStart = startOfWeek(d1, { weekStartsOn: 0 })
  const weekEnd   = endOfWeek(d1,   { weekStartsOn: 0 })
  return d2 >= weekStart && d2 <= weekEnd
}

export function getWeekBounds(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end:   endOfWeek(date,   { weekStartsOn: 0 }),
  }
}

export function formatDisplayDate(dateStr: string): string {
  const parsed = parseISO(dateStr)
  if (isNaN(parsed.getTime())) return dateStr
  return format(parsed, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM', { locale: ptBR })
}

/** Returns today's date as yyyy-MM-dd */
export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Returns the maximum bookable date (today + MAX_ADVANCE_DAYS) */
export function maxBookableDate(): Date {
  return addDays(new Date(), MAX_ADVANCE_DAYS)
}

/** Returns an array of Date matchers for DayPicker's `disabled` prop */
export function getDisabledDays(): Matcher[] {
  return [
    { before: startOfDay(addDays(new Date(), 1)) },
    { after: maxBookableDate() },
    { dayOfWeek: CLOSED_WEEKDAYS },
  ]
}
