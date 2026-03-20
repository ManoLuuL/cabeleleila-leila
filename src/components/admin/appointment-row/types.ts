import type { Appointment, AppointmentStatus } from '../../../types'

export type AppointmentRowProps = {
  appointment: Appointment
  onEdit: (appointment: Appointment) => void
  onStatusChange: (id: string, status: AppointmentStatus) => void
}
