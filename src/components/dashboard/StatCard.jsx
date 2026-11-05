/**
 * StatCard — a simple KPI tile used in both seller and admin dashboards.
 * Props: title, value, subtitle, icon, color ('blue'|'green'|'yellow'|'red'|'purple')
 */
const palettes = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', val: 'text-yellow-700' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    val: 'text-red-700' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', val: 'text-purple-700' },
}

export default function StatCard({ title, value, subtitle, icon, color = 'blue', loading }) {
  const p = palettes[color] ?? palettes.blue
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`h-11 w-11 rounded-xl ${p.bg} flex items-center justify-center text-xl flex-shrink-0`}>
        <span className={p.icon}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{title}</p>
        {loading ? (
          <div className="h-7 w-24 bg-gray-100 rounded animate-pulse mt-1" />
        ) : (
          <p className={`text-2xl font-bold mt-0.5 ${p.val}`}>{value ?? '—'}</p>
        )}
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  )
}
