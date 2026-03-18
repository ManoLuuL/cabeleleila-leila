import type { AppointmentStatus } from '../../types'
import { Badge } from '../ui/badge'
import { STATUS_LABELS } from '../../lib/constants'

interface StatusBadgeProps {
  status: AppointmentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={status}>{STATUS_LABELS[status]}</Badge>
}
