<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { buildingTypes } from '@/data/buildingTypes.js'
import { useAuth } from '@/composables/useAuth.js'
import { usePlacement } from '@/composables/usePlacement.js'
import { useProgrammation } from '@/composables/useProgrammation.js'
import { useSelection } from '@/composables/useSelection.js'

// La programmation sur la carte, pour le gestionnaire : un bouton burger (☰ Programmation) à droite ouvre une barre latérale
// qui reprend ce que contient la page Programmation (demandes à examiner, bâtiments à placer, bâtiments sur la carte),
// pour agir sans quitter la carte. Même principe que les filtres à gauche (FilterSidebar) : fermée au chargement de la carte.
const open = ref(false)
const router = useRouter()
const { currentRole } = useAuth()
const { pending, changesRequested, toPlace, onMap } = useProgrammation()
const { startPlacing } = usePlacement()
const { highlight } = useSelection()

const isGestionnaire = computed(() => currentRole.value === 'gestionnaire')
watch(isGestionnaire, (yes) => { if (!yes) open.value = false }) // déconnexion ou autre rôle : on referme

const sections = computed(() => [
  { key: 'pending', title: 'Demandes à examiner', empty: 'Aucune demande à traiter.', list: pending.value },
  { key: 'changes', title: 'Modifications demandées', empty: 'Aucune demande en attente de correction.', list: changesRequested.value },
  { key: 'to-place', title: 'À placer', empty: 'Rien à placer pour l\'instant.', list: toPlace.value },
  { key: 'on-map', title: 'Sur la carte', empty: 'Aucun bâtiment sur la carte.', list: onMap.value },
])

const error = ref('')
function place(id) {
  try {
    error.value = ''
    startPlacing(id)
  } catch (e) {
    error.value = e.message
  }
}
const examine = (id) => router.push({ name: 'examiner-demande', params: { id } })
</script>

<template>
  <template v-if="isGestionnaire">
    <button v-if="!open" class="btn btn-outline-dark btn-sm burger" aria-controls="programmation-panel" @click="open = true">
      <span aria-hidden="true">☰</span> Programmation
    </button>

    <Transition name="slide">
      <aside v-if="open" id="programmation-panel" class="sidebar" aria-label="Programmation">
        <header class="head">
          <h2>Programmation</h2>
          <button class="btn-close" aria-label="Fermer la programmation" @click="open = false"></button>
        </header>

        <div class="body">
          <p v-if="error" class="error">{{ error }}</p>

          <section v-for="s in sections" :key="s.key" :class="`group group-${s.key}`">
            <h3>{{ s.title }} ({{ s.list.length }})</h3>
            <p v-if="s.list.length === 0" class="empty">{{ s.empty }}</p>
            <ul v-else>
              <li v-for="b in s.list" :key="b.id">
                <div class="line">
                  <span class="dot" :style="{ background: buildingTypes[b.type]?.color }"></span>
                  <strong class="name">{{ b.name }}</strong>
                </div>
                <div class="type">{{ buildingTypes[b.type]?.label }}</div>
                <div class="buttons">
                  <button v-if="s.key === 'pending' || s.key === 'changes'" class="btn btn-sm" @click="examine(b.id)">
                    {{ s.key === 'pending' ? 'Examiner' : 'Voir' }}
                  </button>
                  <button v-if="s.key === 'to-place'" class="btn btn-sm" @click="place(b.id)">Placer</button>
                  <template v-if="s.key === 'on-map'">
                    <button class="btn btn-sm" @click="highlight(b.id)">Voir</button>
                    <button v-if="!b.organisation" class="btn btn-sm" @click="place(b.id)">Déplacer</button>
                  </template>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </aside>
    </Transition>
  </template>
</template>

<style scoped>
.burger
{
  position: fixed;
  top: 60px; /* sous la barre de navigation, dans le coin droit de la carte */
  right: 12px;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: system-ui, sans-serif;
}

.sidebar
{
  position: fixed;
  top: 48px; /* sous la barre de navigation */
  right: 0;
  bottom: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  width: 300px;
  max-width: 100%;
  box-sizing: border-box;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.15);
  color: #222;
  font-family: system-ui, sans-serif;
  font-size: 13px;
}
.head { display: flex; align-items: center; justify-content: space-between; flex: none; padding: 10px 14px; border-bottom: 1px solid #e5e7eb; }
.head h2 { margin: 0; font-size: 16px; }
.body { flex: 1; min-height: 0; padding: 14px; overflow-y: auto; }

.slide-enter-active, .slide-leave-active { transition: transform 0.18s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

.group + .group { margin-top: 16px; }
h3 { margin: 0 0 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280; }
ul { margin: 0; padding: 0; list-style: none; }
li { padding: 8px 0; border-bottom: 1px solid #eee; }
li:last-child { border-bottom: none; }
.line { display: flex; align-items: center; gap: 8px; }
.dot { width: 9px; height: 9px; border-radius: 50%; flex: none; }
.name { min-width: 0; font-size: 14px; overflow-wrap: anywhere; }
.type { margin: 1px 0 0 17px; font-size: 12px; color: #6b7280; }
.buttons { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.empty { margin: 0; color: #777; }
.error { margin: 0 0 10px; padding: 6px 8px; border-radius: 6px; background: #f8d7da; color: #8a1c1c; }
</style>
