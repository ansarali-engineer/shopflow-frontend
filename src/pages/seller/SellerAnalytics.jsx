import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import api from '../../api/axios'
import { getInventoryAlerts } from '../../api/analytics'
import StatCard from '../../components/dashboard/StatCard'
import DataTable from '../../components/dashboard/DataTable'
import Spinner from '../../components/ui/Spinner'

const fmt = (v) => `Rs.${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`

export default function SellerAnalytics() {
  const [products, setProducts]   = useState([])
  const [alerts, setAlerts]       = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/products/seller/', { params: { page: 1, page_size: 50 } }),
      getInventoryAlerts(10),
    ]).then(([p, a]) => {
      if (p.status === 'fulfilled') setProducts(p.value.data.data || [])
      if (a.status === 'fulfilled') setAlerts(a.value.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const totalStock = products.reduce((s, p) => s + (parseInt(p.total_stock) || 0), 0)
  const activeProducts = products.filter((p) => p.status === 'active').length
  const lowStockCount  = alerts.length

  const stockChart = products
    .filter((p) => p.status === 'active')
    .map((p) => ({
      name: (p.name || '').slice(0, 16),
      stock: parseInt(p.total_stock) || 0,
    }))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seller Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your products and inventory</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Products"  value={loading ? null : activeProducts} icon="📦" color="blue"   loading={loading} />
        <StatCard title="Total Stock"      value={loading ? null : totalStock.toLocaleString()} icon="🏭" color="green"  loading={loading} />
        <StatCard title="Low-Stock Alerts" value={loading ? null : lowStockCount}  icon="⚠️" color="yellow" loading={loading} />
      </div>

      {/* Stock levels bar chart */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Stock Levels (active products)</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : stockChart.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No products yet. Create your first product to see stock data.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stockChart} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [`${v} units`, 'Stock']} />
              <Bar dataKey="stock" fill="#4f52ee" radius={[4, 4, 0, 0]}
                label={{ position: 'top', fontSize: 10, fill: '#6b7280' }} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Low-stock alerts */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-gray-800">Low-Stock Alerts</h2>
          {alerts.length > 0 && (
            <span className="badge bg-red-100 text-red-700">{alerts.length}</span>
          )}
        </div>
        <DataTable
          rows={alerts}
          loading={loading}
          emptyIcon="✅"
          emptyTitle="All stocked up"
          emptyDesc="No variants below threshold"
          columns={[
            { key: 'product_name', label: 'Product',
              render: (v, row) => (
                <div>
                  <p className="font-medium text-sm">{v}</p>
                  <p className="text-xs text-gray-400">{row.variant_name}</p>
                </div>
              )},
            { key: 'sku', label: 'SKU',
              render: (v) => <span className="font-mono text-xs">{v}</span> },
            { key: 'available_stock', label: 'Available',
              render: (v) => (
                <span className={`badge ${parseInt(v) === 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'}`}>
                  {v}
                </span>
              )},
            { key: 'stock_quantity',    label: 'Total' },
            { key: 'reserved_quantity', label: 'Reserved' },
          ]}
          keyField="variant_id"
        />
      </div>

      {/* All products table */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">All Products</h2>
        <DataTable
          rows={products}
          loading={loading}
          emptyIcon="📦"
          emptyTitle="No products"
          columns={[
            { key: 'name',          label: 'Product' },
            { key: 'category_name', label: 'Category' },
            { key: 'base_price',    label: 'Base Price',
              render: (v) => `Rs.Rs.{parseFloat(v).toFixed(2)}` },
            { key: 'variant_count', label: 'Variants' },
            { key: 'total_stock',   label: 'Stock' },
            { key: 'status',        label: 'Status',
              render: (v) => (
                <span className={`badge ${
                  v === 'active'   ? 'bg-green-100 text-green-700' :
                  v === 'inactive' ? 'bg-gray-100 text-gray-600'   :
                                     'bg-red-100 text-red-600'}`}>
                  {v}
                </span>
              )},
          ]}
        />
      </div>
    </div>
  )
}
