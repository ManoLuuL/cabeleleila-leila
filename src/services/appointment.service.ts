/**
 * Service layer — business logic only.
 * Orchestrates repository calls and enforces domain rules.
 */
import type { Appointment, AppointmentCreateInput, AppointmentUpdateInput, AppointmentStatus } from '../types'
import { appointmentRepository } from '../repositories'
import { generateId } from '../lib/utils'
import { areDatesInSameWeek } from '../lib/date.utils'

export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    return appointmentRepository.findAll()
  },

  async create(input: AppointmentCreateInput): Promise<Appointment> {
    const now = new Date().toISOString()
    const appointment: Appointment = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    await appointmentRepository.save(appointment)
    return appointment
  },

  async update(id: string, input: AppointmentUpdateInput): Promise<Appointment | null> {
    const existing = await appointmentRepository.findById(id)
    if (!existing) return null
    const updated: Appointment = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    }
    await appointmentRepository.save(updated)
    return updated
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment | null> {
    return appointmentService.update(id, { status })
  },

  async remove(id: string): Promise<void> {
    await appointmentRepository.remove(id)
  },

  /**
   * Business rule: find an existing appointment for the same client
   * in the same week to suggest date consolidation.
   */
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
}
