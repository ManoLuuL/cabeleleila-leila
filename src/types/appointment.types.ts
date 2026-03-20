
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Service {
  id: string
  name: string
  durationMinutes: number
  priceInCents: number
}

export interface Appointment {
  id: string
  userId?: string   
  clientName: string
  clientPhone: string
  clientEmail: string
  services: Service[]
  date: string       
  time: string       
  status: AppointmentStatus
  notes?: string
  createdAt: string  
  updatedAt: string  
}

export type AppointmentCreateInput = Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
export type AppointmentUpdateInput = Partial<AppointmentCreateInput>

