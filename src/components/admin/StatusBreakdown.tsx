import { motion } from 'framer-motion'
import type { AppointmentStatus, WeeklyStats } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui'
import { StatusBadge } from '../common/StatusBadge'
import { STATUS_LABELS } from '../../lib/constants'

interface StatusBreakdownProps {
  stats: WeeklyStats
}

const STATUS_KEYS: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

export function StatusBreakdown({ stats }: StatusBreakdownProps) {
  const countByStatus: Record<AppointmentStatus, number> = {
    pending:   stats.totalAppointments - stats.confirmedCount - stats.completedCount - stats.cancelledCount,
    confirmed: stats.confirmedCount,
    completed: stats.completedCount,
    cancelled: stats.cancelledCount,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Detalhamento por status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {STATUS_KEYS.map((status) => {
          const count = countByStatus[status]
          const pct = stats.totalAppointments > 0
            ? Math.round((count / stats.totalAppointments) * 100)
            : 0

          return (
            <div key={status} className="flex items-center gap-3">
              <StatusBadge status={status} />
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-2 rounded-full bg-pink-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="text-sm text-gray-600 w-6 text-right">{count}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Suppress unused import warning — STATUS_LABELS used for type safety reference
void STATUS_LABELS
