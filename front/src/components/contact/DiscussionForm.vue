<script setup>
import { ref } from 'vue'
import { topics } from '@/data/discussions.js'
import { useBuildings } from '@/composables/useBuildings.js'
import { useDiscussions } from '@/composables/useDiscussions.js'

// Le formulaire d'une nouvelle discussion du prestataire : sujet, bâtiment concerné (facultatif), titre et premier message.
const emit = defineEmits(['created', 'cancel'])

const { myBuildings } = useBuildings()
const { createDiscussion } = useDiscussions()

const form = ref({ topic: '', buildingId: '', subject: '', text: '' })
const error = ref('')

function submit() {
  try {
    const f = form.value
    const id = createDiscussion({ topic: f.topic, subject: f.subject, buildingId: f.buildingId || null, text: f.text })
    emit('created', id)
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <h2>Nouvelle discussion</h2>
    <p class="hint">Un point précis à discuter avec le gestionnaire.</p>

    <div class="row">
      <label>Sujet
        <select v-model="form.topic" required>
          <option value="" disabled>Choisir un sujet…</option>
          <option v-for="(label, key) in topics" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
      <label>Bâtiment concerné
        <select v-model="form.buildingId">
          <option value="">Aucun en particulier</option>
          <option v-for="b in myBuildings" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </label>
    </div>

    <label>Titre
      <input v-model="form.subject" required maxlength="80" placeholder="ex. Prises 32 A pour les cuisines" />
    </label>

    <label>Message
      <textarea v-model="form.text" rows="4" required maxlength="1000" placeholder="Décris ce dont tu as besoin."></textarea>
    </label>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="actions">
      <button type="submit" class="btn btn-primary btn-solid">Envoyer</button>
      <button type="button" class="btn btn-outline-secondary" @click="emit('cancel')">Annuler</button>
    </div>
  </form>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 10px; }
h2 { margin: 0; font-size: 18px; }
.hint { margin: 0; font-size: 13px; color: #666; }
.row { display: flex; gap: 12px; }
label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #444; flex: 1; }
input, select, textarea { padding: 8px; border: 1px solid #bbb; border-radius: 6px; font: inherit; }
textarea { resize: vertical; }
.error { margin: 0; color: #b00020; font-size: 13px; text-align: center; }
.actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
</style>
