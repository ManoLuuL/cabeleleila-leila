import { create } from 'zustand'
import type { AppointmentStore } from './types'
import { appointmentService } from '../../services'


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
