const SESSION_KEY = 'welovegreen-user'

export function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function getSession() {
  const user = sessionStorage.getItem(SESSION_KEY)

  if (!user) return null

  try {
    return JSON.parse(user)
  } catch {
    clearSession()
    return null
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}
