import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import Spinner from '../../components/ui/Spinner'
import Empty from '../../components/ui/Empty'
import { useState } from 'react'

export default function Cart() {
  const { cart, cartLoading, updateItem, removeItem, emptyCart } = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const [removingId, setRemovingId] = useState(null)
  const [clearing, setClearing] = useState(false)

  const handleQty = async (variantId, qty) => {
    try {
      await updateItem(variantId, qty)
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not update item')
    }
  }

  const handleRemove = async (variantId) => {
    setRemovingId(variantId)
    try {
      await removeItem(variantId)
      toast.success('Item removed')
    } catch {
      toast.error('Could not remove item')
    } finally {
      setRemovingId(null)
    }
  }

  const handleClear = async () => {
    setClearing(true)
    try {
      await emptyCart()
      toast.info('Cart cleared')
    } catch {
      toast.error('Could not clear cart')
    } finally {
      setClearing(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        {cart.items?.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="btn btn-secondary btn-sm text-red-500 hover:bg-red-50"
          >
            {clearing ? <Spinner size="sm" /> : 'Clear cart'}
          </button>
        )}
      </div>

      {!cart.items?.length ? (
        <Empty
          icon="🛒"
          title="Your cart is empty"
          description="Start adding products to see them here"
        >
          <Link to="/products" className="btn btn-primary mt-4">Browse Products</Link>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <CartItem
                key={item.variant_id}
                item={item}
                onQtyChange={handleQty}
                onRemove={handleRemove}
                removing={removingId === item.variant_id}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.item_count} {cart.item_count === 1 ? 'item' : 'items'})</span>
                  <span>Rs.{parseFloat(cart.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-gray-400">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="text-gray-400">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-semibold text-gray-900 text-base">
                  <span>Estimated total</span>
                  <span>Rs.{parseFloat(cart.subtotal || 0).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-primary w-full btn-lg mt-6"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block text-center text-sm text-primary-600 hover:underline mt-3"
              >
                ← Continue shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CartItem({ item, onQtyChange, onRemove, removing }) {
  const available = item.available_stock ?? 99
  const lineTotal = (parseFloat(item.unit_price) * item.quantity).toFixed(2)

  return (
    <div className="card p-4 flex gap-4">
      {/* Image */}
      <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {item.image_url ? (
          <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 text-2xl">📦</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.product_slug || item.product_id}`}
          className="font-semibold text-gray-900 hover:text-primary-600 transition text-sm line-clamp-1"
        >
          {item.product_name}
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">{item.variant_name}</p>
        <p className="text-xs text-gray-400">SKU: {item.sku}</p>

        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          {/* Qty stepper */}
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => onQtyChange(item.variant_id, item.quantity - 1)}
              className="px-2.5 py-1 text-gray-500 hover:bg-gray-50 text-base leading-none"
              aria-label="Decrease"
            >−</button>
            <span className="px-3 py-1 text-sm font-semibold min-w-[2.5rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item.variant_id, item.quantity + 1)}
              disabled={item.quantity >= available}
              className="px-2.5 py-1 text-gray-500 hover:bg-gray-50 text-base leading-none disabled:opacity-40"
              aria-label="Increase"
            >+</button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-900">Rs.{lineTotal}</span>
            <button
              onClick={() => onRemove(item.variant_id)}
              disabled={removing}
              className="text-gray-400 hover:text-red-500 transition"
              aria-label="Remove item"
            >
              {removing
                ? <Spinner size="sm" />
                : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
