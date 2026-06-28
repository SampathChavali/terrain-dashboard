import { AlertTriangle, LogOut, Plus, Shield, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AuthResult, StoredUser } from '../hooks/useAuth'
import { isUsingLocalStorageOnly } from '../lib/userStore'
import { TerrainBackground } from './TerrainBackground'

interface AdminPortalProps {
  adminName: string
  users: StoredUser[]
  usersLoading: boolean
  onAddUser: (username: string, password: string) => Promise<AuthResult>
  onRemoveUser: (username: string) => Promise<AuthResult>
  onLogout: () => void
  onRefresh: () => void
}

export function AdminPortal({
  adminName,
  users,
  usersLoading,
  onAddUser,
  onRemoveUser,
  onLogout,
  onRefresh,
}: AdminPortalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const localOnly = isUsingLocalStorageOnly()

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.username.localeCompare(b.username)),
    [users],
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)
    const result = await onAddUser(username.trim(), password)
    setSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setMessage(`Account "${username.trim()}" created successfully`)
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    onRefresh()
  }

  const handleRemove = async (name: string) => {
    if (!confirm(`Remove account "${name}"? Their tasks will be deleted permanently.`)) return

    setMessage('')
    setError('')
    setSaving(true)
    const result = await onRemoveUser(name)
    setSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setMessage(`Account "${name}" removed`)
    onRefresh()
  }

  return (
    <TerrainBackground app className="min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        <header className="glass-panel rounded-2xl p-6 mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl glass-green flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Terrain Admin Portal</h1>
              <p className="text-sm text-white/75 mt-1">
                Signed in as <span className="font-semibold text-white">{adminName}</span>
              </p>
            </div>
          </div>
          <button onClick={onLogout} className="btn-outline text-sm bg-white/50">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {localOnly && (
          <div className="card mb-6 border-amber-200 bg-amber-50/90 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Accounts are stored per browser only</p>
              <p className="text-xs text-amber-800 mt-1">
                When someone creates an account on their phone or computer, it only exists on that
                device. You will not see it here until cloud sync is enabled. Ask your admin to
                connect Supabase, or add accounts manually from this portal.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="card-compact flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-bg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{users.length}</p>
              <p className="text-xs text-text">Total accounts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-1">Add new account</h2>
            <p className="text-sm text-muted mb-4">Create a user who can log in and manage their own tasks.</p>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="e.g. alexandra"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Re-enter password"
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center disabled:opacity-60">
                <Plus className="w-4 h-4" />
                Add Account
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-1">All user accounts</h2>
            <p className="text-sm text-muted mb-4">Remove accounts you no longer need.</p>

            {message && (
              <p className="text-sm text-green-primary bg-green-bg border border-green-pale rounded-lg px-3 py-2 mb-3">
                {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                {error}
              </p>
            )}

            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {usersLoading ? (
                <p className="text-sm text-muted text-center py-8">Loading accounts...</p>
              ) : sortedUsers.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">No user accounts yet</p>
              ) : (
                sortedUsers.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-green-pale/60 bg-white/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-green-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text truncate">{user.username}</p>
                        <p className="text-[10px] text-muted">User account</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRemove(user.username)}
                      disabled={saving}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer shrink-0 disabled:opacity-50"
                      title="Remove account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </TerrainBackground>
  )
}
