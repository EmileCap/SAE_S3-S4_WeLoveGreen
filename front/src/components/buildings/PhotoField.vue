<script setup>
import { ref } from 'vue'
import { readPhoto } from '@/utils/photo.js'

// Champ « photo » des formulaires (un plat, un intervenant invité) : aperçu, « Ajouter / Changer la photo », « Retirer ».
// v-model = la photo (texte data:image/...), vide = pas de photo.
// round : aperçu rond (un visage) ; sinon carré aux coins arrondis (un plat).
defineProps({
  label: { type: String, default: 'Photo' },
  round: { type: Boolean, default: false },
})
const photo = defineModel({ type: String, default: '' })

const input = ref(null)
const error = ref('')
const busy = ref(false)

async function onFile(event) {
  const file = event.target.files?.[0]
  event.target.value = '' // permet de choisir deux fois de suite le même fichier
  if (!file) return
  busy.value = true
  error.value = ''
  try {
    photo.value = await readPhoto(file)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="photo-field">
    <span class="preview" :class="{ round }">
      <img v-if="photo" :src="photo" alt="" />
      <span v-else class="none">Pas de photo</span>
    </span>
    <div class="side">
      <div class="buttons">
        <button type="button" class="btn btn-sm" :disabled="busy" @click="input.click()">
          {{ photo ? 'Changer la photo' : 'Ajouter une photo' }}
        </button>
        <button v-if="photo" type="button" class="btn btn-outline-danger btn-sm" @click="photo = ''">Retirer la photo</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
    <input ref="input" type="file" accept="image/*" hidden :aria-label="label" @change="onFile" />
  </div>
</template>

<style scoped>
.photo-field { display: flex; align-items: center; gap: 12px; }
.preview { display: flex; align-items: center; justify-content: center; flex: none; width: 64px; height: 64px; overflow: hidden; border: 1px dashed #9aa0a6; border-radius: 10px; background: #f1f3f5; }
.preview.round { border-radius: 50%; }
.preview img { width: 100%; height: 100%; object-fit: cover; }
.none { padding: 0 4px; font-size: 10px; line-height: 1.2; text-align: center; color: #6c757d; }
.side { display: flex; flex-direction: column; gap: 4px; }
.buttons { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.error { margin: 0; color: #b00020; font-size: 12px; }
</style>
