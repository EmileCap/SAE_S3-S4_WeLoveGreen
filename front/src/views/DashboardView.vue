<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PublicNavbar from '../components/PublicNavbar.vue'
import { clearSession, getSession } from '../services/sessionService'

const router = useRouter()
const user = getSession()

if (!user) router.replace({ name: 'login' })

const roleLabel = computed(() => {
  if (user?.role === 'organisateur') return 'Admin'
  if (user?.role === 'visiteur') return 'Client'
  if (user?.role === 'prestataire') return 'Prestataire'
  return 'Utilisateur'
})
const navItems = computed(() => {
  if (user?.role === 'visiteur') {
    return [
      { label: 'Accueil', to: { name: 'home' } },
      { label: 'Programme', to: { name: 'programme' } },
      { label: 'Mon programme', to: { name: 'client-dashboard' } },
    ]
  }

  if (user?.role === 'prestataire') {
    return [{ label: 'Ma programmation' }, { label: 'Statistiques' }]
  }

  if (user?.role === 'organisateur') {
    return [{ label: 'Programmation' }, { label: 'Carte' }, { label: 'Statistiques' }]
  }

  return []
})
const activePage = ref(navItems.value[0]?.label ?? '')
const pageMessage = computed(() => `${activePage.value} - ${roleLabel.value} FONCTIONNE`)

function signOut() {
  clearSession()
  router.push({ name: 'login' })
}
</script>

<template>
  <main class="dashboard" :class="`dashboard-${user?.role ?? 'unknown'}`">
    <header class="navbar">
      <RouterLink class="wordmark" to="/" aria-label="We Love Green - accueil">
        <span class="logo-mark">W</span>
        <span>WE LOVE GREEN</span>
      </RouterLink>

      <nav class="navigation" :aria-label="`Navigation ${roleLabel}`">
        <button
          v-for="item in navItems"
          :key="item.label"
          class="nav-link"
          :class="{ active: activePage === item.label }"
          type="button"
          @click="item.to ? router.push(item.to) : (activePage = item.label)"
        >
          {{ item.label }}
        </button>
      </nav>

      <button class="logout-button" type="button" @click="signOut">Déconnexion <span>↗</span></button>
    </header>

    <section class="content" aria-live="polite">
      <p class="eyebrow">ESPACE PERSONNEL · {{ roleLabel }}</p>
      <h1>{{ pageMessage }}</h1>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  --accent: #c0fe04;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding: 0 clamp(20px, 5vw, 76px);
  color: #fff;
  background: #000;
}

.dashboard-prestataire {
  --accent: #60e2c2;
}

.dashboard-visiteur {
  --accent: #ff6947;
}

.navbar {
  display: flex;
  min-height: 84px;
  align-items: center;
  gap: clamp(20px, 4vw, 64px);
  border-bottom: 1px solid #333;
}

.wordmark {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-decoration: none;
}

.logo-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--accent);
  color: var(--accent);
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: 19px;
}

.navigation {
  display: flex;
  flex: 1;
  align-items: stretch;
  align-self: stretch;
  gap: clamp(16px, 3vw, 42px);
}

.nav-link {
  position: relative;
  border: 0;
  padding: 0;
  color: #aaa;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.active {
  color: #fff;
}

.nav-link.active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--accent);
  content: '';
}

.nav-link.login-link {
  align-self: center;
  border: 1px solid var(--accent);
  padding: 11px 17px;
  color: var(--accent);
}

.nav-link.login-link.active::after {
  display: none;
}

.logout-button {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 12px;
  border: 1px solid #555;
  padding: 11px 13px;
  color: #fff;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  white-space: nowrap;
}

.logout-button span {
  color: var(--accent);
}

.content {
  display: grid;
  flex: 1;
  align-content: center;
  justify-items: center;
  padding: 80px 0;
  text-align: center;
}

.eyebrow {
  margin: 0 0 25px;
  color: #999;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
}

.content h1 {
  max-width: 100%;
  margin: 0;
  color: var(--accent);
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(32px, 7vw, 84px);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 0.95;
  text-transform: uppercase;
}

@media (max-width: 800px) {
  .dashboard {
    padding: 0 20px;
  }

  .navbar {
    min-height: 72px;
    flex-wrap: wrap;
    gap: 0 24px;
    padding: 15px 0;
  }

  .navigation {
    order: 3;
    flex-basis: 100%;
    min-height: 48px;
    overflow-x: auto;
    gap: 24px;
  }

  .nav-link.login-link {
    margin: 0;
  }

  .logout-button {
    margin-left: auto;
  }
}

@media (max-width: 420px) {
  .wordmark {
    gap: 7px;
    font-size: 10px;
  }

  .logo-mark {
    width: 30px;
    height: 30px;
  }

  .logout-button {
    gap: 6px;
    padding: 9px;
    font-size: 10px;
  }

  .nav-link {
    font-size: 11px;
  }
}
</style>
