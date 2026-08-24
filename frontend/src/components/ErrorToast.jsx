/**
 * ErrorToast — placeholder for Phase 8 (proper loading/error states).
 * ShoppingList currently renders its own inline error text for Phase 2;
 * this becomes the real toast/shake pattern from Section 6 later.
 */

export default function ErrorToast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-brand-dark px-4 py-2.5 text-sm text-white shadow-lg z-30">
      {message}
    </div>
  )
}
