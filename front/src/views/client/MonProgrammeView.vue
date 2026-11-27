<script setup>
import { useRouter } from 'vue-router'
import { formatSlotTime } from '@/data/programme.js'
import { useFavorites } from '@/composables/useFavorites.js'
import { useSelection } from '@/composables/useSelection.js'

// Page « Mon programme » du client : les créneaux qu'il a mis en favori, jour par jour.
const router = useRouter()
const { favoriteDays, favoriteCount, toggleFavorite } = useFavorites()
const { highlight } = useSelection()

// « Voir sur la carte » : la scène est mise en évidence sur la carte, sans ouvrir sa fenêtre d'infos
function showOnMap(buildingId) {
  highlight(buildingId)
  router.push({ name: 'carte' })
}
</script>

<template>
  <main class="page">
    <div class="content">
      <h1>Mon programme</h1>

      <p v-if="favoriteCount === 0" class="notice">
        Aucun favori pour l'instant. Clique sur une scène de la carte, puis « Voir la programmation » :
        le cœur ♡ d'un créneau l'ajoute ici.
      </p>

      <section v-for="day in favoriteDays" :key="day.day" class="panel">
        <h2>{{ day.label }}</h2>
        <ul class="slots">
          <li v-for="slot in day.slots" :key="`${slot.buildingId}/${slot.id}`" class="slot">
            <div class="info">
              <strong>{{ slot.title }}</strong>
              <span class="where">{{ slot.buildingName }} · {{ formatSlotTime(slot) }}</span>
            </div>
            <div class="buttons">
              <RouterLink class="btn btn-sm" :to="{ name: 'programme-scene', params: { id: slot.buildingId } }">
                Voir la scène
              </RouterLink>
              <button class="btn btn-sm" @click="showOnMap(slot.buildingId)">Voir sur la carte</button>
              <button class="btn btn-outline-danger btn-sm" aria-label="Retirer des favoris" @click="toggleFavorite(slot.buildingId, slot.id)">
                ♥ Retirer
              </button>
            </div>
          </li>
        </ul>
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
h1 { margin: 0 0 20px; font-size: 24px; }
h2 { margin: 0 0 8px; font-size: 16px; }
.notice { padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); color: #555; text-align: center; }
.panel { margin-bottom: 20px; padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); }
.slots { margin: 0; padding: 0; list-style: none; }
.slot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eee; }
.slot:last-child { border-bottom: none; }
.info { display: flex; flex-direction: column; gap: 2px; }
.where { font-size: 13px; color: #666; }
.buttons { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
</style>
