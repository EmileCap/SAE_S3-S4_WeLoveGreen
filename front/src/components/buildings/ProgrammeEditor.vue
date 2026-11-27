<script setup>
import { newGuest, newSlot } from '@/data/programme.js'
import PhotoField from './PhotoField.vue'

// Éditeur du programme d'une scène : v-model = le tableau de créneaux (modifié dans le formulaire du parent)
// guests : true = chaque créneau a aussi une liste d'intervenants invités (scène Think Talk)
defineProps({ guests: { type: Boolean, default: false } })
const slots = defineModel({ required: true })

const addSlot = () => { slots.value = [...slots.value, newSlot()] }
const removeSlot = (id) => { slots.value = slots.value.filter((s) => s.id !== id) }
const addGuest = (slot) => { slot.guests = [...(slot.guests ?? []), newGuest()] }
const removeGuest = (slot, id) => { slot.guests = slot.guests.filter((g) => g.id !== id) }
</script>

<template>
  <div>
    <p v-if="slots.length === 0" class="empty">Aucun créneau pour l'instant.</p>

    <ul class="slots">
      <li v-for="slot in slots" :key="slot.id" class="slot">
        <label>Titre / artiste
          <input v-model="slot.title" required maxlength="80" />
        </label>

        <div class="row">
          <label class="grow">Jour
            <input v-model="slot.day" type="date" required />
          </label>
          <label>Début
            <input v-model="slot.start" type="time" required />
          </label>
          <label>Fin
            <input v-model="slot.end" type="time" required />
          </label>
        </div>

        <label>Courte description
          <input v-model="slot.description" maxlength="120" placeholder="ex. Concert de clôture, rock et électro" />
        </label>

        <div v-if="guests" class="guests">
          <p class="guests-title">Intervenants invités</p>
          <p v-if="!slot.guests?.length" class="empty">Aucun intervenant invité pour ce créneau.</p>
          <div v-for="guest in slot.guests" :key="guest.id" class="guest">
            <PhotoField v-model="guest.photo" label="Photo de l'intervenant" round />
            <label class="grow">Nom
              <input v-model="guest.name" maxlength="60" placeholder="ex. Claire Mercier" />
            </label>
            <label class="grow">Fonction ou organisation
              <input v-model="guest.role" maxlength="80" placeholder="ex. Hydrologue, CNRS" />
            </label>
            <button type="button" class="btn btn-outline-danger btn-sm" aria-label="Retirer cet intervenant" @click="removeGuest(slot, guest.id)">✕</button>
          </div>
          <button type="button" class="btn btn-outline-secondary btn-sm add-guest" @click="addGuest(slot)">+ Ajouter un intervenant</button>
        </div>

        <button type="button" class="btn btn-outline-danger btn-sm remove" @click="removeSlot(slot.id)">Supprimer ce créneau</button>
      </li>
    </ul>

    <button type="button" class="btn btn-outline-primary btn-sm add" @click="addSlot">+ Ajouter un créneau</button>
  </div>
</template>

<style scoped>
.empty { margin: 0 0 10px; color: #666; font-size: 13px; }
.slots { margin: 0 0 12px; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
.slot { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid #ddd; border-radius: 10px; background: #fafafa; }
.row { display: flex; gap: 12px; }
label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #444; }
.grow { flex: 1; }
input { padding: 8px; border: 1px solid #bbb; border-radius: 6px; font: inherit; }
.remove { align-self: center; }
.add { display: block; margin: 0 auto; }
.guests { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; border-top: 1px dashed #ccc; }
.guests-title { margin: 0; font-size: 13px; font-weight: 600; color: #444; }
.guest { display: flex; align-items: flex-end; gap: 10px; }
.guest label { min-width: 0; }
@media (max-width: 700px) { .guest { flex-wrap: wrap; } }
.add-guest { align-self: center; }
</style>
