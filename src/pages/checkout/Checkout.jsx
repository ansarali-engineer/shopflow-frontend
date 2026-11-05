import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { getAddresses, createAddress } from '../../api/users'
import { checkout as apiCheckout } from '../../api/orders'
import { mockProcess } from '../../api/payments'
import AddressForm from '../../components/address/AddressForm'
import Spinner from '../../components/ui/Spinner'
import Empty from '../../components/ui/Empty'

const STEPS = ['Shipping', 'Review', 'Payment']

export default function Checkout() {
  const { cart, fetchCart } = useCart()
  const toast = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)

  // Step 0 — Address
  const [addresses, setAddresses]           = useState([])
  const [addrLoading, setAddrLoading]       = useState(true)
  const [selectedAddr, setSelectedAddr]     = useState(null)
  const [showAddrForm, setShowAddrForm]     = useState(false)
  const [savingAddr, setSavingAddr]         = useState(false)
  const [couponCode, setCouponCode]         = useState('')

  // Step 2 — Payment mock
  const [order, setOrder]                   = useState(null)
  const [placingOrder, setPlacingOrder]     = useState(false)
  const [processingPay, setProcessingPay]   = useState(false)
  const [payResult, setPayResult]           = useState(null)   // 'success' | 'failed'

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart.items?.length && !placingOrder && !order) {
      navigate('/cart', { replace: true })
    }
  }, [cart.items])

  // Load addresses on mount
  useEffect(() => {
    getAddresses()
      .then(({ data }) => {
        const addrs = data.data || []
        setAddresses(addrs)
        const def = addrs.find((a) => a.is_default) || addrs[0]
        if (def) setSelectedAddr(def.id)
      })
      .catch(() => {})
      .finally(() => setAddrLoading(false))
  }, [])

  // ── Step 0: save new address ──────────────────────────────
  const handleSaveAddr = async (formData) => {
    setSavingAddr(true)
    try {
      const { data } = await createAddress(formData)
      // Reload addresses
      const res = await getAddresses()
      const addrs = res.data.data || []
      setAddresses(addrs)
      setSelectedAddr(data.data.address_id)
      setShowAddrForm(false)
      toast.success('Address saved')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not save address')
    } finally {
      setSavingAddr(false)
    }
  }

  // ── Step 1→2: place order ─────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddr) { toast.error('Select a shipping address'); return }
    setPlacingOrder(true)
    try {
      const { data } = await apiCheckout({
        shipping_address_id: selectedAddr,
        coupon_code: couponCode || undefined,
        idempotency_key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      })
      setOrder(data.data)
      await fetchCart()
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Checkout failed')
    } finally {
      setPlacingOrder(false)
    }
  }

  // ── Step 2: simulate payment ──────────────────────────────
  const handlePayment = async (success) => {
    const payment = order?.payments?.[0]
    if (!payment) { toast.error('No payment record found'); return }
    setProcessingPay(true)
    try {
      await mockProcess(payment.id, success)
      setPayResult(success ? 'success' : 'failed')
      if (success) toast.success('Payment successful!')
      else toast.error('Payment declined')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Payment error')
    } finally {
      setProcessingPay(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Step indicator */}
      <StepIndicator steps={STEPS} current={step} />

      {/* ── Step 0: Shipping address ─────────────────── */}
      {step === 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Shipping Address</h2>

          {addrLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <>
              {addresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      selected={selectedAddr === addr.id}
                      onSelect={() => setSelectedAddr(addr.id)}
                    />
                  ))}
                </div>
              )}

              {!showAddrForm && (
                <button
                  onClick={() => setShowAddrForm(true)}
                  className="btn btn-secondary mb-5"
                >
                  + Add new address
                </button>
              )}

              {showAddrForm && (
                <div className="card p-5 mb-5">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">New Address</h3>
                  <AddressForm
                    onSubmit={handleSaveAddr}
                    onCancel={() => setShowAddrForm(false)}
                    loading={savingAddr}
                  />
                </div>
              )}

              {/* Coupon code */}
              <div className="card p-5 mb-5">
                <label className="label" htmlFor="coupon">Coupon code <span className="font-normal text-gray-400">(optional)</span></label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    type="text"
                    className="input flex-1 uppercase tracking-wider"
                    placeholder="e.g. SAVE10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!selectedAddr || showAddrForm}
                  onClick={() => setStep(1)}
                  className="btn btn-primary btn-lg"
                >
                  Continue to Review →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Step 1: Review order ─────────────────────── */}
      {step === 1 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Review Your Order</h2>

          {/* Items */}
          <div className="card mb-5 divide-y divide-gray-100">
            {cart.items?.map((item) => (
              <div key={item.variant_id} className="flex items-center gap-4 p-4">
                <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                    : <div className="flex h-full items-center justify-center text-xl">📦</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product_name}</p>
                  <p className="text-xs text-gray-500">{item.variant_name} × {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  Rs.{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Shipping address summary */}
          <div className="card p-5 mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Shipping to</h3>
            {(() => {
              const addr = addresses.find((a) => a.id === selectedAddr)
              if (!addr) return null
              return (
                <p className="text-sm text-gray-600">
                  {addr.label}: {addr.street_line1}{addr.street_line2 ? `, ${addr.street_line2}` : ''},{' '}
                  {addr.city}, {addr.state} {addr.postal_code}
                </p>
              )
            })()}
          </div>

          {/* Price estimate */}
          <div className="card p-5 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>Rs.{parseFloat(cart.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping (flat)</span>
                <span>Rs.9.99</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>Rs.{(parseFloat(cart.subtotal || 0) * 0.08).toFixed(2)}</span>
              </div>
              {couponCode && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon: {couponCode}</span>
                  <span>Applied at checkout</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                <span>Estimated total</span>
                <span>
                  Rs.{(
                    parseFloat(cart.subtotal || 0) +
                    9.99 +
                    parseFloat(cart.subtotal || 0) * 0.08
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-between">
            <button onClick={() => setStep(0)} className="btn btn-secondary">
              ← Back
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="btn btn-primary btn-lg"
            >
              {placingOrder
                ? <><Spinner size="sm" className="border-white border-t-white/30 mr-2" />Placing order…</>
                : 'Place Order →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Payment ──────────────────────────── */}
      {step === 2 && order && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Payment</h2>
          <p className="text-sm text-gray-500 mb-5">
            Order <span className="font-mono font-semibold text-gray-700">{order.order_number}</span> placed.
            Total: <span className="font-semibold">Rs.{parseFloat(order.total_amount).toFixed(2)}</span>
          </p>

          {!payResult ? (
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Simulate Payment</h3>
              <p className="text-sm text-gray-500 mb-6">
                This is a mock payment system. Choose success or failure to simulate the gateway response.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handlePayment(true)}
                  disabled={processingPay}
                  className="btn btn-primary btn-lg px-8"
                >
                  {processingPay ? <Spinner size="sm" className="border-white border-t-white/30" /> : '✓ Pay Now'}
                </button>
                <button
                  onClick={() => handlePayment(false)}
                  disabled={processingPay}
                  className="btn btn-danger btn-lg px-8"
                >
                  ✕ Decline
                </button>
              </div>
            </div>
          ) : payResult === 'success' ? (
            <div className="card p-10 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">Your order has been confirmed. Thank you for shopping with ShopFlow!</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="btn btn-primary"
                >
                  View Order
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="btn btn-secondary"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-10 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Payment Declined</h3>
              <p className="text-gray-600 mb-6">
                Your order <span className="font-mono font-semibold">{order.order_number}</span> was placed
                but the payment failed. You can retry from your orders page.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="btn btn-primary"
                >
                  View Order
                </button>
                <button onClick={() => setPayResult(null)} className="btn btn-secondary">
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────

function StepIndicator({ steps, current }) {
  return (
    <nav aria-label="Checkout steps" className="flex items-center justify-center gap-0">
      {steps.map((label, i) => {
        const done    = i < current
        const active  = i === current
        const future  = i > current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition
                ${done   ? 'bg-primary-600 text-white' : ''}
                ${active ? 'bg-primary-600 text-white ring-4 ring-primary-100' : ''}
                ${future ? 'bg-gray-100 text-gray-400' : ''}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`mt-1 text-xs font-medium ${active ? 'text-primary-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 sm:w-24 mb-5 mx-1 transition
                ${i < current ? 'bg-primary-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </nav>
  )
}

function AddressCard({ address, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-4 transition
        ${selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-sm font-semibold ${selected ? 'text-primary-700' : 'text-gray-800'}`}>
          {address.label}
        </span>
        {address.is_default && (
          <span className="badge bg-primary-100 text-primary-700 text-xs">Default</span>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-600 leading-relaxed">
        {address.street_line1}
        {address.street_line2 && `, ${address.street_line2}`}
        <br />
        {address.city}, {address.state} {address.postal_code}
      </p>
    </button>
  )
}
