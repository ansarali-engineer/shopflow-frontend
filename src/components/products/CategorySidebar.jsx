import { useState } from 'react'
import Spinner from '../ui/Spinner'

/**
 * Renders a hierarchical category tree.
 * `categories` is a flat list with { id, name, slug, parent_id, depth }
 *  returned by the recursive CTE endpoint.
 */
export default function CategorySidebar({ categories, selectedId, onSelect, loading }) {
  // Build tree from flat list
  const roots = buildTree(categories || [])

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
      {loading ? (
        <div className="flex justify-center py-4"><Spinner size="sm" /></div>
      ) : (
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => onSelect(null)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm transition
                ${!selectedId
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              All Categories
            </button>
          </li>
          {roots.map((node) => (
            <CategoryNode
              key={node.id}
              node={node}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function CategoryNode({ node, selectedId, onSelect, depth = 0 }) {
  const [open, setOpen] = useState(depth === 0)
  const isSelected = selectedId === node.slug
  const hasChildren = node.children?.length > 0

  return (
    <li>
      <div
        className="flex items-center"
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="p-1 text-gray-400 hover:text-gray-600 mr-0.5 flex-shrink-0"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onSelect(node.slug)}
          className={`flex-1 text-left rounded-lg px-2 py-1.5 text-sm transition
            ${isSelected
              ? 'bg-primary-50 text-primary-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50'}`}
        >
          {node.name}
        </button>
      </div>
      {hasChildren && open && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function buildTree(flatList) {
  const map = {}
  const roots = []
  flatList.forEach((c) => {
    map[c.id] = { ...c, children: [] }
  })
  flatList.forEach((c) => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children.push(map[c.id])
    } else if (!c.parent_id) {
      roots.push(map[c.id])
    }
  })
  return roots
}
