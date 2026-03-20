import type { Appointment, AppointmentUpdateInput } from '../types'
import { apiClient } from '../lib/api.client'

export const appointmentRepository = {
  async findAll(): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>('/appointments')
  },

  async create(input: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    return apiClient.post<Appointment>('/appointments', input)
  },

  async update(id: string, input: AppointmentUpdateInput): Promise<Appointment> {
    return apiClient.put<Appointment>(`/appointments/${id}`, input)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`)
  },
}
