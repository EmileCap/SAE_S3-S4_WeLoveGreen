<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PublicNavbar from '../components/PublicNavbar.vue'
import { clearSession, getSession } from '../services/sessionService'

const router = useRouter()
const user = getSession()
const activePage = ref('Mon programme')
const message = computed(() => `${activePage.value} - Client FONCTIONNE`)

function signOut() {
  clearSession()
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="client-dashboard">
    <PublicNavbar :active-page="activePage" />
    <button class="logout-button" type="button" @click="signOut">Déconnexion <span>↗</span></button>
    <section class="client-content" aria-live="polite">
      <p class="eyebrow">ESPACE PERSONNEL · CLIENT</p>
      <h1>{{ message }}</h1>
      <p class="welcome">Bonjour : {{ user?.login }}</p>
      <div class="saved-programme">
        <p>VOTRE PROGRAMME</p>
        <span>Votre espace personnel est prêt.</span>
        <RouterLink to="/programme">Explorer la programmation <span aria-hidden="true">↗</span></RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.client-dashboard {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding: 0 clamp(20px, 5vw, 76px);
  color: #fff;
  background: #000;
}

.logout-button {
  align-self: flex-end;
  margin-top: 18px;
  border: 1px solid #555;
  padding: 11px 13px;
  color: #fff;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
}

.logout-button span {
  margin-left: 10px;
  color: #c0fe04;
}

.client-content {
  display: grid;
  flex: 1;
  align-content: center;
  justify-items: center;
  padding: 80px 0;
  text-align: center;
}

.eyebrow,
.saved-programme > p {
  color: #999;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
}

.client-content h1 {
  max-width: 100%;
  margin: 10px 0;
  color: #c0fe04;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(32px, 7vw, 84px);
  font-weight: 600;
  line-height: 0.95;
  text-transform: uppercase;
}

.welcome {
  color: #aaa;
  font-size: 14px;
}

.saved-programme {
  display: flex;
  width: min(100%, 480px);
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-top: 36px;
  border: 1px solid #333;
  padding: 24px;
  text-align: left;
}

.saved-programme > p {
  margin: 0;
}

.saved-programme > span {
  color: #aaa;
  font-size: 13px;
}

.saved-programme a {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 8px;
  border-top: 1px solid #333;
  padding-top: 15px;
  color: #c0fe04;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 11px;
  text-decoration: none;
}
</style>
