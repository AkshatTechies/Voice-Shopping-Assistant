/**
 * Catalog — browse all products in the store catalog, each with a
 * price, and add any of them straight to the shopping list/cart.
 * Uses the same addItem() action the mic and manual-add input use,
 * so the backend's price lookup in /api/list applies here too.
 *
 * Now supports category filter chips (All / Bakery / Dairy / ...)
 * and a per-category emoji icon on each card until real product
 * images are added.
 */
import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

const CATEGORY_ICONS = {
  Bakery: '🍞',
  Dairy: '🥛',
  Produce: '🥦',
  Snacks: '🍿',
  Beverages: '🧃',
  Household: '🧽',
  Staples: '🌾',
}
const getIcon = (category) => CATEGORY_ICONS[category] || '🛒'

export default function Catalog() {
  const catalog = useAppStore((s) => s.catalog)
  const isLoadingCatalog = useAppStore((s) => s.isLoadingCatalog)
  const loadCatalog = useAppStore((s) => s.loadCatalog)
  const addItem = useAppStore((s) => s.addItem)

  const [query, setQuery] = useState('')
  const [addedItem, setAddedItem] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    loadCatalog()
  }, [loadCatalog])

  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)
    loadCatalog(value)
  }

  const handleAdd = (product) => {
    addItem(product.name)
    setAddedItem(product.product_id)
    setTimeout(() => setAddedItem(null), 1200)
  }

  const categories = ['All', ...new Set(catalog.map((p) => p.category).filter(Boolean))]
  const visibleCatalog =
    selectedCategory === 'All' ? catalog : catalog.filter((p) => p.category === selectedCategory)

  return (
    <div className="flex flex-col gap-4">
      <input
        value={query}
        onChange={handleSearch}
        placeholder="Search the catalog…"
        className="w-full rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-brand bg-card"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              selectedCategory === cat
                ? 'bg-brand text-white border-brand'
                : 'bg-card text-ink-soft border-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoadingCatalog && (
        <p className="text-center text-ink-soft py-8 text-sm">Loading catalog…</p>
      )}

      {!isLoadingCatalog && visibleCatalog.length === 0 && (
        <p className="text-center text-ink-soft py-8 text-sm">No products found.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleCatalog.map((p) => (
          <div
            key={p.product_id}
            className="rounded-xl border border-border bg-card p-3 flex flex-col gap-1"
          >
            <span className="text-2xl">{getIcon(p.category)}</span>
            <p className="font-medium text-sm text-ink truncate">{p.name}</p>
            <p className="text-xs text-ink-soft">{p.category}</p>
            <p className="text-sm font-semibold text-brand">
              {p.price != null ? `₹${p.price.toFixed(2)}` : '—'}
            </p>
            <button
              type="button"
              onClick={() => handleAdd(p)}
              className="mt-1 text-xs font-semibold text-white bg-brand rounded-full px-3 py-1.5 transition-opacity"
            >
              {addedItem === p.product_id ? 'Added ✓' : 'Add to cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}