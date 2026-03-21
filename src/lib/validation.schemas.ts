import { z } from 'zod'
import { VALID_DDD_CODES } from './constants'

// validação de telefone brasileiro com máscara removida
const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .pipe(
    z.string()
      .min(10, 'Telefone inválido — mínimo 10 dígitos')
      .max(11, 'Telefone inválido — máximo 11 dígitos')
      .refine((digits) => {
        const ddd = parseInt(digits.slice(0, 2), 10)
        return VALID_DDD_CODES.has(ddd)
      }, 'DDD inválido')
      .refine((digits) => {
        if (digits.length === 11) return digits[2] === '9'
        return true
      }, 'Celular deve começar com 9 após o DDD')
      .refine((digits) => {
        return !/^(\d)\1+$/.test(digits)
      }, 'Telefone inválido'),
  )

const nameSchema = z
  .string()
  .min(3, 'Nome deve ter ao menos 3 caracteres')
  .max(80, 'Nome muito longo')
  .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, 'Nome não pode conter números ou símbolos')
  .refine((v) => v.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome')
  .transform((v) => v.trim().replace(/\s+/g, ' '))

export const bookingFormSchema = z.object({
  clientName: nameSchema,
  clientPhone: phoneSchema,
  clientEmail: z.string().email('E-mail inválido').max(120, 'E-mail muito longo').toLowerCase(),
  time: z.string().min(1, 'Selecione um horário'),
  notes: z.string().max(300, 'Observação muito longa (máx. 300 caracteres)').optional(),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>
