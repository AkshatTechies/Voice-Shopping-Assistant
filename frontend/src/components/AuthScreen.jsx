import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function AuthScreen() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })

  const authError = useAppStore((s) => s.authError)
  const authLoading = useAppStore((s) => s.authLoading)
  const login = useAppStore((s) => s.login)
  const signup = useAppStore((s) => s.signup)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'login') {
      login({ email: form.email, password: form.password })
    } else {
      signup(form)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-brand flex items-center justify-center text-white font-serif font-bold text-xl mb-3">
            K
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Kirana Voice</h1>
          <p className="text-ink-soft text-sm mt-1">Just say it. We'll shop it.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex gap-1 bg-bg rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 text-sm font-semibold rounded-full py-2 transition-colors ${
                mode === 'login' ? 'bg-brand text-white' : 'text-ink-soft'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 text-sm font-semibold rounded-full py-2 transition-colors ${
                mode === 'signup' ? 'bg-brand text-white' : 'text-ink-soft'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <input
                type="text"
                required
                placeholder="Full name"
                value={form.name}
                onChange={update('name')}
                className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            )}
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={update('email')}
              className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
            {mode === 'signup' && (
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={update('phone')}
                className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            )}
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={form.password}
              onChange={update('password')}
              className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
            />

            {authError && <p className="text-xs text-red-600">{authError}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="mt-2 w-full bg-accent text-white text-sm font-semibold rounded-xl py-3 disabled:opacity-60"
            >
              {authLoading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
