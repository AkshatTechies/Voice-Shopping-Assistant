import { X, Sparkles, Check, Minus, Plus } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import SuggestionCard from './SuggestionCard'
import { motion, AnimatePresence } from 'framer-motion'

export default function ListItem({ item }) {
  const removeItem = useAppStore((s) => s.removeItem)
  const markPurchased = useAppStore((s) => s.markPurchased)
  const updateItemQuantity = useAppStore((s) => s.updateItemQuantity)
  const loadSuggestions = useAppStore((s) => s.loadSuggestions)
  const suggestions = useAppStore((s) => s.suggestions[item.name])

  const changeQty = (delta) => {
    const next = Math.max(1, (item.quantity || 1) + delta)
    updateItemQuantity(item.item_id, next)
  }

  return (
    <li className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink text-sm truncate">{item.name}</p>
          {item.unit && <p className="text-xs text-ink-soft">{item.unit}</p>}
          {item.price != null && (
            <p className="text-xs text-brand font-semibold">
              ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-bg rounded-lg px-1.5 py-1 shrink-0">
          <button type="button" onClick={() => changeQty(-1)} aria-label="Decrease quantity" className="text-ink-soft">
            <Minus size={14} />
          </button>
          <span className="text-xs font-semibold w-4 text-center text-ink">{item.quantity}</span>
          <button type="button" onClick={() => changeQty(1)} aria-label="Increase quantity" className="text-ink-soft">
            <Plus size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => loadSuggestions(item.name)}
            aria-label={`Find substitutes for ${item.name}`}
            className="text-ink-soft hover:text-accent"
          >
            <Sparkles size={17} />
          </button>
          <button
            type="button"
            onClick={() => markPurchased(item.item_id)}
            aria-label={`Mark ${item.name} purchased`}
            className="text-ink-soft hover:text-brand"
          >
            <Check size={17} />
          </button>
          <button
            type="button"
            onClick={() => removeItem(item.item_id)}
            aria-label={`Remove ${item.name}`}
            className="text-ink-soft hover:text-red-500"
          >
            <X size={17} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {suggestions?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex flex-wrap gap-2 overflow-hidden"
          >
            {suggestions.map((s) => (
              <SuggestionCard key={s.name} label={s.name} reason={s.category} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
