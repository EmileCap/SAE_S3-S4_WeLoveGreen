<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { useTresContext } from '@tresjs/core'
import { usePlacement } from '@/composables/usePlacement.js'
import { pointerToGround } from '@/utils/pointerToGround.js'

// Doit être placé DANS le TresCanvas (c'est là que useTresContext fonctionne).
// Elle fait deux choses : écouter la souris pour suivre le sol, et dessiner l'aperçu.
const { camera, renderer } = useTresContext()
const { placingId, placingBuilding, cursor, rotation, canPlace, moveCursor, clearCursor, confirmPlacing } = usePlacement()

const MAX_CLICK_TRAVEL = 5 // au-delà (en pixels), c'est un glissé de caméra, pas un clic

let canvas = null
let pressStart = null

// Point du sol sous la souris, ou null si elle vise le ciel
function groundUnder(e) {
  const cam = camera.activeCamera.value
  if (!cam) return null
  return pointerToGround(e.clientX, e.clientY, canvas.getBoundingClientRect(), cam)
}

function updateCursor(e) {
  const point = groundUnder(e)
  if (point) moveCursor(point[0], point[1])
  else clearCursor()
}

function onPointerDown(e) {
  pressStart = { x: e.clientX, y: e.clientY }
}

function onPointerUp(e) {
  if (e.button !== 0 || !pressStart) return
  const travel = Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y)
  pressStart = null
  if (travel > MAX_CLICK_TRAVEL) return // l'utilisateur tournait la caméra
  updateCursor(e)
  confirmPlacing(e) // ne fait rien si l'emplacement est occupé
}

function attach() {
  canvas = renderer.instance.domElement
  canvas.addEventListener('pointermove', updateCursor)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointerup', onPointerUp)
}

function detach() {
  if (!canvas) return
  canvas.removeEventListener('pointermove', updateCursor)
  canvas.removeEventListener('pointerdown', onPointerDown)
  canvas.removeEventListener('pointerup', onPointerUp)
  canvas = null
  pressStart = null
}

watch(placingId, (id) => (id ? attach() : detach()), { immediate: true })
onBeforeUnmount(detach)
</script>

<template>
  <!-- Aperçu : vert si l'emplacement est libre, rouge sinon -->
  <TresGroup v-if="placingBuilding && cursor" :position="[cursor[0], 0, cursor[1]]" :rotation="[0, rotation * Math.PI / 2, 0]">
    <TresMesh :position="[0, placingBuilding.size[1] / 2, 0]">
      <TresBoxGeometry :args="placingBuilding.size" />
      <TresMeshStandardMaterial :color="canPlace ? '#2ecc71' : '#e74c3c'" :transparent="true" :opacity="0.6" />
    </TresMesh>
  </TresGroup>
</template>
