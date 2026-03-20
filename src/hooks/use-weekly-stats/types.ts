import type { Appointment, WeeklyStats } from "../../types"

export type UseWeeklyStatsReturn = {
  stats: WeeklyStats
  weekStart: Date
  weekEnd: Date
  weekAppointments: Appointment[]
}