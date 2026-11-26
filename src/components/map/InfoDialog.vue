<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { buildingTypes } from '@/data/buildingTypes.js'
import { extraFields } from '@/data/buildingFields.js'
import { useAuth } from '@/composables/useAuth.js'
import { useBuildings } from '@/composables/useBuildings.js'
import { useFilters } from '@/composables/useFilters.js'
import { usePlacement } from '@/composables/usePlacement.js'
import { useSelection } from '@/composables/useSelection.js'
import MenuDisplay from '@/components/buildings/MenuDisplay.vue'

// La fenêtre d'infos d'un bâtiment, au centre de l'écran : elle s'ouvre au clic sur un bâtiment,
// sur un élément de la liste ou sur « Voir les informations ». On la ferme avec ✕, Échap ou un clic à côté.
// Elle est montée une fois pour toute l'application (App.vue) : elle marche sur n'importe quelle page.
const route = useRoute()
const { currentRole, userId } = useAuth()
const { getById, canView } = useBuildings()
const { selectedId, dialogOpen, closeDialog, clear } = useSelection()
const { canMove, startPlacing } = usePlacement()
const { foodFiltersActive, matchingDishes } = useFilters()

// On ne montre jamais un bâtiment que la personne n'a pas le droit de voir (demande d'un autre prestataire)
const building = computed(() => {
  const b = selectedId.value ? getById(selectedId.value) : null
  return b && canView(b) ? b : null
})
const open = computed(() => dialogOpen.value && !!building.value)
const typeInfo = computed(() => buildingTypes[building.value?.type])

// Le menu d'un restaurant a sa propre vue, plus large, dans la même fenêtre : « Voir le menu » l'ouvre,
// « ← Retour » revient aux infos. La fenêtre s'ouvre toujours sur les infos.
const showMenu = ref(false)
watch([selectedId, dialogOpen], () => { showMenu.value = false })

// Quand on change de page (« Voir la programmation »…), la fenêtre se ferme
watch(() => route.fullPath, closeDialog)

// Le contact n'est visible que par le gestionnaire
const contact = computed(() => (currentRole.value === 'gestionnaire' ? building.value?.contact : null))

// Champs propres au type (style, besoins techniques…) : ceux qui ne sont pas publics
// ne sont vus que par le gestionnaire et par le prestataire propriétaire du bâtiment
const canSeePrivate = computed(
  () => currentRole.value === 'gestionnaire' || (!!userId.value && building.value?.ownerId === userId.value),
)
const extraRows = computed(() => {
  const b = building.value
  return (typeInfo.value?.fields ?? [])
    .filter((key) => b[key] && (extraFields[key].public || canSeePrivate.value))
    .map((key) => ({ key, label: extraFields[key].label, value: b[key] }))
})

// Filtres de nourriture actifs sur la carte : on indique les plats qui y correspondent
const matches = computed(() => (building.value ? matchingDishes(building.value) : []))
const matchNote = computed(() => {
  if (!foodFiltersActive.value || !typeInfo.value?.hasMenu) return ''
  if (matches.value.length === 0) return 'Aucun plat ne correspond à vos filtres.'
  return `Plats qui correspondent à vos filtres : ${matches.value.map((d) => d.name).join(', ')}.`
})

// Échap ferme la fenêtre ; à l'ouverture, le focus va dans la fenêtre (lecteurs d'écran, clavier)
const dialogEl = ref(null)
const onKey = (e) => { if (e.key === 'Escape' && open.value) clear() }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
// Le focus revient dans la fenêtre à l'ouverture et à chaque changement de vue (le bouton cliqué disparaît)
watch([open, showMenu], async ([isOpen]) => {
  if (!isOpen) return
  await nextTick()
  dialogEl.value?.focus()
})
</script>

<template>
  <div v-if="open" class="backdrop" @click.self="clear">
    <section
      ref="dialogEl"
      class="dialog"
      :class="{ wide: showMenu }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-title"
      tabindex="-1"
    >
      <!-- Vue « infos » -->
      <template v-if="!showMenu">
        <button class="btn-close close" aria-label="Fermer" @click="clear"></button>

        <h2 id="info-title">{{ building.name }}</h2>
        <p class="kind">
          <span class="dot" :style="{ background: typeInfo?.color }"></span>
          <strong>{{ typeInfo?.label }}</strong>
        </p>
        <p v-if="building.description" class="description">{{ building.description }}</p>
        <ul class="details">
          <li v-if="building.hours">Horaires : {{ building.hours }}</li>
          <li v-if="building.sells">On y trouve : {{ building.sells }}</li>
          <li v-for="row in extraRows" :key="row.key">{{ row.label }} : {{ row.value }}</li>
          <li v-if="contact">Contact : {{ contact.email }} · {{ contact.phone }}</li>
        </ul>

        <p v-if="matchNote" class="match-note">{{ matchNote }}</p>

        <div v-if="typeInfo?.hasMenu || typeInfo?.hasProgramme || canMove(building)" class="actions">
          <button v-if="typeInfo?.hasMenu" class="btn btn-success btn-sm" @click="showMenu = true">Voir le menu</button>
          <RouterLink
            v-if="typeInfo?.hasProgramme"
            class="btn btn-primary btn-sm"
            :to="{ name: 'programme-scene', params: { id: building.id } }"
          >
            Voir la programmation
          </RouterLink>
          <button v-if="canMove(building)" class="btn btn-sm" @click="startPlacing(building.id)">Déplacer</button>
        </div>
      </template>

      <!-- Vue « menu » : plus large, un plat par carte -->
      <template v-else>
        <header class="menu-head">
          <button class="btn btn-sm" @click="showMenu = false">← Retour</button>
          <div class="titles">
            <h2 id="info-title">{{ building.name }} · Menu</h2>
            <p class="sub">{{ typeInfo?.label }}<template v-if="building.hours"> · {{ building.hours }}</template></p>
          </div>
          <button class="btn-close" aria-label="Fermer" @click="clear"></button>
        </header>
        <div class="menu-body">
          <p v-if="matchNote" class="match-note">{{ matchNote }}</p>
          <MenuDisplay cards hide-title :menu="building.menu ?? []" :match-ids="matches.map((d) => d.id)" />
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.backdrop
{
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 23, 32, 0.45);
}

.dialog
{
  position: relative;
  width: min(520px, 100%);
  max-height: min(82vh, 760px);
  overflow-y: auto;
  padding: 22px 24px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  font-family: system-ui, sans-serif;
  color: #222;
  outline: none;
}

h2 { margin: 0 28px 4px 0; font-size: 22px; }
.kind { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; color: #444; font-size: 14px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.description { margin: 0 0 10px; }
.details { margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.6; }
.match-note { margin: 12px 0 0; padding: 6px 10px; border-left: 3px solid #198754; background: #f2faf6; font-size: 13px; color: #146c43; }
.close { position: absolute; top: 14px; right: 14px; }
.actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 14px; }

/* La vue menu : la fenêtre s'élargit ; l'en-tête reste en haut, seuls les plats défilent */
.dialog.wide
{
  display: flex;
  flex-direction: column;
  width: min(900px, 100%);
  max-height: min(88vh, 820px);
  padding: 0;
  overflow: hidden;
}
.menu-head { display: flex; align-items: center; gap: 14px; flex: none; padding: 14px 18px; border-bottom: 1px solid #e5e7eb; }
.titles { flex: 1; min-width: 0; }
.menu-head h2 { margin: 0; font-size: 22px; }
.sub { margin: 2px 0 0; font-size: 13px; color: #6b7280; }
.menu-body { flex: 1; min-height: 0; padding: 8px 24px 24px; overflow-y: auto; }
.menu-body .match-note { margin: 12px 0 4px; }
</style>
