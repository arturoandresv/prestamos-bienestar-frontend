import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader, StatusBadge, Table, Button } from '../../components/ui'
import { api } from '../../services/api'
import type { Column } from '../../components/ui'
import type { AuditLog, Role } from '../../types'

const NOW = Date.now();

// ── Fetcher ────────────────────────────────────────
const fetchAuditLog = async (filters: AuditFilters): Promise<AuditLog[]> => {
  const { data } = await api.get<AuditLog[]>('/audit', { params: filters })
  return data
}

// ── Types ──────────────────────────────────────────
interface AuditFilters {
  startDate?: string
  endDate?:   string
  role?:      Role | 'all'
  action?:    string
}

// ── Role config ────────────────────────────────────
const roleLabels: Record<Role, string> = {
  student:   'Estudiante',
  assistant: 'Auxiliar',
  admin:     'Admin',
}

// ── Columns ────────────────────────────────────────
const auditColumns: Column<AuditLog>[] = [
  {
    key:    'user',
    header: 'Usuario',
    render: (log) => (
      <div>
        <p className="font-medium text-gray-900">{log.userName ?? '—'}</p>
        {log.userRole && (
          <p className="text-xs text-gray-400">{roleLabels[log.userRole]}</p>
        )}
      </div>
    ),
  },
  {
    key:    'action',
    header: 'Acción',
    render: (log) => (
      <span className="text-gray-600">{log.action}</span>
    ),
  },
  {
    key:    'result',
    header: 'Resultado',
    width:  '120px',
    render: (log) => (
      <StatusBadge
        label={log.result === 'success' ? 'Exitoso' : 'Fallido'}
        variant={log.result === 'success' ? 'success' : 'danger'}
      />
    ),
  },
  {
    key:    'timestamp',
    header: 'Fecha y hora',
    width:  '170px',
    render: (log) => (
      <span className="text-gray-600 text-xs">
        {new Date(log.timestamp).toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </span>
    ),
  },
]

// ── Component ──────────────────────────────────────
export const AuditLogPage = () => {
  const today     = new Date().toISOString().split('T')[0]
  const lastMonth = new Date(NOW - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [filters, setFilters] = useState<AuditFilters>({
    startDate: lastMonth,
    endDate:   today,
    role:      'all',
    action:    '',
  })

  const [appliedFilters, setAppliedFilters] = useState<AuditFilters>(filters)

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit', appliedFilters],
    queryFn:  () => fetchAuditLog(appliedFilters),
  })

  const handleApplyFilters = () => {
    setAppliedFilters(filters)
  }

  const handleResetFilters = () => {
    const reset = { startDate: lastMonth, endDate: today, role: 'all' as const, action: '' }
    setFilters(reset)
    setAppliedFilters(reset)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Log de auditoría"
        description="Registro de todas las operaciones del sistema — solo lectura"
      />

      <div className="p-6 flex flex-col gap-4">

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
          <h2 className="text-sm font-medium text-gray-700">Filtros</h2>

          <div className="flex gap-3 flex-wrap">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="startDate" className="text-xs text-gray-500">
                Fecha inicio
              </label>
              <input
                id="startDate"
                type="date"
                value={filters.startDate}
                max={filters.endDate}
                onChange={(e) => { setFilters((f) => ({ ...f, startDate: e.target.value })) }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="endDate" className="text-xs text-gray-500">
                Fecha fin
              </label>
              <input
                id="endDate"
                type="date"
                value={filters.endDate}
                min={filters.startDate}
                max={today}
                onChange={(e) => { setFilters((f) => ({ ...f, endDate: e.target.value })) }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className="text-xs text-gray-500">
                Rol
              </label>
              <select
                id="role"
                value={filters.role}
                onChange={(e) => { setFilters((f) => ({ ...f, role: e.target.value as Role | 'all' })) }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B] bg-white"
              >
                <option value="all">Todos los roles</option>
                <option value="student">Estudiante</option>
                <option value="assistant">Auxiliar</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="action" className="text-xs text-gray-500">
                Acción
              </label>
              <input
                id="action"
                type="text"
                value={filters.action}
                placeholder="Ej: RESERVA_CREADA"
                onChange={(e) => { setFilters((f) => ({ ...f, action: e.target.value })) }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B] w-48"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button size="sm" onClick={handleApplyFilters}>
              Aplicar filtros
            </Button>
            <Button size="sm" variant="ghost" onClick={handleResetFilters}>
              Limpiar
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Table
            columns={auditColumns}
            data={logs}
            keyExtractor={(log) => log.id}
            isLoading={isLoading}
            emptyMessage="No se encontraron registros para los filtros seleccionados"
          />
        </div>

      </div>
    </div>
  )
}