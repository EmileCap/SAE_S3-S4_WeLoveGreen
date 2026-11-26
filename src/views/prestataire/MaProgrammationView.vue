<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { buildingTypes } from '@/data/buildingTypes.js'
import { useAuth } from '@/composables/useAuth.js'
import { useBuildings } from '@/composables/useBuildings.js'
import { useSelection } from '@/composables/useSelection.js'
import { changesFrom, emptyDraft } from '@/utils/buildingDraft.js'
import BuildingFields from '@/components/buildings/BuildingFields.vue'
import StatusBadge from '@/components/buildings/StatusBadge.vue'

// Page "Ma programmation" du prestataire : ses demandes de bâtiment + le formulaire pour en faire une.
const router = useRouter()
const { userId } = useAuth()
const { myBuildings, addBuilding } = useBuildings()
const { highlight } = useSelection()

// Seuls les types réservables sont proposés (pas la grande roue ni les toilettes)
const reservableTypes = Object.fromEntries(
  Object.entries(buildingTypes).filter(([, type]) => type.reservable),
)

// Le formulaire = nom, type, contact + le brouillon des rubriques (celles-ci changent selon le type, voir BuildingFields)
const emptyForm = () => ({ name: '', type: '', email: '', phone: '', ...emptyDraft() })
const form = ref(emptyForm())

const message = ref('')
const isError = ref(false)

// Le motif d'un refus est caché : un clic sur « Refusée » l'affiche (les ids des demandes dont le motif est affiché)
const shownReasons = ref([])
const hasReason = (b) => b.status === 'refuse' && !!b.feedback?.message
const isReasonShown = (id) => shownReasons.value.includes(id)
function toggleReason(id) {
  shownReasons.value = isReasonShown(id) ? shownReasons.value.filter((x) => x !== id) : [...shownReasons.value, id]
}

// Retour du gestionnaire à afficher sous la demande : corrections demandées, ou motif du refus une fois « Refusée » cliqué
function feedbackLine(b) {
  if (b.status === 'a_modifier') return `Retour du gestionnaire : ${b.feedback?.message || 'voir les remarques sur chaque point.'}`
  if (hasReason(b) && isReasonShown(b.id)) return `Motif du refus : ${b.feedback.message}`
  return ''
}

function showOnMap(id) {
  highlight(id)
  router.push({ name: 'carte' })
}

function submit() {
  try {
    const f = form.value
    addBuilding(
      {
        name: f.name.trim(),
        type: f.type,
        contact: { email: f.email.trim(), phone: f.phone.trim() },
        ...changesFrom(f, f.type),
      },
      userId.value,
    )
    form.value = emptyForm()
    isError.value = false
    message.value = 'Demande envoyée. Elle apparaîtra sur la carte une fois autorisée et placée par le gestionnaire.'
  } catch (e) {
    isError.value = true
    message.value = e.message
  }
}
</script>

<template>
  <main class="page">
    <div class="content">
      <h1>Ma programmation</h1>
      <p class="intro">Tes demandes de bâtiment et de menu : suis leur état et modifie-les.</p>

      <section class="panel">
        <h2>Mes demandes</h2>
        <p v-if="myBuildings.length === 0" class="empty">Aucune demande pour l'instant.</p>
        <ul v-else class="requests">
          <li v-for="b in myBuildings" :key="b.id" class="request">
            <span class="dot" :style="{ background: buildingTypes[b.type]?.color }"></span>
            <span class="name">{{ b.name }}</span>
            <span class="type">{{ buildingTypes[b.type]?.label }}</span>
            <!-- Une demande refusée : « Refusée ▾ » est un bouton, le motif ne s'affiche qu'au clic -->
            <button
              v-if="hasReason(b)"
              class="btn btn-sm btn-outline-danger reason-toggle"
              :aria-expanded="isReasonShown(b.id)"
              :aria-controls="`motif-${b.id}`"
              @click="toggleReason(b.id)"
            >
              Refusée <span aria-hidden="true">{{ isReasonShown(b.id) ? '▴' : '▾' }}</span>
            </button>
            <StatusBadge v-else :building="b" />
            <RouterLink
              v-if="b.status !== 'refuse'"
              class="btn btn-sm"
              :class="b.status === 'a_modifier' ? 'btn-warning' : 'btn-outline-primary'"
              :to="{ name: 'modifier-batiment', params: { id: b.id } }"
            >
              {{ b.status === 'a_modifier' ? 'Corriger' : 'Modifier' }}
            </RouterLink>
            <button v-if="b.status === 'autorise' && b.position" class="btn btn-sm" @click="showOnMap(b.id)">
              Voir sur la carte
            </button>
            <p v-if="feedbackLine(b)" :id="`motif-${b.id}`" class="feedback">{{ feedbackLine(b) }}</p>
          </li>
        </ul>
      </section>

      <section class="panel">
        <h2>Réserver un bâtiment</h2>
        <form @submit.prevent="submit">
          <label>Nom du bâtiment
            <input v-model="form.name" required maxlength="60" />
          </label>

          <label>Type
            <select v-model="form.type" required>
              <option value="" disabled>Choisir un type…</option>
              <option v-for="(type, key) in reservableTypes" :key="key" :value="key">{{ type.label }}</option>
            </select>
          </label>

          <p v-if="!form.type" class="hint">Choisissez un type : les champs à remplir dépendent du type de bâtiment.</p>
          <BuildingFields v-else v-model="form" :type="form.type" />

          <div class="row">
            <label>Email de contact <input v-model="form.email" type="email" required /></label>
            <label>Téléphone <input v-model="form.phone" type="tel" /></label>
          </div>

          <button type="submit" class="btn btn-primary btn-solid submit">Envoyer la demande</button>
          <p v-if="message" class="message" :class="{ error: isError }">{{ message }}</p>
        </form>
      </section>
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
h1 { margin: 0 0 6px; font-size: 24px; }
.intro { margin: 0 0 18px; font-size: 14px; color: #555; }
h2 { margin: 0 0 8px; font-size: 16px; }
.panel { margin-bottom: 20px; padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); }
.empty { margin: 0; color: #666; font-size: 13px; }

.requests { margin: 0; padding: 0; list-style: none; }
.request {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid #eee;
}
.request:last-child { border-bottom: none; }
.dot { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.name { flex: 1; font-weight: 600; }
.type { font-size: 12px; color: #666; }
.feedback { flex-basis: 100%; margin: 0 0 0 20px; padding: 6px 10px; border-radius: 6px; background: #fff4e5; font-size: 13px; color: #6b3a00; }
.hint { margin: 0; font-size: 13px; color: #666; }

form { display: flex; flex-direction: column; gap: 10px; }
label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #444; flex: 1; }
input, select, textarea { padding: 8px; border: 1px solid #bbb; border-radius: 6px; font: inherit; }
.row { display: flex; gap: 12px; }
.submit { align-self: center; }
.message { margin: 0; font-size: 13px; color: #1b5e20; }
.message.error { color: #b00020; }
</style>
