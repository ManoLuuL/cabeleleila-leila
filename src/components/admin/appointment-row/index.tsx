import { motion } from 'framer-motion'
import { Edit, Lock } from 'lucide-react'
import type { AppointmentStatus } from '../../../types'
import { Card, CardContent, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui'
import { StatusBadge } from '../../common/StatusBadge'
import { formatDisplayDate } from '../../../lib/date.utils'
import { formatCurrency, sumCents } from '../../../lib/currency.utils'
import { STATUS_LABELS, ALLOWED_STATUS_TRANSITIONS } from '../../../lib/constants'
import type { AppointmentRowProps } from './types'

const ALL_STATUS_OPTIONS = Object.entries(STATUS_LABELS) as [AppointmentStatus, string][]

export const AppointmentRow = (props: AppointmentRowProps) => {
  const { appointment, onEdit, onStatusChange } = props

  const total = sumCents(appointment.services.map((s) => s.priceInCents))
  const isTerminal = appointment.status === 'completed' || appointment.status === 'cancelled'
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[appointment.status]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
      <Card className={isTerminal ? 'opacity-70' : ''}>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{appointment.clientName}</p>
              <p className="text-sm text-gray-500">
                {appointment.clientPhone} · {appointment.clientEmail}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {isTerminal && (
                <span title="Agendamento finalizado — não pode ser editado">
                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                </span>
              )}
              <Button
                size="icon"
                variant="ghost"
                disabled={isTerminal}
                onClick={() => onEdit(appointment)}
                title={isTerminal ? 'Agendamento finalizado' : 'Editar'}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {formatDisplayDate(appointment.date)} às {appointment.time}
          </p>

          <div className="flex flex-wrap gap-1">
            {appointment.services.map((s) => (
              <span key={s.id} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">
                {s.name}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{formatCurrency(total)}</span>

            {isTerminal ? (
              <StatusBadge status={appointment.status} />
            ) : (
              <Select
                value={appointment.status}
                onValueChange={(v) => onStatusChange(appointment.id, v as AppointmentStatus)}
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUS_OPTIONS.map(([value, label]) => {
                    const isCurrent = value === appointment.status
                    const isAllowed = allowedNext.includes(value)
                    return (
                      <SelectItem
                        key={value}
                        value={value}
                        disabled={!isCurrent && !isAllowed}
                        className={!isCurrent && !isAllowed ? 'opacity-40 cursor-not-allowed' : ''}
                      >
                        {label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
