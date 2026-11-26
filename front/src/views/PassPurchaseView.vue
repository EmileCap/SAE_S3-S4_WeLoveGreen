<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PublicNavbar from '../components/PublicNavbar.vue'
import { FESTIVAL_DAYS, getPassTypes } from '../services/passService'

const router = useRouter()
const passes = getPassTypes()
const selectedPassId = ref('')
const selectedDates = ref([])
const selectedPass = computed(() => passes.find((pass) => pass.id === selectedPassId.value) ?? null)
const canContinue = computed(() => selectedPass.value && selectedDates.value.length === selectedPass.value.days)

function choosePass(pass) {
  selectedPassId.value = pass.id
  selectedDates.value = pass.days === 3 ? FESTIVAL_DAYS.map((day) => day.date) : []
}

function toggleDate(date) {
  if (selectedDates.value.includes(date)) {
    selectedDates.value = selectedDates.value.filter((selected) => selected !== date)
  } else if (selectedDates.value.length < (selectedPass.value?.days ?? 0)) {
    selectedDates.value = [...selectedDates.value, date].sort()
  }
}

function continueToPayment() {
  if (!canContinue.value) return
  router.push({ name: 'pass-payment', query: { pass: selectedPassId.value, dates: selectedDates.value.join(',') } })
}
</script>

<template>
  <main class="pass-page">
    <PublicNavbar active-page="Acheter un pass" />
    <section class="page-heading">
      <p class="eyebrow">BILLETTERIE · 10 — 12 JUILLET 2026</p>
      <h1>CHOISISSEZ<br />VOTRE PASS<span>.</span></h1>
      <p>Trois jours de musique, de rencontres et d’idées pour demain.</p>
    </section>

    <section class="purchase-content">
      <p class="step-label">01 / CHOIX DU PASS</p>
      <div class="pass-grid">
        <button
          v-for="pass in passes"
          :key="pass.id"
          class="pass-card"
          :class="{ selected: selectedPassId === pass.id }"
          type="button"
          :aria-pressed="selectedPassId === pass.id"
          @click="choosePass(pass)"
        >
          <span class="pass-days">{{ pass.days }} {{ pass.days === 1 ? 'JOUR' : 'JOURS' }}</span>
          <span class="pass-name">{{ pass.name }}</span>
          <span class="pass-description">{{ pass.description }}</span>
          <span class="pass-price">{{ pass.price }} €</span>
          <span class="select-label">{{ selectedPassId === pass.id ? 'SÉLECTIONNÉ' : 'CHOISIR' }} <span>↗</span></span>
        </button>
      </div>

      <section v-if="selectedPass && selectedPass.days < 3" class="date-selection">
        <div>
          <p class="step-label">02 / CHOIX DES JOURS</p>
          <h2>Sélectionnez {{ selectedPass.days === 1 ? 'votre journée' : 'vos deux journées' }}</h2>
          <p class="helper">Choisissez {{ selectedPass.days }} {{ selectedPass.days === 1 ? 'date' : 'dates' }} parmi les trois jours du festival.</p>
        </div>
        <div class="date-grid">
          <button
            v-for="day in FESTIVAL_DAYS"
            :key="day.date"
            class="date-option"
            :class="{ selected: selectedDates.includes(day.date), disabled: !selectedDates.includes(day.date) && selectedDates.length >= selectedPass.days }"
            type="button"
            :aria-pressed="selectedDates.includes(day.date)"
            @click="toggleDate(day.date)"
          >
            <span>{{ day.label }}</span><span>{{ selectedDates.includes(day.date) ? '✓' : '+' }}</span>
          </button>
        </div>
      </section>
      <section v-else-if="selectedPass" class="date-selection three-day-note">
        <p class="step-label">02 / DATES INCLUSES</p>
        <h2>Les trois jours du festival</h2>
        <p class="helper">Votre pass comprend les 10, 11 et 12 juillet 2026.</p>
      </section>

      <div v-if="selectedPass" class="order-summary">
        <div><span>Votre sélection</span><strong>{{ selectedPass.name }} · {{ selectedDates.length }} jour{{ selectedDates.length > 1 ? 's' : '' }}</strong></div>
        <div><span>Total</span><strong>{{ selectedPass.price }} €</strong></div>
        <button class="primary-button" type="button" :disabled="!canContinue" @click="continueToPayment">
          Continuer vers le paiement <span>↗</span>
        </button>
      </div>
      <p class="demo-warning">Paiement de démonstration : aucune transaction bancaire réelle ne sera effectuée.</p>
    </section>
  </main>
</template>

<style scoped>
.pass-page { min-height: 100vh; padding: 0 clamp(20px, 5vw, 76px) 90px; color: #fff; background: #000; }
.page-heading { display: flex; min-height: 330px; flex-direction: column; justify-content: center; border-bottom: 1px solid #333; }
.eyebrow, .step-label { color: #c0fe04; font-family: 'PP Fraktion Mono', 'Courier New', monospace; font-size: 10px; letter-spacing: .13em; }
.page-heading h1 { margin: 17px 0 12px; font-family: 'Marathon Shapiro', Impact, sans-serif; font-size: clamp(54px, 10vw, 112px); line-height: .88; }
.page-heading h1 span { color: #c0fe04; }
.page-heading > p:last-child, .helper { color: #999; font-size: 13px; }
.purchase-content { max-width: 1100px; margin: 0 auto; }
.step-label { margin: 30px 0 16px; }
.pass-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.pass-card { display: flex; min-height: 270px; flex-direction: column; align-items: flex-start; border: 1px solid #444; padding: 23px; color: #fff; background: #101010; cursor: pointer; text-align: left; transition: border-color .15s, background .15s; }
.pass-card:hover, .pass-card.selected { border-color: #c0fe04; background: #151a08; }
.pass-days { color: #c0fe04; font: 10px 'PP Fraktion Mono', 'Courier New', monospace; letter-spacing: .12em; }
.pass-name { margin-top: 23px; font-size: 22px; font-weight: 700; }
.pass-description { min-height: 40px; margin-top: 9px; color: #999; font-size: 12px; line-height: 1.6; }
.pass-price { margin-top: auto; padding-top: 19px; font-size: 25px; font-weight: 700; }
.select-label { display: flex; width: 100%; justify-content: space-between; margin-top: 17px; border-top: 1px solid #393939; padding-top: 13px; color: #c0fe04; font: 10px 'PP Fraktion Mono', 'Courier New', monospace; }
.date-selection { margin-top: 28px; border-top: 1px solid #333; padding-top: 3px; }
.date-selection .step-label { margin-top: 25px; }
.date-selection h2 { margin: 0; font-size: 20px; }
.helper { margin: 8px 0 17px; }
.date-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.date-option { display: flex; justify-content: space-between; gap: 12px; border: 1px solid #444; padding: 16px; color: #ddd; background: #101010; cursor: pointer; text-align: left; font-size: 12px; }
.date-option span:last-child { color: #c0fe04; }
.date-option.selected { border-color: #c0fe04; color: #c0fe04; }
.date-option.disabled { opacity: .4; }
.three-day-note { padding-bottom: 5px; }
.order-summary { display: grid; gap: 17px; margin-top: 28px; border: 1px solid #444; padding: 21px; }
.order-summary > div { display: flex; justify-content: space-between; gap: 20px; color: #999; font-size: 12px; }
.order-summary strong { color: #fff; text-align: right; }
.primary-button { display: flex; min-height: 52px; align-items: center; justify-content: space-between; border: 0; padding: 0 18px; color: #000; background: #c0fe04; cursor: pointer; font-size: 13px; font-weight: 700; }
.primary-button:disabled { cursor: not-allowed; opacity: .45; }
.demo-warning { color: #777; font-size: 10px; text-align: center; }
@media (max-width: 720px) { .pass-grid { grid-template-columns: 1fr; } .pass-card { min-height: 225px; } .date-grid { grid-template-columns: 1fr; } }
</style>
