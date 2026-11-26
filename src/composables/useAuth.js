import { computed, ref } from 'vue'

// Libellés affichés dans le menu de connexion
export const roles = {
    client: 'Client',
    prestataire: 'Prestataire',
    gestionnaire: 'Gestionnaire',
}

// FAUX LOGIN pour tester les personas. null = personne n'est connecté.
// Plus tard : ce rôle viendra de la vraie connexion (API).
const role = ref(null)

// Un utilisateur non connecté est un "visiteur"
const currentRole = computed(() => role.value ?? 'visiteur')
const isLoggedIn = computed(() => role.value !== null)

// Identifiant du faux utilisateur connecté. Seul le prestataire en a un pour l'instant :
// presta-1 est le prestataire de test (il possède déjà des bâtiments dans buildings.js).
const userId = computed(() => (role.value === 'prestataire' ? 'presta-1' : null))

function loginAs(newRole) { role.value = newRole }
function logout() { role.value = null }

export function useAuth() {
    return { role, currentRole, isLoggedIn, userId, loginAs, logout }
}
