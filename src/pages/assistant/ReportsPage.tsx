import { useState } from 'react'
import { PageHeader, Button } from '../../components/ui'
import { api } from '../../services/api'

const NOW = Date.now();

// ── Types ──────────────────────────────────────────
type ReportType = 'loans' | 'returns' | 'sanctions'
type ReportFormat = 'pdf' | 'xlsx'

interface ReportCard {
  type: ReportType
  title: string
  description: string
}

// ── Report cards config ────────────────────────────
const reportCards: ReportCard[] = [
  {
    type:        'loans',
    title:       'Préstamos',
    description: 'Historial de todos los préstamos registrados en el período seleccionado',
  },
  {
    type:        'returns',
    title:       'Devoluciones',
    description: 'Registro de devoluciones con estado del artículo devuelto',
  },
  {
    type:        'sanctions',
    title:       'Sanciones',
    description: 'Sanciones aplicadas por vencimiento o artículo en mal estado',
  },
]

// ── Download helper ────────────────────────────────
const downloadReport = async (
  type: ReportType,
  format: ReportFormat,
  startDate: string,
  endDate: string,
): Promise<void> => {
  const { data } = await api.get(`/reports/${type}`, {
    params:       { startDate, endDate, format },
    responseType: 'blob',
  })
  const url      = URL.createObjectURL(data as Blob)
  const link     = document.createElement('a')
  link.href      = url
  link.download  = `reporte-${type}-${startDate}-${endDate}.${format}`
  link.click()
  URL.revokeObjectURL(url)
}

// ── Component ──────────────────────────────────────
export const ReportsPage = () => {
  const today     = new Date().toISOString().split('T')[0]
  const lastMonth = new Date(NOW - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(lastMonth)
  const [endDate, setEndDate]     = useState(today)
  const [loading, setLoading]     = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)

  const handleDownload = async (type: ReportType, format: ReportFormat) => {
    try {
      setError(null)
      setLoading(`${type}-${format}`)
      await downloadReport(type, format, startDate, endDate)
    } catch {
      setError('No hay datos en el período seleccionado o ocurrió un error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Exportar reportes"
        description="Genera y descarga reportes en PDF o Excel"
      />

      <div className="p-6 flex flex-col gap-6">

        {/* Date range */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4">
          <h2 className="text-sm font-medium text-gray-700">Rango de fechas</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="startDate" className="text-xs text-gray-500">
                Fecha inicio
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => { setStartDate(e.target.value) }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="endDate" className="text-xs text-gray-500">
                Fecha fin
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate}
                max={today}
                onChange={(e) => { setEndDate(e.target.value) }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1A3A6B]"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Report cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportCards.map((card) => (
            <div
              key={card.type}
              className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-gray-900">{card.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{card.description}</p>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  isLoading={loading === `${card.type}-pdf`}
                  onClick={() => { void handleDownload(card.type, 'pdf') }}
                >
                  Exportar PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  isLoading={loading === `${card.type}-xlsx`}
                  onClick={() => { void handleDownload(card.type, 'xlsx') }}
                >
                  Exportar Excel
                </Button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}