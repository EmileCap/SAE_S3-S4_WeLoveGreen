<script setup>
import { computed } from 'vue'
import { discussionStatuses, topics } from '@/data/discussions.js'
import { prestataireName, prestatairePhoto } from '@/data/prestataires.js'
import { statusOf, useDiscussions } from '@/composables/useDiscussions.js'
import { useAuth } from '@/composables/useAuth.js'
import { useBuildings } from '@/composables/useBuildings.js'
import ProfileAvatar from '@/components/contact/ProfileAvatar.vue'

// La liste des discussions : une ligne par discussion (sujet, bâtiment, état) ; un point marque les messages non lus.
// Chaque ligne a la photo de la personne en face : le prestataire pour le gestionnaire, le gestionnaire pour le prestataire.
defineProps({
  discussions: { type: Array, required: true },
  selectedId: { type: String, default: null },
})
const emit = defineEmits(['select'])

const { currentRole } = useAuth()
const { getById } = useBuildings()
const { isUnread } = useDiscussions()

const isGestionnaire = computed(() => currentRole.value === 'gestionnaire')

// Le gestionnaire n'a pas encore de photo (l'API la donnera) : le prestataire voit la silhouette
const photoOf = (d) => (isGestionnaire.value ? prestatairePhoto(d.ownerId) : null)

// Sous le titre : le sujet, le bâtiment concerné et, pour le gestionnaire, le prestataire
function details(d) {
  const parts = [topics[d.topic]]
  const building = d.buildingId ? getById(d.buildingId) : null
  if (building) parts.push(building.name)
  if (isGestionnaire.value) parts.push(prestataireName(d.ownerId))
  return parts.join(' · ')
}
</script>

<template>
  <p v-if="discussions.length === 0" class="empty">Aucune discussion pour l'instant.</p>
  <ul v-else class="list">
    <li v-for="d in discussions" :key="d.id">
      <button class="row" :class="{ selected: d.id === selectedId }" @click="emit('select', d.id)">
        <ProfileAvatar :photo="photoOf(d)" />
        <span class="text">
          <span class="top">
            <span v-if="isUnread(d)" class="unread" aria-label="Nouveau message"></span>
            <strong class="subject">{{ d.subject }}</strong>
          </span>
          <span class="details">{{ details(d) }}</span>
          <span class="tag tag-sm status" :class="statusOf(d)">{{ discussionStatuses[statusOf(d)] }}</span>
        </span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.empty { margin: 8px 0; color: #666; font-size: 13px; text-align: center; }
.list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
.row
{
  display: flex; align-items: flex-start; gap: 10px; width: 100%;
  padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px;
  background: #fff; text-align: left; font: inherit; color: inherit; cursor: pointer;
}
.row:hover { background: #f3f4f6; }
.row.selected { border-color: #6b7280; background: #f3f4f6; }
.text { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.top { display: flex; align-items: center; gap: 8px; }
.unread { width: 9px; height: 9px; border-radius: 50%; background: #1a56db; flex: none; }
.subject { font-size: 14px; }
.details { font-size: 12px; color: #666; }
.status { align-self: flex-start; }
.status.ouverte { --tag: #d39e00; }
.status.repondue { --tag: #198754; }
.status.cloturee { --tag: #6c757d; }
</style>
