<script setup>
import { computed, ref } from 'vue'
import { useHover } from '@/composables/useHover.js'
import { usePlacement } from '@/composables/usePlacement.js'
import { useSelection } from '@/composables/useSelection.js'
import { buildingTypes } from '@/data/buildingTypes.js'

const props = defineProps({
  building: { type: Object, required: true },
  ghost: { type: Boolean, default: false }, // ancien emplacement d'un bâtiment qu'on est en train de déplacer (transparent, inerte)
  dimmed: { type: Boolean, default: false }, // ne correspond pas aux filtres : estompé
  mine: { type: Boolean, default: false }, // bâtiment du prestataire connecté : mis en surbrillance
})

const { selectedId, select } = useSelection()
const { hoverEnter, hoverLeave, hoverClear } = useHover()
const { placingId, isPlacementClick } = usePlacement() // pendant un placement, les bâtiments ne réagissent plus
const hovered = ref(false)
const selected = computed(() => selectedId.value === props.building.id)
const color = computed(() => buildingTypes[props.building.type]?.color ?? '#999999')

const faded = computed(() => props.ghost || props.dimmed)
const opacity = computed(() => (props.ghost ? 0.3 : props.dimmed ? 0.22 : 1))

// "emissive" s'ajoute à la couleur de base : plus elle est claire, plus le bâtiment "s'allume"
const emissive = computed(() => {
  if (selected.value) return '#555555'
  if (hovered.value) return '#2a2a2a'
  if (props.mine) return '#4d3b00'
  return '#000000'
})

function onEnter()
{
  if (placingId.value || props.ghost) return
  hovered.value = true
  hoverEnter(props.building.id)
  document.body.style.cursor = 'pointer'
}

function onLeave()
{
  hovered.value = false
  hoverLeave() // la carte du survol reste un instant (voir useHover)
  document.body.style.cursor = ''
}

function onClick(event)
{
  if (placingId.value || props.ghost || isPlacementClick(event)) return
  event.stopPropagation() // un seul bâtiment est sélectionné, pas ceux derrière
  hoverClear()
  select(props.building.id) // met en évidence et ouvre la fenêtre d'infos
}
</script>

<template>
  <TresGroup :position="building.position" :rotation="[0, (building.rotation ?? 0) * Math.PI / 2, 0]">
    <!-- Surbrillance d'un bâtiment du prestataire : une dalle dorée plus large que le bâtiment (1,5 m de plus de chaque côté), posée au sol -->
    <TresMesh v-if="mine && !ghost" :position="[0, 0.06, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[building.size[0] + 3, building.size[2] + 3]" />
      <TresMeshBasicMaterial color="#ffc800" :transparent="true" :opacity="0.85" />
    </TresMesh>
    <TresMesh
        :position="[0, building.size[1] / 2, 0]"
        @pointerenter="onEnter"
        @pointerleave="onLeave"
        @click="onClick"
    >
      <TresBoxGeometry :args="building.size" />
      <TresMeshStandardMaterial :color="color" :emissive="emissive" :transparent="faded" :opacity="opacity" />
    </TresMesh>
  </TresGroup>
</template>
