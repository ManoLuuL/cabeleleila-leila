import type { Appointment, AppointmentCreateInput, AppointmentUpdateInput, AppointmentStatus } from '../types'
import { appointmentRepository } from '../repositories'
import { areDatesInSameWeek, isDateInPast, isSalonClosed, isTooFarInAdvance, todayString, canEditOnline } from '../lib/date.utils'
import { hasTimeConflict, exceedsWorkingHours } from '../lib/schedule.utils'
import { ALLOWED_STATUS_TRANSITIONS } from '../lib/constants'

// Erros de domínio — cada um representa uma regra de negócio específica
// Preferi classes separadas pra facilitar o tratamento no hook sem precisar checar mensagem

export class TimeConflictError extends Error {
  constructor(message = 'Horário indisponível para a data selecionada') {
    super(message)
    this.name = 'TimeConflictError'
  }
}

export class PastDateError extends Error {
  constructor(message = 'Não é possível agendar para uma data passada') {
    super(message)
    this.name = 'PastDateError'
  }
}

export class ClosedDayError extends Error {
  constructor(message = 'O salão não funciona neste dia') {
    super(message)
    this.name = 'ClosedDayError'
  }
}

export class TooFarInAdvanceError extends Error {
  constructor(message = 'Agendamentos podem ser feitos com no máximo 60 dias de antecedência') {
    super(message)
    this.name = 'TooFarInAdvanceError'
  }
}

export class WorkingHoursError extends Error {
  constructor(message = 'O atendimento ultrapassaria o horário de funcionamento (18:00)') {
    super(message)
    this.name = 'WorkingHoursError'
  }
}

export class DuplicateAppointmentError extends Error {
  constructor(message = 'Este cliente já possui um agendamento ativo neste dia') {
    super(message)
    this.name = 'DuplicateAppointmentError'
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: AppointmentStatus, to: AppointmentStatus) {
    super(`Não é possível alterar o status de "${from}" para "${to}"`)
    this.name = 'InvalidStatusTransitionError'
  }
}

export class ImmutableAppointmentError extends Error {
  constructor(status: AppointmentStatus) {
    super(`Agendamentos com status "${status}" não podem ser alterados`)
    this.name = 'ImmutableAppointmentError'
  }
}

export class CancellationWindowError extends Error {
  constructor(message = 'Cancelamentos com menos de 2 dias de antecedência devem ser feitos por telefone') {
    super(message)
    this.name = 'CancellationWindowError'
  }
}

// valida as regras de data antes de qualquer operação de agendamento
function checkDateRules(date: string): void {
  if (isDateInPast(date)) throw new PastDateError()
  if (isSalonClosed(date)) throw new ClosedDayError()
  if (isTooFarInAdvance(date)) throw new TooFarInAdvanceError()
}

function checkSchedule(
  all: Appointment[],
  date: string,
  time: string,
  services: Appointment['services'],
  excludeId?: string,
): void {
  checkDateRules(date)
  const duration = services.reduce((sum, s) => sum + s.durationMinutes, 0)
  if (exceedsWorkingHours(time, duration)) throw new WorkingHoursError()
  if (hasTimeConflict(all, date, time, duration, excludeId)) throw new TimeConflictError()
}

export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    return appointmentRepository.findAll()
  },

  async create(input: AppointmentCreateInput): Promise<Appointment> {
    const all = await appointmentRepository.findAll()
    checkSchedule(all, input.date, input.time, input.services)
    return appointmentRepository.create(input)
  },

  async update(id: string, input: AppointmentUpdateInput): Promise<Appointment | null> {
    const all = await appointmentRepository.findAll()
    const existing = all.find((a) => a.id === id)
    if (!existing) return null

    if (existing.status === 'completed' || existing.status === 'cancelled') {
      throw new ImmutableAppointmentError(existing.status)
    }

    const date = input.date ?? existing.date
    const time = input.time ?? existing.time
    const services = input.services ?? existing.services

    // só revalida horário se algo relacionado a data/hora mudou
    const changed = date !== existing.date || time !== existing.time || input.services !== undefined
    if (changed) {
      checkSchedule(all, date, time, services, id)
    }

    return appointmentRepository.update(id, input)
  },

  async updateStatus(id: string, newStatus: AppointmentStatus): Promise<Appointment | null> {
    const all = await appointmentRepository.findAll()
    const existing = all.find((a) => a.id === id)
    if (!existing) return null

    const allowed = ALLOWED_STATUS_TRANSITIONS[existing.status]
    if (!allowed.includes(newStatus)) {
      throw new InvalidStatusTransitionError(existing.status, newStatus)
    }

    return appointmentRepository.update(id, { status: newStatus })
  },

  // cancelamento pelo cliente tem a restrição dos 2 dias — admin usa updateStatus direto
  async cancelByClient(id: string): Promise<Appointment | null> {
    const all = await appointmentRepository.findAll()
    const existing = all.find((a) => a.id === id)
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
