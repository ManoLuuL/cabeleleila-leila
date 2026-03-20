import { useMemo } from 'react'
import { parseISO, isWithinInterval } from 'date-fns'
import type { Appointment, WeeklyStats } from '../../types'
import { getWeekBounds } from '../../lib/date.utils'
import { sumCents } from '../../lib/currency.utils'
import type { UseWeeklyStatsReturn } from './types'

export const useWeeklyStats = (appointments: Appointment[], weekOffset: number): UseWeeklyStatsReturn => {

  const stats = useMemo(() => {
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() + weekOffset * 7)
    const { start: weekStart, end: weekEnd } = getWeekBounds(baseDate)

    const weekAppointments = appointments.filter((a) =>
      isWithinInterval(parseISO(a.date), { start: weekStart, end: weekEnd }),
    )

    const stats: WeeklyStats = {
      totalAppointments:  weekAppointments.length,
      confirmedCount:     weekAppointments.filter((a) => a.status === 'confirmed').length,
      completedCount:     weekAppointments.filter((a) => a.status === 'completed').length,
      cancelledCount:     weekAppointments.filter((a) => a.status === 'cancelled').length,
      totalRevenueInCents: sumCents(
        weekAppointments
          .filter((a) => a.status === 'completed')
          .flatMap((a) => a.services.map((s) => s.priceInCents)),
      ),
    }

    return { stats, weekStart, weekEnd, weekAppointments }
  }, [appointments, weekOffset])

  return stats
}
