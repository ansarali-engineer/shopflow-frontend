import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  getMonthlyRevenue, getOrderStatusSummary, getTopProducts,
  getRevenueBySeller, getCustomerLifetimeValue, getInventoryAlerts,
} from '../../api/analytics'
import StatCard from '../../components/dashboard/StatCard'
import DataTable from '../../components/dashboard/DataTable'
import Spinner from '../../components/ui/Spinner'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

// ── Currency formatter ────────────────────────────────────
const fmt = (v) => `Rs.${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export default function AdminAnalytics() {
  const [monthly,     setMonthly]     = useState([])
  const [statusSum,   setStatusSum]   = useState(null)
  const [topProds,    setTopProds]    = useState([])
  const [bySeller,    setBySeller]    = useState([])
  const [ltv,         setLtv]         = useState([])
  const [alerts,      setAlerts]      = useState([])

  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getMonthlyRevenue(),
      getOrderStatusSummary(),
      getTopProducts(8),
      getRevenueBySeller(),
      getCustomerLifetimeValue(),
      getInventoryAlerts(10),
    ]).then(([m, s, t, b, l, a]) => {
      if (m.status === 'fulfilled') setMonthly(m.value.data.data || [])
      if (s.status === 'fulfilled') setStatusSum(s.value.data.data)
      if (t.status === 'fulfilled') setTopProds(t.value.data.data || [])
      if (b.status === 'fulfilled') setBySeller(b.value.data.data || [])
      if (l.status === 'fulfilled') setLtv(l.value.data.data || [])
      if (a.status === 'fulfilled') setAlerts(a.value.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  // ── KPI calculations ──────────────────────────────────────
  const totalRevenue = monthly.reduce((s, r) => s + parseFloat(r.total_revenue || 0), 0)
  const totalOrders  = statusSum
    ? Object.values(statusSum).reduce((s, v) => s + (parseInt(v) || 0), 0)
    : null
  const avgLtv = ltv.length
    ? ltv.reduce((s, r) => s + parseFloat(r.lifetime_value || 0), 0) / ltv.length
    : 0

  // Shape monthly data for AreaChart
  const revenueData = monthly.slice(-12).map((r) => ({
    month: `${r.order_year ?? ''}-${String(r.order_month ?? '').padStart(2, '0')}`,
    revenue: parseFloat(r.total_revenue || 0),
    orders: parseInt(r.order_count || 0),
  }))

  // Shape status for PieChart
  const pieData = statusSum
    ? Object.entries(statusSum)
        .filter(([, v]) => parseInt(v) > 0)
        .map(([name, value]) => ({ name, value: parseInt(value) }))
    : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue (all time)" value={fmt(totalRevenue)} icon="💰" color="green"  loading={loading} />
        <StatCard title="Total Orders"             value={totalOrders}       icon="🛒" color="blue"   loading={loading} />
        <StatCard title="Avg Customer LTV"         value={fmt(avgLtv)}       icon="👤" color="purple" loading={loading} />
        <StatCard title="Low-Stock Alerts"         value={loading ? null : alerts.length} icon="⚠️" color="yellow" loading={loading} />
      </div>

      {/* Revenue trend + order status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart — monthly revenue */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
          {loading ? <ChartSkeleton /> : revenueData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No revenue data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => fmt(v)} labelStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart — order status */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Order Status</h2>
          {loading ? <ChartSkeleton h={220} /> : pieData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No orders yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} orders`]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top products bar chart */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Top Products by Revenue</h2>
        {loading ? <ChartSkeleton h={200} /> : topProds.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No sales data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={topProds.map((r) => ({
                name: (r.product_name || '').slice(0, 18),
                revenue: parseFloat(r.total_revenue || 0),
              }))}
              margin={{ top: 5, right: 10, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [fmt(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Revenue by seller + LTV table side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Revenue by Seller</h2>
          <DataTable
            loading={loading}
            rows={bySeller.slice(0, 8)}
            emptyIcon="🏪"
            emptyTitle="No seller data"
            columns={[
              { key: 'seller_first_name', label: 'Seller',
                render: (v, row) => (
                  <div>
                    <p className="font-medium text-sm">
                      {row.seller_first_name ?? ''} {row.seller_last_name ?? ''}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[140px]">{row.seller_email}</p>
                  </div>
                )},
              { key: 'total_revenue', label: 'Revenue',
                render: (v) => <span className="font-semibold text-green-700">{fmt(v)}</span> },
              { key: 'order_count', label: 'Orders' },
              { key: 'products_sold', label: 'Products' },
            ]}
          />
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Customer Lifetime Value (Top 8)</h2>
          <DataTable
            loading={loading}
            rows={ltv.slice(0, 8)}
            emptyIcon="👤"
            emptyTitle="No LTV data"
            columns={[
              { key: 'email', label: 'Customer',
                render: (v, row) => (
                  <div>
                    <p className="font-medium text-sm truncate max-w-[140px]">{v}</p>
                    <p className="text-xs text-gray-400">{row.first_name} {row.last_name}</p>
                  </div>
                ) },
              { key: 'lifetime_value', label: 'LTV',
                render: (v) => <span className="font-semibold text-primary-700">{fmt(v)}</span> },
              { key: 'order_count', label: 'Orders' },
            ]}
          />
        </div>
      </div>

      {/* Inventory alerts */}
      {alerts.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            🚨 Inventory Alerts
            <span className="ml-2 badge bg-red-100 text-red-700">{alerts.length}</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">Variants at or below 10 units</p>
          <DataTable
            rows={alerts.slice(0, 10)}
            emptyIcon="✅" emptyTitle="No alerts"
            columns={[
              { key: 'product_name', label: 'Product',
                render: (v, row) => (
                  <div>
                    <p className="font-medium">{v}</p>
                    <p className="text-xs text-gray-400">{row.variant_name}</p>
                  </div>
                )},
              { key: 'sku', label: 'SKU', render: (v) => <span className="font-mono text-xs">{v}</span> },
              { key: 'available_stock', label: 'Available',
                render: (v) => (
                  <span className={`badge ${parseInt(v) === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {v}
                  </span>
                )},
              { key: 'seller_name', label: 'Seller',
                render: (_, row) => `${row.seller_first_name ?? ''} ${row.seller_last_name ?? ''}`.trim() || '—' },
            ]}
          />
        </div>
      )}
    </div>
  )
}

function ChartSkeleton({ h = 220 }) {
  return (
    <div className="flex items-center justify-center" style={{ height: h }}>
      <Spinner size="lg" />
    </div>
  )
}
