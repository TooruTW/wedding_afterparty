const STORAGE_KEY = 'wedding-party-auth'
const SESSION_TTL_MS = 72 * 60 * 60 * 1000

export type AuthSession = {
  loggedIn: true
  phone: string
  expiresAt: number
}

let expiryTimer: ReturnType<typeof setTimeout> | undefined

function scheduleRemoval(expiresAt: number) {
  clearTimeout(expiryTimer)
  expiryTimer = setTimeout(clearAuthSession, Math.max(0, expiresAt - Date.now()))
}

export function saveAuthSession(phone: string): AuthSession {
  const session: AuthSession = {
    loggedIn: true,
    phone,
    expiresAt: Date.now() + SESSION_TTL_MS,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  scheduleRemoval(session.expiresAt)
  return session
}

export function getAuthSession(): AuthSession | null {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<AuthSession> | null
    if (
      session?.loggedIn !== true ||
      typeof session.phone !== 'string' ||
      typeof session.expiresAt !== 'number' ||
      session.expiresAt <= Date.now()
    ) {
      clearAuthSession()
      return null
    }
    scheduleRemoval(session.expiresAt)
    return session as AuthSession
  } catch {
    clearAuthSession()
    return null
  }
}

export function clearAuthSession() {
  clearTimeout(expiryTimer)
  localStorage.removeItem(STORAGE_KEY)
}
