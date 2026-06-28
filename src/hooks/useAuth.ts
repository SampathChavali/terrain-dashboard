import { useCallback, useState } from 'react'

export type UserRole = 'admin' | 'member'

export interface UserSession {
  name: string
  role: UserRole
  loggedInAt: string
}

export interface StoredUser {
  username: string
  password: string
}

export type AuthResult = { success: true } | { success: false; error: string }

const SESSION_KEY = 'personal-jira-session'
const USERS_KEY = 'personal-jira-users'

const DEFAULT_USERS: StoredUser[] = [
  { username: 'admin', password: 'admin123' },
  { username: 'sampath', password: 'donezo123' },
]

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
      return DEFAULT_USERS
    }
    const parsed = JSON.parse(raw) as StoredUser[]
    return parsed.length > 0 ? parsed : DEFAULT_USERS
  } catch {
    return DEFAULT_USERS
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserSession
  } catch {
    return null
  }
}

function createSession(username: string): UserSession {
  return {
    name: username.trim(),
    role: 'admin',
    loggedInAt: new Date().toISOString(),
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  const users = loadUsers()
  const normalized = username.trim().toLowerCase()
  return users.some(
    (u) => u.username.toLowerCase() === normalized && u.password === password,
  )
}

function usernameExists(username: string): boolean {
  const normalized = username.trim().toLowerCase()
  return loadUsers().some((u) => u.username.toLowerCase() === normalized)
}

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(loadSession)

  const login = useCallback((username: string, password: string): boolean => {
    if (!username.trim() || !password) return false
    if (!verifyCredentials(username, password)) return false

    const next = createSession(username)
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
    return true
  }, [])

  const register = useCallback(
    (username: string, password: string, confirmPassword: string): AuthResult => {
      const trimmed = username.trim()

      if (!trimmed || !password || !confirmPassword) {
        return { success: false, error: 'Please fill in all fields' }
      }
      if (trimmed.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters' }
      }
      if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
        return { success: false, error: 'Username can only contain letters, numbers, and underscores' }
      }
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' }
      }
      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' }
      }
      if (usernameExists(trimmed)) {
        return { success: false, error: 'Username already taken. Please choose another.' }
      }

      const users = loadUsers()
      saveUsers([...users, { username: trimmed, password }])

      const next = createSession(trimmed)
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      setSession(next)
      return { success: true }
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  return { session, login, register, logout }
}
