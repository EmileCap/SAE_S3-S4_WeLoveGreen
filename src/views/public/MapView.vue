<script setup>
import CityScene from '@/components/map/CityScene.vue'
import FilterSidebar from '@/components/map/FilterSidebar.vue'
import HoverCard from '@/components/map/HoverCard.vue'
import TimeButtons from '@/components/map/TimeButtons.vue'
import PlacementBar from '@/components/map/PlacementBar.vue'
import ProgrammationPanel from '@/components/map/ProgrammationPanel.vue'
import { usePlacement } from '@/composables/usePlacement.js'

const { placingId } = usePlacement()
</script>

<template>
  <!-- La page "Carte" : la scène 3D sur tout l'écran ; les filtres (à gauche) et la programmation du gestionnaire (à droite) s'ouvrent par-dessus, depuis leur bouton burger -->
  <FilterSidebar />
  <!-- Le gestionnaire a aussi un menu burger à droite : la programmation (demandes, bâtiments à placer) sans quitter la carte -->
  <ProgrammationPanel />
  <div class="stage">
    <CityScene />
    <TimeButtons />
    <!-- Barre du mode placement (le gestionnaire pose ou déplace un bâtiment) -->
    <PlacementBar v-if="placingId" />
  </div>
  <HoverCard />
  <!-- La fenêtre d'infos (InfoDialog) est dans App.vue : elle sert aussi sur les autres pages -->
</template>

<style scoped>
/* La scène occupe tout l'écran sous la barre de navigation (48 px) ; la barre de filtres s'ouvre par-dessus */
.stage
{
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
