import { useEffect, useState } from 'react'
import Header from './components/Header'
import MicButton from './components/MicButton'
import ErrorToast from './components/ErrorToast'
import SuggestionCard from './components/SuggestionCard'
import AuthScreen from './components/AuthScreen'
import ProfilePage from './components/ProfilePage'
import Catalog from './components/Catalog'
import CartPage from './components/CartPage'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const user = useAppStore((s) => s.user)
  const listError = useAppStore((s) => s.listError)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const runSearch = useAppStore((s) => s.runSearch)
  const searchResults = useAppStore((s) => s.searchResults)
  const restockSuggestions = useAppStore((s) => s.restockSuggestions)
  const loadRestockSuggestions = useAppStore((s) => s.loadRestockSuggestions)
  const loadList = useAppStore((s) => s.loadList)
  const addItem = useAppStore((s) => s.addItem)
  const items = useAppStore((s) => s.items)

  const [page, setPage] = useState('list')
  const [manualItem, setManualItem] = useState('')

  useEffect(() => {
    if (user) {
      loadRestockSuggestions()
      loadList()
    }
  }, [user])

  if (!user) {
    return <AuthScreen />
  }

  const handleManualAdd = (e) => {
    e.preventDefault()
    if (!manualItem.trim()) return
    addItem(manualItem.trim())
    setManualItem('')
  }

  if (page === 'cart') {
    return <CartPage onBack={() => setPage('list')} />
  }

  const cartTotal = items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0)

  return (
    <div className="min-h-screen bg-bg font-sans">
      <Header page={page} setPage={setPage} searchQuery={searchQuery} setSearchQuery={runSearch} />

      {page === 'profile' ? (
        <ProfilePage />
      ) : (
        <div className={items.length > 0 ? 'pb-24' : ''}>
          <div className="bg-brand text-white">
            <div className="max-w-3xl mx-auto px-4 py-8">
              <p className="text-xs font-medium tracking-wide uppercase mb-2 text-[#BFE0CE]">
                Voice shopping list
              </p>
              <h1 className="font-serif text-2xl md:text-3xl font-semibold leading-tight max-w-md">
                Just say it. We'll add it.
              </h1>
              <p className="text-sm mt-2 max-w-sm text-[#CFE3D7]">
                Tap the mic and speak naturally — "add two milk and a bread" — and your list fills itself.
              </p>
            </div>
          </div>

          <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
            {searchQuery.trim() && searchResults && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Results for "{searchQuery}"
                </p>
                {searchResults.list_matches?.map((m) => (
                  <div key={m.item_id} className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-ink">
                    {m.name} — <span className="text-ink-soft">{m.status}</span>
                  </div>
                ))}
                {searchResults.history_matches?.map((h, i) => (
                  <div key={i} className="rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-ink-soft">
                    {h.item_name} (purchased before)
                  </div>
                ))}
                {!searchResults.list_matches?.length && !searchResults.history_matches?.length && (
                  <p className="text-sm text-ink-soft">No matches — try adding it instead.</p>
                )}
              </div>
            )}

            {restockSuggestions.length > 0 && (
              <div className="flex flex-col gap-2">
                {restockSuggestions.map((r) => (
                  <SuggestionCard key={r.item_name} label={`Restock: ${r.item_name}`} reason="You may be running low" />
                ))}
              </div>
            )}

            <div className="flex flex-col items-center gap-4 bg-card border border-border rounded-2xl py-6">
              <MicButton />
              <form onSubmit={handleManualAdd} className="w-full max-w-xs flex gap-2 px-4">
                <input
                  value={manualItem}
                  onChange={(e) => setManualItem(e.target.value)}
                  placeholder="Or type an item to add…"
                  className="flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  className="text-xs font-semibold text-white bg-brand rounded-full px-4 py-2 shrink-0"
                >
                  Add
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-serif text-lg font-semibold text-ink">Browse catalog</h2>
              <Catalog />
            </div>
          </main>

          {items.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={() => setPage('cart')}
                className="max-w-3xl mx-auto w-full flex justify-between items-center bg-brand text-white rounded-full px-5 py-3"
              >
                <span className="text-sm font-medium">
                  View Cart · {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
                <span className="text-sm font-bold">₹{cartTotal.toFixed(2)}</span>
              </button>
            </div>
          )}
        </div>
      )}

      <ErrorToast message={listError} />
    </div>
  )
}