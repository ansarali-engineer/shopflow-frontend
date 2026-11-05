import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { addStock, getMovements, getLowStock } from '../../api/inventory'
import { getSellerProducts } from '../../api/products'
import api from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import StatCard from '../../components/dashboard/StatCard'
import DataTable from '../../components/dashboard/DataTable'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

const MOVEMENT_TYPES = [
  { value: '',           label: 'All types' },
  { value: 'stock_in',   label: 'Stock In' },
  { value: 'reserve',    label: 'Reserve' },
  { value: 'release',    label: 'Release' },
  { value: 'sale',       label: 'Sale' },
  { value: 'adjustment', label: 'Adjustment' },
]

export default function SellerInventory() {
  const toast = useToast()

  const [tab, setTab] = useState('low-stock')

  // Low-stock state
  const [lowStock, setLowStock]         = useState([])
  const [lowLoading, setLowLoading]     = useState(true)
  const [threshold, setThreshold]       = useState(10)

  // Movements state
  const [movements, setMovements]       = useState([])
  const [movMeta, setMovMeta]           = useState(null)
  const [movPage, setMovPage]           = useState(1)
  const [movType, setMovType]           = useState('')
  const [movLoading, setMovLoading]     = useState(false)

  // Add-stock modal
  const [addStockOpen, setAddStockOpen] = useState(false)

  // ── Load low-stock ─────────────────────────────────────
  const loadLowStock = () => {
    setLowLoading(true)
    getLowStock(threshold)
      .then(({ data }) => setLowStock(data.data || []))
      .catch(() => {})
      .finally(() => setLowLoading(false))
  }
  useEffect(loadLowStock, [threshold])

  // ── Load movements ─────────────────────────────────────
  const loadMovements = () => {
    setMovLoading(true)
    getMovements({ page: movPage, page_size: 15, ...(movType && { movement_type: movType }) })
      .then(({ data }) => { setMovements(data.data || []); setMovMeta(data.meta) })
      .catch(() => {})
      .finally(() => setMovLoading(false))
  }
  useEffect(loadMovements, [movPage, movType])

  const lowStockCount = lowStock.length
  const criticalCount = lowStock.filter((r) => (r.available_stock ?? 0) === 0).length

  const lowStockCols = [
    { key: 'product_name', label: 'Product', render: (v, row) => (
      <div>
        <p className="font-medium text-gray-900 truncate max-w-[200px]">{v}</p>
        <p className="text-xs text-gray-400">{row.variant_name}</p>
      </div>
    )},
    { key: 'sku', label: 'SKU', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'available_stock', label: 'Available', render: (v) => {
      const n = parseInt(v) || 0
      return (
        <span className={`badge ${n === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {n === 0 ? 'Out of stock' : n}
        </span>
      )
    }},
    { key: 'stock_quantity',  label: 'Total Stock' },
    { key: 'reserved_quantity', label: 'Reserved' },
  ]

  const movementCols = [
    { key: 'created_at', label: 'Date', render: (v) => new Date(v).toLocaleString() },
    { key: 'variant_sku', label: 'SKU', render: (v) => <span className="font-mono text-xs">{v ?? '—'}</span> },
    { key: 'movement_type', label: 'Type', render: (v) => {
      const colors = { stock_in: 'green', reserve: 'yellow', release: 'blue', sale: 'purple', adjustment: 'gray' }
      return <Badge label={v} color={colors[v] ?? 'gray'} />
    }},
    { key: 'quantity', label: 'Qty', render: (v) => (
      <span className={parseInt(v) > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
        {parseInt(v) > 0 ? `+${v}` : v}
      </span>
    )},
    { key: 'reason', label: 'Reason', render: (v) => <span className="text-gray-500 truncate max-w-[180px] block">{v || '—'}</span> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <button onClick={() => setAddStockOpen(true)} className="btn btn-primary">
          + Add Stock
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Low-Stock Items"   value={lowLoading ? null : lowStockCount} icon="⚠️" color="yellow" loading={lowLoading} />
        <StatCard title="Out of Stock"      value={lowLoading ? null : criticalCount}  icon="❌" color="red"    loading={lowLoading} />
        <StatCard title="Stock Threshold"   value={threshold}  icon="📊" color="blue"
          subtitle={
            <span className="flex items-center gap-1">
              Showing variants ≤
              <input
                type="number"
                min="1"
                max="100"
                className="w-14 border-b border-gray-300 text-xs text-center bg-transparent focus:outline-none"
                value={threshold}
                onChange={(e) => setThreshold(Math.max(1, parseInt(e.target.value) || 10))}
              />
            </span>
          }
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-6 w-fit">
        {[
          { id: 'low-stock', label: 'Low Stock' },
          { id: 'movements', label: 'Movement Log' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition
              ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Low stock */}
      {tab === 'low-stock' && (
        <DataTable
          columns={lowStockCols}
          rows={lowStock}
          loading={lowLoading}
          emptyIcon="✅"
          emptyTitle="All stocked up"
          emptyDesc={`No variants below ${threshold} units`}
          keyField="variant_id"
        />
      )}

      {/* Tab: Movements */}
      {tab === 'movements' && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {MOVEMENT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setMovType(t.value); setMovPage(1) }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition
                  ${movType === t.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <DataTable
            columns={movementCols}
            rows={movements}
            loading={movLoading}
            emptyIcon="📋"
            emptyTitle="No movements"
            emptyDesc="Inventory activity will appear here"
            keyField="id"
          />
          <Pagination meta={movMeta} onPageChange={(p) => setMovPage(p)} />
        </>
      )}

      {/* Add stock modal */}
      <Modal open={addStockOpen} onClose={() => setAddStockOpen(false)} title="Add Stock">
        <AddStockForm
          onSuccess={() => { setAddStockOpen(false); loadLowStock(); loadMovements(); toast.success('Stock added') }}
          toast={toast}
        />
      </Modal>
    </div>
  )
}

function AddStockForm({ onSuccess, toast }) {
  const [saving, setSaving] = useState(false)
  const [variants, setVariants] = useState([])
  const [varLoading, setVarLoading] = useState(true)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { variant_id: '', quantity: 1, reason: 'restock' },
  })

  useEffect(() => {
    // Load seller's own products with their variants
    getSellerProducts({ page: 1, page_size: 100 })
      .then(async ({ data }) => {
        const products = data.data || []
        const variantRows = []
        await Promise.allSettled(
          products.map(async (p) => {
            const res = await api.get(`/products/${p.id}/`)
            const vList = res.data?.data?.variants || []
            vList.forEach((v) => variantRows.push({ ...v, product_name: p.name }))
          })
        )
        setVariants(variantRows)
      })
      .catch(() => {})
      .finally(() => setVarLoading(false))
  }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await addStock({ ...data, quantity: parseInt(data.quantity), variant_id: parseInt(data.variant_id) })
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not add stock')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="label">Select Variant *</label>
        {varLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400"><Spinner size="sm" /> Loading variants…</div>
        ) : variants.length === 0 ? (
          <p className="text-sm text-gray-400">No variants found. Create a product with variants first.</p>
        ) : (
          <select
            className={`input ${errors.variant_id ? 'input-error' : ''}`}
            {...register('variant_id', { required: 'Please select a variant' })}
          >
            <option value="">— Select a variant —</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.product_name} — {v.variant_name} (SKU: {v.sku}, In stock: {v.available_stock ?? v.stock_quantity})
              </option>
            ))}
          </select>
        )}
        {errors.variant_id && <p className="field-error">{errors.variant_id.message}</p>}
      </div>
      <div>
        <label className="label">Quantity to add *</label>
        <input
          type="number"
          min="1"
          className={`input ${errors.quantity ? 'input-error' : ''}`}
          {...register('quantity', { required: 'Quantity is required', min: { value: 1, message: 'Must be at least 1' } })}
        />
        {errors.quantity && <p className="field-error">{errors.quantity.message}</p>}
      </div>
      <div>
        <label className="label">Reason</label>
        <input type="text" className="input" placeholder="e.g. restock, return" {...register('reason')} />
      </div>
      <button type="submit" disabled={saving || varLoading} className="btn btn-primary">
        {saving ? <Spinner size="sm" className="border-white/30 border-t-white" /> : 'Add Stock'}
      </button>
    </form>
  )
}
