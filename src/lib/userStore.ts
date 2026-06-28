import { getSupabase, isCloudAuthEnabled } from './supabase'

export interface StoredUser {
  username: string
  password: string
}

export type AuthResult = { success: true } | { success: false; error: string }

const USERS_KEY = 'personal-jira-users'

const DEFAULT_USERS: StoredUser[] = [
  { username: 'admin', password: 'admin123' },
  { username: 'sampath', password: 'donezo123' },
]

function loadLocalUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return [...DEFAULT_USERS]
    const parsed = JSON.parse(raw) as StoredUser[]
    return parsed.length > 0 ? parsed : [...DEFAULT_USERS]
  } catch {
    return [...DEFAULT_USERS]
  }
}

function saveLocalUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

async function listCloudUsers(): Promise<StoredUser[]> {
  const supabase = getSupabase()
  if (!supabase) return loadLocalUsers()

  const { data, error } = await supabase
    .from('terrain_users')
    .select('username, password')
    .order('username')

  if (error) throw error
  return (data ?? []).map((row) => ({
    username: row.username,
    password: row.password,
  }))
}

async function seedCloudFromLocalIfEmpty(): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  const { count, error: countError } = await supabase
    .from('terrain_users')
    .select('*', { count: 'exact', head: true })

  if (countError) throw countError
  if ((count ?? 0) > 0) return

  const localUsers = loadLocalUsers()
  const { error } = await supabase.from('terrain_users').insert(
    localUsers.map((u) => ({ username: u.username, password: u.password })),
  )

  if (error && !error.message.includes('duplicate')) throw error
}

export async function fetchAllUsers(): Promise<StoredUser[]> {
  if (!isCloudAuthEnabled()) return loadLocalUsers()

  await seedCloudFromLocalIfEmpty()
  return listCloudUsers()
}

export async function verifyUserCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const normalized = username.trim().toLowerCase()

  if (isCloudAuthEnabled()) {
    const users = await fetchAllUsers()
    return users.some(
      (u) => u.username.toLowerCase() === normalized && u.password === password,
    )
  }

  return loadLocalUsers().some(
    (u) => u.username.toLowerCase() === normalized && u.password === password,
  )
}

export async function userExists(username: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase()
  const users = isCloudAuthEnabled() ? await fetchAllUsers() : loadLocalUsers()
  return users.some((u) => u.username.toLowerCase() === normalized)
}

export async function addUser(username: string, password: string): Promise<AuthResult> {
  const trimmed = username.trim()

  if (isCloudAuthEnabled()) {
    const supabase = getSupabase()!
    const { error } = await supabase
      .from('terrain_users')
      .insert({ username: trimmed, password })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Username already taken' }
      }
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  const users = loadLocalUsers()
  if (users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase())) {
    return { success: false, error: 'Username already taken' }
  }
  saveLocalUsers([...users, { username: trimmed, password }])
  return { success: true }
}

export async function removeUser(username: string): Promise<AuthResult> {
  const trimmed = username.trim()
  if (!trimmed) return { success: false, error: 'Invalid username' }

  if (isCloudAuthEnabled()) {
    const supabase = getSupabase()!
    const { error } = await supabase
      .from('terrain_users')
      .delete()
      .ilike('username', trimmed)

    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  const users = loadLocalUsers()
  const exists = users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase())
  if (!exists) return { success: false, error: 'Account not found' }

  saveLocalUsers(users.filter((u) => u.username.toLowerCase() !== trimmed.toLowerCase()))
  return { success: true }
}

export function isUsingLocalStorageOnly(): boolean {
  return !isCloudAuthEnabled()
}
