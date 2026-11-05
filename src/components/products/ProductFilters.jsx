/**
 * ProductFilters — price range, rating, in-stock, sort controls
 * rendered above the product grid on small screens,
 * or inside the sidebar on desktop.
 */
export default function ProductFilters({ filters, onChange }) {
  const { minPrice, maxPrice, minRating, inStock, sort } = filters

  const update = (key, value) => onChange({ ...filters, [key]: value })

  const sortOptions = [
    { value: 'newest',      label: 'Newest' },
    { value: 'price_asc',   label: 'Price: Low → High' },
    { value: 'price_desc',  label: 'Price: High → Low' },
    { value: 'rating_desc', label: 'Top Rated' },
    { value: 'popularity',  label: 'Most Reviewed' },
    { value: 'name_asc',    label: 'Name A–Z' },
  ]

  return (
    <div className="card p-4 space-y-5">
      {/* Sort */}
      <div>
        <label className="label">Sort by</label>
        <select
          className="input"
          value={sort || ''}
          onChange={(e) => update('sort', e.target.value || undefined)}
        >
          <option value="">Default</option>
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="label">Price range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            className="input w-full"
            value={minPrice || ''}
            onChange={(e) => update('minPrice', e.target.value || undefined)}
          />
          <span className="text-gray-400 flex-shrink-0">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            className="input w-full"
            value={maxPrice || ''}
            onChange={(e) => update('maxPrice', e.target.value || undefined)}
          />
        </div>
      </div>

      {/* Min rating */}
      <div>
        <label className="label">Minimum rating</label>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((r) => (
            <button
              key={r}
              onClick={() => update('minRating', r === 0 ? undefined : r)}
              className={`flex-1 rounded-lg border py-1 text-sm font-medium transition
                ${(minRating ?? 0) === r
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {r === 0 ? 'Any' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* In stock */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!inStock}
            onChange={(e) => update('inStock', e.target.checked || undefined)}
          />
          <div className="h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-primary-600 transition" />
          <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition
                          peer-checked:translate-x-4" />
        </div>
        <span className="text-sm text-gray-700">In stock only</span>
      </label>

      {/* Clear */}
      <button
        onClick={() => onChange({ sort: undefined, minPrice: undefined, maxPrice: undefined, minRating: undefined, inStock: undefined })}
        className="btn btn-secondary w-full btn-sm"
      >
        Clear filters
      </button>
    </div>
  )
}
