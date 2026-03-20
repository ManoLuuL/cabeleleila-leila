import type { AppointmentStatus } from '../../types'
import { Badge } from '../ui/badge'
import { STATUS_LABELS } from '../../lib/constants'

type StatusBadgeProps = {
  status: AppointmentStatus
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <Badge variant={status}>{STATUS_LABELS[status]}</Badge>
}
