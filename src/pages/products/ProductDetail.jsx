
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProduct } from '../../api/products'
import { getProductReviews, createReview } from '../../api/reviews'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import StarRating from '../../components/ui/StarRating'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import Empty from '../../components/ui/Empty'
import PageLoader from '../../components/ui/PageLoader'

// Parse variant attributes safely
function parseAttributes(attributes) {
  if (!attributes) return {}

  if (typeof attributes === 'string') {
    try {
      attributes = JSON.parse(attributes)
    } catch {
      return {}
    }
  }

  if (
    typeof attributes === 'object' &&
    !Array.isArray(attributes)
  ) {
    return attributes
  }

  return {}
}

// Format specification labels
function formatAttributeLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function ProductDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { addItem } = useCart()
  const toast = useToast()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  // Reviews
  const [reviews, setReviews] = useState([])
  const [reviewMeta, setReviewMeta] = useState(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [canReview, setCanReview] = useState(false)

  // Write review
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load product
  useEffect(() => {
    setLoading(true)

    getProduct(slug)
      .then(({ data }) => {
        const p = data.data

        setProduct(p)

        const firstActive = p.variants?.find(
          (v) => v.status === 'active'
        )

        setSelectedVariant(
          firstActive || p.variants?.[0] || null
        )

        setActiveImage(0)
        setQty(1)
      })
      .catch(() => navigate('/products', { replace: true }))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  // Load reviews
  useEffect(() => {
    if (!product?.id) return

    setReviewLoading(true)

    getProductReviews(product.id, {
      page: reviewPage,
      page_size: 5,
    })
      .then(({ data }) => {
        const rows = data.data || []

        setReviews(rows)
        setReviewMeta(data.meta || null)

        if (data.already_reviewed !== undefined) {
          setAlreadyReviewed(data.already_reviewed)
        } else if (user?.id) {
          setAlreadyReviewed(
            rows.some((r) => r.user_id === user.id)
          )
        }

        if (data.can_review !== undefined) {
          setCanReview(data.can_review)
        }
      })
      .catch(() => {})
      .finally(() => setReviewLoading(false))
  }, [product?.id, reviewPage, user?.id])

  // Add to cart
  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Sign in to add items to your cart')

      navigate('/login', {
        state: {
          from: { pathname: `/products/${slug}` },
        },
      })

      return
    }

    if (user.role !== 'customer') {
      toast.info('Only customers can add items to a cart')
      return
    }

    if (!selectedVariant) {
      toast.error('Please select a variant')
      return
    }

    if (qty > availableStock || qty < 1) {
      toast.error('Invalid quantity')
      return
    }

    setAdding(true)

    try {
      await addItem(selectedVariant.id, qty)
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
        'Could not add to cart'
      )
    } finally {
      setAdding(false)
    }
  }

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!newTitle.trim()) {
      toast.error('Please add a title')
      return
    }

    setSubmitting(true)

    try {
      await createReview({
        product_id: product.id,
        rating: newRating,
        title: newTitle,
        body: newBody,
      })

      toast.success('Review submitted!')
      setShowReviewForm(false)
      setAlreadyReviewed(true)

      setNewTitle('')
      setNewBody('')
      setNewRating(5)

      setReviewPage(1)
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
        'Could not submit review'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />
  if (!product) return null

  const price =
    selectedVariant?.price ??
    product.min_price ??
    product.base_price

  const availableStock = Number(
    selectedVariant?.available_stock ??
    product.total_available_stock ??
    0
  )

  const inStock = availableStock > 0
  const rating = parseFloat(product.avg_rating) || 0

  // Always derive specifications from the selected variant
  const specifications = parseAttributes(
    selectedVariant?.attributes
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link
          to="/products"
          className="hover:text-primary-600 transition"
        >
          Products
        </Link>

        <span>›</span>

        <span className="text-gray-400">
          {product.category_name}
        </span>

        <span>›</span>

        <span className="text-gray-700 font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Product Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
            {product.images?.length > 0 ? (
              <img
                src={product.images[activeImage]?.image_url}
                alt={
                  product.images[activeImage]?.alt_text ||
                  product.name
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <svg
                  className="h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            <Badge label={product.status} />
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition
                    ${
                      i === activeImage
                        ? 'border-primary-500'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || ''}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col gap-5">

          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                {product.name}
              </h1>

              <Badge
                label={product.category_name}
                color="blue"
              />
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Sold by{' '}
              <span className="font-medium text-gray-700">
                {product.seller_first_name}{' '}
                {product.seller_last_name}
              </span>
            </p>

            <div className="mt-2">
              <StarRating
                rating={rating}
                count={product.review_count}
                size="md"
              />
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">
              Rs.{parseFloat(price).toFixed(2)}
            </span>

            {product.min_price !== product.max_price && (
              <span className="text-sm text-gray-400">
                – Rs.{parseFloat(product.max_price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variant Selector */}
          {product.variants?.length > 0 && (
            <div>
              <label className="label">
                Variant

                {selectedVariant && (
                  <span className="ml-2 font-normal text-gray-400">
                    — {selectedVariant.variant_name}
                  </span>
                )}
              </label>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const avail =
                    Number(v.available_stock) > 0 &&
                    v.status === 'active'

                  const selected =
                    selectedVariant?.id === v.id

                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        if (!avail) return
                        setSelectedVariant(v)
                        setQty(1)
                      }}
                      disabled={!avail}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition
                        ${
                          selected
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : avail
                              ? 'border-gray-200 text-gray-700 hover:border-primary-300'
                              : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                        }`}
                    >
                      {v.variant_name}

                      <span className="ml-1 text-xs opacity-60">
                        Rs.{parseFloat(v.price).toFixed(2)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2 text-sm">
            {inStock ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-green-700 font-medium">
                  In stock
                </span>
                <span className="text-gray-400">
                  ({availableStock} available)
                </span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-red-600 font-medium">
                  Out of stock
                </span>
              </>
            )}
          </div>

          {/* Quantity and Cart */}
          {inStock && (
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition text-lg leading-none"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[3rem] text-center">
                  {qty}
                </span>

                <button
                  onClick={() =>
                    setQty(Math.min(availableStock, qty + 1))
                  }
                  disabled={qty >= availableStock}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition text-lg leading-none disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant}
                className="btn btn-primary btn-lg flex-1"
              >
                {adding ? (
                  <Spinner
                    size="sm"
                    className="border-white border-t-white/30"
                  />
                ) : (
                  'Add to Cart'
                )}
              </button>
            </div>
          )}

          {/* Variant Specifications */}
          {selectedVariant && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Product Specifications
                </h3>

                <span className="text-xs text-gray-400">
                  {selectedVariant.variant_name}
                </span>
              </div>

              {Object.keys(specifications).length > 0 ? (
                <dl className="divide-y divide-gray-100">
                  {Object.entries(specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <dt className="text-sm text-gray-500 capitalize">
                          {formatAttributeLabel(key)}
                        </dt>

                        <dd className="text-sm font-medium text-gray-900 text-right capitalize">
                          {value !== null &&
                          typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value ?? '—')}
                        </dd>
                      </div>
                    )
                  )}
                </dl>
              ) : (
                <p className="text-sm text-gray-400">
                  No specifications available for this variant.
                </p>
              )}
            </div>
          )}

          {/* SKU */}
          {selectedVariant?.sku && (
            <p className="text-xs text-gray-400">
              SKU: {selectedVariant.sku}
            </p>
          )}
        </div>
      </div>

      {/* Rating Summary */}
      {product.rating_summary &&
        product.rating_summary.total_reviews > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Customer Reviews
            </h2>

            <div className="card p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

                {/* Overall Score */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">
                    {parseFloat(
                      product.rating_summary.avg_rating ||
                      product.avg_rating
                    ).toFixed(1)}
                  </div>

                  <StarRating
                    rating={parseFloat(product.avg_rating)}
                    size="lg"
                  />

                  <p className="text-sm text-gray-400 mt-1">
                    {product.rating_summary.total_reviews} reviews
                  </p>
                </div>

                {/* Rating Breakdown */}
                <div className="flex-1 w-full space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const key =
                      ['', 'one', 'two', 'three', 'four', 'five'][star] +
                      '_star'

                    const count =
                      product.rating_summary[key] || 0

                    const total =
                      product.rating_summary.total_reviews || 1

                    const pct = Math.round(
                      (count / total) * 100
                    )

                    return (
                      <div
                        key={star}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="w-5 text-gray-500 text-right">
                          {star}
                        </span>

                        <svg
                          className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>

                        <div className="flex-1 rounded-full bg-gray-100 h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-yellow-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <span className="w-8 text-gray-400 text-xs">
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

      {/* Write a Review */}
      {user?.role === 'customer' && (
        <div className="mt-4 mb-8">
          {alreadyReviewed ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <span className="text-base">✅</span>
              You've already reviewed this product.
            </div>
          ) : !canReview ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
              <span className="text-base">🛒</span>
              Only customers who have purchased and received this product can leave a review.
            </div>
          ) : !showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn btn-secondary"
            >
              Write a Review
            </button>
          ) : (
            <div className="card p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Write a Review
              </h3>

              <form
                onSubmit={handleSubmitReview}
                className="space-y-4"
              >
                <div>
                  <label className="label">Your rating</label>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating(s)}
                        className={`text-2xl transition ${
                          s <= newRating
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        }`}
                        aria-label={`${s} star`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="label"
                    htmlFor="review-title"
                  >
                    Title
                  </label>

                  <input
                    id="review-title"
                    type="text"
                    className="input"
                    placeholder="Summarise your review"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    className="label"
                    htmlFor="review-body"
                  >
                    Review{' '}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="review-body"
                    className="input min-h-[100px] resize-y"
                    placeholder="Tell others what you think…"
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    {submitting ? (
                      <Spinner
                        size="sm"
                        className="border-white border-t-white/30"
                      />
                    ) : (
                      'Submit'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Review List */}
      <section className="mt-4">
        {!showReviewForm && product.review_count > 0 && (
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {product.review_count}{' '}
            {product.review_count === 1 ? 'Review' : 'Reviews'}
          </h2>
        )}

        {reviewLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : reviews.length === 0 ? (
          product.review_count === 0 && (
            <Empty
              icon="💬"
              title="No reviews yet"
              description="Be the first to review this product"
            />
          )
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}

        <Pagination
          meta={reviewMeta}
          onPageChange={setReviewPage}
        />
      </section>
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <StarRating
              rating={review.rating}
              size="sm"
            />

            <span className="text-sm font-semibold text-gray-800">
              {review.title}
            </span>

            {(review.verified_purchase === true ||
              review.verified_purchase === 1) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                ✓ Verified Purchase
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-0.5">
            <span className="font-medium text-gray-600">
              {review.reviewer_first_name}{' '}
              {review.reviewer_last_name}
            </span>

            {' · '}

            {new Date(review.created_at).toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }
            )}
          </p>
        </div>

        <Badge label={review.status} />
      </div>

      {review.body && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          {review.body}
        </p>
      )}
    </div>
  )
}
