import type { Appointment } from '../../../types'

export type WeeklyCalendarProps = {
  weekStart: Date
  weekEnd: Date
  appointments: Appointment[]
}
