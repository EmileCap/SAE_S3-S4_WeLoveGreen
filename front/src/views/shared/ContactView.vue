<script setup>
import { computed, ref } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { useDiscussions } from '@/composables/useDiscussions.js'
import DiscussionForm from '@/components/contact/DiscussionForm.vue'
import DiscussionList from '@/components/contact/DiscussionList.vue'
import DiscussionThread from '@/components/contact/DiscussionThread.vue'

// Page « Contact » : les discussions entre prestataires et gestionnaire sur des points précis
// (électricité, emplacement, matériel…). Le prestataire voit les siennes et peut en ouvrir ;
// le gestionnaire voit celles de tous les prestataires et leur répond.
const { currentRole } = useAuth()
const { discussions, getDiscussion } = useDiscussions()

const selectedId = ref(null)
const creating = ref(false)

const isPrestataire = computed(() => currentRole.value === 'prestataire')
const selected = computed(() => (selectedId.value ? getDiscussion(selectedId.value) : null))

function select(id) {
  selectedId.value = id
  creating.value = false
}

function startNew() {
  creating.value = true
  selectedId.value = null
}

// Une fois créée, la discussion s'ouvre dans la liste
function created(id) {
  select(id)
}
</script>

<template>
  <main class="page">
    <div class="content">
      <h1>Contact</h1>
      <p class="intro">
        <template v-if="isPrestataire">Une question au gestionnaire : électricité, emplacement, matériel, horaires… Pour un bâtiment ou son menu : « Ma programmation ».</template>
        <template v-else>Les discussions ouvertes par les prestataires sur des points précis.</template>
      </p>

      <!-- Nouvelle discussion : le formulaire prend toute la largeur, aligné sur le titre -->
      <section v-if="creating" class="detail">
        <DiscussionForm @created="created" @cancel="creating = false" />
      </section>

      <div v-else class="layout">
        <section class="side">
          <div v-if="isPrestataire" class="new">
            <button class="btn btn-primary btn-solid" @click="startNew">+ Nouvelle discussion</button>
          </div>
          <DiscussionList :discussions="discussions" :selected-id="selectedId" @select="select" />
        </section>

        <!-- Rien à droite tant qu'on n'ouvre pas une discussion -->
        <section v-if="selected" class="detail">
          <DiscussionThread :discussion="selected" />
        </section>
      </div>
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
.content { max-width: 1000px; margin: 0 auto; padding: 28px 24px 40px; }
h1 { margin: 0 0 6px; font-size: 24px; }
.intro { margin: 0 0 18px; font-size: 14px; color: #555; }
.layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start; }
.side { display: flex; flex-direction: column; gap: 12px; }
.new { display: flex; } /* le bouton commence au bord gauche, comme le titre « Contact » et la liste */
.detail { padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); min-height: 240px; }

@media (max-width: 760px) { .layout { grid-template-columns: 1fr; } }
</style>
