<script setup>
import { computed, ref } from 'vue'
import QRCode from 'qrcode'
import PublicNavbar from '../components/PublicNavbar.vue'
import { FESTIVAL_DAYS, getUserPasses } from '../services/passService'

const reservations = ref(getUserPasses())
const qrCodes = ref({})
const dateLabel = (date) => FESTIVAL_DAYS.find((day) => day.date === date)?.label ?? date
const hasReservations = computed(() => reservations.value.length > 0)

async function generateQrCodes() {
  const entries = await Promise.all(reservations.value.map(async (reservation) => {
    const dataUrl = await QRCode.toDataURL(`WLG-TICKET:${reservation.code}`, {
      width: 220,
      margin: 1,
      color: { dark: '#111111', light: '#ffffff' },
    })
    return [reservation.id, dataUrl]
  }))
  qrCodes.value = Object.fromEntries(entries)
}

generateQrCodes()
</script>

<template>
  <main class="reservations-page">
    <PublicNavbar active-page="Mes réservations" />
    <section class="page-heading">
      <p class="eyebrow">ESPACE PERSONNEL · BILLETTERIE</p>
      <h1>MES RÉSERVATIONS<span>.</span></h1>
      <p>Vos pass et billets pour retrouver le festival en toute simplicité.</p>
    </section>

    <section class="reservations-content">
      <div v-if="!hasReservations" class="empty-state">
        <p class="eyebrow">AUCUN PASS POUR LE MOMENT</p>
        <h2>Votre prochain souvenir commence ici.</h2>
        <p>Choisissez votre pass et retrouvez votre billet dans cet espace après validation de l’achat.</p>
        <RouterLink class="buy-button" :to="{ name: 'pass-purchase' }">Acheter un pass <span>↗</span></RouterLink>
      </div>
      <article v-for="reservation in reservations" :key="reservation.id" class="ticket-card">
        <div class="ticket-details">
          <p class="eyebrow">PASS FESTIVAL · {{ reservation.status.toUpperCase() }}</p>
          <h2>{{ reservation.passName }}</h2>
          <p class="ticket-dates">{{ reservation.dates.map(dateLabel).join(' · ') }}</p>
          <dl>
            <div><dt>Billet</dt><dd>{{ reservation.code.slice(0, 8).toUpperCase() }}</dd></div>
            <div><dt>Achat</dt><dd>{{ new Date(reservation.purchasedAt).toLocaleDateString('fr-FR') }}</dd></div>
            <div><dt>Montant</dt><dd>{{ reservation.price }} €</dd></div>
          </dl>
          <p class="ticket-note">Présentez ce QR code à l’entrée du festival.</p>
        </div>
        <div class="qr-panel">
          <img v-if="qrCodes[reservation.id]" :src="qrCodes[reservation.id]" :alt="`QR code du billet ${reservation.code.slice(0, 8)}`" />
          <div v-else class="qr-loading" aria-label="Génération du QR code">…</div>
          <span>{{ reservation.code.slice(0, 8).toUpperCase() }}</span>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.reservations-page { min-height: 100vh; padding: 0 clamp(20px, 5vw, 76px) 90px; color: #fff; background: #000; }
.page-heading { display: flex; min-height: 300px; flex-direction: column; justify-content: center; border-bottom: 1px solid #333; }
.eyebrow { color: #c0fe04; font: 10px 'PP Fraktion Mono', 'Courier New', monospace; letter-spacing: .13em; }
.page-heading h1 { margin: 17px 0 12px; font: 600 clamp(42px, 8vw, 90px)/.95 'Marathon Shapiro', Impact, sans-serif; }
.page-heading h1 span { color: #c0fe04; }
.page-heading > p:last-child { color: #999; font-size: 13px; }
.reservations-content { display: grid; max-width: 950px; gap: 18px; margin: 36px auto 0; }
.ticket-card { display: grid; grid-template-columns: minmax(0, 1fr) 230px; border: 1px solid #414141; background: #101010; }
.ticket-details { padding: clamp(22px, 4vw, 38px); }
.ticket-details h2 { margin: 12px 0; font-size: 27px; }
.ticket-dates { color: #c0fe04; font-size: 13px; }
.ticket-details dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 28px; border-top: 1px solid #3b3b3b; padding-top: 18px; }
.ticket-details dl div { min-width: 0; }
.ticket-details dt { margin-bottom: 7px; color: #777; font: 9px 'PP Fraktion Mono', 'Courier New', monospace; text-transform: uppercase; }
.ticket-details dd { margin: 0; font-size: 12px; }
.ticket-note { color: #888; font-size: 11px; }
.qr-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border-left: 1px dashed #555; padding: 22px; background: #f4f4f0; }
.qr-panel img, .qr-loading { width: 170px; height: 170px; }
.qr-loading { display: grid; place-items: center; color: #111; }
.qr-panel span { color: #333; font: 10px 'PP Fraktion Mono', 'Courier New', monospace; letter-spacing: .1em; }
.empty-state { display: flex; min-height: 340px; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #333; padding: 30px; text-align: center; }
.empty-state h2 { margin: 5px 0; font: 600 clamp(25px, 5vw, 42px) 'Marathon Shapiro', Impact, sans-serif; }
.empty-state > p:not(.eyebrow) { max-width: 440px; color: #999; font-size: 12px; line-height: 1.7; }
.buy-button { display: flex; min-width: 220px; justify-content: space-between; margin-top: 17px; border: 1px solid #c0fe04; padding: 14px; color: #c0fe04; font: 10px 'PP Fraktion Mono', 'Courier New', monospace; text-decoration: none; }
@media (max-width: 650px) { .ticket-card { grid-template-columns: 1fr; } .qr-panel { border-top: 1px dashed #555; border-left: 0; } .ticket-details dl { grid-template-columns: 1fr; } }
</style>
