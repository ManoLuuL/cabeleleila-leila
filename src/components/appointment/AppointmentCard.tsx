import { motion } from 'framer-motion'
import { Calendar, Clock, Phone, Scissors, AlertCircle } from 'lucide-react'
import type { Appointment } from '../../types'
import { Card, CardContent } from '../ui'
import { Button } from '../ui'
import { StatusBadge } from '../common/StatusBadge'
import { formatDisplayDate } from '../../lib/date.utils'
import { formatCurrency } from '../../lib/currency.utils'
import { canEditOnline } from '../../lib/date.utils'
import { sumCents } from '../../lib/currency.utils'

interface AppointmentCardProps {
  appointment: Appointment
  onEdit?: (appointment: Appointment) => void
  onCancel?: (appointment: Appointment) => void
  showActions?: boolean
}

export function AppointmentCard({
  appointment,
  onEdit,
  onCancel,
  showActions = true,
}: AppointmentCardProps) {
  const canEdit = canEditOnline(appointment.date)
  const total = sumCents(appointment.services.map((s) => s.priceInCents))
  const isFinished = appointment.status === 'cancelled' || appointment.status === 'completed'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{appointment.clientName}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <Phone className="h-3 w-3" />
                {appointment.clientPhone}
              </div>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-pink-500" />
              {formatDisplayDate(appointment.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-pink-500" />
              {appointment.time}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {appointment.services.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 text-xs px-2 py-0.5 rounded-full"
              >
                <Scissors className="h-3 w-3" />
                {s.name}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(total)}</span>

            {showActions && !isFinished && (
              <div className="flex gap-2">
                {canEdit ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => onEdit?.(appointment)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onCancel?.(appointment)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Alteração só por telefone
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
