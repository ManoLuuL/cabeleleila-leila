import { Link, useLocation } from 'react-router-dom'
import { Scissors, LayoutDashboard, CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  matchPrefix: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',      label: 'Agendamentos', icon: <CalendarDays className="h-4 w-4" />, matchPrefix: '/' },
  { to: '/admin', label: 'Admin',        icon: <LayoutDashboard className="h-4 w-4" />, matchPrefix: '/admin' },
]

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-pink-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-pink-700 text-lg">
          <Scissors className="h-5 w-5" />
          <span>Salão da Leila</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.matchPrefix === '/'
                ? pathname === '/'
                : pathname.startsWith(item.matchPrefix)

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-pink-700'
                    : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-pink-100 rounded-md"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
