import { useQuery } from '@tanstack/react-query'
import { PageHeader, StatusBadge, Table } from '../../components/ui'
import { api } from '../../services/api'
import type { Column } from '../../components/ui'
import type { Loan, LoanStatus } from '../../types'

// ── Fetcher ────────────────────────────────────────
const fetchLoans = async (): Promise<Loan[]> => {
  const { data } = await api.get<Loan[]>('/loans/my')
  return data
}

// ── Status config ──────────────────────────────────
const statusConfig: Record<LoanStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  active:  { label: 'Activo',   variant: 'success' },
  closed:  { label: 'Cerrado',  variant: 'neutral' },
  overdue: { label: 'Vencido',  variant: 'danger'  },
}

// ── Columns ────────────────────────────────────────
const columns: Column<Loan>[] = [
  {
    key:    'article',
    header: 'Artículo',
    render: (loan) => (
      <span className="font-medium text-gray-900">{loan.articleName}</span>
    ),
  },
  {
    key:    'deliveryDate',
    header: 'Fecha entrega',
    render: (loan) => (
      <span className="text-gray-600">
        {new Date(loan.deliveryDate).toLocaleDateString('es-CO', { dateStyle: 'medium' })}
      </span>
    ),
  },
  {
    key:    'returnDeadline',
    header: 'Fecha límite',
    render: (loan) => (
      <span className="text-gray-600">
        {new Date(loan.returnDeadline).toLocaleDateString('es-CO', { dateStyle: 'medium' })}
      </span>
    ),
  },
  {
    key:    'actualReturnDate',
    header: 'Fecha devolución',
    render: (loan) => (
      <span className="text-gray-600">
        {loan.actualReturnDate
          ? new Date(loan.actualReturnDate).toLocaleDateString('es-CO', { dateStyle: 'medium' })
          : '—'
        }
      </span>
    ),
  },
  {
    key:    'status',
    header: 'Estado',
    width:  '120px',
    render: (loan) => (
      <StatusBadge
        label={statusConfig[loan.status].label}
        variant={statusConfig[loan.status].variant}
      />
    ),
  },
]

// ── Component ──────────────────────────────────────
export const LoanHistoryPage = () => {
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn:  fetchLoans,
  })

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Historial de préstamos"
        description="Todos tus préstamos registrados"
      />

      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Table
            columns={columns}
            data={loans}
            keyExtractor={(loan) => loan.id}
            isLoading={isLoading}
            emptyMessage="No tienes préstamos registrados"
          />
        </div>
      </div>
    </div>
  )
}