import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store'

interface AuthGuardProps {
  children: React.ReactNode
  requireRole?: 'admin' | 'client'
}

export function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return null

  if (!user) return <Navigate to="/auth" replace />

  if (requireRole && user.role !== requireRole) return <Navigate to="/" replace />

  return <>{children}</>
}
