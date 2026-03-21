import type { Appointment } from '../types'
import { WORKING_HOURS } from './constants'

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export interface BlockedSlot {
  time: string
  reason: string
}

export function exceedsWorkingHours(startTime: string, duration: number): boolean {
  return timeToMinutes(startTime) + duration > WORKING_HOURS.endMinutes
}

export function getAvailableSlots(allSlots: string[], duration: number): string[] {
  return allSlots.filter((slot) => !exceedsWorkingHours(slot, duration))
}

// retorna um mapa de horários bloqueados para um dia específico
// cada slot de 30min ocupado por algum agendamento entra no mapa
export function getBlockedSlots(
  appointments: Appointment[],
  date: string,
  excludeId?: string,
): Map<string, BlockedSlot> {
  const blocked = new Map<string, BlockedSlot>()

  const dayAppointments = appointments.filter(
    (a) => a.date === date && a.id !== excludeId && a.status !== 'cancelled',
  )

  for (const apt of dayAppointments) {
    const start = timeToMinutes(apt.time)
    const duration = apt.services.reduce((sum, s) => sum + s.durationMinutes, 0)
    const end = start + duration

    for (let t = start; t < end; t += 30) {
      const slot = minutesToTime(t)
      if (!blocked.has(slot)) {
        blocked.set(slot, { time: slot, reason: apt.clientName })
      }
    }
  }

  return blocked
}

export function hasTimeConflict(
  appointments: Appointment[],
  date: string,
  startTime: string,
  duration: number,
  excludeId?: string,
): boolean {
  const blocked = getBlockedSlots(appointments, date, excludeId)
  const start = timeToMinutes(startTime)
  const end = start + duration

  for (let t = start; t < end; t += 30) {
    if (blocked.has(minutesToTime(t))) return true
  }
  return false
}
