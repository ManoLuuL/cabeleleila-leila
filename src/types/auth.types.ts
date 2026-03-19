export type UserRole = 'client' | 'admin'

export interface User {
  id: string
  name: string
  phone: string
  email: string
  role: UserRole
}

export interface AuthSession {
  token: string
  user: User
}
