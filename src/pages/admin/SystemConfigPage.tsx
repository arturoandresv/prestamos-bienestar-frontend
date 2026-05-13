import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, Button } from '../../components/ui'
import { api } from '../../services/api'

// ── Types ──────────────────────────────────────────
interface SystemConfig {
  loanTimeLimitDays:  number
  maxActiveLoans:     number
  updatedAt:          string
  updatedBy:          string
}

// ── Fetchers / mutations ───────────────────────────
const fetchConfig = async (): Promise<SystemConfig> => {
  const { data } = await api.get<SystemConfig>('/config')
  return data
}

const updateConfig = async (payload: Partial<SystemConfig>): Promise<void> => {
  await api.patch('/config', payload)
}

// ── Config Card ────────────────────────────────────
interface ConfigCardProps {
  title:       string
  description: string
  value:       number
  unit:        string
  onSave:      (value: number) => void
  isSaving:    boolean
  updatedAt:   string
  updatedBy:   string
}

const ConfigCard = ({
  title, description, value, unit,
  onSave, isSaving, updatedAt, updatedBy,
}: ConfigCardProps) => {
  const [localValue, setLocalValue] = useState(value)
  const hasChanged = localValue !== value

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={localValue}
          onChange={(e) => { setLocalValue(Number(e.target.value)) }}
          className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B] text-center font-medium"
        />
        <span className="text-sm text-gray-500">{unit}</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div>
          <p className="text-xs text-gray-400">
            Última modificación: {new Date(updatedAt).toLocaleDateString('es-CO', { dateStyle: 'medium' })}
          </p>
          <p className="text-xs text-gray-400">Por: {updatedBy}</p>
        </div>
        <Button
          size="sm"
          disabled={!hasChanged}
          isLoading={isSaving}
          onClick={() => { onSave(localValue) }}
        >
          Guardar
        </Button>
      </div>
    </div>
  )
}

// ── Component ──────────────────────────────────────
export const SystemConfigPage = () => {
  const queryClient = useQueryClient()
  const [savingField, setSavingField] = useState<string | null>(null)

  const { data: config, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn:  fetchConfig,
  })

  const { mutate: save } = useMutation({
    mutationFn: updateConfig,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['config'] })
      setSavingField(null)
    },
  })

  const handleSaveLoanLimit = (value: number) => {
    setSavingField('loanTimeLimitDays')
    save({ loanTimeLimitDays: value })
  }

  const handleSaveMaxLoans = (value: number) => {
    setSavingField('maxActiveLoans')
    save({ maxActiveLoans: value })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader title="Configuración del sistema" />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="bg-gray-100 rounded-xl h-48" />
          <div className="bg-gray-100 rounded-xl h-48" />
        </div>
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Configuración del sistema"
        description="Parámetros operativos del sistema de préstamos"
      />

      <div className="p-6 flex flex-col gap-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigCard
            title="Tiempo límite de préstamo"
            description="Número de días que tiene un estudiante para devolver un artículo antes de que el préstamo se marque como vencido"
            value={config.loanTimeLimitDays}
            unit="días"
            onSave={handleSaveLoanLimit}
            isSaving={savingField === 'loanTimeLimitDays'}
            updatedAt={config.updatedAt}
            updatedBy={config.updatedBy}
          />
          <ConfigCard
            title="Máximo de préstamos activos"
            description="Número máximo de préstamos activos que puede tener un estudiante al mismo tiempo"
            value={config.maxActiveLoans}
            unit="préstamos"
            onSave={handleSaveMaxLoans}
            isSaving={savingField === 'maxActiveLoans'}
            updatedAt={config.updatedAt}
            updatedBy={config.updatedBy}
          />
        </div>

      </div>
    </div>
  )
}