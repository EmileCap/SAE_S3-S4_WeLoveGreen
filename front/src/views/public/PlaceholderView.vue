<script setup>
import { useRoute } from 'vue-router'

// Page vide : seul le titre (défini dans le routeur) s'affiche. Le contenu viendra plus tard.
const route = useRoute()
</script>

<template>
  <main class="page">
    <div class="content">
      <h1>{{ route.meta.title }}</h1>
    </div>
  </main>
</template>

<style scoped>
.page {
  position: fixed;
  inset: 48px 0 0 0;
  overflow-y: auto;
  background: #f4f5f7;
  color: #222;
  font-family: system-ui, sans-serif;
}
.content { max-width: 860px; margin: 0 auto; padding: 28px 24px 40px; }
h1 { margin: 0; font-size: 24px; }
</style>
