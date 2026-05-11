import { useQuery } from '@tanstack/react-query'
import { PageHeader, StatusBadge, Table } from '../../components/ui'
import { api } from '../../services/api'
import type { Column } from '../../components/ui'
import type { Sanction, SanctionStatus } from '../../types'

// ── Fetcher ────────────────────────────────────────
const fetchSanctions = async (): Promise<Sanction[]> => {
  const { data } = await api.get<Sanction[]>('/sanctions/my')
  return data
}

// ── Status config ──────────────────────────────────
const statusConfig: Record<SanctionStatus, { label: string; variant: 'danger' | 'neutral' }> = {
  active: { label: 'Activa',  variant: 'danger'  },
  closed: { label: 'Cerrada', variant: 'neutral' },
}

// ── Columns ────────────────────────────────────────
const columns: Column<Sanction>[] = [
  {
    key:    'type',
    header: 'Tipo',
    render: (sanction) => (
      <span className="font-medium text-gray-900">{sanction.typeName ?? '—'}</span>
    ),
  },
  {
    key:    'reason',
    header: 'Motivo',
    render: (sanction) => (
      <span className="text-gray-600">{sanction.reason}</span>
    ),
  },
  {
    key:    'startDate',
    header: 'Fecha inicio',
    render: (sanction) => (
      <span className="text-gray-600">
        {new Date(sanction.startDate).toLocaleDateString('es-CO', { dateStyle: 'medium' })}
      </span>
    ),
  },
  {
    key:    'closeDate',
    header: 'Fecha cierre',
    render: (sanction) => (
      <span className="text-gray-600">
        {sanction.closeDate
          ? new Date(sanction.closeDate).toLocaleDateString('es-CO', { dateStyle: 'medium' })
          : '—'
        }
      </span>
    ),
  },
  {
    key:    'status',
    header: 'Estado',
    width:  '120px',
    render: (sanction) => (
      <StatusBadge
        label={statusConfig[sanction.status].label}
        variant={statusConfig[sanction.status].variant}
      />
    ),
  },
]

// ── Component ──────────────────────────────────────
export const SanctionHistoryPage = () => {
  const { data: sanctions = [], isLoading } = useQuery({
    queryKey: ['sanctions'],
    queryFn:  fetchSanctions,
  })

  const hasActiveSanction = sanctions.some((s) => s.status === 'active')

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Historial de sanciones"
        description="Sanciones registradas en tu cuenta"
      />

      <div className="p-6 flex flex-col gap-4">

        {/* Active sanction banner */}
        {hasActiveSanction && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700 font-medium">
              Tienes una sanción activa
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              No podrás realizar nuevas reservas hasta que el auxiliar cierre la sanción.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Table
            columns={columns}
            data={sanctions}
            keyExtractor={(sanction) => sanction.id}
            isLoading={isLoading}
            emptyMessage="No tienes sanciones registradas"
          />
        </div>

      </div>
    </div>
  )
}