import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, Button, Stepper } from '../../components/ui'
import { api } from '../../services/api'
import type { Article } from '../../types'

// ── Types ──────────────────────────────────────────
interface ReservationResponse {
  id: number
  articleName: string
  claimDeadline: string
}

// ── Fetchers / mutations ───────────────────────────
const fetchArticle = async (id: string): Promise<Article> => {
  const { data } = await api.get<Article>(`/articles/${id}`)
  return data
}

const createReservation = async (articleId: number): Promise<ReservationResponse> => {
  const { data } = await api.post<ReservationResponse>('/reservations', { articleId })
  return data
}

// ── Steps ──────────────────────────────────────────
const steps = [
  { label: 'Seleccionar'  },
  { label: 'Confirmar'    },
  { label: 'Listo'        },
]

// ── Component ──────────────────────────────────────
export const ConfirmReservationPage = () => {
  const { id }      = useParams<{ id: string }>()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(1)

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn:  () => fetchArticle(id ?? ''),
    enabled:  !!id,
  })

  const { mutate: reserve, isPending, data: reservation, isSuccess, isError } = useMutation({
    mutationFn: () => createReservation(article?.id ?? 0),
    onSuccess: () => {
      setCurrentStep(2)
      void queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })

  const handleConfirm = () => { reserve() }

  const handleGoToReservations = () => { navigate('/reservations') }

  const handleBack = () => { navigate(`/catalog/${id}`) }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Confirmar reserva" />
        <div className="p-6 animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-full" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Confirmar reserva" />
        <div className="p-6 text-center text-gray-400 text-sm py-16">
          Artículo no encontrado
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Confirmar reserva"
        actions={
          currentStep < 2 ? (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              ← Volver
            </Button>
          ) : undefined
        }
      />

      <div className="p-6 max-w-lg flex flex-col gap-6">

        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} />

        {/* Step 1 — Confirm */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">

            <h2 className="text-base font-medium text-gray-900">
              ¿Confirmas la reserva?
            </h2>

            {/* Article summary */}
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Artículo</span>
                <span className="font-medium text-gray-700">{article.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Categoría</span>
                <span className="text-gray-700">{article.typeName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Disponibles</span>
                <span className="text-[#0F6E56] font-medium">
                  {article.availableQuantity}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-xs text-blue-600 leading-relaxed">
                Al confirmar, tendrás un tiempo límite para retirar el artículo
                físicamente en Bienestar. Si no lo retiras a tiempo, la reserva
                expirará automáticamente.
              </p>
            </div>

            {/* Error */}
            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600">
                  No se pudo registrar la reserva. Intenta de nuevo.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleBack}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                isLoading={isPending}
                onClick={handleConfirm}
              >
                Confirmar reserva
              </Button>
            </div>

          </div>
        )}

        {/* Step 2 — Success */}
        {currentStep === 2 && isSuccess && reservation && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">

            {/* Success icon */}
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h2 className="text-base font-medium text-gray-900">
                ¡Reserva registrada!
              </h2>
            </div>

            {/* Reservation summary */}
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Artículo</span>
                <span className="font-medium text-gray-700">
                  {reservation.articleName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">N° de reserva</span>
                <span className="text-gray-700">#{reservation.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Reclamar antes de</span>
                <span className="text-amber-600 font-medium">
                  {new Date(reservation.claimDeadline).toLocaleString('es-CO', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-xs text-amber-700 leading-relaxed">
                Dirígete a Bienestar antes del tiempo límite para retirar el artículo.
                Si no lo retiras, la reserva expirará automáticamente.
              </p>
            </div>

            <Button onClick={handleGoToReservations}>
              Ver mis reservas
            </Button>

          </div>
        )}

      </div>
    </div>
  )
}