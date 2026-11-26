<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicNavbar from '../components/PublicNavbar.vue'
import { FESTIVAL_DAYS, getPassTypes, createPassPurchase } from '../services/passService'

const route = useRoute()
const router = useRouter()
const passes = getPassTypes()
const pass = computed(() => passes.find((entry) => entry.id === route.query.pass) ?? null)
const dates = computed(() => String(route.query.dates ?? '').split(',').filter(Boolean))
const dateLabels = computed(() => dates.value.map((date) => FESTIVAL_DAYS.find((day) => day.date === date)?.label).filter(Boolean))
const cardholder = ref('')
const cardNumber = ref('')
const expiry = ref('')
const securityCode = ref('')
const errorMessage = ref('')
const isProcessing = ref(false)

if (!pass.value || dates.value.length !== pass.value.days || dateLabels.value.length !== dates.value.length) {
  router.replace({ name: 'pass-purchase' })
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function updateCardNumber(event) {
  cardNumber.value = formatCardNumber(event.target.value)
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function updateExpiry(event) {
  expiry.value = formatExpiry(event.target.value)
}

const isCardNumberValid = computed(() => /^\d{4} \d{4} \d{4} \d{4}$/.test(cardNumber.value))
const isExpiryValid = computed(() => {
  if (!/^\d{2}\/\d{2}$/.test(expiry.value)) return false
  const month = Number(expiry.value.slice(0, 2))
  return month >= 1 && month <= 12
})
const isSecurityCodeValid = computed(() => /^\d{3}$/.test(securityCode.value))
const isPaymentFormValid = computed(() =>
  Boolean(pass.value && cardholder.value.trim() && isCardNumberValid.value && isExpiryValid.value && isSecurityCodeValid.value),
)

async function submitPayment() {
  errorMessage.value = ''
  if (!isPaymentFormValid.value || isProcessing.value) return

  isProcessing.value = true

  try {
    const purchase = createPassPurchase({ passId: pass.value.id, dates: dates.value })
    // Petite attente pour simuler le traitement ; les coordonnées ne sont jamais stockées.
    await new Promise((resolve) => window.setTimeout(resolve, 900))
    cardholder.value = ''
    cardNumber.value = ''
    expiry.value = ''
    securityCode.value = ''
    router.push({ name: 'purchase-success', params: { id: purchase.id } })
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <main class="payment-page">
    <PublicNavbar active-page="Acheter un pass" />
    <section class="payment-layout">
      <div class="payment-intro">
        <p class="eyebrow">BILLETTERIE · ÉTAPE 02</p>
        <h1>FINALISER<br />L’ACHAT<span>.</span></h1>
        <p>Complétez les informations ci-dessous pour valider votre commande de démonstration.</p>
      </div>
      <div class="payment-column">
        <section class="summary-card" v-if="pass">
          <p class="step-label">VOTRE COMMANDE</p>
          <div class="summary-line"><strong>{{ pass.name }}</strong><strong>{{ pass.price }} €</strong></div>
          <p class="dates">{{ dateLabels.join(' · ') }}</p>
          <div class="summary-total"><span>Total à régler</span><strong>{{ pass.price }} €</strong></div>
        </section>

        <form class="payment-form" @submit.prevent="submitPayment">
          <p class="step-label">COORDONNÉES DE PAIEMENT</p>
          <label for="cardholder">Nom du titulaire</label>
          <input id="cardholder" v-model="cardholder" autocomplete="cc-name" placeholder="Nom indiqué sur la carte" required />
          <label for="card-number">Numéro de carte</label>
          <input
            id="card-number"
            :value="cardNumber"
            autocomplete="cc-number"
            inputmode="numeric"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            pattern="[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}"
            aria-describedby="card-number-hint"
            required
            @input="updateCardNumber"
          />
          <small id="card-number-hint" class="field-hint">16 chiffres, regroupés par 4.</small>
          <div class="card-details">
            <div>
              <label for="expiry">Date d’expiration</label>
              <input
                id="expiry"
                :value="expiry"
                autocomplete="cc-exp"
                inputmode="numeric"
                placeholder="MM/AA"
                maxlength="5"
                pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                required
                @input="updateExpiry"
              />
            </div>
            <div>
              <label for="security-code">Cryptogramme</label>
              <input
                id="security-code"
                v-model="securityCode"
                autocomplete="cc-csc"
                inputmode="numeric"
                placeholder="123"
                maxlength="3"
                pattern="[0-9]{3}"
                required
                @input="securityCode = securityCode.replace(/\\D/g, '').slice(0, 3)"
              />
            </div>
          </div>
          <p v-if="cardNumber && !isCardNumberValid" class="field-error">Le numéro doit contenir 16 chiffres.</p>
          <p v-if="expiry && !isExpiryValid" class="field-error">Saisissez une date au format MM/AA avec un mois entre 01 et 12.</p>
          <p v-if="securityCode && !isSecurityCodeValid" class="field-error">Le cryptogramme doit contenir 3 chiffres.</p>
          <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
          <button class="submit-button" type="submit" :disabled="!isPaymentFormValid || isProcessing">
            <span>{{ isProcessing ? 'Validation en cours…' : 'Valider mon achat' }}</span>
            <span v-if="!isProcessing">↗</span>
            <span v-else class="spinner" aria-hidden="true"></span>
          </button>
          <p class="demo-warning">Paiement fictif : les champs sont requis pour la démonstration, mais les coordonnées ne sont pas vérifiées, transmises ni enregistrées.</p>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.payment-page { min-height: 100vh; padding: 0 clamp(20px, 5vw, 76px) 80px; color: #fff; background: #000; }
.payment-layout { display: grid; max-width: 1120px; grid-template-columns: .9fr 1.1fr; gap: clamp(35px, 8vw, 110px); margin: 0 auto; padding-top: 72px; }
.eyebrow, .step-label { color: #c0fe04; font: 10px 'PP Fraktion Mono', 'Courier New', monospace; letter-spacing: .13em; }
.payment-intro h1 { margin: 22px 0 15px; font: 600 clamp(48px, 7vw, 82px)/.9 'Marathon Shapiro', Impact, sans-serif; }
.payment-intro h1 span { color: #c0fe04; }
.payment-intro > p:last-child { max-width: 360px; color: #999; font-size: 13px; line-height: 1.7; }
.payment-column { display: grid; align-content: start; gap: 18px; }
.summary-card, .payment-form { border: 1px solid #383838; padding: 23px; background: #101010; }
.step-label { margin: 0 0 20px; }
.summary-line, .summary-total { display: flex; justify-content: space-between; gap: 20px; font-size: 13px; }
.dates { color: #999; font-size: 11px; }
.summary-total { margin-top: 18px; border-top: 1px solid #383838; padding-top: 16px; color: #aaa; }
.summary-total strong { color: #c0fe04; font-size: 18px; }
.payment-form { display: flex; flex-direction: column; }
.payment-form label { margin: 12px 0 7px; font-size: 11px; }
.payment-form input { width: 100%; height: 46px; border: 1px solid #444; border-radius: 0; padding: 0 12px; color: #fff; background: #070707; font-size: 12px; }
.payment-form input:focus { border-color: #c0fe04; outline: 1px solid #c0fe04; }
.payment-form input::placeholder { color: #777; }
.field-hint { margin-top: 6px; color: #777; font-size: 10px; }
.field-error { margin: 7px 0 0; color: #ff6b5f; font-size: 10px; }
.card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.card-details > div { display: flex; flex-direction: column; }
.submit-button { display: flex; min-height: 52px; justify-content: space-between; align-items: center; margin-top: 20px; border: 0; padding: 0 16px; color: #000; background: #c0fe04; cursor: pointer; font-weight: 700; }
.submit-button:disabled { cursor: not-allowed; opacity: .5; }
.spinner { width: 17px; height: 17px; border: 2px solid rgb(0 0 0 / 28%); border-top-color: #000; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.demo-warning { color: #888; font-size: 10px; line-height: 1.6; }
.error-message { color: #ff6b5f; font-size: 12px; }
@media (max-width: 760px) { .payment-layout { grid-template-columns: 1fr; padding-top: 38px; } .payment-intro h1 { font-size: 57px; } }
</style>
