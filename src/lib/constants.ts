import type { Service } from '../types'
import { generateId } from './utils'

export const TIME_SLOTS: string[] = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
]

// Prices stored in cents to avoid floating-point issues
export const SALON_SERVICES: Service[] = [
  { id: generateId(), name: 'Corte de Cabelo',  durationMinutes: 45,  priceInCents: 6000  },
  { id: generateId(), name: 'Coloração',         durationMinutes: 120, priceInCents: 15000 },
  { id: generateId(), name: 'Escova',            durationMinutes: 60,  priceInCents: 7000  },
  { id: generateId(), name: 'Hidratação',        durationMinutes: 60,  priceInCents: 8000  },
  { id: generateId(), name: 'Manicure',          durationMinutes: 45,  priceInCents: 4000  },
  { id: generateId(), name: 'Pedicure',          durationMinutes: 60,  priceInCents: 5000  },
  { id: generateId(), name: 'Sobrancelha',       durationMinutes: 30,  priceInCents: 3000  },
  { id: generateId(), name: 'Progressiva',       durationMinutes: 180, priceInCents: 20000 },
]

export const STATUS_LABELS: Record<string, string> = {
  pending:   'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}
