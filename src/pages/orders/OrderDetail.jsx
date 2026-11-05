import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getOrder, updateOrderStatus } from '../../api/orders'
import { mockProcess } from '../../api/payments'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import PageLoader from '../../components/ui/PageLoader'
import Modal from '../../components/ui/Modal'

// Status flow for the timeline
const STATUS_FLOW = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
]

const CANCELLABLE = ['PENDING_PAYMENT', 'PAID']
// Seller: PAID→PROCESSING, PROCESSING→SHIPPED only
const SELLER_TRANSITIONS = { PAID: ['PROCESSING'], PROCESSING: ['SHIPPED'] }
// Admin: full state machine (mirrors backend VALID_TRANSITIONS)
const ADMIN_TRANSITIONS = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID:            ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING:      ['SHIPPED', 'REFUNDED'],
  SHIPPED:         ['DELIVERED'],
  DELIVERED:       ['RETURNED'],
}

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [order, setOrder]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)      // e.g. 403 message
  const [paying, setPaying]         = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelModal, setCancelModal] = useState(false)
  const [statusModal, setStatusModal] = useState(false)
  const [newStatus, setNewStatus]   = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Role-aware back link
  const backLink  = user?.role === 'seller' ? '/seller/orders' : '/orders'
  const backLabel = user?.role === 'seller' ? '← Seller Orders' : '← My Orders'

  const fetchOrder = () => {
    setLoading(true)
    setError(null)
    getOrder(id)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => {
        const code = err.response?.status
        const msg  = err.response?.data?.error?.message
        if (code === 403) {
          setError(msg || 'You do not have permission to view this order.')
        } else if (code === 404) {
          setError('Order not found.')
        } else {
          toast.error(msg || 'Could not load order')
          navigate(backLink, { replace: true })
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(fetchOrder, [id])

  const handleRetryPayment = async (success) => {
    const payment = order?.payments?.find((p) => p.status === 'pending')
    if (!payment) { toast.error('No pending payment found'); return }
    setPaying(true)
    try {
      await mockProcess(payment.id, success)
      toast.success(success ? 'Payment successful!' : 'Payment declined')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Payment error')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <PageLoader />

  // Show a friendly error screen instead of redirecting
  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {error || 'Order not found'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {user?.role === 'seller'
            ? 'You can only view orders that contain your products.'
            : 'This order may have been removed or you may not have access.'}
        </p>
        <Link to={backLink} className="btn btn-primary">{backLabel}</Link>
      </div>
    )
  }

  const handleSellerStatusUpdate = async () => {
    if (!newStatus) { toast.error('Select a status'); return }
    setUpdatingStatus(true)
    try {
      await updateOrderStatus(order.id, newStatus)
      toast.success(`Order → ${newStatus}`)
      setStatusModal(false); setNewStatus('')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const sellerNextStatuses = user?.role === 'seller'
    ? (SELLER_TRANSITIONS[order.status] || [])
    : []
  const adminNextStatuses = user?.role === 'admin'
    ? (ADMIN_TRANSITIONS[order.status] || [])
    : []
  const canUpdateStatus = sellerNextStatuses.length > 0 || adminNextStatuses.length > 0

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await updateOrderStatus(order.id, 'CANCELLED')
      toast.success('Order cancelled')
      setCancelModal(false)
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const isCancelled    = ['CANCELLED', 'REFUNDED', 'RETURNED'].includes(order.status)
  const canCancel      = user?.role === 'customer' && CANCELLABLE.includes(order.status)
  const flowIndex      = STATUS_FLOW.indexOf(order.status)
  const pendingPayment = order.payments?.find((p) => p.status === 'pending')

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to={backLink} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-600 transition mb-2">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {backLabel.replace('← ', '')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-mono tracking-tight">{order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
            {order.items?.length > 0 && (
              <span className="text-gray-300 mx-1.5">·</span>
            )}
            {order.items?.length > 0 && `${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status pill */}
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            { DELIVERED: 'bg-emerald-50 border-emerald-200 text-emerald-800',
              SHIPPED:   'bg-violet-50  border-violet-200  text-violet-800',
              PAID:      'bg-blue-50    border-blue-200    text-blue-800',
              PROCESSING:'bg-indigo-50  border-indigo-200  text-indigo-800',
              PENDING_PAYMENT:'bg-yellow-50 border-yellow-200 text-yellow-800',
              CANCELLED: 'bg-gray-100   border-gray-200    text-gray-600',
              REFUNDED:  'bg-gray-100   border-gray-200    text-gray-600',
              RETURNED:  'bg-orange-50  border-orange-200  text-orange-800',
            }[order.status] || 'bg-gray-100 border-gray-200 text-gray-600'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              { DELIVERED:'bg-emerald-500', SHIPPED:'bg-violet-500', PAID:'bg-blue-500',
                PROCESSING:'bg-indigo-500', PENDING_PAYMENT:'bg-yellow-400',
                CANCELLED:'bg-gray-400', REFUNDED:'bg-gray-400', RETURNED:'bg-orange-400',
              }[order.status] || 'bg-gray-400'
            }`} />
            {order.status.replace('_', ' ')}
          </span>
          {canUpdateStatus && (
            <button onClick={() => { setStatusModal(true); setNewStatus('') }} className="btn btn-primary btn-sm">
              Update Status
            </button>
          )}
          {canCancel && (
            <button onClick={() => setCancelModal(true)} className="btn btn-sm border border-red-200 text-red-600 hover:bg-red-50 transition">
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Status update modal — seller & admin */}
      <Modal open={statusModal} onClose={() => { setStatusModal(false); setNewStatus('') }}
        title="Update Order Status" size="sm">
        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 p-4 text-sm">
            <p className="font-mono font-semibold text-gray-800">{order.order_number}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-400 text-xs">Current:</span>
              <Badge label={order.status} />
            </div>
          </div>
          <div>
            <label className="label">Move to</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {(user?.role === 'admin' ? adminNextStatuses : sellerNextStatuses).map((s) => (
                <button key={s} type="button" onClick={() => setNewStatus(s)}
                  className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition
                    ${newStatus === s
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-700 hover:border-primary-300'}`}>
                  {s}
                </button>
              ))}
            </div>
            {newStatus === 'SHIPPED' && (
              <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                ⚠️ Marking as SHIPPED will deduct reserved inventory from stock.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSellerStatusUpdate} disabled={!newStatus || updatingStatus}
              className="btn btn-primary">
              {updatingStatus
                ? <Spinner size="sm" className="border-white/30 border-t-white" />
                : 'Confirm'}
            </button>
            <button onClick={() => { setStatusModal(false); setNewStatus('') }}
              className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
      {/* Cancel confirm modal */}
      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Order" size="sm">
        <div className="text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <p className="text-gray-700">
            Are you sure you want to cancel order{' '}
            <strong className="font-mono">{order.order_number}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. Any reserved items will be released.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => setCancelModal(false)} className="btn btn-secondary">
              Keep Order
            </button>
            <button onClick={handleCancel} disabled={cancelling} className="btn btn-danger">
              {cancelling
                ? <Spinner size="sm" className="border-white/30 border-t-white" />
                : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">Order Progress</h2>
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute inset-x-0 top-4 h-0.5 bg-gray-100">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{
                  width: `${Math.max(0, (flowIndex / (STATUS_FLOW.length - 1)) * 100)}%`
                }}
              />
            </div>
            {STATUS_FLOW.map((s, i) => {
              const done   = i < flowIndex
              const active = i === flowIndex
              return (
                <div key={s} className="relative flex flex-col items-center flex-1">
                  <div className={`z-10 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition
                    ${done   ? 'bg-primary-600 border-primary-600 text-white' : ''}
                    ${active ? 'bg-white border-primary-600 text-primary-600 ring-4 ring-primary-100' : ''}
                    ${!done && !active ? 'bg-white border-gray-200 text-gray-300' : ''}`}
                  >
                    {done ? '✓' : i + 1}
                  </div>
                  <span className={`mt-2 text-[10px] font-medium text-center leading-tight hidden sm:block
                    ${active ? 'text-primary-600' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                    {s.replace('_', ' ')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending payment action */}
      {pendingPayment && order.status === 'PENDING_PAYMENT' && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">Payment pending</p>
              <p className="text-sm text-yellow-700">
                Amount due: <strong>Rs.{parseFloat(pendingPayment.amount).toFixed(2)}</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleRetryPayment(true)}
              disabled={paying}
              className="btn btn-primary btn-sm"
            >
              {paying ? <Spinner size="sm" className="border-white border-t-white/30" /> : '✓ Complete Payment'}
            </button>
            <button
              onClick={() => handleRetryPayment(false)}
              disabled={paying}
              className="btn btn-danger btn-sm"
            >
              ✕ Simulate Failure
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Order Items
              </h2>
              <span className="badge bg-primary-50 text-primary-700">
                {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 p-5 hover:bg-surface-subtle transition-colors">
                  {/* Product image */}
                  <Link
                    to={`/products/${item.product_slug || item.product_id}`}
                    className="h-20 w-20 rounded-xl overflow-hidden bg-surface-subtle flex-shrink-0 border border-gray-100 hover:opacity-90 transition-opacity"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product_slug || item.product_id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-sm leading-snug line-clamp-2"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">{item.variant_name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: {item.variant_sku}</p>

                    {/* Mobile: price row */}
                    <div className="flex items-center justify-between mt-3 sm:hidden">
                      <span className="text-xs text-gray-500">
                        Rs.{parseFloat(item.unit_price).toFixed(2)} × {item.quantity}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        Rs.{parseFloat(item.line_total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Desktop: qty + price columns */}
                  <div className="hidden sm:flex flex-col items-end justify-between flex-shrink-0 min-w-[120px]">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Unit price</p>
                      <p className="text-sm font-medium text-gray-700">
                        Rs.{parseFloat(item.unit_price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Qty × {item.quantity}</p>
                      <p className="text-base font-bold text-gray-900">
                        Rs.{parseFloat(item.line_total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Items total strip */}
            <div className="px-6 py-3.5 bg-surface-subtle border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {order.items?.reduce((s, i) => s + i.quantity, 0)} unit{order.items?.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                Items subtotal: Rs.{parseFloat(order.subtotal).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Shipments */}
          {order.shipments?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Shipment</h2>
              {order.shipments.map((sh) => (
                <div key={sh.id} className="text-sm text-gray-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{sh.carrier || 'Carrier TBD'}</span>
                    <Badge label={sh.status} />
                  </div>
                  {sh.tracking_number && (
                    <p className="text-gray-500">
                      Tracking: <span className="font-mono">{sh.tracking_number}</span>
                    </p>
                  )}
                  {sh.shipped_at && (
                    <p className="text-gray-400">
                      Shipped: {new Date(sh.shipped_at).toLocaleDateString()}
                    </p>
                  )}
                  {sh.delivered_at && (
                    <p className="text-green-600">
                      Delivered: {new Date(sh.delivered_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Payments */}
          {order.payments?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Payment History</h2>
              <div className="space-y-3">
                {order.payments.map((pay) => (
                  <div key={pay.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge label={pay.status} />
                        <span className="text-gray-600 capitalize">{pay.payment_method}</span>
                      </div>
                      {pay.transaction_ref && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{pay.transaction_ref}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(pay.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      Rs.{parseFloat(pay.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — order summary */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rs.{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−Rs.{parseFloat(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Rs.{parseFloat(order.shipping_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>Rs.{parseFloat(order.tax_amount).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>Rs.{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer info (for admin view) */}
          {order.customer_email && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
              <p className="text-sm text-gray-700">
                {order.customer_first_name} {order.customer_last_name}
              </p>
              <p className="text-sm text-gray-500">{order.customer_email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
