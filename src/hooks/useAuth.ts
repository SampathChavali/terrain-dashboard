import { useCallback, useState } from 'react'
import { clearBoardForUser, initEmptyBoardForUser } from './useBoard'

export type UserRole = 'user' | 'platform_admin'

export interface UserSession {
  name: string
  role: UserRole
  loggedInAt: string
}

export interface StoredUser {
  username: string
  password: string
}

export interface PlatformAdmin {
  username: string
  password: string
}

export type AuthResult = { success: true } | { success: false; error: string }

const SESSION_KEY = 'personal-jira-session'
const USERS_KEY = 'personal-jira-users'
const PLATFORM_ADMIN_KEY = 'personal-jira-platform-admin'

const DEFAULT_PLATFORM_ADMIN: PlatformAdmin = {
  username: 'terrain_admin',
  password: 'TerrainAdmin2026',
}

const DEFAULT_USERS: StoredUser[] = [
  { username: 'admin', password: 'admin123' },
  { username: 'sampath', password: 'donezo123' },
]

function loadPlatformAdmin(): PlatformAdmin {
  try {
    const raw = localStorage.getItem(PLATFORM_ADMIN_KEY)
    if (!raw) {
      localStorage.setItem(PLATFORM_ADMIN_KEY, JSON.stringify(DEFAULT_PLATFORM_ADMIN))
      return DEFAULT_PLATFORM_ADMIN
    }
    return { ...DEFAULT_PLATFORM_ADMIN, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PLATFORM_ADMIN
  }
}

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
    const parsed = JSON.parse(raw) as { name: string; role: string; loggedInAt: string }
    if (parsed.role === 'admin' || parsed.role === 'member') {
      return { name: parsed.name, role: 'user', loggedInAt: parsed.loggedInAt }
    }
    if (parsed.role === 'user' || parsed.role === 'platform_admin') {
      return { name: parsed.name, role: parsed.role, loggedInAt: parsed.loggedInAt }
    }
    return null
  } catch {
    return null
  }
}

function createUserSession(username: string): UserSession {
  return {
    name: username.trim(),
    role: 'user',
    loggedInAt: new Date().toISOString(),
  }
}

function createPlatformAdminSession(admin: PlatformAdmin): UserSession {
  return {
    name: admin.username,
    role: 'platform_admin',
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

function validateNewUser(username: string, password: string, confirmPassword?: string): AuthResult {
  const trimmed = username.trim()

  if (!trimmed || !password) {
    return { success: false, error: 'Please fill in username and password' }
  }
  if (trimmed.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters' }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return {
      success: false,
      error: 'Username can only contain letters, numbers, and underscores',
    }
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' }
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' }
  }
  if (usernameExists(trimmed)) {
    return { success: false, error: 'Username already taken' }
  }
  const platformAdmin = loadPlatformAdmin()
  if (trimmed.toLowerCase() === platformAdmin.username.toLowerCase()) {
    return { success: false, error: 'This username is reserved' }
  }

  return { success: true }
}

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(loadSession)

  const login = useCallback((username: string, password: string): boolean => {
    if (!username.trim() || !password) return false
    if (!verifyCredentials(username, password)) return false

    const next = createUserSession(username)
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
    return true
  }, [])

  const platformAdminLogin = useCallback((username: string, password: string): boolean => {
    const admin = loadPlatformAdmin()
    if (
      username.trim().toLowerCase() !== admin.username.toLowerCase() ||
      password !== admin.password
    ) {
      return false
    }

    const next = createPlatformAdminSession(admin)
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
    return true
  }, [])

  const register = useCallback(
    (username: string, password: string, confirmPassword: string): AuthResult => {
      const validation = validateNewUser(username, password, confirmPassword)
      if (!validation.success) return validation

      const trimmed = username.trim()
      const users = loadUsers()
      saveUsers([...users, { username: trimmed, password }])
      initEmptyBoardForUser(trimmed)

      const next = createUserSession(trimmed)
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      setSession(next)
      return { success: true }
    },
    [],
  )

  const listUsers = useCallback((): StoredUser[] => loadUsers(), [])

  const addUserAccount = useCallback((username: string, password: string): AuthResult => {
    const validation = validateNewUser(username, password)
    if (!validation.success) return validation

    const trimmed = username.trim()
    saveUsers([...loadUsers(), { username: trimmed, password }])
    initEmptyBoardForUser(trimmed)
    return { success: true }
  }, [])

  const removeUserAccount = useCallback((username: string): AuthResult => {
    const trimmed = username.trim()
    if (!trimmed) return { success: false, error: 'Invalid username' }

    const users = loadUsers()
    const exists = users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase())
    if (!exists) return { success: false, error: 'Account not found' }

    saveUsers(users.filter((u) => u.username.toLowerCase() !== trimmed.toLowerCase()))
    clearBoardForUser(trimmed)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  return {
    session,
    login,
    platformAdminLogin,
    register,
    logout,
    listUsers,
    addUserAccount,
    removeUserAccount,
  }
}
