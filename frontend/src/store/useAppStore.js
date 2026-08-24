import { create } from 'zustand'
import {
  fetchList, addItem, removeItem, modifyItem,
  fetchSuggestions, searchItems, fetchRestockSuggestions,
  signup, login, logout, getStoredUser,
  fetchCatalog,
} from '../api/client'

export const useAppStore = create((set, get) => ({
  // ---- Auth ----
  user: getStoredUser(),
  authError: null,
  authLoading: false,

  signup: async (payload) => {
    set({ authLoading: true, authError: null })
    try {
      const user = await signup(payload)
      set({ user, authLoading: false })
      get().loadList()
      get().loadRestockSuggestions()
    } catch (err) {
      set({ authError: err.message, authLoading: false })
    }
  },

  login: async (payload) => {
    set({ authLoading: true, authError: null })
    try {
      const user = await login(payload)
      set({ user, authLoading: false })
      get().loadList()
      get().loadRestockSuggestions()
    } catch (err) {
      set({ authError: err.message, authLoading: false })
    }
  },

  logout: () => {
    logout()
    set({ user: null, items: [], searchResults: null, restockSuggestions: [], suggestions: {} })
  },

  // ---- Shopping list ----
  items: [],
  isLoadingList: false,
  listError: null,

  transcript: '',
  language: 'en',
  micState: 'idle',

  setTranscript: (transcript, language) => set({ transcript, language }),

  loadList: async () => {
    const userId = get().user?.user_id
    if (!userId) return
    set({ isLoadingList: true, listError: null })
    try {
      const items = await fetchList(userId)
      set({ items, isLoadingList: false })
    } catch (err) {
      set({ listError: 'Could not load your list. Is the backend running?', isLoadingList: false })
    }
  },

  addItem: async (name, quantity = 1, unit = null) => {
    const userId = get().user?.user_id
    if (!name?.trim() || !userId) return
    try {
      await addItem({ item: name.trim(), quantity, unit, userId })
      await get().loadList()
    } catch (err) {
      set({ listError: 'Could not add that item.' })
    }
  },

  removeItem: async (itemId) => {
    const userId = get().user?.user_id
    try {
      await removeItem({ itemId, userId })
      set({ items: get().items.filter((i) => i.item_id !== itemId) })
    } catch (err) {
      set({ listError: 'Could not remove that item.' })
    }
  },

  updateItemQuantity: async (itemId, quantity) => {
    const userId = get().user?.user_id
    try {
      await modifyItem({ itemId, userId, quantity })
      await get().loadList()
    } catch (err) {
      set({ listError: 'Could not update that item.' })
    }
  },

  markPurchased: async (itemId) => {
    // Backend only supports active/removed via /api/list today, so
    // "mark purchased" removes it from the active list — closest
    // available behavior without a backend schema change.
    const userId = get().user?.user_id
    try {
      await removeItem({ itemId, userId })
      set({ items: get().items.filter((i) => i.item_id !== itemId) })
    } catch (err) {
      set({ listError: 'Could not mark that item purchased.' })
    }
  },

  suggestions: {},
  loadSuggestions: async (itemName) => {
    try {
      const subs = await fetchSuggestions(itemName)
      set({ suggestions: { ...get().suggestions, [itemName]: subs } })
    } catch (err) {
      set({ listError: 'Could not fetch suggestions.' })
    }
  },
  clearSuggestions: (itemName) => {
    const next = { ...get().suggestions }
    delete next[itemName]
    set({ suggestions: next })
  },

  searchResults: null,
  searchQuery: '',
  runSearch: async (query) => {
    set({ searchQuery: query })
    if (!query?.trim()) { set({ searchResults: null }); return }
    try {
      const results = await searchItems(query)
      set({ searchResults: results })
    } catch (err) {
      set({ listError: 'Search failed.' })
    }
  },

  restockSuggestions: [],
  loadRestockSuggestions: async () => {
    const userId = get().user?.user_id
    if (!userId) return
    try {
      const suggestions = await fetchRestockSuggestions(userId)
      set({ restockSuggestions: suggestions })
    } catch (err) {
      set({ listError: 'Could not load restock suggestions.' })
    }
  },

  // ---- Catalog ----
  catalog: [],
  isLoadingCatalog: false,
  loadCatalog: async (query) => {
    set({ isLoadingCatalog: true })
    try {
      const catalog = await fetchCatalog(query)
      set({ catalog, isLoadingCatalog: false })
    } catch (err) {
      set({ listError: 'Could not load the catalog.', isLoadingCatalog: false })
    }
  },
}))