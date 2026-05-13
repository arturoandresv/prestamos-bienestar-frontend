import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader, StatusBadge, Table, Button, Modal } from '../../components/ui'
import { api } from '../../services/api'
import type { Column } from '../../components/ui'
import type { Sanction, SanctionStatus } from '../../types'

// ── Fetchers / mutations ───────────────────────────
const fetchSanctions = async (): Promise<Sanction[]> => {
  const { data } = await api.get<Sanction[]>('/sanctions')
  return data
}

const closeSanction = async (id: number): Promise<void> => {
  await api.patch(`/sanctions/${id}/close`)
}

// ── Status config ──────────────────────────────────
const statusConfig: Record<SanctionStatus, { label: string; variant: 'danger' | 'neutral' }> = {
  active: { label: 'Activa',  variant: 'danger'  },
  closed: { label: 'Cerrada', variant: 'neutral' },
}

// ── Component ──────────────────────────────────────
export const SanctionManagementPage = () => {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: sanctions = [], isLoading } = useQuery({
    queryKey: ['sanctions', 'all'],
    queryFn:  fetchSanctions,
  })

  const { mutate: close, isPending } = useMutation({
    mutationFn: () => closeSanction(selectedId ?? 0),
    onSuccess: () => {
      setSelectedId(null)
      void queryClient.invalidateQueries({ queryKey: ['sanctions'] })
    },
  })

  const columns: Column<Sanction>[] = [
    {
      key:    'student',
      header: 'Estudiante',
      render: (s) => (
        <span className="font-medium text-gray-900">{s.studentName ?? '—'}</span>
      ),
    },
    {
      key:    'type',
      header: 'Tipo',
      render: (s) => (
        <span className="text-gray-600">{s.typeName ?? '—'}</span>
      ),
    },
    {
      key:    'reason',
      header: 'Motivo',
      render: (s) => (
        <span className="text-gray-600 line-clamp-1">{s.reason}</span>
      ),
    },
    {
      key:    'startDate',
      header: 'Fecha inicio',
      width:  '130px',
      render: (s) => (
        <span className="text-gray-600">
          {new Date(s.startDate).toLocaleDateString('es-CO', { dateStyle: 'medium' })}
        </span>
      ),
    },
    {
      key:    'status',
      header: 'Estado',
      width:  '110px',
      render: (s) => (
        <StatusBadge
          label={statusConfig[s.status].label}
          variant={statusConfig[s.status].variant}
        />
      ),
    },
    {
      key:    'actions',
      header: 'Acciones',
      width:  '120px',
      render: (s) => (
        s.status === 'active' ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setSelectedId(s.id) }}
          >
            Cerrar sanción
          </Button>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Gestión de sanciones"
        description="Consulta y cierra sanciones activas"
      />

      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Table
            columns={columns}
            data={sanctions}
            keyExtractor={(s) => s.id}
            isLoading={isLoading}
            emptyMessage="No hay sanciones registradas"
          />
        </div>
      </div>

      {/* Confirm close modal */}
      <Modal
        isOpen={selectedId !== null}
        onClose={() => { setSelectedId(null) }}
        title="Cerrar sanción"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setSelectedId(null) }}>
              Cancelar
            </Button>
            <Button
              isLoading={isPending}
              onClick={() => { close() }}
            >
              Confirmar cierre
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          ¿Confirmas el cierre de esta sanción? El estudiante podrá
          realizar nuevas reservas una vez cerrada.
        </p>
      </Modal>
    </div>
  )
}