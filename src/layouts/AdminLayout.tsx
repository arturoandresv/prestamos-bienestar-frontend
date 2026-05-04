import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const navItems = [
  { to: '/admin/users',  label: 'Gestión de Usuarios' },
  { to: '/admin/config', label: 'Configuración' },
  { to: '/admin/audit',  label: 'Log de Auditoría' },
]

export default function AdminLayout() {
  const { usuario, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-[#1A3A6B] flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-white font-semibold text-base leading-tight">
            Bienestar
          </h1>
          <p className="text-white/50 text-xs mt-0.5">Administración</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
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
            {usuario?.nombre} {usuario?.apellido}
          </p>
          <p className="text-white/40 text-xs truncate">{usuario?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-left text-xs text-white/40 hover:text-white/80 transition-colors"
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