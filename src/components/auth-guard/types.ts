export type AuthGuardProps = {
  children: React.ReactNode
  requireRole?: 'admin' | 'client'
}