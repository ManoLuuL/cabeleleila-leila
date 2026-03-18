import { motion } from 'framer-motion'
import { Edit } from 'lucide-react'
import type { Appointment, AppointmentStatus } from '../../types'
import { Card, CardContent, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui'
import { formatDisplayDate } from '../../lib/date.utils'
import { formatCurrency, sumCents } from '../../lib/currency.utils'
import { STATUS_LABELS } from '../../lib/constants'

interface AppointmentRowProps {
  appointment: Appointment
  onEdit: (appointment: Appointment) => void
  onStatusChange: (id: string, status: AppointmentStatus) => void
}

const STATUS_OPTIONS = Object.entries(STATUS_LABELS) as [AppointmentStatus, string][]

export function AppointmentRow({ appointment, onEdit, onStatusChange }: AppointmentRowProps) {
  const total = sumCents(appointment.services.map((s) => s.priceInCents))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{appointment.clientName}</p>
              <p className="text-sm text-gray-500">
                {appointment.clientPhone} · {appointment.clientEmail}
              </p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => onEdit(appointment)}>
              <Edit className="h-4 w-4" />
            </Button>
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
            <Select
              value={appointment.status}
              onValueChange={(v) => onStatusChange(appointment.id, v as AppointmentStatus)}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
