const SESSION_KEY = 'welovegreen-user'

const LOCAL_ROLE_BY_API_ROLE = {
  client: 'visiteur',
  prestataire: 'prestataire',
  organisateur: 'organisateur',
}

export function saveSession(authentication) {
  const { token, utilisateur } = authentication
  const user = {
    ...utilisateur,
    role: LOCAL_ROLE_BY_API_ROLE[utilisateur.role] ?? utilisateur.role,
    token,
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('welovegreen-session-changed'))
  return user
}

export function getSession() {
  const user = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(SESSION_KEY)

  if (!user) return null

  try {
    return JSON.parse(user)
  } catch {
    clearSession()
    return null
  }
}

export function clearSession() {
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(SESSION_KEY)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('welovegreen-session-changed'))
}

export function subscribeToSession(callback) {
  const handleStorage = (event) => {
    if (event.key === SESSION_KEY || event.key === null) callback()
  }

  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}
