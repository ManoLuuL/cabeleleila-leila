// UI-specific types (not domain types)

export type ToastVariant = 'default' | 'success' | 'error'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

export interface WeeklyStats {
  totalAppointments: number
  confirmedCount: number
  completedCount: number
  cancelledCount: number
  totalRevenueInCents: number
}
