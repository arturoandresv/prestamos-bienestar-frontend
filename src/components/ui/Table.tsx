// ── Types ──────────────────────────────────────────
export interface Column<T> {
  key: string
  header: string
  width?: string
  render: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string | number
  emptyMessage?: string
  isLoading?: boolean
}

const skeletonRows = ['r1', 'r2', 'r3', 'r4', 'r5']
const skeletonCols = (n: number) => Array.from({ length: n }, (_, i) => `c${i}`)

// ── Loading skeleton ───────────────────────────────
const TableSkeleton = ({ columns }: { columns: number }) => (
  <>
    {skeletonRows.map((rowId) => (
      <tr key={rowId} className="border-b border-gray-50">
        {skeletonCols(columns).map((colId) => (
          <td key={colId} className="px-4 py-3">
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
          </td>
        ))}
      </tr>
    ))}
  </>
)

// ── Component ──────────────────────────────────────
export const Table = <T,>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay datos para mostrar',
  isLoading = false,
}: TableProps<T>) => {

  const getBodyContent = () => {
    if (isLoading) {
      return <TableSkeleton columns={columns.length} />
    }

    if (data.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.length}
            className="px-4 py-12 text-center text-sm text-gray-400"
          >
            {emptyMessage}
          </td>
        </tr>
      )
    }

    return data.map((row, index) => {
      const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
      return (
        <tr
          key={keyExtractor(row)}
          className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${rowClass}`}
        >
          {columns.map((col) => (
            <td key={col.key} className="px-4 py-3 text-gray-700">
              {col.render(row)}
            </td>
          ))}
        </tr>
      )
    })
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getBodyContent()}
        </tbody>
      </table>
    </div>
  )
}