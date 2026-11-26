<script setup>
import { onMounted } from 'vue'
import NavBar from '@/components/layout/NavBar.vue'
import InfoDialog from '@/components/map/InfoDialog.vue'
import { useBuildings } from '@/composables/useBuildings.js'

const { loadBuildings } = useBuildings()
onMounted(loadBuildings)
</script>

<template>
  <NavBar />
  <!-- La page courante (carte, programmation, billetterie…) s'affiche ici -->
  <RouterView />
  <!-- La fenêtre d'infos d'un bâtiment, au centre de l'écran (carte ou autre page) -->
  <InfoDialog />
</template>
