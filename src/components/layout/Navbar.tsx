import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Scissors, LayoutDashboard, CalendarDays, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store'
import { Button } from '../ui'

export function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-pink-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-pink-700 text-lg">
          <Scissors className="h-5 w-5" />
          <span>Salão da Leila</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1">
            {/* Client link — always visible when logged in */}
            {user && (
              <NavLink to="/" label="Agendamentos" icon={<CalendarDays className="h-4 w-4" />} active={pathname === '/'} />
            )}
            {/* Admin link — only for admin role */}
            {user?.role === 'admin' && (
              <NavLink to="/admin" label="Admin" icon={<LayoutDashboard className="h-4 w-4" />} active={pathname.startsWith('/admin')} />
            )}
          </nav>

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.name.split(' ')[0]}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="outline">Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ to, label, icon, active }: { to: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active ? 'text-pink-700' : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'
      }`}
    >
      {active && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute inset-0 bg-pink-100 rounded-md"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </Link>
  )
}
