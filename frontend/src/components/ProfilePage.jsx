import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import {
  fetchAddresses, addAddress, deleteAddress,
  fetchPaymentMethods, addPaymentMethod, deletePaymentMethod,
} from '../api/client'

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

export default function ProfilePage() {
  const user = useAppStore((s) => s.user)
  const logout = useAppStore((s) => s.logout)

  const [addresses, setAddresses] = useState([])
  const [payments, setPayments] = useState([])
  const [addrForm, setAddrForm] = useState({ label: 'Home', line1: '', city: '', pincode: '', is_default: false })
  const [payForm, setPayForm] = useState({ type: 'upi', label: '', is_default: false })
  const [error, setError] = useState(null)

  const reload = async () => {
    try {
      const [a, p] = await Promise.all([fetchAddresses(), fetchPaymentMethods()])
      setAddresses(a)
      setPayments(p)
    } catch {
      setError('Could not load your saved details.')
    }
  }

  useEffect(() => { reload() }, [])

  const submitAddress = async (e) => {
    e.preventDefault()
    if (!addrForm.line1 || !addrForm.city) return
    try {
      await addAddress(addrForm)
      setAddrForm({ label: 'Home', line1: '', city: '', pincode: '', is_default: false })
      reload()
    } catch {
      setError('Could not save that address.')
    }
  }

  const submitPayment = async (e) => {
    e.preventDefault()
    if (!payForm.label) return
    try {
      await addPaymentMethod(payForm)
      setPayForm({ type: 'upi', label: '', is_default: false })
      reload()
    } catch {
      setError('Could not save that payment method.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink mb-6">Your account</h1>

      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#E4EDE7] text-brand flex items-center justify-center font-semibold">
            {initials(user?.name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{user?.name}</p>
            <p className="text-xs text-ink-soft">{user?.email}{user?.phone ? ` · ${user.phone}` : ''}</p>
          </div>
        </div>
        <button onClick={logout} className="text-xs font-medium text-accent">Log out</button>
      </div>

      {error && <p className="text-xs text-red-600 mb-4">{error}</p>}

      {/* Addresses */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-ink mb-3">Saved addresses</h2>
        <div className="flex flex-col gap-2 mb-3">
          {addresses.length === 0 && <p className="text-xs text-ink-soft">No addresses saved yet.</p>}
          {addresses.map((a) => (
            <div key={a.address_id} className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">
                  {a.label} {a.is_default && <span className="ml-1 text-[10px] font-semibold text-brand bg-[#E4EDE7] px-2 py-0.5 rounded-full">Default</span>}
                </p>
                <p className="text-xs text-ink-soft">{a.line1}, {a.city} {a.pincode}</p>
              </div>
              <button onClick={async () => { await deleteAddress(a.address_id); reload() }} className="text-xs text-ink-soft">Remove</button>
            </div>
          ))}
        </div>
        <form onSubmit={submitAddress} className="bg-card border border-border rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={addrForm.label}
              onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))}
              className="rounded-lg border border-border px-2 py-2 text-xs"
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
            <input
              placeholder="Address line"
              value={addrForm.line1}
              onChange={(e) => setAddrForm((f) => ({ ...f, line1: e.target.value }))}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <input
              placeholder="City"
              value={addrForm.city}
              onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-xs"
            />
            <input
              placeholder="Pincode"
              value={addrForm.pincode}
              onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value }))}
              className="w-24 rounded-lg border border-border px-3 py-2 text-xs"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={addrForm.is_default}
              onChange={(e) => setAddrForm((f) => ({ ...f, is_default: e.target.checked }))}
            />
            Set as default
          </label>
          <button type="submit" className="self-start text-xs font-semibold text-white bg-brand rounded-lg px-3 py-1.5">
            Add address
          </button>
        </form>
      </section>

      {/* Payment methods */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-ink mb-3">Payment methods</h2>
        <div className="flex flex-col gap-2 mb-3">
          {payments.length === 0 && <p className="text-xs text-ink-soft">No payment methods saved yet.</p>}
          {payments.map((p) => (
            <div key={p.payment_id} className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">
                  {p.label} {p.is_default && <span className="ml-1 text-[10px] font-semibold text-brand bg-[#E4EDE7] px-2 py-0.5 rounded-full">Default</span>}
                </p>
                <p className="text-xs text-ink-soft uppercase">{p.type}</p>
              </div>
              <button onClick={async () => { await deletePaymentMethod(p.payment_id); reload() }} className="text-xs text-ink-soft">Remove</button>
            </div>
          ))}
        </div>
        <form onSubmit={submitPayment} className="bg-card border border-border rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={payForm.type}
              onChange={(e) => setPayForm((f) => ({ ...f, type: e.target.value }))}
              className="rounded-lg border border-border px-2 py-2 text-xs"
            >
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="cod">Cash on delivery</option>
            </select>
            <input
              placeholder='e.g. "UPI - name@bank" or "Card ending 4242"'
              value={payForm.label}
              onChange={(e) => setPayForm((f) => ({ ...f, label: e.target.value }))}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-xs"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={payForm.is_default}
              onChange={(e) => setPayForm((f) => ({ ...f, is_default: e.target.checked }))}
            />
            Set as default
          </label>
          <button type="submit" className="self-start text-xs font-semibold text-white bg-brand rounded-lg px-3 py-1.5">
            Add payment method
          </button>
        </form>
      </section>
    </div>
  )
}
