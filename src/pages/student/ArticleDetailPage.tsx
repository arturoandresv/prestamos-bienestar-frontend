import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader, Button } from '../../components/ui'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import type { Article, Loan, Sanction } from '../../types'

// ── Fetchers ───────────────────────────────────────
const fetchArticle = async (id: string): Promise<Article> => {
  const { data } = await api.get<Article>(`/articles/${id}`)
  return data
}

const fetchActiveLoan = async (studentId: number): Promise<Loan | null> => {
  const { data } = await api.get<Loan | null>(`/loans/active/${studentId}`)
  return data
}

const fetchActiveSanction = async (studentId: number): Promise<Sanction | null> => {
  const { data } = await api.get<Sanction | null>(`/sanctions/active/${studentId}`)
  return data
}

// ── Component ──────────────────────────────────────
export const ArticleDetailPage = () => {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

const { data: article, isLoading: loadingArticle } = useQuery({
  queryKey: ['article', id],
  queryFn:  () => fetchArticle(id ?? ''),
  enabled:  !!id,
})

const { data: activeLoan, isLoading: loadingLoan } = useQuery({
  queryKey: ['activeLoan', user?.id],
  queryFn:  () => fetchActiveLoan(user?.id ?? 0),
  enabled:  !!user?.id,
})

const { data: activeSanction, isLoading: loadingSanction } = useQuery({
  queryKey: ['activeSanction', user?.id],
  queryFn:  () => fetchActiveSanction(user?.id ?? 0),
  enabled:  !!user?.id,
})

  const isLoading = loadingArticle || loadingLoan || loadingSanction

  // ── Disable reason ─────────────────────────────
  const getDisabledReason = () => {
    if (activeSanction) return 'Tu cuenta tiene una sanción activa'
    if (activeLoan)     return 'Ya tienes un préstamo activo'
    if (article?.status !== 'available') return 'Este artículo no está disponible'
    return null
  }

  const disabledReason = getDisabledReason()

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Detalle del artículo" />
        <div className="p-6 animate-pulse space-y-4">
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="h-6 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Detalle del artículo" />
        <div className="p-6 text-center text-gray-400 text-sm py-16">
          Artículo no encontrado
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={article.name}
        description={article.typeName}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { navigate('/catalog') }}
          >
            ← Volver al catálogo
          </Button>
        }
      />

      <div className="p-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

          {/* Image */}
          <div className="h-64 bg-gray-50 flex items-center justify-center">
            <span className="text-gray-300 text-sm">Sin imagen</span>
          </div>

          <div className="p-6 flex flex-col gap-6">

            {/* Info */}
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {article.name}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {article.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-0.5">Categoría</p>
                <p className="text-sm font-medium text-gray-700">{article.typeName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-0.5">Disponibles</p>
                <p className="text-sm font-medium text-[#0F6E56]">
                  {article.availableQuantity} de {article.totalQuantity}
                </p>
              </div>
            </div>

            {/* Disabled reason banner */}
            {disabledReason && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <p className="text-sm text-amber-700">{disabledReason}</p>
              </div>
            )}

            {/* CTA */}
            <Button
              disabled={!!disabledReason}
              onClick={() => { navigate(`/catalog/${article.id}/reserve`) }}
              className="w-full"
            >
              Reservar artículo
            </Button>

          </div>
        </div>
      </div>
    </div>
  )
}