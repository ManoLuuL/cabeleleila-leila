/**
 * ViewModel — bridges the service layer with the UI.
 * All domain errors from the service layer are re-thrown for hooks/pages to handle.
 */
import { create } from 'zustand'
import type { Appointment, AppointmentCreateInput, AppointmentUpdateInput, AppointmentStatus } from '../types'
import { appointmentService } from '../services'

interface AppointmentState {
  appointments: Appointment[]
  isLoading: boolean
}

interface AppointmentActions {
  loadAppointments: () => Promise<void>
  createAppointment: (input: AppointmentCreateInput) => Promise<Appointment>
  updateAppointment: (id: string, input: AppointmentUpdateInput) => Promise<void>
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>
  cancelAppointmentByClient: (id: string) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
}

type AppointmentStore = AppointmentState & AppointmentActions

export const useAppointmentStore = create<AppointmentStore>((set) => ({
  appointments: [],
  isLoading: false,

  loadAppointments: async () => {
    set({ isLoading: true })
    const appointments = await appointmentService.getAll()
    set({ appointments, isLoading: false })
  },

  createAppointment: async (input) => {
    const appointment = await appointmentService.create(input)
    set((state) => ({ appointments: [...state.appointments, appointment] }))
    return appointment
  },

  updateAppointment: async (id, input) => {
    const updated = await appointmentService.update(id, input)
    if (!updated) return
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? updated : a)),
    }))
  },

  updateAppointmentStatus: async (id, status) => {
    const updated = await appointmentService.updateStatus(id, status)
    if (!updated) return
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? updated : a)),
    }))
  },

  cancelAppointmentByClient: async (id) => {
    const updated = await appointmentService.cancelByClient(id)
    if (!updated) return
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? updated : a)),
    }))
  },

  deleteAppointment: async (id) => {
    await appointmentService.remove(id)
    set((state) => ({
      appointments: state.appointments.filter((a) => a.id !== id),
    }))
  },
}))
