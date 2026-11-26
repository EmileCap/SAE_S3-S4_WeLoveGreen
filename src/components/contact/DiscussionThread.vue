<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { discussionStatuses, topics } from '@/data/discussions.js'
import { prestataireName, prestatairePhoto } from '@/data/prestataires.js'
import { statusOf, useDiscussions } from '@/composables/useDiscussions.js'
import { useAuth } from '@/composables/useAuth.js'
import { useBuildings } from '@/composables/useBuildings.js'
import ProfileAvatar from '@/components/contact/ProfileAvatar.vue'

// Une discussion : l'en-tête (sujet, bâtiment, état), les messages, puis la zone pour répondre.
// Ouvrir la discussion marque ses messages comme lus.
const props = defineProps({
  discussion: { type: Object, required: true },
})

const { currentRole } = useAuth()
const { getById } = useBuildings()
const { sendMessage, closeDiscussion, reopenDiscussion, markRead } = useDiscussions()

const text = ref('')
const error = ref('')
const messagesEl = ref(null)

const building = computed(() => (props.discussion.buildingId ? getById(props.discussion.buildingId) : null))
const status = computed(() => statusOf(props.discussion))
const isGestionnaire = computed(() => currentRole.value === 'gestionnaire')

// Qui parle : « Vous » pour mes messages, sinon le gestionnaire (vu par le prestataire) ou le prestataire (vu par le gestionnaire)
function author(message) {
  if (message.from === currentRole.value) return 'Vous'
  return message.from === 'gestionnaire' ? 'Gestionnaire' : prestataireName(props.discussion.ownerId)
}

// La photo de celui qui parle (le gestionnaire n'a pas encore de photo : l'API la donnera)
const photoOf = (message) => (message.from === 'gestionnaire' ? null : prestatairePhoto(props.discussion.ownerId))

const formatAt = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// À l'ouverture et à chaque nouveau message : tout est lu, et la liste défile jusqu'au dernier message
watch(
  () => [props.discussion.id, props.discussion.messages.length],
  async () => {
    markRead(props.discussion.id)
    text.value = ''
    error.value = ''
    await nextTick()
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  },
  { immediate: true },
)

function send() {
  try {
    sendMessage(props.discussion.id, text.value)
    text.value = ''
    error.value = ''
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <section class="thread">
    <header class="head">
      <div class="titles">
        <h2>{{ discussion.subject }}</h2>
        <p class="sub">
          {{ topics[discussion.topic] }}
          <template v-if="building"> · {{ building.name }}</template>
          <template v-if="isGestionnaire"> · {{ prestataireName(discussion.ownerId) }}</template>
        </p>
      </div>
      <span class="tag status" :class="status">{{ discussionStatuses[status] }}</span>
    </header>

    <div v-if="building" class="links">
      <RouterLink
        v-if="isGestionnaire && !building.organisation"
        class="btn btn-sm"
        :to="{ name: 'examiner-demande', params: { id: building.id } }"
      >
        Voir la demande de programmation
      </RouterLink>
      <RouterLink
        v-else-if="!isGestionnaire && building.status !== 'refuse'"
        class="btn btn-sm"
        :to="{ name: 'modifier-batiment', params: { id: building.id } }"
      >
        Voir mon bâtiment
      </RouterLink>
    </div>

    <ul ref="messagesEl" class="messages" aria-live="polite">
      <li v-for="m in discussion.messages" :key="m.id" class="message" :class="{ mine: m.from === currentRole }">
        <ProfileAvatar :photo="photoOf(m)" :size="32" />
        <div class="bubble">
          <p class="meta"><strong>{{ author(m) }}</strong> · {{ formatAt(m.at) }}</p>
          <p class="body">{{ m.text }}</p>
        </div>
      </li>
    </ul>

    <form v-if="!discussion.closed" class="reply" @submit.prevent="send">
      <textarea v-model="text" rows="3" maxlength="1000" placeholder="Écrire un message…" aria-label="Votre message" @keydown.ctrl.enter.prevent="send"></textarea>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="actions">
        <button type="submit" class="btn btn-primary btn-solid">Envoyer</button>
        <button type="button" class="btn btn-outline-secondary" @click="closeDiscussion(discussion.id)">Clôturer la discussion</button>
      </div>
    </form>
    <div v-else class="closed">
      <p>Cette discussion est clôturée.</p>
      <div class="actions">
        <button type="button" class="btn btn-outline-secondary" @click="reopenDiscussion(discussion.id)">Rouvrir la discussion</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.thread { display: flex; flex-direction: column; min-height: 0; max-height: 100%; }
.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
h2 { margin: 0; font-size: 18px; }
.sub { margin: 2px 0 0; font-size: 13px; color: #666; }
.links { display: flex; justify-content: center; }
.status.ouverte { --tag: #d39e00; }
.status.repondue { --tag: #198754; }
.status.cloturee { --tag: #6c757d; }

.messages { flex: 1; min-height: 120px; max-height: 46vh; margin: 0; padding: 12px 0; overflow-y: auto; list-style: none; display: flex; flex-direction: column; gap: 10px; }
.message { display: flex; align-items: flex-end; gap: 8px; max-width: 85%; align-self: flex-start; }
.message.mine { align-self: flex-end; flex-direction: row-reverse; }
.bubble { min-width: 0; padding: 8px 12px; border-radius: 12px; background: #f1f3f5; }
.message.mine .bubble { background: #e8f1fb; }
.bubble p { margin: 0; }
.meta { font-size: 12px; color: #666; }
.body { margin-top: 2px; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14px; }

.reply { display: flex; flex-direction: column; gap: 8px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
textarea { padding: 8px; border: 1px solid #bbb; border-radius: 6px; font: inherit; resize: vertical; }
.error { margin: 0; color: #b00020; font-size: 13px; text-align: center; }
.actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.closed { padding-top: 10px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 13px; }
.closed p { margin: 0 0 8px; }
</style>
