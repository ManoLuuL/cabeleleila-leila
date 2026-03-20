import type { Appointment } from "../../../types"

export type BookingFormProps = {
  initialData?: Appointment
  onSuccess: (appointment: Appointment) => void
  onError?: (message: string) => void
}
