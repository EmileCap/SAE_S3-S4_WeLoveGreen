<script setup>
import { computed, ref, watch } from 'vue'
import { buildingTypes } from '@/data/buildingTypes.js'
import { useAuth } from '@/composables/useAuth.js'
import { useBuildings } from '@/composables/useBuildings.js'
import { changesFrom, draftFrom } from '@/utils/buildingDraft.js'
import BuildingFields from '@/components/buildings/BuildingFields.vue'
import StatusBadge from '@/components/buildings/StatusBadge.vue'

// Page où le prestataire modifie un de ses bâtiments (description, horaires, menu, programme…).
// Les changements sont libres : le gestionnaire n'a pas à les revalider.
// Si le gestionnaire a demandé des modifications, ses remarques s'affichent et on peut renvoyer la demande.
const props = defineProps({
  id: { type: String, required: true }, // vient de l'adresse /ma-programmation/:id
})

const { userId } = useAuth()
const { getById, loading, updateBuilding, resubmitBuilding } = useBuildings()

// Seul le propriétaire retrouve le bâtiment (les autres arrivent sur "introuvable")
const building = computed(() => {
  const b = getById(props.id)
  return b && b.ownerId === userId.value ? b : null
})
const changesRequested = computed(() => building.value?.status === 'a_modifier')
const remarks = computed(() => (changesRequested.value ? building.value.feedback?.remarks ?? {} : {}))

// Le formulaire travaille sur une copie : rien ne change tant qu'on n'a pas enregistré
const draft = ref(null)
const message = ref('')
const isError = ref(false)
const resubmit = ref(false) // quel bouton d'envoi a été cliqué

watch(
  () => building.value?.id,
  () => {
    draft.value = building.value ? draftFrom(building.value) : null
    message.value = ''
  },
  { immediate: true },
)

function save() {
  const sendBack = resubmit.value
  resubmit.value = false
  try {
    updateBuilding(building.value.id, changesFrom(draft.value, building.value.type))
    if (sendBack) resubmitBuilding(building.value.id)
    isError.value = false
    message.value = sendBack ? 'Demande renvoyée au gestionnaire.' : 'Modifications enregistrées.'
  } catch (e) {
    isError.value = true
    message.value = e.message
  }
}
</script>

<template>
  <main class="page">
    <div class="content">
      <RouterLink :to="{ name: 'ma-programmation' }" class="btn btn-sm back">← Ma programmation</RouterLink>

      <p v-if="loading" class="notice">Chargement…</p>
      <p v-else-if="!building" class="notice">Ce bâtiment n'existe pas ou ne fait pas partie de vos demandes.</p>
      <p v-else-if="building.status === 'refuse'" class="notice">
        La demande « {{ building.name }} » a été refusée : elle ne peut plus être modifiée.
        <template v-if="building.feedback?.message"><br />Motif : {{ building.feedback.message }}</template>
      </p>

      <template v-else>
        <h1>{{ building.name }} <StatusBadge :building="building" /></h1>
        <p class="subtitle">
          {{ buildingTypes[building.type]?.label }} · le nom, le type et l'emplacement sont gérés par l'organisation.
        </p>

        <p v-if="changesRequested" class="feedback">
          <strong>Le gestionnaire demande des modifications.</strong>
          <template v-if="building.feedback?.message"><br />{{ building.feedback.message }}</template>
          <br />Corrigez les points signalés ci-dessous, puis cliquez sur « Enregistrer et renvoyer ».
        </p>

        <form @submit.prevent="save">
          <section class="panel">
            <BuildingFields v-model="draft" :type="building.type" :remarks="remarks" />
          </section>

          <div class="buttons">
            <button type="submit" class="btn btn-primary" :class="{ 'btn-solid': !changesRequested }" @click="resubmit = false">Enregistrer</button>
            <button v-if="changesRequested" type="submit" class="btn btn-success btn-solid" @click="resubmit = true">
              Enregistrer et renvoyer au gestionnaire
            </button>
          </div>
          <p v-if="message" class="message" :class="{ error: isError }">{{ message }}</p>
        </form>
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
.subtitle { margin: 0 0 20px; font-size: 13px; color: #666; }
.notice { padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); }
.feedback { margin: 0 0 16px; padding: 12px 16px; border-radius: 8px; background: #fff4e5; color: #6b3a00; font-size: 14px; }
.panel { margin-bottom: 20px; padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); }

form { display: flex; flex-direction: column; }
.buttons { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.message { margin: 10px 0 0; font-size: 13px; color: #1b5e20; }
.message.error { color: #b00020; }
</style>
