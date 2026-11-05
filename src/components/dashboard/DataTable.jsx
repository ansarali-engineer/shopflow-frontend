import Spinner from '../ui/Spinner'
import Empty from '../ui/Empty'

/**
 * Generic data table for dashboard reports.
 * Props:
 *   columns: [{ key, label, render?(value, row) → ReactNode, className? }]
 *   rows: array of objects
 *   loading: bool
 *   emptyIcon, emptyTitle, emptyDesc
 *   keyField: string (default 'id')
 */
export default function DataTable({
  columns,
  rows = [],
  loading,
  emptyIcon = '📋',
  emptyTitle = 'No data',
  emptyDesc = '',
  keyField = 'id',
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!rows.length) {
    return <Empty icon={emptyIcon} title={emptyTitle} description={emptyDesc} />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.className ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {rows.map((row, i) => (
            <tr key={row[keyField] ?? i} className="hover:bg-gray-50 transition">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${col.className ?? ''}`}
                >
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
