import type { Service, AppointmentStatus } from '../types'

export const WORKING_HOURS = {
  startMinutes: 8 * 60,
  endMinutes: 18 * 60,
} as const

export const MAX_ADVANCE_DAYS = 60

// 0 = domingo
export const CLOSED_WEEKDAYS: number[] = [0]

export const TIME_SLOTS: string[] = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
]

export const SALON_SERVICES: Service[] = [
  { id: 'svc-corte',       name: 'Corte de Cabelo', durationMinutes: 45,  priceInCents: 6000  },
  { id: 'svc-coloracao',   name: 'Coloração',        durationMinutes: 120, priceInCents: 15000 },
  { id: 'svc-escova',      name: 'Escova',           durationMinutes: 60,  priceInCents: 7000  },
  { id: 'svc-hidratacao',  name: 'Hidratação',       durationMinutes: 60,  priceInCents: 8000  },
  { id: 'svc-manicure',    name: 'Manicure',         durationMinutes: 45,  priceInCents: 4000  },
  { id: 'svc-pedicure',    name: 'Pedicure',         durationMinutes: 60,  priceInCents: 5000  },
  { id: 'svc-sobrancelha', name: 'Sobrancelha',      durationMinutes: 30,  priceInCents: 3000  },
  { id: 'svc-progressiva', name: 'Progressiva',      durationMinutes: 180, priceInCents: 20000 },
]

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending:   'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const ALLOWED_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

// DDDs válidos no Brasil conforme ANATEL
export const VALID_DDD_CODES = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24,
  27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46,
  47, 48, 49,
  51, 53, 54, 55,
  61,
  62, 64,
  63,
  65, 66,
  67,
  68,
  69,
  71, 73, 74, 75, 77,
  79,
  81, 87,
  82,
  83,
  84,
  85, 88,
  86, 89,
  91, 93, 94,
  92, 97,
  95,
  96,
  98, 99,
])

export interface ServiceWarningRule {
  services: string[]
  message: string
}

// avisos quando o cliente combina serviços que podem ser problemáticos juntos
export const SERVICE_WARNING_RULES: ServiceWarningRule[] = [
  {
    services: ['Coloração', 'Progressiva'],
    message: 'Coloração e Progressiva no mesmo dia podem danificar o cabelo. Recomendamos agendar em dias diferentes.',
  },
  {
    services: ['Escova', 'Progressiva'],
    message: 'A Progressiva já inclui escova ao final. Considere remover a Escova separada.',
  },
  {
    services: ['Hidratação', 'Progressiva'],
    message: 'Hidratação após Progressiva é recomendada, mas em dias diferentes para melhor resultado.',
  },
]
