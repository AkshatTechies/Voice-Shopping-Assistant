/**
 * CartPage — dedicated "Your Cart" screen, reached from the
 * sticky View Cart bar on the main page. Reuses ListItem for
 * quantity/remove/substitute controls; adds a colored category
 * dot and a fixed Place Order bar at the bottom.
 */
import { useAppStore } from '../store/useAppStore'
import ListItem from './ListItem'

const CATEGORY_DOTS = {
  Bakery: 'bg-amber-500',
  Dairy: 'bg-sky-500',
  Produce: 'bg-emerald-500',
  Snacks: 'bg-orange-500',
  Beverages: 'bg-purple-500',
  Household: 'bg-slate-500',
  Staples: 'bg-yellow-600',
}
const getDot = (category) => CATEGORY_DOTS[category] || 'bg-brand'

export default function CartPage({ onBack }) {
  const items = useAppStore((s) => s.items)

  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'uncategorized'
    acc[cat] = acc[cat] || []
    acc[cat].push(item)
    return acc
  }, {})

  const total = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0)

  const handlePlaceOrder = () => {
    // TODO: wire this to your real checkout/order endpoint once it exists
    alert('Order placed! (hook this up to your checkout API)')
  }

  return (
    <div className="min-h-screen bg-bg font-sans pb-28">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button type="button" onClick={onBack} className="text-sm text-ink-soft mb-4">
          ← Back
        </button>
        <h1 className="font-serif text-2xl font-semibold text-ink">Your Cart</h1>
        <p className="text-sm text-ink-soft mt-1">Review your list before placing the order.</p>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-2">🛒</p>
            <p className="text-ink font-medium text-sm">Your cart is empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 mt-6">
            {Object.entries(grouped).map(([category, categoryItems]) => (
              <section key={category} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${getDot(category)}`} />
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    {category}
                  </h2>
                </div>
                <ul className="flex flex-col gap-2">
                  {categoryItems.map((item) => (
                    <ListItem key={item.item_id} item={item} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-4">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-soft">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              <span className="font-bold text-ink">₹{total.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="w-full bg-brand text-white font-semibold rounded-full py-3 text-sm"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}