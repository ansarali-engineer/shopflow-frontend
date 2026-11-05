import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTopPerCategory, getCategories } from '../api/products'
import ProductCard from '../components/products/ProductCard'
import Spinner from '../components/ui/Spinner'

const FEATURES = [
  { icon: '🚚', title: 'Free Delivery',    desc: 'On all orders over $50', color: 'bg-blue-50 text-blue-600' },
  { icon: '↩️', title: '30-Day Returns',   desc: 'No questions asked',     color: 'bg-violet-50 text-violet-600' },
  { icon: '🔒', title: 'Secure Payments',  desc: 'SSL encrypted checkout',  color: 'bg-emerald-50 text-emerald-600' },
  { icon: '💬', title: '24/7 Support',     desc: 'We\'re always here',      color: 'bg-amber-50 text-amber-600' },
]

export default function Home() {
  const { user } = useAuth()
  const [featured, setFeatured]           = useState([])
  const [categories, setCategories]       = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getTopPerCategory(),
      getCategories(),
    ]).then(([f, c]) => {
      if (f.status === 'fulfilled') setFeatured((f.value.data.data || []).slice(0, 8))
      if (c.status === 'fulfilled') setCategories((c.value.data.data || []).filter(c => !c.parent_id).slice(0, 6))
    }).finally(() => setFeaturedLoading(false))
  }, [])

  return (
    <div className="bg-surface-muted">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        {/* Blob shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary-500/20 blur-3xl translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-teal/10 blur-3xl -translate-x-1/4 translate-y-1/4" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm
                            border border-white/20 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-white/90">New arrivals every week</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight text-balance">
              Find everything<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-cyan-300">
                you love
              </span>{' '}
              in one place
            </h1>
            <p className="mt-5 text-lg text-primary-200/80 max-w-xl leading-relaxed">
              Thousands of products from trusted sellers. Secure checkout, fast shipping, and hassle-free returns.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products"
                className="btn btn-lg bg-white text-primary-800 hover:bg-primary-50 shadow-soft font-semibold">
                Shop Now
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              {!user && (
                <Link to="/register"
                  className="btn btn-lg border-2 border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm font-semibold">
                  Create Account
                </Link>
              )}
            </div>

            {/* Trust stats */}
            <div className="mt-12 flex flex-wrap gap-8">
              {[
                { value: '10K+', label: 'Products' },
                { value: '2K+',  label: 'Sellers'  },
                { value: '50K+', label: 'Customers' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-sm text-primary-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES STRIP
      ══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map(({ icon, title, desc, color }) => (
            <div key={title} className="card flex items-center gap-3.5 p-4 sm:p-5">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CATEGORY PILLS
      ══════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-sub">Browse our curated collections</p>
            </div>
            <Link to="/products" className="btn-ghost btn-sm text-primary-600 hidden sm:flex">
              All categories →
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group flex items-center gap-2 rounded-2xl border border-gray-200 bg-white
                           px-4 py-3 text-sm font-medium text-gray-700 shadow-card
                           hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700
                           hover:shadow-card-hover transition-all duration-150"
              >
                <span className="h-7 w-7 rounded-xl bg-surface-subtle flex items-center justify-center text-base
                                 group-hover:bg-primary-100 transition-colors">
                  🏷️
                </span>
                {cat.name}
              </Link>
            ))}
            <Link
              to="/products"
              className="flex items-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-transparent
                         px-4 py-3 text-sm font-medium text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-all"
            >
              More →
            </Link>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-sub">Top picks across all categories</p>
          </div>
          <Link to="/products" className="btn-secondary btn-sm hidden sm:flex">
            View all →
          </Link>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="card py-16 text-center">
            <p className="text-4xl mb-3">🛍️</p>
            <p className="text-gray-500 text-sm">Products will appear here once the catalog is populated.</p>
            <Link to="/products" className="btn-primary mt-4 inline-flex">Browse catalog</Link>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/products" className="btn-secondary">View all products →</Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ROLE BANNERS
      ══════════════════════════════════════════════════════ */}
      {user?.role === 'seller' && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14">
          <RoleBanner
            emoji="🏪"
            title="Grow your business on ShopFlow"
            desc="Manage products, track inventory, and reach thousands of customers."
            cta="Go to Seller Dashboard"
            to="/seller/products"
            gradient="from-violet-600 to-primary-600"
          />
        </section>
      )}
      {user?.role === 'admin' && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14">
          <RoleBanner
            emoji="📊"
            title="Platform at a glance"
            desc="Revenue trends, user management, inventory alerts, and live order tracking."
            cta="Open Admin Dashboard"
            to="/admin/analytics"
            gradient="from-gray-800 to-gray-900"
          />
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14 mb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-10 md:p-14 text-center">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
              Ready to start shopping?
            </h2>
            <p className="mt-3 text-primary-200 text-lg max-w-md mx-auto">
              Join over 50,000 happy customers shopping on ShopFlow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link to="/products" className="btn btn-lg bg-white text-primary-800 hover:bg-primary-50 font-semibold shadow-soft">
                Browse Products
              </Link>
              {!user && (
                <Link to="/register" className="btn btn-lg border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 font-semibold">
                  Sign up free
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function RoleBanner({ emoji, title, desc, cta, to, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${gradient} p-8 md:p-10`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl flex-shrink-0">
            {emoji}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-white/70 mt-1 text-sm max-w-sm">{desc}</p>
          </div>
        </div>
        <Link to={to} className="btn btn-lg bg-white text-gray-900 hover:bg-gray-100 whitespace-nowrap font-semibold flex-shrink-0">
          {cta}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-[4/3] skeleton rounded-none" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-5 w-20 rounded mt-3" />
      </div>
    </div>
  )
}
