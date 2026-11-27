<script setup>
import { computed } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import Building from './Building.vue'
import PlacementLayer from './PlacementLayer.vue'
import { GROUND_SIZE } from '@/data/map.js'
import { useBuildings } from '@/composables/useBuildings.js'
import { useFilters } from '@/composables/useFilters.js'
import { usePlacement } from '@/composables/usePlacement.js'
import { useSelection } from '@/composables/useSelection.js'
import { useTimeOfDay } from '@/composables/useTimeOfDay.js'

const { visibleBuildings, myBuildings } = useBuildings()
const { filtersActive, matchingIds } = useFilters()
const { placingId, isPlacementClick } = usePlacement()
const { clear } = useSelection()
const { sky } = useTimeOfDay()

// Clic dans le vide : ferme le panneau d'infos (sauf si ce clic vient de poser un bâtiment)
const onMissed = (event) => { if (!isPlacementClick(event)) clear() }

// Les bâtiments du prestataire connecté sont mis en surbrillance (vide pour les autres rôles)
const mineIds = computed(() => new Set(myBuildings.value.map((b) => b.id)))

// Un bâtiment qui ne correspond pas aux filtres est estompé (sauf pendant un placement, où les filtres n'ont pas lieu d'être)
const isDimmed = (b) => !placingId.value && filtersActive.value && !matchingIds.value.has(b.id)
</script>

<template>
  <TresCanvas :clear-color="sky.background" @pointermissed="onMissed">
    <TresPerspectiveCamera :position="[45, 35, 45]" :look-at="[0, 0, 0]" />
    <OrbitControls
        :max-polar-angle="Math.PI / 2 - 0.05"
        :min-distance="10"
        :max-distance="120"
        :screen-space-panning="false"
    />

    <TresAmbientLight :color="sky.ambientColor" :intensity="sky.ambientIntensity" />
    <TresDirectionalLight
        :color="sky.sunColor"
        :intensity="sky.sunIntensity"
        :position="sky.sunPosition"
    />

    <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[GROUND_SIZE, GROUND_SIZE]" />
      <TresMeshStandardMaterial color="#7fa86a" />
    </TresMesh>

    <!-- Le bâtiment qu'on déplace reste à son ancien emplacement (transparent) jusqu'à ce que le nouveau soit validé -->
    <Building
        v-for="b in visibleBuildings"
        :key="b.id"
        :building="b"
        :ghost="b.id === placingId"
        :dimmed="isDimmed(b)"
        :mine="mineIds.has(b.id)"
    />

    <PlacementLayer v-if="placingId" />
  </TresCanvas>
</template>