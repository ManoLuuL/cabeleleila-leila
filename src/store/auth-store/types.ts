import type { User } from "../../types"

export type AuthState = {
  user: User | null
  token: string | null
  isLoading: boolean
}

export type AuthActions = {
  login:    (email: string, password: string) => Promise<void>
  register: (name: string, phone: string, email: string, password: string) => Promise<void>
  logout:   () => void
  restore:  () => Promise<void>
}