import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getOrders } from '../../api/orders'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import Empty from '../../components/ui/Empty'

const STATUS_OPTIONS = [
  { value: '',                label: 'All',            dot: 'bg-gray-400'    },
  { value: 'PENDING_PAYMENT', label: 'Pending',        dot: 'bg-yellow-400'  },
  { value: 'PAID',            label: 'Paid',           dot: 'bg-blue-500'    },
  { value: 'PROCESSING',      label: 'Processing',     dot: 'bg-indigo-500'  },
  { value: 'SHIPPED',         label: 'Shipped',        dot: 'bg-violet-500'  },
  { value: 'DELIVERED',       label: 'Delivered',      dot: 'bg-emerald-500' },
  { value: 'CANCELLED',       label: 'Cancelled',      dot: 'bg-gray-400'    },
  { value: 'REFUNDED',        label: 'Refunded',       dot: 'bg-gray-400'    },
  { value: 'RETURNED',        label: 'Returned',       dot: 'bg-orange-400'  },
]

const STATUS_STYLES = {
  PENDING_PAYMENT: 'bg-yellow-50  text-yellow-800  border-yellow-200',
  PAID:            'bg-blue-50    text-blue-800    border-blue-200',
  PROCESSING:      'bg-indigo-50  text-indigo-800  border-indigo-200',
  SHIPPED:         'bg-violet-50  text-violet-800  border-violet-200',
  DELIVERED:       'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED:       'bg-gray-100   text-gray-600    border-gray-200',
  REFUNDED:        'bg-gray-100   text-gray-600    border-gray-200',
  RETURNED:        'bg-orange-50  text-orange-800  border-orange-200',
}

const STATUS_DOT = {
  PENDING_PAYMENT: 'bg-yellow-400',
  PAID:            'bg-blue-500',
  PROCESSING:      'bg-indigo-500',
  SHIPPED:         'bg-violet-500',
  DELIVERED:       'bg-emerald-500',
  CANCELLED:       'bg-gray-400',
  REFUNDED:        'bg-gray-400',
  RETURNED:        'bg-orange-400',
}

const STAGE_STEPS = ['Order Placed', 'Payment', 'Processing', 'Shipped', 'Delivered']
const STATUS_STEP = {
  PENDING_PAYMENT: 1,
  PAID:            2,
  PROCESSING:      3,
  SHIPPED:         4,
  DELIVERED:       5,
  CANCELLED:       -1,
  REFUNDED:        -1,
  RETURNED:        -1,
}

function fmt(dt) {
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function OrderList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page   = parseInt(searchParams.get('page') || '1', 10)
  const status = searchParams.get('status') || ''

  const [orders, setOrders]   = useState([])
  const [meta, setMeta]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getOrders({ page, page_size: 8, ...(status && { status }) })
      .then(({ data }) => { setOrders(data.data || []); setMeta(data.meta || null) })
      .catch(() => { setOrders([]); setMeta(null) })
      .finally(() => setLoading(false))
  }, [page, status])

  const setStatus = (val) => {
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev)
      val ? n.set('status', val) : n.delete('status')
      n.set('page', '1')
      return n
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          {meta ? `${meta.total} ${meta.total === 1 ? 'order' : 'orders'} · Page ${page} of ${meta.total_pages || 1}` : 'Track and manage your purchases'}
        </p>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-6 pb-4 border-b border-gray-100">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold
                        transition-all duration-150 border
              ${status === opt.value
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'}`}
          >
            {opt.value && <span className={`h-1.5 w-1.5 rounded-full ${opt.dot} ${status === opt.value ? 'bg-white/80' : ''}`} />}
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-400">Loading your orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <Empty
          icon="🛍️"
          title={status ? `No ${status.replace('_', ' ').toLowerCase()} orders` : 'No orders yet'}
          description={status ? 'Try a different filter above.' : 'When you place an order it will appear here.'}
        >
          {!status && (
            <Link to="/products" className="btn btn-primary mt-5">
              Browse Products
            </Link>
          )}
        </Empty>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <Pagination meta={meta} onPageChange={(p) => {
            setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set('page', p); return n })
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }} />
        </>
      )}
    </div>
  )
}

/* ── Order card ─────────────────────────────────────────── */
function OrderCard({ order }) {
  const step        = STATUS_STEP[order.status] ?? -1
  const isCancelled = step === -1
  const style       = STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'
  const dot         = STATUS_DOT[order.status]    || 'bg-gray-400'

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
    >
      <div className="p-5">
        {/* ── Top row ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-gray-900 tracking-tight">
                {order.order_number}
              </span>
              {/* Status pill */}
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${style}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 line-clamp-1 max-w-xs">
              {order.product_names || '—'}
            </p>
          </div>

          {/* Price + CTA */}
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-gray-900 tabular-nums">
              Rs.{parseFloat(order.total_amount).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {/* ── Progress tracker (only for active orders) ── */}
        {!isCancelled && (
          <div className="mt-5">
            <div className="flex items-center gap-0">
              {STAGE_STEPS.map((label, i) => {
                const idx      = i + 1   // 1-based
                const done     = idx < step
                const active   = idx === step
                const upcoming = idx > step
                return (
                  <div key={label} className="flex items-center flex-1 last:flex-none">
                    {/* Node */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold
                                       transition-all duration-300
                        ${done   ? 'bg-primary-600 text-white' : ''}
                        ${active ? 'bg-primary-600 text-white ring-4 ring-primary-100' : ''}
                        ${upcoming ? 'bg-gray-100 text-gray-400' : ''}`}>
                        {done ? (
                          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : idx}
                      </div>
                      <span className={`text-[9px] font-medium leading-none whitespace-nowrap hidden sm:block
                        ${active ? 'text-primary-700' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                        {label}
                      </span>
                    </div>
                    {/* Connector line */}
                    {i < STAGE_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-300
                        ${done ? 'bg-primary-600' : 'bg-gray-100'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Placed {fmt(order.created_at)}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600
                           group-hover:gap-2 transition-all">
            View details
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>

      {/* Cancelled / refunded / returned banner */}
      {isCancelled && (
        <div className={`px-5 py-2.5 border-t text-xs font-medium rounded-b-2xl
          ${order.status === 'CANCELLED' ? 'bg-gray-50 border-gray-100 text-gray-500' :
            order.status === 'REFUNDED'  ? 'bg-blue-50  border-blue-100  text-blue-600' :
                                           'bg-orange-50 border-orange-100 text-orange-700'}`}>
          {order.status === 'CANCELLED' && '✕ This order was cancelled.'}
          {order.status === 'REFUNDED'  && '↩ Refund processed for this order.'}
          {order.status === 'RETURNED'  && '📦 Return initiated for this order.'}
        </div>
      )}
    </Link>
  )
}
