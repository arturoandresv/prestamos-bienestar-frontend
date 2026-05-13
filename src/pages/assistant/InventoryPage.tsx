import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader, StatusBadge, Table, Button, Modal, SlideOver } from '../../components/ui'
import { api } from '../../services/api'
import type { Column } from '../../components/ui'
import type { Article, ArticleStatus } from '../../types'

// ── Fetchers / mutations ───────────────────────────
const fetchArticles = async (): Promise<Article[]> => {
  const { data } = await api.get<Article[]>('/articles')
  return data
}

const createArticle = async (payload: ArticleForm): Promise<void> => {
  await api.post('/articles', payload)
}

const updateArticle = async ({ id, ...payload }: ArticleForm & { id: number }): Promise<void> => {
  await api.put(`/articles/${id}`, payload)
}

const deleteArticle = async (id: number): Promise<void> => {
  await api.delete(`/articles/${id}`)
}

// ── Schema ─────────────────────────────────────────
const articleSchema = z.object({
  name:          z.string().min(1, 'El nombre es requerido'),
  description:   z.string().min(1, 'La descripción es requerida'),
  totalQuantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  typeName:      z.string().min(1, 'La categoría es requerida'),
})

type ArticleForm = z.infer<typeof articleSchema>

// ── Status config ──────────────────────────────────
const statusConfig: Record<ArticleStatus, { label: string; variant: 'success' | 'danger' | 'neutral' }> = {
  available:    { label: 'Disponible', variant: 'success' },
  out_of_stock: { label: 'Agotado',    variant: 'danger'  },
  inactive:     { label: 'Inactivo',   variant: 'neutral' },
}

// ── Columns ────────────────────────────────────────
const buildColumns = (
  handleOpenEdit: (article: Article) => void,
  setDeleteId:    (id: number) => void,
): Column<Article>[] => [
  {
    key:    'name',
    header: 'Artículo',
    render: (a) => (
      <span className="font-medium text-gray-900">{a.name}</span>
    ),
  },
  {
    key:    'category',
    header: 'Categoría',
    render: (a) => (
      <span className="text-gray-600">{a.typeName}</span>
    ),
  },
  {
    key:    'quantity',
    header: 'Disponibles / Total',
    width:  '160px',
    render: (a) => (
      <span className="text-gray-600">
        {a.availableQuantity} / {a.totalQuantity}
      </span>
    ),
  },
  {
    key:    'status',
    header: 'Estado',
    width:  '120px',
    render: (a) => (
      <StatusBadge
        label={statusConfig[a.status].label}
        variant={statusConfig[a.status].variant}
      />
    ),
  },
  {
    key:    'actions',
    header: 'Acciones',
    width:  '150px',
    render: (a) => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => { handleOpenEdit(a) }}>
          Editar
        </Button>
        <Button size="sm" variant="danger" onClick={() => { setDeleteId(a.id) }}>
          Eliminar
        </Button>
      </div>
    ),
  },
]

// ── Component ──────────────────────────────────────
export const InventoryPage = () => {
  const queryClient = useQueryClient()
  const [slideOverOpen, setSlideOverOpen]   = useState(false)
  const [deleteId, setDeleteId]             = useState<number | null>(null)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn:  fetchArticles,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArticleForm>({
    resolver: zodResolver(articleSchema),
  })

  const { mutate: create } = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['articles'] })
      setSlideOverOpen(false)
      reset()
    },
  })

  const { mutate: update } = useMutation({
    mutationFn: updateArticle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['articles'] })
      setSlideOverOpen(false)
      setEditingArticle(null)
      reset()
    },
  })

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteArticle(deleteId ?? 0),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['articles'] })
      setDeleteId(null)
    },
  })

  const handleOpenCreate = () => {
    setEditingArticle(null)
    reset({ name: '', description: '', totalQuantity: 1, typeName: '' })
    setSlideOverOpen(true)
  }

  const handleOpenEdit = (article: Article) => {
    setEditingArticle(article)
    reset({
      name:          article.name,
      description:   article.description,
      totalQuantity: article.totalQuantity,
      typeName:      article.typeName,
    })
    setSlideOverOpen(true)
  }

  const onSubmit = (data: ArticleForm) => {
    if (editingArticle) {
      update({ ...data, id: editingArticle.id })
    } else {
      create(data)
    }
  }

  const tableColumns = buildColumns(handleOpenEdit, setDeleteId)

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Inventario"
        description="Gestión de artículos disponibles para préstamo"
        actions={
          <Button onClick={handleOpenCreate}>
            + Agregar artículo
          </Button>
        }
      />

      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Table
            columns={tableColumns}
            data={articles}
            keyExtractor={(a) => a.id}
            isLoading={isLoading}
            emptyMessage="No hay artículos en el inventario"
          />
        </div>
      </div>

      {/* Add / Edit slide over */}
      <SlideOver
        isOpen={slideOverOpen}
        onClose={() => { setSlideOverOpen(false) }}
        title={editingArticle ? 'Editar artículo' : 'Agregar artículo'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre
            </label>
            <input
              id="name"
              {...register('name')}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                errors.name ? 'border-red-400' : 'border-gray-200 focus:border-[#1A3A6B]'
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors resize-none ${
                errors.description ? 'border-red-400' : 'border-gray-200 focus:border-[#1A3A6B]'
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="typeName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Categoría
            </label>
            <input
              id="typeName"
              {...register('typeName')}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                errors.typeName ? 'border-red-400' : 'border-gray-200 focus:border-[#1A3A6B]'
              }`}
            />
            {errors.typeName && (
              <p className="mt-1.5 text-xs text-red-500">{errors.typeName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="totalQuantity" className="block text-sm font-medium text-gray-700 mb-1.5">
              Cantidad total
            </label>
            <input
              id="totalQuantity"
              type="number"
              min={1}
              {...register('totalQuantity', { valueAsNumber: true })}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                errors.totalQuantity ? 'border-red-400' : 'border-gray-200 focus:border-[#1A3A6B]'
              }`}
            />
            {errors.totalQuantity && (
              <p className="mt-1.5 text-xs text-red-500">{errors.totalQuantity.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => { setSlideOverOpen(false) }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isSubmitting}
            >
              {editingArticle ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </div>

        </form>
      </SlideOver>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => { setDeleteId(null) }}
        title="Eliminar artículo"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setDeleteId(null) }}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              onClick={() => { remove() }}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          ¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer.
        </p>
      </Modal>

    </div>
  )
}