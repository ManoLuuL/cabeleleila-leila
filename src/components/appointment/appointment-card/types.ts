import type { Appointment } from "../../../types"

export type AppointmentCardProps = {
  appointment: Appointment
  onEdit?: (appointment: Appointment) => void
  onCancel?: (appointment: Appointment) => void
  showActions?: boolean
}