import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import type { Rol } from './types'

// ── Rutas protegidas por rol ───────────────────────
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  readonly children: React.ReactNode
  readonly allowedRoles: Rol[]
}) {
  const { isAuthenticated, hasRole } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!allowedRoles.some(hasRole)) return <Navigate to="/unauthorized" replace />

  return <>{children}</>
}

// ── App ────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/register" element={<div>Register</div>} />

        {/* Estudiante */}
        <Route path="/catalog" element={
          <ProtectedRoute allowedRoles={['estudiante']}>
            <div>Catalog</div>
          </ProtectedRoute>
        } />

        {/* Auxiliar */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['auxiliar']}>
            <div>Dashboard</div>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <div>Users</div>
          </ProtectedRoute>
        } />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<div>No autorizado</div>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}