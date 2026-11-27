<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { clearSession } from '@/services/sessionService.js'

const props = defineProps({
  items: { type: Array, required: true },
  activePage: { type: String, required: true },
  roleLabel: { type: String, required: true },
})

const emit = defineEmits(['select'])
const router = useRouter()
const logoDestination = computed(() => {
  if (props.roleLabel === 'Prestataire') return { name: 'dashboard', query: { section: 'Ma programmation' } }
  if (props.roleLabel === 'Admin') return { name: 'dashboard', query: { section: 'Programmation' } }
  return { name: 'home' }
})

function navigate(item) {
  if (item.to) {
    router.push(item.to)
    return
  }
  emit('select', item.label)
}

function signOut() {
  clearSession()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="navbar" :class="{ 'navbar-prestataire': props.roleLabel === 'Prestataire' }">
    <RouterLink class="wordmark" :to="logoDestination" aria-label="We Love Green - accueil">
      <span class="logo-mark">W</span>
      <span>WE LOVE GREEN</span>
    </RouterLink>

    <nav class="navigation" :aria-label="`Navigation ${props.roleLabel}`">
      <button
        v-for="item in props.items"
        :key="item.label"
        class="nav-link"
        :class="{ active: props.activePage === item.label }"
        type="button"
        @click="navigate(item)"
      >
        {{ item.label }}
      </button>
    </nav>

    <button class="logout-button" type="button" @click="signOut">Déconnexion <span>↗</span></button>
  </header>
</template>

<style scoped>
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

.navbar-prestataire {
  --accent: #60e2c2;
}

.logo-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--accent, #c0fe04);
  color: var(--accent, #c0fe04);
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
  background: var(--accent, #c0fe04);
  content: '';
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
  color: var(--accent, #c0fe04);
}

@media (max-width: 800px) {
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
