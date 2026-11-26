<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { buildingTypes } from '@/data/buildingTypes.js'
import { useBuildings } from '@/composables/useBuildings.js'
import { useHover } from '@/composables/useHover.js'
import { usePlacement } from '@/composables/usePlacement.js'
import { useSelection } from '@/composables/useSelection.js'

// La petite carte qui apparaît au survol d'un bâtiment : son nom et son type.
// Pour le gestionnaire elle porte aussi un bouton « Déplacer » : elle ne suit alors plus la souris
// (on ne peut pas cliquer sur ce qui s'enfuit) et reste un instant quand la souris quitte le bâtiment.
const { getById } = useBuildings()
const { hoveredId, hoverKeep, hoverRelease, hoverClear } = useHover()
const { placingId, canMove, startPlacing } = usePlacement()
const { dialogOpen } = useSelection()

const building = computed(() => (hoveredId.value ? getById(hoveredId.value) ?? null : null))
const movable = computed(() => canMove(building.value))
const visible = computed(() => !!building.value && !dialogOpen.value && !placingId.value)

// Position de la souris, suivie sur toute la fenêtre
const pointer = ref({ x: 0, y: 0 })
const anchor = ref({ x: 0, y: 0 }) // où se trouvait la souris quand elle est entrée sur le bâtiment
const onMove = (e) => { pointer.value = { x: e.clientX, y: e.clientY } }
onMounted(() => window.addEventListener('pointermove', onMove))
onBeforeUnmount(() => window.removeEventListener('pointermove', onMove))
watch(hoveredId, (id, previous) => { if (id && id !== previous) anchor.value = { ...pointer.value } })

const OFFSET = 12 // écart entre la souris et la carte
const style = computed(() => {
  const point = movable.value ? anchor.value : pointer.value
  const x = Math.min(point.x + OFFSET, window.innerWidth - 220) // reste dans la fenêtre
  return { left: `${Math.max(x, 8)}px`, top: `${point.y + OFFSET}px` }
})

function move() {
  const id = building.value.id
  hoverClear()
  startPlacing(id)
}
</script>

<template>
  <div
    v-if="visible"
    class="hover-card"
    :class="{ interactive: movable }"
    :style="style"
    role="tooltip"
    @pointerenter="hoverKeep"
    @pointerleave="hoverRelease"
  >
    <strong class="name">{{ building.name }}</strong>
    <span class="type">{{ buildingTypes[building.type]?.label }}</span>
    <button v-if="movable" class="btn btn-sm move" @click="move">Déplacer</button>
  </div>
</template>

<style scoped>
.hover-card
{
  position: fixed;
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 220px;
  padding: 6px 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  color: #222;
  font-family: system-ui, sans-serif;
  font-size: 13px;
  pointer-events: none; /* un simple nom ne doit pas gêner la souris */
}
.hover-card.interactive { pointer-events: auto; }
.name { font-size: 14px; }
.type { font-size: 12px; color: #666; }
.move { align-self: flex-start; margin-top: 4px; }
</style>
