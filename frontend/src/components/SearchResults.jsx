/**
 * SearchResults — placeholder for Phase 5 (/api/search).
 * Not rendered in App.jsx yet.
 */

export default function SearchResults({ results = [] }) {
  if (results.length === 0) return null
  return (
    <ul className="flex flex-col gap-2">
      {results.map((r) => (
        <li key={r.name} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <p className="font-medium">{r.name}</p>
          <p className="text-sm text-slate-500">{r.brand} — ${r.price}</p>
        </li>
      ))}
    </ul>
  )
}
