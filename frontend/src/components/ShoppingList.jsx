/**
 * ShoppingList — groups active items by category.
 * Static sections for Phase 2 — collapsible animated sections with
 * count badges come in Phase 7.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import ListItem from './ListItem'

export default function ShoppingList() {
  const items = useAppStore((s) => s.items)
  const isLoadingList = useAppStore((s) => s.isLoadingList)
  const listError = useAppStore((s) => s.listError)
  const loadList = useAppStore((s) => s.loadList)

  useEffect(() => {
    loadList()
  }, [loadList])

  if (isLoadingList) {
    return <p className="text-center text-ink-soft py-8 text-sm">Loading your list…</p>
  }

  if (listError) {
    return <p className="text-center text-red-500 py-8 text-sm">{listError}</p>
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-3xl mb-2">🛒</p>
        <p className="text-ink font-medium text-sm">Your list is empty</p>
        <p className="text-ink-soft text-xs mt-1">Add something by voice or typing above</p>
      </div>
    )
  }

  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'uncategorized'
    acc[cat] = acc[cat] || []
    acc[cat].push(item)
    return acc
  }, {})

  const total = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0)

  return (
    <div className="flex flex-col gap-6">
      {total > 0 && (
        <div className="flex justify-between items-center bg-card border border-border rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-ink">Cart total</span>
          <span className="text-base font-bold text-brand">₹{total.toFixed(2)}</span>
        </div>
      )}

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <section key={category}>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {category} <span className="text-ink-soft">({categoryItems.length})</span>
          </h2>
          <ul className="flex flex-col gap-2">
            <AnimatePresence>
              {categoryItems.map((item) => (
                <motion.div
                  key={item.item_id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.25 }}
                >
                  <ListItem item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}
    </div>
  )
}
