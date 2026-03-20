import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store'
import type { AuthGuardProps } from './types'

export const AuthGuard = ({ children, requireRole }: AuthGuardProps) => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return null

  if (!user) return <Navigate to="/auth" replace />

  if (requireRole && user.role !== requireRole) return <Navigate to="/" replace />

  return <>{children}</>
}
