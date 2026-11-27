<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { usePlacement } from '@/composables/usePlacement.js'

// La barre du mode placement : le nom du bâtiment déplacé et ses deux touches, R (tourner) et Échap (annuler).
// L'emplacement libre ou occupé se voit sur la carte (aperçu vert ou rouge, voir PlacementLayer.vue).
const { placingBuilding, rotate, stopPlacing } = usePlacement()

// On ne tourne pas le bâtiment quand la personne tape du texte (la recherche des filtres, par exemple)
const isTyping = (el) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(el?.tagName) || !!el?.isContentEditable

function onKey(e) {
  if (e.key === 'Escape') stopPlacing()
  else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(e.target)) rotate()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="placingBuilding" class="bar" role="status">
    <strong>{{ placingBuilding.name }}</strong>
    <button class="btn btn-outline-secondary btn-sm" aria-label="Tourner de 90° (R)" @click="rotate">↻ R</button>
    <button class="btn btn-outline-secondary btn-sm" aria-label="Annuler le déplacement (Échap)" @click="stopPlacing">Échap</button>
  </div>
</template>

<style scoped>
.bar {
  position: absolute; /* dans la scène (MapView) */
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 12px 8px 16px;
  background: #fff;
  color: #222;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  font-family: system-ui, sans-serif;
  font-size: 15px;
  white-space: nowrap;
}
.bar strong { margin-right: 4px; }
</style>
