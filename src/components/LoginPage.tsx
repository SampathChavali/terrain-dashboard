import { ArrowRight, LayoutDashboard, UserPlus } from 'lucide-react'
import { useState } from 'react'
import type { AuthResult } from '../hooks/useAuth'

type AuthMode = 'signin' | 'register'

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean
  onRegister: (username: string, password: string, confirmPassword: string) => AuthResult
}

export function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const clearError = () => {
    if (error) setError('')
  }

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password')
      return
    }

    setLoading(true)
    setError('')

    const ok = onLogin(username.trim(), password)
    setLoading(false)

    if (!ok) {
      setError('Incorrect username or password. Please try again.')
      setPassword('')
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = onRegister(username.trim(), password, confirmPassword)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
    }
  }

  const isRegister = mode === 'register'

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="login-card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-green-light/40 mb-4">
              {isRegister ? (
                <UserPlus className="w-6 h-6 text-white" />
              ) : (
                <LayoutDashboard className="w-6 h-6 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isRegister ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-white/70 mt-2">
              {isRegister
                ? 'Set up your account and start managing your own tasks.'
                : 'Sign in to manage projects and daily updates.'}
            </p>
          </div>

          <form onSubmit={isRegister ? handleRegister : handleSignIn} className="space-y-4">
            <div className="login-field-box">
              <label className="block text-sm font-medium text-white/90 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  clearError()
                }}
                placeholder="Choose a username"
                className="login-input"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="login-field-box">
              <label className="block text-sm font-medium text-white/90 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearError()
                }}
                placeholder={isRegister ? 'At least 6 characters' : 'Enter your password'}
                className="login-input"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>

            {isRegister && (
              <div className="login-field-box">
                <label className="block text-sm font-medium text-white/90 mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    clearError()
                  }}
                  placeholder="Re-enter your password"
                  className="login-input"
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-200 bg-red-900/20 border border-red-300/30 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-btn w-full justify-center py-3 mt-2 disabled:opacity-60"
            >
              {loading
                ? isRegister
                  ? 'Creating account...'
                  : 'Signing in...'
                : isRegister
                  ? 'Create Account'
                  : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-white/70 mt-5">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-white font-semibold underline underline-offset-2 cursor-pointer hover:text-green-pale"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-white font-semibold underline underline-offset-2 cursor-pointer hover:text-green-pale"
                >
                  Create account
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
