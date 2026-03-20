
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


export function exceedsWorkingHours(startTime: string, totalDurationMinutes: number): boolean {
  const endMinutes = timeToMinutes(startTime) + totalDurationMinutes
  return endMinutes > WORKING_HOURS.endMinutes
}


export function getAvailableSlots(allSlots: string[], totalDurationMinutes: number): string[] {
  return allSlots.filter(
    (slot) => !exceedsWorkingHours(slot, totalDurationMinutes),
  )
}


export function getBlockedSlots(
  appointments: Appointment[],
  date: string,
  excludeId?: string,
): Map<string, BlockedSlot> {
  const blocked = new Map<string, BlockedSlot>()

  const dayAppointments = appointments.filter(
    (a) =>
      a.date === date &&
      a.id !== excludeId &&
      a.status !== 'cancelled',
  )

  for (const apt of dayAppointments) {
    const startMinutes  = timeToMinutes(apt.time)
    const totalDuration = apt.services.reduce((sum, s) => sum + s.durationMinutes, 0)
    const endMinutes    = startMinutes + totalDuration

    for (let t = startMinutes; t < endMinutes; t += 30) {
      const slotTime = minutesToTime(t)
      if (!blocked.has(slotTime)) {
        blocked.set(slotTime, { time: slotTime, reason: apt.clientName })
      }
    }
  }

  return blocked
}


export function hasTimeConflict(
  appointments: Appointment[],
  date: string,
  startTime: string,
  totalDurationMinutes: number,
  excludeId?: string,
): boolean {
  const blocked      = getBlockedSlots(appointments, date, excludeId)
  const startMinutes = timeToMinutes(startTime)
  const endMinutes   = startMinutes + totalDurationMinutes

  for (let t = startMinutes; t < endMinutes; t += 30) {
    if (blocked.has(minutesToTime(t))) return true
  }
  return false
}
