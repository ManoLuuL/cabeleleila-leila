import { differenceInDays, parseISO, startOfWeek, endOfWeek, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** Returns true if the appointment can still be edited online (>= 2 days away) */
export function canEditOnline(dateStr: string): boolean {
  const diff = differenceInDays(parseISO(dateStr), new Date())
  return diff >= 2
}

/** Returns true if two date strings fall within the same calendar week (Sun–Sat) */
export function areDatesInSameWeek(date1: string, date2: string): boolean {
  const d1 = parseISO(date1)
  const d2 = parseISO(date2)
  const weekStart = startOfWeek(d1, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(d1, { weekStartsOn: 0 })
  return d2 >= weekStart && d2 <= weekEnd
}

export function getWeekBounds(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }),
    end: endOfWeek(date, { weekStartsOn: 0 }),
  }
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM', { locale: ptBR })
}
