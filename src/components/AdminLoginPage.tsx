import { ArrowRight, Shield, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { TerrainBackground } from './TerrainBackground'

interface AdminLoginPageProps {
  onLogin: (username: string, password: string) => boolean
  onBack: () => void
}

export function AdminLoginPage({ onLogin, onBack }: AdminLoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Enter platform admin username and password')
      return
    }

    setLoading(true)
    setError('')
    const ok = onLogin(username.trim(), password)
    setLoading(false)

    if (!ok) {
      setError('Invalid admin credentials')
      setPassword('')
    }
  }

  return (
    <TerrainBackground className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="login-card glass-panel">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to user login
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-icon mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-sm text-white/75 mt-2">
              Platform administrator access — manage user accounts
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="login-field-box glass-inset">
              <label className="block text-sm font-medium text-white/90 mb-1.5">
                Admin username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Platform admin username"
                className="login-input glass-input"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="login-field-box glass-inset">
              <label className="block text-sm font-medium text-white/90 mb-1.5">
                Admin password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Platform admin password"
                className="login-input glass-input"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-100 glass-error rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-btn glass-btn w-full justify-center py-3 mt-2 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Enter Admin Portal'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </TerrainBackground>
  )
}
