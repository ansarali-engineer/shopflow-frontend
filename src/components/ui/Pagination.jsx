export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total_pages <= 1) return null
  const { page, total_pages, has_prev, has_next } = meta

  const pages = []
  for (let i = 1; i <= total_pages; i++) {
    if (i === 1 || i === total_pages || Math.abs(i - page) <= 2) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!has_prev}
        className="btn btn-secondary btn-sm disabled:opacity-40"
        aria-label="Previous page"
      >
        ‹ Prev
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`btn btn-sm w-9 ${
              p === page
                ? 'bg-primary-600 text-white'
                : 'btn-secondary'
            }`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!has_next}
        className="btn btn-secondary btn-sm disabled:opacity-40"
        aria-label="Next page"
      >
        Next ›
      </button>
    </nav>
  )
}
