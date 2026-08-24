/**
 * TranscriptDisplay — placeholder for Phase 2.
 * Character-by-character type-in animation is a Phase 7 concern.
 * Not wired into App.jsx yet since there's no live transcript to show
 * until Phase 3 (Whisper) exists.
 */

export default function TranscriptDisplay({ text }) {
  if (!text) return null
  return <p className="text-center text-ink italic">"{text}"</p>
}
