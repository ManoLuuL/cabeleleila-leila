// Domain types for the Appointment entity

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Service {
  id: string
  name: string
  durationMinutes: number
  priceInCents: number
}

export interface Appointment {
  id: string
  clientName: string
  clientPhone: string
  clientEmail: string
  services: Service[]
  date: string       // yyyy-MM-dd
  time: string       // HH:mm
  status: AppointmentStatus
  notes?: string
  createdAt: string  // ISO timestamp
  updatedAt: string  // ISO timestamp
}

export type AppointmentCreateInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
export type AppointmentUpdateInput = Partial<AppointmentCreateInput>
