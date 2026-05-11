import { useAuthStore } from '../../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { PageHeader, StatusBadge } from '../../components/ui'
import { api } from '../../services/api'
import type { Student } from '../../types'

// ── Fetcher ────────────────────────────────────────
const fetchProfile = async (): Promise<Student> => {
  const { data } = await api.get<Student>('/students/me')
  return data
}

// ── Component ──────────────────────────────────────
export const ProfilePage = () => {
  const { user } = useAuthStore()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn:  fetchProfile,
  })

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Mi perfil"
        description="Información de tu cuenta estudiantil"
      />

      <div className="p-6 max-w-lg">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

          {/* Avatar header */}
          <div className="bg-[#1A3A6B] px-6 py-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-2xl font-medium">
                {user?.firstName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              <p className="text-white font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-white/60 text-sm mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* Info fields */}
          <div className="p-6 flex flex-col gap-4">

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ) : (
              <>
                {/* Fields */}
                {[
                  { label: 'Nombre completo', value: `${user?.firstName} ${user?.lastName}` },
                  { label: 'Correo institucional', value: user?.email },
                  { label: 'Código estudiantil', value: profile?.studentCode },
                  { label: 'Rol', value: 'Estudiante' },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col gap-1">
                    <p className="text-xs text-gray-400">{field.label}</p>
                    <p className="text-sm font-medium text-gray-700">
                      {field.value ?? '—'}
                    </p>
                  </div>
                ))}

                {/* Carnet status */}
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400">Estado del carnet</p>
                  <StatusBadge
                    label={
                      profile?.cardHeldAsGuarantee
                        ? 'Retenido como garantía'
                        : 'En tu poder'
                    }
                    variant={profile?.cardHeldAsGuarantee ? 'warning' : 'success'}
                  />
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}