<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { buildingTypes } from '@/data/buildingTypes.js'
import { useAuth } from '@/composables/useAuth.js'
import { useBuildings } from '@/composables/useBuildings.js'
import { useSelection } from '@/composables/useSelection.js'
import ProgrammeDisplay from '@/components/buildings/ProgrammeDisplay.vue'
import StatusBadge from '@/components/buildings/StatusBadge.vue'

// Page de programmation d'une scène : ses infos et ses créneaux, ouverte depuis la fenêtre d'infos de la carte.
// Tout le monde peut la voir une fois la scène autorisée ; avant, seuls le gestionnaire et le prestataire propriétaire.
const props = defineProps({
  id: { type: String, required: true }, // vient de l'adresse /programmation/:id
})

const router = useRouter()
const { currentRole, userId } = useAuth()
const { getById, loading, canView } = useBuildings()
const { highlight } = useSelection()

const isOwner = (b) => !!userId.value && b.ownerId === userId.value

const scene = computed(() => {
  const b = getById(props.id)
  if (!b || !buildingTypes[b.type]?.hasProgramme) return null
  // canView : autorisée et sur la carte pour tout le monde ; sinon seulement le gestionnaire et le prestataire propriétaire (sauf demande refusée)
  const canSee = canView(b) && (b.status !== 'refuse' || currentRole.value === 'gestionnaire')
  return canSee ? b : null
})

// Le prestataire propriétaire peut aller modifier son programme
const canEdit = computed(() => !!scene.value && isOwner(scene.value) && scene.value.status !== 'refuse')
const onMap = computed(() => !!scene.value && scene.value.status === 'autorise' && scene.value.position !== null)

function showOnMap() {
  highlight(scene.value.id)
  router.push({ name: 'carte' })
}
</script>

<template>
  <main class="page">
    <div class="content">
      <RouterLink :to="{ name: 'carte' }" class="btn btn-sm back">← Carte</RouterLink>

      <p v-if="loading" class="notice">Chargement…</p>
      <p v-else-if="!scene" class="notice">Cette scène n'existe pas ou son programme n'est pas encore public.</p>

      <template v-else>
        <h1>{{ scene.name }} <StatusBadge v-if="scene.status !== 'autorise'" :building="scene" /></h1>
        <p class="subtitle">{{ buildingTypes[scene.type]?.label }}<template v-if="scene.hours"> · {{ scene.hours }}</template></p>

        <div class="actions">
          <button v-if="onMap" class="btn btn-outline-primary btn-sm" @click="showOnMap">Voir sur la carte</button>
          <RouterLink
            v-if="canEdit"
            class="btn btn-outline-secondary btn-sm"
            :to="{ name: 'modifier-batiment', params: { id: scene.id } }"
          >
            Modifier le programme
          </RouterLink>
        </div>

        <section class="panel">
          <p v-if="scene.description" class="description">{{ scene.description }}</p>
          <p v-if="scene.style" class="style"><strong>Style / genre :</strong> {{ scene.style }}</p>
        </section>

        <section class="panel">
          <h2>Programme</h2>
          <ProgrammeDisplay :programme="scene.programme ?? []" :building-id="scene.id" />
        </section>
      </template>
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
.back { margin-bottom: 12px; }
h1 { display: flex; align-items: center; gap: 12px; margin: 0 0 4px; font-size: 24px; }
h2 { margin: 0 0 8px; font-size: 16px; }
.subtitle { margin: 0 0 16px; font-size: 13px; color: #666; }
.notice { padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); }
.actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 16px; }
.panel { margin-bottom: 20px; padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); }
.panel p { margin: 0 0 6px; }
.panel p:last-child { margin-bottom: 0; }
</style>
