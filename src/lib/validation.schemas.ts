import { z } from 'zod'

export const bookingFormSchema = z.object({
  clientName: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  clientPhone: z
    .string()
    .min(10, 'Telefone inválido')
    .transform((v) => v.replace(/\D/g, '')),
  clientEmail: z.string().email('E-mail inválido'),
  time: z.string().min(1, 'Selecione um horário'),
  notes: z.string().optional(),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>
