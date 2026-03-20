import z from "zod"

export const loginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const registerSchema = z.object({
  name:     z.string().min(3, 'Nome deve ter ao menos 3 caracteres')
              .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, 'Nome inválido')
              .refine((v) => v.trim().split(/\s+/).length >= 2, 'Informe nome e sobrenome'),
  phone:    z.string().min(10, 'Telefone inválido'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})