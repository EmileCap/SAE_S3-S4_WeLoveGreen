<script setup>
// Une liste de la page « Programmation » (gestionnaire) dans sa carte blanche, avec une flèche à droite du titre
// qui replie ou déplie la liste : utile quand il y a beaucoup de bâtiments.
// v-model:folded = la liste est repliée (true) ou dépliée (false) ; l'état est gardé par la page (voir useProgrammation).
defineProps({
  title: { type: String, required: true },
  id: { type: String, default: null }, // ancre pour les tuiles du tableau de bord
})
const folded = defineModel('folded', { type: Boolean, default: false })
</script>

<template>
  <section :id="id" class="panel">
    <header class="head" :class="{ folded }">
      <h2>{{ title }}</h2>
      <button
        type="button"
        class="btn btn-sm arrow"
        :aria-expanded="!folded"
        :aria-label="folded ? `Afficher la liste : ${title}` : `Masquer la liste : ${title}`"
        @click="folded = !folded"
      >
        <span aria-hidden="true">▾</span>
      </button>
    </header>
    <div v-if="!folded" class="content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel { scroll-margin-top: 8px; margin-bottom: 20px; padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); }
.head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
.head.folded { margin-bottom: 0; }
h2 { margin: 0; font-size: 16px; }
.arrow { line-height: 1; }
.arrow span { display: inline-block; transition: transform 0.15s; }
.folded .arrow span { transform: rotate(-90deg); }
</style>
