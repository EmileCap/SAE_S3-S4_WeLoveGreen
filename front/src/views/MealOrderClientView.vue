<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PublicNavbar from '../components/PublicNavbar.vue'
import {
  cancelMealOrder,
  createMealOrder,
  getClientMealOrders,
  getMealOrderStatusLabel,
  getRestaurantMenus,
} from '../services/mealOrderService'
import { clearSession, getSession } from '../services/sessionService'

const router = useRouter()
const user = getSession()
const restaurants = ref(getRestaurantMenus())
const meals = computed(() => restaurants.value.flatMap((restaurant) => restaurant.categories.flatMap((category) => category.plats)))
const orders = ref([])
const errorMessage = ref('')
const refreshInterval = ref(null)
const isSubmitting = ref(null)
const activeOrders = computed(() => orders.value.filter((order) => order.statut !== 'prete'))

function refreshOrders() {
  if (user?.id) orders.value = getClientMealOrders(user.id)
}

function reserveMeal(meal) {
  errorMessage.value = ''
  isSubmitting.value = meal.id
  try {
    createMealOrder(meal.id, user)
    refreshOrders()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isSubmitting.value = null
  }
}

function cancelOrder(order) {
  errorMessage.value = ''
  try {
    cancelMealOrder(order.id, user)
    refreshOrders()
  } catch (error) {
    errorMessage.value = error.message
  }
}

function signOut() {
  clearSession()
  router.push({ name: 'home' })
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
  <main class="meals-page">
    <PublicNavbar :active-page="'Mon programme'" />
    <header class="meals-header">
      <div>
        <p class="eyebrow">ESPACE CLIENT · RESTAURATION</p>
        <h1>La file<br />des saveurs<span>.</span></h1>
        <p class="intro">Réservez votre plat et suivez sa préparation en temps réel sur cet appareil.</p>
      </div>
      <button class="logout-button" type="button" @click="signOut">Déconnexion ↗</button>
    </header>

    <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

    <section class="queue-section" aria-labelledby="queue-title" aria-live="polite">
      <div class="section-heading">
        <div>
          <p class="eyebrow">SUIVI DE COMMANDE</p>
          <h2 id="queue-title">Votre file</h2>
        </div>
        <span class="queue-count">{{ activeOrders.length }} en cours</span>
      </div>

      <p v-if="!orders.length" class="queue-empty">Aucune commande active. Choisissez un plat pour rejoindre la file.</p>
      <div v-else class="order-list">
        <article v-for="order in orders" :key="order.id" class="order-card" :class="`status-${order.statut}`">
          <div class="order-position">
            <template v-if="order.statut === 'prete'">✓</template>
            <template v-else>#{{ order.position }}</template>
          </div>
          <div class="order-info">
            <p class="order-meta">{{ order.prestataire?.nom }} · {{ getMealOrderStatusLabel(order.statut) }}</p>
            <h3>{{ order.plat?.nom }}</h3>
            <p v-if="order.statut !== 'prete'" class="wait-info">
              {{ order.statut === 'en_preparation' ? 'Votre plat est en préparation.' : `${order.enAttente} commande${order.enAttente === 1 ? '' : 's'} avant vous.` }}
            </p>
            <p v-else class="wait-info">Présentez-vous au stand pour récupérer votre commande.</p>
          </div>
          <button
            v-if="order.statut === 'en_attente'"
            class="cancel-button"
            type="button"
            @click="cancelOrder(order)"
          >Annuler</button>
        </article>
      </div>
    </section>

    <section class="menu-section" aria-labelledby="menu-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AU MENU</p>
          <h2 id="menu-title">Les plats</h2>
        </div>
        <span class="queue-count">{{ meals.length }} disponibles</span>
      </div>

      <section v-for="(restaurant, restaurantIndex) in restaurants" :key="restaurant.id" class="restaurant-menu">
        <header class="restaurant-heading">
          <p class="meal-provider">MENU DU RESTAURANT</p>
          <h3>{{ restaurant.nom }}<span> — les plats de {{ restaurant.nom }}</span></h3>
        </header>

        <section v-for="(category, categoryIndex) in restaurant.categories" :key="category.nom" class="menu-category">
          <h4>{{ category.nom }}</h4>
          <div class="meal-grid">
            <article v-for="meal in category.plats" :key="meal.id" class="meal-card">
              <div class="meal-art" :class="`meal-art-${((meal.id - 1) % 3) + 1}`">
                <span>{{ String(meal.id).padStart(2, '0') }}</span>
                <span class="meal-price">{{ meal.prix.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</span>
              </div>
              <div class="meal-content">
                <p class="meal-provider">{{ restaurant.nom }} · {{ category.nom }}</p>
                <h3>{{ meal.nom }}</h3>
                <p class="meal-description">{{ meal.description }}</p>
                <button
                  class="reserve-button"
                  type="button"
                  :disabled="isSubmitting === meal.id || orders.some((order) => order.platId === meal.id)"
                  @click="reserveMeal(meal)"
                >
                  <template v-if="orders.some((order) => order.platId === meal.id)">Déjà dans votre file</template>
                  <template v-else>{{ isSubmitting === meal.id ? 'Réservation…' : 'Réserver ce plat' }}</template>
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          </div>
        </section>
      </section>
      <p v-if="!meals.length" class="queue-empty">Aucun plat n’est disponible pour le moment.</p>
    </section>

    <p class="prototype-note">Démonstration locale : client et restaurateur doivent utiliser le même navigateur.</p>
  </main>
</template>

<style scoped>
.meals-page {
  min-height: 100vh;
  padding: 0 clamp(20px, 5vw, 76px) 75px;
  color: #fff;
  background: #000;
}

.meals-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 56px 0 45px;
  border-bottom: 1px solid #333;
}

.eyebrow,
.meal-provider,
.order-meta,
.meal-art > span:first-child,
.prototype-note {
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.eyebrow {
  margin: 0 0 14px;
  color: #c0fe04;
  font-size: 10px;
}

h1 {
  margin: 0 0 16px;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(48px, 9vw, 100px);
  letter-spacing: -0.06em;
  line-height: 0.88;
  text-transform: uppercase;
}

h1 span {
  color: #c0fe04;
}

.intro {
  max-width: 430px;
  margin: 0;
  color: #999;
  font-size: 13px;
  line-height: 1.7;
}

.logout-button {
  border: 1px solid #555;
  padding: 12px 16px;
  color: #fff;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  white-space: nowrap;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.queue-section,
.menu-section {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 36px;
}

.section-heading .eyebrow {
  margin-bottom: 8px;
  color: #888;
  font-size: 9px;
}

.section-heading h2 {
  margin: 0;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(28px, 4vw, 42px);
  text-transform: uppercase;
}

.queue-count {
  color: #999;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 10px;
  text-transform: uppercase;
}

.order-list {
  display: grid;
  gap: 8px;
}

.order-card {
  display: flex;
  align-items: center;
  gap: 18px;
  border: 1px solid #333;
  padding: 16px;
  background: #101010;
}

.order-position {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #555;
  color: #c0fe04;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 14px;
}

.status-en_preparation .order-position {
  border-color: #79baff;
  color: #79baff;
}

.status-prete .order-position {
  border-color: #60e2c2;
  color: #60e2c2;
}

.order-info {
  min-width: 0;
  flex: 1;
}

.order-meta {
  margin: 0 0 6px;
  color: #999;
  font-size: 9px;
}

.order-info h3 {
  margin: 0;
  font-size: 14px;
}

.wait-info {
  margin: 5px 0 0;
  color: #999;
  font-size: 11px;
}

.cancel-button,
.collect-button {
  border: 1px solid #555;
  padding: 9px 12px;
  color: #aaa;
  background: transparent;
  cursor: pointer;
  font-size: 10px;
}

.collect-button {
  border-color: #60e2c2;
  color: #60e2c2;
}

.menu-section {
  margin-top: 28px;
  border-top: 1px solid #333;
}

.restaurant-menu {
  margin-top: 28px;
  border-top: 1px solid #333;
  padding-top: 20px;
}

.restaurant-heading {
  margin-bottom: 20px;
}

.restaurant-heading .meal-provider {
  margin-bottom: 8px;
}

.restaurant-heading h3 {
  margin: 0;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(22px, 4vw, 32px);
  text-transform: uppercase;
}

.restaurant-heading h3 span {
  color: #999;
  font-family: Shapiro, Arial, sans-serif;
  font-size: 13px;
  font-weight: 400;
  text-transform: none;
}

.menu-category {
  margin: 18px 0 28px;
}

.menu-category h4 {
  margin: 0 0 12px;
  color: #c0fe04;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.meal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.meal-card {
  min-width: 0;
  border: 1px solid #303030;
  background: #101010;
}

.meal-art {
  display: flex;
  min-height: 180px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px;
  color: #000;
  background: #c0fe04;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 10px;
}

.meal-art-2 {
  background: #60e2c2;
}

.meal-art-3 {
  background: #ff6947;
}

.meal-price {
  border: 1px solid rgb(0 0 0 / 45%);
  padding: 7px;
}

.meal-content {
  padding: 18px;
}

.meal-provider {
  margin: 0 0 8px;
  color: #888;
  font-size: 9px;
}

.meal-content h3 {
  margin: 0;
  font-size: 18px;
}

.meal-description {
  min-height: 36px;
  margin: 9px 0 18px;
  color: #999;
  font-size: 11px;
  line-height: 1.6;
}

.reserve-button {
  display: flex;
  width: 100%;
  justify-content: space-between;
  border: 1px solid #c0fe04;
  padding: 12px;
  color: #c0fe04;
  background: transparent;
  cursor: pointer;
  font-size: 10px;
}

.reserve-button:not(:disabled):hover {
  color: #000;
  background: #c0fe04;
}

.reserve-button:disabled {
  border-color: #444;
  color: #777;
  cursor: not-allowed;
}

.queue-empty {
  border: 1px dashed #333;
  padding: 22px;
  color: #999;
  font-size: 12px;
}

.error-message {
  margin-top: 20px;
  color: #ff6b5f;
  font-size: 13px;
}

.prototype-note {
  margin-top: 42px;
  color: #666;
  font-size: 9px;
  text-align: center;
}

@media (max-width: 850px) {
  .meal-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .meals-header {
    align-items: flex-start;
    flex-direction: column;
    padding-top: 40px;
  }

  .logout-button {
    align-self: flex-end;
  }

  .meal-grid {
    grid-template-columns: 1fr;
  }

  .meal-art {
    min-height: 150px;
  }

  .order-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .order-info {
    width: calc(100% - 70px);
    flex: unset;
  }

  .cancel-button,
  .collect-button {
    margin-left: 64px;
  }
}
</style>
