import { computed, ref } from 'vue'
import { buildingTypes } from '@/data/buildingTypes.js'
import { isOpenAt } from '@/utils/hours.js'
import { normalize } from '@/utils/text.js'
import { useBuildings } from './useBuildings.js'
import { useTimeOfDay } from './useTimeOfDay.js'

// Les filtres de la barre latérale de la carte. Ils portent sur les bâtiments visibles (autorisés et placés).
//
// - recherche : le nom ou le type contient le texte (sans tenir compte des accents ni des majuscules)
// - types     : aucun type coché = tous
// - ouverts   : seulement les bâtiments ouverts à l'heure choisie sur la carte (10h, 19h ou 22h)
// - régime et allergènes : ils n'apparaissent (et ne comptent) que lorsqu'on s'intéresse aux restaurants
//   (le type Restaurant est coché, ou la recherche en trouve un). Un restaurant passe s'il a AU MOINS UN plat
//   qui respecte tous les critères à la fois : le régime choisi ET aucun des allergènes évités.
//   Les bâtiments sans menu ne sont pas concernés par ces deux critères.

const { visibleBuildings } = useBuildings()
const { hour } = useTimeOfDay()

const search = ref('')
const activeTypes = ref([])
const openAtHour = ref(false)
const diet = ref(null) // null | une clé de diets
const avoided = ref([]) // les clés d'allergènes à éviter

const hasMenu = (b) => !!buildingTypes[b.type]?.hasMenu
const query = computed(() => normalize(search.value.trim()))

const textMatches = (b) => !query.value || normalize(`${b.name} ${buildingTypes[b.type]?.label ?? ''}`).includes(query.value)
const typeMatches = (b) => activeTypes.value.length === 0 || activeTypes.value.includes(b.type)

// Les filtres « régime » et « allergènes » sont-ils proposés ?
const foodFiltersShown = computed(
    () => activeTypes.value.some((type) => buildingTypes[type]?.hasMenu)
        || (query.value !== '' && visibleBuildings.value.some((b) => hasMenu(b) && textMatches(b) && typeMatches(b))),
)
const foodFiltersActive = computed(() => foodFiltersShown.value && (!!diet.value || avoided.value.length > 0))

// Ce plat respecte-t-il le régime choisi et ne contient-il aucun allergène évité ? (un plat vegan est aussi végétarien)
function dishMatches(dish) {
    const dietOk = !diet.value || dish.diet === diet.value || (diet.value === 'vegetarien' && dish.diet === 'vegan')
    return dietOk && !avoided.value.some((a) => dish.allergens.includes(a))
}

// Les plats du bâtiment qui correspondent aux filtres de nourriture (vide si ces filtres ne sont pas actifs)
function matchingDishes(b) {
    if (!foodFiltersActive.value || !hasMenu(b)) return []
    return (b.menu ?? []).filter(dishMatches)
}

function buildingMatches(b) {
    if (!textMatches(b) || !typeMatches(b)) return false
    if (openAtHour.value && !isOpenAt(b.hours, hour.value)) return false
    if (foodFiltersActive.value && hasMenu(b) && matchingDishes(b).length === 0) return false
    return true
}

const filteredBuildings = computed(() => visibleBuildings.value.filter(buildingMatches))
const filtersActive = computed(
    () => query.value !== '' || activeTypes.value.length > 0 || openAtHour.value || foodFiltersActive.value,
)
// Les ids qui passent les filtres : la carte estompe les autres
const matchingIds = computed(() => new Set(filteredBuildings.value.map((b) => b.id)))

function toggleIn(list, value) {
    const i = list.indexOf(value)
    if (i === -1) list.push(value)
    else list.splice(i, 1)
}

const toggleType = (type) => toggleIn(activeTypes.value, type)
const toggleAllergen = (key) => toggleIn(avoided.value, key)
const toggleDiet = (key) => { diet.value = diet.value === key ? null : key } // un second clic retire le régime

function resetFilters() {
    search.value = ''
    activeTypes.value = []
    openAtHour.value = false
    diet.value = null
    avoided.value = []
}

export function useFilters() {
    return {
        search, activeTypes, openAtHour, diet, avoided,
        foodFiltersShown, foodFiltersActive, filtersActive,
        filteredBuildings, matchingIds, matchingDishes,
        toggleType, toggleAllergen, toggleDiet, resetFilters,
    }
}
