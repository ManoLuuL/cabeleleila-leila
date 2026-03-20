import type z from "zod"
import type { loginSchema, registerSchema } from "./consts"

export type LoginValues    = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>

export type AuthPageProps = {
  onSuccess?: () => void
  embedded?: boolean
}