<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSession } from '../services/sessionService'

const props = defineProps({
  activePage: {
    type: String,
    default: '',
  },
})

const router = useRouter()
const user = getSession()
const isClient = computed(() => user?.role === 'visiteur')

function openMyProgramme() {
  if (isClient.value) {
    router.push({ name: 'client-dashboard' })
    return
  }

  router.push({ name: 'login', query: { redirect: 'mon-programme' } })
}
</script>

<template>
  <header class="site-header">
    <RouterLink class="wordmark" to="/" aria-label="We Love Green, accueil">
      <span class="logo-mark">W</span>
      <span>WE LOVE GREEN</span>
    </RouterLink>

    <nav class="navigation" aria-label="Navigation principale">
      <RouterLink class="nav-link" :class="{ active: props.activePage === 'Accueil' }" to="/">
        Accueil
      </RouterLink>
      <RouterLink
        class="nav-link"
        :class="{ active: props.activePage === 'Programme' }"
        to="/programme"
      >
        Programme
      </RouterLink>
      <button
        class="nav-link"
        :class="{ active: props.activePage === 'Mon programme' }"
        type="button"
        @click="openMyProgramme"
      >
        Mon programme
      </button>
    </nav>

    <div class="account-actions">
      <RouterLink v-if="isClient" class="login-button" to="/client/programme">Mon espace</RouterLink>
      <RouterLink v-else class="login-button" to="/login">Se connecter</RouterLink>
      <button
        class="signup-button"
        type="button"
        disabled
        title="Bientôt disponible"
        aria-label="Créer un compte, bientôt disponible"
      >
        Créer un compte
      </button>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  display: flex;
  min-height: 84px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
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
  letter-spacing: 0.06em;
  text-decoration: none;
}

.logo-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid #c0fe04;
  color: #c0fe04;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: 19px;
}

.navigation,
.account-actions {
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 28px);
}

.navigation {
  align-self: stretch;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 0;
  padding: 0;
  color: #aaa;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  text-decoration: none;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.active {
  color: #c0fe04;
}

.nav-link.active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: #c0fe04;
  content: '';
}

.login-button,
.signup-button {
  border: 1px solid #c0fe04;
  padding: 11px 13px;
  color: #c0fe04;
  background: transparent;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 10px;
  text-decoration: none;
  white-space: nowrap;
}

.login-button:hover {
  color: #000;
  background: #c0fe04;
}

.signup-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 900px) {
  .site-header {
    flex-wrap: wrap;
    gap: 0 20px;
    padding: 16px 0 0;
  }

  .navigation {
    order: 3;
    flex: 1 0 100%;
    min-height: 48px;
    gap: clamp(18px, 5vw, 36px);
    overflow-x: auto;
  }

  .account-actions {
    gap: 8px;
    margin-left: auto;
  }
}

@media (max-width: 520px) {
  .wordmark {
    gap: 7px;
    font-size: 10px;
  }

  .logo-mark {
    width: 30px;
    height: 30px;
  }

  .account-actions {
    gap: 6px;
  }

  .login-button,
  .signup-button {
    padding: 9px 8px;
    font-size: 8px;
  }

  .nav-link {
    font-size: 11px;
  }
}
</style>
