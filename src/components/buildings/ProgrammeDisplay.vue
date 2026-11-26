<script setup>
import { computed } from 'vue'
import { formatSlotTime, guestLabel, programmeByDay } from '@/data/programme.js'
import { useFavorites } from '@/composables/useFavorites.js'

// Programme d'une scène en lecture seule, regroupé par jour : page de programmation de la scène
// et page d'examen d'une demande (le titre "Programme" y est déjà donné par la page).
// buildingId : l'id de la scène, pour que le client puisse mettre un créneau en favori (♡) ; sans lui, pas de cœur.
const props = defineProps({
  programme: { type: Array, required: true },
  buildingId: { type: String, default: null },
})

const { canFavorite, isFavorite, toggleFavorite } = useFavorites()
const showHearts = computed(() => !!props.buildingId && canFavorite.value)

const days = computed(() => programmeByDay(props.programme))
</script>

<template>
  <section class="programme">
    <p v-if="programme.length === 0" class="empty">Le programme n'est pas encore renseigné.</p>

    <div v-for="day in days" :key="day.day">
      <h4>{{ day.label }}</h4>
      <ul>
        <li v-for="slot in day.slots" :key="slot.id" class="slot">
          <span class="time">{{ formatSlotTime(slot) }}</span>
          <div class="main">
            <p class="head">
              <strong>{{ slot.title }}</strong>
              <button
                v-if="showHearts"
                class="btn btn-sm heart"
                :class="{ on: isFavorite(buildingId, slot.id) }"
                :aria-pressed="isFavorite(buildingId, slot.id)"
                :aria-label="isFavorite(buildingId, slot.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                @click="toggleFavorite(buildingId, slot.id)"
              >{{ isFavorite(buildingId, slot.id) ? '♥ Favori' : '♡ Favori' }}</button>
            </p>
            <p v-if="slot.description" class="desc">{{ slot.description }}</p>
            <p v-if="slot.guests?.length" class="guests">
              <span class="guests-label">Invités :</span>
              <span v-for="guest in slot.guests" :key="guest.id" class="guest">
                <img v-if="guest.photo" class="avatar" :src="guest.photo" alt="" />
                <span v-else class="avatar empty" aria-hidden="true"></span>
                {{ guestLabel(guest) }}
              </span>
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
h4 { margin: 16px 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #666; }
h4:first-child { margin-top: 6px; }
ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
p { margin: 0; }
.empty { font-size: 13px; color: #666; }
/* Un bloc par créneau : l'heure à gauche, le reste à droite */
.slot { display: flex; align-items: flex-start; gap: 16px; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; background: #f8f9fb; }
.time { flex: none; width: 112px; padding-top: 1px; font-weight: 600; white-space: nowrap; color: #333; }
.main { flex: 1; min-width: 0; }
.head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.heart.on { color: #c0392b; border-color: #c0392b; }
.desc { margin-top: 2px; font-size: 13px; color: #444; }

@media (max-width: 520px) { .slot { flex-direction: column; gap: 4px; } .time { width: auto; } }
.guests { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 4px; font-size: 13px; }
.guests-label { color: #666; }
.guest { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px 2px 3px; border-radius: 999px; background: #e8f1fb; color: #1b4f8a; }
.avatar { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; flex: none; }
.avatar.empty { box-sizing: border-box; border: 1px dashed #7da3d1; background: #f4f8fd; }
</style>
