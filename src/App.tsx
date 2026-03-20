import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/layout'
import { AuthGuard } from './components/auth/AuthGuard'
import { ClientPage, AdminPage, AuthPage } from './pages'
import { useAuthStore } from './store'

function AppRoutes() {
  const { restore, isLoading, user } = useAuthStore()
 
  useEffect(() => { restore() }, [restore])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/auth"
            element={
              user
                ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
                : <AuthPage />
            }
          />
          <Route path="/" element={<ClientPage />} />
          <Route path="/admin" element={
            <AuthGuard requireRole="admin">
              <AdminPage />
            </AuthGuard>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
