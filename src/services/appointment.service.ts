/**
 * Service layer — business logic and domain rules.
 *
 * Rules enforced here:
 *  1. No booking in the past
 *  2. No booking on closed days (Sunday)
 *  3. No booking beyond MAX_ADVANCE_DAYS
 *  4. No booking that exceeds working hours
 *  5. No time slot conflict with existing appointments
 *  6. No duplicate active appointment for the same client on the same day
 *  7. Status transitions must follow the allowed flow
 *  8. Completed/cancelled appointments cannot be modified
 *  9. Client cannot cancel online if < 2 days away
 */
import type { Appointment, AppointmentCreateInput, AppointmentUpdateInput, AppointmentStatus } from '../types'
import { appointmentRepository } from '../repositories'
import { generateId } from '../lib/utils'
import { areDatesInSameWeek, isDateInPast, isSalonClosed, isTooFarInAdvance, todayString, canEditOnline } from '../lib/date.utils'
import { hasTimeConflict, exceedsWorkingHours } from '../lib/schedule.utils'
import { ALLOWED_STATUS_TRANSITIONS } from '../lib/constants'

// ── Domain errors ────────────────────────────────────────────────────────────

export class TimeConflictError extends Error {
  constructor(message = 'Horário indisponível para a data selecionada') {
    super(message); this.name = 'TimeConflictError'
  }
}
export class PastDateError extends Error {
  constructor(message = 'Não é possível agendar para uma data passada') {
    super(message); this.name = 'PastDateError'
  }
}
export class ClosedDayError extends Error {
  constructor(message = 'O salão não funciona neste dia') {
    super(message); this.name = 'ClosedDayError'
  }
}
export class TooFarInAdvanceError extends Error {
  constructor(message = 'Agendamentos podem ser feitos com no máximo 60 dias de antecedência') {
    super(message); this.name = 'TooFarInAdvanceError'
  }
}
export class WorkingHoursError extends Error {
  constructor(message = 'O atendimento ultrapassaria o horário de funcionamento (18:00)') {
    super(message); this.name = 'WorkingHoursError'
  }
}
export class DuplicateAppointmentError extends Error {
  constructor(message = 'Este cliente já possui um agendamento ativo neste dia') {
    super(message); this.name = 'DuplicateAppointmentError'
  }
}
export class InvalidStatusTransitionError extends Error {
  constructor(from: AppointmentStatus, to: AppointmentStatus) {
    super(`Não é possível alterar o status de "${from}" para "${to}"`); this.name = 'InvalidStatusTransitionError'
  }
}
export class ImmutableAppointmentError extends Error {
  constructor(status: AppointmentStatus) {
    super(`Agendamentos com status "${status}" não podem ser alterados`); this.name = 'ImmutableAppointmentError'
  }
}
export class CancellationWindowError extends Error {
  constructor(message = 'Cancelamentos com menos de 2 dias de antecedência devem ser feitos por telefone') {
    super(message); this.name = 'CancellationWindowError'
  }
}

// ── Validation helpers ───────────────────────────────────────────────────────

function validateDateRules(date: string): void {
  if (isDateInPast(date))        throw new PastDateError()
  if (isSalonClosed(date))       throw new ClosedDayError()
  if (isTooFarInAdvance(date))   throw new TooFarInAdvanceError()
}

function validateSchedule(
  all: Appointment[],
  date: string,
  time: string,
  services: Appointment['services'],
  excludeId?: string,
): void {
  validateDateRules(date)

  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0)
  if (exceedsWorkingHours(time, totalDuration)) throw new WorkingHoursError()
  if (hasTimeConflict(all, date, time, totalDuration, excludeId)) throw new TimeConflictError()
}

function validateNoDuplicate(
  all: Appointment[],
  phone: string,
  date: string,
  excludeId?: string,
): void {
  const duplicate = all.find(
    (a) => a.clientPhone === phone && a.date === date && a.id !== excludeId && a.status !== 'cancelled',
  )
  if (duplicate) throw new DuplicateAppointmentError()
}

// ── Service ──────────────────────────────────────────────────────────────────

export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    return appointmentRepository.findAll()
  },

  async create(input: AppointmentCreateInput): Promise<Appointment> {
    const all = await appointmentRepository.findAll()
    validateSchedule(all, input.date, input.time, input.services)
    validateNoDuplicate(all, input.clientPhone, input.date)

    const now = new Date().toISOString()
    const appointment: Appointment = { ...input, id: generateId(), createdAt: now, updatedAt: now }
    await appointmentRepository.save(appointment)
    return appointment
  },

  async update(id: string, input: AppointmentUpdateInput): Promise<Appointment | null> {
    const existing = await appointmentRepository.findById(id)
    if (!existing) return null

    if (existing.status === 'completed' || existing.status === 'cancelled') {
      throw new ImmutableAppointmentError(existing.status)
    }

    const dateChanged     = input.date      !== undefined && input.date      !== existing.date
    const timeChanged     = input.time      !== undefined && input.time      !== existing.time
    const servicesChanged = input.services  !== undefined &&
      JSON.stringify(input.services) !== JSON.stringify(existing.services)
    const phoneChanged    = input.clientPhone !== undefined && input.clientPhone !== existing.clientPhone

    if (dateChanged || timeChanged || servicesChanged) {
      const all      = await appointmentRepository.findAll()
      const services = input.services    ?? existing.services
      const date     = input.date        ?? existing.date
      const time     = input.time        ?? existing.time
      const phone    = input.clientPhone ?? existing.clientPhone

      validateSchedule(all, date, time, services, id)
      if (dateChanged || phoneChanged) validateNoDuplicate(all, phone, date, id)
    }

    const updated: Appointment = { ...existing, ...input, updatedAt: new Date().toISOString() }
    await appointmentRepository.save(updated)
    return updated
  },

  async updateStatus(id: string, newStatus: AppointmentStatus): Promise<Appointment | null> {
    const existing = await appointmentRepository.findById(id)
    if (!existing) return null

    const allowed = ALLOWED_STATUS_TRANSITIONS[existing.status]
    if (!allowed.includes(newStatus)) {
      throw new InvalidStatusTransitionError(existing.status, newStatus)
    }

    const updated: Appointment = { ...existing, status: newStatus, updatedAt: new Date().toISOString() }
    await appointmentRepository.save(updated)
    return updated
  },

  /**
   * Client-facing cancellation — enforces the 2-day online cancellation window.
   * Admin cancellations should use updateStatus directly.
   */
  async cancelByClient(id: string): Promise<Appointment | null> {
    const existing = await appointmentRepository.findById(id)
    if (!existing) return null

    if (!canEditOnline(existing.date)) throw new CancellationWindowError()

    return appointmentService.updateStatus(id, 'cancelled')
  },

  async remove(id: string): Promise<void> {
    await appointmentRepository.remove(id)
  },

  findSameWeekAppointment(
    appointments: Appointment[],
    phone: string,
    targetDate: string,
    excludeId?: string,
  ): Appointment | undefined {
    return appointments.find(
      (a) =>
        a.clientPhone === phone &&
        a.id !== excludeId &&
        a.status !== 'cancelled' &&
        areDatesInSameWeek(a.date, targetDate),
    )
  },

  todayString,
}
