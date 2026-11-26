<script setup>
import { computed } from 'vue'

// Étiquette du statut d'une demande (page du prestataire et page d'examen du gestionnaire).
// Ce n'est pas un bouton : voir assets/tags.css.
const props = defineProps({
  building: { type: Object, required: true },
})

const labels = { en_attente: 'En attente', a_modifier: 'Modifications demandées', refuse: 'Refusée' }

// "Autorisée" précise si le bâtiment est déjà sur la carte
const label = computed(() =>
  labels[props.building.status] ?? (props.building.position ? 'Autorisée · sur la carte' : 'Autorisée · emplacement à définir'),
)
</script>

<template>
  <span class="tag status" :class="building.status">{{ label }}</span>
</template>

<style scoped>
.en_attente { --tag: #d39e00; }
.a_modifier { --tag: #e8590c; }
.autorise { --tag: #198754; }
.refuse { --tag: #dc3545; }
</style>
