import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatusBadge, Button } from "../../components/ui";
import { api } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Area,
  AreaChart,
} from "recharts";

// ── Types ──────────────────────────────────────────
interface DashboardStats {
  activeLoans: number;
  overdueLoans: number;
  pendingReservations: number;
  activeSanctions: number;
}

interface LoansByDay {
  day: string;
  loans: number;
  overdue: number;
}

interface InventoryStatus {
  name: string;
  value: number;
  fill: string;
}

interface TopArticle {
  name: string;
  count: number;
}

interface SanctionsByWeek {
  week: string;
  overdue: number;
  poorCondition: number;
}

interface OverdueLoan {
  id: number;
  studentName: string;
  articleName: string;
  returnDeadline: string;
  daysOverdue: number;
}

interface DashboardData {
  stats: DashboardStats;
  loansByDay: LoansByDay[];
  inventoryStatus: InventoryStatus[];
  topArticles: TopArticle[];
  sanctionsByWeek: SanctionsByWeek[];
  overdueLoans: OverdueLoan[];
}

// ── Fetcher ────────────────────────────────────────
const fetchDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get<DashboardData>("/dashboard");
  return data;
};

// ── KPI Card ───────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: number;
  borderColor: string;
  alert?: boolean;
}

const KpiCard = ({ label, value, borderColor, alert }: KpiCardProps) => (
  <div
    className={`bg-white rounded-xl border border-gray-100 p-4 border-l-4 ${borderColor}`}
  >
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {alert && value > 0 && (
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
    </div>
  </div>
);

// ── Colors ─────────────────────────────────────────
const NAVY = "#1A3A6B";
const TEAL = "#0F6E56";
const AMBER = "#BA7517";
const RED = "#A32D2D";

// ── Component ──────────────────────────────────────
export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 1000 * 60, // refetch every minute
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Dashboard" />
        <div className="p-6 grid grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }, (_, i) => `kpi-${i}`).map((id) => (
            <div key={id} className="bg-gray-100 rounded-xl h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    stats,
    loansByDay,
    inventoryStatus,
    topArticles,
    sanctionsByWeek,
    overdueLoans,
  } = data;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Dashboard"
        description="Panel de control operativo"
        actions={
          <p className="text-xs text-gray-400">
            Actualización automática cada minuto
          </p>
        }
      />

      <div className="p-6 flex flex-col gap-6 overflow-y-auto">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Préstamos activos hoy"
            value={stats.activeLoans}
            borderColor="border-l-[#1A3A6B]"
          />
          <KpiCard
            label="Préstamos vencidos"
            value={stats.overdueLoans}
            borderColor="border-l-[#A32D2D]"
            alert
          />
          <KpiCard
            label="Reservas pendientes"
            value={stats.pendingReservations}
            borderColor="border-l-[#BA7517]"
          />
          <KpiCard
            label="Sanciones activas"
            value={stats.activeSanctions}
            borderColor="border-l-orange-500"
          />
        </div>

        {/* ── Charts row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar chart — loans by day */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Préstamos por día (últimos 7 días)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={loansByDay} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #F3F4F6",
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) =>
                    value === "loans" ? "Entregados" : "Con vencimiento"
                  }
                />
                <Bar dataKey="loans" fill={NAVY} radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" fill={AMBER} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart — inventory status */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Estado del inventario
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={inventoryStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #F3F4F6",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Charts row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Horizontal bar — top 5 articles */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Top 5 artículos más solicitados
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topArticles}
                layout="vertical"
                barSize={16}
                margin={{ left: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F3F4F6"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #F3F4F6",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill={TEAL} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Area chart — sanctions by week */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Sanciones del mes
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={sanctionsByWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #F3F4F6",
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) =>
                    value === "overdue" ? "Por vencimiento" : "Por mal estado"
                  }
                />
                <Area
                  type="monotone"
                  dataKey="overdue"
                  stroke={RED}
                  fill={RED}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="poorCondition"
                  stroke={AMBER}
                  fill={AMBER}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Overdue loans table ── */}
        {overdueLoans.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 border-l-4 border-l-[#A32D2D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Préstamos vencidos — Requieren atención
                </h3>
                <StatusBadge
                  label={String(overdueLoans.length)}
                  variant="danger"
                />
              </div>
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Estudiante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Artículo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Fecha límite
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Días vencido
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {overdueLoans.slice(0, 5).map((loan) => (
                  <tr
                    key={loan.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {loan.studentName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {loan.articleName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(loan.returnDeadline).toLocaleDateString(
                        "es-CO",
                        { dateStyle: "medium" },
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={`${loan.daysOverdue} días`}
                        variant="danger"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="secondary">
                        Gestionar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
