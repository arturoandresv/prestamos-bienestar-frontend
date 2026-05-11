import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import type { Role } from "./types";
import { AdminLayout, AssistantLayout, StudentLayout } from "./layouts";
import { LoginPage, RegisterPage } from "./pages/auth";
import {
  ArticleDetailPage,
  CatalogPage,
  ConfirmReservationPage,
  LoanHistoryPage,
  ProfilePage,
  ReservationsPage,
  SanctionHistoryPage,
} from "./pages/student";

// ── Protected route ────────────────────────────────
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  readonly children: React.ReactNode;
  readonly allowedRoles: Role[];
}) {
  const { isAuthenticated, hasRole } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.some(hasRole))
    return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

// ── App ────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:id" element={<ArticleDetailPage />} />
          <Route
            path="/catalog/:id/reserve"
            element={<ConfirmReservationPage />}
          />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/loans" element={<LoanHistoryPage />} />
          <Route path="/sanctions" element={<SanctionHistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Assistant */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["assistant"]}>
              <AssistantLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/delivery" element={<div>Aprobar Entrega</div>} />
          <Route path="/returns" element={<div>Registrar Devolución</div>} />
          <Route path="/sanctions" element={<div>Sanciones</div>} />
          <Route path="/inventory" element={<div>Inventario</div>} />
          <Route path="/reports" element={<div>Reportes</div>} />
          <Route path="/students" element={<div>Buscar Estudiante</div>} />
        </Route>

        {/* Admin */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/users" element={<div>Usuarios</div>} />
          <Route path="/admin/config" element={<div>Configuración</div>} />
          <Route path="/admin/audit" element={<div>Auditoría</div>} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<div>No autorizado</div>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
