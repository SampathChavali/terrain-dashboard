import { useCallback, useState } from 'react'
import {
  addUser,
  fetchAllUsers,
  removeUser,
  userExists,
  verifyUserCredentials,
  type AuthResult,
  type StoredUser,
} from '../lib/userStore'
import { clearBoardForUser, initEmptyBoardForUser } from './useBoard'

export type { AuthResult, StoredUser }

export type UserRole = 'user' | 'platform_admin'

export interface UserSession {
  name: string
  role: UserRole
  loggedInAt: string
}

export interface PlatformAdmin {
  username: string
  password: string
}

const SESSION_KEY = 'personal-jira-session'
const PLATFORM_ADMIN_KEY = 'personal-jira-platform-admin'

const DEFAULT_PLATFORM_ADMIN: PlatformAdmin = {
  username: 'terrain_admin',
  password: 'TerrainAdmin2026',
}

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

function validateNewUser(
  username: string,
  password: string,
  confirmPassword?: string,
): AuthResult | null {
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

  const platformAdmin = loadPlatformAdmin()
  if (trimmed.toLowerCase() === platformAdmin.username.toLowerCase()) {
    return { success: false, error: 'This username is reserved' }
  }

  return null
}

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(loadSession)

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    if (!username.trim() || !password) return false
    const ok = await verifyUserCredentials(username, password)
    if (!ok) return false

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
    async (username: string, password: string, confirmPassword: string): Promise<AuthResult> => {
      const validation = validateNewUser(username, password, confirmPassword)
      if (validation) return validation

      const trimmed = username.trim()
      if (await userExists(trimmed)) {
        return { success: false, error: 'Username already taken' }
      }

      const result = await addUser(trimmed, password)
      if (!result.success) return result

      initEmptyBoardForUser(trimmed)

      const next = createUserSession(trimmed)
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      setSession(next)
      return { success: true }
    },
    [],
  )

  const listUsers = useCallback(async (): Promise<StoredUser[]> => fetchAllUsers(), [])

  const addUserAccount = useCallback(
    async (username: string, password: string): Promise<AuthResult> => {
      const validation = validateNewUser(username, password)
      if (validation) return validation

      const trimmed = username.trim()
      if (await userExists(trimmed)) {
        return { success: false, error: 'Username already taken' }
      }

      const result = await addUser(trimmed, password)
      if (!result.success) return result

      initEmptyBoardForUser(trimmed)
      return { success: true }
    },
    [],
  )

  const removeUserAccount = useCallback(async (username: string): Promise<AuthResult> => {
    const trimmed = username.trim()
    const result = await removeUser(trimmed)
    if (result.success) clearBoardForUser(trimmed)
    return result
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
