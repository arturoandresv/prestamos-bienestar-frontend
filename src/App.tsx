import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import type { Rol } from './types'
import StudentLayout from './layouts/StudentLayout'
import AssistantLayout from './layouts/AssistantLayout'
import AdminLayout from './layouts/AdminLayout'

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login"    element={<div>Login</div>} />
        <Route path="/register" element={<div>Register</div>} />

        {/* Estudiante */}
        <Route element={
          <ProtectedRoute allowedRoles={['estudiante']}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route path="/catalog"      element={<div>Catálogo</div>} />
          <Route path="/reservations" element={<div>Mis Reservas</div>} />
          <Route path="/loans"        element={<div>Mis Préstamos</div>} />
          <Route path="/sanctions"    element={<div>Mis Sanciones</div>} />
          <Route path="/profile"      element={<div>Mi Perfil</div>} />
        </Route>

        {/* Auxiliar */}
        <Route element={
          <ProtectedRoute allowedRoles={['auxiliar']}>
            <AssistantLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/delivery"  element={<div>Aprobar Entrega</div>} />
          <Route path="/returns"   element={<div>Registrar Devolución</div>} />
          <Route path="/sanctions" element={<div>Sanciones</div>} />
          <Route path="/inventory" element={<div>Inventario</div>} />
          <Route path="/reports"   element={<div>Reportes</div>} />
          <Route path="/students"  element={<div>Buscar Estudiante</div>} />
        </Route>

        {/* Admin */}
        <Route element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/admin/users"  element={<div>Usuarios</div>} />
          <Route path="/admin/config" element={<div>Configuración</div>} />
          <Route path="/admin/audit"  element={<div>Auditoría</div>} />
        </Route>

        {/* Fallbacks */}
        <Route path="/"             element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<div>No autorizado</div>} />
        <Route path="*"             element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}