import { computed, ref } from 'vue'
import { buildingTypes } from '@/data/buildingTypes.js'
import { programmeByDay } from '@/data/programme.js'
import { useAuth } from './useAuth.js'
import { useBuildings } from './useBuildings.js'

// Les favoris du client : des créneaux de programme (un cœur sur la page de programmation d'une scène).
// Clé d'un favori = "id du bâtiment/id du créneau". Gardés en mémoire seulement (perdus au rechargement).
const { currentRole } = useAuth()
const { visibleBuildings } = useBuildings()

const favorites = ref([])

// Seul le client a des favoris (le visiteur n'est pas connecté)
const canFavorite = computed(() => currentRole.value === 'client')

const keyOf = (buildingId, slotId) => `${buildingId}/${slotId}`
const isFavorite = (buildingId, slotId) => favorites.value.includes(keyOf(buildingId, slotId))

function toggleFavorite(buildingId, slotId) {
    if (!canFavorite.value) throw new Error('Connectez-vous en client pour ajouter des favoris.')
    const key = keyOf(buildingId, slotId)
    const i = favorites.value.indexOf(key)
    if (i === -1) favorites.value.push(key)
    else favorites.value.splice(i, 1)
}

// Les créneaux favoris des scènes visibles, regroupés par jour (jour puis heure de début) :
// [{ day, label, slots: [{ ...créneau, buildingId, buildingName }] }]
const favoriteDays = computed(() => {
    const slots = []
    for (const b of visibleBuildings.value) {
        if (!buildingTypes[b.type]?.hasProgramme) continue
        for (const slot of b.programme ?? []) {
            if (isFavorite(b.id, slot.id)) slots.push({ ...slot, buildingId: b.id, buildingName: b.name })
        }
    }
    return programmeByDay(slots)
})
const favoriteCount = computed(() => favoriteDays.value.reduce((n, day) => n + day.slots.length, 0))

export function useFavorites() {
    return { canFavorite, isFavorite, toggleFavorite, favoriteDays, favoriteCount }
}
