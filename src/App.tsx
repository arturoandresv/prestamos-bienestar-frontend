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
import {
  ApproveDeliveryPage,
  DashboardPage,
  InventoryPage,
  RegisterReturnPage,
  ReportsPage,
  SanctionManagementPage,
  StudentLookupPage,
} from "./pages/assistant";
import { SystemConfigPage, UserManagementPage } from "./pages/admin";
import { AuditLogPage } from "./pages/admin/AuditLogPage";

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/delivery" element={<ApproveDeliveryPage />} />
          <Route path="/returns" element={<RegisterReturnPage />} />
          <Route path="/sanctions" element={<SanctionManagementPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/students" element={<StudentLookupPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* Admin */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/config" element={<SystemConfigPage />} />
          <Route path="/admin/audit" element={<AuditLogPage />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/unauthorized" element={<div>No autorizado</div>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
