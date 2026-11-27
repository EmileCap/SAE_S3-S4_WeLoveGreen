<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AccountNavbar from '../components/layout/AccountNavbar.vue'
import {
  advanceMealOrder,
  getMealOrderStatusLabel,
  getProviderMealOrders,
  isRestaurantProvider,
  validateMealOrderCollection,
} from '../services/mealOrderService'
import { getSession } from '../services/sessionService'

const user = getSession()
const orders = ref([])
const errorMessage = ref('')
const refreshInterval = ref(null)
const hasRestaurantActivity = computed(() => isRestaurantProvider(user))
const navItems = [
  { label: 'Commandes', to: { name: 'provider-meals' } },
  { label: 'Ma programmation', to: { name: 'ma-programmation' } },
  { label: 'Carte du festival', to: { name: 'carte' } },
  { label: 'Statistiques' },
]

function refreshOrders() {
  orders.value = getProviderMealOrders(user)
}

function advance(order) {
  errorMessage.value = ''
  try {
    advanceMealOrder(order.id, user)
    refreshOrders()
  } catch (error) {
    errorMessage.value = error.message
  }
}

function validateCollection(order) {
  errorMessage.value = ''
  try {
    validateMealOrderCollection(order.id, user)
    refreshOrders()
  } catch (error) {
    errorMessage.value = error.message
  }
}

onMounted(() => {
  refreshOrders()
  refreshInterval.value = window.setInterval(refreshOrders, 1000)
  window.addEventListener('storage', refreshOrders)
})

onUnmounted(() => {
  window.clearInterval(refreshInterval.value)
  window.removeEventListener('storage', refreshOrders)
})
</script>

<template>
  <main class="orders-page">
    <AccountNavbar :items="navItems" active-page="Commandes" role-label="Prestataire" />
    <header class="orders-header">
      <div>
        <p class="eyebrow">ESPACE PRESTATAIRE · RESTAURATION</p>
        <h1>Commandes<span>.</span></h1>
        <p class="intro">Suivez votre file et faites avancer chaque commande quand elle est prête.</p>
      </div>
    </header>

    <section class="queue-summary" aria-live="polite">
      <strong>{{ orders.length }}</strong>
      <span>commande{{ orders.length === 1 ? '' : 's' }} dans la file active</span>
      <span class="refresh-note">Actualisation automatique</span>
    </section>

    <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

    <section v-if="!hasRestaurantActivity" class="empty-state">
      <h2>Gestion de commandes indisponible</h2>
      <p>Cette fonctionnalité est réservée aux prestataires ayant une activité de restauration.</p>
      <RouterLink :to="{ name: 'dashboard' }">Retour à mon espace</RouterLink>
    </section>

    <section v-else-if="!orders.length" class="empty-state" aria-live="polite">
      <span class="empty-icon" aria-hidden="true">✓</span>
      <h2>La file est vide</h2>
      <p>Les nouvelles réservations apparaîtront ici automatiquement.</p>
    </section>

    <section v-else class="order-list" aria-label="Commandes à traiter">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <div class="queue-number">{{ order.statut === 'prete' ? '✓' : String(order.position).padStart(2, '0') }}</div>
        <div class="order-main">
          <p class="order-meta">COMMANDE · {{ order.client?.login ?? 'Client' }}</p>
          <h2>{{ order.plat?.nom ?? 'Plat' }}</h2>
          <p class="order-time">Réservée à {{ new Date(order.creeLe).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</p>
        </div>
        <div class="order-status" :class="`status-${order.statut}`">
          <span class="status-dot"></span>
          {{ getMealOrderStatusLabel(order.statut) }}
        </div>
        <button
          v-if="order.peutAvancer"
          class="advance-button"
          type="button"
          @click="advance(order)"
        >
          {{ order.statut === 'en_attente' ? 'Commencer' : 'Marquer prête' }}
          <span aria-hidden="true">↗</span>
        </button>
        <button
          v-else-if="order.peutValiderRecuperation"
          class="advance-button"
          type="button"
          @click="validateCollection(order)"
        >
          Valider la récupération ✓
        </button>
        <span v-else class="done-label">Commande terminée</span>
      </article>
    </section>

    <p class="prototype-note">Démonstration locale : les commandes sont enregistrées dans ce navigateur.</p>
  </main>
</template>

<style scoped>
.orders-page {
  min-height: 100vh;
  padding: 0 clamp(20px, 5vw, 76px) 70px;
  color: #fff;
  background: #000;
}

.orders-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 62px 0 42px;
  border-bottom: 1px solid #333;
}

.eyebrow,
.order-meta,
.queue-number,
.queue-summary,
.prototype-note {
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.eyebrow {
  margin: 0;
  color: #60e2c2;
  font-size: 10px;
}

h1 {
  margin: 16px 0 12px;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(48px, 9vw, 100px);
  letter-spacing: -0.06em;
  line-height: 0.95;
}

h1 span {
  color: #60e2c2;
}

.intro {
  margin: 0;
  color: #999;
  font-size: 13px;
}

.logout-button,
.advance-button {
  border: 1px solid #60e2c2;
  padding: 12px 16px;
  color: #60e2c2;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  white-space: nowrap;
}

.queue-summary {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 23px 0;
  color: #999;
  font-size: 10px;
}

.queue-summary strong {
  color: #60e2c2;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: 30px;
}

.refresh-note {
  margin-left: auto;
  color: #666;
  font-size: 9px;
}

.order-list {
  display: grid;
  gap: 10px;
}

.order-card {
  display: grid;
  grid-template-columns: 58px minmax(180px, 1fr) minmax(140px, auto) auto;
  align-items: center;
  gap: 22px;
  border: 1px solid #303030;
  padding: 21px;
  background: #101010;
}

.queue-number {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid #60e2c2;
  color: #60e2c2;
  font-size: 12px;
}

.order-meta {
  margin: 0 0 8px;
  color: #777;
  font-size: 9px;
}

.order-main h2 {
  margin: 0;
  font-size: 17px;
}

.order-time {
  margin: 7px 0 0;
  color: #999;
  font-size: 11px;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d6bd75;
  font-size: 11px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-en_preparation {
  color: #78baff;
}

.status-prete {
  color: #60e2c2;
}

.advance-button {
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.advance-button:hover {
  color: #000;
  background: #60e2c2;
}

.done-label {
  color: #60e2c2;
  font-size: 11px;
}

.empty-state {
  display: grid;
  min-height: 360px;
  align-content: center;
  justify-items: center;
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 1px solid #60e2c2;
  border-radius: 50%;
  color: #60e2c2;
  font-size: 24px;
}

.empty-state h2 {
  margin: 20px 0 8px;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: 30px;
}

.empty-state p {
  color: #999;
  font-size: 13px;
}

.empty-state a {
  margin-top: 14px;
  color: #60e2c2;
}

.error-message {
  color: #ff6b5f;
  font-size: 13px;
}

.prototype-note {
  margin-top: 32px;
  color: #666;
  font-size: 9px;
  text-align: center;
}

@media (max-width: 760px) {
  .orders-header {
    align-items: flex-start;
    flex-direction: column;
    padding-top: 44px;
  }

  .order-card {
    grid-template-columns: 48px 1fr;
    gap: 15px;
  }

  .order-status,
  .advance-button,
  .done-label {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
