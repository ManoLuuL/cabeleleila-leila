import { create } from 'zustand'
import type { User, AuthSession } from '../../types'
import { apiClient } from '../../lib/api.client'
import type { AuthActions, AuthState } from './types'


export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user:      null,
  token:     null,
  isLoading: false,

  login: async (email, password) => {
    const { token, user } = await apiClient.post<AuthSession>('/auth/login', { email, password })
    localStorage.setItem('auth_token', token)
    set({ token, user })
  },

  register: async (name, phone, email, password) => {
    const { token, user } = await apiClient.post<AuthSession>('/auth/register', { name, phone, email, password })
    localStorage.setItem('auth_token', token)
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    set({ token: null, user: null })
  },

  restore: async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return
    set({ isLoading: true })
    try {
      const { user } = await apiClient.get<{ user: User }>('/auth/me')
      set({ token, user })
    } catch {
      localStorage.removeItem('auth_token')
    } finally {
      set({ isLoading: false })
    }
  },
}))
