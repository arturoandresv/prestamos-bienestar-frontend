import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader, StatusBadge, Table, Button, Modal, SlideOver } from '../../components/ui'
import { api } from '../../services/api'
import type { Column } from '../../components/ui'
import type { User, Role } from '../../types'

// ── Fetchers / mutations ───────────────────────────
const fetchUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>('/users')
  return data
}

const createUser = async (payload: UserForm): Promise<void> => {
  await api.post('/users', payload)
}

const updateUser = async ({ id, ...payload }: UserForm & { id: number }): Promise<void> => {
  await api.put(`/users/${id}`, payload)
}

const deactivateUser = async (id: number): Promise<void> => {
  await api.patch(`/users/${id}/deactivate`)
}

// ── Schema ─────────────────────────────────────────
const userSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName:  z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email:     z.email('Ingresa un correo válido'),
  role:      z.enum(['student', 'assistant', 'admin']),
  password:  z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
})

type UserForm = z.infer<typeof userSchema>

// ── Role config ────────────────────────────────────
const roleConfig: Record<Role, { label: string; variant: 'info' | 'success' | 'warning' }> = {
  student:   { label: 'Estudiante',  variant: 'info'    },
  assistant: { label: 'Auxiliar',    variant: 'success' },
  admin:     { label: 'Admin',       variant: 'warning' },
}

// ── Columns ────────────────────────────────────────
const buildColumns = (
  handleOpenEdit:   (user: User) => void,
  setDeactivateId:  (id: number) => void,
): Column<User>[] => [
  {
    key:    'name',
    header: 'Nombre',
    render: (u) => (
      <div>
        <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
        <p className="text-xs text-gray-400">{u.email}</p>
      </div>
    ),
  },
  {
    key:    'role',
    header: 'Rol',
    width:  '130px',
    render: (u) => (
      <StatusBadge
        label={roleConfig[u.role].label}
        variant={roleConfig[u.role].variant}
      />
    ),
  },
  {
    key:    'actions',
    header: 'Acciones',
    width:  '160px',
    render: (u) => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => { handleOpenEdit(u) }}>
          Editar
        </Button>
        <Button size="sm" variant="danger" onClick={() => { setDeactivateId(u.id) }}>
          Desactivar
        </Button>
      </div>
    ),
  },
]

// ── Component ──────────────────────────────────────
export const UserManagementPage = () => {
  const queryClient = useQueryClient()
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [deactivateId, setDeactivateId]   = useState<number | null>(null)
  const [editingUser, setEditingUser]     = useState<User | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn:  fetchUsers,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  })

  const { mutate: create } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      setSlideOverOpen(false)
      reset()
    },
  })

  const { mutate: update } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      setSlideOverOpen(false)
      setEditingUser(null)
      reset()
    },
  })

  const { mutate: deactivate, isPending: isDeactivating } = useMutation({
    mutationFn: () => deactivateUser(deactivateId ?? 0),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      setDeactivateId(null)
    },
  })

  const handleOpenCreate = () => {
    setEditingUser(null)
    reset({ firstName: '', lastName: '', email: '', role: 'student', password: '' })
    setSlideOverOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    reset({
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role,
    })
    setSlideOverOpen(true)
  }

  const onSubmit = (data: UserForm) => {
    if (editingUser) {
      update({ ...data, id: editingUser.id })
    } else {
      create(data)
    }
  }

  const tableColumns = buildColumns(handleOpenEdit, setDeactivateId)

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Gestión de usuarios"
        description="Administra las cuentas del sistema"
        actions={
          <Button onClick={handleOpenCreate}>
            + Agregar usuario
          </Button>
        }
      />

      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Table
            columns={tableColumns}
            data={users}
            keyExtractor={(u) => u.id}
            isLoading={isLoading}
            emptyMessage="No hay usuarios registrados"
          />
        </div>
      </div>

      {/* Add / Edit slide over */}
      <SlideOver
        isOpen={slideOverOpen}
        onClose={() => { setSlideOverOpen(false) }}
        title={editingUser ? 'Editar usuario' : 'Agregar usuario'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre
              </label>
              <input
                id="firstName"
                {...register('firstName')}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                  errors.firstName ? 'border-red-400' : 'border-gray-200 focus:border-[#1A3A6B]'
                }`}
              />
              {errors.firstName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Apellido
              </label>
              <input
                id="lastName"
                {...register('lastName')}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                  errors.lastName ? 'border-red-400' : 'border-gray-200 focus:border-[#1A3A6B]'
                }`}
              />
              {errors.lastName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Correo
            </label>
            <input
              id="email"
              {...register('email')}
              type="email"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                errors.email ? 'border-red-400' : 'border-gray-200 focus:border-[#1A3A6B]'
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">
              Rol
            </label>
            <select
              id="role"
              {...register('role')}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors bg-white ${
                errors.role ? 'border-red-400' : 'border-gray-200 focus:border-[#1A3A6B]'
              }`}
            >
              <option value="student">Estudiante</option>
              <option value="assistant">Auxiliar</option>
              <option value="admin">Administrador</option>
            </select>
            {errors.role && (
              <p className="mt-1.5 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          {!editingUser && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                {...register('password')}
                type="password"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                  errors.password ? 'border-red-400' : 'border-gray-200 focus:border-[#1A3A6B]'
                }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => { setSlideOverOpen(false) }}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              {editingUser ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </div>

        </form>
      </SlideOver>

      {/* Deactivate confirmation modal */}
      <Modal
        isOpen={deactivateId !== null}
        onClose={() => { setDeactivateId(null) }}
        title="Desactivar usuario"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setDeactivateId(null) }}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              isLoading={isDeactivating}
              onClick={() => { deactivate() }}
            >
              Desactivar
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          ¿Estás seguro de que deseas desactivar este usuario? No podrá
          iniciar sesión hasta que sea reactivado.
        </p>
      </Modal>

    </div>
  )
}