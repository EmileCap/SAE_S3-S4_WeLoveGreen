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
    role: LOCAL_ROLE_BY_API_ROLE[utilisateur.role],
    token,
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
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
