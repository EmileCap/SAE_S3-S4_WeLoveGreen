<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { buildingTypes } from '@/data/buildingTypes.js'
import { prestataireName } from '@/data/prestataires.js'
import { useDiscussions } from '@/composables/useDiscussions.js'
import { useProgrammation } from '@/composables/useProgrammation.js'
import { usePlacement } from '@/composables/usePlacement.js'
import { useSelection } from '@/composables/useSelection.js'
import FoldableSection from '@/components/admin/FoldableSection.vue'

// Page "Programmation" du gestionnaire : il traite les demandes et place les bâtiments.
const router = useRouter()
const { pending, changesRequested, toPlace, onMap, refused, foldedSections } = useProgrammation()
const { startPlacing } = usePlacement()
const { awaitingReplyCount } = useDiscussions()
const { select, highlight } = useSelection()

const error = ref('')

// Le tableau de bord : de gros boutons sobres. On ne peut cliquer que s'il y a quelque chose à faire (compteur > 0).
// Chaque bouton mène à ce qu'il y a à faire : une liste plus bas dans la page (dépliée d'abord si elle était repliée),
// la page Contact ou la carte.
async function scrollTo(section, id) {
  foldedSections[section] = false
  await nextTick()
  document.getElementById(id)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
}
const stats = computed(() => [
  { key: 'pending', count: pending.value.length, label: 'Demandes de programmation en attente', action: 'Examiner', go: () => scrollTo('pending', 'demandes-en-attente') },
  { key: 'to-place', count: toPlace.value.length, label: 'Bâtiments à placer', action: 'Placer', go: () => scrollTo('to-place', 'a-placer') },
  { key: 'unanswered', count: awaitingReplyCount.value, label: 'Discussions sans réponse', action: 'Répondre', go: () => router.push({ name: 'contact' }) },
  { key: 'on-map', count: onMap.value.length, label: 'Bâtiments sur la carte', action: 'Voir la carte', go: () => router.push({ name: 'carte' }) },
])

// Exécute une action et affiche l'erreur éventuelle (au lieu de planter la page)
function run(action) {
  try {
    error.value = ''
    action()
  } catch (e) {
    error.value = e.message
  }
}

const place = (id) => run(() => startPlacing(id)) // passe sur la carte en mode placement
// « Voir sur la carte » : met le bâtiment en évidence sur la carte, sans ouvrir sa fenêtre d'infos
const showOnMap = (id) => {
  highlight(id)
  router.push({ name: 'carte' })
}
// « Voir les informations » : la fenêtre d'infos s'ouvre ici, sans quitter la page
const showInfo = (id) => select(id)

const typeLabel = (b) => buildingTypes[b.type]?.label ?? b.type
const typeColor = (b) => buildingTypes[b.type]?.color ?? '#999999'
</script>

<template>
  <main class="page">
    <div class="content">
      <h1>Programmation</h1>
      <p v-if="error" class="error">{{ error }}</p>

      <!-- Tableau de bord : l'essentiel d'un coup d'œil, en boutons -->
      <ul class="stats" aria-label="Résumé">
        <li v-for="s in stats" :key="s.key">
          <button class="btn tile" :disabled="s.count === 0" @click="s.go">
            <strong>{{ s.count }}</strong>
            <span class="label">{{ s.label }}</span>
            <span class="action">{{ s.count > 0 ? `${s.action} →` : 'Rien à faire' }}</span>
          </button>
        </li>
      </ul>

      <FoldableSection id="demandes-en-attente" v-model:folded="foldedSections.pending" :title="`Demandes de programmation en attente (${pending.length})`">
        <p v-if="pending.length === 0" class="empty">Aucune demande à traiter.</p>
        <ul v-else class="rows">
          <li v-for="b in pending" :key="b.id" class="row pending">
            <div class="main">
              <span class="dot" :style="{ background: typeColor(b) }"></span>
              <span class="name">{{ b.name }}</span>
              <span class="type">{{ typeLabel(b) }}</span>
            </div>
            <p class="details">
              Prestataire : {{ prestataireName(b.ownerId) }} · {{ b.hours }}<br />
              <template v-if="b.sells">Propose : {{ b.sells }}<br /></template>
              Contact : {{ b.contact?.email }}<span v-if="b.contact?.phone"> · {{ b.contact.phone }}</span>
            </p>
            <div class="actions">
              <RouterLink class="btn btn-sm" :to="{ name: 'examiner-demande', params: { id: b.id } }">Examiner la demande</RouterLink>
            </div>
          </li>
        </ul>
      </FoldableSection>

      <FoldableSection v-model:folded="foldedSections.changes" :title="`Modifications demandées (${changesRequested.length})`">
        <p v-if="changesRequested.length === 0" class="empty">Aucune demande en attente de correction.</p>
        <ul v-else class="rows">
          <li v-for="b in changesRequested" :key="b.id" class="row">
            <div class="main">
              <span class="dot" :style="{ background: typeColor(b) }"></span>
              <span class="name">{{ b.name }}</span>
              <span class="type">{{ typeLabel(b) }} · {{ prestataireName(b.ownerId) }} · en attente de la correction du prestataire</span>
              <RouterLink class="btn btn-sm" :to="{ name: 'examiner-demande', params: { id: b.id } }">Voir</RouterLink>
            </div>
          </li>
        </ul>
      </FoldableSection>

      <FoldableSection id="a-placer" v-model:folded="foldedSections['to-place']" :title="`Autorisés, à placer (${toPlace.length})`">
        <p v-if="toPlace.length === 0" class="empty">Rien à placer pour l'instant.</p>
        <ul v-else class="rows">
          <li v-for="b in toPlace" :key="b.id" class="row">
            <div class="main">
              <span class="dot" :style="{ background: typeColor(b) }"></span>
              <span class="name">{{ b.name }}</span>
              <span class="type">{{ typeLabel(b) }}</span>
              <RouterLink class="btn btn-sm" :to="{ name: 'examiner-demande', params: { id: b.id } }">Voir la demande</RouterLink>
              <button class="btn btn-sm" @click="place(b.id)">Placer sur la carte</button>
            </div>
            <p v-if="b.sells" class="offer">Propose : {{ b.sells }}</p>
          </li>
        </ul>
      </FoldableSection>

      <FoldableSection v-model:folded="foldedSections['on-map']" :title="`Sur la carte (${onMap.length})`">
        <ul class="rows">
          <li v-for="b in onMap" :key="b.id" class="row">
            <div class="main">
              <span class="dot" :style="{ background: typeColor(b) }"></span>
              <span class="name">{{ b.name }}</span>
              <span class="type">{{ typeLabel(b) }}</span>
              <button class="btn btn-sm" @click="showOnMap(b.id)">Voir sur la carte</button>
              <button class="btn btn-sm" @click="showInfo(b.id)">Voir les informations</button>
              <span v-if="b.organisation" class="tag">Organisation</span>
              <RouterLink v-else class="btn btn-sm" :to="{ name: 'examiner-demande', params: { id: b.id } }">Voir la demande</RouterLink>
              <button v-if="!b.organisation" class="btn btn-sm" @click="place(b.id)">Déplacer</button>
            </div>
            <p v-if="b.sells" class="offer">Propose : {{ b.sells }}</p>
          </li>
        </ul>
      </FoldableSection>

      <FoldableSection v-model:folded="foldedSections.refused" :title="`Refusées (${refused.length})`">
        <p v-if="refused.length === 0" class="empty">Aucune demande refusée.</p>
        <ul v-else class="rows">
          <li v-for="b in refused" :key="b.id" class="row">
            <div class="main">
              <span class="dot" :style="{ background: typeColor(b) }"></span>
              <span class="name">{{ b.name }}</span>
              <span class="type">{{ typeLabel(b) }} · {{ prestataireName(b.ownerId) }}</span>
              <RouterLink class="btn btn-sm" :to="{ name: 'examiner-demande', params: { id: b.id } }">Voir la demande</RouterLink>
            </div>
            <p v-if="b.feedback?.message" class="offer">Motif : {{ b.feedback.message }}</p>
            <p v-if="b.sells" class="offer">Propose : {{ b.sells }}</p>
          </li>
        </ul>
      </FoldableSection>
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
h1 { margin: 0 0 20px; font-size: 24px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 0 0 20px; padding: 0; list-style: none; }
.tile { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; width: 100%; height: 100%; min-height: 104px; padding: 14px 10px; border-radius: 12px; }
.tile strong { font-size: 30px; line-height: 1.1; }
.tile .label { font-size: 13px; line-height: 1.25; }
.tile .action { font-size: 12px; color: #6c757d; }
.tile:not(:disabled):hover .action { color: inherit; text-decoration: underline; }
@media (max-width: 640px) { .stats { grid-template-columns: repeat(2, 1fr); } }
.empty { margin: 0; color: #666; font-size: 13px; }
.error { margin: 0 0 16px; padding: 8px 10px; border-radius: 6px; background: #f8d7da; color: #8a1c1c; font-size: 13px; }

.rows { margin: 0; padding: 0; list-style: none; }
.row { padding: 10px 0; border-bottom: 1px solid #eee; }
.row:last-child { border-bottom: none; }
.main { display: flex; align-items: center; gap: 10px; }
.dot { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.name { font-weight: 600; }
.type { flex: 1; font-size: 12px; color: #666; }
.offer { margin: 4px 0 0 20px; font-size: 12px; color: #444; }
.details { margin: 6px 0 8px 20px; font-size: 12px; line-height: 1.5; color: #444; }
.actions { display: flex; align-items: center; justify-content: center; gap: 8px; }

</style>
