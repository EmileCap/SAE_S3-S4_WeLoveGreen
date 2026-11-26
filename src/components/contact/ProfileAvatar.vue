<script setup>
// Photo de profil ronde de la page Contact. Sans photo (pour l'instant : l'API les donnera), une silhouette grise.
defineProps({
  photo: { type: String, default: null },
  size: { type: Number, default: 36 }, // diamètre en pixels
})
</script>

<template>
  <img v-if="photo" class="avatar" :src="photo" alt="" :style="{ '--size': `${size}px` }" />
  <span v-else class="avatar blank" aria-hidden="true" :style="{ '--size': `${size}px` }">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></svg>
  </span>
</template>

<style scoped>
.avatar { width: var(--size); height: var(--size); border-radius: 50%; flex: none; object-fit: cover; }
.blank { display: inline-flex; align-items: flex-end; justify-content: center; overflow: hidden; background: #d5d9df; }
.blank svg { width: 82%; height: 82%; fill: #fff; }
</style>
