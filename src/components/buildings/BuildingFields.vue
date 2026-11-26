<script setup>
import { computed } from 'vue'
import { buildingTypes } from '@/data/buildingTypes.js'
import { extraFields } from '@/data/buildingFields.js'
import { festival } from '@/data/festival.js'
import MenuEditor from './MenuEditor.vue'
import ProgrammeEditor from './ProgrammeEditor.vue'

// Les rubriques à remplir pour un bâtiment : elles changent selon le type
// (restaurant : ce qu'on vend + menu ; scène : ce qu'on programme + style + besoins techniques + programme).
// v-model = le brouillon { description, opens, sells, style, needs, menu, programme } (voir utils/buildingDraft.js).
// remarks = les remarques du gestionnaire, affichées en face de chaque rubrique : { description: '…' }
const props = defineProps({
  type: { type: String, required: true },
  remarks: { type: Object, default: () => ({}) },
})
const draft = defineModel({ required: true })

const typeInfo = computed(() => buildingTypes[props.type])
const opening = festival.opens.replace(':', 'h')
const closing = festival.closes.replace(':', 'h')
</script>

<template>
  <div class="fields">
    <label>Description
      <textarea v-model="draft.description" rows="2" maxlength="200"></textarea>
    </label>
    <p v-if="remarks.description" class="remark">Remarque du gestionnaire : {{ remarks.description }}</p>

    <label>Heure d'ouverture
      <input v-model="draft.opens" type="time" required />
      <span class="hint">Fermeture imposée : {{ closing }} (heure de fermeture du festival, ouvert de {{ opening }} à {{ closing }}).</span>
    </label>
    <p v-if="remarks.hours" class="remark">Remarque du gestionnaire : {{ remarks.hours }}</p>

    <label>{{ typeInfo.proposeLabel }}
      <input v-model="draft.sells" required maxlength="120" :placeholder="typeInfo.proposePlaceholder" />
    </label>
    <p v-if="remarks.sells" class="remark">Remarque du gestionnaire : {{ remarks.sells }}</p>

    <template v-for="key in typeInfo.fields ?? []" :key="key">
      <label>{{ extraFields[key].label }}
        <textarea v-if="extraFields[key].multiline" v-model="draft[key]" rows="2" maxlength="200" :placeholder="extraFields[key].placeholder"></textarea>
        <input v-else v-model="draft[key]" maxlength="120" :placeholder="extraFields[key].placeholder" />
        <span v-if="!extraFields[key].public" class="hint">Visible seulement par l'organisation, pas par le public.</span>
      </label>
      <p v-if="remarks[key]" class="remark">Remarque du gestionnaire : {{ remarks[key] }}</p>
    </template>

    <section v-if="typeInfo.hasMenu" class="list">
      <h3>Menu</h3>
      <p v-if="remarks.menu" class="remark">Remarque du gestionnaire : {{ remarks.menu }}</p>
      <MenuEditor v-model="draft.menu" />
    </section>

    <section v-if="typeInfo.hasProgramme" class="list">
      <h3>Programme</h3>
      <p class="hint">Les créneaux de la scène : tout le monde les voit sur la page de programmation de la scène.</p>
      <p v-if="remarks.programme" class="remark">Remarque du gestionnaire : {{ remarks.programme }}</p>
      <ProgrammeEditor v-model="draft.programme" :guests="!!typeInfo.hasGuests" />
    </section>
  </div>
</template>

<style scoped>
.fields { display: flex; flex-direction: column; gap: 10px; }
label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #444; flex: 1; }
input, textarea { padding: 8px; border: 1px solid #bbb; border-radius: 6px; font: inherit; }
.hint { font-size: 12px; color: #777; }
.remark { margin: -4px 0 0; padding: 6px 10px; border-left: 3px solid #e67e22; background: #fff4e5; font-size: 13px; color: #6b3a00; }
.list { margin-top: 6px; padding-top: 12px; border-top: 1px solid #ddd; }
h3 { margin: 0 0 8px; font-size: 16px; }
.list .hint { margin: 0 0 8px; }
.list .remark { margin: 0 0 10px; }
</style>
