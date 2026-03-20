import type { Appointment, AppointmentCreateInput, AppointmentStatus, AppointmentUpdateInput } from "../../types"

export type  AppointmentState = {
  appointments: Appointment[]
  isLoading: boolean
}

export type AppointmentActions = {
  loadAppointments: () => Promise<void>
  createAppointment: (input: AppointmentCreateInput) => Promise<Appointment>
  updateAppointment: (id: string, input: AppointmentUpdateInput) => Promise<void>
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>
  cancelAppointmentByClient: (id: string) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
}

export type AppointmentStore = AppointmentState & AppointmentActions
