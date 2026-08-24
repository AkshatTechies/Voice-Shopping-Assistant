/**
 * useShoppingList — thin convenience hook over the Zustand store.
 * Fully functional in Phase 2 (list is real, wired to the backend).
 */

import { useAppStore } from '../store/useAppStore'

export function useShoppingList() {
  const items = useAppStore((s) => s.items)
  const isLoading = useAppStore((s) => s.isLoadingList)
  const error = useAppStore((s) => s.listError)
  const loadList = useAppStore((s) => s.loadList)
  const addItem = useAppStore((s) => s.addItem)
  const removeItem = useAppStore((s) => s.removeItem)

  return { items, isLoading, error, loadList, addItem, removeItem }
}
