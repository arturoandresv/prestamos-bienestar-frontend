import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const navItems = [
  { to: '/dashboard',  label: 'Dashboard' },
  { to: '/delivery',   label: 'Aprobar Entrega' },
  { to: '/returns',    label: 'Registrar Devolución' },
  { to: '/sanctions',  label: 'Sanciones' },
  { to: '/inventory',  label: 'Inventario' },
  { to: '/reports',    label: 'Reportes' },
  { to: '/students',   label: 'Buscar Estudiante' },
]

export const AssistantLayout = () => {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-[#1A3A6B] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-white font-medium text-base">Bienestar</h1>
          <p className="text-white/50 text-xs mt-0.5">Panel Auxiliar</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/80 text-sm font-medium truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-white/40 text-xs truncate mt-0.5">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 text-xs text-white/40 hover:text-white/80 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}