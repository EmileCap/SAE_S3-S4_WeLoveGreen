<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PublicNavbar from '../components/PublicNavbar.vue'
import { getPassPurchase } from '../services/passService'

const route = useRoute()
const purchase = computed(() => getPassPurchase(route.params.id))
</script>

<template>
  <main class="success-page">
    <PublicNavbar active-page="Acheter un pass" />
    <section v-if="purchase" class="success-card" aria-live="polite">
      <div class="check-drawing" aria-hidden="true"><svg viewBox="0 0 96 96" role="img"><circle cx="48" cy="48" r="43" /><path d="m27 49 14 14 29-31" /></svg></div>
      <p class="eyebrow">MERCI POUR VOTRE COMMANDE</p>
      <h1>Achat validé<span>.</span></h1>
      <p class="success-copy">Votre {{ purchase.passName.toLowerCase() }} est prêt. Retrouvez votre billet et son QR code dans vos réservations.</p>
      <RouterLink class="reservations-button" :to="{ name: 'my-reservations' }">Voir mes réservations <span>↗</span></RouterLink>
    </section>
    <section v-else class="success-card">
      <p class="eyebrow">COMMANDE INTROUVABLE</p>
      <h1>Ce billet n’est pas disponible.</h1>
      <RouterLink class="reservations-button" :to="{ name: 'my-reservations' }">Voir mes réservations <span>↗</span></RouterLink>
    </section>
  </main>
</template>

<style scoped>
.success-page { min-height: 100vh; padding: 0 clamp(20px, 5vw, 76px) 60px; color: #fff; background: #000; }
.success-card { display: flex; min-height: min(690px, calc(100vh - 100px)); flex-direction: column; align-items: center; justify-content: center; margin: 0 auto; text-align: center; }
.check-drawing { display: grid; width: 112px; height: 112px; place-items: center; margin-bottom: 29px; border-radius: 50%; background: rgb(192 254 4 / 12%); }
.check-drawing svg { width: 83px; height: 83px; fill: none; stroke: #c0fe04; stroke-linecap: round; stroke-linejoin: round; stroke-width: 4; }
.check-drawing circle { stroke-dasharray: 270; stroke-dashoffset: 0; }
.check-drawing path { stroke-dasharray: 65; stroke-dashoffset: 0; }
.eyebrow { color: #c0fe04; font: 10px 'PP Fraktion Mono', 'Courier New', monospace; letter-spacing: .14em; }
.success-card h1 { margin: 12px 0; font: 600 clamp(44px, 8vw, 82px)/1 'Marathon Shapiro', Impact, sans-serif; }
.success-card h1 span { color: #c0fe04; }
.success-copy { max-width: 430px; color: #aaa; font-size: 13px; line-height: 1.7; }
.reservations-button { display: flex; min-width: 260px; justify-content: space-between; margin-top: 20px; border: 1px solid #c0fe04; padding: 16px 18px; color: #c0fe04; font: 11px 'PP Fraktion Mono', 'Courier New', monospace; text-decoration: none; }
.reservations-button:hover { color: #000; background: #c0fe04; }
</style>
