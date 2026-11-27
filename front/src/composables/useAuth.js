import { computed, ref } from 'vue'
import { getSession } from '../services/sessionService.js'

export const roles = {
  visiteur: 'Visiteur',
  client: 'Client',
  prestataire: 'Prestataire',
  gestionnaire: 'Organisateur',
}

const session = ref(getSession())
const role = computed(() => {
  if (!session.value) return null
  if (session.value.role === 'organisateur') return 'gestionnaire'
  if (session.value.role === 'visiteur') return 'client'
  return session.value.role
})
const currentRole = computed(() => role.value ?? 'visiteur')
const isLoggedIn = computed(() => session.value !== null)
const userId = computed(() => {
  if (role.value !== 'prestataire') return null
  const providerId = session.value?.prestataire?.id
  return providerId ? `presta-${providerId}` : null
})

function refreshSession() {
  session.value = getSession()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', refreshSession)
  window.addEventListener('welovegreen-session-changed', refreshSession)
}

export function useAuth() {
  return { session, role, currentRole, isLoggedIn, userId, refreshSession }
}
