import { useAppStore } from '../store/useAppStore'

export default function Header({ page, setPage, searchQuery, setSearchQuery }) {
  const user = useAppStore((s) => s.user)

  const navItem = (id, label) => (
    <button
      onClick={() => setPage(id)}
      className={`text-sm ${page === id ? 'text-brand font-semibold' : 'text-ink-soft font-medium'} hover:opacity-80`}
    >
      {label}
    </button>
  )

  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
        <button onClick={() => setPage('list')} className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white text-sm font-serif font-bold">
            K
          </div>
          <span className="font-serif text-lg font-semibold text-ink hidden sm:inline">Kirana Voice</span>
        </button>

        <div className="flex-1 flex items-center gap-2 bg-bg border border-border rounded-full px-3 py-1.5">
          <span className="text-ink-soft text-sm">🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search your list or history'
            className="bg-transparent text-sm outline-none w-full text-ink placeholder:text-ink-soft"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-ink-soft text-sm">✕</button>
          )}
        </div>

        <nav className="hidden sm:flex items-center gap-4">
           {navItem('list', 'List')}
           {navItem('profile', 'Account')}
        </nav>

        <button onClick={() => setPage('profile')} className="sm:hidden text-lg" aria-label="Account">
          👤
        </button>

        {user && (
          <span className="hidden md:inline text-xs text-ink-soft">Hi, {user.name.split(' ')[0]}</span>
        )}
      </div>
    </header>
  )
}