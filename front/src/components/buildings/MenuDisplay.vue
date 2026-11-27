<script setup>
import { computed } from 'vue'
import { allergens, diets, dishCategories } from '@/data/menu.js'

// Menu en lecture seule, regroupé par catégorie. Deux présentations :
// - liste (par défaut) : page d'examen d'une demande, où le titre "Menu" est déjà donné par la page ;
// - cartes (`cards`) : la vue menu de la fenêtre d'infos, plus grande, un plat par carte sur deux colonnes.
const props = defineProps({
  menu: { type: Array, required: true },
  cards: { type: Boolean, default: false },
  hideTitle: { type: Boolean, default: false },
  matchIds: { type: Array, default: () => [] }, // plats qui correspondent aux filtres de la carte : mis en avant
})

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

const groups = computed(() =>
  Object.entries(dishCategories)
    .map(([key, label]) => ({ key, label, dishes: props.menu.filter((d) => d.category === key) }))
    .filter((group) => group.dishes.length > 0),
)

const allergenText = (dish) =>
  dish.allergens.length ? dish.allergens.map((a) => allergens[a]).join(', ') : 'aucun déclaré'
</script>

<template>
  <section class="menu" :class="{ cards }">
    <h3 v-if="!hideTitle">Menu</h3>
    <p v-if="menu.length === 0" class="empty">Le menu n'est pas encore renseigné.</p>

    <div v-for="group in groups" :key="group.key">
      <h4>{{ group.label }}</h4>
      <ul>
        <li v-for="dish in group.dishes" :key="dish.id" :class="{ match: matchIds.includes(dish.id) }">
          <!-- L'emplacement de la photo est toujours là : cadre vide tant que le prestataire n'a rien ajouté -->
          <img v-if="dish.photo" class="photo" :src="dish.photo" :alt="`Photo : ${dish.name}`" />
          <span v-else class="photo empty" aria-hidden="true">Pas de photo</span>
          <p class="head">
            <strong>{{ dish.name }}</strong>
            <span v-if="matchIds.includes(dish.id)" class="tag tag-sm match-badge">Correspond à vos filtres</span>
            <span class="price">{{ euro.format(dish.price) }}</span>
          </p>
          <p v-if="dish.description" class="desc">{{ dish.description }}</p>
          <span v-if="dish.diet" class="tag tag-sm diet">{{ diets[dish.diet] }}</span>
          <p v-if="cards && dish.allergens.length" class="meta">
            Allergènes :
            <span v-for="a in dish.allergens" :key="a" class="tag tag-sm pill">{{ allergens[a] }}</span>
          </p>
          <p v-else class="meta">Allergènes : {{ allergenText(dish) }}</p>
          <p v-if="dish.origin" class="meta">Provenance : {{ dish.origin }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
h3 { margin: 0 0 4px; font-size: 15px; }
h4 { margin: 10px 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #666; }
ul { margin: 0; padding: 0; list-style: none; }
li { margin-bottom: 8px; }
li.match { padding-left: 8px; border-left: 3px solid #198754; }
p { margin: 0; }
.empty { font-size: 13px; color: #666; }
.head { display: flex; justify-content: space-between; gap: 8px; }
.price { margin-left: auto; white-space: nowrap; }
.match-badge { --tag: #198754; align-self: center; }
.desc { font-size: 13px; color: #444; }
.diet { --tag: #198754; margin-top: 2px; }
.meta { font-size: 12px; color: #555; }
.photo { float: right; width: 56px; height: 56px; margin: 0 0 4px 8px; border-radius: 8px; object-fit: cover; }
.photo.empty { display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 2px; border: 1px dashed #adb5bd; background: #f1f3f5; color: #868e96; font-size: 10px; line-height: 1.2; text-align: center; }

/* Présentation en cartes : texte plus gros, une carte par plat, deux colonnes quand il y a la place */
.cards h4
{
  margin: 22px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #222;
}
.cards div:first-of-type h4 { margin-top: 8px; }
.cards ul { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px; }
.cards li
{
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}
.cards li.match { border: 1px solid #198754; border-left-width: 3px; background: #f2faf6; padding-left: 16px; }
.cards .photo { float: none; width: 100%; height: 160px; margin: 0 0 4px; border-radius: 8px; }
.cards .photo.empty { font-size: 13px; }
.cards .head { flex-wrap: wrap; align-items: baseline; font-size: 17px; }
.cards .price { font-weight: 700; }
.cards .desc { font-size: 14px; line-height: 1.4; }
.cards .diet { align-self: flex-start; margin: 0; }
.cards .meta { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; font-size: 13px; }
</style>
