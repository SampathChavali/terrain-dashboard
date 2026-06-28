import { ArrowRight, LayoutDashboard, UserPlus } from 'lucide-react'
import { useState } from 'react'
import type { AuthResult } from '../hooks/useAuth'
import { TerrainBackground } from './TerrainBackground'

type AuthMode = 'signin' | 'register'

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>
  onRegister: (username: string, password: string, confirmPassword: string) => Promise<AuthResult>
  onAdminPortal: () => void
}

export function LoginPage({ onLogin, onRegister, onAdminPortal }: LoginPageProps) {
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password')
      return
    }

    setLoading(true)
    setError('')

    const ok = await onLogin(username.trim(), password)
    setLoading(false)

    if (!ok) {
      setError('Incorrect username or password. Please try again.')
      setPassword('')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await onRegister(username.trim(), password, confirmPassword)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
    }
  }

  const isRegister = mode === 'register'

  return (
    <TerrainBackground auth className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="login-card">
          <div className="text-center mb-8">
            <div className="login-icon inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4">
              {isRegister ? (
                <UserPlus className="w-7 h-7" />
              ) : (
                <LayoutDashboard className="w-7 h-7" />
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Terrain</h1>
            <p className="text-sm login-muted mt-2">
              {isRegister
                ? 'Create your account and start managing projects.'
                : 'Sign in to manage projects and daily updates.'}
            </p>
          </div>

          <form onSubmit={isRegister ? handleRegister : handleSignIn} className="space-y-4">
            <div className="login-field-box">
              <label className="block text-sm mb-1.5">Username</label>
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
              <label className="block text-sm mb-1.5">Password</label>
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
                <label className="block text-sm mb-1.5">
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

            {error && <p className="login-error">{error}</p>}

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

          <p className="text-center text-sm login-muted mt-5">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signin')} className="login-link">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => switchMode('register')} className="login-link">
                  Create account
                </button>
              </>
            )}
          </p>

          <p className="text-center text-xs login-muted mt-4">
            Platform administrator?{' '}
            <button type="button" onClick={onAdminPortal} className="login-link">
              Admin Portal
            </button>
          </p>
        </div>
      </div>
    </TerrainBackground>
  )
}
