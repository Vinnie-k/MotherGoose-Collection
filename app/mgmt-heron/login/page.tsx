'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/mgmt-heron'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/mgmt-heron/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: 'same-origin',
      })

      let data: { error?: string } = {}
      try {
        data = await res.json()
      } catch {
        // ignore parse error
      }

      if (res.ok) {
        // Small delay so cookie is set before redirect
        setTimeout(() => {
          window.location.href = redirect
        }, 100)
      } else {
        setError(data.error || `Login failed (status ${res.status})`)
        setLoading(false)
      }
    } catch (err) {
      setError('Could not reach the server. Is the dev server running?')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="font-display text-3xl font-bold tracking-widest text-[#F5F2EC]">MOTHERGOOSE</span>
            <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Store</span>
          </div>
          <p className="text-[#F5F2EC]/30 text-sm tracking-widest uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/10 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 border border-[#C9A84C]/30 flex items-center justify-center">
              <Lock size={16} className="text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-[#F5F2EC] font-display text-xl">Admin Login</h1>
              <p className="text-[#F5F2EC]/30 text-xs">Authorised personnel only</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 p-4 mb-6">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-[#F5F2EC]/50 tracking-widest uppercase block mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="bg-white/5 border border-white/10 text-[#F5F2EC] placeholder-[#F5F2EC]/30 px-4 py-3 focus:outline-none focus:border-[#C9A84C]/60 transition-colors w-full"
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-xs text-[#F5F2EC]/50 tracking-widest uppercase block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 border border-white/10 text-[#F5F2EC] placeholder-[#F5F2EC]/30 px-4 py-3 pr-11 focus:outline-none focus:border-[#C9A84C]/60 transition-colors w-full"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F2EC]/30 hover:text-[#F5F2EC]/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-[#C9A84C] text-[#0A0A0F] font-semibold py-3 text-sm tracking-widest uppercase transition-all duration-200 hover:bg-[#E8D5A3] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-[#F5F2EC]/20 text-xs text-center leading-relaxed">
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-[#F5F2EC]/20 hover:text-[#F5F2EC]/50 text-xs transition-colors">
            ← Back to Store
          </a>
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
      <LoginForm />
    </Suspense>
  )
}
