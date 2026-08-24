/**
 * SuggestionCard — placeholder for Phase 6 (/api/suggestions).
 * Not rendered in App.jsx yet — nothing to show until the
 * suggestions engine exists.
 */

export default function SuggestionCard({ reason, label }) {
  return (
    <div className="rounded-lg border border-[#F3DFB8] bg-[#FDF3E7] px-4 py-3 text-sm text-[#8A5E14]">
      <p className="font-medium">{label}</p>
      {reason && <p className="text-[#B8431F]">{reason}</p>}
    </div>
  )
}
