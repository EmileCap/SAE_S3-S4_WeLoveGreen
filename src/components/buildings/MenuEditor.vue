<script setup>
import { allergens, diets, dishCategories, newDish } from '@/data/menu.js'
import PhotoField from './PhotoField.vue'

// Éditeur de la liste de plats : v-model = le tableau de plats (modifié dans le formulaire du parent)
const dishes = defineModel({ required: true })

const addDish = () => { dishes.value = [...dishes.value, newDish()] }
const removeDish = (id) => { dishes.value = dishes.value.filter((d) => d.id !== id) }
</script>

<template>
  <div>
    <p v-if="dishes.length === 0" class="empty">Aucun plat pour l'instant.</p>

    <ul class="dishes">
      <li v-for="dish in dishes" :key="dish.id" class="dish">
        <div class="row">
          <label class="grow">Nom du plat
            <input v-model="dish.name" required maxlength="60" />
          </label>
          <label>Catégorie
            <select v-model="dish.category">
              <option v-for="(label, key) in dishCategories" :key="key" :value="key">{{ label }}</option>
            </select>
          </label>
          <label class="price">Prix (€)
            <input v-model.number="dish.price" type="number" min="0" step="0.1" required />
          </label>
        </div>

        <label>Courte description
          <input v-model="dish.description" maxlength="100" placeholder="ex. Riz complet, légumes rôtis" />
        </label>

        <div class="photo">
          <span class="photo-title">Photo du plat (facultative)</span>
          <PhotoField v-model="dish.photo" label="Photo du plat" />
        </div>

        <div class="row">
          <label>Régime
            <select v-model="dish.diet">
              <option :value="null">Aucun</option>
              <option v-for="(label, key) in diets" :key="key" :value="key">{{ label }}</option>
            </select>
          </label>
          <label class="grow">Provenance des produits
            <input v-model="dish.origin" maxlength="80" placeholder="ex. Bœuf de Franche-Comté" />
          </label>
        </div>

        <fieldset>
          <legend>Allergènes présents dans ce plat</legend>
          <label v-for="(label, key) in allergens" :key="key" class="check">
            <input v-model="dish.allergens" type="checkbox" :value="key" /> {{ label }}
          </label>
        </fieldset>

        <button type="button" class="btn btn-outline-danger btn-sm remove" @click="removeDish(dish.id)">Supprimer ce plat</button>
      </li>
    </ul>

    <button type="button" class="btn btn-outline-primary btn-sm add" @click="addDish">+ Ajouter un plat</button>
  </div>
</template>

<style scoped>
.empty { margin: 0 0 10px; color: #666; font-size: 13px; }
.dishes { margin: 0 0 12px; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
.dish { display: flex; flex-direction: column; gap: 10px; padding: 12px; border: 1px solid #ddd; border-radius: 10px; background: #fafafa; }
.row { display: flex; gap: 12px; }
label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #444; }
.grow { flex: 1; }
.price { width: 110px; }
input, select { padding: 8px; border: 1px solid #bbb; border-radius: 6px; font: inherit; }
fieldset { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; }
legend { padding: 0 4px; font-size: 13px; color: #444; }
.check { flex-direction: row; align-items: center; gap: 6px; }
.check input { padding: 0; }
.photo { display: flex; flex-direction: column; gap: 4px; }
.photo-title { font-size: 13px; color: #444; }
.remove { align-self: center; }
.add { display: block; margin: 0 auto; }
</style>
