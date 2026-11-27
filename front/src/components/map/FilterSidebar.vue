<script setup>
import { ref } from 'vue'
import { buildingTypes } from '@/data/buildingTypes.js'
import { allergens, diets } from '@/data/menu.js'
import { useBuildings } from '@/composables/useBuildings.js'
import { useFilters } from '@/composables/useFilters.js'
import { useSelection } from '@/composables/useSelection.js'
import { useTimeOfDay } from '@/composables/useTimeOfDay.js'

// Les filtres de la carte : un bouton burger (☰ Filtres) ouvre une barre latérale sur toute la hauteur à gauche,
// par-dessus la carte : recherche, filtres et liste des bâtiments. Elle est fermée au chargement de la carte.
const open = ref(false)
const { visibleBuildings, loading, error } = useBuildings()
const {
  search, activeTypes, openAtHour, diet, avoided,
  foodFiltersShown, filtersActive, filteredBuildings,
  toggleType, toggleDiet, toggleAllergen, resetFilters,
} = useFilters()
const { selectedId, select } = useSelection()
const { hour } = useTimeOfDay()
</script>

<template>
  <button v-if="!open" class="btn btn-outline-dark btn-sm burger" aria-controls="filter-panel" @click="open = true">
    <span aria-hidden="true">☰</span> Filtres
    <span v-if="filtersActive" class="count-badge">{{ filteredBuildings.length }}/{{ visibleBuildings.length }}</span>
  </button>

  <Transition name="slide">
    <aside v-if="open" id="filter-panel" class="sidebar" aria-label="Filtres et liste des bâtiments">
      <header class="head">
        <h2>Filtres</h2>
        <button class="btn-close" aria-label="Fermer les filtres" @click="open = false"></button>
      </header>

      <div class="body">
        <input v-model="search" type="search" placeholder="Rechercher (nom, type…)" aria-label="Rechercher" />

        <h3>Type</h3>
        <div class="chips">
          <button
              v-for="(type, key) in buildingTypes"
              :key="key"
              class="btn btn-outline-dark btn-sm rounded-pill chip"
              :class="{ active: activeTypes.includes(key) }"
              :aria-pressed="activeTypes.includes(key)"
              @click="toggleType(key)"
          >
            <span class="dot" :style="{ background: type.color }"></span>{{ type.label }}
          </button>
        </div>

        <label class="check">
          <input v-model="openAtHour" type="checkbox" />
          Ouverts à {{ hour }}h
          <span class="hint">l'heure choisie en bas de la carte</span>
        </label>

        <section v-if="foodFiltersShown" class="food" aria-label="Filtres de restauration">
          <h3>Régime</h3>
          <div class="chips">
            <button
                v-for="(label, key) in diets"
                :key="key"
                class="btn btn-outline-success btn-sm rounded-pill"
                :class="{ active: diet === key }"
                :aria-pressed="diet === key"
                @click="toggleDiet(key)"
            >
              {{ label }}
            </button>
          </div>

          <h3>Sans allergène</h3>
          <div class="chips">
            <button
                v-for="(label, key) in allergens"
                :key="key"
                class="btn btn-outline-success btn-sm rounded-pill allergen"
                :class="{ active: avoided.includes(key) }"
                :aria-pressed="avoided.includes(key)"
                @click="toggleAllergen(key)"
            >
              {{ label }}
            </button>
          </div>
          <p class="hint">Restaurants qui ont au moins un plat sans les allergènes choisis.</p>
        </section>

        <p class="count">
          {{ filteredBuildings.length }} / {{ visibleBuildings.length }} bâtiments
          <button v-if="filtersActive" class="btn btn-sm" @click="resetFilters">Réinitialiser</button>
        </p>

        <p v-if="loading" class="status">Chargement…</p>
        <p v-else-if="error" class="status">Erreur : {{ error }}</p>
        <p v-else-if="filteredBuildings.length === 0" class="status">Aucun bâtiment ne correspond.</p>

        <ul>
          <li v-for="b in filteredBuildings" :key="b.id">
            <button class="item" :class="{ selected: b.id === selectedId }" @click="select(b.id)">
              <span class="dot" :style="{ background: buildingTypes[b.type]?.color }"></span>
              <span class="name">{{ b.name }}</span>
              <span class="type">{{ buildingTypes[b.type]?.label }}</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.burger
{
  position: fixed;
  top: 60px; /* sous la barre de navigation, dans le coin de la carte */
  left: 12px;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: system-ui, sans-serif;
}
.count-badge { padding: 0 7px; border-radius: 10px; background: #495057; color: #fff; font-size: 11px; font-weight: 600; }

.sidebar
{
  position: fixed;
  top: 48px; /* sous la barre de navigation */
  left: 0;
  bottom: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  width: 300px;
  max-width: 100%;
  box-sizing: border-box;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.15);
  color: #222;
  font-family: system-ui, sans-serif;
}
.head { display: flex; align-items: center; justify-content: space-between; flex: none; padding: 10px 14px; border-bottom: 1px solid #e5e7eb; }
.head h2 { margin: 0; font-size: 16px; }
.body { flex: 1; min-height: 0; padding: 14px; overflow-y: auto; }

.slide-enter-active, .slide-leave-active { transition: transform 0.18s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
input[type='search'] { width: 100%; padding: 7px 9px; box-sizing: border-box; border: 1px solid #d5d9de; border-radius: 6px; font: inherit; font-size: 14px; }
h3 { margin: 14px 0 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280; }
.chips { display: flex; flex-wrap: wrap; gap: 5px; }
.chip { display: flex; align-items: center; gap: 4px; }
.allergen { font-size: 0.75rem; padding: 0.1rem 0.45rem; }
.dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; flex: none; }
.check { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 14px; font-size: 14px; }
.hint { font-size: 12px; color: #6b7280; }
.food .hint { margin: 8px 0 0; }
.count { display: flex; align-items: center; gap: 8px; margin: 16px 0 6px; font-size: 13px; color: #6b7280; }
.status { margin: 0 0 8px; font-size: 13px; }
ul { margin: 0; padding: 0; list-style: none; }
.item
{
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 7px 8px; margin-bottom: 4px; border: 1px solid #c9ced4;
  border-radius: 8px; background: #fff; text-align: left; cursor: pointer; font: inherit; font-size: 14px; color: inherit;
}
.item:hover { background: #f3f4f6; }
.item.selected { border-color: #495057; background: #f3f4f6; }
.name { flex: 1; font-weight: 600; }
.type { font-size: 12px; color: #6b7280; }
</style>
