import { Link } from 'react-router-dom'
import StarRating from '../ui/StarRating'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useState } from 'react'

/**
 * ProductCard
 *
 * Defensive field mapping — works with responses from:
 *   - /products/          (id, name, min_price, available_stock, image_url, …)
 *   - /products/top-per-category/  (id, name, min_price, available_stock, image_url, …)
 *
 * Both now return the full field set after the backend fix to
 * get_top_products_per_category().
 */
export default function ProductCard({ product }) {
  const { user } = useAuth()
  const toast    = useToast()
  const [wishlist, setWishlist] = useState(false)

  // ── Normalise fields ────────────────────────────────────
  const id       = product.id        // always 'id' after backend fix
  const name     = product.name      // always 'name'  after backend fix

  // Price: prefer computed min_price from variants, fall back to base_price
  const rawMin   = product.min_price   ?? product.base_price ?? null
  const rawMax   = product.max_price   ?? product.base_price ?? null
  const price    = rawMin !== null ? parseFloat(rawMin)  : null
  const maxPrice = rawMax !== null ? parseFloat(rawMax)  : null

  // Stock: prefer variant aggregate, fall back to nothing → show "Check availability"
  const stockVal     = product.available_stock ?? product.total_available_stock
  const stockNum     = stockVal !== null && stockVal !== undefined ? parseInt(stockVal, 10) : null
  const inStock      = stockNum !== null ? stockNum > 0 : null   // null = unknown

  const hasSale      = price !== null && maxPrice !== null && price < maxPrice
  const rating       = parseFloat(product.avg_rating)  || 0
  const reviewCount  = parseInt(product.review_count, 10) || 0
  const imageUrl     = product.image_url || null

  // ── Handlers ────────────────────────────────────────────
  const handleWishlist = (e) => {
    e.preventDefault()
    if (!user) { toast.info('Sign in to save items'); return }
    setWishlist(!wishlist)
    toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (!user) { toast.info('Sign in to add to cart'); return }
    window.location.href = `/products/${product.slug}`
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group card-hover flex flex-col overflow-hidden focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-primary-400 bg-white"
    >
      {/* ── Image area ─────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-subtle">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <PlaceholderImage name={name} />
        )}

        {/* Dark gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Out-of-stock overlay — only when we KNOW it's out of stock */}
        {inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
            <span className="rounded-full bg-gray-900/85 text-white text-xs font-semibold px-3.5 py-1.5 shadow-sm">
              Out of stock
            </span>
          </div>
        )}

        {/* ── Top-left badges ────────────────────────── */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
          {product.category_name && (
            <span className="badge bg-white/95 text-gray-600 shadow-sm text-[10px] backdrop-blur-sm font-medium">
              {product.category_name}
            </span>
          )}
          {hasSale && (
            <span className="badge bg-red-500 text-white text-[10px] font-bold tracking-wide">
              SALE
            </span>
          )}
        </div>

        {/* ── Wishlist button ────────────────────────── */}
        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm
                     shadow-md flex items-center justify-center transition-all duration-150
                     opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95
                     focus-visible:opacity-100 focus-visible:outline-none"
          aria-label={wishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <svg
            className={`h-4 w-4 transition-colors duration-150 ${
              wishlist ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
            viewBox="0 0 24 24"
            fill={wishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* ── Quick-add CTA (slides up on hover) ────── */}
        {user?.role === 'customer' && inStock !== false && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 inset-x-3 btn btn-sm bg-white/95 text-gray-900
                       shadow-lg backdrop-blur-sm font-semibold
                       opacity-0 translate-y-2
                       group-hover:opacity-100 group-hover:translate-y-0
                       transition-all duration-200 ease-out"
          >
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            Add to Cart
          </button>
        )}
      </div>

      {/* ── Text content ───────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4 gap-2">
        {/* Seller */}
        {(product.seller_first_name || product.seller_last_name) && (
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide truncate leading-none">
            {product.seller_first_name} {product.seller_last_name}
          </p>
        )}

        {/* Product name */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2
                       group-hover:text-primary-700 transition-colors duration-150 flex-1">
          {name}
        </h3>

        {/* Rating */}
        {reviewCount > 0 && (
          <StarRating rating={rating} count={reviewCount} size="sm" />
        )}

        {/* Price + stock status */}
        <div className="mt-auto pt-1 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
            {price !== null ? (
              <>
                <span className={hasSale ? 'price-sale text-base' : 'price text-base'}>
                  Rs.{price.toFixed(2)}
                </span>
                {hasSale && (
                  <span className="price-orig">Rs.{maxPrice.toFixed(2)}</span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-400 italic">Price unavailable</span>
            )}
          </div>

          {/* Stock indicator */}
          {inStock === true && (
            <span className="badge bg-emerald-50 text-emerald-700 text-[10px] flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block mr-1" />
              In stock
            </span>
          )}
          {inStock === false && (
            <span className="badge bg-gray-100 text-gray-500 text-[10px] flex-shrink-0">
              Sold out
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

/* ── Placeholder image with product-name initial ──────── */
function PlaceholderImage({ name }) {
  const COLORS = [
    ['bg-blue-50',    'text-blue-400'],
    ['bg-violet-50',  'text-violet-400'],
    ['bg-emerald-50', 'text-emerald-400'],
    ['bg-amber-50',   'text-amber-400'],
    ['bg-rose-50',    'text-rose-400'],
    ['bg-cyan-50',    'text-cyan-400'],
  ]
  const [bg, text] = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]

  return (
    <div className={`flex h-full w-full items-center justify-center ${bg}`}>
      <div className="text-center select-none">
        <span className={`text-5xl font-bold ${text} opacity-40`}>
          {name?.[0]?.toUpperCase() || '?'}
        </span>
        <svg className={`h-6 w-6 mx-auto mt-2 ${text} opacity-25`} fill="none"
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>
    </div>
  )
}
