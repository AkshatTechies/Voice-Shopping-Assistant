/**
 * Thin axios wrapper around the backend API.
 */

import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // proxied to http://127.0.0.1:8000/api by vite.config.js in dev
})

const TOKEN_KEY = 'kv_token'
const USER_KEY = 'kv_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Attach the bearer token to every request once logged in.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function authErrorMessage(err, fallback) {
  return err.response?.data?.error?.message || err.response?.data?.detail || fallback
}

// ---- Auth ----

export async function signup({ name, email, password, phone }) {
  try {
    const { data } = await api.post('/auth/signup', { name, email, password, phone })
    saveSession(data.token, data.user)
    return data.user
  } catch (err) {
    throw new Error(authErrorMessage(err, 'Could not create your account'))
  }
}

export async function login({ email, password }) {
  try {
    const { data } = await api.post('/auth/login', { email, password })
    saveSession(data.token, data.user)
    return data.user
  } catch (err) {
    throw new Error(authErrorMessage(err, 'Incorrect email or password'))
  }
}

export function logout() {
  clearSession()
}

// ---- Profile ----

export async function fetchProfile() {
  const { data } = await api.get('/profile')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/profile', payload)
  return data
}

export async function fetchAddresses() {
  const { data } = await api.get('/profile/addresses')
  return data
}

export async function addAddress(payload) {
  const { data } = await api.post('/profile/addresses', payload)
  return data
}

export async function deleteAddress(addressId) {
  await api.delete(`/profile/addresses/${addressId}`)
}

export async function fetchPaymentMethods() {
  const { data } = await api.get('/profile/payment-methods')
  return data
}

export async function addPaymentMethod(payload) {
  const { data } = await api.post('/profile/payment-methods', payload)
  return data
}

export async function deletePaymentMethod(paymentId) {
  await api.delete(`/profile/payment-methods/${paymentId}`)
}

// ---- Shopping list (scoped to the logged-in user) ----

export async function fetchList(userId) {
  const { data } = await api.get('/list', { params: { user_id: userId } })
  return data.items
}

export async function addItem({ item, quantity = 1, unit = null, userId }) {
  const { data } = await api.post('/list', {
    user_id: userId,
    action: 'add',
    item,
    quantity,
    unit,
  })
  return data.item
}

export async function removeItem({ itemId, userId }) {
  const { data } = await api.post('/list', {
    user_id: userId,
    action: 'remove',
    item_id: itemId,
    item: '',
  })
  return data.item
}

export async function modifyItem({ itemId, userId, quantity, unit }) {
  const { data } = await api.post('/list', {
    user_id: userId,
    action: 'modify',
    item_id: itemId,
    item: '',
    quantity,
    unit,
  })
  return data.item
}

export async function uploadAudio(blob) {
  const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm'
  const formData = new FormData()
  formData.append('audio', blob, `recording.${ext}`)
  try {
    const { data } = await api.post('/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data // { transcript, language }
  } catch (err) {
    throw new Error(authErrorMessage(err, 'Could not process audio, please try again'))
  }
}

export async function parseCommand(text, userId) {
  try {
    const { data } = await api.post('/parse', { text, user_id: userId })
    return data // { intent, item, quantity, unit, filters, success, list_result? }
  } catch (err) {
    throw new Error(authErrorMessage(err, 'Could not understand that command'))
  }
}

export async function fetchSuggestions(itemName) {
  const { data } = await api.get(`/suggestions/${encodeURIComponent(itemName)}`)
  return data.substitutes
}

export async function searchItems(query) {
  const { data } = await api.get('/search', { params: { q: query } })
  return data
}

export async function fetchRestockSuggestions(userId) {
  const { data } = await api.get('/restock-suggestions', { params: { user_id: userId } })
  return data.suggestions
}

// ---- Catalog ----

export async function fetchCatalog(query = '') {
  const { data } = await api.get('/catalog', { params: query ? { q: query } : {} })
  return data.products
}

export default api