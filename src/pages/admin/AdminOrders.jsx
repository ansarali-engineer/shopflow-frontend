import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getOrders, updateOrderStatus } from '../../api/orders'
import { useToast } from '../../context/ToastContext'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Empty from '../../components/ui/Empty'

const STATUS_OPTIONS = [
  { value: '',                label: 'All' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'PAID',            label: 'Paid' },
  { value: 'PROCESSING',      label: 'Processing' },
  { value: 'SHIPPED',         label: 'Shipped' },
  { value: 'DELIVERED',       label: 'Delivered' },
  { value: 'CANCELLED',       label: 'Cancelled' },
  { value: 'REFUNDED',        label: 'Refunded' },
  { value: 'RETURNED',        label: 'Returned' },
]

const VALID_TRANSITIONS = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID:            ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING:      ['SHIPPED', 'REFUNDED'],
  SHIPPED:         ['DELIVERED'],
  DELIVERED:       ['RETURNED'],
}

export default function AdminOrders() {
  const toast = useToast()

  const [orders, setOrders]     = useState([])
  const [meta, setMeta]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch]     = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [transitioning, setTransitioning] = useState(null)
  const [newStatus, setNewStatus]         = useState('')
  const [saving, setSaving]               = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getOrders({
      page, page_size: 15,
      ...(statusFilter && { status: statusFilter }),
      ...(search       && { search }),
    })
      .then(({ data }) => { setOrders(data.data || []); setMeta(data.meta) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, statusFilter, search])

  useEffect(load, [load])

  const handleTransition = async () => {
    if (!newStatus) { toast.error('Select a status'); return }
    setSaving(true)
    try {
      await updateOrderStatus(transitioning.id, newStatus)
      toast.success(`Order ${transitioning.order_number} → ${newStatus}`)
      setTransitioning(null)
      setNewStatus('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Status update failed')
    } finally {
      setSaving(false)
    }
  }

  const nextStatuses = transitioning
    ? (VALID_TRANSITIONS[transitioning.status] || [])
    : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          {meta && <p className="text-sm text-gray-500 mt-0.5">{meta.total} orders</p>}
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1) }}
        className="flex gap-2 mb-5"
      >
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            className="input pl-9"
            placeholder="Search by order #, email, name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm px-4">Search</button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
            className="btn btn-secondary btn-sm"
          >
            Clear
          </button>
        )}
      </form>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1) }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition
              ${statusFilter === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <Empty icon="🧾" title="No orders" description="No orders match the current filter" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <Link
                      to={`/orders/${order.id}`}
                      className="font-mono text-sm font-semibold text-primary-600 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{order.customer_email || `ID ${order.customer_id}`}</p>
                    <p className="text-xs text-gray-400">{order.customer_first_name} {order.customer_last_name}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.item_count}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    Rs.{parseFloat(order.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3"><Badge label={order.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                      {VALID_TRANSITIONS[order.status]?.length > 0 && (
                        <button
                          onClick={() => { setTransitioning(order); setNewStatus('') }}
                          className="btn btn-secondary btn-sm"
                        >
                          Update Status
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      {/* Status transition modal */}
      <Modal
        open={!!transitioning}
        onClose={() => { setTransitioning(null); setNewStatus('') }}
        title="Update Order Status"
        size="sm"
      >
        {transitioning && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <p className="font-medium text-gray-800">{transitioning.order_number}</p>
              <p className="text-gray-500 mt-0.5">
                Current: <Badge label={transitioning.status} />
              </p>
            </div>

            {nextStatuses.length === 0 ? (
              <p className="text-sm text-gray-500">No valid transitions available for this status.</p>
            ) : (
              <>
                <div>
                  <label className="label">Move to status</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {nextStatuses.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewStatus(s)}
                        className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition
                          ${newStatus === s
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-700 hover:border-primary-300'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleTransition}
                    disabled={!newStatus || saving}
                    className="btn btn-primary"
                  >
                    {saving ? <Spinner size="sm" className="border-white border-t-white/30" /> : 'Confirm'}
                  </button>
                  <button
                    onClick={() => { setTransitioning(null); setNewStatus('') }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
