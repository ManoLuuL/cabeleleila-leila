import type { Appointment } from "../../types"

export type UseBookingFormOptions ={
  initialData?: Appointment
  onSuccess: (appointment: Appointment) => void
  onError?: (message: string) => void
}
