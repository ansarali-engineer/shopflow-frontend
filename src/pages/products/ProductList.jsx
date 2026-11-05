import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../../api/products'
import ProductCard from '../../components/products/ProductCard'
import CategorySidebar from '../../components/products/CategorySidebar'
import ProductFilters from '../../components/products/ProductFilters'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import Empty from '../../components/ui/Empty'

const PAGE_SIZE = 12

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive state from URL params for shareable/bookmarkable URLs
  const page         = parseInt(searchParams.get('page') || '1', 10)
  const search       = searchParams.get('search') || ''
  const categorySlug = searchParams.get('category') || null
  const sort         = searchParams.get('sort') || undefined
  const minPrice     = searchParams.get('min_price') || undefined
  const maxPrice     = searchParams.get('max_price') || undefined
  const minRating    = searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')) : undefined
  const inStock      = searchParams.get('in_stock') === 'true' || undefined

  const [products, setProducts]   = useState([])
  const [meta, setMeta]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Resolve slug → numeric id AFTER categories state is declared
  const categoryId = categorySlug
    ? (categories.find((c) => c.slug === categorySlug)?.id ?? null)
    : null

  // Load categories once
  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {})
      .finally(() => setCatLoading(false))
  }, [])

  // Load products whenever URL params change
  useEffect(() => {
    setLoading(true)
    const params = {
      page,
      page_size: PAGE_SIZE,
      ...(search       && { search }),
      ...(categoryId   && { category_id: categoryId }),
      ...(sort         && { sort }),
      ...(minPrice     && { min_price: minPrice }),
      ...(maxPrice     && { max_price: maxPrice }),
      ...(minRating    && { min_rating: minRating }),
      ...(inStock      && { in_stock: 'true' }),
    }
    getProducts(params)
      .then(({ data }) => {
        setProducts(data.data || [])
        setMeta(data.meta || null)
      })
      .catch(() => {
        setProducts([])
        setMeta(null)
      })
      .finally(() => setLoading(false))
  }, [page, search, categorySlug, categories, sort, minPrice, maxPrice, minRating, inStock])

  // ── Helpers to update URL ────────────────────────────────
  const setParam = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') {
          next.delete(k)
        } else {
          next.set(k, String(v))
        }
      })
      next.set('page', '1')
      return next
    })
  }, [setSearchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    setParam({ search: searchInput })
  }

  const handleCategory = (slug) => {
    setParam({ category: slug })
  }

  const handleFilters = (f) => {
    setParam({
      sort:      f.sort,
      min_price: f.minPrice,
      max_price: f.maxPrice,
      min_rating: f.minRating,
      in_stock:  f.inStock ? 'true' : undefined,
    })
  }

  const handlePage = (p) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filters = { sort, minPrice, maxPrice, minRating, inStock }
  const activeFilterCount = [sort, minPrice, maxPrice, minRating, inStock].filter(Boolean).length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title">Products</h1>
        {meta && (
          <p className="section-sub">
            {meta.total.toLocaleString()} {meta.total === 1 ? 'product' : 'products'} found
          </p>
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            className="input pl-10"
            placeholder="Search products, brands, categories…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary px-5">
          Search
        </button>
        {/* Mobile filter toggle */}
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="btn-secondary lg:hidden relative"
          aria-label="Toggle filters"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center
                             rounded-full bg-primary-600 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      {/* Active filter chips */}
      {(search || categoryId || activeFilterCount > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {search && (
            <Chip label={`"${search}"`} onRemove={() => { setSearchInput(''); setParam({ search: undefined }) }} />
          )}
          {categorySlug && (
            <Chip
              label={categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
              onRemove={() => handleCategory(null)}
            />
          )}
          {sort && <Chip label={`Sort: ${sort}`} onRemove={() => setParam({ sort: undefined })} />}
          {minPrice && <Chip label={`Min Rs.${minPrice}`} onRemove={() => setParam({ min_price: undefined })} />}
          {maxPrice && <Chip label={`Max Rs.${maxPrice}`} onRemove={() => setParam({ max_price: undefined })} />}
          {minRating && <Chip label={`${minRating}★+`} onRemove={() => setParam({ min_rating: undefined })} />}
          {inStock && <Chip label="In stock" onRemove={() => setParam({ in_stock: undefined })} />}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
          <CategorySidebar
            categories={categories}
            selectedId={categorySlug}
            onSelect={handleCategory}
            loading={catLoading}
          />
          <ProductFilters filters={filters} onChange={handleFilters} />
        </aside>

        {/* Mobile filters drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CategorySidebar
                categories={categories}
                selectedId={categoryId}
                onSelect={(id) => { handleCategory(id); setFiltersOpen(false) }}
                loading={catLoading}
              />
              <ProductFilters
                filters={filters}
                onChange={(f) => { handleFilters(f); setFiltersOpen(false) }}
              />
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <Empty
              icon="🔍"
              title="No products found"
              description="Try adjusting your search or filters"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <Pagination meta={meta} onPageChange={handlePage} />
        </div>
      </div>
    </div>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1
                     text-xs font-medium text-primary-700 border border-primary-100">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 text-primary-500 hover:text-primary-700"
        aria-label={`Remove filter ${label}`}
      >
        ×
      </button>
    </span>
  )
}
