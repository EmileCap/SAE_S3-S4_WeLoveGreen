<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { buildingTypes } from '@/data/buildingTypes.js'
import { extraFields, pointsOf } from '@/data/buildingFields.js'
import { prestataireName } from '@/data/prestataires.js'
import { useBuildings } from '@/composables/useBuildings.js'
import MenuDisplay from '@/components/buildings/MenuDisplay.vue'
import ProgrammeDisplay from '@/components/buildings/ProgrammeDisplay.vue'
import StatusBadge from '@/components/buildings/StatusBadge.vue'

// Page d'examen d'une demande (gestionnaire) : toutes les infos du bâtiment, une remarque possible
// sur chaque point, un message général, puis la décision : autoriser, demander des modifications ou refuser.
const props = defineProps({
  id: { type: String, required: true }, // vient de l'adresse /administration/:id
})

const router = useRouter()
const { getById, loading, authorizeBuilding, requestChanges, refuseBuilding } = useBuildings()

const building = computed(() => getById(props.id) ?? null)
const points = computed(() => (building.value ? pointsOf(building.value.type) : []))
const canDecide = computed(() => building.value?.status === 'en_attente')

// Ce que le gestionnaire est en train d'écrire (rien n'est envoyé avant la décision)
const remarks = reactive({})
const message = ref('')
const error = ref('')
const askingRefuse = ref(false) // refuser est définitif : on demande une confirmation

// La valeur à afficher pour une rubrique (le menu et le programme ont leur propre affichage)
const valueOf = (key) => building.value[key] || '—'

// Titre du retour déjà envoyé, selon l'état de la demande
const feedbackTitles = {
  en_attente: 'Votre précédent retour (le prestataire a renvoyé sa demande)',
  a_modifier: 'Retour envoyé, en attente de la correction du prestataire',
  refuse: 'Motif du refus',
}

// Exécute la décision, puis retourne à la liste ; une erreur reste affichée sur la page
function decide(action) {
  try {
    error.value = ''
    action()
    router.push({ name: 'administration' })
  } catch (e) {
    error.value = e.message
  }
}
const feedback = () => ({ message: message.value, remarks: { ...remarks } })
const authorize = () => decide(() => authorizeBuilding(props.id))
const askChanges = () => decide(() => requestChanges(props.id, feedback()))
const refuse = () => decide(() => refuseBuilding(props.id, feedback()))
</script>

<template>
  <main class="page">
    <div class="content">
      <RouterLink :to="{ name: 'administration' }" class="btn btn-sm back">← Programmation</RouterLink>

      <p v-if="loading" class="notice">Chargement…</p>
      <p v-else-if="!building" class="notice">Cette demande n'existe pas.</p>

      <template v-else>
        <h1>{{ building.name }} <StatusBadge :building="building" /></h1>
        <p class="subtitle">
          {{ buildingTypes[building.type]?.label }} · Prestataire : {{ prestataireName(building.ownerId) }}
          <template v-if="building.contact"> · Contact : {{ building.contact.email }}<template v-if="building.contact.phone"> · {{ building.contact.phone }}</template></template>
        </p>

        <p v-if="building.feedback?.message && feedbackTitles[building.status]" class="feedback">
          <strong>{{ feedbackTitles[building.status] }}</strong><br />{{ building.feedback.message }}
        </p>

        <section class="panel">
          <h2>Informations de la demande</h2>

          <div v-for="point in points" :key="point.key" class="point">
            <h3>{{ point.label }}</h3>
            <MenuDisplay v-if="point.key === 'menu'" :menu="building.menu ?? []" hide-title />
            <ProgrammeDisplay v-else-if="point.key === 'programme'" :programme="building.programme ?? []" />
            <p v-else class="value">{{ valueOf(point.key) }}</p>
            <p v-if="extraFields[point.key]?.public === false" class="hint">Non visible par le public.</p>

            <p v-if="building.feedback?.remarks?.[point.key]" class="sent">Remarque envoyée : {{ building.feedback.remarks[point.key] }}</p>
            <label v-if="canDecide" class="remark">Remarque pour le prestataire (facultatif)
              <input v-model="remarks[point.key]" maxlength="200" />
            </label>
          </div>
        </section>

        <section v-if="canDecide" class="panel">
          <h2>Votre décision</h2>
          <label>Message général au prestataire
            <textarea v-model="message" rows="3" maxlength="500" placeholder="Obligatoire pour refuser"></textarea>
          </label>
          <p class="hint">
            Le message et les remarques sont envoyés avec « Demander des modifications » ou « Refuser »
            (un motif est obligatoire pour refuser). « Autoriser » ne les envoie pas.
          </p>

          <div class="actions">
            <template v-if="askingRefuse">
              <span class="ask">Refuser définitivement ?</span>
              <button class="btn btn-danger btn-solid" @click="refuse">Oui, refuser</button>
              <button class="btn btn-outline-secondary" @click="askingRefuse = false">Annuler</button>
            </template>
            <template v-else>
              <button class="btn btn-success btn-solid" @click="authorize">Autoriser</button>
              <button class="btn btn-warning" @click="askChanges">Demander des modifications</button>
              <button class="btn btn-outline-danger" @click="askingRefuse = true">Refuser</button>
            </template>
          </div>
          <p v-if="error" class="error">{{ error }}</p>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.page {
  position: fixed;
  inset: 48px 0 0 0;
  overflow-y: auto;
  background: #f4f5f7;
  color: #222;
  font-family: system-ui, sans-serif;
}
.content { max-width: 860px; margin: 0 auto; padding: 28px 24px 40px; }
.back { margin-bottom: 12px; }
h1 { display: flex; align-items: center; gap: 12px; margin: 0 0 4px; font-size: 24px; }
h2 { margin: 0 0 8px; font-size: 16px; }
h3 { margin: 0 0 2px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #666; }
.subtitle { margin: 0 0 20px; font-size: 13px; color: #666; }
.notice { padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); }
.feedback { margin: 0 0 16px; padding: 12px 16px; border-radius: 8px; background: #fff4e5; color: #6b3a00; font-size: 14px; }
.panel { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); }

.point { padding: 10px 0; border-bottom: 1px solid #eee; }
.point:last-child { border-bottom: none; }
.value { margin: 0; white-space: pre-line; }
.hint { margin: 2px 0 0; font-size: 12px; color: #777; }
.sent { margin: 6px 0 0; padding: 4px 10px; border-radius: 6px; background: #fff4e5; font-size: 13px; color: #6b3a00; }

label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #444; }
.remark { margin-top: 8px; }
input, textarea { padding: 8px; border: 1px solid #bbb; border-radius: 6px; font: inherit; }

.actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
.ask { font-size: 13px; color: #8a1c1c; }
.error { margin: 0; padding: 8px 10px; border-radius: 6px; background: #f8d7da; color: #8a1c1c; font-size: 13px; }
</style>
