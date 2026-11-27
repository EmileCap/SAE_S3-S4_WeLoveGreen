<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { roles, useAuth } from '@/composables/useAuth.js'
import { clearSession, getSession, saveSession } from '@/services/sessionService.js'
import { useBuildings } from '@/composables/useBuildings.js'
import { useDiscussions } from '@/composables/useDiscussions.js'
import { usePlacement } from '@/composables/usePlacement.js'

const router = useRouter()
const route = useRoute()
const { role, currentRole, isLoggedIn } = useAuth()
const { stopPlacing } = usePlacement()
const { pendingCount, toCorrectCount } = useBuildings()
const { unreadCount } = useDiscussions()
const menuOpen = ref(false)

// Les entrées de la navbar viennent des routes (src/router/index.js) :
// on garde celles que le rôle actuel a le droit de voir, dans l'ordre de meta.order.
// computed : se recalcule quand le rôle change.
const visibleItems = computed(() =>
  router.getRoutes()
    .filter((r) => r.meta.festival && r.meta.order && r.meta.roles?.includes(currentRole.value))
    .sort((a, b) => a.meta.order - b.meta.order),
)

// Les pastilles (un chiffre rouge) : on distingue les demandes de programmation (réserver / modifier un bâtiment)
// des discussions de la page Contact.
//   Programmation (gestionnaire)    : demandes de programmation à examiner
//   Ma programmation (prestataire)  : demandes où le gestionnaire a demandé des corrections
//   Contact                         : discussions avec un message non lu
const badges = computed(() => ({
  administration: { count: pendingCount.value, label: (n) => `${n} demande${n > 1 ? 's' : ''} de programmation à examiner` },
  'ma-programmation': { count: toCorrectCount.value, label: (n) => `${n} demande${n > 1 ? 's' : ''} à corriger` },
  contact: { count: unreadCount.value, label: (n) => `${n} discussion${n > 1 ? 's' : ''} non lue${n > 1 ? 's' : ''}` },
}))
const badge = (item) => badges.value[item.name]?.count ?? 0
const badgeLabel = (item) => badges.value[item.name].label(badge(item))

// L'entrée de la page courante est soulignée, ainsi que celle de la page "mère" quand on est sur une sous-page
const isCurrent = (item) => route.name === item.name || route.meta.parent === item.name

// Changer de rôle ramène toujours à la carte (la page ouverte n'est peut-être plus permise)
function choose(newRole) {
  stopPlacing() // un placement en cours n'a plus de sens si on change de rôle
  const demoUsers = {
    visiteur: { id: 0, login: 'visiteur-demo', email: '', role: 'visiteur', prestataire: null },
    client: { id: 3, login: 'adam', email: 'bajiic@gmail.com', role: 'client', prestataire: null },
    prestataire: { id: 2, login: 'Demondice', email: 'demondiceKaren@gmail.com', role: 'prestataire', prestataire: { id: 1, nom: 'karen' } },
    gestionnaire: { id: 1, login: 'big_brother', email: 'iseeyou@gmail.com', role: 'organisateur', prestataire: null },
  }
  if (newRole === 'visiteur') {
    clearSession()
  } else {
    saveSession({ token: 'demo-token', utilisateur: demoUsers[newRole] })
  }
  router.push({ name: 'carte' })
  menuOpen.value = false
}

function disconnect() {
  stopPlacing()
  clearSession()
  refreshSession()
  router.push({ name: 'carte' })
  menuOpen.value = false
}
</script>

<template>
  <nav class="navbar">
    <RouterLink class="brand" :to="{ name: 'home' }">We Love Green</RouterLink>

    <ul>
      <li v-for="item in visibleItems" :key="item.path">
        <RouterLink :to="item.path" class="link" :class="{ active: isCurrent(item) }">
          {{ item.meta.title }}
          <span v-if="badge(item) > 0" class="badge" :aria-label="badgeLabel(item)">{{ badge(item) }}</span>
        </RouterLink>
      </li>
    </ul>

    <div class="account">
      <button class="btn btn-light btn-sm account-btn" @click="menuOpen = !menuOpen">
        {{ isLoggedIn ? roles[role] : 'Connexion' }} ▾
      </button>

      <div v-if="menuOpen" class="menu">
        <p class="menu-title">Se connecter en tant que :</p>
        <button
          v-for="(label, key) in roles"
          :key="key"
          class="btn btn-outline-dark btn-sm"
          :class="{ active: key === (role ?? 'visiteur') }"
          @click="choose(key)"
        >
          {{ label }}
        </button>
        <button v-if="isLoggedIn" class="btn btn-outline-danger btn-sm logout" @click="disconnect">Se déconnecter</button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 16px;
  background: #222;
  color: #fff;
  font-family: system-ui, sans-serif;
}
.brand { color: inherit; font-size: 16px; text-decoration: none; }
ul { display: flex; gap: 16px; margin: 0; padding: 0; list-style: none; flex: 1; }
.link {
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  color: #fff;
  text-decoration: none;
  opacity: 0.75;
}
.link:hover { opacity: 1; }
.badge { display: inline-block; min-width: 18px; margin-left: 4px; padding: 0 5px; border-radius: 9px; background: #dc3545; color: #fff; font-size: 11px; font-weight: 700; line-height: 18px; text-align: center; }
.link.active { opacity: 1; border-bottom-color: #fff; }

.account { position: relative; }
.menu {
  position: absolute;
  top: 40px;
  right: 0;
  min-width: 200px;
  padding: 8px;
  background: #fff;
  color: #222;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
.menu-title { margin: 0 0 8px; font-size: 12px; color: #666; }
.menu .btn { display: block; width: 100%; margin-bottom: 4px; text-align: left; }
.menu .logout { margin-top: 8px; }
</style>
