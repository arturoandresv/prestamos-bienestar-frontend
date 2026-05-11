import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader, StatusBadge, Button, Modal } from '../../components/ui'
import { api } from '../../services/api'
import { useState } from 'react'
import type { Reservation, ReservationStatus } from '../../types'

const NOW = Date.now();

// ── Fetchers / mutations ───────────────────────────
const fetchReservations = async (): Promise<Reservation[]> => {
  const { data } = await api.get<Reservation[]>('/reservations/my')
  return data
}

const cancelReservation = async (id: number): Promise<void> => {
  await api.patch(`/reservations/${id}/cancel`)
}

// ── Status config ──────────────────────────────────
const statusConfig: Record<ReservationStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  active:    { label: 'Activa',     variant: 'success' },
  converted: { label: 'Entregada',  variant: 'neutral' },
  expired:   { label: 'Expirada',   variant: 'danger'  },
  cancelled: { label: 'Cancelada',  variant: 'neutral' },
}

// ── Component ──────────────────────────────────────
export const ReservationsPage = () => {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn:  fetchReservations,
  })

  const { mutate: cancel, isPending } = useMutation({
    mutationFn: () => cancelReservation(selectedId ?? 0),
    onSuccess: () => {
      setSelectedId(null)
      void queryClient.invalidateQueries({ queryKey: ['reservations'] })
      void queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })

  const handleCancelClick = (id: number) => { setSelectedId(id) }
  const handleCancelClose = () => { setSelectedId(null) }
  const handleConfirmCancel = () => { cancel() }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Mis reservas"
        description="Consulta y gestiona tus reservas activas"
      />

      <div className="p-6 flex flex-col gap-4">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((id) => (
              <div key={id} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && reservations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-gray-400 text-sm">No tienes reservas registradas</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { globalThis.location.href = '/catalog' }}
            >
              Ver catálogo
            </Button>
          </div>
        )}

        {/* Reservations list */}
        {!isLoading && reservations.length > 0 && (
          <div className="flex flex-col gap-3">
            {reservations.map((reservation) => {
              const status    = statusConfig[reservation.status]
              const isActive  = reservation.status === 'active'
              const deadline  = new Date(reservation.claimDeadline)
              const isExpiringSoon = isActive && (deadline.getTime() - NOW) < 1000 * 60 * 60 * 2

              return (
                <div
                  key={reservation.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-sm font-medium text-gray-900">
                        {reservation.articleName}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Reserva #{reservation.id}
                      </p>
                    </div>
                    <StatusBadge label={status.label} variant={status.variant} />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Fecha de reserva</p>
                      <p className="text-xs font-medium text-gray-700">
                        {new Date(reservation.startDate).toLocaleDateString('es-CO', {
                          dateStyle: 'medium',
                        })}
                      </p>
                    </div>
                    <div className={`rounded-lg p-3 ${isExpiringSoon ? 'bg-amber-50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-400 mb-0.5">Reclamar antes de</p>
                      <p className={`text-xs font-medium ${isExpiringSoon ? 'text-amber-600' : 'text-gray-700'}`}>
                        {deadline.toLocaleString('es-CO', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Expiring soon warning */}
                  {isExpiringSoon && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-amber-700">
                        ⚠ Tu reserva expira pronto. Dirígete a Bienestar a retirar el artículo.
                      </p>
                    </div>
                  )}

                  {/* Cancel button */}
                  {isActive && (
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { handleCancelClick(reservation.id) }}
                      >
                        Cancelar reserva
                      </Button>
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={selectedId !== null}
        onClose={handleCancelClose}
        title="Cancelar reserva"
        footer={
          <>
            <Button variant="secondary" onClick={handleCancelClose}>
              Volver
            </Button>
            <Button
              variant="danger"
              isLoading={isPending}
              onClick={handleConfirmCancel}
            >
              Sí, cancelar
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          ¿Estás seguro de que deseas cancelar esta reserva? El artículo
          volverá a estar disponible para otros estudiantes.
        </p>
      </Modal>

    </div>
  )
}